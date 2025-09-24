import { cn } from '../../utils/cn';

interface ColorSwatchProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export const ColorSwatch = ({ 
  color, 
  size = 'md', 
  className,
  showLabel = false 
}: ColorSwatchProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  if (!color) {
    return (
      <span className="text-gray-400 text-xs">—</span>
    );
  }

  return (
    <div className="flex items-center space-x-1.5">
      <div
        className={cn(
          'border border-gray-300 rounded-sm flex-shrink-0',
          sizeClasses[size],
          className
        )}
        style={{ backgroundColor: color }}
      />
      {showLabel && (
        <span className="font-mono text-xs text-gray-500">{color}</span>
      )}
    </div>
  );
};
