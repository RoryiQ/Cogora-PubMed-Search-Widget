# PubMed AI Search Widget - Project Brief

## Project Overview

**Project Name:** PubMed AI Search Widget
**Type:** Embeddable Web Widget
**Tech Stack:** React (Frontend) + Node.js (Backend)
**Hosting:** Replit (embedded via iframe/API endpoint)
**Timeline:** 1 day build

### Purpose
Build an AI-assisted search interface for PubMed, the world's largest biomedical literature database (35+ million citations). The widget provides a user-friendly search experience that:
1. Queries PubMed's E-utilities API with traditional search + filters
2. Receives raw JSON results
3. Uses AI (via OpenRouter) to intelligently refine, summarize, and enhance results
4. Displays results in a clean, branded card-based UI
5. Allows users to send articles to an external webhook (Airtable integration)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT WEBSITE                            │
│                   (Embeds widget via iframe)                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PUBMED WIDGET (Replit)                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    React Frontend                            ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  ││
│  │  │ Search Bar   │  │   Filters    │  │   Results Cards  │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                │                                 │
│                                ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Node.js Backend                           ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  ││
│  │  │ PubMed API   │  │  OpenRouter  │  │  Webhook Relay   │  ││
│  │  │   Handler    │  │   Handler    │  │     Handler      │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
┌─────────────┐       ┌─────────────────┐      ┌─────────────┐
│  PubMed     │       │   OpenRouter    │      │   Webhook   │
│  E-utilities│       │   (AI Model)    │      │  (Airtable) │
│     API     │       │                 │      │             │
└─────────────┘       └─────────────────┘      └─────────────┘
```

---

## External APIs

### 1. PubMed E-utilities API (NCBI)

**Base URL:** `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/`

**Key Endpoints:**
| Endpoint | Purpose |
|----------|---------|
| `esearch.fcgi` | Search PubMed, returns list of PMIDs |
| `efetch.fcgi` | Fetch full article records (XML only) |
| `esummary.fcgi` | Fetch document summaries (supports JSON) |

**Authentication:**
- Free API access (no payment required)
- API key recommended (10 req/sec vs 3 req/sec without)
- Register at: https://www.ncbi.nlm.nih.gov/account/
- Include `api_key`, `tool`, and `email` params in requests

**Rate Limits:**
- Without API key: 3 requests/second
- With API key: 10 requests/second
- Max 10,000 records per search

**Key Search Parameters:**
- `term` - Search query (supports field tags like `[ti]`, `[au]`, `[mh]`)
- `retmax` - Number of results (default 20, max 10,000)
- `sort` - Sort by: `relevance`, `pub_date`, `Author`, `JournalName`
- `datetype` - Date type: `pdat` (publication), `edat` (entry)
- `mindate/maxdate` - Date range (YYYY/MM/DD)

**Available Search Filters (Field Tags):**
| Filter | Tag | Example |
|--------|-----|---------|
| Title | `[ti]` | `cancer[ti]` |
| Title/Abstract | `[tiab]` | `diabetes[tiab]` |
| Author | `[au]` | `smith j[au]` |
| Journal | `[ta]` | `lancet[ta]` |
| Publication Type | `[pt]` | `review[pt]`, `clinical trial[pt]` |
| MeSH Terms | `[mh]` | `neoplasms[mh]` |
| Language | `[la]` | `english[la]` |
| Publication Date | `[dp]` | `2024[dp]` |
| Free Full Text | `[sb]` | `free full text[sb]` |

**Article Metadata Available:**
- PMID (unique identifier)
- Title
- Abstract (full text of abstract)
- Authors (names, affiliations, ORCID)
- Journal (name, abbreviation, ISSN)
- Publication Date
- DOI
- PMC ID (if available in PubMed Central)
- MeSH Terms (standardized medical keywords)
- Keywords (author-supplied)
- Publication Type
- Language

**Note:** Full article text NOT available via PubMed API. Only metadata + abstracts. Full text requires PubMed Central (PMC) for Open Access articles.

---

### 2. OpenRouter API

**Base URL:** `https://openrouter.ai/api/v1`

