import { useState } from 'react';
import { verifyResetOTP, forgotPassword } from '../../services/auth.service';

export default function VerifyResetOTPForm({ collegeEmail, onVerified, onBack }) {
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter the 6-digit OTP' });
      return;
    }
    setErrors({});

    setIsLoading(true);
    try {
      await verifyResetOTP({ collegeEmail, otp });
      onVerified();
    } catch (error) {
      const message =
        error.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setApiError('');
    setSuccessMessage('');
    setIsResending(true);
    try {
      await forgotPassword({ collegeEmail });
      setSuccessMessage('OTP resent to your email');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setApiError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Verify OTP</h2>
        <p>
          Enter the 6-digit code sent to <strong>{collegeEmail}</strong>
        </p>
      </div>

      {apiError && <div className="error-message" style={{ marginBottom: 0 }}>{apiError}</div>}
      {successMessage && <span className="success-text" style={{ marginBottom: 0 }}>{successMessage}</span>}

      <div className="form-group">
        <label htmlFor="reset-otp" className="form-label">
          Reset Code
        </label>
        <div className="input-wrapper">
          <span className="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input
            id="reset-otp"
            type="text"
            className={`form-input ${errors.otp ? 'error' : ''}`}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
          />
        </div>
        {errors.otp && <span className="error-message">{errors.otp}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-large" disabled={isLoading || otp.length !== 6}>
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <span className="form-hint">
        Didn't receive the code?{' '}
        <button
          type="button"
          className="forgot-password-btn"
          onClick={handleResendOTP}
          disabled={isResending}
        >
          {isResending ? 'Resending...' : 'Resend OTP'}
        </button>
      </span>

      <button
        type="button"
        className="btn btn-link"
        onClick={onBack}
      >
        ← Back to Forgot Password
      </button>
    </form>
  );
}
