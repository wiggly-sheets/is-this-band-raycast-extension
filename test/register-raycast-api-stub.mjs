import { registerHooks } from "node:module";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "@raycast/api") {
      return { url: new URL("./raycast-api-stub.mjs", import.meta.url).href, shortCircuit: true };
    }

    return nextResolve(specifier, context);
  },
});
