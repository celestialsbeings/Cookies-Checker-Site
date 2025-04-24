import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import AdminLayout from '../components/Admin/AdminLayout';
import Dashboard from '../components/Admin/Dashboard';
import CookieManager from '../components/Admin/CookieManager';
import SystemStatus from '../components/Admin/SystemStatus';
import Settings from '../components/Admin/Settings';
import Login from '../components/Admin/Login';
import ProtectedRoute from '../components/Admin/ProtectedRoute';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Login route */}
      <Route path="login" element={<Login />} />

      {/* Redirect empty path to dashboard */}
      <Route path="" element={<Navigate to="/admin/" replace />} />

      {/* Protected admin routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="cookies" element={<CookieManager />} />
        <Route path="status" element={<SystemStatus />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
