import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check, ChevronRight, ChevronLeft, Upload,
  User, GraduationCap, MapPin, FileText,
  CheckCircle, Home, Camera, ArrowLeft
} from 'lucide-react'
import './Registration.css'

const STEPS = [
  { id: 0, title: 'Personal Information', icon: User, subtitle: 'Basic details about you' },
  { id: 1, title: 'Academic Information', icon: GraduationCap, subtitle: 'Course & college details' },
  { id: 2, title: 'Contact Information', icon: MapPin, subtitle: 'Address & guardian details' },
  { id: 3, title: 'Additional Details', icon: FileText, subtitle: 'Documents & links' },
]

const INITIAL_DATA = {
  fullName: '', studentCode: '', email: '', mobileNumber: '', dateOfBirth: '', gender: '',
  profilePhoto: null, profilePhotoPreview: '',
  course: '', department: '', admissionYear: '', currentSemester: '',
  rollNumber: '', universityRegNumber: '', section: '',
  fathersName: '', mothersName: '', guardianName: '', guardianMobile: '',
  alternateMobile: '', contactEmail: '',
  city: '', state: '', country: '', pinCode: '',
  resume: null, resumeName: '', skills: '', linkedinProfile: '',
  githubProfile: '', portfolio: '', additionalInfo: '',
}

const GENDERS = ['Male', 'Female', 'Other']

const COURSES = ['B.Tech', 'BCA', 'MCA', 'MBA', 'B.Sc']

const COURSE_DEPARTMENTS = {
  'B.Tech': ['Computer Science', 'Information Technology', 'Mechanical', 'Civil', 'Electrical', 'Electronics', 'AI & ML'],
  'BCA': ['Computer Applications'],
  'MCA': ['Computer Applications'],
  'MBA': ['Business Administration', 'Finance', 'Marketing', 'Human Resources'],
  'B.Sc': ['Computer Science', 'Mathematics', 'Physics', 'Chemistry'],
}

const ADMISSION_YEARS = ['2020', '2021', '2022', '2023', '2024', '2025', '2026']

const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8']

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

const COUNTRIES = ['India']

