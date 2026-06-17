import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Compass,
  GraduationCap,
  Handshake,
  HelpCircle,
  LibraryBig,
  LineChart,
  MapPinned,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import ElysiumLogo from "@/components/elysium/ElysiumLogo";
import LandingAuthCard from "@/components/landing/LandingAuthCard";
import StudentOsPreview from "@/components/landing/StudentOsPreview";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Tools", href: "#tools" },
  { label: "Benefits", href: "#benefits" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Sign up", href: "#access" },
];

const productPillars = [
  {
    title: "Academic planning",
    body: "Track deadlines, exams, study sessions, guides, flashcards, GPA tools, and what to do next.",
    icon: BookOpenCheck,
  },
  {
    title: "Campus connection",
    body: "Find shared activities, peer helpers, classmates, and student-led sessions without starting from zero.",
    icon: Users,
  },
  {
    title: "Support discovery",
    body: "Separate trusted private tutors, opted-in peer helpers, university resources, and AI guidance clearly.",
    icon: HelpCircle,
  },
];

const tools = [
  {
    title: "Study planner",
    body: "Turn courses, tasks, and exam windows into a daily plan.",
    icon: CalendarDays,
  },
  {
    title: "Homework and exam tracker",
    body: "Keep deadlines, reminders, and urgent next steps visible.",
    icon: BellRing,
  },
  {
    title: "Shared activities",
    body: "Join football, coffee, hobby, and campus events with students nearby.",
    icon: Handshake,
  },
  {
    title: "Peer and tutor matching",
    body: "Find help from students, helpers, and tutors with clear roles.",
    icon: GraduationCap,
  },
  {
    title: "Campus resources",
    body: "Open guides, useful links, and terms without digging through portals.",
    icon: LibraryBig,
  },
  {
    title: "Progress dashboard",
    body: "See what is coming, what is complete, and where you need support.",
    icon: LineChart,
  },
];

const benefits = [
  {
    title: "Less stress",
    body: "Deadlines, sessions, and social plans live in one connected student context.",
  },
  {
    title: "Better organization",
    body: "The home screen summarizes your day instead of dropping you into an empty calendar.",
  },
  {
    title: "Easier connection",
    body: "Students can discover people around courses, interests, language, and campus life.",
  },
  {
    title: "Faster help",
    body: "Elysium routes questions to guides, tools, tutors, peer helpers, or university resources.",
  },
];

const steps = [
  {
    title: "Create your account",
    body: "Sign up with email or Google and choose your university context.",
  },
  {
    title: "Add courses and interests",
    body: "Tell Elysium what you study, what you need help with, and what kind of campus life you want.",
  },
  {
    title: "Stay organized and connected",
    body: "Use one dashboard for tasks, events, study plans, support, reminders, and next actions.",
  },
];

const studentScenarios = [
  {
    title: "First week clarity",
    body: "A new student sees campus resources, useful terms, peer helpers, and friendly activities in one place.",
  },
  {
    title: "Exam season focus",
    body: "A student connects deadlines, flashcards, study sessions, tutor options, and reminders without opening five tools.",
  },
  {
    title: "Social confidence",
    body: "A commuting student can join a shared activity or study group before campus starts feeling invisible.",
  },
];

