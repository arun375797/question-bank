import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguages, useAllTopics, useAllSubtopics } from "../hooks/useApi";
import {
  ChevronRight,
  ChevronDown,
  Layers,
  FolderOpen,
  FileText,
  Search,
  BarChart3,
} from "lucide-react";

export default function OverviewPage() {
  const { data: langData, isLoading: langLoading } = useLanguages();
  const { data: topicsData, isLoading: topicsLoading } = useAllTopics();
  const { data: subData, isLoading: subLoading } = useAllSubtopics();

  const languages = langData?.data || [];
  const allTopics = topicsData?.data || [];
  const allSubtopics = subData?.data || [];

  const [expandedLangs, setExpandedLangs] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = langLoading || topicsLoading || subLoading;

  // Build hierarchical tree
  const tree = useMemo(() => {
    return languages.map((lang) => {
      const langTopics = allTopics.filter((t) => {
        const tid = t.languageId?._id || t.languageId;
        return tid === lang._id;
      });

      const topicsWithSubs = langTopics.map((topic) => {
        const subs = allSubtopics.filter((s) => {
          const sid = s.topicId?._id || s.topicId;
          return sid === topic._id;
        });
        return { ...topic, subtopics: subs };
      });

      return {
        ...lang,
        topics: topicsWithSubs,
        topicCount: topicsWithSubs.length,
        subtopicCount: topicsWithSubs.reduce(
          (acc, t) => acc + t.subtopics.length,
          0,
        ),
      };
    });
  }, [languages, allTopics, allSubtopics]);

  // Filter tree by search
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;
    const q = searchQuery.toLowerCase();
    return tree
      .map((lang) => {
        const langMatch = lang.name.toLowerCase().includes(q);
        const filteredTopics = lang.topics
          .map((topic) => {
            const topicMatch = topic.name.toLowerCase().includes(q);
            const filteredSubs = topic.subtopics.filter((s) =>
              s.name.toLowerCase().includes(q),
            );
            if (topicMatch || filteredSubs.length > 0) {
              return {
                ...topic,
                subtopics: topicMatch ? topic.subtopics : filteredSubs,
              };
            }
            return null;
          })
          .filter(Boolean);

        if (langMatch || filteredTopics.length > 0) {
          return {
            ...lang,
            topics: langMatch ? lang.topics : filteredTopics,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [tree, searchQuery]);

  const toggleLang = (id) =>
    setExpandedLangs((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleTopic = (id) =>
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));

  const expandAll = () => {
    const langs = {};
    const topics = {};
    filteredTree.forEach((l) => {
      langs[l._id] = true;
      l.topics.forEach((t) => {
        topics[t._id] = true;
      });
    });
    setExpandedLangs(langs);
    setExpandedTopics(topics);
  };

  const collapseAll = () => {
    setExpandedLangs({});
    setExpandedTopics({});
  };

  // Stats
  const totalTopics = tree.reduce((a, l) => a + l.topicCount, 0);
  const totalSubtopics = tree.reduce((a, l) => a + l.subtopicCount, 0);
  const totalQuestions = languages.reduce(
    (a, l) => a + (l.totalQuestions || 0),
    0,
  );

  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
          <div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Overview
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Complete hierarchy of your question bank
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 mt-5">
          {[
            {
              label: "Languages",
              value: languages.length,
              color: "var(--accent)",
            },
            { label: "Topics", value: totalTopics, color: "#38bdf8" },
            { label: "Subtopics", value: totalSubtopics, color: "#34d399" },
            { label: "Questions", value: totalQuestions, color: "#f59e0b" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card p-4"
              style={{ borderLeft: `3px solid ${stat.color}` }}
            >
              <p
                className="text-xs font-medium uppercase tracking-wider mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </p>
              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                {isLoading ? "—" : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Search + Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
          <div className="relative flex-1" style={{ minWidth: 0 }}>
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search languages, topics, subtopics..."
              className="input pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="btn btn-secondary btn-sm flex-1 sm:flex-initial"
              onClick={expandAll}
            >
              Expand All
            </button>
            <button
              className="btn btn-secondary btn-sm flex-1 sm:flex-initial"
              onClick={collapseAll}
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Tree View */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5">
                <div className="skeleton h-5 w-40 mb-3" />
                <div className="skeleton h-4 w-60 mb-2" />
                <div className="skeleton h-4 w-48" />
              </div>
            ))}
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="text-center py-16">
            <Layers
              size={40}
              className="mx-auto mb-3"
              style={{ color: "var(--text-muted)" }}
            />
            <h3
              className="text-lg font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              {searchQuery ? "No matches found" : "No data yet"}
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>
              {searchQuery
                ? "Try a different search term"
                : "Add languages, topics, and subtopics from the Manage page"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTree.map((lang, langIdx) => (
              <motion.div
                key={lang._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: langIdx * 0.05 }}
                className="card overflow-hidden"
              >
                {/* Language Row */}
                <button
                  onClick={() => toggleLang(lang._id)}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-4 text-left transition-colors"
                  style={{
                    background: expandedLangs[lang._id]
                      ? "var(--bg-elevated)"
                      : "transparent",
                  }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                    style={{ background: "var(--accent-soft)" }}
                  >
                    <Layers size={16} style={{ color: "var(--accent)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-base"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {lang.name}
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {lang.topicCount} topic{lang.topicCount !== 1 ? "s" : ""}
                      {" · "}
                      {lang.subtopicCount} subtopic
                      {lang.subtopicCount !== 1 ? "s" : ""}
                      {" · "}
                      {lang.totalQuestions || 0} question
                      {(lang.totalQuestions || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedLangs[lang._id] ? 90 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronRight
                      size={18}
                      style={{ color: "var(--text-muted)" }}
                    />
                  </motion.div>
                </button>

                {/* Topics */}
                <AnimatePresence>
                  {expandedLangs[lang._id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ borderTop: "1px solid var(--border)" }}>
                        {lang.topics.length === 0 ? (
                          <div
                            className="px-5 py-4 text-sm italic"
                            style={{ color: "var(--text-muted)" }}
                          >
                            No topics added yet
                          </div>
                        ) : (
                          lang.topics.map((topic, topicIdx) => (
                            <div key={topic._id}>
                              {/* Topic Row */}
                              <button
                                onClick={() => toggleTopic(topic._id)}
                                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 text-left transition-colors"
                                style={{
                                  paddingLeft: "1.5rem",
                                  borderTop:
                                    topicIdx > 0
                                      ? "1px solid var(--border)"
                                      : "none",
                                  background: expandedTopics[topic._id]
                                    ? "var(--bg-elevated)"
                                    : "transparent",
                                }}
                              >
                                <div
                                  className="flex items-center justify-center w-6 h-6 rounded-md shrink-0"
                                  style={{
                                    background: "rgba(56, 189, 248, 0.12)",
                                  }}
                                >
                                  <FolderOpen
                                    size={13}
                                    style={{ color: "#38bdf8" }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span
                                    className="text-sm font-medium"
                                    style={{
                                      color: "var(--text-primary)",
                                    }}
                                  >
                                    {topic.name}
                                  </span>
                                  {topic.subtopics.length > 0 && (
                                    <span
                                      className="text-xs ml-2"
                                      style={{
                                        color: "var(--text-muted)",
                                      }}
                                    >
                                      ({topic.subtopics.length} subtopic
                                      {topic.subtopics.length !== 1 ? "s" : ""})
                                    </span>
                                  )}
                                </div>
                                {topic.subtopics.length > 0 && (
                                  <motion.div
                                    animate={{
                                      rotate: expandedTopics[topic._id]
                                        ? 90
                                        : 0,
                                    }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <ChevronRight
                                      size={14}
                                      style={{
                                        color: "var(--text-muted)",
                                      }}
                                    />
                                  </motion.div>
                                )}
                              </button>

                              {/* Subtopics */}
                              <AnimatePresence>
                                {expandedTopics[topic._id] &&
                                  topic.subtopics.length > 0 && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{
                                        height: "auto",
                                        opacity: 1,
                                      }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      style={{ overflow: "hidden" }}
                                    >
                                      {topic.subtopics.map((sub, subIdx) => (
                                        <div
                                          key={sub._id}
                                          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5"
                                          style={{
                                            paddingLeft: "3rem",
                                            borderTop:
                                              "1px solid var(--border)",
                                            background:
                                              "rgba(52, 211, 153, 0.03)",
                                          }}
                                        >
                                          <div
                                            className="flex items-center justify-center w-5 h-5 rounded shrink-0"
                                            style={{
                                              background:
                                                "rgba(52, 211, 153, 0.12)",
                                            }}
                                          >
                                            <FileText
                                              size={11}
                                              style={{
                                                color: "#34d399",
                                              }}
                                            />
                                          </div>
                                          <span
                                            className="text-sm"
                                            style={{
                                              color: "var(--text-secondary)",
                                            }}
                                          >
                                            {sub.name}
                                          </span>
                                        </div>
                                      ))}
                                    </motion.div>
                                  )}
                              </AnimatePresence>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
