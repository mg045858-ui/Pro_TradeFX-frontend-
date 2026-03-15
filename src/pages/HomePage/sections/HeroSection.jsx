import React, { useState, useEffect } from "react";

function buildLineChart() {
  let v = 100;
  return Array.from({ length: 40 }, () => {
    v = Math.max(62, Math.min(155, v + (Math.random() - 0.45) * 8));
    return v;
  });
}
function toSVGPath(data) {
  return data.map((v, i) =>
    `${i === 0 ? "M" : "L"}${(i / 39) * 340},${72 - ((v - 60) / 100) * 72}`
  ).join(" ");
}

export function HeroSection({ onNavigate }) {
  const [chartData] = useState(() => buildLineChart());
  const [btcPrice, setBtcPrice] = useState(67432);

  const path  = toSVGPath(chartData);
  const areaD = path + " L340,72 L0,72 Z";

  useEffect(() => {
    const t = setInterval(() => {
      setBtcPrice(p => Math.round(p + (Math.random() - 0.49) * 14));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <section style={{
      minHeight:"100vh", paddingTop:72,
      display:"flex", alignItems:"center",
      position:"relative", overflow:"hidden"
    }}>
      {/* BG Image */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"url('https://imgs.search.brave.com/39yPSgrypLStAYsjiP33Vd7ymTmA1I1otB49Du1uf9s/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTI3/MTEzMTUwMC92ZWN0/b3IvYml0Y29pbnMt/Y3J5cHRvLWN1cnJl/bmN5LWNvbmNlcHQu/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PXYteE1tNHJXQlRG/cjl6cjllMllLaERY/Z1BhdTJ0UC05dUF4/Skw3c2trTEU9')",
        backgroundSize:"cover", backgroundPosition:"center",
        filter:"brightness(.38) saturate(.7)"
      }}/>
      {/* Overlays */}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg,rgba(7,9,14,.97) 0%,rgba(7,9,14,.62) 52%,rgba(7,9,14,.14) 100%)" }}/>
      <div style={{ position:"absolute", bottom:0, insetInline:0, height:220, background:"linear-gradient(to top,#07090e,transparent)" }}/>
      {/* Grid lines */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 79px,rgba(200,168,75,.04) 80px),repeating-linear-gradient(90deg,transparent,transparent 79px,rgba(200,168,75,.04) 80px)"
      }}/>
      {/* Glow */}
      <div style={{ position:"absolute", top:"25%", right:"18%", width:440, height:440, borderRadius:"50%", background:"radial-gradient(rgba(200,168,75,.1),transparent 68%)", pointerEvents:"none" }}/>

      {/* Content */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 5%", width:"100%", position:"relative", zIndex:2 }}>
        <div className="hp-hero-layout" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:52, alignItems:"center" }}>

          {/* Left copy */}
          <div style={{ animation:"hp-fadeUp .5s .1s both" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"6px 16px", borderRadius:100,
              border:"1px solid rgba(200,168,75,.28)", background:"rgba(200,168,75,.08)",
              fontSize:".73rem", fontWeight:700, color:"#c8a84b",
              letterSpacing:".06em", marginBottom:24
            }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#12e07a", flexShrink:0, animation:"hp-blink 1.8s ease-in-out infinite", display:"block" }}/>
              LIVE · 800,000+ Traders Worldwide
            </div>

            <h1 style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:"clamp(2.8rem,5.4vw,5.4rem)",
              fontWeight:800, lineHeight:1.07, letterSpacing:"-.025em", marginBottom:20
            }}>
              Invest Today.<br/>Profit in <span className="hp-grad">30 Minutes.</span><br/>Zero Risk.
            </h1>

            <p style={{ fontSize:"1.04rem", color:"rgba(195,200,220,.48)", lineHeight:1.85, maxWidth:458, marginBottom:34 }}>
              No trading knowledge needed. Deposit any amount, pick an asset — our live expert analysts generate real profit for you in under 30 minutes. Your capital is always safe.
            </p>

            <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:36 }}>
              <button className="hp-btn-primary" onClick={() => onNavigate?.("register")}>See How It Works →</button>
              <button className="hp-btn-outline" onClick={() => onNavigate?.("trading")}>Try Free Demo</button>
            </div>

            <div style={{ display:"flex", gap:18, flexWrap:"wrap" }}>
              {["No hidden fees","Instant withdrawals","Bank-level security"].map(t => (
                <span key={t} style={{ display:"flex", alignItems:"center", gap:7, fontSize:".79rem", color:"rgba(195,200,220,.48)" }}>
                  <span style={{ color:"#12e07a", fontSize:12 }}>★</span>{t}
                </span>
              ))}
            </div>
          </div>

          {/* Right live card */}
          <div className="hp-hero-card-wrap" style={{ position:"relative", animation:"hp-fadeUp .6s .3s both" }}>
            {/* Float 1 */}
            <div style={{
              position:"absolute", bottom:-14, left:-18, zIndex:4,
              background:"rgba(13,16,24,.96)", border:"1px solid rgba(200,168,75,.28)",
              borderRadius:12, padding:"10px 14px", backdropFilter:"blur(16px)",
              animation:"hp-float1 4s ease-in-out infinite"
            }}>
              <div style={{ fontSize:".6rem", color:"rgba(195,200,220,.48)", marginBottom:3 }}>Today's Profit</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1rem", color:"#12e07a" }}>+$1,284.50</div>
            </div>
            {/* Float 2 */}
            <div style={{
              position:"absolute", top:-14, right:-14, zIndex:4,
              background:"rgba(13,16,24,.96)", border:"1px solid rgba(200,168,75,.28)",
              borderRadius:12, padding:"10px 14px", backdropFilter:"blur(16px)",
              animation:"hp-float2 3.6s ease-in-out infinite"
            }}>
              <div style={{ fontSize:".6rem", color:"rgba(195,200,220,.48)", marginBottom:3 }}>30-Min Return</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1rem", color:"#c8a84b" }}>+68%</div>
            </div>

            {/* Live card */}
            <div style={{
              background:"rgba(13,16,24,.94)", border:"1px solid rgba(200,168,75,.28)",
              borderRadius:20, padding:26, backdropFilter:"blur(22px)",
              position:"relative", overflow:"hidden"
            }}>
              <div style={{ position:"absolute", inset:"0 0 auto", height:2, background:"linear-gradient(90deg,transparent,#c8a84b,transparent)" }}/>

              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", fontWeight:700 }}>BTC / USD</span>
                <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:".68rem", fontWeight:700, color:"#12e07a" }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#12e07a", animation:"hp-blink 1.5s infinite", display:"block" }}/>
                  LIVE
                </span>
              </div>

              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"3rem", fontWeight:800, lineHeight:1, marginBottom:5 }}>
                ${btcPrice.toLocaleString()}
              </div>
              <div style={{ fontSize:".83rem", fontWeight:700, color:"#12e07a", display:"flex", alignItems:"center", gap:5, marginBottom:16 }}>
                ▲ +$1,420 (+2.15%) today
              </div>

              {/* Chart */}
              <svg width="100%" height="72" viewBox="0 0 340 72" fill="none" style={{ marginBottom:14 }}>
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c8a84b" stopOpacity=".26"/>
                    <stop offset="100%" stopColor="#c8a84b" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d={areaD} fill="url(#heroGrad)"/>
                <path d={path} stroke="#c8a84b" strokeWidth="2.3" fill="none" strokeLinecap="round"/>
              </svg>

              {[
                { n:"EUR / USD", c:"Forex",     p:"1.0847",  ch:"+0.32%", up:true },
                { n:"Gold",      c:"Commodity", p:"$2,341",  ch:"+0.87%", up:true },
                { n:"Tesla",     c:"Stock",     p:"$248.90", ch:"−0.45%", up:false },
              ].map(r => (
                <div key={r.n} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderTop:"1px solid rgba(255,255,255,.065)" }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:".87rem" }}>{r.n}</div>
                    <div style={{ fontSize:".65rem", color:"rgba(195,200,220,.48)", marginTop:1 }}>{r.c}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:".95rem" }}>{r.p}</div>
                    <span className={`hp-chip ${r.up ? "hp-chip-up" : "hp-chip-dn"}`}>{r.ch}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
