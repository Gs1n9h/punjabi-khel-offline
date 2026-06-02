import { useState } from "react";
import { MobileContainer } from "@/components/layout/mobile-container";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageHeader } from "@/components/ui/page-header";
import { useGetMe, useGetMyStats, useUpdateMe } from "@/lib/offline-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { data: user, isLoading: isUserLoading } = useGetMe();
  const { data: stats, isLoading: isStatsLoading } = useGetMyStats();
  const updateMe = useUpdateMe();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const handleEdit = () => {
    if (user) {
      setDisplayName(user.displayName || user.username);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateMe.mutate(
      { data: { displayName } },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({ title: "Profile updated!" });
        },
        onError: () => {
          toast({ title: "Failed to update profile", variant: "destructive" });
        }
      }
    );
  };

  return (
    <MobileContainer withBottomNav>
      <PageHeader title="Profile" />

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-3xl p-6 border-2 border-orange-100 shadow-sm text-center relative">
          <div className="flex justify-center mb-4">
            {isUserLoading ? (
              <Skeleton className="w-24 h-24 rounded-full" />
            ) : (
              <Avatar className="w-24 h-24 border-4 border-orange-100">
                <AvatarImage src={user?.avatarUrl || ""} />
                <AvatarFallback className="text-2xl font-black bg-orange-50 text-primary">
                  {user?.displayName?.charAt(0) || user?.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          {isUserLoading ? (
            <div className="space-y-2 flex flex-col items-center">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : isEditing ? (
            <div className="flex gap-2 items-end justify-center">
              <div className="space-y-1 text-left">
                <Label className="text-xs">Display Name</Label>
                <Input 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="font-bold"
                  autoFocus
                />
              </div>
              <Button size="icon" onClick={handleSave} disabled={updateMe.isPending}>
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div onClick={handleEdit} className="cursor-pointer group">
              <h2 className="text-2xl font-black group-hover:text-primary transition-colors">
                {user?.displayName || user?.username}
              </h2>
              <p className="text-sm text-muted-foreground font-medium">@{user?.username}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <Trophy className="w-8 h-8 text-primary mb-2" />
            <p className="text-xs font-bold text-muted-foreground uppercase">Total Points</p>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-black text-foreground">{stats?.totalPoints || 0}</p>
            )}
          </div>
          <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 flex items-center justify-center bg-blue-200 rounded-full mb-2">
              <span className="font-black text-blue-700">#</span>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase">Global Rank</p>
            {isStatsLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-black text-foreground">{stats?.rank || "--"}</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-3 px-1">Stats</h3>
          <div className="bg-white border-2 border-orange-100 rounded-2xl divide-y-2 divide-orange-50">
            <div className="flex justify-between p-4">
              <span className="font-medium text-muted-foreground">Spins</span>
              <span className="font-bold">{isStatsLoading ? <Skeleton className="h-5 w-8" /> : stats?.spinsPlayed}</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="font-medium text-muted-foreground">Tongue Twisters</span>
              <span className="font-bold">{isStatsLoading ? <Skeleton className="h-5 w-8" /> : stats?.tongueTwisterSubmissions}</span>
            </div>
            <div className="flex justify-between p-4">
              <span className="font-medium text-muted-foreground">Quizzes</span>
              <span className="font-bold">{isStatsLoading ? <Skeleton className="h-5 w-8" /> : stats?.quizzesCompleted}</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileContainer>
  );
}
