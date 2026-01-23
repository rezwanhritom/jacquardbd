# Frontend Architecture Documentation

## Overview

This document describes the global frontend architecture for the MERN e-commerce application. The architecture is designed to be scalable, maintainable, and consistent across all pages.

## Core Architecture

### Layout System

The application uses a **three-tier layout structure**:

1. **Root Layout** (`components/Layout/Layout.jsx`)
   - Wraps all pages
   - Contains Header (Navbar), Main content area, and Footer
   - Handles page-level transitions
   - Manages theme consistency

2. **Page Components** (`Pages/`)
   - Individual page content
   - No layout concerns (Navbar/Footer handled by Layout)
   - Focus on page-specific content

3. **Reusable Components** (`components/`)
   - UI components that can be used across pages
   - Self-contained and reusable

## Component Structure

### Layout Component

```jsx
<Layout>
  <header>  {/* Sticky Navbar */}
  <main>    {/* Page content with transitions */}
  <footer>  {/* Footer */}
</Layout>
```

**Features:**
- Sticky header that stays at top on scroll
- Flexbox layout ensuring footer stays at bottom
- Page transitions using Framer Motion
- Theme-aware background colors

### Container Component

A utility component for consistent content width and padding:

```jsx
<Container maxWidth="7xl">
  {/* Content */}
</Container>
```

**Props:**
- `maxWidth`: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full"
- `className`: Additional CSS classes

**Responsive Padding:**
- Mobile: `px-4`
- Tablet: `px-6` (sm breakpoint)
- Desktop: `px-8` (lg breakpoint)

### Section Component

A utility component for consistent section styling:

```jsx
<Section 
  backgroundColor="primary" 
  padding="default"
  maxWidth="7xl"
>
  {/* Section content */}
</Section>
```

**Props:**
- `backgroundColor`: "primary" | "secondary" | "tertiary"
- `padding`: "none" | "small" | "default" | "large"
- `maxWidth`: Same as Container
- `className`: Additional CSS classes

## Page Transitions

All page transitions are handled automatically by the Layout component using Framer Motion.

**Transition Behavior:**
- **Fade + Slide**: Pages fade in/out while sliding horizontally
- **Mode**: "wait" - waits for exit animation before entering
- **Duration**: 0.4 seconds
- **Easing**: "anticipate" for smooth, natural motion

**Animation Variants:**
```javascript
{
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}
```

## Theme System

### Light/Dark Mode

The application uses CSS custom properties for theming, managed by `DarkModeContext`.

**Theme Variables:**
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--color-primary`, `--color-secondary`, `--color-tertiary`
- `--border-primary`, `--border-secondary`

**Theme Toggle:**
- Accessible via Navbar
- Persists in localStorage
- Applies to entire application instantly

### Utility Classes

Pre-defined Tailwind utilities for theme colors:
- `.bg-theme-primary`, `.bg-theme-secondary`, `.bg-theme-tertiary`
- `.text-theme-primary`, `.text-theme-secondary`, `.text-theme-tertiary`
- `.border-theme-primary`, `.border-theme-secondary`

## Responsive Design

### Breakpoints

The application uses Tailwind's default breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Container Max Widths

- **7xl** (default): 1280px - Used for main content
- **2xl**: 1536px - For wider layouts
- **xl**: 1280px
- **lg**: 1024px
- **md**: 768px
- **sm**: 640px
- **full**: 100% width

## File Structure

```
frontend/src/
├── components/
│   ├── Layout/          # Root layout component
│   ├── Container/       # Container utility
│   ├── Section/         # Section utility
│   ├── Navbar/          # Header navigation
│   ├── Footer/          # Footer component
│   └── ...              # Other components
├── Pages/
│   ├── Root.jsx         # Root wrapper with DarkModeProvider
│   ├── Home.jsx         # Home page
│   └── About.jsx        # Example page
├── Routes/
│   └── Routes.jsx       # React Router configuration
├── context/
│   └── DarkModeContext.jsx  # Theme management
└── utils/
    └── animations.js    # Framer Motion variants
```

## Creating New Pages

1. **Create Page Component:**
```jsx
// Pages/NewPage.jsx
const NewPage = () => {
  return (
    <div className="min-h-[60vh] py-16">
      <Container>
        {/* Page content */}
      </Container>
    </div>
  );
};
```

2. **Add Route:**
```jsx
// Routes/Routes.jsx
{
  path: "new-page",
  Component: NewPage,
}
```

3. **Page Transitions:** Automatically handled by Layout

## Best Practices

1. **Use Container Component:**
   - Always wrap page content in `<Container>` for consistent spacing
   - Use appropriate `maxWidth` for content type

2. **Use Section Component:**
   - For distinct content sections
   - Provides consistent padding and background colors

3. **Theme Colors:**
   - Always use CSS variables or utility classes
   - Never hardcode colors

4. **Responsive Design:**
   - Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
   - Test on multiple screen sizes

5. **Page Structure:**
   - Keep pages focused on content
   - Layout concerns handled by Layout component
   - No need to include Navbar/Footer in pages

## Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation supported
- Focus states visible
- Semantic HTML structure

## Performance

- Page transitions optimized with Framer Motion
- CSS transitions for theme changes
- Lazy loading ready (can be added for routes)
- Minimal re-renders with proper React patterns
