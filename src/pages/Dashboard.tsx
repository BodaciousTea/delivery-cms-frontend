import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MediaGrid from "../components/MediaGrid";
import styles from "./Dashboard.module.css";

interface MediaItem {
  id: string;
  title: string;
  type: "video" | "image";
  thumbnail: string;
  project: string;
  url: string;
  clientId: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const SESSION_DURATION = 3600000; // 1 hour

  useEffect(() => {
    const token = localStorage.getItem("token");
    const loginTimeStr = localStorage.getItem("loginTime");
    if (!token || !loginTimeStr) {
      navigate("/login");
    } else {
      const loginTime = parseInt(loginTimeStr, 10);
      if (Date.now() - loginTime > SESSION_DURATION) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("loginTime");
        navigate("/login");
      }
    }
  }, [navigate]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found.");
    
        console.log("Auth Token:", token); // Debug log
    
        const response = await fetch("https://api.tedkoller.com/api/files", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);
    
        if (!response.ok) throw new Error(`Failed to fetch files. Status: ${response.status}`);
    
        const data = await response.json();
        console.log("Fetched data:", data);
    
        const clientId = localStorage.getItem("clientId") || "client1";
        const formattedData = data.files.map((file: { name: string; url: string }) => {
          const ext = file.name.split(".").pop()?.toLowerCase();
          const isImage = ext && ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
          return {
            id: file.name,
            title: file.name,
            type: isImage ? "image" : "video",
            thumbnail: isImage ? file.url : "/placeholder.svg",
            project: "Uncategorized",
            url: file.url,
            clientId,
          };
        });
    
        setMediaItems(formattedData);
      } catch (err: any) {
        console.error("Error fetching media:", err);
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };       

    fetchMedia();
  }, []);

  const projects = useMemo(() => {
    const projectSet = new Set(mediaItems.map((item) => item.project));
    return ["all", ...Array.from(projectSet)];
  }, [mediaItems]);

  const filteredMedia = useMemo(() => {
    return mediaItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.project.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProject = selectedProject === "all" || item.project === selectedProject;
      return matchesSearch && matchesProject;
    });
  }, [searchQuery, selectedProject, mediaItems]);

  const handleDownload = async (item: MediaItem): Promise<Blob> => {
    console.log("🔍 handleDownload triggered for:", item.title);
    
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found.");

        console.log("📡 Sending download request...");
        const response = await fetch(
            `https://api.tedkoller.com/api/download?clientId=${item.clientId}&fileName=${encodeURIComponent(item.title)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

        console.log("✅ File downloaded successfully.");
        return await response.blob();
    } catch (error) {
        console.error("❌ Download failed:", error);
        alert("Download failed: " + (error instanceof Error ? error.message : "Unknown error"));
        throw error;
    }
};

  
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Media Library</h1>
        <div className={styles.filters}>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search media..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className={styles.select}
          >
            {projects.map((project) => (
              <option key={project} value={project}>
                {project === "all" ? "All Projects" : project}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <MediaGrid items={filteredMedia} onDownload={handleDownload} />
      )}
    </div>
  );
};

export default Dashboard;
