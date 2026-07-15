import { useState } from 'react';
import { signup, sendOTP, verifyOTP } from '../../services/auth.service';

export default function SignupForm({ onSwitchToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [lastVerifiedEmail, setLastVerifiedEmail] = useState('');

  const isValidEmail = email && /^[^\s@]+@gweca\.ac\.in$/.test(email);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail !== lastVerifiedEmail) {
      setOtpVerified(false);
      setOtpSent(false);
      setOtp('');
      setOtpError('');
      setOtpSuccess('');
    }
  };

  const handleSendOTP = async () => {
    setOtpError('');
    setOtpSuccess('');
    setOtpLoading(true);
    try {
      await sendOTP({ collegeEmail: email });
      setOtpSent(true);
      setOtpSuccess('OTP sent to your email');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setOtpError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');
    setOtpSuccess('');
    setVerifyLoading(true);
    try {
      await verifyOTP({ collegeEmail: email, otp });
      setOtpVerified(true);
      setOtpSuccess('Email verified successfully');
      setLastVerifiedEmail(email);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Verification failed. Please try again.';
      setOtpError(message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@gweca\.ac\.in$/.test(email)) {
      newErrors.email = 'Only @gweca.ac.in email addresses are allowed';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signup({
        fullName,
        collegeEmail: email,
        password,
      });
      setIsSuccess(true);
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Something went wrong. Please try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-form">
        <div className="form-header">
          <h2>Account Created!</h2>
        </div>
        <div className="success-message">
          <div className="success-icon">✓</div>
          <p>Account created successfully</p>
          <p className="success-hint">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Create Account</h2>
        <p>Join us to get started with your placement journey</p>
      </div>

      {apiError && <div className="error-message" style={{ marginBottom: 0 }}>{apiError}</div>}

      <div className="form-group">
        <label htmlFor="signup-name" className="form-label">
          Full Name
        </label>
        <div className="input-wrapper">
          <span className="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <input
            id="signup-name"
            type="text"
            className={`form-input ${errors.fullName ? 'error' : ''}`}
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="signup-email" className="form-label">
          College Email
        </label>
        <div className="input-wrapper">
          <span className="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </span>
          <input
            id="signup-email"
            type="email"
            className={`form-input ${errors.email || otpError ? 'error' : ''} ${otpVerified ? 'verified' : ''}`}
            placeholder="@gweca.ac.in"
            value={email}
            onChange={handleEmailChange}
            disabled={otpVerified}
          />
          {isValidEmail && !otpVerified && (
            <button
              type="button"
              className="btn btn-verify"
              onClick={handleSendOTP}
              disabled={otpLoading}
            >
              {otpLoading ? 'Sending...' : 'Verify'}
            </button>
          )}
          {otpVerified && (
            <span className="verified-badge">✓</span>
          )}
        </div>
        {errors.email && <span className="error-message">{errors.email}</span>}
        {otpError && !errors.email && <span className="error-message">{otpError}</span>}
        {otpSuccess && <span className="success-text">{otpSuccess}</span>}
      </div>

      {otpSent && !otpVerified && (
        <div className="form-group">
          <label htmlFor="signup-otp" className="form-label">
            Enter OTP
          </label>
          <div className="input-wrapper">
            <span className="input-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              id="signup-otp"
              type="text"
              className="form-input"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
            <button
              type="button"
              className="btn btn-verify"
              onClick={handleVerifyOTP}
              disabled={verifyLoading || otp.length !== 6}
            >
              {verifyLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
          <span className="form-hint">
            OTP expires in 5 minutes.{' '}
            <button type="button" className="forgot-password-btn" onClick={handleSendOTP} disabled={otpLoading}>
              Resend OTP
            </button>
          </span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="signup-password" className="form-label">
          Password
        </label>
        <div className="input-wrapper">
          <span className="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Enter a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        {errors.password && <span className="error-message">{errors.password}</span>}
        <span className="password-hint">
          At least 6 characters with uppercase, lowercase, and numbers
        </span>
      </div>

      <div className="form-group">
        <label htmlFor="signup-confirm-password" className="form-label">
          Confirm Password
        </label>
        <div className="input-wrapper">
          <span className="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input
            id="signup-confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}
      </div>

      <button type="submit" className="btn btn-primary btn-large" disabled={isLoading || !otpVerified}>
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="form-divider">
        <span>Already have an account?</span>
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-large"
        onClick={onSwitchToLogin}
        disabled={isLoading}
      >
        Sign In
      </button>
    </form>
  );
}
