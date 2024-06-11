require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { User, Note } = require('./models/Note');

const app = express();
const port = 5503;

app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to DB'))
  .catch((error) => console.log(error));

app.use(express.json());

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { userName, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ userName, password: hashedPassword });
  await newUser.save();
  res.status(201).send('User registered');
});

// Авторизация пользователя
app.post('/api/login', async (req, res) => {
  const { userName, password } = req.body;
  const user = await User.findOne({ userName });
  if (user && await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({ userId: user._id, userName: user.userName }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Middleware для проверки JWT токена
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Маршруты для работы с заметками
app.get('/api/notes', authenticateToken, async (req, res) => {
  const notes = await Note.find(); // Возвращаем все заметки
  res.json(notes);
});

app.post('/api/notes', authenticateToken, async (req, res) => {
  const { title } = req.body;
  const newNote = new Note({
    title,
    userId: req.user.userId,
    userName: req.user.userName
  });
  await newNote.save();
  res.json(newNote);
});

app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (note.userId.toString() !== req.user.userId) {
    return res.status(403).send('Forbidden');
  }
  await Note.findByIdAndDelete(req.params.id);
  res.send('Note deleted');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
