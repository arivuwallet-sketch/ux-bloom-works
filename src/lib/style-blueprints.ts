const STYLE_BLUEPRINTS: Record<string, string> = {
  Minimalism:
    "Build a highly restrained interface with generous negative space, a very small type scale, quiet neutral surfaces, almost no decoration, crisp alignment, and one clear action hierarchy. Remove ornamental containers and let spacing, proportion, and typography create the structure.",
  "Swiss / International":
    "Reconstruct on a rigorous modular grid with mathematical alignment, asymmetric editorial composition, strong grotesk/sans typography, disciplined whitespace, rule lines, and a limited neutral-plus-red palette. Hierarchy should come from scale and grid position rather than decoration.",
  "Flat design":
    "Use clean two-dimensional composition, solid color fields, simple geometric icons, direct hierarchy, and zero faux depth. Avoid gradients, glass, bevels, realistic textures, and decorative shadows; use color blocking and spacing as the primary structure.",
  Neumorphism:
    "Use a single soft background material with controls and panels appearing gently extruded or inset through paired highlights and shadows. Keep contrast accessible, geometry calm and rounded, and make the whole interface feel machined from one tactile surface.",
  "Monochrome UI":
    "Use one dominant hue family from near-black through tinted midtones to near-white, with hierarchy created by value, scale, spacing, and density. Keep the composition sophisticated and restrained, with no competing accent colors.",
  Brutalism:
    "Build a raw, confrontational interface with visible structure, oversized typography, hard black rules, square geometry, browser-default-inspired controls, abrupt spacing shifts, and intentionally unpolished composition. Avoid soft glass, subtle gradients, and conventional polished SaaS card styling.",
  "Neo-brutalism":
    "Use chunky black outlines, bright flat colors, offset hard shadows, oversized type, playful block composition, and strongly separated interactive elements. Everything should feel graphic, physical, and deliberately bold rather than sleek or glassy.",
  Maximalism:
    "Create a dense, layered composition with multiple scales, expressive typography, saturated colors, overlapping modules, patterns, ornaments, and controlled visual collision. Maintain usable hierarchy while embracing abundance rather than simplifying the interface.",
  "Anti-design":
    "Deliberately reject conventional symmetry and polished grid logic: use disruptive alignment, unexpected scale, awkward-yet-intentional spacing, clashing type treatments, exposed structure, and surprising placement while keeping interaction understandable and accessible.",
  "Punk / zine":
    "Rebuild as a DIY editorial collage with cut-paper composition, photocopy texture, torn edges, marker-like accents, rotated blocks, rough rules, ransom-note energy, and intentionally imperfect typography. Preserve usability beneath the rebellious print aesthetic.",
  Glassmorphism:
    "Use translucent layered surfaces, strong backdrop blur, luminous gradients behind panels, subtle hairline borders, realistic light separation, and depth through overlapping planes. Keep glass readable with sufficient contrast and avoid turning every element into the same frosted card.",
  Skeuomorphism:
    "Reconstruct controls and surfaces as believable physical objects using material cues, highlights, inset states, dimensional buttons, realistic texture, and object-like affordances. The result should feel tactile and crafted without sacrificing modern responsive usability.",
  Claymorphism:
    "Use soft inflated forms, pillowy cards, rounded controls, pastel or cheerful color, large radii, gentle inner/outer shadows, and toy-like dimensionality. Components should feel molded from soft clay rather than flat rectangles.",
  "Layered depth":
    "Build a spatial hierarchy from stacked planes, floating sections, controlled elevation, soft diffused shadows, overlapping content, and clear foreground/background relationships. Use depth intentionally to guide attention rather than decorating every element.",
  Y2K:
    "Create an optimistic early-2000s digital aesthetic with chrome, glossy gradients, translucent plastics, bubble shapes, bevels, starbursts, compact techno typography, and playful interface chrome. It should feel intentionally retro-digital, not like a modern UI with one metallic button.",
  Vaporwave:
    "Use saturated pink/cyan/purple gradients, retro grid or horizon cues, dreamy glow, nostalgic digital typography, soft glitch artifacts, and surreal synthetic atmosphere. Recompose the entire page around the mood rather than adding a vaporwave background behind an old layout.",
  "Retro-futurism":
    "Design the product as the past imagined the future: geometric instrument-panel composition, optimistic sci-fi typography, warm metallic or atomic-age accents, technical diagrams, capsule controls, and dramatic display shapes with modern usability underneath.",
  Memphis:
    "Use postmodern geometric play: asymmetrical blocks, squiggles, dots, triangles, primary/pastel color clashes, black graphic marks, and energetic negative space. Layout should feel intentionally composed from playful shapes rather than ordinary cards.",
  "Art deco revival":
    "Rebuild around symmetry, strong vertical rhythm, geometric frames, stepped forms, fine ornament, elegant serif/display typography, dark luxury surfaces, and restrained metallic accents. Avoid generic luxury gradients; use unmistakable Deco proportion and geometry.",
  "Dark UI":
    "Create a purpose-built dark interface with layered near-black surfaces, excellent contrast, restrained luminous accents, dense-but-legible information hierarchy, subtle borders, and minimal glare. Do not simply invert a light theme; redesign spacing, elevation, and emphasis for dark environments.",
  Cyberpunk:
    "Use near-black technical surfaces, neon accent channels, dense HUD-like information framing, scan/grid motifs, angular geometry, monospace microcopy, luminous borders, and high-energy data presentation. Recompose navigation and content as an immersive digital system rather than applying neon colors to existing cards.",
  "Bento grid":
    "Rebuild the page as an asymmetric modular bento system with varied card spans, strong content grouping, compact micro-layouts, and purposeful rhythm between large feature modules and small utility modules. The grid itself must become the primary information architecture.",
  "Gradient mesh / aurora":
    "Use large soft color fields, blurred aurora meshes, luminous atmospheric backdrops, restrained translucent surfaces, generous spacing, and elegant modern typography. Compose content to float within the gradient environment rather than placing an old layout over a gradient image.",
  "Generative / 3D":
    "Build a spatial, motion-forward interface centered on rendered/generative forms, depth, perspective, lighting, parallax-ready composition, and layered UI planes. Keep the page usable even without WebGL, but make the visual architecture clearly designed around three-dimensional focal elements.",
  Editorial:
    "Reconstruct like a contemporary magazine: dramatic art direction, strong headline typography, columns, captions, pull quotes, image-led pacing, ruled details, and asymmetric spreads. Replace conventional app-card rhythm with editorial storytelling and typographic hierarchy.",
  Broadsheet:
    "Use newspaper logic with dense but ordered columns, serif headlines, compact sans metadata, hairline rules, section labels, datelines, and strongly structured information density. The page should feel like a digital front page rather than a generic marketing site.",
  "Organic / hand-drawn":
    "Use imperfect hand-made geometry, sketch-like borders, irregular shapes, warm natural colors, textured surfaces, handwritten accents, and loose human spacing. Avoid polished geometric card systems; make the interface feel authored by hand while preserving clarity.",
  "Playful / illustrative":
    "Center the redesign on expressive illustration, characterful shapes, friendly color, bouncy composition, rounded interaction, surprising micro-details, and a warm approachable hierarchy. The illustration language should shape the layout itself, not appear as decoration beside standard SaaS sections.",
};

export function getStyleBlueprint(style: string): string {
  return (
    STYLE_BLUEPRINTS[style] ??
    `Rebuild the entire presentation from a blank canvas using an unmistakable, expert-level ${style} visual language. Make the layout architecture, hierarchy, typography, spacing, surfaces, controls, navigation treatment, responsive behavior, and interaction character all derive from ${style}, not from the uploaded design.`
  );
}
