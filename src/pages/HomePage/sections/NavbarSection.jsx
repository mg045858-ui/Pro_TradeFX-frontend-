import React, { useState, useEffect } from "react";
import { BrandLogo } from "../../../components/ui/Logo/Logo";

const NAV_ITEMS = [
  { href:"#profit30", icon:"⚡", label:"30-Min Profit",   desc:"Earn in 30 minutes, zero risk" },
  { href:"#markets",  icon:"📊", label:"Markets",          desc:"70+ live assets to trade" },
  { href:"#hiw",      icon:"🔄", label:"How It Works",     desc:"3 simple steps to profit" },
  { href:"#accounts", icon:"💼", label:"Accounts",         desc:"Starter, Gold & VIP Elite plans" },
  { href:"#experts",  icon:"👨‍💼", label:"Expert Analysis", desc:"Free WhatsApp trading signals" },
];

export function NavbarSection({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      {/* NAV */}
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:500,
        height:72, display:"flex", alignItems:"center", padding:"0 5%",
        background: scrolled ? "rgba(7,9,14,.99)" : "rgba(7,9,14,.95)",
        backdropFilter:"blur(28px)",
        borderBottom:"1px solid rgba(200,168,75,.14)",
        boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,.55)" : "none",
        transition:"background .3s,box-shadow .3s"
      }}>
        {/* Logo */}
        <BrandLogo size="md" onClick={() => {}} />

        {/* Desktop links */}
        <div className="hp-nav-links" style={{ marginLeft:32 }}>
          {NAV_ITEMS.map(l => <a key={l.label} href={l.href}>{l.label}</a>)}
        </div>

        {/* Desktop buttons */}
        <div className="hp-nav-actions" style={{ marginLeft:"auto", display:"flex", gap:9, flexShrink:0 }}>
          <button className="hp-btn-nav-ol" onClick={() => onNavigate?.("login")}>Log In</button>
          <button className="hp-btn-nav-fill" onClick={() => onNavigate?.("register")}>Open Free Account</button>
        </div>

        {/* Hamburger */}
        <button className="hp-nav-burger" onClick={() => setOpen(o => !o)} style={{
          display:"none", flexDirection:"column", justifyContent:"center", alignItems:"center",
          gap:5, marginLeft:"auto", width:38, height:38, borderRadius:8, background:"none",
          border:`1px solid ${open ? "rgba(200,168,75,.3)" : "rgba(255,255,255,.1)"}`,
          cursor:"pointer", flexShrink:0, transition:"border-color .2s"
        }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              display:"block", width:18, height:2, background:"#edf0fa", borderRadius:2,
              transition:"transform .28s ease,opacity .28s ease",
              transform: open ? i===0?"translateY(7px) rotate(45deg)":i===2?"translateY(-7px) rotate(-45deg)":"scaleX(0)" : "none",
              opacity: open && i===1 ? 0 : 1
            }}/>
          ))}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <div style={{
        position:"fixed", top:72, left:0, right:0, zIndex:499,
        background:"rgba(7,9,14,.99)", backdropFilter:"blur(24px)",
        borderBottom:"1px solid rgba(200,168,75,.14)",
        maxHeight: open ? "520px" : 0, overflow:"hidden",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition:"max-height .38s cubic-bezier(.4,0,.2,1),opacity .3s"
      }}>
        <div style={{ padding:"12px 20px 24px" }}>
          {NAV_ITEMS.map((item, i) => (
            <a key={i} href={item.href} onClick={() => setOpen(false)} style={{
              display:"flex", alignItems:"center", gap:12, padding:"13px 12px", borderRadius:10,
              color:"rgba(195,200,220,.65)", fontSize:".93rem", fontWeight:500,
              borderBottom:"1px solid rgba(255,255,255,.055)", transition:"color .18s,background .18s"
            }}
            onMouseEnter={e=>{e.currentTarget.style.color="#edf0fa";e.currentTarget.style.background="rgba(255,255,255,.04)"}}
            onMouseLeave={e=>{e.currentTarget.style.color="rgba(195,200,220,.65)";e.currentTarget.style.background="transparent"}}
            >
              <div style={{
                width:34, height:34, borderRadius:8, flexShrink:0,
                background:"rgba(200,168,75,.08)", border:"1px solid rgba(200,168,75,.28)",
                display:"grid", placeItems:"center", fontSize:".95rem"
              }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight:600, fontSize:".9rem", color:"#edf0fa" }}>{item.label}</div>
                <div style={{ fontSize:".72rem", color:"rgba(195,200,220,.48)", marginTop:1 }}>{item.desc}</div>
              </div>
            </a>
          ))}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:16, paddingTop:16, borderTop:"1px solid rgba(255,255,255,.06)" }}>
            <button className="hp-btn-nav-ol" style={{ width:"100%", textAlign:"center", padding:12 }} onClick={() => { setOpen(false); onNavigate?.("login"); }}>Log In</button>
            <button className="hp-btn-nav-fill" style={{ width:"100%", textAlign:"center", padding:12 }} onClick={() => { setOpen(false); onNavigate?.("register"); }}>Open Free Account</button>
          </div>
        </div>
      </div>
    </>
  );
}
