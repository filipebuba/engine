import Link from "next/link";
import { ArrowRight, CheckCircle, FileSearch, Target, TrendingUp, Users, Zap, Rocket, Shield, Clock, Star } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Matching Inteligente",
    description:
      "IA que analisa o perfil da sua empresa e encontra os editais com maior chance de aprovação.",
  },
  {
    icon: FileSearch,
    title: "Filtro Avançado",
    description:
      "Busque por setor, estágio, porte, região e tipo de fomento. Encontre exatamente o que precisa.",
  },
  {
    icon: TrendingUp,
    title: "Score de Compatibilidade",
    description:
      "Cada edital recebe uma pontuação de 0 a 100 baseada no perfil completo da sua empresa.",
  },
  {
    icon: Clock,
    title: "Alertas de Prazo",
    description:
      "Notificações automáticas para não perder prazos de inscrição e documentação.",
  },
  {
    icon: Shield,
    title: "Verificação de Elegibilidade",
    description:
      "Análise prévia dos requisitos elimatórios para evitar candidaturas improdutivas.",
  },
  {
    icon: Users,
    title: "Multi-empresa",
    description:
      "Gerencie múltiplas empresas e projetos em uma única plataforma.",
  },
];

const steps = [
  {
    number: "01",
    title: "Crie seu Perfil",
    description:
      "Cadastre os dados da sua empresa: porte, setor, faturamento, localização e objetivos.",
  },
  {
    number: "02",
    title: "IA Analisa",
    description:
      "Nossa inteligência artificial cruza seu perfil com milhares de editais disponíveis.",
  },
  {
    number: "03",
    title: "Receba Matches",
    description:
      "Veja os editais mais compatíveis, ordenados por score de chance de aprovação.",
  },
  {
    number: "04",
    title: "Candidate-se",
    description:
      "Acesse direcionamento para inscrição e acompanhe o status das suas candidaturas.",
  },
];

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para conhecer a plataforma",
    features: [
      "3 matches por mês",
      "Perfil básico da empresa",
      "Filtros essenciais",
      "Alertas de prazo",
    ],
    cta: "Começar Grátis",
    href: "/onboarding",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para empresas que querem crescer",
    features: [
      "Matches ilimitados",
      "Score detalhado com justificativa",
      "Alertas avançados",
      "Histórico de candidaturas",
      "Suporte prioritário",
      "Relatórios mensais",
    ],
    cta: "Assinar Pro",
    href: "/onboarding?plan=pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "R$ 199",
    period: "/mês",
    description: "Para escritórios e consultorias",
    features: [
      "Tudo do Pro",
      "Multi-empresas (até 50)",
      "Dashboard gerencial",
      "API de integração",
      "Consultoria dedicada",
      "SLA garantido",
    ],
    cta: "Falar com Vendas",
    href: "/onboarding?plan=enterprise",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Rocket className="h-6 w-6 text-[hsl(var(--brand))]" />
            <span className="text-xl font-bold gradient-text">Edital Match</span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Funcionalidades
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Como Funciona
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Preços
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Entrar
            </Link>
            <Link
              href="/onboarding"
              className="rounded-md bg-[hsl(var(--brand))] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[hsl(var(--brand-dark))]"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(var(--brand))/5] to-transparent py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Encontre o edital{" "}
                <span className="gradient-text">ideal</span> para sua empresa
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Plataforma inteligente que conecta empresas a editais de fomento,
                subsídios e incentivos fiscais. Aumente suas chances de aprovação
                com matching por IA.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-md bg-[hsl(var(--brand))] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[hsl(var(--brand-dark))] hover:shadow-md"
                >
                  Começar Grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  Ver Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Tudo que você precisa para encontrar oportunidades
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Ferramentas poderosas para aumentar sua taxa de aprovação em editais públicos.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-[hsl(var(--brand))/30] hover:shadow-lg"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--brand))/10]">
                    <feature.icon className="h-6 w-6 text-[hsl(var(--brand))]" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-accent/30 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Como funciona
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Em 4 passos simples, encontre os melhores editais para sua empresa.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-lg font-bold text-white">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Planos para cada fase
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                Comece grátis e escale conforme sua empresa cresce.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-8 transition-all ${
                    plan.highlighted
                      ? "border-[hsl(var(--brand))] bg-card shadow-xl ring-2 ring-[hsl(var(--brand))/20]"
                      : "border-border bg-card hover:border-[hsl(var(--brand))/30] hover:shadow-lg"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(var(--brand))] px-4 py-1 text-xs font-semibold text-white">
                      Mais Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 shrink-0 text-[hsl(var(--growth))]" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`mt-8 block w-full rounded-md py-2.5 text-center text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? "bg-[hsl(var(--brand))] text-white hover:bg-[hsl(var(--brand-dark))]"
                        : "border border-border bg-background text-foreground hover:bg-accent"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-accent/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-[hsl(var(--brand))]" />
                <span className="text-lg font-bold gradient-text">Edital Match</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Conectando empresas a oportunidades de fomento com inteligência artificial.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Produto</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
                    Preços
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
                    Como Funciona
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Empresa</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Legal</h4>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Termos de Uso
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Edital Match. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
