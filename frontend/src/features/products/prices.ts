export const formatPrice = (price: number | null) => {
  if (price === null) {
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${price} ден.`;
};
