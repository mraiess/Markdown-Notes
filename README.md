# Markdown Notes

Split-screen Markdown editor with live HTML preview, tag filtering, and export to `.md`.

## Run

Open `index.html` in any modern browser. No install, build step, or internet connection needed.

## Usage

- **New** creates a note. Type in the editor; the preview updates on every keystroke.
- Notes are saved to `localStorage` automatically (key: `markdown-notes`).
- Write `#tag` anywhere in a note to tag it. Click a tag button to filter the note list.
- **Export .md** downloads the current note as a Markdown file.
- **Delete** removes the current note after a confirmation.

## Supported Markdown

Headings (`#` to `######`), **bold**, *italic*, `` `inline code` ``, [links](https://example.com), unordered lists (`- item`), blockquotes (`> quote`), and horizontal rules (`---`).

Fenced code blocks, tables, and images are not rendered.

## Files

- `index.html` — page structure
- `style.css` — layout and styling
- `app.js` — state, localStorage, Markdown parser, event handling
