import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, GraduationCap, Lock, User, X, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

interface AuthModalProps {
  open: boolean;
  onClose?: () => void;
  onSuccess: () => void;
  defaultTab?: "signin" | "register";
  forceOpen?: boolean; // When true, no close button
}

export default function AuthModal({
  open,
  onClose,
  onSuccess,
  defaultTab = "signin",
  forceOpen = false,
}: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<"signin" | "register">(defaultTab);

  // Sign-in form state
  const [signInUsername, setSignInUsername] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInLoading, setSignInLoading] = useState(false);
  const [showSignInPw, setShowSignInPw] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState("");
  const [regDisplayName, setRegDisplayName] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirmPw, setShowRegConfirmPw] = useState(false);

  if (!open) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");
    setSignInLoading(true);

    const result = login(signInUsername.trim(), signInPassword);

    if (result.success) {
      onSuccess();
    } else {
      setSignInError(result.error ?? "Sign in failed");
    }
    setSignInLoading(false);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords don't match");
      return;
    }

    setRegLoading(true);
    const result = register(
      regUsername.trim(),
      regDisplayName.trim(),
      regPassword,
    );

    if (result.success) {
      onSuccess();
    } else {
      setRegError(result.error ?? "Registration failed");
    }
    setRegLoading(false);
  };

  const handleTabChange = (newTab: "signin" | "register") => {
    setTab(newTab);
    setSignInError("");
    setRegError("");
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-md"
    >
      {/* Card */}
      <div className="relative glass rounded-2xl border border-border/60 shadow-elevated overflow-hidden">
        {/* Gradient top edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        {/* Close button */}
        {!forceOpen && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-150"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-indigo">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <div className="font-display font-extrabold text-xl gradient-text-blue flex items-center gap-1.5 justify-center">
                <Zap className="w-4 h-4 text-primary" />
                EDUCERA
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Your Full Time Batchie
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-muted/40 border border-border/40 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => handleTabChange("signin")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === "signin"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("register")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                tab === "register"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "signin" ? (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignIn}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Username or email
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={signInUsername}
                      onChange={(e) => {
                        setSignInUsername(e.target.value);
                        setSignInError("");
                      }}
                      placeholder="e.g. student123"
                      className="pl-9 bg-background/60 border-border/60 focus:border-primary/50 h-11"
                      autoFocus
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showSignInPw ? "text" : "password"}
                      value={signInPassword}
                      onChange={(e) => {
                        setSignInPassword(e.target.value);
                        setSignInError("");
                      }}
                      placeholder="Your password"
                      className="pl-9 pr-10 bg-background/60 border-border/60 focus:border-primary/50 h-11"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showSignInPw ? "Hide password" : "Show password"
                      }
                    >
                      {showSignInPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {signInError && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                  >
                    {signInError}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 font-bold glow-indigo hover:scale-[1.01] transition-all duration-200"
                  disabled={signInLoading}
                >
                  {signInLoading ? "Signing in..." : "Sign In"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("register")}
                    className="text-primary hover:underline font-semibold"
                  >
                    Register here
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={regUsername}
                      onChange={(e) => {
                        setRegUsername(e.target.value);
                        setRegError("");
                      }}
                      placeholder="Choose a username"
                      className="pl-9 bg-background/60 border-border/60 focus:border-primary/50 h-11"
                      autoFocus
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Display Name
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={regDisplayName}
                      onChange={(e) => {
                        setRegDisplayName(e.target.value);
                        setRegError("");
                      }}
                      placeholder="Your full name"
                      className="pl-9 bg-background/60 border-border/60 focus:border-primary/50 h-11"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showRegPw ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        setRegError("");
                      }}
                      placeholder="Min. 6 characters"
                      className="pl-9 pr-10 bg-background/60 border-border/60 focus:border-primary/50 h-11"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showRegPw ? "Hide password" : "Show password"}
                    >
                      {showRegPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showRegConfirmPw ? "text" : "password"}
                      value={regConfirmPassword}
                      onChange={(e) => {
                        setRegConfirmPassword(e.target.value);
                        setRegError("");
                      }}
                      placeholder="Repeat your password"
                      className="pl-9 pr-10 bg-background/60 border-border/60 focus:border-primary/50 h-11"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showRegConfirmPw ? "Hide password" : "Show password"
                      }
                    >
                      {showRegConfirmPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {regError && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                  >
                    {regError}
                  </motion.p>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 font-bold glow-indigo hover:scale-[1.01] transition-all duration-200"
                  disabled={regLoading}
                >
                  {regLoading ? "Creating account..." : "Create Account"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("signin")}
                    className="text-primary hover:underline font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );

  // Full-screen forced mode (landing page / admin gate)
  if (forceOpen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
        <div className="fixed inset-0 dot-texture opacity-20 pointer-events-none" />
        <div className="hero-blob-1 fixed top-[-80px] left-[10%] opacity-50 pointer-events-none" />
        <div className="hero-blob-2 fixed bottom-[5%] right-[5%] opacity-40 pointer-events-none" />
        <AnimatePresence>{open && modalContent}</AnimatePresence>
      </div>
    );
  }

  // Overlay modal mode
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md">
              {modalContent}
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
