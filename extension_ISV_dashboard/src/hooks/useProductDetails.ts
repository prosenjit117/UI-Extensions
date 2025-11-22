import { useQuery } from "@tanstack/react-query";
import { fetchProductDetails } from "../services/marketplaceApi";
import type { ProductDetails } from "../services/marketplaceApi";

export function useProductDetails(productUuid: string | undefined) {
  return useQuery<ProductDetails>({
    queryKey: ["productDetails", productUuid],
    queryFn: () => fetchProductDetails(productUuid!),
    enabled: !!productUuid,
  });
}

