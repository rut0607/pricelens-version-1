/**
 * Format currency values
 */
const formatCurrency = (value, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

/**
 * Format percentage values
 */
const formatPercentage = (value, decimals = 2) => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Generate random color for charts
 */
const generateColor = (index) => {
    const colors = [
        '#3B82F6', // Blue
        '#10B981', // Green
        '#EF4444', // Red
        '#F59E0B', // Yellow
        '#8B5CF6', // Purple
        '#EC4899', // Pink
        '#06B6D4', // Cyan
        '#84CC16', // Lime
    ];
    return colors[index % colors.length];
};

/**
 * Calculate summary statistics
 */
const calculateStatistics = (data) => {
    if (!data || data.length === 0) {
        return {
            mean: 0,
            median: 0,
            min: 0,
            max: 0,
            stdDev: 0
        };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    
    const variance = sorted.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sorted.length;
    const stdDev = Math.sqrt(variance);

    return {
        mean: parseFloat(mean.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2))
    };
};

/**
 * Sanitize user input
 */
const sanitizeInput = (input) => {
    if (typeof input === 'string') {
        return input.trim().replace(/[<>]/g, '');
    }
    return input;
};

/**
 * Generate unique ID
 */
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

module.exports = {
    formatCurrency,
    formatPercentage,
    generateColor,
    calculateStatistics,
    sanitizeInput,
    generateId
};