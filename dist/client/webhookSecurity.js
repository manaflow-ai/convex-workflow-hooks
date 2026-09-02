import { validate } from "convex-helpers/validators";
/**
 * Webhook bodies are persisted in the workflow journal. Keep the default below
 * the Convex value/transaction limit so a request cannot consume the whole
 * mutation budget before validation runs.
 */
export const DEFAULT_MAX_WEBHOOK_BODY_BYTES = 256 * 1024;
export const MAX_WEBHOOK_BODY_BYTES = 1024 * 1024;
/**
 * Tokens are bearer credentials embedded in URLs. They must be URL-safe and
 * have enough room for a cryptographically random value. A caller may use a
 * stable token, but it must still meet this minimum and cannot contain path or
 * control delimiters.
 */
export const MIN_WEBHOOK_TOKEN_LENGTH = 32;
export const MAX_WEBHOOK_TOKEN_LENGTH = 256;
/** Maximum length accepted only while reading pre-hardening records. */
export const MAX_LEGACY_WEBHOOK_TOKEN_LENGTH = 4096;
export const MAX_WEBHOOK_USES = 1_000_000;
const WEBHOOK_TOKEN_PATTERN = /^[A-Za-z0-9._~-]+$/u;
// RFC 3986 path-segment characters. This wider set is used only when reading
// legacy records. New credentials still go through assertValidWebhookToken.
const LEGACY_WEBHOOK_PATH_PATTERN = /^[A-Za-z0-9._~!$&'()*+,;=:@-]+$/u;
const JSON_MEDIA_TYPE_PATTERN = /^(?:application\/json|[^;]+\+json)$/u;
export class WebhookRequestError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.name = "WebhookRequestError";
        this.status = status;
    }
}
/**
 * Generate a bearer token with 256 bits from the Web Crypto API. There is no
 * pseudo-random fallback: using Math.random here would make URL credentials
 * guessable in a compromised or unusual runtime.
 */
export function generateWebhookToken() {
    const cryptoObject = globalThis.crypto;
    if (!cryptoObject?.getRandomValues) {
        throw new Error("Secure randomness is unavailable; provide a cryptographically random webhook token");
    }
    const bytes = new Uint8Array(32);
    cryptoObject.getRandomValues(bytes);
    const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `wh_${value}`;
}
/**
 * Hash a bearer token before it is persisted. SHA-256 is sufficient here:
 * generated tokens have 256 bits, and custom tokens are length/charset
 * checked before this function is called. Never fall back to a plaintext
 * digest or a non-cryptographic hash when Web Crypto is unavailable.
 */
