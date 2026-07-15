export const retryWithBackoff = async (fn, maxRetries = 4) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            const is503 = err.message?.includes('503') || err.message?.toLowerCase().includes('overloaded');
            const isLastAttempt = attempt === maxRetries - 1;

            if (!is503 || isLastAttempt) throw err;

            const waitMs = Math.pow(2, attempt) * 1000 + Math.random() * 500; // exponential backoff + jitter
            console.warn(`Gemini 503, retrying in ${(waitMs / 1000).toFixed(1)}s (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise((r) => setTimeout(r, waitMs));
        }
    }
};