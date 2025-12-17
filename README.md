# Electron Google OAuth PKCE Demo

A boilerplate Electron app demonstrating Google OAuth 2.0 login using PKCE, with persistent access token storage via Keytar, and a simple React UI.

## Features
- Login with Google (OAuth 2.0 PKCE flow)
- Secure token storage in OS keychain (Keytar)
- Fetch and display Google profile (avatar, name, email)
- Logout functionality
- Persistent login across app restarts

## Prerequisites
- Node.js >= 18
- npm >= 9

## Setup

### 1. Clone the repo
```bash
git clone (https://github.com/SafaMaqbool/electron-js)
cd electron-js
```

## Setup Instructions

### 2. Setup environment variables

Create a `.env` file in the server folder and add the following:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```
### 3. Create Google OAuth Credentials

To enable Google login, you must create OAuth credentials in the Google Cloud Console.

#### Step-by-step guide

1. Go to the **Google Cloud Console**  
   https://console.cloud.google.com/

2. Click the **project selector** at the top and create a **new project**  
   (or select an existing one).

3. In the left sidebar, go to:  
   **APIs & Services → Credentials**

4. Click **Create Credentials → OAuth client ID**

5. If prompted, configure the **OAuth consent screen**:
   - User type: **External**
   - App name: anything (e.g. `Electron OAuth Demo`)
   - Support email: your email
   - Developer contact email: your email
   - Save and continue (no scopes needed beyond basic profile)

6. Create the OAuth Client:
   - **Application type:** `Desktop app`
   - Name: `Electron Google OAuth PKCE`

7. Click **Create**

8. Copy the generated **Client ID** and **Client Secret**

9. Paste them into your `.env` file inside the `server` folder:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Important:

Do NOT commit your .env file

The client secret is used only on the backend to securely exchange tokens.

### 4. Install dependencies Backend (server)

```
cd server
npm install
```
Electron App (frontend)

```
cd ../app
npm install

```
### 5. Start the backend server

```
cd server
npm start
```
The server will run on:
```
http://localhost:4000
```

The backend must be running for the Electron app to authenticate.

### 6. Start the Electron app

```
cd ../app
npm start
```

### 7. Usage

Click Login with Google to authenticate

View your Google profile (avatar, name, email)

Restart the app to see persistent login

Click Logout to revoke the token and clear session
