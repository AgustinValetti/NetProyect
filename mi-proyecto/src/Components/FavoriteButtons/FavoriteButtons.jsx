// src/Components/FavoriteButtons/FavoriteButton.jsx
import { useFavorites } from '../../../hooks/useFavorites';

export const FavoriteButton = ({ item, type }) => {
  const { addToFavorites } = useFavorites();

  return (
    <button 
      onClick={() => addToFavorites(item, type)}
      className="favorite-btn"
      aria-label={`Agregar ${item.title} a favoritos`}
    >
      ⭐
    </button>
  );
};