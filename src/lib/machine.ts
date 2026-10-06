import { DEFAULT_LOCALE, type Locale, machinePathOf, pathOf } from "../i18n/locales.ts";
import { formatDate, LANGUAGE_IN, STATUS_KEY, t } from "../i18n/ui.ts";
import { SITE } from "../site.ts";
import { allPages, legalShelf, placeOf } from "./content.ts";
import { type RouteProps, routes } from "./routes.ts";

// Every page of the site has a machine version: the same text as Markdown,
// with no layout, at the page's path with ".md" for its last slash
// (machinePathOf). The header's "Machine" leads there, and /llms.txt
// (llmstxt.org) lists them all for agents. They are made from the same
// content as the pages, so nothing is written twice (docs/decisions.md, 11).

const ORIGIN = new URL(import.meta.env.SITE ?? "https://kuutti.app");
const full = (path: string) => new URL(path, ORIGIN).href;

/** The page's own path, as the human reads it. */
const pagePath = (props: RouteProps) => pathOf(props.locale, props.slug);

/**
 * Links inside a text, made whole for a reader outside the site: a link to a
 * page of the site leads to its machine version, any other to the address.
 */
function linksOut(markdown: string, machineOf: Map<string, string>): string {
  return markdown.replace(/\]\((\/[^)\s]*)\)/g, (_, href: string) => {
    const [target = "", anchor] = href.split("#");
    const machine = machineOf.get(target);
    return `](${machine ? full(machine) : full(anchor ? `${target}#${anchor}` : target)})`;
  });
}

function head(locale: Locale, title: string, description: string, human: string): string {
  return [
    `# ${title}`,
    `> ${description}`,
    [
      `- ${t(locale, "machine.human", { url: full(human) })}`,
      `- ${t(locale, "machine.index", { url: full("/llms.txt") })}`,
    ].join("\n"),
  ].join("\n\n");
}

function foot(locale: Locale): string {
  const channels = SITE.social.map((channel) => `- [${channel.name}](${channel.href})`).join("\n");
  return [
    "---",
    t(locale, "footer.line", { businessId: SITE.businessId }),
    `${t(locale, "footer.channels")}:\n\n${channels}`,
  ].join("\n\n");
}

/** The index of a language's pages for machines: /llms.txt, and the home page's machine version. */
async function index(locale: Locale, machineOf: Map<string, string>): Promise<string> {
  const pages = (await allPages())
    .filter((page) => placeOf(page.id).locale === locale)
    .sort(
      (a, b) =>
        (a.data.nav ?? Number.MAX_SAFE_INTEGER) - (b.data.nav ?? Number.MAX_SAFE_INTEGER) ||
        a.data.title.localeCompare(b.data.title),
    );
  const pageLines = pages.map((page) => {
    const path = machinePathOf(locale, placeOf(page.id).slug);
    return `- [${page.data.title}](${full(path)}): ${page.data.description}`;
  });
  const texts = (await legalShelf(locale)).flatMap((text) =>
    text.versions.map((version) => {
      const machine = machineOf.get(version.href) ?? version.href;
      const status = t(locale, STATUS_KEY[text.status]);
      return `- [${text.title}](${full(machine)}): ${text.description} (${LANGUAGE_IN[locale][version.language]}; ${status})`;
    }),
  );
  return [
    `# ${t(locale, "site.name")}`,
    `> ${t(locale, "machine.summary")}`,
    `- ${t(locale, "machine.human", { url: full(pathOf(locale, "")) })}`,
    `## ${t(locale, "machine.pages")}`,
    pageLines.join("\n"),
    `## ${t(locale, "legal.title")}`,
    `${t(locale, "legal.intro")}\n\n${texts.join("\n")}`,
    foot(locale),
  ].join("\n\n");
}

async function machineText(props: RouteProps, machineOf: Map<string, string>): Promise<string> {
  const { locale, view } = props;
  const human = pagePath(props);
  if (view.kind === "home") return index(locale, machineOf);
  if (view.kind === "page") {
    const { title, description } = view.page.data;
    return [
      head(locale, title, description, human),
      linksOut(view.page.body ?? "", machineOf).trim(),
      foot(locale),
    ].join("\n\n");
  }
  if (view.kind === "shelf") {
    const texts = (await legalShelf(locale)).map((text) =>
      [
        `## ${text.title} (${t(locale, STATUS_KEY[text.status])})`,
        text.description,
        text.versions
          .map(
            (version) =>
              `- [${LANGUAGE_IN[locale][version.language]}](${full(machineOf.get(version.href) ?? version.href)})`,
          )
          .join("\n"),
      ].join("\n\n"),
    );
    return [
      head(locale, t(locale, "legal.title"), t(locale, "legal.description"), human),
      t(locale, "legal.intro"),
      ...texts,
      foot(locale),
    ].join("\n\n");
  }
  const { data } = view.text;
  const meta = [
    t(locale, "doc.dated", { date: formatDate(locale, data.dated) }),
    data.version && t(locale, "doc.version", { version: data.version }),
    data.registered && t(locale, "doc.registered", { date: formatDate(locale, data.registered) }),
    data.businessId && t(locale, "doc.businessId", { businessId: SITE.businessId }),
    t(locale, STATUS_KEY[data.status]),
  ].filter(Boolean);
  const notices = [
    data.status === "draft" &&
      `**${t(locale, "notice.draft.title")}.** ${t(locale, "notice.draft.body")}`,
    data.status === "filed" &&
      `**${t(locale, "notice.filed.title")}.** ${t(locale, "notice.filed.body")}`,
    view.binding &&
      `**${t(locale, "notice.notBinding.title")}:** ${full(machineOf.get(view.binding) ?? view.binding)}. ${t(locale, "notice.notBinding.body")}`,
  ].filter((notice): notice is string => typeof notice === "string");
  return [
    head(locale, data.title, data.description, human),
    meta.join(" · "),
    ...notices,
    linksOut(view.text.body ?? "", machineOf).trim(),
    foot(locale),
  ].join("\n\n");
}

/** Every machine version: its path, and its text. */
export async function machinePages(): Promise<{ path: string; text: string }[]> {
  const found = await routes();
  const machineOf = new Map(
    found.map((route) => [
      pagePath(route.props),
      machinePathOf(route.props.locale, route.props.slug),
    ]),
  );
  return Promise.all(
    found.map(async (route) => ({
      path: machinePathOf(route.props.locale, route.props.slug),
      text: `${await machineText(route.props, machineOf)}\n`,
    })),
  );
}

/** /llms.txt: the index of the default language's pages. */
export async function llmsText(): Promise<string> {
  const found = await routes();
  const machineOf = new Map(
    found.map((route) => [
      pagePath(route.props),
      machinePathOf(route.props.locale, route.props.slug),
    ]),
  );
  return `${await index(DEFAULT_LOCALE, machineOf)}\n`;
}

/**
 * The pages search engines are told about: every page but a draft (which they
 * are told to leave alone). A legal text says when its wording last changed
 * (`dated`); a page has no such date, and a guessed one is worse than none.
 */
export async function sitemapEntries(): Promise<{ loc: string; lastmod?: string }[]> {
  return (await routes()).flatMap((route) => {
    const { view } = route.props;
    if (view.kind === "text" && view.text.data.status === "draft") return [];
    const loc = full(pagePath(route.props));
    return view.kind === "text"
      ? [{ loc, lastmod: view.text.data.dated.toISOString().slice(0, 10) }]
      : [{ loc }];
  });
}
