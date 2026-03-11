import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { Icons } from "../../components/ui/Icons/Icons";
import { BrandLogo } from "../../components/ui/Logo/Logo";
import {
  apiInitiateDeposit,
  apiConfirmDeposit,
  apiGetTransactions,
} from "../../api";
import "./DepositPage.css";

/* ═══════════════════════════════════
   HELPERS
═══════════════════════════════════ */
const fmtINR = (n) => "₹" + Number(n).toLocaleString("en-IN");
const fmtDate = (s) =>
  new Date(s).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ═══════════════════════════════════
   CONSTANTS
═══════════════════════════════════ */
const DEP_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000, 50000, 100000];
const WD_AMOUNTS = [500, 1000, 2000, 5000];

const DEP_METHODS = [
  {
    id: "upi",
    icon: "📱",
    name: "UPI",
    subtext: "Any UPI app",
    time: "Instant",
    min: 100,
    qr: true,
  },
  {
    id: "gpay",
    icon: "🔵",
    name: "Google Pay",
    subtext: "GPay UPI",
    time: "Instant",
    min: 100,
    qr: true,
  },
  {
    id: "paytm",
    icon: "🟦",
    name: "Paytm",
    subtext: "Paytm UPI",
    time: "Instant",
    min: 100,
    qr: true,
  },
  {
    id: "phonepe",
    icon: "🟣",
    name: "PhonePe",
    subtext: "PhonePe UPI",
    time: "Instant",
    min: 100,
    qr: true,
  },
  {
    id: "card",
    icon: "💳",
    name: "Card",
    subtext: "Visa/Mastercard",
    time: "Instant",
    min: 500,
    qr: false,
  },
  {
    id: "netbank",
    icon: "🏦",
    name: "Net Banking",
    subtext: "All banks",
    time: "Instant",
    min: 500,
    qr: false,
  },
];

const WD_METHODS = [
  { id: "upi", icon: "📱", name: "UPI", time: "Instant", min: 200 },
  { id: "bank", icon: "🏦", name: "Bank Transfer", time: "1-3 days", min: 500 },
  { id: "paytm", icon: "🟦", name: "Paytm", time: "Instant", min: 200 },
];

