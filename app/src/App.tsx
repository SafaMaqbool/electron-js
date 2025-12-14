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
    // 1. Generate PKCE pair
    const { codeVerifier, codeChallenge } = await generatePKCEPair();

    // 2. Call Electron main process to open Google login
    const result = await window.api.startGoogleLogin(
      codeVerifier,
      codeChallenge
    );

    // 3. For now, just log result (backend token will come later)
    console.log(result);
    setToken(result.access_token || null);
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
