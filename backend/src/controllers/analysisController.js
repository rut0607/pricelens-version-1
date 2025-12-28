const { supabase } = require('../config/supabase');
const CalculationService = require('../services/calculationService');
const { validateAnalysisInput } = require('../utils/validators');

class AnalysisController {
    /**
     * Create a new price sensitivity analysis
     */
    static async createAnalysis(req, res) {
        try {
            const userId = req.user.userId;

            // Validate input
            const { error, value } = validateAnalysisInput(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.details
                });
            }

            const {
                scenario_name,
                description,
                cost_price,
                selling_price,
                units_sold,
                discount_percentage,
                units_sold_discount,
                fixed_cost,
                variable_cost,
                competitor_price,
                time_period
            } = value;

            // Calculate all KPIs
            const inputs = {
                cost_price,
                selling_price,
                units_sold,
                discount_percentage,
                units_sold_discount,
                fixed_cost: fixed_cost || 0,
                variable_cost: variable_cost || 0
            };

            const calculatedKPIs = CalculationService.calculateAllKPIs(inputs);

            // Start transaction (Supabase doesn't support transactions directly, so we'll handle sequentially)
            try {
                // 1. Create scenario
                const { data: scenario, error: scenarioError } = await supabase
                    .from('scenarios')
                    .insert([{
                        user_id: userId,
                        scenario_name,
                        description: description || null,
                        time_period: time_period || 'monthly'
                    }])
                    .select()
                    .single();

                if (scenarioError) throw scenarioError;

                // 2. Save inputs
                const { error: inputsError } = await supabase
                    .from('scenario_inputs')
                    .insert([{
                        scenario_id: scenario.id,
                        cost_price,
                        selling_price,
                        units_sold,
                        discount_percentage,
                        units_sold_discount,
                        fixed_cost: fixed_cost || 0,
                        variable_cost: variable_cost || 0,
                        competitor_price: competitor_price || null
                    }]);

                if (inputsError) throw inputsError;

                // 3. Save calculated KPIs
                const { error: kpisError } = await supabase
                    .from('scenario_kpis')
                    .insert([{
                        scenario_id: scenario.id,
                        // Baseline KPIs
                        baseline_revenue: calculatedKPIs.baseline.revenue,
                        baseline_profit: calculatedKPIs.baseline.profit,
                        baseline_profit_margin: calculatedKPIs.baseline.profit_margin,
                        baseline_asp: calculatedKPIs.baseline.asp,
                        // Discounted KPIs
                        discount_revenue: calculatedKPIs.discount.revenue,
                        discount_profit: calculatedKPIs.discount.profit,
                        discount_profit_margin: calculatedKPIs.discount.profit_margin,
                        discount_asp: calculatedKPIs.discount.asp,
                        // Sensitivity Metrics
                        price_elasticity: calculatedKPIs.sensitivity.price_elasticity,
                        revenue_elasticity: calculatedKPIs.sensitivity.revenue_elasticity,
                        profit_sensitivity_index: calculatedKPIs.sensitivity.profit_sensitivity_index,
                        elasticity_classification: calculatedKPIs.sensitivity.elasticity_classification,
                        // Performance KPIs
                        discount_lift: calculatedKPIs.performance.discount_lift,
                        incremental_profit: calculatedKPIs.performance.incremental_profit,
                        break_even_discount: calculatedKPIs.performance.break_even_discount,
                        profit_difference: calculatedKPIs.performance.profit_difference,
                        is_profitable: calculatedKPIs.performance.is_profitable
                    }]);

                if (kpisError) throw kpisError;

                res.status(201).json({
                    success: true,
                    message: 'Analysis created successfully',
                    data: {
                        scenario,
                        inputs,
                        kpis: calculatedKPIs
                    }
                });

            } catch (dbError) {
                // Clean up if any part fails
                console.error('Database error:', dbError);
                throw new Error('Failed to save analysis to database');
            }

        } catch (error) {
            console.error('Create analysis error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating analysis',
                error: error.message
            });
        }
    }

    /**
     * Get all analyses for a user
     */
    static async getUserAnalyses(req, res) {
        try {
            const userId = req.user.userId;
            const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

            const offset = (page - 1) * limit;

            // Get total count
            const { count, error: countError } = await supabase
                .from('scenarios')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (countError) throw countError;

            // Get scenarios with pagination
            const { data: scenarios, error: scenariosError } = await supabase
                .from('scenarios')
                .select(`
                    *,
                    scenario_inputs (*),
                    scenario_kpis (*)
                `)
                .eq('user_id', userId)
                .order(sortBy, { ascending: sortOrder === 'asc' })
                .range(offset, offset + limit - 1);

            if (scenariosError) throw scenariosError;

            // Format response
            const formattedScenarios = scenarios.map(scenario => ({
                id: scenario.id,
                name: scenario.scenario_name,
                description: scenario.description,
                time_period: scenario.time_period,
                created_at: scenario.created_at,
                inputs: scenario.scenario_inputs[0],
                kpis: scenario.scenario_kpis[0]
            }));

            res.status(200).json({
                success: true,
                data: {
                    scenarios: formattedScenarios,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: count,
                        totalPages: Math.ceil(count / limit)
                    }
                }
            });
        } catch (error) {
            console.error('Get analyses error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching analyses',
                error: error.message
            });
        }
    }

    /**
     * Get single analysis by ID
     */
    static async getAnalysisById(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            // Get scenario with related data
            const { data: scenario, error } = await supabase
                .from('scenarios')
                .select(`
                    *,
                    scenario_inputs (*),
                    scenario_kpis (*)
                `)
                .eq('id', id)
                .eq('user_id', userId)
                .single();

            if (error || !scenario) {
                return res.status(404).json({
                    success: false,
                    message: 'Analysis not found'
                });
            }

            // Recalculate KPIs for consistency
            const inputs = {
                cost_price: scenario.scenario_inputs[0].cost_price,
                selling_price: scenario.scenario_inputs[0].selling_price,
                units_sold: scenario.scenario_inputs[0].units_sold,
                discount_percentage: scenario.scenario_inputs[0].discount_percentage,
                units_sold_discount: scenario.scenario_inputs[0].units_sold_discount,
                fixed_cost: scenario.scenario_inputs[0].fixed_cost,
                variable_cost: scenario.scenario_inputs[0].variable_cost
            };

            const calculatedKPIs = CalculationService.calculateAllKPIs(inputs);

            res.status(200).json({
                success: true,
                data: {
                    scenario: {
                        id: scenario.id,
                        name: scenario.scenario_name,
                        description: scenario.description,
                        time_period: scenario.time_period,
                        created_at: scenario.created_at
                    },
                    inputs: scenario.scenario_inputs[0],
                    stored_kpis: scenario.scenario_kpis[0],
                    calculated_kpis: calculatedKPIs
                }
            });
        } catch (error) {
            console.error('Get analysis error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching analysis',
                error: error.message
            });
        }
    }

    /**
     * Delete an analysis
     */
    static async deleteAnalysis(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;

            // Check if analysis belongs to user
            const { data: scenario, error: checkError } = await supabase
                .from('scenarios')
                .select('id')
                .eq('id', id)
                .eq('user_id', userId)
                .single();

            if (checkError || !scenario) {
                return res.status(404).json({
                    success: false,
                    message: 'Analysis not found or unauthorized'
                });
            }

            // Delete scenario (cascade will delete related records)
            const { error: deleteError } = await supabase
                .from('scenarios')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            res.status(200).json({
                success: true,
                message: 'Analysis deleted successfully'
            });
        } catch (error) {
            console.error('Delete analysis error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting analysis',
                error: error.message
            });
        }
    }

    /**
     * Compare multiple analyses
     */
    static async compareAnalyses(req, res) {
        try {
            const userId = req.user.userId;
            const { analysisIds } = req.body;

            if (!Array.isArray(analysisIds) || analysisIds.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide at least 2 analysis IDs to compare'
                });
            }

            // Get all analyses
            const { data: scenarios, error } = await supabase
                .from('scenarios')
                .select(`
                    *,
                    scenario_inputs (*),
                    scenario_kpis (*)
                `)
                .eq('user_id', userId)
                .in('id', analysisIds);

            if (error) throw error;

            if (scenarios.length !== analysisIds.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Some analyses not found'
                });
            }

            // Format comparison data
            const comparison = scenarios.map(scenario => ({
                id: scenario.id,
                name: scenario.scenario_name,
                discount_percentage: scenario.scenario_inputs[0]?.discount_percentage || 0,
                baseline_profit: scenario.scenario_kpis[0]?.baseline_profit || 0,
                discount_profit: scenario.scenario_kpis[0]?.discount_profit || 0,
                profit_difference: scenario.scenario_kpis[0]?.profit_difference || 0,
                price_elasticity: scenario.scenario_kpis[0]?.price_elasticity || 0,
                discount_lift: scenario.scenario_kpis[0]?.discount_lift || 0,
                is_profitable: scenario.scenario_kpis[0]?.is_profitable || false
            }));

            // Find best performing discount
            const bestPerforming = comparison.reduce((best, current) => 
                current.profit_difference > best.profit_difference ? current : best
            );

            res.status(200).json({
                success: true,
                data: {
                    analyses: comparison,
                    summary: {
                        best_performing_discount: bestPerforming.discount_percentage,
                        highest_profit_increase: bestPerforming.profit_difference,
                        average_elasticity: comparison.reduce((sum, a) => sum + Math.abs(a.price_elasticity), 0) / comparison.length,
                        profitable_count: comparison.filter(a => a.is_profitable).length,
                        total_count: comparison.length
                    }
                }
            });
        } catch (error) {
            console.error('Compare analyses error:', error);
            res.status(500).json({
                success: false,
                message: 'Error comparing analyses',
                error: error.message
            });
        }
    }

    /**
     * Calculate KPIs without saving (preview)
     */
    static async previewAnalysis(req, res) {
        try {
            const { error, value } = validateAnalysisInput(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.details
                });
            }

            const inputs = {
                cost_price: value.cost_price,
                selling_price: value.selling_price,
                units_sold: value.units_sold,
                discount_percentage: value.discount_percentage,
                units_sold_discount: value.units_sold_discount,
                fixed_cost: value.fixed_cost || 0,
                variable_cost: value.variable_cost || 0
            };

            const calculatedKPIs = CalculationService.calculateAllKPIs(inputs);

            res.status(200).json({
                success: true,
                data: calculatedKPIs
            });
        } catch (error) {
            console.error('Preview analysis error:', error);
            res.status(500).json({
                success: false,
                message: 'Error calculating preview',
                error: error.message
            });
        }
    }
}

module.exports = AnalysisController;