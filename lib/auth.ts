export const setToken = (token: string) => {
  // Set the token in sessionStorage
  if (typeof window !== "undefined") {
    sessionStorage.setItem("accessToken", token);
  }
  
  // Set the cookie for middleware to intercept
  // Adjust max-age as needed (e.g., 86400 for 1 day)
  document.cookie = `auth_data=${token || 'authenticated'}; path=/; max-age=86400`;
};

export const setUser = (user: any) => {
  if (typeof window !== "undefined" && user) {
    sessionStorage.setItem("user", JSON.stringify(user));
  }
};

export const getUser = () => {
  if (typeof window !== "undefined") {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

export const getLoggedInUserIdentifier = (): string => {
  const user = getUser();
  if (!user) return "";
  return user.id !== undefined && user.id !== null ? String(user.id) : (user.username || user.full_name || "");
};

export const removeAuth = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
  }
  document.cookie = "auth_data=; path=/; max-age=0";
};
