// Simple hash function to convert a string to a 32-bit seed
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash >>> 0; // Ensure unsigned
}
// A simple, fast seeded PRNG
// https://gist.github.com/tommyettinger/46a874533244883189143505d203312c?permalink_comment_id=4854318#gistcomment-4854318
function createSeededRandom(seed) {
    return () => {
        seed = (seed + 0x9e3779b9) | 0;
        let t = Math.imul(seed ^ (seed >>> 16), 0x21f0aaad);
        t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
        return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
    };
}
// Testable unit: patches Math object to use seeded random
export function patchMath(math, seed) {
    const patchedMath = Object.create(Object.getPrototypeOf(math));
    // Copy all properties from original Math
    for (const key of Object.getOwnPropertyNames(math)) {
        if (key !== "random") {
            const descriptor = Object.getOwnPropertyDescriptor(math, key);
            if (descriptor) {
                Object.defineProperty(patchedMath, key, descriptor);
            }
        }
    }
    // Override random to use seeded PRNG
    const seededRandom = createSeededRandom(hashString(seed));
    patchedMath.random = seededRandom;
    return patchedMath;
}
// Testable unit: creates deterministic Date constructor
export function createDeterministicDate(originalDate, getGenerationState) {
    function DeterministicDate(...args) {
        // `Date()` was called directly, not as a constructor.
        if (!(this instanceof DeterministicDate)) {
            const date = new DeterministicDate();
            return date.toString();
        }
        if (args.length === 0) {
            const { now } = getGenerationState();
            return new originalDate(now);
        }
        return new originalDate(...args);
    }
    DeterministicDate.now = function () {
        const { now } = getGenerationState();
        return now;
    };
    DeterministicDate.parse = originalDate.parse;
    DeterministicDate.UTC = originalDate.UTC;
    DeterministicDate.prototype = originalDate.prototype;
    DeterministicDate.prototype.constructor = DeterministicDate;
    // TODO: Additional methods that should be patched for full determinism:
    // - getTimezoneOffset() - should return 0 (UTC)
    // - toLocaleString() - should use fixed locale (en-US) and UTC timezone
    // - toLocaleDateString() - should use fixed locale (en-US) and UTC timezone
    // - toLocaleTimeString() - should use fixed locale (en-US) and UTC timezone
    // These would require more complex prototype manipulation to work correctly.
    return DeterministicDate;
}
export function setupEnvironment(getGenerationState, workflowId) {
    const global = globalThis;
    // Patch Math with seeded random based on workflowId
    global.Math = patchMath(global.Math, workflowId);
    // Patch Date
    const originalDate = global.Date;
    global.Date = createDeterministicDate(originalDate, getGenerationState);
    // Patch console
    global.console = createConsole(global.console, getGenerationState);
    // Patch fetch
    global.fetch = (_input, _init) => {
        throw new Error(`Fetch isn't currently supported within workflows. Perform the fetch within an action and call it with step.runAction().`);
    };
    // Remove non-deterministic globals
    delete global.process;
    delete global.Crypto;
    delete global.crypto;
    delete global.CryptoKey;
    delete global.SubtleCrypto;
    global.setTimeout = () => {
        throw new Error("setTimeout isn't supported within workflows yet");
    };
    global.setInterval = () => {
        throw new Error("setInterval isn't supported within workflows yet");
    };
}
function noop() { }
// exported for testing
export function createConsole(console, getGenerationState) {
    const counts = {};
    const times = {};
    return new Proxy(console, {
        get: (target, prop) => {
            const { now, latest } = getGenerationState();
            switch (prop) {
                case "assert":
                case "clear":
                case "debug":
                case "dir":
                case "dirxml":
                case "error":
                case "info":
                case "log":
                case "table":
                case "trace":
                case "warn":
                case "profile":
                case "profileEnd":
                case "timeStamp":
                    if (!latest) {
                        return noop;
                    }
                    return target[prop];
                case "Console":
                    throw new Error("console.Console() is not supported within workflows");
                case "count":
                    return (label) => {
                        const key = label ?? "default";
                        counts[key] = (counts[key] ?? 0) + 1;
                        if (latest) {
                            target.info(`${key}: ${counts[key]}`);
                        }
                    };
                case "countReset":
                    return (label) => {
                        const key = label ?? "default";
                        counts[key] = 0;
                    };
                case "group":
                case "groupCollapsed":
                    if (!latest) {
                        // Don't print anything if latest is false
                        return () => target.group();
                    }
                    return target[prop];
                case "groupEnd":
                    return target[prop];
                case "time":
                    if (!latest) {
                        return (label) => {
                            times[label ?? "default"] = now;
                        };
                    }
                    return target[prop];
                case "timeEnd":
                case "timeLog":
                    if (!latest) {
                        return noop;
                    }
                    return (label, ...data) => {
                        const key = label ?? "default";
                        if (times[key] === undefined) {
                            target[prop](label);
                        }
                        else {
                            target.info(`${key}: ${now - times[key]}ms`, ...data);
                        }
                    };
            }
            return target[prop];
        },
    });
}
//# sourceMappingURL=environment.js.map