import React from "react";
import DownloadButton from "./DownloadButton";
import styles from "./MediaGrid.module.css";

export interface MediaItem {
  id: string;
  title: string;
  type: "video" | "image";
  thumbnail: string;
  project: string;
  url: string;
  clientId: string;
}

interface MediaGridProps {
  items: MediaItem[];
}

const MediaGrid: React.FC<MediaGridProps> = ({ items }) => {
  return (
    <div className={styles.mediaGrid}>
      {items.map((item) => (
        <div key={item.id} className={styles.mediaItem}>
          <div className={styles.mediaWrapper}>
            {item.type === "image" ? (
              <img src={item.url || "/placeholder.svg"} alt={item.title} className={styles.mediaContent} />
            ) : (
              <video className={styles.mediaContent} controls src={item.url}>
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <div className={styles.mediaInfo}>
            <h3 className={styles.mediaTitle}>{item.title}</h3>
            <div className={styles.downloadWrapper}>
              <DownloadButton 
                url={`/admin/download?clientId=${item.clientId}&fileName=${encodeURIComponent(item.title)}`}
                filename={item.title}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;