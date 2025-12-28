// src/pages/Dashboard.jsx (Updated with second design but original functionality)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useScenarios } from '../contexts/ScenarioContext';
import { formatCurrency, formatPercentage, formatNumber } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ChevronRight,
  Plus,
  Target,
  Award,
  RefreshCw,
  Sparkles,
  Zap,
  Shield,
  Clock,
  Activity,
  ArrowUpRight,
  LineChart,
  AlertCircle,
  Users,
  Building,
  Info,
  TrendingDown,
  PieChart,
  Calendar,
  IndianRupee
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { scenarios, loading: scenariosLoading, calculateDashboardKPIs } = useScenarios();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateDashboardData();
  }, [scenarios]);

  const updateDashboardData = () => {
    try {
      setLoading(true);
      const data = calculateDashboardKPIs();
      setDashboardData(data);
    } catch (error) {
      console.error('Error calculating dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'U';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Update currency format to match second design (Rupee symbol)
  const rupeeFormat = (val) => `₹${formatNumber(val || 0)}`;

  if (scenariosLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-[#D95B96] animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Account...</p>
      </div>
    );
  }

  const hasScenarios = scenarios.length > 0;

  return (
    <div className="min-h-screen bg-white text-black antialiased font-sans">
      
      {/* --- STICKY PREMIUM HEADER --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 bg-white/40 backdrop-blur-md border-b border-gray-100">
        <nav className="bg-white shadow-2xl border border-gray-100 rounded-full px-8 py-2 flex items-center justify-between w-full max-w-6xl transition-all duration-500">
          <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
            <span className="text-xl font-black tracking-tighter text-black uppercase group-hover:text-[#D95B96] transition-colors">
              PriceLens
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-10">
            <button onClick={() => navigate('/dashboard')} className="text-[11px] font-bold text-black border-b-2 border-[#D95B96] uppercase tracking-[0.25em]">Dashboard</button>
            <button onClick={() => navigate('/analysis/new')} className="text-[11px] font-bold text-gray-400 hover:text-[#D95B96] uppercase tracking-[0.25em] transition-colors">New Analysis</button>
            <button onClick={() => navigate('/scenarios')} className="text-[11px] font-bold text-gray-400 hover:text-[#D95B96] uppercase tracking-[0.25em] transition-colors">History</button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden lg:block border-r border-gray-100 pr-4 mr-2">
                <p className="text-[10px] font-black uppercase tracking-tight text-black">{user?.business_name || 'Organization'}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase italic leading-none">{user?.email}</p>
            </div>
            <Avatar className="h-9 w-9 border border-gray-100 shadow-sm">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} />
                <AvatarFallback className="font-black text-[10px]">{getInitials(user?.business_name || user?.email)}</AvatarFallback>
            </Avatar>
            <button onClick={logout} className="group flex items-center bg-black text-white py-1 pr-1 pl-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:bg-red-500">
              Sign Out
              <div className="ml-3 h-7 w-7 bg-white/10 rounded-full flex items-center justify-center text-white transition-transform group-hover:rotate-45">
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </button>
          </div>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <div className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-[1.5px] w-12 bg-pink-500" />
                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-pink-500">Performance Overview</span>
              </div>
              <h1 className="text-7xl font-black tracking-tighter uppercase leading-[0.8]">
                {getGreeting()}, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-gray-400 to-gray-700 italic">
                    {user?.business_name ? user.business_name.split(' ')[0] : 'User'}
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-gray-100 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">
                <Activity className="h-3 w-3 mr-2 text-pink-500" />
                {hasScenarios ? 'Active Data' : 'System Idle'}
              </Badge>
              <Button variant="outline" size="sm" onClick={updateDashboardData} className="rounded-full h-11 border-gray-100 hover:border-black transition-all">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* --- KPI TILES --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <Card className="border border-gray-100 rounded-[3rem] p-12 group hover:border-black transition-all bg-white shadow-sm">
            <div className="flex items-center justify-between mb-16">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Total Scenarios</p>
                <BarChart3 className="h-6 w-6 text-gray-200 group-hover:text-black transition-colors" />
            </div>
            <h3 className="text-7xl font-black tracking-tighter mb-12">{dashboardData?.overview?.total_scenarios || 0}</h3>
            <Button className="w-full h-16 bg-black text-white hover:bg-[#D95B96] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg transition-all active:scale-95" onClick={() => navigate('/analysis/new')}>
                <Plus className="h-4 w-4 mr-3" /> New Analysis
            </Button>
          </Card>

          <Card className="border border-gray-100 rounded-[3rem] p-12 group hover:border-black transition-all bg-white shadow-sm">
            <div className="flex items-center justify-between mb-16">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Avg. Profit Uplift</p>
                <IndianRupee className="h-6 w-6 text-gray-200 group-hover:text-emerald-500 transition-colors" />
            </div>
            <h3 className="text-7xl font-black tracking-tighter mb-12 italic">{rupeeFormat(dashboardData?.overview?.average_profit || 0)}</h3>
            <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Yield Success</span>
                  <span className="text-emerald-500">{dashboardData?.overview?.discount_win_rate || 0}%</span>
                </div>
                <Progress value={dashboardData?.overview?.discount_win_rate || 0} className="h-3 bg-gray-50 border border-gray-100 rounded-full" />
            </div>
          </Card>

          <Card className="border border-gray-100 rounded-[3rem] p-12 group hover:border-black transition-all bg-white shadow-sm">
            <div className="flex items-center justify-between mb-16">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Optimal Node</p>
                <Target className="h-6 w-6 text-gray-200 group-hover:text-pink-500 transition-colors" />
            </div>
            <h3 className="text-7xl font-black tracking-tighter mb-12">{formatPercentage(dashboardData?.overview?.best_discount || 0)}</h3>
            <div className="p-5 bg-gray-50 rounded-3xl flex items-center justify-between border border-gray-100">
                <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <TrendingUp className="h-4 w-4 text-pink-500" />
                    <span>Sensitivity</span>
                </div>
                <span className="text-lg font-black italic">{dashboardData?.overview?.average_elasticity?.toFixed(2) || 0}</span>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-12">
          <TabsList className="bg-gray-50/50 p-1.5 rounded-full border border-gray-100 inline-flex">
            <TabsTrigger value="overview" className="rounded-full px-12 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-pink-500 transition-all">Overview</TabsTrigger>
            <TabsTrigger value="recent" className="rounded-full px-12 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-pink-500 transition-all">Recent Reports</TabsTrigger>
            <TabsTrigger value="insights" className="rounded-full px-12 py-3 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-pink-500 transition-all">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Card className="border border-gray-100 rounded-[3rem] p-10 bg-white shadow-sm">
                <CardHeader className="p-0 mb-10 border-b border-gray-50 pb-6">
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter">Performance Indicators</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                  {[
                    { label: 'Analyses Count', val: dashboardData?.overview?.total_scenarios || 0, icon: BarChart3 },
                    { label: 'Baseline Profit', val: rupeeFormat(dashboardData?.overview?.average_profit || 0), icon: IndianRupee },
                    { label: 'Market Elasticity', val: dashboardData?.overview?.average_elasticity?.toFixed(2) || 0, icon: TrendingUp },
                    { label: 'Discount Win-Rate', val: formatPercentage(dashboardData?.overview?.discount_win_rate || 0), icon: Target },
                  ].map((m, i) => (
                    <div key={i} className="group flex items-center justify-between p-6 border border-gray-50 rounded-[2rem] hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-6">
                        <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"><m.icon className="h-5 w-5 text-black" /></div>
                        <span className="text-[12px] font-black uppercase tracking-widest text-gray-400">{m.label}</span>
                      </div>
                      <span className="text-3xl font-black tabular-nums">{m.val}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border border-gray-100 rounded-[3rem] p-10 bg-black text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px]" />
                <CardHeader className="p-0 mb-10 relative z-10">
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center italic">
                    <Award className="h-6 w-6 text-pink-500 mr-4" /> Top Performer
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 relative z-10">
                  {dashboardData?.best_performing ? (
                    <div className="space-y-16">
                      <div>
                        <h2 className="text-6xl font-black tracking-tighter uppercase leading-[0.8] mb-4 italic">{dashboardData.best_performing.scenario_name}</h2>
                        <div className="h-1 w-20 bg-pink-500 mb-4 rounded-full" />
                      </div>
                      <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Net Profit Delta</p>
                            <p className="text-4xl font-black text-emerald-400 italic">{rupeeFormat(dashboardData.best_performing.scenario_kpis?.[0]?.profit_difference || 0)}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Target Accuracy</p>
                            <p className="text-4xl font-black text-white">{formatPercentage(dashboardData?.overview?.best_discount || 0)}</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full h-20 bg-white text-black hover:bg-pink-500 hover:text-white rounded-full font-black uppercase tracking-widest text-xs group/btn transition-all shadow-xl" 
                        onClick={() => {
                            if(dashboardData.best_performing.id) navigate(`/analysis/${dashboardData.best_performing.id}`);
                            else toast.error("Strategy sync in progress");
                        }}
                      >
                        Detailed Analysis <ArrowUpRight className="ml-4 h-6 w-6 group-hover/btn:rotate-45 transition-transform" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-24 opacity-30 flex flex-col items-center">
                        <Shield className="h-20 w-20 mb-6" />
                        <p className="text-[13px] font-black uppercase tracking-[0.3em]">No Active Reports</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Analyses - Keeping original functionality */}
            <Card className="border border-gray-100 rounded-[3.5rem] p-12 bg-white shadow-sm">
              <CardHeader className="p-0 mb-10 border-b border-gray-50 pb-8">
                <CardTitle className="text-3xl font-black uppercase tracking-tighter italic">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                  {dashboardData?.recent_analyses?.length > 0 ? (
                      dashboardData.recent_analyses.map((analysis, i) => (
                          <div key={analysis.id || i} className="group flex items-center justify-between p-12 border border-gray-50 rounded-[3rem] hover:border-black cursor-pointer transition-all hover:bg-white hover:shadow-2xl" onClick={() => navigate(`/analysis/${analysis.id}`)}>
                              <div className="flex items-center space-x-12">
                                  <span className="text-8xl font-black text-gray-50 group-hover:text-pink-500/20 transition-colors tabular-nums italic">0{i+1}</span>
                                  <div>
                                    <h4 className="font-black uppercase tracking-tight text-3xl mb-3 group-hover:text-[#D95B96] transition-colors">{analysis.scenario_name}</h4>
                                    <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-widest italic">
                                      <Clock className="h-4 w-4 mr-3 text-pink-500" /> 
                                      {new Date(analysis.created_at).toLocaleDateString()}
                                      <span className="mx-2 text-gray-300">•</span>
                                      <span className="truncate">{analysis.description || 'No description'}</span>
                                    </div>
                                  </div>
                              </div>
                              <div className="flex items-center space-x-12">
                                  <div className="text-right">
                                    <p className={`text-4xl font-black italic tabular-nums ${analysis.scenario_kpis?.[0]?.profit_difference >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                      {rupeeFormat(analysis.scenario_kpis?.[0]?.profit_difference || 0)}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Margin Delta</p>
                                  </div>
                                  <div className="h-16 w-16 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                                    <ChevronRight className="h-8 w-8" />
                                  </div>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-24 opacity-30 border-2 border-dashed border-gray-100 rounded-[4rem]">
                        <LineChart className="h-20 w-20 mx-auto mb-6 text-gray-200" />
                        <p className="text-[13px] font-black uppercase tracking-widest">No Strategy History</p>
                      </div>
                  )}
                  
                  {hasScenarios && (
                    <Button 
                      variant="outline" 
                      className="w-full mt-4 h-20 border-gray-100 hover:border-black hover:bg-black hover:text-white rounded-full font-black uppercase tracking-widest text-xs transition-all"
                      onClick={() => navigate('/scenarios')}
                    >
                      View All {scenarios.length} Analyses
                    </Button>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-10">
            <Card className="border border-gray-100 rounded-[3.5rem] p-12 bg-white shadow-sm">
              <CardHeader className="p-0 mb-10 border-b border-gray-50 pb-8">
                <CardTitle className="text-3xl font-black uppercase tracking-tighter italic">All Recent Scenarios</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                  {hasScenarios ? (
                      scenarios.slice(0, 10).map((scenario, i) => (
                          <div key={scenario.id} className="group flex items-center justify-between p-12 border border-gray-50 rounded-[3rem] hover:border-black cursor-pointer transition-all hover:bg-white hover:shadow-2xl" onClick={() => navigate(`/analysis/${scenario.id}`)}>
                              <div className="flex items-center space-x-12">
                                  <span className="text-8xl font-black text-gray-50 group-hover:text-pink-500/20 transition-colors tabular-nums italic">0{i+1}</span>
                                  <div>
                                    <h4 className="font-black uppercase tracking-tight text-3xl mb-3 group-hover:text-[#D95B96] transition-colors">
                                      {scenario.inputs?.scenario_name || 'Unnamed Scenario'}
                                    </h4>
                                    <div className="flex items-center text-[11px] font-bold text-gray-400 uppercase tracking-widest italic">
                                      <Calendar className="h-4 w-4 mr-3 text-pink-500" /> 
                                      {new Date(scenario.created_at).toLocaleDateString()}
                                      <span className="mx-2 text-gray-300">•</span>
                                      <span className="truncate">{scenario.inputs?.description || 'No description'}</span>
                                    </div>
                                  </div>
                              </div>
                              <div className="flex items-center space-x-12">
                                  <div className="text-right">
                                    <p className={`text-4xl font-black italic tabular-nums ${scenario.kpis?.performance?.profit_difference >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                      {rupeeFormat(scenario.kpis?.performance?.profit_difference || 0)}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Profit Change</p>
                                  </div>
                                  <div className="h-16 w-16 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                                    <ChevronRight className="h-8 w-8" />
                                  </div>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-24 opacity-30 border-2 border-dashed border-gray-100 rounded-[4rem]">
                        <LineChart className="h-20 w-20 mx-auto mb-6 text-gray-200" />
                        <p className="text-[13px] font-black uppercase tracking-widest">No Strategy History</p>
                      </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-12">
            <Card className="border border-gray-100 rounded-[4rem] p-20 bg-white shadow-sm">
              <CardHeader className="p-0 mb-16 border-b border-gray-200 pb-10">
                <CardTitle className="text-4xl font-black uppercase tracking-tighter italic text-center">Strategic Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                  {hasScenarios ? (
                      <div className="grid md:grid-cols-2 gap-16">
                          {/* Performance Insight - Keeping original logic */}
                          <div className={`p-16 rounded-[4rem] border-2 shadow-2xl transition-all hover:scale-[1.02] bg-white ${dashboardData?.overview?.discount_win_rate > 70 ? 'border-emerald-100' : 'border-pink-100'}`}>
                              <div className="flex justify-between items-start mb-16">
                                  <div className="h-16 w-16 bg-black rounded-3xl flex items-center justify-center shadow-2xl">
                                    <Zap className={dashboardData?.overview?.discount_win_rate > 70 ? "text-emerald-400 fill-emerald-400" : "text-[#D95B96] fill-[#D95B96]"} size={28}/>
                                  </div>
                                  <Badge className="bg-black text-white px-6 py-2 font-black uppercase tracking-widest text-[10px] rounded-full">
                                    {dashboardData?.overview?.discount_win_rate || 0}% Success
                                  </Badge>
                              </div>
                              <h4 className="text-4xl font-black uppercase tracking-tighter mb-8 italic">Revenue Yield</h4>
                              <p className="text-gray-500 font-medium text-xl leading-relaxed italic">
                                "{dashboardData?.overview?.discount_win_rate > 70 
                                  ? "Strategy confirmed: Current logic has surpassed baseline profitability thresholds." 
                                  : "Calibration required: Strategic models suggest recalibrating safe-margin baselines."}"
                              </p>
                          </div>

                          {/* Elasticity Insight - Keeping original logic */}
                          <div className="p-16 rounded-[4rem] border-2 bg-white border-gray-100 shadow-2xl transition-all hover:scale-[1.02]">
                              <div className="flex justify-between items-start mb-16">
                                  <div className="h-16 w-16 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center">
                                    <TrendingUp className="text-black" size={28}/>
                                  </div>
                                  <div className="px-5 py-2 bg-pink-50 rounded-full text-[#D95B96] font-black text-[10px] uppercase tracking-widest border border-pink-100">
                                    Elasticity: {dashboardData?.overview?.average_elasticity?.toFixed(2) || 0}
                                  </div>
                              </div>
                              <h4 className="text-4xl font-black uppercase tracking-tighter mb-8 italic">Sensitivity</h4>
                              <p className="text-gray-500 font-medium text-xl leading-relaxed italic">
                                "Trend analysis suggests {dashboardData?.overview?.average_elasticity > 2 
                                  ? "High responsiveness to price shifts. Focus on volume metrics." 
                                  : "Stable demand behavior. Focus on premium margin preservation."}"
                              </p>
                          </div>

                          {/* Optimal Discount Insight - Keeping original functionality */}
                          <div className="md:col-span-2 p-16 rounded-[4rem] border-2 border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 shadow-2xl transition-all hover:scale-[1.02]">
                              <div className="flex justify-between items-start mb-16">
                                  <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                    <Target className="h-8 w-8 text-white" />
                                  </div>
                                  <Badge className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-6 py-2 font-black uppercase tracking-widest text-[10px] rounded-full">
                                    Optimal Range
                                  </Badge>
                              </div>
                              <h4 className="text-4xl font-black uppercase tracking-tighter mb-8 italic text-indigo-900">Optimal Discount Range</h4>
                              <p className="text-gray-700 font-medium text-xl leading-relaxed mb-8">
                                Your most effective discount is {formatPercentage(dashboardData?.overview?.best_discount || 0)}. 
                                For similar products, test discounts between {Math.max(0, (dashboardData?.overview?.best_discount || 0) - 5)}% to {Math.min(100, (dashboardData?.overview?.best_discount || 0) + 5)}%.
                              </p>
                              <div className="mt-8">
                                <div className="flex items-center justify-between text-sm mb-3">
                                    <span className="text-indigo-700 font-bold uppercase tracking-widest text-[10px]">Recommended Range</span>
                                    <span className="font-black text-indigo-900 text-lg">
                                        {Math.max(0, (dashboardData?.overview?.best_discount || 0) - 5)}% - {Math.min(100, (dashboardData?.overview?.best_discount || 0) + 5)}%
                                    </span>
                                </div>
                                <Progress 
                                  value={dashboardData?.overview?.best_discount || 0} 
                                  className="h-3 bg-indigo-100 rounded-full"
                                  indicatorClassName="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full"
                                />
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center py-24 opacity-30 flex flex-col items-center">
                        <RefreshCw className="h-20 w-20 mx-auto mb-6 text-gray-200 animate-spin-slow"/>
                        <p className="text-[13px] font-black uppercase tracking-widest">Waiting for Calibration</p>
                        <Button 
                          className="mt-8 h-16 bg-black text-white hover:bg-[#D95B96] rounded-full font-black uppercase tracking-widest text-xs px-12 transition-all"
                          onClick={() => navigate('/analysis/new')}
                        >
                          <Sparkles className="h-4 w-4 mr-3" />
                          Generate Insights
                        </Button>
                      </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-100 bg-white py-24 mt-20">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="space-y-6">
            <span className="text-4xl font-black tracking-tighter uppercase block">PriceLens</span>
            <div className="h-1 w-12 bg-[#D95B96] rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-24 md:gap-32">
             <div className="space-y-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#D95B96] border-b-2 border-[#D95B96]/10 pb-2">Organization</p>
                <div>
                    <p className="text-xl font-black uppercase tracking-widest text-black mb-1 leading-none">{user?.business_name || 'Organization'}</p>
                    <p className="text-[12px] font-bold text-gray-300 italic tracking-tight lowercase">{user?.email}</p>
                </div>
             </div>
             <div className="space-y-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-black border-b-2 border-gray-100 pb-2">Service Status</p>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                  <p className="text-[14px] font-black uppercase tracking-widest">Active Session</p>
                </div>
                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Surat, Gujarat</p>
                {hasScenarios && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Last Updated</p>
                    <p className="text-sm font-black text-black">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;