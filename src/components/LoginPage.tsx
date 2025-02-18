import React, { useState, useEffect } from "react";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import { userPool } from "../cognitoConfig";

const LoginPage: React.FC = () => {
  useEffect(() => {
    console.log("LoginPage rendered");
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting sign in for:", email);

    try {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });
      const userData = {
        Username: email,
        Pool: userPool,
      };
      const cognitoUser = new CognitoUser(userData);
      console.log("Created CognitoUser, calling authenticateUser");

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          console.log("Sign in successful", result);
          const idToken = result.getIdToken().getJwtToken();
          // Store the token
          localStorage.setItem("token", idToken);
          // Also store the current timestamp as loginTime
          localStorage.setItem("loginTime", Date.now().toString());
          navigate("/");
        },
        onFailure: (err) => {
          console.error("Error signing in:", err);
          setError(err.message || "Error signing in");
        },
      });
    } catch (err) {
      console.error("Exception during sign in:", err);
      setError("Exception during sign in");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>Login Page</h1>
      <form onSubmit={handleSignIn}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          style={{ marginBottom: "10px", padding: "5px", fontSize: "1rem", width: "300px" }}
        />
        <br />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          style={{ marginBottom: "10px", padding: "5px", fontSize: "1rem", width: "300px" }}
        />
        <br />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          type="submit"
          style={{ padding: "10px 20px", background: "blue", color: "white", fontSize: "1rem", border: "none", cursor: "pointer" }}
        >
          Log In
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
