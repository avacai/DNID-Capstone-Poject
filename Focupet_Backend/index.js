const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

// 初始化 Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 示例 API：用户注册
app.post('/auth/register', async (req, res) => {
  try {
    const { email, username } = req.body;
    const userRef = db.collection('users').doc();
    await userRef.set({
      email,
      username,
      createdAt: new Date(),
      pet: { type: null, level: 1, xp: 0 },
      sessions: []
    });
    res.status(201).send({ id: userRef.id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// 示例 API：记录一次专注 Session
app.post('/session', async (req, res) => {
  try {
    const { userId, duration } = req.body;
    const sessionRef = db.collection('users').doc(userId).collection('sessions').doc();
    await sessionRef.set({
      duration,
      createdAt: new Date(),
      reward: Math.floor(duration / 10) // 示例：10分钟=1金币
    });
    res.status(201).send({ id: sessionRef.id });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(3000, () => console.log('FocuPet backend running on port 3000'));
