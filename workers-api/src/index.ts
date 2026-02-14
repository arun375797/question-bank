import { Hono } from "hono";
import { cors } from "hono/cors";

// ─── Types ──────────────────────────────────────────────────
type Bindings = { DB: D1Database };
type Env = { Bindings: Bindings };

const app = new Hono<Env>();

// ─── CORS ───────────────────────────────────────────────────
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

// ─── Helpers ────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function generateId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function now(): string {
  return new Date().toISOString();
}

function success(data: any, message = "Success", meta: any = null) {
  const response: any = { success: true, message, data };
  if (meta) response.meta = meta;
  return response;
}

function error(message: string, statusCode = 500) {
  return { success: false, message, statusCode };
}

// ─── Health ─────────────────────────────────────────────────
app.get("/", (c) => c.json({ status: "ok", service: "QuestionBank API" }));

// ═══════════════════════════════════════════════════════════
//  LANGUAGES
// ═══════════════════════════════════════════════════════════

// GET /api/languages
app.get("/api/languages", async (c) => {
  const db = c.env.DB;

  const languages = await db
    .prepare("SELECT * FROM languages ORDER BY name ASC")
    .all();

  // Get question counts per language
  const stats = await db
    .prepare(
      `SELECT language_id,
              COUNT(*) as totalQuestions,
              SUM(CASE WHEN answer_text != '' AND answer_text IS NOT NULL THEN 1 ELSE 0 END) as answeredQuestions
       FROM questions GROUP BY language_id`,
    )
    .all();

  const statsMap: Record<string, any> = {};
  for (const s of stats.results) {
    statsMap[s.language_id as string] = {
      totalQuestions: s.totalQuestions,
      answeredQuestions: s.answeredQuestions,
    };
  }

  const data = languages.results.map((lang: any) => ({
    _id: lang.id,
    name: lang.name,
    slug: lang.slug,
    description: lang.description,
    createdAt: lang.created_at,
    updatedAt: lang.updated_at,
    totalQuestions: statsMap[lang.id]?.totalQuestions || 0,
    answeredQuestions: statsMap[lang.id]?.answeredQuestions || 0,
  }));

  return c.json(success(data));
});

// POST /api/languages
app.post("/api/languages", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const { name, description = "" } = body;

  if (!name) return c.json(error("Language name is required", 400), 400);

  const id = generateId();
  const slug = slugify(name);
  const ts = now();

  try {
    await db
      .prepare(
        "INSERT INTO languages (id, name, slug, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .bind(id, name.trim(), slug, description.trim(), ts, ts)
      .run();

    const lang = await db
      .prepare("SELECT * FROM languages WHERE id = ?")
      .bind(id)
      .first();

    return c.json(
      success(
        {
          _id: lang!.id,
          name: lang!.name,
          slug: lang!.slug,
          description: lang!.description,
          createdAt: lang!.created_at,
          updatedAt: lang!.updated_at,
        },
        "Created successfully",
      ),
      201,
    );
  } catch (e: any) {
    if (e.message?.includes("UNIQUE"))
      return c.json(error("Language already exists", 409), 409);
    throw e;
  }
});

