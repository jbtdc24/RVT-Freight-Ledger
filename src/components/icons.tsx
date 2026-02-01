import type { SVGProps } from "react";

export function RvtLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      {...props}
    >
      <rect width="100" height="100" rx="20" fill="currentColor" />
      <text
        x="50"
        y="55"
        fontFamily="Space Grotesk, sans-serif"
        fontSize="40"
        fill="hsl(var(--background))"
        textAnchor="middle"
        dominantBaseline="middle"
        fontWeight="bold"
      >
        RVT
      </text>
    </svg>
  );
}
