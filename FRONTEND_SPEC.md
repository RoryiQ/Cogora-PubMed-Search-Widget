# PubMed Widget - Frontend Specification

## Overview

A clean, embeddable search widget for querying PubMed medical literature. Focus on usability and quick scanning of results.

---

## Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** CSS Modules or Tailwind CSS
- **Icons:** Lucide React
- **HTTP Client:** Fetch API / Axios

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Thumbnails | None | PubMed doesn't provide images; use icons + tags instead |
| Visual Hierarchy | Lucide icons + color-coded tags | Quick visual scanning |
| Rating/Score | Relevance score badge | Help users prioritize results |
| Rate Limit | 1 request/sec/user | Stay within free tier (3 req/sec) |

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                            [? Help]     │
│  PubMed Search · AI-Powered                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🔍  Search medical literature...                    [Search]│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Filters:                                                    │ │
│  │ [Date Range ▼] [Article Type ▼] [Sort ▼] [☐ Free Text Only]│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 💡 AI INSIGHTS                                              │ │
│  │ "Found 847 results. Key themes: insulin resistance,        │ │
│  │  metabolic syndrome, lifestyle intervention..."            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Found 847 results                                    Grid | List│
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📄  [92%] Clinical Trial                                  │  │
│  │                                                           │  │
│  │ Effects of Metformin on Glycemic Control in Type 2...    │  │
│  │                                                           │  │
│  │ Smith J, Johnson M, Williams K · Journal of Medicine     │  │
│  │ Jan 2024 · DOI: 10.1000/example                          │  │
│  │                                                           │  │
│  │ "AI Summary: This randomized controlled trial found..."  │  │
│  │                                                           │  │
│  │ [Diabetes] [Metformin] [RCT] [Free Full Text]            │  │
│  │                                                 [+ Save]  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📄  [87%] Review                                          │  │
│  │ ...                                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📄  [85%] Meta-Analysis                                   │  │
│  │ ...                                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│            [← Prev]  1  2  3  ...  42  [Next →]                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Header
Simple, minimal header with branding.

```
Props: none (or logo URL if customizable)

Elements:
- Logo/Title: "PubMed Search"
- Subtitle: "AI-Powered" (small, muted)
- Help icon (optional tooltip or modal)
```

**Lucide Icons:** `HelpCircle`

---

### 2. SearchBar

```
Props:
- onSearch(query: string)
- isLoading: boolean
- placeholder?: string

Elements:
- Search icon (left)
- Text input
- Clear button (when text present)
- Search button (right)

Behavior:
- Debounce: 500ms after typing stops
- Enter key triggers search
- Loading state disables input
```

**Lucide Icons:** `Search`, `X`, `Loader2` (spinning)

---

### 3. FilterBar

```
Props:
- filters: FilterState
- onFilterChange(filters: FilterState)

FilterState:
{
  dateRange: 'all' | 'week' | 'month' | 'year' | '5years' | 'custom'
  customDateFrom?: string
  customDateTo?: string
  articleType: string[]  // multi-select
  sortBy: 'relevance' | 'date_desc' | 'date_asc'
  freeFullTextOnly: boolean
  language: 'all' | 'english'
}
```

**Filter Options:**

| Filter | Type | Options |
|--------|------|---------|
| Date Range | Dropdown | All Time, Last Week, Last Month, Last Year, Last 5 Years, Custom |
| Article Type | Multi-select | Clinical Trial, Review, Systematic Review, Meta-Analysis, Case Report, Journal Article |
| Sort By | Dropdown | Most Relevant, Newest First, Oldest First |
| Free Full Text | Checkbox | Toggle |
| Language | Dropdown | All, English Only |

**Lucide Icons:** `Calendar`, `FileText`, `ArrowUpDown`, `Filter`, `ChevronDown`

---

### 4. AIInsightsPanel

```
Props:
- insights: {
    summary: string
    themes: string[]
    suggestedQueries?: string[]
  } | null
- isLoading: boolean

States:
- Loading: Skeleton with pulse animation
- Loaded: Display insights
- Empty: Hidden or minimal state
```

**Lucide Icons:** `Lightbulb`, `Sparkles`, `Brain`

---

### 5. ResultCard

The main component. Each card represents one PubMed article.

