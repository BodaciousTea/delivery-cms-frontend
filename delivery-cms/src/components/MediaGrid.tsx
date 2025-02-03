import styles from "./MediaGrid.module.css";

interface MediaItem {
  id: string;
  title: string;
  type: "video";
  thumbnail: string;
  project: string;
  date: string;
  url: string;
}

interface MediaGridProps {
  items: MediaItem[];
}

export const MediaGrid = ({ items }: MediaGridProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.thumbnail}>
              <img src={item.thumbnail || "/placeholder.svg"} alt={item.title} />
            </div>
            <div className={styles.info}>
              <h3>{item.title}</h3>
              <a
                href={item.url}
                download={item.title} // Specify the file name for download
                className={styles.downloadLink}
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
