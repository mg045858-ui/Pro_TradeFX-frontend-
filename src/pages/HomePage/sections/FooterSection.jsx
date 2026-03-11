import React from "react";
import { BrandLogo } from "../../../components/ui/Logo/Logo";

const COLS = [
  { h:"Platform", ls:["Web Terminal","Mobile App","Desktop App","API Access"] },
  { h:"Trading",  ls:["Forex","Crypto","Stocks","Commodities"] },
  { h:"Support",  ls:["Expert Analysis","WhatsApp Support","Help Center","Live Chat"] },
  { h:"Legal",    ls:["Terms of Service","Privacy Policy","Risk Warning","AML Policy"] },
];

export function FooterSection() {
  return (
    <footer style={{
      background:"#0d1018",
      borderTop:"1px solid rgba(255,255,255,.065)",
      padding:"56px 0 26px"
    }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 5%" }}>
        <div className="hp-footer-top" style={{
          display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:36, marginBottom:40
        }}>
          {/* Brand */}
          <div>
            <BrandLogo size="md" style={{ marginBottom:13 }} />
            <p style={{ fontSize:".82rem", color:"rgba(195,200,220,.48)", lineHeight:1.8, maxWidth:230 }}>
              The world's fastest 30-minute profit trading platform. Trusted by 800,000+ traders in 133 countries.
            </p>
          </div>

          {/* Link columns */}
          {COLS.map(col => (
            <div key={col.h}>
              <h5 style={{
                fontFamily:"'Cormorant Garamond',serif", fontSize:".88rem", fontWeight:800,
                marginBottom:14, color:"#edf0fa"
              }}>{col.h}</h5>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:9 }}>
                {col.ls.map(l => (
                  <li key={l}>
                    <a href="#" style={{ fontSize:".81rem", color:"rgba(195,200,220,.48)", transition:"color .2s" }}
                    onMouseEnter={e=>e.target.style.color="#c8a84b"}
                    onMouseLeave={e=>e.target.style.color="rgba(195,200,220,.48)"}
                    >{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          borderTop:"1px solid rgba(255,255,255,.065)", paddingTop:20,
          display:"flex", justifyContent:"space-between", alignItems:"center",
          flexWrap:"wrap", gap:10
        }}>
          <p style={{ fontSize:".72rem", color:"rgba(195,200,220,.48)" }}>© 2026 ProFX Trade. All rights reserved.</p>
          <p style={{ fontSize:".72rem", color:"rgba(195,200,220,.48)", maxWidth:480, textAlign:"right" }}>
            ⚠️ Risk Warning: Trading involves financial risk. Capital protection applies to principal deposit only. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
