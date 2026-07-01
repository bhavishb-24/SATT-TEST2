"use client";

import React from "react";
import { cn } from "@/lib/utils";

// SVG distortion filter — render once at the root
export const GlassFilter: React.FC = () => (
  <svg style={{ display: "none" }} aria-hidden="true">
    <defs>
      <filter
        id="glass-distortion"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.001 0.005"
          numOctaves="1"
          seed="17"
          result="turbulence"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting
          in="softMap"
          surfaceScale="5"
          specularConstant="1"
          specularExponent="100"
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite
          in="specLight"
          operator="arithmetic"
          k1="0"
          k2="1"
          k3="1"
          k4="0"
          result="litImage"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale="200"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

// Core liquid glass wrapper
interface GlassProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  as?: React.ElementType;
}

export const Glass: React.FC<GlassProps> = ({
  children,
  className,
  style,
  as: Tag = "div",
}) => {
  return (
    <Tag
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{
        boxShadow:
          "0 6px 20px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.18)",
        ...style,
      }}
    >
      {/* Blur + distortion layer */}
      <div
        className="absolute inset-0 z-0 rounded-[inherit]"
        style={{
          backdropFilter: "blur(12px) saturate(1.4)",
          WebkitBackdropFilter: "blur(12px) saturate(1.4)",
          filter: "url(#glass-distortion)",
          isolation: "isolate",
        }}
        aria-hidden="true"
      />
      {/* Frosted tint */}
      <div
        className="absolute inset-0 z-10 rounded-[inherit]"
        style={{ background: "rgba(255,255,255,0.18)" }}
        aria-hidden="true"
      />
      {/* Inner highlight border */}
      <div
        className="absolute inset-0 z-20 rounded-[inherit]"
        style={{
          boxShadow:
            "inset 1.5px 1.5px 1px rgba(255,255,255,0.55), inset -1px -1px 1px rgba(255,255,255,0.35)",
        }}
        aria-hidden="true"
      />
      {/* Content */}
      <div className="relative z-30">{children}</div>
    </Tag>
  );
};
