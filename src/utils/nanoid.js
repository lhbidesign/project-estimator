let counter = 0
export const nanoid = () => `id_${Date.now()}_${++counter}_${Math.random().toString(36).slice(2, 7)}`
