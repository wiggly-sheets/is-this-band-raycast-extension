export type BandStatus = "emo" | "not-emo" | "unknown" | "unrecognized";

export interface RelatedVerdict {
  /** The full sentence, e.g. "Blink-182 is punk." */
  line: string;
  /** The linked genre, e.g. "punk". */
  genre: string;
  url: string;
}

export interface BandResult {
  band: string;
  status: BandStatus;
  /** The verdict from the site, e.g. "Sunny Day Real Estate is an emo band." */
  verdict: string;
  /** Optional extra commentary, e.g. "Sorry, to anyone over 30 they're pop-punk." */
  commentary?: string;
  /** A cross-reference to one of the site's sibling genre sites. */
  related?: RelatedVerdict;
  url: string;
}

const BASE_URL = "https://isthisbandemo.com/";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const VERDICT_PATTERN = /<div class="results col-xs-12">\s*<h2>([\s\S]*?)<\/h2>/i;
const COMMENTARY_PATTERN = /<div class="col-xs-8 center">\s*<h4>([\s\S]*?)<\/h4>/i;
const RELATED_PATTERN = /<div class="col-xs-12 comment">[\s\S]*?<h5>([\s\S]*?)<\/h5>/i;
const LINK_PATTERN = /<a\b[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/i;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

export function bandUrl(band: string): string {
  return `${BASE_URL}?band=${encodeURIComponent(band.trim())}`;
}

export async function fetchBandResult(band: string, signal?: AbortSignal): Promise<BandResult> {
  const url = bandUrl(band);
  let response: Response;

  try {
    response = await fetch(url, {
      signal,
      headers: {
        Accept: "text/html",
        "User-Agent": USER_AGENT,
      },
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    throw new Error("Couldn't reach isthisbandemo.com. Check your connection and try again.");
  }

  if (!response.ok) {
    throw new Error(`Is This Band Emo? responded with HTTP ${response.status}.`);
  }

  return parseBandPage(await response.text(), band);
}

export function parseBandPage(html: string, band: string): BandResult {
  const verdict = toText(html.match(VERDICT_PATTERN)?.[1] ?? "");

  if (!verdict) {
    throw new Error("Couldn't find a verdict on the page.");
  }

  const commentary = toText(html.match(COMMENTARY_PATTERN)?.[1] ?? "");
  const related = parseRelated(html);

  return {
    band,
    status: getStatus(verdict),
    verdict,
    commentary: commentary || undefined,
    related,
    url: bandUrl(band),
  };
}

function getStatus(verdict: string): BandStatus {
  if (/\bis not in our system\b/i.test(verdict)) {
    return "unknown";
  }

  if (/\bis not an emo band\b/i.test(verdict)) {
    return "not-emo";
  }

  if (/\bis an emo band\b/i.test(verdict)) {
    return "emo";
  }

  return "unrecognized";
}

function parseRelated(html: string): RelatedVerdict | undefined {
  const relatedHtml = html.match(RELATED_PATTERN)?.[1] ?? "";
  const line = toText(relatedHtml);
  const link = relatedHtml.match(LINK_PATTERN);

  if (!line || !link) {
    return undefined;
  }

  return {
    line,
    genre: toText(link[2]),
    url: link[1],
  };
}

function toText(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === "#") {
      const isHex = code[1]?.toLowerCase() === "x";
      const value = Number.parseInt(isHex ? code.slice(2) : code.slice(1), isHex ? 16 : 10);
      return Number.isNaN(value) ? entity : String.fromCodePoint(value);
    }

    return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
  });
}
