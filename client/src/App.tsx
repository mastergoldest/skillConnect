import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/StudentDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Services from "./pages/services/Services";
import ServiceDetails from "./pages/services/ServiceDetails";
import MyRequests from "./pages/requests/MyRequests";
import IncomingRequests from "./pages/requests/IncomingRequests";
import MyConnections from "./pages/requests/MyConnections";
import ConnectionWorkspace from "./pages/requests/ConnectionWorkspace";
import MyServices from "./pages/services/MyServices";
import MyProfile from "./pages/profile/MyProfile";
import DashboardLayout from "./components/DashboardLayout";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetails />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* STUDENT DASHBOARD LAYOUT */}
        <Route
          element={
            <ProtectedRoute allowedAccountTypes={["student"]}>
              <DashboardLayout role="student" />
            </ProtectedRoute>
          }
        >
          <Route
            path="/student/dashboard"
            element={<StudentDashboard />}
          />

          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/incoming-requests" element={<IncomingRequests />} />
          <Route path="/my-connections" element={<MyConnections />} />
          <Route path="/my-services" element={<MyServices />} />
          <Route path="/my-profile" element={<MyProfile />} />

          <Route
            path="/connections/:connectionId"
            element={<ConnectionWorkspace />}
          />
        </Route>

        {/* ADMIN DASHBOARD LAYOUT */}
        <Route
          element={
            <ProtectedRoute allowedAccountTypes={["admin"]}>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;