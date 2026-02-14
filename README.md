# Domain Question Bank

A full-stack application for managing and studying technical interview questions across multiple programming domains.

## Tech Stack

- **Frontend:** React + Vite, TailwindCSS v4, React Router, TanStack React Query, Framer Motion, Lucide React
- **Backend:** Node.js + Express, MongoDB + Mongoose, Zod validation

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally (default: `mongodb://localhost:27017`)

### 1. Install Dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Environment Setup

Both `server/.env` and `client/.env` are pre-configured for local development.

**Server** (`server/.env`):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/domain-question-bank
```

**Client** (`client/.env`):

```
VITE_API_URL=http://localhost:5000/api
```

### 3. Seed Database (Optional)

```bash
cd server
npm run seed
```

This creates 5 languages, 19 topics, 11 subtopics, and 23 sample questions.

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Features

- **Study Mode** — Browse language cards → filter/search/sort questions → read question detail with answer reveal
- **Manage Mode** — Full CRUD for Languages, Topics, Subtopics, Questions with bulk operations
- **Per-Language Question Numbering** — Auto-incremented via atomic Counter collection
- **Server-side Filtering** — Topic, subtopic, difficulty, type, has-answer, tags, text search
- **URL Sync** — Filter state reflected in URL query params for shareable links
- **Dark/Light Mode** — Persisted toggle with system preference detection
- **Responsive** — Full mobile support with collapsible sidebar
- **Animations** — Page transitions, hover effects, modal springs (respects reduced-motion)

## API

| Method | Endpoint                          | Description                             |
| ------ | --------------------------------- | --------------------------------------- |
| GET    | `/api/languages`                  | List all languages with question counts |
| POST   | `/api/languages`                  | Create language                         |
| PUT    | `/api/languages/:id`              | Update language                         |
| DELETE | `/api/languages/:id?cascade=true` | Delete language                         |
| GET    | `/api/topics?languageId=`         | List topics                             |
| POST   | `/api/topics`                     | Create topic                            |
| PUT    | `/api/topics/:id`                 | Update topic                            |
| DELETE | `/api/topics/:id?cascade=true`    | Delete topic                            |
| GET    | `/api/subtopics?topicId=`         | List subtopics                          |
| POST   | `/api/subtopics`                  | Create subtopic                         |
| PUT    | `/api/subtopics/:id`              | Update subtopic                         |
| DELETE | `/api/subtopics/:id?cascade=true` | Delete subtopic                         |
| GET    | `/api/questions?...`              | List/filter/search/sort questions       |
| GET    | `/api/questions/:id`              | Get question by ID                      |
| POST   | `/api/questions`                  | Create question (auto-numbered)         |
| PUT    | `/api/questions/:id`              | Update question                         |
| DELETE | `/api/questions/:id`              | Delete question                         |
| POST   | `/api/questions/bulk`             | Bulk delete/update                      |

## Question Numbering

Uses a `Counter` collection with atomic `findOneAndUpdate` + `$inc` for safe per-language numbering. Deleted questions do **not** cause renumbering.



PS D:\Domain Question Bank\workers-api> npx wrangler d1 create questionbank_db
>>

 ⛅️ wrangler 4.65.0
───────────────────
✅ Successfully created DB 'questionbank_db' in region APAC
Created your new D1 database.

To access your new D1 Database in your Worker, add the following snippet to your configuration file:
{
  "d1_databases": [
    {
      "binding": "questionbank_db",
      "database_name": "questionbank_db",
      "database_id": "0cdf3326-7688-4e1e-91f0-ecc42362aee3"
    }
  ]
}
? Would you like Wrangler to add it on your behalf? » (Y/n)