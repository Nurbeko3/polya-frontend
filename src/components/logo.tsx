import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  whiteText?: boolean;
}

const sizes = {
  sm: { container: "w-8 h-8", icon: "w-4 h-4", text: "text-lg" },
  md: { container: "w-10 h-10", icon: "w-5 h-5", text: "text-xl" },
  lg: { container: "w-12 h-12", icon: "w-6 h-6", text: "text-2xl" },
};

export function Logo({ 
  className = "", 
  size = "md", 
  showText = true,
  whiteText = false 
}: LogoProps) {
  const s = sizes[size];

  return (
    <Link href="/" className={`flex items-center gap-2 hover:opacity-90 transition-opacity ${className}`}>
      <div
        className={`${s.container} rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-purple-600`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={s.icon}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            fill="white"
          />
        </svg>
      </div>
      {showText && (
        <span className={cn(
          s.text, 
          "font-bold",
          whiteText ? "text-white" : "text-slate-900 dark:text-white"
        )}>
          Polya
        </span>
      )}
    </Link>
  );
}
