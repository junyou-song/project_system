'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const pathname = usePathname();
  
  // 定义页面切换动画效果
  const variants = {
    hidden: { 
      opacity: 0,
      y: 20,
    },
    enter: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.4, 
        ease: [0.33, 1, 0.68, 1],  // cubic-bezier曲线，提供更自然的动画
        when: "beforeChildren" 
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2, 
        ease: [0.33, 1, 0.68, 1] 
      }
    }
  };

  return (
    <motion.div
      key={pathname}
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 