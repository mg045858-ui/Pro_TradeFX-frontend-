import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icons } from "../../components/ui/Icons/Icons";
import { BrandLogo } from "../../components/ui/Logo/Logo";
import {
  apiAdminGetUsers, apiAdminGetTransactions,
  apiAdminApproveDeposit, apiAdminRejectDeposit,
  apiAdminSetBalance, apiAdminCredit, apiAdminGetStats,
} from "../../api";
import "./AdminPage.css";

const fmtINR  = n => "₹" + Number(n||0).toLocaleString("en-IN");
const fmtDate = s => new Date(s).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});

function Spin() {
  return <span style={{width:18,height:18,border:"2px solid transparent",borderTop:"2px solid currentColor",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>;
}

const STATUS_COLOR = { success:"hsl(145,60%,60%)", pending:"hsl(47,90%,65%)", processing:"hsl(210,80%,70%)", failed:"hsl(0,70%,65%)" };

/* ═══════════════════════════════════
   STATS STRIP
═══════════════════════════════════ */
function StatsStrip() {
  const [stats, setStats] = useState(null);
  useEffect(()=>{ apiAdminGetStats().then(setStats).catch(()=>{}); }, []);
  if (!stats) return null;
  return (
    <div className="ap__stats">
      {[
        { icon:"👥", label:"Total Users",    val:stats.totalUsers,              color:"hsl(210,80%,70%)" },
        { icon:"💰", label:"Total Deposited",val:fmtINR(stats.totalDeposits),   color:"hsl(145,60%,60%)" },
        { icon:"⏳", label:"Pending",         val:stats.pending,                 color:"hsl(47,90%,65%)"  },
        { icon:"🆕", label:"Today New Users", val:stats.todayUsers,              color:"var(--primary)"   },
      ].map(s=>(
        <div key={s.label} className="ap__stat-card">
          <div className="ap__stat-icon">{s.icon}</div>
          <div>
            <div className="ap__stat-val" style={{ color:s.color }}>{s.val}</div>
            <div className="ap__stat-label">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════
   USERS TAB
═══════════════════════════════════ */
function UsersTab() {
  const [users,   setUsers]   = useState([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);
  const [selected,setSelected]= useState(null);
  const [editBal, setEditBal] = useState({ real:"", demo:"", note:"" });
  const [creditData,setCreditData] = useState({ amount:"", account:"real", note:"" });
  const [msg,     setMsg]     = useState("");
  const [saving,  setSaving]  = useState(false);
  const [modal,   setModal]   = useState(null); // 'setbal' | 'credit'

  const load = useCallback(()=>{
    setLoading(true);
    apiAdminGetUsers(search).then(setUsers).catch(()=>{}).finally(()=>setLoading(false));
  }, [search]);

  useEffect(()=>{ const t=setTimeout(load,300); return()=>clearTimeout(t); }, [load]);

  const openSetBal = (u) => {
    setSelected(u);
    setEditBal({ real: String(u.realBalance), demo: String(u.demoBalance), note:"" });
    setMsg(""); setModal("setbal");
  };
  const openCredit = (u) => {
    setSelected(u);
    setCreditData({ amount:"", account:"real", note:"" });
    setMsg(""); setModal("credit");
  };

  const saveSetBal = async () => {
    setSaving(true); setMsg("");
    try {
      const res = await apiAdminSetBalance({ uid:selected.uid, real_balance:Number(editBal.real), demo_balance:Number(editBal.demo), note:editBal.note });
      setMsg("✅ Balance updated successfully!");
      setUsers(prev => prev.map(u => u.uid===selected.uid ? res.user : u));
      setSelected(res.user);
    } catch(e) { setMsg("❌ "+e.message); }
    finally { setSaving(false); }
  };

  const saveCredit = async () => {
    if (!creditData.amount || Number(creditData.amount)<=0) { setMsg("❌ Enter a valid amount."); return; }
    setSaving(true); setMsg("");
    try {
      const res = await apiAdminCredit({ uid:selected.uid, amount:Number(creditData.amount), account:creditData.account, note:creditData.note });
      setMsg(`✅ ₹${creditData.amount} credited to ${creditData.account} account!`);
      setUsers(prev => prev.map(u => u.uid===selected.uid ? res.user : u));
      setSelected(res.user);
    } catch(e) { setMsg("❌ "+e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="ap__tab-body">
      {/* Search */}
      <div style={{ padding:"0 0 16px", position:"relative" }}>
        <div style={{ display:"flex",alignItems:"center",background:"hsl(225,20%,14%)",border:"1px solid hsl(225,15%,22%)",borderRadius:11,padding:"0 14px",gap:10 }}>
          <Icons.User size={16} style={{ color:"hsl(230,10%,50%)",flexShrink:0 }}/>
          <input type="text" placeholder="Search users by name or email..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{ flex:1,background:"none",border:"none",outline:"none",color:"#fff",height:46,fontSize:14 }}/>
        </div>
      </div>

      {loading && <div style={{ textAlign:"center",padding:"40px",color:"hsl(230,10%,50%)" }}><Spin/></div>}

      {/* User table */}
      <div className="ap__table-wrap">
        <table className="ap__table">
          <thead>
            <tr>
              <th>User</th>
              <th>Real Balance</th>
              <th>Demo Balance</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u=>u.role!=="admin").map(u=>(
              <tr key={u.uid}>
                <td>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:34,height:34,borderRadius:"50%",background:"hsl(210,80%,55%)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,flexShrink:0 }}>{u.initials}</div>
                    <div>
                      <div style={{ fontWeight:700,fontSize:13 }}>{u.name}</div>
                      <div style={{ fontSize:11,color:"hsl(230,10%,50%)" }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:u.realBalance>0?"hsl(145,60%,60%)":"hsl(230,10%,50%)" }}>{fmtINR(u.realBalance)}</td>
                <td style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:"hsl(210,80%,65%)" }}>{fmtINR(u.demoBalance)}</td>
                <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:u.accountType==="real"?"hsl(145,60%,40%,0.15)":"hsl(210,80%,55%,0.12)",color:u.accountType==="real"?"hsl(145,60%,65%)":"hsl(210,80%,70%)" }}>{u.accountType}</span></td>
                <td style={{ fontSize:11,color:"hsl(230,10%,50%)" }}>{fmtDate(u.createdAt)}</td>
                <td>
                  <div style={{ display:"flex",gap:6 }}>
                    <button onClick={()=>openCredit(u)} className="ap__action-btn ap__action-btn--green">+ Credit</button>
                    <button onClick={()=>openSetBal(u)} className="ap__action-btn ap__action-btn--blue">Set Balance</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && users.filter(u=>u.role!=="admin").length===0 && (
          <div style={{ textAlign:"center",padding:"40px",color:"hsl(230,10%,50%)" }}>No users found</div>
        )}
      </div>

      {/* Modal */}
      {modal && selected && (
        <div className="ap__modal-overlay" onClick={()=>setModal(null)}>
          <div className="ap__modal" onClick={e=>e.stopPropagation()}>
            <div className="ap__modal-header">
              <div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:17 }}>
                  {modal==="setbal" ? "Set Balance" : "Credit Funds"}
                </div>
                <div style={{ fontSize:13,color:"hsl(230,10%,55%)" }}>{selected.name} · {selected.email}</div>
              </div>
              <button onClick={()=>setModal(null)} style={{ background:"none",border:"none",cursor:"pointer",color:"hsl(230,10%,60%)",fontSize:20,lineHeight:1 }}>✕</button>
            </div>

            {msg && (
              <div style={{ padding:"10px 14px",margin:"0 20px 12px",borderRadius:9,fontSize:13,background:msg.startsWith("✅")?"hsl(145,60%,18%)":"hsl(0,65%,18%)",border:`1px solid ${msg.startsWith("✅")?"hsl(145,60%,35%)":"hsl(0,65%,35%)"}`,color:msg.startsWith("✅")?"hsl(145,60%,70%)":"hsl(0,80%,78%)" }}>{msg}</div>
            )}

            <div className="ap__modal-body">
              {modal==="setbal" && (<>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14 }}>
                  {/* Current */}
                  <div style={{ background:"hsl(225,20%,15%)",borderRadius:10,padding:"12px 14px",border:"1px solid hsl(225,15%,22%)" }}>
                    <div style={{ fontSize:10,color:"hsl(230,10%,50%)",marginBottom:4,fontWeight:600,textTransform:"uppercase" }}>Current Real</div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:18,color:"hsl(145,60%,60%)" }}>{fmtINR(selected.realBalance)}</div>
                  </div>
                  <div style={{ background:"hsl(225,20%,15%)",borderRadius:10,padding:"12px 14px",border:"1px solid hsl(225,15%,22%)" }}>
                    <div style={{ fontSize:10,color:"hsl(230,10%,50%)",marginBottom:4,fontWeight:600,textTransform:"uppercase" }}>Current Demo</div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:18,color:"hsl(210,80%,70%)" }}>{fmtINR(selected.demoBalance)}</div>
                  </div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                  <div>
                    <label style={{ fontSize:12,color:"var(--muted-fg)",display:"block",marginBottom:6,fontWeight:600 }}>New Real Balance (₹)</label>
                    <input type="number" value={editBal.real} min={0} onChange={e=>setEditBal({...editBal,real:e.target.value})} placeholder="0"
                      style={{ width:"100%",background:"hsl(225,20%,17%)",border:"1.5px solid hsl(225,15%,24%)",borderRadius:9,padding:"12px 14px",color:"#fff",fontSize:16,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,outline:"none" }}/>
                  </div>
                  <div>
                    <label style={{ fontSize:12,color:"var(--muted-fg)",display:"block",marginBottom:6,fontWeight:600 }}>New Demo Balance (₹)</label>
                    <input type="number" value={editBal.demo} min={0} onChange={e=>setEditBal({...editBal,demo:e.target.value})} placeholder="10000"
                      style={{ width:"100%",background:"hsl(225,20%,17%)",border:"1.5px solid hsl(225,15%,24%)",borderRadius:9,padding:"12px 14px",color:"#fff",fontSize:16,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,outline:"none" }}/>
                  </div>
                  <div>
                    <label style={{ fontSize:12,color:"var(--muted-fg)",display:"block",marginBottom:6,fontWeight:600 }}>Note (optional)</label>
                    <input type="text" value={editBal.note} onChange={e=>setEditBal({...editBal,note:e.target.value})} placeholder="e.g. Manual adjustment"
                      style={{ width:"100%",background:"hsl(225,20%,17%)",border:"1.5px solid hsl(225,15%,24%)",borderRadius:9,padding:"12px 14px",color:"#fff",fontSize:14,outline:"none" }}/>
                  </div>
                </div>
                <button onClick={saveSetBal} disabled={saving}
                  style={{ width:"100%",marginTop:16,height:48,borderRadius:10,background:"var(--primary)",border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:15,color:"hsl(230,25%,8%)",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                  {saving ? <><Spin/>Saving...</> : "💾 Update Balance"}
                </button>
              </>)}

              {modal==="credit" && (<>
                <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                  <div>
                    <label style={{ fontSize:12,color:"var(--muted-fg)",display:"block",marginBottom:6,fontWeight:600 }}>Amount to Credit (₹)</label>
                    <input type="number" value={creditData.amount} min={1} onChange={e=>setCreditData({...creditData,amount:e.target.value})} placeholder="Enter amount"
                      style={{ width:"100%",background:"hsl(225,20%,17%)",border:"1.5px solid hsl(225,15%,24%)",borderRadius:9,padding:"12px 14px",color:"#fff",fontSize:20,fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,outline:"none" }}/>
                  </div>
                  <div>
                    <label style={{ fontSize:12,color:"var(--muted-fg)",display:"block",marginBottom:8,fontWeight:600 }}>Credit to Account</label>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                      {["real","demo"].map(acc=>(
                        <button key={acc} onClick={()=>setCreditData({...creditData,account:acc})}
                          style={{ height:46,borderRadius:9,border:`1.5px solid ${creditData.account===acc?"var(--primary)":"hsl(225,15%,22%)"}`,background:creditData.account===acc?"hsl(47,90%,61%,0.1)":"hsl(225,20%,16%)",cursor:"pointer",color:creditData.account===acc?"var(--primary)":"hsl(230,10%,65%)",fontWeight:700,fontSize:14,textTransform:"capitalize" }}>
                          {acc==="real"?"💰 Real":"🎮 Demo"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize:12,color:"var(--muted-fg)",display:"block",marginBottom:6,fontWeight:600 }}>Reason / Note</label>
                    <input type="text" value={creditData.note} onChange={e=>setCreditData({...creditData,note:e.target.value})} placeholder="e.g. Deposit approved, bonus, etc."
                      style={{ width:"100%",background:"hsl(225,20%,17%)",border:"1.5px solid hsl(225,15%,24%)",borderRadius:9,padding:"12px 14px",color:"#fff",fontSize:14,outline:"none" }}/>
                  </div>
                </div>
                <button onClick={saveCredit} disabled={saving}
                  style={{ width:"100%",marginTop:16,height:48,borderRadius:10,background:"hsl(145,65%,38%)",border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:15,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 18px hsl(145,65%,38%,0.3)" }}>
                  {saving ? <><Spin/>Processing...</> : `✅ Credit ₹${creditData.amount||"0"} to ${creditData.account}`}
                </button>
              </>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   TRANSACTIONS TAB
═══════════════════════════════════ */
function TransactionsTab() {
  const [txns,    setTxns]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("processing");
  const [typeFilter, setTypeFilter] = useState("deposit");
  const [actioning, setActioning] = useState(null);
  const [msg,     setMsg]     = useState("");

  const load = useCallback(()=>{
    setLoading(true);
    apiAdminGetTransactions({ status: filter==="all"?undefined:filter, type: typeFilter==="all"?undefined:typeFilter })
      .then(setTxns).catch(()=>{}).finally(()=>setLoading(false));
  }, [filter, typeFilter]);

  useEffect(()=>load(), [load]);

  const approve = async (txid) => {
    setActioning(txid);
    try {
      await apiAdminApproveDeposit(txid);
      setMsg(`✅ Deposit ${txid} approved and balance credited.`);
      load();
    } catch(e) { setMsg("❌ "+e.message); }
    finally { setActioning(null); setTimeout(()=>setMsg(""),4000); }
  };

  const reject = async (txid) => {
    const reason = prompt("Reason for rejection (optional):");
    if (reason===null) return;
    setActioning(txid);
    try {
      await apiAdminRejectDeposit(txid, reason);
      setMsg(`✅ Deposit ${txid} rejected.`);
      load();
    } catch(e) { setMsg("❌ "+e.message); }
    finally { setActioning(null); setTimeout(()=>setMsg(""),4000); }
  };

  return (
    <div className="ap__tab-body">
      {/* Filters */}
      <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" }}>
        {["processing","pending","success","failed","all"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:"7px 16px",borderRadius:20,border:"1px solid hsl(225,15%,22%)",background:filter===f?"hsl(225,20%,18%)":"none",color:filter===f?"#fff":"hsl(230,10%,60%)",fontSize:12,fontWeight:600,cursor:"pointer" }}>
            {f}
          </button>
        ))}
        <div style={{ width:1,height:32,background:"hsl(225,15%,22%)",margin:"0 4px" }}/>
        {["deposit","withdraw","all"].map(f=>(
          <button key={f} onClick={()=>setTypeFilter(f)}
            style={{ padding:"7px 16px",borderRadius:20,border:`1px solid ${typeFilter===f?"var(--primary)":"hsl(225,15%,22%)"}`,background:typeFilter===f?"hsl(47,90%,61%,0.1)":"none",color:typeFilter===f?"var(--primary)":"hsl(230,10%,60%)",fontSize:12,fontWeight:600,cursor:"pointer" }}>
            {f}
          </button>
        ))}
        <button onClick={load} style={{ marginLeft:"auto",padding:"7px 14px",borderRadius:20,border:"1px solid hsl(225,15%,22%)",background:"none",color:"hsl(230,10%,60%)",fontSize:12,cursor:"pointer" }}>🔄 Refresh</button>
      </div>

      {msg && <div style={{ padding:"10px 14px",marginBottom:12,borderRadius:9,fontSize:13,background:msg.startsWith("✅")?"hsl(145,60%,18%)":"hsl(0,65%,18%)",border:`1px solid ${msg.startsWith("✅")?"hsl(145,60%,35%)":"hsl(0,65%,35%)"}`,color:msg.startsWith("✅")?"hsl(145,60%,70%)":"hsl(0,80%,78%)" }}>{msg}</div>}

      {loading && <div style={{ textAlign:"center",padding:"40px",color:"hsl(230,10%,50%)" }}><Spin/></div>}

      <div className="ap__table-wrap">
        <table className="ap__table">
          <thead>
            <tr>
              <th>User</th>
              <th>TxID</th>
              <th>Amount</th>
              <th>Method</th>
              <th>UTR</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {txns.map(tx=>(
              <tr key={tx.id}>
                <td>
                  <div style={{ fontWeight:700,fontSize:13 }}>{tx.user_name}</div>
                  <div style={{ fontSize:11,color:"hsl(230,10%,50%)" }}>{tx.user_email}</div>
                </td>
                <td><code style={{ fontSize:11,color:"hsl(210,80%,70%)" }}>{tx.txid}</code></td>
                <td style={{ fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,color:tx.type==="deposit"?"hsl(145,60%,60%)":"hsl(0,70%,65%)" }}>
                  {tx.type==="deposit"?"+":"−"}{fmtINR(tx.amount)}
                </td>
                <td>{tx.method||"—"}</td>
                <td><code style={{ fontSize:11,color:tx.utr?"hsl(47,90%,70%)":"hsl(230,10%,40%)" }}>{tx.utr||"—"}</code></td>
                <td style={{ fontSize:11,color:"hsl(230,10%,50%)" }}>{fmtDate(tx.created_at)}</td>
                <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:`${STATUS_COLOR[tx.status]||"hsl(230,10%,50%)"}22`,color:STATUS_COLOR[tx.status]||"hsl(230,10%,60%)" }}>{tx.status}</span></td>
                <td>
                  {(tx.status==="processing"||tx.status==="pending") && tx.type==="deposit" && (
                    <div style={{ display:"flex",gap:6 }}>
                      <button onClick={()=>approve(tx.txid)} disabled={actioning===tx.txid}
                        className="ap__action-btn ap__action-btn--green">
                        {actioning===tx.txid?<Spin/>:"✓ Approve"}
                      </button>
                      <button onClick={()=>reject(tx.txid)} disabled={actioning===tx.txid}
                        className="ap__action-btn ap__action-btn--red">
                        ✗ Reject
                      </button>
                    </div>
                  )}
                  {tx.status==="success"&&<span style={{ fontSize:12,color:"hsl(145,60%,55%)" }}>Completed</span>}
                  {tx.status==="failed" &&<span style={{ fontSize:12,color:"hsl(0,70%,55%)" }}>Rejected</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && txns.length===0 && <div style={{ textAlign:"center",padding:"40px",color:"hsl(230,10%,50%)" }}>No transactions found</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   MAIN ADMIN PAGE
═══════════════════════════════════ */
export function AdminPage({ onNavigate }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("transactions");

  if (!user || user.role !== "admin") {
    return (
      <div style={{ height:"100dvh",background:"hsl(225,20%,8%)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:64,marginBottom:20 }}>🔐</div>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif",marginBottom:12 }}>Admin Access Only</h2>
          <button onClick={()=>onNavigate("login")} style={{ padding:"12px 28px",borderRadius:10,background:"var(--primary)",border:"none",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:"hsl(230,25%,8%)",fontSize:15 }}>Go to Login</button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id:"transactions", label:"💳 Deposits & Withdrawals" },
    { id:"users",        label:"👥 Users & Balances" },
  ];

  return (
    <div className="ap">
      {/* Header */}
      <header className="ap__header">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <BrandLogo size="sm" />
          <div style={{
            padding:"3px 10px", borderRadius:6,
            background:"rgba(200,168,75,.15)", border:"1px solid rgba(200,168,75,.3)",
            fontSize:11, fontWeight:700, color:"#c8a84b", letterSpacing:".08em", textTransform:"uppercase"
          }}>Admin</div>
          <div style={{ fontSize:11, color:"hsl(230,10%,50%)", marginLeft:2 }}>· {user.name}</div>
        </div>
        <div style={{ display:"flex",gap:8,marginLeft:"auto" }}>
          <button onClick={()=>onNavigate("trading")}
            style={{ padding:"8px 16px",borderRadius:9,background:"hsl(225,20%,17%)",border:"1px solid hsl(225,15%,24%)",cursor:"pointer",color:"hsl(230,10%,70%)",fontSize:13,fontWeight:600 }}>
            → Trading
          </button>
          <button onClick={()=>{ logout(); onNavigate("login"); }}
            style={{ padding:"8px 16px",borderRadius:9,background:"hsl(0,65%,20%)",border:"1px solid hsl(0,65%,35%)",cursor:"pointer",color:"hsl(0,80%,75%)",fontSize:13,fontWeight:600 }}>
            Logout
          </button>
        </div>
      </header>

      <div className="ap__body">
        <StatsStrip/>

        {/* Tab bar */}
        <div style={{ display:"flex",background:"hsl(225,22%,12%)",border:"1px solid hsl(225,15%,18%)",borderRadius:12,padding:4,gap:4,marginBottom:20 }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ flex:1,height:42,borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:13,background:tab===t.id?"hsl(225,22%,19%)":"none",color:tab===t.id?"#fff":"hsl(230,10%,55%)",transition:"all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab==="transactions" && <TransactionsTab/>}
        {tab==="users"        && <UsersTab/>}
      </div>
    </div>
  );
}
export default AdminPage;
