import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icons }   from "../../components/ui/Icons/Icons";
import { BrandLogo } from "../../components/ui/Logo/Logo";
import { CandlestickChart, fmt, generateCandles } from "./CandlestickChart";
import { TRADING_ASSETS, TIME_OPTIONS, SIDE_NAV } from "./tradingData";
import "./TradingPage.css";

/* ── Live clock ── */
function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  const p = n => String(n).padStart(2, "0");
  return `${p(t.getHours())}:${p(t.getMinutes())}:${p(t.getSeconds())} GMT+5`;
}

/* ── Format INR ── */
const fmtBal = n => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export function TradingPage({ onNavigate }) {
  const { user, currentBalance, updateBalance, deductBalance, switchAccount } = useAuth();

  const [selectedAsset,    setSelectedAsset]    = useState(TRADING_ASSETS[0]);
  const [amount,           setAmount]           = useState(100);
  const [timeOption,       setTimeOption]       = useState(TIME_OPTIONS[3]);
  const [showAssets,       setShowAssets]       = useState(false);
  const [showTimeMenu,     setShowTimeMenu]     = useState(false);
  const [showAccMenu,      setShowAccMenu]      = useState(false);
  const [showUserMenu,     setShowUserMenu]     = useState(false);
  const [candles,          setCandles]          = useState(() => generateCandles(80, TRADING_ASSETS[0].price));
  const [activeTrades,     setActiveTrades]     = useState([]);
  const [tradeTimer,       setTradeTimer]       = useState(null);
  const [majorityUp,       setMajorityUp]       = useState(50);
  const [notification,     setNotification]     = useState(null);
  const [showTradesSheet,  setShowTradesSheet]  = useState(false);
  const [activeTf,         setActiveTf]         = useState("1m");

  const chartRef  = useRef(null);
  const tickRef   = useRef(0);
  const [chartDims, setChartDims] = useState({ w: 600, h: 400 });
  const clockStr = useClock();

  // Actual balance: use context if logged in, else local state
  const [localBalance, setLocalBalance] = useState(10000);
  const balance    = user ? currentBalance : localBalance;
  const accountType = user?.accountType || "demo";

  const setBalance = (fn) => {
    if (user) {
      const delta = typeof fn === "function" ? fn(balance) - balance : fn - balance;
      if (delta > 0) updateBalance(delta);
      else deductBalance(-delta);
    } else {
      setLocalBalance(fn);
    }
  };

  /* Resize */
  useEffect(() => {
    const update = () => {
      if (chartRef.current) setChartDims({ w: chartRef.current.clientWidth, h: chartRef.current.clientHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    if (chartRef.current) ro.observe(chartRef.current);
    return () => ro.disconnect();
  }, []);

  /* Live ticks */
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      setCandles(prev => {
        const last   = prev[prev.length - 1];
        const change = (Math.random() - 0.49) * (selectedAsset.price * 0.00035);
        const nc     = Math.max(last.close * 0.9, last.close + change);
        const now    = Date.now();
        if (tickRef.current % 5 === 0) {
          return [...prev.slice(1), {
            open: last.close, close: nc,
            high: Math.max(last.close, nc) + Math.random() * selectedAsset.price * 0.0003,
            low:  Math.min(last.close, nc) - Math.random() * selectedAsset.price * 0.0003,
            ts: now,
          }];
        }
        return [...prev.slice(0, -1), { ...last, close: nc, high: Math.max(last.high, nc), low: Math.min(last.low, nc) }];
      });
      setMajorityUp(v => Math.min(85, Math.max(15, v + (Math.random() - 0.5) * 4)));
    }, 400);
    return () => clearInterval(id);
  }, [selectedAsset]);

  /* Trade timer */
  useEffect(() => {
    const open = activeTrades.filter(t => !t.resolved);
    if (open.length > 0) {
      const earliest = open.sort((a, b) => a.endTime - b.endTime)[0];
      setTradeTimer(Math.max(0, Math.ceil((earliest.endTime - Date.now()) / 1000)));
    } else {
      setTradeTimer(null);
    }
  }, [activeTrades, candles]);

  /* Resolve trades */
  useEffect(() => {
    const id = setInterval(() => {
      setActiveTrades(prev => prev.map(t => {
        if (t.resolved) return t;
        if (Date.now() >= t.endTime) {
          const cp  = candles[candles.length - 1]?.close || selectedAsset.price;
          const won = t.direction === "up" ? cp > t.entryPrice : cp < t.entryPrice;
          const prof = won ? Math.round(t.amount * (t.payout / 100)) : 0;
          if (won) setBalance(b => b + t.amount + prof);
          setNotification({ won, profit: prof, amount: t.amount });
          setTimeout(() => setNotification(null), 3000);
          return { ...t, resolved: true, won, profit: prof };
        }
        return t;
      }));
    }, 300);
    return () => clearInterval(id);
  }, [candles, selectedAsset.price]);

  const placeTrade = (direction) => {
    if (amount > balance) return;
    setBalance(b => b - amount);
    setActiveTrades(prev => [{
      id: Date.now(), asset: selectedAsset.name, direction, amount,
      entryPrice: candles[candles.length - 1]?.close || selectedAsset.price,
      payout: selectedAsset.payout,
      endTime: Date.now() + timeOption.secs * 1000,
      resolved: false, won: false, profit: 0,
    }, ...prev.slice(0, 9)]);
  };

  const switchAsset = (a) => {
    setSelectedAsset(a);
    setCandles(generateCandles(80, a.price));
    setShowAssets(false);
    tickRef.current = 0;
  };

  const adjustTime = (dir) => {
    const idx  = TIME_OPTIONS.findIndex(t => t.secs === timeOption.secs);
    const next = dir === "up" ? Math.min(TIME_OPTIONS.length - 1, idx + 1) : Math.max(0, idx - 1);
    setTimeOption(TIME_OPTIONS[next]);
  };

  const cp       = candles[candles.length - 1]?.close || selectedAsset.price;
  const pp       = candles[candles.length - 2]?.close || selectedAsset.price;
  const pct      = ((cp - pp) / pp) * 100;
  const earnings = Math.round(amount * (selectedAsset.payout / 100));
  const entryLines = activeTrades.filter(t => !t.resolved).map(t => ({ price: t.entryPrice, direction: t.direction }));
  const TF_LABELS  = ["5s","15s","30s","1m","3m","5m"];

  /* ── Account Switcher dropdown ── */
  const AccountDropdown = () => (
    <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"hsl(225,22%,13%)", border:"1px solid hsl(225,15%,22%)", borderRadius:14, padding:16, zIndex:300, minWidth:260, boxShadow:"0 20px 50px rgba(0,0,0,0.7)" }}>
      <div style={{ fontSize:10, color:"hsl(230,10%,50%)", fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>Switch Account</div>

      {/* Real account */}
      <div onClick={()=>{ if(user) { switchAccount("real"); setShowAccMenu(false); } else { setShowAccMenu(false); onNavigate("deposit"); } }}
        style={{ padding:"12px 14px", borderRadius:10, cursor:"pointer", marginBottom:8,
          background: accountType==="real" ? "hsl(47,90%,61%,0.12)" : "hsl(225,20%,17%)",
          border: accountType==="real" ? "1px solid hsl(47,90%,61%,0.35)" : "1px solid transparent",
          transition:"all 0.15s" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:18 }}>💰</span>
            <span style={{ fontWeight:700, fontSize:14 }}>Real Account</span>
          </div>
          {accountType==="real" && <span style={{ padding:"1px 8px", borderRadius:20, background:"hsl(47,90%,61%,0.2)", color:"var(--primary)", fontSize:11, fontWeight:700 }}>ACTIVE</span>}
        </div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:20, color: user ? "#fff" : "hsl(230,10%,50%)" }}>
          {user ? fmtBal(user.realBalance) : "—"}
        </div>
        {!user && <div style={{ fontSize:11, color:"hsl(230,10%,50%)", marginTop:3 }}>Deposit to activate →</div>}
      </div>

      {/* Demo account */}
      <div onClick={()=>{ if(user) { switchAccount("demo"); setShowAccMenu(false); } else { setShowAccMenu(false); onNavigate("register"); } }}
        style={{ padding:"12px 14px", borderRadius:10, cursor:"pointer",
          background: accountType==="demo" ? "hsl(210,80%,55%,0.1)" : "hsl(225,20%,17%)",
          border: accountType==="demo" ? "1px solid hsl(210,80%,55%,0.35)" : "1px solid transparent",
          transition:"all 0.15s" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:18 }}>🎮</span>
            <span style={{ fontWeight:700, fontSize:14 }}>Demo Account</span>
          </div>
          {accountType==="demo" && <span style={{ padding:"1px 8px", borderRadius:20, background:"hsl(210,80%,55%,0.2)", color:"hsl(210,80%,70%)", fontSize:11, fontWeight:700 }}>ACTIVE</span>}
        </div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:20, color: user ? "#fff" : "hsl(230,10%,50%)" }}>
          {user ? fmtBal(user.demoBalance) : "₹10,000"}
        </div>
        {!user && <div style={{ fontSize:11, color:"hsl(210,80%,70%)", marginTop:3 }}>Register to get free demo →</div>}
      </div>

      <button onClick={()=>{ setShowAccMenu(false); onNavigate("deposit"); }}
        style={{ width:"100%", marginTop:12, height:40, borderRadius:9, background:"var(--primary)", border:"none", cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:13, color:"hsl(230,25%,8%)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
        <Icons.DollarSign size={14}/> Deposit Funds
      </button>
    </div>
  );

  /* ── User menu dropdown ── */
  const UserMenu = () => (
    <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"hsl(225,22%,13%)", border:"1px solid hsl(225,15%,22%)", borderRadius:14, padding:16, zIndex:300, minWidth:220, boxShadow:"0 20px 50px rgba(0,0,0,0.7)" }}>
      {user ? (
        <>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, paddingBottom:14, borderBottom:"1px solid hsl(225,15%,20%)" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"hsl(210,80%,55%)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16 }}>{user.initials}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>{user.name}</div>
              <div style={{ fontSize:11, color:"hsl(230,10%,55%)" }}>{user.email}</div>
            </div>
          </div>
          {[
            { icon:"📊", label:"Trade History" },
            { icon:"👤", label:"Profile" },
            { icon:"🔔", label:"Notifications" },
            { icon:"⚙️", label:"Settings" },
          ].map(item => (
            <button key={item.label} style={{ width:"100%", padding:"10px 12px", border:"none", borderRadius:8, background:"none", color:"hsl(230,10%,75%)", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:10, transition:"background 0.15s", textAlign:"left" }}
              onMouseEnter={e=>e.currentTarget.style.background="hsl(225,20%,18%)"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
          <div style={{ borderTop:"1px solid hsl(225,15%,20%)", marginTop:8, paddingTop:8 }}>
            <button onClick={()=>{ setShowUserMenu(false); onNavigate("home"); }}
              style={{ width:"100%", padding:"10px 12px", border:"none", borderRadius:8, background:"none", color:"hsl(0,70%,65%)", fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", gap:10, textAlign:"left" }}
              onMouseEnter={e=>e.currentTarget.style.background="hsl(0,50%,15%)"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}>
              <span>🚪</span> Sign Out
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>👤</div>
          <div style={{ fontWeight:700, marginBottom:6 }}>Not signed in</div>
          <div style={{ fontSize:12, color:"hsl(230,10%,55%)", marginBottom:16 }}>Sign in to sync your trades and balance</div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>{ setShowUserMenu(false); onNavigate("login"); }}
              style={{ flex:1, height:38, borderRadius:8, background:"none", border:"1px solid var(--border)", cursor:"pointer", color:"#fff", fontWeight:600, fontSize:13 }}>Login</button>
            <button onClick={()=>{ setShowUserMenu(false); onNavigate("register"); }}
              style={{ flex:1, height:38, borderRadius:8, background:"var(--primary)", border:"none", cursor:"pointer", color:"hsl(230,25%,8%)", fontWeight:700, fontSize:13 }}>Register</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="tp" onClick={() => { setShowAssets(false); setShowTimeMenu(false); setShowAccMenu(false); setShowUserMenu(false); }}>

      {/* ══ HEADER ══ */}
      <header className="tp__header">
        <div className="tp__header-left">
          <button style={{ background:"none", border:"none", cursor:"pointer", color:"hsl(230,10%,60%)", padding:4, flexShrink:0 }}>
            <Icons.Menu size={18}/>
          </button>
          <BrandLogo size="sm" onClick={() => onNavigate("home")} />

          {/* Asset chip */}
          <div style={{ position:"relative" }} onClick={e=>e.stopPropagation()}>
            <button className="tp__asset-chip" onClick={()=>setShowAssets(s=>!s)}>
              <span style={{ fontSize:14 }}>{selectedAsset.emoji}</span>
              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selectedAsset.name}</span>
              <span className="tp__asset-payout">+{selectedAsset.payout}%</span>
            </button>
            {showAssets && (
              <div className="tp__dropdown">
                <div className="tp__dropdown-title">Assets</div>
                {TRADING_ASSETS.map(a=>(
                  <button key={a.id} onClick={()=>switchAsset(a)}
                    className={`tp__dropdown-item${a.id===selectedAsset.id?" tp__dropdown-item--active":""}`}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:18, width:24, textAlign:"center" }}>{a.emoji}</span>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontWeight:600, fontSize:13 }}>{a.name}</div>
                        <div style={{ fontSize:11, color:"hsl(230,10%,50%)" }}>{a.category}</div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"hsl(145,60%,55%)" }}>+{a.payout}%</div>
                      <div style={{ fontSize:11, color:"hsl(230,10%,50%)" }}>{fmt(a.price)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="tp__header-right">
          {/* Account switcher */}
          <div style={{ position:"relative" }} onClick={e=>e.stopPropagation()}>
            <button className="tp__balance-wrap" onClick={()=>setShowAccMenu(s=>!s)}
              style={{ background:"hsl(225,20%,15%)", border:"1px solid hsl(225,15%,22%)", borderRadius:9, padding:"5px 11px", cursor:"pointer", textAlign:"right", transition:"background 0.15s" }}>
              <span className="tp__balance-label" style={{ display:"flex", alignItems:"center", gap:4, justifyContent:"flex-end" }}>
                {accountType === "demo"
                  ? <><span style={{ width:6, height:6, borderRadius:"50%", background:"hsl(210,80%,60%)", display:"inline-block" }}/>Demo ▾</>
                  : <><span style={{ width:6, height:6, borderRadius:"50%", background:"hsl(145,60%,55%)", display:"inline-block" }}/>Real ▾</>
                }
              </span>
              <span className="tp__balance-val">{fmtBal(balance)}</span>
            </button>
            {showAccMenu && <AccountDropdown/>}
          </div>

          {/* Deposit button */}
          <button className="tp__deposit-btn" onClick={()=>{ user ? onNavigate("deposit") : onNavigate("register"); }}>
            <Icons.DollarSign size={13}/>
            <span>Deposit</span>
          </button>

          {/* Avatar / user menu */}
          <div style={{ position:"relative" }} onClick={e=>e.stopPropagation()}>
            <div className="tp__avatar" onClick={()=>setShowUserMenu(s=>!s)} style={{ cursor:"pointer", background: user ? "hsl(210,80%,55%)" : "hsl(225,20%,22%)", border: showUserMenu ? "2px solid var(--primary)" : "2px solid transparent", transition:"border 0.15s" }}>
              {user ? user.initials : <Icons.User size={14}/>}
            </div>
            {showUserMenu && <UserMenu/>}
          </div>
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div className="tp__body">
        {/* Left sidebar */}
        <aside className="tp__sidebar-left">
          <div style={{ width:36, height:36, borderRadius:9, overflow:"hidden", marginBottom:6, border:"2px solid hsl(225,15%,25%)", cursor:"pointer" }}>
            <div style={{ width:"100%", height:"100%", background:user?"hsl(210,80%,55%)":"linear-gradient(135deg,#667eea,#764ba2)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, color:"#fff" }}>
              {user ? user.initials : "?"}
            </div>
          </div>
          {SIDE_NAV.map((n,i)=>(
            <button key={i} title={n.label} className={`tp__sidebar-btn${i===0?" tp__sidebar-btn--active":""}`}>
              <span className="icon">{n.icon}</span>
              <span className="label">{n.label.substring(0,5)}</span>
            </button>
          ))}
          <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:6, padding:"8px 0" }}>
            <button onClick={()=>onNavigate("deposit")} style={{ width:38, height:38, borderRadius:"50%", background:"var(--primary)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Icons.DollarSign size={14} style={{ color:"hsl(230,25%,7%)" }}/>
            </button>
            <button style={{ width:38, height:38, borderRadius:"50%", background:"hsl(225,20%,18%)", border:"2px solid hsl(225,15%,26%)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:15, fontWeight:700, color:"hsl(230,10%,55%)" }}>?</span>
            </button>
          </div>
        </aside>

        {/* Chart */}
        <main className="tp__chart-wrap">
          <div className="tp__chart-topbar">
            <span className="tp__chart-time">{clockStr}</span>
            <div className="tp__chart-asset">
              <span style={{ fontSize:14 }}>{selectedAsset.emoji}</span>
              <span>{selectedAsset.name} {selectedAsset.payout}%</span>
              <span className="tp__chart-pct" style={{ color: pct>=0?"var(--green)":"var(--red)" }}>
                {pct>=0?"+":""}{pct.toFixed(2)}%
              </span>
            </div>
            {/* Account badge (desktop) */}
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, padding:"3px 10px", borderRadius:20, background:accountType==="demo"?"hsl(210,80%,55%,0.12)":"hsl(145,60%,40%,0.12)", border:`1px solid ${accountType==="demo"?"hsl(210,80%,55%,0.3)":"hsl(145,60%,40%,0.3)"}` }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:accountType==="demo"?"hsl(210,80%,60%)":"hsl(145,60%,55%)", display:"inline-block" }}/>
              <span style={{ fontSize:11, fontWeight:700, color:accountType==="demo"?"hsl(210,80%,70%)":"hsl(145,60%,65%)" }}>
                {accountType === "demo" ? "DEMO" : "REAL"} · {fmtBal(balance)}
              </span>
            </div>
          </div>

          <div className="tp__chart-canvas" ref={chartRef}>
            <CandlestickChart candles={candles} w={chartDims.w} h={chartDims.h} entryLines={entryLines} tradeTimer={tradeTimer}/>
            {activeTrades.some(t=>!t.resolved) && tradeTimer !== null && (
              <div style={{ position:"absolute", right:108, top:"50%", transform:"translateY(-50%) rotate(90deg)", fontSize:10, color:"hsl(230,10%,50%)", letterSpacing:2, pointerEvents:"none", whiteSpace:"nowrap" }}>
                Time remaining
              </div>
            )}
          </div>

          <div className="tp__view-trades-bar">
            <span style={{ fontSize:11, color:"hsl(230,10%,55%)", fontFamily:"monospace" }}>{clockStr}</span>
            <a href="#" onClick={e=>{e.preventDefault();setShowTradesSheet(true);}}>
              View open trades ({activeTrades.filter(t=>!t.resolved).length})
            </a>
          </div>

          <div className="tp__chart-toolbar">
            {TF_LABELS.map(tf=>(
              <button key={tf} className={`tp__tf-btn${activeTf===tf?" tp__tf-btn--active":""}`}
                onClick={()=>{ setActiveTf(tf); const map={"5s":0,"15s":1,"30s":2,"1m":3,"3m":4,"5m":5}; setTimeOption(TIME_OPTIONS[map[tf]??3]); }}>
                {tf}
              </button>
            ))}
            <div style={{ width:1, height:18, background:"hsl(225,15%,22%)", margin:"0 2px" }}/>
            {["⇅","△","✏","≋"].map(b=>(<button key={b} className="tp__tool-btn">{b}</button>))}
            <div style={{ marginLeft:"auto", display:"flex", gap:3 }}>
              <button className="tp__zoom-btn">−</button>
              <button className="tp__zoom-btn">+</button>
            </div>
          </div>
        </main>

        {/* Right panel */}
        <aside className="tp__panel">
          {/* Amount */}
          <div className="tp__panel-section">
            <div className="tp__panel-label">Amount</div>
            <div className="tp__spin">
              <button className="tp__spin-btn" onClick={()=>setAmount(a=>Math.max(1,a-10))}>−</button>
              <div className="tp__spin-val">
                <span>₹</span>
                <input type="number" value={amount} onChange={e=>setAmount(Math.max(1,+e.target.value||1))}/>
              </div>
              <button className="tp__spin-btn" onClick={()=>setAmount(a=>a+10)}>+</button>
            </div>
          </div>

          {/* Time */}
          <div className="tp__panel-section" style={{ marginTop:10 }} onClick={e=>e.stopPropagation()}>
            <div className="tp__panel-label">Time</div>
            <div style={{ position:"relative" }}>
              <div className="tp__spin">
                <button className="tp__spin-btn" onClick={()=>adjustTime("down")}>−</button>
                <div className="tp__spin-val" style={{ cursor:"pointer" }} onClick={()=>setShowTimeMenu(s=>!s)}>
                  <strong>{timeOption.label}</strong>
                </div>
                <button className="tp__spin-btn" onClick={()=>adjustTime("up")}>+</button>
              </div>
              {showTimeMenu && (
                <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:"hsl(225,22%,14%)", border:"1px solid hsl(225,15%,22%)", borderRadius:8, overflow:"hidden", zIndex:100 }}>
                  {TIME_OPTIONS.map(t=>(
                    <button key={t.secs} onClick={()=>{ setTimeOption(t); setShowTimeMenu(false); }}
                      style={{ width:"100%", padding:"8px 12px", border:"none", cursor:"pointer", textAlign:"left", background:t.secs===timeOption.secs?"hsl(47,90%,61%,0.12)":"none", color:t.secs===timeOption.secs?"var(--primary)":"#fff", fontSize:13, fontWeight:600 }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Earnings */}
          <div className="tp__earnings">
            <div className="tp__earnings-row">
              <span>Earnings</span>
              <span className="tp__earnings-pct">+{selectedAsset.payout}%</span>
            </div>
            <div className="tp__earnings-val">₹{(amount+earnings).toLocaleString("en-IN")}</div>
          </div>

          {/* Majority */}
          <div className="tp__majority">
            <div style={{ fontSize:10, color:"hsl(230,10%,50%)", marginBottom:5 }}>Majority opinion</div>
            <div className="tp__majority-bar">
              <div className="tp__majority-bar-up" style={{ width:`${majorityUp}%` }}/>
              <div className="tp__majority-bar-down"/>
            </div>
            <div className="tp__majority-labels">
              <span style={{ color:"var(--green)" }}>{Math.round(majorityUp)}%</span>
              <span style={{ color:"var(--red)" }}>{Math.round(100-majorityUp)}%</span>
            </div>
          </div>

          {/* UP / DOWN */}
          {accountType === "real" && balance < amount ? (
            <div style={{ margin:"0 12px 12px" }}>
              <div style={{ padding:"10px 12px", background:"hsl(0,65%,20%)", border:"1px solid hsl(0,65%,40%,0.4)", borderRadius:10, fontSize:12, color:"hsl(0,80%,75%)", textAlign:"center", marginBottom:8 }}>
                Insufficient real balance
              </div>
              <button onClick={()=>onNavigate("deposit")}
                style={{ width:"100%", height:42, borderRadius:10, background:"var(--primary)", border:"none", cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:14, color:"hsl(230,25%,8%)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <Icons.DollarSign size={14}/> Deposit Now
              </button>
            </div>
          ) : (
            <div className="tp__trade-btns">
              <button className="tp__btn-up"   onClick={()=>placeTrade("up")}><Icons.ArrowUp size={22}/></button>
              <button className="tp__btn-down" onClick={()=>placeTrade("down")}><Icons.ArrowDown size={22}/></button>
            </div>
          )}

          {/* Trade log */}
          {activeTrades.length > 0 && (
            <div className="tp__trades">
              <div className="tp__trades-title">Open Trades</div>
              {activeTrades.slice(0,6).map(t=>(
                <div key={t.id} className={`tp__trade-item tp__trade-item--${!t.resolved?"open":t.won?"win":"loss"}`}>
                  <div className="tp__trade-row">
                    <span className="tp__trade-name">{t.asset}</span>
                    <span style={{ color:t.direction==="up"?"var(--green)":"var(--red)", fontWeight:700 }}>
                      {t.direction==="up"?"↑":"↓"} ₹{t.amount}
                    </span>
                  </div>
                  {t.resolved
                    ? <div style={{ color:t.won?"var(--green)":"var(--red)", fontWeight:700, fontSize:12 }}>{t.won?`+₹${t.profit} ✓ Win!`:"✗ Loss"}</div>
                    : <div style={{ display:"flex", justifyContent:"space-between", color:"hsl(230,10%,50%)", fontSize:11 }}>
                        <span>⏱ {Math.max(0,Math.ceil((t.endTime-Date.now())/1000))}s</span>
                        <span>{fmt(t.entryPrice)}</span>
                      </div>
                  }
                </div>
              ))}
            </div>
          )}

          <div style={{ padding:"6px 12px 12px", display:"flex", justifyContent:"flex-end" }}>
            <button className="tp__cal-btn">
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="hsl(230,25%,7%)" strokeWidth={2.5}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
            </button>
          </div>
        </aside>
      </div>

      {/* ══ MOBILE BOTTOM ══ */}
      <div className="tp__mobile-bottom">
        <div className="tp__mobile-controls">
          <div className="tp__mobile-control">
            <div className="tp__mobile-control-label">Time</div>
            <div className="tp__mobile-spin">
              <button className="tp__mobile-spin-btn" onClick={()=>adjustTime("down")}>−</button>
              <span className="tp__mobile-spin-val">{timeOption.label}</span>
              <button className="tp__mobile-spin-btn" onClick={()=>adjustTime("up")}>+</button>
            </div>
          </div>
          <div className="tp__mobile-control">
            <div className="tp__mobile-control-label">Amount</div>
            <div className="tp__mobile-spin">
              <button className="tp__mobile-spin-btn" onClick={()=>setAmount(a=>Math.max(1,a-10))}>−</button>
              <input type="number" className="tp__mobile-spin-input" value={amount} onChange={e=>setAmount(Math.max(1,+e.target.value||1))}/>
              <button className="tp__mobile-spin-btn" onClick={()=>setAmount(a=>a+10)}>+</button>
            </div>
          </div>
        </div>

        <div className="tp__mobile-earnings">
          <div className="tp__mobile-earnings-left">
            <span className="tp__mobile-earnings-label">Earnings</span>
            <span className="tp__mobile-earnings-pct"><Icons.ArrowUp size={12}/> +{selectedAsset.payout}%</span>
          </div>
          <span className="tp__mobile-earnings-val">₹{(amount+earnings).toLocaleString("en-IN")}</span>
        </div>

        <div className="tp__mobile-majority">
          <div className="tp__majority-bar tp__mobile-majority-bar">
            <div className="tp__majority-bar-up" style={{ width:`${majorityUp}%` }}/>
            <div className="tp__majority-bar-down"/>
          </div>
          <div className="tp__mobile-majority-labels">
            <span style={{ color:"var(--green)" }}>{Math.round(majorityUp)}%</span>
            <span style={{ color:"var(--red)" }}>{Math.round(100-majorityUp)}%</span>
          </div>
        </div>

        {accountType === "real" && balance < amount ? (
          <div style={{ padding:"0 12px 10px" }}>
            <button onClick={()=>onNavigate("deposit")}
              style={{ width:"100%", height:52, borderRadius:12, background:"var(--primary)", border:"none", cursor:"pointer", fontFamily:"'Space Grotesk',sans-serif", fontWeight:800, fontSize:16, color:"hsl(230,25%,8%)", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <Icons.DollarSign size={18}/> Deposit to Trade
            </button>
          </div>
        ) : (
          <div className="tp__mobile-btns">
            <button className="tp__mobile-btn-up"   onClick={()=>placeTrade("up")}><Icons.ArrowUp size={26}/></button>
            <button className="tp__mobile-btn-down" onClick={()=>placeTrade("down")}><Icons.ArrowDown size={26}/></button>
          </div>
        )}
      </div>

      {/* Mobile trades sheet */}
      <div className={`tp__overlay${showTradesSheet?" open":""}`} onClick={()=>setShowTradesSheet(false)}/>
      <div className={`tp__trades-sheet${showTradesSheet?" open":""}`}>
        <div className="tp__trades-sheet-header">
          <span className="tp__trades-sheet-title">
            Open Trades
            {activeTrades.filter(t=>!t.resolved).length>0 && (
              <span style={{ marginLeft:8, padding:"2px 8px", background:"hsl(47,90%,61%,0.15)", color:"var(--primary)", borderRadius:999, fontSize:12 }}>
                {activeTrades.filter(t=>!t.resolved).length}
              </span>
            )}
          </span>
          <button className="tp__trades-sheet-close" onClick={()=>setShowTradesSheet(false)}>✕</button>
        </div>
        {activeTrades.length===0
          ? <div style={{ textAlign:"center", color:"hsl(230,10%,50%)", padding:"24px 0", fontSize:14 }}>No trades yet</div>
          : activeTrades.map(t=>(
            <div key={t.id} className={`tp__trade-item tp__trade-item--${!t.resolved?"open":t.won?"win":"loss"}`} style={{ marginBottom:8 }}>
              <div className="tp__trade-row">
                <span className="tp__trade-name">{t.asset}</span>
                <span style={{ color:t.direction==="up"?"var(--green)":"var(--red)", fontWeight:700 }}>{t.direction==="up"?"↑":"↓"} ₹{t.amount}</span>
              </div>
              {t.resolved
                ? <div style={{ color:t.won?"var(--green)":"var(--red)", fontWeight:700, fontSize:13 }}>{t.won?`+₹${t.profit} ✓ Win!`:"✗ Loss"}</div>
                : <div style={{ display:"flex", justifyContent:"space-between", color:"hsl(230,10%,50%)", fontSize:12 }}>
                    <span>⏱ {Math.max(0,Math.ceil((t.endTime-Date.now())/1000))}s remaining</span>
                    <span>Entry: {fmt(t.entryPrice)}</span>
                  </div>
              }
            </div>
          ))
        }
      </div>

      {/* Toast */}
      {notification && (
        <div className={`tp__toast tp__toast--${notification.won?"win":"loss"}`}>
          {notification.won ? `✅ +₹${notification.profit} Profit! Trade Won` : `❌ Trade Lost — ₹${notification.amount}`}
        </div>
      )}
    </div>
  );
}
export default TradingPage;
