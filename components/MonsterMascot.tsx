"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface MonsterProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function MonsterMascot({
  size = 200,
  color = "purple",
  className = "",
}: MonsterProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blink periodically
  useEffect(() => {
    const blink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    };
    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const getPupilOffset = (eyeXRatio: number, eyeYRatio: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width * eyeXRatio;
    const centerY = rect.top + rect.height * eyeYRatio;
    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    const angle = Math.atan2(dy, dx);
    const maxDist = size * 0.04;
    const dist = Math.min(Math.sqrt(dx * dx + dy * dy) * 0.015, maxDist);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };

  const leftPupil = getPupilOffset(0.35, 0.32);
  const rightPupil = getPupilOffset(0.65, 0.32);

  const colors: Record<string, { from: string; to: string; accent: string }> = {
    purple: { from: "#8b5cf6", to: "#6d28d9", accent: "#c4b5fd" },
    teal: { from: "#14b8a6", to: "#0d9488", accent: "#99f6e4" },
    amber: { from: "#f59e0b", to: "#d97706", accent: "#fde68a" },
    pink: { from: "#ec4899", to: "#db2777", accent: "#fbcfe8" },
  };

  const c = colors[color] || colors.purple;
  const s = size;

  return (
    <motion.div
      ref={containerRef}
      className={`relative cursor-pointer select-none ${className}`}
      style={{ width: s, height: s }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      onClick={() => setIsSmiling(!isSmiling)}
      whileTap={{ scale: 0.95 }}
    >
      {/* Shadow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-20"
        style={{
          width: s * 0.6,
          height: s * 0.08,
          background: "#000",
          filter: "blur(8px)",
        }}
      />

      {/* Body */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
          boxShadow: `0 10px 40px ${c.from}40, inset 0 -10px 20px rgba(0,0,0,0.2)`,
        }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Belly */}
        <div
          className="absolute rounded-full"
          style={{
            width: s * 0.5,
            height: s * 0.4,
            bottom: s * 0.1,
            left: s * 0.25,
            background: `radial-gradient(ellipse, ${c.accent}30, transparent)`,
          }}
        />

        {/* Left Horn */}
        <div
          className="absolute"
          style={{
            top: -s * 0.08,
            left: s * 0.18,
            width: s * 0.08,
            height: s * 0.18,
            background: `linear-gradient(to top, ${c.to}, ${c.accent})`,
            borderRadius: "50% 50% 30% 30%",
            transform: "rotate(-15deg)",
          }}
        />
        {/* Right Horn */}
        <div
          className="absolute"
          style={{
            top: -s * 0.08,
            right: s * 0.18,
            width: s * 0.08,
            height: s * 0.18,
            background: `linear-gradient(to top, ${c.to}, ${c.accent})`,
            borderRadius: "50% 50% 30% 30%",
            transform: "rotate(15deg)",
          }}
        />

        {/* Left Eye */}
        <div
          className="absolute"
          style={{
            top: s * 0.22,
            left: s * 0.2,
            width: s * 0.28,
            height: isBlinking ? s * 0.02 : s * 0.28,
            background: "#fff",
            borderRadius: "50%",
            transition: "height 0.1s ease",
            overflow: "hidden",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {!isBlinking && (
            <div
              className="absolute rounded-full"
              style={{
                width: s * 0.14,
                height: s * 0.14,
                background:
                  "radial-gradient(circle at 35% 35%, #4a3a6a, #1a1a2e)",
                top: "50%",
                left: "50%",
                transform: `translate(calc(-50% + ${leftPupil.x}px), calc(-50% + ${leftPupil.y}px))`,
                transition: "transform 0.08s ease-out",
              }}
            >
              {/* Pupil shine */}
              <div
                className="absolute rounded-full bg-white"
                style={{
                  width: s * 0.04,
                  height: s * 0.04,
                  top: "20%",
                  left: "25%",
                }}
              />
            </div>
          )}
        </div>

        {/* Right Eye */}
        <div
          className="absolute"
          style={{
            top: s * 0.22,
            right: s * 0.2,
            width: s * 0.28,
            height: isBlinking ? s * 0.02 : s * 0.28,
            background: "#fff",
            borderRadius: "50%",
            transition: "height 0.1s ease",
            overflow: "hidden",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {!isBlinking && (
            <div
              className="absolute rounded-full"
              style={{
                width: s * 0.14,
                height: s * 0.14,
                background:
                  "radial-gradient(circle at 35% 35%, #4a3a6a, #1a1a2e)",
                top: "50%",
                left: "50%",
                transform: `translate(calc(-50% + ${rightPupil.x}px), calc(-50% + ${rightPupil.y}px))`,
                transition: "transform 0.08s ease-out",
              }}
            >
              <div
                className="absolute rounded-full bg-white"
                style={{
                  width: s * 0.04,
                  height: s * 0.04,
                  top: "20%",
                  left: "25%",
                }}
              />
            </div>
          )}
        </div>

        {/* Mouth */}
        <motion.div
          className="absolute"
          style={{
            bottom: s * (isSmiling ? 0.18 : 0.22),
            left: "50%",
            transform: "translateX(-50%)",
            width: s * (isSmiling ? 0.35 : 0.2),
            height: s * (isSmiling ? 0.18 : 0.08),
            background: isSmiling ? "#f87171" : "#f87171",
            borderRadius: isSmiling ? "50%" : "0 0 50% 50%",
            transition: "all 0.3s ease",
          }}
        >
          {isSmiling && (
            <div
              className="absolute"
              style={{
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "60%",
                height: "30%",
                background: "#fca5a5",
                borderRadius: "50% 50% 0 0",
              }}
            />
          )}
        </motion.div>

        {/* Cheeks */}
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: s * 0.12,
            height: s * 0.08,
            bottom: s * 0.25,
            left: s * 0.08,
            background: "#f472b6",
          }}
        />
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: s * 0.12,
            height: s * 0.08,
            bottom: s * 0.25,
            right: s * 0.08,
            background: "#f472b6",
          }}
        />

        {/* Feet */}
        <div
          className="absolute rounded-full"
          style={{
            width: s * 0.2,
            height: s * 0.1,
            bottom: -s * 0.04,
            left: s * 0.12,
            background: c.to,
            boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.2)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: s * 0.2,
            height: s * 0.1,
            bottom: -s * 0.04,
            right: s * 0.12,
            background: c.to,
            boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.2)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
