import React, { useState } from "react";

const CreateUserForm: React.FC = () => {
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
    <div style={{ marginBottom: "20px" }}>
      <h2>Create User</h2>
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
        <div style={{ marginTop: "10px" }}>
          <p>User created successfully!</p>
          <p>Email: {result.email}</p>
          <p>Client ID: {result.clientId}</p>
          <p>Temporary Password: {result.temporaryPassword}</p>
        </div>
      )}
    </div>
  );
};

// Component for uploading files
const AdminUploadPanel: React.FC = () => {
  const [email, setEmail] = useState("");
  const [clientId, setClientId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !clientId || !file) {
      setError("Please provide email, client ID, and select a file.");
      return;
    }
    setError("");
    setUploadResult("");

    try {
      const response = await fetch("http://localhost:3000/admin/generate-upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          clientId,
          fileName: file.name,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error generating upload URL");
        return;
      }

      const uploadResponse = await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
      });
      if (!uploadResponse.ok) {
        setError("File upload failed");
        return;
      }

      setUploadResult("File uploaded successfully! S3 key: " + data.key);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during file upload");
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>Upload File</h2>
      <form onSubmit={handleUpload}>
        <input
          type="email"
          placeholder="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input
          type="text"
          placeholder="Client ID (e.g., client2)"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <input type="file" onChange={handleFileChange} style={{ marginRight: "10px" }} />
        <button type="submit">Upload File</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {uploadResult && <p style={{ color: "green" }}>{uploadResult}</p>}
    </div>
  );
};

const AdminUserList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState("");

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/admin/users");
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Error fetching users");
        } else {
          setUsers(data.users);
          setError("");
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>User List</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table border={1} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Client ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const emailAttr = user.Attributes.find((attr: any) => attr.Name === "email");
              const clientIdAttr = user.Attributes.find((attr: any) => attr.Name === "custom:clientId");
              return (
                <tr key={user.Username}>
                  <td>{user.Username}</td>
                  <td>{emailAttr ? emailAttr.Value : "N/A"}</td>
                  <td>{clientIdAttr ? clientIdAttr.Value : "N/A"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

const AdminDeleteUserPanel: React.FC = () => {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleDeleteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error deleting user");
      } else {
        setResult("User deleted successfully");
        setError("");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>Delete User</h2>
      <form onSubmit={handleDeleteUser}>
        <input
          type="email"
          placeholder="Enter user email to delete"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button type="submit">Delete User</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {result && <p style={{ color: "green" }}>{result}</p>}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState("create"); // "create", "upload", "list", "delete"

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <nav style={{ marginBottom: "20px" }}>
        <button onClick={() => setActiveSection("create")} style={{ marginRight: "10px" }}>
          Create User
        </button>
        <button onClick={() => setActiveSection("upload")} style={{ marginRight: "10px" }}>
          Upload File
        </button>
        <button onClick={() => setActiveSection("list")} style={{ marginRight: "10px" }}>
          User List
        </button>
        <button onClick={() => setActiveSection("delete")}>
          Delete User
        </button>
      </nav>

      {activeSection === "create" && <CreateUserForm />}
      {activeSection === "upload" && <AdminUploadPanel />}
      {activeSection === "list" && <AdminUserList />}
      {activeSection === "delete" && <AdminDeleteUserPanel />}
    </div>
  );
};

export default AdminDashboard;
