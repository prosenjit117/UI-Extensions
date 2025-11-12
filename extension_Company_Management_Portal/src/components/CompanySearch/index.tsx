import React, { useState, useEffect } from "react";
import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { FormattedMessage } from "react-intl";

interface CompanySearchProps {
  onSearchChange: (searchTerm: string) => void;
  debounceMs?: number;
}

const CompanySearch: React.FC<CompanySearchProps> = ({
  onSearchChange,
  debounceMs = 400,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, debounceMs]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(event.target.value);
  };

  const handleClear = (): void => {
    setSearchTerm("");
    onSearchChange("");
  };

  return (
    <TextInput
      placeholder="Search by External ID, Name, or UUID"
      leftSection={<IconSearch size={18} />}
      value={searchTerm}
      onChange={handleChange}
      onClear={handleClear}
      clearable
      size="md"
      radius="md"
      style={{ width: "100%" }}
      aria-label="Search companies by external ID, name, or UUID"
    />
  );
};

export default CompanySearch;