**Purpose:** AI-powered result refinement and summarization

**Use Cases:**
1. Summarize abstracts into digestible snippets
2. Extract key findings from results
3. Re-rank results by relevance to user intent
4. Generate natural language insights
5. Identify patterns across multiple papers

**Authentication:** Bearer token (API key)

---

### 3. Webhook Endpoint (Future - Airtable)

**Purpose:** Send selected articles to external database

**Payload Structure (proposed):**
```json
{
  "pmid": "12345678",
  "title": "Article Title",
  "authors": ["Author 1", "Author 2"],
  "journal": "Journal Name",
  "pubDate": "2024-01-15",
  "doi": "10.1000/example",
  "abstract": "Full abstract text...",
  "url": "https://pubmed.ncbi.nlm.nih.gov/12345678/",
  "savedAt": "2024-01-20T14:30:00Z"
}
```

---

## Frontend Specification

### Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER / BRANDING                        │
│                    (Logo, title, maybe tagline)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      SEARCH BAR                             │ │
│  │  [🔍 Search PubMed...                              ] [GO]   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     FILTER BAR                              │ │
│  │  [Date Range ▼] [Pub Type ▼] [Sort By ▼] [Full Text Only □]│ │
│  │  [More Filters...]                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   AI INSIGHTS PANEL                         │ │
│  │  "Found 1,234 results. Key themes: diabetes management,    │ │
│  │   insulin resistance, lifestyle interventions..."          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   RESULT CARD   │  │   RESULT CARD   │  │   RESULT CARD   │ │
│  │  ┌───────────┐  │  │  ┌───────────┐  │  │  ┌───────────┐  │ │
│  │  │ Thumbnail │  │  │  │ Thumbnail │  │  │  │ Thumbnail │  │ │
│  │  └───────────┘  │  │  └───────────┘  │  │  └───────────┘  │ │
│  │  Title          │  │  Title          │  │  Title          │ │
│  │  Authors        │  │  Authors        │  │  Authors        │ │
│  │  Journal • Date │  │  Journal • Date │  │  Journal • Date │ │
│  │  Description... │  │  Description... │  │  Description... │ │
│  │  [Tags] [Save]  │  │  [Tags] [Save]  │  │  [Tags] [Save]  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   RESULT CARD   │  │   RESULT CARD   │  │   RESULT CARD   │ │
│  │       ...       │  │       ...       │  │       ...       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │               PAGINATION / LOAD MORE                        │ │
│  │           [← Prev]  Page 1 of 50  [Next →]                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Component Breakdown

#### 1. Header Component
- Client branding (logo, colors)
- Widget title
- Optional: Help/info button

#### 2. Search Bar Component
- Text input with placeholder
- Search button
- Optional: Voice search, recent searches dropdown
- Debounced search (wait 300ms after typing stops)

#### 3. Filter Bar Component

**Filters to implement:**

| Filter | Type | Options |
|--------|------|---------|
| Date Range | Dropdown/Date Picker | Last week, Last month, Last year, Last 5 years, Custom range |
| Publication Type | Multi-select dropdown | Clinical Trial, Review, Systematic Review, Meta-Analysis, Case Report, Journal Article |
| Sort By | Dropdown | Relevance, Date (newest), Date (oldest), Author, Journal |
| Full Text Only | Checkbox | Filter to `free full text[sb]` |
| Language | Dropdown | English, All languages |
| Journal | Autocomplete input | Search specific journals |
| Author | Text input | Filter by author name |

**Advanced Filters (collapsible):**
- MeSH Terms (medical subject headings)
- Funding source
- Study type

#### 4. AI Insights Panel
- Summary of search results
- Key themes/topics identified
- Suggested refinements
- Loading state with skeleton/spinner

#### 5. Result Card Component

