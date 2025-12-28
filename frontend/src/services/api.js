import api from '../lib/axios';

// Mock API service for now
export const analysisAPI = {
  preview: async (data) => {
    // Mock response with calculations
    const costPrice = data.cost_price;
    const sellingPrice = data.selling_price;
    const unitsSold = data.units_sold;
    const discountPercentage = data.discount_percentage;
    const unitsSoldDiscount = data.units_sold_discount;
    const fixedCost = data.fixed_cost || 0;
    const variableCost = data.variable_cost || 0;

    // Calculate metrics
    const baselineRevenue = sellingPrice * unitsSold;
    const baselineTotalCost = (costPrice + variableCost) * unitsSold + fixedCost;
    const baselineProfit = baselineRevenue - baselineTotalCost;
    const baselineMargin = baselineRevenue > 0 ? (baselineProfit / baselineRevenue) * 100 : 0;

    const discountedPrice = sellingPrice * (1 - discountPercentage / 100);
    const discountRevenue = discountedPrice * unitsSoldDiscount;
    const discountTotalCost = (costPrice + variableCost) * unitsSoldDiscount + fixedCost;
    const discountProfit = discountRevenue - discountTotalCost;
    const discountMargin = discountRevenue > 0 ? (discountProfit / discountRevenue) * 100 : 0;

    const priceChange = ((discountedPrice - sellingPrice) / sellingPrice) * 100;
    const quantityChange = ((unitsSoldDiscount - unitsSold) / unitsSold) * 100;
    const priceElasticity = priceChange !== 0 ? (quantityChange / priceChange) : 0;

    const revenueChange = ((discountRevenue - baselineRevenue) / baselineRevenue) * 100;
    const revenueElasticity = priceChange !== 0 ? (revenueChange / Math.abs(priceChange)) : 0;

    const profitChange = baselineProfit !== 0 ? ((discountProfit - baselineProfit) / Math.abs(baselineProfit)) * 100 : 0;
    const profitSensitivityIndex = priceChange !== 0 ? (profitChange / Math.abs(priceChange)) : 0;

    const discountLift = ((unitsSoldDiscount - unitsSold) / unitsSold) * 100;
    const incrementalProfit = discountProfit - baselineProfit;
    const isProfitable = discountProfit > baselineProfit;

    const elasticityClassification = (() => {
      const absElasticity = Math.abs(priceElasticity);
      if (absElasticity === 0) return 'Perfectly Inelastic';
      if (absElasticity < 1) return 'Inelastic';
      if (absElasticity === 1) return 'Unit Elastic';
      if (absElasticity > 1 && absElasticity < 5) return 'Elastic';
      return 'Highly Elastic';
    })();

    return {
      data: {
        data: {
          baseline: {
            revenue: parseFloat(baselineRevenue.toFixed(2)),
            profit: parseFloat(baselineProfit.toFixed(2)),
            profit_margin: parseFloat(baselineMargin.toFixed(2)),
            asp: parseFloat(sellingPrice.toFixed(2)),
            total_cost: parseFloat(baselineTotalCost.toFixed(2))
          },
          discount: {
            discounted_price: parseFloat(discountedPrice.toFixed(2)),
            revenue: parseFloat(discountRevenue.toFixed(2)),
            profit: parseFloat(discountProfit.toFixed(2)),
            profit_margin: parseFloat(discountMargin.toFixed(2)),
            asp: parseFloat(discountedPrice.toFixed(2)),
            total_cost: parseFloat(discountTotalCost.toFixed(2))
          },
          sensitivity: {
            price_elasticity: parseFloat(priceElasticity.toFixed(2)),
            revenue_elasticity: parseFloat(revenueElasticity.toFixed(2)),
            profit_sensitivity_index: parseFloat(profitSensitivityIndex.toFixed(2)),
            elasticity_classification: elasticityClassification
          },
          performance: {
            discount_lift: parseFloat(discountLift.toFixed(2)),
            incremental_profit: parseFloat(incrementalProfit.toFixed(2)),
            break_even_discount: 15.5, // Mock calculation
            profit_difference: parseFloat(incrementalProfit.toFixed(2)),
            is_profitable: isProfitable
          },
          summary: {
            recommendation: isProfitable 
              ? 'Discount is profitable. Consider implementing this pricing strategy.'
              : 'Discount is not profitable. Consider alternative pricing strategies.',
            insight: `The discount ${isProfitable ? 'increased' : 'decreased'} units sold by ${Math.abs(discountLift).toFixed(1)}% and ${isProfitable ? 'generated additional' : 'reduced'} profit by $${Math.abs(incrementalProfit).toFixed(2)}.`,
            elasticity_insight: `Price elasticity is ${elasticityClassification} (${Math.abs(priceElasticity).toFixed(2)}).`,
            key_takeaway: isProfitable 
              ? 'Discount strategy is effective for this product.'
              : 'Product is price sensitive; discount strategy needs adjustment.'
          }
        }
      }
    };
  },
  
  create: async (data) => {
    return {
      data: {
        data: {
          scenario: {
            id: 'mock-id-' + Date.now(),
            name: data.scenario_name,
            description: data.description,
            time_period: data.time_period || 'monthly',
            created_at: new Date().toISOString()
          }
        }
      }
    };
  },
  
  getAll: async (params) => {
    return {
      data: {
        data: {
          scenarios: [],
          pagination: {
            total: 0,
            totalPages: 1
          }
        }
      }
    };
  },
  
  getById: async (id) => {
    return {
      data: {
        data: {
          scenario: {
            id,
            name: 'Mock Analysis',
            description: 'Mock description for testing',
            created_at: new Date().toISOString(),
            time_period: 'monthly'
          },
          inputs: {
            cost_price: 50,
            selling_price: 100,
            units_sold: 1000,
            discount_percentage: 20,
            units_sold_discount: 1500,
            fixed_cost: 5000,
            variable_cost: 5
          },
          calculated_kpis: {
            baseline: {
              revenue: 100000,
              profit: 45000,
              profit_margin: 45,
              asp: 100,
              total_cost: 55000
            },
            discount: {
              discounted_price: 80,
              revenue: 120000,
              profit: 62500,
              profit_margin: 52.08,
              asp: 80,
              total_cost: 57500
            },
            sensitivity: {
              price_elasticity: -2.5,
              revenue_elasticity: 2.5,
              profit_sensitivity_index: 3.89,
              elasticity_classification: 'Highly Elastic'
            },
            performance: {
              discount_lift: 50,
              incremental_profit: 17500,
              break_even_discount: 10,
              profit_difference: 17500,
              is_profitable: true
            },
            summary: {
              recommendation: 'Discount is profitable. Consider implementing this pricing strategy.',
              insight: 'The discount increased units sold by 50.0% and generated additional profit of $17500.00.',
              elasticity_insight: 'Price elasticity is Highly Elastic (-2.50).',
              key_takeaway: 'Discount strategy is effective for this product.'
            }
          }
        }
      }
    };
  }
};

