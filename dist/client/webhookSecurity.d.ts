import type { Validator } from "convex/values";
import type { StandardSchemaV1 } from "./hooks.js";
/**
 * Webhook bodies are persisted in the workflow journal. Keep the default below
 * the Convex value/transaction limit so a request cannot consume the whole
 * mutation budget before validation runs.
 */
export declare const DEFAULT_MAX_WEBHOOK_BODY_BYTES: number;
export declare const MAX_WEBHOOK_BODY_BYTES: number;
/**
 * Tokens are bearer credentials embedded in URLs. They must be URL-safe and
 * have enough room for a cryptographically random value. A caller may use a
 * stable token, but it must still meet this minimum and cannot contain path or
 * control delimiters.
 */
export declare const MIN_WEBHOOK_TOKEN_LENGTH = 32;
export declare const MAX_WEBHOOK_TOKEN_LENGTH = 256;
/** Maximum length accepted only while reading pre-hardening records. */
export declare const MAX_LEGACY_WEBHOOK_TOKEN_LENGTH = 4096;
export declare const MAX_WEBHOOK_USES = 1000000;
export type WebhookPayloadValidator<T = unknown> = Validator<T, any, any> | StandardSchemaV1<unknown, T>;
export declare class WebhookRequestError extends Error {
    readonly status: 400 | 413 | 415;
    constructor(message: string, status: 400 | 413 | 415);
}
/**
 * Generate a bearer token with 256 bits from the Web Crypto API. There is no
 * pseudo-random fallback: using Math.random here would make URL credentials
 * guessable in a compromised or unusual runtime.
 */
export declare function generateWebhookToken(): string;
/**
 * Hash a bearer token before it is persisted. SHA-256 is sufficient here:
 * generated tokens have 256 bits, and custom tokens are length/charset
 * checked before this function is called. Never fall back to a plaintext
 * digest or a non-cryptographic hash when Web Crypto is unavailable.
 */
export declare function hashWebhookToken(token: string): Promise<string>;
/**
 * Hook tokens are identifiers inside a deterministic workflow execution, not
 * standalone URL credentials. Derive them from the workflow's already-random
 * Convex ID instead of calling Math.random, which is deliberately patched to a
 * replayable PRNG while workflows run.
 */
export declare function deriveHookToken(workflowId: string, eventName: string, sequence: number): string;
/**
 * Validate a caller-provided token without including the secret in errors.
 */
export declare function assertValidWebhookToken(token: string): void;
/**
 * Check the syntax needed to extract a token from a URL path. Older releases
 * accepted shorter tokens and characters such as `:`. Keep those records
 * reachable so the lazy plaintext-to-digest migration can complete, while
 * requiring all newly created credentials to pass the stronger check above.
 */
export declare function isWebhookTokenPathSegment(token: string): boolean;
/**
 * Keep route limits bounded even when a caller supplies configuration from an
 * environment variable or another untrusted source.
 */
export declare function normalizeMaxBodyBytes(value?: number): number;
/**
 * Read and decode a webhook request exactly once. The byte limit is enforced
 * both from Content-Length and after reading the body, because clients may use
 * chunked transfer encoding or provide a false length.
 */
export declare function readWebhookBody(request: Request, maxBodyBytes?: number): Promise<unknown>;
/**
 * Validate a decoded body against the binding selected for its webhook. Convex
 * validators run with unknown object fields rejected. Standard Schema
 * validators may transform the value, and their transformed result is passed
 * to the workflow.
 */
export declare function validateWebhookPayload<T>(value: unknown, validator: WebhookPayloadValidator<T>): Promise<T>;
/** Validate a route binding at module-registration time. */
export declare function assertWebhookValidator(validator: WebhookPayloadValidator): void;
//# sourceMappingURL=webhookSecurity.d.ts.map