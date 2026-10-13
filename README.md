# Quest Portfolio — GitHub Pages starter

A static portfolio concept for a Quest / Mission Designer.

## What to edit first

Open `styles.css` and look at the variables at the very top:

- `--bg` = background
- `--panel` = card background
- `--text` = main text
- `--muted` = secondary text
- `--accent` = highlight color
- `--radius` = corner roundness
- `--max-width` = maximum page width

These values change most of the visual identity without touching the layout.

## Replace content

In `index.html` you can search for:

- `NIKLAS`
- `The Forgotten District`
- `Last Train Out`
- `Faction Reputation Loop`
- `hello@example.com`

Replace these with your own name, projects and contact information.

## Add real screenshots

Replace:

```html
<div class="quest-image placeholder-image">
  ...
</div>
```

with:

```html
<div class="quest-image">
  <img src="images/project-name.jpg" alt="Project screenshot">
</div>
```

Then add this to `styles.css`:

```css
.quest-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
}
```

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `styles.css`, and `script.js`.
3. Open repository Settings → Pages.
4. Choose deployment from the `main` branch / root folder.
5. GitHub will give you a public Pages URL.
6. A custom domain can be connected later.

## Design direction

This deliberately avoids a medieval RPG interface. The visual language uses:
- quest-log terminology
- objective states
- progress
- mission tags
- codex/profile presentation

but keeps the overall presentation modern and portfolio-first.