// Dashboard API
export const dashboardAPI = {
  getOverview: async () => {
    // Mock dashboard data
    return {
      data: {
        data: {
          overview: {
            total_scenarios: 3,
            average_profit: 24500,
            average_elasticity: 2.4,
            best_discount: 20,
            discount_win_rate: 66.67
          },
          recent_analyses: [
            {
              id: '1',
              scenario_name: 'Premium Smartphone 20% Discount',
              description: 'Testing 20% discount on flagship smartphone',
              created_at: new Date().toISOString(),
              scenario_kpis: [
                {
                  baseline_profit: 190000,
                  discount_profit: 237800,
                  profit_difference: 47800,
                  is_profitable: true
                }
              ]
            },
            {
              id: '2',
              scenario_name: 'Laptop 15% Discount',
              description: 'Testing 15% discount on mid-range laptop',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              scenario_kpis: [
                {
                  baseline_profit: 85000,
                  discount_profit: 92000,
                  profit_difference: 7000,
                  is_profitable: true
                }
              ]
            },
            {
              id: '3',
              scenario_name: 'Headphones 30% Discount',
              description: 'Testing 30% discount on premium headphones',
              created_at: new Date(Date.now() - 172800000).toISOString(),
              scenario_kpis: [
                {
                  baseline_profit: 45000,
                  discount_profit: 38000,
                  profit_difference: -7000,
                  is_profitable: false
                }
              ]
            }
          ],
          best_performing: {
            id: '1',
            scenario_name: 'Premium Smartphone 20% Discount',
            scenario_kpis: [
              {
                profit_difference: 47800
              }
            ]
          },
          total_analyses: 3
        }
      }
    };
  },
  
  getTrends: async (params) => {
    return {
      data: {
        data: {
          trends: [
            {
              period: 1,
              date: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
              discount_percentage: 15,
              profit: 92000,
              elasticity: -2.1,
              profit_change: 7000
            },
            {
              period: 2,
              date: new Date(Date.now() - 302400000).toISOString(), // 3.5 days ago
              discount_percentage: 20,
              profit: 237800,
              elasticity: -2.5,
              profit_change: 47800
            }
          ],
          moving_averages: [null, 164900],
          analysis: {
            overall_trend: 'upward',
            average_discount: 17.5,
            success_rate: 100,
            recommendations: [
              'Your discount strategies are generally effective. Consider scaling successful approaches.'
            ]
          }
        }
      }
    };
  }
};

// Auth API
export const authAPI = {
  login: async (data) => {
    return {
      data: {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: '1',
            email: data.email,
            business_name: 'Test Business',
            created_at: new Date().toISOString()
          },
          token: 'mock-jwt-token-' + Date.now()
        }
      }
    };
  },
  
  register: async (data) => {
    return {
      data: {
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: '1',
            email: data.email,
            business_name: data.business_name || 'My Business',
            created_at: new Date().toISOString()
          },
          token: 'mock-jwt-token-' + Date.now()
        }
      }
    };
  },
  
  getProfile: async () => {
    return {
      data: {
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          business_name: 'Test Business',
          created_at: new Date().toISOString()
        }
      }
    };
  }
};