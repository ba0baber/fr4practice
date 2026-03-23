import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import AdminUsersPage from './pages/AdminUsersPage/AdminUsersPage';
import './App.css';

const PrivateRoute = ({ children, allowedRoles = ['user', 'seller', 'admin'] }) => {
  const token = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <ProductsPage />
          </PrivateRoute>
        } />
        <Route path="/product/:id" element={
          <PrivateRoute>
            <ProductDetailPage />
          </PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminUsersPage />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;