class CalculationService {
    /**
     * Calculate all KPIs for a pricing scenario
     * @param {Object} inputs - Scenario inputs
     * @returns {Object} - All calculated KPIs
     */
    static calculateAllKPIs(inputs) {
        const {
            cost_price,
            selling_price,
            units_sold,
            discount_percentage,
            units_sold_discount,
            fixed_cost = 0,
            variable_cost = 0
        } = inputs;

        // Validate required inputs
        if (!cost_price || !selling_price || !units_sold || discount_percentage === undefined || !units_sold_discount) {
            throw new Error('Missing required input parameters');
        }

        // 1. Calculate Baseline (No Discount) Metrics
        const baseline = this.calculateBaselineMetrics(
            cost_price,
            selling_price,
            units_sold,
            fixed_cost,
            variable_cost
        );

        // 2. Calculate Discounted Metrics
        const discount = this.calculateDiscountedMetrics(
            cost_price,
            selling_price,
            units_sold,
            discount_percentage,
            units_sold_discount,
            fixed_cost,
            variable_cost
        );

        // 3. Calculate Price Sensitivity Metrics
        const sensitivity = this.calculateSensitivityMetrics(
            selling_price,
            units_sold,
            discount.discounted_price,
            units_sold_discount,
            baseline.revenue,
            discount.revenue,
            baseline.profit,
            discount.profit
        );

        // 4. Calculate Discount Performance KPIs
        const performance = this.calculateDiscountPerformance(
            units_sold,
            units_sold_discount,
            baseline.profit,
            discount.profit,
            discount_percentage,
            baseline.profit_margin,
            cost_price,
            selling_price,
            variable_cost,
            fixed_cost,
            baseline.profit // Pass baseline profit for break-even calculation
        );

        return {
            baseline,
            discount,
            sensitivity,
            performance,
            summary: this.generateSummary(sensitivity, performance)
        };
    }

    /**
     * Calculate baseline (no discount) metrics
     */
    static calculateBaselineMetrics(costPrice, sellingPrice, unitsSold, fixedCost, variableCost) {
        const totalVariableCost = (costPrice + variableCost) * unitsSold;
        const totalCost = totalVariableCost + parseFloat(fixedCost);
        const revenue = sellingPrice * unitsSold;
        const profit = revenue - totalCost;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const asp = sellingPrice;

        return {
            revenue: parseFloat(revenue.toFixed(2)),
            profit: parseFloat(profit.toFixed(2)),
            profit_margin: parseFloat(profitMargin.toFixed(2)),
            asp: parseFloat(asp.toFixed(2)),
            total_cost: parseFloat(totalCost.toFixed(2))
        };
    }

    /**
     * Calculate discounted scenario metrics
     */
    static calculateDiscountedMetrics(costPrice, sellingPrice, baselineUnits, discountPercentage, discountedUnits, fixedCost, variableCost) {
        const discountedPrice = sellingPrice * (1 - discountPercentage / 100);
        const totalVariableCost = (costPrice + variableCost) * discountedUnits;
        const totalCost = totalVariableCost + parseFloat(fixedCost);
        const revenue = discountedPrice * discountedUnits;
        const profit = revenue - totalCost;
        const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const asp = discountedPrice;

        return {
            discounted_price: parseFloat(discountedPrice.toFixed(2)),
            revenue: parseFloat(revenue.toFixed(2)),
            profit: parseFloat(profit.toFixed(2)),
            profit_margin: parseFloat(profitMargin.toFixed(2)),
            asp: parseFloat(asp.toFixed(2)),
            total_cost: parseFloat(totalCost.toFixed(2))
        };
    }

