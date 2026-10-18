/**
 * The facts the page repeats. One place, so a release bump is one edit and the
 * hero, the download tiles and the footer cannot drift apart. Each number is
 * read from the repository; where from is written next to it.
 */

export const REPO = "https://github.com/compilando/norte";
export const SITE = "https://getnorte.dev";
/** Where to write: questions, collaboration, sponsorship. */
export const EMAIL = "parhelion@tutamail.com";

/** Cargo.toml, `version`. */
const VERSION = "0.3.0-alpha.16";
/**
 * Every link names the tag. GitHub's `releases/latest` skips pre-releases, and
 * every alpha is one: there `latest/download/…` is a 404.
 */
const TAG = `${REPO}/releases/tag/v${VERSION}`;
const DOWNLOAD = `${REPO}/releases/download/v${VERSION}`;

export const RELEASE = {
  version: VERSION,
  label: "v0.3 alpha",
  /** The day the release was published, as GitHub lists it. */
  date: "2026-10-16",
  /** crates/norte-proto/src/methods.rs, `PROTOCOL_VERSION`. */
  protocol: "0.87.0",
  /** The window packages have the version in their names; the tiles point at
   *  the release page rather than guess them. */
  latest: TAG,
  all: `${REPO}/releases`,
  tuiInstaller: `${DOWNLOAD}/norte-tui-installer.sh`,
  cliInstaller: `${DOWNLOAD}/norte-cli-installer.sh`,
  /** The tar.xz fetched by the terminal installer, in bytes. */
  tuiBytes: 15_484_584,
  /** The window's packages, as the release lists them; each carries ntc and norte too. */
  packages: [
    { ext: ".deb", url: `${DOWNLOAD}/norte_${VERSION}_amd64.deb`, bytes: 54_324_866 },
    { ext: ".rpm", url: `${DOWNLOAD}/norte-${VERSION}-1.x86_64.rpm`, bytes: 54_324_969 },
    { ext: ".AppImage", url: `${DOWNLOAD}/norte_${VERSION}_amd64.AppImage`, bytes: 126_466_552 },
  ],
  /** Windows x86_64, a first unsigned preview: the NSIS setup and the portable
   *  ZIP, each with norte-gui, norte and ntc. */
  windows: [
    { ext: "setup.exe", url: `${DOWNLOAD}/norte_${VERSION}_x64-setup.exe`, bytes: 38_166_900 },
    { ext: ".zip", url: `${DOWNLOAD}/norte-${VERSION}-x86_64-pc-windows-msvc.zip`, bytes: 56_481_620 },
  ],
} as const;

/**
 * When each page's words last changed, for the sitemap's lastmod: bump the
 * entry with the edit. A release bump changes the home page and /features.
 * A date that moves on every deploy teaches search engines to ignore it.
 */
export const UPDATED = {
  home: "2026-10-18",
  features: "2026-10-18",
  compare: "2026-10-18",
  topics: "2026-10-18",
  privacy: "2026-10-09",
} as const;

/** The terminal file manager, ready to paste into a shell. */
const CURL = "curl --proto '=https' --tlsv1.2 -LsSf";
export const TUI_INSTALL_LINE = `${CURL} ${RELEASE.tuiInstaller} | sh`;

/**
 * Where to wait for binaries: one issue per system, so its 👍 count is that
 * system's demand, and subscribing to it is the notice.
 */
export const NOTIFY = {
  macos: `${REPO}/issues/381`,
  windows: `${REPO}/issues/382`,
} as const;

/** From source, where there are no binaries yet (macOS, Windows). */
export const SOURCE_INSTALL = `cargo install --git ${REPO} --tag v${VERSION} --locked norte-tui norte-cli`;

/** "47 MB": decimal megabytes, the way download sizes are usually read. */
export function megabytes(bytes: number): string {
  return `${Math.round(bytes / 1_000_000)} MB`;
}

/** docs/adr/NNNN-*.md: the design decisions recorded so far. */
export const DECISIONS = 188;

/** crates/norte-frontend/src/keymap/catalogue.rs, the `live(…)` entries. */
export const COMMANDS = 203;

/** crates/norte-theme/presets/*.toml, in the order the gallery shows them. */
export const THEMES = [
  "catppuccin-mocha",
  "default",
  "nord",
  "gruvbox-dark",
  "vscode-dark",
  "retro-crt",
  "retro-crt-amber",
  "catppuccin-latte",
  "gruvbox-light",
  "vscode-light",
] as const;
export type Theme = (typeof THEMES)[number];

/**
 * Each theme as its swatch shows it: the name people know it by, the `bg` of
 * `background` and an accent — the `bg` of `selection`, or of `button` in the
 * two VS Code presets, whose selection barely differs from their background.
 * From crates/norte-theme/presets/<theme>.toml, copied here because the site
 * no longer builds inside a norte checkout; retake them when a preset changes.
 */
export const THEME_LOOKS: Record<Theme, { name: string; bg: string; accent: string }> = {
  "catppuccin-mocha": { name: "Catppuccin Mocha", bg: "#1e1e2e", accent: "#89b4fa" },
  default: { name: "norte", bg: "#1c1c1c", accent: "#5fafd7" },
  nord: { name: "Nord", bg: "#2e3440", accent: "#88c0d0" },
  "gruvbox-dark": { name: "Gruvbox Dark", bg: "#282828", accent: "#83a598" },
  "vscode-dark": { name: "VS Code Dark", bg: "#1f1f1f", accent: "#0078d4" },
  "retro-crt": { name: "Retro CRT", bg: "#0a0f0a", accent: "#2ee65c" },
  "retro-crt-amber": { name: "Retro CRT Amber", bg: "#100c04", accent: "#ffb000" },
  "catppuccin-latte": { name: "Catppuccin Latte", bg: "#eff1f5", accent: "#1e66f5" },
  "gruvbox-light": { name: "Gruvbox Light", bg: "#fbf1c7", accent: "#b57614" },
  "vscode-light": { name: "VS Code Light", bg: "#ffffff", accent: "#005fb8" },
};

export const LINKS = {
  docs: `${REPO}/tree/main/docs`,
  readme: `${REPO}#readme`,
  source: `${REPO}#development`,
  architecture: `${REPO}/blob/main/ARCHITECTURE.md`,
  spec: `${REPO}/blob/main/docs/spec/norte-spec.md`,
  adr: `${REPO}/tree/main/docs/adr`,
  changelog: `${REPO}/blob/main/CHANGELOG.md`,
  contributing: `${REPO}/blob/main/CONTRIBUTING.md`,
  security: `${REPO}/blob/main/SECURITY.md`,
  issues: `${REPO}/issues`,
  discussions: `${REPO}/discussions`,
  plugins: `${REPO}/blob/main/docs/plugins.md`,
  theming: `${REPO}/blob/main/docs/theming.md`,
  licensing: `${REPO}#license`,
} as const;
