import React from "react";

const STATS = [
  { n:"800K+",  l:"Active Traders" },
  { n:"133",    l:"Countries" },
  { n:"70+",    l:"Assets" },
  { n:"$10",    l:"Min. Deposit" },
  { n:"95%",    l:"Max Payout" },
  { n:"$12M+",  l:"Paid Monthly" },
];

export function StatsSection() {
  return (
    <div style={{ background:"#0d1018", borderBottom:"1px solid rgba(255,255,255,.065)" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 5%" }}>
        <div className="hp-stats-grid" style={{
          display:"grid", gridTemplateColumns:"repeat(6,1fr)"
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign:"center", padding:"26px 10px",
              borderRight: i < 5 ? "1px solid rgba(255,255,255,.065)" : "none",
              transition:"background .3s", cursor:"default"
            }}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(200,168,75,.03)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{
                fontFamily:"'Cormorant Garamond',serif", fontSize:"2rem", fontWeight:800,
                color:"#c8a84b", lineHeight:1, marginBottom:4
              }}>{s.n}</div>
              <div style={{ fontSize:".73rem", color:"rgba(195,200,220,.48)", fontWeight:500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
