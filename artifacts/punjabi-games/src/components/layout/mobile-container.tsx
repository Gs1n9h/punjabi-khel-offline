import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  withBottomNav?: boolean;
}

export function MobileContainer({ children, className = "", withBottomNav = false }: MobileContainerProps) {
  return (
    <div className="min-h-[100dvh] bg-background w-full flex justify-center overflow-x-hidden">
      <div 
        className={`w-full max-w-[430px] bg-background relative flex flex-col shadow-2xl shadow-orange-900/5 ${withBottomNav ? 'pb-24' : ''} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
