import React, { useState } from "react";
import styles from "./LoginPage.module.css";

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState("");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.inputContainer}>
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          className={styles.passwordInput}
          placeholder="Input Your Provided Password Here"
        />
        <div className={styles.glowContainer}></div>
      </div>
    </div>
  );
};

export default LoginPage;
