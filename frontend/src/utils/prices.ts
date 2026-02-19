export const getStylesForPrices = (discountPrice: number | null) => {
  const hasDiscountPrice = discountPrice !== null;
  const priceStyles = hasDiscountPrice
    ? 'line-through text-accent text-sm text-primary'
    : 'text-xl font-semibold text-primary';
  const discountPriceStyles = hasDiscountPrice
    ? 'text-xl font-semibold ml-2 text-accent'
    : 'hidden';

  return { priceStyles, discountPriceStyles };
};

export const formatPrice = (price: number | null) => {
  if (price === null) {
    return '';
  }

  return `${price} ден.`;
};
