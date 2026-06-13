# Campus Compass Design Direction

The chosen design direction is **Campus Compass**: calm, trustworthy, multilingual, mobile-first, and practical. The app should feel like a guide through campus life, not a generic productivity dashboard.

## Design Goal

The product should feel:

- Human.
- Clear.
- Warm.
- Trustworthy.
- Student-centered.
- Native in English, Hebrew, and Arabic.
- Specific to campus survival.

It should not feel:

- Corporate.
- Overly playful.
- Like only a tutor marketplace.
- Like only a generic calendar app.
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

Recommended language-aware font system:

- Arabic: Tajawal or Noto Sans Arabic.
- Hebrew: Noto Sans Hebrew or a compatible modern system sans.
- English: Inter or system UI.
- Shared fallback: Noto Sans family where visual consistency is needed.

Rules:

- Body text must be highly readable on mobile.
- Guide content should use comfortable line height.
- Labels should be short and clear.
- Give each language native line height, weight, and punctuation behavior.
- Do not shrink Hebrew or Arabic text to force it into an English-sized component.
- Official terms may appear secondarily in another language, but the student's selected language remains the explanatory layer.

## RTL Rules

RTL and LTR parity are foundational.

Implementation rules for later:

- Set document direction from the active language: `rtl` for Arabic and Hebrew, `ltr` for English.
- Use CSS logical properties when possible: `padding-inline-start`, `margin-inline-end`, etc.
- Use Tailwind logical utilities where available.
- Mirror directional icons such as arrows.
- Keep numbers, course codes, URLs, and mixed-language terminology readable with explicit bidi handling where needed.
- Test long Arabic, Hebrew, and English labels on small screens.
- Switching language must not change the information architecture or hide features.

References:

- [W3C bidi guidance](https://www.w3.org/International/geo/html-tech/tech-bidi.html)
- [Tailwind responsive design](https://tailwindcss.com/docs/breakpoints)

## Mobile Shell

The app should open directly into the product experience.

Recommended bottom-navigation concepts in every language:

- Home.
- Social.
- Contextual create/ask action.
- Study.
- More.

`More` gives stable access to Calendar, Private Tutors, Peer Helpers, Tools, Guides, and Profile. If user testing shows that this hides core tasks, use Home, Community, Ask, Calendar, and Tools, with clear Social and Study tabs inside Community.

Labels are localized; icon meaning and order remain stable unless directional conventions require mirroring.

The center action can be contextual later, but avoid making a generic plus button the main identity.

Desktop:

- Use a responsive shell with side navigation or top navigation.
- Keep the same information architecture.
- Do not create a marketing landing page as the main logged-in experience.

## First Screens

### Public Entry

Purpose:

- Explain the product quickly.
- Let students sign in or browse public guides if allowed.

Must show:

- Working product name in the active script treatment.
- English / עברית / العربية language control.
- Multilingual campus-guidance promise.
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
- Upcoming personal deadline or joined item.
- Recommended social activity and study session.
- Tutor or Peer Helper suggestion.
- Relevant tool, guide, or university shortcut.
- Compact Ask Elysium entry.

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
- Find a tutor, Peer Helper, or official contact.

### Private Tutor Listing

Purpose:

- Find subject instruction and request a session.

Layout:

- Filters by university, subject/course, language, availability, and online/in-person mode.
- Tutor cards with subjects, experience, price/contact state, and report action.
- Reviews must come from real interactions and must never be represented by fake seeded ratings.

### Peer Helper Listing

Purpose:

- Find an opted-in student willing to answer questions.

Layout:

- Filters by university, field, year, language, and help topic.
- Clear Peer Helper label, availability, and consented contact method.
- No implication that Peer Helpers are official university authorities or paid tutors.

## Component Principles

- Cards are for individual repeated items only.
- Avoid cards inside cards.
- Use icons for navigation and actions, not decoration.
- Buttons should contain clear commands.
- Use segmented controls for filters.
- Use chips for help topics.
- Use search prominently in tutors, Peer Helpers, tools, and guides.
- Use empty states that point to a next action.

## Tone Of Voice

Copy in every language should be practical, calm, and direct.

Core concepts to localize naturally rather than literally:

- "What do you need today?"
- "Your next step"
- "Ask a student who has been through this"
- "Terms you will hear at university"

Avoid:

- Overly motivational slogans.
- Generic productivity language.
- Shame-based phrasing.
- Claims that the app solves every problem.

## Design Acceptance Criteria

The design is successful if:

- A student immediately understands that the product helps students navigate Israeli higher education in English, Hebrew, and Arabic.
- The app feels useful before it feels impressive.
- English, Hebrew, and Arabic each look native rather than machine-translated or visually secondary.
- The first viewport points to one clear next action.
- Mobile screens do not overflow or rely on tiny labels.
- Tutors, Peer Helpers, activities, sessions, and resources feel trustworthy.
- Language switching preserves context and feature parity.
