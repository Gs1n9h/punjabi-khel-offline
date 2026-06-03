import { Link, useLocation } from "wouter";
import { LayoutDashboard, Dices, Mic, BookOpen, Headphones, Users } from "lucide-react";

export function AdminNav() {
  const [location] = useLocation();

  const adminLinks = [
    { href: "/admin", label: "ਸਾਰਾਂਸ਼", icon: LayoutDashboard, exact: true },
    { href: "/admin/spinner", label: "ਚਰਖਾ", icon: Dices },
    { href: "/admin/tongue-twisters", label: "ਆਖੀਂ ਪਰ ਅੜੀਂ ਨਾਂ", icon: Mic },
    { href: "/admin/submissions", label: "ਪੰਛੀਤੀ", icon: Headphones },
    { href: "/admin/users", label: "ਉਪਯੋਗਕਰਤਾ", icon: Users },
  ];

  return (
    <div className="flex overflow-x-auto py-4 px-4 gap-3 bg-white border-b-2 border-orange-100 no-scrollbar snap-x">
      {adminLinks.map((link) => {
        const isActive = link.exact ? location === link.href : location.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href} className="snap-start shrink-0">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap
                ${isActive
                  ? "bg-primary text-primary-foreground shadow-md border-b-4 border-[#C25000]"
                  : "bg-orange-50 text-muted-foreground hover:bg-orange-100 hover:text-primary border-b-4 border-transparent"
                }`}
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
