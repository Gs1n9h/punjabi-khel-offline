import { Link, useLocation } from "wouter";
import { Settings, List, Image as ImageIcon, Mic } from "lucide-react";

export function AdminNav() {
  const [location] = useLocation();

  const adminLinks = [
    { href: "/admin/spinner", label: "Spinner", icon: Settings },
    { href: "/admin/tongue-twisters", label: "Tongue Twisters", icon: Mic },
    { href: "/admin/knowledge-test", label: "Quizzes", icon: List },
    { href: "/admin/submissions", label: "Reviews", icon: Mic },
  ];

  return (
    <div className="flex overflow-x-auto py-4 px-4 gap-3 bg-white border-b-2 border-orange-100 no-scrollbar snap-x">
      {adminLinks.map((link) => {
        const isActive = location === link.href;
        return (
          <Link key={link.href} href={link.href} className="snap-start shrink-0">
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap
                ${isActive 
                  ? "bg-primary text-primary-foreground shadow-md border-b-4 border-[#C25000]" 
                  : "bg-orange-50 text-muted-foreground hover:bg-orange-100 hover:text-primary border-b-4 border-transparent"
                }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
