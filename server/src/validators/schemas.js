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
};
