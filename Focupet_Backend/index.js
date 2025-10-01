import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

let users = JSON.parse(fs.readFileSync("./users.json", "utf8"));
let gameData = JSON.parse(fs.readFileSync("./gameData.json", "utf8"));

// ---------------- AUTH ----------------

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ message: "Login successful", userId: user.id, name: user.name });
});
