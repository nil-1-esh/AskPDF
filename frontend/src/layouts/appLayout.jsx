import { Outlet, NavLink } from 'react-router-dom';

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-paper text-ink font-body">
            <header className="border-b border-line bg-paper-alt">
                <div className="max-w-4xl mx-auto px-6 pt-6">
                    <h1 className="font-display text-2xl font-semibold tracking-tight">The Reading Room</h1>
                    <p className="text-sm text-ink-muted mb-4">Ask questions of your documents, with sources cited.</p>
                    <nav className="flex gap-1">
                        {[
                            { to: '/chat', label: 'Desk' },
                            { to: '/library', label: 'Shelf' }
                        ].map((tab) => (
                            <NavLink
                                key={tab.to}
                                to={tab.to}
                                className={({ isActive }) =>
                                    `px-4 py-2 text-sm font-mono border-t border-x border-line rounded-t-md -mb-px ${isActive ? 'bg-paper text-ink' : 'bg-paper-alt text-ink-muted hover:text-ink'
                                    }`
                                }
                            >
                                {tab.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>
            <main className="max-w-4xl mx-auto px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}