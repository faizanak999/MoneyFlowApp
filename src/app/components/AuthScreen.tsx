import { useState } from "react";
import { Navigate } from "react-router";
import { ArrowRight, Mail, Lock, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import AppIcon from "../../imports/Group";

type Mode = "sign-in" | "sign-up";

export function AuthScreen() {
  const { user, loading, signIn, signUp, authReady } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#0D0A0F] flex items-center justify-center text-[#8A8494]">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async () => {
    if (busy) {
      return;
    }

    if (!authReady) {
      setError("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "sign-up" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    if (mode === "sign-in") {
      const result = await signIn(email.trim(), password);
      if (!result.ok) {
        setError(result.error ?? "Could not sign in.");
      }
      setBusy(false);
      return;
    }

    const result = await signUp(email.trim(), password);
    if (!result.ok) {
      setError(result.error ?? "Could not create account.");
      setBusy(false);
      return;
    }

    if (result.needsEmailVerify) {
      setMessage("Account created. Check your email to verify before signing in.");
      setMode("sign-in");
    }

    setBusy(false);
  };

  return (
    <div className="min-h-dvh bg-[#0D0A0F] flex justify-center px-4 py-8">
      <div className="w-full max-w-[430px] rounded-[24px] border border-white/10 bg-[#13101A] p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="w-10 h-10 rounded-[10px] overflow-hidden">
            <AppIcon />
          </div>
          <div className="text-right">
            <p className="text-[#8A8494] text-[12px] uppercase tracking-wider">FinFlow</p>
            <p className="text-white text-[16px]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
              Secure Access
            </p>
          </div>
        </div>

        <h1 className="text-white text-[28px] leading-tight mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
          {mode === "sign-in" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-[#8A8494] text-[14px] mb-6">
          {mode === "sign-in"
            ? "Sign in to sync your expenses across devices."
            : "Create your account to keep your finance data private and synced."}
        </p>

        <div className="flex gap-2 mb-6 p-1 rounded-[12px] bg-white/5 border border-white/10">
          <button
            onClick={() => {
              setMode("sign-in");
              setError("");
              setMessage("");
            }}
            className="flex-1 py-2 rounded-[10px] text-[13px] transition-all"
            style={{
              background: mode === "sign-in" ? "#CEF62E" : "transparent",
              color: mode === "sign-in" ? "#0D0A0F" : "#8A8494",
              fontWeight: 600,
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode("sign-up");
              setError("");
              setMessage("");
            }}
            className="flex-1 py-2 rounded-[10px] text-[13px] transition-all"
            style={{
              background: mode === "sign-up" ? "#CEF62E" : "transparent",
              color: mode === "sign-up" ? "#0D0A0F" : "#8A8494",
              fontWeight: 600,
            }}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-3">
          <label className="block">
            <span className="text-[#8A8494] text-[12px] mb-1 block">Email</span>
            <div className="flex items-center gap-2 rounded-[14px] bg-[#1A1620] border border-white/10 px-3 py-2.5">
              <Mail size={16} className="text-[#8A8494]" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="flex-1 bg-transparent text-white text-[14px] placeholder:text-[#3D3849] focus:outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-[#8A8494] text-[12px] mb-1 block">Password</span>
            <div className="flex items-center gap-2 rounded-[14px] bg-[#1A1620] border border-white/10 px-3 py-2.5">
              <Lock size={16} className="text-[#8A8494]" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                placeholder="••••••••"
                className="flex-1 bg-transparent text-white text-[14px] placeholder:text-[#3D3849] focus:outline-none"
              />
            </div>
          </label>

          {mode === "sign-up" ? (
            <label className="block">
              <span className="text-[#8A8494] text-[12px] mb-1 block">Confirm Password</span>
              <div className="flex items-center gap-2 rounded-[14px] bg-[#1A1620] border border-white/10 px-3 py-2.5">
                <Lock size={16} className="text-[#8A8494]" />
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-white text-[14px] placeholder:text-[#3D3849] focus:outline-none"
                />
              </div>
            </label>
          ) : null}
        </div>

        {error ? <p className="text-[#F4618A] text-[13px] mt-4">{error}</p> : null}
        {message ? <p className="text-[#30E48D] text-[13px] mt-4">{message}</p> : null}

        <button
          onClick={() => {
            void handleSubmit();
          }}
          disabled={busy}
          className="w-full mt-6 rounded-[16px] py-3 text-[14px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          style={{ background: "#CEF62E", color: "#0D0A0F" }}
        >
          {mode === "sign-in" ? <LogIn size={16} /> : <UserPlus size={16} />}
          {busy ? "Please wait..." : mode === "sign-in" ? "Sign In" : "Create Account"}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
