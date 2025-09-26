// // src/components/types.ts
// import React from "react";

// export interface ShapeItem {
//   id: string;
//   type: "rect" | "circle" | "triangle" | "line" | "polygon" | "path" | string;
//   width?: number;
//   height?: number;
//   radius?: number;
//   fill?: string;
//   stroke?: string;
//   strokeWidth?: number;
//   points?: { x: number; y: number }[];
//   path?: string;
//   icon?: React.ReactNode;
// }


export interface BaseElement {
  label: string;
  category?: string;
  thumbnail?: string;
}

export interface ShapeElement extends BaseElement {
  type: 'icon';
  shape: string; // 'rect', 'circle', etc.
}

export interface JsonElement extends BaseElement {
  type: 'json';
  json: any; // Fabric.js JSON object
}

export interface ImageElement extends BaseElement {
  type: 'img';
  url: string;
}

export interface SvgElement extends BaseElement {
  type: 'svg';
  svg: string;
}

export type ElementItem = ShapeElement | JsonElement | ImageElement | SvgElement;

export interface ElementCategory {
  name: string;
  items: ElementItem[];
  renderType: 'icon' | 'json' | 'img' | 'svg';
}