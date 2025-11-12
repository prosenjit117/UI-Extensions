import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  Alert,
} from "@mantine/core";
import { IconCheck, IconAlertCircle } from "@tabler/icons-react";
import { FormattedMessage } from "react-intl";
import useCompanyUpdate, { UpdateCompanyData } from "../../hooks/useCompanyUpdate";
import { Company } from "../../hooks/useCompanies";

interface CompanyEditFormProps {
  company: Company;
  onCancel: () => void;
  onSuccess?: () => void;
}

const CompanyEditForm: React.FC<CompanyEditFormProps> = ({
  company,
  onCancel,
  onSuccess,
}) => {
  const updateMutation = useCompanyUpdate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({
    name: company.name || "",
    externalId: company.externalId || "",
  });
  const [errors, setErrors] = useState<{ name?: string; externalId?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; externalId?: string } = {};
    
    if (!formValues.name || formValues.name.trim().length === 0) {
      newErrors.name = "Company name is required";
    } else if (formValues.name.trim().length < 2) {
      newErrors.name = "Company name must be at least 2 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      let externalIdValue: string | null | undefined = undefined;
      if (formValues.externalId !== undefined) {
        const trimmed = formValues.externalId.trim();
        externalIdValue = trimmed.length === 0 ? null : trimmed;
      }

      const updateData: UpdateCompanyData = {
        uuid: company.uuid,
        name: formValues.name.trim(),
        externalId: externalIdValue,
        originalName: company.name,
        originalExternalId: company.externalId || null,
      };

      const result = await updateMutation.mutateAsync(updateData);
      
      if (result.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handling is done by the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (updateMutation.isSuccess && updateMutation.data?.company) {
      const updatedCompany = updateMutation.data.company;
      setFormValues({
        name: updatedCompany.name || company.name || "",
        externalId: updatedCompany.externalId || company.externalId || "",
      });
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateMutation.isSuccess, updateMutation.data]);

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label={<FormattedMessage id="company.edit.name.label" />}
          placeholder={<FormattedMessage id="company.edit.name.placeholder" />}
          required
          value={formValues.name}
          onChange={(e) => {
            setFormValues({ ...formValues, name: e.target.value });
            if (errors.name) {
              setErrors({ ...errors, name: undefined });
            }
          }}
          error={errors.name}
          disabled={isSubmitting}
        />

        <TextInput
          label={<FormattedMessage id="company.edit.externalId.label" />}
          placeholder={
            formValues.externalId === "" || !formValues.externalId
              ? "Add External Identifier for the company"
              : "Enter external ID (optional)"
          }
          description={
            <FormattedMessage id="company.edit.externalId.description" />
          }
          value={formValues.externalId}
          onChange={(e) => {
            setFormValues({ ...formValues, externalId: e.target.value });
            if (errors.externalId) {
              setErrors({ ...errors, externalId: undefined });
            }
          }}
          error={errors.externalId}
          disabled={isSubmitting}
          clearable
        />

        {updateMutation.isSuccess && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Success"
            color="green"
            variant="light"
          >
            <FormattedMessage id="company.edit.success" />
          </Alert>
        )}

        {updateMutation.isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
          >
            <FormattedMessage
              id="company.edit.error"
              values={{
                error:
                  updateMutation.error?.message ||
                  "An error occurred while updating the company",
              }}
            />
          </Alert>
        )}

        <Group justify="flex-end" mt="md">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <FormattedMessage id="company.edit.cancel" />
          </Button>
          <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
            <FormattedMessage id="company.edit.save" />
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default CompanyEditForm;

