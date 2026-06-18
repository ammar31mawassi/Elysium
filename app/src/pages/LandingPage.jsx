import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Compass,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  LibraryBig,
  MessageCircle,
  Network,
  NotebookTabs,
  Moon,
  Sparkles,
  Sun,
  Target,
  Users,
  Zap,
} from "lucide-react";
import ElysiumLogo from "@/components/elysium/ElysiumLogo";
import StudentOsPreview from "@/components/landing/StudentOsPreview";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/ThemeContext";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Tools", href: "#tools" },
  { label: "Organize", href: "#organize" },
  { label: "Connect", href: "#connect" },
  { label: "Start", href: "#start" },
];

const featureCards = [
  {
    title: "Academic organization",
    body: "Track exams, homework, schedules, notes, study sessions, flashcards, and reminders without scattering your day across tabs.",
    icon: BookOpenCheck,
    accent: "cyan",
  },
  {
    title: "Social and campus life",
    body: "Discover events, shared activities, campus plans, and interest-based groups that make university feel easier to enter.",
    icon: Handshake,
    accent: "amber",
  },
  {
    title: "Peer and tutor connection",
    body: "Find classmates, study partners, private tutors, and peer helpers with clear roles and useful context.",
    icon: GraduationCap,
    accent: "mint",
  },
  {
    title: "Personal dashboard",
    body: "See what matters today: deadlines, joined events, help options, reminders, courses, and next actions in one calm place.",
    icon: LayoutDashboard,
    accent: "blue",
  },
];

const toolWidgets = [
  { title: "Exam planner", detail: "Study windows, countdowns, and course priorities.", icon: CalendarDays },
  { title: "Homework reminders", detail: "Due dates stay visible before they become emergencies.", icon: BellRing },
  { title: "Notes and guides", detail: "Course resources, links, terms, and saved guides.", icon: NotebookTabs },
  { title: "Study groups", detail: "Create sessions and see who is already joining.", icon: Users },
  { title: "Tutor matching", detail: "Surface relevant tutors and peer helpers by course.", icon: GraduationCap },
  { title: "Campus events", detail: "Activities, interests, and shared lists around campus life.", icon: Compass },
];

const organizationFlow = [
  {
    title: "Know what is next",
    body: "Elysium pulls deadlines, events, sessions, and reminders into a single student timeline.",
    icon: Clock3,
  },
  {
    title: "Choose the right action",
    body: "Each widget points to a realistic next step: revise, ask, join, schedule, or get help.",
    icon: Target,
  },
  {
    title: "Keep momentum visible",
    body: "Progress, urgent tasks, and upcoming plans stay readable on desktop and mobile.",
    icon: Zap,
  },
];

const connectionCards = [
  {
    title: "Classmates",
    body: "Meet students around shared courses, language, year, and study goals.",
    icon: Users,
  },
  {
    title: "Tutors",
    body: "Find support by subject while keeping tutor and peer-helper roles distinct.",
    icon: GraduationCap,
  },
  {
    title: "Interest circles",
    body: "Turn interests into low-pressure activities, study plans, and campus moments.",
    icon: Network,
  },
  {
    title: "Study partners",
    body: "Join sessions before exams, labs, assignments, and high-focus weeks.",
    icon: MessageCircle,
  },
];

