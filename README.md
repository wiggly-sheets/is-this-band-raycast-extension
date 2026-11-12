# Is This Band Emo?

A Raycast extension that answers the only question that matters: **is this band emo?**

Type a band name and the verdict from [isthisbandemo.com](https://isthisbandemo.com/) appears directly in Raycast — no browser required. You also get the site's commentary ("Sorry, to anyone over 30 they're pop-punk.") and any related-genre cross-reference.

## Usage

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start the extension in development mode:

   ```sh
   npm run dev
   ```

3. Open Raycast and search for **Is This Band Emo?** (or just "emo").

As you type, the query is debounced and sent to the site. Press <kbd>↵</kbd> to copy the verdict, <kbd>⌘</kbd>+<kbd>O</kbd> to open the result on the website, or <kbd>⌘</kbd>+<kbd>R</kbd> to refresh.

## How it works

The site has no public API, so the extension requests `https://isthisbandemo.com/?band=<name>` and parses the verdict, commentary, and genre cross-link from the HTML. Results are not cached; each query is fetched fresh.

## Scripts

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Run the extension in Raycast      |
| `npm run build`     | Build the extension               |
| `npm run lint`      | Lint the manifest and source      |
| `npm run fix-lint`  | Auto-fix linting issues           |

## Disclaimer

This is an unofficial extension and is not affiliated with isthisbandemo.com.
