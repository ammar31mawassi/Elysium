# Elysium Design Taste Profile

## Product Identity

Elysium is a modern student operating system for university life. It should feel like a calm command center that connects academic planning, social discovery, peer support, tutor access, campus resources, student tools, and personal progress.

The product sentence:

> A personalized, trilingual student hub for planning university life, meeting people, studying together, finding academic help, and knowing what to do next.

## Target Users

- New university students who feel lost, especially in the first weeks.
- Students balancing courses, exams, social life, commuting, language, and campus systems.
- Students looking for classmates, study sessions, peer helpers, tutors, activities, and trusted resources.
- Returning students who need a faster way to know what matters today.

## Visual Vibe

- Modern, clean, premium, student-focused, trustworthy, slightly futuristic.
- App-like and useful before it feels decorative.
- Friendly without becoming childish.
- Technical and polished without becoming corporate.
- Raycast-like command-center energy, Stripe-like storytelling polish, Vercel restraint, Linear density, Supabase trust.

## Palette Direction

Use:

- Deep ink/charcoal for premium hero and command-center surfaces.
- White or very light neutral for readable content sections.
- Deep teal/cyan as the primary student OS accent.
- Warm amber for helpful highlights.
- Muted blue for academic/campus actions.
- Restrained semantic colors for success, warning, destructive, and focus states.

Avoid:

- Purple-dominant UI.
- Beige, cream, or tan-heavy palettes.
- One-note teal-only screens.
- Random rainbow cards.
- Heavy gradients as the main design idea.
- Low-contrast muted text on dark surfaces.

## Typography Direction

- English: Inter/system sans.
- Arabic: Noto Sans Arabic or Tajawal-like rhythm.
- Hebrew: Noto Sans Hebrew or compatible modern sans.
- Headings should be confident, tight, and readable.
- Body text should remain comfortable on small phones.
- Labels should be short, direct, and practical.
- Do not shrink Hebrew or Arabic just to fit English-sized components.

## Spacing And Density

- Balanced density: rich enough to show real tools, calm enough for stressed students.
- Hero can be spacious, but every section needs a job.
- Prefer 8px-based spacing rhythm.
- Use compact cards for repeated tools, rows, and dashboard previews.
- Avoid giant empty sections and oversized text inside compact UI.

## Motion Style

- Subtle, smooth, and product-like.
- Use hover lift, card elevation, section fade-up, moving nav indicators, and progress-ring fills.
- Landing pages should reveal sections/cards as they enter the viewport, with small staggered delays.
- Dashboard previews should react as product surfaces: panels lift, icons respond, and progress rings fill on visibility.
- Auth cards should feel interactive through focus-within elevation, tab transitions, and reassuring micro-movement.
- Controls should respond within 120-180ms.
- Cards and section entrances can use 180-520ms.
- Respect `prefers-reduced-motion`.
- Motion should clarify hierarchy or make the product feel alive, not distract.

## Layout Rules

- First viewport must explain the product in five seconds.
- Show the actual product system early: dashboard preview, tool cards, next action, calendar/session/social/tutor relationships.
- Use full-width bands and constrained inner content.
- Avoid cards inside cards.
- Avoid repeated generic centered sections.
- Make the sign-in/sign-up area feel connected to the landing story.
- Keep a hint of the next section visible after the hero where practical.

## Component Rules

- Buttons: premium, high-contrast, clear commands, icon only when meaningful.
- Cards: clear hierarchy, consistent radius, restrained shadow, no clutter.
- Inputs: visible labels, accessible focus states, consistent height.
- Icons: lucide or existing project icons; meaningful, consistent stroke style, not decorative clutter.
- Navigation: simple hub with moving hover/focus indicator on desktop.
- Auth: supports new and returning users, no fake login behavior, routes into the real auth flow.

## Accessibility Rules

- Preserve semantic heading order.
- Use real labels for form controls.
- Keep visible focus states.
- Maintain color contrast on dark and light surfaces.
- Support keyboard navigation.
- Respect reduced motion.
- Keep tap targets comfortable on mobile.
- Avoid text truncation where meaning is important.
- Preserve RTL/LTR parity for future Arabic and Hebrew work.

## Mobile Behavior

- Hero stacks with copy first and dashboard preview below.
- Navigation simplifies to brand plus auth actions.
- Card grids collapse to one column.
- Auth card keeps full-width buttons and large inputs.
- No horizontal overflow at 320px.
- Text should wrap naturally without clipping.

## Desktop Behavior

- Hero uses split product story plus dashboard preview.
- Sections use varied rhythm: intro plus cards, tool grid, benefits panel, steps, auth.
- Navigation hub stays sticky and compact.
- Dashboard preview should feel like a real product surface, not a decorative screenshot.

## Reusable Patterns

- Command-center dashboard preview in dark glassy ink.
- "Your next step" panel with connected deadlines, sessions, people, and tools.
- Tool cards grouped by student need.
- Scenario cards instead of fake testimonials.
- Trust rows for privacy, role clarity, and student control.
- Auth card with new/returning tabs and email prefill into real routes.

## UI Mistakes To Avoid

- Generic startup SaaS hero.
- Fake testimonials, fake names, fake statistics, or fake logos.
- A boring university portal feeling.
- GPA or calendar becoming the whole product identity.
- Cluttered bento grids with no product logic.
- Nested cards and over-framed sections.
- Weak spacing or stretched desktop sections.
- Inconsistent radius, shadow, and border language.
- Decorative blobs, random SVG ornaments, or childish icons.

## Animation Mistakes To Avoid

- Transitioning every property with `transition-all`.
- Animations that run forever with no purpose.
- Scroll effects that make reading harder.
- Progress indicators rendered as static decoration.
- Motion with no reduced-motion fallback.
- Treating hover states as only color changes when a slight transform/elevation would make the surface feel actionable.

## Good Section Examples For Elysium

- Hero: "University life, organized in one student OS" plus a dark dashboard preview.
- Platform explanation: academic planning, campus connection, and support discovery.
- Tool overview: study planner, exam tracker, shared activities, peer/tutor matching, campus resources, progress dashboard.
- Benefits: less stress, better organization, easier social connection, faster access to help.
- How it works: create account, add courses/interests, get organized and connected.
- Student scenarios: first week, exam season, social confidence.
- Auth: real entry path for new and returning students, privacy reassurance, clear CTA.
