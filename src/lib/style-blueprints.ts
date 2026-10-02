export const STYLE_BLUEPRINTS: Record<string, string> = {
  "Glassmorphism": "Rebuild with layered translucent planes, believable backdrop blur, luminous depth, hairline borders, selective glass surfaces, high legibility, and spatial overlap. Glass must shape the composition rather than merely skin old cards.",
  "Neumorphism (Soft UI)": "Rebuild from one soft material field using paired highlight/shadow extrusion, inset controls, restrained rounded geometry, tactile states, and accessibility-safe contrast. Components should feel pressed from the same surface.",
  "Claymorphism": "Recompose with inflated rounded forms, pastel dimensional surfaces, pillowy cards, soft inner and outer shadows, chunky friendly controls, and toy-like tactile hierarchy without sacrificing clarity.",
  "Liquid Glass": "Build a fluid refractive interface with curved glass masses, specular highlights, lens-like distortion cues, layered transparency, flowing silhouettes, and motion-ready depth. Avoid ordinary frosted-card glassmorphism.",
  "Squirclemorphism": "Make continuous-radius squircle geometry the core system: smooth superellipse containers, nested rounded modules, soft but precise spacing, controlled depth, and cohesive icon/control silhouettes.",
  "Metalmorphism": "Rebuild with engineered metallic materials, brushed and polished surfaces, cool reflections, machined edges, precise grids, technical typography, embossed controls, and restrained industrial depth.",
  "AR-morphism": "Reconstruct as spatial overlays anchored to an implied environment: floating labels, depth-separated controls, reticles, translucent spatial panels, contextual callouts, and clear near/far hierarchy inspired by augmented reality.",
  "Skeuomorphism 2.0": "Use modern physical realism selectively: tactile material cues, convincing highlights, inset/pressed states, object-like controls, texture, depth and affordance while retaining contemporary responsive layout and accessibility.",

  "Bento Grid": "Make an asymmetric bento grid the information architecture, mixing large feature cells with compact utility cells, varied spans, nested micro-layouts, strong grouping, and responsive reflow. Do not preserve conventional section stacking.",
  "Window Grids 2.0 / Windowing": "Rebuild the interface as a system of independent adaptive windows with title bars, resizable-looking panes, overlapping or tiled modules, persistent utilities, and desktop-like spatial organization translated responsively.",
  "Swiss Design (International Typographic Style)": "Use a rigorous modular grid, mathematical alignment, asymmetric composition, grotesk typography, disciplined whitespace, rule lines, limited color and hierarchy driven by scale and position rather than decoration.",
  "Bauhaus Functionalism": "Rebuild around function-first geometric composition, primary shapes, red/blue/yellow accents, black structure, rational typography, visible modular logic, and purposeful asymmetry with no ornamental excess.",
  "Asymmetric Grids": "Discard centered symmetry and rebuild around intentionally uneven columns, off-axis anchors, variable spans, tension between negative space and density, and balanced visual weight across a responsive asymmetric grid.",
  "100% Height / Full-Screen Viewports": "Turn major states into immersive viewport-height scenes with strong vertical pacing, oversized focal content, snap-like section logic, minimal simultaneous information, and responsive full-screen transitions.",
  "Card-Based UI / Modular Blocks": "Rebuild the product as a coherent modular block system with purposeful card types, distinct spans, embedded controls, clear grouping, reusable module rhythm and responsive stacking—not a generic equal-card grid.",

  "Brutalism": "Use raw visible structure, hard rules, square geometry, oversized typography, browser-default-inspired controls, abrupt spacing, strong contrast and intentionally unpolished composition. Avoid smooth SaaS polish.",
  "Neo-Brutalism (Neubrutalism)": "Use thick high-contrast outlines, bright flat colors, offset hard shadows, chunky typography, playful block composition and obvious interaction states. The whole layout must feel graphic and physical. In Tailwind v4 projects: keep @custom-variant and @theme/@theme inline top-level; put runtime tokens in :root and .dark rather than nested dark: blocks; implement reusable Neo border, shadow, font and interaction primitives with @utility and supported theme namespaces so Tailwind composes hover/focus/active/responsive variants; never hand-code escaped variant selectors. Preserve the project's semantic --background/--foreground/--primary/--input/--ring/--chart-*/--radius API. Keep --input visibly distinct from background/card in both themes. Make .border-neo explicitly solid so global border:none resets cannot erase it. Use calc() for custom-property transform arithmetic, use a visible non-zero pressed inset shadow, and add prefers-reduced-motion handling that removes animated movement without removing immediate state feedback. Verify 4.5:1 normal text/link contrast and 3:1 focus indicators in both themes, including primary/secondary/accent/destructive/sidebar foreground pairs.",
  "Memphis Style": "Recompose with postmodern geometric play: squiggles, dots, triangles, circles, asymmetric blocks, primary/pastel clashes, black graphic marks and lively negative space integrated into the layout.",
  "Risograph": "Build around limited spot-color layers, visible grain, imperfect registration, overprint effects, bold flat shapes, rough texture and print-poster composition while keeping digital controls legible.",
  "Art Deco": "Rebuild with geometric symmetry, stepped forms, vertical rhythm, fine ornament, dark luxury fields, metallic accents, elegant display typography and unmistakable Deco framing rather than generic premium styling.",
  "Art Nouveau": "Use flowing organic curves, botanical linework, decorative frames, elongated typography, natural motifs and integrated ornament that guides section shapes and navigation while preserving modern usability.",
  "Psychedelic / Acid Graphic": "Reconstruct with warped typography, saturated acidic palettes, optical patterns, liquid shapes, distorted grids, high-energy scale shifts and controlled visual hallucination while maintaining navigable interaction zones.",
  "Pop Art": "Use comic-book scale, halftone fields, bold outlines, speech-bubble cues, saturated primaries, repeated motifs, poster typography and dramatic panel composition to structure the interface.",

  "Web 1.0 Retro": "Rebuild as an intentionally early-web experience using hyperlink-forward navigation, visible tables/frames, tiled motifs, compact browser-era typography, simple controls, badges and raw digital charm while remaining responsive.",
  "Pixel Art UI": "Use crisp bitmap geometry, pixel borders, sprite-like icons, stepped shadows, game-menu hierarchy, limited palettes and grid-snapped spacing. Avoid anti-aliased softness in the visual language.",
  "Vaporwave": "Recompose around pink/cyan/purple synthetic atmosphere, retro horizons, dreamy glow, nostalgic digital typography, grid motifs, faux-3D artifacts and surreal spatial pacing—not simply a gradient background.",
  "Synthwave / Retrowave": "Build a dark cinematic retro-future system with neon horizon grids, sunset gradients, chrome accents, angular panels, outrun typography, glow and strong depth toward a vanishing point.",
  "Y2K Aesthetic": "Use glossy chrome, translucent plastics, bevels, bubble geometry, iridescent gradients, starbursts, compact techno type and optimistic early-2000s digital interface chrome across the entire composition.",
  "Frutiger Aero": "Rebuild with bright sky and water palettes, glossy nature-tech surfaces, bubbles, green landscape cues, friendly dimensional icons, optimistic translucency and clean humanist typography.",
  "Steampunk UI": "Use brass, copper, leather-like surfaces, gauges, rivets, mechanical frames, engraved labels, radial controls and crafted industrial hierarchy without obscuring modern interaction clarity.",

  "Flat Design": "Use pure two-dimensional composition, solid color fields, simple geometry, direct typography and zero faux depth. Structure must come from spacing, scale and color blocking rather than shadows or material simulation.",
  "Flat 2.0 (Semi-Flat)": "Keep the clarity of flat design but introduce restrained elevation, subtle gradients, lightweight shadows, layered surfaces and richer interaction feedback without returning to realism.",
  "Material Design": "Reconstruct around systematic surfaces, elevation, responsive grids, state layers, clear component roles, purposeful motion, strong typography and consistent interaction feedback inspired by mature Material principles.",
  "Exaggerated Minimalism": "Use extreme negative space, enormous typography, very few focal objects, radical scale contrast, sparse navigation and precise alignment. Every remaining element must carry substantial visual weight.",
  "Monochromatic Design": "Use one hue family from near-black through tonal mids to near-white, with hierarchy created through value, scale, density and spacing. No competing accent palette.",
  "Color Blocking": "Make large flat color territories define navigation, sections and interaction zones. Use strong geometric boundaries, contrasting typography and compositional blocks instead of card-by-card styling.",
  "E-Ink / Utilitarian": "Rebuild for extreme legibility and low distraction using black/white or very limited grayscale, sharp typography, dense utility layout, minimal imagery, simple borders and low-motion interaction.",

  "Dark Mode Maturity": "Design natively for darkness with layered near-black values, calibrated contrast, restrained luminous accents, glare control, readable borders, dark-optimized elevation and information density—not a light theme inverted.",
  "Aurora UI": "Use soft multicolor gradient meshes, blurred luminous fields, atmospheric depth, restrained translucent overlays, elegant typography and floating composition shaped around the aurora environment.",
  "Inclusive / Accessibility-First": "Rebuild around WCAG-minded contrast, large readable type, obvious focus and hover states, generous targets, redundant non-color cues, logical hierarchy, reduced-motion friendliness and cognitive clarity as visual features.",
  "Sustainable / Green UX": "Use restrained media, low-energy dark/neutral areas where appropriate, efficient typography, lightweight decoration, earthy/natural accents, clear information density and visuals that communicate ecological restraint rather than greenwashing.",

  "Kinetic Typography": "Make typography the primary spatial and motion system: oversized words, variable scale, directional type, scroll-ready transitions, rhythmic text fields and minimal supporting graphics. Layout should be choreographed around type movement.",
  "Scrapbook Collage": "Rebuild as mixed-media editorial collage with layered paper, tape, torn edges, stickers, photographs, handwritten notes, rotated fragments and tactile overlap while preserving clear clickable zones.",
  "Glitch Art / Datamoshing": "Use signal tears, RGB separation, compression artifacts, scan breaks, displaced layers, noisy transitions and corrupted digital textures as structural devices while keeping core content readable.",
  "Cinematic / Scrollytelling": "Recompose as sequential scenes with dramatic full-bleed framing, large visual beats, sparse scene copy, layered depth, sticky/scroll-driven narrative zones and cinematic transitions between states.",
  "Experimental / Radical Navigation": "Replace conventional top-nav assumptions with an exploratory but learnable system such as spatial menus, edge rails, radial clusters, command surfaces or context navigation, with clear orientation and escape paths.",
  "Infinite / Endless Galleries": "Build around continuous visual flow: looping strips, endless masonry, horizontal/vertical streams, seamless pagination cues and persistent orientation controls. Browsing itself becomes the dominant interaction.",
  "Scattered Galleries": "Use a free-positioned canvas of varied media objects with intentional overlap, scale variation, drag/hover-ready spatial cues, loose clustering and exploratory navigation rather than linear card rows.",
  "Gamified UX": "Rebuild interactions around progress, levels, streaks, achievements, quests, feedback loops and visible state advancement while keeping product goals primary and avoiding manipulative mechanics.",

  "Biophilic UI": "Use daylight palettes, botanical forms, natural textures, soft organic geometry, spacious breathing room and visual references to living environments. Nature should shape layout rhythm, not just appear as imagery.",
  "Biomimetic UI": "Derive structures and interaction patterns from living systems: branching navigation, cellular modules, adaptive growth, radial networks, organic feedback and efficient natural hierarchy translated into usable UI.",
  "Japandi": "Combine Japanese restraint with Scandinavian warmth: quiet neutrals, warm wood-like tones, disciplined spacing, simple craft-inspired geometry, minimal ornament, calm typography and purposeful asymmetry.",
  "Wabi-Sabi Aesthetic": "Use quiet imperfection, irregular edges, textured neutral surfaces, asymmetry, muted earth tones, handcrafted spacing and aged/material cues. Avoid machine-perfect repetition.",
  "Calm Design / Decompressed UI": "Reduce cognitive load through generous whitespace, low information density, soft hierarchy, limited actions per view, muted color, gentle typography and subtle feedback. The interface should feel unhurried.",

  "Generative UI / Dynamic Component Assembly": "Rebuild as an adaptive composition where modules appear assembled around context: flexible zones, variable card sizes, context panels, dynamic priorities and system-generated structure rather than one frozen page template.",
  "Agentic UX": "Center the experience on goals, delegation and autonomous execution: task composer, agent state, plans, progress, approvals, artifacts, exceptions and clear human-control checkpoints instead of ordinary dashboard navigation.",
  "Conversational Layering / Chat-First UX": "Make conversation the primary shell, with rich contextual cards, tools, previews, files and actions layered around the dialogue. Avoid a generic chat box pasted beside the old product layout.",
  "Spatial UI": "Organize the product through depth, floating planes, perspective, near/far hierarchy, anchored utilities and layered navigation. The interface should read as a navigable spatial environment even without WebGL.",
  "Ambient AI / Intent UI": "Create a quiet adaptive interface where assistance appears contextually around user intent: subtle suggestions, ambient state, low-friction commands, contextual shortcuts and minimal persistent chrome.",
  "Predictive / Anticipatory UX": "Rebuild around probable next actions, smart defaults, prefilled context, proactive panels and ranked options while clearly labeling predictions and preserving user control and reversibility.",
  "Intentional Imperfection (Anti-Perfect UI)": "Reject generic AI polish using irregular spacing, asymmetric hand-tuned composition, human texture, unexpected but coherent typography, uneven geometry and crafted inconsistencies while maintaining strong usability.",
};

export const STYLE_NAMES = Object.freeze(Object.keys(STYLE_BLUEPRINTS));

export function getStyleBlueprint(style: string): string {
  return (
    STYLE_BLUEPRINTS[style] ??
    `Rebuild the entire presentation from a blank canvas using an unmistakable, expert-level ${style} visual language. Make layout architecture, hierarchy, typography, spacing, surfaces, controls, navigation, responsive behavior and interaction character all derive from ${style}, never from the uploaded design.`
  );
}
