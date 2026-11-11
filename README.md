# Silk Vision — Special Offers page (staging)

Special Offers & Patient Referral Rewards page on the Silk Vision design
system, built the same way as the entropion page.

Staging URL: https://imageworksc.github.io/silkvision-special-offers/

## Structure

```
index.html
css/   fonts → tokens → base → components → sections → type → motion
js/main.js
fonts/  images/  favicons  .nojekyll
```

- No inline styles or scripts in the HTML. The only `<script>` blocks are
  the JSON-LD data and the deferred `js/main.js`.
- `js/main.js` uses `const`/`let` and arrow functions only. It carries just
  what this page uses: reading progress, scroll reveals, the phone sticky
  call bar and the reward-card entrances.
- The CSS holds only rules that match this page. Patterns from the starter
  that this page does not use (nav, table, video, FAQ, carousel, stepper…)
  were removed.

## Running inside Drupal

The live page sits in a field of the silkvision.net theme. Same rules as
the entropion page:

- `1rem = 10px`. The theme sets `html { font-size: 62.5% }`, and `base.css`
  sets the same value, so staging matches. Media queries stay on the
  browser's 16px, so `48rem` in a query still means 768px.
- The page wrapper is `#sv-main`. Never use `id="main"` or the class
  `section`: the theme caps both at 1000px.
- `#sv-main` clears floats, so the theme's main menu can't narrow the hero.
- Anything the page adds to the field needs the `html-wrapper` class, or the
  theme recolours its links. `main` and `.sticky-cta` both carry it.
- Element-level rules are scoped with `:where(.field-html-code)`, so they
  don't reach the site's header and footer. `index.html` has the same
  wrapper.
- No inline width patches in the field. If one seems needed, the fix belongs
  in these files.

Before handing off, test it inside a copy of the live page at 320, 390,
768, 1440, 1920 and 2560 wide.

## Pending

- [ ] Upload `images/specials-hero.jpg` and `images/evo-how.jpg` to
      Cloudinary and swap the paths. The hero needs a larger original
      (about 3600–4000px wide): at 1800px it looks soft on 4K and 5K screens.
- [ ] Approve the meta description and add an `og:image`.
- [ ] Remove `<meta name="robots" content="noindex, nofollow">` at go-live.
