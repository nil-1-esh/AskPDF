import { useState, useEffect, useCallback } from 'react';
import { fetchDocuments } from '../api/api';
import DocumentUpload from '../components/DocumentUpload';
import SpineCard from '../components/SpineCard';
import EmptyState from '../components/EmptyState';

export default function LibraryPage() {
    const [documents, setDocuments] = useState([]);

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

    return (
        <div className="space-y-6">
            <DocumentUpload onUploadComplete={loadDocuments} />
            {documents.length === 0 ? (
                <EmptyState title="The shelf is empty" body="Upload a PDF to start building your archive." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {documents.map((doc) => (
                        <SpineCard key={doc._id} doc={doc} />
                    ))}
                </div>
            )}
        </div>
    );
}