import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchDocuments, fetchHistory } from '../api/api';
import { streamChat } from '../hooks/useChatStream';
import { getSessionId, startNewSession } from '../utils/session';
import SourceSelector from '../components/SourceSelector';
import ChatWindow from '../components/ChatWindow';
import EmptyState from '../components/EmptyState';

export default function ChatPage() {
    const [documents, setDocuments] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [sessionId, setSessionId] = useState(getSessionId());

    const loadDocuments = useCallback(async () => {
        try {
            setDocuments(await fetchDocuments());
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    useEffect(() => {
        fetchHistory(sessionId)
            .then((history) => setMessages(history.map((m) => ({ role: m.role, text: m.text, sources: m.sources }))))
            .catch((err) => console.error(err));
    }, [sessionId]);

    const toggleDocument = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleNewChat = () => {
        setSessionId(startNewSession());
        setMessages([]);
    };

    const handleSend = (question) => {
        const userMessage = { role: 'user', text: question };
        setMessages((prev) => [...prev, userMessage, { role: 'model', text: '', sources: [] }]);
        setIsStreaming(true);

        const history = messages.map((m) => ({ role: m.role, text: m.text }));

        streamChat({
            question,
            documentIds: selectedIds,
            history,
            sessionId,
            onToken: (token) => {
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...updated[updated.length - 1], text: updated[updated.length - 1].text + token };
                    return updated;
                });
            },
            onDone: ({ sources }) => {
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { ...updated[updated.length - 1], sources };
                    return updated;
                });
                setIsStreaming(false);
            },
            onError: (err) => {
                console.error(err);
                setIsStreaming(false);
            }
        });
    };

    if (documents.length === 0) {
        return (
            <EmptyState
                title="No sources yet"
                body={<>Visit the <Link to="/library" className="text-teal underline">Shelf</Link> to upload a PDF before asking questions.</>}
            />
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <SourceSelector documents={documents} selectedIds={selectedIds} onToggle={toggleDocument} />
                <button onClick={handleNewChat} className="text-xs font-mono text-ink-muted hover:text-teal shrink-0 ml-2">
                    + New chat
                </button>
            </div>
            <ChatWindow messages={messages} onSend={handleSend} isStreaming={isStreaming} />
        </div>
    );
}