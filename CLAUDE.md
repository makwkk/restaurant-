# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the project

No build step. Open files directly in a browser:

```powershell
Start-Process index.html          # restaurant booking site
Start-Process currency-converter.html  # standalone currency tool
```

There are no dependencies, package managers, or test runners. All validation is done manually in the browser.

## Project contents

| File | Purpose |
|---|---|
| `index.html` | Single-page French restaurant website (Maison Lumière) |
| `styles.css` | All styling for index.html |
| `script.js` | All behaviour for index.html |
| `currency-converter.html` | Self-contained currency converter (inline CSS + JS, no external files) |

## Architecture — index.html / styles.css / script.js

### Page sections (in DOM order)
`#site-nav` → `#hero` → `#menu` → `#testimonials` → `#reservations` → `footer`

Smooth scroll between sections is handled by `scroll-behavior: smooth` on `html` in CSS; no JS scroll library.

### CSS design system
All colours and spacing live as custom properties on `:root` in `styles.css`. The key tokens are `--charcoal`, `--cream`, `--gold`, `--gold-dark`, `--font-serif` (Cormorant Garamond), and `--font-sans` (Montserrat). Edit tokens there before touching individual rules.

### Fade-in animation contract
Any element given the class `fade-up` in HTML starts invisible (`opacity:0; transform:translateY(32px)`) and gains `.visible` when it enters the viewport. This is wired up by the `IntersectionObserver` block (section A) in `script.js`. Adding `.fade-up` to new elements is all that's needed — no JS changes required.

### Testimonial carousel (script.js section C)
State is two module-level vars: `current` (index 0–2) and `autoTimer` (setInterval handle). `goTo(n)` moves the `.carousel-track` with `translateX` and syncs the `.dot` buttons. Arrow buttons, dot clicks, touch swipe, and hover-pause all call `stopAuto()`/`startAuto()` around `goTo()`. To add a slide: add a `.testimonial-card` div to `#carousel-track` in HTML and a `.dot` button to `#carousel-dots`; the JS reads `track.children.length` dynamically.

### Form validation (script.js section D)
`setError(inputId, errId, message)` adds `.invalid` to the input and writes text into a paired `<span class="field-error">`. `clearAllErrors()` resets all pairs. The submit handler collects all field values, runs checks in sequence (each failed check sets `valid = false` and calls `setError`), and returns early if `!valid`. On success it writes interpolated HTML into `#form-success` via `escHtml()` (which XSS-escapes all user values) and resets the form. The date `min` attribute is re-applied after `form.reset()` because reset clears it.

### Unsplash images
All food/hero images use the pattern:
```
https://images.unsplash.com/photo-{ID}?w=800&q=80&auto=format&fit=crop&h=600
```
Hero uses `w=1920`. If a photo ID returns a wrong subject or 404, swap the ID — the URL structure remains the same.

### Mobile nav
`.nav-open` toggled on `#site-nav` controls both the hamburger animation (CSS transforms on its `span` children) and the nav-links max-height expansion. The hamburger is hidden on desktop via `display:none` and shown at `≤768px`.
