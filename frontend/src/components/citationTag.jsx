import { useState } from 'react';

export default function CitationTag({ filename, pageNumber, sources }) {
    const [expanded, setExpanded] = useState(false);
    const source = sources.find((s) => s.filename === filename && s.pageNumber === pageNumber);

    return (
        <span className="inline-block align-middle">
            <button
                onClick={() => setExpanded(!expanded)}
                className={`font-mono text-[11px] mx-0.5 px-1.5 py-0.5 border border-dashed border-brass text-brass bg-[#F9F1E6] rounded-sm transition-transform hover:rotate-0 hover:bg-brass hover:text-white ${expanded ? 'rotate-0 bg-brass text-white' : '-rotate-1'
                    }`}
            >
                {filename}, p.{pageNumber}
            </button>
            {expanded && (
                <span className="block font-mono text-xs bg-[#F9F1E6] border border-brass-light rounded-sm p-2 mt-1 mb-1 text-ink-muted">
                    {source?.chunkText || 'Source text unavailable.'}
                </span>
            )}
        </span>
    );
}