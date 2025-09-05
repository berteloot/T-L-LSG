import * as React from "react";
import IconChevron from "./IconChevron";

type Props = {
  variant?: "main" | "stacked" | "shorthand";
  color?: string; // CSS color token
  size?: number; // px height
  title?: string;
};

export default function Logo({
  variant = "main",
  color = "var(--c-lean-blue)",
  size = 28,
  title = "Lean Solutions Group"
}: Props) {
  const common = { color };

  if (variant === "shorthand") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px" /* safe area */,
          color
        }}
        aria-label={title}
      >
        <IconChevron strokeWidth={2} style={{ width: size, height: size }} />
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600 }}>
          LSG
        </span>
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 10px",
          color
        }}
        aria-label={title}
      >
        <IconChevron strokeWidth={2} style={{ width: size, height: size }} />
        <div style={{ display: "grid", lineHeight: 1 }}>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: 16
            }}
          >
            Lean Solutions
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 400,
              fontSize: 12,
              opacity: 0.9
            }}
          >
            Group
          </span>
        </div>
      </div>
    );
  }

  // main lockup
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        ...common
      }}
      aria-label={title}
    >
      <IconChevron strokeWidth={2} style={{ width: size, height: size }} />
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontWeight: 700,
          letterSpacing: 0.2
        }}
      >
        Lean Solutions Group
      </span>
    </div>
  );
}
