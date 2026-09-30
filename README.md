# Rezyn

**AI-powered full-interface reconstruction for websites, web apps, mobile apps, SaaS products and e-commerce experiences.**

Rezyn takes an existing project, understands how it works, separates product behavior from presentation, and reconstructs the UI/UX from a blank visual canvas using a selected design direction. The goal is not to apply a theme, swap colors, or layer new CSS on top of an old interface. Rezyn treats the uploaded design as a **functional specification**, preserves the product logic that matters, and rebuilds the presentation system from scratch.

The platform combines a 61-direction visual language library, a large UI/UX + 2D/3D design-intelligence registry, project-aware reconstruction prompts, independent design QA, conversational redesign, file-by-file targeting, ZIP ingestion and redesigned-project export.

---

## Table of contents

- [What Rezyn does](#what-rezyn-does)
- [Core reconstruction philosophy](#core-reconstruction-philosophy)
- [Main features](#main-features)
- [61-direction design library](#61-direction-design-library)
- [Design Intelligence Operating System](#design-intelligence-operating-system)
- [Automatic redesign engine](#automatic-redesign-engine)
- [Rezyn Chat](#rezyn-chat)
- [Realtime agent progress](#realtime-agent-progress)
- [Project and file workflow](#project-and-file-workflow)
- [Upload and archive handling](#upload-and-archive-handling)
- [Redesigned ZIP export](#redesigned-zip-export)
- [Quality, safety and validation](#quality-safety-and-validation)
- [Supported source types](#supported-source-types)
- [Application routes](#application-routes)
- [Technology stack](#technology-stack)
- [Database and migrations](#database-and-migrations)
- [Environment configuration](#environment-configuration)
- [Local development](#local-development)
- [CI verification](#ci-verification)
- [Project structure](#project-structure)
- [Current limitations](#current-limitations)

---

## What Rezyn does

Rezyn is designed for existing digital products that already contain useful functionality but need a radically better interface.

Typical targets include:

- marketing websites
- web applications
- dashboards and internal tools
- mobile application source
- SaaS products
- e-commerce interfaces
- product onboarding
- admin panels
- content-heavy applications
- AI products and agent interfaces
- data-heavy products
- experimental 2D/3D web experiences

A normal redesign tool often starts from the current interface and modifies it. Rezyn deliberately follows a different model:

```text
Existing project
      ↓
Understand routes, state, events, data and content
      ↓
Separate behavior from visual presentation
      ↓
Discard existing visual decisions
      ↓
Apply selected design-direction blueprint
      ↓
Apply UI/UX + 2D/3D design intelligence
      ↓
Reconstruct presentation from scratch
      ↓
Validate functional preservation
      ↓
Run independent Design QA
      ↓
Regenerate when release-blocking issues are found
      ↓
Save redesigned source
      ↓
Continue refining through Rezyn Chat
      ↓
Export redesigned project files
```

---

## Core reconstruction philosophy

### The uploaded project is functionality, not visual inspiration

For presentation-bearing files, Rezyn is instructed to ignore the previous design language and rebuild:

- information hierarchy
- layout architecture
- navigation treatment
- section composition
- grids and flex layouts
- typography system
- spacing rhythm
- color system
- surfaces and materials
- component geometry
- forms
- cards and modules
- interaction states
- responsive behavior
- motion language
- accessibility presentation
- visual depth
- 2D/3D presentation where relevant

### What should survive

Rezyn attempts to preserve application behavior that should not change simply because the interface is being redesigned:

- routes
- state
- props
- event handlers
- API calls
- data bindings
- business logic
- form submission behavior
- content meaning
- asset references
- functional IDs/selectors
- accessibility semantics
- framework/language conventions
- previous successful redesign edits already present in the current source

### What counts as a failed redesign

The reconstruction engine explicitly treats these as failures when the user requested a real redesign:

- changing only colors
- changing only design tokens
- adding a new wrapper around the existing UI
- preserving the same DOM/layout with different classes
- appending override CSS below the old visual system
- lightly reskinning cards
- retaining most of the original presentation
- returning the original source unchanged

A visual-fingerprint check measures carry-over from the original presentation. A presentation-bearing result that preserves too much of the previous visual implementation is rejected rather than silently accepted.

---

## Main features

### Full project redesign

Upload project files or a ZIP, select a visual direction, and reconstruct presentation-bearing source while preserving the product's working behavior.

### Project-wide or file-specific styles

A project can use a single visual direction globally or target individual files with separate directions when the workspace is configured for per-file styling.

### 61 expert design directions

The Direction Library is the active source of truth for the redesign system. It contains 61 visual systems organized into nine families.

### Real website previews

Direction previews are rendered as miniature website compositions rather than abstract color blocks. They include recognizable website anatomy such as navigation, hero content, CTA areas, visual modules, content regions and footer treatment so users can understand the character of a direction before selecting it.

### Direction search and filtering

The library includes:

- full-text direction search
- family filters
- dynamic direction counts
- selected-direction preview
- related directions from the same family
- direct apply-to-project flow

### From-scratch reconstruction blueprints

Every active direction has a dedicated internal blueprint explaining how layout, hierarchy, typography, geometry, material, navigation and interaction should be reconstructed. Rezyn does not rely on the direction name alone.

### UI/UX + 2D/3D intelligence

The redesign engine contains a formal competency registry spanning advanced UI/UX, accessibility, research methods, interaction principles, design systems, motion, animation, 2D, 3D, shaders, spatial interfaces, rendering, asset pipelines and art direction.

### Independent Design QA

Generated presentation is audited by a second AI quality-control pass. The audit checks functional preservation, visual replacement, style fidelity and applicable design-quality gates. Release-blocking failures can trigger another reconstruction pass rather than saving the first plausible output.

### Conversation-first Rezyn Chat

Rezyn Chat is a design copilot, not an always-on editing command box. It distinguishes normal conversation from explicit implementation requests.

Examples:

```text
"hello"
→ conversation only

"what do you think about this layout?"
→ discussion only

"should we use glassmorphism for this dashboard?"
→ design advice only

"make the hero cinematic"
→ redesign instruction

"remove the sidebar and rebuild navigation as a command bar"
→ redesign instruction
```

When intent is unclear, the system should prefer conversation instead of modifying source code.

### Realtime execution stages

During active edits Rezyn can persist and display useful execution stages such as:

- reading latest source
- understanding the instruction
- protecting existing behavior
- applying design intelligence
- designing the requested change
- auditing accessibility and responsiveness
- validating rewritten source
- saving the result

These are safe execution-status summaries, not private model chain-of-thought.

### Multi-file redesign

When targeting all files, normal conversation is classified once and stops without fan-out. A confirmed redesign request can then proceed across files. Individual file failures are collected so one failed file does not necessarily stop the remaining targets.

### ZIP ingestion

ZIP archives are unpacked client-side and converted into individual redesignable project-file records. Build output, dependencies, lockfiles and common generated/config files are automatically ignored.

### Master ZIP export

Completed redesigned files can be packaged into a browser-generated ZIP while preserving their relative source names/paths.

### Authentication and ownership

Projects and chat/file operations are connected to Supabase authentication and row-level access rules.

---

## 61-direction design library

The following catalog is the only active redesign direction system.

### I. The Morphisms & Material Frameworks — 8

1. Glassmorphism
2. Neumorphism (Soft UI)
3. Claymorphism
4. Liquid Glass
5. Squirclemorphism
6. Metalmorphism
7. AR-morphism
8. Skeuomorphism 2.0

### II. Structural Layouts & Grid Paradigms — 7

1. Bento Grid
2. Window Grids 2.0 / Windowing
3. Swiss Design (International Typographic Style)
4. Bauhaus Functionalism
5. Asymmetric Grids
6. 100% Height / Full-Screen Viewports
7. Card-Based UI / Modular Blocks

### III. The Historical Art Movements — 8

1. Brutalism
2. Neo-Brutalism (Neubrutalism)
3. Memphis Style
4. Risograph
5. Art Deco
6. Art Nouveau
7. Psychedelic / Acid Graphic
8. Pop Art

### IV. Retro-Tech & Digital Nostalgia — 7

1. Web 1.0 Retro
2. Pixel Art UI
3. Vaporwave
4. Synthwave / Retrowave
5. Y2K Aesthetic
6. Frutiger Aero
7. Steampunk UI

### V. Minimalism & Flat Architecture — 7

1. Flat Design
2. Flat 2.0 (Semi-Flat)
3. Material Design
4. Exaggerated Minimalism
5. Monochromatic Design
6. Color Blocking
7. E-Ink / Utilitarian

### VI. Modern System Modes & Experience States — 4

1. Dark Mode Maturity
2. Aurora UI
3. Inclusive / Accessibility-First
4. Sustainable / Green UX

### VII. Mixed-Media, Cinematic & Motion UI — 8

1. Kinetic Typography
2. Scrapbook Collage
3. Glitch Art / Datamoshing
4. Cinematic / Scrollytelling
5. Experimental / Radical Navigation
6. Infinite / Endless Galleries
7. Scattered Galleries
8. Gamified UX

### VIII. Natural, Organic & Wellness Aesthetics — 5

1. Biophilic UI
2. Biomimetic UI
3. Japandi
4. Wabi-Sabi Aesthetic
5. Calm Design / Decompressed UI

### IX. AI-Native & Spatial Realities — 7

1. Generative UI / Dynamic Component Assembly
2. Agentic UX
3. Conversational Layering / Chat-First UX
4. Spatial UI
5. Ambient AI / Intent UI
6. Predictive / Anticipatory UX
7. Intentional Imperfection (Anti-Perfect UI)

The catalog is defined in `src/data/style-catalog.ts`, while implementation guidance for each direction lives in `src/lib/style-blueprints.ts`.

---

## Design Intelligence Operating System

Rezyn includes a reusable design-intelligence layer shared by automatic reconstruction and conversational redesign.

It is intentionally more than a list of buzzwords. The registry is translated into universal quality gates plus file-sensitive specialisms. Relevant disciplines are injected into the redesign context depending on the source file and requested change.

### UI/UX intelligence includes

- 12-column grid systems
- 60-30-10 color distribution
- 8-point spacing rhythm
- responsive and adaptive layout
- mobile-first strategy
- desktop/tablet/mobile viewport planning
- information architecture
- cognitive-load optimization
- visual hierarchy
- typography and type scales
- line-height systems
- color theory and palettes
- WCAG-oriented accessibility
- accessible components
- color-contrast evaluation
- focus/active/disabled/loading/error states
- form ergonomics
- progressive disclosure
- design tokens
- design-system architecture and governance
- component libraries
- atomic design
- Flexbox and CSS Grid
- interaction design
- affordance/signifier design
- Gestalt principles
- Fitts's Law
- Hick's Law
- Jakob's Law
- Miller's Law
- micro-interactions
- motion design
- keyframe/timeline animation
- multimodal interfaces
- VUI/conversational UX
- AI chatbot UI
- generative UI patterns
- agentic and ambient interface design
- algorithmic-transparency UX
- spatial/XR interface thinking
- haptics and tactile UX
- data-visualization ergonomics
- CRO-oriented UX
- dark-pattern auditing
- cross-cultural UX
- human factors
- Human-Centered Design
- heuristic evaluation
- user journeys
- task analysis
- service blueprints
- wireframing/prototyping concepts
- usability testing frameworks
- UAT support concepts
- SUS/HEART methodology awareness
- qualitative/quantitative research methodology
- persona and scenario methods
- card sorting/tree testing
- heatmap/clickstream concepts
- eye-tracking/foveated UX concepts
- biometric/thermal/bio-feedback concepts
- Zero-UI/invisible UI concepts
- DesignOps and design-debt auditing

### 2D/3D intelligence includes

- 2D animation
- frame-by-frame animation principles
- vector animation
- 2D particle systems
- 2D rigging
- procedural 2D concepts
- 3-point lighting
- polygonal modeling concepts
- low-poly/hard-surface workflows
- photorealism
- PBR material reasoning
- normal/bump mapping
- texture baking
- UV mapping
- retopology
- shader programming concepts
- shader graphs
- raymarching
- WebGL/real-time rendering optimization
- global illumination concepts
- volumetrics
- rigid/soft-body concepts
- fluid/FLIP concepts
- cloth/Vellum concepts
- particles and pyrotechnics
- hair/fur concepts
- character/FK/IK/rigging principles
- blend shapes
- FACS concepts
- motion capture cleanup concepts
- camera tracking
- composition
- color grading
- matte painting
- concept-art workflow
- photogrammetry
- LiDAR/point-cloud concepts
- asset optimization
- Blender/Maya/Cinema 4D/ZBrush/Houdini/XGen/Marvelous Designer workflow knowledge
- Lottie/JSON animation
- SVG/vector graphics
- parallax and kinetic typography
- audio-reactive visual concepts
- Unreal Nanite/Lumen awareness
- 2D/3D art-direction styles including Bauhaus, Swiss, Art Deco, Art Nouveau, Brutalism, Memphis, Pop Art, Cyberpunk, Vaporwave, Synthwave and Y2K

### Honesty rules for research/tool disciplines

Rezyn may use research and testing disciplines as design reasoning frameworks, but it must not fabricate evidence.

The intelligence layer explicitly prohibits inventing:

- A/B test results
- A/B/n or multivariate results
- heatmaps
- clickstream findings
- eye-tracking results
- biometric findings
- SUS scores
- HEART metrics
- user interviews
- usability-study results
- analytics
- external tool execution that never occurred

When direct evidence is unavailable, the engine should frame these as hypotheses or recommendations for future testing.

### Universal quality gates

Generated presentation is expected to consider, when applicable:

- coherent grids and spacing
- accessible contrast
- keyboard operation
- focus-visible states
- touch target sizing
- semantic labeling
- reduced-motion support
- reflow/zoom resilience
- complete component states
- mobile/tablet/desktop responsiveness
- fluid typography
- clear CTA hierarchy
- ethical conversion design
- design-token consistency
- reusable component structure
- data-density ergonomics
- AI state/permission/transparency clarity
- reversibility of destructive or automated actions
- performance-aware motion
- performance-aware WebGL/3D
- visible fallbacks for spatial, multimodal or zero-UI concepts

---

## Automatic redesign engine

The primary reconstruction pipeline lives in `src/lib/redesign.functions.ts`.

### Presentation-bearing file detection

Rezyn distinguishes files that directly control presentation from files that are primarily logic/config/data.

Direct presentation types include common HTML/template/component/style formats. JavaScript/TypeScript and native UI source can also be recognized as presentation-bearing when UI signatures are detected.

This prevents the engine from aggressively rewriting unrelated backend/configuration files just because they were included in an uploaded project.

### Project-aware context

The reconstruction engine can use project context such as:

- project name
- product type
- project notes
- uploaded file manifest
- selected style
- source file name
- source content

That context helps independently processed files maintain a more consistent visual direction.

### Reconstruction contract

For a presentation-bearing file, the engine is explicitly told to:

1. understand the current functional source
2. mentally discard the old UI presentation
3. use the selected direction blueprint
4. rebuild visual architecture from scratch
5. preserve functional behavior
6. apply relevant design-intelligence rules
7. output the complete rewritten source file

### Carry-over detection

The engine builds a visual fingerprint from presentation-related lines in the original and generated source. If the generated presentation retains an excessive amount of the original visual implementation, the result is rejected as too shallow.

### Structured validation

Before a generated file is accepted, the pipeline checks for problems such as:

- empty AI output
- unchanged source
- suspicious truncation
- invalid JSON when processing JSON
- markdown fences where source code is expected
- assistant commentary instead of source code
- excessive visual carry-over

### Retry and fallback behavior

The AI gateway layer includes:

- primary + fallback model configuration
- high reasoning effort for the primary reasoning model
- transient-error retry handling
- handling for common gateway/rate-limit/server failures
- request timeouts
- response validation before persistence

---

## Rezyn Chat

`/projects/:projectId/chat` provides conversational refinement after or alongside automatic redesign.

### Conversation-first intent routing

Every message is first classified into one of two broad intents:

- **conversation** — talk, questions, brainstorming, critique, explanation or ambiguous requests
- **edit** — explicit requests to change the project/file

A greeting must not trigger a redesign. A question about design must not silently alter source. Ambiguous intent should default to conversation.

### Conversational capabilities

Users can:

- greet and chat normally
- ask what Rezyn thinks about a layout
- compare design approaches
- ask for design explanations
- brainstorm possible changes
- discuss a selected visual direction
- request accessibility improvements
- ask for UX critique
- refine a previous redesign
- issue an explicit implementation command when ready

### Edit behavior

When an actual edit is requested, chat works from the latest transformed content when available, so new changes build on previous changes instead of reverting to the original upload.

### Per-file conversational memory

Chat history is isolated by file for source-edit context. This avoids unrelated instructions from another file contaminating the current edit.

### All-files behavior

For an all-files target:

1. the first message establishes intent once
2. conversation-only messages stop without running an edit loop
3. confirmed redesign instructions may fan out to the remaining target files
4. failures are collected instead of necessarily aborting the entire project operation

### Safe reasoning visibility

The UI exposes useful progress/status events, not hidden chain-of-thought. Users see what stage the system is in without exposing private internal reasoning traces.

---

## Realtime agent progress

Rezyn Chat supports Supabase Realtime subscriptions for:

- inserted chat/status events
- project-file status changes

During active processing, the UI also uses short polling as a fallback so progress can continue updating if realtime publication is unavailable.

Typical file states include:

- Source
- Working
- Transformed
- Failed

Typical agent-stage events include:

- Reading the latest source
- Understanding the instruction
- Protecting existing behavior
- Applying design intelligence
- Designing the requested change
- Auditing accessibility/responsiveness/states/motion
- Validating the complete rewritten file
- Saving the updated source

---

## Project and file workflow

### 1. Create a project

Projects store high-level product metadata and target style configuration.

### 2. Upload source

Upload individual files or a ZIP archive.

### 3. Choose a visual direction

Choose one of the 61 active directions globally or assign styles at file level where supported by the workspace.

### 4. Reconstruct

Presentation-bearing files are rebuilt according to the selected direction and Design Intelligence rules.

### 5. Review status

Each project file tracks redesign status, transformed content and redesign errors.

### 6. Refine through chat

Discuss the product normally, then explicitly request further changes when desired.

### 7. Export

Download transformed output as a ZIP.

---

## Upload and archive handling

The upload pipeline is shared by the main project workspace and Rezyn Chat.

### Supported ZIP behavior

`.zip` files are extracted client-side using JSZip.

If a downloaded repository ZIP contains one common root folder, Rezyn strips that root folder from extracted file names to keep project paths cleaner.

### Archive filtering

The ZIP importer skips common non-redesign sources such as:

- `node_modules/`
- `.git/`
- `dist/`
- `build/`
- `.next/`
- `.turbo/`
- `.cache/`
- `coverage/`
- `.vercel/`
- `.netlify/`
- `out/`
- common lockfiles
- package manifests/config files that should not be visually redesigned
- generated `.gen.*` files
- TypeScript declaration files
- unsupported/binary entries
- empty source files

ZIP extraction is currently capped at **300 redesignable files per archive**.

### Unsupported archive formats

`.7z` and `.rar` are not currently extracted. Re-zip them as `.zip` or upload source files individually.

---

## Redesigned ZIP export

The client-side ZIP exporter packages every file that currently contains `redesigned_content`.

The resulting file name follows this pattern:

```text
<project-name>-redesigned.zip
```

Files without redesigned output are currently not included in this exported redesigned ZIP.

---

## Quality, safety and validation

### Independent Design QA

Automatic full reconstruction can run an independent QA pass against:

- the original functional source
- the reconstructed candidate
- the selected design direction
- the relevant Design Intelligence rules

The QA stage treats material problems in these areas as potential release blockers:

- functionality preservation
- genuine replacement of the previous UI
- selected-style fidelity
- accessibility
- responsiveness
- interaction states
- hierarchy
- spacing
- typography
- color contrast
- forms
- ethical UX
- motion and reduced-motion behavior
- performance
- relevant 2D/3D constraints

When QA fails, issues can be fed back into another reconstruction attempt.

### Source size protection

AI processing is currently limited to approximately **300,000 characters per source file**. Larger files should be split before redesign.

### Non-presentation protection

Files that do not carry interface presentation should not be needlessly visually reconstructed.

### Functional selector protection

Selectors, IDs or class names that may be used functionally can be retained for compatibility even while their actual visual presentation is rebuilt.

---

## Supported source types

The redesign/upload pipeline recognizes text-based source including:

```text
.html .htm
.css .scss .sass .less
.js .jsx .ts .tsx
.vue .svelte
.json
.md .mdx .txt
.xml .svg
.astro
.php
.hbs .ejs .twig
.dart
.kt
.swift
.py
```

Not every recognized text file is automatically treated as presentation-bearing. Rezyn applies additional UI-signature detection to avoid unnecessary redesign of non-visual code.

---

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Main Rezyn product experience |
| `/services` | Product/service capability overview |
| `/process` | Reconstruction workflow |
| `/styles` | 61-direction library |
| `/trends` | UI/interaction trend archive |
| `/work` | Proof/work showcase |
| `/auth` | Authentication |
| `/projects` | User project workspace |
| `/projects/$projectId` | Project details, files, styles and reconstruction |
| `/projects/$projectId/chat` | Conversation-first Rezyn design copilot |

---

## Technology stack

### Application

- React 19
- TanStack Start
- TanStack Router
- TanStack Query
- TypeScript
- Vite 8
- Tailwind CSS 4
- shadcn/ui / Radix primitives
- Lucide icons

### Data and authentication

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Realtime
- row-level security policies

### Visual and interactive systems

- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- CSS motion/animation
- responsive Tailwind layouts
- custom direction-preview rendering

### File processing

- JSZip
- browser File APIs
- Supabase Storage for uploaded files

### Validation and server functions

- TanStack server functions
- Zod
- authenticated server middleware
- AI gateway requests with timeout/retry/fallback handling

### Database tooling

- Drizzle Kit
- SQL migrations in `drizzle/migrations`

---

## Database and migrations

Database migrations live under:

```text
drizzle/migrations/
```

Current migration sequence:

| Migration | Purpose |
| --- | --- |
| `0000_create_audit_requests.sql` | Initial audit-request schema |
| `0001_create_projects_and_files.sql` | Projects and project files |
| `0002_project_files_storage_policies.sql` | Storage access policies |
| `0003_add_redesign_output_columns.sql` | Redesigned content/status/error fields |
| `0004_create_redesign_chats.sql` | Persistent Rezyn Chat messages |
| `0005_enable_realtime_redesign_chat.sql` | Realtime publication for chat/file updates |
| `0006_repair_redesign_chat.sql` | Idempotent chat-table repair, policies/realtime repair and schema-cache refresh |

### Important: Rezyn Chat database requirement

The chat route requires the `public.redesign_chats` table. Deploying the frontend alone does **not** create that table.

If the application reports:

```text
Could not find the table 'public.redesign_chats' in the schema cache
```

apply the chat migrations to the same Supabase database used by the application. The repair migration is designed to safely restore the table/policies/index/realtime configuration when missing and request a PostgREST schema-cache refresh.

---

## Environment configuration

Do not commit real production secrets.

### Supabase client

The application reads:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

SSR/server fallbacks are also supported:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

### AI gateway

The current server reconstruction/chat implementation expects a server-side AI gateway credential through:

```text
LOVABLE_API_KEY
```

This variable name is part of the current gateway integration in code; Rezyn itself is documented and operated as its own application rather than as a Lovable editor project.

### Database migration tooling

`drizzle.config.ts` currently reads:

```text
LOVABLE_DB_MIGRATION_URL
```

for PostgreSQL migration access. Treat this as a server/development secret and do not expose it to the browser.

---

## Local development

### Requirements

- Node.js 22 recommended
- npm
- configured Supabase project
- required environment variables
- required database migrations
- AI gateway credential for live redesign/chat AI operations

### Install

```bash
git clone <repository-url>
cd ux-bloom-works
npm install
```

### Start development server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Type verification

The repository CI also performs a TypeScript no-emit verification after generating the TanStack routes.

A local equivalent is:

```bash
npx tsc --noEmit --noUncheckedIndexedAccess false --noPropertyAccessFromIndexSignature false
```

---

## CI verification

`.github/workflows/ui-rebuild-check.yml` validates pushes with:

1. dependency installation
2. production build / route generation
3. TypeScript verification

This catches bundling, generated-route and type-contract regressions before a change is considered validated.

A successful CI build verifies source compatibility; it does not by itself prove that an external production database has received new SQL migrations or that a live AI provider account has available credits.

---

## Project structure

```text
src/
├── components/
│   ├── site/
│   │   ├── DirectionLibrary.tsx
│   │   ├── PreviewTile.tsx
│   │   └── ...
│   └── studio/
├── data/
│   ├── site.ts
│   └── style-catalog.ts
├── integrations/
│   └── supabase/
├── lib/
│   ├── chat-redesign.functions.ts
│   ├── design-intelligence.ts
│   ├── download-zip.ts
│   ├── redesign.functions.ts
│   ├── style-blueprints.ts
│   ├── themes.ts
│   └── upload-files.ts
├── routes/
│   ├── index.tsx
│   ├── styles.tsx
│   ├── projects.index.tsx
│   ├── projects.$projectId.tsx
│   └── projects.$projectId_.chat.tsx
├── direction-library.css
├── direction-thumbnails.css
├── direction-website-previews.css
├── archive-global.css
├── archive-workspace.css
└── chat-agent.css

drizzle/
├── migrations/
└── schema.ts
```

### Important source-of-truth files

- `src/data/style-catalog.ts` — active 61-direction catalog
- `src/lib/style-blueprints.ts` — reconstruction rules for each direction
- `src/lib/design-intelligence.ts` — UI/UX + 2D/3D competency registry and quality gates
- `src/lib/redesign.functions.ts` — automatic full-reconstruction engine and Design QA
- `src/lib/chat-redesign.functions.ts` — conversation intent routing + conversational redesign
- `src/lib/upload-files.ts` — file/ZIP ingestion
- `src/lib/download-zip.ts` — redesigned ZIP generation
- `src/components/site/DirectionLibrary.tsx` — searchable/filterable direction browsing experience

---

## Current limitations

Rezyn is intentionally ambitious, but the current implementation has practical boundaries:

1. **Database migrations are external deployment work.** Pushing application code does not automatically apply SQL to an unrelated Supabase production database.
2. **Chat requires `redesign_chats`.** The chat migrations must exist in the active database.
3. **ZIP extraction supports `.zip`, not `.rar`/`.7z`.**
4. **ZIP redesignable-file extraction is capped at 300 files per archive.**
5. **Individual AI source processing is capped around 300,000 characters.**
6. **The exported redesigned ZIP currently contains files with redesigned output; it is not yet a guaranteed byte-for-byte complete clone of every untouched original asset/config file.**
7. **Desktop DCC knowledge is advisory unless those tools are actually available.** Rezyn understands workflows around Blender, Maya, Houdini, ZBrush, Unreal and related tools, but it must not claim those applications were executed when they were not.
8. **Research disciplines do not imply completed research.** The engine must not fabricate usability studies, eye-tracking, A/B tests, heatmaps or analytics.
9. **AI output can still fail.** Structured validation, carry-over checks, retries and Design QA reduce errors but cannot truthfully guarantee a perfect redesign for every arbitrary codebase.
10. **Cross-file visual consistency is AI/context dependent.** Project manifest/context improves consistency, but extremely large or unusual architectures may benefit from smaller, staged redesign passes.

---

## Product principle

Rezyn is built around one central idea:

> **Keep what the product does. Rebuild how the product feels.**

The old interface is not the template. The selected design direction, product intent, usability requirements and design-intelligence system become the foundation for the next interface.
