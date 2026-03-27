import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Chrome, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user document exists, if not create it
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      let role = 'user';

      if (!userDoc.exists()) {
        role = user.email === 'uzafa.shop@gmail.com' ? 'admin' : 'user';
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: role,
          createdAt: new Date().toISOString()
        });
      } else {
        role = userDoc.data()?.role || 'user';
      }
      
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        // For login, we need to check the role
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.data()?.role || 'user';
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        await updateProfile(user, { displayName: name });
        
        // Create user document
        const role = user.email === 'uzafa.shop@gmail.com' ? 'admin' : 'user';
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: name,
          role: role,
          createdAt: new Date().toISOString()
        });

        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || `Failed to ${isLogin ? 'sign in' : 'create account'}`);
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
          <h1 className="text-3xl font-serif font-bold tracking-tight">Vionne</h1>
          <p className="text-zinc-400 mt-2 font-medium">
            {isLogin ? 'Please sign in to continue.' : 'Create an account to get started.'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl shadow-black/5">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-start gap-3">
              <Shield size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:bg-white focus:border-black outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vionne.com"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:bg-white focus:border-black outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:bg-white focus:border-black outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 disabled:opacity-50 group mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform ml-auto" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-white px-4 text-zinc-400 font-bold">Or continue with</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white text-black border border-zinc-200 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all disabled:opacity-50"
          >
            <Chrome size={20} />
            Google Account
          </button>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-zinc-500 hover:text-black transition-colors"
            >
              {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
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
