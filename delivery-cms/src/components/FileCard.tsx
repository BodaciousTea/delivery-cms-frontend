import styles from "./FileCard.module.css";

interface FileCardProps {
  name: string;
  size: string;
  uploadDate: string;
  downloads: number;
  onDownload: () => void;
}

export const FileCard = ({ name, size, uploadDate, downloads, onDownload }: FileCardProps) => {
  return (
    <div className={styles.fileCard}>
      <div className={styles.fileInfo}>
        <h3>{name}</h3>
        <div className={styles.fileDetails}>
          <span>{size}</span>
          <span>•</span>
          <span>{uploadDate}</span>
          <span>•</span>
          <span>{downloads} downloads</span>
        </div>
      </div>
      <button onClick={onDownload} className={styles.downloadButton}>
        Download
      </button>
    </div>
  );
};
