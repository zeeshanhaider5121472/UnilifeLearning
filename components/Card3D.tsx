"use client";

import { motion } from "framer-motion";
import { MouseEvent, ReactNode, useRef, useState } from "react";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export default function Card3D({
  children,
  className = "",
  glowColor = "rgba(139,92,246,0.3)",
}: Card3DProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setRotation({ x: rotateX, y: rotateY });
    setGlowPos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      whileHover={{
        boxShadow: `0 20px 60px ${glowColor}`,
      }}
    >
      {/* Glow overlay */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
}