**Card Elements:**
| Element | Source | Notes |
|---------|--------|-------|
| Thumbnail | Generated/placeholder | PubMed doesn't provide images; use journal logo, abstract word cloud, or placeholder |
| Title | `ArticleTitle` | Truncate with ellipsis if too long |
| Authors | `AuthorList` | Show first 3 + "et al." if more |
| Journal | `Journal/ISOAbbreviation` | Abbreviated journal name |
| Publication Date | `PubDate` | Format: "Jan 2024" or "2024" |
| Description | `Abstract` or AI summary | Truncated, expandable |
| DOI Badge | `ArticleIdList` | Link to full article |
| PMC Badge | `ArticleIdList` | "Free Full Text" if available |
| Tags | `MeshHeadingList` or `KeywordList` | Show 3-5 most relevant |
| Save Button | Action | Sends to webhook |
| Expand Button | Action | Shows full abstract |

**Card States:**
- Default
- Hover (slight elevation)
- Expanded (full abstract visible)
- Saved (visual confirmation)

#### 6. Pagination Component
- Page numbers with current highlighted
- Previous/Next arrows
- Results count ("Showing 1-20 of 1,234")
- Optional: "Load More" infinite scroll

---

### UI/UX Requirements

**Responsive Design:**
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px, 1440px
- Cards: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)

**Loading States:**
- Skeleton loaders for cards
- Spinner for AI processing
- Progress indicator for long searches

**Empty States:**
- No results found
- Initial state (before first search)
- Error state (API failure)

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Sufficient color contrast

**Branding Customization:**
- CSS variables for colors
- Configurable logo
- Font customization

---

## Backend Specification

### API Endpoints

#### `POST /api/search`
Main search endpoint.

**Request:**
```json
{
  "query": "diabetes treatment",
  "filters": {
    "dateRange": "last_year",
    "minDate": "2023-01-01",
    "maxDate": "2024-01-01",
    "pubTypes": ["clinical trial", "review"],
    "sortBy": "relevance",
    "fullTextOnly": false,
    "language": "english"
  },
  "page": 1,
  "pageSize": 20,
  "useAI": true
}
```

**Response:**
```json
{
  "success": true,
  "totalResults": 1234,
  "page": 1,
  "pageSize": 20,
  "results": [
    {
      "pmid": "12345678",
      "title": "Article Title Here",
      "authors": [
        { "name": "Smith J", "affiliation": "Harvard" }
      ],
      "journal": "J Med",
      "journalFull": "Journal of Medicine",
      "pubDate": "2024-01-15",
      "abstract": "Full abstract text...",
      "abstractSummary": "AI-generated 2-sentence summary",
      "doi": "10.1000/example",
      "pmcId": "PMC1234567",
      "hasFullText": true,
      "meshTerms": ["Diabetes Mellitus", "Insulin"],
      "keywords": ["glucose", "metabolism"],
      "pubTypes": ["Clinical Trial"],
      "url": "https://pubmed.ncbi.nlm.nih.gov/12345678/"
    }
  ],
  "aiInsights": {
    "summary": "Key themes across these results include...",
    "themes": ["insulin resistance", "lifestyle interventions"],
    "suggestedFilters": ["Add filter: Randomized Controlled Trial"]
  }
}
```

#### `GET /api/article/:pmid`
Fetch single article details.

#### `POST /api/webhook`
Forward article to external webhook.

**Request:**
```json
{
  "pmid": "12345678",
  "webhookUrl": "https://hooks.airtable.com/...",
  "additionalData": {}
}
```

#### `GET /api/health`
Health check endpoint.

---

### Backend Flow

```
1. Receive search request
       │
       ▼
2. Build PubMed query string
   - Combine search term with field tags
   - Apply filters (date, pub type, etc.)
       │
       ▼
3. Call PubMed ESearch API
   - Get list of PMIDs
   - Get total count
       │
       ▼
4. Call PubMed ESummary/EFetch API
   - Fetch article details for PMIDs
   - Parse XML/JSON response
       │
       ▼
5. Transform data to clean JSON
   - Normalize dates
   - Extract authors
   - Build URLs
       │
       ▼
6. [Optional] Call OpenRouter API
   - Send abstracts for summarization
   - Get insights and themes
       │
       ▼
7. Combine and return response
```

---

## Environment Variables

