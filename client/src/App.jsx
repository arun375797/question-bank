import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./hooks/useTheme";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import StudyIndexPage from "./pages/StudyIndexPage";
import LanguageQuestionsPage from "./pages/LanguageQuestionsPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import ManagePage from "./pages/ManagePage";
import OverviewPage from "./pages/OverviewPage";
import SettingsPage from "./pages/SettingsPage";
import NotebookPage from "./pages/NotebookPage";

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
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
