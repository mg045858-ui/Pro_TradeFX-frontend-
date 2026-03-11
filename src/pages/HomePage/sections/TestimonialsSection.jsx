import React from "react";

const TESTIMONIALS = [
  {
    head: "\"Made $420 profit in my first 30 minutes!\"",
    body: "I deposited $500 and had no idea about trading. Expert Arjun guided me on WhatsApp — 30 minutes later I had $420 profit. I literally couldn't believe how fast it was.",
    init:"RK", name:"Rajesh Kumar",  loc:"Delhi, India · 34 yrs",  earned:"+$8,240 earned this month"
  },
  {
    head: "\"I quit my 9-5 job within 3 months\"",
    body: "Started with $200, now I consistently make $1,500 per day. The 30-minute system is completely real. The WhatsApp expert analysts are the real game-changer here.",
    init:"AM", name:"Ayesha Mirza",  loc:"Mumbai, India · 28 yrs",  earned:"+$42,600 earned this quarter"
  },
  {
    head: "\"Sara's signals are incredibly accurate\"",
    body: "I follow Sara's commodity signals on WhatsApp daily. 9 profitable trades out of 10 this month. Platform is fast, honest, withdrawals hit my bank in minutes.",
    init:"VT", name:"Vikram Tiwari", loc:"Bangalore, India · 42 yrs", earned:"+$19,800 earned this month"
  },
];

export function TestimonialsSection() {
  return (
    <section style={{
      padding:"96px 0", position:"relative", overflow:"hidden", background:"#0d1018"
    }}>
      {/* BG */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&q=60')",
        backgroundSize:"cover", backgroundPosition:"top",
        filter:"brightness(.1) saturate(.4)"
      }}/>
      <div style={{ position:"absolute", inset:0, background:"rgba(13,16,24,.9)" }}/>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 5%", position:"relative", zIndex:2 }}>
        <div className="hp-sec-head">
          <div className="hp-sec-badge">⭐ Real Traders</div>
          <h2 className="hp-sec-title">Traders Who <span>Changed Their Lives</span></h2>
          <p className="hp-sec-sub">Real profits. Real people. Every day on ProFX Trade.</p>
        </div>

        <div className="hp-testi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{
              background:"rgba(13,16,24,.92)", border:"1px solid rgba(255,255,255,.065)",
              borderRadius:18, padding:26, display:"flex", flexDirection:"column",
              transition:"all .24s", backdropFilter:"blur(12px)"
            }}
            onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(200,168,75,.28)"; e.currentTarget.style.transform="translateY(-3px)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,.065)"; e.currentTarget.style.transform="none"; }}
            >
              {/* Stars */}
              <div style={{ display:"flex", gap:3, marginBottom:12 }}>
                {Array(5).fill(0).map((_, i) => <span key={i} style={{ color:"#c8a84b", fontSize:13 }}>★</span>)}
              </div>
              {/* Headline */}
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:".97rem", fontWeight:700, color:"#c8a84b", marginBottom:9 }}>{t.head}</div>
              {/* Body */}
              <p style={{ fontSize:".85rem", color:"rgba(195,200,220,.48)", lineHeight:1.8, flex:1, marginBottom:18 }}>{t.body}</p>
              {/* Author */}
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <div style={{
                  width:40, height:40, borderRadius:"50%", flexShrink:0,
                  background:"rgba(200,168,75,.18)", border:"1px solid rgba(200,168,75,.28)",
                  display:"grid", placeItems:"center",
                  fontFamily:"'Cormorant Garamond',serif", fontWeight:700, fontSize:".84rem"
                }}>{t.init}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:".85rem" }}>{t.name}</div>
                  <div style={{ fontSize:".68rem", color:"rgba(195,200,220,.48)" }}>{t.loc}</div>
                  <div style={{ fontSize:".72rem", fontWeight:700, color:"#12e07a", marginTop:2 }}>{t.earned}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
