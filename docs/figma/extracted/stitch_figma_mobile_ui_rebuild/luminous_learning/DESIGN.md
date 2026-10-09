---
name: Luminous Learning
colors:
  surface: '#faf9fe'
  surface-dim: '#dad9df'
  surface-bright: '#faf9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf3'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#414755'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#006688'
  on-secondary: '#ffffff'
  secondary-container: '#00c1fd'
  on-secondary-container: '#004b65'
  tertiary: '#bc000a'
  on-tertiary: '#ffffff'
  tertiary-container: '#e2241f'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#c2e8ff'
  secondary-fixed-dim: '#75d1ff'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d67'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4aa'
  on-tertiary-fixed: '#410001'
  on-tertiary-fixed-variant: '#930005'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.5px
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  code-snippet:
    fontFamily: courierPrime
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  margin-horizontal: 20px
  touch-target: 44px
---

## Brand & Style

The brand personality is **instructive, energetic, and precise**. Designed specifically for developers and learners, the interface balances professional technicality with an approachable, modern aesthetic. The goal is to reduce the cognitive load associated with learning complex code concepts by providing a UI that feels organized and clear.

This design system utilizes a **Modern Corporate** style with **Minimalist** tendencies. It avoids unnecessary decoration, focusing instead on high-quality typography, intentional whitespace, and a vibrant primary color to guide the user's attention toward progress and success. The emotional response should be one of confidence and clarity—making the daunting task of "mastering React Native" feel structured and achievable.

## Colors

The palette is anchored by a **Vibrant Blue**, selected for its association with technology and clarity. 

- **Primary:** A high-contrast blue used for key actions, progress indicators, and active states.
- **Secondary:** A lighter cyan-blue used for accents and illustrative elements to provide depth without competing with the primary action.
- **Surface & Background:** We use a "pure white" background for the main canvas, with subtle off-white and light gray surfaces (`#F2F2F7`) to group related content, such as card containers.
- **Status Colors:** Standardized semantic colors (Red for errors/logout, Green for success/correct answers) are used sparingly to maintain the clean aesthetic.

## Typography

**Inter** is the primary typeface, chosen for its exceptional legibility on mobile screens and its neutral, modern character. 

Hierarchy is established through weight and scale rather than decorative shifts. For the specific 390x844px screen size:
- **Display titles** use tight letter spacing and bold weights to feel impactful.
- **Body text** maintains a minimum of 15px for accessibility and comfortable reading during long lessons.
- **Monospaced snippets** use Courier Prime to clearly distinguish code-related content from instructional prose.

## Layout & Spacing

This design system uses a strict **8pt Grid System** to ensure vertical rhythm and consistent alignment.

- **Margins:** Screens utilize a 20px horizontal margin to provide breathing room on modern edge-to-edge mobile displays.
- **Gaps:** Use `16px` (md) for spacing between related components in a list and `24px` (lg) for spacing between distinct sections.
- **Touch Targets:** All interactive elements (buttons, links, chevron icons) must maintain a minimum height/width of `44px` to ensure accessibility and ease of use in a mobile environment.

## Elevation & Depth

Visual hierarchy is primarily conveyed through **Tonal Layers** rather than heavy shadows. 

1. **Level 0 (Base):** The main application background (`#FFFFFF`).
2. **Level 1 (Surface):** Cards and container elements use a subtle light gray fill (`#F2F2F7`) with no shadow. This creates a "flush" but organized feel.
3. **Level 2 (Interactive):** Primary buttons and active states use the brand color to "pop" from the page.
4. **Subtle Shadows:** Only used on floating elements (like a Bottom Sheet or a floating 'View All' button) using an ultra-diffused shadow: `offset: {0, 4}, blur: 20, opacity: 0.05, color: #000`.

## Shapes

The shape language is consistently **Rounded**. 

The standard radius is **12px** for all primary containers, including cards, input fields, and buttons. This radius strikes a balance between the friendly nature of the learning app and the structured nature of a coding tool. 

- **Small elements** (chips, tags) should use a `4px` or `8px` radius.
- **Progress bars** should have fully rounded caps (pill-shaped) to represent fluidity and movement.

## Components

### Buttons
- **Primary:** Full width (minus margins), 12px radius, `#007AFF` background, White Inter Bold text.
- **Secondary/Ghost:** Transparent background with a 1px border of the primary color or just primary-colored text for less emphasis.

### Input Fields
- **Default State:** 12px radius, 16px internal padding, `#F2F2F7` background.
- **Focused State:** 2px border using Primary Blue.
- **Labels:** Positioned above the input using `label-lg` typography.

### Learning Cards
- **Structure:** 12px radius, white background or light gray surface.
- **Progress Indicators:** Linear progress bars nested at the bottom of the card using the brand blue against a light gray track.

### Quiz Options
- **Neutral:** Light gray surface.
- **Correct:** Thin green border with light green tint background.
- **Incorrect:** Thin red border with light red tint background.

### Navigation
- **Tab Bar:** Minimalist icons with a 2pt blue dot indicator below the active icon. Use backdrop blur (Glassmorphism) if the content scrolls behind it.