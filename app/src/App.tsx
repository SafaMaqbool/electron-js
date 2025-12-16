import React, { useEffect, useState } from "react";
import { generatePKCEPair } from "./utils/pkce";

declare global {
  interface Window {
    api: {
      startGoogleLogin: (
        codeVerifier: string,
        codeChallenge: string
      ) => Promise<any>;
      logout: () => Promise<boolean>;
      isLoggedIn: () => Promise<boolean>;
      getAccessToken: () => Promise<string>;
    };
  }
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    window.api.isLoggedIn().then(setIsLoggedIn);
  }, []);

  const login = async () => {
    const { codeVerifier, codeChallenge } = await generatePKCEPair();
    const result = await window.api.startGoogleLogin(
      codeVerifier,
      codeChallenge
    );

    if (result?.access_token) {
      setIsLoggedIn(true);
    }
  };

  const logout = async () => {
    await window.api.logout();
    setIsLoggedIn(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Electron Google OAuth PKCE Demo</h1>

      {isLoggedIn ? (
        <>
          <p>Logged in</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={login}>Login with Google</button>
      )}
    </div>
  );
}
