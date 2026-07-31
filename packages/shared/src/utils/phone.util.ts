export const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d+]/g, '');
};

export const isValidPhone = (phone: string): boolean => {
  // Simple validation for international format or local
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(sanitizePhone(phone));
};
