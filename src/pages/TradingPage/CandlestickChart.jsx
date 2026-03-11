import React from "react";

/** Format price to appropriate decimal places */
export function fmt(p) {
  if (p === undefined || p === null) return "—";
  if (p < 10)   return p.toFixed(7);
  if (p < 100)  return p.toFixed(4);
  if (p < 1000) return p.toFixed(2);
  return p.toFixed(2);
}

/** Generate initial candle data */
export function generateCandles(count, basePrice) {
  const candles = [];
  let price = basePrice;
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const open   = price;
    const change = (Math.random() - 0.48) * (basePrice * 0.003);
    const close  = open + change;
    const high   = Math.max(open, close) + Math.random() * (basePrice * 0.0015);
    const low    = Math.min(open, close) - Math.random() * (basePrice * 0.0015);
    candles.push({ open, close, high, low, ts: now - (count - i) * 5000 });
    price = close;
  }
  return candles;
}

export function CandlestickChart({ candles, w, h, entryLines, tradeTimer }) {
  if (!candles.length || !w || !h) return null;

  const pad = { t:12, b:28, l:8, r:105 };
  const cw  = w - pad.l - pad.r;
  const ch  = h - pad.t - pad.b;
  const allP = candles.flatMap(c => [c.high, c.low]);
  const minP = Math.min(...allP);
  const maxP = Math.max(...allP);
  const range   = maxP - minP || 1;
  const candleW = Math.max(3, (cw / candles.length) * 0.6);
  const gap     = cw / candles.length;
  const yS = p => pad.t + ch - ((p - minP) / range) * ch;
  const last = candles[candles.length - 1];

  const gridLines = Array.from({ length: 6 }, (_, i) => minP + (range / 5) * i);

  const xLabels = [];
  for (let i = 0; i < candles.length; i += Math.floor(candles.length / 5)) {
    const d = new Date(candles[i].ts);
    xLabels.push({ i, label:`${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}` });
  }

  return (
    <svg width={w} height={h} style={{ display:"block", userSelect:"none" }}>
      <rect x={0} y={0} width={w} height={h} fill="hsl(225,20%,10%)" />

      {/* Grid lines + labels */}
      {gridLines.map((p, i) => (
        <g key={i}>
          <line x1={pad.l} y1={yS(p)} x2={w-pad.r} y2={yS(p)} stroke="hsl(230,15%,18%)" strokeWidth={0.5} />
          <rect x={w-pad.r+2} y={yS(p)-9} width={pad.r-4} height={18} rx={2} fill="hsl(225,18%,14%)" />
          <text x={w-pad.r/2+2} y={yS(p)+4} textAnchor="middle" fill="hsl(230,10%,50%)" fontSize={9} fontFamily="monospace">{fmt(p)}</text>
        </g>
      ))}

      {/* X-axis time labels */}
      {xLabels.map(({ i, label }) => (
        <text key={i} x={pad.l + i*gap + gap/2} y={h-6} textAnchor="middle" fill="hsl(230,10%,40%)" fontSize={9} fontFamily="monospace">{label}</text>
      ))}

      {/* Candles */}
      {candles.map((c, i) => {
        const x    = pad.l + i*gap + gap/2;
        const bull = c.close >= c.open;
        const col  = bull ? "#26a69a" : "#ef5350";
        return (
          <g key={i}>
            <line x1={x} y1={yS(c.high)} x2={x} y2={yS(c.low)} stroke={col} strokeWidth={1.2} />
            <rect x={x-candleW/2} y={yS(Math.max(c.open,c.close))} width={candleW} height={Math.max(1.5, Math.abs(yS(c.open)-yS(c.close)))} fill={col} rx={1} />
          </g>
        );
      })}

      {/* Entry price lines for active trades */}
      {entryLines && entryLines.map((line, i) => {
        const y = yS(line.price);
        if (y < pad.t || y > h-pad.b) return null;
        const col = line.direction === "up" ? "#26a69a" : "#ef5350";
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={w-pad.r} y2={y} stroke={col} strokeWidth={1} strokeDasharray="6,4" opacity={0.7} />
            <rect x={w-pad.r+2} y={y-9} width={pad.r-4} height={18} rx={2} fill={col} />
            <text x={w-pad.r/2+2} y={y+4} textAnchor="middle" fill="white" fontSize={9} fontFamily="monospace" fontWeight={700}>{fmt(line.price)}</text>
          </g>
        );
      })}

      {/* Current price line */}
      {last && (() => {
        const y = yS(last.close);
        const col = last.close >= last.open ? "#26a69a" : "#ef5350";
        return (
          <g>
            <line x1={pad.l} y1={y} x2={w-pad.r} y2={y} stroke={col} strokeWidth={1} strokeDasharray="8,4" />
            <rect x={w-pad.r+2} y={y-11} width={pad.r-4} height={22} rx={3} fill={col} />
            <text x={w-pad.r/2+2} y={y+5} textAnchor="middle" fill="white" fontSize={10} fontFamily="monospace" fontWeight={700}>{fmt(last.close)}</text>
          </g>
        );
      })()}

      {/* Timer bubble */}
      {tradeTimer !== null && last && (() => {
        const lastX = pad.l + (candles.length-1)*gap + gap/2;
        const y     = Math.max(yS(last.high) - 16, pad.t + 14);
        return (
          <g>
            <circle cx={lastX} cy={y} r={16} fill="hsl(225,18%,22%)" stroke="hsl(230,15%,30%)" strokeWidth={1.5} />
            <text x={lastX} y={y+4} textAnchor="middle" fill="white" fontSize={10} fontFamily="monospace" fontWeight={700}>:{String(tradeTimer).padStart(2,"0")}</text>
          </g>
        );
      })()}

      {/* Vertical cursor at last candle */}
      {last && <line x1={pad.l+(candles.length-1)*gap+gap/2} y1={pad.t} x2={pad.l+(candles.length-1)*gap+gap/2} y2={h-pad.b} stroke="#ef5350" strokeWidth={1} opacity={0.5} />}

      {/* OHLC overlay */}
      {last && (
        <g>
          <text x={pad.l+8} y={h-pad.b-52} fill="hsl(230,10%,60%)" fontSize={10} fontFamily="monospace"><tspan>open  </tspan><tspan fill="hsl(0,0%,85%)">{fmt(last.open)}</tspan></text>
          <text x={pad.l+8} y={h-pad.b-38} fill="hsl(230,10%,60%)" fontSize={10} fontFamily="monospace"><tspan>high  </tspan><tspan fill="hsl(145,60%,60%)">{fmt(last.high)}</tspan></text>
          <text x={pad.l+8} y={h-pad.b-24} fill="hsl(230,10%,60%)" fontSize={10} fontFamily="monospace"><tspan>low   </tspan><tspan fill="hsl(0,75%,60%)">{fmt(last.low)}</tspan></text>
          <text x={pad.l+8} y={h-pad.b-10} fill="hsl(230,10%,60%)" fontSize={10} fontFamily="monospace"><tspan>close </tspan><tspan fill="hsl(0,0%,85%)">{fmt(last.close)}</tspan></text>
        </g>
      )}
    </svg>
  );
}

export default CandlestickChart;
