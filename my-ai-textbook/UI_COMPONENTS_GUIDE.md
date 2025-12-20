# UI Components & Hooks Guide

Comprehensive documentation for the UI component library and custom hooks.

## Table of Contents

- [Design System](#design-system)
- [UI Components](#ui-components)
- [Custom Hooks](#custom-hooks)
- [Utility Functions](#utility-functions)
- [Animation Variants](#animation-variants)

---

## Design System

The design system provides consistent styling tokens across the application.

### Import

```typescript
import { spacing, typography, shadows, borderRadius, colors } from '@site/src/styles';
```

### Available Tokens

- **spacing**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`
- **typography**: font families, sizes, weights, line heights, letter spacing
- **shadows**: elevation levels from `sm` to `2xl`, plus special shadows for cards and modals
- **borderRadius**: rounded corners from `sm` to `3xl`, plus `full` and `circle`
- **colors**: comprehensive color palette with primary, secondary, accent, neutral, and semantic colors

---

## UI Components

### Button

Professional button component with variants, sizes, and loading states.

```tsx
import { Button } from '@site/src/components/UI';

<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

<Button
  variant="secondary"
  size="lg"
  isLoading={loading}
  leftIcon={<span>🚀</span>}
>
  Launch
</Button>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'`
- `size`: `'sm' | 'md' | 'lg'`
- `isLoading`: boolean
- `leftIcon`, `rightIcon`: ReactNode
- `fullWidth`: boolean
- All standard button HTML attributes

### Input

Form input component with validation states, icons, and helper text.

```tsx
import { Input } from '@site/src/components/UI';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  helperText="We'll never share your email"
  leftIcon={<span>📧</span>}
  required
/>
```

**Props:**
- `label`: string
- `error`: string (shows error message)
- `success`: boolean (shows success state)
- `helperText`: string
- `leftIcon`, `rightIcon`: ReactNode
- `variant`: `'outlined' | 'filled' | 'standard'`
- `fullWidth`: boolean
- All standard input HTML attributes

### Modal

Accessible modal/dialog component with animations.

```tsx
import { Modal } from '@site/src/components/UI';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={handleClose}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: `'sm' | 'md' | 'lg' | 'xl' | 'full'`
- `showCloseButton`: boolean (default: true)
- `closeOnOverlayClick`: boolean (default: true)
- `closeOnEscape`: boolean (default: true)
- `footer`: ReactNode

### Alert

Alert/banner component for messages and notifications.

```tsx
import { Alert } from '@site/src/components/UI';

<Alert type="success" title="Success!" onClose={handleClose}>
  Your changes have been saved successfully.
</Alert>

<Alert type="error" variant="filled">
  An error occurred. Please try again.
</Alert>
```

**Props:**
- `type`: `'info' | 'success' | 'warning' | 'error'`
- `title`: string
- `icon`: ReactNode (custom icon)
- `variant`: `'filled' | 'outlined' | 'standard'`
- `onClose`: () => void (shows close button if provided)

### Toast

Toast notification system with auto-dismiss.

```tsx
import { Toast, ToastContainer } from '@site/src/components/UI';

// Toast Container (place once in your app)
<ToastContainer
  toasts={toasts}
  position="top-right"
  onRemove={removeToast}
/>

// Individual Toast
<Toast
  type="success"
  title="Saved!"
  message="Your changes have been saved"
  duration={5000}
  onClose={handleClose}
/>
```

**Props:**
- `type`: `'info' | 'success' | 'warning' | 'error'`
- `title`: string
- `message`: ReactNode
- `duration`: number (milliseconds, 0 = no auto-dismiss)
- `onClose`: () => void
- `position`: `'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'`

### Skeleton

Loading placeholder components.

```tsx
import { Skeleton, SkeletonCard, SkeletonAvatar } from '@site/src/components/UI';

// Basic skeleton
<Skeleton variant="text" width="80%" />
<Skeleton variant="rect" width={300} height={200} />
<Skeleton variant="circle" width={40} height={40} />

// Multiple skeletons
<Skeleton variant="text" count={3} />

// Preset components
<SkeletonCard />
<SkeletonAvatar size={50} />
<SkeletonTable rows={5} columns={4} />
```

**Props:**
- `variant`: `'text' | 'rect' | 'circle' | 'rounded'`
- `width`, `height`: string | number
- `animation`: `'pulse' | 'wave' | 'none'`
- `count`: number (for multiple skeletons)

---

## Custom Hooks

### useScroll

Track scroll position and direction.

```tsx
import { useScroll } from '@site/src/hooks';

function Component() {
  const { y, direction, isScrollingDown, isAtTop, isAtBottom } = useScroll();

  return (
    <div className={isScrollingDown ? 'hide-header' : 'show-header'}>
      Scroll position: {y}px
    </div>
  );
}
```

**Returns:**
- `x`, `y`: current scroll position
- `direction`: `'up' | 'down' | 'left' | 'right' | null`
- `isScrollingUp`, `isScrollingDown`: boolean
- `isAtTop`, `isAtBottom`: boolean

### useBreakpoint

Detect responsive breakpoints.

```tsx
import { useBreakpoint } from '@site/src/hooks';

function Component() {
  const { isMobile, isTablet, isDesktop, current } = useBreakpoint();

  return (
    <div>
      {isMobile && <MobileMenu />}
      {isDesktop && <DesktopMenu />}
      Current breakpoint: {current}
    </div>
  );
}
```

**Returns:**
- `current`: `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`
- `isXs`, `isSm`, `isMd`, `isLg`, `isXl`, `is2xl`: boolean
- `isMobile`, `isTablet`, `isDesktop`: boolean

### useTheme

Manage theme (light/dark mode).

```tsx
import { useTheme } from '@site/src/hooks';

function Component() {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme} {isDark ? '🌙' : '☀️'}
    </button>
  );
}
```

**Returns:**
- `theme`: `'light' | 'dark'`
- `setTheme`: (theme: Theme) => void
- `toggleTheme`: () => void
- `isDark`, `isLight`: boolean

### usePageTransition

Manage page transition states.

```tsx
import { usePageTransition } from '@site/src/hooks';

function Component() {
  const { startTransition } = usePageTransition(300);

  const handleNavigate = async () => {
    await startTransition('forward');
    // Navigate to new page
  };

  return <button onClick={handleNavigate}>Navigate</button>;
}
```

**Returns:**
- `isTransitioning`: boolean
- `direction`: `'forward' | 'backward' | null`
- `startTransition`: (direction?) => Promise<void>

### useLocalStorage

Sync state with localStorage.

```tsx
import { useLocalStorage } from '@site/src/hooks';

function Component() {
  const [name, setName, removeName] = useLocalStorage('user-name', 'Guest');

  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={removeName}>Clear</button>
    </>
  );
}
```

**Parameters:**
- `key`: localStorage key
- `initialValue`: default value

**Returns:** `[value, setValue, removeValue]`

---

## Utility Functions

Helpful utilities for common UI operations.

```tsx
import {
  cn,
  debounce,
  throttle,
  truncate,
  copyToClipboard,
  scrollToTop,
  formatDate
} from '@site/src/utils';

// Combine class names
const className = cn('base-class', isActive && 'active', 'another-class');

// Debounce function calls
const debouncedSearch = debounce(handleSearch, 300);

// Truncate text
const short = truncate('Long text here...', 20); // "Long text here..."

// Copy to clipboard
await copyToClipboard('Text to copy');

// Scroll to top
scrollToTop();

// Format dates
const formatted = formatDate(new Date()); // "January 15, 2025"
```

---

## Animation Variants

Pre-built animation variants for Framer Motion.

```tsx
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, cardVariants } from '@site/src/styles';

// Basic animations
<motion.div
  initial="hidden"
  animate="visible"
  variants={fadeInUp}
>
  Content
</motion.div>

// Staggered children
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={staggerItem}>
      {item.content}
    </motion.div>
  ))}
