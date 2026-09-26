import type { Lang } from "./i18n";

/**
 * norte next to the file managers people come from. Every cell was checked
 * against the project's own documentation on 2026-09-26 (sources at the end);
 * a cell that could not be confirmed says so rather than guess. Wrong or out
 * of date? The page asks readers to open an issue.
 */

export const CHECKED = "2026-09-26";

export type Cell = "yes" | "plugin" | "partial" | "no";
type Row = { label: Record<Lang, string>; cells: [Cell, Cell, Cell, Cell, Cell]; notes?: Partial<Record<number, Record<Lang, string>>> };

export const PRODUCTS = ["norte", "Midnight Commander", "Far Manager", "Total Commander", "yazi"] as const;

export const ROWS: Row[] = [
  { label: { en: "Runs in a terminal", es: "Funciona en una terminal" }, cells: ["yes", "yes", "yes", "no", "yes"] },
  { label: { en: "Native desktop window", es: "Ventana de escritorio nativa" }, cells: ["yes", "no", "no", "yes", "no"] },
  {
    label: { en: "Two panes by default", es: "Dos paneles por defecto" },
    cells: ["yes", "yes", "yes", "yes", "no"],
    notes: { 4: { en: "Miller columns", es: "columnas Miller" } },
  },
  {
    label: { en: "Several screens on one core (daemon)", es: "Varias pantallas sobre un núcleo (daemon)" },
    cells: ["yes", "no", "no", "no", "no"],
    notes: { 4: { en: "DDS syncs state, not tasks", es: "DDS comparte estado, no tareas" } },
  },
  {
    label: { en: "SFTP", es: "SFTP" },
    cells: ["yes", "yes", "plugin", "plugin", "yes"],
    notes: { 2: { en: "NetBox", es: "NetBox" }, 3: { en: "SFTP plugin", es: "plugin SFTP" } },
  },
  {
    label: { en: "S3 / object storage", es: "S3 / almacenamiento de objetos" },
    cells: ["yes", "plugin", "plugin", "plugin", "no"],
    notes: {
      1: { en: "s3+ extfs, reported broken", es: "extfs s3+, con fallos reportados" },
      2: { en: "NetBox", es: "NetBox" },
      3: { en: "third-party wfx", es: "wfx de terceros" },
    },
  },
  {
    label: { en: "Archives as folders", es: "Comprimidos como carpetas" },
    cells: ["yes", "yes", "yes", "yes", "plugin"],
    notes: { 4: { en: "archivemount.yazi", es: "archivemount.yazi" } },
  },
  {
    label: { en: "Undo of copies, moves, renames, deletes", es: "Deshacer copias, movimientos, renombrados y borrados" },
    cells: ["yes", "no", "no", "no", "no"],
  },
  {
    label: { en: "Journal of every operation", es: "Diario de cada operación" },
    cells: ["yes", "no", "no", "partial", "no"],
    notes: { 0: { en: "hash-chained", es: "encadenado por hash" }, 3: { en: "optional log file", es: "log opcional" } },
  },
  {
    label: { en: "AI agents, under a policy (MCP)", es: "Agentes de IA, bajo una política (MCP)" },
    cells: ["yes", "no", "no", "no", "no"],
  },
  {
    label: { en: "Plugins, sandboxed with consent", es: "Plugins aislados y con consentimiento" },
    cells: ["yes", "no", "no", "no", "no"],
    notes: {
      0: { en: "WASM, per capability", es: "WASM, por permiso" },
      1: { en: "scripts, full rights", es: "scripts, sin límites" },
      2: { en: "native DLLs", es: "DLL nativas" },
      3: { en: "native DLLs", es: "DLL nativas" },
      4: { en: "Lua, no sandbox documented", es: "Lua, sin aislamiento documentado" },
    },
  },
  {
    label: { en: "Copies in the background", es: "Copias en segundo plano" },
    cells: ["yes", "yes", "plugin", "yes", "yes"],
  },
];

/** The rows where norte says yes and the other four say no: the home page's summary. */
export const COMPARE_ONLY = ROWS.filter((r) => r.cells[0] === "yes" && r.cells.slice(1).every((c) => c === "no"));

export const PLATFORMS: Record<Lang, string[]> = {
  en: ["Linux · macOS & Windows from source", "Linux · macOS · BSD", "Windows (far2l fork: Linux, macOS)", "Windows · Android", "Linux · macOS · Windows"],
  es: ["Linux · macOS y Windows desde el código", "Linux · macOS · BSD", "Windows (el fork far2l: Linux, macOS)", "Windows · Android", "Linux · macOS · Windows"],
};

export const LICENSES = ["AGPL-3.0 (protocol MIT/Apache)", "GPL-3.0+", "BSD-3-Clause", "Shareware", "MIT"];

export const SOURCES: [string, string][] = [
  ["Midnight Commander manual", "https://source.midnight-commander.org/man/mc.html"],
  ["mc s3+ helper and its open issue", "https://github.com/MidnightCommander/mc/issues/3904"],
  ["Far Manager", "https://github.com/FarGroup/FarManager"],
  ["NetBox for Far", "https://github.com/michaellukashov/Far-NetBox"],
  ["far2l", "https://github.com/elfmz/far2l"],
  ["Total Commander plugins", "https://www.ghisler.com/plugins.htm"],
  ["yazi", "https://github.com/sxyazi/yazi"],
  ["yazi DDS", "https://yazi-rs.github.io/docs/dds"],
];
