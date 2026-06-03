import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";

// Pages
import GamesHub from "@/pages/games";
import SpinnerGame from "@/pages/games/spinner";
import TongueTwisterGame from "@/pages/games/tongue-twister";
import KnowledgeTest from "@/pages/games/knowledge-test";
import MemoryGame from "@/pages/games/memory";
import PictureGame from "@/pages/games/picture";
import Leaderboard from "@/pages/leaderboard";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin";
import AdminSpinner from "@/pages/admin/spinner";
import AdminTongueTwisters from "@/pages/admin/tongue-twisters";
import AdminKnowledgeTest from "@/pages/admin/knowledge-test";
import AdminSubmissions from "@/pages/admin/submissions";
import AdminUsers from "@/pages/admin/users";
import NotFound from "@/pages/not-found";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function HomeRedirect() {
  return <Redirect to="/games" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      
      <Route path="/games" component={GamesHub} />
      <Route path="/games/spinner" component={SpinnerGame} />
      <Route path="/games/tongue-twister" component={TongueTwisterGame} />
      <Route path="/games/knowledge-test" component={KnowledgeTest} />
      <Route path="/games/memory" component={MemoryGame} />
      <Route path="/games/picture" component={PictureGame} />
      
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/spinner" component={AdminSpinner} />
      <Route path="/admin/tongue-twisters" component={AdminTongueTwisters} />
      <Route path="/admin/knowledge-test" component={AdminKnowledgeTest} />
      <Route path="/admin/submissions" component={AdminSubmissions} />
      <Route path="/admin/users" component={AdminUsers} />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}
