import React, { useState, useEffect } from "react";

const WaPath = "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M5.42 21.4h-.01a9.87 9.87 0 01-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37A9.86 9.86 0 01.16 11.9C.16 6.44 4.6 2 10.05 2c2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 012.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0010.05 0C4.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.94L.06 24l6.31-1.65a11.88 11.88 0 005.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9a11.82 11.82 0 00-3.48-8.41z";

export function WhatsAppFloat() {
  const [tipVisible, setTipVisible] = useState(false);
  const [hovered, setHovered]       = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setTipVisible(true),  3200);
    const t2 = setTimeout(() => setTipVisible(false), 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position:"fixed", bottom:28, right:28, zIndex:9500,
      display:"flex", flexDirection:"column", alignItems:"flex-end", gap:9
    }}>
      {/* Tooltip */}
      <div style={{
        background:"rgba(10,12,18,.97)", border:"1px solid rgba(37,211,102,.26)",
        borderRadius:14, padding:"13px 16px", maxWidth:210,
        opacity: (tipVisible || hovered) ? 1 : 0,
        transform: (tipVisible || hovered) ? "translateY(0) scale(1)" : "translateY(6px) scale(.95)",
        transition:"all .3s cubic-bezier(.4,0,.2,1)",
        pointerEvents: (tipVisible || hovered) ? "auto" : "none"
      }}>
        <div style={{ fontWeight:700, fontSize:".82rem", marginBottom:3 }}>💬 Chat with a Trading Expert</div>
        <div style={{ fontSize:".72rem", color:"rgba(195,200,220,.48)", lineHeight:1.55 }}>Get FREE market analysis & trade signals on WhatsApp — 24/7.</div>
      </div>

      {/* Ring + FAB */}
      <div style={{ position:"relative" }}>
        <div style={{
          position:"absolute", inset:0, borderRadius:"50%",
          border:"2px solid rgba(37,211,102,.32)",
          animation:"hp-ring 2.6s ease-out infinite"
        }}/>
        <a
          href="https://wa.me/+2250779718377?text=Hello,+I+need+free+trading+expert+analysis"
          target="_blank" rel="noopener noreferrer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width:58, height:58, borderRadius:"50%", display:"grid", placeItems:"center",
            background:"linear-gradient(135deg,#25d366,#128c7e)",
            boxShadow:"0 5px 24px rgba(37,211,102,.48)",
            border:"3px solid rgba(255,255,255,.18)",
            transition:"all .3s", animation:"hp-wapulse 3s ease-in-out infinite",
            transform: hovered ? "scale(1.12)" : "scale(1)"
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d={WaPath}/>
          </svg>
        </a>
      </div>
    </div>
  );
}
