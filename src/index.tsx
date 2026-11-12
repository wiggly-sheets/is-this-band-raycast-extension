import { Action, ActionPanel, Color, Icon, Keyboard, List } from "@raycast/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { BandResult, BandStatus, RelatedVerdict, bandUrl, fetchBandResult } from "./lib/isthisbandemo";

const STATUS_STYLES: Record<BandStatus, { icon: string; label: string; color: Color }> = {
  emo: { icon: "🖤", label: "EMO", color: Color.Magenta },
  "not-emo": { icon: "🤷", label: "NOT EMO", color: Color.SecondaryText },
  unknown: { icon: "❓", label: "UNKNOWN", color: Color.Orange },
  unrecognized: { icon: "❔", label: "UNSURE", color: Color.Orange },
};

export default function Command() {
  const [query, setQuery] = useState("");
  const { result, error, isLoading, reload } = useBandResult(query);

  return (
    <List
      filtering={false}
      isLoading={isLoading}
      searchBarPlaceholder="Type a band name…"
      onSearchTextChange={setQuery}
    >
      {result ? (
        <>
          <BandListItem result={result} onReload={reload} />
          {result.related && <RelatedListItem related={result.related} />}
        </>
      ) : (
        <List.EmptyView
          icon={error ? Icon.Warning : Icon.MagnifyingGlass}
          title={error ? "Couldn't reach Is This Band Emo?" : isLoading ? "Consulting the emo council…" : "Which band?"}
          description={
            error ??
            (isLoading
              ? `Looking up ${query.trim()}…`
              : "Type a band name to find out whether they're emo. Try Sunny Day Real Estate.")
          }
          actions={
            error ? (
              <ActionPanel>
                <Action title="Try Again" icon={Icon.ArrowClockwise} onAction={reload} />
                <Action.OpenInBrowser title="Open Is This Band Emo?" url={bandUrl(query)} />
              </ActionPanel>
            ) : undefined
          }
        />
      )}
    </List>
  );
}

function BandListItem({ result, onReload }: { result: BandResult; onReload: () => void }) {
  const style = STATUS_STYLES[result.status];

  return (
    <List.Item
      icon={{ source: style.icon }}
      title={result.verdict}
      subtitle={result.commentary}
      accessories={[{ tag: { value: style.label, color: style.color } }]}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard title="Copy Verdict" content={result.verdict} />
          <Action.OpenInBrowser title="Open on Is This Band Emo?" url={result.url} />
          <Action.CopyToClipboard title="Copy Link" content={result.url} shortcut={Keyboard.Shortcut.Common.Copy} />
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={onReload}
            shortcut={Keyboard.Shortcut.Common.Refresh}
          />
        </ActionPanel>
      }
    />
  );
}

function RelatedListItem({ related }: { related: RelatedVerdict }) {
  return (
    <List.Item
      icon={Icon.Link}
      title={related.line}
      subtitle="Related genre"
      accessories={[{ tag: related.genre.toUpperCase() }]}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title={`Open ${capitalize(related.genre)} Page`} url={related.url} />
          <Action.CopyToClipboard title="Copy Line" content={related.line} />
        </ActionPanel>
      }
    />
  );
}

function useBandResult(band: string) {
  const [result, setResult] = useState<BandResult>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = band.trim();

    if (!trimmed) {
      abortRef.current?.abort();
      setResult(undefined);
      setError(undefined);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(undefined);
    setResult(undefined);

    const timer = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current?.abort();
      abortRef.current = controller;

      try {
        const nextResult = await fetchBandResult(trimmed, controller.signal);
        if (!cancelled) {
          setResult(nextResult);
          setIsLoading(false);
        }
      } catch (caught) {
        if (cancelled || controller.signal.aborted) {
          return;
        }

        setResult(undefined);
        setError(caught instanceof Error ? caught.message : "Something went wrong.");
        setIsLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [band, reloadToken]);

  const reload = useCallback(() => {
    setResult(undefined);
    setReloadToken((token) => token + 1);
  }, []);

  return { result, error, isLoading, reload };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
