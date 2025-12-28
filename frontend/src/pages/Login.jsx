import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../validations/schemas';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  Activity, 
  ShieldCheck,
  Globe,
  Command
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const buttonRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.35;
    const y = (clientY - (top + height / 2)) * 0.35;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => setCoords({ x: 0, y: 0 });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col md:flex-row antialiased selection:bg-pink-200 overflow-hidden font-sans">
      
      {/* --- BACKGROUND NEURAL GRID --- */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#e5e7eb 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

      {/* --- LEFT PANEL: BRAND ANCHOR --- */}
      <div className="hidden md:flex md:w-[50%] bg-black relative flex-col justify-between p-24 border-r border-white/10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] bg-pink-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[120px]" />
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4 cursor-pointer group mb-44" onClick={() => navigate('/')}>
            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
               <Command className="h-7 w-7 text-black" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white uppercase">PriceLens</span>
          </div>

          <div className="space-y-10">
            <div className="inline-flex items-center space-x-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
               <div className="h-2.5 w-2.5 rounded-full bg-pink-500 animate-ping" />
               <span className="text-[11px] font-black uppercase tracking-[0.5em] text-gray-400">System Live // Node 04</span>
            </div>
            <h1 className="text-[110px] font-black tracking-tighter text-white leading-[0.75] uppercase select-none">
              Strategic <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-400 to-gray-700 italic">Access.</span>
            </h1>
            <p className="text-gray-400 text-3xl font-medium tracking-tight max-w-xl leading-snug">
              Unlock systematic pricing logic and verified market positioning.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-12">
          <div className="flex space-x-14">
            <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Protocol</p>
                <p className="text-xl font-black text-white uppercase tracking-tighter">Secure_v4</p>
            </div>
            <div className="space-y-2">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Encryption</p>
                <p className="text-xl font-black text-white uppercase tracking-tighter">End-to-End</p>
            </div>
          </div>
          <Globe className="h-16 w-16 text-white/10 animate-spin-slow" />
        </div>
      </div>

      {/* --- AMPLIFIED SIGNUP/SIGNIN CONTAINER --- */}
      <div className="flex-1 flex items-center justify-center p-10 md:p-24 relative">
        {/* Card width increased to 580px for "Amplify" effect */}
        <Card className="w-full max-w-[580px] bg-white border border-gray-100 rounded-[4rem] shadow-[0_50px_120px_rgba(0,0,0,0.08)] overflow-hidden transition-all hover:shadow-[0_60px_140px_rgba(0,0,0,0.1)] group/card">
          <CardContent className="p-16 md:p-20 relative">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-pink-50 rounded-full blur-[100px] opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />
            
            <div className="mb-16 relative z-10">
              <h2 className="text-5xl font-black tracking-tighter text-black uppercase mb-4">Identify.</h2>
              <div className="h-2 w-16 bg-[#D95B96] rounded-full" />
              <p className="mt-6 text-gray-400 text-xl font-medium tracking-tight leading-relaxed">Enter your authorized credentials to bridge into the engine.</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-10 bg-red-50 border-red-100 text-red-600 rounded-3xl animate-shake relative z-10 py-6">
                <AlertDescription className="font-bold tracking-tight text-sm uppercase flex items-center">
                  <AlertCircle className="h-5 w-5 mr-3" /> {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 relative z-10">
              <div className="space-y-4 group/input">
                <Label className="text-[12px] font-black text-gray-400 uppercase tracking-[0.3em] ml-2 transition-colors group-focus-within/input:text-[#D95B96]">Email ID</Label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  className="h-20 bg-gray-50 border-gray-100 rounded-[1.75rem] text-black placeholder:text-gray-300 focus:bg-white focus:border-[#D95B96] focus:ring-8 focus:ring-pink-500/5 transition-all font-bold text-xl px-8 border-2"
                  {...register('email')}
                />
              </div>

              <div className="space-y-4 group/input">
                <div className="flex justify-between items-center ml-2">
                  <Label className="text-[12px] font-black text-gray-400 uppercase tracking-[0.3em] transition-colors group-focus-within/input:text-[#D95B96]">Password</Label>
                  <Link to="/forgot-password" ml-1 className="text-[11px] font-black text-[#D95B96] uppercase tracking-widest hover:text-black transition-colors">Recover</Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-20 bg-gray-50 border-gray-100 rounded-[1.75rem] text-black placeholder:text-gray-300 focus:bg-white focus:border-[#D95B96] focus:ring-8 focus:ring-pink-500/5 transition-all font-bold text-xl px-8 pr-16 border-2"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#D95B96] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
              </div>

              {/* --- AMPLIFIED MAGNETIC BUTTON --- */}
              <button
                ref={buttonRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ transform: `translate(${coords.x}px, ${coords.y}px)` }}
                type="submit"
                disabled={loading}
                className="group relative w-full h-24 bg-black text-white rounded-[3rem] font-black uppercase tracking-[0.25em] text-sm transition-transform duration-200 ease-out flex items-center justify-center overflow-hidden shadow-2xl active:scale-[0.98]"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-white/10 -skew-x-[45deg] -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />

                {loading ? (
                  <Activity className="h-8 w-8 animate-spin text-white" />
                ) : (
                  <div className="flex items-center relative z-10">
                    <span className="text-lg">Sign In</span>
                    <div className="ml-8 h-12 w-12 bg-[#D95B96] rounded-full flex items-center justify-center text-white transition-all duration-500 group-hover:bg-white group-hover:text-[#D95B96] group-hover:rotate-45 group-hover:scale-110 shadow-xl shadow-pink-500/20">
                      <ArrowUpRight className="h-6 w-6" />
                    </div>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-20 text-center relative z-10">
              <p className="text-gray-400 text-[12px] font-black uppercase tracking-[0.3em] leading-relaxed">
                New to the portal?{' '}
                <Link to="/register" className="text-black border-b-2 border-[#D95B96] hover:border-black transition-all pb-1.5 ">
                 Create Account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;