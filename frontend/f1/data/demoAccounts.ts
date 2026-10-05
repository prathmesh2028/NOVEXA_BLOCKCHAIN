export interface DemoAccount {
  id: string;
  name: string;
  role: string;
  rolePillClass: string;
  email: string;
  password: string;
}

/**
 * Synthetic pilot credentials used by the development seed.
 * Keep this as the only frontend source for demo account cards and sign-in
 * autofill so the two surfaces cannot drift apart.
 */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  { id: "admin", name: "Arjun Mehta", role: "SYSTEM_ADMIN", rolePillClass: "pill-admin", email: "a.mehta@bel-defence.in", password: "password" },
  { id: "creator", name: "Priya Sharma", role: "PROCUREMENT_SUPPLY_CHAIN_OFFICER", rolePillClass: "pill-creator", email: "p.sharma@bel-defence.in", password: "password" },
  { id: "tech", name: "Rajesh Kumar", role: "QUALITY_INSPECTOR", rolePillClass: "pill-tech", email: "r.kumar@bel-defence.in", password: "password" },
  { id: "auditor", name: "Deepa Nair", role: "AUDITOR", rolePillClass: "pill-auditor", email: "d.nair@bel-defence.in", password: "password" },
];
