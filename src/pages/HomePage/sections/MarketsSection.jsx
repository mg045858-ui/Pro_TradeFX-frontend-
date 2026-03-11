import React, { useState } from "react";

const ALL_MARKETS = [
  { n:"BTC/USD", c:"Crypto",    i:"₿",  p:"$67,432",  ch:"+2.15%", up:true  },
  { n:"ETH/USD", c:"Crypto",    i:"Ξ",  p:"$3,521",   ch:"+1.63%", up:true  },
  { n:"EUR/USD", c:"Forex",     i:"€",  p:"1.0847",   ch:"+0.32%", up:true  },
  { n:"GBP/JPY", c:"Forex",     i:"£",  p:"191.23",   ch:"−0.18%", up:false },
  { n:"Gold",    c:"Commodity", i:"🥇", p:"$2,341",   ch:"+0.87%", up:true  },
  { n:"Silver",  c:"Commodity", i:"🥈", p:"$27.45",   ch:"−0.52%", up:false },
  { n:"Apple",   c:"Stock",     i:"🍎", p:"$189.72",  ch:"−0.45%", up:false },
  { n:"Tesla",   c:"Stock",     i:"⚡", p:"$248.90",  ch:"+3.21%", up:true  },
];
const TABS = ["All","Crypto","Forex","Stock","Commodity"];

function MiniSparkline({ up, id }) {
  const col = up ? "#12e07a" : "#ff3c55";
  const d   = up
    ? "M0 22 Q10 18 20 15 T40 10 T60 6 T80 3"
    : "M0 3 Q10 8  20 11 T40 16 T60 19 T80 22";
  return (
    <svg className="mc-spark" viewBox="0 0 80 26" fill="none" style={{ width:"100%", height:26, marginTop:8 }}>
      <defs>
        <linearGradient id={`sg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity=".2"/>
          <stop offset="100%" stopColor={col} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round"/>
      <path d={`${d} V26 H0Z`} fill={`url(#sg${id})`}/>
    </svg>
  );
}

export function MarketsSection({ onNavigate }) {
  const [active, setActive] = useState("All");

  const list = active === "All" ? ALL_MARKETS : ALL_MARKETS.filter(m => m.c === active);

  return (
    <section id="markets" style={{
      padding:"96px 0", position:"relative", overflow:"hidden", background:"#0d1018"
    }}>
      {/* BG */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=60')",
        backgroundSize:"cover", backgroundPosition:"center",
        filter:"brightness(.14) saturate(.5)"
      }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(13,16,24,.9),rgba(13,16,24,.76) 50%,rgba(13,16,24,.92))" }}/>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 5%", position:"relative", zIndex:2 }}>
        {/* Header */}
        <div className="hp-sec-head">
          <div className="hp-sec-badge">📊 Live Markets</div>
          <h2 className="hp-sec-title">Trade <span>70+ Assets</span></h2>
          <p className="hp-sec-sub">Crypto, forex, stocks & commodities — real-time prices, instant execution.</p>
        </div>

        {/* Tabs */}
        <div style={{
          display:"flex", gap:4, background:"rgba(13,16,24,.88)",
          border:"1px solid rgba(255,255,255,.065)", borderRadius:12,
          padding:4, width:"fit-content", marginBottom:22, backdropFilter:"blur(12px)", flexWrap:"wrap"
        }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActive(tab)} style={{
              padding:"8px 18px", borderRadius:9, border: active===tab ? "1px solid rgba(200,168,75,.28)" : "none",
              background: active===tab ? "#131620" : "none",
              color: active===tab ? "#edf0fa" : "rgba(195,200,220,.48)",
              fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:".8rem", fontWeight:600,
              cursor:"pointer", transition:"all .2s", whiteSpace:"nowrap"
            }}>{tab}</button>
          ))}
        </div>

        {/* Grid */}
        <div className="hp-mkts-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
          {list.map((m, i) => (
            <div key={m.n} onClick={() => onNavigate?.("trading")} style={{
              background:"rgba(13,16,24,.9)", border:"1px solid rgba(255,255,255,.065)",
              borderRadius:15, padding:18, cursor:"pointer",
              transition:"all .24s", backdropFilter:"blur(12px)"
            }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(200,168,75,.28)"; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 12px 36px rgba(0,0,0,.45)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,.065)"; e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}
            >
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontSize:".62rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"rgba(195,200,220,.48)" }}>{m.c}</span>
                <div style={{
                  width:32, height:32, borderRadius:9, background:"rgba(200,168,75,.18)",
                  border:"1px solid rgba(200,168,75,.28)", display:"grid", placeItems:"center", fontSize:13
                }}>{m.i}</div>
              </div>
              <div style={{ fontWeight:700, fontSize:".95rem", marginBottom:5 }}>{m.n}</div>
              <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between" }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:"1.18rem" }}>{m.p}</span>
                <span className={`hp-chip ${m.up ? "hp-chip-up" : "hp-chip-dn"}`}>{m.ch}</span>
              </div>
              <MiniSparkline up={m.up} id={i}/>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center", marginTop:32 }}>
          <button className="hp-btn-nav-ol" style={{ padding:"12px 32px", fontSize:14 }} onClick={() => onNavigate?.("trading")}>
            View All 70+ Assets →
          </button>
        </div>
      </div>
    </section>
  );
}