// PUT /api/languages/:id
app.put("/api/languages/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  const existing = await db
    .prepare("SELECT * FROM languages WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json(error("Language not found", 404), 404);

  const name = body.name || existing.name;
  const description =
    body.description !== undefined ? body.description : existing.description;
  const slug = body.name ? slugify(body.name) : existing.slug;

  await db
    .prepare(
      "UPDATE languages SET name = ?, slug = ?, description = ?, updated_at = ? WHERE id = ?",
    )
    .bind(name, slug, description, now(), id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM languages WHERE id = ?")
    .bind(id)
    .first();

  return c.json(
    success(
      {
        _id: updated!.id,
        name: updated!.name,
        slug: updated!.slug,
        description: updated!.description,
        createdAt: updated!.created_at,
        updatedAt: updated!.updated_at,
      },
      "Language updated",
    ),
  );
});

// DELETE /api/languages/:id
app.delete("/api/languages/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const cascade = c.req.query("cascade");

  const existing = await db
    .prepare("SELECT * FROM languages WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json(error("Language not found", 404), 404);

  const topicCount = (await db
    .prepare("SELECT COUNT(*) as c FROM topics WHERE language_id = ?")
    .bind(id)
    .first())!.c as number;
  const questionCount = (await db
    .prepare("SELECT COUNT(*) as c FROM questions WHERE language_id = ?")
    .bind(id)
    .first())!.c as number;

  if ((topicCount > 0 || questionCount > 0) && cascade !== "true") {
    return c.json(
      error(
        `Cannot delete: ${topicCount} topics and ${questionCount} questions depend on this language. Use ?cascade=true to force delete.`,
        409,
      ),
      409,
    );
  }

  // D1 foreign keys with ON DELETE CASCADE handle the cascade automatically
  await db.prepare("DELETE FROM languages WHERE id = ?").bind(id).run();

  return c.json(
    success(
      {
        _id: existing.id,
        name: existing.name,
        slug: existing.slug,
      },
      "Language deleted",
    ),
  );
});

// ═══════════════════════════════════════════════════════════
//  TOPICS
// ═══════════════════════════════════════════════════════════

// GET /api/topics?languageId=
app.get("/api/topics", async (c) => {
  const db = c.env.DB;
  const languageId = c.req.query("languageId");

  let query =
    "SELECT t.*, l.name as lang_name, l.slug as lang_slug FROM topics t LEFT JOIN languages l ON t.language_id = l.id";
  const params: any[] = [];

  if (languageId) {
    query += " WHERE t.language_id = ?";
    params.push(languageId);
  }
  query += ' ORDER BY t."order" ASC, t.name ASC';

  const result = await db
    .prepare(query)
    .bind(...params)
    .all();

  const data = result.results.map((t: any) => ({
    _id: t.id,
    languageId: t.language_id
      ? { _id: t.language_id, name: t.lang_name, slug: t.lang_slug }
      : t.language_id,
    name: t.name,
    slug: t.slug,
    order: t.order,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }));

  return c.json(success(data));
});

// POST /api/topics
app.post("/api/topics", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const { languageId, name, order = 0 } = body;

  if (!languageId || !name)
    return c.json(error("languageId and name required", 400), 400);

  const id = generateId();
  const slug = slugify(name);
  const ts = now();

  try {
    await db
      .prepare(
        'INSERT INTO topics (id, language_id, name, slug, "order", created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(id, languageId, name.trim(), slug, order, ts, ts)
      .run();

    const topic = await db
      .prepare("SELECT * FROM topics WHERE id = ?")
      .bind(id)
      .first();

    return c.json(
      success(
        {
          _id: topic!.id,
          languageId: topic!.language_id,
          name: topic!.name,
          slug: topic!.slug,
          order: topic!.order,
          createdAt: topic!.created_at,
          updatedAt: topic!.updated_at,
        },
        "Created successfully",
      ),
      201,
    );
  } catch (e: any) {
    if (e.message?.includes("UNIQUE"))
      return c.json(error("Topic already exists in this language", 409), 409);
    throw e;
  }
});

// PUT /api/topics/:id
app.put("/api/topics/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  const existing = await db
    .prepare("SELECT * FROM topics WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json(error("Topic not found", 404), 404);

  const name = body.name || existing.name;
  const slug = body.name ? slugify(body.name) : existing.slug;
  const order = body.order !== undefined ? body.order : existing.order;

  await db
    .prepare(
      'UPDATE topics SET name = ?, slug = ?, "order" = ?, updated_at = ? WHERE id = ?',
    )
    .bind(name, slug, order, now(), id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM topics WHERE id = ?")
    .bind(id)
    .first();

  return c.json(
    success(
      {
        _id: updated!.id,
        languageId: updated!.language_id,
        name: updated!.name,
        slug: updated!.slug,
        order: updated!.order,
        createdAt: updated!.created_at,
        updatedAt: updated!.updated_at,
      },
      "Topic updated",
    ),
  );
});

// DELETE /api/topics/:id
app.delete("/api/topics/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const cascade = c.req.query("cascade");

  const existing = await db
    .prepare("SELECT * FROM topics WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json(error("Topic not found", 404), 404);

  const subtopicCount = (await db
    .prepare("SELECT COUNT(*) as c FROM subtopics WHERE topic_id = ?")
    .bind(id)
    .first())!.c as number;
  const questionCount = (await db
    .prepare("SELECT COUNT(*) as c FROM questions WHERE topic_id = ?")
    .bind(id)
    .first())!.c as number;

  if ((subtopicCount > 0 || questionCount > 0) && cascade !== "true") {
    return c.json(
      error(
        `Cannot delete: ${subtopicCount} subtopics and ${questionCount} questions depend on this topic. Use ?cascade=true to force delete.`,
        409,
      ),
      409,
    );
  }

  // ON DELETE CASCADE in schema handles subtopics + questions
  await db.prepare("DELETE FROM topics WHERE id = ?").bind(id).run();

  return c.json(
    success({ _id: existing.id, name: existing.name }, "Topic deleted"),
  );
});

// ═══════════════════════════════════════════════════════════
//  SUBTOPICS
// ═══════════════════════════════════════════════════════════

// GET /api/subtopics?topicId=
app.get("/api/subtopics", async (c) => {
  const db = c.env.DB;
  const topicId = c.req.query("topicId");

  let query =
    "SELECT s.*, t.name as topic_name, t.slug as topic_slug FROM subtopics s LEFT JOIN topics t ON s.topic_id = t.id";
  const params: any[] = [];

  if (topicId) {
    query += " WHERE s.topic_id = ?";
    params.push(topicId);
  }
  query += ' ORDER BY s."order" ASC, s.name ASC';

  const result = await db
    .prepare(query)
    .bind(...params)
    .all();

  const data = result.results.map((s: any) => ({
    _id: s.id,
    topicId: s.topic_id
      ? { _id: s.topic_id, name: s.topic_name, slug: s.topic_slug }
      : s.topic_id,
    name: s.name,
    slug: s.slug,
    order: s.order,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  }));

  return c.json(success(data));
});

// POST /api/subtopics
app.post("/api/subtopics", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const { topicId, name, order = 0 } = body;

  if (!topicId || !name)
    return c.json(error("topicId and name required", 400), 400);

  const id = generateId();
  const slug = slugify(name);
  const ts = now();

  try {
    await db
      .prepare(
        'INSERT INTO subtopics (id, topic_id, name, slug, "order", created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(id, topicId, name.trim(), slug, order, ts, ts)
      .run();

    const sub = await db
      .prepare("SELECT * FROM subtopics WHERE id = ?")
      .bind(id)
      .first();

    return c.json(
      success(
        {
          _id: sub!.id,
          topicId: sub!.topic_id,
          name: sub!.name,
          slug: sub!.slug,
          order: sub!.order,
          createdAt: sub!.created_at,
          updatedAt: sub!.updated_at,
        },
        "Created successfully",
      ),
      201,
    );
  } catch (e: any) {
    if (e.message?.includes("UNIQUE"))
      return c.json(error("Subtopic already exists in this topic", 409), 409);
    throw e;
  }
});

// PUT /api/subtopics/:id
app.put("/api/subtopics/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  const existing = await db
    .prepare("SELECT * FROM subtopics WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json(error("Subtopic not found", 404), 404);

  const name = body.name || existing.name;
  const slug = body.name ? slugify(body.name) : existing.slug;
  const order = body.order !== undefined ? body.order : existing.order;

  await db
    .prepare(
      'UPDATE subtopics SET name = ?, slug = ?, "order" = ?, updated_at = ? WHERE id = ?',
    )
    .bind(name, slug, order, now(), id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM subtopics WHERE id = ?")
    .bind(id)
    .first();

  return c.json(
    success(
      {
        _id: updated!.id,
        topicId: updated!.topic_id,
        name: updated!.name,
        slug: updated!.slug,
        order: updated!.order,
        createdAt: updated!.created_at,
        updatedAt: updated!.updated_at,
      },
      "Subtopic updated",
    ),
  );
});

// DELETE /api/subtopics/:id
app.delete("/api/subtopics/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const cascade = c.req.query("cascade");

  const existing = await db
    .prepare("SELECT * FROM subtopics WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json(error("Subtopic not found", 404), 404);

  const questionCount = (await db
    .prepare("SELECT COUNT(*) as c FROM questions WHERE subtopic_id = ?")
    .bind(id)
    .first())!.c as number;

  if (questionCount > 0 && cascade !== "true") {
    return c.json(
      error(
        `Cannot delete: ${questionCount} questions reference this subtopic. Use ?cascade=true to clear subtopic references.`,
        409,
      ),
      409,
    );
  }

  if (cascade === "true") {
    // Nullify subtopic references instead of deleting questions
    await db
      .prepare("UPDATE questions SET subtopic_id = NULL WHERE subtopic_id = ?")
      .bind(id)
      .run();
  }

  await db.prepare("DELETE FROM subtopics WHERE id = ?").bind(id).run();

  return c.json(
    success({ _id: existing.id, name: existing.name }, "Subtopic deleted"),
  );
});

// ═══════════════════════════════════════════════════════════
//  QUESTIONS
// ═══════════════════════════════════════════════════════════

// Helper: format a question row for the API response (matches MongoDB populate)
async function formatQuestion(db: D1Database, q: any) {
  const lang = q.lang_name
    ? { _id: q.language_id, name: q.lang_name, slug: q.lang_slug }
    : null;
  const topic = q.topic_name
    ? { _id: q.topic_id, name: q.topic_name, slug: q.topic_slug }
    : null;
  const subtopic = q.sub_name
    ? { _id: q.subtopic_id, name: q.sub_name, slug: q.sub_slug }
    : null;

  return {
    _id: q.id,
    languageId: lang || q.language_id,
    topicId: topic || q.topic_id,
    subtopicId: subtopic,
    questionNumber: q.question_number,
    title: q.title,
    questionText: q.question_text,
    answerText: q.answer_text,
    difficulty: q.difficulty,
    type: q.type,
    tags: JSON.parse(q.tags || "[]"),
    createdAt: q.created_at,
    updatedAt: q.updated_at,
  };
}

const QUESTION_SELECT = `
  SELECT q.*,
         l.name as lang_name, l.slug as lang_slug,
         t.name as topic_name, t.slug as topic_slug,
         s.name as sub_name, s.slug as sub_slug
  FROM questions q
  LEFT JOIN languages l ON q.language_id = l.id
  LEFT JOIN topics t ON q.topic_id = t.id
  LEFT JOIN subtopics s ON q.subtopic_id = s.id
`;

// GET /api/questions
app.get("/api/questions", async (c) => {
  const db = c.env.DB;
  const {
    languageId,
    topicId,
    subtopicId,
    difficulty,
    type,
    hasAnswer,
    tags,
    search,
    sort = "newest",
    page = "1",
    limit = "20",
  } = c.req.query();

  const conditions: string[] = [];
  const params: any[] = [];

  if (languageId) {
    conditions.push("q.language_id = ?");
    params.push(languageId);
  }
  if (topicId) {
    conditions.push("q.topic_id = ?");
    params.push(topicId);
  }
  if (subtopicId) {
    conditions.push("q.subtopic_id = ?");
    params.push(subtopicId);
  }

  // Multi-select difficulty
  if (difficulty) {
    const diffs = difficulty.split(",").filter(Boolean);
    if (diffs.length > 0) {
      conditions.push(`q.difficulty IN (${diffs.map(() => "?").join(",")})`);
      params.push(...diffs);
    }
  }

  // Multi-select type
  if (type) {
    const types = type.split(",").filter(Boolean);
    if (types.length > 0) {
      conditions.push(`q.type IN (${types.map(() => "?").join(",")})`);
      params.push(...types);
    }
  }

  // Has answer filter
  if (hasAnswer === "true") {
    conditions.push("q.answer_text != '' AND q.answer_text IS NOT NULL");
  } else if (hasAnswer === "false") {
    conditions.push("(q.answer_text = '' OR q.answer_text IS NULL)");
  }

  // Tags filter
  if (tags) {
    const tagArr = tags.split(",").filter(Boolean);
    // Use JSON-based matching for each tag
    const tagConditions = tagArr.map(() => "q.tags LIKE ?");
    conditions.push(`(${tagConditions.join(" OR ")})`);
    params.push(...tagArr.map((t) => `%"${t}"%`));
  }

  // Text search (LIKE-based, since D1 doesn't support FTS5 easily)
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      "(q.title LIKE ? OR q.question_text LIKE ? OR q.tags LIKE ?)",
    );
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const whereClause =
    conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

  // Sorting
  let orderClause: string;
  switch (sort) {
    case "oldest":
      orderClause = "q.created_at ASC";
      break;
    case "number_asc":
      orderClause = "q.question_number ASC";
      break;
    case "number_desc":
      orderClause = "q.question_number DESC";
      break;
    case "newest":
    default:
      orderClause = "q.created_at DESC";
      break;
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  // Count total
  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM questions q${whereClause}`)
    .bind(...params)
    .first();
  const totalCount = (countResult?.total as number) || 0;
  const totalPages = Math.ceil(totalCount / limitNum);

  // Fetch page
  const query = `${QUESTION_SELECT}${whereClause} ORDER BY ${orderClause} LIMIT ? OFFSET ?`;
  const result = await db
    .prepare(query)
    .bind(...params, limitNum, offset)
    .all();

  const data = result.results.map((q: any) => ({
    _id: q.id,
    languageId: q.lang_name
      ? { _id: q.language_id, name: q.lang_name, slug: q.lang_slug }
      : q.language_id,
    topicId: q.topic_name
      ? { _id: q.topic_id, name: q.topic_name, slug: q.topic_slug }
      : q.topic_id,
    subtopicId: q.sub_name
      ? { _id: q.subtopic_id, name: q.sub_name, slug: q.sub_slug }
      : null,
    questionNumber: q.question_number,
    title: q.title,
    questionText: q.question_text,
    answerText: q.answer_text,
    difficulty: q.difficulty,
    type: q.type,
    tags: JSON.parse(q.tags || "[]"),
    createdAt: q.created_at,
    updatedAt: q.updated_at,
  }));

  return c.json(
    success(data, "Questions retrieved", {
      page: pageNum,
      limit: limitNum,
      totalCount,
      totalPages,
      from: totalCount > 0 ? offset + 1 : 0,
      to: Math.min(offset + limitNum, totalCount),
    }),
  );
});

// GET /api/questions/:id
app.get("/api/questions/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const q = await db
    .prepare(`${QUESTION_SELECT} WHERE q.id = ?`)
    .bind(id)
    .first();

  if (!q) return c.json(error("Question not found", 404), 404);

  return c.json(success(await formatQuestion(db, q)));
});

// POST /api/questions
app.post("/api/questions", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const {
    languageId,
    topicId,
    subtopicId = null,
    title,
    questionText,
    answerText = "",
    difficulty,
    type,
    tags = [],
  } = body;

  if (
    !languageId ||
    !topicId ||
    !title ||
    !questionText ||
    !difficulty ||
    !type
  ) {
    return c.json(error("Missing required fields", 400), 400);
  }

  // Atomic counter increment
  await db
    .prepare(
      "INSERT INTO counters (language_id, seq) VALUES (?, 1) ON CONFLICT(language_id) DO UPDATE SET seq = seq + 1",
    )
    .bind(languageId)
    .run();

  const counter = await db
    .prepare("SELECT seq FROM counters WHERE language_id = ?")
    .bind(languageId)
    .first();
  const questionNumber = counter!.seq as number;

  const id = generateId();
  const ts = now();

  await db
    .prepare(
      `INSERT INTO questions (id, language_id, topic_id, subtopic_id, question_number, title, question_text, answer_text, difficulty, type, tags, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      languageId,
      topicId,
      subtopicId || null,
      questionNumber,
      title.trim(),
      questionText.trim(),
      answerText?.trim() || "",
      difficulty,
      type,
      JSON.stringify(tags),
      ts,
      ts,
    )
    .run();

  // Fetch the populated question
  const q = await db
    .prepare(`${QUESTION_SELECT} WHERE q.id = ?`)
    .bind(id)
    .first();

  return c.json(
    {
      success: true,
      message: "Question created",
      data: await formatQuestion(db, q!),
    },
    201,
  );
});

// PUT /api/questions/:id
app.put("/api/questions/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");
  const body = await c.req.json();

  const existing = await db
    .prepare("SELECT * FROM questions WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json(error("Question not found", 404), 404);

  // Don't allow changing languageId or questionNumber
  const topicId = body.topicId !== undefined ? body.topicId : existing.topic_id;
  const subtopicId =
    body.subtopicId !== undefined ? body.subtopicId : existing.subtopic_id;
  const title = body.title !== undefined ? body.title : existing.title;
  const questionText =
    body.questionText !== undefined
      ? body.questionText
      : existing.question_text;
  const answerText =
    body.answerText !== undefined ? body.answerText : existing.answer_text;
  const difficulty =
    body.difficulty !== undefined ? body.difficulty : existing.difficulty;
  const type = body.type !== undefined ? body.type : existing.type;
  const tags =
    body.tags !== undefined ? JSON.stringify(body.tags) : existing.tags;

  await db
    .prepare(
      `UPDATE questions SET topic_id = ?, subtopic_id = ?, title = ?, question_text = ?, answer_text = ?, difficulty = ?, type = ?, tags = ?, updated_at = ? WHERE id = ?`,
    )
    .bind(
      topicId,
      subtopicId || null,
      title,
      questionText,
      answerText,
      difficulty,
      type,
      tags,
      now(),
      id,
    )
    .run();

  const q = await db
    .prepare(`${QUESTION_SELECT} WHERE q.id = ?`)
    .bind(id)
    .first();

  return c.json(success(await formatQuestion(db, q!), "Question updated"));
});

// DELETE /api/questions/:id
app.delete("/api/questions/:id", async (c) => {
  const db = c.env.DB;
  const id = c.req.param("id");

  const existing = await db
    .prepare("SELECT * FROM questions WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json(error("Question not found", 404), 404);

  await db.prepare("DELETE FROM questions WHERE id = ?").bind(id).run();

  return c.json(
    success(
      {
        _id: existing.id,
        title: existing.title,
        questionNumber: existing.question_number,
      },
      "Question deleted",
    ),
  );
});

// POST /api/questions/bulk
app.post("/api/questions/bulk", async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const { action, ids, value } = body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return c.json(error("ids array is required", 400), 400);
  }

  const placeholders = ids.map(() => "?").join(",");

  switch (action) {
    case "delete": {
      const result = await db
        .prepare(`DELETE FROM questions WHERE id IN (${placeholders})`)
        .bind(...ids)
        .run();
      return c.json(
        success({ deletedCount: result.meta.changes }, "Bulk delete completed"),
      );
    }

    case "updateDifficulty": {
      if (!["Easy", "Medium", "Hard"].includes(value)) {
        return c.json(error("Invalid difficulty value", 400), 400);
      }
      const result = await db
        .prepare(
          `UPDATE questions SET difficulty = ?, updated_at = ? WHERE id IN (${placeholders})`,
        )
        .bind(value, now(), ...ids)
        .run();
      return c.json(
        success(
          { modifiedCount: result.meta.changes },
          "Bulk update difficulty completed",
        ),
      );
    }

    case "updateType": {
      if (!["Theory", "Practical", "Both"].includes(value)) {
        return c.json(error("Invalid type value", 400), 400);
      }
      const result = await db
        .prepare(
          `UPDATE questions SET type = ?, updated_at = ? WHERE id IN (${placeholders})`,
        )
        .bind(value, now(), ...ids)
        .run();
      return c.json(
        success(
          { modifiedCount: result.meta.changes },
          "Bulk update type completed",
        ),
      );
    }

    default:
      return c.json(error("Invalid bulk action", 400), 400);
  }
});

// ─── 404 catch-all ──────────────────────────────────────────
app.notFound((c) => c.json({ success: false, message: "Not found" }, 404));

// ─── Error handler ──────────────────────────────────────────
app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    { success: false, message: err.message || "Internal server error" },
    500,
  );
});

export default app;