const timelineRows = [
  { time: "09:00", title: "Physics lab prep", meta: "Homework reminder", icon: BellRing },
  { time: "12:30", title: "Algorithms study sprint", meta: "Study group with 4 classmates", icon: Users },
  { time: "16:15", title: "Tutor match available", meta: "Data Structures", icon: GraduationCap },
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <LandingNav />

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-inner">
          <HeroReveal className="landing-hero-copy">
            <h1 id="landing-title">
              <span>Everything</span>
              <span>students need,</span>
              <span>in one place.</span>
            </h1>
            <p>
              Elysium brings academic life, social plans, tasks, exams, homework, events,
              study groups, tutors, peer connections, and interests into one organized student hub.
            </p>
            <div className="landing-hero-actions" aria-label="Landing page actions">
              <AnimatedAction>
                <Button asChild className="landing-primary-button h-12 px-6 text-base">
                  <Link to="/register">
                    Get Started
                    <ArrowRight data-icon="inline-end" className="size-4 rtl:rotate-180" aria-hidden="true" />
                  </Link>
                </Button>
              </AnimatedAction>
              <AnimatedAction>
                <Button asChild variant="outline" className="landing-secondary-button h-12 px-6 text-base">
                  <Link to="/login">Sign In</Link>
                </Button>
              </AnimatedAction>
              <ThemeToggle className="landing-mobile-theme-toggle" showText />
            </div>
          </HeroReveal>

          <HeroReveal className="landing-hero-product" delay={0.12}>
            <StudentOsPreview />
          </HeroReveal>
        </div>
      </section>

      <section id="tools" className="landing-section landing-section-tools" aria-labelledby="tools-title">
        <div className="landing-container">
          <SectionHeader
            eager
            title="A toolset built around real student life."
            body="The page is not another portal. It is a launchpad for the academic, social, and support workflows students already juggle every week."
          />
          <div className="landing-feature-grid">
            {featureCards.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
          <Reveal className="landing-tool-strip" delay={0.08}>
            {toolWidgets.map((tool, index) => (
              <ToolPill key={tool.title} tool={tool} index={index} />
            ))}
          </Reveal>
        </div>
      </section>

      <section id="organize" className="landing-section landing-section-organize" aria-labelledby="organize-title">
        <div className="landing-container landing-split">
          <Reveal className="landing-split-copy">
            <SectionKicker icon={CheckCircle2} text="Stay organized" />
            <h2 id="organize-title">From deadline noise to a clear next step.</h2>
            <p>
              Elysium helps students see what is due, what is coming, what needs support,
              and where their time should go next. It turns scattered campus signals into a readable day.
            </p>
            <div className="landing-flow-list">
              {organizationFlow.map((item, index) => (
                <FlowItem key={item.title} item={item} index={index} />
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <OrganizationBoard />
          </Reveal>
        </div>
      </section>

      <section id="connect" className="landing-section landing-section-connect" aria-labelledby="connect-title">
        <div className="landing-container landing-connect-grid">
          <Reveal className="landing-connect-visual">
            <ConnectionOrbit />
          </Reveal>
          <Reveal className="landing-split-copy" delay={0.1}>
            <SectionKicker icon={Sparkles} text="Find your people" />
            <h2 id="connect-title">Peer connection, tutor support, and interests belong beside your coursework.</h2>
            <p>
              University gets easier when academic help and social discovery are connected to the
              courses, communities, and plans students actually care about.
            </p>
            <div className="landing-connection-cards">
              {connectionCards.map((card, index) => (
                <ConnectionCard key={card.title} card={card} index={index} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="start" className="landing-final-cta" aria-labelledby="start-title">
        <Reveal className="landing-final-card">
          <Sparkles className="landing-final-spark" aria-hidden="true" />
          <h2 id="start-title">Start with a clearer campus day.</h2>
          <p>
            Create your student space, add your courses and interests, and let Elysium organize
            the tools, people, reminders, and plans that help university feel manageable.
          </p>
          <div className="landing-final-actions">
            <AnimatedAction>
              <Button asChild className="landing-primary-button h-12 px-6 text-base">
                <Link to="/register">
                  Get Started
                  <ArrowRight data-icon="inline-end" className="size-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </AnimatedAction>
            <AnimatedAction>
              <Button asChild variant="outline" className="landing-secondary-button h-12 px-6 text-base">
                <Link to="/login">Sign In</Link>
              </Button>
            </AnimatedAction>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

function LandingNav() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" className="landing-brand" aria-label="Elysium home">
          <ElysiumLogo size={38} className="rounded-sm" />
        </Link>

        <nav className="landing-nav-links" aria-label="Landing page sections">
          {navItems.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              whileHover={prefersReducedMotion ? undefined : { y: -1 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        <div className="landing-nav-actions">
          <ThemeToggle className="landing-theme-toggle" />
          <AnimatedAction>
            <Button asChild variant="ghost" className="landing-nav-signin hidden h-10 px-4 sm:inline-flex">
              <Link to="/login">Sign In</Link>
            </Button>
          </AnimatedAction>
          <AnimatedAction>
            <Button asChild className="landing-primary-button h-10 px-4">
              <Link to="/register">Get Started</Link>
            </Button>
          </AnimatedAction>
        </div>
      </div>
    </header>
  );
}

function ThemeToggle({ className, showText = false }) {
  const prefersReducedMotion = useReducedMotion();
  const { isDark, setTheme } = useTheme();
  const nextTheme = isDark ? "light" : "dark";
  const ThemeIcon = isDark ? Sun : Moon;

  return (
    <motion.button
      type="button"
      className={className}
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      whileHover={prefersReducedMotion ? undefined : { y: -1 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
    >
      <ThemeIcon className="size-4" aria-hidden="true" />
      {showText && <span>{isDark ? "Use light mode" : "Use dark mode"}</span>}
    </motion.button>
  );
}

function Reveal({ children, className, delay = 0 }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0.78, y: 28, scale: 0.985 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function HeroReveal({ children, className, delay = 0 }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.99 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedAction({ children, className }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("landing-action-motion", className)}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      whileTap={prefersReducedMotion ? undefined : { y: 0, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ title, body, eager = false }) {
  const Wrapper = eager ? HeroReveal : Reveal;

  return (
    <Wrapper className="landing-section-header">
      <h2>{title}</h2>
      <p>{body}</p>
    </Wrapper>
  );
}

function SectionKicker({ icon: Icon, text }) {
  return (
    <div className="landing-kicker">
      <Icon className="size-4" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = feature.icon;

  return (
    <motion.article
      className={cn("landing-feature-card", `landing-accent-${feature.accent}`)}
      initial={prefersReducedMotion ? false : { opacity: 0.78, y: 30, scale: 0.97 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      whileHover={prefersReducedMotion ? undefined : { y: -7, scale: 1.01 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
    >
      <span className="landing-card-icon">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3>{feature.title}</h3>
      <p>{feature.body}</p>
    </motion.article>
  );
}

function ToolPill({ tool, index }) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = tool.icon;

  return (
    <motion.article
      className="landing-tool-pill"
      whileHover={prefersReducedMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.02 }}
    >
      <span>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <h3>{tool.title}</h3>
        <p>{tool.detail}</p>
      </div>
    </motion.article>
  );
}

function FlowItem({ item, index }) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = item.icon;

  return (
    <motion.article
      className="landing-flow-item"
      initial={prefersReducedMotion ? false : { opacity: 0.78, x: -18 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
    >
      <span>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <h3>{item.title}</h3>
        <p>{item.body}</p>
      </div>
    </motion.article>
  );
}

function OrganizationBoard() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="landing-organization-board"
      whileHover={prefersReducedMotion ? undefined : { y: -4, rotateX: 1 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="landing-board-header">
        <div>
          <p>Today</p>
          <h3>Academic focus map</h3>
        </div>
        <span>74%</span>
      </div>
      <div className="landing-progress-track" aria-hidden="true">
        <motion.span
          initial={prefersReducedMotion ? false : { scaleX: 0 }}
          whileInView={prefersReducedMotion ? undefined : { scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </div>
      <div className="landing-board-timeline">
        {timelineRows.map((row) => {
          const Icon = row.icon;
          return (
            <article key={row.title}>
              <span className="landing-board-time">{row.time}</span>
              <span className="landing-board-icon">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <h4>{row.title}</h4>
                <p>{row.meta}</p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="landing-board-next">
        <LibraryBig className="size-5" aria-hidden="true" />
        <div>
          <h4>Suggested next step</h4>
          <p>Review saved notes before the study sprint starts.</p>
        </div>
      </div>
    </motion.div>
  );
}

function ConnectionOrbit() {
  const prefersReducedMotion = useReducedMotion();
  const orbitTransition = prefersReducedMotion
    ? undefined
    : { duration: 8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" };

  return (
    <div className="landing-orbit-card" aria-label="Student connection preview">
      <motion.div
        className="landing-orbit-core"
        animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
        transition={orbitTransition}
      >
        <ElysiumLogo size={52} className="rounded-sm" decorative />
        <p>Match by course, help, and interests</p>
      </motion.div>
      {[
        { label: "Study partner", className: "orbit-a", icon: Users },
        { label: "Tutor match", className: "orbit-b", icon: GraduationCap },
        { label: "Campus event", className: "orbit-c", icon: CalendarDays },
        { label: "Interest group", className: "orbit-d", icon: Sparkles },
      ].map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            className={cn("landing-orbit-node", item.className)}
            initial={prefersReducedMotion ? false : { opacity: 0.78, scale: 0.88 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            animate={prefersReducedMotion ? undefined : { y: [0, index % 2 ? 7 : -7, 0] }}
            viewport={{ once: true }}
            transition={{
              duration: 0.46,
              ease: [0.16, 1, 0.3, 1],
              delay: index * 0.08,
              y: { duration: 6 + index, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
            }}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

function ConnectionCard({ card, index }) {
  const prefersReducedMotion = useReducedMotion();
  const Icon = card.icon;

  return (
    <motion.article
      className="landing-connection-card"
      initial={prefersReducedMotion ? false : { opacity: 0.78, y: 18 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? undefined : { x: 4 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
    >
      <span>
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <h3>{card.title}</h3>
        <p>{card.body}</p>
      </div>
    </motion.article>
  );
}
