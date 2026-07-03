import { useState } from 'react';

export default function LoginForm({ onSwitchToSignup, onForgotPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Form is valid - no backend call for now
      console.log('Form submitted:', { email, password });
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Welcome Back</h2>
        <p>Sign in to your account to continue</p>
      </div>

      <div className="form-group">
        <label htmlFor="login-email" className="form-label">
          Email Address
        </label>
        <input
          id="login-email"
          type="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="@gweca.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-group">
        <div className="form-label-wrapper">
          <label htmlFor="login-password" className="form-label">
            Password
          </label>
          <button
            type="button"
            className="forgot-password-btn"
            onClick={onForgotPassword}
          >
            Forgot?
          </button>
        </div>
        <input
          id="login-password"
          type="password"
          className={`form-input ${errors.password ? 'error' : ''}`}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-large">
        Sign In
      </button>

      <div className="form-divider">
        <span>Don't have an account?</span>
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-large"
        onClick={onSwitchToSignup}
      >
        Create Account
      </button>
    </form>
  );
}
