export const loadFromLocalStore = (key: string) => {
  return Promise.resolve(localStorage.getItem(key) || "");
};

export const saveToLocalStore = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
};
