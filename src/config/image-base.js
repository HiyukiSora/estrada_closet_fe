const BASE = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost/estrada_closet_be';

export const imageUrl = (path) => path ? `${BASE}/${path}` : '';