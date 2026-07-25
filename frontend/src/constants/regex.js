export const REGEX = {
  EMAIL_GWECA: /^[^\s@]+@gweca\.ac\.in$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_INDIA: /^[6-9]\d{9}$/,
  AADHAR: /^\d{12}$/,
  PAN: /^[A-Z]{5}\d{4}[A-Z]$/,
  PIN_INDIA: /^\d{6}$/,
  OTP_6: /^\d{6}$/,
  URL: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?$/,
  LINKEDIN: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
  PASSWORD: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  ALPHABETS_SPACES: /^[a-zA-Z\s]+$/,
};
