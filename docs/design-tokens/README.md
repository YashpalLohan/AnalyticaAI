# Design Tokens

This folder is the single source of truth for all visual design decisions.

| File | Purpose |
|---|---|
| `tokens.css` | CSS custom properties — import in global styles |
| `tailwind-tokens.js` | Tailwind config extension — add to `theme.extend` |

## Usage

### In your global CSS (`globals.css`):
```css
@import './tokens.css';
```

### In `tailwind.config.ts`:
```ts
import tokens from '../06-Design-Tokens/tailwind-tokens'

export default {
  theme: {
    extend: {
      ...tokens
    }
  }
}
```

## Rules

- All colors, spacing, typography must come from tokens
- Never hardcode hex values or pixel values in components
- Dark mode is handled via `[data-theme="dark"]` in tokens.css
