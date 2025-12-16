import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { ipcMain, shell } from "electron";
import axios from "axios";
import * as url from "url";
import keytar from "keytar";


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

async function refreshAccessToken() {
  const refreshToken = await keytar.getPassword(
    "ElectronGoogleOAuthApp",
    "google-refresh-token"
  );
  if (!refreshToken) throw new Error("No refresh token available");

  const res = await axios.get("http://localhost:4000/refresh-token", {
    params: { refresh_token: refreshToken },
  });

  const newAccessToken = res.data.access_token;
  // Save the new access token
  await keytar.setPassword(
    "ElectronGoogleOAuthApp",
    "google-access-token",
    newAccessToken
  );
  return newAccessToken;
}

async function getAccessToken() {
  return await keytar.getPassword(
    "ElectronGoogleOAuthApp",
    "google-access-token"
  );
}



ipcMain.handle(
  "google-login",
  async (event, { codeVerifier, codeChallenge }) => {
    try {
      // 1. Get OAuth URL from backend
      const res = await axios.get("http://localhost:4000/auth/google", {
        params: { code_challenge: codeChallenge },
      });
      const authUrl = res.data.authUrl;

      // 2. Open visible BrowserWindow to handle login
      const loginWindow = new BrowserWindow({
        width: 500,
        height: 700,
        show: true,
        webPreferences: { nodeIntegration: false },
      });

      return new Promise((resolve, reject) => {
        loginWindow.webContents.on("did-navigate", async (event, newUrl) => {
          const parsedUrl = new URL(newUrl);

          // 3. Check if Google redirected to our backend callback
          if (
            parsedUrl.origin === "http://localhost:4000" &&
            parsedUrl.pathname === "/oauth2callback"
          ) {
            const code = parsedUrl.searchParams.get("code");
            loginWindow.close();
            if (!code) return reject("No code received");

            try {
              //Exchange code for token via backend
              const tokenRes = await axios.get(
                "http://localhost:4000/oauth2callback",
                {
                  params: { code, code_verifier: codeVerifier },
                }
              );
              // Save tokens in OS keychain
              await keytar.setPassword(
                "ElectronGoogleOAuthApp",
                "google-access-token",
                tokenRes.data.access_token
              );
              await keytar.setPassword(
                "ElectronGoogleOAuthApp",
                "google-refresh-token",
                tokenRes.data.refresh_token
              );

              resolve(tokenRes.data);
            } catch (err) {
              reject(err);
            }
          }
        });

        // 5. Load Google login
        loginWindow.loadURL(authUrl);
      });
    } catch (err) {
      console.error(err);
      return { access_token: null };
    }
  }
);

ipcMain.handle("google-logout", async () => {
  const accessToken = await keytar.getPassword(
    "ElectronGoogleOAuthApp",
    "google-access-token"
  );

  if (accessToken) {
    // Revoke token on Google
    await axios.post(
      `https://oauth2.googleapis.com/revoke?token=${accessToken}`,
      null,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
  }

  // Delete tokens from Keytar
  await keytar.deletePassword("ElectronGoogleOAuthApp", "google-access-token");
  await keytar.deletePassword("ElectronGoogleOAuthApp", "google-refresh-token");

  return true;
});

ipcMain.handle("is-logged-in", async () => {
  const refreshToken = await keytar.getPassword(
    "ElectronGoogleOAuthApp",
    "google-refresh-token"
  );
  return Boolean(refreshToken);
});

ipcMain.handle("get-access-token", async () => {
  let accessToken = await getAccessToken();

  if (!accessToken) {
    accessToken = await refreshAccessToken();
  }

  return accessToken;
});
