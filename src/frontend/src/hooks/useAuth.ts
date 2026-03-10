import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ────────────────────────────────────────────────────
interface StoredUser {
  username: string;
  passwordHash: string;
  displayName: string;
  createdAt: string;
}

interface Session {
  username: string;
  displayName: string;
  isAdmin: boolean;
}

interface AuthContextValue {
  currentUser: Session | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (
    username: string,
    password: string,
  ) => { success: boolean; error?: string };
  register: (
    username: string,
    displayName: string,
    password: string,
  ) => { success: boolean; error?: string };
  logout: () => void;
}

// ─── Constants ────────────────────────────────────────────────
const USERS_KEY = "educera_users";
const SESSION_KEY = "educera_session";

const ADMIN_USERNAME = "surajkumarg1209@gmail.com";
const ADMIN_PASSWORD = "@$urajKumarGupta610K";

// ─── Helpers ─────────────────────────────────────────────────
function hashPassword(username: string, password: string): string {
  return btoa(`${username}:${password}`);
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Session persisted in localStorage so it survives tab/browser closes.
// It is only cleared on explicit logout.
function getStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ─── Context ─────────────────────────────────────────────────
import { type ReactNode, createElement } from "react";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Session | null>(() =>
    getStoredSession(),
  );

  // Sync state on mount
  useEffect(() => {
    const session = getStoredSession();
    setCurrentUser(session);
  }, []);

  const login = useCallback(
    (
      username: string,
      password: string,
    ): { success: boolean; error?: string } => {
      const trimmedUsername = username.trim();
      const trimmedPassword = password;

      // Check admin credentials
      if (
        trimmedUsername === ADMIN_USERNAME &&
        trimmedPassword === ADMIN_PASSWORD
      ) {
        const session: Session = {
          username: ADMIN_USERNAME,
          displayName: "Admin",
          isAdmin: true,
        };
        saveSession(session);
        setCurrentUser(session);
        return { success: true };
      }

      // Check regular users
      const users = getStoredUsers();
      const expectedHash = hashPassword(trimmedUsername, trimmedPassword);
      const user = users.find(
        (u) =>
          u.username.toLowerCase() === trimmedUsername.toLowerCase() &&
          u.passwordHash === expectedHash,
      );

      if (!user) {
        return { success: false, error: "Invalid username or password" };
      }

      const session: Session = {
        username: user.username,
        displayName: user.displayName,
        isAdmin: false,
      };
      saveSession(session);
      setCurrentUser(session);
      return { success: true };
    },
    [],
  );

  const register = useCallback(
    (
      username: string,
      displayName: string,
      password: string,
    ): { success: boolean; error?: string } => {
      const trimmedUsername = username.trim();
      const trimmedDisplayName = displayName.trim();

      if (!trimmedUsername) {
        return { success: false, error: "Username is required" };
      }
      if (!trimmedDisplayName) {
        return { success: false, error: "Display name is required" };
      }
      if (!password || password.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters",
        };
      }

      // Prevent admin username from being registered
      if (trimmedUsername.toLowerCase() === ADMIN_USERNAME.toLowerCase()) {
        return { success: false, error: "This username is not available" };
      }

      const users = getStoredUsers();
      const existing = users.find(
        (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase(),
      );

      if (existing) {
        return { success: false, error: "Username already taken" };
      }

      const newUser: StoredUser = {
        username: trimmedUsername,
        passwordHash: hashPassword(trimmedUsername, password),
        displayName: trimmedDisplayName,
        createdAt: new Date().toISOString(),
      };

      saveStoredUsers([...users, newUser]);

      // Auto-login after registration
      const session: Session = {
        username: newUser.username,
        displayName: newUser.displayName,
        isAdmin: false,
      };
      saveSession(session);
      setCurrentUser(session);
      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
  }, []);

  const value: AuthContextValue = {
    currentUser,
    isLoggedIn: currentUser !== null,
    isAdmin: currentUser?.isAdmin ?? false,
    login,
    register,
    logout,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
