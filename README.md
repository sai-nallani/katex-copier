# KaTeX Copier

A Chrome extension that lets you easily copy LaTeX math formulas from ChatGPT, Claude, Gemini, and other websites that render math using KaTeX.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-brightgreen)

## Features

- 🎯 **Click to Copy** — Simply click on any KaTeX-rendered formula to copy its LaTeX source
- 📋 **Smart Detection** — Automatically detects KaTeX formulas on any webpage
- ✨ **Visual Feedback** — Highlighted formulas show they're ready to copy
- 🔔 **Toast Notifications** — Get instant confirmation when formulas are copied
- 📊 **Popup Dashboard** — View all detected formulas on the current page

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/katex-copier.git
   ```

2. Open Chrome and navigate to `chrome://extensions`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **Load unpacked** and select the cloned `katex-copier` folder

5. The extension icon will appear in your toolbar — you're ready to go!

## Usage

### Method 1: Click to Copy
1. Navigate to any page with KaTeX formulas (ChatGPT, Claude, Gemini, etc.)
2. Hover over a formula — it will be highlighted
3. Click the formula to copy its LaTeX source to your clipboard
4. A toast notification confirms the copy

### Method 2: Popup Dashboard
1. Click the KaTeX Copier extension icon in your toolbar
2. View all detected formulas on the current page
3. Click "Copy" next to any formula to copy it

## Supported Sites

Works on any website that uses KaTeX for math rendering, including:

- **ChatGPT** (chat.openai.com)
- **Claude** (claude.ai)
- **Google Gemini** (gemini.google.com)
- **Stack Exchange** sites
- **Notion**
- **Obsidian Publish**
- And many more!

## How It Works

KaTeX stores the original LaTeX source in the `annotation` element with `encoding="application/x-tex"`. This extension extracts that source code and copies it to your clipboard, making it easy to reuse formulas in your own documents.

## License

MIT License — feel free to use, modify, and distribute.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
