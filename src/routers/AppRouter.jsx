import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User routes */}

        <Route
          path="/"
          element={
            <UserLayout>
              <Home />
            </UserLayout>
          }
        />
        <Route
          path="/booking"
          element={
            <UserLayout>
              <Booking />
            </UserLayout>
          }
        />
        <Route
          path="/history"
          element={
            <UserLayout>
              <History />
            </UserLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <UserLayout>
              <Notifications />
            </UserLayout>
          }
        />

        {/* Manager routes */}
        <Route
          path="/manager/dashboard"
          element={
            <ManagerLayout>
              <ManagerDashboard />
            </ManagerLayout>
          }
        />
        <Route
          path="/manager/fields"
          element={
            <ManagerLayout>
              <Fields />
            </ManagerLayout>
          }
        />
        <Route
          path="/manager/customers"
          element={
            <ManagerLayout>
              <Customers />
            </ManagerLayout>
          }
        />
        <Route
          path="/manager/checkin-checkout"
          element={
            <ManagerLayout>
              <CheckinCheckout />
            </ManagerLayout>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/reports"
          element={
            <AdminLayout>
              <AdminReports />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/manage-staff"
          element={
            <AdminLayout>
              <ManageStaff />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/pricing"
          element={
            <AdminLayout>
              <Pricing />
            </AdminLayout>
          }
        />

        {/* Fallback: redirect unknown route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
