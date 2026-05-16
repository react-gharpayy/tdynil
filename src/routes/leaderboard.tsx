import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CreatorLeaderboardPanel } from "@/components/stats/CreatorLeaderboardPanel";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Gharpayy" },
      { name: "description", content: "Members ranked by tours scheduled." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-2xl font-semibold tracking-tight inline-flex items-center gap-2">
            <Trophy className="h-6 w-6 text-accent" /> Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Members ranked purely by tours scheduled — the metric that drives Gharpayy.
          </p>
        </header>
        <CreatorLeaderboardPanel />
      </div>
    </AppShell>
  );
}
