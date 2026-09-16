import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { GoldenHour } from "./pages/GoldenHour";
import { DomainSelection } from "./pages/DomainSelection";
import { Cardiology } from "./pages/Cardiology";
import { Simulation } from "./pages/Simulation";
import { PostCaseReport } from "./pages/PostCaseReport";
import { MistakeMemory } from "./pages/MistakeMemory";
import { Analytics } from "./pages/Analytics";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/golden-hour" element={<ProtectedRoute><GoldenHour /></ProtectedRoute>} />
            <Route path="/domains" element={<ProtectedRoute><DomainSelection /></ProtectedRoute>} />
            <Route path="/cardiology" element={<ProtectedRoute><Cardiology /></ProtectedRoute>} />
            <Route path="/simulation/new/:caseId" element={<ProtectedRoute><Simulation /></ProtectedRoute>} />
            <Route path="/report/:sessionId" element={<ProtectedRoute><PostCaseReport /></ProtectedRoute>} />
            <Route path="/mistakes" element={<ProtectedRoute><MistakeMemory /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
