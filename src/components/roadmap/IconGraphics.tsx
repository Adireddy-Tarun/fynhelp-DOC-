import type { GraphicKey } from "./roadmapData";

/**
 * Inline SVG graphics for each product on the roadmap mountain.
 * All graphics are 32x32, rendered in white, designed to sit on a
 * gradient background inside the 3D glassmorphic icon.
 */
export default function IconGraphic({ kind }: { kind: GraphicKey }) {
  const stroke = "#FFFFFF";
  const fill = "#FFFFFF";
  const common = {
    width: 32,
    height: 32,
    viewBox: "0 0 32 32",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
  };

  switch (kind) {
    case "droplet":
      return (
        <svg {...common}>
          <path
            d="M16 4c-3 5-7 8.5-7 13a7 7 0 0 0 14 0c0-4.5-4-8-7-13z"
            fill={fill}
            opacity="0.95"
          />
          <path
            d="M11 23c1.5 1 3 1.2 5 .6"
            stroke={stroke}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      );
    case "trend-up":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="11" stroke={stroke} strokeWidth="1.5" opacity="0.5" />
          <path
            d="M10 19l4-4 3 3 5-6"
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M19 12h4v4" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "coins":
      return (
        <svg {...common}>
          <ellipse cx="13" cy="22" rx="7" ry="2.5" fill={fill} opacity="0.9" />
          <ellipse cx="13" cy="18" rx="7" ry="2.5" fill={fill} opacity="0.7" />
          <ellipse cx="13" cy="14" rx="7" ry="2.5" fill={fill} />
          <circle cx="22" cy="10" r="5" stroke={stroke} strokeWidth="1.6" />
          <line x1="25.5" y1="13.5" x2="28" y2="16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "doc-stamp":
      return (
        <svg {...common}>
          <path
            d="M9 5h10l4 4v18H9z"
            fill={fill}
            opacity="0.92"
          />
          <path d="M19 5v4h4" stroke="#1A1008" strokeWidth="1" opacity="0.3" />
          <path
            d="M13 18l2.5 2.5L21 15"
            stroke="#1A1008"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "shield-scales":
      return (
        <svg {...common}>
          <path
            d="M16 4l9 3v8c0 6-4 10-9 13-5-3-9-7-9-13V7l9-3z"
            stroke={stroke}
            strokeWidth="1.6"
            fill="rgba(255,255,255,0.15)"
          />
          <line x1="16" y1="11" x2="16" y2="20" stroke={stroke} strokeWidth="1.4" />
          <path d="M11 13h10" stroke={stroke} strokeWidth="1.4" />
          <circle cx="11" cy="16" r="1.2" fill={fill} />
          <circle cx="21" cy="16" r="1.2" fill={fill} />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <circle cx="16" cy="9" r="3" fill={fill} />
          <path d="M10 22c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="7" cy="13" r="2.4" fill={fill} opacity="0.85" />
          <circle cx="25" cy="13" r="2.4" fill={fill} opacity="0.85" />
          <path d="M3 24c0-2.4 1.8-4.4 4-4.4M29 24c0-2.4-1.8-4.4-4-4.4" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>
      );
    case "brain-circuit":
      return (
        <svg {...common}>
          <path
            d="M11 8a4 4 0 0 0-3 7 4 4 0 0 0 3 7h10a4 4 0 0 0 3-7 4 4 0 0 0-3-7H11z"
            stroke={stroke}
            strokeWidth="1.6"
            fill="rgba(255,255,255,0.12)"
          />
          <circle cx="12" cy="14" r="1.4" fill={fill} />
          <circle cx="20" cy="14" r="1.4" fill={fill} />
          <circle cx="16" cy="19" r="1.4" fill={fill} />
          <path d="M12 14h8M16 14v5" stroke={stroke} strokeWidth="1.2" opacity="0.7" />
        </svg>
      );
    case "globe-rocket":
      return (
        <svg {...common}>
          <circle cx="14" cy="18" r="8" stroke={stroke} strokeWidth="1.5" />
          <path d="M6 18h16M14 10c-3 4-3 12 0 16M14 10c3 4 3 12 0 16" stroke={stroke} strokeWidth="1.2" opacity="0.7" />
          <path
            d="M22 6l4-1-1 4-3 3-3-3 3-3z"
            fill={fill}
          />
          <circle cx="22" cy="9" r="0.9" fill="#1A1008" opacity="0.4" />
        </svg>
      );
    case "bank-nodes":
      return (
        <svg {...common}>
          <path d="M5 13l11-6 11 6v2H5v-2z" fill={fill} />
          <rect x="7" y="16" width="2.5" height="8" fill={fill} />
          <rect x="12" y="16" width="2.5" height="8" fill={fill} />
          <rect x="17.5" y="16" width="2.5" height="8" fill={fill} />
          <rect x="22.5" y="16" width="2.5" height="8" fill={fill} />
          <rect x="5" y="25" width="22" height="2" fill={fill} />
        </svg>
      );
    case "handshake":
      return (
        <svg {...common}>
          <path
            d="M4 14l5-4 4 3 4-3 5 4 5-2v8l-5 2-5-3-3 2-3-2-5 3-5-2v-6z"
            fill={fill}
            opacity="0.95"
          />
          <path d="M13 13l3 3 3-3" stroke="#1A1008" strokeWidth="1" opacity="0.3" />
        </svg>
      );
    case "chat-spark":
      return (
        <svg {...common}>
          <path
            d="M5 9a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-9l-5 4v-4H9a4 4 0 0 1-4-4V9z"
            fill={fill}
          />
          <text x="13" y="17" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="9" fill="#C41E1E">
            N
          </text>
          <path d="M22 6l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" fill="#FFD700" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common}>
          <rect x="4" y="9" width="24" height="16" rx="2" fill={fill} />
          <rect x="4" y="9" width="24" height="4" fill="#1A1008" opacity="0.15" />
          <circle cx="23" cy="17" r="2" fill="#1A1008" opacity="0.4" />
          <text x="9" y="20" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="9" fill="#1A1008">
            ₹
          </text>
        </svg>
      );
    case "branching":
      return (
        <svg {...common}>
          <circle cx="7" cy="16" r="2.2" fill={fill} />
          <circle cx="22" cy="8" r="2.2" fill={fill} />
          <circle cx="22" cy="24" r="2.2" fill={fill} />
          <path d="M9 15l11-6M9 17l11 6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M20 7l2 2 3-3" stroke="#1A1008" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="22" height="14" rx="2" fill={fill} />
          <path d="M12 11V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" stroke={stroke} strokeWidth="1.6" />
          <rect x="13" y="16" width="6" height="4" rx="1" fill="#C41E1E" />
          <text x="14" y="19.4" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="3.4" fill="#FFFFFF">
            CA
          </text>
        </svg>
      );
    default:
      return null;
  }
}
