// src/pages/LandingPage.jsx (replace entire content)
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { 
  ArrowUpRight, 
  ArrowRight,
  Sparkles,
  Activity
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const frameworkSteps = [
    { 
        num: "01", 
        title: "Data Ingestion", 
        desc: "Automated synchronization of historical sales, COGS, and localized price lists to build a clean baseline." 
    },
    { 
        num: "02", 
        title: "Elasticity Modeling", 
        desc: "Systematic detection of price-to-volume sensitivity thresholds using proprietary pricing logic." 
    },
    { 
        num: "03", 
        title: "Execution", 
        desc: "Instant implementation of the optimal discount range with verified margin safety across all channels." 
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased selection:bg-pink-500/30 font-sans">
      
      {/* --- PREMIUM GLASS NAVIGATION --- */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
        <nav className="bg-[#111111]/80 backdrop-blur-xl shadow-2xl border border-white/10 rounded-full px-8 py-2.5 flex items-center justify-between w-full max-w-5xl transition-all duration-500">
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="text-xl font-black tracking-tighter text-white uppercase">
              PriceLens
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-10">
            <a 
              href="#methodology" 
              className="text-[11px] font-bold text-gray-500 hover:text-pink-400 uppercase tracking-[0.25em] transition-colors"
            >
              Methodology
            </a>
            <a 
              href="#contact" 
              className="text-[11px] font-bold text-gray-500 hover:text-pink-400 uppercase tracking-[0.25em] transition-colors"
            >
              Contact
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-[11px] font-bold text-white uppercase tracking-[0.2em] hidden sm:block hover:text-pink-400 transition-colors">
              Sign In
            </Link>
            <button 
              onClick={handleGetStarted}
              className="group flex items-center bg-white text-black py-1 pr-1 pl-5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all hover:bg-pink-500 hover:text-white"
            >
              Start Trial
              <div className="ml-4 h-8 w-8 bg-black rounded-full flex items-center justify-center text-white transition-transform group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-64 pb-40 overflow-hidden">
        <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-pink-400 text-[10px] font-black uppercase tracking-[0.35em] mb-12">
              <Activity className="h-3.5 w-3.5 mr-2.5 animate-pulse" />
              Systematic Verification Active
            </div>
            
            <h1 className="text-[72px] md:text-[124px] font-black tracking-tighter leading-[0.82] mb-14 uppercase">
              Strategic <br /> 
              <span className="bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent italic">Clarity.</span>
            </h1>
            
            <p className="text-xl md:text-3xl text-gray-400 font-medium tracking-tight max-w-2xl leading-snug mb-20">
              Our framework ensures that every pricing adjustment is backed by rigorous data synchronization and strategic modeling.
            </p>
            
            <div className="flex items-center gap-10">
                <button 
                    onClick={handleGetStarted}
                    className="h-20 px-14 bg-white text-black rounded-3xl font-black uppercase tracking-[0.15em] text-sm hover:scale-105 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                >
                    Deploy First Scenario
                </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- VERTICAL METHODOLOGY SECTION --- */}
      <section id="methodology" className="py-48 bg-white text-black rounded-[5rem] relative z-20 shadow-[0_-50px_120px_rgba(0,0,0,0.15)] scroll-mt-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid md:grid-cols-12 gap-24">
            <div className="md:col-span-5 sticky top-48 h-fit">
              <p className="text-[12px] font-black uppercase tracking-[0.5em] text-pink-500 mb-8">The Methodology</p>
              <h2 className="text-[64px] md:text-[84px] font-black tracking-tighter leading-[0.82] mb-14 uppercase">
                Every <br /> decision, <br /> <span className="italic text-gray-200">verified.</span>
              </h2>
              <div className="w-24 h-4 bg-black rounded-full" />
            </div>
            
            <div className="md:col-span-7 space-y-48 py-20">
              {frameworkSteps.map((step, i) => (
                <div key={i} className="relative pl-24 group">
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gray-100 overflow-hidden">
                    <div className="h-0 group-hover:h-full w-full bg-pink-500 transition-all duration-1000 ease-in-out shadow-[0_0_20px_rgba(236,72,153,0.6)]" />
                  </div>
                  
                  <span className="text-[200px] font-black leading-none absolute -left-28 top-[-60px] opacity-[0.03] select-none pointer-events-none transition-all duration-700 group-hover:opacity-[0.07] group-hover:translate-x-6">
                    {step.num}
                  </span>
                  
                  <div className="relative z-10">
                    <h3 className="text-[44px] md:text-[52px] font-black tracking-tighter mb-8 group-hover:text-pink-600 transition-colors uppercase leading-none">
                        {step.title}
                    </h3>
                    <p className="text-gray-500 text-2xl font-medium leading-relaxed max-w-xl">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- ENHANCED FINAL ACTION SECTION --- */}
      <section className="py-40 md:py-60 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[400px] bg-pink-500/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-20">
          <h4 className="text-4xl sm:text-6xl md:text-[110px] font-black tracking-tighter uppercase mb-16 leading-none">
            READY TO <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">EVOLVE ?  </span>
          </h4>
          
          <div className="flex flex-col items-center justify-center">
            <button 
              onClick={handleGetStarted}
              className="group relative flex items-center justify-center gap-4 bg-[#D95B96] hover:bg-[#C24A84] text-white px-8 md:px-12 py-5 md:py-8 rounded-full md:rounded-[2.5rem] transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(217,91,150,0.3)] hover:shadow-[0_0_60px_rgba(217,91,150,0.5)] overflow-hidden"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/10 -skew-x-[45deg] -translate-x-full group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out" />
              
              <span className="text-sm md:text-lg font-black uppercase tracking-[0.2em] relative z-10">
                Start Trial
              </span>
              
              <div className="relative z-10 w-7 h-7 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center transition-all duration-500 group-hover:bg-white group-hover:text-[#D95B96]">
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-500 group-hover:translate-x-1" />
              </div>
            </button>
            
            <p className="mt-8 text-gray-500 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">
              JOIN THE ELITE 1% OF PRICING STRATEGISTS
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer id="contact" className="py-24 border-t border-white/5 bg-black/80 scroll-mt-10">
        <div className="container mx-auto px-10 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-16 text-white">
          <div className="text-center md:text-left">
            <span className="text-3xl font-black tracking-tighter uppercase mb-6 block cursor-pointer hover:text-pink-400 transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              PriceLens
            </span>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.5em]">© 2024 PRICELENS STRATEGIC ANALYTICS. ALL RIGHTS RESERVED.</p>
          </div>
          <div className="flex gap-24 text-gray-400">
            <Link to="/privacy" className="text-[11px] font-bold hover:text-white uppercase tracking-widest transition-colors">Privacy</Link>
            <Link to="/terms" className="text-[11px] font-bold hover:text-white uppercase tracking-widest transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;