# Loader Component Documentation

A reusable, accessible loading spinner for async operations. Supports size, variant, color, message, overlay, and ARIA props. Follows the design system and is ready for site-wide use.

## Usage

```tsx
import { Loader } from '@/components/ui/loader'

// Inline loader
<Loader />

// With message
<Loader message="Loading audits..." />

// Overlay loader
<Loader variant="overlay" message="Saving..." />

// Custom color and size
<Loader size="lg" color="text-blue-500" message="Uploading..." />
```

## Props
| Prop             | Type                | Default         | Description                                                      |
|------------------|---------------------|-----------------|------------------------------------------------------------------|
| size             | 'sm' \| 'md' \| 'lg' | 'md'            | Loader size                                                      |
| variant          | 'primary' \| 'secondary' \| 'overlay' | 'primary' | Loader style (inline, secondary, or overlay)                     |
| color            | string              | ''              | Spinner color (Tailwind class or custom)                         |
| message          | string              | undefined       | Optional loading message                                         |
| overlay          | boolean             | false           | If true, shows a fullscreen overlay                              |
| ariaLabel        | string              | 'Loading'       | ARIA label for accessibility                                     |
| backgroundColor  | string              | 'bg-black/40'   | Overlay background color                                         |
| className        | string              | ''              | Additional wrapper classes                                       |
| spinnerClassName | string              | ''              | Additional spinner classes                                       |

## Accessibility
- Uses `role="status"` and `aria-label` for screen readers
- Overlay uses `role="alertdialog"` and `aria-live="polite"`
- Message is visually hidden if not provided

## Best Practices
- Use `variant="overlay"` for blocking UI during major async operations
- Use inline loader for button or small area loading
- Always provide a meaningful `message` for overlays
- Disable user interaction during loading
- Use with skeletons for content loading where appropriate

## Example: Button with Loader
```tsx
<Button disabled={isLoading}>
  {isLoading ? <Loader size="sm" message="Saving..." /> : 'Save'}
</Button>
```

## Example: Page Overlay
```tsx
{isPageLoading && <Loader variant="overlay" message="Loading audits..." />}
```

--- 