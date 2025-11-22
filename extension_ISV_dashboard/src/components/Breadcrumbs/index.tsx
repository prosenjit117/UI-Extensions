import React from "react";
import { Breadcrumbs as MantineBreadcrumbs, Anchor } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return null;
  }

  const breadcrumbItems = items.map((item, index) => {
    const isLast = index === items.length - 1;

    if (isLast || !item.href) {
      return (
        <span key={index} style={{ color: "var(--mantine-color-gray-7)" }}>
          {item.title}
        </span>
      );
    }

    return (
      <Anchor
        key={index}
        onClick={(e) => {
          e.preventDefault();
          navigate(item.href!);
        }}
        style={{ cursor: "pointer" }}
      >
        {item.title}
      </Anchor>
    );
  });

  return (
    <MantineBreadcrumbs separator="→" mb="md">
      {breadcrumbItems}
    </MantineBreadcrumbs>
  );
};

export default Breadcrumbs;
