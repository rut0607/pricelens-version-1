// src/pages/Scenarios.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScenarios } from '../contexts/ScenarioContext';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/formatters';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Alert } from '../components/ui/alert';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Zap,
  Sparkles,
  Target,
  IndianRupee,
  Percent,
  Activity,
  LineChart,
  Clock,
  ArrowLeft,
  ArrowUpRight,
  RefreshCw,
  TargetIcon,
  TrendingDown,
  AlertTriangle,
  Download,
  ChevronDown
} from 'lucide-react';

const Scenarios = () => {
  const navigate = useNavigate();
  const { scenarios, deleteScenario } = useScenarios();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState(new Set());
  
  // State for dropdown visibility
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const limit = 10;

  useEffect(() => {
    setLoading(false);
  }, [scenarios]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowFilterDropdown(false);
      setShowSortDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDelete = async (id, name) => {
    try {
      deleteScenario(id);
      toast.success(`Scenario "${name}" deleted successfully`);
      setDeleteDialog(null);
    } catch (error) {
      toast.error('Failed to delete scenario');
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.size < 2) {
      toast.error('Select at least 2 scenarios to compare');
      return;
    }
    
    const analysisIds = Array.from(selectedForCompare);
    navigate('/compare', { state: { analysisIds } });
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedForCompare);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedForCompare(newSelected);
  };

  // Filter and sort scenarios
  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.inputs?.scenario_name?.toLowerCase().includes(search.toLowerCase()) ||
                         scenario.inputs?.description?.toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'profitable') {
      matchesFilter = scenario.kpis?.performance?.is_profitable === true;
    } else if (filter === 'not-profitable') {
      matchesFilter = scenario.kpis?.performance?.is_profitable === false;
    } else if (filter === 'elastic') {
      matchesFilter = Math.abs(scenario.kpis?.sensitivity?.price_elasticity || 0) > 1;
    } else if (filter === 'inelastic') {
      matchesFilter = Math.abs(scenario.kpis?.sensitivity?.price_elasticity || 0) <= 1;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Sort scenarios
  const sortedScenarios = [...filteredScenarios].sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    } else if (sort === 'oldest') {
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    } else if (sort === 'name') {
      const nameA = (a.inputs?.scenario_name || '').toLowerCase();
      const nameB = (b.inputs?.scenario_name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    } else if (sort === 'profit') {
      const profitA = a.kpis?.performance?.profit_difference || 0;
      const profitB = b.kpis?.performance?.profit_difference || 0;
      return profitB - profitA;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedScenarios.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedScenarios = sortedScenarios.slice(startIndex, startIndex + limit);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const rupeeFormat = (value) => {
    const numValue = parseFloat(value || 0);
    return `₹${new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue)}`;
  };

  const getProfitColor = (profit) => {
    return profit >= 0 ? 'text-emerald-500' : 'text-red-500';
  };

  const getElasticityColor = (elasticity) => {
    const absElasticity = Math.abs(elasticity || 0);
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
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading History...</p>
      </div>
    );
  }

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
              <LineChart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">
              Strategy History
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
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-[#D95B96]">Analysis Repository</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.8]">
                Strategy <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-400 to-gray-700">
                  History
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-gray-100 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                <Activity className="h-3 w-3 mr-2 text-[#D95B96]" />
                {scenarios.length} Active
              </Badge>
              <button
                onClick={() => navigate('/analysis/new')}
                className="group flex items-center bg-black text-white py-3 pr-3 pl-6 rounded-full text-[11px] font-black uppercase tracking-widest transition-all hover:bg-[#D95B96]"
              >
                New Analysis
                <div className="ml-4 h-10 w-10 bg-white/10 rounded-full flex items-center justify-center text-white transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border border-gray-100 rounded-[3rem] p-8 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Total</span>
                <LineChart className="h-6 w-6 text-gray-200" />
              </div>
              <p className="text-5xl font-black tracking-tighter">{scenarios.length}</p>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 rounded-[3rem] p-8 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Profitable</span>
                <CheckCircle className="h-6 w-6 text-emerald-200" />
              </div>
              <p className="text-5xl font-black tracking-tighter text-emerald-500">
                {scenarios.filter(s => s.kpis?.performance?.is_profitable === true).length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 rounded-[3rem] p-8 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Elastic</span>
                <TrendingUp className="h-6 w-6 text-purple-200" />
              </div>
              <p className="text-5xl font-black tracking-tighter text-purple-500">
                {scenarios.filter(s => Math.abs(s.kpis?.sensitivity?.price_elasticity || 0) > 1).length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100 rounded-[3rem] p-8 bg-white shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">High Discount</span>
                <Percent className="h-6 w-6 text-amber-200" />
              </div>
              <p className="text-5xl font-black tracking-tighter text-amber-500">
                {scenarios.filter(s => (s.inputs?.discount_percentage || 0) > 20).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* --- FILTERS & COMPARE SECTION --- */}
        <div className="space-y-8 mb-12">
          {/* Search and Filter Row */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-6 top-5 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search scenarios by name or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-14 h-16 border-2 border-gray-100 rounded-full text-lg font-medium focus:border-black focus:ring-black"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              {/* Filter Dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <div 
                  className="flex items-center h-16 px-6 border-2 border-gray-100 rounded-full text-lg font-medium cursor-pointer hover:border-black transition-all"
                  onClick={() => {
                    setShowFilterDropdown(!showFilterDropdown);
                    setShowSortDropdown(false);
                  }}
                >
                  <Filter className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                    {filter === 'all' ? 'All Scenarios' :
                     filter === 'profitable' ? 'Profitable' :
                     filter === 'not-profitable' ? 'Not Profitable' :
                     filter === 'elastic' ? 'Elastic' : 'Inelastic'}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-3 text-gray-400" />
                </div>
                {showFilterDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50">
                    <div className="py-2">
                      <button 
                        onClick={() => {
                          setFilter('all');
                          setShowFilterDropdown(false);
                        }} 
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[12px] font-black uppercase tracking-widest"
                      >
                        All Scenarios
                      </button>
                      <button 
                        onClick={() => {
                          setFilter('profitable');
                          setShowFilterDropdown(false);
                        }} 
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[12px] font-black uppercase tracking-widest"
                      >
                        Profitable Only
                      </button>
                      <button 
                        onClick={() => {
                          setFilter('not-profitable');
                          setShowFilterDropdown(false);
                        }} 
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[12px] font-black uppercase tracking-widest"
                      >
                        Not Profitable
                      </button>
                      <button 
                        onClick={() => {
                          setFilter('elastic');
                          setShowFilterDropdown(false);
                        }} 
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[12px] font-black uppercase tracking-widest"
                      >
                        Elastic Demand
                      </button>
                      <button 
                        onClick={() => {
                          setFilter('inelastic');
                          setShowFilterDropdown(false);
                        }} 
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[12px] font-black uppercase tracking-widest"
                      >
                        Inelastic Demand
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <div 
                  className="flex items-center h-16 px-6 border-2 border-gray-100 rounded-full text-lg font-medium cursor-pointer hover:border-black transition-all"
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowFilterDropdown(false);
                  }}
                >
                  <Activity className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                    {sort === 'newest' ? 'Newest First' :
                     sort === 'oldest' ? 'Oldest First' :
                     sort === 'name' ? 'Name A-Z' : 'Highest Profit'}
                  </span>
                  <ChevronDown className="h-4 w-4 ml-3 text-gray-400" />
                </div>
                {showSortDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50">
                    <div className="py-2">
                      <button 
                        onClick={() => {
                          setSort('newest');
                          setShowSortDropdown(false);
                        }} 
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[12px] font-black uppercase tracking-widest"
                      >
                        Newest First
                      </button>
                      <button 
                        onClick={() => {
                          setSort('oldest');
                          setShowSortDropdown(false);
                        }} 
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[12px] font-black uppercase tracking-widest"
                      >
                        Oldest First
                      </button>
                      <button 
                        onClick={() => {
                          setSort('name');
                          setShowSortDropdown(false);
                        }} 
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[12px] font-black uppercase tracking-widest"
                      >
                        Name A-Z
                      </button>
                      <button 
                        onClick={() => {
                          setSort('profit');
                          setShowSortDropdown(false);
                        }} 
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-[12px] font-black uppercase tracking-widest"
                      >
                        Highest Profit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compare Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                Selected: {selectedForCompare.size} scenarios
              </span>
            </div>
            <button
              onClick={handleCompare}
              disabled={selectedForCompare.size < 2}
              className={`group flex items-center px-8 py-4 rounded-full text-[12px] font-black uppercase tracking-widest transition-all ${
                selectedForCompare.size < 2 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-[#D95B96]'
              }`}
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              Compare Strategies
              <ArrowUpRight className="ml-3 h-4 w-4 group-hover:rotate-45 transition-transform" />
            </button>
          </div>
        </div>

        {/* --- SCENARIOS TABLE --- */}
        {paginatedScenarios.length === 0 ? (
          <Card className="border border-gray-100 rounded-[4rem] p-20 bg-white shadow-lg">
            <CardContent className="text-center py-16">
              <div className="w-32 h-32 mx-auto mb-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <LineChart className="h-16 w-16 text-gray-300" />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">
                {scenarios.length === 0 ? 'No Scenarios Yet' : 'No Matching Results'}
              </h3>
              <p className="text-gray-500 font-medium text-lg mb-12 max-w-md mx-auto leading-relaxed">
                {scenarios.length === 0 
                  ? 'Start optimizing your pricing strategy by creating your first analysis'
                  : 'Try adjusting your search or filter criteria to find what you\'re looking for'
                }
              </p>
              <button
                onClick={() => navigate('/analysis/new')}
                className="group flex items-center px-8 py-5 bg-black text-white rounded-full text-sm font-black uppercase tracking-widest hover:bg-[#D95B96] transition-all shadow-xl mx-auto"
              >
                <Plus className="h-5 w-5 mr-3" />
                Create First Analysis
                <ArrowUpRight className="ml-4 h-5 w-5 group-hover:rotate-45 transition-transform" />
              </button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-gray-100 rounded-[4rem] p-12 bg-white shadow-lg">
            <CardHeader className="p-0 mb-10 border-b border-gray-100 pb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <CardTitle className="text-4xl font-black uppercase tracking-tighter flex items-center">
                  <LineChart className="h-10 w-10 text-black mr-6" />
                  Strategy Portfolio
                </CardTitle>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                    Showing {startIndex + 1}-{Math.min(startIndex + limit, sortedScenarios.length)} of {sortedScenarios.length}
                  </span>
                  <Clock className="h-5 w-5 text-gray-300" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="rounded-3xl border-2 border-gray-100 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:bg-gray-100">
                      <TableHead className="w-16 p-6">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                            checked={selectedForCompare.size === paginatedScenarios.length && paginatedScenarios.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedForCompare(new Set(paginatedScenarios.map(s => s.id)));
                              } else {
                                setSelectedForCompare(new Set());
                              }
                            }}
                          />
                        </div>
                      </TableHead>
                      <TableHead className="p-6 text-[12px] font-black uppercase tracking-widest text-gray-400">Strategy</TableHead>
                      <TableHead className="p-6 text-[12px] font-black uppercase tracking-widest text-gray-400">Date</TableHead>
                      <TableHead className="p-6 text-[12px] font-black uppercase tracking-widest text-gray-400">Status</TableHead>
                      <TableHead className="p-6 text-[12px] font-black uppercase tracking-widest text-gray-400">Impact</TableHead>
                      <TableHead className="p-6 text-[12px] font-black uppercase tracking-widest text-gray-400">Sensitivity</TableHead>
                      <TableHead className="p-6 text-[12px] font-black uppercase tracking-widest text-gray-400">Discount</TableHead>
                      <TableHead className="p-6 text-[12px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedScenarios.map((scenario) => (
                      <TableRow key={scenario.id} className="hover:bg-gray-50/50 border-b border-gray-100 last:border-b-0">
                        <TableCell className="p-6">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
                              checked={selectedForCompare.has(scenario.id)}
                              onChange={() => toggleSelection(scenario.id)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="p-6">
                          <div className="space-y-2">
                            <div className="font-black text-lg tracking-tight flex items-center">
                              <div className="h-3 w-3 rounded-full bg-[#D95B96] mr-4"></div>
                              {scenario.inputs?.scenario_name || 'Unnamed Scenario'}
                            </div>
                            {scenario.inputs?.description && (
                              <div className="text-sm text-gray-500 font-medium max-w-xs">
                                {scenario.inputs.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-6">
                          <div className="flex items-center text-[12px] font-black uppercase tracking-widest text-gray-400">
                            <Calendar className="h-4 w-4 mr-3 text-gray-300" />
                            {formatDate(scenario.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="p-6">
                          <Badge 
                            className={`
                              flex items-center justify-center px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest
                              ${scenario.kpis?.performance?.is_profitable === true
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-red-500 text-white'
                              }
                            `}
                          >
                            {scenario.kpis?.performance?.is_profitable === true ? (
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
                        </TableCell>
                        <TableCell className="p-6">
                          <div className={`text-2xl font-black italic ${getProfitColor(scenario.kpis?.performance?.profit_difference || 0)}`}>
                            {(scenario.kpis?.performance?.profit_difference || 0) >= 0 ? '+' : ''}{rupeeFormat(scenario.kpis?.performance?.profit_difference || 0)}
                          </div>
                          <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">
                            {(scenario.kpis?.performance?.profit_difference || 0) >= 0 ? (
                              <span className="text-emerald-500">Profit increase</span>
                            ) : (
                              <span className="text-red-500">Profit decrease</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="p-6">
                          <div className="flex items-center">
                            <TrendingUp className={`h-5 w-5 mr-3 ${getElasticityColor(scenario.kpis?.sensitivity?.price_elasticity)}`} />
                            <span className={`text-xl font-black italic ${getElasticityColor(scenario.kpis?.sensitivity?.price_elasticity)}`}>
                              {Math.abs(scenario.kpis?.sensitivity?.price_elasticity || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-1">
                            {Math.abs(scenario.kpis?.sensitivity?.price_elasticity || 0) > 1 ? 'Elastic' : 'Inelastic'}
                          </div>
                        </TableCell>
                        <TableCell className="p-6">
                          <div className="space-y-2">
                            <div className="text-xl font-black italic text-[#D95B96] flex items-center">
                              <Percent className="h-5 w-5 mr-2" />
                              {formatPercentage(scenario.inputs?.discount_percentage || 0)}
                            </div>
                            <div className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center">
                              <IndianRupee className="h-3 w-3 mr-2" />
                              {rupeeFormat(scenario.kpis?.discount?.discounted_price || 0)} price
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => navigate(`/analysis/${scenario.id}`)}
                              className="h-12 w-12 rounded-full bg-black text-white hover:bg-[#D95B96] flex items-center justify-center transition-all shadow-sm group/btn"
                              title="View Analysis"
                            >
                              <Eye className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => setDeleteDialog(scenario)}
                              className="h-12 w-12 rounded-full border-2 border-gray-100 hover:border-red-500 hover:text-red-500 text-gray-400 flex items-center justify-center transition-all shadow-sm group/btn"
                              title="Delete Scenario"
                            >
                              <Trash2 className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-12 pt-10 border-t border-gray-100">
                <div className="text-[12px] font-black uppercase tracking-widest text-gray-400">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-12 w-12 rounded-full border-2 border-gray-100 hover:border-black text-black hover:bg-black hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="flex items-center px-6">
                    <span className="text-lg font-black">
                      {startIndex + 1} - {Math.min(startIndex + limit, sortedScenarios.length)}
                    </span>
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-12 w-12 rounded-full border-2 border-gray-100 hover:border-black text-black hover:bg-black hover:text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Delete Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] border-2 border-gray-100 shadow-2xl w-full max-w-lg mx-4">
            <div className="p-12">
              <div className="flex items-start mb-10">
                <div className="p-4 bg-red-500/10 rounded-2xl mr-6">
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Delete Strategy</h3>
                  <p className="text-gray-500 font-medium text-lg leading-relaxed">
                    Are you sure you want to delete "{deleteDialog?.inputs?.scenario_name || 'Unnamed Scenario'}"?
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="p-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100 mb-10">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">
                    This will permanently delete the scenario and all associated pricing analysis data.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteDialog(null)}
                  className="flex-1 h-16 border-2 border-gray-100 hover:border-black rounded-full text-[12px] font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(deleteDialog?.id, deleteDialog?.inputs?.scenario_name || 'Unnamed Scenario')}
                  className="flex-1 h-16 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-full text-[12px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center"
                >
                  <Trash2 className="h-5 w-5 mr-3" />
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
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
                <p className="text-[11px] font-black uppercase tracking-widest text-[#D95B96] border-b-2 border-[#D95B96]/10 pb-2">Portfolio</p>
                <div>
                    <p className="text-2xl font-black uppercase tracking-widest text-black mb-1 leading-none">{scenarios.length} Scenarios</p>
                    <p className="text-[12px] font-bold text-gray-300 italic tracking-tight">
                      {sortedScenarios.length} filtered
                    </p>
                </div>
             </div>
             <div className="space-y-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-black border-b-2 border-gray-100 pb-2">Current View</p>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-[#D95B96] rounded-full animate-pulse" />
                  <p className="text-[14px] font-black uppercase tracking-widest">Active Repository</p>
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

export default Scenarios;