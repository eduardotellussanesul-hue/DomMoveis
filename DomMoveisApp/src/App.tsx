import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { NavBar } from './components/common/NavBar';

import { Home } from './pages/Home';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductsPage } from './pages/ProductsPage';
import { CreateCategoryPage } from './pages/CreateCategoryPage';
import { EditCategoryPage } from './pages/EditCategoryPage'; 
import { CreateProductPage } from './pages/CreateProductPage';
import { EditProductPage } from './pages/EditProductPage';

function AppContent() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      {/* NavBar só aparece se o usuário estiver logado */}
      {user && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rotas protegidas (exigem login) */}
        <Route path="/categories" element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        } />
        <Route path="/categories/new" element={
          <ProtectedRoute>
            <CreateCategoryPage />
          </ProtectedRoute>
        } />
        <Route path="/categories/edit/:id" element={
          <ProtectedRoute>
            <EditCategoryPage />
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute>
            <ProductsPage />
          </ProtectedRoute>
        } />
        <Route path="/products/new" element={
          <ProtectedRoute>
            <CreateProductPage />
          </ProtectedRoute>
        } />
        <Route path="/products/edit/:id" element={
          <ProtectedRoute>
            <EditProductPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;