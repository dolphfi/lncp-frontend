import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
  className?: string;
  loading?: boolean;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    trend: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200',
    trend: 'text-green-600'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200',
    trend: 'text-red-600'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    border: 'border-yellow-200',
    trend: 'text-yellow-600'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    trend: 'text-purple-600'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    border: 'border-indigo-200',
    trend: 'text-indigo-600'
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
  className,
  loading = false
}) => {
  const colors = colorVariants[color];

  if (loading) {
    return (
      <div className={cn(
        "bg-white rounded-lg border border-gray-200 p-6 shadow-sm",
        className
      )}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 truncate">
          {title}
        </h3>
        {Icon && (
          <div className={cn(
            "p-2 rounded-lg",
            colors.bg
          )}>
            <Icon className={cn("h-5 w-5", colors.icon)} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </span>
          {trend && (
            <span className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>

        {description && (
          <p className="text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

// Composant pour un groupe de cartes statistiques
interface StatCardGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const StatCardGroup: React.FC<StatCardGroupProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
      className
    )}>
      {children}
    </div>
  );
};

// Composant pour une carte statistique avec graphique
interface StatCardWithChartProps extends StatCardProps {
  chart?: React.ReactNode;
  chartHeight?: number;
}

export const StatCardWithChart: React.FC<StatCardWithChartProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
  className,
  loading = false,
  chart,
  chartHeight = 60
}) => {
  const colors = colorVariants[color];

  if (loading) {
    return (
      <div className={cn(
        "bg-white rounded-lg border border-gray-200 p-6 shadow-sm",
        className
      )}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className={`h-${chartHeight} bg-gray-200 rounded`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 truncate">
          {title}
        </h3>
        {Icon && (
          <div className={cn(
            "p-2 rounded-lg",
            colors.bg
          )}>
            <Icon className={cn("h-5 w-5", colors.icon)} />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </span>
          {trend && (
            <span className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>

        {description && (
          <p className="text-sm text-gray-500">
            {description}
          </p>
        )}

        {chart && (
          <div style={{ height: chartHeight }}>
            {chart}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
