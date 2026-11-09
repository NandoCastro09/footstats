import { CircleDot, ListOrdered, Target, Trophy, type LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  end: boolean;
  icon: LucideIcon;
}

export const navLinks: NavItem[] = [
  { to: "/", label: "Partidas", end: true, icon: CircleDot },
  { to: "/classificacao", label: "Classificação", end: false, icon: ListOrdered },
  { to: "/palpites", label: "Palpites", end: false, icon: Target },
  { to: "/ligas", label: "Ligas", end: false, icon: Trophy },
];
