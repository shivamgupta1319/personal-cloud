import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axiosInstance from "../config/axios";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          await fetchUserData(token);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem("accessToken");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await axiosInstance.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      throw error;
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post("/auth/signin", {
        email,
        password,
      });
      const { accessToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      await fetchUserData(accessToken);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    try {
      await axiosInstance.post("/auth/signup", { email, password });
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, register, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
