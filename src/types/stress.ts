export type RoleName = 'Judge' | 'Advocate' | 'Businessperson' | 'Journalist' | 'Police';

export type IntensityLevel = 'Mild' | 'Severe' | 'Extreme';

export type VerdictType = 'Resilient' | 'Strained' | 'Fragile' | 'Breaks';

export type PriorityType = 'Now' | 'Soon' | 'Later';

export interface RoleAnalysis {
  role: RoleName;
  holds: number;
  sees: string;
  would_do: string;
  turns_when: string;
}

export interface CascadeShock {
  when: string;
  shock: string;
  impact: string;
  severity: number;
  hits: string[];
}

export interface FixItem {
  action: string;
  why: string;
  priority: PriorityType;
}

export interface StressTestResult {
  title: string;
  summary: string;
  score: number;
  verdict: VerdictType;
  roles: RoleAnalysis[];
  clashes: string[];
  cascade: CascadeShock[];
  breaking_point: string;
  fixes: FixItem[];
  blind_spots: string[];
}

export const ROLE_CONFIG: Record<
  RoleName,
  {
    color: string;
    hexColor: number;
    accentBg: string;
    accentBorder: string;
    description: string;
    icon: string;
  }
> = {
  Judge: {
    color: '#e8b84a',
    hexColor: 0xe8b84a,
    accentBg: 'rgba(232, 184, 74, 0.12)',
    accentBorder: 'rgba(232, 184, 74, 0.45)',
    description: 'Jurisdiction, admissibility, equity, delay & court precedent',
    icon: 'Scale'
  },
  Advocate: {
    color: '#4aa3ff',
    hexColor: 0x4aa3ff,
    accentBg: 'rgba(74, 163, 255, 0.12)',
    accentBorder: 'rgba(74, 163, 255, 0.45)',
    description: 'Strategy, limitation, procedural remedies & file vulnerabilities',
    icon: 'ShieldAlert'
  },
  Businessperson: {
    color: '#4ade80',
    hexColor: 0x4ade80,
    accentBg: 'rgba(74, 222, 128, 0.12)',
    accentBorder: 'rgba(74, 222, 128, 0.45)',
    description: 'Liquidity, counterparty relationships, enterprise valuation & exit options',
    icon: 'TrendingDown'
  },
  Journalist: {
    color: '#ff5fa2',
    hexColor: 0xff5fa2,
    accentBg: 'rgba(255, 95, 162, 0.12)',
    accentBorder: 'rgba(255, 95, 162, 0.45)',
    description: 'Public interest, headline framing, leaks & public narrative control',
    icon: 'Megaphone'
  },
  Police: {
    color: '#ff7a3d',
    hexColor: 0xff7a3d,
    accentBg: 'rgba(255, 122, 61, 0.12)',
    accentBorder: 'rgba(255, 122, 61, 0.45)',
    description: 'Cognisable offence test, evidence preservation, FIR & coercive levers',
    icon: 'Siren'
  }
};
