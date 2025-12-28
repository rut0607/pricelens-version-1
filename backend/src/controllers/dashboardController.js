const { supabase } = require('../config/supabase');
const CalculationService = require('../services/calculationService');

class DashboardController {
    /**
     * Get dashboard overview statistics
     */
    static async getDashboardStats(req, res) {
        try {
            const userId = req.user.userId;

            // Get all scenarios with KPIs for the user
            const { data: scenarios, error: scenariosError } = await supabase
                .from('scenarios')
                .select(`
                    scenario_kpis (
                        discount_profit,
                        price_elasticity,
                        profit_difference,
                        is_profitable
                    ),
                    scenario_inputs (
                        discount_percentage
                    )
                `)
                .eq('user_id', userId);

            if (scenariosError) throw scenariosError;

            // Extract KPIs for calculation
            const kpisList = scenarios.map(s => ({
                discount_profit: s.scenario_kpis[0]?.discount_profit || 0,
                price_elasticity: s.scenario_kpis[0]?.price_elasticity || 0,
                profit_difference: s.scenario_kpis[0]?.profit_difference || 0,
                is_profitable: s.scenario_kpis[0]?.is_profitable || false,
                discount_percentage: s.scenario_inputs[0]?.discount_percentage || 0
            }));

            // Calculate dashboard KPIs
            const dashboardKPIs = CalculationService.calculateDashboardKPIs(kpisList);

            // Get recent analyses
            const { data: recentAnalyses, error: recentError } = await supabase
                .from('scenarios')
                .select(`
                    id,
                    scenario_name,
                    description,
                    created_at,
                    scenario_kpis (
                        baseline_profit,
                        discount_profit,
                        profit_difference,
                        is_profitable
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentError) throw recentError;

            // Get best performing analysis
            const { data: bestAnalysis, error: bestError } = await supabase
                .from('scenarios')
                .select(`
                    id,
                    scenario_name,
                    scenario_kpis (
                        profit_difference
                    )
                `)
                .eq('user_id', userId)
                .order('profit_difference', {
                    ascending: false,
                    foreignTable: 'scenario_kpis'
                })
                .limit(1)
                .single();

            if (bestError && bestError.code !== 'PGRST116') {
                throw bestError;
            }

            res.status(200).json({
                success: true,
                data: {
                    overview: dashboardKPIs,
                    recent_analyses: recentAnalyses || [],
                    best_performing: bestAnalysis || null,
                    total_analyses: kpisList.length
                }
            });
        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching dashboard statistics',
                error: error.message
            });
        }
    }

    /**
     * Get trends over time
     */
    static async getTrends(req, res) {
        try {
            const userId = req.user.userId;
            const { period = 'monthly' } = req.query;

            // Get scenarios grouped by time period
            const { data: scenarios, error } = await supabase
                .from('scenarios')
                .select(`
                    created_at,
                    time_period,
                    scenario_kpis (
                        discount_profit,
                        price_elasticity,
                        profit_difference
                    ),
                    scenario_inputs (
                        discount_percentage
                    )
                `)
                .eq('user_id', userId)
                .eq('time_period', period)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Format trend data
            const trends = scenarios.map((scenario, index) => ({
                period: index + 1,
                date: scenario.created_at,
                discount_percentage: scenario.scenario_inputs[0]?.discount_percentage || 0,
                profit: scenario.scenario_kpis[0]?.discount_profit || 0,
                elasticity: scenario.scenario_kpis[0]?.price_elasticity || 0,
                profit_change: scenario.scenario_kpis[0]?.profit_difference || 0
            }));

            // Calculate moving averages - FIXED: Use DashboardController instead of this
            const movingAverages = DashboardController.calculateMovingAverages(trends.map(t => t.profit));

            const trendAnalysis = {
                overall_trend: DashboardController.analyzeTrend(trends.map(t => t.profit)),
                average_discount: trends.reduce((sum, t) => sum + t.discount_percentage, 0) / (trends.length || 1),
                success_rate: trends.length > 0 ? (trends.filter(t => t.profit_change > 0).length / trends.length) * 100 : 0,
                recommendations: DashboardController.generateTrendRecommendations(trends)
            };

            res.status(200).json({
                success: true,
                data: {
                    trends,
                    moving_averages: movingAverages,
                    analysis: trendAnalysis
                }
            });
        } catch (error) {
            console.error('Get trends error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching trends',
                error: error.message
            });
        }
    }

    /**
     * Calculate moving averages
     */
    static calculateMovingAverages(data, window = 3) {
        if (!data || data.length === 0) return [];
        
        const movingAverages = [];
        for (let i = 0; i < data.length; i++) {
            if (i < window - 1) {
                movingAverages.push(null);
            } else {
                const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
                movingAverages.push(parseFloat((sum / window).toFixed(2)));
            }
        }
        return movingAverages;
    }

    /**
     * Analyze trend direction
     */
    static analyzeTrend(data) {
        if (!data || data.length < 2) return 'insufficient_data';
        
        const firstHalf = data.slice(0, Math.floor(data.length / 2));
        const secondHalf = data.slice(Math.floor(data.length / 2));
        
        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        const change = ((avgSecond - avgFirst) / Math.abs(avgFirst)) * 100;
        
        if (change > 10) return 'strong_upward';
        if (change > 2) return 'upward';
        if (change < -10) return 'strong_downward';
        if (change < -2) return 'downward';
        return 'stable';
    }

    /**
     * Generate recommendations based on trends
     */
    static generateTrendRecommendations(trends) {
        if (!trends || trends.length < 3) {
            return ['Collect more data to generate meaningful insights'];
        }

        const recommendations = [];
        const profitableTrends = trends.filter(t => t.profit_change > 0);
        const discountRanges = trends.map(t => t.discount_percentage);

        if (profitableTrends.length / trends.length > 0.7) {
            recommendations.push('Your discount strategies are generally effective. Consider scaling successful approaches.');
        } else {
            recommendations.push('Review discount strategies. Less than 70% of scenarios are profitable.');
        }

        const avgDiscount = discountRanges.reduce((a, b) => a + b, 0) / discountRanges.length;
        if (avgDiscount > 30) {
            recommendations.push('Average discount is high (>30%). Consider testing smaller discounts for better margins.');
        }

        const elasticityTrend = DashboardController.analyzeTrend(trends.map(t => Math.abs(t.elasticity)));
        if (elasticityTrend === 'upward' || elasticityTrend === 'strong_upward') {
            recommendations.push('Price sensitivity is increasing. Monitor customer response to price changes closely.');
        }

        return recommendations;
    }
}

module.exports = DashboardController;