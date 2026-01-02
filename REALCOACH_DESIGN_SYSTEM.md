# RealCoach Design System

**Version**: 2.0
**Created**: January 2026
**Status**: Dark Theme - Production Ready

---

## Overview

This design system defines the visual language for RealCoach AI applications. It can be applied to any React/Next.js project using Tailwind CSS.

---

## Color Palette

### Primary Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#121212` / `oklch(0.15 0 0)` | Main page background |
| `--card` | `#1E1E1E` / `oklch(0.18 0 0)` | Card/panel backgrounds |
| `--accent` | `#00FF7F` / `oklch(0.85 0.15 145)` | Primary CTAs, progress, active states |
| `--foreground` | `#FFFFFF` / `oklch(1 0 0)` | Primary text |
| `--muted-foreground` | `#AAAAAA` / `oklch(0.7 0 0)` | Secondary text |
| `--border` | `#333333` / `oklch(0.25 0 0)` | Borders, dividers |

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#121212',
        card: '#1E1E1E',
        accent: '#00FF7F',
        foreground: '#FFFFFF',
        'muted-foreground': '#AAAAAA',
        border: '#333333',
      }
    }
  }
}
```

---

## Typography

### Font Families

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale

| Size | Tailwind Class | Usage |
|------|---------------|-------|
| 32px | `text-3xl` | Page titles |
| 24px | `text-2xl` | Section headers |
| 18px | `text-lg` | Card titles |
| 16px | `text-base` | Body text |
| 14px | `text-sm` | Secondary text |
| 12px | `text-xs` | Metadata |

### Font Weights

| Weight | Tailwind Class | Usage |
|--------|---------------|-------|
| 700 | `font-bold` | Page titles, numbers |
| 600 | `font-semibold` | Card titles |
| 400 | `font-normal` | Body text |

---

## Spacing

### Base Unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `spacing-2` | 8px | Small gaps |
| `spacing-4` | 16px | Standard padding |
| `spacing-6` | 24px | Card padding |
| `spacing-8` | 32px | Section spacing |

---

## Components

### Navigation

**Horizontal Navigation Bar**
- Height: 60px
- Padding: 0 24px
- Logo left, menu items centered/right
- Active state: Green underline (2px)

```tsx
<nav className="h-15 px-6 flex items-center justify-between bg-background border-b border-border">
  <Logo />
  <NavItems items={['Ignition', 'Goals & Actions', 'Business Plan', 'Pipeline', 'Production Dashboard', 'Database']} />
</nav>
```

### Cards

**Default Card**
- Background: `#1E1E1E`
- Border: 1px solid `#333333`
- Border radius: 8px
- Padding: 24px

```tsx
<div className="bg-card border border-border rounded-lg p-6">
  <CardTitle />
  <CardContent />
</div>
```

### Progress Indicators

**Linear Progress Bar**
- Height: 8px
- Background: Dark gray
- Fill: Green (#00FF7F)
- Border radius: 4px

```tsx
<div className="h-2 bg-gray-700 rounded-full overflow-hidden">
  <div className="h-full bg-accent rounded-full" style={{ width: '60%' }} />
</div>
```

**Circular Progress**
- Size: 100px
- Stroke width: 8px
- Color: Green (#00FF7F)

```tsx
<svg className="w-24 h-24 transform -rotate-90">
  <circle cx="48" cy="48" r="40" stroke="#333" strokeWidth="8" fill="none" />
  <circle cx="48" cy="48" r="40" stroke="#00FF7F" strokeWidth="8" fill="none"
    strokeDasharray={`${percent * 2.51} 251`} strokeLinecap="round" />
</svg>
```

### Buttons

**Primary Button**
- Background: Green (#00FF7F)
- Text: Black
- Border radius: 6px
- Padding: 10px 20px

```tsx
<button className="bg-accent text-black font-semibold rounded-md px-5 py-2.5 hover:brightness-110">
  Button Label
</button>
```

**Secondary Button**
- Background: Transparent
- Border: 1px solid #333
- Text: White

```tsx
<button className="border border-border text-foreground rounded-md px-5 py-2.5 hover:bg-card">
  Button Label
</button>
```

### AI Sidebar

**Width**: 320px (desktop)
**Background**: #1A1A1A
**Border**: 1px solid #333 (left side)

```tsx
<aside className="w-80 bg-[#1A1A1A] border-l border-border flex flex-col">
  <Avatar src="/green-star-icon.svg" />
  <ChatMessages />
  <InputField placeholder="Message RealCoach.ai" />
</aside>
```

---

## Layout Patterns

### Standard Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Header (Logo + Horizontal Nav)                             │
├──────────────────────────────────────────┬──────────────────┤
│                                           │                  │
│  Main Content                             │  AI Sidebar       │
│  (flex-1, overflow-y-auto)                │  (w-80, fixed)    │
│                                           │                  │
│                                           │                  │
└───────────────────────────────────────────┴──────────────────┘
```

### Dashboard Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <MetricCard />
  <MetricCard />
  <MetricCard />
  <MetricCard />
</div>
```

---

## Icons

**Primary Icon Set**: Lucide React

**Common Icons**:
- Logo/Brand: Star or compass (green fill)
- Send: Paper plane
- Upload: Upload arrow
- Settings: Gear
- User: Person circle
- Actions: Checkmark, Phone, Mail

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |

**Mobile Behavior**:
- Navigation collapses to hamburger menu
- AI sidebar becomes a slide-over panel
- Cards stack vertically
- Tables scroll horizontally

---

## CSS Variables (Complete)

```css
:root {
  /* Colors */
  --background: oklch(0.15 0 0);
  --card: oklch(0.18 0 0);
  --accent: oklch(0.85 0.15 145);
  --foreground: oklch(1 0 0);
  --muted-foreground: oklch(0.7 0 0);
  --border: oklch(0.25 0 0);

  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
}
```

---

## Animation

### Transitions

```css
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-duration: 150ms;
  transition-timing-function: ease-in-out;
}
```

### Hover States

- Buttons: Brightness +10%
- Cards: Border color change to green
- Links: Underline animation

---

## Accessibility

### Focus States

All interactive elements must have visible focus:
```css
.focus-visible:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### Contrast Ratios

- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum

---

## Usage Example

```tsx
// Complete page example
import { RealCoachLayout } from '@/components/layout/realcoach-layout';
import { MetricCard } from '@/components/ui/metric-card';
import { AISidebar } from '@/components/layout/ai-sidebar';

export default function DashboardPage() {
  return (
    <RealCoachLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard title="Contacts" value="142" />
          <MetricCard title="Active" value="23" />
          <MetricCard title="Today" value="5/5" />
          <MetricCard title="Streak" value="7 days" />
        </div>
      </div>
    </RealCoachLayout>
  );
}
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Jan 2026 | Dark theme system defined |
| 1.0 | Dec 2025 | Initial light theme (deprecated) |
