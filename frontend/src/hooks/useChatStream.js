const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const streamChat = async ({ question, documentIds, history, onToken, onDone, onError }) => {
    try {
        const res = await fetch(`${BASE_URL}/chat/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, documentIds, history })
        });

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const events = buffer.split('\n\n');
            buffer = events.pop(); // keep the last, possibly incomplete chunk for next read

            for (const event of events) {
                if (!event.startsWith('data: ')) continue;
                const payload = JSON.parse(event.slice(6));

                if (payload.type === 'token') onToken(payload.text);
                else if (payload.type === 'done') onDone(payload);
                else if (payload.type === 'error') onError(payload.error);
            }
        }
    } catch (err) {
        onError(err.message);
    }
};