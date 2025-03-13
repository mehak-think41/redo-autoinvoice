export const login = (userData) => {
  localStorage.setItem('isAuth', 'true');
  localStorage.setItem('user', JSON.stringify(userData));
};

export const logout = () => {
  localStorage.removeItem('isAuth');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return localStorage.getItem('isAuth') === 'true';
};