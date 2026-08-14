import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import { PrivateRoute, AdminRoute } from './PrivateRoute';

// Import Pages
import Home from '../pages/Home';
import RecommendationWizard from '../pages/RecommendationWizard';
import RecommendationResult from '../pages/RecommendationResult';
import LaptopDetails from '../pages/LaptopDetails';
import Compare from '../pages/Compare';
import Wishlist from '../pages/Wishlist';
import Search from '../pages/Search';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Dashboard from '../pages/Dashboard';
import Admin from '../pages/Admin';
import VerifyEmail from '../pages/VerifyEmail';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public & Client routes wrapped inside MainLayout */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/wizard"
        element={
          <MainLayout>
            <RecommendationWizard />
          </MainLayout>
        }
      />
      <Route
        path="/results"
        element={
          <MainLayout>
            <RecommendationResult />
          </MainLayout>
        }
      />
      <Route
        path="/laptops/:id"
        element={
          <MainLayout>
            <LaptopDetails />
          </MainLayout>
        }
      />
      <Route
        path="/compare"
        element={
          <MainLayout>
            <Compare />
          </MainLayout>
        }
      />
      <Route
        path="/search"
        element={
          <MainLayout>
            <Search />
          </MainLayout>
        }
      />
      
      {/* Authentication views */}
      <Route
        path="/login"
        element={
          <MainLayout>
            <Login />
          </MainLayout>
        }
      />
      <Route
        path="/register"
        element={
          <MainLayout>
            <Register />
          </MainLayout>
        }
      />
      <Route
        path="/verify-email"
        element={
          <MainLayout>
            <VerifyEmail />
          </MainLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <MainLayout>
            <ForgotPassword />
          </MainLayout>
        }
      />
      <Route
        path="/reset-password"
        element={
          <MainLayout>
            <ResetPassword />
          </MainLayout>
        }
      />

      {/* 2. Protected Client routes wrapped inside MainLayout */}
      <Route
        path="/wishlist"
        element={
          <PrivateRoute>
            <MainLayout>
              <Wishlist />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* 3. Administrative Console routes wrapped inside AdminLayout */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout>
              <Admin />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/laptops"
        element={
          <AdminRoute>
            <AdminLayout>
              <Admin />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminLayout>
              <Admin />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <AdminLayout>
              <Admin />
            </AdminLayout>
          </AdminRoute>
        }
      />

      {/* 4. Catch-all fallback 404 Route */}
      <Route
        path="*"
        element={
          <MainLayout>
            <NotFound />
          </MainLayout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
