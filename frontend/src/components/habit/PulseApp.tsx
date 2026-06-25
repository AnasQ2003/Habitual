import { useState, useMemo, useEffect, useRef, createContext, useContext, type ReactNode } from "react";
import api, { type User, type Habit, type Reminder, type AppNotification, type FeedPost } from "@/lib/api-client";

type ThemeId = "candy" | "aurora" | "ocean" | "sunset";
const THEME_GRADS: Record<ThemeId, string> = {
  candy: "linear-gradient(135deg, oklch(0.62 0.22 30) 0%, oklch(0.58 0.25 350) 30%, oklch(0.5 0.25 290) 65%, oklch(0.55 0.20 220) 100%)",
  aurora: "linear-gradient(135deg, oklch(0.62 0.25 300), oklch(0.66 0.27 350), oklch(0.72 0.22 30))",
  ocean: "linear-gradient(135deg, oklch(0.6 0.18 220), oklch(0.55 0.2 260), oklch(0.7 0.18 190))",
  sunset: "linear-gradient(135deg, oklch(0.7 0.25 350), oklch(0.78 0.20 60), oklch(0.72 0.22 30))",
};
const DARK_THEME_GRADS: Record<ThemeId, string> = {
  candy: "linear-gradient(145deg, oklch(0.18 0.08 315) 0%, oklch(0.14 0.08 285) 48%, oklch(0.16 0.07 235) 100%)",
  aurora: "linear-gradient(145deg, oklch(0.18 0.09 300) 0%, oklch(0.13 0.08 265) 52%, oklch(0.16 0.08 25) 100%)",
  ocean: "linear-gradient(145deg, oklch(0.17 0.08 230) 0%, oklch(0.12 0.07 255) 48%, oklch(0.17 0.07 190) 100%)",
  sunset: "linear-gradient(145deg, oklch(0.18 0.08 350) 0%, oklch(0.13 0.07 290) 48%, oklch(0.18 0.08 45) 100%)",
};
const ThemeCtx = createContext<{ theme: ThemeId; setTheme: (t: ThemeId) => void; dark: boolean; setDark: (d: boolean) => void }>({ theme: "candy", setTheme: () => {}, dark: false, setDark: () => {} });
const useTheme = () => useContext(ThemeCtx);
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Check, ShieldCheck, FileText,
  Home, BarChart3, Calendar, Trophy, User as UserIcon, Plus, Bell, Menu, Search,
  Flame, Droplets, BookOpen, Dumbbell, Brain, Moon as MoonIcon, Heart, Music,
  Settings, LogOut, HelpCircle, Star, ChevronRight, ChevronDown, Edit3, Camera, X,
  TrendingUp, Target, Users, Zap, Award, Globe, Palette, Volume2,
} from "lucide-react";

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between rounded-xl border border-white/40 bg-[oklch(0.28_0.14_310/0.65)] px-3 py-2 text-sm font-semibold text-white shadow-inner backdrop-blur-xl outline-none focus:border-mint">
        <span className="truncate">{value}</span>
        <ChevronDown className={`h-4 w-4 text-white/85 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.ul initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.15 }}
              className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-white/40 shadow-2xl"
              style={{ background: "linear-gradient(160deg, oklch(0.32 0.16 310 / 0.95), oklch(0.28 0.18 290 / 0.95))", backdropFilter: "blur(24px) saturate(180%)" }}>
              {options.map(o => {
                const active = o === value;
                return (
                  <li key={o}>
                    <button type="button" onClick={() => { onChange(o); setOpen(false); }}
                      className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition ${active ? "bg-white/25 font-bold text-white" : "text-white/90 hover:bg-white/15"}`}>
                      <span>{o}</span>
                      {active && <Check className="h-4 w-4 text-mint" strokeWidth={3} />}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

type Screen =
  | "splash" | "auth" | "login" | "signup" | "terms"
  | "home" | "habits" | "add" | "stats" | "calendar" | "achievements" | "community" | "notifications"
  | "profile" | "edit-profile";

const navTabs: { id: Screen; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "add", label: "Add", icon: Plus },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "profile", label: "Profile", icon: UserIcon },
];

const screenVariants: Variants = {
  initial: { opacity: 0, rotateY: -80, x: 40 },
  animate: { opacity: 1, rotateY: 0, x: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, rotateY: 70, x: -40, transition: { duration: 0.35, ease: [0.65, 0, 0.35, 1] } },
};

const appScreenVariants: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.22, ease: [0.65, 0, 0.35, 1] } },
};

const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function Blobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="animate-blob absolute -top-20 -left-16 h-64 w-64 rounded-full bg-amber/50 blur-3xl" />
      <div className="animate-blob absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-pink/50 blur-3xl" style={{ animationDelay: "2s" }} />
      <div className="animate-blob absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-mint/40 blur-3xl" style={{ animationDelay: "4s" }} />
      <div className="animate-blob absolute top-10 right-1/4 h-48 w-48 rounded-full bg-sky/40 blur-3xl" style={{ animationDelay: "6s" }} />
    </div>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  const { theme, dark } = useTheme();
  return (
    <div
      className={`relative mx-auto h-[100dvh] w-full max-w-[440px] overflow-hidden bg-candy sm:my-6 sm:h-[860px] sm:rounded-[2.5rem] sm:border sm:border-white/30 sm:shadow-2xl ${dark ? "pulse-phone-dark" : ""}`}
      style={{
        ["--gradient-candy" as never]: dark ? DARK_THEME_GRADS[theme] : THEME_GRADS[theme],
      }}
    >
      <Blobs />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}

