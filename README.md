# Is This Band...?

A Raycast extension for the whole [Is This Band...?](#the-sites) family. Type a band name, pick a genre, and get the verdict directly in Raycast — no browser required.

The site's commentary is shown in the detail panel, so long answers wrap instead of being cut off.

## Usage

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start the extension in development mode:

   ```sh
   npm run dev
   ```

3. Open Raycast, search for **Is This Band...?**, then choose a genre from the dropdown next to the search bar. Your last genre is remembered between launches.

The query is debounced as you type. Press <kbd>↵</kbd> to copy the verdict, <kbd>⌘</kbd>+<kbd>O</kbd> to open the result on the website, or <kbd>⌘</kbd>+<kbd>R</kbd> to refresh.

## The sites

| Genre    | Site                                                      |
| -------- | --------------------------------------------------------- |
| Emo      | [isthisbandemo.com](https://isthisbandemo.com/)           |
| Punk     | [isthisbandpunk.com](https://isthisbandpunk.com/)         |
| Metal    | [isthisbandmetal.com](https://isthisbandmetal.com/)       |
| Hardcore | [isthisbandhardcore.com](https://isthisbandhardcore.com/) |
| Indie    | [isthisbandindie.com](https://isthisbandindie.com/)       |

## How it works

The sites have no public API, so the extension requests each site's `?band=<name>` page and parses the verdict, commentary, and any cross-link to a sibling genre site. Results are not cached; each query is fetched fresh.

## Scripts

| Script             | Description                  |
| ------------------ | ---------------------------- |
| `npm run dev`      | Run the extension in Raycast |
| `npm run build`    | Build the extension          |
| `npm run lint`     | Lint the manifest and source |
| `npm run fix-lint` | Auto-fix linting issues      |

## Disclaimer

This is an unofficial extension and is not affiliated with the Is This Band...? sites.
