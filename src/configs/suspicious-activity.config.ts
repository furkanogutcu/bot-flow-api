export const suspiciousActivityConfig = {
  unrecognizedLogin: {
    weights: {
      ipAddress: 0.5,
      device: 1,
      browser: 1,
      os: 1,
    },
  },
};
