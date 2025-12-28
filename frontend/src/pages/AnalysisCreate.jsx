// src/pages/AnalysisCreate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { analysisSchema } from '../validations/schemas';
import { useScenarios } from '../contexts/ScenarioContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Calculator,
  Percent,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Save,
  Eye,
  BarChart3,
  Zap,
  Sparkles,
  Target,
  TrendingDown,
  Activity,
  Shield,
  Info,
  ChevronRight,
  IndianRupee,
  ArrowUpRight,
  RefreshCw,
  LineChart,
  AlertTriangle,
  DollarSign,
  TargetIcon,
  ZapIcon,
  Lightbulb,
  TrendingUpIcon
} from 'lucide-react';

// Import calculation service functions
const CalculationService = {
  calculateAllKPIs: (inputs) => {
    const {
      cost_price,
      selling_price,
      units_sold,
      discount_percentage,
      units_sold_discount,
      fixed_cost = 0,
      variable_cost = 0
    } = inputs;

    // 1. Calculate Baseline (No Discount) Metrics
    const baseline = CalculationService.calculateBaselineMetrics(
      cost_price,
      selling_price,
      units_sold,
      fixed_cost,
      variable_cost
    );

    // 2. Calculate Discounted Metrics
    const discount = CalculationService.calculateDiscountedMetrics(
      cost_price,
      selling_price,
      units_sold,
      discount_percentage,
      units_sold_discount,
      fixed_cost,
      variable_cost
    );

    // 3. Calculate Price Sensitivity Metrics
    const sensitivity = CalculationService.calculateSensitivityMetrics(
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
    const performance = CalculationService.calculateDiscountPerformance(
      units_sold,
      units_sold_discount,
      baseline.profit,
      discount.profit,
      discount_percentage,
      baseline.profit_margin,
      cost_price,
      selling_price,
      variable_cost,
      fixed_cost
    );

    return {
      baseline,
      discount,
      sensitivity,
      performance,
      summary: CalculationService.generateSummary(sensitivity, performance)
    };
  },

  calculateBaselineMetrics: (costPrice, sellingPrice, unitsSold, fixedCost, variableCost) => {
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
  },

  calculateDiscountedMetrics: (costPrice, sellingPrice, baselineUnits, discountPercentage, discountedUnits, fixedCost, variableCost) => {
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
  },

  calculateSensitivityMetrics: (originalPrice, originalQuantity, newPrice, newQuantity, originalRevenue, newRevenue, originalProfit, newProfit) => {
    // Price Elasticity of Demand (PED)
    const priceChange = ((newPrice - originalPrice) / originalPrice) * 100;
    const quantityChange = ((newQuantity - originalQuantity) / originalQuantity) * 100;
    
    let priceElasticity = 0;
    if (priceChange !== 0) {
      priceElasticity = quantityChange / priceChange;
    }

    // Revenue Elasticity
    const revenueChange = ((newRevenue - originalRevenue) / originalRevenue) * 100;
    let revenueElasticity = 0;
    if (priceChange !== 0) {
      revenueElasticity = revenueChange / Math.abs(priceChange);
    }

    // Profit Sensitivity Index (PSI)
    const profitChange = originalProfit !== 0 ? ((newProfit - originalProfit) / Math.abs(originalProfit)) * 100 : 0;
    let profitSensitivityIndex = 0;
    if (priceChange !== 0) {
      profitSensitivityIndex = profitChange / Math.abs(priceChange);
    }

    // Elasticity Classification
    const elasticityClassification = CalculationService.classifyElasticity(priceElasticity);

    return {
      price_elasticity: parseFloat(priceElasticity.toFixed(2)),
      revenue_elasticity: parseFloat(revenueElasticity.toFixed(2)),
      profit_sensitivity_index: parseFloat(profitSensitivityIndex.toFixed(2)),
      elasticity_classification: elasticityClassification
    };
  },

  calculateDiscountPerformance: (baselineUnits, discountUnits, baselineProfit, discountProfit, discountPercentage, baselineMargin, costPrice, sellingPrice, variableCost, fixedCost = 0) => {
    // Discount Lift (% increase in units)
    const discountLift = ((discountUnits - baselineUnits) / baselineUnits) * 100;

    // Incremental Profit
    const incrementalProfit = discountProfit - baselineProfit;

    // Break-even discount (%)
    const breakEvenDiscount = CalculationService.calculateBreakEvenDiscount(
      baselineUnits, 
      costPrice, 
      sellingPrice, 
      variableCost, 
      fixedCost,
      baselineProfit
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
  },

  calculateBreakEvenDiscount: (baselineUnits, costPrice, sellingPrice, variableCost, fixedCost = 0, baselineProfit = null) => {
    try {
      let calculatedBaselineProfit = baselineProfit;
      if (calculatedBaselineProfit === null || calculatedBaselineProfit === undefined) {
        const baselineTotalVariableCost = (costPrice + variableCost) * baselineUnits;
        const baselineTotalCost = baselineTotalVariableCost + parseFloat(fixedCost);
        const baselineRevenue = sellingPrice * baselineUnits;
        calculatedBaselineProfit = baselineRevenue - baselineTotalCost;
      }

      const contributionMarginPerUnit = sellingPrice - (costPrice + variableCost);
      
      if (contributionMarginPerUnit <= 0) {
        return 0;
      }

      const sellingPriceTimesUnits = sellingPrice * baselineUnits;
      const variableCostTimesUnits = (costPrice + variableCost) * baselineUnits;
      
      const numerator = sellingPriceTimesUnits - variableCostTimesUnits - fixedCost - calculatedBaselineProfit;
      const denominator = sellingPriceTimesUnits;
      
      if (denominator === 0) {
        return 0;
      }
      
      const breakEvenDiscountPercent = (numerator / denominator) * 100;
      
      const result = Math.max(0, Math.min(100, parseFloat(breakEvenDiscountPercent.toFixed(2))));
      
      return result;
      
    } catch (error) {
      console.error('Error calculating break-even discount:', error);
      return 0;
    }
  },

  classifyElasticity: (elasticity) => {
    const absElasticity = Math.abs(elasticity);
    
    if (absElasticity === 0) return 'Perfectly Inelastic';
    if (absElasticity < 1) return 'Inelastic';
    if (absElasticity === 1) return 'Unit Elastic';
    if (absElasticity > 1 && absElasticity < 5) return 'Elastic';
    return 'Highly Elastic';
  },

  generateSummary: (sensitivity, performance) => {
    const { elasticity_classification, price_elasticity } = sensitivity;
    const { is_profitable, discount_lift, profit_difference } = performance;

    let recommendation = '';
    let insight = '';

    if (is_profitable) {
      recommendation = 'Discount is profitable. Consider implementing this pricing strategy.';
      insight = `The discount increased units sold by ${discount_lift.toFixed(1)}% and generated additional profit of ₹${profit_difference.toFixed(2)}.`;
    } else {
      recommendation = 'Discount is not profitable. Consider alternative pricing strategies.';
      insight = `The discount decreased profit by ₹${Math.abs(profit_difference).toFixed(2)} despite increasing units sold by ${discount_lift.toFixed(1)}%.`;
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
};

// Format currency to Indian Rupees
const rupeeFormat = (value) => {
  const num = parseFloat(value || 0);
  return `₹${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num)}`;
};

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const AnalysisCreate = () => {
  const navigate = useNavigate();
  const { addScenario } = useScenarios();
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      scenario_name: '',
      description: '',
      cost_price: '',
      selling_price: '',
      units_sold: '',
      discount_percentage: '',
      units_sold_discount: '',
      fixed_cost: '0',
      variable_cost: '0',
      competitor_price: '',
      time_period: 'monthly',
    },
  });

  // Watch form values for real-time calculations
  const formValues = watch();

  const handlePreview = () => {
    if (!formValues.scenario_name || !formValues.cost_price || !formValues.selling_price) {
      setError('Please fill in required fields before preview');
      return;
    }

    try {
      setPreviewLoading(true);
      setError('');
      
      // Validate numeric inputs
      const costPrice = parseFloat(formValues.cost_price);
      const sellingPrice = parseFloat(formValues.selling_price);
      const unitsSold = parseInt(formValues.units_sold);
      const discountPercentage = parseFloat(formValues.discount_percentage);
      const unitsSoldDiscount = parseInt(formValues.units_sold_discount);
      const fixedCost = parseFloat(formValues.fixed_cost || 0);
      const variableCost = parseFloat(formValues.variable_cost || 0);

      if (sellingPrice <= costPrice) {
        setError('Selling price must be greater than cost price');
        return;
      }

      if (unitsSold <= 0 || unitsSoldDiscount <= 0) {
        setError('Units sold must be greater than 0');
        return;
      }

      if (discountPercentage < 0 || discountPercentage > 100) {
        setError('Discount percentage must be between 0 and 100');
        return;
      }

      const inputs = {
        cost_price: costPrice,
        selling_price: sellingPrice,
        units_sold: unitsSold,
        discount_percentage: discountPercentage,
        units_sold_discount: unitsSoldDiscount,
        fixed_cost: fixedCost,
        variable_cost: variableCost,
        competitor_price: formValues.competitor_price ? parseFloat(formValues.competitor_price) : null,
      };

      const calculatedKPIs = CalculationService.calculateAllKPIs(inputs);
      setPreviewData(calculatedKPIs);
    } catch (error) {
      console.error('Preview error:', error);
      setError('Failed to calculate preview. Please check your inputs.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Validate inputs
      const costPrice = parseFloat(formData.cost_price);
      const sellingPrice = parseFloat(formData.selling_price);
      
      if (sellingPrice <= costPrice) {
        setError('Selling price must be greater than cost price');
        setLoading(false);
        return;
      }

      // Prepare inputs
      const inputs = {
        scenario_name: formData.scenario_name,
        description: formData.description || '',
        cost_price: costPrice,
        selling_price: sellingPrice,
        units_sold: parseInt(formData.units_sold),
        discount_percentage: parseFloat(formData.discount_percentage),
        units_sold_discount: parseInt(formData.units_sold_discount),
        fixed_cost: parseFloat(formData.fixed_cost || 0),
        variable_cost: parseFloat(formData.variable_cost || 0),
        competitor_price: formData.competitor_price ? parseFloat(formData.competitor_price) : null,
        time_period: formData.time_period || 'monthly',
      };

      // Calculate KPIs locally
      const calculatedKPIs = CalculationService.calculateAllKPIs(inputs);

      // Create scenario object
      const scenarioData = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        inputs: inputs,
        kpis: calculatedKPIs,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📤 Creating scenario:', scenarioData);

      // Try to add via context (with fallback)
      try {
        const newScenario = await addScenario(scenarioData);
        console.log('✅ Scenario created via context:', newScenario);
      } catch (contextError) {
        console.log('⚠️ Context failed, saving to localStorage:', contextError.message);
        
        // Fallback: Save to localStorage
        const savedScenarios = JSON.parse(localStorage.getItem('pricelens-scenarios') || '[]');
        savedScenarios.push(scenarioData);
        localStorage.setItem('pricelens-scenarios', JSON.stringify(savedScenarios));
        
        // Update context with localStorage data
        window.dispatchEvent(new Event('storage'));
      }
      
      toast.success('Analysis created successfully!');
      reset();
      setPreviewData(null);
      
      // Redirect to the scenarios list
      setTimeout(() => {
        navigate('/scenarios');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Create analysis error:', error);
      console.error('❌ Error details:', error.message);
      
      const errorMessage = error.message || 'Failed to create analysis';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateMargin = () => {
    const cost = parseFloat(formValues.cost_price) || 0;
    const selling = parseFloat(formValues.selling_price) || 0;
    if (selling > cost) {
      return (((selling - cost) / selling) * 100).toFixed(2);
    }
    return '0.00';
  };

  const calculateDiscountPrice = () => {
    const selling = parseFloat(formValues.selling_price) || 0;
    const discount = parseFloat(formValues.discount_percentage) || 0;
    return (selling * (1 - discount / 100)).toFixed(2);
  };

  const getElasticityColor = (elasticity) => {
    const absElasticity = Math.abs(elasticity || 0);
    if (absElasticity === 0) return 'text-gray-500 bg-gray-100';
    if (absElasticity < 1) return 'text-blue-600 bg-blue-100';
    if (absElasticity === 1) return 'text-indigo-600 bg-indigo-100';
    if (absElasticity > 1 && absElasticity < 5) return 'text-purple-600 bg-purple-100';
    return 'text-[#D95B96] bg-pink-100';
  };

  return (
    <div className="min-h-screen bg-white text-black antialiased font-sans">
      
      {/* --- STICKY HEADER --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 bg-white/40 backdrop-blur-md border-b border-gray-100">
        <nav className="bg-white shadow-2xl border border-gray-100 rounded-full px-8 py-2 flex items-center justify-between w-full max-w-6xl transition-all duration-500">
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-3 text-gray-400 group-hover:text-black transition-colors" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-black transition-colors">Back to Dashboard</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center shadow-lg">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">
              New Scenario
            </span>
          </div>

          <div className="w-24"></div>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-[1.5px] w-12 bg-[#D95B96]" />
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#D95B96]">Strategic Analysis</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8]">
                Create New <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-400 to-gray-700">
                  Pricing Scenario
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-gray-100 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                <Activity className="h-3 w-3 mr-2 text-[#D95B96]" />
                Analysis Mode
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Form */}
          <div className="lg:col-span-2 space-y-12">
            <Card className="border border-gray-100 rounded-[4rem] p-12 bg-white shadow-lg">
              <CardHeader className="p-0 mb-10 border-b border-gray-100 pb-8">
                <CardTitle className="text-4xl font-black uppercase tracking-tighter flex items-center">
                  <Calculator className="h-10 w-10 text-black mr-6" />
                  Input Strategy
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0">
                {error && (
                  <div className="mb-10 p-8 border-2 border-red-200 bg-red-50 rounded-[2rem]">
                    <div className="flex items-center mb-4">
                      <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
                      <span className="text-xl font-black uppercase tracking-widest text-red-600">Validation Error</span>
                    </div>
                    <p className="text-gray-700 font-medium">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-10 p-8 border-2 border-emerald-200 bg-emerald-50 rounded-[2rem]">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="h-6 w-6 text-emerald-500 mr-4" />
                      <span className="text-xl font-black uppercase tracking-widest text-emerald-600">Success</span>
                    </div>
                    <p className="text-gray-700 font-medium">{success}</p>
                  </div>
                )}

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="bg-gray-50/50 p-1.5 rounded-full border border-gray-100 inline-flex mb-10">
                    <TabsTrigger value="basic" className="rounded-full px-12 py-4 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#D95B96] transition-all">
                      Basic Info
                    </TabsTrigger>
                    <TabsTrigger value="pricing" className="rounded-full px-12 py-4 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#D95B96] transition-all">
                      Pricing Data
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="rounded-full px-12 py-4 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#D95B96] transition-all">
                      Advanced
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <TabsContent value="basic" className="space-y-10">
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="scenario_name" className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                                Scenario Name *
                              </Label>
                              <Input
                                id="scenario_name"
                                placeholder="e.g., Summer Sale 20% Discount"
                                className="border border-gray-100 rounded-3xl h-16 px-6 text-lg font-medium focus:border-black focus:ring-black"
                                {...register('scenario_name')}
                              />
                              {errors.scenario_name && (
                                <p className="text-sm text-red-500 font-medium">{errors.scenario_name.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Label htmlFor="time_period" className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                              Analysis Period
                            </Label>
                            <div className="relative">
                              <select
                                id="time_period"
                                className="flex h-16 w-full rounded-3xl border border-gray-100 bg-white px-6 text-lg font-medium focus:outline-none focus:border-black"
                                {...register('time_period')}
                              >
                                <option value="daily">Daily Analysis</option>
                                <option value="weekly">Weekly Analysis</option>
                                <option value="monthly">Monthly Analysis</option>
                                <option value="yearly">Yearly Analysis</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label htmlFor="description" className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                            Strategy Description
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Describe your pricing strategy, market conditions, or specific goals..."
                            rows={4}
                            className="border border-gray-100 rounded-3xl px-6 py-4 text-lg font-medium focus:border-black focus:ring-black"
                            {...register('description')}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="pricing" className="space-y-10">
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Baseline Pricing */}
                          <div className="space-y-6 p-8 border-2 border-gray-100 rounded-[2rem] bg-white">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center">
                                <Shield className="h-6 w-6 text-black mr-4" />
                                <span className="text-xl font-black uppercase tracking-tighter">Baseline Pricing</span>
                              </div>
                              <Badge className="bg-gray-100 text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                                No Discount
                              </Badge>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="space-y-3">
                                <Label htmlFor="cost_price" className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                                  Cost Price *
                                </Label>
                                <div className="relative">
                                  <IndianRupee className="absolute left-6 top-5 h-5 w-5 text-gray-400" />
                                  <Input
                                    id="cost_price"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    className="pl-14 border border-gray-100 rounded-2xl h-14 text-lg font-medium focus:border-black"
                                    {...register('cost_price', { valueAsNumber: true })}
                                  />
                                </div>
                                {errors.cost_price && (
                                  <p className="text-sm text-red-500 font-medium">{errors.cost_price.message}</p>
                                )}
                              </div>

                              <div className="space-y-3">
                                <Label htmlFor="selling_price" className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                                  Selling Price *
                                </Label>
                                <div className="relative">
                                  <IndianRupee className="absolute left-6 top-5 h-5 w-5 text-gray-400" />
                                  <Input
                                    id="selling_price"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    className="pl-14 border border-gray-100 rounded-2xl h-14 text-lg font-medium focus:border-black"
                                    {...register('selling_price', { valueAsNumber: true })}
                                  />
                                </div>
                                {errors.selling_price && (
                                  <p className="text-sm text-red-500 font-medium">{errors.selling_price.message}</p>
                                )}
                                {formValues.cost_price && formValues.selling_price && (
                                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Profit Margin</span>
                                    <span className="text-lg font-black text-emerald-500">
                                      {calculateMargin()}%
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                                <Label htmlFor="units_sold" className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                                  Baseline Units *
                                </Label>
                                <div className="relative">
                                  <Package className="absolute left-6 top-5 h-5 w-5 text-gray-400" />
                                  <Input
                                    id="units_sold"
                                    type="number"
                                    min="1"
                                    placeholder="0"
                                    className="pl-14 border border-gray-100 rounded-2xl h-14 text-lg font-medium focus:border-black"
                                    {...register('units_sold', { valueAsNumber: true })}
                                  />
                                </div>
                                {errors.units_sold && (
                                  <p className="text-sm text-red-500 font-medium">{errors.units_sold.message}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Discount Scenario */}
                          <div className="space-y-6 p-8 border-2 border-[#D95B96]/30 rounded-[2rem] bg-gradient-to-br from-white to-pink-50/30">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center">
                                <TrendingUp className="h-6 w-6 text-[#D95B96] mr-4" />
                                <span className="text-xl font-black uppercase tracking-tighter">Discount Strategy</span>
                              </div>
                              <Badge className="bg-[#D95B96] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                                Active
                              </Badge>
                            </div>
                            
                            <div className="space-y-6">
                              <div className="space-y-3">
                                <Label htmlFor="discount_percentage" className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                                  Discount % *
                                </Label>
                                <div className="relative">
                                  <Percent className="absolute left-6 top-5 h-5 w-5 text-gray-400" />
                                  <Input
                                    id="discount_percentage"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                    className="pl-14 border border-gray-100 rounded-2xl h-14 text-lg font-medium focus:border-black"
                                    {...register('discount_percentage', { valueAsNumber: true })}
                                  />
                                </div>
                                {errors.discount_percentage && (
                                  <p className="text-sm text-red-500 font-medium">{errors.discount_percentage.message}</p>
                                )}
                                {formValues.selling_price && formValues.discount_percentage && (
                                  <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                                    <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Discounted Price</span>
                                    <span className="text-lg font-black text-[#D95B96]">
                                      ₹{calculateDiscountPrice()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                                <Label htmlFor="units_sold_discount" className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                                  Projected Units *
                                </Label>
                                <div className="relative">
                                  <Package className="absolute left-6 top-5 h-5 w-5 text-gray-400" />
                                  <Input
                                    id="units_sold_discount"
                                    type="number"
                                    min="1"
                                    placeholder="0"
                                    className="pl-14 border border-gray-100 rounded-2xl h-14 text-lg font-medium focus:border-black"
                                    {...register('units_sold_discount', { valueAsNumber: true })}
                                  />
                                </div>
                                {errors.units_sold_discount && (
                                  <p className="text-sm text-red-500 font-medium">{errors.units_sold_discount.message}</p>
                                )}
                              </div>

                              <div className="space-y-3">
                                <Label htmlFor="competitor_price" className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                                  Competitor Price
                                </Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-6 top-5 h-5 w-5 text-gray-400" />
                                  <Input
                                    id="competitor_price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="pl-14 border border-gray-100 rounded-2xl h-14 text-lg font-medium focus:border-black"
                                    {...register('competitor_price', { valueAsNumber: true })}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="advanced" className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-8">
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <Label htmlFor="fixed_cost" className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                                Fixed Costs
                              </Label>
                              <div className="relative">
                                <IndianRupee className="absolute left-6 top-5 h-5 w-5 text-gray-400" />
                                <Input
                                  id="fixed_cost"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="pl-14 border border-gray-100 rounded-2xl h-14 text-lg font-medium focus:border-black"
                                  {...register('fixed_cost', { valueAsNumber: true })}
                                />
                              </div>
                              <p className="text-sm text-gray-500 font-medium">
                                Rent, salaries, overhead
                              </p>
                            </div>

                            <div className="space-y-4">
                              <Label htmlFor="variable_cost" className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                                Additional Variable Cost
                              </Label>
                              <div className="relative">
                                <IndianRupee className="absolute left-6 top-5 h-5 w-5 text-gray-400" />
                                <Input
                                  id="variable_cost"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="pl-14 border border-gray-100 rounded-2xl h-14 text-lg font-medium focus:border-black"
                                  {...register('variable_cost', { valueAsNumber: true })}
                                />
                              </div>
                              <p className="text-sm text-gray-500 font-medium">
                                Packaging, shipping, etc.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="p-8 border-2 border-gray-100 rounded-[2rem] bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
                            <div className="flex items-start mb-6">
                              <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm mr-6">
                                <Info className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="text-xl font-black uppercase tracking-tighter text-blue-900 mb-4">Advanced Guide</h4>
                                <div className="space-y-3">
                                  <div className="flex items-start">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                                    <span className="text-sm text-blue-800 font-medium">Fixed Costs: Overhead expenses constant regardless of sales</span>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                                    <span className="text-sm text-blue-800 font-medium">Variable Costs: Additional costs per unit sold</span>
                                  </div>
                                  <div className="flex items-start">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                                    <span className="text-sm text-blue-800 font-medium">Competitor Price: For positioning analysis</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <div className="mt-12 pt-10 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handlePreview}
                          disabled={previewLoading}
                          className="h-16 rounded-full border-2 border-gray-100 hover:border-black hover:bg-black hover:text-white transition-all group flex-1"
                        >
                          <div className="flex items-center justify-center">
                            {previewLoading ? (
                              <>
                                <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                                <span className="font-black uppercase tracking-widest text-sm">Calculating...</span>
                              </>
                            ) : (
                              <>
                                <Eye className="h-5 w-5 mr-3" />
                                <span className="font-black uppercase tracking-widest text-sm">Preview Analysis</span>
                              </>
                            )}
                          </div>
                        </Button>
                        
                        <Button 
                          type="submit" 
                          disabled={loading || !previewData}
                          className="h-16 bg-black text-white hover:bg-[#D95B96] rounded-full font-black uppercase tracking-widest text-sm group/btn transition-all shadow-xl flex-1"
                        >
                          {loading ? (
                            <div className="flex items-center justify-center">
                              <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                              <span className="font-black uppercase tracking-widest">Creating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <Save className="h-5 w-5 mr-3" />
                              <span className="font-black uppercase tracking-widest">Save & Analyze</span>
                              <ArrowUpRight className="ml-3 h-5 w-5 group-hover/btn:rotate-45 transition-transform" />
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-1">
            {previewData ? (
              <Card className="border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg sticky top-32">
                <CardHeader className="p-0 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center">
                      <BarChart3 className="h-8 w-8 text-black mr-6" />
                      Live Preview
                    </CardTitle>
                    <Badge 
                      className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                        previewData.performance.is_profitable 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {previewData.performance.is_profitable ? 'Profitable' : 'Not Profitable'}
                    </Badge>
                  </div>
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <Activity className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="font-medium">Analysis generated on {formatDate(new Date())}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 space-y-8">
                  {/* Executive Summary */}
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-black rounded-2xl mr-4">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tighter">Executive Summary</h4>
                    </div>
                    <div className="p-6 border-2 border-gray-100 rounded-[2rem] bg-white">
                      <p className="text-gray-700 font-medium text-base leading-relaxed mb-4">
                        {previewData.summary.recommendation}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Lightbulb className="h-4 w-4 mr-2" />
                        <span className="font-medium">{previewData.summary.key_takeaway}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Performance Metrics */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-black uppercase tracking-tighter flex items-center">
                        <Activity className="h-5 w-5 mr-4" />
                        Performance Metrics
                      </h4>
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">Impact Analysis</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Profit Impact */}
                      <div className="p-5 border-2 border-gray-100 rounded-2xl bg-white">
                        <div className="flex items-center mb-3">
                          <IndianRupee className="h-4 w-4 text-[#D95B96] mr-2" />
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Profit Impact</p>
                        </div>
                        <p className={`text-2xl font-black italic mb-1 ${previewData.performance.profit_difference >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {previewData.performance.profit_difference >= 0 ? '+' : ''}{rupeeFormat(previewData.performance.profit_difference)}
                        </p>
                        <div className="flex items-center text-xs font-black uppercase tracking-widest">
                          {previewData.performance.profit_difference >= 0 ? (
                            <>
                              <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                              <span className="text-emerald-500">Increase</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                              <span className="text-red-500">Decrease</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Demand Lift */}
                      <div className="p-5 border-2 border-gray-100 rounded-2xl bg-white">
                        <div className="flex items-center mb-3">
                          <TrendingUpIcon className="h-4 w-4 text-emerald-500 mr-2" />
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Demand Lift</p>
                        </div>
                        <p className="text-2xl font-black italic text-emerald-500 mb-1">
                          {previewData.performance.discount_lift.toFixed(1)}%
                        </p>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                          Units Increase
                        </p>
                      </div>
                    </div>

                    {/* Profit Comparison */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black uppercase tracking-widest text-gray-400">Profit Comparison</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
                            <span className="text-xs font-medium text-gray-500">Baseline</span>
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-[#D95B96] mr-2"></div>
                            <span className="text-xs font-medium text-gray-500">Discount</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 border-2 border-gray-100 rounded-xl bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Baseline</span>
                            <span className="text-base font-black tabular-nums text-gray-700">
                              {rupeeFormat(previewData.baseline.profit)}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min((previewData.baseline.profit / Math.max(previewData.baseline.profit, previewData.discount.profit, 1)) * 100, 100)} 
                            className="h-1.5 bg-gray-200 rounded-full"
                            indicatorClassName="bg-gray-400 rounded-full"
                          />
                        </div>
                        
                        <div className="p-4 border-2 border-gray-100 rounded-xl bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">With Discount</span>
                            <span className={`text-base font-black tabular-nums ${previewData.performance.is_profitable ? 'text-emerald-500' : 'text-red-500'}`}>
                              {rupeeFormat(previewData.discount.profit)}
                            </span>
                          </div>
                          <Progress 
                            value={Math.min((previewData.discount.profit / Math.max(previewData.baseline.profit, previewData.discount.profit, 1)) * 100, 100)} 
                            className="h-1.5 bg-gray-200 rounded-full"
                            indicatorClassName={`rounded-full ${previewData.performance.is_profitable ? 'bg-emerald-500' : 'bg-red-500'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Elasticity Analysis */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-black uppercase tracking-tighter flex items-center">
                        <LineChart className="h-5 w-5 mr-4" />
                        Price Elasticity
                      </h4>
                      <Badge className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                        Math.abs(previewData.sensitivity.price_elasticity) > 1 
                          ? 'bg-purple-100 text-purple-700 border-purple-200' 
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {Math.abs(previewData.sensitivity.price_elasticity) > 1 ? 'Elastic' : 'Inelastic'}
                      </Badge>
                    </div>
                    
                    <div className="p-6 border-2 border-gray-100 rounded-2xl bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-3xl font-black italic mb-1">
                            {Math.abs(previewData.sensitivity.price_elasticity).toFixed(2)}
                          </p>
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Elasticity Score</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-700 mb-1">
                            {previewData.sensitivity.elasticity_classification}
                          </p>
                          <div className="flex items-center justify-end">
                            <div className={`h-2 w-16 rounded-full bg-gray-200 overflow-hidden`}>
                              <div 
                                className={`h-full rounded-full ${
                                  Math.abs(previewData.sensitivity.price_elasticity) > 1 
                                    ? 'bg-purple-500' 
                                    : 'bg-blue-500'
                                }`}
                                style={{ width: `${Math.min(Math.abs(previewData.sensitivity.price_elasticity) * 20, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
                          <span>Inelastic</span>
                          <span>Unit Elastic</span>
                          <span>Elastic</span>
                        </div>
                        <div className="h-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Break-even Analysis */}
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-amber-100 rounded-2xl mr-4">
                        <TargetIcon className="h-5 w-5 text-amber-600" />
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tighter">Break-even Analysis</h4>
                    </div>
                    
                    <div className="p-6 border-2 border-amber-100 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-2xl font-black italic text-amber-700 mb-1">
                            {previewData.performance.break_even_discount.toFixed(1)}%
                          </p>
                          <p className="text-xs font-black uppercase tracking-widest text-amber-600">Break-even point</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-black ${parseFloat(formValues.discount_percentage || 0) > previewData.performance.break_even_discount ? 'text-red-600' : 'text-emerald-600'}`}>
                            {parseFloat(formValues.discount_percentage || 0).toFixed(1)}%
                          </p>
                          <p className="text-xs font-black uppercase tracking-widest text-amber-600">Your discount</p>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-amber-600 mb-2">
                          <span>0%</span>
                          <span>Breakeven: {previewData.performance.break_even_discount.toFixed(1)}%</span>
                          <span>100%</span>
                        </div>
                        <Progress 
                          value={previewData.performance.break_even_discount} 
                          className="h-2 bg-amber-200 rounded-full"
                          indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                        />
                      </div>
                      
                      <div className="mt-6 p-3 bg-white border border-amber-100 rounded-xl">
                        <div className="flex items-center">
                          {parseFloat(formValues.discount_percentage || 0) > previewData.performance.break_even_discount ? (
                            <>
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-3" />
                              <span className="text-sm font-medium text-red-600">
                                Your discount exceeds break-even point by {(parseFloat(formValues.discount_percentage || 0) - previewData.performance.break_even_discount).toFixed(1)}%
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-emerald-500 mr-3" />
                              <span className="text-sm font-medium text-emerald-600">
                                Your discount is below break-even point by {(previewData.performance.break_even_discount - parseFloat(formValues.discount_percentage || 0)).toFixed(1)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strategic Insights */}
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-[#D95B96]/10 rounded-2xl mr-4">
                        <ZapIcon className="h-5 w-5 text-[#D95B96]" />
                      </div>
                      <h4 className="text-xl font-black uppercase tracking-tighter">Strategic Insights</h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-5 border-2 border-blue-100 rounded-2xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
                        <div className="flex items-start">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                          <p className="text-sm font-medium text-blue-900 leading-relaxed">
                            {previewData.summary.insight}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-5 border-2 border-[#D95B96]/20 rounded-2xl bg-gradient-to-br from-pink-50/30 to-rose-50/30">
                        <div className="flex items-start">
                          <div className="h-2 w-2 rounded-full bg-[#D95B96] mt-2 mr-3 flex-shrink-0"></div>
                          <p className="text-sm font-medium text-gray-900 leading-relaxed">
                            {previewData.summary.elasticity_insight}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg sticky top-32">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center mb-6">
                    <BarChart3 className="h-8 w-8 text-gray-400 mr-6" />
                    Live Preview
                  </CardTitle>
                  <div className="border-b border-gray-100 pb-6">
                    <div className="flex items-center text-sm text-gray-500">
                      <Info className="h-4 w-4 mr-3 text-gray-400" />
                      <span className="font-medium">Fill in the form to see real-time analysis</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Calculator className="h-12 w-12 text-gray-300" />
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tighter mb-6">Ready for Analysis</h4>
                    <p className="text-gray-500 font-medium text-base mb-10 leading-relaxed">
                      Fill in the pricing data to see real-time profitability calculations and insights
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <div className="h-2 w-2 rounded-full bg-[#D95B96] mr-3"></div>
                        <span className="font-black uppercase tracking-widest">Profitability assessment</span>
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <div className="h-2 w-2 rounded-full bg-[#D95B96] mr-3"></div>
                        <span className="font-black uppercase tracking-widest">Break-even analysis</span>
                      </div>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <div className="h-2 w-2 rounded-full bg-[#D95B96] mr-3"></div>
                        <span className="font-black uppercase tracking-widest">Strategic recommendations</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalysisCreate;