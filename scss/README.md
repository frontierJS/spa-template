# Stylesheet for FrontierJS

I want a methodology for styling

A way to think about it so I don't have to think about it

## Settings: preprocessor variables, colors, global settings

@import '\_s-color-palette';

@import '\_s-variables';

- Fonts
- Colors
- Standard Sizings (padding, margins, breakpoints)

@import '\_s-breakpoints';

## Generic/Elements: element selectors, CMS-generated content

@import '\_e-mixins'; //Don't need to touch unless adding mixin

@import '\_e-reset'; //Don't touch, just default reset css

@import '\_e-base'; // Fine tune this one

//Master Container Layout
maybe a default on main?

## Components: separately styled components (buttons, form inputs, toolbars...)

What are the Key components

@import '\_c-form-input'; (Selects and Checkboxes)

@import '\_c-button';

- Lists
- Tables
- Links
- Modal

What about true components like card or slider?

## Utilities: specific helper classes, overrides

@import '\_u-containers';

// Aside? - what if asides have display none at certian media queries

//Border radius defaults

@import '\_u-text';

// do we want a text component like ply/text?

// default word-wrap

// hr

// br

@import '\_u-generic';

//Display

//Overflow

//Position

//Opacity
