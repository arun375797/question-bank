const { z } = require("zod");

const createLanguageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional().default(""),
});

const updateLanguageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  description: z.string().max(500).optional(),
});

const createTopicSchema = z.object({
  languageId: z.string().min(1, "Language ID is required"),
  name: z.string().min(1, "Name is required").max(200),
  order: z.number().int().min(0).optional().default(0),
});

const updateTopicSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).optional(),
  order: z.number().int().min(0).optional(),
});

const createSubtopicSchema = z.object({
  topicId: z.string().min(1, "Topic ID is required"),
  name: z.string().min(1, "Name is required").max(200),
  order: z.number().int().min(0).optional().default(0),
});

const updateSubtopicSchema = z.object({
  name: z.string().min(1, "Name is required").max(200).optional(),
  order: z.number().int().min(0).optional(),
});

const createQuestionSchema = z.object({
  languageId: z.string().min(1, "Language ID is required"),
  topicId: z.string().min(1, "Topic ID is required"),
  subtopicId: z.string().nullable().optional().default(null),
  title: z.string().min(1, "Title is required").max(500),
  questionText: z.string().min(1, "Question text is required"),
  answerText: z.string().optional().default(""),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  type: z.enum(["Theory", "Practical", "Both"]),
  tags: z.array(z.string()).optional().default([]),
});

const updateQuestionSchema = z.object({
  topicId: z.string().optional(),
  subtopicId: z.string().nullable().optional(),
  title: z.string().min(1).max(500).optional(),
  questionText: z.string().min(1).optional(),
  answerText: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  type: z.enum(["Theory", "Practical", "Both"]).optional(),
  tags: z.array(z.string()).optional(),
});

const bulkOperationSchema = z.object({
  action: z.enum(["delete", "updateDifficulty", "updateType"]),
  ids: z.array(z.string().min(1)).min(1, "At least one ID is required"),
  value: z.string().optional(), // for updateDifficulty or updateType
});

// Todo app: Rules
const createRuleSchema = z.object({
  text: z.string().min(1, "Rule text is required").max(500),
  order: z.number().int().min(0).optional().default(0),
});

const updateRuleSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  order: z.number().int().min(0).optional(),
});

const reorderRulesSchema = z.object({
  order: z.array(z.string().min(1)).min(1, "At least one rule id is required"),
});

// Todo app: Todos
const linkSchema = z.object({
  label: z.string().max(100).optional().default(""),
  url: z.string().min(1, "URL is required").max(2000),
});

const subtaskSchema = z.object({
  id: z.string().min(1),
  text: z.string().max(500).optional().default(""),
  done: z.boolean().optional().default(false),
});

const createTodoSchema = z.object({
  title: z.string().max(500).optional().default("Untitled"),
  priority: z.enum(["P1", "P2", "P3", "P4"]).optional().default("P4"),
  colorLabel: z.string().max(20).nullable().optional(),
  dueDate: z.string().max(20).nullable().optional(),
  dueTime: z.string().max(10).nullable().optional(),
  notes: z.string().max(5000).optional().default(""),
  links: z.array(linkSchema).optional().default([]),
  subtasks: z.array(subtaskSchema).optional().default([]),
  completed: z.boolean().optional().default(false),
});

const updateTodoSchema = z.object({
  title: z.string().max(500).optional(),
  priority: z.enum(["P1", "P2", "P3", "P4"]).optional(),
  colorLabel: z.string().max(20).nullable().optional(),
  dueDate: z.string().max(20).nullable().optional(),
  dueTime: z.string().max(10).nullable().optional(),
  notes: z.string().max(5000).optional(),
  links: z.array(linkSchema).optional(),
  subtasks: z.array(subtaskSchema).optional(),
  completed: z.boolean().optional(),
});

// Revision items (spaced repetition)
const revisionLinkSchema = z.object({
  label: z.string().max(200).optional().default(""),
  url: z.string().min(1).max(2000),
});

const createRevisionSchema = z.object({
  title: z.string().max(500).optional().default("Untitled"),
  notes: z.string().max(10000).optional().default(""),
  category: z.string().max(50).optional().default("Other"),
  tags: z.array(z.string().max(100)).optional().default([]),
  links: z.array(revisionLinkSchema).optional().default([]),
  nextDueAt: z.string().max(50).optional(),
  keyQuestions: z.array(z.string().max(500)).optional().default([]),
  keyPoints: z.array(z.string().max(500)).optional().default([]),
  mistakesLog: z.string().max(5000).optional().default(""),
  confidence: z.enum(["low", "medium", "high"]).optional().default("medium"),
});

const updateRevisionSchema = z.object({
  title: z.string().max(500).optional(),
  notes: z.string().max(10000).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(100)).optional(),
  links: z.array(revisionLinkSchema).optional(),
  nextDueAt: z.string().max(50).optional(),
  lastRevisedAt: z.string().max(50).optional().nullable(),
  revisionCount: z.number().int().min(0).optional(),
  keyQuestions: z.array(z.string().max(500)).optional(),
  keyPoints: z.array(z.string().max(500)).optional(),
  mistakesLog: z.string().max(5000).optional(),
  confidence: z.enum(["low", "medium", "high"]).optional(),
});

const markRevisedSchema = z.object({
  rating: z.enum(["easy", "okay", "hard"]),
});

const snoozeRevisionSchema = z.object({
  option: z.enum(["1d", "3d", "7d"]),
});

module.exports = {
  createLanguageSchema,
  updateLanguageSchema,
  createTopicSchema,
  updateTopicSchema,
  createSubtopicSchema,
  updateSubtopicSchema,
  createQuestionSchema,
  updateQuestionSchema,
  bulkOperationSchema,
  createRuleSchema,
  updateRuleSchema,
  reorderRulesSchema,
  createTodoSchema,
  updateTodoSchema,
  createRevisionSchema,
  updateRevisionSchema,
  markRevisedSchema,
  snoozeRevisionSchema,
};
