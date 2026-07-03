import { useState } from 'react';

export default function SignupForm({ onSwitchToLogin }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Form is valid - no backend call for now
      console.log('Form submitted:', {
        fullName,
        email,
        password,
        confirmPassword,
      });
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Create Account</h2>
        <p>Join us to get started with your placement journey</p>
      </div>

      <div className="form-group">
        <label htmlFor="signup-name" className="form-label">
          Full Name
        </label>
        <input
          id="signup-name"
          type="text"
          className={`form-input ${errors.fullName ? 'error' : ''}`}
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        {errors.fullName && <span className="error-message">{errors.fullName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="signup-email" className="form-label">
          Email Address
        </label>
        <input
          id="signup-email"
          type="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="@gweca.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="signup-password" className="form-label">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          className={`form-input ${errors.password ? 'error' : ''}`}
          placeholder="Enter a strong password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
        <span className="password-hint">
          At least 6 characters with uppercase, lowercase, and numbers
        </span>
      </div>

      <div className="form-group">
        <label htmlFor="signup-confirm-password" className="form-label">
          Confirm Password
        </label>
        <input
          id="signup-confirm-password"
          type="password"
          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errors.confirmPassword && (
          <span className="error-message">{errors.confirmPassword}</span>
        )}
      </div>

      <button type="submit" className="btn btn-primary btn-large">
        Create Account
      </button>

      <div className="form-divider">
        <span>Already have an account?</span>
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-large"
        onClick={onSwitchToLogin}
      >
        Sign In
      </button>
    </form>
  );
}
