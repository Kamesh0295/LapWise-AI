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
import PriceComparison from '../pages/PriceComparison';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public Guest-Accessible Routes */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/home"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/login"
        element={
          <MainLayout>
            <Login />
          </MainLayout>
        }
      />
      <Route
        path="/signin"
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
        path="/signup"
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

      {/* 2. Protected Client Routes (Guest redirect to /login?redirect=...) */}
      <Route
        path="/wizard"
        element={
          <PrivateRoute>
            <MainLayout>
              <RecommendationWizard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/choose-help"
        element={
          <PrivateRoute>
            <MainLayout>
              <RecommendationWizard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/recommend"
        element={
          <PrivateRoute>
            <MainLayout>
              <RecommendationWizard />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/results"
        element={
          <PrivateRoute>
            <MainLayout>
              <RecommendationResult />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/recommendations"
        element={
          <PrivateRoute>
            <MainLayout>
              <RecommendationResult />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/search"
        element={
          <PrivateRoute>
            <MainLayout>
              <Search />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/browse"
        element={
          <PrivateRoute>
            <MainLayout>
              <Search />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/catalog"
        element={
          <PrivateRoute>
            <MainLayout>
              <Search />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/laptops"
        element={
          <PrivateRoute>
            <MainLayout>
              <Search />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* PAGE 1: Laptop Specifications Page */}
      <Route
        path="/laptop/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <LaptopDetails />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/laptops/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <LaptopDetails />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/details/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <LaptopDetails />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* PAGE 2: Price & Availability Page */}
      <Route
        path="/laptop/:id/prices"
        element={
          <PrivateRoute>
            <MainLayout>
              <PriceComparison />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/prices/:laptopId"
        element={
          <PrivateRoute>
            <MainLayout>
              <PriceComparison />
            </MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/product/:id"
        element={
          <PrivateRoute>
            <MainLayout>
              <PriceComparison />
            </MainLayout>
          </PrivateRoute>
        }
      />

      {/* Protected Compare & Wishlist */}
      <Route
        path="/compare"
        element={
          <PrivateRoute>
            <MainLayout>
              <Compare />
            </MainLayout>
          </PrivateRoute>
        }
      />
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
        path="/favorites"
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
        path="/settings"
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

      {/* 3. Administrative Console Routes */}
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
        path="/admin/*"
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
