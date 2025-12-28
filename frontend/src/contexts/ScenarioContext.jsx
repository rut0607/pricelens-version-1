import React, { createContext, useState, useContext, useEffect } from 'react';

const ScenarioContext = createContext({});

export const useScenarios = () => useContext(ScenarioContext);

export const ScenarioProvider = ({ children }) => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load scenarios from localStorage on init
  useEffect(() => {
    const savedScenarios = localStorage.getItem('price_sensitivity_scenarios');
    if (savedScenarios) {
      try {
        setScenarios(JSON.parse(savedScenarios));
      } catch (error) {
        console.error('Error loading scenarios:', error);
        setScenarios([]);
      }
    }
    setLoading(false);
  }, []);

  // Save scenarios to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('price_sensitivity_scenarios', JSON.stringify(scenarios));
    }
  }, [scenarios, loading]);

  const addScenario = (scenarioData) => {
    const newScenario = {
      id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...scenarioData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setScenarios(prev => [newScenario, ...prev]);
    return newScenario;
  };

  const updateScenario = (id, updates) => {
    setScenarios(prev => 
      prev.map(scenario => 
        scenario.id === id 
          ? { ...scenario, ...updates, updated_at: new Date().toISOString() }
          : scenario
      )
    );
  };

  const deleteScenario = (id) => {
    setScenarios(prev => prev.filter(scenario => scenario.id !== id));
  };

  const getScenarioById = (id) => {
    return scenarios.find(scenario => scenario.id === id);
  };

  const calculateDashboardKPIs = () => {
    if (scenarios.length === 0) {
      return {
        overview: {
          total_scenarios: 0,
          average_profit: 0,
          average_elasticity: 0,
          best_discount: 0,
          discount_win_rate: 0
        },
        recent_analyses: [],
        best_performing: null,
        total_analyses: 0
      };
    }

    const profitableScenarios = scenarios.filter(s => s.kpis?.performance?.is_profitable);
    const totalProfit = scenarios.reduce((sum, s) => sum + (s.kpis?.discount?.profit || 0), 0);
    const totalElasticity = scenarios.reduce((sum, s) => sum + Math.abs(s.kpis?.sensitivity?.price_elasticity || 0), 0);
    
    // Find best performing scenario
    const bestScenario = scenarios.reduce((best, current) => {
      const currentDiff = current.kpis?.performance?.profit_difference || 0;
      const bestDiff = best.kpis?.performance?.profit_difference || 0;
      return currentDiff > bestDiff ? current : best;
    }, scenarios[0]);

    // Get recent analyses (sorted by created_at)
    const recentAnalyses = [...scenarios]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return {
      overview: {
        total_scenarios: scenarios.length,
        average_profit: parseFloat((totalProfit / scenarios.length).toFixed(2)),
        average_elasticity: parseFloat((totalElasticity / scenarios.length).toFixed(2)),
        best_discount: bestScenario?.inputs?.discount_percentage || 0,
        discount_win_rate: parseFloat(((profitableScenarios.length / scenarios.length) * 100).toFixed(2))
      },
      recent_analyses: recentAnalyses.map(scenario => ({
        id: scenario.id,
        scenario_name: scenario.inputs?.scenario_name || 'Unnamed Scenario',
        description: scenario.inputs?.description || '',
        created_at: scenario.created_at,
        scenario_kpis: [scenario.kpis?.performance]
      })),
      best_performing: bestScenario ? {
        id: bestScenario.id,
        scenario_name: bestScenario.inputs?.scenario_name || 'Best Scenario',
        scenario_kpis: [{
          profit_difference: bestScenario.kpis?.performance?.profit_difference || 0
        }]
      } : null,
      total_analyses: scenarios.length
    };
  };

  const value = {
    scenarios,
    loading,
    addScenario,
    updateScenario,
    deleteScenario,
    getScenarioById,
    calculateDashboardKPIs
  };

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
};