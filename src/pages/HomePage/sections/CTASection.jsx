import React from "react";

export function CTASection({ onNavigate }) {
  return (
    <section style={{
      padding:"80px 0", position:"relative", overflow:"hidden", background:"#07090e"
    }}>
      {/* BG */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1400&q=60')",
        backgroundSize:"cover", backgroundPosition:"center",
        filter:"brightness(.15) saturate(.5)"
      }}/>
      <div style={{ position:"absolute", inset:0, background:"rgba(7,9,14,.87)" }}/>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 5%", position:"relative", zIndex:2 }}>
        <div style={{
          maxWidth:680, margin:"0 auto", textAlign:"center",
          background:"rgba(13,16,24,.95)", border:"1px solid rgba(200,168,75,.28)",
          borderRadius:26, padding:"60px 48px", position:"relative", overflow:"hidden",
          backdropFilter:"blur(24px)"
        }}>
          {/* Top shimmer */}
          <div style={{ position:"absolute", inset:"0 0 auto", height:2, background:"linear-gradient(90deg,transparent,#c8a84b,transparent)" }}/>
          {/* Glow */}
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 40% at 50% 0%,rgba(200,168,75,.08),transparent 60%)", pointerEvents:"none" }}/>

          <div className="hp-sec-badge" style={{ marginBottom:20, position:"relative", zIndex:1 }}>🚀 Start Right Now</div>

          <h2 style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontSize:"clamp(1.9rem,3.6vw,2.9rem)", fontWeight:800,
            marginBottom:14, position:"relative", zIndex:1, lineHeight:1.1
          }}>
            Start Earning in <span className="hp-grad">30 Minutes.</span><br/>Open Free Account Today.
          </h2>

          <p style={{
            color:"rgba(195,200,220,.48)", fontSize:".97rem", lineHeight:1.8,
            marginBottom:32, position:"relative", zIndex:1
          }}>
            Join 800,000+ traders generating daily profits. Free account. Free WhatsApp expert analysis. Withdraw any time. Zero risk on your capital.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap", position:"relative", zIndex:1 }}>
            <button className="hp-btn-primary" style={{ fontSize:".94rem", padding:"14px 34px" }} onClick={() => onNavigate?.("register")}>
              Open Free Account →
            </button>
            <a href="https://wa.me/919876543210?text=Hello,+I+want+to+start+trading" target="_blank" rel="noopener noreferrer" className="hp-btn-outline" style={{ fontSize:".94rem", padding:"13px 28px" }}>
              💬 WhatsApp Expert First
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
