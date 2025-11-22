import React from "react";
import { SegmentedControl } from "@mantine/core";
import { VIEW_MODES } from "../../utils/constants";

interface ViewToggleProps {
  value: string;
  onChange: (value: string) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange }) => (
  <SegmentedControl
    value={value}
    onChange={onChange}
    color="blue"
    data={[
      { label: "Grouped by Company", value: VIEW_MODES.GROUPED },
      { label: "Flat List", value: VIEW_MODES.FLAT_LIST },
    ]}
  />
);

export default ViewToggle;

