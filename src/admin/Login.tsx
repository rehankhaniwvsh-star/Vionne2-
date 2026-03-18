import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Chrome } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/10">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Vionne Admin</h1>
          <p className="text-zinc-400 mt-2 font-medium">Please sign in to access the dashboard.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl shadow-black/5">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl">
              {error}
            </div>
          )}
          
          <div className="space-y-6">
            <p className="text-sm text-zinc-500 text-center px-4">
              Access is restricted to authorized administrators. Sign in with your Google account to continue.
            </p>

            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 disabled:opacity-50 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Chrome size={20} />
                  Sign in with Google
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform ml-auto" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-zinc-400 font-medium">
          &copy; 2024 Vionne Luxury Essentials. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};
