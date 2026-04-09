import { Navigate, Route, Routes } from "react-router-dom";
import ProjectStarterPage from "./pages/ProjectStarter";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<ProjectStarterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
