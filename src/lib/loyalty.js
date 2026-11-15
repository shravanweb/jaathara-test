export function pointsForPrice(price, menuConfig) {
  if (!menuConfig || menuConfig.loyaltyEnabled !== true) return null;
  const rate = Number(menuConfig.pointsPerDollar);
  const ptsPer = Number.isFinite(rate) && rate > 0 ? rate : 10;
  const n = Number(price);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * ptsPer);
}

export function earnPointsLabel(price, menuConfig) {
  const pts = pointsForPrice(price, menuConfig);
  return pts == null ? null : `Earn ${pts} pts`;
}

export function youWillEarnLabel(price, menuConfig) {
  const pts = pointsForPrice(price, menuConfig);
  return pts == null ? null : `You'll earn ${pts} pts`;
}
