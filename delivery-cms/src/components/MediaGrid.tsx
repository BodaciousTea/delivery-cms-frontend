import { useState } from "react"
import styles from "./MediaGrid.module.css"

interface MediaItem {
  id: string
  title: string
  type: "video" | "photo"
  thumbnail: string
  project: string
  date: string
  url: string
}

interface MediaGridProps {
  items: MediaItem[]
}

export const MediaGrid = ({ items }: MediaGridProps) => {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.id} className={styles.item} onClick={() => setSelectedItem(item)}>
            <div className={styles.thumbnail}>
              <img src={item.thumbnail || "/placeholder.svg"} alt={item.title} />
              {item.type === "video" && (
                <div className={styles.playIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              )}
            </div>
            <div className={styles.info}>
              <h3>{item.title}</h3>
              <p>{item.project}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className={styles.modal} onClick={() => setSelectedItem(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {selectedItem.type === "video" ? (
              <video src={selectedItem.url} controls className={styles.modalMedia} />
            ) : (
              <img
                src={selectedItem.url || "/placeholder.svg"}
                alt={selectedItem.title}
                className={styles.modalMedia}
              />
            )}
            <div className={styles.modalInfo}>
              <h2>{selectedItem.title}</h2>
              <p>Project: {selectedItem.project}</p>
              <p>Date: {new Date(selectedItem.date).toLocaleDateString()}</p>
              <a href={selectedItem.url} download className={styles.downloadButton}>
                Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

