import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  useLanguages,
  useCreateLanguage,
  useUpdateLanguage,
  useDeleteLanguage,
  useAllTopics,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
  useAllSubtopics,
  useCreateSubtopic,
  useUpdateSubtopic,
  useDeleteSubtopic,
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useBulkQuestionAction,
  useTopics,
  useSubtopics,
} from "../hooks/useApi";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Pagination from "../components/Pagination";
import {
  Plus,
  Pencil,
  Trash2,
  Languages,
  BookText,
  Layers,
  HelpCircle,
  CheckSquare,
  Square,
} from "lucide-react";

const tabs = [
  { key: "languages", label: "Languages", icon: Languages },
  { key: "topics", label: "Topics", icon: BookText },
  { key: "subtopics", label: "Subtopics", icon: Layers },
  { key: "questions", label: "Questions", icon: HelpCircle },
];

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState("languages");

  return (
    <div className="page-container">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        Manage
      </h1>

      {/* Tabs */}
      <div
        className="flex gap-1 mb-6 p-1 rounded-lg overflow-x-auto"
        style={{
          background: "var(--color-surface-100)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap ${
              activeTab === key ? "" : ""
            }`}
            style={
              activeTab === key
                ? {
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    boxShadow: "var(--shadow-sm)",
                  }
                : { color: "var(--text-secondary)" }
            }
            onClick={() => setActiveTab(key)}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "languages" && <LanguagesTab />}
          {activeTab === "topics" && <TopicsTab />}
          {activeTab === "subtopics" && <SubtopicsTab />}
          {activeTab === "questions" && <QuestionsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LANGUAGES TAB
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function LanguagesTab() {
  const { data, isLoading } = useLanguages();
  const languages = data?.data || [];
  const createMut = useCreateLanguage();
  const updateMut = useUpdateLanguage();
  const deleteMut = useDeleteLanguage();

  const [modal, setModal] = useState({ open: false, item: null });
  const [confirm, setConfirm] = useState({ open: false, item: null });
  const [form, setForm] = useState({ name: "", description: "" });

  const openCreate = () => {
    setForm({ name: "", description: "" });
    setModal({ open: true, item: null });
  };
  const openEdit = (item) => {
    setForm({ name: item.name, description: item.description || "" });
    setModal({ open: true, item });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.item) {
        await updateMut.mutateAsync({ id: modal.item._id, data: form });
        toast.success("Language updated");
      } else {
        await createMut.mutateAsync(form);
        toast.success("Language created");
      }
      setModal({ open: false, item: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteMut.mutateAsync({ id: item._id, cascade: true });
      toast.success("Language deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Languages
        </h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          <Plus size={16} /> New Language
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Questions</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5}>
                  <div className="skeleton h-6 w-full" />
                </td>
              </tr>
            ) : languages.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  No languages yet
                </td>
              </tr>
            ) : (
              languages.map((lang) => (
                <tr key={lang._id}>
                  <td className="font-medium">{lang.name}</td>
                  <td>
                    <code
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {lang.slug}
                    </code>
                  </td>
                  <td
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {lang.description || "—"}
                  </td>
                  <td>{lang.totalQuestions}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => openEdit(lang)}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setConfirm({ open: true, item: lang })}
                        title="Delete"
                        style={{ color: "var(--color-danger)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, item: null })}
        title={modal.item ? "Edit Language" : "New Language"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModal({ open: false, item: null })}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {modal.item ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, item: null })}
        onConfirm={() => handleDelete(confirm.item)}
        title="Delete Language"
        message={`This will permanently delete "${confirm.item?.name}" and all its topics, subtopics, and questions. This action cannot be undone.`}
      />
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TOPICS TAB
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function TopicsTab() {
  const { data: langData } = useLanguages();
  const languages = langData?.data || [];
  const [selectedLangId, setSelectedLangId] = useState("");

  const effectiveLangId = selectedLangId || languages[0]?._id || "";

  const { data: topicsData, isLoading } = useTopics(effectiveLangId);
  const topics = topicsData?.data || [];
  const createMut = useCreateTopic();
  const updateMut = useUpdateTopic();
  const deleteMut = useDeleteTopic();

  const [modal, setModal] = useState({ open: false, item: null });
  const [confirm, setConfirm] = useState({ open: false, item: null });
  const [form, setForm] = useState({ languageId: "", name: "", order: 0 });

  const openCreate = () => {
    setForm({ languageId: effectiveLangId, name: "", order: 0 });
    setModal({ open: true, item: null });
  };
  const openEdit = (item) => {
    setForm({
      languageId: item.languageId?._id || item.languageId,
      name: item.name,
      order: item.order || 0,
    });
    setModal({ open: true, item });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.item) {
        await updateMut.mutateAsync({
          id: modal.item._id,
          data: { name: form.name, order: form.order },
        });
        toast.success("Topic updated");
      } else {
        await createMut.mutateAsync(form);
        toast.success("Topic created");
      }
      setModal({ open: false, item: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteMut.mutateAsync({ id: item._id, cascade: true });
      toast.success("Topic deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Topics
          </h2>
          <select
            className="select"
            style={{ width: "auto" }}
            value={effectiveLangId}
            onChange={(e) => setSelectedLangId(e.target.value)}
          >
            {languages.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={openCreate}
          disabled={languages.length === 0}
        >
          <Plus size={16} /> New Topic
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Language</th>
              <th>Order</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4}>
                  <div className="skeleton h-6 w-full" />
                </td>
              </tr>
            ) : topics.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  No topics for this language
                </td>
              </tr>
            ) : (
              topics.map((t) => (
                <tr key={t._id}>
                  <td className="font-medium">{t.name}</td>
                  <td
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {t.languageId?.name || "—"}
                  </td>
                  <td>{t.order}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => openEdit(t)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setConfirm({ open: true, item: t })}
                        style={{ color: "var(--color-danger)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, item: null })}
        title={modal.item ? "Edit Topic" : "New Topic"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!modal.item && (
            <div>
              <label className="label">Language</label>
              <select
                className="select"
                value={form.languageId}
                onChange={(e) =>
                  setForm({ ...form, languageId: e.target.value })
                }
                required
              >
                {languages.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Order</label>
            <input
              type="number"
              className="input"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModal({ open: false, item: null })}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {modal.item ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, item: null })}
        onConfirm={() => handleDelete(confirm.item)}
        title="Delete Topic"
        message={`Delete "${confirm.item?.name}" and all its subtopics and questions?`}
      />
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SUBTOPICS TAB
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SubtopicsTab() {
  const { data: langData } = useLanguages();
  const languages = langData?.data || [];
  const [selectedLangId, setSelectedLangId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");

  const effectiveLangId = selectedLangId || languages[0]?._id || "";

  // Topics for the selected language
  const { data: topicsData } = useTopics(effectiveLangId);
  const topics = topicsData?.data || [];

  const effectiveTopicId = selectedTopicId || topics[0]?._id || "";

  // Subtopics for the selected topic
  const { data: subData, isLoading } = useSubtopics(effectiveTopicId);
  const subtopics = subData?.data || [];

  const createMut = useCreateSubtopic();
  const updateMut = useUpdateSubtopic();
  const deleteMut = useDeleteSubtopic();

  const [modal, setModal] = useState({ open: false, item: null });
  const [confirm, setConfirm] = useState({ open: false, item: null });
  const [form, setForm] = useState({ topicId: "", name: "", order: 0 });

  const openCreate = () => {
    setForm({ topicId: effectiveTopicId, name: "", order: 0 });
    setModal({ open: true, item: null });
  };
  const openEdit = (item) => {
    setForm({
      topicId: item.topicId?._id || item.topicId,
      name: item.name,
      order: item.order || 0,
    });
    setModal({ open: true, item });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modal.item) {
        await updateMut.mutateAsync({
          id: modal.item._id,
          data: { name: form.name, order: form.order },
        });
        toast.success("Subtopic updated");
      } else {
        await createMut.mutateAsync(form);
        toast.success("Subtopic created");
      }
      setModal({ open: false, item: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteMut.mutateAsync({ id: item._id, cascade: true });
      toast.success("Subtopic deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Subtopics
          </h2>
          <select
            className="select"
            style={{ width: "auto" }}
            value={effectiveLangId}
            onChange={(e) => {
              setSelectedLangId(e.target.value);
              setSelectedTopicId("");
            }}
          >
            {languages.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name}
              </option>
            ))}
          </select>
          {topics.length > 0 && (
            <select
              className="select"
              style={{ width: "auto" }}
              value={effectiveTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
            >
              {topics.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={openCreate}
          disabled={topics.length === 0}
        >
          <Plus size={16} /> New Subtopic
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Topic</th>
              <th>Order</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4}>
                  <div className="skeleton h-6 w-full" />
                </td>
              </tr>
            ) : subtopics.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  No subtopics for this topic
                </td>
              </tr>
            ) : (
              subtopics.map((s) => (
                <tr key={s._id}>
                  <td className="font-medium">{s.name}</td>
                  <td
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {s.topicId?.name || "—"}
                  </td>
                  <td>{s.order}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => openEdit(s)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setConfirm({ open: true, item: s })}
                        style={{ color: "var(--color-danger)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, item: null })}
        title={modal.item ? "Edit Subtopic" : "New Subtopic"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!modal.item && (
            <div>
              <label className="label">Topic</label>
              <select
                className="select"
                value={form.topicId}
                onChange={(e) => setForm({ ...form, topicId: e.target.value })}
                required
              >
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Order</label>
            <input
              type="number"
              className="input"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModal({ open: false, item: null })}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {modal.item ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, item: null })}
        onConfirm={() => handleDelete(confirm.item)}
        title="Delete Subtopic"
        message={`Delete "${confirm.item?.name}"? Question references will be cleared.`}
      />
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   QUESTIONS TAB
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function QuestionsTab() {
  const { data: langData } = useLanguages();
  const languages = langData?.data || [];

  const [selectedLangId, setSelectedLangId] = useState("");
  const [filterTopicId, setFilterTopicId] = useState("");
  const [filterSubtopicId, setFilterSubtopicId] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modal, setModal] = useState({ open: false, item: null });
  const [confirm, setConfirm] = useState({ open: false, item: null });
  const [bulkAction, setBulkAction] = useState("");

  const effectiveLangId = selectedLangId || languages[0]?._id || "";

  const { data: topicsData } = useTopics(effectiveLangId);
  const topics = topicsData?.data || [];

  // Subtopics for the filter topic dropdown
  const { data: filterSubData } = useSubtopics(filterTopicId || undefined);
  const filterSubtopics = filterSubData?.data || [];

  const { data: questionsData, isLoading } = useQuestions({
    languageId: effectiveLangId || undefined,
    topicId: filterTopicId || undefined,
    subtopicId: filterSubtopicId || undefined,
    page,
    limit: 20,
    sort: "number_asc",
  });
  const questions = questionsData?.data || [];
  const meta = questionsData?.meta;

  const createMut = useCreateQuestion();
  const updateMut = useUpdateQuestion();
  const deleteMut = useDeleteQuestion();
  const bulkMut = useBulkQuestionAction();

  // Form state
  const [form, setForm] = useState({
    languageId: "",
    topicId: "",
    subtopicId: "",
    title: "",
    questionText: "",
    answerText: "",
    difficulty: "Medium",
    type: "Theory",
    tags: "",
  });

  // Subtopics for form
  const [formTopicId, setFormTopicId] = useState("");
  const { data: formSubData } = useSubtopics(formTopicId || undefined);
  const formSubtopics = formSubData?.data || [];
  const { data: formTopicsData } = useTopics(form.languageId || undefined);
  const formTopics = formTopicsData?.data || [];

  const openCreate = () => {
    setForm({
      languageId: effectiveLangId,
      topicId: topics[0]?._id || "",
      subtopicId: "",
      title: "",
      questionText: "",
      answerText: "",
      difficulty: "Medium",
      type: "Theory",
      tags: "",
    });
    setFormTopicId(topics[0]?._id || "");
    setModal({ open: true, item: null });
  };

  const openEdit = (item) => {
    setForm({
      languageId: item.languageId?._id || item.languageId,
      topicId: item.topicId?._id || item.topicId || "",
      subtopicId: item.subtopicId?._id || item.subtopicId || "",
      title: item.title,
      questionText: item.questionText,
      answerText: item.answerText || "",
      difficulty: item.difficulty,
      type: item.type,
      tags: (item.tags || []).join(", "),
    });
    setFormTopicId(item.topicId?._id || item.topicId || "");
    setModal({ open: true, item });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      subtopicId: form.subtopicId || null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (modal.item) {
        const { languageId, ...updateData } = payload;
        await updateMut.mutateAsync({ id: modal.item._id, data: updateData });
        toast.success("Question updated");
      } else {
        await createMut.mutateAsync(payload);
        toast.success("Question created");
      }
      setModal({ open: false, item: null });
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (item) => {
    try {
      await deleteMut.mutateAsync(item._id);
      toast.success("Question deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === questions.length ? [] : questions.map((q) => q._id),
    );
  };

  const handleBulk = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    try {
      if (bulkAction === "delete") {
        await bulkMut.mutateAsync({ action: "delete", ids: selectedIds });
        toast.success(`Deleted ${selectedIds.length} questions`);
      } else if (bulkAction.startsWith("difficulty:")) {
        const val = bulkAction.split(":")[1];
        await bulkMut.mutateAsync({
          action: "updateDifficulty",
          ids: selectedIds,
          value: val,
        });
        toast.success(`Updated difficulty to ${val}`);
      } else if (bulkAction.startsWith("type:")) {
        const val = bulkAction.split(":")[1];
        await bulkMut.mutateAsync({
          action: "updateType",
          ids: selectedIds,
          value: val,
        });
        toast.success(`Updated type to ${val}`);
      }
      setSelectedIds([]);
      setBulkAction("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk action failed");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Questions
          </h2>
          <select
            className="select"
            style={{ width: "auto" }}
            value={effectiveLangId}
            onChange={(e) => {
              setSelectedLangId(e.target.value);
              setFilterTopicId("");
              setFilterSubtopicId("");
              setPage(1);
              setSelectedIds([]);
            }}
          >
            {languages.map((l) => (
              <option key={l._id} value={l._id}>
                {l.name}
              </option>
            ))}
          </select>
          {topics.length > 0 && (
            <select
              className="select"
              style={{ width: "auto" }}
              value={filterTopicId}
              onChange={(e) => {
                setFilterTopicId(e.target.value);
                setFilterSubtopicId("");
                setPage(1);
                setSelectedIds([]);
              }}
            >
              <option value="">All Topics</option>
              {topics.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          {filterTopicId && filterSubtopics.length > 0 && (
            <select
              className="select"
              style={{ width: "auto" }}
              value={filterSubtopicId}
              onChange={(e) => {
                setFilterSubtopicId(e.target.value);
                setPage(1);
                setSelectedIds([]);
              }}
            >
              <option value="">All Subtopics</option>
              {filterSubtopics.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={openCreate}
          disabled={languages.length === 0}
        >
          <Plus size={16} /> New Question
        </button>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-3 mb-4 flex items-center gap-3 flex-wrap"
          style={{
            background: "var(--color-primary-50)",
            border: "1px solid var(--color-primary-200)",
          }}
        >
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-primary-700)" }}
          >
            {selectedIds.length} selected
          </span>
          <select
            className="select"
            style={{ width: "auto", maxWidth: 200 }}
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
            <option value="">Choose action...</option>
            <option value="delete">Delete selected</option>
            <option value="difficulty:Easy">Set Easy</option>
            <option value="difficulty:Medium">Set Medium</option>
            <option value="difficulty:Hard">Set Hard</option>
            <option value="type:Theory">Set Theory</option>
            <option value="type:Practical">Set Practical</option>
            <option value="type:Both">Set Both</option>
          </select>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleBulk}
            disabled={!bulkAction || bulkMut.isPending}
          >
            Apply
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSelectedIds([])}
          >
            Clear
          </button>
        </motion.div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <button onClick={toggleAll} className="flex items-center">
                  {selectedIds.length === questions.length &&
                  questions.length > 0 ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th style={{ width: 60 }}>Q#</th>
              <th>Title</th>
              <th>Topic</th>
              <th>Difficulty</th>
              <th>Type</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7}>
                  <div className="skeleton h-6 w-full" />
                </td>
              </tr>
            ) : questions.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  No questions yet
                </td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q._id}>
                  <td>
                    <button
                      onClick={() => toggleSelect(q._id)}
                      className="flex items-center"
                    >
                      {selectedIds.includes(q._id) ? (
                        <CheckSquare
                          size={16}
                          style={{ color: "var(--accent)" }}
                        />
                      ) : (
                        <Square
                          size={16}
                          style={{ color: "var(--text-muted)" }}
                        />
                      )}
                    </button>
                  </td>
                  <td className="font-bold" style={{ color: "var(--accent)" }}>
                    Q{q.questionNumber}
                  </td>
                  <td className="font-medium">{q.title}</td>
                  <td
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {q.topicId?.name || "—"}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${q.difficulty.toLowerCase()}`}
                    >
                      {q.difficulty}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${q.type.toLowerCase()}`}>
                      {q.type}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => openEdit(q)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => setConfirm({ open: true, item: q })}
                        style={{ color: "var(--color-danger)" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination meta={meta} onPageChange={setPage} />

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, item: null })}
        title={modal.item ? "Edit Question" : "New Question"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!modal.item && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Language</label>
                <select
                  className="select"
                  value={form.languageId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      languageId: e.target.value,
                      topicId: "",
                      subtopicId: "",
                    })
                  }
                  required
                >
                  {languages.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Topic</label>
                <select
                  className="select"
                  value={form.topicId}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      topicId: e.target.value,
                      subtopicId: "",
                    });
                    setFormTopicId(e.target.value);
                  }}
                  required
                >
                  <option value="">Select topic</option>
                  {formTopics.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {modal.item && (
            <div>
              <label className="label">Topic</label>
              <select
                className="select"
                value={form.topicId}
                onChange={(e) => {
                  setForm({ ...form, topicId: e.target.value, subtopicId: "" });
                  setFormTopicId(e.target.value);
                }}
                required
              >
                <option value="">Select topic</option>
                {formTopics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {formSubtopics.length > 0 && (
            <div>
              <label className="label">Subtopic (optional)</label>
              <select
                className="select"
                value={form.subtopicId}
                onChange={(e) =>
                  setForm({ ...form, subtopicId: e.target.value })
                }
              >
                <option value="">None</option>
                {formSubtopics.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Question Text</label>
            <textarea
              className="input"
              value={form.questionText}
              onChange={(e) =>
                setForm({ ...form, questionText: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="label">Answer Text (optional)</label>
            <textarea
              className="input"
              value={form.answerText}
              onChange={(e) => setForm({ ...form, answerText: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Difficulty</label>
              <select
                className="select"
                value={form.difficulty}
                onChange={(e) =>
                  setForm({ ...form, difficulty: e.target.value })
                }
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select
                className="select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option>Theory</option>
                <option>Practical</option>
                <option>Both</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input
              className="input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="e.g. async, promises, error-handling"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModal({ open: false, item: null })}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMut.isPending || updateMut.isPending}
            >
              {modal.item ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, item: null })}
        onConfirm={() => handleDelete(confirm.item)}
        title="Delete Question"
        message={`Delete Q${confirm.item?.questionNumber}: "${confirm.item?.title}"? This cannot be undone.`}
      />
    </>
  );
}
