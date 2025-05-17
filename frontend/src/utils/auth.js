export const setToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const removeToken = () => localStorage.removeItem('token');

export const isAdmin = () => {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role === 'admin';
  } catch (error) {
    return false;
  }
};

export const logout = () => {
  removeToken();
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    if (!payload.id || !payload.exp || payload.exp < currentTime) {
      removeToken();
      return false;
    }
    return true;
  } catch (error) {
    removeToken();
    return false;
  }
};