import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/appLayout';
import ChatPage from './pages/chatPage';
import LibraryPage from './pages/libraryPage';

export default function App() {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/library" element={<LibraryPage />} />
            </Route>
        </Routes>
    );
}