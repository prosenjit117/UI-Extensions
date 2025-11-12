import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import companyApi from "../functions/companyApi";
import { Company } from "./useCompanies";
import { saveChangeHistoryBatch } from "../functions/companyChangeHistoryService";

interface UpdateCompanyData {
  uuid: string; // Use uuid for REST API
  name?: string;
  externalId?: string | null; // API uses externalId, null means clear it
  originalName?: string; // For history tracking
  originalExternalId?: string | null; // For history tracking
}

interface UpdateCompanyResponse {
  success: boolean;
  company?: Company;
  data?: any;
  error?: string;
}

const useCompanyUpdate = (): UseMutationResult<
  UpdateCompanyResponse,
  Error,
  UpdateCompanyData
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCompanyData): Promise<UpdateCompanyResponse> => {
      const result = await companyApi.updateCompany(data);
      return {
        success: result.success,
        company: result.data,
        data: result.data,
        error: result.error,
      };
    },
    onSuccess: (response, variables) => {
      const changes: Array<{
        field: "name" | "externalId";
        oldValue: string | null;
        newValue: string | null;
      }> = [];

      if (
        variables.name !== undefined &&
        variables.originalName !== undefined &&
        variables.name !== variables.originalName
      ) {
        changes.push({
          field: "name",
          oldValue: variables.originalName,
          newValue: variables.name,
        });
      }

      if (variables.externalId !== undefined) {
        const oldValue = variables.originalExternalId ?? null;
        const newValue = variables.externalId ?? null;
        
        if (oldValue !== newValue) {
          changes.push({
            field: "externalId",
            oldValue: oldValue,
            newValue: newValue,
          });
        }
      }

      if (changes.length > 0) {
        saveChangeHistoryBatch(variables.uuid, changes);
      }

      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companySearch"] });
      
      if (response.company) {
        queryClient.setQueryData(["company", response.company.id], response.company);
      }
    },
  });
};

export default useCompanyUpdate;
export type { UpdateCompanyData, UpdateCompanyResponse };

