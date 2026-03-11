export const TRADING_ASSETS = [
  { id:"cryptoidx", name:"Crypto IDX", category:"Index",    price:641.8673932800, payout:83, emoji:"🔵" },
  { id:"eurusd",    name:"EUR/USD",    category:"Forex",     price:1.08473,        payout:87, emoji:"💱" },
  { id:"btcusd",    name:"BTC/USD",    category:"Crypto",    price:67432.50,       payout:90, emoji:"₿"  },
  { id:"gold",      name:"Gold",       category:"Commodity", price:2341.50,        payout:85, emoji:"🥇" },
  { id:"aapl",      name:"Apple",      category:"Stock",     price:189.72,         payout:82, emoji:"🍎" },
  { id:"ethusd",    name:"ETH/USD",    category:"Crypto",    price:3521.80,        payout:88, emoji:"Ξ"  },
  { id:"gbpjpy",    name:"GBP/JPY",    category:"Forex",     price:191.234,        payout:86, emoji:"💱" },
  { id:"tsla",      name:"Tesla",      category:"Stock",     price:248.90,         payout:83, emoji:"🚗" },
  { id:"silver",    name:"Silver",     category:"Commodity", price:27.45,          payout:84, emoji:"🥈" },
];

export const TIME_OPTIONS = [
  { label:"5 sec",  secs:5   },
  { label:"15 sec", secs:15  },
  { label:"30 sec", secs:30  },
  { label:"1 min",  secs:60  },
  { label:"3 min",  secs:180 },
  { label:"5 min",  secs:300 },
];

export const SIDE_NAV = [
  { icon:"📊", label:"Trades"    },
  { icon:"📈", label:"What's n." },
  { icon:"🐴", label:"HoP"       },
  { icon:"🏆", label:"Top trad." },
  { icon:"🏅", label:"Tournam."  },
  { icon:"🛒", label:"Market"    },
  { icon:"🎁", label:"Bonuses"   },
  { icon:"🎓", label:"Education" },
];

export const CHART_TOOLS = [
  { icon:"↔", label:"5s",   type:"tf"   },
  { icon:"⇅", label:"OHLC", type:"type" },
  { icon:"△", label:"Draw", type:"draw" },
  { icon:"✏", label:"Pen",  type:"pen"  },
  { icon:"≋", label:"Ind",  type:"ind"  },
  { icon:"▬", label:"Lay",  type:"lay"  },
];
