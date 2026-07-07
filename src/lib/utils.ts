import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function daysUntil(date: Date | string): number {
  const target = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getMatchLabel(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Razoável";
  if (score >= 20) return "Baixo";
  return "Muito Baixo";
}

export function getMatchColor(score: number): string {
  if (score >= 80) return "text-[hsl(var(--growth))]";
  if (score >= 60) return "text-emerald-600";
  if (score >= 40) return "text-yellow-600";
  if (score >= 20) return "text-orange-500";
  return "text-red-500";
}

export const SECTORS = [
  "Tecnologia da Informação",
  "Agronegócio",
  "Saúde",
  "Educação",
  "Indústria",
  "Comércio",
  "Serviços",
  "Construção Civil",
  "Energia",
  "Sustentabilidade",
  "Turismo",
  "Cultura",
  "Comunicação",
  "Transporte",
  "Alimentação",
  "Moda",
  "Beleza e Estética",
  "Fitness e Bem-estar",
  "Consultoria",
  "Outro",
] as const;

export const STAGES = [
  "Início (faturamento até R$ 360k/ano)",
  "Crescimento (R$ 360k a R$ 4,8M/ano)",
  "Maturidade (R$ 4,8M a R$ 78M/ano)",
  "Expansão (acima de R$ 78M/ano)",
] as const;

export const COMPANY_SIZES = [
  "MEI",
  "ME",
  "EPP",
  "Média Empresa",
  "Grande Empresa",
] as const;

export const FUNDING_TYPES = [
  "Subsídio (não precisa devolver)",
  "Financiamento (juros baixos)",
  "Incentivo Fiscal (desconto em impostos)",
  "Crédito Escalonado",
  "Capital de Giro",
  "Investimento (Sócios/Angels)",
] as const;
