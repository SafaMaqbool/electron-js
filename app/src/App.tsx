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
      getProfile: () => Promise<any>;
    };
  }
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (isLoggedIn) {
      window.api.getProfile().then(setProfile);
    }
  }, [isLoggedIn]);

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
        profile ? (
          <div>
            <img src={profile.picture} alt="avatar" width={100} />
            <h2>{profile.name}</h2>
            <p>{profile.email}</p>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <p>Loading profile...</p>
        )
      ) : (
        <button onClick={login}>Login with Google</button>
      )}
    </div>
  );
}