```env
# PubMed API
PUBMED_API_KEY=your_ncbi_api_key
PUBMED_TOOL_NAME=pubmed_widget
PUBMED_EMAIL=your_email@example.com

# OpenRouter
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_MODEL=anthropic/claude-3-haiku  # or other model

# Webhook
DEFAULT_WEBHOOK_URL=https://hooks.airtable.com/...

# App Config
PORT=3000
NODE_ENV=development
```

---

## File Structure

```
pubmed-widget/
├── client/                     # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── AIInsights.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   ├── ResultGrid.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── LoadingStates/
│   │   │       ├── CardSkeleton.jsx
│   │   │       └── Spinner.jsx
│   │   ├── hooks/
│   │   │   ├── useSearch.js
│   │   │   ├── useFilters.js
│   │   │   └── usePagination.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── variables.css
│   │   │   ├── global.css
│   │   │   └── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── search.js
│   │   │   ├── article.js
│   │   │   └── webhook.js
│   │   ├── services/
│   │   │   ├── pubmed.js       # PubMed API client
│   │   │   ├── openrouter.js   # OpenRouter API client
│   │   │   └── transformer.js  # XML/JSON transformation
│   │   ├── utils/
│   │   │   ├── queryBuilder.js
│   │   │   └── xmlParser.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── .gitignore
├── README.md
├── PROJECT_BRIEF.md            # This file
└── package.json                # Root package.json for scripts
```

---

## Development Phases

### Phase 1: Setup & Basic UI (2-3 hours)
- [ ] Initialize React + Vite project
- [ ] Initialize Node.js + Express server
- [ ] Set up project structure
- [ ] Create basic layout components
- [ ] Implement search bar UI
- [ ] Implement filter bar UI
- [ ] Create result card component (static)
- [ ] Basic CSS styling

### Phase 2: PubMed Integration (2-3 hours)
- [ ] Implement PubMed API client (esearch, esummary)
- [ ] Build query string builder with filters
- [ ] XML/JSON response parsing
- [ ] Data transformation layer
- [ ] Connect frontend to search endpoint
- [ ] Display real results in cards
- [ ] Implement pagination

### Phase 3: AI Enhancement (1-2 hours)
- [ ] Implement OpenRouter API client
- [ ] Abstract summarization pipeline
- [ ] Search insights generation
- [ ] Connect AI results to UI
- [ ] Loading states for AI processing

### Phase 4: Webhook & Polish (1-2 hours)
- [ ] Implement webhook relay endpoint
- [ ] Save button functionality
- [ ] Error handling throughout
- [ ] Loading/empty states
- [ ] Responsive design fixes
- [ ] Final styling polish

### Phase 5: Deployment (30 min)
- [ ] Push to GitHub
- [ ] Deploy to Replit
- [ ] Configure environment variables
- [ ] Test embedded widget
- [ ] Final QA

---

## Success Criteria

1. **Functional Search:** Users can search PubMed and see results
2. **Working Filters:** All filters modify search results correctly
3. **AI Summaries:** Abstracts are summarized intelligently
4. **AI Insights:** Search-level insights are generated
5. **Save to Webhook:** Articles can be sent to external webhook
6. **Responsive:** Works on mobile, tablet, and desktop
7. **Performant:** Search results appear within 2-3 seconds
8. **Embeddable:** Widget can be iframed into client site

---

## Open Questions / Decisions Needed

1. **Thumbnail Strategy:**
   - Option A: Journal logo lookup
   - Option B: Generated abstract word cloud
   - Option C: Generic medical placeholder
   - Option D: First figure from PMC (if available)

2. **AI Model Selection:**
   - Fast & cheap (Claude Haiku, GPT-3.5)
   - Balanced (Claude Sonnet, GPT-4-mini)
   - Quality (Claude Opus, GPT-4)

3. **Branding:**
   - Color scheme?
   - Logo?
   - Font preferences?

4. **Webhook Details:**
   - Specific Airtable fields?
   - Additional metadata to capture?

---

## Resources

- [PubMed E-utilities Documentation](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
- [NCBI API Keys](https://www.ncbi.nlm.nih.gov/account/)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [PubMed Search Field Tags](https://pubmed.ncbi.nlm.nih.gov/help/)
