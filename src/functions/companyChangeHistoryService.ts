/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ChangeHistoryEntry {
  field: "name" | "externalId";
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: number;
  companyUuid: string;
}

const STORAGE_PREFIX = "company_history_";

const getUserEmail = (): string => {
  if (typeof window !== "undefined" && (window as any).dataStore?.user?.email) {
    return (window as any).dataStore.user.email;
  }
  if (
    typeof window !== "undefined" &&
    (window as any).bootstrapData?.bootstrap?.UserInfo?.email
  ) {
    return (window as any).bootstrapData.bootstrap.UserInfo.email;
  }
  return "Unknown User";
};

const getStorageKey = (companyUuid: string): string => {
  return `${STORAGE_PREFIX}${companyUuid}`;
};

export const saveChangeHistory = (
  companyUuid: string,
  field: "name" | "externalId",
  oldValue: string | null,
  newValue: string | null
): void => {
  try {
    if (oldValue === newValue) {
      return;
    }

    const userEmail = getUserEmail();
    const entry: ChangeHistoryEntry = {
      field,
      oldValue,
      newValue,
      changedBy: userEmail,
      changedAt: Date.now(),
      companyUuid,
    };

    const storageKey = getStorageKey(companyUuid);
    const existingHistory = getChangeHistory(companyUuid);
    const updatedHistory = [entry, ...existingHistory];
    const limitedHistory = updatedHistory.slice(0, 100);

    localStorage.setItem(storageKey, JSON.stringify(limitedHistory));
  } catch (error) {
    // Silently fail
  }
};

export const getChangeHistory = (companyUuid: string): ChangeHistoryEntry[] => {
  try {
    const storageKey = getStorageKey(companyUuid);
    const historyJson = localStorage.getItem(storageKey);
    if (!historyJson) {
      return [];
    }
    const history = JSON.parse(historyJson) as ChangeHistoryEntry[];
    return history.sort((a, b) => b.changedAt - a.changedAt);
  } catch (error) {
    return [];
  }
};

export const clearChangeHistory = (companyUuid: string): void => {
  try {
    const storageKey = getStorageKey(companyUuid);
    localStorage.removeItem(storageKey);
  } catch (error) {
    // Silently fail
  }
};

export const saveChangeHistoryBatch = (
  companyUuid: string,
  changes: Array<{
    field: "name" | "externalId";
    oldValue: string | null;
    newValue: string | null;
  }>
): void => {
  const userEmail = getUserEmail();
  const timestamp = Date.now();

  try {
    const existingHistory = getChangeHistory(companyUuid);
    const newEntries: ChangeHistoryEntry[] = changes
      .filter((change) => change.oldValue !== change.newValue)
      .map((change) => ({
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        changedBy: userEmail,
        changedAt: timestamp,
        companyUuid,
      }));

    if (newEntries.length === 0) {
      return;
    }

    const updatedHistory = [...newEntries, ...existingHistory];
    const limitedHistory = updatedHistory.slice(0, 100);

    const storageKey = getStorageKey(companyUuid);
    localStorage.setItem(storageKey, JSON.stringify(limitedHistory));
  } catch (error) {
    // Silently fail
  }
};

