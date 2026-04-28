# Frontend Redesign Plan - FAANG-Grade SaaS CRM

## Goals
Transform the existing functional CRM frontend into a visually stunning, production-ready SaaS product that rivals Salesforce, HubSpot, and Notion in UX quality.

## New Dependencies
- `react-hot-toast` - Toast notifications
- `framer-motion` - Animations & transitions
- `react-beautiful-dnd` - Better Kanban drag/drop

## Design System

### Colors
- **Primary**: Indigo-600 → Violet-600 (modern purple tint)
- **Surface**: White (light) / Slate-900 (dark)
- **Text**: Slate-900 (light) / Slate-100 (dark)
- **Muted**: Slate-500
- **Border**: Slate-200 (light) / Slate-700 (dark)
- **Success**: Emerald-500
- **Warning**: Amber-500
- **Danger**: Rose-500

### Typography
- Headings: Inter, font-semibold
- Body: Inter, font-normal
- Labels: Inter, font-medium, uppercase, tracking-wide

### Spacing
- Base unit: 4px
- Card padding: 24px
- Section gap: 24px
- Input height: 40px
- Border radius: 8px (cards), 6px (inputs), 9999px (badges/pills)

### Shadows
- Card: `shadow-sm shadow-slate-200/50`
- Elevated: `shadow-lg shadow-slate-200/50`
- Hover: `shadow-md`

## Component Architecture

```
components/
  ui/                     # Atomic design system
    Button.tsx
    Input.tsx
    Select.tsx
    Card.tsx
    Badge.tsx
    Avatar.tsx
    Skeleton.tsx
    Modal.tsx
    Toast.tsx
    EmptyState.tsx
    Tooltip.tsx
  layout/
    Layout.tsx            # Main layout wrapper
    Sidebar.tsx           # Collapsible sidebar
    Header.tsx            # Top bar with search/user
    MobileNav.tsx         # Mobile bottom nav
  dashboard/
    KpiCard.tsx           # Stat card with sparkline
    ChartCard.tsx         # Chart wrapper
    ActivityFeed.tsx      # Recent activity list
  kanban/
    KanbanBoard.tsx       # Main DnD board
    KanbanColumn.tsx      # Status column
    KanbanCard.tsx        # Draggable lead card
  leads/
    LeadTable.tsx         # Data table
    LeadFilters.tsx       # Filter bar
    LeadModal.tsx         # Add/Edit lead modal
    LeadDetail.tsx        # Lead detail view
  common/
    PageHeader.tsx        # Page title + actions
    StatusBadge.tsx       # Status pill
    ScoreBadge.tsx        # AI score indicator
    SearchInput.tsx       # Debounced search
```

## Page Improvements

### Login/Register
- Split-screen design (image + form)
- Animated gradient background
- Floating labels
- Password strength indicator
- Social login buttons (UI only)

### Dashboard
- 4 large KPI cards with trend indicators
- Bar chart: Pipeline distribution (modern styling)
- Line chart: Leads over time (area fill)
- Pie/Donut chart: Lead sources
- Activity feed with avatars
- "Quick Actions" floating button

### Pipeline (Kanban)
- React Beautiful DnD for smooth drag/drop
- Column headers with count + value
- Card: name, company, score badge, estimated value
- Ghost preview while dragging
- Smooth spring animations
- "Add Lead" quick button per column

### Leads
- Full data table with sorting
- Search with debounce
- Status/source filters
- Pagination
- Bulk select + actions
- Column visibility toggle
- Export button (UI)
- Lead detail slide-over panel

### Activities
- Timeline with vertical line
- Activity type icons with color coding
- Grouped by date
- Filter by type
- Quick add floating button

## State Management
- Keep Zustand for auth
- Add theme store (light/dark)
- React Query for server state

## Animations
- Page transitions: fade + slide up
- Card hover: subtle lift + shadow
- Button hover: scale + color shift
- Modal: scale from center + backdrop fade
- Toast: slide in from top-right
- Skeleton: shimmer pulse
- Kanban: spring physics on drag

## Dark Mode
- CSS custom properties for all colors
- `dark:` Tailwind prefix
- Toggle in header with sun/moon icon
- Persist preference in localStorage

## Responsive
- Desktop: Full sidebar + main content
- Tablet: Collapsed sidebar + main content
- Mobile: Bottom nav + full-width content
- Tables: Horizontal scroll on mobile
- Modals: Full-screen on mobile

