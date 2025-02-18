import { useState } from "react"
import { Link } from "react-router-dom"
import styles from "./Navbar.module.css"

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          Content Delivery
        </Link>
        <button className={styles.menuButton} onClick={() => setIsOpen(!isOpen)}>
          <span className={styles.menuIcon}></span>
        </button>
        <div className={`${styles.navLinks} ${isOpen ? styles.active : ""}`}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/files">Files</Link>
          <Link to="/settings">Settings</Link>
        </div>
      </div>
    </nav>
  )
}

