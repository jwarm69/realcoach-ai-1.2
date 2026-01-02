# RealCoach AI Design System

**Version**: 1.0
**Last Updated**: January 2026
**Project**: RealCoach AI 1.2

---

## Color Palette

### Dark Theme Colors (oklch)

| Name | Value | Hex | Usage |
|------|-------|-----|-------|
| background | `oklch(0.15 0 0)` | #121212 | Primary background |
| card | `oklch(0.18 0 0)` | #1E1E1E | Card/surface background |
| accent | `oklch(0.85 0.15 145)` | #00FF7F | Primary actions, active states |
| foreground | `oklch(1 0 0)` | #FFFFFF | Primary text |
| muted-foreground | `oklch(0.7 0 0)` | #AAAAAA | Secondary text |
| border | `oklch(0.25 0 0)` | #333333 | Borders, dividers |

### Usage Examples

```css
/* Background */
background: var(--background);

/* Cards */
background: var(--card);
border: 1px solid var(--border);

/* Text */
color: var(--foreground);
color: var(--muted-foreground);

/* Accent elements */
color: var(--accent);
border-color: var(--accent);
```

---

## Typography

### Font Family
- **Primary**: Inter, system-ui, -apple-system, sans-serif

### Type Scale

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| H1 | 2.5rem | Bold | Page titles |
| H2 | 2rem | Bold | Section headers |
| H3 | 1.5rem | Semibold | Card titles |
| Body | 1rem | Regular | Body text |
| Small | 0.875rem | Regular | Captions, labels |

### Text Colors

| Usage | Color |
|-------|-------|
| Headings | `var(--foreground)` |
| Body text | `var(--muted-foreground)` |
| Links | `var(--accent)` |

---

## Spacing

### Scale (Tailwind default)

| Token | Value | Usage |
|-------|-------|-------|
| 1 | 0.25rem | 4px - Tight spacing |
| 2 | 0.5rem | 8px - Compact |
| 3 | 0.75rem | 12px - Cozy |
| 4 | 1rem | 16px - Default |
| 6 | 1.5rem | 24px - Comfortable |
| 8 | 2rem | 32px - Spacious |

---

## Components

### Button

```tsx
<Button className="bg-accent text-background hover:bg-accent/90">
  Primary Action
</Button>
```

### Card

```tsx
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="text-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Content
  </CardContent>
</Card>
```

### Progress Bar

```tsx
<Progress value={60} className="h-2" />
```

### Progress Circle

```tsx
<ProgressCircle value={75} size={120} />
```

---

## Layout Patterns

### Dashboard Layout

All pages follow this pattern:
1. Horizontal navigation (top)
2. Main content area (left, ~70%)
3. AI sidebar (right, ~30%)

### Layout Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Horizontal Navigation (Logo + 6 menu items)                │
├──────────────────────────────────────────┬──────────────────┤
│  Main Content (Left, ~70%)               │  AI Sidebar       │
│  - Cards, tables, charts                 │  (Right, ~30%)    │
│                                          │  - Avatar         │
│                                          │  - Chat messages  │
│                                          │  - Input field    │
└──────────────────────────────────────────┴──────────────────┘
```

### Navigation Items

1. Ignition (/)
2. Goals & Actions (/goals)
3. Business Plan (/business-plan)
4. Pipeline (/pipeline)
5. Production Dashboard (/production)
6. Database (/database)

---

## Icon Usage

**Icon Library**: lucide-react

**Common Icons**:
- `Sparkle` - AI/RealCoach branding
- `Send` - Submit actions
- `Paperclip` - Attachments
- `Target` - Goals
- `TrendingUp` - Analytics
- `Users` - Contacts
- `CheckCircle` - Completed items
- `Circle` - Incomplete items

---

## Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Ignition | `/` | Main landing with centered AI input |
| Goals & Actions | `/goals` | Yearly GCI targets, daily actions |
| Business Plan | `/business-plan` | 3-column strategic planning |
| Pipeline | `/pipeline` | Lead table with metrics |
| Production Dashboard | `/production` | Goal alignment, revenue chart |
| Database | `/database` | Contact management |

---

## Accessibility

- Focus visible on all interactive elements
- Minimum touch target: 44x44px
- Color contrast: WCAG AA compliant
- Keyboard navigation support
- Semantic HTML elements

---

## Design Tokens

### Colors (CSS Variables)

```css
.dark {
  --background: oklch(0.15 0 0);
  --card: oklch(0.18 0 0);
  --accent: oklch(0.85 0.15 145);
  --foreground: oklch(1 0 0);
  --muted-foreground: oklch(0.7 0 0);
  --border: oklch(0.25 0 0);
}
```

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 0.25rem | Small elements |
| DEFAULT | 0.5rem | Cards, buttons |
| md | 0.75rem | Large cards |
| lg | 1rem | Modals |
| full | 9999px | Pills, badges |

---

## Component Specifications

### Navigation

- Horizontal layout with logo on left
- Menu items with green underline on active
- Hover state: Light gray background
- Active state: Green bottom border (2px)

### AI Sidebar

- Fixed width: 350px
- Avatar with green star icon
- Scrollable messages area
- Input field at bottom
- Send button with paper plane icon

### Metrics Cards

- Dark card background
- White title text
- Gray value text
- Green progress bars
- Circular progress for key metrics

### Table

- Dark header row
- Gray border bottom
- White text for primary content
- Gray text for secondary content
- Green badges for status

---

## Live Deployment

**Production URL**: https://realcoach-9nm7589m9-jwarm69s-projects.vercel.app

---

*RealCoach AI Design System v1.0 | January 2026*
