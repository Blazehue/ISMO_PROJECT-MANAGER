import type { ProjectStatus, TaskPriority, TaskStatus } from './enums';

/**
 * Design tokens shared by web (Tailwind/shadcn) and mobile (React Native Paper)
 * so both clients speak the same visual language: a near-monochrome UI with
 * ink-black primary actions, soft lavender accents and pastel status pills.
 */
export const colors = {
  brand: {
    50: '#F6F4FF',
    100: '#EEEAFF',
    200: '#DEDAFE',
    300: '#C6BEFC',
    400: '#A99BFA',
    500: '#8E7CF8',
    600: '#7563EC',
    700: '#5F4FD1',
    800: '#4C3FA8',
    900: '#3B3285',
  },
  ink: '#111113',
  /** Electric lime: the one loud accent (CTA arrow tiles, highlights, active states). */
  lime: '#D9FF5C',
  limeInk: '#1A1F05',
  /** Extra hues for colourful cards and icon tiles. */
  hues: {
    lime: { bg: '#EEFFC2', fg: '#4D6B00', solid: '#D9FF5C' },
    lavender: { bg: '#EEEAFF', fg: '#5F4FD1', solid: '#A99BFA' },
    peach: { bg: '#FFE7DA', fg: '#B4532A', solid: '#FFB38A' },
    sky: { bg: '#DDF0FF', fg: '#1F6FB2', solid: '#7CC4FF' },
    mint: { bg: '#D9F7EA', fg: '#17805A', solid: '#6EE7B7' },
    rose: { bg: '#FFE0EA', fg: '#B8295B', solid: '#FF8FB1' },
  },
  light: {
    /** Cool grey canvas behind white cards (as in the reference). */
    canvas: '#EBEFF5',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    subtle: '#F7F7F8',
    muted: '#F2F2F4',
    border: '#E9E9EC',
    text: '#111113',
    textMuted: '#71717A',
  },
  dark: {
    canvas: '#0E0F13',
    background: '#0B0B0E',
    surface: '#121216',
    subtle: '#17171C',
    muted: '#1D1D23',
    border: '#26262D',
    text: '#EDEDF0',
    textMuted: '#8E8E99',
  },
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
} as const;

export const radius = { sm: 6, md: 10, lg: 12, xl: 16, full: 999 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export interface ToneColors {
  /** Text / icon colour. */
  fg: string;
  /** Soft pill background. */
  bg: string;
}

export interface BadgeTone {
  label: string;
  light: ToneColors;
  dark: ToneColors;
  /** Solid accent (chart segments, dots). */
  solid: string;
}

const tone = (label: string, solid: string, light: ToneColors, dark: ToneColors): BadgeTone => ({
  label,
  solid,
  light,
  dark,
});

// Pastel palettes; the dark variants are translucent tints with lighter text.
const pastel = {
  gray: tone('', '#A1A1AA', { fg: '#52525B', bg: '#F2F2F4' }, { fg: '#B4B4BE', bg: 'rgba(161,161,170,0.14)' }),
  pink: tone('', '#EC4899', { fg: '#BE185D', bg: '#FCE7F3' }, { fg: '#F9A8D4', bg: 'rgba(236,72,153,0.16)' }),
  amber: tone('', '#F59E0B', { fg: '#B45309', bg: '#FEF3C7' }, { fg: '#FCD34D', bg: 'rgba(245,158,11,0.16)' }),
  blue: tone('', '#3B82F6', { fg: '#1D4ED8', bg: '#DBEAFE' }, { fg: '#93C5FD', bg: 'rgba(59,130,246,0.16)' }),
  green: tone('', '#22C55E', { fg: '#15803D', bg: '#DCFCE7' }, { fg: '#86EFAC', bg: 'rgba(34,197,94,0.15)' }),
  red: tone('', '#EF4444', { fg: '#B91C1C', bg: '#FEE2E2' }, { fg: '#FCA5A5', bg: 'rgba(239,68,68,0.16)' }),
};

const withLabel = (base: BadgeTone, label: string): BadgeTone => ({ ...base, label });

export const projectStatusTone: Record<ProjectStatus, BadgeTone> = {
  NOT_STARTED: withLabel(pastel.pink, 'Not Started'),
  IN_PROGRESS: withLabel(pastel.amber, 'In Progress'),
  COMPLETED: withLabel(pastel.green, 'Completed'),
};

export const taskStatusTone: Record<TaskStatus, BadgeTone> = {
  PENDING: withLabel(pastel.pink, 'Pending'),
  IN_PROGRESS: withLabel(pastel.amber, 'In Progress'),
  COMPLETED: withLabel(pastel.green, 'Completed'),
};

export const taskPriorityTone: Record<TaskPriority, BadgeTone> = {
  LOW: withLabel(pastel.blue, 'Low'),
  MEDIUM: withLabel(pastel.gray, 'Medium'),
  HIGH: withLabel(pastel.red, 'High'),
};
