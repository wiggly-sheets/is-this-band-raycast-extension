import assert from "node:assert/strict";
import { test } from "node:test";
import { parseBandPage, siteUrl } from "../src/lib/bandsite.ts";
import { getGenre } from "../src/lib/genres.ts";

const emo = getGenre("emo");
const punk = getGenre("punk");

function page(inner: string): string {
  return `<html><body>${inner}</body></html>`;
}

function verdictPage(verdict: string): string {
  return page(`<div class="results col-xs-12">
    <h2>${verdict}</h2>
  </div>`);
}

test("reports a yes verdict for a band the site recognizes in the genre", () => {
  const html = verdictPage("Sunny Day Real Estate <em>is an emo band.</em>");

  const result = parseBandPage(html, emo, "Sunny Day Real Estate");

  assert.equal(result.status, "yes");
  assert.equal(result.verdict, "Sunny Day Real Estate is an emo band.");
  assert.equal(result.url, "https://isthisbandemo.com/?band=Sunny%20Day%20Real%20Estate");
  assert.equal(result.commentary, undefined);
  assert.equal(result.related, undefined);
});

test("reports a no verdict even though the wording contains is an emo band", () => {
  const html = verdictPage("Blink-182 is not an emo band.");

  const result = parseBandPage(html, emo, "Blink-182");

  assert.equal(result.status, "no");
  assert.equal(result.verdict, "Blink-182 is not an emo band.");
});

test("reports unknown when the site has no record of the band", () => {
  const html = verdictPage("Sunny Day Real Estate is not in our system.");

  const result = parseBandPage(html, emo, "Sunny Day Real Estate");

  assert.equal(result.status, "unknown");
});

test("reports unrecognized when the verdict does not mention the genre", () => {
  const html = verdictPage("Blink-182 is a pop band.");

  const result = parseBandPage(html, emo, "Blink-182");

  assert.equal(result.status, "unrecognized");
});

test("extracts commentary, video, tweet link, and related genre from the page", () => {
  const html = page(`
    <div class="results col-xs-12">
      <h2>Sunny Day Real Estate is an emo band.</h2>
    </div>
    <div class="col-xs-8 center">
      <h4>Sorry, to anyone over 30 they&#39;re<br>just pop&#x2D;punk.
        <a class="twitter-share-button" href="https://twitter.com/home?status=Sorry%2C%20to%20anyone%20over%2030">Tweet</a>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"></iframe>
      </h4>
    </div>
    <div class="col-xs-12 comment">
      <h5>Also <a href="http://isthisbandpunk.com/?band=Sunny+Day+Real+Estate">punk</a>.</h5>
    </div>
  `);

  const result = parseBandPage(html, emo, "Sunny Day Real Estate");

  assert.equal(result.commentary, "Sorry, to anyone over 30 they're just pop-punk. Tweet");
  assert.equal(result.videoUrl, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  assert.equal(result.tweetUrl, "https://x.com/intent/post?text=Sorry%2C%20to%20anyone%20over%2030");
  assert.deepEqual(result.related, {
    line: "Also punk.",
    genre: "punk",
    url: "https://isthisbandpunk.com/?band=Sunny+Day+Real+Estate",
  });
});

test("throws when the page has no verdict", () => {
  assert.throws(() => parseBandPage(page("<p>Service unavailable</p>"), emo, "Blink-182"), {
    message: "Couldn't find a verdict on the page.",
  });
});

test("builds the lookup URL from the genre domain and the band name", () => {
  assert.equal(siteUrl(emo, "Sunny Day Real Estate"), "https://isthisbandemo.com/?band=Sunny%20Day%20Real%20Estate");
});

test("trims the band name and encodes reserved characters in the lookup URL", () => {
  assert.equal(siteUrl(punk, "  Blink-182 & Friends "), "https://isthisbandpunk.com/?band=Blink-182%20%26%20Friends");
});
