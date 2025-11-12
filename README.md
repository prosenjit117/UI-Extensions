# Company Management Portal - UI Extension

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [API Endpoints & Interactions](#api-endpoints--interactions)
4. [Component Structure](#component-structure)
5. [Data Flow & State Management](#data-flow--state-management)
6. [Features & Functionality](#features--functionality)
7. [Setup & Installation](#setup--installation)
8. [Development Guide](#development-guide)
9. [Build & Deployment](#build--deployment)

---

## Project Overview

The **Company Management Portal** is an AppDirect UI Extension that provides a comprehensive dashboard for managing companies within the AppDirect marketplace. This extension enables marketplace administrators to view, search, sort, filter, and update company information with a modern, accessible user interface.

### Key Capabilities

- **Company List Management**: Paginated display of all companies with high-level information
- **Advanced Search**: Search companies by External ID, Name, or UUID
- **Company Details**: Expandable view showing complete company information
- **Company Updates**: Edit company name and external ID with change history tracking
- **Membership Management**: View company members and their roles, with admin highlighting
- **Sorting & Filtering**: Client-side sorting and filtering by multiple criteria
- **Change History**: Client-side tracking of all changes to company name and external ID

---

## Architecture & Technology Stack

### Technology Stack

- **React 18.2.0**: Core UI framework
- **TypeScript**: Type-safe development
- **Mantine UI 7.4.1**: Modern component library for UI/UX
- **React Query (TanStack Query) 4.29.5**: Data fetching, caching, and state management
- **React Intl 6.2.8**: Internationalization support
- **GraphQL**: For searching companies by external ID
- **Webpack 5**: Module bundling with Module Federation for micro-frontend architecture
- **Jest**: Unit testing framework

### Architecture Pattern

This extension follows the **Micro-Frontend Architecture** pattern using Webpack Module Federation:

- **Host Application**: AppDirect Marketplace (loads the extension)
- **Remote Application**: This Company Management Portal extension
- **Module Federation**: Enables the extension to be loaded dynamically into the marketplace

### Project Structure

```
Company_Management_Portal/
├── src/
│   ├── components/          # React components
│   │   ├── CompanyDashboard/    # Main dashboard orchestrator
│   │   ├── CompanyList/          # Company list display
│   │   ├── CompanyDetail/        # Company details panel
│   │   ├── CompanyEditForm/      # Edit form for company updates
│   │   ├── CompanySearch/        # Search input component
│   │   ├── CompanySortFilter/    # Sorting and filtering controls
│   │   ├── CompanyChangeHistory/ # Change history timeline
│   │   └── CompanyMemberships/   # Membership display
│   ├── hooks/               # Custom React hooks
│   │   ├── useCompanies.ts           # Fetch paginated company list
│   │   ├── useCompanySearch.ts       # Search companies
│   │   ├── useCompanyUpdate.ts       # Update company mutation
│   │   ├── useCompanyMemberships.ts  # Fetch company memberships
│   │   └── useMarketplaceContext.ts  # Marketplace context access
│   ├── functions/           # Utility functions
│   │   ├── companyApi.ts                # REST API interactions
│   │   ├── companyChangeHistoryService.ts # LocalStorage history management
│   │   └── serviceAuthToken.tsx         # Authentication utilities
│   ├── providers/           # Context providers
│   │   ├── MantineProvider/     # Mantine UI theme provider
│   │   └── MarketplaceContextProvider.tsx # Marketplace data provider
│   ├── translations/        # i18n translation files
│   │   └── en.json
│   └── index.tsx            # Entry point
├── static/                  # Static assets
├── webpack.config.js        # Webpack configuration
└── package.json             # Dependencies and scripts
```

---

## API Endpoints & Interactions

### REST API Endpoints

#### 1. Get Companies List (Paginated)

**Endpoint**: `GET /api/account/v2/companies`

**Query Parameters**:
- `page` (number): Page number (0-based index)
- `size` (number): Number of items per page (default: 20)

**Request Example**:
```http
GET /api/account/v2/companies?page=0&size=20
Headers:
  Content-Type: application/json
  Credentials: include (cookies)
```

**Response Structure**:
```json
{
  "links": [],
  "content": [
    {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "companyId": 12345,
      "name": "Example Company",
      "externalId": "EXT-123",
      "enabled": true,
      "allowLogin": true,
      "status": "ACTIVE",
      "creationDate": 1609459200000,
      "address": {
        "street1": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94105",
        "country": "US"
      },
      "emailAddress": "contact@example.com",
      "website": "https://example.com",
      "phoneNumber": "+1-555-123-4567"
    }
  ],
  "page": {
    "size": 20,
    "totalElements": 150,
    "totalPages": 8,
    "number": 0
  }
}
```

**Implementation**: `src/hooks/useCompanies.ts`
- Uses React Query for caching and state management
- Cache time: 5 minutes
- Stale time: 30 seconds

---

#### 2. Get Company by UUID

**Endpoint**: `GET /api/account/v2/companies/{companyUuid}`

**Path Parameters**:
- `companyUuid` (string): Company UUID

**Request Example**:
```http
GET /api/account/v2/companies/550e8400-e29b-41d4-a716-446655440000
Headers:
  Content-Type: application/json
  Credentials: include
```

**Response**: Same structure as individual company object in the list endpoint

**Implementation**: `src/functions/companyApi.ts` → `fetchCompanyById()`

**Usage**:
- Used when expanding company details
- Used after GraphQL search to fetch full company details
- Used when searching by UUID directly

---

#### 3. Update Company

**Endpoint**: `PATCH /api/account/v2/companies/{companyUuid}`

**Path Parameters**:
- `companyUuid` (string): Company UUID

**Request Body**:
```json
{
  "name": "Updated Company Name",
  "externalId": "NEW-EXT-123"
}
```

**Note**: To clear `externalId`, send `null`:
```json
{
  "externalId": null
}
```

**Request Example**:
```http
PATCH /api/account/v2/companies/550e8400-e29b-41d4-a716-446655440000
Headers:
  Content-Type: application/json
  X-CSRF-Token: <csrf-token>
  X-XSRF-TOKEN: <csrf-token>
  Credentials: include
Body:
  {
    "name": "Updated Company Name",
    "externalId": "NEW-EXT-123"
  }
```

**CSRF Token Handling**:
- Extracted from `<meta name="csrf-token">` tag in HTML
- Fallback: Extracted from cookies (`csrf-token` or `XSRF-TOKEN`)
- Implementation: `src/functions/companyApi.ts` → `getCsrfToken()`

**Response**: Updated company object

**Implementation**: 
- `src/functions/companyApi.ts` → `updateCompany()`
- `src/hooks/useCompanyUpdate.ts` → Mutation hook with change history tracking

**Post-Update Actions**:
1. Save change history to localStorage
2. Invalidate React Query cache for companies and search
3. Update local cache with new company data

---

#### 4. Get Company Memberships

**Endpoint**: `GET /api/account/v2/companies/{companyUuid}/memberships`

**Path Parameters**:
- `companyUuid` (string): Company UUID

**Request Example**:
```http
GET /api/account/v2/companies/550e8400-e29b-41d4-a716-446655440000/memberships
Headers:
  Content-Type: application/json
  Credentials: include
```

**Response Structure**:
```json
{
  "links": [],
  "content": [
    {
      "user": {
        "uuid": "user-uuid-123",
        "email": "user@example.com",
        "userName": "jdoe",
        "firstName": "John",
        "lastName": "Doe",
        "activated": true,
        "allowLogin": true,
        "creationDate": 1609459200000,
        "externalId": "USER-123",
        "roles": ["ROLE_SYS_ADMIN", "ROLE_USER"]
      },
      "company": {
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "companyId": 12345,
        "name": "Example Company"
      },
      "enabled": true,
      "roles": ["ROLE_SYS_ADMIN", "ROLE_USER"]
    }
  ],
  "page": {
    "size": 20,
    "totalElements": 5,
    "totalPages": 1,
    "number": 0
  }
}
```

**Implementation**: `src/hooks/useCompanyMemberships.ts`

**Special Handling**:
- Users with `ROLE_SYS_ADMIN` are highlighted as "Company Admins"
- Other users are displayed as "Members"
- Status badges show "Activated/Not Activated" and "Enabled/Disabled"

---

### GraphQL API Endpoint

#### Search Company by External ID

**Endpoint**: `POST /api/graphql/preview`

**Query**:
```graphql
query SearchCompanyByExternalId($externalId: String!) {
  accountByExternalId(externalId: $externalId) {
    name
    id
    externalId
    idpId
    status
    tenant
    website
    vanityUrl
    createdOn
    countryCode
    contactPhoneNumber
    contactEmail
    companySize
    accountMemberships {
      nodes {
        roles
        status
        user {
          email
          firstName
          lastName
        }
      }
    }
  }
}
```

**Variables**:
```json
{
  "externalId": "EXT-123"
}
```

**Request Example**:
```http
POST /api/graphql/preview
Headers:
  Content-Type: application/json
  Credentials: include
Body:
  {
    "query": "query SearchCompanyByExternalId($externalId: String!) { ... }",
    "variables": {
      "externalId": "EXT-123"
    }
  }
```

**Response Structure**:
```json
{
  "data": {
    "accountByExternalId": {
      "name": "Example Company",
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "externalId": "EXT-123",
      "status": "ACTIVE",
      "createdOn": "2021-01-01T00:00:00Z"
    }
  }
}
```

**Implementation**: `src/hooks/useCompanySearch.ts`

**Search Flow**:
1. GraphQL query returns company UUID (`id` field)
2. Use UUID to fetch full company details via REST API (`GET /api/account/v2/companies/{uuid}`)
3. Return complete company object with all fields

---

## Component Structure

### 1. CompanyDashboard (Main Orchestrator)

**Location**: `src/components/CompanyDashboard/index.tsx`

**Responsibilities**:
- Orchestrates all dashboard functionality
- Manages search state and pagination
- Handles sorting and filtering logic
- Coordinates data fetching from multiple hooks
- Renders layout and error states

**State Management**:
- `searchTerm`: Current search query
- `showSearchResults`: Whether to display search results or paginated list
- `currentPage`: Current page number (1-based)
- `sortField`: Field to sort by (name, status, externalId, created)
- `sortDirection`: Sort direction (asc, desc)
- `statusFilter`: Filter by status (all, active, inactive)

**Data Hooks Used**:
- `useCompanies(page, size)`: Fetch paginated company list
- `useCompanySearch(term)`: Search companies

**Key Functions**:
- `sortAndFilterCompanies()`: Client-side sorting and filtering
- `handleSearchChange()`: Update search and reset pagination
- `handlePageChange()`: Navigate between pages
- `handleSortChange()`: Update sort criteria
- `handleStatusFilterChange()`: Update status filter

---

### 2. CompanyList

**Location**: `src/components/CompanyList/index.tsx`

**Responsibilities**:
- Display companies in accordion format
- Show collapsed state with key information (UUID, creation date)
- Expand to show full details via `CompanyDetail` component
- Handle loading and empty states

**Props**:
- `companies`: Array of company objects
- `isLoading`: Loading state
- `isSearching`: Whether currently searching

**Collapsed State Displays**:
- Company name
- Full UUID
- Creation date (human-readable format with "Created:" label)
- Status badge

---

### 3. CompanyDetail

**Location**: `src/components/CompanyDetail/index.tsx`

**Responsibilities**:
- Display complete company information
- Integrate `CompanyEditForm` for updates
- Display `CompanyChangeHistory` timeline
- Display `CompanyMemberships` panel
- Manage expand/collapse for history and memberships sections

**Sections**:
1. **Company Information**: Name, UUID, External ID, Status, Creation Date, Contact Info
2. **Edit Form**: Collapsible form to update name and external ID
3. **Change History**: Timeline of all changes (collapsible, expanded by default)
4. **Memberships**: List of company members (collapsible, collapsed by default)

**State**:
- `historyExpanded`: Whether change history is visible (default: true)
- `membershipsExpanded`: Whether memberships are visible (default: false)

---

### 4. CompanyEditForm

**Location**: `src/components/CompanyEditForm/index.tsx`

**Responsibilities**:
- Form for updating company name and external ID
- Validation and error handling
- Submit updates via `useCompanyUpdate` hook
- Dynamic placeholder text based on field state

**Form Fields**:
- **Company Name**: Required text input
- **External ID**: Optional text input (can be cleared by leaving blank)

**Validation**:
- Name: Required, non-empty
- External ID: Optional, can be empty (sends `null` to API)

**Dynamic Placeholder**:
- External ID: 
  - If blank: "Add External Identifier for the company"
  - If has value: "Enter external ID (optional)"

**Update Flow**:
1. User submits form
2. `useCompanyUpdate` mutation is called
3. On success:
   - Change history is saved to localStorage
   - React Query cache is invalidated
   - Form resets with new values

---

### 5. CompanySearch

**Location**: `src/components/CompanySearch/index.tsx`

**Responsibilities**:
- Search input with debouncing
- Triggers search via `useCompanySearch` hook
- Placeholder: "Search by External ID, Name, or UUID"

**Debouncing**:
- 500ms delay to reduce API calls
- Implementation: `useDebouncedValue` from Mantine hooks

**Search Intelligence** (in `useCompanySearch`):
1. **UUID Detection**: If search term matches UUID pattern → Direct REST API call
2. **External ID**: If alphanumeric and ≤50 chars → GraphQL + REST API
3. **Name Search**: Otherwise → Fetch 100 companies and filter client-side

---

### 6. CompanySortFilter

**Location**: `src/components/CompanySortFilter/index.tsx`

**Responsibilities**:
- UI controls for sorting and filtering
- Sort by: Name, Status, External ID, Created Date
- Sort direction: Ascending/Descending
- Filter by: All, Active Only, Inactive Only

**Sort Options**:
- **Name**: Alphabetical (A-Z or Z-A)
- **Status**: Active/Inactive status
- **External ID**: Numeric or alphabetical comparison
- **Created**: Date comparison (oldest/newest first)

**Filter Options**:
- **All**: Show all companies
- **Active**: Companies with status "ACTIVE" or "ENABLED"
- **Inactive**: Companies with status "DISABLED" or not enabled

---

### 7. CompanyChangeHistory

**Location**: `src/components/CompanyChangeHistory/index.tsx`

**Responsibilities**:
- Display change history timeline
- Show field name, old/new values, user email, timestamp
- Uses Mantine `Timeline` component

**Data Source**: `localStorage` via `companyChangeHistoryService`

**History Entry Structure**:
```typescript
{
  field: "name" | "externalId",
  oldValue: string | null,
  newValue: string | null,
  changedBy: string,  // User email
  changedAt: number,  // Timestamp
  companyUuid: string
}
```

**Storage**:
- Key format: `company_history_{companyUuid}`
- Limited to 100 entries per company
- Sorted by timestamp (newest first)

---

### 8. CompanyMemberships

**Location**: `src/components/CompanyMemberships/index.tsx`

**Responsibilities**:
- Display company members and their roles
- Separate "Company Admins" (ROLE_SYS_ADMIN) from "Members"
- Show user details: name, email, roles, activation status
- Display enabled/disabled status with clear labels

**Data Source**: `useCompanyMemberships` hook

**Sections**:
1. **Company Admins**: Users with `ROLE_SYS_ADMIN` role
2. **Members**: All other users

**Status Display**:
- **Activated**: Green badge with checkmark
- **Not Activated**: Gray badge with X
- **Enabled**: Blue badge
- **Disabled**: Red badge

---

## Data Flow & State Management

### React Query (TanStack Query) Architecture

**Purpose**: Centralized data fetching, caching, and state management

**Query Keys**:
- `["companies", page, size]`: Paginated company list
- `["companySearch", searchTerm]`: Search results
- `["companyMemberships", companyUuid]`: Company memberships
- `["company", uuid]`: Individual company cache

**Cache Configuration**:
- **Stale Time**: 30 seconds (data considered fresh)
- **Cache Time**: 5 minutes (data kept in cache after unmount)

**Cache Invalidation**:
- After company update: Invalidates `["companies"]` and `["companySearch"]`
- Ensures UI reflects latest data

### Data Flow Diagram

```
User Action
    ↓
Component Event Handler
    ↓
React Hook (useQuery/useMutation)
    ↓
API Function (companyApi.ts)
    ↓
HTTP Request (fetch/GraphQL)
    ↓
API Response
    ↓
React Query Cache Update
    ↓
Component Re-render with New Data
```

### State Management Layers

1. **Component State** (useState):
   - UI state (expanded/collapsed, form values)
   - Search term, pagination, sort/filter options

2. **Server State** (React Query):
   - Company data from API
   - Automatic caching and refetching
   - Optimistic updates

3. **Local Storage** (localStorage):
   - Change history (client-side only)
   - Persists across sessions

4. **Context** (MarketplaceContext):
   - Marketplace configuration
   - User information
   - Locale settings

---

## Features & Functionality

### 1. Paginated Company List

- **Page Size**: 20 companies per page
- **Pagination Controls**: 
  - Page numbers with navigation
  - First/Last page buttons
  - Previous/Next buttons
  - Total count badge
  - "Page X of Y" indicator

### 2. Advanced Search

**Search Capabilities**:
- **By External ID**: Uses GraphQL to find UUID, then REST API for full details
- **By Company Name**: Fetches 100 companies, filters client-side
- **By UUID**: Direct REST API call

**Search Experience**:
- Debounced input (500ms)
- Loading spinner during search
- Results badge showing count
- "Searching..." indicator

### 3. Sorting & Filtering

**Sort Options**:
- Company Name (A-Z / Z-A)
- Status (Active/Inactive)
- External ID (Sequential Asc/Desc)
- Created Date (Asc/Desc)

**Filter Options**:
- All Companies
- Active Only
- Inactive Only

**Implementation**: Client-side sorting and filtering for instant results

### 4. Company Details View

**Information Displayed**:
- Company Name
- UUID (full display)
- External ID
- Status
- Creation Date (human-readable)
- Contact Information (email, phone, website)
- Address Details

**Collapsible Sections**:
- Edit Form
- Change History (expanded by default)
- Memberships (collapsed by default)

### 5. Company Updates

**Editable Fields**:
- Company Name
- External ID (can be cleared)

**Update Process**:
1. User edits form
2. Validation occurs
3. PATCH request sent with CSRF token
4. Change history saved to localStorage
5. Cache invalidated
6. UI updates with new data

**Change History Tracking**:
- Tracks only `name` and `externalId` changes
- Records user email from `window.dataStore` or `window.bootstrapData`
- Stores timestamp
- Limited to 100 entries per company

### 6. Membership Management

**Features**:
- View all company members
- Highlight company admins (ROLE_SYS_ADMIN)
- Display user roles
- Show activation and enabled status
- Clear status labels (not just icons)

**Data Source**: REST API endpoint for memberships

### 7. Change History Timeline

**Display**:
- Timeline format using Mantine Timeline component
- Shows field name, old value, new value
- Displays user email who made the change
- Human-readable timestamps
- Sorted by date (newest first)

**Storage**: Client-side only (localStorage)

---

## Setup & Installation

### Prerequisites

- **Node.js**: ^20.0.0
- **npm**: ^10.0.0

### Installation Steps

1. **Clone the repository**:
```bash
git clone https://github.com/prosenjit117/UI-Extensions.git
cd UI-Extensions/extension_Company_Management_Portal
```

2. **Install dependencies**:
```bash
npm install
```

3. **Run setup** (if needed):
```bash
npm run setup
```

### Development

**Start development server**:
```bash
npm run start
```

The webpack dev server will:
- Start on port 3555 (or configured port)
- Print query parameters to add to a page
- Enable hot module replacement
- Proxy API requests to the marketplace domain

**Access the extension**:
- Add the query parameters from the console to a test environment or local development with micro container

### Testing

**Run unit tests**:
```bash
npm test
```

**Run tests in watch mode**:
```bash
npm run test:watch
```

**Linting**:
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

---

## Development Guide

### Adding a New Feature

1. **Create Component** (if needed):
   - Add to `src/components/`
   - Follow existing component patterns
   - Use Mantine components for UI

2. **Create Hook** (if needed):
   - Add to `src/hooks/`
   - Use React Query for data fetching
   - Follow naming convention: `use[FeatureName].ts`

3. **Add API Function** (if needed):
   - Add to `src/functions/companyApi.ts` or create new file
   - Handle CSRF tokens for mutations
   - Include error handling

4. **Add Translations**:
   - Update `src/translations/en.json`
   - Use `FormattedMessage` component for i18n

5. **Update Types**:
   - Add TypeScript interfaces as needed
   - Export types from relevant files

### Code Style Guidelines

- **TypeScript**: Use strict typing, avoid `any` when possible
- **React**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **File Structure**: One component per folder with `index.tsx`
- **Comments**: Remove unnecessary comments for production
- **Console Logs**: Remove all console.log/error/warn for production

### API Integration Patterns

**REST API Pattern**:
```typescript
const fetchData = async (): Promise<Data> => {
  const response = await fetch('/api/endpoint', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`Failed: ${response.statusText}`);
  }
  
  return response.json();
};
```

**GraphQL Pattern**:
```typescript
import { request, gql } from 'graphql-request';

const query = gql`
  query MyQuery($variable: String!) {
    field(variable: $variable) {
      subField
    }
  }
`;

const data = await request('/api/graphql/preview', query, { variable: 'value' });
```

**Mutation Pattern** (with CSRF):
```typescript
const updateData = async (params: UpdateParams) => {
  const csrfToken = getCsrfToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
    headers['X-XSRF-TOKEN'] = csrfToken;
  }
  
  const response = await fetch('/api/endpoint', {
    method: 'PATCH',
    credentials: 'include',
    headers,
    body: JSON.stringify(params),
  });
  
  return response.json();
};
```

---

## Build & Deployment

### Production Build

**Build the extension**:
```bash
npm run build
```

This command:
1. Runs webpack in production mode
2. Bundles and minifies code
3. Creates `build/` directory with assets
4. Generates ZIP file in `dist/` directory

**Output**:
- `build/`: Webpack bundle output
- `dist/extension_Company_Management_Portal_{version}_{timestamp}.zip`: Deployment package

### Deployment Package

The ZIP file contains:
- `remoteEntry.js`: Module Federation entry point
- Bundle files (`.bundle.js`)
- Static assets (images, configs)
- License files

### Upload to AppDirect

1. Navigate to AppDirect Admin Portal
2. Go to UI Extensions section
3. Upload the ZIP file from `dist/` directory
4. Configure extension settings
5. Deploy to marketplace

### Environment Configuration

**Development**:
- Uses `static/app-dev-config.json` for local development
- Webpack dev server proxies API requests

**Production**:
- Extension runs within AppDirect marketplace
- Uses marketplace's API endpoints
- Accesses marketplace context via `useMarketplaceContext()`

---

## API Interaction Summary

### Complete API Flow

#### 1. Initial Page Load
```
CompanyDashboard Component
  ↓
useCompanies(page=0, size=20)
  ↓
GET /api/account/v2/companies?page=0&size=20
  ↓
Response: { content: [...], page: {...} }
  ↓
React Query Cache
  ↓
CompanyList Component renders companies
```

#### 2. Search by External ID
```
User types "EXT-123" in search
  ↓
CompanySearch component (debounced 500ms)
  ↓
useCompanySearch("EXT-123")
  ↓
Detects: alphanumeric, ≤50 chars → External ID search
  ↓
POST /api/graphql/preview
  Query: accountByExternalId(externalId: "EXT-123")
  ↓
Response: { accountByExternalId: { id: "uuid-123", ... } }
  ↓
Extract UUID from response.id
  ↓
GET /api/account/v2/companies/uuid-123
  ↓
Response: Full company object
  ↓
Display in CompanyList
```

#### 3. Search by UUID
```
User types UUID in search
  ↓
useCompanySearch detects UUID pattern
  ↓
Direct call: GET /api/account/v2/companies/{uuid}
  ↓
Response: Company object
  ↓
Display in CompanyList
```

#### 4. Search by Name
```
User types company name
  ↓
useCompanySearch detects name search
  ↓
GET /api/account/v2/companies?page=0&size=100
  ↓
Response: Array of 100 companies
  ↓
Client-side filter: companies.filter(c => c.name.includes(searchTerm))
  ↓
Display filtered results
```

#### 5. Update Company
```
User edits form in CompanyEditForm
  ↓
Form submission
  ↓
useCompanyUpdate mutation
  ↓
Extract CSRF token (meta tag or cookie)
  ↓
PATCH /api/account/v2/companies/{uuid}
  Headers: X-CSRF-Token, X-XSRF-TOKEN
  Body: { name: "...", externalId: "..." }
  ↓
Response: Updated company object
  ↓
saveChangeHistoryBatch() → localStorage
  ↓
Invalidate React Query cache
  ↓
UI updates with new data
```

#### 6. View Company Details
```
User expands company in CompanyList
  ↓
CompanyDetail component renders
  ↓
useCompanyMemberships(companyUuid) (if expanded)
  ↓
GET /api/account/v2/companies/{uuid}/memberships
  ↓
Response: { content: [memberships...] }
  ↓
Display members with role highlighting
```

#### 7. View Change History
```
User expands Change History section
  ↓
CompanyChangeHistory component
  ↓
getChangeHistory(companyUuid)
  ↓
Read from localStorage: company_history_{uuid}
  ↓
Parse JSON and sort by timestamp
  ↓
Display in Timeline component
```

---

## Key Technical Decisions

### 1. Client-Side Change History

**Decision**: Store change history in localStorage instead of API

**Rationale**:
- No API endpoint available for change history
- Client-side storage provides immediate feedback
- Reduces server load
- History persists across sessions

**Limitations**:
- History is browser-specific (not shared across devices)
- Limited to 100 entries per company
- Lost if localStorage is cleared

### 2. Hybrid Search Approach

**Decision**: Use different APIs based on search term type

**Rationale**:
- GraphQL for external ID (efficient lookup)
- Direct REST for UUID (fastest path)
- Client-side filtering for names (no dedicated name search API)

**Benefits**:
- Optimized API usage
- Fast response times
- Flexible search capabilities

### 3. Client-Side Sorting/Filtering

**Decision**: Sort and filter on client-side instead of API

**Rationale**:
- Instant results (no API delay)
- Works with search results
- Reduces API calls
- Simpler implementation

**Trade-offs**:
- Limited to loaded data (20 per page or search results)
- May not scale for very large datasets

### 4. React Query for State Management

**Decision**: Use React Query instead of Redux or Context API

**Rationale**:
- Built-in caching and refetching
- Automatic loading/error states
- Optimistic updates support
- Reduces boilerplate code

### 5. Module Federation Architecture

**Decision**: Use Webpack Module Federation for micro-frontend

**Rationale**:
- Enables extension to load dynamically
- Isolated development and deployment
- Shared dependencies with host
- Follows AppDirect UI Extension pattern

---

## Troubleshooting

### Common Issues

1. **CSRF Token Errors**:
   - Ensure meta tag `<meta name="csrf-token" content="...">` exists
   - Check cookies for `csrf-token` or `XSRF-TOKEN`
   - Verify token is included in PATCH request headers

2. **API 401/403 Errors**:
   - Check authentication cookies are included (`credentials: 'include'`)
   - Verify user has proper permissions
   - Check marketplace context is loaded

3. **Search Not Working**:
   - Verify GraphQL endpoint is accessible
   - Check search term format (UUID vs External ID vs Name)
   - Review browser console for errors

4. **Change History Not Showing**:
   - Check localStorage is enabled
   - Verify `window.dataStore` or `window.bootstrapData` has user email
   - Check browser storage limits

5. **Memberships Not Loading**:
   - Verify company UUID is valid
   - Check API endpoint permissions
   - Review network tab for API errors

---

## Additional Resources

- **AppDirect UI Extensions Documentation**: [AppDirect Developer Portal]
- **Mantine UI Components**: https://mantine.dev/
- **React Query Documentation**: https://tanstack.com/query/latest
- **Webpack Module Federation**: https://webpack.js.org/concepts/module-federation/

---

## Version History

- **v0.0.23** (Current): Production-ready version with all features
  - Pagination, search, sort, filter
  - Change history tracking
  - Membership management
  - Production code cleanup

---

## Support & Contribution

For issues, questions, or contributions, please refer to the repository:
https://github.com/prosenjit117/UI-Extensions

---

**Last Updated**: November 2024
