import React, { useState, useEffect } from "react";

const STEPS = [
  { n:"1", t:"Deposit Any Amount (Min. $10)",       d:"Fund instantly via card, UPI, e-wallet or crypto. Money appears live in seconds." },
  { n:"2", t:"Pick an Asset & Open 30-Min Trade",   d:"Choose from 70+ assets — crypto, forex, gold, stocks. One tap sets your 30-minute profit window." },
  { n:"3", t:"AI + Experts Manage Everything",      d:"Our system and certified analysts monitor markets live, optimizing your trade for maximum return." },
  { n:"4", t:"Profit Credited — Withdraw Instantly",d:"After 30 minutes your profit is auto-credited. Withdraw to bank, UPI or crypto anytime with zero delay." },
];

const ASSET_OPTS = [
  { label:"BTC/USD — 85%", pct:85 },
  { label:"ETH/USD — 82%", pct:82 },
  { label:"EUR/USD — 78%", pct:78 },
  { label:"Gold — 80%",    pct:80 },
  { label:"Apple — 75%",   pct:75 },
  { label:"XRP — 88%",     pct:88 },
];
const TIME_OPTS = [
  { label:"30 Minutes", mins:30 },
  { label:"60 Minutes", mins:60 },
  { label:"2 Hours",    mins:120 },
];

