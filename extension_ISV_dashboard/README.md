# Developer Dashboard Extension

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Architecture & Technology Stack](#architecture--technology-stack)
4. [API Endpoints & Interactions](#api-endpoints--interactions)
5. [Component Structure](#component-structure)
6. [Data Flow & State Management](#data-flow--state-management)
7. [Setup & Installation](#setup--installation)
8. [Development Guide](#development-guide)
9. [Build & Deployment](#build--deployment)

---

## Project Overview

The **Developer Dashboard Extension** is an AppDirect UI Extension that provides a comprehensive dashboard for managing developer companies and their products within the AppDirect marketplace. This extension enables marketplace administrators to view, search, and manage developer companies and their associated products across staging and production catalogs.

### Key Capabilities

- **Company Management**: View all developer companies with detailed information
- **Product Catalog Management**: View products in both staging and production catalogs
- **Dual View Modes**: Toggle between grouped and flat list views
- **Company Details**: Detailed view of company information and products
- **Product Details**: Comprehensive product information with editions and pricing
- **Catalog Filtering**: Filter products by staging or production catalog
- **Search & Sort**: Filter companies by UUID and sort by name or product count

---

## Features

### Dashboard View

- **Default View**: Flat list view showing all companies in a table format
- **View Toggle**: Switch between "Grouped by Company" and "Flat List" views
- **Company Information Display**:
  - Company Name
  - Company UUID
  - Company Status (Enabled/Disabled/Pending)
  - Created Date
  - Staging Products Count (clickable when > 0)
  - Production Products Count (clickable when > 0)
- **Filtering**: Filter companies by UUID
- **Sorting**: Sort by company name (A-Z, Z-A) or product count (High to Low, Low to High)

### Company Details Page

- **Company Information**: Name, UUID, Status, Created Date
- **Product Counts**: Display counts for staging and production catalogs
- **Catalog Filter**: Toggle between staging and production products
- **Product List**: Display products with filtering by catalog type
- **Back Navigation**: Back button to return to previous page

### Product Details Page

- **Product Information**: Name, UUID, Type, Status (from version field)
- **Catalog Badge**: Visual indicator for production or staging
- **Product Details**: Description, website link, publisher information
- **Editions & Pricing**: Detailed pricing information for each edition
- **Categories**: Product categories
- **Publication History**: Timeline of publication events
- **Back Navigation**: Back button to return to previous page

---

## Architecture & Technology Stack

### Technology Stack

- **React 18.2.0**: Core UI framework
- **TypeScript**: Type-safe development
- **Mantine UI 7.4.1**: Modern component library for UI/UX
- **React Query (TanStack Query) 4.29.5**: Data fetching, caching, and state management
- **React Router DOM 7.9.5**: Client-side routing
- **React Intl 6.2.8**: Internationalization support
- **GraphQL**: For querying marketplace data
- **Webpack 5**: Module bundling with Module Federation for micro-frontend architecture
- **Jest**: Unit testing framework

### Architecture Pattern

This extension follows the **Micro-Frontend Architecture** pattern using Webpack Module Federation:

- **Host Application**: AppDirect Marketplace (loads the extension)
- **Remote Application**: This Developer Dashboard extension
- **Module Federation**: Enables the extension to be loaded dynamically into the marketplace

### Project Structure

```
developer_dashboard_extension/
├── src/
│   ├── components/          # React components
│   │   ├── App/             # Main app component with routing
│   │   ├── Breadcrumbs/     # Navigation breadcrumbs
│   │   ├── CompanyCard/     # Company card for grouped view
│   │   ├── ProductCard/     # Product card component
│   │   ├── ProductTable/    # Product table component
│   │   ├── ViewToggle/      # View mode toggle
│   │   └── ...
│   ├── pages/               # Page components
│   │   ├── Dashboard/      # Main dashboard page
│   │   ├── CompanyView/     # Company details page
│   │   └── ProductDetail/   # Product details page
│   ├── hooks/               # Custom React hooks
│   │   ├── useCompanies.ts         # Fetch companies
│   │   ├── useProducts.ts           # Fetch products for a company
│   │   ├── useAllProducts.ts        # Fetch all products for all companies
│   │   ├── useProductDetails.ts     # Fetch detailed product information
│   │   └── useMarketplaceContext.ts # Marketplace context access
│   ├── services/            # API services
│   │   └── marketplaceApi.ts        # GraphQL API interactions
│   ├── utils/               # Utility functions
│   │   ├── constants.ts             # Application constants
│   │   └── formatters.ts            # Data formatting utilities
│   ├── providers/           # Context providers
│   │   ├── MantineProvider/         # Mantine UI theme provider
│   │   └── MarketplaceContextProvider.tsx # Marketplace data provider
│   └── translations/        # i18n translation files
│       └── en.json
├── static/                  # Static assets
├── webpack.config.js        # Webpack configuration
└── package.json             # Dependencies and scripts
```

---

## API Endpoints & Interactions

### GraphQL API

All API interactions use the AppDirect GraphQL API endpoint:

**Base Endpoint**: `POST /api/graphql/preview`

**Authentication**: Uses cookies (`credentials: "include"`)

### GraphQL Queries

#### 1. Fetch Developer Companies

**Query**: `GetDeveloperCompanies`

**Purpose**: Fetch all companies (accounts) in the marketplace

**GraphQL Query**:
```graphql
query GetDeveloperCompanies($first: Int, $after: String) {
  accounts(first: $first, after: $after) {
    nodes {
      id
      name
      createdOn
      status
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Variables**:
```json
{
  "first": 50
}
```

**Response Structure**:
```json
{
  "data": {
    "accounts": {
      "nodes": [
        {
          "id": "company-uuid-123",
          "name": "Example Company",
          "createdOn": "2024-01-15T10:30:00Z",
          "status": "ACTIVE"
        }
      ],
      "pageInfo": {
        "hasNextPage": false,
        "endCursor": null
      }
    }
  }
}
```

**Implementation**: `src/services/marketplaceApi.ts` → `fetchDeveloperCompanies()`

**Mapping**:
- `Account.id` → `Company.uuid`
- `Account.createdOn` → `Company.createdDate`
- `Account.status` → `Company.status`

---

#### 2. Fetch Company Products

**Query**: `GetCompanyProducts`

**Purpose**: Fetch products for a specific company, filtered by catalog type (PRODUCTION or STAGING)

**GraphQL Query**:
```graphql
query GetCompanyProducts($first: Int) {
  products(first: $first) {
    nodes {
      id
      version
      type
      vendorId
      vendorName {
        value
      }
      name {
        locale
        value
      }
      description {
        locale
        value
      }
      linkToProductWebsite {
        locale
        value
      }
      listingLogo {
        url
      }
      editions {
        id
        code
        name {
          locale
          value
        }
        pricing {
          pricingPlans {
            costs {
              itemPrices {
                prices {
                  amount
                  currency
                }
              }
              status
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Variables**:
```json
{
  "first": 50
}
```

**Filtering Logic**:
- Products are filtered client-side by:
  - `vendorId` matching the company UUID
  - `version` matching catalog type:
    - `version = "PUBLISHED"` → PRODUCTION catalog
    - `version = "WORKING"` → STAGING catalog

**Response Structure**:
```json
{
  "data": {
    "products": {
      "nodes": [
        {
          "id": "product-uuid-123",
          "version": "PUBLISHED",
          "type": "APPLICATION",
          "vendorId": "company-uuid-123",
          "vendorName": {
            "value": "Example Company"
          },
          "name": {
            "locale": "en-US",
            "value": "Example Product"
          },
          "description": {
            "locale": "en-US",
            "value": "Product description"
          },
          "listingLogo": {
            "url": "https://example.com/logo.png"
          },
          "editions": []
        }
      ],
      "pageInfo": {
        "hasNextPage": false,
        "endCursor": null
      }
    }
  }
}
```

**Implementation**: `src/services/marketplaceApi.ts` → `fetchCompanyProducts()`

**Catalog Mapping**:
- `version: "PUBLISHED"` → `catalog: "PRODUCTION"`
- `version: "WORKING"` → `catalog: "STAGING"`

---

#### 3. Fetch All Company Products

**Function**: `fetchAllCompanyProducts()`

**Purpose**: Fetch products from both PRODUCTION and STAGING catalogs for a company

**Implementation**: 
- Calls `fetchCompanyProducts()` twice in parallel (once for PRODUCTION, once for STAGING)
- Merges results and handles products that exist in both catalogs
- Returns a unified array with `catalogs` field indicating which catalogs each product belongs to

**Response Structure**:
```typescript
Product[] // Array of products with catalogs field
```

**Example**:
```json
[
  {
    "uuid": "product-123",
    "name": "Product Name",
    "catalogs": ["PRODUCTION", "STAGING"], // Product in both catalogs
    "version": "PUBLISHED"
  },
  {
    "uuid": "product-456",
    "name": "Another Product",
    "catalogs": ["STAGING"], // Product only in staging
    "version": "WORKING"
  }
]
```

---

#### 4. Fetch Product Details

**Query**: `GetProductDetails`

**Purpose**: Fetch detailed information for a specific product

**GraphQL Query**:
```graphql
query GetProductDetails($productId: ID!) {
  product(id: $productId) {
    id
    version
    name {
      locale
      value
    }
    description {
      locale
      value
    }
    type
    linkToProductWebsite {
      locale
      value
    }
    listingLogo {
      url
    }
    vendor {
      id
      name
    }
    editions {
      id
      code
      name {
        locale
        value
      }
      pricing {
        pricingPlans {
          costs {
            itemPrices {
              prices {
                amount
                currency
              }
            }
          }
        }
      }
    }
  }
}
```

**Variables**:
```json
{
  "productId": "product-uuid-123"
}
```

**Implementation**: `src/services/marketplaceApi.ts` → `fetchProductDetails()`

---

### API Data Transformations

#### LocalizedString Handling

AppDirect GraphQL API uses `LocalizedString` arrays for multilingual content:

```typescript
{
  name: [
    { locale: "en-US", value: "Product Name" },
    { locale: "fr-FR", value: "Nom du produit" }
  ]
}
```

**Extraction Function**: `extractLocalizedText()`
- Finds the best match for the current locale
- Falls back to first entry if locale not found
- Returns the `value` field from the matched `LocalizedString`

#### Version to Catalog Mapping

**Function**: `getCatalogFromVersion()`

**Mapping**:
- `version: "PUBLISHED"` → `catalog: "PRODUCTION"`
- `version: "WORKING"` → `catalog: "STAGING"`
- Unknown → `catalog: "UNKNOWN"`

#### Version to Status Display

**Function**: `formatProductStatus()`

**Mapping**:
- `version: "PUBLISHED"` → Display: `"PUBLISHED"`
- `version: "WORKING"` → Display: `"WORKING"`
- Unknown → Display: `"Unknown"`

**Color Mapping** (`getProductStatusColor()`):
- `"PUBLISHED"` → Green badge
- `"WORKING"` → Yellow badge
- Unknown → Gray badge

---

## Component Structure

### Page Components

#### 1. Dashboard (`src/pages/Dashboard/index.tsx`)

**Responsibilities**:
- Main landing page for the extension
- Displays list of companies
- Handles view mode switching (Grouped vs Flat List)
- Manages filtering and sorting
- Calculates product counts per company

**State Management**:
- `viewMode`: Current view mode (GROUPED or FLAT_LIST)
- `sortBy`: Sort option (name_asc, name_desc, products_asc, products_desc)
- `uuidFilter`: UUID filter string

**Data Hooks**:
- `useCompanies()`: Fetch all companies
- `useAllProducts()`: Fetch all products for all companies

**Key Features**:
- Default view: Flat List
- Product count calculation per catalog type
- Clickable product counts (when > 0) navigate to company details with catalog filter
- Sorting and filtering capabilities

---

#### 2. CompanyView (`src/pages/CompanyView/index.tsx`)

**Responsibilities**:
- Display company details
- Show products filtered by catalog type
- Handle catalog filter from URL parameters
- Display product counts for each catalog

**State Management**:
- `catalogFilter`: Current catalog filter (PRODUCTION or STAGING)
- Reads from URL query parameter `?catalog=STAGING` or `?catalog=PRODUCTION`

**Data Hooks**:
- `useCompanies()`: Fetch companies to find current company
- `useProducts(companyId)`: Fetch products for the company

**Key Features**:
- Back button navigation
- Catalog filter toggle (Production/Staging)
- Product count badges
- Product list with filtering

---

#### 3. ProductDetail (`src/pages/ProductDetail/index.tsx`)

**Responsibilities**:
- Display comprehensive product information
- Show product editions and pricing
- Display publication history
- Show product categories

**Data Hooks**:
- `useProductDetails(productId)`: Fetch detailed product information
- `useCompanies()`: Fetch companies to find product vendor

**Key Features**:
- Back button navigation
- Product status from version field
- Catalog badge display
- Editions and pricing table
- Publication history timeline

---

### Reusable Components

#### ProductCard (`src/components/ProductCard/index.tsx`)

**Props**:
- `product`: Product object
- `companyName?`: Optional company name

**Displays**:
- Product name and logo
- Catalog badge
- Product UUID
- Company name
- Description
- Product type, status, and dates
- Publisher information

**Features**:
- Clickable card navigates to product details
- Status badge based on version field
- Responsive design

---

#### ProductTable (`src/components/ProductTable/index.tsx`)

**Props**:
- `products`: Array of products
- `companies`: Array of companies

**Displays**:
- Table with columns: Company, Product Name, Description, Status, Catalog, Last Published, Publisher
- Clickable rows navigate to product details

**Features**:
- Status from version field
- Catalog badge display
- Formatted dates and publisher information

---

#### ViewToggle (`src/components/ViewToggle/index.tsx`)

**Props**:
- `value`: Current view mode
- `onChange`: Callback function

**Features**:
- Segmented control with color state
- Two options: "Grouped by Company" and "Flat List"

---

## Data Flow & State Management

### React Query (TanStack Query) Architecture

**Purpose**: Centralized data fetching, caching, and state management

**Query Keys**:
- `["developerCompanies"]`: All companies
- `["companyProducts", companyUuid]`: Products for a specific company
- `["productDetails", productId]`: Detailed product information

**Cache Configuration**:
- Automatic caching and refetching
- Stale time management
- Error handling

### Data Flow Diagram

```
User Action
    ↓
Component Event Handler
    ↓
React Hook (useQuery)
    ↓
API Service (marketplaceApi.ts)
    ↓
GraphQL Query Execution
    ↓
API Response
    ↓
Data Transformation
    ↓
React Query Cache Update
    ↓
Component Re-render with New Data
```

### State Management Layers

1. **Component State** (useState):
   - UI state (view mode, filters, sort options)
   - Form values
   - Local component state

2. **Server State** (React Query):
   - Company data from API
   - Product data from API
   - Automatic caching and refetching

3. **URL State** (React Router):
   - Current route
   - Query parameters (catalog filter)
   - Navigation state

4. **Context** (MarketplaceContext):
   - Marketplace configuration
   - User information
   - Locale settings

---

## Setup & Installation

### Prerequisites

- **Node.js**: ^20.0.0
- **npm**: ^10.0.0

### Installation Steps

1. **Navigate to the extension directory**:
```bash
cd /path/to/developer_dashboard_extension
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
- Start on port 7230 (configured in `webpack.config.js`)
- Print query parameters to add to a page
- Enable hot module replacement
- Proxy API requests to the marketplace domain

**Access the extension**:
- Add the query parameters from the console to a test environment or local development with micro container
- Format: `?devMode=true&appName=extension_developer_dashboard_extension`

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
   - Add to `src/services/marketplaceApi.ts`
   - Use GraphQL queries
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
- **Comments**: Keep comments minimal and meaningful
- **No Console Logs**: Remove all console.log/error/warn for production

### API Integration Patterns

**GraphQL Query Pattern**:
```typescript
const query = `
  query MyQuery($variable: String!) {
    field(variable: $variable) {
      subField
    }
  }
`;

const data = await executeGraphQLQuery(query, { variable: "value" });
```

**React Query Hook Pattern**:
```typescript
export function useMyData() {
  return useQuery({
    queryKey: ["myData"],
    queryFn: fetchMyData,
  });
}
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
- `dist/extension_developer_dashboard_extension_{version}_{timestamp}.zip`: Deployment package

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

## Key Technical Decisions

### 1. GraphQL API Usage

**Decision**: Use GraphQL API instead of REST API

**Rationale**:
- AppDirect provides comprehensive GraphQL API
- Single endpoint for all queries
- Flexible query structure
- Better type safety

### 2. Client-Side Filtering

**Decision**: Filter products client-side after fetching

**Rationale**:
- GraphQL API doesn't support complex filtering
- Allows for flexible filtering logic
- Better user experience with instant results

### 3. Version-Based Catalog Mapping

**Decision**: Map product version to catalog type

**Rationale**:
- `version: "PUBLISHED"` indicates production catalog
- `version: "WORKING"` indicates staging catalog
- Clear separation between catalogs

### 4. React Query for State Management

**Decision**: Use React Query instead of Redux or Context API

**Rationale**:
- Built-in caching and refetching
- Automatic loading/error states
- Reduces boilerplate code
- Optimized for server state

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

1. **GraphQL Query Errors**:
   - Verify query structure matches AppDirect schema
   - Check field names and types
   - Review GraphQL documentation: https://developer.appdirect.com/graphql-docs/product.doc

2. **Authentication Errors**:
   - Check cookies are included (`credentials: "include"`)
   - Verify user has proper permissions
   - Check marketplace context is loaded

3. **Products Not Loading**:
   - Verify company UUID is correct
   - Check vendorId matches company UUID
   - Review version field (PUBLISHED vs WORKING)

4. **Catalog Filter Not Working**:
   - Check URL query parameter format
   - Verify catalog type matches (PRODUCTION or STAGING)
   - Review product version mapping

5. **Status Not Displaying**:
   - Verify product has version field
   - Check version value (PUBLISHED or WORKING)
   - Review status formatter function

---

## Additional Resources

- **AppDirect UI Extensions Documentation**: [AppDirect Developer Portal]
- **AppDirect GraphQL Documentation**: https://developer.appdirect.com/graphql-docs/product.doc
- **Mantine UI Components**: https://mantine.dev/
- **React Query Documentation**: https://tanstack.com/query/latest
- **Webpack Module Federation**: https://webpack.js.org/concepts/module-federation/

---

## Version History

- **v0.0.23** (Current): Production-ready version
  - Flat list view as default
  - Product status from version field
  - Clickable product counts
  - Back button navigation
  - Catalog filtering
  - Comprehensive product details

---

## Support & Contribution

For issues, questions, or contributions, please refer to the repository or contact the development team.

---

**Last Updated**: November 2024
