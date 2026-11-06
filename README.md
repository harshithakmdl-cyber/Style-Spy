# Style Spy Chrome Extension

Style Spy inspects a webpage's main colours and typography, lets you pick an element's style, save named style kits, and export a kit as CSS variables.

## Features
- Rank detected page colours by how often they appear.
- Show font family, weight, and size.
- Click a colour or font to copy its CSS value.
- Pick a page element and copy its computed style.
- Save named kits locally in Chrome storage.
- Saved kits remain available after Chrome restarts.
- Export a kit as CSS custom properties.

## Install in Chrome (developer mode)
1. Download and extract `Style-Spy.zip`.
2. Open Chrome and visit `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the extracted `style-spy-extension` folder (the folder containing `manifest.json`).
6. Pin **Style Spy** from the Extensions menu.
7. Open a normal website, then click the Style Spy icon.

## How to use
1. Open a webpage.
2. Click the extension icon to inspect colours and fonts.
3. Click a swatch or font row to copy its CSS.
4. Use **Pick from page** and click an element to copy its computed style. Press Esc to cancel.
5. Enter a name under **Save style kit** and click **Save**.
6. Use **Load** to view a saved kit or **CSS** to copy its CSS variables.
7. Click **Copy as CSS** to export the current kit.

## GitHub upload
1. Create or open your GitHub repository.
2. Click **Add file → Upload files**.
3. Extract the ZIP first, then upload all files inside the `style-spy-extension` folder, including `manifest.json`, `popup.html`, `popup.css`, `popup.js`, and `content.js`.
4. Click **Commit changes**.
5. To install the extension, download the repository ZIP and follow the Chrome developer-mode instructions above.

## Notes
- Chrome extensions cannot inspect restricted pages such as `chrome://` pages or the Chrome Web Store.
- Style detection is based on visible DOM elements and computed styles, so it is an estimate of the page's most-used colours and fonts.
- Saved kits are stored locally in Chrome and are not synced to a website.
