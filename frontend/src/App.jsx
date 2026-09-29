import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Stories from "./pages/Stories";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Children from "./pages/Children";
import CulturalJourney from "./pages/CulturalJourney";
import Achievements from "./pages/Achievements";
import Progress from "./pages/Progress";
import TalkToKyros from "./pages/TalkToKyros";
import AppLayout from "./components/AppLayout";

function ProtectedRoute() {
  const token = localStorage.getItem("kyros_token");

  return token ? <AppLayout /> : <Navigate to="/login" replace />;
}

function App() {
  const token = localStorage.getItem("kyros_token");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route
          path="/login"
          element={
            token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login />
            )
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/children"
            element={<Children />}
          />

          <Route
            path="/cultural-journey"
            element={<CulturalJourney />}
          />

          <Route
            path="/stories"
            element={<Stories />}
          />

          <Route
            path="/talk-to-kyros"
            element={<TalkToKyros />}
          />

          <Route
            path="/achievements"
            element={<Achievements />}
          />

          <Route
            path="/progress"
            element={<Progress />}
          />

          <Route
            path="/settings"
            element={
              <Placeholder title="Settings" />
            }
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

function Placeholder({ title }) {
  return (
    <div className="page-content">
      <p className="eyebrow">KYROS</p>
      <h1>{title}</h1>
      <p>
        This section is being connected to the KYROS backend.
      </p>
    </div>
  );
}

export default App;