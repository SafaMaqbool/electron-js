import React, { useState } from "react";
import { generatePKCEPair } from "./utils/pkce";
declare global {
  interface Window {
    api: {
      startGoogleLogin: (
        codeVerifier: string,
        codeChallenge: string
      ) => Promise<any>;
    };
  }
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);

  const login = async () => {
    try {
      // 1. Generate PKCE pair
      const { codeVerifier, codeChallenge } = await generatePKCEPair();

      // Debug logs to make sure they exist
      console.log("PKCE codeVerifier:", codeVerifier);
      console.log("PKCE codeChallenge:", codeChallenge);

      if (!codeChallenge) {
        console.error("PKCE codeChallenge is undefined!");
        return;
      }

      // 2. Call Electron main process to open Google login
      const result = await window.api.startGoogleLogin(
        codeVerifier,
        codeChallenge
      );

      console.log("Login result:", result);
      setToken(result.access_token || null);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };


  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Electron Google OAuth PKCE Demo</h1>
      {token ? (
        <p>Logged in! Token: {token}</p>
      ) : (
        <button onClick={login}>Login with Google</button>
      )}
    </div>
  );
}
