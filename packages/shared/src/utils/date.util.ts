export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isFutureDate = (date: Date): boolean => {
  return date.getTime() > new Date().getTime();
};
