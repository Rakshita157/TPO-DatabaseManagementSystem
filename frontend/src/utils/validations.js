import { REGEX } from '../constants/regex';

export const required = (msg) => ({ required: msg });
export const pattern = (regex, msg) => ({ pattern: { value: regex, message: msg } });
export const minLen = (n, msg) => ({ minLength: { value: n, message: msg } });

export const fullName = () => ({
  ...required('Full name is required'),
  ...minLen(2, 'Must be at least 2 characters'),
  maxLength: { value: 100, message: 'Must be at most 100 characters' },
});

export const collegeEmail = () => ({
  ...required('College email is required'),
  ...pattern(REGEX.EMAIL_GWECA, 'Only @gweca.ac.in emails allowed'),
});

export const personalEmail = () => ({
  ...required('Personal email is required'),
  ...pattern(REGEX.EMAIL, 'Invalid email address'),
});

export const optionalEmail = () => ({
  pattern: { value: REGEX.EMAIL, message: 'Invalid email address' },
});

export const password = () => ({
  ...required('Password is required'),
  ...minLen(6, 'Must be at least 6 characters'),
  ...pattern(REGEX.PASSWORD, 'Must contain uppercase, lowercase, and numbers'),
});

export const confirmPassword = (getPassword) => ({
  ...required('Please confirm your password'),
  validate: (val) => val === getPassword() || 'Passwords do not match',
});

export const phone10 = (label = 'Mobile number') => ({
  ...required(`${label} is required`),
  ...pattern(REGEX.PHONE_INDIA, 'Must be 10 digits starting with 6-9'),
});

export const aadhar = () => ({
  ...required('Aadhar number is required'),
  ...pattern(REGEX.AADHAR, 'Must be 12 digits'),
});

export const pan = () => ({
  pattern: { value: REGEX.PAN, message: 'Invalid PAN format (e.g. ABCDE1234F)' },
});

export const pinCode = () => ({
  ...required('PIN code is required'),
  ...pattern(REGEX.PIN_INDIA, 'Must be 6 digits'),
});

export const cgpa = () => ({
  ...required('CGPA is required'),
  validate: (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return 'Must be a valid number';
    if (n < 0 || n > 10) return 'Must be between 0 and 10';
    return true;
  },
});

export const percentage = (fieldName = 'Percentage') => ({
  ...required(`${fieldName} is required`),
  validate: (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return 'Must be a valid number';
    if (n < 0 || n > 100) return 'Must be between 0 and 100';
    return true;
  },
});

export const optionalPercentage = () => ({
  validate: (val) => {
    if (!val) return true;
    const n = parseFloat(val);
    if (isNaN(n)) return 'Must be a valid number';
    if (n < 0 || n > 100) return 'Must be between 0 and 100';
    return true;
  },
});

export const nonNegativeInt = (label = 'Value') => ({
  ...required(`${label} is required`),
  validate: (val) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0) return 'Must be a non-negative number';
    return true;
  },
});

export const yearSelect = (label = 'Year') => ({
  ...required(`Please select ${label}`),
});

export const selectRequired = (label = 'Selection') => ({
  ...required(`Please select ${label}`),
});

export const address = (label = 'Address') => ({
  ...required(`${label} is required`),
  ...minLen(5, 'Must be at least 5 characters'),
});

export const city = (label = 'City') => ({
  ...required(`${label} is required`),
  ...minLen(2, 'Must be at least 2 characters'),
  ...pattern(REGEX.ALPHABETS_SPACES, 'Only letters and spaces allowed'),
});

export const stateSelect = () => ({
  ...required('Please select a state'),
});

export const resumeUrl = () => ({
  ...required('Resume link is required'),
  ...pattern(REGEX.URL, 'Invalid URL format'),
});

export const linkedinUrl = () => ({
  pattern: { value: REGEX.LINKEDIN, message: 'Must be a valid LinkedIn profile URL' },
});

export const ageRange = (min = 15, max = 30) => ({
  ...required('Date of birth is required'),
  validate: (val) => {
    const dob = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    if (age < min || age > max) return `Age must be between ${min} and ${max}`;
    return true;
  },
});

export const sgpa = () => ({
  validate: (val) => {
    if (!val) return true;
    const n = parseFloat(val);
    if (isNaN(n)) return 'Must be a valid number';
    if (n < 0 || n > 10) return 'Must be between 0 and 10';
    return true;
  },
});

export const genderSelect = () => ({
  ...required('Gender is required'),
});

export const optionalPhone10 = () => ({
  pattern: { value: REGEX.PHONE_INDIA, message: 'Must be 10 digits starting with 6-9' },
});
