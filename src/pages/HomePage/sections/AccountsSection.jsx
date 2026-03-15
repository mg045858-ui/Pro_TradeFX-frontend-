import React from "react";

const ACCOUNTS = [
  {
    icon:"⭐", name:"Starter", price:"₹830", minLabel:"Minimum Deposit", yield:"Up to 85% profit",
    hot:false, btnStyle:"outline",
    features:["70+ Trading Assets","30-Min Profit System","Free $10K Demo Account","24/5 Live Chat Support","iOS & Android App"],
  },
  {
    icon:"👑", name:"Gold", price:"₹50000", minLabel:"Minimum Deposit", yield:"Up to 90% profit",
    hot:true, btnStyle:"primary",
    features:["All Starter Features","Personal Expert Analyst","WhatsApp Trade Signals","Priority Withdrawals","Capital Insurance","3 Free Risk-Free Trades"],
  },
  {
    icon:"💎", name:"VIP Elite", price:"₹200000", minLabel:"Minimum Deposit", yield:"Up to 95% profit",
    hot:false, btnStyle:"outline",
    features:["All Gold Features","Dedicated Fund Manager","VIP 24/7 Hotline","Private Trading Room","10% Monthly Cashback","Full Trade Insurance"],
  },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" style={{ width:9, height:9, strokeWidth:2.5, stroke:"#c8a84b", fill:"none", strokeLinecap:"round", strokeLinejoin:"round" }}>
      <path d="M2 6l3 3 5-5"/>
    </svg>
  );
}

export function AccountsSection({ onNavigate }) {
  return (
    <section id="accounts" style={{
      padding:"96px 0", position:"relative", overflow:"hidden", background:"#0d1018"
    }}>
      {/* BG */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"url('https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=1400&q=60')",
        backgroundSize:"cover", backgroundPosition:"center",
        filter:"brightness(.13) saturate(.5)"
      }}/>
      <div style={{ position:"absolute", inset:0, background:"rgba(13,16,24,.84)" }}/>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 5%", position:"relative", zIndex:2 }}>
        <div className="hp-sec-head">
          <div className="hp-sec-badge">💼 Choose a Plan</div>
          <h2 className="hp-sec-title">Pick Your <span>Trading Account</span></h2>
          <p className="hp-sec-sub">Every plan includes 30-minute profit technology and full capital protection.</p>
        </div>

        <div className="hp-acc-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
          {ACCOUNTS.map(acc => (
            <div key={acc.name} style={{
              background: acc.hot
                ? "linear-gradient(160deg,rgba(200,168,75,.07),rgba(13,16,24,.94) 55%)"
                : "rgba(13,16,24,.94)",
              border: acc.hot ? "1px solid rgba(200,168,75,.42)" : "1px solid rgba(255,255,255,.065)",
              borderRadius:22, padding:"34px 26px",
              display:"flex", flexDirection:"column",
              position:"relative", overflow:"hidden",
              transition:"all .28s", backdropFilter:"blur(16px)",
              transform: acc.hot ? "scale(1.03)" : "none"
            }}
            onMouseEnter={e=>{ e.currentTarget.style.transform=acc.hot?"scale(1.03) translateY(-4px)":"translateY(-4px)"; e.currentTarget.style.boxShadow="0 24px 60px rgba(0,0,0,.5)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform=acc.hot?"scale(1.03)":"none"; e.currentTarget.style.boxShadow="none"; }}
            >
              {acc.hot && (
                <div style={{
                  position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)",
                  background:"linear-gradient(90deg,#c8a84b,#e9cc7e)", color:"#07090e",
                  fontSize:".64rem", fontWeight:800, letterSpacing:".1em", textTransform:"uppercase",
                  padding:"5px 18px", borderRadius:"0 0 11px 11px", whiteSpace:"nowrap"
                }}>Most Popular</div>
              )}

              <div style={{
                width:62, height:62, borderRadius:18,
                background:"rgba(200,168,75,.18)", border:"1px solid rgba(200,168,75,.28)",
                display:"grid", placeItems:"center", fontSize:26,
                margin: acc.hot ? "14px auto 16px" : "0 auto 16px"
              }}>{acc.icon}</div>

              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.35rem", fontWeight:800, textAlign:"center", marginBottom:8 }}>{acc.name}</div>
              <div style={{
                fontFamily:"'Cormorant Garamond',serif", fontSize:"2.8rem", fontWeight:800,
                textAlign:"center", lineHeight:1,
                background:"linear-gradient(135deg,#c8a84b,#e9cc7e)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"
              }}>{acc.price}</div>
              <div style={{ fontSize:".7rem", color:"rgba(195,200,220,.48)", textAlign:"center", marginBottom:8 }}>{acc.minLabel}</div>
              <div style={{
                display:"block", width:"fit-content", margin:"0 auto 20px",
                background:"rgba(200,168,75,.1)", border:"1px solid rgba(200,168,75,.28)",
                color:"#c8a84b", fontSize:".76rem", fontWeight:700, padding:"4px 14px", borderRadius:100
              }}>{acc.yield}</div>

              <ul style={{ listStyle:"none", flex:1, marginBottom:20 }}>
                {acc.features.map(f => (
                  <li key={f} style={{
                    display:"flex", alignItems:"center", gap:9, fontSize:".84rem",
                    color:"rgba(195,200,220,.48)", padding:"6px 0",
                    borderBottom:"1px solid rgba(255,255,255,.065)"
                  }}>
                    <div style={{
                      width:19, height:19, borderRadius:"50%", flexShrink:0,
                      background:"rgba(200,168,75,.18)", border:"1px solid rgba(200,168,75,.28)",
                      display:"grid", placeItems:"center"
                    }}><CheckIcon/></div>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onNavigate?.("register")}
                style={{
                  display:"block", width:"100%", textAlign:"center",
                  padding:12, borderRadius:11, fontWeight:700, fontSize:".87rem", cursor:"pointer",
                  ...(acc.btnStyle === "primary"
                    ? { background:"linear-gradient(135deg,#c8a84b,#8a6010)", color:"#07090e", border:"none", boxShadow:"0 4px 18px rgba(200,168,75,.32)", transition:"all .24s" }
                    : { background:"rgba(255,255,255,.03)", color:"#edf0fa", border:"1px solid rgba(255,255,255,.065)", transition:"all .2s" }
                  )
                }}
                onMouseEnter={e=>{
                  if(acc.btnStyle==="primary") e.currentTarget.style.boxShadow="0 8px 28px rgba(200,168,75,.52)";
                  else e.currentTarget.style.borderColor="rgba(200,168,75,.28)";
                  e.currentTarget.style.transform="translateY(-1px)";
                }}
                onMouseLeave={e=>{
                  if(acc.btnStyle==="primary") e.currentTarget.style.boxShadow="0 4px 18px rgba(200,168,75,.32)";
                  else e.currentTarget.style.borderColor="rgba(255,255,255,.065)";
                  e.currentTarget.style.transform="none";
                }}
              >Get Started →</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
