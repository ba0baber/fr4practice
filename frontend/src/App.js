import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage/ProductsPage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage';
import './App.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
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
      </Routes>
    </Router>
  );
}

export default App;