import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./hooks/useTheme";
import { TodoProvider } from "./context/TodoContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import StudyIndexPage from "./pages/StudyIndexPage";
import LanguageQuestionsPage from "./pages/LanguageQuestionsPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import ManagePage from "./pages/ManagePage";
import OverviewPage from "./pages/OverviewPage";
import SettingsPage from "./pages/SettingsPage";
import NotebookPage from "./pages/NotebookPage";
import TodoDashboardPage from "./pages/todo/TodoDashboardPage";
import AllTodosPage from "./pages/todo/AllTodosPage";
import TodoCalendarPage from "./pages/todo/TodoCalendarPage";
import FocusTimerPage from "./pages/todo/FocusTimerPage";
import TodoSettingsPage from "./pages/todo/TodoSettingsPage";
import InstallAppPage from "./pages/todo/InstallAppPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TodoProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/study" element={<StudyIndexPage />} />
                <Route
                  path="/study/:languageId"
                  element={<LanguageQuestionsPage />}
                />
                <Route
                  path="/study/:languageId/question/:questionId"
                  element={<QuestionDetailPage />}
                />
                <Route path="/manage" element={<ManagePage />} />
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/notebook" element={<NotebookPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/todo" element={<TodoDashboardPage />} />
                <Route path="/todo/list" element={<AllTodosPage />} />
                <Route path="/todo/calendar" element={<TodoCalendarPage />} />
                <Route path="/todo/focus" element={<FocusTimerPage />} />
                <Route path="/todo/settings" element={<TodoSettingsPage />} />
                <Route path="/todo/install" element={<InstallAppPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TodoProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
