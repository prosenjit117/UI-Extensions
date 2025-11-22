/**
 * Utility functions for formatting data
 */

export function formatDate(dateString?: string): string {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    return dateString;
  }
}

export function formatPublisher(userObject?: {
  name?: string;
  email?: string;
}): string {
  if (!userObject) return "Unknown";

  if (userObject.name) {
    return userObject.name;
  }

  if (userObject.email) {
    return userObject.email;
  }

  return "Unknown";
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export interface CatalogBadge {
  label: string;
  color: string;
}

export function getCatalogBadge(
  catalogType: string | string[] | undefined
): CatalogBadge {
  if (Array.isArray(catalogType)) {
    if (catalogType.length === 2) {
      return { label: "Production & Staging", color: "blue" };
    }
    if (catalogType.includes("PRODUCTION")) {
      return { label: "Production", color: "green" };
    }
    if (catalogType.includes("STAGING")) {
      return { label: "Staging", color: "yellow" };
    }
  }

  if (catalogType === "PRODUCTION") {
    return { label: "Production", color: "green" };
  }

  if (catalogType === "STAGING") {
    return { label: "Staging", color: "yellow" };
  }

  return { label: "Unknown", color: "gray" };
}

/**
 * Format pricing information from the pricing structure
 * pricing.pricingPlans[].costs[].itemPrices[].prices[]
 */
/**
 * Format product version to status display
 * Returns the version value directly (PUBLISHED or WORKING)
 */
export function formatProductStatus(version?: string): string {
  if (!version) return "Unknown";
  
  return version.toUpperCase().trim();
}

/**
 * Get color for product status badge based on version
 */
export function getProductStatusColor(version?: string): string {
  if (!version) return "gray";
  
  const normalizedVersion = version.toUpperCase().trim();
  if (normalizedVersion === "PUBLISHED") {
    return "green"; // Production
  }
  if (normalizedVersion === "WORKING") {
    return "yellow"; // Staging
  }
  
  return "gray";
}

export function formatPricing(
  pricing?: {
    pricingPlans?: Array<{
      costs?: Array<{
        itemPrices?: Array<{
          prices?: Array<{
            amount?: number;
            currency?: string;
          }>;
        }>;
      }>;
    }>;
  }
): string {
  if (!pricing?.pricingPlans || pricing.pricingPlans.length === 0) {
    return "N/A";
  }

  const allPrices: Array<{ amount: number; currency: string }> = [];

  // Collect all prices from all pricing plans
  for (const plan of pricing.pricingPlans) {
    if (plan.costs) {
      for (const cost of plan.costs) {
        if (cost.itemPrices) {
          for (const itemPrice of cost.itemPrices) {
            if (itemPrice.prices && itemPrice.prices.length > 0) {
              for (const price of itemPrice.prices) {
                if (price.amount !== undefined && price.amount !== null) {
                  allPrices.push({
                    amount: price.amount,
                    currency: price.currency || "USD",
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  if (allPrices.length === 0) {
    return "Price on request";
  }

  // If all prices are the same, show single price
  const uniquePrices = Array.from(
    new Map(
      allPrices.map((p) => [
        `${p.amount}-${p.currency}`,
        `${p.currency} ${p.amount.toFixed(2)}`,
      ])
    ).values()
  );

  if (uniquePrices.length === 1) {
    return uniquePrices[0];
  }

  // If multiple prices, show range or first price
  if (uniquePrices.length > 1) {
    const amounts = allPrices.map((p) => p.amount).filter((a) => a !== null && a !== undefined);
    if (amounts.length > 0) {
      const min = Math.min(...amounts);
      const max = Math.max(...amounts);
      const currency = allPrices[0]?.currency || "USD";
      if (min === max) {
        return `${currency} ${min.toFixed(2)}`;
      }
      return `${currency} ${min.toFixed(2)} - ${currency} ${max.toFixed(2)}`;
    }
  }

  return uniquePrices[0] || "Price on request";
}

