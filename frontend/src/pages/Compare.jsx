// src/pages/Compare.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useScenarios } from '../contexts/ScenarioContext';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  IndianRupee,
  Percent,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Maximize2,
  Minimize2,
  Info,
  Package,
  Tag,
  TrendingDown,
  Users,
  BarChart2,
  PieChart,
  Zap,
  Sparkles,
  Activity,
  LineChart,
  Clock,
  ChevronRight,
  Filter,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  Eye
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

const Compare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { scenarios, getScenarioById } = useScenarios();
  const [analyses, setAnalyses] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedView, setExpandedView] = useState(false);

  useEffect(() => {
    const analysisIds = location.state?.analysisIds;
    if (!analysisIds || analysisIds.length < 2) {
      navigate('/scenarios');
      return;
    }
    
    fetchComparison(analysisIds);
  }, [location]);

  const fetchComparison = async (analysisIds) => {
    try {
      setLoading(true);
      setError('');
      
      // Get scenarios by IDs
      const selectedAnalyses = analysisIds
        .map(id => getScenarioById(id))
        .filter(analysis => analysis !== undefined);
      
      if (selectedAnalyses.length < 2) {
        setError('Some selected scenarios were not found');
        setLoading(false);
        return;
      }
      
      setAnalyses(selectedAnalyses);
      
      // Calculate comparison data
      const comparisonData = calculateComparisonData(selectedAnalyses);
      setComparison(comparisonData);
      
    } catch (error) {
      setError('Failed to load comparison data');
      console.error('Comparison fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateComparisonData = (analyses) => {
    if (analyses.length === 0) return null;

    // Find best performing scenario
    const bestScenario = analyses.reduce((best, current) => {
      const currentDiff = current.kpis?.performance?.profit_difference || 0;
      const bestDiff = best.kpis?.performance?.profit_difference || 0;
      return currentDiff > bestDiff ? current : best;
    }, analyses[0]);

    // Calculate summary statistics
    const profitableCount = analyses.filter(a => a.kpis?.performance?.is_profitable).length;
    const totalElasticity = analyses.reduce((sum, a) => sum + Math.abs(a.kpis?.sensitivity?.price_elasticity || 0), 0);
    const totalProfitChange = analyses.reduce((sum, a) => sum + (a.kpis?.performance?.profit_difference || 0), 0);

    return {
      analyses: analyses.map(analysis => ({
        id: analysis.id,
        name: analysis.inputs?.scenario_name || 'Unnamed Scenario',
        discount_percentage: analysis.inputs?.discount_percentage || 0,
        baseline_profit: analysis.kpis?.baseline?.profit || 0,
        discount_profit: analysis.kpis?.discount?.profit || 0,
        profit_difference: analysis.kpis?.performance?.profit_difference || 0,
        price_elasticity: analysis.kpis?.sensitivity?.price_elasticity || 0,
        discount_lift: analysis.kpis?.performance?.discount_lift || 0,
        is_profitable: analysis.kpis?.performance?.is_profitable || false
      })),
      summary: {
        best_performing_discount: bestScenario.inputs?.discount_percentage || 0,
        highest_profit_increase: bestScenario.kpis?.performance?.profit_difference || 0,
        average_elasticity: totalElasticity / analyses.length,
        profitable_count: profitableCount,
        total_count: analyses.length,
        average_profit_change: totalProfitChange / analyses.length
      }
    };
  };

  const exportComparison = () => {
    const dataStr = JSON.stringify({
      comparison: comparison,
      analyses: analyses.map(a => ({
        name: a.inputs?.scenario_name,
        inputs: a.inputs,
        summary: a.kpis?.summary
      }))
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `price-comparison-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Prepare chart data
  const getChartData = () => {
    if (!comparison) return [];
    
    return comparison.analyses.map((analysis, index) => ({
      name: analysis.name.length > 15 ? analysis.name.substring(0, 12) + '...' : analysis.name,
      fullName: analysis.name,
      profitChange: analysis.profit_difference,
      elasticity: Math.abs(analysis.price_elasticity),
      discount: analysis.discount_percentage,
      lift: analysis.discount_lift,
      baselineProfit: analysis.baseline_profit,
      discountProfit: analysis.discount_profit,
      isProfitable: analysis.is_profitable,
      color: ['#D95B96', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'][index % 5],
    }));
  };

  const getProfitComparisonData = () => {
    if (!comparison) return [];
    
    return comparison.analyses.map((analysis, index) => ({
      name: analysis.name.length > 15 ? analysis.name.substring(0, 12) + '...' : analysis.name,
      baseline: analysis.baseline_profit,
      discounted: analysis.discount_profit,
      profitChange: analysis.profit_difference,
      color: ['#D95B96', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'][index % 5],
    }));
  };

  const COLORS = ['#D95B96', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];

  // Helper functions
  const rupeeFormat = (value) => {
    return `₹${new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-[#D95B96] animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Comparison...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Comparison Error</h2>
          <p className="text-gray-500 font-medium text-lg mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/scenarios')}
            className="group flex items-center px-8 py-5 bg-black text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-[#D95B96] transition-all shadow-xl mx-auto"
          >
            Back to Scenarios
            <ArrowUpRight className="ml-4 h-5 w-5 group-hover:rotate-45 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const profitComparisonData = getProfitComparisonData();

  return (
    <div className="min-h-screen bg-white text-black antialiased font-sans">
      
      {/* --- STICKY HEADER --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 bg-white/40 backdrop-blur-md border-b border-gray-100">
        <nav className="bg-white shadow-2xl border border-gray-100 rounded-full px-8 py-2 flex items-center justify-between w-full max-w-6xl transition-all duration-500">
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('/scenarios')}>
            <ArrowLeft className="h-4 w-4 mr-3 text-gray-400 group-hover:text-black transition-colors" />
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-black transition-colors">Back to History</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center shadow-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">
              Strategy Comparison
            </span>
            <Badge className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
              {comparison?.analyses?.length || 0} Scenarios
            </Badge>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setExpandedView(!expandedView)}
              className="h-10 w-10 rounded-full border-2 border-gray-100 hover:border-black text-gray-400 hover:text-black flex items-center justify-center transition-all shadow-sm"
              title={expandedView ? 'Compact View' : 'Expanded View'}
            >
              {expandedView ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={exportComparison}
              className="h-10 w-10 rounded-full border-2 border-gray-100 hover:border-black text-gray-400 hover:text-black flex items-center justify-center transition-all shadow-sm"
              title="Export Comparison"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-[1.5px] w-12 bg-[#D95B96]" />
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#D95B96]">Comparative Analysis</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8]">
                Strategy <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-400 to-gray-700">
                  Matrix
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-gray-100 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                <Activity className="h-3 w-3 mr-2 text-[#D95B96]" />
                Comparative Mode
              </Badge>
            </div>
          </div>
        </div>

        {/* --- SUMMARY CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border border-gray-100 rounded-[3rem] p-8 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Optimal</span>
                <Target className="h-6 w-6 text-[#D95B96]" />
              </div>
              <p className="text-5xl font-black tracking-tighter text-[#D95B96]">
                {formatPercentage(comparison?.summary?.best_performing_discount || 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 rounded-[3rem] p-8 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Max Gain</span>
                <IndianRupee className="h-6 w-6 text-emerald-200" />
              </div>
              <p className="text-5xl font-black tracking-tighter text-emerald-500">
                {rupeeFormat(comparison?.summary?.highest_profit_increase || 0)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 rounded-[3rem] p-8 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Sensitivity</span>
                <TrendingUp className="h-6 w-6 text-purple-200" />
              </div>
              <p className="text-5xl font-black tracking-tighter text-purple-500">
                {comparison?.summary?.average_elasticity?.toFixed(2) || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 rounded-[3rem] p-8 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Success Rate</span>
                <Award className="h-6 w-6 text-green-200" />
              </div>
              <p className="text-5xl font-black tracking-tighter text-green-500">
                {Math.round((comparison?.summary?.profitable_count / comparison?.summary?.total_count) * 100)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-gray-50/50 p-1.5 rounded-full border border-gray-100 inline-flex mb-12">
            <TabsTrigger value="overview" className="rounded-full px-12 py-4 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#D95B96] transition-all">
              Overview
            </TabsTrigger>
            <TabsTrigger value="charts" className="rounded-full px-12 py-4 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#D95B96] transition-all">
              Visuals
            </TabsTrigger>
            <TabsTrigger value="detailed" className="rounded-full px-12 py-4 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#D95B96] transition-all">
              Detailed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-12">
            {/* Comparison Table */}
            <Card className="border border-gray-100 rounded-[4rem] p-12 bg-white shadow-lg">
              <CardHeader className="p-0 mb-10 border-b border-gray-100 pb-8">
                <CardTitle className="text-4xl font-black uppercase tracking-tighter flex items-center">
                  <BarChart3 className="h-10 w-10 text-black mr-6" />
                  Scenario Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-3xl border-2 border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="text-left py-6 px-8 text-[12px] font-black uppercase tracking-widest text-gray-400">Strategy</th>
                        <th className="text-left py-6 px-8 text-[12px] font-black uppercase tracking-widest text-gray-400">Status</th>
                        <th className="text-left py-6 px-8 text-[12px] font-black uppercase tracking-widest text-gray-400">Discount</th>
                        <th className="text-left py-6 px-8 text-[12px] font-black uppercase tracking-widest text-gray-400">Impact</th>
                        <th className="text-left py-6 px-8 text-[12px] font-black uppercase tracking-widest text-gray-400">Sensitivity</th>
                        <th className="text-left py-6 px-8 text-[12px] font-black uppercase tracking-widest text-gray-400">Demand Lift</th>
                        <th className="text-left py-6 px-8 text-[12px] font-black uppercase tracking-widest text-gray-400">Break-even</th>
                        <th className="text-left py-6 px-8 text-[12px] font-black uppercase tracking-widest text-gray-400">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyses.map((analysis, index) => {
                        const kpis = analysis.kpis;
                        const isProfitable = kpis?.performance?.is_profitable;
                        
                        return (
                          <tr key={analysis.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                            <td className="py-8 px-8">
                              <div className="font-black text-lg tracking-tight flex items-center">
                                <div className="h-3 w-3 rounded-full bg-[#D95B96] mr-4"></div>
                                {analysis.inputs?.scenario_name || 'Unnamed Scenario'}
                              </div>
                              <div className="text-sm text-gray-500 font-medium mt-2 max-w-xs">
                                {analysis.inputs?.description || 'No description'}
                              </div>
                            </td>
                            <td className="py-8 px-8">
                              <Badge className={`flex items-center justify-center px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest ${
                                isProfitable 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-red-500 text-white'
                              }`}>
                                {isProfitable ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Profitable
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Not Profitable
                                  </>
                                )}
                              </Badge>
                            </td>
                            <td className="py-8 px-8">
                              <div className="text-xl font-black italic text-[#D95B96]">
                                {formatPercentage(analysis.inputs?.discount_percentage || 0)}
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center mt-1">
                                <IndianRupee className="h-3 w-3 mr-2" />
                                {rupeeFormat(kpis?.discount?.discounted_price || 0)}
                              </div>
                            </td>
                            <td className="py-8 px-8">
                              <div className={`text-2xl font-black italic ${kpis?.performance?.profit_difference >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {kpis?.performance?.profit_difference >= 0 ? '+' : ''}{rupeeFormat(kpis?.performance?.profit_difference || 0)}
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">
                                {kpis?.performance?.profit_difference >= 0 ? '↑ Increase' : '↓ Decrease'}
                              </div>
                            </td>
                            <td className="py-8 px-8">
                              <div className="text-xl font-black italic">
                                {Math.abs(kpis?.sensitivity?.price_elasticity || 0).toFixed(2)}
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">
                                {kpis?.sensitivity?.elasticity_classification}
                              </div>
                            </td>
                            <td className="py-8 px-8">
                              <div className="text-xl font-black italic text-emerald-500">
                                {formatPercentage(kpis?.performance?.discount_lift || 0)}
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">
                                Units Increase
                              </div>
                            </td>
                            <td className="py-8 px-8">
                              <div className="text-xl font-black italic text-amber-500">
                                {formatPercentage(kpis?.performance?.break_even_discount || 0)}
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">
                                Threshold
                              </div>
                            </td>
                            <td className="py-8 px-8">
                              <button
                                onClick={() => navigate(`/analysis/${analysis.id}`)}
                                className="h-12 w-12 rounded-full bg-black text-white hover:bg-[#D95B96] flex items-center justify-center transition-all shadow-sm"
                                title="View Analysis"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card className="border border-gray-100 rounded-[4rem] p-12 bg-gradient-to-br from-black to-gray-900 text-white">
              <CardHeader className="p-0 mb-10 border-b border-white/10 pb-8">
                <CardTitle className="text-4xl font-black uppercase tracking-tighter flex items-center">
                  <Sparkles className="h-10 w-10 text-[#D95B96] mr-6" />
                  Strategic Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-8">
                  {comparison?.analyses && comparison.analyses.length > 0 && (
                    <>
                      <div className="p-8 rounded-2xl border-2 border-[#D95B96]/20 bg-white/5">
                        <div className="flex items-start">
                          <Target className="h-8 w-8 text-[#D95B96] mr-6 flex-shrink-0" />
                          <div>
                            <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Optimal Discount Strategy</h4>
                            <p className="text-gray-300 font-medium text-lg leading-relaxed">
                              A discount of {formatPercentage(comparison.summary.best_performing_discount)} delivered the highest profit increase of{' '}
                              {rupeeFormat(comparison.summary.highest_profit_increase)}.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-8 rounded-2xl border-2 border-emerald-500/20 bg-white/5">
                        <div className="flex items-start">
                          <TrendingUp className="h-8 w-8 text-emerald-500 mr-6 flex-shrink-0" />
                          <div>
                            <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Success Rate Analysis</h4>
                            <p className="text-gray-300 font-medium text-lg leading-relaxed">
                              {comparison.summary.profitable_count} out of {comparison.summary.total_count} scenarios ({Math.round((comparison.summary.profitable_count / comparison.summary.total_count) * 100)}%) are profitable.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-8 rounded-2xl border-2 border-purple-500/20 bg-white/5">
                        <div className="flex items-start">
                          <BarChart2 className="h-8 w-8 text-purple-500 mr-6 flex-shrink-0" />
                          <div>
                            <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Price Sensitivity Pattern</h4>
                            <p className="text-gray-300 font-medium text-lg leading-relaxed">
                              Average price elasticity of {comparison.summary.average_elasticity?.toFixed(2)} indicates{' '}
                              {comparison.summary.average_elasticity > 1 ? 'elastic' : 'inelastic'} demand overall.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-12">
            <div className={`grid ${expandedView ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-12`}>
              {/* Profit Comparison Chart */}
              <Card className="border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center">
                    <IndianRupee className="h-8 w-8 text-black mr-6" />
                    Profit Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={profitComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                        <Tooltip 
                          formatter={(value, name) => [
                            rupeeFormat(value),
                            name === 'profitChange' ? 'Profit Change' : name === 'baseline' ? 'Baseline Profit' : 'Discounted Profit'
                          ]}
                          labelFormatter={(value) => {
                            const analysis = profitComparisonData.find(d => d.name === value);
                            return analysis?.fullName || value;
                          }}
                          contentStyle={{ borderRadius: '1rem', border: '2px solid #f1f5f9' }}
                        />
                        <Legend />
                        <Bar dataKey="baseline" name="Baseline Profit" fill="#94A3B8" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="discounted" name="Discounted Profit" fill="#D95B96" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Price Elasticity Chart */}
              <Card className="border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center">
                    <TrendingUp className="h-8 w-8 text-black mr-6" />
                    Elasticity Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [value.toFixed(2), 'Elasticity']}
                          labelFormatter={(value) => {
                            const analysis = chartData.find(d => d.name === value);
                            return analysis?.fullName || value;
                          }}
                          contentStyle={{ borderRadius: '1rem', border: '2px solid #f1f5f9' }}
                        />
                        <Legend />
                        <Bar dataKey="elasticity" name="Price Elasticity" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Discount Effectiveness Chart */}
              <Card className={`border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg ${expandedView ? '' : 'lg:col-span-2'}`}>
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center">
                    <Target className="h-8 w-8 text-black mr-6" />
                    Effectiveness Matrix
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          type="number" 
                          dataKey="discount" 
                          name="Discount %" 
                          unit="%"
                          domain={[0, 100]}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="profitChange" 
                          name="Profit Change" 
                          tickFormatter={(value) => rupeeFormat(value)}
                        />
                        <ZAxis 
                          type="number" 
                          dataKey="lift" 
                          range={[50, 400]}
                          name="Demand Lift"
                        />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'discount') return [formatPercentage(value), 'Discount %'];
                            if (name === 'profitChange') return [rupeeFormat(value), 'Profit Change'];
                            if (name === 'lift') return [formatPercentage(value), 'Demand Lift %'];
                            return [value, name];
                          }}
                          labelFormatter={(label) => `Scenario: ${label}`}
                          contentStyle={{ borderRadius: '1rem', border: '2px solid #f1f5f9' }}
                        />
                        <Legend />
                        <Scatter 
                          name="Scenarios" 
                          data={chartData} 
                          fill="#D95B96"
                          shape="circle"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Comprehensive Performance Chart */}
              <Card className="lg:col-span-2 border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center">
                    <Activity className="h-8 w-8 text-black mr-6" />
                    Performance Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          padding={{ left: 30, right: 30 }}
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                          formatter={(value, name) => {
                            if (name === 'discount') return [formatPercentage(value), 'Discount %'];
                            if (name === 'profitChange') return [rupeeFormat(value), 'Profit Change'];
                            if (name === 'lift') return [formatPercentage(value), 'Demand Lift %'];
                            if (name === 'elasticity') return [value.toFixed(2), 'Elasticity'];
                            return [value, name];
                          }}
                          labelFormatter={(value) => {
                            const analysis = chartData.find(d => d.name === value);
                            return analysis?.fullName || value;
                          }}
                          contentStyle={{ borderRadius: '1rem', border: '2px solid #f1f5f9' }}
                        />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="profitChange" 
                          name="Profit Change" 
                          stroke="#10B981" 
                          strokeWidth={3}
                          dot={{ r: 6 }}
                          activeDot={{ r: 10 }}
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="discount" 
                          name="Discount %" 
                          stroke="#D95B96" 
                          strokeWidth={3}
                          dot={{ r: 6 }}
                          activeDot={{ r: 10 }}
                        />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="lift" 
                          name="Demand Lift %" 
                          stroke="#F59E0B" 
                          strokeWidth={3}
                          dot={{ r: 6 }}
                          activeDot={{ r: 10 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-12">
            {analyses.map((analysis, index) => {
              const kpis = analysis.kpis;
              const isProfitable = kpis?.performance?.is_profitable;
              
              return (
                <Card key={analysis.id} className="border border-gray-100 rounded-[4rem] p-12 bg-white shadow-lg">
                  <CardHeader className="p-0 mb-10 border-b border-gray-100 pb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <CardTitle className="text-4xl font-black uppercase tracking-tighter flex items-center">
                        <div className={`h-4 w-4 rounded-full ${isProfitable ? 'bg-emerald-500' : 'bg-red-500'} mr-6`}></div>
                        {analysis.inputs?.scenario_name || 'Unnamed Scenario'}
                      </CardTitle>
                      <div className="flex items-center gap-4">
                        <Badge 
                          className={`flex items-center px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest ${
                            isProfitable 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {isProfitable ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Profitable
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Not Profitable
                            </>
                          )}
                        </Badge>
                        <div className="text-right">
                          <div className="text-2xl font-black italic text-[#D95B96]">
                            {formatPercentage(analysis.inputs?.discount_percentage || 0)}
                          </div>
                          <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">Discount Applied</div>
                        </div>
                      </div>
                    </div>
                    {analysis.inputs?.description && (
                      <p className="text-gray-500 font-medium text-lg mt-4 leading-relaxed">
                        {analysis.inputs.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                      {/* Input Parameters Card */}
                      <Card className="border border-gray-100 rounded-[2rem] p-8 bg-white shadow-sm">
                        <CardHeader className="p-0 mb-6">
                          <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center">
                            <Info className="h-6 w-6 text-black mr-4" />
                            <span>Input Parameters</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border-2 border-gray-100 rounded-2xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Cost Price</span>
                              </div>
                              <div className="text-lg font-black flex items-center">
                                <IndianRupee className="h-4 w-4 mr-2" />
                                {rupeeFormat(analysis.inputs?.cost_price || 0)}
                              </div>
                            </div>
                            <div className="p-4 border-2 border-gray-100 rounded-2xl">
                              <div className="flex items-center gap-2 mb-2">
                                <Tag className="h-4 w-4 text-gray-400" />
                                <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Selling Price</span>
                              </div>
                              <div className="text-lg font-black flex items-center">
                                <IndianRupee className="h-4 w-4 mr-2" />
                                {rupeeFormat(analysis.inputs?.selling_price || 0)}
                              </div>
                            </div>
                            <div className="p-4 border-2 border-[#D95B96]/20 rounded-2xl bg-gradient-to-br from-pink-50/30 to-rose-50/30">
                              <div className="flex items-center gap-2 mb-2">
                                <Percent className="h-4 w-4 text-[#D95B96]" />
                                <span className="text-[12px] font-black uppercase tracking-widest text-[#D95B96]">Discount %</span>
                              </div>
                              <div className="text-lg font-black text-[#D95B96]">
                                {formatPercentage(analysis.inputs?.discount_percentage || 0)}
                              </div>
                            </div>
                            <div className="p-4 border-2 border-gray-100 rounded-2xl">
                              <div className="flex items-center gap-2 mb-2">
                                <IndianRupee className="h-4 w-4 text-gray-400" />
                                <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Discounted Price</span>
                              </div>
                              <div className="text-lg font-black">
                                {rupeeFormat(kpis?.discount?.discounted_price || 0)}
                              </div>
                            </div>
                          </div>
                          <div className="mt-6">
                            <div className="text-[12px] font-black uppercase tracking-widest text-gray-400 mb-4">Units Sold Analysis</div>
                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                              <div className="text-center">
                                <div className="text-lg font-black">{analysis.inputs?.units_sold || 0}</div>
                                <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">Baseline</div>
                              </div>
                              <ArrowLeft className="h-6 w-6 text-gray-400 transform rotate-180" />
                              <div className="text-center">
                                <div className="text-lg font-black text-emerald-500">{analysis.inputs?.units_sold_discount || 0}</div>
                                <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">After Discount</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Financial Metrics Card */}
                      <Card className="border border-gray-100 rounded-[2rem] p-8 bg-white shadow-sm">
                        <CardHeader className="p-0 mb-6">
                          <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center">
                            <IndianRupee className="h-6 w-6 text-black mr-4" />
                            <span>Financial Metrics</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="space-y-4">
                            <div className="p-4 border-2 border-gray-100 rounded-2xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Baseline Profit</span>
                                <span className="text-lg font-black flex items-center">
                                  <IndianRupee className="h-4 w-4 mr-2" />
                                  {rupeeFormat(kpis?.baseline?.profit || 0)}
                                </span>
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">Margin: {formatPercentage(kpis?.baseline?.profit_margin || 0)}</div>
                            </div>
                            
                            <div className="p-4 border-2 border-gray-100 rounded-2xl">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Discounted Profit</span>
                                <span className="text-lg font-black flex items-center">
                                  <IndianRupee className="h-4 w-4 mr-2" />
                                  {rupeeFormat(kpis?.discount?.profit || 0)}
                                </span>
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">Margin: {formatPercentage(kpis?.discount?.profit_margin || 0)}</div>
                            </div>
                            
                            <div className={`p-4 rounded-2xl ${isProfitable ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-100' : 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-100'}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[12px] font-black uppercase tracking-widest">Net Profit Impact</span>
                                <span className={`text-lg font-black flex items-center ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {isProfitable ? '+' : ''}<IndianRupee className="h-4 w-4 mr-2" />
                                  {rupeeFormat(kpis?.performance?.profit_difference || 0)}
                                </span>
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest">
                                {isProfitable ? (
                                  <span className="text-emerald-500">↑ {formatPercentage(((kpis?.performance?.profit_difference || 0) / (kpis?.baseline?.profit || 1)) * 100)} increase</span>
                                ) : (
                                  <span className="text-red-500">↓ {formatPercentage(Math.abs(((kpis?.performance?.profit_difference || 0) / (kpis?.baseline?.profit || 1)) * 100))} decrease</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Sensitivity Metrics Card */}
                      <Card className="border border-gray-100 rounded-[2rem] p-8 bg-white shadow-sm">
                        <CardHeader className="p-0 mb-6">
                          <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center">
                            <BarChart2 className="h-6 w-6 text-black mr-4" />
                            <span>Sensitivity Metrics</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border-2 border-purple-100 rounded-2xl bg-gradient-to-br from-purple-50/30 to-pink-50/30">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-4 w-4 text-purple-500" />
                                <span className="text-[12px] font-black uppercase tracking-widest text-purple-500">Price Elasticity</span>
                              </div>
                              <div className="text-lg font-black text-purple-800">
                                {kpis?.sensitivity?.price_elasticity?.toFixed(2)}
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest text-purple-600 mt-2">
                                {kpis?.sensitivity?.elasticity_classification}
                              </div>
                            </div>
                            
                            <div className="p-4 border-2 border-blue-100 rounded-2xl bg-gradient-to-br from-blue-50/30 to-cyan-50/30">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span className="text-[12px] font-black uppercase tracking-widest text-blue-500">Demand Lift</span>
                              </div>
                              <div className="text-lg font-black text-blue-800">
                                {formatPercentage(kpis?.performance?.discount_lift || 0)}
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest text-blue-600 mt-2">
                                Units increase
                              </div>
                            </div>
                            
                            <div className="p-4 border-2 border-amber-100 rounded-2xl bg-gradient-to-br from-amber-50/30 to-orange-50/30">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-amber-500" />
                                <span className="text-[12px] font-black uppercase tracking-widest text-amber-500">Break-even</span>
                              </div>
                              <div className="text-lg font-black text-amber-800">
                                {formatPercentage(kpis?.performance?.break_even_discount || 0)}
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest text-amber-600 mt-2">
                                Discount threshold
                              </div>
                            </div>
                            
                            <div className="p-4 border-2 border-gray-100 rounded-2xl">
                              <div className="flex items-center gap-2 mb-2">
                                <PieChart className="h-4 w-4 text-gray-400" />
                                <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">ROI</span>
                              </div>
                              <div className={`text-lg font-black ${(kpis?.performance?.roi || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {formatPercentage(kpis?.performance?.roi || 0)}
                              </div>
                              <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-2">
                                Return on discount
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Separator className="my-8" />
                    
                    {/* Recommendation Section */}
                    <div className="p-8 rounded-[2rem] border-2 border-black bg-black text-white">
                      <div className="flex items-start">
                        <Target className="h-8 w-8 text-[#D95B96] mr-6 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">Strategic Recommendation</h4>
                          <p className="text-gray-300 font-medium text-lg leading-relaxed mb-4">
                            {kpis?.summary?.recommendation || 'No specific recommendation available.'}
                          </p>
                          <p className="text-gray-400 font-medium">
                            {kpis?.summary?.insight || 'No additional insights available.'}
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-[12px] font-black uppercase tracking-widest ${
                          isProfitable 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {isProfitable ? 'RECOMMENDED' : 'NOT RECOMMENDED'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                      <div className="text-[12px] font-black uppercase tracking-widest text-gray-400 flex items-center">
                        <Clock className="h-4 w-4 mr-3" />
                        Created on {analysis.created_at ? formatDate(analysis.created_at) : 'N/A'}
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => navigate(`/analysis/${analysis.id}`)}
                          className="h-12 px-6 border-2 border-gray-100 hover:border-black rounded-full text-[12px] font-black uppercase tracking-widest transition-all flex items-center"
                        >
                          <BarChart3 className="h-4 w-4 mr-3" />
                          View Full Analysis
                        </button>
                        <button
                          onClick={() => navigate('/scenarios', { state: { editScenarioId: analysis.id } })}
                          className="h-12 px-6 bg-black text-white hover:bg-[#D95B96] rounded-full text-[12px] font-black uppercase tracking-widest transition-all flex items-center shadow-sm"
                        >
                          <TrendingUp className="h-4 w-4 mr-3" />
                          Edit Scenario
                          <ArrowUpRight className="ml-3 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-100 bg-white py-24 mt-20">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="space-y-6">
            <span className="text-4xl font-black tracking-tighter uppercase block cursor-pointer hover:text-[#D95B96] transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              PriceLens
            </span>
            <div className="h-1 w-12 bg-[#D95B96] rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-24 md:gap-32">
             <div className="space-y-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#D95B96] border-b-2 border-[#D95B96]/10 pb-2">Comparative View</p>
                <div>
                    <p className="text-2xl font-black uppercase tracking-widest text-black mb-1 leading-none">
                      {comparison?.analyses?.length || 0} Scenarios
                    </p>
                    <p className="text-[12px] font-bold text-gray-300 italic tracking-tight">
                      Matrix Analysis
                    </p>
                </div>
             </div>
             <div className="space-y-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-black border-b-2 border-gray-100 pb-2">Analysis Mode</p>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-[#D95B96] rounded-full animate-pulse" />
                  <p className="text-[14px] font-black uppercase tracking-widest">Active Comparison</p>
                </div>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Compare;