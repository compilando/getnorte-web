import type { Lang } from "./i18n";

/**
 * Pages for what people search for, one per topic and language. Each one is
 * the landing's own material (real captures, the install box) aimed at one
 * question, with its own title and description. Every claim here is one the
 * landing already makes or one the captures show.
 */

export const TOPICS = ["tui-undo", "sftp-s3", "ai-agents", "commander"] as const;
export type Topic = (typeof TOPICS)[number];

export const SLUGS: Record<Topic, Record<Lang, string>> = {
  "tui-undo": { en: "terminal-file-manager-with-undo", es: "gestor-de-ficheros-de-terminal-con-deshacer" },
  "sftp-s3": { en: "sftp-s3-file-manager", es: "gestor-de-ficheros-sftp-s3" },
  "ai-agents": { en: "file-manager-for-ai-agents-mcp", es: "gestor-de-ficheros-para-agentes-ia-mcp" },
  commander: { en: "total-commander-alternative-for-linux", es: "alternativa-a-total-commander-para-linux" },
};

export function topicPath(topic: Topic, lang: Lang): string {
  return lang === "en" ? `/${SLUGS[topic].en}` : `/es/${SLUGS[topic].es}`;
}

export function topicFromSlug(slug: string, lang: Lang): Topic | undefined {
  return TOPICS.find((t) => SLUGS[t][lang] === slug);
}

/** A section: a heading, what it says, and the capture that shows it. */
type Section = { h2: string; body: string; shot: string; frame: string };
export type TopicCopy = {
  label: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lede: string;
  sections: Section[];
  /** Blocks after the sections: the comparison, the agent setup lines. */
  extras?: ("compare" | "agentSetup")[];
  faq: [string, string][];
};

