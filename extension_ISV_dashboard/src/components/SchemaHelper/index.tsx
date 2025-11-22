import React, { useState } from "react";
import { Button, Paper, Text, Code, Stack } from "@mantine/core";
import { introspectSchema } from "../../services/marketplaceApi";

const SchemaHelper: React.FC = () => {
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIntrospect = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await introspectSchema();
      setSchema(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Text fw={600}>GraphQL Schema Discovery</Text>
        <Text size="sm" c="dimmed">
          Use this to discover available query fields in your GraphQL API
        </Text>
        <Button onClick={handleIntrospect} loading={loading}>
          Discover Schema
        </Button>
        {error && (
          <Text c="red" size="sm">
            Error: {error}
          </Text>
        )}
        {schema && (
          <Paper p="md" withBorder bg="gray.0">
            <Text size="sm" fw={600} mb="xs">
              Available Query Fields:
            </Text>
            <Code block>
              {JSON.stringify(schema, null, 2)}
            </Code>
          </Paper>
        )}
      </Stack>
    </Paper>
  );
};

export default SchemaHelper;

