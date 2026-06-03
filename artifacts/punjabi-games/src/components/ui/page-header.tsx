import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, showBack, backHref, action, className = "" }: PageHeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <div className={`px-6 py-6 bg-white border-b-2 border-[#e8e0d0] z-10 sticky top-0 ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-[#f5f0e0] text-primary hover:bg-[#ebe5d0] hover:text-primary -ml-2 shrink-0"
              onClick={() => backHref ? setLocation(backHref) : window.history.back()}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          <h1 className="text-2xl font-black text-foreground tracking-tight">{title}</h1>
        </div>
        {action && <div>{action}</div>}
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-sm font-medium pl-1">{subtitle}</p>
      )}
    </div>
  );
}
