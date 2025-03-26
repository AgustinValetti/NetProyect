import User from '../models/User.js';

export const addToWatchLater = async (req, res) => {
  try {
    const { item, type } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.addToWatchLater(item, type);
    res.json({
      movies: user.watchLater.movies,
      series: user.watchLater.series
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFromWatchLater = async (req, res) => {
  try {
    const { type, id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.removeFromWatchLater(Number(id), type === 'movies' ? 'movie' : 'series');
    res.json({
      movies: user.watchLater.movies,
      series: user.watchLater.series
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWatchLater = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('watchLater');
    res.json(user.watchLater);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};