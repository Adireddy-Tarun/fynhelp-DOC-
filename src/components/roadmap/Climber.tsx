/**
 * Tiny illustrated climber: red jacket, ink pants, gold backpack.
 * Designed to sit at 50px tall, looking up the slope.
 */
export default function Climber() {
  return (
    <svg
      width="50"
      height="60"
      viewBox="0 0 50 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: "block" }}
    >
      {/* Backpack (gold) */}
      <rect x="11" y="22" width="14" height="16" rx="3" fill="#8B6914" />
      <rect x="11" y="26" width="14" height="2" fill="#1A1008" opacity="0.25" />
      {/* Body / jacket (red) */}
      <path
        d="M18 18 C 14 18 12 22 13 28 L 13 38 C 13 40 15 41 17 41 L 27 41 C 29 41 31 40 31 38 L 31 28 C 32 22 30 18 26 18 Z"
        fill="#C41E1E"
      />
      <path d="M22 18 L 22 41" stroke="#1A1008" strokeWidth="0.6" opacity="0.3" />
      {/* Head (warm beige) */}
      <circle cx="22" cy="13" r="6" fill="#E8C9A1" />
      {/* Hat (ink) */}
      <path
        d="M16 12 C 16 8 18 6 22 6 C 26 6 28 8 28 12 L 28 13 L 16 13 Z"
        fill="#1A1008"
      />
      <ellipse cx="22" cy="13" rx="7" ry="1.2" fill="#1A1008" />
      {/* Pants (ink) */}
      <path d="M14 41 L 16 56 L 20 56 L 21 43 Z" fill="#1A1008" />
      <path d="M30 41 L 28 56 L 24 56 L 23 43 Z" fill="#1A1008" />
      {/* Boots */}
      <ellipse cx="18" cy="57" rx="3.2" ry="1.6" fill="#1A1008" />
      <ellipse cx="26" cy="57" rx="3.2" ry="1.6" fill="#1A1008" />
      {/* Hiking stick (gold) */}
      <line
        x1="34"
        y1="20"
        x2="40"
        y2="50"
        stroke="#8B6914"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Arm holding stick */}
      <path
        d="M30 26 C 33 24 35 22 35 21"
        stroke="#C41E1E"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
