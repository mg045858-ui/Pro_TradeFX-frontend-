import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import { HomePage } from "./pages/HomePage/HomePage";
import { LoginPage } from "./pages/LoginPage/LoginPage";
import { RegisterPage } from "./pages/RegisterPage/RegisterPage";
import { TradingPage } from "./pages/TradingPage/TradingPage";
import { DepositPage } from "./pages/DepositPage/DepositPage";
import { AdminPage } from "./pages/AdminPage/AdminPage";

function AppRoutes() {
  const navigate = useNavigate();

  // recreate old navigation function
  const onNavigate = (page) => {
    const routes = {
      home: "/",
      login: "/login",
      register: "/register",
      trading: "/trading",
      deposit: "/deposit",
      admin: "/admin",
    };

    navigate(routes[page] || "/");
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage onNavigate={onNavigate} />} />
      <Route path="/login" element={<LoginPage onNavigate={onNavigate} />} />
      <Route path="/register" element={<RegisterPage onNavigate={onNavigate} />} />
      <Route path="/trading" element={<TradingPage onNavigate={onNavigate} />} />
      <Route path="/deposit" element={<DepositPage onNavigate={onNavigate} />} />
      <Route path="/admin" element={<AdminPage onNavigate={onNavigate} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}