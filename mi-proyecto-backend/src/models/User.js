// backend/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/40', // Avatar por defecto
  },
  favoriteActors: [
    {
      id: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      profile_path: {
        type: String,
      },
    },
  ],
  watchLaterMovies: [
    {
      id: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      poster_path: {
        type: String,
      },
      release_date: {
        type: String,
      },
    },
  ],
  watchLaterSeries: [
    {
      id: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      poster_path: {
        type: String,
      },
      first_air_date: {
        type: String,
      },
    },
  ],
});

export default mongoose.model('User', userSchema);