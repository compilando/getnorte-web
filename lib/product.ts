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
const VERSION = "0.3.0-alpha.8";
/**
 * Every link names the tag. GitHub's `releases/latest` skips pre-releases, and
 * every alpha is one: there `latest/download/…` is a 404.
 */
const TAG = `${REPO}/releases/tag/v${VERSION}`;
const DOWNLOAD = `${REPO}/releases/download/v${VERSION}`;

export const RELEASE = {
  version: VERSION,
  label: "v0.3 alpha",
  /** crates/norte-proto/src/methods.rs, `PROTOCOL_VERSION`. */
  protocol: "0.85.0",
  /** The window packages have the version in their names; the tiles point at
   *  the release page rather than guess them. */
  latest: TAG,
  all: `${REPO}/releases`,
  tuiInstaller: `${DOWNLOAD}/norte-tui-installer.sh`,
  cliInstaller: `${DOWNLOAD}/norte-cli-installer.sh`,
  /** The two tar.xz the installers fetch (norte-tui-…, norte-cli-…), in bytes. */
  binariesBytes: 14_349_652 + 13_273_580,
  /** The window's packages, as the release lists them; each carries ntc and norte too. */
  packages: [
    { ext: ".deb", url: `${DOWNLOAD}/norte_${VERSION}_amd64.deb`, bytes: 49_181_920 },
    { ext: ".rpm", url: `${DOWNLOAD}/norte-${VERSION}-1.x86_64.rpm`, bytes: 49_181_868 },
    { ext: ".AppImage", url: `${DOWNLOAD}/norte_${VERSION}_amd64.AppImage`, bytes: 121_911_800 },
  ],
  /** Windows x86_64, a first unsigned preview: the NSIS setup and the portable
   *  ZIP, each with norte-gui, norte and ntc. */
  windows: [
    { ext: "setup.exe", url: `${DOWNLOAD}/norte_${VERSION}_x64-setup.exe`, bytes: 34_033_482 },
    { ext: ".zip", url: `${DOWNLOAD}/norte-${VERSION}-x86_64-pc-windows-msvc.zip`, bytes: 48_821_038 },
  ],
} as const;

/** Both installers in one line: the file manager, then the CLI and daemon. */
const CURL = "curl --proto '=https' --tlsv1.2 -LsSf";
export const INSTALL_LINE = `${CURL} ${RELEASE.tuiInstaller} | sh && ${CURL} ${RELEASE.cliInstaller} | sh`;

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
export const DECISIONS = 159;

/** crates/norte-frontend/src/keymap/catalogue.rs, the `live(…)` entries. */
export const COMMANDS = 190;

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
 * Each theme's accent: the `bg` of `selection` in its preset,
 * crates/norte-theme/presets/<theme>.toml. Copied here because the site no
 * longer builds inside a norte checkout; retake them when a preset changes.
 */
export const THEME_ACCENTS: Record<Theme, string> = {
  "catppuccin-mocha": "#89b4fa",
  default: "#5fafd7",
  nord: "#88c0d0",
  "gruvbox-dark": "#83a598",
  "vscode-dark": "#04395e",
  "retro-crt": "#2ee65c",
  "retro-crt-amber": "#ffb000",
  "catppuccin-latte": "#1e66f5",
  "gruvbox-light": "#b57614",
  "vscode-light": "#e8e8e8",
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
  plugins: `${REPO}/blob/main/docs/plugins.md`,
  theming: `${REPO}/blob/main/docs/theming.md`,
  licensing: `${REPO}#license`,
} as const;