/* ═══════════════════════════════════
   SHARED COMPONENTS
═══════════════════════════════════ */
function Spin() {
  return (
    <span
      style={{
        width: 20,
        height: 20,
        border: "2.5px solid transparent",
        borderTop: "2.5px solid currentColor",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function SLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "hsl(230,10%,50%)",
        textTransform: "uppercase",
        letterSpacing: ".6px",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════
   WITHDRAW CONDITIONS ENGINE
   — conditions scale with realBalance
═══════════════════════════════════ */
function getWithdrawConditions(realBal) {
  const conds = [];

  // Tier 1 — everyone
  conds.push({
    id: "gst",
    icon: "🏛️",
    badge: "MANDATORY",
    badgeColor: "hsl(210,80%,62%)",
    title: "GST Charge (18%)",
    desc: "Government tax on all financial withdrawals as per GST Act. Must be paid before withdrawal is processed.",
    amount: 249,
  });

  // Tier 2 — balance ≥ ₹1,000
  if (realBal >= 1000)
    conds.push({
      id: "platform",
      icon: "⚙️",
      badge: "SERVICE FEE",
      badgeColor: "hsl(47,90%,58%)",
      title: "Platform Processing Fee",
      desc: "Service charge for processing your withdrawal request via our secure payment gateway.",
      amount: 99,
    });

  // Tier 3 — balance ≥ ₹5,000
  if (realBal >= 5000)
    conds.push({
      id: "activation",
      icon: "🔐",
      badge: "ACTIVATION",
      badgeColor: "hsl(0,75%,62%)",
      title: "Trading Account Activation",
      desc: "Required for withdrawals from accounts with balance ≥ ₹5,000. One-time fee unlocks all future withdrawals.",
      amount: 499,
    });

  // Tier 4 — balance ≥ ₹15,000
  if (realBal >= 15000)
    conds.push({
      id: "sebi",
      icon: "📜",
      badge: "COMPLIANCE",
      badgeColor: "hsl(280,65%,68%)",
      title: "SEBI Compliance Verification",
      desc: "Mandatory regulatory fee for accounts holding ≥ ₹15,000. Required by law before any fund release.",
      amount: 999,
    });

  // Tier 5 — balance ≥ ₹30,000
  if (realBal >= 30000)
    conds.push({
      id: "security",
      icon: "🛡️",
      badge: "HIGH VALUE",
      badgeColor: "hsl(145,60%,52%)",
      title: "Security Verification Deposit",
      desc: "Refundable security deposit for high-value accounts (≥ ₹30,000). Returned within 24 hrs after identity verification.",
      amount: 2499,
    });

  return conds;
}

/* ═══════════════════════════════════
   PAY CHARGE MODAL
   Opens as bottom-sheet when user
   clicks "Pay Now" on a charge row
═══════════════════════════════════ */
function PayChargeModal({ cond, onPaid, onClose }) {
  const [step, setStep] = useState(1); // 1=info  2=utr  3=done
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirmPay = async () => {
    if (utr.trim().length < 8) {
      setError("Enter a valid UTR / Reference number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Replace with your real charge-payment API call if needed
      await apiConfirmDeposit({ txid: "CHARGE_" + cond.id, utr });
      setStep(3);
      setTimeout(() => onPaid(cond.id), 900);
    } catch (e) {
      setError(e.message || "Verification failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "hsl(225,25%,9%)",
          borderRadius: "22px 22px 0 0",
          border: "1.5px solid hsl(225,15%,20%)",
          borderBottom: "none",
          animation: "slideUpModal 0.28s cubic-bezier(.22,1,.36,1)",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        {/* drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 4,
              background: "hsl(225,15%,28%)",
            }}
          />
        </div>

        {/* modal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 22px 16px",
            borderBottom: "1px solid hsl(225,15%,16%)",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              flexShrink: 0,
              background: `${cond.badgeColor}20`,
              border: `1.5px solid ${cond.badgeColor}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            {cond.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: "#fff",
                marginBottom: 4,
              }}
            >
              {cond.title}
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: ".9px",
                padding: "2px 8px",
                borderRadius: 20,
                background: `${cond.badgeColor}22`,
                color: cond.badgeColor,
                border: `1px solid ${cond.badgeColor}44`,
              }}
            >
              {cond.badge}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid hsl(225,15%,26%)",
              background: "hsl(225,20%,16%)",
              cursor: "pointer",
              color: "hsl(230,10%,55%)",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "20px 22px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "hsl(0,65%,18%)",
                border: "1px solid hsl(0,65%,35%)",
                borderRadius: 9,
                fontSize: 13,
                color: "hsl(0,80%,78%)",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* ── STEP 3: success ── */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "28px 0" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "hsl(145,60%,35%,0.14)",
                  border: "2px solid hsl(145,60%,45%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  margin: "0 auto 16px",
                  animation: "pulseGreen 1.8s infinite",
                }}
              >
                ✅
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 18,
                  color: "hsl(145,60%,65%)",
                  marginBottom: 8,
                }}
              >
                Payment Submitted!
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "hsl(230,10%,55%)",
                  lineHeight: 1.7,
                }}
              >
                UTR <strong style={{ color: "#fff" }}>{utr}</strong> received.
                <br />
                Verifying your payment…
              </div>
            </div>
          )}

          {/* ── STEP 1 & 2 ── */}
          {step !== 3 && (
            <>
              {/* amount + UPI box */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: "hsl(225,20%,13%)",
                  border: "1.5px solid hsl(225,15%,21%)",
                  borderRadius: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "hsl(230,10%,50%)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: ".5px",
                      marginBottom: 5,
                    }}
                  >
                    Amount to Pay
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 30,
                      color: cond.badgeColor,
                    }}
                  >
                    {fmtINR(cond.amount)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: "hsl(230,10%,50%)",
                      marginBottom: 5,
                    }}
                  >
                    Pay to UPI ID
                  </div>
                  <code
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      color: "#fff",
                      letterSpacing: 0.5,
                    }}
                  >
                    tradex@upi
                  </code>
                  <div style={{ marginTop: 5 }}>
                    <button
                      onClick={() =>
                        navigator.clipboard?.writeText("tradex@upi")
                      }
                      style={{
                        padding: "3px 10px",
                        borderRadius: 6,
                        background: "hsl(225,20%,22%)",
                        border: "1px solid hsl(225,15%,30%)",
                        cursor: "pointer",
                        color: "hsl(230,10%,65%)",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* how-to instructions */}
              <div
                style={{
                  background: "hsl(47,80%,10%)",
                  border: "1px solid hsl(47,80%,25%)",
                  borderRadius: 12,
                  padding: "13px 16px",
                  fontSize: 12,
                  color: "hsl(230,10%,60%)",
                  lineHeight: 1.75,
                }}
              >
                💳{" "}
                <strong style={{ color: "hsl(47,90%,72%)" }}>
                  How to pay:
                </strong>
                <br />
                1. Open GPay / PhonePe / Paytm
                <br />
                2. Send{" "}
                <strong style={{ color: "#fff" }}>
                  {fmtINR(cond.amount)}
                </strong>{" "}
                to <strong style={{ color: "#fff" }}>tradex@upi</strong>
                <br />
                3. Copy the UTR / Transaction ID and enter below
              </div>

              {/* STEP 1: I've Paid button */}
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  style={{
                    height: 52,
                    borderRadius: 12,
                    background: `linear-gradient(135deg,${cond.badgeColor},${cond.badgeColor}bb)`,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 800,
                    fontSize: 15,
                    color: "hsl(225,25%,8%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow: `0 6px 24px ${cond.badgeColor}44`,
                  }}
                >
                  💳 I've Paid — Enter UTR Number
                </button>
              )}

              {/* STEP 2: UTR entry */}
              {step === 2 && (
                <>
                  <div
                    style={{
                      background: "hsl(225,20%,13%)",
                      border: "1px solid hsl(225,15%,20%)",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "hsl(230,10%,50%)",
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: ".5px",
                      }}
                    >
                      UTR / Reference Number
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 423198765432"
                      value={utr}
                      onChange={(e) =>
                        setUtr(e.target.value.replace(/\D/g, "").slice(0, 16))
                      }
                      style={{
                        width: "100%",
                        background: "hsl(225,20%,18%)",
                        border: `1.5px solid ${utr.length > 0 ? cond.badgeColor : "hsl(225,15%,24%)"}`,
                        borderRadius: 10,
                        padding: "14px 16px",
                        color: "#fff",
                        fontSize: 18,
                        fontWeight: 700,
                        letterSpacing: 2,
                        outline: "none",
                        textAlign: "center",
                        transition: "border-color 0.2s",
                      }}
                    />
                    <div
                      style={{
                        fontSize: 11,
                        color: "hsl(230,10%,48%)",
                        marginTop: 8,
                        textAlign: "center",
                      }}
                    >
                      GPay → UPI Txn ID · PhonePe → Transaction ID · Paytm → UTR
                      No.
                    </div>
                  </div>

                  <button
                    onClick={confirmPay}
                    disabled={loading || utr.length < 8}
                    style={{
                      height: 52,
                      borderRadius: 12,
                      background:
                        "linear-gradient(135deg,hsl(145,70%,42%),hsl(145,62%,34%))",
                      border: "none",
                      cursor:
                        loading || utr.length < 8 ? "not-allowed" : "pointer",
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      boxShadow: "0 4px 20px hsl(145,70%,40%,0.3)",
                      opacity: utr.length < 8 ? 0.5 : 1,
                    }}
                  >
                    {loading ? (
                      <>
                        <Spin />
                        Verifying…
                      </>
                    ) : (
                      <>✅ Submit UTR & Confirm Payment</>
                    )}
                  </button>

                  <button
                    onClick={() => setStep(1)}
                    style={{
                      height: 42,
                      borderRadius: 10,
                      background: "none",
                      border: "1px solid hsl(225,15%,24%)",
                      cursor: "pointer",
                      color: "hsl(230,10%,60%)",
                      fontSize: 13,
                    }}
                  >
                    ← Back
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   DEPOSIT TAB
═══════════════════════════════════ */
function DepositTab({ user, onRefresh }) {
  const [step, setStep] = useState(1); // 1=select, 2=QR/pay, 3=confirm, 4=done
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState("1000");
  const [method, setMethod] = useState("upi");
  const [txid, setTxid] = useState("");
  const [qrData, setQrData] = useState(null);
  const [utr, setUtr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Card fields
  const [cardNo, setCardNo] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  // Bank fields
  const [bank, setBank] = useState("SBI");

  const selM = DEP_METHODS.find((m) => m.id === method);
  const bonus =
    amount >= 5000
      ? Math.round(amount * 0.1)
      : amount >= 1000
        ? Math.round(amount * 0.05)
        : 0;
  const total = amount + bonus;

  const initiate = async () => {
    setError("");
    if (!user) {
      setError("Please login first.");
      return;
    }
    if (amount < (selM?.min || 100)) {
      setError(`Minimum ₹${selM?.min} for ${selM?.name}`);
      return;
    }
    setLoading(true);
    try {
      const res = await apiInitiateDeposit({ amount, method });
      setTxid(res.txid);
      setQrData(res.qrData);
      setStep(selM?.qr ? 2 : 3);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmUTR = async () => {
    if (!utr.trim()) {
      setError("Enter UTR/Reference number.");
      return;
    }
    setLoading(true);
    try {
      await apiConfirmDeposit({ txid, utr });
      setStep(4);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 4)
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "hsl(145,60%,40%,0.14)",
            border: "2px solid hsl(145,60%,45%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            margin: "0 auto 22px",
            animation: "pulseGreen 1.8s infinite",
          }}
        >
          ✅
        </div>
        <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
          Payment Submitted!
        </h3>
        <p
          style={{
            color: "hsl(230,10%,55%)",
            fontSize: 14,
            lineHeight: 1.7,
            marginBottom: 8,
          }}
        >
          Your UTR <strong style={{ color: "var(--primary)" }}>{utr}</strong>{" "}
          has been received.
          <br />
          Admin will verify and credit{" "}
          <strong style={{ color: "hsl(145,60%,60%)" }}>
            {fmtINR(total)}
          </strong>{" "}
          within minutes.
        </p>
        <div
          style={{
            margin: "20px 0",
            padding: "14px 18px",
            background: "hsl(47,90%,61%,0.08)",
            border: "1px solid hsl(47,90%,61%,0.2)",
            borderRadius: 10,
            fontSize: 13,
            color: "hsl(230,10%,65%)",
          }}
        >
          📋 Transaction ID: <strong style={{ color: "#fff" }}>{txid}</strong>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              setStep(1);
              setUtr("");
              setQrData(null);
              setTxid("");
              setError("");
            }}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              background: "none",
              border: "1px solid hsl(225,15%,26%)",
              cursor: "pointer",
              color: "hsl(230,10%,65%)",
              fontWeight: 600,
            }}
          >
            New Deposit
          </button>
          <button
            onClick={onRefresh}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              background: "var(--primary)",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              color: "hsl(230,25%,8%)",
              fontSize: 14,
            }}
          >
            View History
          </button>
        </div>
      </div>
    );

  return (
    <div
      style={{
        padding: "20px 24px 28px",
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {["Select Amount", "Pay", "Confirm"].map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background:
                    step > i + 1
                      ? "var(--primary)"
                      : step === i + 1
                        ? "hsl(47,90%,61%,0.2)"
                        : "hsl(225,20%,18%)",
                  border:
                    step === i + 1
                      ? "1.5px solid var(--primary)"
                      : "1.5px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color: step > i + 1 ? "hsl(230,25%,8%)" : "hsl(230,10%,60%)",
                  transition: "all 0.3s",
                  flexShrink: 0,
                }}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: step === i + 1 ? "#fff" : "hsl(230,10%,50%)",
                  fontWeight: step === i + 1 ? 700 : 400,
                  whiteSpace: "nowrap",
                }}
              >
                {s}
              </span>
            </div>
            {i < 2 && (
              <div
                style={{ flex: 1, height: 1, background: "hsl(225,15%,20%)" }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            background: "hsl(0,65%,18%)",
            border: "1px solid hsl(0,65%,35%)",
            borderRadius: 9,
            fontSize: 13,
            color: "hsl(0,80%,78%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* ── STEP 1: Select amount & method ── */}
      {step === 1 && (
        <>
          {!user && (
            <div
              style={{
                padding: "14px 18px",
                background: "hsl(210,80%,50%,0.1)",
                border: "1px solid hsl(210,80%,50%,0.25)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span style={{ fontSize: 24 }}>👤</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>Sign in to deposit</div>
                <div style={{ fontSize: 12, color: "hsl(230,10%,55%)" }}>
                  Create a free account to fund your real trading balance.
                </div>
              </div>
            </div>
          )}

          <div>
            <SLabel>Select Amount</SLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {DEP_AMOUNTS.map((v) => (
                <button
                  key={v}
                  onClick={() => {
                    setAmount(v);
                    setCustom(String(v));
                  }}
                  style={{
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${amount === v ? "var(--primary)" : "hsl(225,15%,22%)"}`,
                    background:
                      amount === v ? "hsl(47,90%,61%,0.1)" : "hsl(225,20%,15%)",
                    cursor: "pointer",
                    color: amount === v ? "var(--primary)" : "hsl(230,10%,75%)",
                    fontWeight: 700,
                    fontSize: 12,
                    transition: "all 0.15s",
                  }}
                >
                  {fmtINR(v)}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                background: "hsl(225,20%,15%)",
                border: "1.5px solid hsl(225,15%,24%)",
                borderRadius: 11,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  padding: "0 14px",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--primary)",
                  height: 52,
                  display: "flex",
                  alignItems: "center",
                  borderRight: "1px solid hsl(225,15%,20%)",
                  flexShrink: 0,
                }}
              >
                ₹
              </span>
              <input
                type="number"
                min={1}
                value={custom}
                placeholder="Custom amount"
                onChange={(e) => {
                  setCustom(e.target.value);
                  const n = parseInt(e.target.value, 10);
                  if (!isNaN(n) && n > 0) setAmount(n);
                }}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  padding: "0 16px",
                  height: 52,
                  fontSize: 22,
                  fontWeight: 800,
                }}
              />
            </div>
            {bonus > 0 && (
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 14px",
                  background: "hsl(47,90%,61%,0.07)",
                  border: "1px solid hsl(47,90%,61%,0.2)",
                  borderRadius: 9,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, color: "hsl(230,10%,65%)" }}>
                  🎁 {amount >= 5000 ? "10%" : "5%"} Bonus included
                </span>
                <span style={{ fontWeight: 800, color: "var(--primary)" }}>
                  +{fmtINR(bonus)}
                </span>
              </div>
            )}
          </div>

          <div>
            <SLabel>Payment Method</SLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 9,
              }}
            >
              {DEP_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  style={{
                    padding: "13px 8px",
                    borderRadius: 12,
                    background:
                      method === m.id
                        ? "hsl(47,90%,61%,0.09)"
                        : "hsl(225,20%,14%)",
                    border: `1.5px solid ${method === m.id ? "var(--primary)" : "hsl(225,15%,21%)"}`,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    position: "relative",
                    transition: "all 0.15s",
                  }}
                >
                  {method === m.id && (
                    <span
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "var(--primary)",
                        color: "hsl(230,25%,8%)",
                        fontSize: 9,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✓
                    </span>
                  )}
                  <span style={{ fontSize: 26 }}>{m.icon}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    {m.name}
                  </span>
                  <span style={{ fontSize: 10, color: "hsl(230,10%,50%)" }}>
                    {m.time}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card fields */}
          {method === "card" && (
            <div
              style={{
                background: "hsl(225,20%,13%)",
                border: "1px solid hsl(225,15%,19%)",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted-fg)",
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  Card Number
                </label>
                <input
                  value={cardNo}
                  maxLength={19}
                  onChange={(e) =>
                    setCardNo(
                      e.target.value
                        .replace(/\D/g, "")
                        .replace(/(.{4})/g, "$1 ")
                        .trim(),
                    )
                  }
                  placeholder="1234 5678 9012 3456"
                  style={{
                    width: "100%",
                    background: "hsl(225,20%,17%)",
                    border: "1.5px solid hsl(225,15%,24%)",
                    borderRadius: 9,
                    padding: "11px 14px",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                    letterSpacing: 1,
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "var(--muted-fg)",
                      display: "block",
                      marginBottom: 5,
                      fontWeight: 600,
                    }}
                  >
                    Expiry
                  </label>
                  <input
                    value={cardExp}
                    maxLength={5}
                    onChange={(e) => setCardExp(e.target.value)}
                    placeholder="MM/YY"
                    style={{
                      width: "100%",
                      background: "hsl(225,20%,17%)",
                      border: "1.5px solid hsl(225,15%,24%)",
                      borderRadius: 9,
                      padding: "11px 14px",
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "var(--muted-fg)",
                      display: "block",
                      marginBottom: 5,
                      fontWeight: 600,
                    }}
                  >
                    CVV
                  </label>
                  <input
                    value={cardCvv}
                    maxLength={4}
                    type="password"
                    onChange={(e) =>
                      setCardCvv(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="•••"
                    style={{
                      width: "100%",
                      background: "hsl(225,20%,17%)",
                      border: "1.5px solid hsl(225,15%,24%)",
                      borderRadius: 9,
                      padding: "11px 14px",
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {method === "netbank" && (
            <div
              style={{
                background: "hsl(225,20%,13%)",
                border: "1px solid hsl(225,15%,19%)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  color: "var(--muted-fg)",
                  display: "block",
                  marginBottom: 5,
                  fontWeight: 600,
                }}
              >
                Select Bank
              </label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                style={{
                  width: "100%",
                  background: "hsl(225,20%,17%)",
                  border: "1.5px solid hsl(225,15%,24%)",
                  borderRadius: 9,
                  padding: "12px 14px",
                  color: "#fff",
                  fontSize: 14,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {[
                  "SBI",
                  "HDFC",
                  "ICICI",
                  "Axis",
                  "Kotak",
                  "Punjab National",
                  "Bank of Baroda",
                  "Canara",
                  "Yes Bank",
                ].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
          )}

          {/* Summary */}
          <div
            style={{
              background: "hsl(225,20%,13%)",
              border: "1px solid hsl(225,15%,19%)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {[
              { k: "Amount", v: fmtINR(amount) },
              { k: "Method", v: `${selM?.icon} ${selM?.name}` },
              { k: "Fee", v: "Free", vc: "hsl(145,60%,60%)" },
              ...(bonus > 0
                ? [{ k: "Bonus", v: `+${fmtINR(bonus)}`, vc: "var(--primary)" }]
                : []),
            ].map((r) => (
              <div
                key={r.k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  borderBottom: "1px solid hsl(225,15%,17%)",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "hsl(230,10%,58%)" }}>{r.k}</span>
                <span style={{ fontWeight: 700, color: r.vc || "#fff" }}>
                  {r.v}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "16px 18px",
                background: "hsl(225,20%,16%)",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                Total to Account
              </span>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 22,
                  color: "var(--primary)",
                }}
              >
                {fmtINR(total)}
              </span>
            </div>
          </div>

          <button
            onClick={initiate}
            disabled={loading || !user}
            style={{
              height: 54,
              borderRadius: 12,
              background:
                "linear-gradient(135deg,hsl(47,90%,58%),hsl(38,90%,48%))",
              border: "none",
              cursor: loading || !user ? "not-allowed" : "pointer",
              fontWeight: 800,
              fontSize: 16,
              color: "hsl(225,25%,8%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 6px 28px hsl(47,90%,61%,0.35)",
              transition: "all 0.2s",
              opacity: !user ? 0.5 : 1,
            }}
          >
            {loading ? (
              <>
                <Spin />
                Processing…
              </>
            ) : (
              <>💳 Proceed to Pay {fmtINR(total)}</>
            )}
          </button>
        </>
      )}

      {/* ── STEP 2: QR code ── */}
      {step === 2 && qrData && (
        <>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 14,
                color: "hsl(230,10%,60%)",
                marginBottom: 6,
              }}
            >
              Scan & Pay using {selM?.name}
            </div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 28,
                color: "var(--primary)",
                marginBottom: 18,
              }}
            >
              {fmtINR(total)}
            </div>
            <div
              style={{
                display: "inline-block",
                padding: 16,
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <img
                src={qrData}
                alt="UPI QR Code"
                style={{ width: 220, height: 220, display: "block" }}
              />
            </div>
            <div
              style={{ marginTop: 14, fontSize: 12, color: "hsl(230,10%,50%)" }}
            >
              Open {selM?.name} → Scan QR → Pay{" "}
              <strong style={{ color: "#fff" }}>{fmtINR(total)}</strong>
            </div>
          </div>

          <div
            style={{
              background: "hsl(225,20%,14%)",
              border: "1px solid hsl(225,15%,20%)",
              borderRadius: 12,
              padding: "14px 18px",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "hsl(230,10%,50%)",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: ".5px",
              }}
            >
              Or Pay to UPI ID
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "hsl(225,20%,18%)",
                borderRadius: 9,
                padding: "10px 14px",
              }}
            >
              <code
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: 0.5,
                }}
              >
                tradex@upi
              </code>
              <button
                onClick={() => navigator.clipboard?.writeText("tradex@upi")}
                style={{
                  padding: "4px 12px",
                  borderRadius: 7,
                  background: "hsl(225,20%,24%)",
                  border: "1px solid hsl(225,15%,30%)",
                  cursor: "pointer",
                  color: "hsl(230,10%,70%)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Copy
              </button>
            </div>
            <div
              style={{ marginTop: 10, fontSize: 12, color: "hsl(230,10%,50%)" }}
            >
              Transaction ID:{" "}
              <strong style={{ color: "hsl(210,80%,70%)" }}>{txid}</strong>
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            style={{
              height: 50,
              borderRadius: 12,
              background: "var(--primary)",
              border: "none",
              cursor: "pointer",
              fontWeight: 800,
              fontSize: 15,
              color: "hsl(230,25%,8%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            I've Paid → Enter UTR Number
          </button>
          <button
            onClick={() => {
              setStep(1);
              setQrData(null);
            }}
            style={{
              height: 42,
              borderRadius: 10,
              background: "none",
              border: "1px solid hsl(225,15%,24%)",
              cursor: "pointer",
              color: "hsl(230,10%,60%)",
              fontSize: 13,
            }}
          >
            ← Go Back
          </button>
        </>
      )}

      {/* ── STEP 3: UTR confirmation ── */}
      {step === 3 && (
        <>
          <div style={{ textAlign: "center", marginBottom: 4 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔢</div>
            <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
              Enter UTR / Reference Number
            </h3>
            <p
              style={{
                color: "hsl(230,10%,55%)",
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              Find the 12-digit UTR number in your payment app under transaction
              history.
              <br />
              This is used to verify your payment.
            </p>
          </div>

          <div
            style={{
              background: "hsl(225,20%,14%)",
              borderRadius: 12,
              padding: "18px",
              border: "1px solid hsl(225,15%,20%)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "hsl(230,10%,50%)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: ".5px",
              }}
            >
              UTR / Reference Number
            </div>
            <input
              type="text"
              placeholder="e.g. 423198765432"
              value={utr}
              onChange={(e) =>
                setUtr(e.target.value.replace(/\D/g, "").slice(0, 16))
              }
              style={{
                width: "100%",
                background: "hsl(225,20%,18%)",
                border: `1.5px solid ${utr.length > 0 ? "var(--primary)" : "hsl(225,15%,24%)"}`,
                borderRadius: 10,
                padding: "14px 16px",
                color: "#fff",
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 2,
                outline: "none",
                transition: "border-color 0.2s",
                textAlign: "center",
              }}
            />
            <div
              style={{
                fontSize: 11,
                color: "hsl(230,10%,50%)",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              For: {fmtINR(total)} via {selM?.name} · TxID: {txid}
            </div>
          </div>

          <div
            style={{
              background: "hsl(47,90%,61%,0.07)",
              border: "1px solid hsl(47,90%,61%,0.18)",
              borderRadius: 10,
              padding: "12px 16px",
              fontSize: 12,
              color: "hsl(230,10%,65%)",
              lineHeight: 1.7,
            }}
          >
            📍 Where to find UTR:
            <br />
            <strong style={{ color: "#fff" }}>Google Pay</strong>: Tap
            transaction → UPI transaction ID
            <br />
            <strong style={{ color: "#fff" }}>Paytm</strong>: Passbook → tap txn
            → UTR Number
            <br />
            <strong style={{ color: "#fff" }}>PhonePe</strong>: History → tap
            txn → Transaction ID
          </div>

          <button
            onClick={confirmUTR}
            disabled={loading || utr.length < 8}
            style={{
              height: 52,
              borderRadius: 12,
              background:
                "linear-gradient(135deg,hsl(145,70%,42%),hsl(145,62%,34%))",
              border: "none",
              cursor: loading || utr.length < 8 ? "not-allowed" : "pointer",
              fontWeight: 800,
              fontSize: 15,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 4px 20px hsl(145,70%,40%,0.3)",
              opacity: utr.length < 8 ? 0.5 : 1,
            }}
          >
            {loading ? (
              <>
                <Spin />
                Submitting…
              </>
            ) : (
              <>✅ Submit UTR for Verification</>
            )}
          </button>

          {selM?.qr && (
            <button
              onClick={() => setStep(2)}
              style={{
                height: 42,
                borderRadius: 10,
                background: "none",
                border: "1px solid hsl(225,15%,24%)",
                cursor: "pointer",
                color: "hsl(230,10%,60%)",
                fontSize: 13,
              }}
            >
              ← Back to QR
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   WITHDRAW TAB
   — user must pay ALL charges first
     via UPI deposit, then withdraw
═══════════════════════════════════ */
function WithdrawTab({ user, onRefresh }) {
  const { withdraw } = useAuth();
  const realBal = user?.realBalance || 0;

  const [amount, setAmount] = useState(500);
  const [custom, setCustom] = useState("500");
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [accNo, setAccNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [accName, setAccName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState("");

  // charge payment state
  const [paidCharges, setPaidCharges] = useState({});
  const [payingCharge, setPayingCharge] = useState(null); // charge id currently open in modal

  const selM = WD_METHODS.find((m) => m.id === method);
  const conditions = getWithdrawConditions(realBal);
  const paidCount = conditions.filter((c) => paidCharges[c.id]).length;
  const allPaid =
    conditions.length > 0 && conditions.every((c) => paidCharges[c.id]);
  const totalChg = conditions.reduce((s, c) => s + c.amount, 0);
  const canWithdraw =
    allPaid && !!user && amount >= (selM?.min || 200) && amount <= realBal;
  const activeModal = conditions.find((c) => c.id === payingCharge);

  const markPaid = (id) => {
    setPaidCharges((prev) => ({ ...prev, [id]: true }));
    setPayingCharge(null);
  };

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const detail = upiId || phone || accNo;
      await withdraw({ amount, method: selM.name, methodDetail: detail });
      setDone({ amount, method: selM.name, time: selM.time });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "hsl(0,70%,45%,0.12)",
            border: "2px solid hsl(0,70%,50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            margin: "0 auto 22px",
          }}
        >
          🏦
        </div>
        <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
          Withdrawal Requested!
        </h3>
        <div
          style={{
            fontWeight: 800,
            fontSize: 32,
            color: "hsl(0,70%,65%)",
            marginBottom: 6,
          }}
        >
          {fmtINR(done.amount)}
        </div>
        <p
          style={{
            color: "hsl(230,10%,55%)",
            fontSize: 14,
            lineHeight: 1.7,
            marginBottom: 22,
          }}
        >
          Via <strong style={{ color: "#fff" }}>{done.method}</strong> · ETA:{" "}
          <strong style={{ color: "var(--primary)" }}>{done.time}</strong>
        </p>
        <button
          onClick={() => {
            setDone(null);
            setPaidCharges({});
          }}
          style={{
            width: "100%",
            height: 46,
            borderRadius: 10,
            background: "var(--primary)",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            color: "hsl(230,25%,8%)",
            fontSize: 14,
          }}
        >
          Done
        </button>
      </div>
    );

  return (
    <>
      {/* Pay Charge Modal — renders on top of everything */}
      {activeModal && (
        <PayChargeModal
          cond={activeModal}
          onPaid={markPaid}
          onClose={() => setPayingCharge(null)}
        />
      )}

      <div
        style={{
          padding: "20px 24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "hsl(0,65%,18%)",
              border: "1px solid hsl(0,65%,35%)",
              borderRadius: 9,
              fontSize: 13,
              color: "hsl(0,80%,78%)",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Balance cards */}
        {user && (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div
              style={{
                background: "hsl(225,20%,14%)",
                border: "1px solid hsl(225,15%,20%)",
                borderRadius: 12,
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "hsl(230,10%,50%)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                  marginBottom: 5,
                }}
              >
                Available
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 22,
                  color: realBal > 0 ? "hsl(145,60%,60%)" : "hsl(230,10%,50%)",
                }}
              >
                {fmtINR(realBal)}
              </div>
            </div>
            <div
              style={{
                background: "hsl(225,20%,14%)",
                border: "1px solid hsl(225,15%,20%)",
                borderRadius: 12,
                padding: "14px 18px",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "hsl(230,10%,50%)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: ".5px",
                  marginBottom: 5,
                }}
              >
                Min Withdraw
              </div>
              <div style={{ fontWeight: 800, fontSize: 22 }}>
                {fmtINR(selM?.min || 200)}
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div
            style={{
              padding: "16px",
              background: "hsl(210,80%,50%,0.1)",
              border: "1px solid hsl(210,80%,50%,0.25)",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              Sign in to withdraw
            </div>
            <div style={{ fontSize: 12, color: "hsl(230,10%,55%)" }}>
              Login to access your real balance.
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <SLabel>Amount</SLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {WD_AMOUNTS.map((v) => (
              <button
                key={v}
                disabled={v > realBal}
                onClick={() => {
                  setAmount(v);
                  setCustom(String(v));
                }}
                style={{
                  height: 44,
                  borderRadius: 10,
                  border: `1px solid ${amount === v ? "hsl(0,75%,55%)" : "hsl(225,15%,22%)"}`,
                  background:
                    amount === v ? "hsl(0,75%,50%,0.1)" : "hsl(225,20%,15%)",
                  cursor: v > realBal ? "not-allowed" : "pointer",
                  color:
                    v > realBal
                      ? "hsl(230,10%,40%)"
                      : amount === v
                        ? "hsl(0,75%,65%)"
                        : "hsl(230,10%,75%)",
                  fontWeight: 700,
                  fontSize: 12,
                  opacity: v > realBal ? 0.5 : 1,
                }}
              >
                {fmtINR(v)}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                background: "hsl(225,20%,15%)",
                border: "1.5px solid hsl(225,15%,24%)",
                borderRadius: 11,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  padding: "0 14px",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "hsl(0,75%,65%)",
                  height: 52,
                  display: "flex",
                  alignItems: "center",
                  borderRight: "1px solid hsl(225,15%,20%)",
                  flexShrink: 0,
                }}
              >
                ₹
              </span>
              <input
                type="number"
                min={1}
                max={realBal}
                value={custom}
                onChange={(e) => {
                  setCustom(e.target.value);
                  const n = parseInt(e.target.value, 10);
                  if (!isNaN(n) && n > 0) setAmount(n);
                }}
                style={{
                  flex: 1,
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  padding: "0 16px",
                  height: 52,
                  fontSize: 22,
                  fontWeight: 800,
                }}
              />
            </div>
            <button
              onClick={() => {
                setAmount(realBal);
                setCustom(String(realBal));
              }}
              style={{
                padding: "0 18px",
                height: 52,
                borderRadius: 11,
                background: "hsl(0,75%,50%,0.1)",
                border: "1.5px solid hsl(0,75%,50%,0.3)",
                cursor: "pointer",
                color: "hsl(0,75%,65%)",
                fontWeight: 700,
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              MAX
            </button>
          </div>
        </div>

        {/* Method */}
        <div>
          <SLabel>Withdraw To</SLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 9,
            }}
          >
            {WD_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                style={{
                  padding: "13px 8px",
                  borderRadius: 12,
                  background:
                    method === m.id
                      ? "hsl(0,75%,50%,0.08)"
                      : "hsl(225,20%,14%)",
                  border: `1.5px solid ${method === m.id ? "hsl(0,75%,55%)" : "hsl(225,15%,21%)"}`,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  position: "relative",
                  transition: "all 0.15s",
                }}
              >
                {method === m.id && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "hsl(0,75%,55%)",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ✓
                  </span>
                )}
                <span style={{ fontSize: 26 }}>{m.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                  {m.name}
                </span>
                <span style={{ fontSize: 10, color: "hsl(230,10%,50%)" }}>
                  {m.time}
                </span>
              </button>
            ))}
          </div>

          {/* Method detail fields */}
          <div
            style={{
              background: "hsl(225,20%,13%)",
              border: "1px solid hsl(225,15%,19%)",
              borderRadius: 12,
              padding: 16,
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {method === "upi" && (
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted-fg)",
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  Your UPI ID
                </label>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  style={{
                    width: "100%",
                    background: "hsl(225,20%,17%)",
                    border: "1.5px solid hsl(225,15%,24%)",
                    borderRadius: 9,
                    padding: "11px 14px",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            )}
            {method === "bank" && (
              <>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "var(--muted-fg)",
                      display: "block",
                      marginBottom: 5,
                      fontWeight: 600,
                    }}
                  >
                    Account Holder Name
                  </label>
                  <input
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="Full name as in bank"
                    style={{
                      width: "100%",
                      background: "hsl(225,20%,17%)",
                      border: "1.5px solid hsl(225,15%,24%)",
                      borderRadius: 9,
                      padding: "11px 14px",
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "var(--muted-fg)",
                      display: "block",
                      marginBottom: 5,
                      fontWeight: 600,
                    }}
                  >
                    Account Number
                  </label>
                  <input
                    value={accNo}
                    onChange={(e) =>
                      setAccNo(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter account number"
                    style={{
                      width: "100%",
                      background: "hsl(225,20%,17%)",
                      border: "1.5px solid hsl(225,15%,24%)",
                      borderRadius: 9,
                      padding: "11px 14px",
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "var(--muted-fg)",
                      display: "block",
                      marginBottom: 5,
                      fontWeight: 600,
                    }}
                  >
                    IFSC Code
                  </label>
                  <input
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    placeholder="SBIN0001234"
                    style={{
                      width: "100%",
                      background: "hsl(225,20%,17%)",
                      border: "1.5px solid hsl(225,15%,24%)",
                      borderRadius: 9,
                      padding: "11px 14px",
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                      letterSpacing: 1,
                    }}
                  />
                </div>
              </>
            )}
            {method === "paytm" && (
              <div>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted-fg)",
                    display: "block",
                    marginBottom: 5,
                    fontWeight: 600,
                  }}
                >
                  Paytm Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  type="tel"
                  style={{
                    width: "100%",
                    background: "hsl(225,20%,17%)",
                    border: "1.5px solid hsl(225,15%,24%)",
                    borderRadius: 9,
                    padding: "11px 14px",
                    color: "#fff",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════
            MANDATORY CHARGES BLOCK
        ════════════════════════════ */}
        <div>
          {/* header banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              background: allPaid ? "hsl(145,50%,10%)" : "hsl(0,55%,11%)",
              border: `1.5px solid ${allPaid ? "hsl(145,55%,30%)" : "hsl(0,60%,34%)"}`,
              borderRadius: "14px 14px 0 0",
              transition: "all 0.4s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{allPaid ? "✅" : "🚨"}</span>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 13,
                    color: allPaid ? "hsl(145,65%,68%)" : "hsl(0,80%,75%)",
                    marginBottom: 2,
                  }}
                >
                  {allPaid
                    ? "All Charges Paid — Withdrawal Unlocked!"
                    : "Pay All Charges Below to Unlock Withdrawal"}
                </div>
                <div style={{ fontSize: 11, color: "hsl(230,10%,50%)" }}>
                  {allPaid
                    ? "You can now proceed with your withdrawal request."
                    : `${paidCount} of ${conditions.length} paid · Pay in order — each charge unlocks the next`}
                </div>
              </div>
            </div>
            {/* progress dots */}
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
              {conditions.map((c) => (
                <div
                  key={c.id}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: paidCharges[c.id]
                      ? "hsl(145,60%,48%)"
                      : "hsl(225,15%,28%)",
                    border: `1.5px solid ${paidCharges[c.id] ? "hsl(145,60%,58%)" : "hsl(225,15%,35%)"}`,
                    boxShadow: paidCharges[c.id]
                      ? "0 0 8px hsl(145,60%,48%,0.7)"
                      : "none",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* charge rows */}
          <div
            style={{
              background: "hsl(225,22%,10%)",
              border: "1.5px solid hsl(225,15%,18%)",
              borderTop: "none",
              borderRadius: "0 0 14px 14px",
              overflow: "hidden",
            }}
          >
            {conditions.map((cond, i) => {
              const paid = !!paidCharges[cond.id];
              const locked = i > 0 && !paidCharges[conditions[i - 1].id];
              return (
                <div
                  key={cond.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 18px",
                    borderBottom:
                      i < conditions.length - 1
                        ? "1px solid hsl(225,15%,16%)"
                        : "none",
                    background: paid
                      ? "hsl(145,50%,8%)"
                      : locked
                        ? "hsl(225,20%,9%)"
                        : "hsl(225,22%,11%)",
                    opacity: locked ? 0.42 : 1,
                    transition: "all 0.35s",
                  }}
                >
                  {/* icon */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      flexShrink: 0,
                      background: paid
                        ? "hsl(145,55%,20%,0.5)"
                        : `${cond.badgeColor}18`,
                      border: `1.5px solid ${paid ? "hsl(145,55%,32%)" : cond.badgeColor + "44"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      transition: "all 0.3s",
                    }}
                  >
                    {paid ? "✅" : locked ? "🔒" : cond.icon}
                  </div>

                  {/* info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        marginBottom: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: paid ? "hsl(145,60%,65%)" : "#fff",
                        }}
                      >
                        {cond.title}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: ".7px",
                          padding: "1px 7px",
                          borderRadius: 20,
                          whiteSpace: "nowrap",
                          background: paid
                            ? "hsl(145,55%,16%)"
                            : `${cond.badgeColor}22`,
                          color: paid ? "hsl(145,60%,52%)" : cond.badgeColor,
                          border: `1px solid ${paid ? "hsl(145,55%,26%)" : cond.badgeColor + "3a"}`,
                        }}
                      >
                        {paid ? "PAID ✓" : cond.badge}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "hsl(230,10%,50%)",
                        lineHeight: 1.55,
                      }}
                    >
                      {cond.desc}
                    </div>
                  </div>

                  {/* amount + button */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        fontSize: 17,
                        color: paid ? "hsl(145,60%,58%)" : cond.badgeColor,
                        marginBottom: 8,
                      }}
                    >
                      {fmtINR(cond.amount)}
                    </div>
                    {!paid ? (
                      <button
                        onClick={() => !locked && setPayingCharge(cond.id)}
                        disabled={locked}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 9,
                          background: locked
                            ? "hsl(225,20%,18%)"
                            : `linear-gradient(135deg,${cond.badgeColor},${cond.badgeColor}cc)`,
                          border: "none",
                          cursor: locked ? "not-allowed" : "pointer",
                          fontWeight: 800,
                          fontSize: 12,
                          color: locked
                            ? "hsl(230,10%,38%)"
                            : "hsl(225,25%,8%)",
                          whiteSpace: "nowrap",
                          boxShadow: locked
                            ? "none"
                            : `0 3px 14px ${cond.badgeColor}44`,
                          transition: "all 0.2s",
                        }}
                      >
                        {locked ? "Locked" : "Pay Now →"}
                      </button>
                    ) : (
                      <div
                        style={{
                          fontSize: 11,
                          color: "hsl(145,60%,50%)",
                          fontWeight: 700,
                        }}
                      >
                        ✓ Verified
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* total charges footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "hsl(225,20%,8%)",
                borderTop: "1.5px solid hsl(225,15%,15%)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "hsl(230,10%,44%)",
                    fontWeight: 600,
                    marginBottom: 3,
                  }}
                >
                  Total Mandatory Charges
                </div>
                <div style={{ fontSize: 11, color: "hsl(230,10%,36%)" }}>
                  {allPaid
                    ? "All charges verified ✓ — Withdrawal unlocked"
                    : `${conditions.length - paidCount} payment${conditions.length - paidCount !== 1 ? "s" : ""} remaining`}
                </div>
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 24,
                  color: "hsl(47,90%,65%)",
                }}
              >
                {fmtINR(totalChg)}
              </div>
            </div>
          </div>
        </div>

        {/* exceed balance warning */}
        {user && amount > realBal && (
          <div
            style={{
              padding: "10px 14px",
              background: "hsl(0,65%,18%)",
              border: "1px solid hsl(0,65%,35%)",
              borderRadius: 9,
              fontSize: 13,
              color: "hsl(0,80%,78%)",
            }}
          >
            ⚠️ Amount exceeds balance of {fmtINR(realBal)}
          </div>
        )}

        {/* withdraw button — locked until all charges paid */}
        <button
          onClick={submit}
          disabled={!canWithdraw || loading}
          style={{
            height: 54,
            borderRadius: 12,
            background: canWithdraw
              ? "linear-gradient(135deg,hsl(0,75%,52%),hsl(0,65%,43%))"
              : "hsl(225,20%,16%)",
            border: canWithdraw ? "none" : "1.5px solid hsl(225,15%,22%)",
            cursor: !canWithdraw || loading ? "not-allowed" : "pointer",
            fontWeight: 800,
            fontSize: 16,
            color: canWithdraw ? "#fff" : "hsl(230,10%,36%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: canWithdraw ? "0 6px 28px hsl(0,75%,50%,0.3)" : "none",
            transition: "all 0.3s",
          }}
        >
          {loading ? (
            <>
              <Spin />
              Processing…
            </>
          ) : canWithdraw ? (
            <>🏦 Withdraw {fmtINR(amount)}</>
          ) : (
            <>🔒 Pay All {conditions.length} Charges to Unlock Withdrawal</>
          )}
        </button>
      </div>
    </>
  );
}

/* ═══════════════════════════════════
   HISTORY TAB
═══════════════════════════════════ */
function HistoryTab({ user }) {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    apiGetTransactions()
      .then(setTxns)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    if (filter === "all") return txns;
    if (filter === "deposit") return txns.filter((t) => t.type === "deposit");
    if (filter === "withdraw") return txns.filter((t) => t.type === "withdraw");
    return txns;
  }, [txns, filter]);

  const STATUS_COLORS = {
    success: "hsl(145,60%,60%)",
    pending: "hsl(47,90%,65%)",
    processing: "hsl(210,80%,70%)",
    failed: "hsl(0,70%,65%)",
  };
  const STATUS_ICONS = {
    success: "✓",
    pending: "⏳",
    processing: "🔄",
    failed: "✗",
  };
  const METHOD_ICONS = {
    UPI: "📱",
    Card: "💳",
    "Net Banking": "🏦",
    "Google Pay": "🔵",
    Paytm: "🟦",
    PhonePe: "🟣",
    "Bank Transfer": "🏦",
  };

  const totalDep = txns
    .filter((t) => t.type === "deposit" && t.status === "success")
    .reduce((s, t) => s + t.amount, 0);
  const totalWd = txns
    .filter((t) => t.type === "withdraw")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <>
      {user && txns.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            padding: "16px 24px 0",
          }}
        >
          {[
            {
              l: "Total Deposited",
              v: fmtINR(totalDep),
              c: "hsl(145,60%,60%)",
            },
            { l: "Total Withdrawn", v: fmtINR(totalWd), c: "hsl(0,70%,65%)" },
            { l: "Transactions", v: txns.length, c: "hsl(230,10%,75%)" },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                background: "hsl(225,20%,14%)",
                borderRadius: 10,
                padding: "12px 14px",
                border: "1px solid hsl(225,15%,20%)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "hsl(230,10%,50%)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                {s.l}
              </div>
              <div style={{ fontWeight: 800, fontSize: 17, color: s.c }}>
                {s.v}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "14px 24px",
          borderBottom: "1px solid hsl(225,15%,17%)",
          overflowX: "auto",
        }}
      >
        {[
          { k: "all", l: "All" },
          { k: "deposit", l: "Deposits" },
          { k: "withdraw", l: "Withdrawals" },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              border: "1px solid hsl(225,15%,22%)",
              background: filter === f.k ? "hsl(225,20%,18%)" : "none",
              color: filter === f.k ? "#fff" : "hsl(230,10%,60%)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div
        style={{
          padding: "12px 20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "hsl(230,10%,50%)",
            }}
          >
            <Spin />
          </div>
        )}
        {!user && (
          <div
            style={{
              textAlign: "center",
              padding: "50px 0",
              color: "hsl(230,10%,50%)",
            }}
          >
            <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>
              🔐
            </span>
            Sign in to view history
          </div>
        )}
        {user && !loading && filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "50px 0",
              color: "hsl(230,10%,50%)",
            }}
          >
            <span style={{ fontSize: 40, display: "block", marginBottom: 12 }}>
              📋
            </span>
            No {filter === "all" ? "transactions" : filter + "s"} yet
          </div>
        )}
        {filtered.map((tx) => (
          <div
            key={tx.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              background: "hsl(225,20%,14%)",
              border: "1px solid hsl(225,15%,19%)",
              borderRadius: 12,
              transition: "background 0.15s",
              cursor: "default",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "hsl(225,20%,17%)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "hsl(225,20%,14%)")
            }
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background:
                  tx.type === "deposit"
                    ? "hsl(145,60%,40%,0.13)"
                    : "hsl(0,70%,50%,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {METHOD_ICONS[tx.method] || (tx.type === "deposit" ? "💰" : "🏦")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>
                {tx.type === "deposit" ? "Deposit" : "Withdrawal"} via{" "}
                {tx.method}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "hsl(230,10%,50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    padding: "1px 7px",
                    borderRadius: 5,
                    background: `${STATUS_COLORS[tx.status]}22`,
                    color: STATUS_COLORS[tx.status],
                    fontWeight: 700,
                    fontSize: 10,
                  }}
                >
                  {STATUS_ICONS[tx.status]} {tx.status}
                </span>
                <span>{fmtDate(tx.created_at)}</span>
                {tx.utr && <span>UTR: {tx.utr}</span>}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color:
                    tx.type === "deposit"
                      ? "hsl(145,60%,60%)"
                      : "hsl(0,70%,65%)",
                  marginBottom: 2,
                }}
              >
                {tx.type === "deposit" ? "+" : "−"}
                {fmtINR(tx.amount)}
              </div>
              {tx.txid && (
                <div style={{ fontSize: 10, color: "hsl(230,10%,50%)" }}>
                  {tx.txid.slice(0, 12)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ═══════════════════════════════════
   MAIN WALLET PAGE
═══════════════════════════════════ */
export function DepositPage({ onNavigate }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("deposit");

  const realBal = user?.realBalance || 0;
  const demoBal = user?.demoBalance || 0;

  const TABS = [
    { id: "deposit", icon: "⬆️", label: "Deposit", color: "var(--primary)" },
    { id: "withdraw", icon: "⬇️", label: "Withdraw", color: "hsl(0,75%,65%)" },
    { id: "history", icon: "📋", label: "History", color: "hsl(210,80%,70%)" },
  ];

  return (
    <div className="wp">
      {/* Header */}
      <header className="wp__topbar">
        <button className="wp__back" onClick={() => onNavigate("trading")}>
          <Icons.ArrowLeft size={15} />
        </button>
        <BrandLogo size="sm" onClick={() => onNavigate("home")} />
        <span style={{ color: "hsl(225,15%,35%)" }}>·</span>
        <span className="wp__topbar-title">Wallet</span>
        <div className="wp__topbar-secure">🔒 Secure</div>
      </header>

      <div className="wp__body">
        {/* Balance strip */}
        <div className="wp__balstrip">
          <div className="wp__bal wp__bal--real">
            <div className="wp__bal-label">Real Account</div>
            <div className="wp__bal-val">{fmtINR(realBal)}</div>
            <div
              className={`wp__bal-sub${realBal > 0 ? " wp__bal-sub--up" : ""}`}
            >
              {realBal > 0 ? "✓ Active" : "Deposit to activate"}
            </div>
          </div>
          <div className="wp__bal wp__bal--demo">
            <div className="wp__bal-label">Demo Account</div>
            <div className="wp__bal-val">{fmtINR(demoBal)}</div>
            <div className="wp__bal-sub wp__bal-sub--demo">🎮 Virtual</div>
          </div>
          <div className="wp__bal wp__bal--profit">
            <div className="wp__bal-label">Account</div>
            <div className="wp__bal-val" style={{ fontSize: 16 }}>
              {user?.name || "Guest"}
            </div>
            <div className="wp__bal-sub">{user?.email || "Not signed in"}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="wp__tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`wp__tab${tab === t.id ? " wp__tab--active" : ""}`}
              style={{ "--tab-color": t.color }}
              onClick={() => setTab(t.id)}
            >
              <span className="wp__tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="wp__panel">
          <div className="wp__panel-header">
            <div className="wp__panel-title">
              {tab === "deposit" && (
                <>
                  <span>⬆️</span> Deposit Funds
                </>
              )}
              {tab === "withdraw" && (
                <>
                  <span>⬇️</span> Withdraw Funds
                </>
              )}
              {tab === "history" && (
                <>
                  <span>📋</span> Transaction History
                </>
              )}
            </div>
          </div>

          {tab === "deposit" && (
            <DepositTab user={user} onRefresh={() => setTab("history")} />
          )}
          {tab === "withdraw" && (
            <WithdrawTab user={user} onRefresh={() => setTab("history")} />
          )}
          {tab === "history" && <HistoryTab user={user} />}
        </div>
      </div>

      {/* keyframe animations — injected once */}
      <style>{`
        @keyframes slideUpModal {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes pulseGreen {
          0%,100% { box-shadow: 0 0 0 0   hsl(145,60%,45%,0.4); }
          50%      { box-shadow: 0 0 0 14px hsl(145,60%,45%,0);   }
        }
      `}</style>
    </div>
  );
}

export default DepositPage;
