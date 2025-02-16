"use client"

import React, { useState, useRef, useEffect } from 'react';
import styles from './DownloadButton.module.css';

interface DownloadButtonProps {
  url: string;
  filename: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ url, filename }) => {
  const [state, setState] = useState<'idle' | 'downloading' | 'completed'>('idle');
  const linkRef = useRef<HTMLAnchorElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleFocus = () => {
      if (state === 'downloading') {
        setState('completed');
        
        animationTimeoutRef.current = setTimeout(() => {
          // We no longer automatically reset to 'idle' here
        }, 2000); // Animation duration
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [state]);

  const handleClick = () => {
    if (state === 'downloading') {
      return;
    }

    if (state === 'completed') {
      setState('idle');
      return;
    }

    setState('downloading');

    if (linkRef.current) {
      linkRef.current.click();
    }
  };

  return (
    <>
      <button 
        className={`${styles.downloadButton} ${state === 'completed' ? styles.downloaded : ''}`} 
        onClick={handleClick}
        aria-label={state === 'completed' ? "Download Again" : "Download"}
        disabled={state === 'downloading'}
      >
        <svg width="22" height="16" viewBox="0 0 22 16" className={styles.downloadIcon}>
          <path 
            className={styles.checkPath}
            d="M2,10 L6,13 L12.8760559,4.5959317 C14.1180021,3.0779974 16.2457925,2.62289624 18,3.5 L18,3.5 C19.8385982,4.4192991 21,6.29848669 21,8.35410197 L21,10 C21,12.7614237 18.7614237,15 16,15 L1,15" 
          />
          <polyline 
            className={styles.arrowDown}
            points="4.5 8.5 8 11 11.5 8.5" 
          />
          <path 
            className={styles.arrowLine}
            d="M8,1 L8,11" 
          />
        </svg>
      </button>
      <a 
        ref={linkRef}
        href={url}
        download={filename}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default DownloadButton;