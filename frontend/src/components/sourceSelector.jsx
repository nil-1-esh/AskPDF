export default function SourceSelector({ documents, selectedIds, onToggle }) {
    if (documents.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-muted self-center mr-1">
                Sources:
            </span>
            {documents.map((doc) => {
                const isSelected = selectedIds.includes(doc._id);
                return (
                    <button
                        key={doc._id}
                        onClick={() => onToggle(doc._id)}
                        className={`text-xs font-mono font-medium px-2.5 py-1 rounded-full border-2 transition-colors ${isSelected
                                ? 'bg-[#1F5147] text-white border-[#1F5147]'
                                : 'bg-white text-[#3A4044] border-line hover:border-[#1F5147] hover:text-[#1F5147]'
                            }`}
                    >
                        {doc.filename}
                    </button>
                );
            })}
            <span className="text-xs text-ink-muted self-center ml-1">
                {selectedIds.length === 0 ? '(searching all)' : ''}
            </span>
        </div>
    );
}