import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { scaleOnHover } from '../../lib/motion';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background";
  
  const variants = {
    primary: "bg-accent hover:bg-yellow-700 text-white shadow-lg shadow-accent/25 focus:ring-accent",
    secondary: "bg-primary/10 hover:bg-primary/20 text-primary border border-muted focus:ring-accent",
    outline: "bg-transparent border border-accent text-accent hover:bg-accent/10 focus:ring-accent"
  };

  return (
    <motion.button
      variants={scaleOnHover}
      whileHover="hover"
      whileTap="tap"
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {icon && <span className="ml-1">{icon}</span>}
    </motion.button>
  );
};

export default Button;