'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  y?: number;
  x?: number;
  className?: string;
  style?: React.CSSProperties;
}

const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  duration = 0.5, 
  delay = 0, 
  y = 20, 
  x = 0,
  className = '',
  style = {}
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y, x }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ 
        duration, 
        delay,
        ease: [0.33, 1, 0.68, 1]
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn; 