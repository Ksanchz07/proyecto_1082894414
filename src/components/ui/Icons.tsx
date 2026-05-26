import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

export function IconLogo({ size = 32, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest} viewBox="0 0 32 32" strokeWidth={1.5}>
      <rect x="6" y="3" width="20" height="26" rx="3" />
      <path d="M11 10h10M11 14h10M11 18h6" />
      <circle cx="22" cy="22" r="4" fill="currentColor" stroke="none" opacity="0.18" />
      <path d="M20.4 22.2l1.2 1.2 2.4-2.4" />
    </svg>
  );
}

export function IconHome({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 9.5V20a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9.5" />
    </svg>
  );
}

export function IconInvoice({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M6 3h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
      <path d="M14 3v6h6" />
      <path d="M8 14h8M8 17h5" />
    </svg>
  );
}

export function IconPlus({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconUser({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}

export function IconUsers({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.4 2.9-6 6.5-6s6.5 2.6 6.5 6" />
      <circle cx="17" cy="9" r="3" />
      <path d="M21.5 18.5c0-2.6-1.9-4.8-4.5-5" />
    </svg>
  );
}

export function IconShield({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconDatabase({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  );
}

export function IconChart({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-5 3 3 5-7" />
    </svg>
  );
}

export function IconLogout({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M15 12H5" />
    </svg>
  );
}

export function IconPrint({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M7 9V3h10v6" />
      <rect x="4" y="9" width="16" height="9" rx="2" />
      <path d="M7 14h10v7H7z" />
    </svg>
  );
}

export function IconArrowLeft({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

export function IconArrowRight({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function IconEye({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEyeOff({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M17.94 17.94A10.5 10.5 0 0112 19c-6.5 0-10-7-10-7a18.6 18.6 0 014.06-5" />
      <path d="M9.9 5.08A10.5 10.5 0 0112 5c6.5 0 10 7 10 7a18.5 18.5 0 01-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

export function IconEdit({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export function IconTrash({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconCheck({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function IconAlert({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M12 2L1 22h22L12 2z" />
      <path d="M12 9v5M12 18h.01" />
    </svg>
  );
}

export function IconInfo({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </svg>
  );
}

export function IconCopy({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

export function IconMenu({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function IconClose({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconKey({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="8" cy="15" r="5" />
      <path d="M12.5 11.5L21 3" />
      <path d="M16 8l3 3M18 6l3 3" />
    </svg>
  );
}

export function IconSearch({ size, ...rest }: IconProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-5-5" />
    </svg>
  );
}