    /**
     * Calculate price sensitivity metrics
     */
    static calculateSensitivityMetrics(originalPrice, originalQuantity, newPrice, newQuantity, originalRevenue, newRevenue, originalProfit, newProfit) {
        // Price Elasticity of Demand (PED)
        const priceChange = ((newPrice - originalPrice) / originalPrice) * 100;
        const quantityChange = ((newQuantity - originalQuantity) / originalQuantity) * 100;
        
        // Avoid division by zero
        let priceElasticity = 0;
        if (priceChange !== 0) {
            priceElasticity = quantityChange / priceChange;
        }

        // Revenue Elasticity - Fixed sign calculation
        const revenueChange = ((newRevenue - originalRevenue) / originalRevenue) * 100;
        let revenueElasticity = 0;
        if (priceChange !== 0) {
            revenueElasticity = revenueChange / Math.abs(priceChange); // Use absolute value for denominator
        }

        // Profit Sensitivity Index (PSI) - Fixed sign calculation
        const profitChange = originalProfit !== 0 ? ((newProfit - originalProfit) / Math.abs(originalProfit)) * 100 : 0;
        let profitSensitivityIndex = 0;
        if (priceChange !== 0) {
            profitSensitivityIndex = profitChange / Math.abs(priceChange); // Use absolute value for denominator
        }

        // Elasticity Classification
        const elasticityClassification = this.classifyElasticity(priceElasticity);

        return {
            price_elasticity: parseFloat(priceElasticity.toFixed(2)),
            revenue_elasticity: parseFloat(revenueElasticity.toFixed(2)),
            profit_sensitivity_index: parseFloat(profitSensitivityIndex.toFixed(2)),
            elasticity_classification: elasticityClassification
        };
    }

    /**
     * Calculate discount performance KPIs
     */
    static calculateDiscountPerformance(baselineUnits, discountUnits, baselineProfit, discountProfit, discountPercentage, baselineMargin, costPrice, sellingPrice, variableCost, fixedCost = 0, baselineProfitForBreakEven = null) {
        // Discount Lift (% increase in units)
        const discountLift = ((discountUnits - baselineUnits) / baselineUnits) * 100;

        // Incremental Profit
        const incrementalProfit = discountProfit - baselineProfit;

        // Break-even discount (%) - CORRECTED CALL
        const breakEvenDiscount = this.calculateBreakEvenDiscount(
            baselineUnits, 
            costPrice, 
            sellingPrice, 
            variableCost, 
            fixedCost,
            baselineProfitForBreakEven !== null ? baselineProfitForBreakEven : baselineProfit
        );

        // Profit Difference
        const profitDifference = discountProfit - baselineProfit;

        // Is profitable discount?
        const isProfitable = discountProfit > baselineProfit;

        return {
            discount_lift: parseFloat(discountLift.toFixed(2)),
            incremental_profit: parseFloat(incrementalProfit.toFixed(2)),
            break_even_discount: parseFloat(breakEvenDiscount.toFixed(2)),
            profit_difference: parseFloat(profitDifference.toFixed(2)),
            is_profitable: isProfitable
        };
    }

    /**
     * Calculate break-even discount percentage - CORRECTED SIMPLE VERSION
     */
    static calculateBreakEvenDiscount(baselineUnits, costPrice, sellingPrice, variableCost, fixedCost = 0, baselineProfit = null) {
        try {
            // Calculate baseline profit if not provided
            let calculatedBaselineProfit = baselineProfit;
            if (calculatedBaselineProfit === null || calculatedBaselineProfit === undefined) {
                const baselineTotalVariableCost = (costPrice + variableCost) * baselineUnits;
                const baselineTotalCost = baselineTotalVariableCost + parseFloat(fixedCost);
                const baselineRevenue = sellingPrice * baselineUnits;
                calculatedBaselineProfit = baselineRevenue - baselineTotalCost;
            }

            // Calculate unit cost and contribution margin
            const unitCost = costPrice + variableCost;
            const contributionMarginPerUnit = sellingPrice - unitCost;
            
            if (contributionMarginPerUnit <= 0) {
                return 0; // Can't discount if no contribution margin
            }

            // SIMPLER FORMULA: Break-even discount occurs when price reduction equals profit reduction per unit
            // Required price to maintain same profit = unitCost + (calculatedBaselineProfit / baselineUnits)
            const requiredPriceToMaintainProfit = unitCost + (calculatedBaselineProfit / baselineUnits);
            
            // If required price is higher than selling price, no discount possible
            if (requiredPriceToMaintainProfit >= sellingPrice) {
                return 0;
            }
            
            // Calculate discount percentage
            const breakEvenDiscount = ((sellingPrice - requiredPriceToMaintainProfit) / sellingPrice) * 100;
            
            // Ensure it's between 0 and 100
            const result = Math.max(0, Math.min(100, parseFloat(breakEvenDiscount.toFixed(2))));
            
            console.log('Break-even discount calculation:', {
                sellingPrice,
                costPrice,
                variableCost,
                unitCost,
                fixedCost,
                baselineUnits,
                baselineProfit: calculatedBaselineProfit,
                contributionMarginPerUnit,
                requiredPriceToMaintainProfit,
                breakEvenDiscount,
                result
            });
            
            return result;
            
        } catch (error) {
            console.error('Error calculating break-even discount:', error);
            return 0;
        }
    }