/* ---------------- SPLASH ---------------- */
function Splash({ go, onUser }: { go: (s: Screen) => void; onUser: (u: User) => void }) {
  useEffect(() => {
    const t = setTimeout(() => {
      const stored = api.auth.getStoredUser();
      if (stored && api.auth.isLoggedIn()) {
        onUser(stored);
        go("home");
      } else {
        go("auth");
      }
    }, 2400);
    return () => clearTimeout(t);
  }, [go, onUser]);
  return (
    <motion.div key="splash" {...screenVariants} className="relative flex h-full flex-col items-center justify-center px-8">
      <div className="absolute inset-0 bg-candy" />
      <Blobs />
      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="relative mb-8"
        >
          <div className="absolute inset-0 animate-pulse-ring rounded-full bg-aurora" />
          <div className="absolute inset-0 animate-pulse-ring rounded-full bg-aurora" style={{ animationDelay: "0.6s" }} />
          <div className="relative grid h-28 w-28 place-items-center rounded-[2rem] bg-aurora shadow-glow">
            <Sparkles className="h-14 w-14 text-white" strokeWidth={2.2} />
          </div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="font-display text-6xl font-bold tracking-tight text-white drop-shadow-lg"
        >
          Pulse
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-3 text-base text-white/90"
        >
          Build habits. Feel the rhythm.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          className="absolute -bottom-32 left-1/2 w-60 -translate-x-1/2"
        >
          <div className="relative h-2.5 overflow-hidden rounded-full border border-white/35 bg-white/15 backdrop-blur shadow-glow">
            <motion.div
              initial={{ width: "0%" }} animate={{ width: "100%" }}
              transition={{ duration: 1.7, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, oklch(0.9 0.2 60), oklch(0.78 0.25 350), oklch(0.85 0.2 200))" }}
            />
            <motion.div
              animate={{ x: ["-40%", "140%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent"
            />
            {[0,1,2,3,4].map(i => (
              <motion.span key={i}
                className="absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white"
                style={{ left: `${i * 22 + 6}%` }}
                animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.3, repeat: Infinity, delay: 1.2 + i * 0.2 }}
              />
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
            className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.32em] text-white/90"
          >
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
              ✨ syncing your rhythm ✨
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ---------------- BOOK AUTH (flip card, glass) ---------------- */
const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.6 29.3 4.6 24 4.6c-7.6 0-14.1 4.3-17.7 10.1z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.2-7.2 2.2-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2c-.4.4 6.6-4.8 6.6-14.7 0-1.2-.1-2.4-.4-3.5z"/></svg>
);
const AppleLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white"><path d="M16.365 1.43c0 1.14-.42 2.19-1.13 2.99-.83.93-2.18 1.65-3.27 1.57-.14-1.11.39-2.27 1.12-3.05.82-.89 2.24-1.56 3.28-1.51zM20.5 17.6c-.55 1.27-.82 1.84-1.53 2.97-.99 1.57-2.39 3.53-4.12 3.55-1.54.01-1.94-1.01-4.03-1-2.09.01-2.53 1.02-4.07 1-1.74-.02-3.07-1.79-4.06-3.36C.91 17.36.49 12.4 2.16 9.78c1.18-1.86 3.05-2.95 4.81-2.95 1.79 0 2.92 1 4.4 1 1.44 0 2.32-1 4.39-1 1.57 0 3.23.86 4.41 2.34-3.88 2.13-3.24 7.71.33 8.43z"/></svg>
);

function BookAuth({ go, onUser }: { go: (s: Screen) => void; onUser: (u: User) => void }) {
  const [page, setPage] = useState<"login" | "signup">("login");
  const [show, setShow] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [agree, setAgree] = useState(false);
  const [agreeLogin, setAgreeLogin] = useState(true);
  const [forgot, setForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [toast, setToast] = useState<{ emoji: string; title: string; msg: string } | null>(null);
  const fire = (emoji: string, title: string, msg: string) => {
    setToast({ emoji, title, msg });
    setTimeout(() => setToast(null), 2800);
  };
  const showSocialMessage = (platform: "Google" | "Apple") => {
    if (platform === "Google") {
      fire("👾", "Google Auth", "Under construction! Our code gnomes are busy linking Google. Stay tuned!");
    } else {
      fire("🍎", "Apple Auth", "Work underway! We are crafting a seamless Apple login experience for you.");
    }
  };
  const isLogin = page === "login";
  // controlled inputs
  const loginEmail = useRef(""); const loginPw = useRef("");
  const signName = useRef(""); const signEmail = useRef(""); const signPw = useRef("");

  const handleLogin = async () => {
    if (!agreeLogin) return;
    setLoading(true); setAuthErr("");
    try {
      const { token, user } = await api.auth.login(loginEmail.current, loginPw.current);
      api.auth.saveToken(token, user, rememberMe);
      onUser(user);
      go("home");
    } catch (e: any) { setAuthErr(e.message ?? "Login failed"); }
    finally { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!agree) return;
    setLoading(true); setAuthErr("");
    try {
      const { token, user } = await api.auth.signup(signName.current, signEmail.current, signPw.current);
      api.auth.saveToken(token, user);
      onUser(user);
      go("home");
    } catch (e: any) { setAuthErr(e.message ?? "Signup failed"); }
    finally { setLoading(false); }
  };
  return (
    <motion.div key="auth" {...screenVariants} className="relative flex h-full flex-col justify-center px-5 py-5">
      <Blobs />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="absolute left-1/2 top-4 z-[70] w-[88%] max-w-[360px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/40 p-3 shadow-2xl"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.25 320 / 0.95), oklch(0.5 0.25 280 / 0.95))", backdropFilter: "blur(20px)" }}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/25 text-2xl">{toast.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-bold text-white">{toast.title}</div>
                <div className="text-[11px] text-white/90">{toast.msg}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mx-auto flex items-center gap-2.5">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-aurora shadow-glow">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <span className="font-display text-3xl font-bold text-white drop-shadow">Pulse</span>
      </motion.div>

      <div className="relative z-10 mx-auto mt-4 flex w-[300px] rounded-full glass p-1">
        {(["login","signup"] as const).map((p) => {
          const active = page === p;
          return (
            <button key={p} onClick={() => setPage(p)} className="relative flex-1 rounded-full px-3 py-2 text-sm font-semibold">
              {active && <motion.div layoutId="authpill" className="absolute inset-0 rounded-full bg-white shadow-glow" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className={`relative ${active ? "text-[oklch(0.35_0.18_320)]" : "text-white/85"}`}>{p === "login" ? "Sign in" : "Create account"}</span>
            </button>
          );
        })}
      </div>

      <div className="perspective-1200 relative z-10 mx-auto mt-5 w-full max-w-[420px]" style={{ height: 560 }}>
        <motion.div className="preserve-3d relative h-full w-full" animate={{ rotateY: isLogin ? 0 : 180 }} transition={{ duration: 0.85, ease: [0.65, 0, 0.35, 1] }} style={{ transformStyle: "preserve-3d" }}>
          {/* FRONT - Sign In */}
          <div className="backface-hidden relative h-full rounded-[1.75rem] glass-strong p-5 shadow-2xl overflow-y-auto scrollbar-hide" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
            <h2 className="font-display text-2xl font-bold text-white">Welcome back</h2>
            <p className="mt-1 text-[13px] text-white/85">Log in to keep your streaks alive</p>


            <div className="mt-4 space-y-3">
              <BookField icon={Mail} type="email" placeholder="you@email.com" autoComplete="email" onChange={e => { loginEmail.current = e.target.value; }} />
              <div className="relative">
                <BookField icon={Lock} type={show ? "text" : "password"} placeholder="Password" autoComplete="current-password" onChange={e => { loginPw.current = e.target.value; }} />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-white/80">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setRememberMe(!rememberMe)} className="flex items-center gap-1.5 text-[12px] font-semibold text-white/90">
                  <span className="grid h-3.5 w-3.5 place-items-center rounded-[4px] border transition" style={{ borderColor: rememberMe ? "white" : "oklch(1 0 0 / 0.5)", background: rememberMe ? "white" : "transparent" }}>
                    {rememberMe && <Check className="h-2.5 w-2.5 text-[oklch(0.45_0.22_320)]" strokeWidth={3.5} />}
                  </span>
                  Remember me
                </button>
                <button type="button" onClick={() => setForgot(true)} className="text-[12px] font-semibold text-white/90 hover:underline">Forgot password?</button>
              </div>
            </div>
            {authErr && !isLogin === false && <p className="mt-2 text-[11px] text-pink">{authErr}</p>}
            <button onClick={handleLogin} disabled={!agreeLogin || loading} className="mt-4 w-full rounded-2xl bg-white py-3 text-base font-semibold text-[oklch(0.35_0.18_320)] shadow-glow active:scale-[0.98] transition disabled:opacity-50">{loading ? "Signing in…" : "Log in"}</button>

            <div className="my-3.5 flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/70">
              <div className="h-px flex-1 bg-white/25" /> or continue with <div className="h-px flex-1 bg-white/25" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => showSocialMessage("Google")} className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-[oklch(0.25_0.08_280)] transition hover:scale-[1.02]"><GoogleLogo /> Google</button>
              <button onClick={() => showSocialMessage("Apple")} className="flex items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02]"><AppleLogo /> Apple</button>
            </div>

            <button onClick={() => setAgreeLogin(!agreeLogin)} className="mt-4 flex items-start gap-2 text-left">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border-2 transition" style={{ borderColor: agreeLogin ? "white" : "oklch(1 0 0 / 0.5)", background: agreeLogin ? "white" : "transparent" }}>
                {agreeLogin && <Check className="h-2.5 w-2.5 text-[oklch(0.45_0.22_320)]" strokeWidth={3} />}
              </span>
              <span className="text-[12px] text-white/85">I agree to the <button type="button" onClick={(e) => { e.stopPropagation(); go("terms"); }} className="font-bold text-white underline">Terms & Privacy</button></span>
            </button>

            <p className="mt-4 text-center text-[13px] text-white/85">New here? <button onClick={() => setPage("signup")} className="font-bold text-white underline-offset-2 hover:underline">Create account</button></p>
          </div>

          {/* BACK - Sign Up */}
          <div className="backface-hidden absolute inset-0 rounded-[1.75rem] glass-strong p-5 shadow-2xl overflow-y-auto scrollbar-hide" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <h2 className="font-display text-2xl font-bold text-white">Create account</h2>
            <p className="mt-1 text-[13px] text-white/85">Start your habit journey today</p>

            <div className="mt-4 space-y-3">
              <BookField icon={UserIcon} placeholder="Full name" onChange={e => { signName.current = e.target.value; }} />
              <BookField icon={Mail} type="email" placeholder="you@email.com" autoComplete="email" onChange={e => { signEmail.current = e.target.value; }} />
              <div className="relative">
                <BookField icon={Lock} type={showSignup ? "text" : "password"} placeholder="Password" autoComplete="new-password" onChange={e => { signPw.current = e.target.value; }} />
                <button type="button" onClick={() => setShowSignup(!showSignup)} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-white/80">
                  {showSignup ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button onClick={() => setAgree(!agree)} className="mt-3.5 flex items-start gap-2 text-left">
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border-2 transition" style={{ borderColor: agree ? "white" : "oklch(1 0 0 / 0.5)", background: agree ? "white" : "transparent" }}>
                {agree && <Check className="h-2.5 w-2.5 text-[oklch(0.45_0.22_320)]" strokeWidth={3} />}
              </span>
              <span className="text-[12px] text-white/85">I agree to the <button type="button" onClick={(e) => { e.stopPropagation(); go("terms"); }} className="font-bold text-white underline">Terms & Privacy</button></span>
            </button>
            {authErr && <p className="mt-2 text-[11px] text-pink">{authErr}</p>}
            <button onClick={handleSignup} disabled={!agree || loading} className="mt-3.5 w-full rounded-2xl bg-white py-3 text-base font-semibold text-[oklch(0.35_0.18_320)] shadow-glow transition active:scale-[0.98] disabled:opacity-40">{loading ? "Creating…" : "Create account"}</button>

            <div className="my-3.5 flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/70">
              <div className="h-px flex-1 bg-white/25" /> or sign up with <div className="h-px flex-1 bg-white/25" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button onClick={() => showSocialMessage("Google")} className="flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-[oklch(0.25_0.08_280)]"><GoogleLogo /> Google</button>
              <button onClick={() => showSocialMessage("Apple")} className="flex items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-sm font-semibold text-white"><AppleLogo /> Apple</button>
            </div>

            <p className="mt-4 text-center text-[13px] text-white/85">Have an account? <button onClick={() => setPage("login")} className="font-bold text-white underline-offset-2 hover:underline">Sign in</button></p>

          </div>
        </motion.div>
      </div>

      {/* Funny Forgot Password modal */}
      <AnimatePresence>
        {forgot && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setForgot(false)} className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0, rotate: 6 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="absolute left-1/2 top-1/2 z-50 w-[88%] max-w-[340px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[2rem] p-6 text-center shadow-2xl"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.25 30), oklch(0.66 0.27 350), oklch(0.6 0.25 290))" }}
            >
              <motion.div animate={{ rotate: [0, -15, 15, -10, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }} className="mx-auto text-6xl">🧠💨</motion.div>
              <h3 className="mt-3 font-display text-2xl font-extrabold text-white drop-shadow">Oops, brain freeze?</h3>
              <p className="mt-2 text-sm text-white/90 leading-relaxed">
                Your password ran away with the cookies. 🍪✨<br/>
                We're sending a magical reset link to your inbox — check your email like it's full of glitter!
              </p>
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/25 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                <Sparkles className="h-3.5 w-3.5" /> reset spell incoming
              </motion.div>
              <button onClick={() => setForgot(false)} className="mt-5 w-full rounded-2xl bg-white py-3 text-sm font-bold text-[oklch(0.45_0.22_320)] shadow-glow active:scale-95 transition">
                Got it, thanks wizard! 🪄
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BookField({ icon: Icon, ...props }: { icon: typeof Mail } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/95" />
      <input
        {...props}
        className="w-full rounded-xl border border-white/55 bg-white/20 py-3 pl-10 pr-10 text-sm font-semibold text-white placeholder-white/80 outline-none shadow-[inset_0_1px_0_oklch(1_0_0/0.25)] backdrop-blur-2xl transition focus:border-white focus:bg-white/30"
      />
    </div>
  );
}

/* ---------------- AUTH ---------------- */
function AuthShell({ title, subtitle, children, onBack }: { title: string; subtitle: string; children: ReactNode; onBack: () => void }) {
  return (
    <motion.div key={title} {...screenVariants} className="relative flex h-full flex-col px-6 pt-12 pb-6">
      <button onClick={onBack} className="absolute left-4 top-6 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20">
        <ArrowRight className="h-4 w-4 rotate-180" />
      </button>
      <motion.div variants={stagger} initial="initial" animate="animate" className="mt-12 flex flex-1 flex-col">
        <motion.h2 variants={item} className="font-display text-4xl font-bold text-white">{title}</motion.h2>
        <motion.p variants={item} className="mt-2 text-white/80">{subtitle}</motion.p>
        <motion.div variants={item} className="mt-8 flex-1">{children}</motion.div>
      </motion.div>
    </motion.div>
  );
}

function Field({ icon: Icon, ...props }: { icon: typeof Mail } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="group relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/80 transition group-focus-within:text-mint" />
      <input
        {...props}
        className="w-full rounded-2xl border border-white/25 bg-white/15 py-4 pl-12 pr-4 text-white placeholder-white/60 outline-none backdrop-blur transition focus:border-mint focus:bg-white/10"
      />
    </div>
  );
}

function Login({ go, onUser }: { go: (s: Screen) => void; onUser: (u: User) => void }) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authErr, setAuthErr] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [toast, setToast] = useState<{ emoji: string; title: string; msg: string } | null>(null);

  const email = useRef("");
  const password = useRef("");

  const fire = (emoji: string, title: string, msg: string) => {
    setToast({ emoji, title, msg });
    setTimeout(() => setToast(null), 2800);
  };

  const showSocialMessage = (platform: "Google" | "Apple") => {
    if (platform === "Google") {
      fire("👾", "Google Auth", "Under construction! Our code gnomes are busy linking Google. Stay tuned!");
    } else {
      fire("🍎", "Apple Auth", "Work underway! We are crafting a seamless Apple login experience for you.");
    }
  };

  const handleLogin = async () => {
    setLoading(true); setAuthErr("");
    try {
      const { token, user } = await api.auth.login(email.current, password.current);
      api.auth.saveToken(token, user, rememberMe);
      onUser(user);
      go("home");
    } catch (e: any) {
      setAuthErr(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to keep your streaks alive" onBack={() => go("auth")}>
      <div className="relative">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: -40, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="absolute left-1/2 -top-12 z-[70] w-[95%] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/40 p-3 shadow-2xl"
              style={{ background: "linear-gradient(135deg, oklch(0.55 0.25 320 / 0.95), oklch(0.5 0.25 280 / 0.95))", backdropFilter: "blur(20px)" }}
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/25 text-2xl">{toast.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-bold text-white">{toast.title}</div>
                  <div className="text-[11px] text-white/90">{toast.msg}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <Field icon={Mail} type="email" placeholder="you@email.com" onChange={e => { email.current = e.target.value; }} />
          <div className="relative">
            <Field icon={Lock} type={show ? "text" : "password"} placeholder="Password" onChange={e => { password.current = e.target.value; }} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70">
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setRememberMe(!rememberMe)} className="flex items-center gap-2 text-sm text-white/80">
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${rememberMe ? "border-mint bg-mint" : "border-white/30"}`}>
                {rememberMe && <Check className="h-3.5 w-3.5 text-background" strokeWidth={3} />}
              </span>
              Remember me
            </button>
            <button type="button" className="text-sm text-mint hover:underline">Forgot password?</button>
          </div>
        </div>

        {authErr && <p className="mt-2 text-sm text-pink">{authErr}</p>}

        <button onClick={handleLogin} disabled={loading} className="mt-8 w-full rounded-2xl bg-aurora py-4 font-semibold text-white shadow-glow active:scale-[0.98] transition disabled:opacity-50">
          {loading ? "Signing in…" : "Log in"}
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-white/80">
          <div className="h-px flex-1 bg-white/10" /> OR continue with <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => showSocialMessage("Google")} className="flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/15 py-3 text-sm font-semibold text-white transition hover:bg-white/10"><GoogleLogo /> Google</button>
          <button type="button" onClick={() => showSocialMessage("Apple")} className="flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/15 py-3 text-sm font-semibold text-white transition hover:bg-white/10"><AppleLogo /> Apple</button>
        </div>

        <p className="mt-8 text-center text-sm text-white/80">
          New here? <button type="button" onClick={() => go("auth")} className="font-semibold text-mint hover:underline">Create account</button>
        </p>
      </div>
    </AuthShell>
  );
}

function Signup({ go, onUser }: { go: (s: Screen) => void; onUser: (u: User) => void }) {
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authErr, setAuthErr] = useState("");

  const name = useRef("");
  const email = useRef("");
  const password = useRef("");

  const handleSignup = async () => {
    if (!agree) return;
    setLoading(true); setAuthErr("");
    try {
      const { token, user } = await api.auth.signup(name.current, email.current, password.current);
      api.auth.saveToken(token, user, true);
      onUser(user);
      go("home");
    } catch (e: any) {
      setAuthErr(e.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Start your habit journey today" onBack={() => go("auth")}>
      <div className="space-y-4">
        <Field icon={UserIcon} placeholder="Full name" onChange={e => { name.current = e.target.value; }} />
        <Field icon={Mail} type="email" placeholder="you@email.com" onChange={e => { email.current = e.target.value; }} />
        <Field icon={Lock} type="password" placeholder="Password" onChange={e => { password.current = e.target.value; }} />
      </div>
      <button onClick={() => setAgree(!agree)} className="mt-6 flex items-start gap-3 text-left">
        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${agree ? "border-mint bg-mint" : "border-white/30"}`}>
          {agree && <Check className="h-3.5 w-3.5 text-background" strokeWidth={3} />}
        </span>
        <span className="text-sm text-white/70">
          I agree to the <button onClick={(e) => { e.stopPropagation(); go("terms"); }} className="text-mint underline">Terms & Privacy Policy</button>
        </span>
      </button>

      {authErr && <p className="mt-2 text-sm text-pink">{authErr}</p>}

      <button onClick={handleSignup} disabled={!agree || loading} className="mt-6 w-full rounded-2xl bg-aurora py-4 font-semibold text-white shadow-glow transition active:scale-[0.98] disabled:opacity-40">
        {loading ? "Creating…" : "Create account"}
      </button>
      <p className="mt-6 text-center text-sm text-white/80">
        Have an account? <button onClick={() => go("login")} className="font-semibold text-mint hover:underline">Log in</button>
      </p>
    </AuthShell>
  );
}

function Terms({ go }: { go: (s: Screen) => void }) {
  return (
    <motion.div key="terms" {...screenVariants} className="relative flex h-full flex-col px-6 pt-5 pb-6">
      <div className="flex items-center gap-3">
        <button onClick={() => go("auth")} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25">
          <ArrowRight className="h-4 w-4 rotate-180" />
        </button>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-mint-grad shadow-mint">
          <ShieldCheck className="h-6 w-6 text-background" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-bold text-white leading-tight">Terms & Privacy</h2>
          <p className="text-[11px] text-white/80">Last updated June 2026</p>
        </div>
      </div>
      <motion.div variants={stagger} initial="initial" animate="animate" className="mt-5 flex flex-1 flex-col overflow-hidden">
        <motion.div variants={item} className="flex-1 space-y-3 overflow-y-auto scrollbar-hide pr-1 text-sm leading-relaxed text-white/85">
          {[
            { icon: FileText, t: "What we collect", b: "Only what you create inside Pulse: habits, streaks, reminders, journal notes, achievements, and basic profile info (name, email, avatar). No contacts, no microphone, no location — ever." },
            { icon: ShieldCheck, t: "How it's protected", b: "Everything is encrypted in transit (TLS 1.3) and at rest (AES-256). Passwords are hashed with bcrypt. Backups are encrypted and rotated every 30 days across redundant regions." },
            { icon: Sparkles, t: "Anonymous analytics", b: "We measure aggregate usage (screens visited, crash reports) to improve the app. Events are stripped of identifiers and we never link them back to your account. Opt out anytime in Settings → Privacy." },
            { icon: Bell, t: "Notifications & reminders", b: "Habit reminders are scheduled locally on your device — they never leave your phone. Push notifications for streak milestones use anonymous device tokens you can revoke at any time." },
            { icon: UserIcon, t: "Your account, your control", b: "Export every byte we store as a JSON file, edit any field, or permanently delete your account from Profile → Settings → Account. Deletion is irreversible and completes within 24 hours across all backups." },
            { icon: Globe, t: "Third parties", b: "We use trusted infrastructure (hosting, crash reporting, email delivery) under strict data-processing agreements. We do not sell, rent, or share your personal data with advertisers — ever." },
            { icon: BookOpen, t: "Children's privacy", b: "Pulse is intended for users aged 13 and older. We do not knowingly collect data from children under 13. If you believe a child has signed up, contact privacy@pulse.app and we'll remove the account immediately." },
            { icon: Heart, t: "Your rights (GDPR & CCPA)", b: "You have the right to access, rectify, port, restrict, or erase your data. We respond to all verified requests within 30 days. Reach our Data Protection Officer at dpo@pulse.app." },
            { icon: Award, t: "Terms of use", b: "By using Pulse you agree to use the app lawfully, respect community guidelines, and not attempt to reverse-engineer the service. We may suspend accounts that abuse the platform. Full Terms available at pulse.app/terms." },
            { icon: ShieldCheck, t: "Updates to this policy", b: "We may revise this policy as the app evolves. Material changes are announced in-app at least 14 days before taking effect, with a clear summary of what changed and why." },
          ].map((s, i) => (
            <div key={i} className="flex gap-3 rounded-2xl bg-white/15 p-4 border border-white/30 backdrop-blur">
              <s.icon className="h-5 w-5 shrink-0 text-mint" />
              <div>
                <div className="font-semibold text-white">{s.t}</div>
                <div className="mt-1 text-white/85">{s.b}</div>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-white/25 bg-white/10 p-4 text-center text-[12px] text-white/75">
            Questions? Email <span className="font-semibold text-white">privacy@pulse.app</span> — we reply within 48 hours.
          </div>
        </motion.div>
        <motion.button variants={item} onClick={() => go("auth")} className="mt-4 w-full rounded-2xl bg-aurora py-3.5 font-semibold text-white shadow-glow active:scale-[0.98] transition">
          I understand
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- APP SHELL ---------------- */
function TopBar({ title, onMenu, onBell }: { title: string; onMenu: () => void; onBell: () => void }) {
  return (
    <div className="relative z-40 flex shrink-0 items-center justify-between px-4 pt-6 pb-4"
      style={{
        background: "linear-gradient(180deg, oklch(0.25 0.12 300 / 0.75) 0%, oklch(0.25 0.12 300 / 0.45) 60%, oklch(0.25 0.12 300 / 0))",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid oklch(1 0 0 / 0.28)",
        boxShadow: "0 6px 24px -8px oklch(0 0 0 / 0.35)",
      }}>
      <button onClick={onMenu} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/50 bg-white/30 text-white shadow-lg backdrop-blur-xl transition active:scale-95">
        <Menu className="h-5 w-5" />
      </button>
      <motion.h1 key={title} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-lg font-bold text-white drop-shadow-lg">{title}</motion.h1>
      <button onClick={onBell} className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/50 bg-white/30 text-white shadow-lg backdrop-blur-xl transition active:scale-95">
        <Bell className="h-5 w-5" />
        <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-pink ring-2 ring-white" />
      </button>
    </div>
  );
}

function BottomNav({ active, go }: { active: Screen; go: (s: Screen) => void }) {
  return (
    <div className="relative z-20 px-4 pb-5 pt-2">
      <div className="relative flex items-center justify-between rounded-3xl glass-strong px-3 py-2 shadow-2xl">
        {navTabs.map((t) => {
          const isActive = active === t.id;
          const isAdd = t.id === "add";
          if (isAdd) {
            return (
              <button key={t.id} onClick={() => go("add")} className="relative -mt-8 grid h-14 w-14 place-items-center rounded-2xl bg-aurora text-white shadow-glow transition active:scale-95">
                <Plus className="h-6 w-6" strokeWidth={2.5} />
              </button>
            );
          }
          return (
            <button key={t.id} onClick={() => go(t.id)} className="relative flex flex-1 flex-col items-center gap-1 py-2">
              {isActive && (
                <motion.div layoutId="navpill" className="absolute inset-0 rounded-2xl bg-white/10" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
              )}
              <t.icon className={`relative h-5 w-5 transition ${isActive ? "text-mint" : "text-white/70"}`} />
              <span className={`relative text-[10px] font-medium ${isActive ? "text-white" : "text-white/70"}`}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- DRAWER (radial reveal from top-left) ---------------- */
function Drawer({ open, close, go, logout, user }: { open: boolean; close: () => void; go: (s: Screen) => void; logout: () => void; user: User | null }) {
  const [modal, setModal] = useState<null | "settings" | "appearance" | "help">(null);
  const { theme, setTheme, dark, setDark } = useTheme();
  const [notif, setNotif] = useState(true);
  const [sync, setSync] = useState(true);
  const [toast, setToast] = useState<{ emoji: string; title: string; msg: string } | null>(null);
  const fire = (emoji: string, title: string, msg: string) => { setToast({ emoji, title, msg }); setTimeout(() => setToast(null), 2800); };
  const themes: { id: ThemeId; label: string; grad: string }[] = [
    { id: "candy", label: "Candy Pop", grad: "linear-gradient(135deg, oklch(0.62 0.22 30), oklch(0.58 0.25 350))" },
    { id: "aurora", label: "Aurora", grad: "linear-gradient(135deg, oklch(0.62 0.25 300), oklch(0.72 0.22 30))" },
    { id: "ocean", label: "Ocean", grad: "linear-gradient(135deg, oklch(0.6 0.18 220), oklch(0.7 0.18 190))" },
    { id: "sunset", label: "Sunset", grad: "linear-gradient(135deg, oklch(0.7 0.25 350), oklch(0.78 0.20 60))" },
  ];
  const Toggle = ({ on, set }: { on: boolean; set: (v: boolean) => void }) => (
    <button onClick={() => set(!on)} className={`relative h-6 w-11 rounded-full transition ${on ? "bg-mint" : "bg-white/25"}`}>
      <motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" style={{ left: on ? 22 : 2 }} />
    </button>
  );
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="drawer"
          initial={{ clipPath: "circle(0% at 36px 60px)" }}
          animate={{ clipPath: "circle(160% at 36px 60px)" }}
          exit={{ clipPath: "circle(0% at 36px 60px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-40 bg-night"
        >
          <Blobs />
          <div className="relative z-10 flex h-full flex-col px-6 pt-12 pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-aurora">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="font-display text-xl font-bold text-white">Pulse</div>
                  <div className="text-xs text-white/70">v2.4 · Pro plan</div>
                </div>
              </div>
              <button onClick={close} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-8 rounded-3xl bg-aurora p-5 shadow-glow">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-2xl" style={{ fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif' }}>{user?.avatar ?? '🌟'}</div>
                <div>
                  <div className="font-display text-lg font-bold text-white">Hey, {user?.name ?? 'Friend'}!</div>
                  <div className="text-sm text-white/80">{user?.streak ?? 0}-day streak · keep going</div>
                </div>
              </div>
            </motion.div>

            <motion.nav variants={stagger} initial="initial" animate="animate" className="mt-6 space-y-1">
              {[
                { icon: Trophy, label: "Achievements", id: "achievements" as Screen },
                { icon: Users, label: "Community", id: "community" as Screen },
                { icon: Bell, label: "Notifications", id: "notifications" as Screen },
                { icon: BarChart3, label: "Statistics", id: "stats" as Screen },
              ].map((m) => (
                <motion.button
                  key={m.label} variants={item}
                  onClick={() => { close(); setTimeout(() => go(m.id), 200); }}
                  className="group flex w-full items-center justify-between rounded-2xl border border-white/20 bg-white/15 px-4 py-3.5 text-left text-white transition hover:bg-white/10"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10"><m.icon className="h-4.5 w-4.5 text-mint" /></span>
                    <span className="font-medium">{m.label}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-white/80 transition group-hover:translate-x-1" />
                </motion.button>
              ))}
            </motion.nav>

            <div className="mt-6 space-y-1 border-t border-white/25 pt-6">
              {([
                { icon: Settings, label: "Settings", id: "settings" as const },
                { icon: Palette, label: "Appearance", id: "appearance" as const },
                { icon: HelpCircle, label: "Help & support", id: "help" as const },
              ]).map((m) => (
                <button key={m.label} onClick={() => setModal(m.id)} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-white/85 transition hover:bg-white/15">
                  <span className="flex items-center gap-3">
                    <m.icon className="h-4.5 w-4.5" />
                    <span className="text-sm font-medium">{m.label}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-70" />
                </button>
              ))}
            </div>

            <button onClick={logout} className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl border border-pink/30 bg-pink/10 py-3.5 font-semibold text-pink transition hover:bg-pink/20">
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>

          <ModalSheet open={modal === "settings"} onClose={() => setModal(null)} title="Settings">
            <div className="space-y-3">
              {[
                { l: "Push notifications", d: "Get reminders & streak alerts", v: notif, set: setNotif },
                { l: "Cloud sync", d: "Backup data across devices", v: sync, set: setSync },
                { l: "Dark mode", d: "Easier on the eyes at night", v: dark, set: setDark },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-white/25 bg-white/10 p-3">
                  <div><div className="text-sm font-semibold text-white">{s.l}</div><div className="text-[11px] text-white/70">{s.d}</div></div>
                  <Toggle on={s.v} set={s.set} />
                </div>
              ))}
              <button onClick={() => fire("🔐", "Password reset sent", "Check your inbox for a magic reset link.")} className="w-full rounded-2xl bg-white/20 py-3 text-sm font-semibold text-white">Change password</button>
              <button onClick={() => fire("⚠️", "Are you sure?", "Tap again within 5 seconds to confirm permanent deletion.")} className="w-full rounded-2xl border border-pink/40 bg-pink/15 py-3 text-sm font-semibold text-pink">Delete account</button>
            </div>
          </ModalSheet>

          <ModalSheet open={modal === "appearance"} onClose={() => setModal(null)} title="Appearance">
            <div className="text-xs uppercase tracking-wider text-white/70 mb-2">Theme palette</div>
            <div className="grid grid-cols-2 gap-3">
              {themes.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)} className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition ${theme === t.id ? "border-white shadow-glow" : "border-white/20"}`} style={{ background: t.grad }}>
                  <div className="font-semibold text-white drop-shadow">{t.label}</div>
                  {theme === t.id && <div className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white"><Check className="h-3.5 w-3.5 text-[oklch(0.35_0.18_320)]" strokeWidth={3} /></div>}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/25 bg-white/10 p-3">
              <div><div className="text-sm font-semibold text-white">Dark mode</div><div className="text-[11px] text-white/70">Reduce brightness at night</div></div>
              <Toggle on={dark} set={setDark} />
            </div>
          </ModalSheet>

          <ModalSheet open={modal === "help"} onClose={() => setModal(null)} title="Help & support">
            <div className="space-y-2">
              {[
                { q: "How do I create a habit?", a: "Tap the + button in the bottom nav and pick an icon, name, and schedule." },
                { q: "How do streaks work?", a: "Complete a habit on its scheduled day to extend the streak. Missing one resets it." },
                { q: "Can I sync across devices?", a: "Yes — sign in with the same account and your data syncs automatically." },
                { q: "How do I change reminders?", a: "Open a habit, tap the bell icon, and pick a time and days." },
              ].map((f, i) => (
                <details key={i} className="group rounded-2xl border border-white/25 bg-white/10 p-3">
                  <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-white">
                    {f.q} <ChevronRight className="h-4 w-4 transition group-open:rotate-90" />
                  </summary>
                  <p className="mt-2 text-[12px] text-white/80">{f.a}</p>
                </details>
              ))}
              <button onClick={() => fire("💌", "Message sent", "Our support wizards will reply within 24 hours.")} className="w-full rounded-2xl bg-aurora py-3 text-sm font-semibold text-white shadow-glow">Contact support</button>
              <button onClick={() => fire("⭐", "Thanks for the love!", "Your rating keeps Pulse glowing.")} className="w-full rounded-2xl bg-white/20 py-3 text-sm font-semibold text-white">Rate Pulse ⭐</button>
            </div>
          </ModalSheet>

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ y: -40, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="absolute left-1/2 top-4 z-[70] w-[88%] max-w-[360px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/40 p-3 shadow-2xl"
                style={{ background: "linear-gradient(135deg, oklch(0.55 0.25 320 / 0.95), oklch(0.5 0.25 280 / 0.95))", backdropFilter: "blur(20px)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/25 text-2xl">{toast.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-sm font-bold text-white">{toast.title}</div>
                    <div className="text-[11px] text-white/90">{toast.msg}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- HABITS DATA (icon resolver) ---------------- */
const ICON_MAP: Record<string, typeof Droplets> = {
  Droplets, BookOpen, Dumbbell, Brain, Moon: MoonIcon, Heart, Music, Bell,
  Target, Star, Flame, Zap, Trophy, Award, Users, Globe,
};
function resolveIcon(name: string): typeof Droplets {
  return ICON_MAP[name] ?? Droplets;
}

// Fallback static habits used when API is offline
const STATIC_HABITS: Habit[] = [
  { id: "water",     name: "Drink water",   icon: "Droplets", color: "from-sky-400 to-cyan-300",       done: 6,  goal: 8,  unit: "glasses", streak: 12, sort_order: 0 },
  { id: "read",      name: "Read 20 pages", icon: "BookOpen", color: "from-amber-400 to-orange-400",   done: 15, goal: 20, unit: "pages",   streak: 8,  sort_order: 1 },
  { id: "workout",   name: "Workout",       icon: "Dumbbell", color: "from-pink-500 to-rose-400",       done: 1,  goal: 1,  unit: "session", streak: 21, sort_order: 2 },
  { id: "meditate",  name: "Meditate",      icon: "Brain",    color: "from-violet-500 to-fuchsia-400",  done: 0,  goal: 1,  unit: "session", streak: 5,  sort_order: 3 },
  { id: "sleep",     name: "Sleep by 11",   icon: "Moon",     color: "from-indigo-500 to-blue-400",     done: 0,  goal: 1,  unit: "night",   streak: 3,  sort_order: 4 },
  { id: "gratitude", name: "Gratitude",     icon: "Heart",    color: "from-rose-400 to-pink-300",       done: 1,  goal: 1,  unit: "entry",   streak: 14, sort_order: 5 },
];

/* Global reactive habits state shared across screens */
let _habits: Habit[] = STATIC_HABITS;
let _setHabitsGlobal: ((h: Habit[]) => void) | null = null;
function useHabitsStore() {
  const [habits, setHabits] = useState<Habit[]>(_habits);
  useEffect(() => { _setHabitsGlobal = setHabits; return () => { _setHabitsGlobal = null; }; }, []);
  const refresh = async () => {
    try {
      const data = await api.habits.list();
      _habits = data;
      setHabits(data);
      _setHabitsGlobal?.(data);
    } catch { /* offline — keep current */ }
  };
  return { habits, setHabits, refresh };
}

/* ---------------- HOME ---------------- */
function Home_({ go, user }: { go: (s: Screen) => void; user: User | null }) {
  const { habits, refresh } = useHabitsStore();
  const completed = habits.filter(h => h.done >= h.goal).length;
  const pct = Math.round((completed / Math.max(habits.length, 1)) * 100);
  const [mood, setMood] = useState(2);
  const moods = ["😞","😐","🙂","😄","🤩"];
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showRem, setShowRem] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("Evening walk");
  const [newTime, setNewTime] = useState("18:30");
  const [newDays, setNewDays] = useState("Daily");
  useEffect(() => {
    refresh();
    api.reminders.list().then(setReminders).catch(() => {});
  }, []);

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4">
      <motion.div variants={item} className="mt-2">
        <p className="text-sm text-white/80">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h2 className="font-display text-3xl font-bold text-white">Good morning, {user?.name?.split(' ')[0] ?? 'Friend'} ✨</h2>
      </motion.div>

      <motion.div variants={item} className="mt-5 overflow-hidden rounded-3xl bg-aurora p-5 shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white/80">Today's progress</div>
            <div className="mt-1 font-display text-4xl font-bold text-white">{pct}%</div>
            <div className="mt-1 text-sm text-white/80">{completed} of {habits.length} habits</div>
          </div>
          <div className="relative h-24 w-24">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="white" strokeOpacity="0.2" strokeWidth="8" fill="none" />
              <motion.circle
                cx="50" cy="50" r="42" stroke="white" strokeWidth="8" fill="none" strokeLinecap="round"
                strokeDasharray={264}
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 - (264 * pct) / 100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <Flame className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Streak", val: "14d", icon: Flame, c: "bg-sunset" },
          { label: "Done", val: completed, icon: Check, c: "bg-mint-grad" },
          { label: "XP", val: "2.4k", icon: Zap, c: "bg-aurora" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-white/25 bg-white/15 p-3 backdrop-blur">
            <div className={`mb-2 grid h-9 w-9 place-items-center rounded-xl ${s.c}`}>
              <s.icon className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="font-display text-xl font-bold text-white">{s.val}</div>
            <div className="text-[11px] text-white/80">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Mood tracker */}
      <motion.div variants={item} className="mt-5 rounded-3xl border border-white/25 bg-white/15 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-white">How do you feel today?</h3>
          <span className="text-[10px] text-white/70">tap to log</span>
        </div>
        <div className="mt-3 flex justify-between">
          {moods.map((m, i) => (
            <motion.button key={i} whileTap={{ scale: 0.85 }} onClick={() => setMood(i)} className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl transition ${mood === i ? "bg-aurora shadow-glow scale-110" : "bg-white/10"}`}>
              {m}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Reminders preview */}
      <motion.div variants={item} className="mt-5 rounded-3xl border border-white/25 bg-white/15 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-base font-bold text-white"><Bell className="h-4 w-4 text-mint" /> Reminders</h3>
          <button onClick={() => setShowRem(true)} className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold text-white">Manage</button>
        </div>
        <div className="mt-3 space-y-2">
          {reminders.slice(0, 2).map(r => {
            const RIcon = resolveIcon(r.icon);
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-white/10 p-2.5">
                <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${r.color}`}><RIcon className="h-4.5 w-4.5 text-white" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{r.title}</div>
                  <div className="text-[10px] text-white/70">{r.reminder_time} · {r.days}</div>
                </div>
                <span className={`h-2 w-2 rounded-full ${r.is_on ? "bg-mint shadow-mint" : "bg-white/30"}`} />
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={item} className="mt-6 mb-3 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-white">Today's habits</h3>
        <button onClick={() => go("habits")} className="text-sm text-mint">See all</button>
      </motion.div>

      <motion.div variants={stagger} className="space-y-3">
        {habits.slice(0, 4).map((h) => (
          <HabitCard key={h.id} h={h} onLog={refresh} />
        ))}
      </motion.div>

      {/* AI insight */}
      <motion.div variants={item} className="mt-5 overflow-hidden rounded-3xl p-5 shadow-glow" style={{ background: "linear-gradient(135deg, oklch(0.6 0.25 280), oklch(0.7 0.22 320))" }}>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/90">
          <Sparkles className="h-3.5 w-3.5" /> AI Coach insight
        </div>
        <p className="mt-2 text-sm leading-snug text-white">
          You're <b>23% more consistent</b> on weekdays. Try scheduling your weekend habits before 10 AM to boost momentum 💪
        </p>
      </motion.div>

      <motion.div variants={item} className="mt-5 rounded-3xl glass p-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/80">
          <Sparkles className="h-3.5 w-3.5" /> Daily inspiration
        </div>
        <p className="mt-2 font-display text-lg leading-snug text-white">
          "Small habits don't add up — they compound."
        </p>
        <p className="mt-1 text-xs text-white/80">— James Clear</p>
      </motion.div>

      <motion.div variants={item} className="mt-5">
        <h3 className="mb-3 font-display text-lg font-bold text-white">This week</h3>
        <div className="flex justify-between gap-2">
          {["M","T","W","T","F","S","S"].map((d, i) => {
            const isToday = i === 1;
            const done = i < 1;
            return (
              <div key={i} className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl py-3 ${isToday ? "bg-aurora shadow-glow" : "glass"}`}>
                <span className="text-[10px] font-semibold uppercase text-white/80">{d}</span>
                <span className={`grid h-7 w-7 place-items-center rounded-full ${done || isToday ? "bg-white text-[oklch(0.45_0.22_320)]" : "bg-white/20 text-white/70"}`}>
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : isToday ? <Flame className="h-3.5 w-3.5" /> : i + 14}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={item} className="mt-6 grid grid-cols-2 gap-3">
        <button onClick={() => go("achievements")} className="overflow-hidden rounded-3xl bg-sunset p-4 text-left shadow-glow">
          <Trophy className="h-7 w-7 text-white" />
          <div className="mt-3 font-display text-base font-bold text-white">Achievements</div>
          <div className="text-xs text-white/85">3 new badges</div>
        </button>
        <button onClick={() => go("community")} className="overflow-hidden rounded-3xl bg-mint-grad p-4 text-left shadow-mint">
          <Users className="h-7 w-7 text-white" />
          <div className="mt-3 font-display text-base font-bold text-white">Community</div>
          <div className="text-xs text-white/85">12 new posts</div>
        </button>
      </motion.div>

      {/* Reminders Sheet */}
      <ModalSheet open={showRem} onClose={() => { setShowRem(false); setAdding(false); }} title="Your reminders">
        <div className="space-y-2">
          {reminders.map(r => {
            const RIcon = resolveIcon(r.icon);
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 p-3">
                <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${r.color}`}><RIcon className="h-5 w-5 text-white" /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{r.title}</div>
                  <div className="text-[11px] text-white/70">⏰ {r.reminder_time} · {r.days}</div>
                </div>
                <button onClick={() => { api.reminders.update(String(r.id), { is_on: !r.is_on }).then(updated => setReminders(rs => rs.map(x => x.id === r.id ? updated : x))).catch(()=>{}); }} className={`relative h-6 w-11 rounded-full transition ${r.is_on ? "bg-mint" : "bg-white/25"}`}>
                  <motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" style={{ left: r.is_on ? 22 : 2 }} />
                </button>
                <button onClick={() => { api.reminders.delete(String(r.id)).catch(()=>{}); setReminders(rs => rs.filter(x => x.id !== r.id)); }} className="grid h-8 w-8 place-items-center rounded-lg bg-pink/15 text-pink"><X className="h-3.5 w-3.5" /></button>
              </div>
            );
          })}
        </div>

        {adding ? (
          <div className="mt-4 space-y-3 rounded-2xl border border-white/30 bg-white/10 p-3">
            <div className="text-xs uppercase tracking-wider text-white/70">New reminder</div>
            <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="What should we remind you?" className="w-full rounded-xl border border-white/25 bg-white/15 px-3 py-2.5 text-sm text-white placeholder-white/60 outline-none focus:border-mint" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase text-white/70">Time</label>
                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="mt-1 w-full rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-sm text-white outline-none focus:border-mint" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-white/70">Repeat</label>
                <CustomSelect value={newDays} onChange={setNewDays} options={["Daily","Mon–Fri","Weekends","Mon–Sun"]} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAdding(false)} className="flex-1 rounded-xl bg-white/15 py-2.5 text-sm font-semibold text-white">Cancel</button>
              <button onClick={() => {
                api.reminders.create({ title: newTitle, reminder_time: newTime, days: newDays, icon: "Bell", color: "from-pink-400 to-fuchsia-400" })
                  .then(r => setReminders(rs => [...rs, r])).catch(()=>{});
                setAdding(false); setNewTitle(""); setNewTime("18:30"); setNewDays("Daily");
              }} className="flex-1 rounded-xl bg-aurora py-2.5 text-sm font-semibold text-white shadow-glow">Save reminder</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/40 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10">
            <Plus className="h-4 w-4" /> Add new reminder
          </button>
        )}
      </ModalSheet>
    </motion.div>
  );
}


function HabitCard({ h, onLog }: { h: Habit; onLog?: () => void }) {
  const HIcon = resolveIcon(h.icon);
  const [done, setDone] = useState(h.done);
  const [streak, setStreak] = useState(h.streak);
  const pct = Math.min(100, (done / Math.max(h.goal, 1)) * 100);
  const complete = done >= h.goal;

  const logValue = async (val: number) => {
    setDone(val);
    try {
      const res = await api.habits.log(h.id, val);
      setStreak(res.streak);
      onLog?.();
    } catch { /* offline — optimistic update kept */ }
  };

  return (
    <motion.div variants={item} layout className="relative overflow-hidden rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${h.color}`}>
          <HIcon className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate font-semibold text-white">{h.name}</div>
            <div className="flex items-center gap-1 text-xs text-amber"><Flame className="h-3 w-3" /> {streak}</div>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-white/80">
            <span>{done}/{h.goal} {h.unit}</span>
            <span>{Math.round(pct)}%</span>
          </div>
          <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div className={`h-full rounded-full bg-gradient-to-r ${h.color}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          <button onClick={() => logValue(Math.min(h.goal, done + 1))} className={`grid h-8 w-8 place-items-center rounded-lg transition active:scale-90 ${complete ? "bg-mint text-background" : "border border-white/30 bg-white/15 text-white"}`} aria-label="Increase">
            {complete ? <Check className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" />}
          </button>
          <button onClick={() => logValue(Math.max(0, done - 1))} className="grid h-8 w-8 place-items-center rounded-lg border border-white/30 bg-white/10 text-white transition active:scale-90" aria-label="Decrease">
            <span className="text-lg leading-none font-bold">−</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- HABITS LIST ---------------- */
function Habits_({}: { go: (s: Screen) => void }) {
  const { habits, refresh } = useHabitsStore();
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const [q, setQ] = useState("");
  useEffect(() => { refresh(); }, []);
  const visible = habits.filter(h => {
    const matchQ = h.name.toLowerCase().includes(q.toLowerCase());
    if (filter === "done")   return matchQ && h.done >= h.goal;
    if (filter === "active") return matchQ && h.done < h.goal;
    return matchQ;
  });
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4">
      <motion.div variants={item} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/80" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search habits…" className="w-full rounded-2xl border border-white/25 bg-white/15 py-3 pl-11 pr-4 text-sm text-white placeholder-white/60 outline-none focus:border-mint" />
      </motion.div>
      <motion.div variants={item} className="mt-4 flex gap-2">
        {(["all", "active", "done"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${filter === f ? "text-background" : "text-white/80"}`}>
            {filter === f && <motion.div layoutId="filter" className="absolute inset-0 rounded-full bg-mint" />}
            <span className="relative capitalize">{f}</span>
          </button>
        ))}
      </motion.div>
      <motion.div variants={stagger} className="mt-5 space-y-3">
        {visible.map((h) => <HabitCard key={h.id} h={h} onLog={refresh} />)}
      </motion.div>
    </motion.div>
  );
}

/* ---------------- ADD HABIT ---------------- */
function AddHabit({ go }: { go: (s: Screen) => void }) {
  const presets = [
    { icon: Droplets, iconName: "Droplets", label: "Water",     unit: "glasses", goal: 8,  c: "from-sky-400 to-cyan-300" },
    { icon: Dumbbell, iconName: "Dumbbell", label: "Workout",   unit: "sessions",goal: 1,  c: "from-pink-500 to-rose-400" },
    { icon: BookOpen, iconName: "BookOpen", label: "Read",      unit: "pages",   goal: 20, c: "from-amber-400 to-orange-400" },
    { icon: Brain,    iconName: "Brain",    label: "Meditate",  unit: "minutes", goal: 10, c: "from-violet-500 to-fuchsia-400" },
    { icon: MoonIcon, iconName: "Moon",     label: "Sleep",     unit: "hours",   goal: 8,  c: "from-indigo-500 to-blue-400" },
    { icon: Music,    iconName: "Music",    label: "Practice",  unit: "minutes", goal: 30, c: "from-emerald-400 to-teal-300" },
    { icon: Heart,    iconName: "Heart",    label: "Gratitude", unit: "entries", goal: 1,  c: "from-rose-400 to-pink-300" },
    { icon: Target,   iconName: "Target",   label: "Custom",    unit: "times",   goal: 1,  c: "from-fuchsia-500 to-violet-400" },
  ];
  const [sel, setSel] = useState(0);
  const [name, setName] = useState("Water");
  const [goal, setGoal] = useState(8);
  const [unit, setUnit] = useState("glasses");
  const [time, setTime] = useState("08:00");
  const days = ["M","T","W","T","F","S","S"];
  const [selDays, setSelDays] = useState<number[]>([0,1,2,3,4]);
  const [saving, setSaving] = useState(false);
  const pickPreset = (i: number) => {
    setSel(i); const p = presets[i];
    setName(p.label); setGoal(p.goal); setUnit(p.unit);
  };
  const handleCreate = async () => {
    setSaving(true);
    try {
      const p = presets[sel];
      const newHabit = await api.habits.create({ name, icon: p.iconName, color: p.c, goal, unit });
      _habits = [..._habits, newHabit];
      _setHabitsGlobal?.([..._habits]);
      // also add a reminder if user set one
      await api.reminders.create({ title: name, reminder_time: time, days: selDays.length === 7 ? "Daily" : selDays.length === 5 ? "Mon–Fri" : "Daily", icon: p.iconName, color: p.c }).catch(()=>{});
      go("home");
    } catch { /* offline */ go("home"); }
    finally { setSaving(false); }
  };
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4">
      <motion.h3 variants={item} className="font-display text-2xl font-bold text-white">Build a new habit</motion.h3>
      <motion.p variants={item} className="mt-1 text-sm text-white/85">Pick an icon, set your rhythm.</motion.p>

      <motion.div variants={item} className="mt-5 grid grid-cols-4 gap-3">
        {presets.map((p, i) => {
          const active = sel === i;
          return (
            <button key={i} onClick={() => pickPreset(i)} className="relative">
              <div className={`relative grid aspect-square place-items-center rounded-2xl bg-gradient-to-br ${p.c} transition ${active ? "scale-110 shadow-glow ring-2 ring-white" : "opacity-75"}`}
                style={active ? { boxShadow: "0 0 0 3px oklch(0.92 0.18 320 / 0.6), 0 12px 30px -8px oklch(0.6 0.28 320 / 0.7)" } : {}}>
                <p.icon className="h-7 w-7 text-white drop-shadow" />
                {active && (
                  <span className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-white shadow">
                    <Check className="h-3 w-3 text-[oklch(0.45_0.22_320)]" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div className={`mt-1 text-center text-[11px] font-medium ${active ? "text-white" : "text-white/75"}`}>{p.label}</div>
            </button>
          );
        })}
      </motion.div>

      <motion.div variants={item} className="mt-6">
        <label className="text-xs uppercase tracking-wider text-white/80">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/40 bg-white/20 px-4 py-3 text-white outline-none focus:border-mint backdrop-blur" />
      </motion.div>

      <motion.div variants={item} className="mt-5">
        <label className="text-xs uppercase tracking-wider text-white/80">Repeat</label>
        <div className="mt-2 flex justify-between gap-1">
          {days.map((d, i) => {
            const on = selDays.includes(i);
            return (
              <button key={i} onClick={() => setSelDays(on ? selDays.filter(x=>x!==i) : [...selDays, i])} className={`grid aspect-square flex-1 place-items-center rounded-xl text-sm font-bold transition ${on ? "bg-aurora text-white shadow-glow" : "border border-white/30 bg-white/15 text-white/75"}`}>
                {d}
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={item} className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/30 bg-white/15 p-3 backdrop-blur">
          <div className="text-[11px] uppercase tracking-wider text-white/80">Goal</div>
          <div className="mt-1 flex items-center gap-2">
            <button onClick={() => setGoal(g => Math.max(1, g - 1))} className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 text-white text-lg font-bold">−</button>
            <input type="number" min={1} value={goal} onChange={e => setGoal(Math.max(1, +e.target.value || 1))} className="w-full rounded-lg bg-transparent text-center font-display text-xl font-bold text-white outline-none" />
            <button onClick={() => setGoal(g => g + 1)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 text-white text-lg font-bold">+</button>
          </div>
          <input value={unit} onChange={e => setUnit(e.target.value)} className="mt-1 w-full rounded-md bg-transparent text-center text-[11px] text-white/85 outline-none" />
        </div>
        <div className="rounded-2xl border border-white/30 bg-white/15 p-3 backdrop-blur">
          <div className="text-[11px] uppercase tracking-wider text-white/80">Reminder</div>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 w-full rounded-lg bg-transparent text-center font-display text-2xl font-bold text-white outline-none" />
          <div className="mt-1 text-center text-[11px] text-white/80">every selected day</div>
        </div>
      </motion.div>

      <motion.button variants={item} onClick={handleCreate} disabled={saving} className="mt-6 w-full rounded-2xl bg-aurora py-4 font-semibold text-white shadow-glow active:scale-[0.98] disabled:opacity-60">
        {saving ? "Creating…" : "Create habit"}
      </motion.button>
    </motion.div>
  );
}

/* ---------------- STATS ---------------- */
function Stats_() {
  const [range, setRange] = useState<"W" | "M" | "Y">("W");
  const [year, setYear] = useState(2026);
  // Year-aware deterministic data so changing year/range updates every chart
  const { data, heroPct, delta } = useMemo(() => {
    const seed = year * 7 + (range === "W" ? 1 : range === "M" ? 2 : 3);
    const len = range === "W" ? 7 : range === "M" ? 10 : 12;
    const arr = Array.from({ length: len }, (_, i) => {
      const v = Math.sin((seed + i) * 1.13) * 22 + Math.cos((seed - i) * 0.7) * 14 + 70;
      return Math.max(20, Math.min(100, Math.round(v)));
    });
    const avg = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const prev = Math.round(50 + ((seed * 13) % 35));
    return { data: arr, heroPct: avg, delta: avg - prev };
  }, [range, year]);
  const labels = { W: ["M","T","W","T","F","S","S"], M: ["1","4","7","10","13","16","19","22","25","28"], Y: ["J","F","M","A","M","J","J","A","S","O","N","D"] }[range];
  // line chart points
  const w = 320, h = 90;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / 100) * h}`).join(" ");

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4">
      {/* Range + year selector */}
      <motion.div variants={item} className="flex items-center justify-between gap-3">
        <div className="flex rounded-full bg-white/15 p-1 border border-white/25">
          {(["W","M","Y"] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className="relative px-4 py-1.5 text-xs font-bold">
              {range === r && <motion.div layoutId="rangepill" className="absolute inset-0 rounded-full bg-white" />}
              <span className={`relative ${range === r ? "text-[oklch(0.45_0.22_320)]" : "text-white/80"}`}>
                {r === "W" ? "Week" : r === "M" ? "Month" : "Year"}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/30 bg-white/15 px-2 py-1.5">
          <button onClick={() => setYear(y => y - 1)} className="grid h-6 w-6 place-items-center text-white/80">‹</button>
          <span className="px-1 text-xs font-bold text-white">{year}</span>
          <button onClick={() => setYear(y => y + 1)} className="grid h-6 w-6 place-items-center text-white/80">›</button>
        </div>
      </motion.div>

      {/* Hero: completion + improvement */}
      <motion.div variants={item} className="mt-4 rounded-3xl bg-aurora p-5 shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-white/85">{range === "W" ? "This week" : range === "M" ? "This month" : `${year}`}</div>
            <div className="mt-1 font-display text-4xl font-bold text-white">{heroPct}%</div>
            <div className="text-xs text-white/80">completion rate</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 rounded-full bg-white/25 px-3 py-1.5 text-xs font-semibold text-white">
              <TrendingUp className={`h-3.5 w-3.5 ${delta < 0 ? "rotate-180" : ""}`} /> {delta >= 0 ? "+" : ""}{delta}% vs last
            </div>
            <div className="text-[10px] text-white/85">vs prev {range === "W" ? "week" : range === "M" ? "month" : "year"}</div>
          </div>
        </div>
        {/* Bars with Y-axis */}
        <div className="mt-5 flex items-stretch gap-2">
          <div className="flex h-32 flex-col justify-between pr-1 text-right text-[9px] font-semibold text-white/75">
            <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
          </div>
          <div className="relative flex-1">
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0,1,2,3,4].map(i => <div key={i} className="h-px bg-white/20" />)}
            </div>
            <div className="relative flex h-32 items-end justify-between gap-1.5">
              {data.map((b, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <motion.div
                    className="w-full rounded-t-md bg-gradient-to-t from-amber-200 via-pink-300 to-white shadow-[0_-2px_8px_oklch(1_0_0/0.4)]"
                    initial={{ height: 0 }}
                    animate={{ height: `${b}%` }}
                    transition={{ delay: i * 0.04, duration: 0.6 }}
                    title={`${labels[i]}: ${b}%`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex justify-between gap-1.5">
              {labels.map((l, i) => <span key={i} className="flex-1 text-center text-[10px] font-semibold text-white/90">{l}</span>)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Line chart - trend with axes */}
      <motion.div variants={item} className="mt-4 rounded-3xl border border-white/25 bg-white/15 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-white">Consistency trend</h3>
            <p className="text-[11px] text-white/80">Avg performance over time (%)</p>
          </div>
          <span className="rounded-full bg-mint-grad px-3 py-1 text-[10px] font-bold text-white">↗ Improving</span>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex h-[110px] flex-col justify-between pr-1 text-right text-[9px] font-semibold text-white/75">
            <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
          </div>
          <div className="flex-1">
            <svg viewBox={`0 0 ${w} ${h + 10}`} className="w-full" style={{ height: 110 }}>
              <defs>
                <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.92 0.15 170)" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="oklch(0.92 0.15 170)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0,1,2,3,4].map(i => (
                <line key={i} x1="0" x2={w} y1={(h/4)*i} y2={(h/4)*i} stroke="white" strokeOpacity="0.18" strokeDasharray="2 4" />
              ))}
              <motion.polygon initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} points={`0,${h} ${points} ${w},${h}`} fill="url(#lineFill)" />
              <motion.polyline initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: "easeInOut" }} points={points} fill="none" stroke="oklch(0.95 0.15 170)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {data.map((v, i) => (
                <g key={i}>
                  <motion.circle initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.05 }} cx={(i / (data.length - 1)) * w} cy={h - (v / 100) * h} r="3" fill="white" />
                  <title>{`${labels[i]}: ${v}%`}</title>
                </g>
              ))}
            </svg>
            <div className="mt-1 flex justify-between text-[10px] font-semibold text-white/90">
              {labels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Donut + KPI */}
      <motion.div variants={item} className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-3xl border border-white/25 bg-white/15 p-4">
          <div className="text-xs text-white/80">Habit mix</div>
          <div className="relative mx-auto mt-2 h-28 w-28">
            <svg viewBox="0 0 36 36" className="-rotate-90">
              {[
                { v: 35, c: "oklch(0.78 0.18 30)", o: 0 },
                { v: 25, c: "oklch(0.74 0.25 350)", o: 35 },
                { v: 22, c: "oklch(0.85 0.18 170)", o: 60 },
                { v: 18, c: "oklch(0.78 0.15 230)", o: 82 },
              ].map((s, i) => (
                <motion.circle
                  key={i} cx="18" cy="18" r="15.9" fill="none" stroke={s.c} strokeWidth="4"
                  strokeDasharray={`${s.v} 100`} strokeDashoffset={-s.o}
                  initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: `${s.v} 100` }}
                  transition={{ duration: 0.9, delay: i * 0.1 }}
                />
              ))}
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="font-display text-xl font-bold text-white">6</div>
                <div className="text-[9px] text-white/80">habits</div>
              </div>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-white/85">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "oklch(0.78 0.18 30)" }} /> Health</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "oklch(0.74 0.25 350)" }} /> Mind</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "oklch(0.85 0.18 170)" }} /> Body</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "oklch(0.78 0.15 230)" }} /> Sleep</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: "Best streak", val: "28d", delta: "+4d", icon: Flame, c: "from-orange-400 to-pink-400" },
            { label: "Total done", val: "412", delta: "+38", icon: Check, c: "from-emerald-400 to-teal-400" },
            { label: "Perfect days", val: "37", delta: "+9", icon: Star, c: "from-amber-400 to-yellow-300" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/15 p-3">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${s.c}`}><s.icon className="h-4.5 w-4.5 text-white" /></div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg font-bold text-white">{s.val}</div>
                <div className="text-[10px] text-white/80">{s.label}</div>
              </div>
              <span className="rounded-full bg-mint/30 px-2 py-0.5 text-[10px] font-bold text-mint">{s.delta}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top habits with improvement */}
      <motion.div variants={item} className="mt-4 rounded-3xl border border-white/25 bg-white/15 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-white">Top habits</h3>
          <span className="text-[10px] text-white/80">vs last {range === "W" ? "week" : range === "M" ? "month" : "year"}</span>
        </div>
        <div className="mt-4 space-y-3">
          {_habits.slice(0, 5).map((h, i) => {
            const HIcon = resolveIcon(h.icon);
            const pct = 92 - i * 7;
            const delta = [+12, +5, -3, +8, +2][i];
            const up = delta >= 0;
            return (
              <div key={i} className="flex items-center gap-3">
                <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${h.color}`}><HIcon className="h-4.5 w-4.5 text-white" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate text-white">{h.name}</span>
                    <span className="flex items-center gap-1 text-white/80">
                      {pct}%
                      <span className={`flex items-center text-[10px] font-bold ${up ? "text-mint" : "text-pink"}`}>
                        <TrendingUp className={`h-3 w-3 ${up ? "" : "rotate-180"}`} />{up ? "+" : ""}{delta}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }} className={`h-full bg-gradient-to-r ${h.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Heatmap — interactive */}
      <motion.div variants={item} className="mt-4 rounded-3xl border border-white/25 bg-white/15 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-white">Activity heatmap</h3>
          <span className="text-[10px] text-white/80">last 12 weeks · hover a cell</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          <div className="flex flex-col justify-between py-0.5 pr-1 text-[9px] font-semibold text-white/75">
            {["Mon","Wed","Fri","Sun"].map(d => <span key={d}>{d}</span>)}
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 12 * 7 }, (_, i) => {
                const v = (Math.sin(i * 0.7) + 1) / 2;
                const count = Math.round(v * 6);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.6, zIndex: 10 }}
                    transition={{ delay: i * 0.004 }}
                    className="aspect-square cursor-pointer rounded-[4px] border border-white/15"
                    style={{ background: `oklch(0.78 0.22 ${170 + v * 160} / ${0.25 + v * 0.75})` }}
                    title={`Week ${Math.floor(i / 7) + 1} · ${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i % 7]} — ${count} habits done`}
                  />
                );
              })}
            </div>
            <div className="mt-1.5 flex justify-between text-[9px] font-semibold text-white/75">
              {["W1","W3","W5","W7","W9","W11"].map(w => <span key={w}>{w}</span>)}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-white/80">
          Less
          {[0.25, 0.45, 0.65, 0.85, 1].map((o, i) => (
            <span key={i} className="h-3 w-4 rounded-[3px]" style={{ background: `oklch(0.78 0.22 ${170 + i * 40} / ${o})` }} />
          ))}
          More
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- CALENDAR ---------------- */
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function Calendar_() {
  const [month, setMonth] = useState(5); // June
  const [year, setYear] = useState(2026);
  const [pickerOpen, setPickerOpen] = useState(false);
  const days = Array.from({ length: 35 }, (_, i) => i - 2);
  const today = month === 5 && year === 2026 ? 16 : -1;

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4">
      <motion.div variants={item} className="flex items-center justify-between">
        <button onClick={() => setPickerOpen(o => !o)} className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-3 py-2">
          <h3 className="font-display text-xl font-bold text-white">{MONTHS[month]} {year}</h3>
          <ChevronRight className={`h-4 w-4 text-white/80 transition ${pickerOpen ? "rotate-90" : ""}`} />
        </button>
        <div className="flex gap-2">
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/15 text-white">‹</button>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/15 text-white">›</button>
        </div>
      </motion.div>

      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="mt-3 overflow-hidden rounded-2xl border border-white/25 bg-white/15"
          >
            <div className="flex items-center justify-between px-4 pt-3">
              <button onClick={() => setYear(y => y - 1)} className="rounded-full bg-white/15 px-3 py-1 text-xs text-white">‹ {year - 1}</button>
              <span className="font-display text-base font-bold text-white">{year}</span>
              <button onClick={() => setYear(y => y + 1)} className="rounded-full bg-white/15 px-3 py-1 text-xs text-white">{year + 1} ›</button>
            </div>
            <div className="grid grid-cols-4 gap-2 p-3">
              {MONTHS.map((m, i) => (
                <button key={m} onClick={() => { setMonth(i); setPickerOpen(false); }}
                  className={`rounded-xl px-2 py-2 text-xs font-semibold transition ${month === i ? "bg-aurora text-white shadow-glow" : "bg-white/15 text-white/85 hover:bg-white/25"}`}>
                  {m.slice(0,3)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={item} className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase text-white/80">
        {["M","T","W","T","F","S","S"].map((d, i) => <div key={i}>{d}</div>)}
      </motion.div>
      <motion.div variants={item} key={`${month}-${year}`} className="mt-2 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const isMonth = d > 0 && d <= 30;
          const intensity = isMonth ? (i * 37) % 100 : 0;
          const isToday = d === today;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`relative grid aspect-square place-items-center rounded-full border text-xs font-medium ${isToday ? "ring-2 ring-white shadow-glow border-white" : "border-white/30"} ${!isMonth ? "text-white/30 border-transparent" : "text-white"}`}
              style={{
                background: isMonth ? `linear-gradient(135deg, oklch(0.7 0.25 320 / ${0.35 + intensity / 200}), oklch(0.78 0.22 250 / ${0.35 + intensity / 200}))` : "transparent",
              }}
            >
              {isMonth ? d : ""}
              {isMonth && intensity > 70 && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-white" />}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Legend */}
      <motion.div variants={item} className="mt-3 flex items-center gap-2 text-[10px] text-white/80">
        Streak intensity
        {[0.2, 0.4, 0.6, 0.8, 1].map((o, i) => (
          <span key={i} className="h-3 w-4 rounded-md" style={{ background: `oklch(0.7 0.25 320 / ${o})` }} />
        ))}
      </motion.div>

      <motion.div variants={item} className="mt-5 rounded-3xl border border-white/25 bg-white/15 p-5">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-lg font-bold text-white">{MONTHS[month].slice(0,3)} {today > 0 ? today : 1} {today > 0 ? "— Today" : ""}</h4>
          <span className="rounded-full bg-mint-grad px-3 py-1 text-[10px] font-bold text-white">4 / 6 done</span>
        </div>
        <div className="mt-3 space-y-2.5">
          {_habits.slice(0, 6).map((h, i) => {
            const HIcon = resolveIcon(h.icon);
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white/15 p-2.5">
                <div className={`grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br ${h.color}`}><HIcon className="h-4 w-4 text-white" /></div>
                <span className="flex-1 text-sm text-white">{h.name}</span>
                {i < 4 ? <Check className="h-4 w-4 text-mint" /> : <span className="text-xs text-white/80">pending</span>}
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={item} className="mt-4 rounded-3xl bg-sunset p-5">
        <div className="flex items-center gap-3">
          <Award className="h-8 w-8 text-white" />
          <div>
            <div className="font-display text-base font-bold text-white">Monthly milestone</div>
            <div className="text-xs text-white/85">You're 3 days from a perfect month!</div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
          <motion.div initial={{ width: 0 }} animate={{ width: "87%" }} transition={{ duration: 1 }} className="h-full bg-white" />
        </div>
      </motion.div>
    </motion.div>
  );
}


/* ---------------- ACHIEVEMENTS ---------------- */
function Achievements_() {
  const items = [
    { icon: Flame, name: "Fire starter", desc: "7-day streak", unlocked: true, progress: 100, c: "from-orange-400 to-pink-400", date: "May 28" },
    { icon: Star, name: "Rising star", desc: "30 perfect days", unlocked: true, progress: 100, c: "from-amber-400 to-yellow-300", date: "Jun 10" },
    { icon: Award, name: "Dedicated", desc: "Log 500 habits", unlocked: true, progress: 100, c: "from-emerald-400 to-teal-400", date: "Jun 14" },
    { icon: Trophy, name: "Champion", desc: "100-day streak", unlocked: false, progress: 14, c: "from-violet-500 to-fuchsia-400", date: "" },
    { icon: Target, name: "Sharp shooter", desc: "Hit 10 goals", unlocked: false, progress: 60, c: "from-sky-400 to-cyan-300", date: "" },
    { icon: Zap, name: "Lightning", desc: "Reach 5k XP", unlocked: false, progress: 48, c: "from-pink-500 to-rose-400", date: "" },
  ];
  const recent = items.filter(i => i.unlocked);
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4">
      <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-sunset p-5 shadow-glow">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-white/25">
            <Trophy className="h-10 w-10 text-white" />
            <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-white text-[oklch(0.55_0.22_30)] text-xs font-bold">12</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wider text-white/85">Level 12</div>
            <div className="font-display text-2xl font-bold text-white">Habit Hero</div>
            <div className="mt-1 text-xs text-white/85">2,400 / 3,000 XP to Level 13</div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/25">
              <motion.div initial={{ width: 0 }} animate={{ width: "80%" }} transition={{ duration: 1 }} className="h-full bg-white" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="mt-4 grid grid-cols-3 gap-3">
        {[
          { v: recent.length, l: "Unlocked" },
          { v: items.length - recent.length, l: "Locked" },
          { v: "82%", l: "Progress" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-white/25 bg-white/15 p-3 text-center">
            <div className="font-display text-xl font-bold text-white">{s.v}</div>
            <div className="text-[10px] text-white/80">{s.l}</div>
          </div>
        ))}
      </motion.div>

      <motion.h3 variants={item} className="mt-6 font-display text-lg font-bold text-white">Recently unlocked</motion.h3>
      <motion.div variants={item} className="mt-3 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {recent.map((b, i) => (
          <div key={i} className="shrink-0 w-28 rounded-2xl border border-white/25 bg-white/15 p-3 text-center">
            <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${b.c} shadow-glow`}>
              <b.icon className="h-7 w-7 text-white" />
            </div>
            <div className="mt-2 text-xs font-semibold text-white">{b.name}</div>
            <div className="text-[10px] text-white/80">{b.date}</div>
          </div>
        ))}
      </motion.div>

      <motion.h3 variants={item} className="mt-6 font-display text-lg font-bold text-white">All badges</motion.h3>
      <motion.div variants={stagger} className="mt-3 grid grid-cols-2 gap-3">
        {items.map((b, i) => (
          <motion.div key={i} variants={item} className="relative overflow-hidden rounded-2xl border border-white/25 bg-white/15 p-4">
            <div className={`mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${b.c} ${!b.unlocked && "grayscale opacity-50"}`}>
              <b.icon className="h-6 w-6 text-white" />
            </div>
            <div className="font-semibold text-white">{b.name}</div>
            <div className="text-[11px] text-white/80">{b.desc}</div>
            {!b.unlocked && (
              <div className="mt-2">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${b.progress}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} className={`h-full bg-gradient-to-r ${b.c}`} />
                </div>
                <div className="mt-1 text-[10px] text-white/80">{b.progress}% complete</div>
              </div>
            )}
            {b.unlocked && <div className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-mint"><Check className="h-3.5 w-3.5 text-[oklch(0.25_0.1_300)]" strokeWidth={3} /></div>}
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item} className="mt-6 rounded-3xl border border-white/25 bg-white/15 p-5">
        <h3 className="font-display text-base font-bold text-white">Leaderboard</h3>
        <div className="mt-3 space-y-2">
          {[
            { rank: 1, name: "Maya", xp: 3120, you: false, m: "🌸" },
            { rank: 2, name: "You", xp: 2400, you: true, m: "🌟" },
            { rank: 3, name: "Jordan", xp: 2210, you: false, m: "🏃" },
            { rank: 4, name: "Sam", xp: 1950, you: false, m: "📚" },
          ].map(r => (
            <div key={r.rank} className={`flex items-center gap-3 rounded-2xl p-2.5 ${r.you ? "bg-aurora shadow-glow" : "bg-white/10"}`}>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-xs font-bold text-white">{r.rank}</span>
              <span className="text-xl">{r.m}</span>
              <span className="flex-1 text-sm font-semibold text-white">{r.name}</span>
              <span className="text-xs font-bold text-white">{r.xp} XP</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}


/* ---------------- COMMUNITY ---------------- */
type Friend = { name: string; avatar: string; c: string; streak: number; xp: number; friends: boolean; history: number[]; topHabit: string };

function Community_() {
  const initial: Friend[] = [
    { name: "Maya", avatar: "🌸", c: "from-violet-500 to-fuchsia-400", streak: 32, xp: 3120, friends: true, history: [70, 80, 85, 88, 92, 94, 96], topHabit: "Meditation" },
    { name: "Jordan", avatar: "🏃", c: "from-emerald-400 to-teal-400", streak: 21, xp: 2210, friends: true, history: [50, 55, 60, 65, 72, 80, 78], topHabit: "Running" },
    { name: "Sam", avatar: "📚", c: "from-amber-400 to-orange-400", streak: 17, xp: 1950, friends: true, history: [45, 55, 50, 60, 70, 75, 80], topHabit: "Reading" },
    { name: "Lia", avatar: "🎨", c: "from-pink-400 to-rose-300", streak: 9, xp: 1420, friends: false, history: [30, 40, 45, 50, 55, 60, 62], topHabit: "Drawing" },
    { name: "Kai", avatar: "🎵", c: "from-sky-400 to-cyan-300", streak: 12, xp: 1180, friends: false, history: [40, 42, 48, 52, 58, 60, 64], topHabit: "Piano" },
  ];
  const me = { name: "You", avatar: "🌟", streak: 14, xp: 2400, history: [60, 65, 70, 72, 75, 80, 82] };
  const [friends, setFriends] = useState<Friend[]>(initial);
  const [open, setOpen] = useState<Friend | null>(null);
  const [tab, setTab] = useState<"feed" | "friends">("feed");
  const [challengeHabit, setChallengeHabit] = useState("Workout");
  const [challengeTarget, setChallengeTarget] = useState(7);
  const [sent, setSent] = useState(false);

  const feed = [
    { name: "Maya", avatar: "🌸", text: "Just hit a 30-day meditation streak! 🧘", likes: 24, c: "from-violet-500 to-fuchsia-400" },
    { name: "Jordan", avatar: "🏃", text: "Morning run done. Crushed my pace!", likes: 18, c: "from-emerald-400 to-teal-400" },
    { name: "Sam", avatar: "📚", text: "Finished my reading goal for the week.", likes: 31, c: "from-amber-400 to-orange-400" },
  ];

  const toggleFriend = (f: Friend) => setFriends(fs => fs.map(x => x.name === f.name ? { ...x, friends: !x.friends } : x));

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4">
      <motion.div variants={item} className="flex gap-2 rounded-full border border-white/25 bg-white/10 p-1">
        {(["feed","friends"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`relative flex-1 rounded-full px-3 py-1.5 text-xs font-bold ${tab === t ? "text-[oklch(0.45_0.22_320)]" : "text-white/80"}`}>
            {tab === t && <motion.div layoutId="comtab" className="absolute inset-0 rounded-full bg-white shadow-glow" />}
            <span className="relative capitalize">{t === "feed" ? "🌍 Feed" : "👥 Friends"}</span>
          </button>
        ))}
      </motion.div>

      <motion.div variants={item} className="mt-5 flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {[{ name: "You", avatar: "🌟" }, ...friends].map((u, i) => (
          <button key={i} onClick={() => i > 0 && setOpen(friends[i - 1])} className="flex shrink-0 flex-col items-center gap-1.5">
            <div className={`grid h-16 w-16 place-items-center rounded-full text-2xl ring-2 ${i === 0 ? "ring-mint" : "ring-white/40"}`} style={{ background: "var(--gradient-aurora)" }}>
              {u.avatar}
            </div>
            <span className="text-[11px] text-white/80">{u.name}</span>
          </button>
        ))}
      </motion.div>

      {tab === "feed" && (
        <motion.div variants={stagger} className="mt-3 space-y-3">
          {feed.map((f, i) => (
            <motion.div key={i} variants={item} className="rounded-3xl border border-white/25 bg-white/15 p-4">
              <button onClick={() => setOpen(friends.find(x => x.name === f.name) || null)} className="flex w-full items-center gap-3 text-left">
                <div className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${f.c} text-xl`}>{f.avatar}</div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{f.name}</div>
                  <div className="text-xs text-white/70">{i + 1}h ago</div>
                </div>
                <ChevronRight className="h-4 w-4 text-white/60" />
              </button>
              <p className="mt-3 text-sm text-white/85">{f.text}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-white/80">
                <button className="flex items-center gap-1.5 transition hover:text-pink"><Heart className="h-4 w-4" /> {f.likes}</button>
                <button className="flex items-center gap-1.5">💬 4</button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {tab === "friends" && (
        <motion.div variants={stagger} className="mt-3 space-y-2">
          {friends.map((f) => (
            <motion.button key={f.name} variants={item} onClick={() => setOpen(f)} className="flex w-full items-center gap-3 rounded-2xl border border-white/25 bg-white/15 p-3 text-left transition hover:bg-white/25">
              <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${f.c} text-xl`}>{f.avatar}</div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white">{f.name}</div>
                <div className="text-[11px] text-white/75">🔥 {f.streak}d · ⚡ {f.xp} XP</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${f.friends ? "bg-mint/30 text-mint" : "bg-white/15 text-white"}`}>{f.friends ? "Friends" : "+ Add"}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      <ModalSheet open={!!open} onClose={() => { setOpen(null); setSent(false); }} title={open?.name ?? ""}>
        {open && (() => {
          const meAvg = me.history.reduce((a,b)=>a+b,0) / me.history.length;
          const fAvg = open.history.reduce((a,b)=>a+b,0) / open.history.length;
          const leader = fAvg > meAvg ? open.name : "You";
          const lead = Math.abs(fAvg - meAvg).toFixed(1);
          const w = 280, h = 70;
          const toPts = (arr: number[]) => arr.map((v, i) => `${(i/(arr.length-1))*w},${h - (v/100)*h}`).join(" ");
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl p-3 shadow-glow" style={{ background: "var(--gradient-aurora)" }}>
                <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${open.c} text-2xl`}>{open.avatar}</div>
                <div className="flex-1">
                  <div className="font-display text-lg font-bold text-white">{open.name}</div>
                  <div className="text-[11px] text-white/85">Top habit: {open.topHabit}</div>
                </div>
                <button onClick={() => toggleFriend(open)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${open.friends ? "bg-pink/30 text-white" : "bg-white text-[oklch(0.45_0.22_320)]"}`}>
                  {open.friends ? "Remove" : "+ Add"}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/25 bg-white/10 p-3 text-center">
                <div>
                  <div className="text-3xl">🌟</div>
                  <div className="mt-1 text-[10px] text-white/70">You</div>
                  <div className="font-display text-base font-bold text-white">{me.xp} XP</div>
                  <div className="text-[10px] text-white/70">🔥 {me.streak}d</div>
                </div>
                <div className="grid place-items-center">
                  <div className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase text-white">VS</div>
                  <div className="mt-2 text-[10px] text-mint">{leader} leads</div>
                  <div className="font-display text-sm font-bold text-white">+{lead}%</div>
                </div>
                <div>
                  <div className="text-3xl">{open.avatar}</div>
                  <div className="mt-1 text-[10px] text-white/70">{open.name}</div>
                  <div className="font-display text-base font-bold text-white">{open.xp} XP</div>
                  <div className="text-[10px] text-white/70">🔥 {open.streak}d</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/25 bg-white/10 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white">Past 7 weeks · consistency %</div>
                  <div className="flex gap-2 text-[10px]">
                    <span className="flex items-center gap-1 text-white"><span className="h-2 w-2 rounded-full bg-mint" /> You</span>
                    <span className="flex items-center gap-1 text-white"><span className="h-2 w-2 rounded-full bg-pink" /> {open.name}</span>
                  </div>
                </div>
                <svg viewBox={`0 0 ${w} ${h+10}`} className="mt-2 w-full" style={{ height: 90 }}>
                  {[0,1,2,3].map(i => <line key={i} x1="0" x2={w} y1={(h/3)*i} y2={(h/3)*i} stroke="white" strokeOpacity="0.15" strokeDasharray="2 4" />)}
                  <motion.polyline initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }} points={toPts(me.history)} fill="none" stroke="oklch(0.85 0.18 170)" strokeWidth="2.5" strokeLinecap="round" />
                  <motion.polyline initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.2 }} points={toPts(open.history)} fill="none" stroke="oklch(0.78 0.25 350)" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <div className="mt-1 flex justify-between text-[9px] font-semibold text-white/70">
                  {["W1","W2","W3","W4","W5","W6","W7"].map(wk => <span key={wk}>{wk}</span>)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/25 bg-white/10 p-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><Target className="h-3.5 w-3.5 text-mint" /> Challenge {open.name}</div>
                <div className="mt-2">
                  <label className="text-[10px] uppercase text-white/70">Habit</label>
                  <CustomSelect value={challengeHabit} onChange={setChallengeHabit} options={_habits.map(h => h.name)} />
                </div>
                <div className="mt-2">
                  <label className="text-[10px] uppercase text-white/70">Target — {challengeTarget} days in a row</label>
                  <input type="range" min={3} max={30} value={challengeTarget} onChange={e => setChallengeTarget(+e.target.value)} className="mt-1 w-full accent-mint" />
                </div>
                <button onClick={() => setSent(true)} disabled={sent} className="mt-3 w-full rounded-2xl bg-aurora py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60">
                  {sent ? "✓ Challenge sent!" : "🔥 Send challenge"}
                </button>
              </div>
            </div>
          );
        })()}
      </ModalSheet>
    </motion.div>
  );
}


/* ---------------- NOTIFICATIONS ---------------- */
function Notifications_({ go }: { go: (s: Screen) => void }) {
  const [notes, setNotes] = useState<AppNotification[]>([]);
  useEffect(() => { api.notifications.list().then(setNotes).catch(()=>{}); }, []);
  const unreadCount = notes.filter(n => !n.is_read).length;
  const handleMarkAllRead = async () => {
    await api.notifications.markAllRead().catch(()=>{});
    setNotes(ns => ns.map(n => ({ ...n, is_read: true })));
  };
  const handleTap = async (n: AppNotification) => {
    if (!n.is_read) {
      await api.notifications.markRead(n.id).catch(()=>{});
      setNotes(ns => ns.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    }
    go(n.route as Screen);
  };
  const fmtAgo = (iso: string) => {
    const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.round(m/60)}h ago`;
    return `${Math.round(m/1440)}d ago`;
  };
  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4">
      <motion.div variants={item} className="flex items-center justify-between rounded-3xl bg-aurora p-4 shadow-glow">
        <div>
          <div className="font-display text-xl font-bold text-white">Inbox</div>
          <div className="text-xs text-white/85">{unreadCount} unread · tap to open</div>
        </div>
        <button onClick={handleMarkAllRead} className="rounded-full bg-white/25 px-3 py-1.5 text-xs font-semibold text-white">Mark all read</button>
      </motion.div>

      <motion.div variants={item} className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {["All", "Streaks", "Reminders", "Social", "Tips"].map((c, i) => (
          <button key={c} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${i === 0 ? "bg-white text-[oklch(0.45_0.22_320)]" : "border border-white/30 bg-white/15 text-white"}`}>{c}</button>
        ))}
      </motion.div>

      <motion.div variants={stagger} className="mt-4 space-y-3">
        {notes.map((n, i) => {
          const NIcon = resolveIcon(n.icon);
          return (
            <motion.button
              key={i} variants={item}
              onClick={() => handleTap(n)}
              whileTap={{ scale: 0.98 }}
              className="group flex w-full items-start gap-3 rounded-2xl border border-white/25 bg-white/15 p-4 text-left transition hover:bg-white/25"
            >
              <div className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl ${n.color_class}`}>
                <NIcon className="h-5 w-5 text-white" />
                {!n.is_read && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-pink ring-2 ring-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <div className="font-semibold text-white">{n.title}</div>
                  <div className="text-[11px] text-white/80 whitespace-nowrap">{fmtAgo(n.created_at)}</div>
                </div>
                <div className="mt-0.5 text-sm text-white/80">{n.body}</div>
              </div>
              <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-white/70 transition group-hover:translate-x-1" />
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

/* ---------------- PROFILE ---------------- */
const AVATARS = ["🌟","🌸","🦊","🐼","🦁","🐯","🐧","🦄","🎨","🎵","🏃","📚","🧘","💪","🌈","🔥"];
const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "zh", label: "Chinese", native: "中文" },
];
const THEMES = [
  { id: "candy", label: "Candy Pop", grad: "linear-gradient(135deg, oklch(0.62 0.22 30), oklch(0.58 0.25 350), oklch(0.5 0.25 290))" },
  { id: "aurora", label: "Aurora", grad: "linear-gradient(135deg, oklch(0.62 0.25 300), oklch(0.66 0.27 350), oklch(0.72 0.22 30))" },
  { id: "ocean", label: "Ocean", grad: "linear-gradient(135deg, oklch(0.6 0.18 220), oklch(0.55 0.2 260), oklch(0.7 0.18 190))" },
  { id: "sunset", label: "Sunset", grad: "linear-gradient(135deg, oklch(0.7 0.25 350), oklch(0.78 0.20 60), oklch(0.72 0.22 30))" },
];

function ModalSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="absolute inset-x-0 bottom-0 z-50 max-h-[80%] overflow-y-auto scrollbar-hide rounded-t-[2rem] glass-strong p-5 shadow-2xl">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/40" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">{title}</h3>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white"><X className="h-4 w-4" /></button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Profile_({ go, user, onUserUpdate }: { go: (s: Screen) => void; user: User | null; onUserUpdate: (u: User) => void }) {
  const [avatar, setAvatar] = useState(user?.avatar ?? "🌟");
  useEffect(() => { if (user?.avatar) setAvatar(user.avatar); }, [user?.avatar]);
  const [modal, setModal] = useState<null | "account" | "appearance" | "language" | "sounds" | "help">(null);
  const [lang, setLang] = useState(user?.language ?? "English");
  const { theme, setTheme, dark, setDark } = useTheme();
  const [sound, setSound] = useState(true);
  const [haptic, setHaptic] = useState(true);
  const [twoFA, setTwoFA] = useState(false);
  const [toast, setToast] = useState<{ emoji: string; title: string; msg: string } | null>(null);
  const fire = (emoji: string, title: string, msg: string) => { setToast({ emoji, title, msg }); setTimeout(() => setToast(null), 2800); };
  // persist theme/dark changes to backend
  const handleThemeChange = (t: ThemeId) => { setTheme(t); api.profile.update({ theme: t }).catch(()=>{}); };
  const handleDarkChange = (d: boolean) => { setDark(d); api.profile.update({ dark_mode: d }).catch(()=>{}); };
  const handleLangChange = (l: string) => { setLang(l); api.profile.update({ language: l }).catch(()=>{}); };


  const Toggle = ({ on, set }: { on: boolean; set: (v: boolean) => void }) => (
    <button onClick={() => set(!on)} className={`relative h-6 w-11 rounded-full transition ${on ? "bg-mint" : "bg-white/25"}`}>
      <motion.span layout className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow" style={{ left: on ? 22 : 2 }} />
    </button>
  );

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="relative flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4">
      <motion.div variants={item} className="relative overflow-hidden rounded-3xl bg-aurora p-6 text-center shadow-glow">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        </div>
        <div className="relative">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-white/25 text-5xl backdrop-blur" style={{ fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif' }}>{avatar}</div>
          <div className="mt-3 font-display text-2xl font-bold text-white">{user?.name ?? "User"}</div>
          <div className="text-sm text-white/80">@{(user?.name ?? "user").toLowerCase().replace(/ /g,".")} · Habit Hero · {user?.xp ?? 0} XP</div>
          <button onClick={() => go("edit-profile")} className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/25 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/35">
            <Edit3 className="h-4 w-4" /> Edit profile
          </button>
        </div>
      </motion.div>

      <motion.div variants={item} className="mt-5 grid grid-cols-3 gap-3">
        {[[String(user?.streak ?? 0),"Streak"], [String(_habits.filter(h=>h.done>=h.goal).length),"Done today"], [String(user?.xp ?? 0),"XP"]].map(([v, l], i) => (
          <div key={i} className="rounded-2xl border border-white/25 bg-white/15 p-3 text-center">
            <div className="font-display text-xl font-bold text-white">{v}</div>
            <div className="text-[11px] text-white/70">{l}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={item} className="mt-5 space-y-2">
        {[
          { icon: Settings, label: "Account settings", id: "account" as const },
          { icon: Bell, label: "Notifications", onClick: () => go("notifications") },
          { icon: Palette, label: "Appearance", id: "appearance" as const, val: THEMES.find(t => t.id === theme)?.label },
          { icon: Globe, label: "Language", id: "language" as const, val: lang },
          { icon: Volume2, label: "Sounds & haptics", id: "sounds" as const, val: sound ? "On" : "Off" },
          { icon: HelpCircle, label: "Help center", id: "help" as const },
        ].map((m, i) => (
          <button key={i} onClick={(m as any).onClick ?? (() => (m as any).id && setModal((m as any).id))} className="group flex w-full items-center justify-between rounded-2xl border border-white/25 bg-white/12 px-4 py-3.5 text-left transition hover:bg-white/18">
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10"><m.icon className="h-4.5 w-4.5 text-mint" /></span>
              <span className="font-medium text-white">{m.label}</span>
            </span>
            <span className="flex items-center gap-2 text-sm text-white/80">
              {(m as any).val} <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </button>
        ))}
      </motion.div>

      {/* Modals */}
      <ModalSheet open={modal === "account"} onClose={() => setModal(null)} title="Account settings">
        <div className="space-y-3">
          {[
            { l: "Two-factor authentication", d: "Add an extra layer of security", v: twoFA, set: setTwoFA },
            { l: "Email notifications", d: "Weekly summary digest", v: true, set: () => {} },
            { l: "Public profile", d: "Show your streaks in community", v: true, set: () => {} },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl border border-white/25 bg-white/10 p-3">
              <div><div className="text-sm font-semibold text-white">{s.l}</div><div className="text-[11px] text-white/70">{s.d}</div></div>
              <Toggle on={s.v} set={s.set} />
            </div>
          ))}
          <button onClick={() => fire("🔐", "Password reset sent", "Check your inbox for a magic reset link.")} className="w-full rounded-2xl bg-white/20 py-3 text-sm font-semibold text-white">Change password</button>
          <button onClick={() => fire("📦", "Export started", "We're packaging your data — you'll get a download link by email.")} className="w-full rounded-2xl bg-white/20 py-3 text-sm font-semibold text-white">Export my data</button>
          <button onClick={() => fire("⚠️", "Are you sure?", "Tap again within 5 seconds to confirm permanent deletion.")} className="w-full rounded-2xl border border-pink/40 bg-pink/15 py-3 text-sm font-semibold text-pink">Delete account</button>

        </div>
      </ModalSheet>

      <ModalSheet open={modal === "appearance"} onClose={() => setModal(null)} title="Appearance">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/25 bg-white/10 p-3">
          <div><div className="text-sm font-semibold text-white">Dark mode</div><div className="text-[11px] text-white/70">Reduce brightness at night</div></div>
          <Toggle on={dark} set={handleDarkChange} />
        </div>
        <div className="text-xs uppercase tracking-wider text-white/70 mb-2">Theme palette</div>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => handleThemeChange(t.id as ThemeId)} className={`relative overflow-hidden rounded-2xl border-2 p-3 text-left transition ${theme === t.id ? "border-white shadow-glow" : "border-white/20"}`} style={{ background: t.grad }}>
              <div className="font-semibold text-white drop-shadow">{t.label}</div>
              {theme === t.id && <div className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white"><Check className="h-3.5 w-3.5 text-[oklch(0.35_0.18_320)]" strokeWidth={3} /></div>}
            </button>
          ))}
        </div>
      </ModalSheet>

      <ModalSheet open={modal === "language"} onClose={() => setModal(null)} title="Language">
        <div className="space-y-2">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => { handleLangChange(l.label); setModal(null); }} className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${lang === l.label ? "border-white bg-white/25" : "border-white/25 bg-white/10"}`}>
              <div>
                <div className="font-semibold text-white">{l.label}</div>
                <div className="text-[11px] text-white/70" dir={l.code === "ur" || l.code === "ar" ? "rtl" : "ltr"}>{l.native}</div>
              </div>
              {lang === l.label && <Check className="h-5 w-5 text-mint" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </ModalSheet>

      <ModalSheet open={modal === "sounds"} onClose={() => setModal(null)} title="Sounds & haptics">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl border border-white/25 bg-white/10 p-3">
            <div><div className="text-sm font-semibold text-white">Sound effects</div><div className="text-[11px] text-white/70">Play on habit completion</div></div>
            <Toggle on={sound} set={setSound} />
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/25 bg-white/10 p-3">
            <div><div className="text-sm font-semibold text-white">Haptic feedback</div><div className="text-[11px] text-white/70">Vibrate on interaction</div></div>
            <Toggle on={haptic} set={setHaptic} />
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/10 p-3">
            <div className="text-sm font-semibold text-white">Notification sound</div>
            <div className="mt-2 flex gap-2">
              {["Chime","Pulse","Bell","Off"].map((s, i) => (
                <button key={s} className={`flex-1 rounded-xl py-2 text-xs font-semibold ${i === 0 ? "bg-white text-[oklch(0.35_0.18_320)]" : "bg-white/15 text-white"}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </ModalSheet>

      <ModalSheet open={modal === "help"} onClose={() => setModal(null)} title="Help center">
        <div className="space-y-2">
          {[
            { q: "How do I create a habit?", a: "Tap the + button in the bottom nav and pick an icon, name, and schedule." },
            { q: "How do streaks work?", a: "Complete a habit on its scheduled day to extend the streak. Missing one resets it." },
            { q: "Can I sync across devices?", a: "Yes — sign in with the same account and your data syncs automatically." },
            { q: "How do I change reminders?", a: "Open a habit, tap the bell icon, and pick a time and days." },
          ].map((f, i) => (
            <details key={i} className="group rounded-2xl border border-white/25 bg-white/10 p-3">
              <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-white">
                {f.q} <ChevronRight className="h-4 w-4 transition group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-[12px] text-white/80">{f.a}</p>
            </details>
          ))}
          <button onClick={() => fire("💌", "Message sent", "Our support wizards will reply within 24 hours.")} className="w-full rounded-2xl bg-aurora py-3 text-sm font-semibold text-white shadow-glow">Contact support</button>
          <button onClick={() => fire("⭐", "Thank you!", "Your rating keeps Pulse glowing — much appreciated.")} className="w-full rounded-2xl bg-white/20 py-3 text-sm font-semibold text-white">Rate Pulse</button>
        </div>
      </ModalSheet>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="absolute left-1/2 top-4 z-[60] w-[88%] max-w-[360px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/40 p-3 shadow-2xl"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.25 320 / 0.92), oklch(0.5 0.25 280 / 0.92))", backdropFilter: "blur(20px)" }}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/25 text-2xl">{toast.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-sm font-bold text-white">{toast.title}</div>
                <div className="text-[11px] text-white/90">{toast.msg}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EditProfile({ go, user, onUserUpdate }: { go: (s: Screen) => void; user: User | null; onUserUpdate: (u: User) => void }) {
  const [avatar, setAvatar] = useState(user?.avatar ?? "🌟");
  useEffect(() => { if (user?.avatar) setAvatar(user.avatar); }, [user?.avatar]);
  const [picker, setPicker] = useState(false);
  const [nameV, setNameV] = useState(user?.name ?? "");
  const [bioV, setBioV] = useState(user?.bio ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.profile.update({ name: nameV, bio: bioV, avatar });
      api.auth.saveToken(api.auth.getToken() ?? "", updated);
      onUserUpdate(updated);
      go("profile");
    } catch { go("profile"); }
    finally { setSaving(false); }
  };

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="relative flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-4">
      <motion.div variants={item} className="flex flex-col items-center pt-4">
        <div className="relative">
          <div className="grid h-28 w-28 place-items-center rounded-[2rem] bg-aurora text-5xl shadow-glow" style={{ fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif' }}>{avatar}</div>
          <button onClick={() => setPicker(true)} className="absolute -bottom-2 -right-2 grid h-10 w-10 place-items-center rounded-2xl bg-mint text-background shadow-mint">
            <Camera className="h-4.5 w-4.5" strokeWidth={2.5} />
          </button>
        </div>
        <button onClick={() => setPicker(true)} className="mt-3 text-sm font-semibold text-white underline-offset-2 hover:underline">Tap to change avatar</button>
      </motion.div>

      <motion.div variants={item} className="mt-6 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-wider text-white/70">Full name</label>
          <input value={nameV} onChange={e => setNameV(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-white outline-none focus:border-mint" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-white/70">Email</label>
          <input defaultValue={user?.email ?? ""} readOnly className="mt-2 w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-white/60 outline-none cursor-not-allowed" />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-white/70">Bio</label>
          <input value={bioV} onChange={e => setBioV(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-white outline-none focus:border-mint" />
        </div>
      </motion.div>

      <motion.div variants={item} className="mt-6 flex gap-3">
        <button onClick={() => go("profile")} className="flex-1 rounded-2xl border border-white/25 bg-white/15 py-3.5 font-semibold text-white">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="flex-1 rounded-2xl bg-aurora py-3.5 font-semibold text-white shadow-glow active:scale-[0.98] disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
      </motion.div>

      <AnimatePresence>
        {picker && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPicker(false)} className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="absolute inset-x-0 bottom-0 z-50 rounded-t-[2rem] glass-strong p-5 shadow-2xl">
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/40" />
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-white">Choose your avatar</h3>
                <button onClick={() => setPicker(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-4 gap-3" style={{ fontFamily: 'Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif' }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => { setAvatar(a); setPicker(false); }} className={`grid aspect-square place-items-center rounded-2xl text-3xl transition ${avatar === a ? "bg-aurora shadow-glow scale-105" : "bg-white/15 hover:bg-white/25"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------------- MAIN APP ---------------- */
const titles: Record<Screen, string> = {
  splash: "", auth: "", login: "", signup: "", terms: "",
  home: "Today", habits: "Habits", add: "New habit", stats: "Statistics",
  calendar: "Calendar", achievements: "Achievements", community: "Community",
  notifications: "Notifications", profile: "Profile", "edit-profile": "Edit profile",
};

export default function PulseApp() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("candy");
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const go = (s: Screen) => setScreen(s);
  const isAuthScreen = ["splash", "auth", "login", "signup", "terms"].includes(screen);
  const showBottomNav = !isAuthScreen;

  // Sync theme/dark from logged-in user profile
  useEffect(() => {
    if (user) {
      if (user.theme) setTheme(user.theme as ThemeId);
      if (user.dark_mode !== undefined) setDark(Boolean(user.dark_mode));
    }
  }, [user]);

  const handleUser = (u: User) => setUser(u);
  const handleLogout = () => {
    api.auth.clearSession();
    setUser(null);
    setDrawerOpen(false);
    setTimeout(() => go("auth"), 200);
  };

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, dark, setDark }}>
    <div className="min-h-[100dvh] bg-candy">
      <PhoneFrame>
        {!isAuthScreen && <TopBar title={titles[screen]} onMenu={() => setDrawerOpen(true)} onBell={() => go("notifications")} />}

        <div className="perspective-1200 relative flex-1 overflow-hidden" style={{ perspective: "1400px" }}>
          <AnimatePresence mode="wait">
            {screen === "splash"       && <Splash key="splash" go={go} onUser={handleUser} />}
            {screen === "auth"         && <BookAuth key="auth" go={go} onUser={handleUser} />}
            {screen === "login"        && <Login key="login" go={go} onUser={handleUser} />}
            {screen === "signup"       && <Signup key="signup" go={go} onUser={handleUser} />}
            {screen === "terms"        && <Terms key="terms" go={go} />}
            {screen === "home"         && <motion.div key="home" {...appScreenVariants} className="flex h-full flex-col"><Home_ go={go} user={user} /></motion.div>}
            {screen === "habits"       && <motion.div key="habits" {...appScreenVariants} className="flex h-full flex-col"><Habits_ go={go} /></motion.div>}
            {screen === "add"          && <motion.div key="add" {...appScreenVariants} className="flex h-full flex-col"><AddHabit go={go} /></motion.div>}
            {screen === "stats"        && <motion.div key="stats" {...appScreenVariants} className="flex h-full flex-col"><Stats_ /></motion.div>}
            {screen === "calendar"     && <motion.div key="cal" {...appScreenVariants} className="flex h-full flex-col"><Calendar_ /></motion.div>}
            {screen === "achievements" && <motion.div key="ach" {...appScreenVariants} className="flex h-full flex-col"><Achievements_ /></motion.div>}
            {screen === "community"    && <motion.div key="com" {...appScreenVariants} className="flex h-full flex-col"><Community_ /></motion.div>}
            {screen === "notifications"&& <motion.div key="not" {...appScreenVariants} className="flex h-full flex-col"><Notifications_ go={go} /></motion.div>}
            {screen === "profile"      && <motion.div key="pro" {...appScreenVariants} className="flex h-full flex-col"><Profile_ go={go} user={user} onUserUpdate={handleUser} /></motion.div>}
            {screen === "edit-profile" && <motion.div key="edit" {...appScreenVariants} className="flex h-full flex-col"><EditProfile go={go} user={user} onUserUpdate={handleUser} /></motion.div>}
          </AnimatePresence>
        </div>

        {showBottomNav && <BottomNav active={screen} go={go} />}

        <Drawer
          open={drawerOpen}
          close={() => setDrawerOpen(false)}
          go={go}
          logout={handleLogout}
          user={user}
        />
      </PhoneFrame>
    </div>
    </ThemeCtx.Provider>
  );
}