export function ProfitSection({ onNavigate }) {
  const [invest,  setInvest]  = useState(500);
  const [assetPct,setAsset]   = useState(85);
  const [timeMins,setTime]    = useState(30);
  const [barGo,   setBarGo]   = useState(false);

  const profit = +(invest * (assetPct / 100) * (timeMins / 30)).toFixed(2);
  const total  = invest + profit;

  useEffect(() => {
    const timer = setTimeout(() => setBarGo(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="profit30" style={{
      padding:"96px 0", position:"relative", overflow:"hidden", background:"#07090e"
    }}>
      {/* BG image */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&q=60')",
        backgroundSize:"cover", backgroundPosition:"center",
        filter:"brightness(.2) saturate(.65)"
      }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(120deg,rgba(7,9,14,.97) 0%,rgba(7,9,14,.74) 55%,rgba(7,9,14,.35) 100%)" }}/>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 5%", position:"relative", zIndex:2 }}>
        <div className="hp-profit-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>

          {/* Left — steps */}
          <div>
            <div className="hp-sec-badge" style={{ marginBottom:16 }}>⚡ 30-Minute Profit System</div>
            <h2 style={{
              fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,3.8vw,3.1rem)",
              fontWeight:800, lineHeight:1.1, letterSpacing:"-.02em", marginBottom:16
            }}>
              Your Money Works.<br/>Profit in <span className="hp-grad">30 Minutes.</span><br/>Zero Risk.
            </h2>
            <p style={{ fontSize:".96rem", color:"rgba(195,200,220,.48)", lineHeight:1.82, maxWidth:520, marginBottom:28 }}>
              No experience needed. Just invest any amount — our AI + live expert analysts handle everything and your profit is credited within 30 minutes.
            </p>

            {/* Steps list */}
            <div style={{ position:"relative" }}>
              {/* Vertical line */}
              <div style={{
                position:"absolute", left:22, top:8, bottom:8, width:1,
                background:"linear-gradient(to bottom,#c8a84b,rgba(200,168,75,.08))"
              }}/>
              {STEPS.map(s => (
                <div key={s.n} style={{ display:"flex", gap:18, padding:"20px 0", position:"relative" }}>
                  <div style={{
                    width:46, height:46, borderRadius:"50%", flexShrink:0,
                    background:"linear-gradient(135deg,#c8a84b,#8a6010)",
                    display:"grid", placeItems:"center",
                    fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", fontWeight:800, color:"#07090e",
                    boxShadow:"0 0 0 4px rgba(200,168,75,.12),0 4px 14px rgba(200,168,75,.28)",
                    position:"relative", zIndex:1
                  }}>{s.n}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:".93rem", marginBottom:4 }}>{s.t}</div>
                    <div style={{ fontSize:".82rem", color:"rgba(195,200,220,.48)", lineHeight:1.75 }}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — calculator */}
          <div style={{
            background:"rgba(13,16,24,.94)", border:"1px solid rgba(200,168,75,.28)",
            borderRadius:22, padding:32, backdropFilter:"blur(20px)",
            position:"relative", overflow:"hidden"
          }}>
            <div style={{ position:"absolute", inset:"0 0 auto", height:2, background:"linear-gradient(90deg,transparent,#c8a84b,transparent)" }}/>
            <div style={{ position:"absolute", top:-80, right:-80, width:200, height:200, borderRadius:"50%", background:"radial-gradient(rgba(200,168,75,.09),transparent 65%)", pointerEvents:"none" }}/>

            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.45rem", fontWeight:800, marginBottom:4 }}>⚡ Profit Calculator</div>
            <div style={{ fontSize:".78rem", color:"rgba(195,200,220,.48)", marginBottom:24, lineHeight:1.6 }}>See how much you earn in one 30-minute session</div>

            {/* Slider */}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:".72rem", fontWeight:600, color:"rgba(195,200,220,.48)", marginBottom:7 }}>
              <span>Invest Amount:</span>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:".98rem", color:"#c8a84b" }}>${invest.toLocaleString()}</span>
            </div>
            <input
              type="range" min={10} max={10000} step={10} value={invest}
              onChange={e => setInvest(+e.target.value)}
              style={{ width:"100%", height:5, borderRadius:100, appearance:"none", background:"rgba(255,255,255,.09)", outline:"none", cursor:"pointer", marginBottom:20, accentColor:"#c8a84b" }}
            />

            {/* Selects */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
              <select
                value={assetPct}
                onChange={e => setAsset(+e.target.value)}
                style={{
                  padding:"10px 12px", borderRadius:9,
                  border:"1px solid rgba(255,255,255,.065)", background:"#131620",
                  color:"#edf0fa", fontFamily:"'Plus Jakarta Sans',sans-serif",
                  fontSize:".8rem", outline:"none", cursor:"pointer"
                }}
              >
                {ASSET_OPTS.map(o => <option key={o.label} value={o.pct}>{o.label}</option>)}
              </select>
              <select
                value={timeMins}
                onChange={e => setTime(+e.target.value)}
                style={{
                  padding:"10px 12px", borderRadius:9,
                  border:"1px solid rgba(255,255,255,.065)", background:"#131620",
                  color:"#edf0fa", fontFamily:"'Plus Jakarta Sans',sans-serif",
                  fontSize:".8rem", outline:"none", cursor:"pointer"
                }}
              >
                {TIME_OPTS.map(o => <option key={o.label} value={o.mins}>{o.label}</option>)}
              </select>
            </div>

            {/* Result */}
            <div style={{
              background:"linear-gradient(135deg,rgba(200,168,75,.1),rgba(200,168,75,.03))",
              border:"1px solid rgba(200,168,75,.28)", borderRadius:14,
              padding:"18px 20px", display:"grid", gridTemplateColumns:"1fr 1fr",
              gap:12, marginBottom:16
            }}>
              <div>
                <div style={{ fontSize:".69rem", color:"rgba(195,200,220,.48)", marginBottom:3 }}>Your Profit</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.1rem", fontWeight:800, color:"#c8a84b", lineHeight:1 }}>
                  ${profit.toLocaleString()}
                </div>
                <div style={{ fontSize:".67rem", color:"#12e07a", fontWeight:600, marginTop:3 }}>⏱ Ready in {timeMins} min</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:".69rem", color:"rgba(195,200,220,.48)", marginBottom:3 }}>Total Return</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"2.1rem", fontWeight:800, color:"#12e07a", lineHeight:1 }}>
                  ${total.toLocaleString()}
                </div>
                <div style={{ fontSize:".67rem", color:"rgba(195,200,220,.48)", marginTop:3 }}>Capital + Profit</div>
              </div>
            </div>

            {/* Timer bar */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:".7rem", color:"rgba(195,200,220,.48)", marginBottom:6 }}>
                <span>Trade in progress...</span>
                <b style={{ color:"#12e07a" }}>{timeMins}:00 remaining</b>
              </div>
              <div style={{ height:4, background:"rgba(255,255,255,.07)", borderRadius:100, overflow:"hidden" }}>
                <div style={{
                  height:"100%", borderRadius:100,
                  background:"linear-gradient(90deg,#c8a84b,#12e07a)",
                  width: barGo ? "100%" : "0",
                  transition: barGo ? `width ${timeMins * 60}s linear` : "none"
                }}/>
              </div>
            </div>

            {/* Shield */}
            <div style={{
              display:"flex", alignItems:"center", gap:10, padding:"11px 14px",
              background:"rgba(18,224,122,.07)", border:"1px solid rgba(18,224,122,.18)",
              borderRadius:10, fontSize:".78rem", color:"#12e07a", fontWeight:600, marginBottom:14
            }}>
              🛡️ Capital Protection — Only profit is at risk. Your deposit is always returned.
            </div>

            <button className="hp-btn-primary" style={{ width:"100%", padding:14, textAlign:"center", fontSize:".9rem" }} onClick={() => onNavigate?.("register")}>
              Start Earning Now — Open Free Account →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