export default function Registration() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(INITIAL_DATA)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      updateField('profilePhoto', file)
      const reader = new FileReader()
      reader.onloadend = () => updateField('profilePhotoPreview', reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      updateField('resume', file)
      updateField('resumeName', file.name)
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    const d = formData

    if (step === 0) {
      if (!d.fullName.trim()) newErrors.fullName = 'Full name is required'
      if (!d.studentCode.trim()) newErrors.studentCode = 'Student code is required'
      if (!d.email.trim()) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) newErrors.email = 'Invalid email address'
      if (!d.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required'
      else if (!/^\d{10}$/.test(d.mobileNumber)) newErrors.mobileNumber = 'Must be 10 digits'
      if (!d.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
      if (!d.gender) newErrors.gender = 'Please select your gender'
    }

    if (step === 1) {
      if (!d.course) newErrors.course = 'Please select a course'
      if (!d.department) newErrors.department = 'Please select a department'
      if (!d.admissionYear) newErrors.admissionYear = 'Please select admission year'
      if (!d.currentSemester) newErrors.currentSemester = 'Please select semester'
      if (!d.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required'
      if (!d.universityRegNumber.trim()) newErrors.universityRegNumber = 'University registration number is required'
    }

    if (step === 2) {
      if (!d.fathersName.trim()) newErrors.fathersName = "Father's name is required"
      if (!d.mothersName.trim()) newErrors.mothersName = "Mother's name is required"
      if (!d.guardianName.trim()) newErrors.guardianName = "Guardian's name is required"
      if (!d.guardianMobile.trim()) newErrors.guardianMobile = 'Guardian mobile is required'
      else if (!/^\d{10}$/.test(d.guardianMobile)) newErrors.guardianMobile = 'Must be 10 digits'
      if (!d.city.trim()) newErrors.city = 'City is required'
      if (!d.state) newErrors.state = 'Please select a state'
      if (!d.country) newErrors.country = 'Please select a country'
      if (!d.pinCode.trim()) newErrors.pinCode = 'PIN code is required'
      else if (!/^\d{6}$/.test(d.pinCode)) newErrors.pinCode = 'Must be 6 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return
    console.log('Registration data:', formData)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="reg-page">
        <div className="reg-container">
          <div className="success-screen">
            <div className="success-icon-wrap">
              <CheckCircle size={64} className="success-icon" />
            </div>
            <h1 className="success-title">Registration Successful</h1>
            <p className="success-message">
              Your student profile has been created successfully.
            </p>
            <div className="success-actions">
              <button className="btn-primary" onClick={() => navigate('/')}>
                <Home size={18} />
                Go to Dashboard
              </button>
              <button className="btn-secondary" onClick={() => navigate('/auth')}>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reg-page">
      <aside className="reg-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <GraduationCap size={28} className="brand-icon" />
            <div>
              <h2 className="sidebar-title">Student Registration</h2>
              <p className="sidebar-subtitle">Complete your profile</p>
            </div>
          </div>
        </div>
        <nav className="step-indicator">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > index
            const isCurrent = currentStep === index
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={`step-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="step-marker">
                  {isCompleted ? (
                    <div className="step-check"><Check size={16} /></div>
                  ) : (
                    <div className="step-number">{index + 1}</div>
                  )}
                  {index < STEPS.length - 1 && <div className="step-line" />}
                </div>
                <div className="step-info">
                  <span className="step-label">{step.title}</span>
                  <span className="step-desc">{step.subtitle}</span>
                </div>
              </div>
            )
          })}
        </nav>
      </aside>

      <main className="reg-content">
        <div className="form-card">
          <div className="form-header">
            <h1 className="form-title">{STEPS[currentStep].title}</h1>
            <p className="form-subtitle">{STEPS[currentStep].subtitle}</p>
            <div className="step-progress">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>

          <div className="form-body">
            {currentStep === 0 && (
              <PersonalInfoStep
                data={formData}
                errors={errors}
                onChange={updateField}
                onPhotoChange={handlePhotoChange}
              />
            )}
            {currentStep === 1 && (
              <AcademicInfoStep
                data={formData}
                errors={errors}
                onChange={updateField}
              />
            )}
            {currentStep === 2 && (
              <ContactInfoStep
                data={formData}
                errors={errors}
                onChange={updateField}
              />
            )}
            {currentStep === 3 && (
              <AdditionalDetailsStep
                data={formData}
                errors={errors}
                onChange={updateField}
                onResumeChange={handleResumeChange}
              />
            )}
          </div>

          <div className="form-footer">
            {currentStep > 0 && (
              <button className="btn-outline" onClick={handleBack}>
                <ChevronLeft size={18} />
                Back
              </button>
            )}
            <div className="form-footer-right">
              {currentStep < STEPS.length - 1 ? (
                <button className="btn-primary" onClick={handleNext}>
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button className="btn-primary" onClick={handleSubmit}>
                  Submit
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function PersonalInfoStep({ data, errors, onChange, onPhotoChange }) {
  return (
    <div className="step-form">
      <div className="photo-upload-section">
        <div className="photo-preview" onClick={() => document.getElementById('photo-input')?.click()}>
          {data.profilePhotoPreview ? (
            <img src={data.profilePhotoPreview} alt="Preview" />
          ) : (
            <div className="photo-placeholder">
              <Camera size={32} />
              <span>Add Photo</span>
            </div>
          )}
        </div>
        <input type="file" id="photo-input" accept="image/*" onChange={onPhotoChange} hidden />
      </div>

      <div className="form-grid">
        <Field label="Full Name" error={errors.fullName} required>
          <input
            type="text"
            value={data.fullName}
            onChange={e => onChange('fullName', e.target.value)}
            placeholder="Enter your full name"
          />
        </Field>
        <Field label="Student Code" error={errors.studentCode} required>
          <input
            type="text"
            value={data.studentCode}
            onChange={e => onChange('studentCode', e.target.value)}
            placeholder="e.g. 5501"
          />
        </Field>
        <Field label="Email" error={errors.email} required>
          <input
            type="email"
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Mobile Number" error={errors.mobileNumber} required>
          <input
            type="tel"
            value={data.mobileNumber}
            onChange={e => onChange('mobileNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="9876543210"
          />
        </Field>
        <Field label="Date of Birth" error={errors.dateOfBirth} required>
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={e => onChange('dateOfBirth', e.target.value)}
          />
        </Field>
        <Field label="Gender" error={errors.gender} required>
          <select value={data.gender} onChange={e => onChange('gender', e.target.value)}>
            <option value="">Select gender</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
      </div>
    </div>
  )
}

function AcademicInfoStep({ data, errors, onChange }) {
  const departments = COURSE_DEPARTMENTS[data.course] || []

  return (
    <div className="step-form">
      <div className="form-grid">
        <Field label="Course" error={errors.course} required>
          <select value={data.course} onChange={e => {
            onChange('course', e.target.value)
            onChange('department', '')
          }}>
            <option value="">Select course</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Department" error={errors.department} required>
          <select
            value={data.department}
            onChange={e => onChange('department', e.target.value)}
            disabled={!data.course}
          >
            <option value="">{data.course ? 'Select department' : 'Select a course first'}</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="Admission Year" error={errors.admissionYear} required>
          <select value={data.admissionYear} onChange={e => onChange('admissionYear', e.target.value)}>
            <option value="">Select year</option>
            {ADMISSION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <Field label="Current Semester" error={errors.currentSemester} required>
          <select value={data.currentSemester} onChange={e => onChange('currentSemester', e.target.value)}>
            <option value="">Select semester</option>
            {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Roll Number" error={errors.rollNumber} required>
          <input
            type="text"
            value={data.rollNumber}
            onChange={e => onChange('rollNumber', e.target.value)}
            placeholder="Enter roll number"
          />
        </Field>
        <Field label="University Reg. Number" error={errors.universityRegNumber} required>
          <input
            type="text"
            value={data.universityRegNumber}
            onChange={e => onChange('universityRegNumber', e.target.value)}
            placeholder="Enter university registration number"
          />
        </Field>
        <Field label="Section (optional)" error={errors.section}>
          <input
            type="text"
            value={data.section}
            onChange={e => onChange('section', e.target.value)}
            placeholder="e.g. A"
          />
        </Field>
      </div>
    </div>
  )
}

function ContactInfoStep({ data, errors, onChange }) {
  return (
    <div className="step-form">
      <h3 className="section-label">Parent / Guardian Details</h3>
      <div className="form-grid">
        <Field label="Father's Name" error={errors.fathersName} required>
          <input
            type="text"
            value={data.fathersName}
            onChange={e => onChange('fathersName', e.target.value)}
            placeholder="Enter father's name"
          />
        </Field>
        <Field label="Mother's Name" error={errors.mothersName} required>
          <input
            type="text"
            value={data.mothersName}
            onChange={e => onChange('mothersName', e.target.value)}
            placeholder="Enter mother's name"
          />
        </Field>
        <Field label="Guardian Name" error={errors.guardianName} required>
          <input
            type="text"
            value={data.guardianName}
            onChange={e => onChange('guardianName', e.target.value)}
            placeholder="Enter guardian's name"
          />
        </Field>
        <Field label="Guardian Mobile" error={errors.guardianMobile} required>
          <input
            type="tel"
            value={data.guardianMobile}
            onChange={e => onChange('guardianMobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
          />
        </Field>
        <Field label="Alternate Mobile (optional)" error={errors.alternateMobile}>
          <input
            type="tel"
            value={data.alternateMobile}
            onChange={e => onChange('alternateMobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="Alternate contact number"
          />
        </Field>
        <Field label="Contact Email (optional)" error={errors.contactEmail}>
          <input
            type="email"
            value={data.contactEmail}
            onChange={e => onChange('contactEmail', e.target.value)}
            placeholder="Alternate email address"
          />
        </Field>
      </div>

      <h3 className="section-label">Address Details</h3>
      <div className="form-grid">
        <div className="field-full">
          <Field label="Address (optional)" error={errors.address}>
            <textarea
              value={data.address}
              onChange={e => onChange('address', e.target.value)}
              placeholder="Enter full address"
              rows={3}
            />
          </Field>
        </div>
        <Field label="City" error={errors.city} required>
          <input
            type="text"
            value={data.city}
            onChange={e => onChange('city', e.target.value)}
            placeholder="Enter city"
          />
        </Field>
        <Field label="State" error={errors.state} required>
          <select value={data.state} onChange={e => onChange('state', e.target.value)}>
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Country" error={errors.country} required>
          <select value={data.country} onChange={e => onChange('country', e.target.value)}>
            <option value="">Select country</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="PIN Code" error={errors.pinCode} required>
          <input
            type="text"
            value={data.pinCode}
            onChange={e => onChange('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit PIN code"
          />
        </Field>
      </div>
    </div>
  )
}

function AdditionalDetailsStep({ data, errors, onChange, onResumeChange }) {
  return (
    <div className="step-form">
      <div className="form-grid">
        <div className="field-full">
          <Field label="Resume (optional)" error={errors.resume}>
            <div className="file-upload" onClick={() => document.getElementById('resume-input')?.click()}>
              <Upload size={20} />
              <span>{data.resumeName || 'Upload Resume (PDF, DOC)'}</span>
            </div>
            <input type="file" id="resume-input" accept=".pdf,.doc,.docx" onChange={onResumeChange} hidden />
          </Field>
        </div>
        <Field label="Skills (optional)" error={errors.skills}>
          <input
            type="text"
            value={data.skills}
            onChange={e => onChange('skills', e.target.value)}
            placeholder="e.g. Python, JavaScript, React"
          />
        </Field>
        <Field label="LinkedIn Profile (optional)" error={errors.linkedinProfile}>
          <input
            type="url"
            value={data.linkedinProfile}
            onChange={e => onChange('linkedinProfile', e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
        </Field>
        <Field label="GitHub Profile (optional)" error={errors.githubProfile}>
          <input
            type="url"
            value={data.githubProfile}
            onChange={e => onChange('githubProfile', e.target.value)}
            placeholder="https://github.com/username"
          />
        </Field>
        <Field label="Portfolio (optional)" error={errors.portfolio}>
          <input
            type="url"
            value={data.portfolio}
            onChange={e => onChange('portfolio', e.target.value)}
            placeholder="https://your-portfolio.com"
          />
        </Field>
        <div className="field-full">
          <Field label="Additional Information (optional)" error={errors.additionalInfo}>
            <textarea
              value={data.additionalInfo}
              onChange={e => onChange('additionalInfo', e.target.value)}
              placeholder="Any other information you'd like to share"
              rows={3}
            />
          </Field>
        </div>
      </div>
    </div>
  )
}

function Field({ label, error, children, required }) {
  return (
    <div className={`field ${error ? 'field-error' : ''}`}>
      <label className="field-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      {children}
      {error && <span className="field-error-msg">{error}</span>}
    </div>
  )
}
