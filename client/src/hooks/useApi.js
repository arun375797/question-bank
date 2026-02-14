import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  languagesApi,
  topicsApi,
  subtopicsApi,
  questionsApi,
} from "../api/client";

// ─── Languages ───
export function useLanguages() {
  return useQuery({ queryKey: ["languages"], queryFn: languagesApi.getAll });
}

export function useCreateLanguage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: languagesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["languages"] }),
  });
}

export function useUpdateLanguage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => languagesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["languages"] }),
  });
}

export function useDeleteLanguage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cascade }) => languagesApi.delete(id, cascade),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["languages"] }),
  });
}

// ─── Topics ───
export function useTopics(languageId) {
  return useQuery({
    queryKey: ["topics", languageId],
    queryFn: () => topicsApi.getAll(languageId),
    enabled: !!languageId,
  });
}

export function useAllTopics() {
  return useQuery({
    queryKey: ["topics", "all"],
    queryFn: () => topicsApi.getAll(),
  });
}

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: topicsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

export function useUpdateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => topicsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cascade }) => topicsApi.delete(id, cascade),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

// ─── Subtopics ───
export function useSubtopics(topicId) {
  return useQuery({
    queryKey: ["subtopics", topicId],
    queryFn: () => subtopicsApi.getAll(topicId),
    enabled: !!topicId,
  });
}

export function useAllSubtopics() {
  return useQuery({
    queryKey: ["subtopics", "all"],
    queryFn: () => subtopicsApi.getAll(),
  });
}

export function useCreateSubtopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: subtopicsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subtopics"] }),
  });
}

export function useUpdateSubtopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => subtopicsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subtopics"] }),
  });
}

export function useDeleteSubtopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cascade }) => subtopicsApi.delete(id, cascade),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subtopics"] }),
  });
}

// ─── Questions ───
export function useQuestions(params) {
  return useQuery({
    queryKey: ["questions", params],
    queryFn: () => questionsApi.getAll(params),
    keepPreviousData: true,
  });
}

export function useQuestion(id) {
  return useQuery({
    queryKey: ["question", id],
    queryFn: () => questionsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: questionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["languages"] });
    },
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => questionsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["question", id] });
      qc.invalidateQueries({ queryKey: ["languages"] });
    },
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: questionsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["languages"] });
    },
  });
}

export function useBulkQuestionAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: questionsApi.bulk,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["languages"] });
    },
  });
}
