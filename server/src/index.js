import "dotenv/config";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;


import express from "express";
import cors from "cors";

console.log("CLIENT_ID:", CLIENT_ID ? "Loaded" : "Missing");
console.log("CLIENT_SECRET:", CLIENT_SECRET ? "Loaded" : "Missing");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/auth/google", (req, res) => {
  res.json({
    message: "This will handle Google OAuth in the next step",
    clientId: CLIENT_ID, // safe to show
  });
});


app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
