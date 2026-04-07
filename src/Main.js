import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/DashboardSection/Dashboard";
// import Templates from "./components/DashboardSection/Templates/index";
import PrivateRoute from "./components/Utils/PrivateRoute/Privateroute";
import { useAuth } from "./components/ComponentsCss/Authentication/authentication";
import Global_request_template from "./components/DashboardSection/Global_request_template/Global_request_template";
import ResetPassword from "./components/ResetPassword/ResetPassword";
import FirstTimeLogin from "../src/components/Login/FirstTimeLogin";
import PrivacyPolicy from "./components/DashboardSection/PrivacyPolicy/PrivacyPolicy";
export default function Main() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/:id" // Dynamic route for the ID
        element={<Global_request_template />}
      />
      <Route path="/privacy_policy" element={<PrivacyPolicy />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login" element={<Login />} />
      <Route path="/first-time-login" element={<FirstTimeLogin />} />
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      >
        {/* <Route path="/profile" element={<ProfileComponent />} /> */}

        {/* <Route index element={<h2>Dashboard Overview</h2>} />
        <Route path="attendance" element={<h2>Attendance Page</h2>} 
        <Route path="Attendance Dashboard" element={<AttendanceDashboard/>} />
        <Route path="users" element={<h2>Users Page</h2>} />
        <Route path="reports" element={<RequestCard/>} /> */}
        {/* <Route path="templates" element={<h2>Templates Page</h2>} />
        <Route path="request" element={<h2>Request Page</h2>} /> */}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
