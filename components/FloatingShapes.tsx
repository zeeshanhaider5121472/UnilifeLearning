'use client';

import { motion } from 'framer-motion';

export default function FloatingShapes() {
  const shapes = [
    { type: 'cube', x: '10%', y: '20%', delay: 0, size: 60 },
    { type: 'sphere', x: '80%', y: '15%', delay: 1, size: 40 },
    { type: 'cube', x: '75%', y: '70%', delay: 2, size: 45 },
    { type: 'sphere', x: '15%', y: '75%', delay: 0.5, size: 50 },
    { type: 'cube', x: '50%', y: '10%', delay: 1.5, size: 35 },
    { type: 'sphere', x: '90%', y: '50%', delay: 3, size: 30 },
    { type: 'cube', x: '30%', y: '85%', delay: 2.5, size: 40 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: shape.x, top: shape.y }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
          }}
          transition={{
            y: { duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: shape.delay },
            rotate: { duration: 20 + i * 2, repeat: Infinity, ease: 'linear' },
          }}
        >
          {shape.type === 'cube' ? (
            <div className="cube-container">
              <div className="cube" style={{ width: shape.size, height: shape.size }}>
                <div className="cube-face cube-face-front" style={{ width: shape.size, height: shape.size, transform: `translateZ(${shape.size / 2}px)` }} />
                <div className="cube-face cube-face-back" style={{ width: shape.size, height: shape.size, transform: `rotateY(180deg) translateZ(${shape.size / 2}px)` }} />
                <div className="cube-face cube-face-right" style={{ width: shape.size, height: shape.size, transform: `rotateY(90deg) translateZ(${shape.size / 2}px)` }} />
                <div className="cube-face cube-face-left" style={{ width: shape.size, height: shape.size, transform: `rotateY(-90deg) translateZ(${shape.size / 2}px)` }} />
                <div className="cube-face cube-face-top" style={{ width: shape.size, height: shape.size, transform: `rotateX(90deg) translateZ(${shape.size / 2}px)` }} />
                <div className="cube-face cube-face-bottom" style={{ width: shape.size, height: shape.size, transform: `rotateX(-90deg) translateZ(${shape.size / 2}px)` }} />
              </div>
            </div>
          ) : (
            <div
              style={{
                width: shape.size,
                height: shape.size,
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, rgba(139,92,246,0.3), rgba(6,182,212,0.1))`,
                border: '1px solid rgba(139,92,246,0.2)',
                boxShadow: '0 0 20px rgba(139,92,246,0.1)',
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}