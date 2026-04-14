# Dot Motion Tool

![Dot Motion Tool animated preview](assets/preview.svg)

This project creates a configurable dot animation that can be exported as CSS or a React component for use inside a design system.

## Files

- `index.html` contains the preview layout, controls, and export buttons.
- `style.css` styles the editor UI and the live dot grid.
- `script.js` builds the dot grid, runs the animation, handles controls, and generates downloadable CSS, React, SVG, or GIF output.

## Animation Model

The animation is a grid of dots arranged as a small matrix. The default setup is `20 x 2`, and the column control supports the common `15 x 2` to `20 x 2` range.

Each dot keeps a fixed size unless `Random size` is enabled. The animation changes opacity only, so the dots fade in and out without scaling, shadow, glow, or background color.

The animated effect is driven by a configurable procedural noise pattern:

1. Each dot is mapped to a column and row position.
2. The selected noise type calculates a value for that position.
3. The `Noise scale` slider stretches or compresses the pattern across the grid.
4. Time is added to the noise coordinates on every animation frame.
5. `Opacity contrast` adjusts how strongly the noise separates dark and bright dots.
6. The resulting noise value is converted into opacity using the selected `Min opacity` and `Max opacity` range.

This makes every dot feel random while still moving as one coherent animated texture.

## Noise Types

- `Perlin` uses gradient noise for a smooth natural opacity field.
- `Fractal Brownian Motion` layers multiple Perlin octaves for richer detail.
- `Turbulence` folds Perlin values with `abs`, creating sharper cloudy motion.
- `Ridged` inverts turbulence so the high-contrast ridges become the bright areas.
- `Cellular` uses nearest-feature-point distance, similar to Worley noise.

## Controls

- `Speed` changes how fast the noise pattern moves.
- `Pattern` changes the type of noise used to animate opacity.
- `Noise scale` controls how dense or spread out the noise pattern is.
- `Min opacity` sets the darkest dot opacity from `0%` to `100%`.
- `Max opacity` sets the brightest dot opacity from `0%` to `100%`.
- `Opacity contrast` softens or sharpens the opacity difference between dots.
- `Cols` changes the number of dot columns.
- `Rows` changes the number of dot rows.
- `Scale` scales the whole grid without changing the dot count or dot size value.
- `Size` changes the base size of every dot.
- `Random size` gives each dot a stable random size.
- `Dot color` changes the color used by all dots.
- `Background color` changes the preview background and exported component background.

## Exports

`Export CSS` downloads `dot-motion.css`. It includes the CSS animation and a usage snippet at the top showing the required markup.

`Export React` downloads `DotMotion.jsx`. It is a self-contained React component with the current settings baked in.

`Export SVG` downloads `dot-motion.svg`. It is a responsive animated SVG with a `viewBox`, so it can scale inside layouts without needing JavaScript.

`Export GIF` downloads `dot-motion.gif`. It renders the current settings into a looped animated GIF.

All exports use the selected background color so the animation can be downloaded with the same surface color shown in the preview.
