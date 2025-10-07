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

// ------------ AUTH LOGIN --------------

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

//------------- GET GAME DATA -------------
//get game data from gameData.json
app.get("/game/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const data = gameData.find(g => g.userId === userId);
  if (!data) return res.status(404).json({ error: "Game data not found" });
  res.json(data);
});

// create a new session
app.post("/game/:userId/session", (req, res) => {
  const { start, end, reward } = req.body;
  const data = gameData.find(g => g.userId === parseInt(req.params.userId));
  if (!data) return res.status(404).json({ error: "Game data not found" });
  const newSession = { id: Date.now(), start, end, reward };
  data.sessions.push(newSession);
  data.currency += reward;
  res.json({ message: "Session added", data });
});

// update pet
app.post("/game/:userId/pet", (req, res) => {
  const { level, mood } = req.body;
  const data = gameData.find(g => g.userId === parseInt(req.params.userId));
  if (!data) return res.status(404).json({ error: "Game data not found" });

  if (level !== undefined) data.pet.level = level;
  if (mood !== undefined) data.pet.mood = mood;

  res.json({ message: "Pet updated", pet: data.pet });
});