```
Props:
- article: {
    pmid: string
    title: string
    authors: Author[]
    journal: string
    pubDate: string
    abstract: string
    aiSummary?: string
    doi?: string
    pmcId?: string
    hasFullText: boolean
    meshTerms: string[]
    keywords: string[]
    pubTypes: string[]
    relevanceScore: number  // 0-100
  }
- onSave(pmid: string)
- onExpand(pmid: string)
- isExpanded: boolean
- isSaved: boolean
```

**Card Anatomy:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [Icon] [Score Badge] [Article Type Tag]                   │
│                                                             │
│  Title of the Article Goes Here and Can Wrap to            │
│  Multiple Lines If Needed...                                │
│                                                             │
│  👤 Smith J, Johnson M, +3 more                            │
│  📰 Journal of Medicine · Jan 2024                         │
│  🔗 DOI: 10.1000/example                                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💬 "This study demonstrates that metformin..."      │   │
│  │    [Expand ▼]                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Tag] [Tag] [Tag] [+2 more]              [📥 Save]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Lucide Icons by Element:**

| Element | Icon | Notes |
|---------|------|-------|
| Article indicator | `FileText` | Default article icon |
| Clinical Trial | `FlaskConical` | Science/experiment |
| Review | `BookOpen` | Reading/review |
| Meta-Analysis | `BarChart3` | Data analysis |
| Case Report | `User` | Individual case |
| Authors | `Users` | Multiple people |
| Journal | `Newspaper` | Publication |
| DOI Link | `ExternalLink` | External link |
| Full Text Available | `FileCheck` | Green, available |
| Summary | `MessageSquare` | AI quote |
| Expand | `ChevronDown` / `ChevronUp` | Toggle |
| Save | `Plus` or `Bookmark` | Add to collection |
| Saved | `Check` or `BookmarkCheck` | Confirmed |

---

### 6. RelevanceScore

Visual badge showing article relevance (0-100%).

```
Props:
- score: number (0-100)
- size?: 'sm' | 'md'

Visual:
- 90-100%: Green, "Excellent match"
- 70-89%: Blue, "Good match"
- 50-69%: Yellow, "Partial match"
- <50%: Gray, "Low match"

Display: "[92%]" or circular progress
```

---

### 7. TagList

Displays MeSH terms, keywords, and article type tags.

```
Props:
- tags: Tag[]
- maxVisible?: number (default 4)
- onTagClick?(tag: string)

Tag Types (color coded):
- meshTerm: Blue
- keyword: Purple
- pubType: Green
- freeFullText: Orange (special)
```

---

### 8. Pagination

```
Props:
- currentPage: number
- totalPages: number
- totalResults: number
- pageSize: number
- onPageChange(page: number)

Display:
- "Showing 1-20 of 847 results"
- Page numbers with ellipsis
- Prev/Next arrows
```

**Lucide Icons:** `ChevronLeft`, `ChevronRight`

---

### 9. ResultsHeader

```
Props:
- totalResults: number
- viewMode: 'grid' | 'list'
- onViewModeChange(mode)

Elements:
- Results count
- View toggle (grid/list icons)
```

**Lucide Icons:** `LayoutGrid`, `List`

---

### 10. EmptyState

```
Props:
- type: 'initial' | 'no-results' | 'error'
- message?: string
- onRetry?()

Variants:
- Initial: "Search millions of medical publications"
- No Results: "No articles found. Try different keywords."
- Error: "Something went wrong. Please try again."
```

**Lucide Icons:** `Search`, `FileQuestion`, `AlertCircle`

---

### 11. LoadingState

```
Props:
- type: 'search' | 'ai'

Variants:
- Search: Skeleton cards (3-6)
- AI: Pulsing brain icon with "Analyzing results..."
```

**Lucide Icons:** `Loader2` (spinning), `Brain`

---

## Color Palette

