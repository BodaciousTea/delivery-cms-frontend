// src/pages/Admin/AdminDashboard.tsx
"use client"
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Admin.css"

const SESSION_DURATION = 3600000

const AdminDashboard: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [newUserEmail, setNewUserEmail] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadResult, setUploadResult] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [userFiles, setUserFiles] = useState<any[]>([])
  const [createUserResult, setCreateUserResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("files")
  const [error, setError] = useState("")
  const navigate = useNavigate()

const getAdminHeaders = () => {
  const adminAuth = sessionStorage.getItem("adminAuth");
  return {
    "Content-Type": "application/json",
    ...(adminAuth ? { Authorization: adminAuth } : {}),
  };
};


  const fetchUsers = async () => {
    try {
      const response = await fetch("https://api.tedkoller.com/admin/users", {
        headers: getAdminHeaders(),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Error fetching users")
      } else {
        setUsers(data.users)
        setError("")
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  const fetchUserFiles = async (clientId: string) => {
    try {
      const response = await fetch(`https://api.tedkoller.com/admin/files?clientId=${clientId}`, {
        headers: getAdminHeaders(),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Error fetching files")
      } else {
        setUserFiles(data.files)
        setError("")
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchUsers()
    const storedLoginTime = sessionStorage.getItem("adminLoginTime")
    if (storedLoginTime) {
      const loginTime = Number.parseInt(storedLoginTime, 10)
      if (Date.now() - loginTime > SESSION_DURATION) {
        alert("Your session has expired. Please log in again.")
        handleLogout()
      }
    }
  }, [])

  useEffect(() => {
    if (selectedUser) {
      const clientId = selectedUser.Attributes.find((attr: any) => attr.Name === "custom:clientId")?.Value
      if (clientId) {
        fetchUserFiles(clientId)
      }
    }
  }, [selectedUser])

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin")
    sessionStorage.removeItem("adminAuth")
    sessionStorage.removeItem("adminLoginTime")
    navigate("/admin/login")
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("https://api.tedkoller.com/admin/create-user", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({ email: newUserEmail }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.message || "Error creating user")
        setCreateUserResult(null)
      } else {
        setCreateUserResult(data)
        setError("")
        setNewUserEmail("")
        fetchUsers()
      }
    } catch (err: any) {
      setError(err.message)
      setCreateUserResult(null)
    }
  }

  const handleDeleteUser = async (username: string) => {
    if (!window.confirm(`Are you sure you want to delete this user?`)) return
    try {
      const response = await fetch("https://api.tedkoller.com/admin/delete-user", {
        method: "DELETE",
        headers: getAdminHeaders(),
        body: JSON.stringify({ email: username }),
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.error || "Error deleting user")
      } else {
        alert("User deleted successfully")
        await fetchUsers()
        setSelectedUser(null)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure that a user is selected and a file is chosen
    if (!selectedUser || !uploadFile) {
      setUploadError("No user or file selected");
      return;
    }
    // Extract email and clientId from the selectedUser's attributes
    const adminEmail = selectedUser.Attributes.find(
      (attr: any) => attr.Name === "email"
    )?.Value;
    const clientIdValue = selectedUser.Attributes.find(
      (attr: any) => attr.Name === "custom:clientId"
    )?.Value;
    
    if (!clientIdValue) {
      setUploadError("Selected user has no clientId");
      return;
    }
    
    setUploadError("");
    setUploadResult("");
  
    try {
      // Use the extracted values in the request body
      const response = await fetch("https://api.tedkoller.com/admin/generate-upload-url", {
        method: "POST",
        headers: getAdminHeaders(),
        body: JSON.stringify({
          email: adminEmail,
          clientId: clientIdValue,
          fileName: uploadFile.name,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setUploadError(data.error || "Error generating upload URL");
        return;
      }
      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        body: uploadFile,
      });
      if (!uploadResponse.ok) {
        setUploadError("File upload failed");
        return;
      }
      setUploadResult("File uploaded successfully! S3 key: " + data.key);
      fetchUserFiles(clientIdValue);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "An error occurred during file upload");
    }
  };
  
  const handleDeleteFile = async (fileKey: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    const clientId = selectedUser.Attributes.find((attr: any) => attr.Name === "custom:clientId")?.Value;
    try {
      const response = await fetch("https://api.tedkoller.com/admin/delete-file", {
        method: "DELETE",
        headers: getAdminHeaders(),
        body: JSON.stringify({ clientId, key: fileKey }),
      });
      const data = await response.json();
      if (!response.ok) {
        setUploadError(data.error || "Error deleting file");
      } else {
        alert("File deleted successfully");
        fetchUserFiles(clientId);
      }
    } catch (err: any) {
      setUploadError(err.message);
    }
  };

  return (
    <div className="admin-container">
      <div className="header-container">
        <h1 className="admin-header">Admin Dashboard</h1>
        <button onClick={handleLogout} className="button logout-button">
          Log Out
        </button>
      </div>

      <div className="section">
        <h2>Create New User</h2>
        <form onSubmit={handleCreateUser}>
          <input
            type="email"
            placeholder="Enter new user's email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="input-field"
          />
          <button type="submit" className="button">
            Create User
          </button>
        </form>
        {error && <p className="message-error">{error}</p>}
        {createUserResult && (
          <div className="result-box">
            <p>User created successfully!</p>
            <p>Email: {createUserResult.email}</p>
            <p>Client ID: {createUserResult.clientId}</p>
            <p>Temporary Password: {createUserResult.temporaryPassword}</p>
          </div>
        )}
      </div>

      <div className="admin-content">
        <div className="section">
          <h2>User List</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Client ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.Username}
                  className={selectedUser?.Username === user.Username ? "selected" : ""}
                  onClick={() => setSelectedUser(user)}
                >
                  <td>{user.Attributes.find((attr: any) => attr.Name === "email")?.Value}</td>
                  <td>{user.Attributes.find((attr: any) => attr.Name === "custom:clientId")?.Value}</td>
                  <td>
                    <button className="button secondary">Select</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <div className="section action-panel">
            <h2>Actions for {selectedUser.Attributes.find((attr: any) => attr.Name === "email")?.Value}</h2>
            <div className="tabs">
              <div className="tab-list">
                <button
                  className={`tab ${activeTab === "files" ? "active" : ""}`}
                  onClick={() => setActiveTab("files")}
                >
                  Files
                </button>
                <button
                  className={`tab ${activeTab === "actions" ? "active" : ""}`}
                  onClick={() => setActiveTab("actions")}
                >
                  Actions
                </button>
              </div>

              <div className={`tab-content ${activeTab === "files" ? "active" : ""}`}>
                <div className="file-upload-section">
                  <form onSubmit={handleUpload}>
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                      className="input-field file-input"
                    />
                    <button type="submit" className="button">
                      Upload File
                    </button>
                  </form>
                  {uploadError && <p className="message-error">{uploadError}</p>}
                  {uploadResult && <p className="message-success">{uploadResult}</p>}
                </div>

                <div className="file-list">
                  <h3>User Files</h3>
                  {userFiles.length === 0 ? (
                    <p>No files found.</p>
                  ) : (
                    userFiles.map((file: any) => (
                      <div key={file.key} className="file-item">
                        <span>{file.name}</span>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.key)}
                          className="button danger"
                          style={{ marginLeft: "10px" }}
                        >
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={`tab-content ${activeTab === "actions" ? "active" : ""}`}>
                <button onClick={() => handleDeleteUser(selectedUser.Username)} className="button danger">
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <h2>Generate Report</h2>
        <button className="button" onClick={() => window.open("https://api.tedkoller.com/admin/report", "_blank")}>
          Download Report (CSV)
        </button>
      </div>
    </div>
  )
}

export default AdminDashboard;
