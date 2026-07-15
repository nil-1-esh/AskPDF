import { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
    const [value, setValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!value.trim() || disabled) return;
        onSend(value);
        setValue('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-line bg-paper-alt rounded-b-md">
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ask the shelf a question..."
                disabled={disabled}
                className="flex-1 border border-line rounded-md px-3 py-2 text-sm bg-white text-[#1B1F22] placeholder:text-ink-muted focus-visible:outline-teal"
            />
            <button
                type="submit"
                disabled={disabled}
                className="bg-[#1F5147] text-white font-semibold px-4 py-2 rounded-md text-sm font-mono disabled:bg-[#1F5147]/40 disabled:text-white/70"
            >
                {disabled ? '...' : 'Ask'}
            </button>
        </form>
    );
}