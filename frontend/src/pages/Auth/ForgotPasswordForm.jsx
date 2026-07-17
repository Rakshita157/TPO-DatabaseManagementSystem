import { useState } from 'react';
import { forgotPassword } from '../../services/auth.service';

export default function ForgotPasswordForm({ onBackToLogin, onEmailSubmitted }) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@gweca\.ac\.in$/.test(email)) {
      newErrors.email = 'Only @gweca.ac.in email addresses are allowed';
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
      await forgotPassword({ collegeEmail: email });
      onEmailSubmitted(email);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Reset Your Password</h2>
        <p>Enter your college email and we'll send you a verification code</p>
      </div>

      {apiError && <div className="error-message" style={{ marginBottom: 0 }}>{apiError}</div>}

      <div className="form-group">
        <label htmlFor="forgot-email" className="form-label">
          Email Address
        </label>
        <div className="input-wrapper">
          <span className="input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </span>
          <input
            id="forgot-email"
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="@gweca.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-large" disabled={isLoading}>
        {isLoading ? 'Sending OTP...' : 'Send OTP'}
      </button>

      <button
        type="button"
        className="btn btn-link"
        onClick={onBackToLogin}
      >
        ← Back to Login
      </button>
    </form>
  );
}
