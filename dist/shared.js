export const MAX_JOURNAL_SIZE = 8 << 20;
export function formatErrorWithStack(error) {
    if (error instanceof Error) {
        return error.toString() + (error.stack ? "\n" + error.stack : "");
    }
    return String(error);
}
//# sourceMappingURL=shared.js.map