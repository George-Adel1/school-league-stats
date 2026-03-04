import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, CheckCircle, X, Eye, EyeOff, Check } from "lucide-react";
import loginBg from "@/assets/login-bg.png";

const ALLOWED_DOMAIN = "@donboscocairo.org";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "A mix of upper-case and lower-case", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "At least 1 number", test: (p: string) => /\d/.test(p) },
  { label: "At least one special character e.g. -!&*", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const progressBars = Array.from({ length: 20 }, (_, i) => i < 16);

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const { toast } = useToast();

  const passwordValid = useMemo(() => passwordRules.every((r) => r.test(password)), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!isLogin) {
        if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
          throw new Error(`Only emails ending with ${ALLOWED_DOMAIN} are allowed to sign up.`);
        }
        if (!passwordValid) {
          throw new Error("Password does not meet all requirements.");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setSignupSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Signup success screen
  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
        <div className="w-full max-w-md bg-[#111] border border-[#2a2a2a] rounded-2xl p-8 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#00c853]/20 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-[#00c853]" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">Check Your Email</h2>
          <p className="text-[#999] text-sm leading-relaxed">
            Please check your school email to verify your account before logging in.
          </p>
          <Button
            variant="outline"
            className="w-full border-[#2a2a2a] text-white hover:bg-[#1a1a1a]"
            onClick={() => { setSignupSuccess(false); setIsLogin(true); setShowForm(true); }}
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background image */}
      <img src={loginBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none select-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none" />

      {/* Auth Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-[#111] border border-[#2a2a2a] rounded-2xl p-8 space-y-5 animate-fade-in">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-[#666] hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black uppercase tracking-wide">
                {isLogin ? "Sign In" : "Create Account"}
              </h2>
              <p className="text-sm text-[#888]">
                {isLogin ? "Welcome back to Goal Bosco" : "Join the Don Bosco League"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-[#aaa] uppercase tracking-wider">
                  School Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={`name${ALLOWED_DOMAIN}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#555] focus-visible:ring-[#00c853]"
                />
                {!isLogin && (
                  <p className="text-[10px] text-[#666]">Only {ALLOWED_DOMAIN} emails are accepted.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs text-[#aaa] uppercase tracking-wider">
                  {isLogin ? "Password" : "Create Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={isLogin ? 1 : 8}
                    className="bg-[#1a1a1a] border-[#2a2a2a] text-white pr-10 focus-visible:ring-[#00c853]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password requirements - only on signup */}
              {!isLogin && (
                <div className="space-y-1.5 bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
                  <p className="text-[10px] text-[#888] uppercase tracking-wider font-semibold mb-1">
                    Account Password Requirements
                  </p>
                  {passwordRules.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <div key={rule.label} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passed ? "bg-[#00c853]" : "bg-[#333]"}`}>
                          {passed && <Check className="w-2.5 h-2.5 text-black" />}
                        </div>
                        <span className={passed ? "text-[#ccc]" : "text-[#666]"}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || (!isLogin && !passwordValid)}
                className="w-full bg-[#00c853] hover:bg-[#00e676] text-black font-bold uppercase tracking-wider h-11"
              >
                {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-xs text-[#666]">
              {isLogin ? "No account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#00c853] hover:underline font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Landing Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="px-6 py-4">
          <span className="font-black text-sm tracking-[0.3em] uppercase">Goal Bosco</span>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-between px-6 md:px-12 pb-8">
          <div className="flex flex-col lg:flex-row gap-8 mt-8 lg:mt-16">
            {/* Left */}
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.95] tracking-tight">
                Your Don Bosco Football Digital Stream
              </h1>
              <p className="text-sm md:text-base uppercase tracking-wide text-[#ccc] max-w-2xl leading-relaxed">
                Track real match performance, climb the standings, and see your name on the leaderboard inside the official Don Bosco league system.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-[#00c853] hover:bg-[#00e676] text-black font-bold uppercase tracking-wider text-sm px-8 py-6 rounded-full mt-4"
              >
                Join the League <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Right side stats */}
            <div className="lg:w-72 space-y-4 text-right hidden lg:block">
              <div>
                <p className="text-3xl font-black uppercase leading-tight">More Then</p>
                <p className="text-4xl font-black uppercase text-[#00c853]">15+ Team</p>
              </div>
              <p className="text-xs uppercase text-[#00c853] leading-relaxed">
                It's not just a match anymore.
                <br />
                It's your stats.
              </p>
            </div>
          </div>

          {/* Bottom section */}
          <div className="flex flex-col lg:flex-row items-end gap-6 mt-12">
            <div className="space-y-2 lg:w-80">
              <p className="text-xs uppercase tracking-wide text-[#ccc] leading-relaxed">
                Your real-life matches now affect your in-game stats.
                <br />
                Score goals. Get assists. Dominate matches.
                <br />
                Watch your rating grow after every performance.
              </p>
            </div>

            {/* Stats cards row */}
            <div className="flex gap-3 flex-1 justify-end flex-wrap">
              {/* Player stats card */}
              <div className="bg-[#111]/80 border border-[#2a2a2a] rounded-xl p-4 w-56 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#00c853] text-2xl font-black">24%</span>
                  <span className="text-[10px] uppercase text-[#888]">Goal Rate</span>
                </div>
                <div className="flex gap-4 mb-3">
                  <div>
                    <span className="text-xl font-black text-[#00c853]">22</span>
                    <span className="text-[10px] uppercase text-[#888] ml-1">Goal</span>
                  </div>
                  <div>
                    <span className="text-xl font-black">8</span>
                    <span className="text-[10px] uppercase text-[#888] ml-1">Assist</span>
                  </div>
                </div>
                <div className="flex gap-[2px]">
                  {progressBars.map((filled, i) => (
                    <div key={i} className={`h-3 w-2 rounded-sm ${filled ? "bg-[#00c853]" : "bg-[#333]"}`} />
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <span className="text-[10px] uppercase text-[#888] border border-[#2a2a2a] rounded-full px-3 py-1">
                    Best Player of the Week
                  </span>
                </div>
              </div>

              {/* Best team card */}
              <div className="bg-[#111]/80 border border-[#2a2a2a] rounded-xl p-4 w-40 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-2">
                  <span className="text-2xl">⚽</span>
                </div>
                <p className="font-black uppercase text-sm">Paris</p>
                <span className="text-[10px] uppercase text-[#888] border border-[#2a2a2a] rounded-full px-3 py-1 mt-2">
                  Best Team in the Week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
