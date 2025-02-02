import { useState, useMemo } from "react"
import { MediaGrid } from "../components/MediaGrid"
import styles from "./Dashboard.module.css"

interface MediaItem {
  id: string
  title: string
  type: "video" | "photo"
  thumbnail: string
  project: string
  date: string
  url: string
}

const sampleMedia: MediaItem[] = [
  {
    id: "2",
    title: "The Coupes Video",
    type: "video",
    thumbnail: "/assets/icon.png", // Use a relevant thumbnail for "theCoupes"
    project: "The Coupes",
    date: "2024-01-26",
    url: "/assets/theCoupes - Final 4K.mp4", // Update the path to match your file location
  },
  {
    id: "2",
    title: "The Coupes Video",
    type: "video",
    thumbnail: "/assets/icon.png", // Use a relevant thumbnail for "theCoupes"
    project: "The Coupes",
    date: "2024-01-26",
    url: "/assets/theCoupes - Final 4K.mp4", // Update the path to match your file location
  },
  {
    id: "2",
    title: "The Coupes Video",
    type: "video",
    thumbnail: "/assets/icon.png", // Use a relevant thumbnail for "theCoupes"
    project: "The Coupes",
    date: "2024-01-26",
    url: "/assets/theCoupes - Final 4K.mp4", // Update the path to match your file location
  },
  {
    id: "2",
    title: "The Coupes Video",
    type: "video",
    thumbnail: "/assets/icon.png", // Use a relevant thumbnail for "theCoupes"
    project: "The Coupes",
    date: "2024-01-26",
    url: "/assets/theCoupes - Final 4K.mp4", // Update the path to match your file location
  },
]

export const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<"all" | "video" | "photo">("all")

  const projects = useMemo(() => {
    const projectSet = new Set(sampleMedia.map((item) => item.project))
    return ["all", ...Array.from(projectSet)]
  }, [])

  const filteredMedia = useMemo(() => {
    return sampleMedia.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.project.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesProject = selectedProject === "all" || item.project === selectedProject
      const matchesType = selectedType === "all" || item.type === selectedType

      return matchesSearch && matchesProject && matchesType
    })
  }, [searchQuery, selectedProject, selectedType])

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
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className={styles.select}
          >
            <option value="all">All Types</option>
            <option value="video">Videos</option>
            <option value="photo">Photos</option>
          </select>
        </div>
      </div>

      <MediaGrid items={filteredMedia} />
    </div>
  )
}

