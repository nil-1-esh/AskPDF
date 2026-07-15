import CitationTag from './CitationTag';

const CITATION_REGEX = /\[([^,\]]+),\s*p\.(\d+)\]/g;

export default function MessageBubble({ role, text, sources = [] }) {
    const isUser = role === 'user';

    const renderWithCitations = (content) => {
        const parts = [];
        let lastIndex = 0;
        let match;
        while ((match = CITATION_REGEX.exec(content)) !== null) {
            if (match.index > lastIndex) parts.push(content.slice(lastIndex, match.index));
            parts.push(
                <CitationTag key={match.index} filename={match[1].trim()} pageNumber={parseInt(match[2], 10)} sources={sources} />
            );
            lastIndex = match.index + match[0].length;
        }
        if (lastIndex < content.length) parts.push(content.slice(lastIndex));
        return parts;
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
            <div
                className={`max-w-[80%] rounded-md px-3.5 py-2.5 text-sm leading-relaxed ${isUser ? 'bg-[#1F5147] text-white' : 'bg-white border border-line text-[#1B1F22]'
                    }`}
            >
                {isUser ? text : renderWithCitations(text) || <span className="text-ink-muted">…</span>}
            </div>
        </div>
    );
}