    /**
     * Classify price elasticity
     */
    static classifyElasticity(elasticity) {
        const absElasticity = Math.abs(elasticity);
        
        if (absElasticity === 0) return 'Perfectly Inelastic';
        if (absElasticity < 1) return 'Inelastic';
        if (absElasticity === 1) return 'Unit Elastic';
        if (absElasticity > 1 && absElasticity < 5) return 'Elastic';
        return 'Highly Elastic';
    }

    /**
     * Generate summary based on analysis
     */
    static generateSummary(sensitivity, performance) {
        const { elasticity_classification, price_elasticity } = sensitivity;
        const { is_profitable, discount_lift, profit_difference } = performance;

        let recommendation = '';
        let insight = '';

        if (is_profitable) {
            recommendation = 'Discount is profitable. Consider implementing this pricing strategy.';
            insight = `The discount increased units sold by ${discount_lift.toFixed(1)}% and generated additional profit of $${profit_difference.toFixed(2)}.`;
        } else {
            recommendation = 'Discount is not profitable. Consider alternative pricing strategies.';
            insight = `The discount decreased profit by $${Math.abs(profit_difference).toFixed(2)} despite increasing units sold by ${discount_lift.toFixed(1)}%.`;
        }

        return {
            recommendation,
            insight,
            elasticity_insight: `Price elasticity is ${elasticity_classification} (${Math.abs(price_elasticity).toFixed(2)}).`,
            key_takeaway: is_profitable 
                ? 'Discount strategy is effective for this product.'
                : 'Product is price sensitive; discount strategy needs adjustment.'
        };
    }

    /**
     * Calculate dashboard KPIs for a user
     */
    static calculateDashboardKPIs(scenarios) {
        if (!scenarios || scenarios.length === 0) {
            return {
                total_scenarios: 0,
                average_profit: 0,
                average_elasticity: 0,
                best_discount: 0,
                discount_win_rate: 0
            };
        }

        const profitableScenarios = scenarios.filter(s => s.is_profitable);
        const totalProfit = scenarios.reduce((sum, s) => sum + s.discount_profit, 0);
        const totalElasticity = scenarios.reduce((sum, s) => sum + Math.abs(s.price_elasticity), 0);
        
        // Find best discount (most profitable)
        const bestScenario = scenarios.reduce((best, current) => 
            current.profit_difference > best.profit_difference ? current : best
        , { profit_difference: -Infinity });

        return {
            total_scenarios: scenarios.length,
            average_profit: parseFloat((totalProfit / scenarios.length).toFixed(2)),
            average_elasticity: parseFloat((totalElasticity / scenarios.length).toFixed(2)),
            best_discount: bestScenario && bestScenario.profit_difference > -Infinity ? parseFloat(bestScenario.discount_percentage || 0) : 0,
            discount_win_rate: parseFloat(((profitableScenarios.length / scenarios.length) * 100).toFixed(2))
        };
    }
}

module.exports = CalculationService;