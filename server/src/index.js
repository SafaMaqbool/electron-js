import "dotenv/config";
import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:4000/oauth2callback";

console.log("CLIENT_ID:", CLIENT_ID ? "Loaded" : "Missing");
console.log("CLIENT_SECRET:", CLIENT_SECRET ? "Loaded" : "Missing");

//just to test server is running
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Starts Google OAuth flow
app.get("/auth/google", (req, res) => {
  const code_challenge = req.query.code_challenge;

  if (!code_challenge) return res.status(400).send("Missing code_challenge");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=openid%20profile%20email` +
    `&code_challenge=${code_challenge}` +
    `&code_challenge_method=S256` +
    `&access_type=offline`;

  res.json({ authUrl });
});
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  const code_verifier = req.query.code_verifier;

  if (!code || !code_verifier)
    return res.status(400).send("Missing code or verifier");

  try {
    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET); // Optional for PKCE
    params.append("code", code);
    params.append("code_verifier", code_verifier);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("grant_type", "authorization_code");

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      params.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    console.log("Google token response:", tokenRes.data);

    res.json(tokenRes.data);
  } catch (err) {
    console.error("Token exchange failed:", err.response?.data || err.message);
    res
      .status(500)
      .json({ error: "Token exchange failed", details: err.response?.data });
  }
});
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
