# Dot Motion Tool

This project creates a transparent dot animation that can be exported as CSS or a React component for use inside a design system.

## Files

- `index.html` contains the preview layout, controls, and export buttons.
- `style.css` styles the editor UI and the live dot grid.
- `script.js` builds the dot grid, runs the animation, handles controls, and generates downloadable CSS or React output.

## Animation Model

The animation is a grid of dots arranged as a small matrix. The default setup is `20 x 2`, and the column control supports the common `15 x 2` to `20 x 2` range.

Each dot keeps a fixed size unless `Random size` is enabled. The animation changes opacity only, so the dots fade in and out without scaling, shadow, glow, or background color.

The animated effect is driven by a smooth noise pattern:

1. Each dot is mapped to a column and row position.
2. A seeded noise function gives each position a stable random value.
3. A smooth noise function blends nearby random values so the movement feels organic instead of flickery.
4. Time is added to the noise coordinates on every animation frame.
5. The resulting noise value is converted into opacity between `0.12` and `1`.

This makes every dot feel random while still moving as one coherent animated texture.

## Controls

- `Speed` changes how fast the noise pattern moves.
- `Cols` changes the number of dot columns.
- `Rows` changes the number of dot rows.
- `Scale` scales the whole grid without changing the dot count or dot size value.
- `Size` changes the base size of every dot.
- `Random size` gives each dot a stable random size.
- `Dot color` changes the color used by all dots.

## Exports

`Export CSS` downloads `dot-motion.css`. It includes the CSS animation and a usage snippet at the top showing the required markup.

`Export React` downloads `DotMotion.jsx`. It is a self-contained React component with the current settings baked in.

Both exports use a transparent background so the animation can sit inside product surfaces, brand layouts, or component libraries without carrying editor styling with it.
