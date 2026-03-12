export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "KRW",
  }).format(value);
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatSignedPercent(value: number) {
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}${formatPercent(Math.abs(value))}`;
}

export function formatSignedCurrency(value: number) {
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
}

export function getProfitTone(value: number) {
  if (value > 0) {
    return "profit-positive";
  }

  if (value < 0) {
    return "profit-negative";
  }

  return "profit-neutral";
}
