import React from "react";

const STEPS = [
  { icon:"🖊️", n:"01", title:"Create Free Account",         desc:"Register in 60 seconds with just your email. No documents required. Get a free $10,000 demo balance to practice before investing real money." },
  { icon:"💳", n:"02", title:"Deposit & Choose Asset",       desc:"Deposit from $10 via card, UPI, wallet or crypto. Select any asset, set your 30-minute window — our expert system manages the rest." },
  { icon:"💰", n:"03", title:"Profit & Withdraw Instantly",  desc:"30 minutes later your profit is automatically credited. Withdraw to bank, UPI or crypto wallet instantly — 24/7, no limits, no fees." },
];

export function HowItWorksSection() {
  return (
    <section id="hiw" style={{
      padding:"96px 0", position:"relative", overflow:"hidden", background:"#07090e"
    }}>
      {/* BG */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"url('https://images.unsplash.com/photo-1560221328-12fe60f83ab8?w=1400&q=60')",
        backgroundSize:"cover", backgroundPosition:"center",
        filter:"brightness(.16) saturate(.55)"
      }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(7,9,14,.85),rgba(7,9,14,.9))" }}/>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 5%", position:"relative", zIndex:2 }}>
        <div className="hp-sec-head">
          <div className="hp-sec-badge">🔄 Simple Process</div>
          <h2 className="hp-sec-title">Start in <span>3 Easy Steps</span></h2>
          <p className="hp-sec-sub">From sign-up to first profit — done in under 10 minutes.</p>
        </div>

        <div className="hp-hiw-cards" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {STEPS.map(s => (
            <div key={s.n} style={{
              background:"rgba(13,16,24,.92)", border:"1px solid rgba(255,255,255,.065)",
              borderRadius:20, padding:"34px 26px", position:"relative", overflow:"hidden",
              transition:"all .28s", backdropFilter:"blur(14px)"
            }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(200,168,75,.28)"; e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 20px 56px rgba(0,0,0,.48)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,.065)"; e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}
            >
              {/* Large step number watermark */}
              <div style={{
                position:"absolute", right:14, bottom:4,
                fontFamily:"'Cormorant Garamond',serif", fontSize:"5rem", fontWeight:800,
                color:"rgba(255,255,255,.025)", lineHeight:1, pointerEvents:"none"
              }}>{s.n}</div>

              <div style={{
                width:58, height:58, borderRadius:16,
                background:"linear-gradient(135deg,rgba(200,168,75,.14),rgba(200,168,75,.04))",
                border:"1px solid rgba(200,168,75,.28)",
                display:"grid", placeItems:"center", fontSize:26, marginBottom:22
              }}>{s.icon}</div>

              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.18rem", fontWeight:700, marginBottom:10 }}>{s.title}</div>
              <div style={{ fontSize:".85rem", color:"rgba(195,200,220,.48)", lineHeight:1.78 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
