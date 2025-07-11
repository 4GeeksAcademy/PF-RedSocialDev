// File: src/front/js/store.js

export const initialStore = () => {
  return {
    message: null,
    user: null, // ✅ Ya no arranca como "guest"
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ]
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'set_hello':
      return { ...store, message: action.payload };

    case 'add_task':
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map(todo =>
          todo.id === id ? { ...todo, background: color } : todo
        )
      };

    case 'set_user':
      return { ...store, user: action.payload };

    case 'logout':
      return { ...store, user: null };

    case 'toggle_like':
      if (!store.user) return store;
      const currentLikes = store.user.likes || [];
      const updatedLikes = currentLikes.includes(action.payload)
        ? currentLikes.filter(id => id !== action.payload)
        : [...currentLikes, action.payload];
      return {
        ...store,
        user: {
          ...store.user,
          likes: updatedLikes
        }
      };

    case 'toggle_favorite':
      if (!store.user) return store;
      const currentFavorites = store.user.favorites || [];
      const updatedFavorites = currentFavorites.includes(action.payload)
        ? currentFavorites.filter(id => id !== action.payload)
        : [...currentFavorites, action.payload];
      return {
        ...store,
        user: {
          ...store.user,
          favorites: updatedFavorites
        }
      };

    default:
      throw Error('Unknown action.');
  }
}