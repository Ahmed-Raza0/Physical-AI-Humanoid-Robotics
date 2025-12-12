# Responsive Design Guide

## Overview

All pages in the Physical AI & Humanoid Robotics platform are fully responsive across:
- **Mobile devices** (320px - 768px)
- **Tablets** (769px - 1024px)
- **Desktop/Laptop** (1025px+)

## Breakpoint Strategy

### Standard Breakpoints

```css
/* Desktop (default) - 1025px and above */
Default styles apply

/* Tablet - 769px to 1024px */
@media (max-width: 1024px) and (min-width: 769px) {
  /* Tablet-specific styles */
}

/* Mobile - 768px and below */
@media (max-width: 768px) {
  /* Mobile-specific styles */
}
```

## Pages Responsive Status

### ✅ Homepage (`/`)
- **Layout**: Flexbox with centered content
- **Hero Section**:
  - Desktop: Full-width with large title (3.5rem)
  - Tablet: Reduced padding, medium title (3rem)
  - Mobile: Compact layout, small title (2rem), stacked buttons
- **Features Section**:
  - Desktop: 3-column grid
  - Tablet: 3-column grid with smaller SVGs (180px)
  - Mobile: Single column stack, smaller SVGs (150px)
- **Navigation**: Docusaurus responsive navbar (hamburger menu on mobile)

### ✅ Blog Page (`/blog`)
- **Layout**: Container with max-width
- **Hero Section**:
  - Desktop: Full-width header
  - Tablet: Medium padding, 2-column grid for posts
  - Mobile: Single column, compact header
- **Blog Grid**:
  - Desktop: 3 cards per row
  - Tablet: 2 cards per row
  - Mobile: 1 card per row (full width)
- **Category Filter**:
  - Desktop: Horizontal scroll with all buttons visible
  - Tablet: Horizontal scroll
  - Mobile: Horizontal scroll with touch scrolling
- **Search Box**: Full width on all devices with proper padding

### ✅ Chatbot Page (`/chatbot`)
- **Layout**: Full-height container
- **Header**:
  - Desktop: Flexbox with avatar and info
  - Tablet: Wrapped layout with API key button
  - Mobile: Stacked layout
- **Messages Container**:
  - Desktop: Max 70% width for message bubbles
  - Tablet: Max 80% width
  - Mobile: Max 85% width
- **Suggested Questions**:
  - Desktop: Grid with minmax(250px, 1fr)
  - Tablet: 2 columns
  - Mobile: Single column stack
- **Input Area**: Sticky bottom, full width on all devices

### ✅ Auth Pages (`/login`, `/signup`)
- **Layout**: Centered card layout
- **Auth Card**:
  - Desktop: Max 450px width, centered
  - Tablet: Max 450px width with margins
  - Mobile: Full width minus 20px margins
- **Form Inputs**: Full width with proper padding
- **Buttons**: Full width, responsive font sizes
- **Mobile**: Reduced padding (30px vs 40px)

### ✅ Dashboard Page (`/dashboard`)
- **Layout**: Grid system
- **Header**:
  - Desktop: Flexbox with logout button on right
  - Tablet: Wrapped layout
  - Mobile: Stacked layout
- **Dashboard Grid**:
  - Desktop: Auto-fit grid (minmax 300px)
  - Tablet: 2 columns
  - Mobile: Single column
- **Action Buttons**:
  - Desktop: Grid with minmax(200px, 1fr)
  - Tablet: 2 columns
  - Mobile: Single column full width
- **Progress Bars**: Full width on all devices

## Component-Specific Responsive Features

### Navigation (Docusaurus)
- **Desktop**: Full horizontal menu
- **Tablet**: Condensed menu
- **Mobile**: Hamburger menu with slide-out drawer
- **New Links**: Dashboard and Login added to navbar

### Cards
All card components have:
- Hover effects (disabled on touch devices)
- Responsive padding
- Stack on mobile
- Proper text scaling

### Images/SVGs
- Scale proportionally
- Maintain aspect ratio
- Reduce size on smaller screens
- Use CSS `max-width: 100%`

### Typography
Responsive font sizes:
```css
/* Desktop */
h1: 3.5rem
h2: 2.5rem
h3: 1.5rem
p: 1rem

/* Tablet */
h1: 3rem
h2: 2rem
h3: 1.3rem
p: 1rem

/* Mobile */
h1: 2rem
h2: 1.5rem
h3: 1.2rem
p: 0.95rem
```

### Spacing
Consistent spacing scale:
- Desktop: Full padding (40px - 80px)
- Tablet: Medium padding (30px - 50px)
- Mobile: Compact padding (20px - 40px)

## Touch-Friendly Features

All interactive elements have:
- Minimum touch target: 44px × 44px
- Proper spacing between clickable items
- No hover-dependent functionality
- Touch-scrolling support (`-webkit-overflow-scrolling: touch`)

## Performance Optimizations

- CSS animations use `transform` and `opacity` (GPU-accelerated)
- Media queries loaded only when needed
- Images are responsive (though using SVG/emoji mostly)
- No layout shifts during responsive transitions

## Testing Checklist

### Desktop (1920px, 1440px, 1280px)
- [✓] All content fits without horizontal scroll
- [✓] Proper margins and max-width constraints
- [✓] Hover effects work
- [✓] All navigation links accessible

### Tablet (1024px, 768px landscape)
- [✓] Content reflows appropriately
- [✓] Cards stack in 2 columns where appropriate
- [✓] Touch targets are adequate
- [✓] No cut-off text or images

### Mobile (414px iPhone, 375px, 360px Android, 320px small)
- [✓] Single column layout
- [✓] Full-width buttons
- [✓] Readable text (no zooming required)
- [✓] Hamburger menu works
- [✓] Forms are usable
- [✓] Sticky elements don't overlap content

## Dark Mode Support

All pages include dark mode support:
```css
[data-theme='dark'] .className {
  /* Dark mode styles */
}
```

Features:
- Automatic based on system preference
- Manual toggle in navbar
- Proper contrast ratios
- Themed components

## Browser Support

Tested and working on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android)

## Known Issues

None currently identified.

## Future Enhancements

- [ ] Add landscape-specific styles for tablets
- [ ] Implement print styles
- [ ] Add reduced-motion media query support
- [ ] Optimize for foldable devices

## CSS Architecture

All responsive styles follow this pattern:

```css
/* Base styles (mobile-first approach could be used, but we use desktop-first) */
.component {
  /* Desktop styles */
}

/* Tablet breakpoint */
@media (max-width: 1024px) and (min-width: 769px) {
  .component {
    /* Tablet adjustments */
  }
}

/* Mobile breakpoint */
@media (max-width: 768px) {
  .component {
    /* Mobile adjustments */
  }
}

/* Dark mode */
[data-theme='dark'] .component {
  /* Dark mode styles */
}
```

## Maintenance

When adding new components:

1. Start with desktop styles
2. Add tablet breakpoint (769px - 1024px)
3. Add mobile breakpoint (max 768px)
4. Test on real devices
5. Add dark mode support
6. Ensure touch-friendly
7. Test with DevTools responsive mode

## Resources

- [Docusaurus Responsive Design](https://docusaurus.io/docs/styling-layout)
- [MDN Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)
- [Google Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

---

Last Updated: December 2024
