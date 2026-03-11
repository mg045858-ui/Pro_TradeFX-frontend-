import React, { useState } from "react";

const ANALYSTS = [
  { icon:"👨‍💼", name:"Arjun Sharma",  role:"Senior Forex Analyst",  win:"91%", exp:"5yr", wa:"919876543210?text=Hi+Arjun,+I+need+free+trading+analysis" },
  { icon:"👩‍💼", name:"Priya Mehta",   role:"Crypto Specialist",      win:"88%", exp:"4yr", wa:"919876543211?text=Hi+Priya,+I+need+crypto+analysis" },
  { icon:"👨‍💻", name:"Ravi Patel",    role:"Equity Analyst",         win:"93%", exp:"7yr", wa:"919876543212?text=Hi+Ravi,+I+need+stock+market+analysis" },
  { icon:"👩‍🔬", name:"Sara Khan",     role:"Commodity Expert",       win:"89%", exp:"6yr", wa:"919876543213?text=Hi+Sara,+I+need+commodity+analysis" },
];

function WaIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M5.42 21.4h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37A9.86 9.86 0 01.16 11.9C.16 6.44 4.6 2 10.05 2c2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0010.05 0C4.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.94L.06 24l6.31-1.65a11.88 11.88 0 005.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9a11.82 11.82 0 00-3.48-8.41z"/>
    </svg>
  );
}

const inputStyle = {
  width:"100%", padding:"11px 14px", borderRadius:9,
  border:"1px solid rgba(255,255,255,.065)", background:"#131620",
  color:"#edf0fa", fontFamily:"'Plus Jakarta Sans',sans-serif",
  fontSize:".86rem", marginBottom:11, outline:"none",
  transition:"border-color .2s"
};

