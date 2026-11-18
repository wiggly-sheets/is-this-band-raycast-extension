import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_GENRE, getGenre } from "../src/lib/genres.ts";

test("returns the genre that matches the stored id", () => {
  const genre = getGenre("punk");

  assert.equal(genre.name, "Punk");
  assert.equal(genre.domain, "isthisbandpunk.com");
});

test("falls back to the default genre for an unknown id", () => {
  assert.equal(getGenre("skiffle"), DEFAULT_GENRE);
  assert.equal(DEFAULT_GENRE.name, "Emo");
});
