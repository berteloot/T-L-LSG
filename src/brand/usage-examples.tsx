import * as React from "react";
import Logo from "./Logo";

// Example usage patterns for the LSG brand system

export function AppHeader() {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-neutral-paper text-lean-midnight">
      <Logo variant="main" />
      <nav className="text-sm">
        {/* navigation items */}
      </nav>
    </header>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="px-4 py-2 rounded-md bg-lean-blue text-white hover:brightness-95 active:brightness-90 lsg-emphasize"
    />
  );
}

export function AccentChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded bg-accent-aqua text-lean-midnight text-xs">
      {children}
    </span>
  );
}

// Example service icon following the brand guidelines
export function IconWarehouse(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" width="1em" height="1em" {...props}>
      <path d="M4 12 L16 6 L28 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      <rect x="8" y="12" width="16" height="12" rx="2" stroke="currentColor" strokeWidth={2} fill="none" />
      <path d="M12 24 V18 H20 V24" stroke="currentColor" strokeWidth={2} fill="none" />
    </svg>
  );
}