export function ExpertSection() {
  const [focused, setFocused] = useState(null);

  return (
    <section id="experts" style={{
      padding:"96px 0", position:"relative", overflow:"hidden", background:"#07090e"
    }}>
      {/* BG */}
      <div style={{
        position:"absolute", inset:0,
        backgroundImage:"url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1400&q=60')",
        backgroundSize:"cover", backgroundPosition:"center",
        filter:"brightness(.2) saturate(.6)"
      }}/>
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(108deg,rgba(7,9,14,.97) 0%,rgba(7,9,14,.72) 52%,rgba(7,9,14,.36) 100%)" }}/>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 5%", position:"relative", zIndex:2 }}>
        <div className="hp-expert-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"start" }}>

          {/* Left */}
          <div>
            <div className="hp-sec-badge" style={{ marginBottom:16 }}>👨‍💼 Live Expert Analysis</div>
            <h2 style={{
              fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(2rem,3.8vw,3.1rem)",
              fontWeight:800, lineHeight:1.1, letterSpacing:"-.02em", marginBottom:16
            }}>
              Get Free <span className="hp-grad">Expert Analysis</span><br/>on WhatsApp
            </h2>
            <p style={{ fontSize:".96rem", color:"rgba(195,200,220,.48)", lineHeight:1.82, maxWidth:520, marginBottom:28 }}>
              Our certified analysts are live 24/7. Message them for personalized trade signals, market insights and profit guidance — 100% free.
            </p>

            {/* Analyst grid */}
            <div className="hp-analyst-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {ANALYSTS.map(a => (
                <div key={a.name} style={{
                  background:"rgba(13,16,24,.9)", border:"1px solid rgba(255,255,255,.065)",
                  borderRadius:14, padding:16, cursor:"pointer",
                  transition:"all .26s", backdropFilter:"blur(12px)"
                }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(200,168,75,.28)"; e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,.065)"; e.currentTarget.style.transform="none"; }}
                >
                  <div style={{
                    width:48, height:48, borderRadius:12, background:"rgba(200,168,75,.18)",
                    border:"2px solid rgba(200,168,75,.28)", display:"grid", placeItems:"center",
                    fontSize:20, marginBottom:9
                  }}>{a.icon}</div>
                  <div style={{ fontWeight:700, fontSize:".88rem", marginBottom:2 }}>{a.name}</div>
                  <div style={{ fontSize:".68rem", color:"#c8a84b", fontWeight:600, marginBottom:7 }}>{a.role}</div>
                  <div style={{ display:"flex", gap:8, marginBottom:9 }}>
                    <span style={{ fontSize:".67rem", color:"rgba(195,200,220,.48)" }}>Win Rate <b style={{ color:"#12e07a" }}>{a.win}</b></span>
                    <span style={{ fontSize:".67rem", color:"rgba(195,200,220,.48)" }}>{a.exp} exp</span>
                  </div>
                  <a href={`https://wa.me/${a.wa}`} target="_blank" rel="noopener noreferrer" style={{
                    display:"inline-flex", alignItems:"center", gap:5,
                    padding:"5px 11px", borderRadius:6,
                    background:"rgba(37,211,102,.1)", border:"1px solid rgba(37,211,102,.22)",
                    color:"#25d366", fontSize:".68rem", fontWeight:700, transition:"background .2s"
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(37,211,102,.18)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(37,211,102,.1)"}
                  onClick={e => e.stopPropagation()}
                  ><WaIcon/> WhatsApp</a>
                </div>
              ))}
            </div>
          </div>

          {/* Right — contact form */}
          <div style={{
            background:"rgba(13,16,24,.94)", border:"1px solid rgba(200,168,75,.28)",
            borderRadius:22, padding:36, backdropFilter:"blur(20px)", position:"relative", overflow:"hidden"
          }}>
            <div style={{ position:"absolute", inset:"0 0 auto", height:2, background:"linear-gradient(90deg,transparent,#c8a84b,transparent)" }}/>

            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.5rem", fontWeight:800, marginBottom:5 }}>Get Your Free Analysis Now</div>
            <div style={{ fontSize:".82rem", color:"rgba(195,200,220,.48)", lineHeight:1.7, marginBottom:22 }}>
              Fill in your details — our expert contacts you on WhatsApp within 15 minutes with a personalised market analysis. Completely free.
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <input placeholder="Full Name" style={{ ...inputStyle, ...(focused==="name" ? {borderColor:"rgba(200,168,75,.28)"} : {}) }} onFocus={()=>setFocused("name")} onBlur={()=>setFocused(null)}/>
              <input placeholder="WhatsApp Number" type="tel" style={{ ...inputStyle, ...(focused==="tel" ? {borderColor:"rgba(200,168,75,.28)"} : {}) }} onFocus={()=>setFocused("tel")} onBlur={()=>setFocused(null)}/>
            </div>

            <select style={{ ...inputStyle, cursor:"pointer", ...(focused==="asset" ? {borderColor:"rgba(200,168,75,.28)"} : {}) }} onFocus={()=>setFocused("asset")} onBlur={()=>setFocused(null)}>
              <option value="">What do you want to trade?</option>
              <option>Forex Trading</option>
              <option>Crypto (BTC, ETH...)</option>
              <option>Stocks & Indices</option>
              <option>Gold & Commodities</option>
              <option>Portfolio Review</option>
            </select>

            <input placeholder="How much do you want to invest? ($)" type="number" style={{ ...inputStyle, ...(focused==="amount" ? {borderColor:"rgba(200,168,75,.28)"} : {}) }} onFocus={()=>setFocused("amount")} onBlur={()=>setFocused(null)}/>

            <textarea placeholder="Any specific questions? (optional)" rows={3} style={{ ...inputStyle, resize:"none", ...(focused==="msg" ? {borderColor:"rgba(200,168,75,.28)"} : {}) }} onFocus={()=>setFocused("msg")} onBlur={()=>setFocused(null)}/>

            <div style={{ display:"flex", flexDirection:"column", gap:9, marginTop:4 }}>
              <a href="https://wa.me/919876543210?text=Hello,+I+need+free+expert+trading+analysis" target="_blank" rel="noopener noreferrer" style={{
                display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                padding:13, borderRadius:11, border:"none",
                background:"linear-gradient(135deg,#25d366,#128c7e)",
                color:"#fff", fontFamily:"'Plus Jakarta Sans',sans-serif",
                fontWeight:700, fontSize:".88rem", cursor:"pointer",
                boxShadow:"0 4px 18px rgba(37,211,102,.3)", transition:"all .24s"
              }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 7px 26px rgba(37,211,102,.44)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 18px rgba(37,211,102,.3)"; }}
              >
                <WaIcon/> Send via WhatsApp — Get Free Analysis
              </a>
              <a href="tel:+919876543210" style={{
                display:"flex", alignItems:"center", justifyContent:"center", gap:9,
                padding:11, borderRadius:11, border:"1px solid rgba(200,168,75,.28)",
                background:"none", color:"#c8a84b",
                fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600, fontSize:".86rem",
                cursor:"pointer", transition:"all .2s"
              }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(200,168,75,.18)"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}
              >
                📞 Call an Expert Now — +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
