import React, { useState } from "react";

const AdminPanel: React.FC = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error creating user");
      } else {
        setResult(data);
        setError("");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Panel</h1>
      <form onSubmit={handleCreateUser}>
        <input
          type="email"
          placeholder="Enter new user's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <button type="submit">Create User</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && (
        <div style={{ marginTop: "20px" }}>
          <p>User created successfully!</p>
          <p>Email: {result.email}</p>
          <p>Client ID: {result.clientId}</p>
          <p>Temporary Password: {result.temporaryPassword}</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
