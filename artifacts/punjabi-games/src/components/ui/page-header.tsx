import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, showBack, backHref, onBack, action, className = "" }: PageHeaderProps) {
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
              onClick={() => {
                if (onBack) { onBack(); return; }
                backHref ? setLocation(backHref) : window.history.back();
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          <h1 className="text-2xl font-black text-foreground tracking-tight">{title}</h1>
        </div>
        <div className="shrink-0">
          {action || (
            <img
              src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`}
              alt="ਗੁਰਮੁਖੀ ਵੇਹੜਾ"
              className="w-12 h-12 rounded-full border-2 border-primary shadow-sm bg-white relative z-20"
            />
          )}
        </div>
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-sm font-medium pl-1">{subtitle}</p>
      )}
    </div>
  );
}
