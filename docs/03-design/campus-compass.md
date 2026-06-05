# Campus Compass Design Direction

The chosen design direction is **Campus Compass**: calm, trustworthy, Arabic-first, mobile-first, and practical. The app should feel like a guide through campus life, not a generic productivity dashboard.

## Design Goal

Dalili should feel:

- Human.
- Clear.
- Warm.
- Trustworthy.
- Student-centered.
- Arabic-first.
- Specific to campus survival.

It should not feel:

- Corporate.
- Overly playful.
- Like a tutor marketplace.
- Like a generic calendar app.
- Like a government portal.
- Like a ChatGPT wrapper.

## Visual Metaphor

Compass, campus map, path, checkpoint, and guide.

Use these ideas subtly:

- Direction.
- Steps.
- Landmarks.
- Routes.
- "You are here" moments.
- Next action.

Avoid decorative map clutter. The metaphor should clarify navigation, not become an illustration theme.

## Palette Direction

Recommended direction:

- Main background: soft off-white or very light neutral.
- Primary: deep teal or blue-green for trust and guidance.
- Secondary: warm amber for helpful highlights.
- Accent: muted blue for academic/campus actions.
- Danger: restrained red for reports and urgent deadlines.
- Text: dark charcoal with strong contrast.

Avoid:

- Purple-dominant UI from the earliest prototype.
- One-note teal-only palette.
- Heavy gradients.
- Decorative orbs or abstract blobs.
- Too many pastel cards.

## Typography

Arabic-first font stack:

- Tajawal.
- Noto Sans Arabic.
- System UI fallback.

Rules:

- Body text must be highly readable on mobile.
- Guide content should use comfortable line height.
- Labels should be short and clear.
- Use Arabic copy as the primary visual rhythm.
- Hebrew and English terms should be visually secondary but easy to scan.

## RTL Rules

RTL is foundational.

Implementation rules for later:

- Set `dir="rtl"` at the document/root level for Arabic views.
- Use CSS logical properties when possible: `padding-inline-start`, `margin-inline-end`, etc.
- Use Tailwind logical utilities where available.
- Mirror directional icons such as arrows.
- Keep numbers, course codes, Hebrew terms, and English acronyms readable in mixed-direction text.
- Test long Arabic labels on small screens.

References:

- [W3C bidi guidance](https://www.w3.org/International/geo/html-tech/tech-bidi.html)
- [Tailwind responsive design](https://tailwindcss.com/docs/breakpoints)

## Mobile Shell

The app should open directly into the product experience.

Recommended bottom navigation:

- الرئيسية
- الأدلة
- الموجّهون
- المجموعات
- حسابي

The center action can be contextual later, but avoid making a generic plus button the main identity.

Desktop:

- Use a responsive shell with side navigation or top navigation.
- Keep the same information architecture.
- Do not create a marketing landing page as the main logged-in experience.

## First Screens

### Public Entry

Purpose:

- Explain Dalili quickly.
- Let students sign in or browse public guides if allowed.

Must show:

- Dalili / دليلي.
- Arabic-first promise.
- Sign in / create account.
- Example help topics.

### Onboarding

Purpose:

- Personalize without feeling like a long form.

Interaction:

- Short steps.
- Visual progress.
- Large tap targets.
- Chips/segmented controls for help needs.
- Clear option to skip non-critical fields.

### Dashboard

Purpose:

- Show what matters now.

Layout:

- Greeting.
- "Your next step" card or strip.
- Recommended guides.
- Mentor CTA.
- Group suggestions.
- University shortcut.

Avoid:

- Too many metrics.
- Huge hero text.
- Nested cards.

### Guide Detail

Purpose:

- Convert confusion into action.

Layout:

- Situation.
- Why this matters.
- Steps.
- Hebrew terms.
- Official link.
- Ask a mentor.

### Mentor Listing

Purpose:

- Find someone relevant and trustworthy.

Layout:

- Filters by university, field, help topic.
- Mentor cards with approved status.
- No star ratings in MVP.

## Component Principles

- Cards are for individual repeated items only.
- Avoid cards inside cards.
- Use icons for navigation and actions, not decoration.
- Buttons should contain clear commands.
- Use segmented controls for filters.
- Use chips for help topics.
- Use search prominently in guides and mentors.
- Use empty states that point to a next action.

## Tone Of Voice

Arabic copy should be practical and direct.

Preferred:

- "ماذا تحتاج اليوم؟"
- "خطوتك القادمة"
- "اسأل طالبا مر بنفس التجربة"
- "مصطلحات ستسمعها في الجامعة"

Avoid:

- Overly motivational slogans.
- Generic productivity language.
- Shame-based phrasing.
- Claims that the app solves every problem.

## Design Acceptance Criteria

The design is successful if:

- A student immediately understands that Dalili is for Arab students in Israeli academia.
- The app feels useful before it feels impressive.
- Arabic content looks native, not translated.
- The first viewport points to one clear next action.
- Mobile screens do not overflow or rely on tiny labels.
- Mentors and resources feel trustworthy.

