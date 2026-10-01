export type PlanningFile = {
  id: string;
  name: string;
  content: string;
  sizeBytes: number | null;
  targetStyle: string | null;
  updatedAt: string;
};

export type DependencyNode = {
  file: string;
  role: string;
  imports: string[];
  internalDependencies: string[];
  externalDependencies: string[];
  dependents: string[];
};

export type ProjectDependencyGraph = {
  version: 1;
  nodes: DependencyNode[];
  sharedRoots: string[];
  entryCandidates: string[];
};

export type ProjectDesignPlan = {
  version: 1;
  summary: string;
  architecture: {
    framework: string;
    appShell: string;
    navigation: string;
    stateAndDataFlow: string;
    sharedStyleEntryPoints: string[];
  };
  designSystem: {
    directionStrategy: string;
    layoutSystem: string;
    typography: string;
    color: string;
    spacing: string;
    surfaces: string;
    components: string;
    motion: string;
    accessibility: string;
    responsive: string;
  };
  sharedComponents: Array<{
    name: string;
    role: string;
    files: string[];
    rules: string[];
  }>;
  filePlans: Array<{
    file: string;
    role: string;
    redesignResponsibility: string;
    preserve: string[];
    coordinateWith: string[];
  }>;
  transformationOrder: string[];
  risks: string[];
};

