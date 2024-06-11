const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userName: String,
  password: String
});

const NoteSchema = new mongoose.Schema({
  title: String,
  userId: mongoose.Schema.Types.ObjectId,
  userName: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);
const Note = mongoose.model('Note', NoteSchema);

module.exports = { User, Note };