export async function hashWebhookToken(token) {
    const cryptoObject = globalThis.crypto;
    if (!cryptoObject?.subtle?.digest) {
        throw new Error("Secure hashing is unavailable");
    }
    const digest = await cryptoObject.subtle.digest("SHA-256", new TextEncoder().encode(token));
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
/**
 * Hook tokens are identifiers inside a deterministic workflow execution, not
 * standalone URL credentials. Derive them from the workflow's already-random
 * Convex ID instead of calling Math.random, which is deliberately patched to a
 * replayable PRNG while workflows run.
 */
export function deriveHookToken(workflowId, eventName, sequence) {
    const encodedName = Array.from(new TextEncoder().encode(eventName), (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `hook_${workflowId}_${sequence.toString(36)}_${encodedName.slice(0, 128)}`;
}
/**
 * Validate a caller-provided token without including the secret in errors.
 */
export function assertValidWebhookToken(token) {
    if (typeof token !== "string") {
        throw new Error("Webhook token must be a string");
    }
    if (token.length < MIN_WEBHOOK_TOKEN_LENGTH ||
        token.length > MAX_WEBHOOK_TOKEN_LENGTH) {
        throw new Error(`Webhook token must be between ${MIN_WEBHOOK_TOKEN_LENGTH} and ${MAX_WEBHOOK_TOKEN_LENGTH} URL-safe characters`);
    }
    if (token.trim() !== token || !WEBHOOK_TOKEN_PATTERN.test(token)) {
        throw new Error("Webhook token contains unsafe URL characters");
    }
    // Reject obvious placeholders and low-diversity values. This is not an
    // entropy proof, but it prevents accidental use of examples such as
    // "aaaaaaaa..." or "1234..." as bearer credentials.
    const distinctCharacters = new Set(token).size;
    if (distinctCharacters < 8 || /^(.)\1+$/u.test(token)) {
        throw new Error("Webhook token does not contain enough character diversity");
    }
}
/**
 * Check the syntax needed to extract a token from a URL path. Older releases
 * accepted shorter tokens and characters such as `:`. Keep those records
 * reachable so the lazy plaintext-to-digest migration can complete, while
 * requiring all newly created credentials to pass the stronger check above.
 */
export function isWebhookTokenPathSegment(token) {
    return (token.length > 0 &&
        token.length <= MAX_LEGACY_WEBHOOK_TOKEN_LENGTH &&
        LEGACY_WEBHOOK_PATH_PATTERN.test(token));
}
/**
 * Keep route limits bounded even when a caller supplies configuration from an
 * environment variable or another untrusted source.
 */
export function normalizeMaxBodyBytes(value) {
    const maxBytes = value ?? DEFAULT_MAX_WEBHOOK_BODY_BYTES;
    if (!Number.isSafeInteger(maxBytes) ||
        maxBytes <= 0 ||
        maxBytes > MAX_WEBHOOK_BODY_BYTES) {
        throw new Error(`maxBodyBytes must be a positive integer no larger than ${MAX_WEBHOOK_BODY_BYTES}`);
    }
    return maxBytes;
}
/**
 * Read and decode a webhook request exactly once. The byte limit is enforced
 * both from Content-Length and after reading the body, because clients may use
 * chunked transfer encoding or provide a false length.
 */
export async function readWebhookBody(request, maxBodyBytes = DEFAULT_MAX_WEBHOOK_BODY_BYTES) {
    const limit = normalizeMaxBodyBytes(maxBodyBytes);
    validateContentLength(request.headers.get("content-length"), limit);
    const bytes = await readBodyBytes(request, limit);
    const text = decodeWebhookBody(bytes);
    return parseWebhookText(text, request.headers.get("content-type"));
}
function validateContentLength(contentLength, limit) {
    if (contentLength === null)
        return;
    if (!/^\d+$/u.test(contentLength)) {
        throw new WebhookRequestError("Invalid Content-Length", 400);
    }
    const declaredLength = Number(contentLength);
    if (!Number.isSafeInteger(declaredLength) || declaredLength > limit) {
        throw new WebhookRequestError("Webhook body is too large", 413);
    }
}
function decodeWebhookBody(bytes) {
    try {
        return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    }
    catch {
        throw new WebhookRequestError("Webhook body is not valid UTF-8", 400);
    }
}
function parseWebhookText(text, contentType) {
    const mediaType = parseMediaType(contentType);
    if (mediaType === "application/x-www-form-urlencoded") {
        return parseFormBody(text);
    }
    if (mediaType === "text/plain") {
        return text;
    }
    if (mediaType === "application/octet-stream") {
        throw new WebhookRequestError("Unsupported webhook content type", 415);
    }
    if (mediaType !== "" && !JSON_MEDIA_TYPE_PATTERN.test(mediaType)) {
        throw new WebhookRequestError("Unsupported webhook content type", 415);
    }
    if (text.trim() === "") {
        throw new WebhookRequestError("Webhook body is required", 400);
    }
    try {
        return JSON.parse(text);
    }
    catch {
        throw new WebhookRequestError("Invalid JSON webhook body", 400);
    }
}
/**
 * Validate a decoded body against the binding selected for its webhook. Convex
 * validators run with unknown object fields rejected. Standard Schema
 * validators may transform the value, and their transformed result is passed
 * to the workflow.
 */
export async function validateWebhookPayload(value, validator) {
    if (isConvexValidator(validator)) {
        assertWebhookValidator(validator);
        validate(validator, value, {
            allowUnknownFields: false,
            throw: true,
        });
        return value;
    }
    const result = await validator["~standard"].validate(value);
    if ("issues" in result && result.issues?.length) {
        const firstIssue = result.issues[0];
        throw new Error(firstIssue?.message || "Invalid webhook payload");
    }
    if (!("value" in result)) {
        throw new Error("Invalid webhook payload");
    }
    return result.value;
}
/** Validate a route binding at module-registration time. */
export function assertWebhookValidator(validator) {
    if (isConvexValidator(validator)) {
        if (typeof validator.kind !== "string") {
            throw new Error("Webhook validator is malformed");
        }
        if (containsAnyValidator(validator)) {
            throw new Error("Webhook validators cannot contain v.any()");
        }
        return;
    }
    if (!validator ||
        typeof validator !== "object" ||
        !("~standard" in validator) ||
        typeof validator["~standard"]?.validate !== "function") {
        throw new Error("Webhook validator must be a Convex or Standard Schema validator");
    }
}
function isConvexValidator(value) {
    return Boolean(value &&
        typeof value === "object" &&
        "isConvexValidator" in value &&
        value.isConvexValidator === true);
}
/**
 * `v.any()` is unsafe at every level, including inside an object, array,
 * record, union, or optional validator. Walk the validator tree instead of
 * checking only its root kind.
 */
function containsAnyValidator(value) {
    const visited = new WeakSet();
    const pending = [value];
    while (pending.length > 0) {
        const candidate = pending.pop();
        if (!candidate || typeof candidate !== "object")
            continue;
        if (visited.has(candidate))
            continue;
        visited.add(candidate);
        const validator = candidate;
        if (validator.kind === "any")
            return true;
        pending.push(...Object.values(candidate));
    }
    return false;
}
function parseMediaType(value) {
    if (!value)
        return "";
    const mediaType = value.split(";", 1)[0]?.trim().toLowerCase();
    return mediaType ?? "";
}
function parseFormBody(text) {
    const params = new URLSearchParams(text);
    const result = Object.create(null);
    for (const [key, value] of params) {
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
            throw new WebhookRequestError("Unsafe form field", 400);
        }
        if (Object.prototype.hasOwnProperty.call(result, key)) {
            throw new WebhookRequestError("Duplicate form field", 400);
        }
        result[key] = value;
    }
    return result;
}
async function readBodyBytes(request, limit) {
    const reader = request.body?.getReader();
    if (!reader) {
        const fallback = new Uint8Array(await request.arrayBuffer());
        if (fallback.length > limit) {
            throw new WebhookRequestError("Webhook body is too large", 413);
        }
        return fallback;
    }
    const chunks = [];
    let total = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            const chunk = value ?? new Uint8Array();
            total += chunk.byteLength;
            if (total > limit) {
                try {
                    await reader.cancel();
                }
                catch {
                    // Preserve the deterministic 413 response even if the client has
                    // already closed the stream.
                }
                throw new WebhookRequestError("Webhook body is too large", 413);
            }
            chunks.push(chunk);
        }
    }
    finally {
        reader.releaseLock();
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return bytes;
}
//# sourceMappingURL=webhookSecurity.js.map