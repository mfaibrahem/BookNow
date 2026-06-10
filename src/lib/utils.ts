export const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  } else if (price >= 100000) {
    return `$${(price / 1000).toFixed(0)}K`;
  } else if (price >= 10000) {
    return `$${(price / 1000).toFixed(1)}K`;
  } else if (price >= 1000) {
    return `$${(price / 1000).toFixed(2)}K`;
  }
  return `$${price.toLocaleString()}`;
};
