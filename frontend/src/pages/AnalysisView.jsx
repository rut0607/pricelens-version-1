// src/pages/AnalysisView.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BarChart3,
  IndianRupee,
  Percent,
  TrendingUp,
  TrendingDown,
  Package,
  Calendar,
  Copy,
  Download,
  Share2,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  LineChart,
  PieChart,
  FileText,
  RefreshCw,
  Plus,
  Zap,
  Target,
  Sparkles,
  Activity,
  Clock,
  ExternalLink,
  ArrowUpRight,
  AlertTriangle,
  Eye,
  ChevronRight,
  Filter,
  Maximize2,
  Minimize2
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const AnalysisView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [expandedView, setExpandedView] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await analysisAPI.getById(id);
      setAnalysis(response.data.data);
    } catch (error) {
      toast.error('Failed to load analysis');
      console.error('Analysis fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await analysisAPI.delete(id);
      toast.success('Analysis deleted successfully');
      setTimeout(() => {
        navigate('/scenarios');
      }, 1500);
    } catch (error) {
      toast.error('Failed to delete analysis');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      setDuplicating(true);
      const response = await analysisAPI.duplicate(id);
      const newAnalysis = response.data.data;
      toast.success('Analysis duplicated successfully');
      setTimeout(() => {
        navigate(`/analysis/${newAnalysis.id}`);
      }, 1500);
    } catch (error) {
      toast.error('Failed to duplicate analysis');
    } finally {
      setDuplicating(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      setExportType('PDF');
      setShowExportMenu(false);
      
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add content to PDF
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('PriceLens Analysis Report', pageWidth / 2, 20, { align: 'center' });
      
      // Analysis Details
      doc.setFontSize(16);
      doc.text(`Analysis: ${analysis.scenario.name}`, 20, 40);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Status: ${analysis.calculated_kpis?.performance?.is_profitable ? 'Profitable' : 'Not Profitable'}`, 20, 50);
      doc.text(`Created: ${new Date(analysis.scenario.created_at).toLocaleDateString()}`, 20, 58);
      
      // Key Metrics
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Metrics', 20, 80);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Price Elasticity: ${Math.abs(analysis.calculated_kpis?.sensitivity?.price_elasticity || 0).toFixed(2)}`, 20, 90);
      doc.text(`Profit Change: ${formatCurrency(analysis.calculated_kpis?.performance?.profit_difference || 0)}`, 20, 98);
      doc.text(`Discount Lift: ${formatPercentage(analysis.calculated_kpis?.performance?.discount_lift || 0)}`, 20, 106);
      doc.text(`Break-even Discount: ${formatPercentage(analysis.calculated_kpis?.performance?.break_even_discount || 0)}`, 20, 114);
      
      // Financial Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Summary', 20, 130);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Baseline Profit: ${formatCurrency(analysis.calculated_kpis?.baseline?.profit || 0)}`, 20, 140);
      doc.text(`Discounted Profit: ${formatCurrency(analysis.calculated_kpis?.discount?.profit || 0)}`, 20, 148);
      doc.text(`Baseline Margin: ${formatPercentage(analysis.calculated_kpis?.baseline?.profit_margin || 0)}`, 20, 156);
      doc.text(`Discounted Margin: ${formatPercentage(analysis.calculated_kpis?.discount?.profit_margin || 0)}`, 20, 164);
      
      // Recommendation
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendation', 20, 180);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const recommendation = analysis.calculated_kpis?.summary?.recommendation || 'No recommendation available.';
      doc.text(recommendation, 20, 190, { maxWidth: pageWidth - 40 });
      
      // Footer
      doc.setFontSize(10);
      doc.text('Generated by PriceLens', pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(new Date().toLocaleDateString(), pageWidth / 2, pageHeight - 5, { align: 'center' });
      
      // Save the PDF
      doc.save(`analysis-${analysis.scenario.name}-${Date.now()}.pdf`);
      
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setExporting(true);
      setShowExportMenu(false);
      
      const dataStr = JSON.stringify(analysis, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis-${analysis.scenario.name}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('JSON exported successfully');
    } catch (error) {
      toast.error('Failed to export JSON');
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/analysis/${id}`;
    setShowExportMenu(false);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Analysis: ${analysis.scenario.name}`,
          text: `Check out this pricing analysis: ${analysis.scenario.name}`,
          url: shareUrl,
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Failed to share. Please copy the link manually.');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
      } catch (error) {
        const copied = window.prompt('Copy this link to share:', shareUrl);
        if (copied) {
          toast.success('Link copied from prompt');
        }
      }
    }
  };

  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy. Please try again.');
    }
  };

  const handleCompare = () => {
    navigate('/compare', {
      state: { analysisIds: [id] }
    });
  };

  const handleEdit = () => {
    navigate(`/analysis/${id}/edit`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRefresh = () => {
    fetchAnalysis();
    toast.success('Analysis data refreshed');
  };

  // Helper functions
  const rupeeFormat = (value) => {
    return `₹${new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0)}`;
  };

  const getProfitColor = (profit) => {
    return profit >= 0 ? 'text-emerald-500' : 'text-red-500';
  };

  const getElasticityColor = (elasticity) => {
    const absElasticity = Math.abs(elasticity);
    if (absElasticity === 0) return 'text-gray-400';
    if (absElasticity < 1) return 'text-blue-500';
    if (absElasticity === 1) return 'text-indigo-500';
    if (absElasticity > 1 && absElasticity < 5) return 'text-purple-500';
    return 'text-[#D95B96]';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-[#D95B96] animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Analysis...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Analysis Not Found</h2>
          <p className="text-gray-500 font-medium text-lg mb-8 leading-relaxed">The analysis you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/scenarios')}
            className="group flex items-center px-8 py-5 bg-black text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-[#D95B96] transition-all shadow-xl mx-auto"
          >
            Back to History
            <ArrowUpRight className="ml-4 h-5 w-5 group-hover:rotate-45 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  const { scenario, inputs, calculated_kpis: kpis } = analysis;
  const isProfitable = kpis?.performance?.is_profitable;

  // Chart data
  const profitComparisonData = [
    { name: 'Baseline', profit: kpis?.baseline?.profit || 0 },
    { name: 'Discounted', profit: kpis?.discount?.profit || 0 },
  ];

  const revenueComparisonData = [
    { name: 'Baseline', revenue: kpis?.baseline?.revenue || 0 },
    { name: 'Discounted', revenue: kpis?.discount?.revenue || 0 },
  ];

  const elasticityData = [
    { name: 'Price Elasticity', value: Math.abs(kpis?.sensitivity?.price_elasticity || 0) },
    { name: 'Revenue Elasticity', value: Math.abs(kpis?.sensitivity?.revenue_elasticity || 0) },
    { name: 'Profit Sensitivity', value: Math.abs(kpis?.sensitivity?.profit_sensitivity_index || 0) },
  ];

  const COLORS = ['#D95B96', '#10B981', '#F59E0B'];

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
              Strategy Analysis
            </span>
            <Badge className={`bg-${isProfitable ? 'emerald' : 'red'}-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full`}>
              {isProfitable ? 'PROFITABLE' : 'NOT PROFITABLE'}
            </Badge>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="h-10 w-10 rounded-full border-2 border-gray-100 hover:border-black text-gray-400 hover:text-black flex items-center justify-center transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <button
              onClick={handleEdit}
              className="h-10 w-10 rounded-full border-2 border-gray-100 hover:border-black text-gray-400 hover:text-black flex items-center justify-center transition-all shadow-sm"
              title="Edit"
            >
              <Edit className="h-5 w-5" />
            </button>
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
          </div>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <div className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-[1.5px] w-12 bg-[#D95B96]" />
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#D95B96]">Detailed Analysis</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8]">
                {scenario.name}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-gray-100 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                <Activity className="h-3 w-3 mr-2 text-[#D95B96]" />
                {scenario.time_period}
              </Badge>
              <div className="flex gap-3">
                <button
                  onClick={handleDuplicate}
                  disabled={duplicating}
                  className="h-12 w-12 rounded-full border-2 border-gray-100 hover:border-black text-gray-400 hover:text-black flex items-center justify-center transition-all shadow-sm"
                  title="Duplicate"
                >
                  {duplicating ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="h-12 w-12 rounded-full border-2 border-gray-100 hover:border-black text-gray-400 hover:text-black flex items-center justify-center transition-all shadow-sm"
                  title="Share"
                >
                  <Share2 className="h-5 w-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={exporting}
                    className="h-12 w-12 rounded-full border-2 border-gray-100 hover:border-black text-gray-400 hover:text-black flex items-center justify-center transition-all shadow-sm"
                    title="Export"
                  >
                    {exporting ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                  </button>
                  {showExportMenu && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border-2 border-gray-100 rounded-2xl shadow-2xl z-50">
                      <button
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 text-[12px] font-black uppercase tracking-widest flex items-center border-b border-gray-100"
                      >
                        <FileText className="h-5 w-5 mr-4 text-blue-600" />
                        Export as PDF
                      </button>
                      <button
                        onClick={handleExportJSON}
                        disabled={exporting}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 text-[12px] font-black uppercase tracking-widest flex items-center"
                      >
                        <FileText className="h-5 w-5 mr-4 text-green-600" />
                        Export as JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {scenario.description && (
            <div className="mt-8 p-8 border-2 border-gray-100 rounded-[2rem] bg-gradient-to-br from-gray-50 to-white max-w-3xl">
              <p className="text-gray-500 font-medium text-lg leading-relaxed">{scenario.description}</p>
              <div className="flex items-center gap-4 mt-6 text-[12px] font-black uppercase tracking-widest text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-3" />
                  Created {formatDate(scenario.created_at)}
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-3" />
                  {formatPercentage(kpis?.performance?.discount_lift || 0)} lift
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`grid ${expandedView ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-12`}>
          {/* Left Column: Main Content */}
          <div className={`${expandedView ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-gray-50/50 p-1.5 rounded-full border border-gray-100 inline-flex mb-12">
                <TabsTrigger value="overview" className="rounded-full px-12 py-4 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#D95B96] transition-all">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="charts" className="rounded-full px-12 py-4 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#D95B96] transition-all">
                  Visuals
                </TabsTrigger>
                <TabsTrigger value="inputs" className="rounded-full px-12 py-4 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#D95B96] transition-all">
                  Inputs
                </TabsTrigger>
                <TabsTrigger value="insights" className="rounded-full px-12 py-4 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-[#D95B96] transition-all">
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-12">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Card className="border border-gray-100 rounded-[3rem] p-8 bg-white shadow-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between mb-8">
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Elasticity</span>
                        <TrendingUp className="h-6 w-6 text-purple-200" />
                      </div>
                      <p className={`text-5xl font-black tracking-tighter ${getElasticityColor(kpis?.sensitivity?.price_elasticity)}`}>
                        {Math.abs(kpis?.sensitivity?.price_elasticity || 0).toFixed(2)}
                      </p>
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-4 px-4">
                        {kpis?.sensitivity?.elasticity_classification}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-100 rounded-[3rem] p-8 bg-white shadow-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between mb-8">
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Impact</span>
                        <IndianRupee className="h-6 w-6 text-emerald-200" />
                      </div>
                      <p className={`text-5xl font-black tracking-tighter ${getProfitColor(kpis?.performance?.profit_difference)}`}>
                        {rupeeFormat(kpis?.performance?.profit_difference || 0)}
                      </p>
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-4">
                        {kpis?.performance?.profit_difference >= 0 ? 'INCREASE' : 'DECREASE'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-100 rounded-[3rem] p-8 bg-white shadow-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between mb-8">
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Demand Lift</span>
                        <TrendingUp className="h-6 w-6 text-blue-200" />
                      </div>
                      <p className="text-5xl font-black tracking-tighter text-emerald-500">
                        {formatPercentage(kpis?.performance?.discount_lift || 0)}
                      </p>
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-4">Units Sold Increase</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Profit Comparison */}
                <Card className="border border-gray-100 rounded-[4rem] p-12 bg-white shadow-lg">
                  <CardHeader className="p-0 mb-10 border-b border-gray-100 pb-8">
                    <CardTitle className="text-4xl font-black uppercase tracking-tighter flex items-center">
                      <IndianRupee className="h-10 w-10 text-black mr-6" />
                      Profit Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-8">
                        <div className="p-8 border-2 border-gray-100 rounded-[2rem] bg-white">
                          <div className="flex items-center mb-6">
                            <div className="h-3 w-3 bg-gray-400 rounded-full mr-4"></div>
                            <span className="text-2xl font-black uppercase tracking-tighter">Baseline (No Discount)</span>
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Revenue</span>
                              <span className="text-xl font-black">{rupeeFormat(kpis?.baseline?.revenue || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Cost</span>
                              <span className="text-xl font-black">{rupeeFormat(kpis?.baseline?.total_cost || 0)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border-2 border-gray-100">
                              <span className="text-xl font-black uppercase tracking-tighter">Profit</span>
                              <span className="text-2xl font-black text-emerald-500">
                                {rupeeFormat(kpis?.baseline?.profit || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white border-2 border-gray-100 rounded-2xl">
                              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Margin</span>
                              <span className="text-xl font-black">{formatPercentage(kpis?.baseline?.profit_margin || 0)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div className="p-8 border-2 border-[#D95B96]/30 rounded-[2rem] bg-gradient-to-br from-white to-pink-50/30">
                          <div className="flex items-center mb-6">
                            <div className="h-3 w-3 bg-[#D95B96] rounded-full mr-4"></div>
                            <span className="text-2xl font-black uppercase tracking-tighter">Discounted Scenario</span>
                          </div>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100">
                              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Revenue</span>
                              <span className="text-xl font-black">{rupeeFormat(kpis?.discount?.revenue || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100">
                              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Cost</span>
                              <span className="text-xl font-black">{rupeeFormat(kpis?.discount?.total_cost || 0)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-white to-pink-50/30 rounded-2xl border-2 border-[#D95B96]/30">
                              <span className="text-xl font-black uppercase tracking-tighter">Profit</span>
                              <span className={`text-2xl font-black ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`}>
                                {rupeeFormat(kpis?.discount?.profit || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-white border-2 border-gray-100 rounded-2xl">
                              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Margin</span>
                              <span className="text-xl font-black">{formatPercentage(kpis?.discount?.profit_margin || 0)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-8 border-2 border-amber-100 rounded-[2rem] bg-gradient-to-br from-amber-50/30 to-orange-50/30">
                          <div className="flex items-center mb-6">
                            <Target className="h-6 w-6 text-amber-600 mr-4" />
                            <span className="text-2xl font-black uppercase tracking-tighter">Break-even Analysis</span>
                          </div>
                          <div className="space-y-6">
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-[12px] font-black uppercase tracking-widest text-amber-600">Threshold</span>
                                <span className="text-2xl font-black italic text-amber-700">
                                  {formatPercentage(kpis?.performance?.break_even_discount || 0)}
                                </span>
                              </div>
                              <Progress 
                                value={Math.min(kpis?.performance?.break_even_discount || 0, 100)} 
                                className="h-3 bg-amber-200 rounded-full"
                                indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                              />
                              <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 mt-4">
                                Your discount: <span className="text-amber-700">{formatPercentage(inputs?.discount_percentage || 0)}</span>
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                              <div className="p-4 border-2 border-gray-100 rounded-2xl bg-white">
                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Incremental Profit</p>
                                <p className={`text-xl font-black ${kpis?.performance?.incremental_profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {rupeeFormat(kpis?.performance?.incremental_profit || 0)}
                                </p>
                              </div>
                              <div className="p-4 border-2 border-gray-100 rounded-2xl bg-white">
                                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2">Revenue Elasticity</p>
                                <p className="text-xl font-black">{kpis?.sensitivity?.revenue_elasticity?.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="charts" className="space-y-12">
                <div className={`grid ${expandedView ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-12`}>
                  <Card className="border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg">
                    <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center">
                        <LineChart className="h-8 w-8 text-black mr-6" />
                        Profit Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={profitComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                            <Tooltip 
                              formatter={(value) => [rupeeFormat(value), 'Profit']}
                              contentStyle={{ borderRadius: '1rem', border: '2px solid #f1f5f9', background: '#ffffff' }}
                            />
                            <Legend />
                            <Bar 
                              dataKey="profit" 
                              name="Profit" 
                              fill={isProfitable ? '#10B981' : '#D95B96'}
                              radius={[8, 8, 0, 0]}
                            />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg">
                    <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center">
                        <TrendingUp className="h-8 w-8 text-black mr-6" />
                        Revenue Comparison
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={revenueComparisonData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `₹${value/1000}k`} />
                            <Tooltip 
                              formatter={(value) => [rupeeFormat(value), 'Revenue']}
                              contentStyle={{ borderRadius: '1rem', border: '2px solid #f1f5f9', background: '#ffffff' }}
                            />
                            <Legend />
                            <Bar 
                              dataKey="revenue" 
                              name="Revenue" 
                              fill="#D95B96"
                              radius={[8, 8, 0, 0]}
                            />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg ${expandedView ? 'lg:col-span-2' : ''}`}>
                    <CardHeader className="p-0 mb-8">
                      <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center">
                        <PieChart className="h-8 w-8 text-black mr-6" />
                        Sensitivity Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={elasticityData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {elasticityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [value.toFixed(2), 'Value']}
                              contentStyle={{ borderRadius: '1rem', border: '2px solid #f1f5f9', background: '#ffffff' }}
                            />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="inputs" className="space-y-12">
                <Card className="border border-gray-100 rounded-[4rem] p-12 bg-white shadow-lg">
                  <CardHeader className="p-0 mb-10 border-b border-gray-100 pb-8">
                    <CardTitle className="text-4xl font-black uppercase tracking-tighter flex items-center">
                      <Package className="h-10 w-10 text-black mr-6" />
                      Input Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-8">
                        <h4 className="text-3xl font-black uppercase tracking-tighter flex items-center">
                          <div className="h-4 w-4 bg-gray-400 rounded-full mr-6"></div>
                          Baseline Scenario
                        </h4>
                        <div className="space-y-6">
                          {[
                            { label: 'Cost Price per Unit', value: rupeeFormat(inputs?.cost_price || 0) },
                            { label: 'Selling Price per Unit', value: rupeeFormat(inputs?.selling_price || 0) },
                            { label: 'Units Sold', value: inputs?.units_sold || 0 },
                            { label: 'Fixed Costs', value: rupeeFormat(inputs?.fixed_cost || 0) },
                            { label: 'Variable Cost per Unit', value: rupeeFormat(inputs?.variable_cost || 0) },
                          ].map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-6 border-2 border-gray-100 rounded-2xl bg-white hover:border-black transition-all">
                              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                              <span className="text-xl font-black">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-8">
                        <h4 className="text-3xl font-black uppercase tracking-tighter flex items-center">
                          <div className="h-4 w-4 bg-[#D95B96] rounded-full mr-6"></div>
                          Discount Scenario
                        </h4>
                        <div className="space-y-6">
                          {[
                            { label: 'Discount Percentage', value: formatPercentage(inputs?.discount_percentage || 0), color: 'text-[#D95B96]' },
                            { label: 'Discounted Price', value: rupeeFormat(kpis?.discount?.discounted_price || 0) },
                            { label: 'Units Sold (After Discount)', value: inputs?.units_sold_discount || 0, color: 'text-emerald-500' },
                            { label: 'Competitor Price', value: inputs?.competitor_price ? rupeeFormat(inputs.competitor_price) : 'Not specified' },
                            { label: 'Time Period', value: scenario.time_period, transform: 'capitalize' },
                          ].map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-6 border-2 border-gray-100 rounded-2xl bg-white hover:border-black transition-all">
                              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                              <span className={`text-xl font-black ${item.color || 'text-gray-900'}`}>
                                {item.transform === 'capitalize' ? item.value.charAt(0).toUpperCase() + item.value.slice(1) : item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-12">
                <Card className="border border-gray-100 rounded-[4rem] p-12 bg-white shadow-lg">
                  <CardHeader className="p-0 mb-10 border-b border-gray-100 pb-8">
                    <CardTitle className="text-4xl font-black uppercase tracking-tighter flex items-center">
                      <Sparkles className="h-10 w-10 text-[#D95B96] mr-6" />
                      Strategic Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-12">
                    <div className="space-y-8">
                      <h4 className="text-3xl font-black uppercase tracking-tighter">Recommendation</h4>
                      <div className="p-8 border-2 border-black bg-black text-white rounded-[2rem]">
                        <p className="text-gray-300 font-medium text-lg leading-relaxed">
                          {kpis?.summary?.recommendation}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <h4 className="text-3xl font-black uppercase tracking-tighter">Detailed Insights</h4>
                      <div className="space-y-6">
                        <div className="p-8 border-2 border-gray-100 rounded-2xl bg-white">
                          <p className="text-gray-700 font-medium text-lg leading-relaxed">
                            {kpis?.summary?.insight}
                          </p>
                        </div>
                        <div className="p-8 border-2 border-[#D95B96]/20 rounded-2xl bg-gradient-to-br from-pink-50/30 to-rose-50/30">
                          <p className="text-gray-700 font-medium text-lg leading-relaxed">
                            {kpis?.summary?.elasticity_insight}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <h4 className="text-3xl font-black uppercase tracking-tighter">Key Takeaways</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 border-2 border-gray-100 rounded-2xl bg-white">
                          <h5 className="text-xl font-black uppercase tracking-tighter mb-4">Profit Impact</h5>
                          <p className="text-gray-600 font-medium">
                            The discount results in a {kpis?.performance?.profit_difference >= 0 ? 'positive' : 'negative'} profit change of{' '}
                            <span className={`font-black ${getProfitColor(kpis?.performance?.profit_difference)}`}>
                              {rupeeFormat(Math.abs(kpis?.performance?.profit_difference || 0))}
                            </span>.
                          </p>
                        </div>

                        <div className="p-8 border-2 border-gray-100 rounded-2xl bg-white">
                          <h5 className="text-xl font-black uppercase tracking-tighter mb-4">Demand Response</h5>
                          <p className="text-gray-600 font-medium">
                            Units sold increased by{' '}
                            <span className="font-black text-emerald-500">
                              {formatPercentage(kpis?.performance?.discount_lift || 0)}
                            </span>, indicating {Math.abs(kpis?.sensitivity?.price_elasticity || 0) > 1 ? 'elastic' : 'inelastic'} demand.
                          </p>
                        </div>

                        <div className="p-8 border-2 border-gray-100 rounded-2xl bg-white">
                          <h5 className="text-xl font-black uppercase tracking-tighter mb-4">Break-even Analysis</h5>
                          <p className="text-gray-600 font-medium">
                            The break-even discount is{' '}
                            <span className="font-black text-amber-500">
                              {formatPercentage(kpis?.performance?.break_even_discount || 0)}
                            </span>. Your discount is{' '}
                            {inputs?.discount_percentage > kpis?.performance?.break_even_discount ? 'above' : 'below'} this threshold.
                          </p>
                        </div>

                        <div className="p-8 border-2 border-gray-100 rounded-2xl bg-white">
                          <h5 className="text-xl font-black uppercase tracking-tighter mb-4">Margin Impact</h5>
                          <p className="text-gray-600 font-medium">
                            Profit margin changed from{' '}
                            <span className="font-black">{formatPercentage(kpis?.baseline?.profit_margin || 0)}</span> to{' '}
                            <span className="font-black">{formatPercentage(kpis?.discount?.profit_margin || 0)}</span>.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Summary & Actions */}
          {!expandedView && (
            <div className="lg:col-span-1 space-y-12">
              {/* Summary Card */}
              <Card className="border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center">
                    <Activity className="h-8 w-8 text-black mr-6" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-6">
                    {[
                      { label: 'Status', value: isProfitable ? 'Profitable' : 'Not Profitable', color: isProfitable ? 'text-emerald-500' : 'text-red-500' },
                      { label: 'Elasticity', value: kpis?.sensitivity?.elasticity_classification },
                      { label: 'Profit Change', value: rupeeFormat(kpis?.performance?.profit_difference || 0), color: getProfitColor(kpis?.performance?.profit_difference) },
                      { label: 'Units Increase', value: formatPercentage(kpis?.performance?.discount_lift || 0), color: 'text-emerald-500' },
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-6 border-2 border-gray-100 rounded-2xl bg-white">
                        <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                        <span className={`text-xl font-black ${item.color || 'text-gray-900'}`}>{item.value}</span>
                      </div>
                    ))}
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">Break-even Discount</span>
                        <span className="text-xl font-black">{formatPercentage(kpis?.performance?.break_even_discount || 0)}</span>
                      </div>
                      <Progress 
                        value={Math.min(kpis?.performance?.break_even_discount || 0, 100)} 
                        className="h-3 bg-gray-100 rounded-full"
                        indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      />
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                        Current discount: <span className="text-amber-500">{formatPercentage(inputs?.discount_percentage || 0)}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card className="border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center">
                    <Zap className="h-8 w-8 text-black mr-6" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-4">
                    {[
                      { icon: Copy, label: duplicating ? 'Duplicating...' : 'Duplicate Analysis', onClick: handleDuplicate, disabled: duplicating },
                      { icon: Edit, label: 'Edit Analysis', onClick: handleEdit },
                      { icon: Copy, label: 'Copy Analysis Link', onClick: () => handleCopyToClipboard(`${window.location.origin}/analysis/${id}`) },
                      { icon: BarChart3, label: 'Compare with Others', onClick: handleCompare },
                      { icon: Trash2, label: deleting ? 'Deleting...' : 'Delete Analysis', onClick: handleDelete, disabled: deleting },
                    ].map((action, index) => (
                      <button
                        key={index}
                        className={`w-full flex items-center justify-between p-6 rounded-2xl text-left transition-all ${
                          action.disabled 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : action.label.includes('Delete') 
                              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                              : 'bg-gray-100 text-black hover:bg-black hover:text-white'
                        }`}
                        onClick={action.onClick}
                        disabled={action.disabled}
                      >
                        <div className="flex items-center">
                          <action.icon className="h-5 w-5 mr-4" />
                          <span className="text-[12px] font-black uppercase tracking-widest">{action.label}</span>
                        </div>
                        {!action.disabled && <ChevronRight className="h-4 w-4" />}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border border-gray-100 rounded-[4rem] p-10 bg-white shadow-lg">
                <CardHeader className="p-0 mb-8">
                  <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center">
                    <Target className="h-8 w-8 text-black mr-6" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-6 border-2 border-gray-100 rounded-2xl bg-white">
                      <p className="text-3xl font-black text-blue-500">
                        {formatPercentage(kpis?.performance?.discount_lift || 0)}
                      </p>
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-2">Demand Lift</p>
                    </div>
                    
                    <div className="p-6 border-2 border-gray-100 rounded-2xl bg-white">
                      <p className={`text-3xl font-black ${getProfitColor(kpis?.performance?.profit_difference)}`}>
                        {kpis?.performance?.profit_difference >= 0 ? '+' : ''}{formatPercentage(
                          (kpis?.performance?.profit_difference / (kpis?.baseline?.profit || 1)) * 100 || 0
                        )}
                      </p>
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-2">Profit Change %</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/analysis/new')}
                    className="w-full flex items-center justify-center p-6 bg-black text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-[#D95B96] transition-all"
                  >
                    <Plus className="h-5 w-5 mr-4" />
                    Create New Analysis
                  </button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Export Menu Backdrop */}
      {showExportMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
        />
      )}

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
                <p className="text-[11px] font-black uppercase tracking-widest text-[#D95B96] border-b-2 border-[#D95B96]/10 pb-2">Analysis View</p>
                <div>
                    <p className="text-2xl font-black uppercase tracking-widest text-black mb-1 leading-none">
                      {scenario.name}
                    </p>
                    <p className="text-[12px] font-bold text-gray-300 italic tracking-tight">
                      {isProfitable ? 'Profitable Strategy' : 'Review Required'}
                    </p>
                </div>
             </div>
             <div className="space-y-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-black border-b-2 border-gray-100 pb-2">Session Status</p>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-[#D95B96] rounded-full animate-pulse" />
                  <p className="text-[14px] font-black uppercase tracking-widest">Active Analysis</p>
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

export default AnalysisView;