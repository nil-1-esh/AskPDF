import { useState } from 'react';
import { uploadPdfs } from '../api/api';

export default function DocumentUpload({ onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        setError(null);
        try {
            await uploadPdfs(files);
            onUploadComplete();
        } catch (err) {
            setError('Upload failed. Check the file and try again.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="border border-line rounded-md p-4 bg-paper-alt">
            <label className="font-mono text-xs uppercase tracking-wide text-ink-muted block mb-2">
                Add to shelf
            </label>
            <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
                className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-line file:bg-paper file:text-sm file:font-mono hover:file:bg-paper-alt"
            />
            {uploading && <p className="text-sm text-teal mt-2 font-mono">Cataloging...</p>}
            {error && <p className="text-sm text-red-700 mt-2">{error}</p>}
        </div>
    );
}