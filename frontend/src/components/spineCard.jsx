import { spineColor } from '../utils/spineColor';

export default function SpineCard({ doc }) {
    const color = spineColor(doc._id);

    return (
        <div className="flex items-stretch border border-line rounded-md overflow-hidden bg-paper-alt">
            <div style={{ backgroundColor: color }} className="w-3 shrink-0" />
            <div className="p-3 min-w-0">
                <p className="font-mono text-sm truncate">{doc.filename}</p>
                <p className="text-xs text-ink-muted mt-1">{doc.pageCount} pages · {doc.status}</p>
            </div>
        </div>
    );
}