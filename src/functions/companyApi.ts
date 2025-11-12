/* eslint-disable @typescript-eslint/no-explicit-any */

interface CompanyApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

interface UpdateCompanyParams {
  uuid: string;
  name?: string;
  externalId?: string;
}

const getCsrfToken = (): string | null => {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) {
    return metaTag.getAttribute("content");
  }
  
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrf-token" || name === "XSRF-TOKEN") {
      return decodeURIComponent(value);
    }
  }
  
  return null;
};

const fetchCompanyById = async (companyUuid: string): Promise<CompanyApiResponse> => {
  try {
    const response = await fetch(`/api/account/v2/companies/${companyUuid}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: response.statusText,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

const updateCompany = async (
  params: UpdateCompanyParams
): Promise<CompanyApiResponse> => {
  try {
    const csrfToken = getCsrfToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
      headers["X-XSRF-TOKEN"] = csrfToken;
    }

    const body: any = {};
    if (params.name !== undefined) {
      body.name = params.name;
    }
    if (params.externalId !== undefined) {
      body.externalId = params.externalId === null ? null : params.externalId;
    }

    const response = await fetch(`/api/account/v2/companies/${params.uuid}`, {
      method: "PATCH",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || response.statusText,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
      company: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

const companyApi = {
  fetchCompanyById,
  updateCompany,
};

export default companyApi;

