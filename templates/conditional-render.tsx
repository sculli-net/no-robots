import {
    Children,
    isValidElement,
    type ReactNode,
} from "react";

import { siteMode } from "@/lib/config"
  
export function ProductionOnly({ children }: { children: ReactNode.ReactNode }) {
    return children
}

  
export function PreviewOnly({ children }: { children: ReactNode.ReactNode }) {
    return (
        <div
            style={{
                display: "contents"
            }}
        >
            {children}
        </div>
    );
}

/**
 * Conditionally render components based on current site mode.
 * Accepts either composable children or a type parameter to narrow display condition
 * @param children
 * @param type
 * @returns 
 */
export function ModeConditional({ children, mode }: { children: ReactNode, mode?: "production" | "preview" }) {
    const childArray = Children.toArray(children);
  
    const previewOnly = childArray.find(
      child => isValidElement(child) && child.type === PreviewOnly
    );
  
    const productionOnly = childArray.find(
      child => isValidElement(child) && child.type === ProductionOnly
    );
  
    const otherChildren = childArray.filter(
      child =>
        !isValidElement(child) ||
        (child.type !== PreviewOnly &&
         child.type !== ProductionOnly)
    );
  
    return (
      <>
        {siteMode === "preview" ? previewOnly : productionOnly}
        {(!mode || mode === siteMode )&& otherChildren}
      </>
    );
  }