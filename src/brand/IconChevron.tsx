import * as React from "react";

type Props = React.SVGProps<SVGSVGElement> & { strokeWidth?: number };

export default function IconChevron({ strokeWidth = 2, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="1em"
      height="1em"
      aria-hidden="true"
      role="img"
      {...props}
    >
      <path
        d="M8 24 L16 8 L24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
