import { useState, useEffect, useMemo } from "react";
import { MediaGrid } from "../components/MediaGrid";
import styles from "./Dashboard.module.css";

interface MediaItem {
  id: string; 
  title: string; 
  type: "video"; 
  thumbnail: string; 
  project: string; 
  date: string; 
  url: string; 
}

export const Dashboard = () => {
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

      const response = await fetch("http://localhost:3000/api/files", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch files.");

      const data = await response.json();
      const formattedData = data.files.map((file: { name: string; url: string }) => ({
        id: file.name,
        title: file.name,
        type: "video",
        thumbnail: "/placeholder.svg",
        project: "Uncategorized",
        date: new Date().toISOString(),
        url: file.url,
      }));
      setMediaItems(formattedData);
    } catch (err: any) {
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
        <MediaGrid items={filteredMedia} />
      )}
    </div>
  );
};
