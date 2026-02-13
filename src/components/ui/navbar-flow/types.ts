'use client';

import type React from 'react';

export interface NavLink {
  text: string;
  url?: string;
  submenu?: React.ReactNode;
}

export interface NavbarFlowProps {
  emblem?: React.ReactNode;
  links?: NavLink[];
  extraIcons?: React.ReactNode[];
  styleName?: string;
  rightComponent?: React.ReactNode;
}

export interface ListItemProps {
  setSelected: (element: string | null) => void;
  selected: string | null;
  element: string;
  children: React.ReactNode;
}

export interface HoverLinkProps {
  url: string;
  children: React.ReactNode;
  onPress?: () => void;
}

export interface FeatureItemProps {
  heading: string;
  url: string;
  info: string;
  onPress?: () => void;
}
