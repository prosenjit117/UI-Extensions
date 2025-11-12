import { useQuery, UseQueryResult } from "@tanstack/react-query";

export interface MembershipUser {
  uuid: string;
  email: string;
  userName: string;
  firstName: string | null;
  lastName: string | null;
  activated: boolean;
  allowLogin: boolean;
  creationDate: number;
  externalId: string | null;
  roles: string[];
  [key: string]: any;
}

export interface MembershipCompany {
  uuid: string;
  companyId: number;
  name: string;
  [key: string]: any;
}

export interface Membership {
  user: MembershipUser;
  company: MembershipCompany;
  enabled: boolean;
  lastUsed: boolean;
  roles: string[];
  credentialsProfile: any;
  position: string | null;
  metadata: any;
  links: Array<{ rel: string; href: string }>;
}

interface MembershipsResponse {
  links: any[];
  content: Membership[];
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

interface MembershipsData {
  memberships: Membership[];
  pagination: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

const fetchCompanyMemberships = async (
  companyUuid: string
): Promise<MembershipsData> => {
  const response = await fetch(
    `/api/account/v2/companies/${companyUuid}/memberships`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch company memberships: ${response.statusText}`
    );
  }

  const data: MembershipsResponse = await response.json();
  return {
    memberships: data.content || [],
    pagination: data.page,
  };
};

const useCompanyMemberships = (
  companyUuid: string,
  enabled: boolean = true
): UseQueryResult<MembershipsData, Error> =>
  useQuery({
    queryKey: ["companyMemberships", companyUuid],
    queryFn: () => fetchCompanyMemberships(companyUuid),
    enabled: enabled && !!companyUuid,
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
  });

export default useCompanyMemberships;
export type { MembershipsResponse, MembershipsData };

