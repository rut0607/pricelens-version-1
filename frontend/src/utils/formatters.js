/**
 * Format currency values
 */
export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format percentage values
 */
export const formatPercentage = (value, decimals = 2) => {
  return `${parseFloat(value).toFixed(decimals)}%`;
};

/**
 * Format large numbers with commas
 */
export const formatNumber = (value, decimals = 0) => {
  return parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Get color based on profit status
 */
export const getProfitColor = (profit) => {
  if (profit > 0) return 'text-green-600';
  if (profit < 0) return 'text-red-600';
  return 'text-gray-600';
};

/**
 * Get color based on elasticity
 */
export const getElasticityColor = (elasticity) => {
  const absElasticity = Math.abs(elasticity);
  if (absElasticity < 1) return 'text-blue-600';
  if (absElasticity === 1) return 'text-yellow-600';
  return 'text-purple-600';
};

/**
 * Generate chart colors
 */
export const chartColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
];