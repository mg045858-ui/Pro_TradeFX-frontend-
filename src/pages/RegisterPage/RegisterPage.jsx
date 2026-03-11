import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icons }   from "../../components/ui/Icons/Icons";
import { BrandLogo } from "../../components/ui/Logo/Logo";
import "./RegisterPage.css";

export function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [form,    setForm]    = useState({ name:"", email:"", password:"", confirm:"" });
  const [showPw,  setShowPw]  = useState(false);
  const [agreed,  setAgreed]  = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const pw = form.password;
  const pwScore = pw.length===0 ? 0 : pw.length<6 ? 1 : pw.length<10 ? 2 : /[A-Z]/.test(pw)&&/\d/.test(pw)&&/[^A-Za-z0-9]/.test(pw) ? 4 : 3;
  const pwLabel  = ["","Weak","Fair","Good","Strong"][pwScore];
  const pwColors = ["","#ef4444","#f59e0b","#3b82f6","#22c55e"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!agreed) { setError("Please accept the Terms of Service."); return; }
    if (pw.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (pw !== form.confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: pw });
      onNavigate("trading");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Left branding */}
      <div className="register-page__branding">
        <div className="bg-grid" style={{ position:"absolute", inset:0, opacity:0.07 }}/>
        <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", height:"100%" }}>
          <BrandLogo size="lg" onClick={() => onNavigate("home")} style={{ marginBottom:56 }}/>
          <div style={{ animation:"fadeInUp 0.6s 0.2s both" }}>
            <h1 style={{ fontSize:"clamp(2rem,3vw,3rem)", fontWeight:800, lineHeight:1.2, marginBottom:18 }}>
              Start Trading <span className="text-gold">for Free</span>
            </h1>
            <p style={{ color:"var(--muted-fg)", fontSize:15, lineHeight:1.8 }}>
              Join 800,000+ traders. Free ₹10,000 demo balance — no deposit required.
            </p>
          </div>
          <div className="register-page__stats">
            {[{val:"₹10k",label:"Free Demo"},{val:"95%",label:"Max Profit"},{val:"70+",label:"Assets"}].map(s=>(
              <div key={s.label} style={{ textAlign:"center" }}>
                <div className="text-gold" style={{ fontSize:26, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif" }}>{s.val}</div>
                <div style={{ fontSize:12, color:"var(--muted-fg)" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:32, display:"flex", flexDirection:"column", gap:14 }}>
            {[{icon:"🏦",t:"Real deposits via UPI, Bank, Cards"},{icon:"⚡",t:"Instant credit to your account"},{icon:"🔒",t:"Your data stored securely in our database"}].map(f=>(
              <div key={f.t} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:20 }}>{f.icon}</span>
                <span style={{ fontSize:13, color:"hsl(230,10%,70%)" }}>{f.t}</span>
              </div>
            ))}
          </div>
          <p className="register-page__branding-copy">© 2026 ProFX Trade. All rights reserved.</p>
        </div>
      </div>

      {/* Right form */}
      <div className="register-page__form-wrap">
        <div className="register-page__form-inner">
          <BrandLogo size="md" onClick={() => onNavigate("home")} style={{ marginBottom:32 }}/>

          <h2 className="register-page__title">Create Account</h2>
          <p className="register-page__subtitle">
            Already have one? <a href="#" onClick={e=>{e.preventDefault();onNavigate("login")}}>Sign In</a>
          </p>

          {error && (
            <div style={{ background:"hsl(0,65%,18%)", border:"1px solid hsl(0,65%,35%)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"hsl(0,80%,78%)", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* Name */}
            <div>
              <label style={{ fontSize:12, color:"var(--muted-fg)", display:"block", marginBottom:6, fontWeight:600 }}>Full Name</label>
              <div className="input-group">
                <Icons.User size={16} style={{ color:"var(--muted-fg)", flexShrink:0 }}/>
                <input type="text" placeholder="John Doe" value={form.name} required onChange={e=>setForm({...form,name:e.target.value})}/>
              </div>
            </div>
            {/* Email */}
            <div>
              <label style={{ fontSize:12, color:"var(--muted-fg)", display:"block", marginBottom:6, fontWeight:600 }}>Email</label>
              <div className="input-group">
                <Icons.Mail size={16} style={{ color:"var(--muted-fg)", flexShrink:0 }}/>
                <input type="email" placeholder="you@email.com" value={form.email} required onChange={e=>setForm({...form,email:e.target.value})}/>
              </div>
            </div>
            {/* Password */}
            <div>
              <label style={{ fontSize:12, color:"var(--muted-fg)", display:"block", marginBottom:6, fontWeight:600 }}>Password</label>
              <div className="input-group">
                <Icons.Lock size={16} style={{ color:"var(--muted-fg)", flexShrink:0 }}/>
                <input type={showPw?"text":"password"} placeholder="Min 8 characters" value={pw} required minLength={8}
                  onChange={e=>setForm({...form,password:e.target.value})}/>
                <button type="button" onClick={()=>setShowPw(p=>!p)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--muted-fg)" }}>
                  {showPw ? <Icons.EyeOff size={16}/> : <Icons.Eye size={16}/>}
                </button>
              </div>
              {pw.length > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:7 }}>
                  <div style={{ flex:1, height:4, background:"hsl(225,20%,20%)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ width:`${pwScore*25}%`, height:"100%", background:pwColors[pwScore], borderRadius:4, transition:"all 0.3s" }}/>
                  </div>
                  <span style={{ fontSize:11, color:pwColors[pwScore], fontWeight:700, minWidth:40 }}>{pwLabel}</span>
                </div>
              )}
            </div>
            {/* Confirm password */}
            <div>
              <label style={{ fontSize:12, color:"var(--muted-fg)", display:"block", marginBottom:6, fontWeight:600 }}>Confirm Password</label>
              <div className="input-group" style={{ borderColor: form.confirm && form.confirm !== pw ? "hsl(0,70%,55%)" : undefined }}>
                <Icons.Lock size={16} style={{ color:"var(--muted-fg)", flexShrink:0 }}/>
                <input type="password" placeholder="Repeat password" value={form.confirm} required
                  onChange={e=>setForm({...form,confirm:e.target.value})}/>
                {form.confirm && <span style={{ fontSize:13, paddingRight:8 }}>{form.confirm===pw?"✅":"❌"}</span>}
              </div>
            </div>
            {/* Terms */}
            <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", marginTop:2 }}>
              <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{ marginTop:2, accentColor:"var(--primary)", width:15, height:15 }}/>
              <span style={{ fontSize:12, color:"var(--muted-fg)", lineHeight:1.6 }}>
                I agree to the <a href="#" style={{ color:"var(--primary)", textDecoration:"none" }}>Terms of Service</a> and <a href="#" style={{ color:"var(--primary)", textDecoration:"none" }}>Privacy Policy</a>
              </span>
            </label>

            <button type="submit" disabled={loading}
              style={{ height:50, borderRadius:12, background:"var(--primary)", border:"none", cursor:loading?"not-allowed":"pointer", color:"hsl(230,25%,8%)", fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", gap:9, boxShadow:"0 4px 20px hsl(47,90%,61%,0.3)", transition:"all 0.2s", opacity:loading?0.7:1, marginTop:4 }}>
              {loading ? <><span style={{ width:18, height:18, border:"2px solid transparent", borderTop:"2px solid currentColor", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/> Creating Account...</> : <>Create Free Account <Icons.ArrowRight size={16}/></>}
            </button>
          </form>

          <div style={{ marginTop:20, padding:"12px 16px", background:"hsl(210,80%,50%,0.08)", border:"1px solid hsl(210,80%,50%,0.2)", borderRadius:10, display:"flex", gap:12 }}>
            <span style={{ fontSize:22 }}>🎮</span>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"hsl(210,80%,75%)" }}>Free Demo Account</div>
              <div style={{ fontSize:11, color:"hsl(230,10%,55%)" }}>Instantly get ₹10,000 virtual balance. No deposit needed.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default RegisterPage;
