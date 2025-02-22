import styles from "./FileCard.module.css";
import DownloadButton from "./DownloadButton";

interface FileCardProps {
  name: string;
  size: string;
  uploadDate: string;
  downloads: number;
  onDownload: () => Promise<Blob>;
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
      {}
      <DownloadButton url="" filename={name} onDownload={onDownload} />
    </div>
  );
};
