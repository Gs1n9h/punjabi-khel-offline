import { useState, useRef, useEffect } from "react";
import { Switch, Route, Redirect, Router as WouterRouter, useLocation } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";

// Pages
import Home from "@/pages/home";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import GamesHub from "@/pages/games";
import SpinnerGame from "@/pages/games/spinner";
import TongueTwisterGame from "@/pages/games/tongue-twister";
import KnowledgeTest from "@/pages/games/knowledge-test";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin";
import AdminSpinner from "@/pages/admin/spinner";
import AdminTongueTwisters from "@/pages/admin/tongue-twisters";
import AdminKnowledgeTest from "@/pages/admin/knowledge-test";
import AdminSubmissions from "@/pages/admin/submissions";
import NotFound from "@/pages/not-found";

const clerkPubKey = publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClientRef = useRef(useQueryClient());
  useEffect(() => {
    return addListener(({ user }) => {
      if (!user) queryClientRef.current.clear();
    });
  }, [addListener]);
  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/games" />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      
      <Route path="/games">
        <ProtectedRoute component={GamesHub} />
      </Route>
      <Route path="/games/spinner">
        <ProtectedRoute component={SpinnerGame} />
      </Route>
      <Route path="/games/tongue-twister">
        <ProtectedRoute component={TongueTwisterGame} />
      </Route>
      <Route path="/games/knowledge-test">
        <ProtectedRoute component={KnowledgeTest} />
      </Route>
      
      <Route path="/leaderboard">
        <ProtectedRoute component={Leaderboard} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} />
      </Route>
      <Route path="/admin/spinner">
        <ProtectedRoute component={AdminSpinner} />
      </Route>
      <Route path="/admin/tongue-twisters">
        <ProtectedRoute component={AdminTongueTwisters} />
      </Route>
      <Route path="/admin/knowledge-test">
        <ProtectedRoute component={AdminKnowledgeTest} />
      </Route>
      <Route path="/admin/submissions">
        <ProtectedRoute component={AdminSubmissions} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  if (!clerkPubKey) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
