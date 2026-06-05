import { Link, useLocation } from "wouter";
import { Home, Trophy, Shield } from "lucide-react";
import { useGetMe } from "@/lib/offline-api";

export function BottomNav() {
  const [location] = useLocation();
  const { data: user } = useGetMe();

  const navItems = [
    { href: "/games", icon: Home, label: "ਖੇਡਾਂ" },
    { href: "/leaderboard", icon: Trophy, label: "ਦਰਜਾਬੰਦੀ" },
  ];

  if (user?.role === "admin" || user?.role === "moderator") {
    navItems.push({ href: "/admin", icon: Shield, label: "ਪ੍ਰਬੰਧਕ" });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-orange-100 pb-safe shadow-[0_-4px_20px_rgba(232,114,26,0.1)]">
      <div className="max-w-[900px] mx-auto px-4">
        <div className="flex justify-around items-center h-20">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href) && (item.href !== "/games" || location === "/games" || location.startsWith("/games/"));
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className={`flex flex-col items-center justify-center space-y-1 w-full h-full transition-all ${isActive ? "text-primary -translate-y-1" : "text-muted-foreground hover:text-primary"}`}>
                  <div className={`p-2 rounded-2xl ${isActive ? "bg-orange-100 text-primary shadow-sm" : "bg-transparent"}`}>
                    <item.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
                  </div>
                  <span className={`text-[10px] font-bold tracking-wide ${isActive ? "opacity-100" : "opacity-70"}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
