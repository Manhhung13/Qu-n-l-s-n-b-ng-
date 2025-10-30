import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
// Auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// User pages
import Booking from "../pages/user/Booking";
import History from "../pages/user/History";
import Notifications from "../pages/user/Notifications";
// ĐÃ BỎ: import UserDashboard from "../pages/user/Dashboard";
import Home from "../pages/user/Home";
// Manager pages
import ManagerDashboard from "../pages/manager/Dashboard";
import Fields from "../pages/manager/Fields";
import Customers from "../pages/manager/Customers";
import CheckinCheckout from "../pages/manager/CheckinCheckout";

// Admin pages
import AdminReports from "../pages/admin/Reports";
import ManageStaff from "../pages/admin/ManageStaff";
import Pricing from "../pages/admin/Pricing";

// Layouts
import UserLayout from "../layouts/UserLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import AdminLayout from "../layouts/AdminLayout";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User routes */}

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <UserLayout>
                <Home />
              </UserLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <PrivateRoute>
              <UserLayout>
                <Booking />
              </UserLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <UserLayout>
                <History />
              </UserLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <UserLayout>
                <Notifications />
              </UserLayout>
            </PrivateRoute>
          }
        />

        {/* Manager routes */}
        <Route
          path="/manager/dashboard"
          element={
            <PrivateRoute>
              <ManagerLayout>
                <ManagerDashboard />
              </ManagerLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/fields"
          element={
            <PrivateRoute>
              <ManagerLayout>
                <Fields />
              </ManagerLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/customers"
          element={
            <PrivateRoute>
              <ManagerLayout>
                <Customers />
              </ManagerLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/manager/checkin-checkout"
          element={
            <PrivateRoute>
              <ManagerLayout>
                <CheckinCheckout />
              </ManagerLayout>
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute>
              <AdminLayout>
                <AdminReports />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/manage-staff"
          element={
            <PrivateRoute>
              <AdminLayout>
                <ManageStaff />
              </AdminLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/pricing"
          element={
            <PrivateRoute>
              <AdminLayout>
                <Pricing />
              </AdminLayout>
            </PrivateRoute>
          }
        />

        {/* Fallback: redirect unknown route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