```css
:root {
  /* Primary */
  --color-primary: #2563eb;        /* Blue 600 */
  --color-primary-hover: #1d4ed8;  /* Blue 700 */

  /* Semantic */
  --color-success: #16a34a;        /* Green 600 */
  --color-warning: #ca8a04;        /* Yellow 600 */
  --color-error: #dc2626;          /* Red 600 */

  /* Score Colors */
  --score-excellent: #16a34a;      /* Green */
  --score-good: #2563eb;           /* Blue */
  --score-partial: #ca8a04;        /* Yellow */
  --score-low: #6b7280;            /* Gray */

  /* Tags */
  --tag-mesh: #dbeafe;             /* Blue 100 */
  --tag-mesh-text: #1e40af;        /* Blue 800 */
  --tag-keyword: #f3e8ff;          /* Purple 100 */
  --tag-keyword-text: #6b21a8;     /* Purple 800 */
  --tag-pubtype: #dcfce7;          /* Green 100 */
  --tag-pubtype-text: #166534;     /* Green 800 */
  --tag-fulltext: #ffedd5;         /* Orange 100 */
  --tag-fulltext-text: #9a3412;    /* Orange 800 */

  /* Neutrals */
  --color-bg: #ffffff;
  --color-bg-secondary: #f9fafb;   /* Gray 50 */
  --color-border: #e5e7eb;         /* Gray 200 */
  --color-text: #111827;           /* Gray 900 */
  --color-text-secondary: #6b7280; /* Gray 500 */
  --color-text-muted: #9ca3af;     /* Gray 400 */
}
```

---

## Typography

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
}
```

---

## Spacing & Layout

```css
:root {
  /* Spacing scale */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */

  /* Container */
  --max-width: 1200px;
  --container-padding: var(--space-4);

  /* Cards */
  --card-padding: var(--space-4);
  --card-radius: 0.5rem;
  --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
  --card-shadow-hover: 0 4px 12px rgba(0,0,0,0.15);
}
```

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

**Layout Changes:**
- Mobile: Single column, stacked filters
- Tablet (768px+): Filters inline, cards wider
- Desktop (1024px+): Max-width container, comfortable spacing

---

## States & Interactions

### Button States
- Default → Hover → Active → Disabled
- Loading state with spinner

### Card States
- Default
- Hover (slight lift + shadow)
- Expanded (full abstract visible)
- Saved (checkmark, muted save button)

### Input States
- Default → Focus → Error → Disabled

### Transitions
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

---

## Accessibility

- All interactive elements keyboard accessible
- Focus visible outlines
- ARIA labels on icon-only buttons
- Color contrast ratio ≥ 4.5:1
- Screen reader announcements for loading/results

---

## Component Tree

```
<App>
  <Header />
  <main>
    <SearchBar />
    <FilterBar />
    <AIInsightsPanel />
    <ResultsHeader />
    <ResultsList>
      <ResultCard />
      <ResultCard />
      ...
    </ResultsList>
    <Pagination />
  </main>
</App>
```

---

## Mock Data for Development

```javascript
const mockArticle = {
  pmid: "38123456",
  title: "Effects of High-Intensity Interval Training on Glycemic Control in Adults with Type 2 Diabetes: A Randomized Controlled Trial",
  authors: [
    { name: "Smith J", affiliation: "Harvard Medical School" },
    { name: "Johnson M", affiliation: "Mayo Clinic" },
    { name: "Williams K", affiliation: "Stanford University" },
  ],
  journal: "Journal of Clinical Endocrinology",
  journalAbbrev: "J Clin Endocrinol",
  pubDate: "2024-01-15",
  abstract: "Background: High-intensity interval training (HIIT) has emerged as a time-efficient exercise modality. Objective: To evaluate the effects of HIIT compared to moderate-intensity continuous training (MICT) on glycemic control in adults with type 2 diabetes. Methods: We conducted a 12-week randomized controlled trial... Results: HIIT significantly improved HbA1c levels compared to MICT... Conclusion: HIIT represents an effective and time-efficient exercise strategy for improving glycemic control.",
  aiSummary: "This 12-week RCT found that high-intensity interval training improved HbA1c levels more effectively than traditional moderate exercise in type 2 diabetes patients.",
  doi: "10.1210/jc.2024-00123",
  pmcId: "PMC10234567",
  hasFullText: true,
  meshTerms: ["Diabetes Mellitus, Type 2", "Exercise", "Glycemic Control", "High-Intensity Interval Training"],
  keywords: ["HIIT", "diabetes", "exercise intervention", "metabolic health"],
  pubTypes: ["Randomized Controlled Trial", "Journal Article"],
  relevanceScore: 94
};
```

---

## Next Steps

1. Initialize React + Vite project
2. Install dependencies (lucide-react, etc.)
3. Set up CSS variables / design tokens
4. Build components bottom-up:
   - Tags, Score badge (atoms)
   - ResultCard (molecule)
   - SearchBar, FilterBar (molecules)
   - Results list, Pagination (organisms)
   - Full page layout
5. Add mock data and interactions
6. Connect to backend API
