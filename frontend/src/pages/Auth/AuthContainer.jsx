import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import VerifyResetOTPForm from './VerifyResetOTPForm';
import ResetPasswordForm from './ResetPasswordForm';
import './Auth.css';

export default function AuthContainer() {
  const [activeForm, setActiveForm] = useState('login');
  const [resetEmail, setResetEmail] = useState('');

  const handleSwitchToSignup = () => setActiveForm('signup');
  const handleSwitchToLogin = () => {
    setActiveForm('login');
    setResetEmail('');
  };
  const handleSwitchToForgotPassword = () => setActiveForm('forgot');

  const handleEmailSubmitted = (email) => {
    setResetEmail(email);
    setActiveForm('verify-otp');
  };

  const handleOTPVerified = () => setActiveForm('reset-password');

  const handlePasswordReset = () => {
    setActiveForm('login');
    setResetEmail('');
  };

  const handleBackToForgot = () => setActiveForm('forgot');

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="auth-logo">
            <h1>TPO Portal</h1>
            <p>Placement Management System</p>
          </div>
          <div className="auth-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Streamlined Application Process</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Real-time Opportunity Tracking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Secure Document Management</span>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="auth-forms">
          <div className={`form-wrapper ${activeForm === 'login' ? 'active' : ''}`}>
            {activeForm === 'login' && (
              <LoginForm
                onSwitchToSignup={handleSwitchToSignup}
                onForgotPassword={handleSwitchToForgotPassword}
              />
            )}
          </div>

          <div className={`form-wrapper ${activeForm === 'signup' ? 'active' : ''}`}>
            {activeForm === 'signup' && (
              <SignupForm onSwitchToLogin={handleSwitchToLogin} />
            )}
          </div>

          <div className={`form-wrapper ${activeForm === 'forgot' ? 'active' : ''}`}>
            {activeForm === 'forgot' && (
              <ForgotPasswordForm
                onBackToLogin={handleSwitchToLogin}
                onEmailSubmitted={handleEmailSubmitted}
              />
            )}
          </div>

          <div className={`form-wrapper ${activeForm === 'verify-otp' ? 'active' : ''}`}>
            {activeForm === 'verify-otp' && (
              <VerifyResetOTPForm
                collegeEmail={resetEmail}
                onVerified={handleOTPVerified}
                onBack={handleBackToForgot}
              />
            )}
          </div>

          <div className={`form-wrapper ${activeForm === 'reset-password' ? 'active' : ''}`}>
            {activeForm === 'reset-password' && (
              <ResetPasswordForm
                collegeEmail={resetEmail}
                onSuccess={handlePasswordReset}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
