import React from "react";

const TICKS = [
  ["BTC/USD","$67,432","▲2.15%",true],  ["ETH/USD","$3,521","▲1.63%",true],
  ["EUR/USD","1.0847","▲0.32%",true],   ["Gold","$2,341","▲0.87%",true],
  ["Apple","$189.72","▼0.45%",false],   ["Tesla","$248.90","▲3.21%",true],
  ["GBP/JPY","191.23","▼0.18%",false],  ["Silver","$27.45","▼0.52%",false],
  ["S&P500","5,248","▲0.41%",true],     ["XRP","$0.621","▲1.88%",true],
];

export function TickerSection() {
  const items = [...TICKS, ...TICKS, ...TICKS, ...TICKS];
  return (
    <div style={{
      background:"#0d1018",
      borderTop:"1px solid rgba(255,255,255,.065)",
      borderBottom:"1px solid rgba(200,168,75,.2)",
      padding:"9px 0", overflow:"hidden", whiteSpace:"nowrap", position:"relative"
    }}>
      {/* Fade edges */}
      <div style={{ position:"absolute",top:0,bottom:0,left:0,width:80,zIndex:2,background:"linear-gradient(90deg,#0d1018,transparent)",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",top:0,bottom:0,right:0,width:80,zIndex:2,background:"linear-gradient(-90deg,#0d1018,transparent)",pointerEvents:"none" }}/>

      <div style={{ display:"inline-flex", animation:"hp-ticker 30s linear infinite" }}>
        {items.map(([n,p,c,up], i) => (
          <span key={i} style={{
            display:"inline-flex", alignItems:"center", gap:8,
            padding:"0 20px", fontSize:".78rem",
            borderRight:"1px solid rgba(255,255,255,.065)"
          }}>
            <b style={{ fontWeight:700 }}>{n}</b>
            <span style={{ color:"rgba(195,200,220,.48)" }}>{p}</span>
            <span style={{ color: up ? "#12e07a" : "#ff3c55" }}>{c}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
