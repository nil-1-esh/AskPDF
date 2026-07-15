export default function EmptyState({ title, body }) {
    return (
        <div className="text-center py-12 border border-dashed border-line rounded-md">
            <p className="font-display text-lg">{title}</p>
            <p className="text-sm text-ink-muted mt-1">{body}</p>
        </div>
    );
}