export default function LandingPage() {
  useLandingMotion();

  return (
    <main className="landing-page">
      <LandingNav />

      <section className="landing-hero landing-grid-bg">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 pb-4 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:gap-10 lg:px-8 lg:pb-12 lg:pt-10">
          <div className="min-w-0 text-white">
            <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-6xl">
              University life, organized in one student OS.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-xl sm:leading-8">
              Elysium helps students manage studies, events, tasks, resources, peer connection, tutor support,
              and personal progress from one calm campus command center.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="landing-primary-button h-12 px-6 text-base">
                <Link to="/register">
                  Get Started
                  <ArrowRight data-icon="inline-end" className="size-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 border-white/[0.18] bg-white/[0.08] px-6 text-base text-white hover:bg-white/[0.14] hover:text-white">
                <a href="#tools">Explore Tools</a>
              </Button>
            </div>
            <div className="mt-8 hidden max-w-2xl gap-3 lg:grid lg:grid-cols-3">
              {["Academic planning", "Campus connection", "Personal progress"].map((item) => (
                <div key={item} className="landing-hero-chip rounded-lg border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-semibold text-white/[0.78]">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <StudentOsPreview className="landing-reveal" />
        </div>
      </section>

      <section id="platform" className="landing-section bg-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <SectionIntro
            icon={Compass}
            title="A campus compass, not another portal."
            body="Elysium connects academic planning, social discovery, support, tools, and guidance around the student. Every module answers a simple question: what should I do next?"
          />
          <div className="grid gap-3 md:grid-cols-3">
            {productPillars.map((pillar) => (
              <FeatureCard key={pillar.title} {...pillar} />
            ))}
          </div>
        </div>
      </section>

      <section id="tools" className="landing-section bg-muted/35">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Everything students reach for, grouped by real campus needs."
            body="The tools are connected enough to reduce friction, but separated enough to stay understandable."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.title} {...tool} />
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="landing-section bg-background">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)] lg:px-8">
          <div>
            <SectionHeader
              align="left"
              title="Designed to make university feel easier to navigate."
              body="Students should understand deadlines, find people, ask for help, and move through campus life with less uncertainty."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <BenefitItem key={benefit.title} {...benefit} />
              ))}
            </div>
          </div>
          <div className="landing-benefit-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">Clarity loop</p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">From lost to next step</h3>
              </div>
              <span className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <MapPinned className="size-5" aria-hidden="true" />
              </span>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col gap-4">
              {["Know what is due", "Find where to get help", "Meet people around real plans", "Keep progress visible"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="landing-section bg-muted/35">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="How it works"
            body="A short setup turns the platform from a directory into a personal campus operating system."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
              <StepCard key={step.title} index={index + 1} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Student-focused proof without fake traction."
            body="Until real testimonials exist, the landing page should describe realistic student situations instead of inventing names, numbers, or logos."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {studentScenarios.map((scenario) => (
              <ScenarioCard key={scenario.title} {...scenario} />
            ))}
          </div>
        </div>
      </section>

      <section id="access" className="landing-section bg-muted/35">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(360px,0.7fr)] lg:px-8">
          <div>
            <SectionIntro
              icon={ShieldCheck}
              title="A trustworthy starting point for new and returning students."
              body="The auth area is part of the product story: students are creating a private space that can become academic planner, social hub, support network, and personal dashboard."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Clear role separation for tutors and peer helpers",
                "Profile-controlled visibility",
                "Trilingual product direction",
                "Accessible keyboard and focus states",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-semibold text-foreground shadow-sm">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <LandingAuthCard />
        </div>
      </section>

      <section className="landing-final-cta">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Sparkles className="mx-auto size-9 text-cyan-200" aria-hidden="true" />
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Start building a clearer university life.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/[0.68]">
            Create your account, add your courses and interests, and let Elysium connect the tools, people,
            resources, and reminders that make campus easier.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild className="landing-primary-button h-12 px-6 text-base">
              <Link to="/register">
                Sign Up
                <ArrowRight data-icon="inline-end" className="size-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function LandingNav() {
  const refs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const [activeIndex, setActiveIndex] = useState(0);

  const moveIndicator = (index) => {
    const node = refs.current[index];
    if (!node) return;
    setIndicator({ left: node.offsetLeft, width: node.offsetWidth, opacity: 1 });
  };

  useEffect(() => {
    moveIndicator(activeIndex);
    const handleResize = () => moveIndicator(activeIndex);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;

    const sections = navItems
      .map((item, index) => {
        const node = document.querySelector(item.href);
        return node ? { node, index } : null;
      })
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!activeEntry) return;
        const match = sections.find((section) => section.node === activeEntry.target);
        if (match) setActiveIndex(match.index);
      },
      { rootMargin: "-28% 0px -55% 0px", threshold: [0.08, 0.18, 0.32] },
    );

    sections.forEach((section) => observer.observe(section.node));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071013]/[0.92] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Elysium home">
          <ElysiumLogo size={38} className="rounded-sm" />
        </Link>

        <nav
          className="landing-hub relative hidden items-center rounded-lg border border-white/10 bg-white/[0.055] p-1 lg:flex"
          aria-label="Landing page sections"
          onMouseLeave={() => moveIndicator(activeIndex)}
        >
          <span
            className="landing-hub-indicator"
            style={{
              opacity: indicator.opacity,
              width: `${indicator.width}px`,
              transform: `translateX(${indicator.left}px)`,
            }}
            aria-hidden="true"
          />
          {navItems.map((item, index) => (
            <a
              key={item.href}
              ref={(node) => {
                refs.current[index] = node;
              }}
              href={item.href}
              className="relative z-10 rounded-md px-3.5 py-2 text-sm font-medium text-white/[0.68] transition-colors duration-150 hover:text-white focus-visible:text-white"
              onMouseEnter={() => moveIndicator(index)}
              onFocus={() => moveIndicator(index)}
              onClick={() => setActiveIndex(index)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden text-white/[0.78] hover:bg-white/10 hover:text-white sm:inline-flex">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild className="landing-primary-button h-10">
            <Link to="/register">Sign up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function SectionHeader({ title, body, align = "center" }) {
  return (
    <div data-landing-reveal className={cn("mx-auto max-w-3xl", align === "center" ? "text-center" : "mx-0 text-left")}>
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{body}</p>
    </div>
  );
}

function SectionIntro({ icon: Icon, title, body }) {
  return (
    <div data-landing-reveal className="max-w-2xl">
      <div className="flex items-start gap-4">
        <span className="landing-motion-icon flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
      </div>
      <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{body}</p>
    </div>
  );
}

function FeatureCard({ title, body, icon: Icon }) {
  return (
    <article data-landing-reveal className="landing-info-card landing-motion-card">
      <span className="landing-motion-icon inline-flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}

function ToolCard({ title, body, icon: Icon }) {
  return (
    <article data-landing-reveal className="landing-tool-card landing-motion-card group">
      <div className="flex items-start justify-between gap-4">
        <span className="landing-motion-icon flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden="true" />
      </div>
      <h3 className="mt-6 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}

function BenefitItem({ title, body }) {
  return (
    <article data-landing-reveal className="landing-motion-card rounded-lg border border-border bg-card p-5 shadow-sm">
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}

function StepCard({ index, title, body }) {
  return (
    <article data-landing-reveal className="landing-motion-card rounded-lg border border-border bg-card p-6 shadow-sm">
      <span className="landing-step-number flex size-10 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
        {index}
      </span>
      <h3 className="mt-6 text-xl font-bold text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}

function ScenarioCard({ title, body }) {
  return (
    <article data-landing-reveal className="landing-motion-card rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="landing-motion-icon flex size-9 items-center justify-center rounded-md bg-secondary/20 text-secondary-foreground">
          <MessageCircle className="size-4" aria-hidden="true" />
        </span>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{body}</p>
    </article>
  );
}

function useLandingMotion() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll("[data-landing-reveal]"));
    if (!targets.length) return undefined;

    targets.forEach((target, index) => {
      target.style.setProperty("--reveal-index", index % 6);
    });

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);
}
