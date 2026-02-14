-- ============================================================
-- QuestionBank D1 Schema
-- Mirrors the existing MongoDB data model exactly
-- ============================================================

-- Languages
CREATE TABLE IF NOT EXISTS languages (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(12)))),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Topics (belong to a Language)
CREATE TABLE IF NOT EXISTS topics (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(12)))),
  language_id TEXT NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL,
  "order"     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(language_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_topics_language ON topics(language_id, "order");

-- Subtopics (belong to a Topic)
CREATE TABLE IF NOT EXISTS subtopics (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(12)))),
  topic_id   TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  "order"    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(topic_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_subtopics_topic ON subtopics(topic_id, "order");

-- Counters (atomic question numbering per language)
CREATE TABLE IF NOT EXISTS counters (
  language_id TEXT PRIMARY KEY REFERENCES languages(id) ON DELETE CASCADE,
  seq         INTEGER NOT NULL DEFAULT 0
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id              TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(12)))),
  language_id     TEXT NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  topic_id        TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  subtopic_id     TEXT REFERENCES subtopics(id) ON DELETE SET NULL,
  question_number INTEGER NOT NULL,
  title           TEXT NOT NULL,
  question_text   TEXT NOT NULL,
  answer_text     TEXT NOT NULL DEFAULT '',
  difficulty      TEXT NOT NULL CHECK(difficulty IN ('Easy','Medium','Hard')),
  type            TEXT NOT NULL CHECK(type IN ('Theory','Practical','Both')),
  tags            TEXT NOT NULL DEFAULT '[]',  -- JSON array stored as text
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(language_id, question_number)
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_q_language    ON questions(language_id);
CREATE INDEX IF NOT EXISTS idx_q_topic       ON questions(language_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_q_subtopic    ON questions(language_id, subtopic_id);
CREATE INDEX IF NOT EXISTS idx_q_difficulty  ON questions(language_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_q_type        ON questions(language_id, type);
CREATE INDEX IF NOT EXISTS idx_q_created     ON questions(created_at);
CREATE INDEX IF NOT EXISTS idx_q_number      ON questions(language_id, question_number);
