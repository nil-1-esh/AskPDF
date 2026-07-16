import { useRef, useEffect } from 'react';
import MessageBubble from './messageBubble';
import ChatInput from './chatInput';
import EmptyState from './emptyState';

export default function ChatWindow({ messages, onSend, isStreaming }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-[560px] border border-line rounded-md bg-paper">
            <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <EmptyState title="The desk is clear" body="Ask a question to begin." />
                ) : (
                    messages.map((msg, i) => <MessageBubble key={i} role={msg.role} text={msg.text} sources={msg.sources} />)
                )}
                <div ref={bottomRef} />
            </div>
            <ChatInput onSend={onSend} disabled={isStreaming} />
        </div>
    );
}