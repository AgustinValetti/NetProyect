import User from '../models/User.js';

export const toggleFavoriteActor = async (req, res) => {
  try {
    const { actorId, name, profilePath } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.toggleFavoriteActor({
      id: actorId,
      name,
      profile_path: profilePath
    });
    
    res.json(user.favoriteActors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFavoriteActors = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('favoriteActors');
    res.json(user.favoriteActors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};