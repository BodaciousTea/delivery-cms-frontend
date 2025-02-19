// src/pages/Admin/AdminLogin.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const authValue = "Basic " + btoa(`${username}:${password}`);
    try {
      const response = await fetch("https://api.tedkoller.com/admin/users", {
        headers: { "Content-Type": "application/json", Authorization: authValue },
      });
      if (response.ok) {
        sessionStorage.setItem("isAdmin", "true");
        sessionStorage.setItem("adminAuth", authValue);
        sessionStorage.setItem("adminLoginTime", Date.now().toString());
        navigate("/admin");
      } else {
        setLoginError("Invalid credentials");
      }
    } catch (err: any) {
      setLoginError(err.message || "Error logging in");
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-header">Admin Login</h1>
      <form onSubmit={handleLogin} className="section">
        <input
          type="text"
          placeholder="Admin Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
        <button type="submit" className="button">Log In</button>
      </form>
      {loginError && <p className="message-error">{loginError}</p>}
    </div>
  );
};

export default AdminLogin;
