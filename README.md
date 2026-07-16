# AskPDF — Multi-Document RAG with Citations

Upload multiple PDFs and ask questions across them — get grounded, cited answers that point back to the exact document and page a fact came from.

---

## What it does

- Upload multiple PDFs at once and manage them in a document library
- Ask questions scoped to specific documents, or search across all of them
- Get answers grounded only in the uploaded content, with inline citations like `[filename.pdf, p.3]`
- Click a citation to expand the exact source passage it came from
- Ask natural follow-up questions ("what about the other one?") — the app rewrites them into standalone queries before searching, so conversational context doesn't break retrieval
- Answers stream in token-by-token
- Conversations persist across page refreshes, scoped to a session

---

## Architecture

```
PDF Upload
   │
   ▼
Text Extraction (pdf-parse, per-page)
   │
   ▼
Chunking (hand-written splitter, 500 chars / 100 overlap, per-page)
   │
   ▼
Embedding (Gemini Embedding API, 768-dim, task-type aware)
   │
   ▼
Vector Storage (Pinecone — vectors + metadata: documentId, filename, pageNumber, chunkText)
   │
   ▼
   ═══════════════ query time ═══════════════
   │
User question ──▶ Contextualization (rewrites follow-ups using chat history)
   │
   ▼
Retrieval (per-document filtering OR pooled search w/ per-doc cap — prevents
one document from dominating a multi-document answer)
   │
   ▼
Prompt Construction (each retrieved chunk labeled with its source)
   │
   ▼
Generation (Gemini, grounded via system instruction — "answer only from context")
   │
   ▼
Citation Verification (checks inline citations against actually-retrieved chunks)
   │
   ▼
Streamed response + sources → React UI → persisted to MongoDB
```

Document metadata and chat history live in **MongoDB**; embeddings and semantic search live in **Pinecone**. Two databases, split by purpose rather than one database doing both jobs — see [Key Design Decisions](#key-design-decisions).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React, React Router, Tailwind CSS |
| Backend | Node.js, Express |
| File handling | Multer, pdf-parse |
| Embeddings & generation | Google Gemini API |
| Vector database | Pinecone |
| Document/session storage | MongoDB (Mongoose) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Key Design Decisions

**Two databases, split by purpose.** Pinecone handles vectors and similarity search; MongoDB handles document metadata and chat history. This mirrors how RAG systems are typically architected in production, rather than forcing one database to do both jobs.

**Per-document retrieval vs. pooled search.** When a user selects specific documents, the app queries each one individually and merges the top results (`perDocK`) — this guarantees every selected document is represented in the answer, which a single pooled top-k search across all documents can't guarantee (one document can otherwise dominate results even when the answer needs multiple sources). When no documents are selected, a pooled search with a per-document cap is used instead, since forcing every uploaded document into every answer doesn't make sense at that point.

**Chunking is deliberately per-page**, not across page boundaries — every chunk's page number stays unambiguous, which is what makes accurate citations possible. The tradeoff: a fact split exactly at a page boundary can occasionally land awkwardly across two chunks.

**Follow-up questions are rewritten before retrieval, not just before generation.** A raw follow-up like "what about the other one?" embeds to something nearly meaningless on its own — Pinecone has no memory of the conversation. A lightweight Gemini call rewrites it into a standalone question first, and only that rewritten version is used for the vector search; the original phrasing is still what's sent to the final generation step, since the model itself already has full conversation history there.

**Citations are structural, not just prompted.** Each retrieved chunk is explicitly labeled with its source (`[filename, p.X]`) inside the prompt sent to the model — citation accuracy depends on the source being visibly attached to the text, not on the model "remembering" where information came from. A separate verification step then parses the model's citations back out and checks each one against what was actually retrieved, flagging anything that doesn't match as a potential hallucinated citation.

**Model selection is environment-configurable, not hardcoded.** Mid-build, Google deprecated the Gemini model this project originally used, with limited warning. The generation model is now read from an environment variable rather than hardcoded across files, so a future model change is a one-line config update.

**Retry logic is scoped narrowly on purpose.** API calls are wrapped in exponential backoff with jitter for transient failures (e.g. Gemini 503s) — but only around the call that *initiates* a stream, never around reading from an already-started stream. Retrying after a stream has partially responded would duplicate or corrupt what the client already received; a failure there is instead handled as a clean stream-abort.

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Pinecone account (free tier)
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))

### Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
PORT=5000
```

Create a Pinecone index with **768 dimensions** and **cosine** metric before running the app.

```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm run dev
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/          # MongoDB & Pinecone connections
│   ├── controllers/     # request handling & business logic
│   ├── routes/          # thin route definitions
│   ├── models/          # Mongoose schemas
│   ├── utils/           # chunking, embeddings, retrieval, prompts, citation checks
│   ├── scripts/         # manual dev/debug scripts (not part of the live API)
│   └── server.js
frontend/
├── src/
│   ├── pages/            # ChatPage, LibraryPage
│   ├── components/        # upload, source picker, chat window, citations
│   ├── hooks/              # streaming chat consumer
│   ├── api/                 # backend calls
│   └── App.jsx
```

`backend/src/scripts/` contains standalone scripts used to test embeddings, Pinecone upserts/queries, and cosine similarity in isolation before wiring them into the live API — kept as a record of how each pipeline stage was verified independently.

---

## Known Limitations

- **No OCR** — scanned/image-only PDFs with no selectable text produce empty or near-empty chunks.
- **Citation verification checks existence, not correctness** — it confirms a cited `[filename, p.X]` pair matches something that was actually retrieved, not that the model used it accurately.
- **Free-tier cold starts** — the backend (Render free tier) spins down after inactivity; the first request after idle can take 30-60 seconds.
- **No duplicate-upload detection** — re-uploading the same file creates a second, separate document entry.

## Possible Future Improvements

- Refactor chunking and vector-store wiring to LangChain.js for framework-standard tooling
- Background job queue for embedding/upserting, instead of blocking the upload response
- OCR fallback for scanned documents
- Retrieval evaluation set to measure retrieval accuracy quantitatively, not just spot-checked