const IMPORT_PATTERNS = [
  /\b(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
];

const SOURCE_EXTENSIONS = [
  "", ".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".sass", ".less", ".vue", ".svelte", ".astro", ".mdx", ".json",
];

function normalizePath(value: string) {
  const parts: string[] = [];
  for (const piece of value.replace(/\\/g, "/").split("/")) {
    if (!piece || piece === ".") continue;
    if (piece === "..") parts.pop();
    else parts.push(piece);
  }
  return parts.join("/");
}

function dirname(value: string) {
  const normalized = normalizePath(value);
  const index = normalized.lastIndexOf("/");
  return index === -1 ? "" : normalized.slice(0, index);
}

function classifyFile(name: string, content: string) {
  const lower = name.toLowerCase();
  if (/\.(css|scss|sass|less)$/.test(lower)) return "styles/design-system";
  if (/(^|\/)(layout|app|root|shell)\.(t|j)sx?$/.test(lower)) return "app-shell/layout";
  if (/(^|\/)(routes?|pages?|screens?)\//.test(lower)) return "route/page";
  if (/(^|\/)components?\//.test(lower)) return "shared/component";
  if (/(^|\/)(hooks?|stores?|state)\//.test(lower)) return "state/hook";
  if (/(^|\/)(api|server|services?)\//.test(lower)) return "api/service";
  if (/\.(svg|xml)$/.test(lower)) return "visual-asset";
  if (/\.(json|md|mdx|txt)$/.test(lower)) return "content/data";
  if (/className\s*=|<[A-Z][A-Za-z0-9]*[\s/>]|<\w+[\s>]/.test(content)) return "presentation/component";
  return "logic/support";
}

function collectImports(content: string) {
  const found = new Set<string>();
  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of content.matchAll(pattern)) {
      if (match[1]) found.add(match[1]);
    }
  }
  return Array.from(found).sort();
}

function resolveInternalImport(from: string, specifier: string, fileNames: Set<string>) {
  if (!specifier.startsWith(".")) return null;
  const base = normalizePath(`${dirname(from)}/${specifier}`);
  const candidates = SOURCE_EXTENSIONS.flatMap((extension) => [
    `${base}${extension}`,
    ...SOURCE_EXTENSIONS.filter(Boolean).map((indexExtension) => `${base}/index${indexExtension}`),
  ]);
  return candidates.find((candidate) => fileNames.has(candidate)) ?? null;
}

function stableHash(value: string) {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code + index;
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return `${(h1 >>> 0).toString(16).padStart(8, "0")}${(h2 >>> 0).toString(16).padStart(8, "0")}`;
}

export function buildProjectDependencyGraph(files: PlanningFile[]): ProjectDependencyGraph {
  const names = new Set(files.map((file) => normalizePath(file.name)));
  const mutable = files.map((file) => {
    const name = normalizePath(file.name);
    const imports = collectImports(file.content);
    const internalDependencies = imports
      .map((specifier) => resolveInternalImport(name, specifier, names))
      .filter((value): value is string => Boolean(value));
    const internalSet = new Set(internalDependencies);
    return {
      file: name,
      role: classifyFile(name, file.content),
      imports,
      internalDependencies: Array.from(internalSet).sort(),
      externalDependencies: imports.filter((specifier) => !specifier.startsWith(".")).sort(),
      dependents: [] as string[],
    };
  });

  const byName = new Map(mutable.map((node) => [node.file, node]));
  for (const node of mutable) {
    for (const dependency of node.internalDependencies) {
      const target = byName.get(dependency);
      if (target) target.dependents.push(node.file);
    }
  }
  for (const node of mutable) node.dependents.sort();

  const sharedRoots = mutable
    .filter((node) => node.dependents.length >= 2 || /styles\/design-system|shared\/component|app-shell\/layout/.test(node.role))
    .sort((a, b) => b.dependents.length - a.dependents.length || a.file.localeCompare(b.file))
    .map((node) => node.file);

  const entryCandidates = mutable
    .filter((node) => /app-shell|route\/page/.test(node.role) || /(^|\/)(main|index|app|root)\.(t|j)sx?$/.test(node.file.toLowerCase()))
    .map((node) => node.file);

  return { version: 1, nodes: mutable, sharedRoots, entryCandidates };
}

export function buildProjectPlanSignatures(opts: {
  projectId: string;
  styleMode: string;
  targetStyle: string | null;
  files: PlanningFile[];
}) {
  const sourceMaterial = opts.files
    .map((file) => {
      const content = file.content;
      const sample = content.length > 12_000 ? `${content.slice(0, 6_000)}${content.slice(-6_000)}` : content;
      return [normalizePath(file.name), file.sizeBytes ?? content.length, file.updatedAt, stableHash(sample)].join("|");
    })
    .sort()
    .join("\n");

  const styleMaterial = [
    opts.projectId,
    opts.styleMode,
    opts.targetStyle ?? "",
    ...opts.files.map((file) => `${normalizePath(file.name)}=${file.targetStyle ?? ""}`).sort(),
  ].join("\n");

  return {
    sourceSignature: `src-${stableHash(sourceMaterial)}`,
    styleSignature: `style-${stableHash(styleMaterial)}`,
  };
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function stringArray(value: unknown, limit = 40) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim()).slice(0, limit);
}

export function parseProjectDesignPlan(rawValue: string, files: PlanningFile[]): ProjectDesignPlan {
  const raw = rawValue.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const architecture = (parsed["architecture"] ?? {}) as Record<string, unknown>;
  const designSystem = (parsed["designSystem"] ?? {}) as Record<string, unknown>;
  const knownFiles = new Set(files.map((file) => normalizePath(file.name)));

  const sharedComponents = Array.isArray(parsed["sharedComponents"])
    ? parsed["sharedComponents"].slice(0, 40).map((item) => {
        const row = (item ?? {}) as Record<string, unknown>;
        return {
          name: stringValue(row["name"], "Shared system"),
          role: stringValue(row["role"], "Shared presentation responsibility"),
          files: stringArray(row["files"]).filter((file) => knownFiles.has(normalizePath(file))).map(normalizePath),
          rules: stringArray(row["rules"], 12),
        };
      })
    : [];

  const filePlans = Array.isArray(parsed["filePlans"])
    ? parsed["filePlans"].slice(0, Math.max(1, files.length * 2)).map((item) => {
        const row = (item ?? {}) as Record<string, unknown>;
        return {
          file: normalizePath(stringValue(row["file"])),
          role: stringValue(row["role"], "project file"),
          redesignResponsibility: stringValue(row["redesignResponsibility"], "Follow the project design system and preserve behavior."),
          preserve: stringArray(row["preserve"], 16),
          coordinateWith: stringArray(row["coordinateWith"], 16).filter((file) => knownFiles.has(normalizePath(file))).map(normalizePath),
        };
      }).filter((item) => knownFiles.has(item.file))
    : [];

  const existingPlanned = new Set(filePlans.map((item) => item.file));
  for (const file of files) {
    const normalized = normalizePath(file.name);
    if (!existingPlanned.has(normalized)) {
      filePlans.push({
        file: normalized,
        role: classifyFile(normalized, file.content),
        redesignResponsibility: "Follow the shared project design system; preserve this file's functional contract.",
        preserve: [],
        coordinateWith: [],
      });
    }
  }

  const requestedOrder = stringArray(parsed["transformationOrder"], files.length * 2)
    .map(normalizePath)
    .filter((file) => knownFiles.has(file));
  const seen = new Set(requestedOrder);
  const transformationOrder = [...requestedOrder, ...files.map((file) => normalizePath(file.name)).filter((file) => !seen.has(file))];

  return {
    version: 1,
    summary: stringValue(parsed["summary"], "Project-wide reconstruction plan."),
    architecture: {
      framework: stringValue(architecture["framework"], "Use the project's existing framework and runtime."),
      appShell: stringValue(architecture["appShell"], "Preserve routing behavior while rebuilding the application shell coherently."),
      navigation: stringValue(architecture["navigation"], "Preserve navigation destinations and rebuild their presentation consistently."),
      stateAndDataFlow: stringValue(architecture["stateAndDataFlow"], "Preserve state, APIs, data bindings and business logic."),
      sharedStyleEntryPoints: stringArray(architecture["sharedStyleEntryPoints"]).filter((file) => knownFiles.has(normalizePath(file))).map(normalizePath),
    },
    designSystem: {
      directionStrategy: stringValue(designSystem["directionStrategy"]),
      layoutSystem: stringValue(designSystem["layoutSystem"]),
      typography: stringValue(designSystem["typography"]),
      color: stringValue(designSystem["color"]),
      spacing: stringValue(designSystem["spacing"]),
      surfaces: stringValue(designSystem["surfaces"]),
      components: stringValue(designSystem["components"]),
      motion: stringValue(designSystem["motion"]),
      accessibility: stringValue(designSystem["accessibility"]),
      responsive: stringValue(designSystem["responsive"]),
    },
    sharedComponents,
    filePlans,
    transformationOrder,
    risks: stringArray(parsed["risks"], 20),
  };
}

export function formatProjectPlanForPrompt(plan: ProjectDesignPlan, graph: ProjectDependencyGraph, currentFile: string) {
  const filePlan = plan.filePlans.find((item) => normalizePath(item.file) === normalizePath(currentFile));
  const node = graph.nodes.find((item) => normalizePath(item.file) === normalizePath(currentFile));
  const shared = plan.sharedComponents.filter((item) => item.files.some((file) => normalizePath(file) === normalizePath(currentFile)));

  return [
    "PROJECT-LEVEL DESIGN PLAN — authoritative across every transformed file:",
    `Summary: ${plan.summary}`,
    `Architecture / framework: ${plan.architecture.framework}`,
    `Architecture / app shell: ${plan.architecture.appShell}`,
    `Architecture / navigation: ${plan.architecture.navigation}`,
    `Architecture / state and data: ${plan.architecture.stateAndDataFlow}`,
    `Shared style entry points: ${plan.architecture.sharedStyleEntryPoints.join(", ") || "none identified"}`,
    "Design system:",
    `- Direction strategy: ${plan.designSystem.directionStrategy}`,
    `- Layout: ${plan.designSystem.layoutSystem}`,
    `- Typography: ${plan.designSystem.typography}`,
    `- Color: ${plan.designSystem.color}`,
    `- Spacing: ${plan.designSystem.spacing}`,
    `- Surfaces/materials: ${plan.designSystem.surfaces}`,
    `- Components: ${plan.designSystem.components}`,
    `- Motion: ${plan.designSystem.motion}`,
    `- Accessibility: ${plan.designSystem.accessibility}`,
    `- Responsive: ${plan.designSystem.responsive}`,
    filePlan ? `Current file responsibility: ${filePlan.redesignResponsibility}` : "Current file responsibility: follow the shared plan.",
    filePlan?.preserve.length ? `Current file preserve contracts: ${filePlan.preserve.join("; ")}` : "Current file preserve contracts: preserve all real behavior.",
    filePlan?.coordinateWith.length ? `Coordinate with: ${filePlan.coordinateWith.join(", ")}` : "Coordinate with: use shared project decisions.",
    node?.internalDependencies.length ? `Static internal dependencies: ${node.internalDependencies.join(", ")}` : "Static internal dependencies: none resolved.",
    node?.dependents.length ? `Static dependents: ${node.dependents.join(", ")}` : "Static dependents: none resolved.",
    shared.length ? `Shared systems touching this file: ${shared.map((item) => `${item.name} — ${item.rules.join("; ")}`).join(" | ")}` : "Shared systems touching this file: follow global design-system rules.",
    plan.risks.length ? `Project risks to avoid: ${plan.risks.join(" | ")}` : "Project risks: preserve cross-file contracts and avoid local one-off styling.",
    "Do not contradict this plan unless the source proves a functional constraint requires it. Do not create a file-local design system that diverges from the project plan.",
  ].join("\n");
}