</motion.div>

// Cards with hover
<motion.div
  variants={cardVariants}
  initial="hidden"
  whileInView="visible"
  whileHover="hover"
  viewport={{ once: true }}
>
  Card content
</motion.div>
```

### Available Variants

**Entry Animations:**
- `fadeIn`, `fadeInUp`, `fadeInDown`
- `slideInLeft`, `slideInRight`
- `scaleIn`, `bounceIn`, `rotateIn`, `flipIn`

**Container Animations:**
- `staggerContainer` (with `staggerItem` children)
- `listContainer` (with `listItem` children)

**Interactive:**
- `hoverScale`, `hoverLift`, `buttonHover`
- `cardVariants` (includes hover state)

**Modal/Toast:**
- `modalBackdrop`, `modalContent`
- `notificationSlideIn`

**Progress/Accordion:**
- `progressBar`
- `accordionContent`

**Page:**
- `pageTransition`

---

## Best Practices

1. **Accessibility**: All components include proper ARIA attributes and keyboard navigation
2. **Responsive**: Components are mobile-first and fully responsive
3. **Performance**: Animations respect `prefers-reduced-motion`
4. **Theme Support**: All components support light and dark themes automatically
5. **TypeScript**: Full TypeScript support with proper types

## Examples

Check individual page implementations for real-world usage:
- Home page: `src/pages/index.tsx`
- Blog: `src/pages/blog.tsx`
- Chatbot: `src/pages/chatbot.tsx`
- Dashboard: `src/pages/dashboard.tsx`
- Auth pages: `src/pages/login.tsx`, `src/pages/signup.tsx`
