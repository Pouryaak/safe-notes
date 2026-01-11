import React from 'react';
import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ icon: IconComponent, size = 18, className = '' }) => {
  return <IconComponent size={size} className={className} />;
};