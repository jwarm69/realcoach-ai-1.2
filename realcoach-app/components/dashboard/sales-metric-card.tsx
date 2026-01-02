'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SalesMetricCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  unit?: string;
  icon: React.ReactNode;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function SalesMetricCard({
  title,
  value,
  previousValue,
  unit = '',
  icon,
  color,
  trend,
}: SalesMetricCardProps) {
  const calculateTrend = () => {
    if (previousValue === undefined || typeof value !== 'number') return null;
    if (previousValue === 0 && value === 0) return 0;
    if (previousValue === 0) return 100;
    const change = ((value - previousValue) / previousValue) * 100;
    return Math.round(change);
  };

  const trendValue = trend === undefined && previousValue !== undefined ? calculateTrend() : null;

  const getTrendIcon = () => {
    if (trendValue === null) return null;
    if (trendValue > 0) return <TrendingUp className="h-4 w-4" />;
    if (trendValue < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (trendValue === null) return '';
    if (trendValue > 0) return 'text-green-600';
    if (trendValue < 0) return 'text-red-600';
    return 'text-slate-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-bold text-slate-900">
            {typeof value === 'number' && unit === '$' ? unit + value.toLocaleString() : value}
            {typeof value === 'number' && unit === '$' === false && unit !== '' && (
              <span className="text-sm text-slate-500 ml-1">{unit}</span>
            )}
          </div>
          {trendValue !== null && (
            <Badge variant="outline" className={`text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">{Math.abs(trendValue)}%</span>
            </Badge>
          )}
        </div>
        {previousValue !== undefined && (
          <p className="text-xs text-slate-500 mt-1">
            Previous period: {previousValue.toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