export const TOPIC_COPY: Record<Topic, Record<Lang, TopicCopy>> = {
  "tui-undo": {
    en: {
      label: "Terminal file manager with undo",
      title: "A terminal file manager with undo — norte",
      description:
        "norte is a two-pane terminal file manager where every copy, move, rename and delete is journaled and can be undone. Open source, in Rust, with a native window too.",
      eyebrow: "Terminal file manager",
      h1: "A terminal file manager that can undo.",
      lede: "Two panes, the keys you already know, and a journal of everything that changed: yours, a script's or an agent's. Every entry is a way back.",
      sections: [
        {
          h2: "Two panes, and your keys come with you",
          body: "ntc runs in any terminal with its core embedded: nothing to start first. Pick the keymap you already know — orthodox, vim, cua, krusader, far, norton or total-commander — and every command is in the palette, the F9 menus and the help, with the key your preset gives it.",
          shot: "tui:panes",
          frame: "ada@norte — ntc",
        },
        {
          h2: "Everything that changed, and a way back",
          body: "Each operation lands in a journal you can browse in the timeline and undo from there. A whole session — say, everything an agent did — goes back with one command: norte undo.",
          shot: "tui:timeline",
          frame: "ada@norte — ntc · timeline",
        },
        {
          h2: "Copies are tasks; you keep working",
          body: "A copy runs in the background, can be paused and carries on where it stopped. Deletes go to the trash. Ctrl-C never leaves half a file behind.",
          shot: "tui:jobs-paused",
          frame: "ada@norte — ntc · jobs",
        },
      ],
      faq: [
        ["Is norte free?", "Yes. It is open source: the core and frontends are AGPL-3.0, and the protocol and providers are MIT or Apache-2.0. There is no account and no telemetry."],
        ["Which systems does it run on?", "The alpha ships Linux x86_64 binaries. On macOS and Windows it builds from source with Rust 1.94 or newer."],
        ["Can I undo what an AI agent did?", "Yes. Agent operations are journaled under the agent's session, and norte undo <session> reverts that session, newest first. It never overwrites, and skips what was replaced since or cannot be safely reversed."],
      ],
    },
    es: {
      label: "Gestor de ficheros de terminal con deshacer",
      title: "Un gestor de ficheros de terminal con deshacer — norte",
      description:
        "norte es un gestor de ficheros de terminal de dos paneles en el que cada copia, movimiento, renombrado y borrado queda en un diario y se puede deshacer. Libre, en Rust, y también con ventana nativa.",
      eyebrow: "Gestor de ficheros de terminal",
      h1: "Un gestor de ficheros de terminal que sabe deshacer.",
      lede: "Dos paneles, las teclas que ya conoces y un diario de todo lo que cambió: lo tuyo, lo de un script o lo de un agente. Cada entrada es un camino de vuelta.",
      sections: [
        {
          h2: "Dos paneles, y tus teclas vienen contigo",
          body: "ntc funciona en cualquier terminal con el núcleo dentro: nada que arrancar antes. Elige el teclado que ya conoces —orthodox, vim, cua, krusader, far, norton o total-commander— y cada orden está en la paleta, en los menús de F9 y en la ayuda, con la tecla que le da tu preset.",
          shot: "tui:panes",
          frame: "ada@norte — ntc",
        },
        {
          h2: "Todo lo que cambió, y un camino de vuelta",
          body: "Cada operación cae en un diario que recorres en la línea de tiempo y deshaces desde ahí. Una sesión entera —por ejemplo, todo lo que hizo un agente— vuelve atrás con un comando: norte undo.",
          shot: "tui:timeline",
          frame: "ada@norte — ntc · línea de tiempo",
        },
        {
          h2: "Las copias son tareas; tú sigues trabajando",
          body: "Una copia corre en segundo plano, se puede pausar y sigue donde se quedó. Los borrados van a la papelera. Ctrl-C nunca deja medio fichero atrás.",
          shot: "tui:jobs-paused",
          frame: "ada@norte — ntc · procesos",
        },
      ],
      faq: [
        ["¿norte es gratis?", "Sí. Es software libre: el núcleo y los frontends son AGPL-3.0, y el protocolo y los proveedores, MIT o Apache-2.0. Sin cuenta y sin telemetría."],
        ["¿En qué sistemas funciona?", "La alfa trae binarios para Linux x86_64. En macOS y Windows se compila desde el código con Rust 1.94 o posterior."],
        ["¿Puedo deshacer lo que hizo un agente de IA?", "Sí. Las operaciones de un agente quedan en el diario bajo su sesión, y norte undo <sesión> revierte esa sesión, de lo más nuevo a lo más viejo. Nunca sobrescribe, y se salta lo que se ha sustituido después o no puede revertir con seguridad."],
      ],
    },
  },
  "sftp-s3": {
    en: {
      label: "SFTP & S3 file manager",
      title: "An SFTP and S3 file manager for the terminal — norte",
      description:
        "Browse SFTP servers, S3 buckets and ZIP/TAR/RAR archives as plain folders, in two panes, from the terminal or a native window. Compare and sync them, with undo. Open source.",
      eyebrow: "SFTP · S3 · archives",
      h1: "SFTP, S3 and archives. Just another pane.",
      lede: "A Raspberry Pi over SFTP, a bucket on S3, a zip in Downloads: norte opens them all through one virtual filesystem, with the same keys, the same copy dialog and the same journal.",
      sections: [
        {
          h2: "SFTP that asks before it trusts",
          body: "The first connection to a host shows its key's fingerprint and waits for you. Keys, not passwords in a config file: connections.toml holds references, and secrets stay in your keyring.",
          shot: "tui:sftp-trust",
          frame: "ada@norte — SFTP",
        },
        {
          h2: "A server is a pane like any other",
          body: "Browse it, view files, copy from it and to it. Big transfers are tasks you can pause and resume.",
          shot: "tui:sftp",
          frame: "ada@norte — SFTP",
        },
        {
          h2: "S3 buckets as folders",
          body: "Prefixes are folders, objects are files. AWS, MinIO or anything that speaks S3. With the daemon, the connection and the running copies are shared by every client.",
          shot: "tui:s3",
          frame: "ada@norte — S3",
        },
        {
          h2: "Archives open like directories",
          body: "ZIP, TAR (gz, zst…) and RAR, browsed in place: no extracting first.",
          shot: "tui:archive",
          frame: "ada@norte — archives",
        },
        {
          h2: "Compare two trees, then sync them",
          body: "Same, different, only here, only there — then a sync plan you approve in one go, with every change it makes in the journal.",
          shot: "tui:compare",
          frame: "ada@norte — compare",
        },
      ],
      faq: [
        ["Which remote protocols does norte support?", "SFTP, FTP (with TLS) and S3-compatible object storage, plus ZIP, TAR and RAR archives, all through the same virtual filesystem."],
        ["Where are passwords and keys stored?", "Not in the config file: connections.toml only holds references, and the secret comes from your keyring or environment."],
        ["Can I sync a local folder to a server?", "Yes. Compare the two trees, review the plan, approve it; the sync is journaled, and undo reverses what it safely can. On SFTP and S3, deleted files come back only if the connection keeps a trash."],
      ],
    },
    es: {
      label: "Gestor de ficheros SFTP y S3",
      title: "Un gestor de ficheros SFTP y S3 para la terminal — norte",
      description:
        "Recorre servidores SFTP, buckets S3 y archivos ZIP/TAR/RAR como carpetas normales, en dos paneles, desde la terminal o una ventana nativa. Compáralos y sincronízalos, con deshacer. Libre.",
      eyebrow: "SFTP · S3 · comprimidos",
      h1: "SFTP, S3 y comprimidos. Un panel más.",
      lede: "Una Raspberry Pi por SFTP, un bucket en S3, un zip en Descargas: norte los abre todos con un único sistema de ficheros virtual, con las mismas teclas, el mismo diálogo de copia y el mismo diario.",
      sections: [
        {
          h2: "SFTP que pregunta antes de fiarse",
          body: "La primera conexión a un servidor enseña la huella de su clave y espera a que decidas. Claves, no contraseñas en un fichero: connections.toml guarda referencias, y los secretos se quedan en tu llavero.",
          shot: "tui:sftp-trust",
          frame: "ada@norte — SFTP",
        },
        {
          h2: "Un servidor es un panel como otro cualquiera",
          body: "Recórrelo, mira ficheros, copia desde él y hacia él. Las transferencias grandes son tareas que se pausan y se reanudan.",
          shot: "tui:sftp",
          frame: "ada@norte — SFTP",
        },
        {
          h2: "Buckets S3 como carpetas",
          body: "Los prefijos son carpetas y los objetos, ficheros. AWS, MinIO o cualquier cosa que hable S3. Con el daemon, la conexión y las copias en marcha las comparten todos los clientes.",
          shot: "tui:s3",
          frame: "ada@norte — S3",
        },
        {
          h2: "Los comprimidos se abren como directorios",
          body: "ZIP, TAR (gz, zst…) y RAR, recorridos en su sitio: sin descomprimir antes.",
          shot: "tui:archive",
          frame: "ada@norte — comprimidos",
        },
        {
          h2: "Compara dos árboles y luego sincronízalos",
          body: "Igual, distinto, solo aquí, solo allí; después, un plan de sincronización que apruebas de una vez, con cada cambio que hace en el diario.",
          shot: "tui:compare",
          frame: "ada@norte — comparar",
        },
      ],
      faq: [
        ["¿Qué protocolos remotos admite norte?", "SFTP, FTP (con TLS) y almacenamiento de objetos compatible con S3, además de archivos ZIP, TAR y RAR, todo por el mismo sistema de ficheros virtual."],
        ["¿Dónde se guardan contraseñas y claves?", "No en el fichero de configuración: connections.toml solo guarda referencias, y el secreto sale de tu llavero o del entorno."],
        ["¿Puedo sincronizar una carpeta local con un servidor?", "Sí. Compara los dos árboles, revisa el plan y apruébalo; la sincronización queda en el diario, y deshacer revierte lo que puede con seguridad. En SFTP y S3, lo borrado solo vuelve si la conexión tiene papelera."],
      ],
    },
  },
  "ai-agents": {
    en: {
      label: "File manager for AI agents (MCP)",
      title: "A file manager for AI agents, over MCP, under your rules — norte",
      description:
        "Give Claude Code, Codex or any MCP client access to your files through norte: scoped grants, a policy that can ask before every change, a journal of what the agent did, and undo for its whole session.",
      eyebrow: "AI agents · MCP",
      h1: "Let AI agents touch your files. Under your rules.",
      lede: "norte mcp serve gives an agent a file interface with a gatekeeper: nothing out of scope, every change held for your approval if your policy says so, everything journaled, and one command to take its session back.",
      sections: [
        {
          h2: "It has to ask for a scope",
          body: "Outside a granted scope an agent gets nothing, not even a listing. It asks for a folder, the operations it wants and for how long; you grant it with norte policy grant.",
          shot: "tui:agent-scope",
          frame: "photo-helper — an MCP client",
        },
        {
          h2: "Every change can wait for your yes",
          body: "With action = \"ask\" in your policy, each operation stops in ntc on the daemon, or in the window, until you press y; unanswered, it is denied after a minute. Rules match by operation, path, scheme and actor; the first match wins, and with no policy an agent is denied.",
          shot: "tui:agent-ask",
          frame: "ada@norte — ntc",
        },
        {
          h2: "Undo the agent's whole session",
          body: "Everything the agent did is in the journal under its session. norte undo <session> reverts it, newest first, even after the agent has gone.",
          shot: "tui:agent-undo",
          frame: "ada@norte — bash",
        },
      ],
      extras: ["agentSetup"],
      faq: [
        ["Which AI agents work with norte?", "Any MCP client: Claude Code, Codex and others. norte mcp serve speaks MCP over stdio and exposes tools to list, read, copy, move, delete, compare and plan syncs."],
        ["Can an agent delete my files?", "Only inside a scope you granted, and only if your policy allows it; you can deny deletes for agents outright, or make every operation ask first. Local deletes go to the trash by default."],
        ["Is this a real AI in the screenshots?", "No: photo-helper is an MCP client scripted for the captures. Everything else on screen — the daemon, the policy, the approval, the journal and the undo — is norte."],
      ],
    },
    es: {
      label: "Gestor de ficheros para agentes de IA (MCP)",
      title: "Un gestor de ficheros para agentes de IA, por MCP y con tus reglas — norte",
      description:
        "Da a Claude Code, Codex o cualquier cliente MCP acceso a tus ficheros a través de norte: permisos acotados, una política que puede preguntar antes de cada cambio, un diario de lo que hizo el agente y deshacer para su sesión entera.",
      eyebrow: "Agentes de IA · MCP",
      h1: "Deja que los agentes de IA toquen tus ficheros. Con tus reglas.",
      lede: "norte mcp serve da a un agente una interfaz de ficheros con portero: nada fuera de su ámbito, cada cambio retenido hasta tu aprobación si tu política lo dice, todo en el diario, y un comando para deshacer su sesión.",
      sections: [
        {
          h2: "Tiene que pedir un ámbito",
          body: "Fuera de un ámbito concedido un agente no obtiene nada, ni siquiera un listado. Pide una carpeta, las operaciones que quiere y por cuánto tiempo; tú lo concedes con norte policy grant.",
          shot: "tui:agent-scope",
          frame: "photo-helper — un cliente MCP",
        },
        {
          h2: "Cada cambio puede esperar tu sí",
          body: "Con action = \"ask\" en tu política, cada operación se detiene en ntc sobre el daemon, o en la ventana, hasta que pulses y; si nadie contesta, se deniega al minuto. Las reglas casan por operación, ruta, esquema y actor; gana la primera, y sin política un agente queda denegado.",
          shot: "tui:agent-ask",
          frame: "ada@norte — ntc",
        },
        {
          h2: "Deshaz la sesión entera del agente",
          body: "Todo lo que hizo el agente está en el diario bajo su sesión. norte undo <sesión> lo revierte, de lo más nuevo a lo más viejo, aunque el agente ya se haya ido.",
          shot: "tui:agent-undo",
          frame: "ada@norte — bash",
        },
      ],
      extras: ["agentSetup"],
      faq: [
        ["¿Qué agentes de IA funcionan con norte?", "Cualquier cliente MCP: Claude Code, Codex y otros. norte mcp serve habla MCP por stdio y ofrece herramientas para listar, leer, copiar, mover, borrar, comparar y planificar sincronizaciones."],
        ["¿Puede un agente borrar mis ficheros?", "Solo dentro de un ámbito que hayas concedido, y solo si tu política lo permite; puedes denegar los borrados a los agentes o hacer que cada operación pregunte antes. Por defecto, los borrados locales van a la papelera."],
        ["¿Es una IA de verdad la de las capturas?", "No: photo-helper es un cliente MCP con guion para las capturas. Todo lo demás en pantalla —el daemon, la política, la aprobación, el diario y el deshacer— es norte."],
      ],
    },
  },
  commander: {
    en: {
      label: "Total Commander alternative for Linux",
      title: "A Total Commander and Midnight Commander alternative for Linux — norte",
      description:
        "An orthodox two-pane file manager for Linux, in the terminal and in a native window, with Total Commander, Far, Norton and Krusader keymaps, SFTP and S3, undo, and AI agents under a policy.",
      eyebrow: "Orthodox file manager",
      h1: "The Total Commander you missed on Linux. In your terminal, too.",
      lede: "Two panes, F-keys, a menu bar — and presets that bring your fingers with you. norte adds what the classics never had: undo, a daemon that every screen shares, and agents that ask before they touch anything.",
      sections: [
        {
          h2: "Your keys come with you",
          body: "Seven keymap presets, transcribed from the managers they are named after: total-commander, far, norton, krusader, orthodox, vim and cua. Every command lives in the palette with the key your preset gives it.",
          shot: "tui:palette",
          frame: "ada@norte — ntc",
        },
        {
          h2: "The same program, in a window",
          body: "norte-gui is a native window over the same core, with the same keys and themes. It ships as .deb, .rpm and AppImage for Linux.",
          shot: "gui:panes-vscode-dark",
          frame: "norte-gui",
        },
      ],
      extras: ["compare"],
      faq: [
        ["Does norte work like Total Commander?", "It follows the same orthodox model — two panes, F5 to copy, F6 to move — and has a total-commander keymap preset, along with far, norton, krusader, orthodox, vim and cua."],
        ["Is there a Windows version?", "Not as binaries yet; it builds from source there, and the daemon is Unix-only for now. You can follow and upvote the Windows issue on GitHub."],
        ["Is norte stable?", "It is an alpha: interfaces and configuration may still change. Midnight Commander has decades of use; norte says what it is."],
      ],
    },
    es: {
      label: "Alternativa a Total Commander para Linux",
      title: "Una alternativa a Total Commander y Midnight Commander para Linux — norte",
      description:
        "Un gestor de ficheros ortodoxo de dos paneles para Linux, en la terminal y en una ventana nativa, con esquemas de teclas de Total Commander, Far, Norton y Krusader, SFTP y S3, deshacer, y agentes de IA bajo una política.",
      eyebrow: "Gestor de ficheros ortodoxo",
      h1: "El Total Commander que echabas de menos en Linux. También en tu terminal.",
      lede: "Dos paneles, teclas F, barra de menús, y presets que traen tus dedos contigo. norte añade lo que los clásicos nunca tuvieron: deshacer, un daemon que comparten todas las pantallas y agentes que preguntan antes de tocar nada.",
      sections: [
        {
          h2: "Tus teclas vienen contigo",
          body: "Siete presets de teclado, transcritos de los gestores cuyo nombre llevan: total-commander, far, norton, krusader, orthodox, vim y cua. Cada orden vive en la paleta con la tecla que le da tu preset.",
          shot: "tui:palette",
          frame: "ada@norte — ntc",
        },
        {
          h2: "El mismo programa, en una ventana",
          body: "norte-gui es una ventana nativa sobre el mismo núcleo, con las mismas teclas y temas. Se distribuye como .deb, .rpm y AppImage para Linux.",
          shot: "gui:panes-vscode-dark",
          frame: "norte-gui",
        },
      ],
      extras: ["compare"],
      faq: [
        ["¿norte funciona como Total Commander?", "Sigue el mismo modelo ortodoxo —dos paneles, F5 para copiar, F6 para mover— y tiene un preset de teclado total-commander, junto a far, norton, krusader, orthodox, vim y cua."],
        ["¿Hay versión para Windows?", "Todavía no en binarios; allí se compila desde el código, y el daemon es solo Unix por ahora. Puedes seguir y votar el issue de Windows en GitHub."],
        ["¿norte es estable?", "Es una alfa: interfaces y configuración aún pueden cambiar. Midnight Commander tiene décadas de uso; norte dice lo que es."],
      ],
    },
  },
};
