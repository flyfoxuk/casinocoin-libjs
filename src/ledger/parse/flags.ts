const orderFlags = {
  Passive: 0x00010000,
  Sell: 0x00020000, // offer was placed as a sell
};

const trustlineFlags = {
  HighAuth: 0x00080000,
  HighFreeze: 0x00800000,
  HighNoCasinocoin: 0x00200000,
  HighReserve: 0x00020000,
  LowAuth: 0x00040000,
  LowFreeze: 0x00400000,
  LowNoCasinocoin: 0x00100000,
  LowReserve: 0x00010000, // entry counts toward reserve
};

export {
  orderFlags,
  trustlineFlags,
};
