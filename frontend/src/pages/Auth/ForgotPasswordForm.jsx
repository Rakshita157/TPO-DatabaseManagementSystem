import { useState } from 'react';

export default function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Form is valid - no backend call for now
      console.log('Forgot password submitted:', { email });
      setIsSubmitted(true);
      setTimeout(() => {
        onBackToLogin();
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  if (isSubmitted) {
    return (
      <div className="auth-form">
        <div className="form-header">
          <h2>Check Your Email</h2>
        </div>
        <div className="success-message">
          <div className="success-icon">✓</div>
          <p>
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="success-hint">
            Please check your email and follow the link to reset your password.
            If you don't see the email, check your spam folder.
          </p>
        </div>
        <p className="form-hint">Redirecting to login in a moment...</p>
      </div>
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Reset Your Password</h2>
        <p>Enter your email address and we'll send you a link to reset your password</p>
      </div>

      <div className="form-group">
        <label htmlFor="forgot-email" className="form-label">
          Email Address
        </label>
        <input
          id="forgot-email"
          type="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="@gweca.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-large">
        Send Reset Link
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
