import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, LayoutDashboard, Lock, Mail, ArrowRight, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'motion/react';

export function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      navigate('/admin');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-500/10 rounded-full blur-[80px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40 mb-6 group transition-transform hover:scale-110">
            <Command className="h-8 w-8 transition-transform group-hover:rotate-12" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">VIONNE</h1>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Admin Portal</p>
        </div>

        <Card className="border-border/50 bg-card/40 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-6 text-center">
            <CardTitle className="text-2xl font-black tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest opacity-60">Enter your credentials to access the system</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <form onSubmit={handleLogin} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-1">Work Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@vionne.com" 
                    className="h-12 bg-muted/20 border-border/50 pl-11 rounded-2xl focus-visible:ring-primary/20 transition-all font-medium" 
                    required 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest opacity-60">Password</Label>
                  <Button variant="link" className="px-0 font-bold text-[10px] uppercase tracking-widest text-primary h-auto hover:text-primary/80">Forgot?</Button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="h-12 bg-muted/20 border-border/50 pl-11 rounded-2xl focus-visible:ring-primary/20 transition-all" 
                    required 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-1">
                <Checkbox id="remember" className="rounded-md border-border/50 data-[state=checked]:bg-primary" />
                <label htmlFor="remember" className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 opacity-60 cursor-pointer">
                  Remember this device for 30 days
                </label>
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-primary/20 mt-2 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Access Dashboard <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                <span className="bg-[#111216] px-3 text-muted-foreground">Internal Only</span>
              </div>
            </div>

            <Button variant="outline" className="h-12 border-border/50 bg-transparent hover:bg-muted/10 rounded-2xl font-bold text-xs uppercase tracking-widest flex gap-3">
              <Github className="h-5 w-5" /> Login with GitHub
            </Button>
          </CardContent>
          <CardFooter className="pb-8 pt-0 flex flex-col gap-4">
            <p className="text-center text-[10px] text-muted-foreground/40 font-medium px-6 leading-relaxed">
              This is a private enterprise system. Unauthorized access is strictly prohibited and monitored.
            </p>
          </CardFooter>
        </Card>

        <div className="mt-12 flex items-center justify-center gap-8 opacity-20 grayscale">
           <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-4" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Shopify_logo_2018.svg" className="h-5" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/1/18/Vercel_logo.svg" className="h-3" />
        </div>
      </motion.div>
    </div>
  );
}
