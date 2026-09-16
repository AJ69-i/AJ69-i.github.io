# Ahmed Jab — Portfolio

Dark, cinematic personal portfolio for a Senior Frontend Engineer.
Built with **Vite + GSAP (ScrollTrigger) + Lenis** — smooth scroll, split-text reveals,
a scroll-driven experience timeline, magnetic buttons, a custom cursor and a film-grain
finish. Fully responsive and `prefers-reduced-motion` aware.

**Live:** _add your GitHub Pages URL here after the first deploy_

---

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs to /dist
npm run preview  # serve the production build
```

---

## Structure

```
ahmed-portfolio/
├─ index.html                  # all markup + content
├─ src/
│  ├─ main.js                  # Lenis + GSAP animations
│  └─ style.css                # design system + all components
├─ public/                     # static assets copied as-is
├─ .github/workflows/deploy.yml # builds and publishes to GitHub Pages
└─ vite.config.js
```

Sections, in order: Hero → Marquee → About → **Selected Work (case studies)** →
Experience timeline → Toolbox → Contact.

---

## Editing content

Everything lives in `index.html` — there is no CMS and no data file.

**Case studies** — each one is an `<article class="case">` in the `#work` section:

```html
<article class="case" data-reveal>
  <div class="case__head">
    <span class="case__index">01</span>
    <div class="case__title">
      <h3>Title</h3>
      <p class="case__org">Company · Context</p>
    </div>
  </div>
  <p class="case__body">Problem → decision → trade-off → outcome.</p>
  <ul class="case__stats">
    <li><b>30+</b><span>modules powered</span></li>
  </ul>
  <ul class="case__tags"><li>Angular</li></ul>
</article>
```

Keep the `data-reveal` attribute — it is what the GSAP scroll animation hooks onto.
Cards flow in a responsive grid, so adding or removing one needs no CSS change.

**Design tokens** — colors, fonts and spacing are CSS variables at the top of `src/style.css`:

```css
--accent: #e9b872;   /* warm gold accent */
--bg:     #0a0a0b;   /* near-black       */
--text:   #f3f0ea;   /* off-white        */
```

**Adding a photo** — drop `portrait.jpg` into `public/` and add an
`<img src="portrait.jpg">` inside a `[data-portrait]` wrapper; `src/main.js` already
handles the reveal animation and is a no-op when the element is absent.

---

## Deploy — GitHub Pages

`.github/workflows/deploy.yml` builds on every push to `main` and publishes `/dist`.

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Push to `main`. The site goes live at
   `https://<username>.github.io/<repo>/`.

`base: './'` is already set in `vite.config.js`, so the build works from a project
sub-path. For a custom domain, set `base: '/'`.

---

## Stack

Vite · GSAP 3 + ScrollTrigger · Lenis · Google Fonts (Sora + Inter).
No framework, no tracking, no browser storage.
