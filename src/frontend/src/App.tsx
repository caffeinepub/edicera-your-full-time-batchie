import { Toaster } from "@/components/ui/sonner";
import { GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import AppLayout from "./components/shared/AppLayout";
import AuthModal from "./components/shared/AuthModal";
import { useAuth } from "./hooks/useAuth";
import { useUserProfile } from "./hooks/useQueries";
import AdminPage from "./pages/AdminPage";
import AttendancePage from "./pages/AttendancePage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import PresentationPage from "./pages/PresentationPage";
import SubjectsPage from "./pages/SubjectsPage";
import TasksPage from "./pages/TasksPage";
import { getUserProfile as getStoredProfile } from "./utils/dataStore";

type Tab = "dashboard" | "attendance" | "tasks" | "subjects";

// ─── Admin gate wrapper ────────────────────────────────────────────────────────

function AdminGate() {
  const { isAdmin, isLoggedIn } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(!isLoggedIn || !isAdmin);
  const [accessDenied, setAccessDenied] = useState(false);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      setShowAuthModal(false);
      setAccessDenied(false);
    } else if (isLoggedIn && !isAdmin) {
      setShowAuthModal(false);
      setAccessDenied(true);
    } else {
      setShowAuthModal(true);
      setAccessDenied(false);
    }
  }, [isLoggedIn, isAdmin]);

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="fixed inset-0 grid-texture opacity-10 pointer-events-none" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground mb-6">
            Admin credentials are required to access this panel.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (showAuthModal) {
    return (
      <>
        <AuthModal
          open={true}
          forceOpen={true}
          onSuccess={handleAuthSuccess}
          defaultTab="signin"
        />
        <Toaster position="top-right" theme="dark" />
      </>
    );
  }

  if (isAdmin) {
    return (
      <>
        <AdminPage />
        <Toaster position="top-right" theme="dark" />
      </>
    );
  }

  return (
    <>
      <AuthModal
        open={true}
        forceOpen={true}
        onSuccess={handleAuthSuccess}
        defaultTab="signin"
      />
      <Toaster position="top-right" theme="dark" />
    </>
  );
}

// ─── Main authenticated app ────────────────────────────────────────────────────

function MainApp() {
  const { isLoggedIn, currentUser } = useAuth();
  const { data: userProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Determine app state synchronously — localStorage reads are instant.
  // Check localStorage directly first to avoid a flash while react-query initializes.
  const appState = (() => {
    if (!isLoggedIn) return "landing" as const;
    if (currentUser?.username) {
      const stored = getStoredProfile(currentUser.username);
      if (stored) return "app" as const;
    }
    if (userProfile) return "app" as const;
    return "onboarding" as const;
  })();

  const handleSignInSuccess = () => {
    setShowAuthModal(false);
  };

  if (appState === "landing") {
    return (
      <>
        <LandingPage onSignIn={() => setShowAuthModal(true)} />
        <AuthModal
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleSignInSuccess}
        />
        <Toaster position="top-right" theme="dark" />
      </>
    );
  }

  if (appState === "onboarding") {
    return (
      <>
        <OnboardingPage
          onComplete={() => {
            /* appState recalculates reactively */
          }}
        />
        <Toaster position="top-right" theme="dark" />
      </>
    );
  }

  // app state
  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardPage
            userProfile={userProfile ?? null}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case "attendance":
        return <AttendancePage />;
      case "tasks":
        return <TasksPage />;
      case "subjects":
        return <SubjectsPage userLevel={userProfile?.level ?? "School"} />;
      default:
        return null;
    }
  };

  return (
    <>
      <AppLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userProfile={userProfile ?? null}
      >
        {renderPage()}
      </AppLayout>
      <Toaster position="top-right" theme="dark" />
    </>
  );
}

// ─── Top-level router ────────────────────────────────────────────────────────

export default function App() {
  if (window.location.pathname === "/admin") {
    return <AdminGate />;
  }
  if (window.location.pathname === "/presentation") {
    return <PresentationPage />;
  }
  return <MainApp />;
}
