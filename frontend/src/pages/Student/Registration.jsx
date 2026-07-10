import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check, ChevronRight, ChevronLeft,
  User, GraduationCap, MapPin, FileText,
  CheckCircle, Home, Camera, Info
} from 'lucide-react'
import { createStudentProfile, createSemesterResult, uploadDocument } from '../../services/student.service'
import './Registration.css'

const STEPS = [
  { id: 0, title: 'Personal Information', icon: User, subtitle: 'Basic details & account setup' },
  { id: 1, title: 'Academic Information', icon: GraduationCap, subtitle: 'Course, college & marks details' },
  { id: 2, title: 'Contact Information', icon: MapPin, subtitle: 'Address & contact details' },
  { id: 3, title: 'Documents', icon: FileText, subtitle: 'Upload documents & links' },
]

const INITIAL_DATA = {
  fullName: '', email: '', personalEmail: '', alternateEmail: '',
  profilePhoto: null, profilePhotoPreview: '',
  mobileNumber: '', whatsappNumber: '', dateOfBirth: '',
  aadharNumber: '', panNumber: '',
  course: '', department: '',
  mbaSpecialization1: '', mbaSpecialization2: '',
  admissionYear: '', graduationYear: '', currentYear: '', currentSemester: '',
  btuRollNumber: '', enrollmentNumber: '',
  cgpa: '', activeBacklogs: '', passiveBacklogs: '',
  tenthPercentage: '', tenthYear: '', tenthBoard: '',
  twelfthPercentage: '', twelfthYear: '', twelfthBoard: '',
  diplomaPercentage: '', diplomaYear: '',
  alternateMobile: '',
  currentAddress: '', permanentAddress: '',
  nativeCity: '', nativeDistrict: '', nativeState: '', pinCode: '',
  resumeUrl: '',
  linkedinUrl: '',
  sgpa: {},
}

const COURSES = ['B.Tech', 'M.Tech', 'MBA', 'MCA']

const COURSE_DEPARTMENTS = {
  'B.Tech': ['Computer Science', 'Information Technology', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Electronics & Communication', 'Artificial Intelligence & Machine Learning'],
  'M.Tech': ['Computer Science', 'VLSI Design', 'Power Systems', 'Structural Engineering'],
  'MCA': ['Computer Applications'],
}

const MBA_SPECIALIZATIONS = ['Marketing', 'Finance', 'Human Resources']

const COURSE_DURATION = { 'B.Tech': 4, 'M.Tech': 2, 'MBA': 2, 'MCA': 2 }

const CURRENT_YEAR = new Date().getFullYear()
const ADMISSION_YEARS = Array.from({ length: 10 }, (_, i) => `${CURRENT_YEAR - 9 + i}`)

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

export default function Registration() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(INITIAL_DATA)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/auth')
      return
    }
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setFormData(prev => ({
          ...prev,
          fullName: user.fullName || '',
          email: user.collegeEmail || '',
        }))
      } catch (_) {}
    }
  }, [navigate])

  useEffect(() => {
    if (formData.admissionYear && formData.course) {
      const duration = COURSE_DURATION[formData.course]
      if (duration) {
        const gradYear = parseInt(formData.admissionYear) + duration
        setFormData(prev => ({ ...prev, graduationYear: String(gradYear) }))
      }
    }
  }, [formData.admissionYear, formData.course])

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const updateSgpa = (semester, value) => {
    setFormData(prev => ({
      ...prev,
      sgpa: { ...prev.sgpa, [semester]: value }
    }))
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

  const validateStep = (step) => {
    const newErrors = {}
    const d = formData

    if (step === 0) {
      if (!d.fullName.trim()) newErrors.fullName = 'Full name is required'
      if (!d.email.trim()) newErrors.email = 'College email is required'
      else if (!/^[^\s@]+@gweca\.ac\.in$/.test(d.email)) newErrors.email = 'Only @gweca.ac.in emails allowed'
      if (!d.personalEmail.trim()) newErrors.personalEmail = 'Personal email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.personalEmail)) newErrors.personalEmail = 'Invalid email address'
      if (!d.mobileNumber.trim()) newErrors.mobileNumber = 'Mobile number is required'
      else if (!/^\d{10}$/.test(d.mobileNumber)) newErrors.mobileNumber = 'Must be 10 digits'
      if (!d.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
      if (!d.aadharNumber.trim()) newErrors.aadharNumber = 'Aadhar number is required'
      else if (!/^\d{12}$/.test(d.aadharNumber)) newErrors.aadharNumber = 'Must be 12 digits'
      if (!d.whatsappNumber.trim()) newErrors.whatsappNumber = 'WhatsApp number is required'
      else if (!/^\d{10}$/.test(d.whatsappNumber)) newErrors.whatsappNumber = 'Must be 10 digits'
    }

    if (step === 1) {
      if (!d.course) newErrors.course = 'Please select a course'
      if (d.course && d.course !== 'MBA') {
        if (!d.department) newErrors.department = 'Please select a department'
      }
      if (d.course === 'MBA') {
        if (!d.mbaSpecialization1) newErrors.mbaSpecialization1 = 'Please select first specialization'
      }
      if (!d.admissionYear) newErrors.admissionYear = 'Please select admission year'
      if (!d.currentYear) newErrors.currentYear = 'Please select current year'
      if (!d.currentSemester) newErrors.currentSemester = 'Please select semester'
      if (!d.btuRollNumber.trim()) newErrors.btuRollNumber = 'BTU roll number is required'
      if (!d.enrollmentNumber.trim()) newErrors.enrollmentNumber = 'Enrollment number is required'
      if (!d.tenthPercentage.trim()) newErrors.tenthPercentage = '10th percentage is required'
      if (!d.tenthYear) newErrors.tenthYear = '10th year is required'
      if (!d.tenthBoard.trim()) newErrors.tenthBoard = '10th board is required'
      if (!d.twelfthPercentage.trim()) newErrors.twelfthPercentage = '12th percentage is required'
      if (!d.twelfthYear) newErrors.twelfthYear = '12th year is required'
      if (!d.twelfthBoard.trim()) newErrors.twelfthBoard = '12th board is required'
      if (!d.graduationYear) newErrors.graduationYear = 'Graduation year is required'
      if (!d.activeBacklogs.trim()) newErrors.activeBacklogs = 'Active backlogs is required'
      if (!d.passiveBacklogs.trim()) newErrors.passiveBacklogs = 'Passive backlogs is required'
      if (!d.cgpa.trim()) newErrors.cgpa = 'CGPA is required'
      else if (isNaN(parseFloat(d.cgpa)) || parseFloat(d.cgpa) < 0 || parseFloat(d.cgpa) > 10) newErrors.cgpa = 'Enter a valid CGPA (0-10)'
    }

    if (step === 2) {
      if (!d.currentAddress.trim()) newErrors.currentAddress = 'Current address is required'
      if (!d.nativeCity.trim()) newErrors.nativeCity = 'City is required'
      if (!d.nativeDistrict.trim()) newErrors.nativeDistrict = 'District is required'
      if (!d.nativeState) newErrors.nativeState = 'Please select a state'
      if (!d.pinCode.trim()) newErrors.pinCode = 'PIN code is required'
      else if (!/^\d{6}$/.test(d.pinCode)) newErrors.pinCode = 'Must be 6 digits'
      if (!d.permanentAddress.trim()) newErrors.permanentAddress = 'Permanent address is required'
    }

    if (step === 3) {
      if (!d.resumeUrl.trim()) newErrors.resume = 'Resume link is required'
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

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return
    setSubmitting(true)
    setSubmitError('')

    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        setSubmitError('You must be logged in to register')
        setSubmitting(false)
        return
      }
      const user = JSON.parse(storedUser)
      const userId = user.id

      const profilePayload = {
        userId,
        course: formData.course === 'B.Tech' ? 'BTECH' : formData.course === 'M.Tech' ? 'MTECH' : formData.course.toUpperCase(),
        department: formData.course === 'MBA' ? null : formData.department,
        mbaSpecialization1: formData.course === 'MBA' ? formData.mbaSpecialization1 : null,
        mbaSpecialization2: formData.course === 'MBA' ? formData.mbaSpecialization2 : null,
        admissionYear: parseInt(formData.admissionYear),
        graduationYear: parseInt(formData.graduationYear),
        currentYear: parseInt(formData.currentYear || '1'),
        currentSemester: parseInt(formData.currentSemester),
        collegeId: `GWECA_${userId}`,
        btuRollNumber: formData.btuRollNumber,
        enrollmentNumber: formData.enrollmentNumber,
        dob: new Date(formData.dateOfBirth).toISOString(),
        gender: 'Female',
        phoneNumber: formData.mobileNumber,
        whatsappNumber: formData.whatsappNumber,
        alternatePhone: formData.alternateMobile || null,
        alternateEmail: formData.alternateEmail || null,
        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress || formData.currentAddress,
        nativeCity: formData.nativeCity,
        nativeDistrict: formData.nativeDistrict,
        nativeState: formData.nativeState,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber || null,
        tenthPercentage: parseFloat(formData.tenthPercentage),
        tenthYear: parseInt(formData.tenthYear),
        tenthBoard: formData.tenthBoard,
        twelfthPercentage: parseFloat(formData.twelfthPercentage),
        twelfthYear: parseInt(formData.twelfthYear),
        twelfthBoard: formData.twelfthBoard,
        diplomaPercentage: formData.diplomaPercentage ? parseFloat(formData.diplomaPercentage) : null,
        diplomaYear: formData.diplomaYear ? parseInt(formData.diplomaYear) : null,
        cgpa: parseFloat(formData.cgpa),
        activeBacklogs: parseInt(formData.activeBacklogs),
        passiveBacklogs: parseInt(formData.passiveBacklogs),
        linkedinUrl: formData.linkedinUrl || null,
      }

      await createStudentProfile(profilePayload)

      const sgpaEntries = Object.entries(formData.sgpa).filter(
        ([, sgpa]) => sgpa && sgpa.trim() !== ''
      )
      if (sgpaEntries.length > 0) {
        await Promise.all(
          sgpaEntries.map(([semester, sgpa]) =>
            createSemesterResult({
              userId,
              semester: parseInt(semester),
              sgpa: parseFloat(sgpa),
            })
          )
        )
      }

      if (formData.resumeUrl.trim()) {
        await uploadDocument({ resumeUrl: formData.resumeUrl })
      }

      navigate('/student/profile')
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Something went wrong'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const getSemesterOptions = () => {
    if (!formData.course) return SEMESTERS
    const duration = COURSE_DURATION[formData.course]
    return duration ? SEMESTERS.slice(0, duration * 2) : SEMESTERS
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
                Go to Home
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
                onSgpaChange={updateSgpa}
                getSemesterOptions={getSemesterOptions}
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
              <DocumentsStep
                data={formData}
                errors={errors}
                onChange={updateField}
              />
            )}
          </div>

          <div className="form-footer">
            {currentStep > 0 && (
              <button className="btn-outline" onClick={handleBack} disabled={submitting}>
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
                <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit'}
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>

          {submitError && (
            <div className="submit-error-bar">
              <Info size={16} />
              {submitError}
            </div>
          )}
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
            readOnly
            placeholder="Enter your full name"
          />
        </Field>
        <Field label="College Email" error={errors.email} required>
          <input
            type="email"
            value={data.email}
            readOnly
            placeholder="@gweca.ac.in"
          />
        </Field>
        <Field label="Personal Email" error={errors.personalEmail} required>
          <input
            type="email"
            value={data.personalEmail}
            onChange={e => onChange('personalEmail', e.target.value)}
            placeholder="your@email.com"
          />
        </Field>
        <Field label="Alternative Email (College Email)" error={errors.alternateEmail}>
          <input
            type="email"
            value={data.alternateEmail}
            onChange={e => onChange('alternateEmail', e.target.value)}
            placeholder="you@college.edu.in"
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
        <Field label="WhatsApp Number" error={errors.whatsappNumber} required>
          <input
            type="tel"
            value={data.whatsappNumber}
            onChange={e => onChange('whatsappNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="WhatsApp number"
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
          <div className="gender-fixed">Female</div>
        </Field>
        <Field label="Aadhar Number" error={errors.aadharNumber} required>
          <input
            type="text"
            value={data.aadharNumber}
            onChange={e => onChange('aadharNumber', e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="12-digit Aadhar number"
          />
        </Field>
        <Field label="PAN Number (optional)" error={errors.panNumber}>
          <input
            type="text"
            value={data.panNumber}
            onChange={e => onChange('panNumber', e.target.value.toUpperCase())}
            placeholder="e.g. ABCDE1234F"
          />
        </Field>
      </div>
    </div>
  )
}

function AcademicInfoStep({ data, errors, onChange, onSgpaChange, getSemesterOptions }) {
  const departments = COURSE_DEPARTMENTS[data.course] || []
  const isMba = data.course === 'MBA'

  return (
    <div className="step-form">
      <h3 className="section-label">Course & College Details</h3>
      <div className="form-grid">
        <Field label="Course" error={errors.course} required>
          <select value={data.course} onChange={e => {
            onChange('course', e.target.value)
            onChange('department', '')
            onChange('mbaSpecialization1', '')
            onChange('mbaSpecialization2', '')
          }}>
            <option value="">Select course</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        {isMba ? (
          <>
            <Field label="First Specialization" error={errors.mbaSpecialization1} required>
              <select value={data.mbaSpecialization1} onChange={e => onChange('mbaSpecialization1', e.target.value)}>
                <option value="">Select specialization</option>
                {MBA_SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Second Specialization (optional)" error={errors.mbaSpecialization2}>
              <select value={data.mbaSpecialization2} onChange={e => onChange('mbaSpecialization2', e.target.value)}>
                <option value="">Select specialization</option>
                {MBA_SPECIALIZATIONS.map(s => (
                  <option key={s} value={s} disabled={s === data.mbaSpecialization1}>{s}</option>
                ))}
              </select>
            </Field>
          </>
        ) : (
          <Field label="Department / Branch" error={errors.department} required>
            <select
              value={data.department}
              onChange={e => onChange('department', e.target.value)}
              disabled={!data.course}
            >
              <option value="">{data.course ? 'Select department' : 'Select a course first'}</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        )}

        <Field label="Admission Year" error={errors.admissionYear} required>
          <select value={data.admissionYear} onChange={e => onChange('admissionYear', e.target.value)}>
            <option value="">Select year</option>
            {ADMISSION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <Field label="Graduation Year" error={errors.graduationYear} required>
          <input
            type="text"
            value={data.graduationYear}
            readOnly
            placeholder="Auto-calculated"
          />
        </Field>
        <Field label="Current Year" error={errors.currentYear} required>
          <select value={data.currentYear} onChange={e => onChange('currentYear', e.target.value)}>
            <option value="">Select year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </Field>
        <Field label="Current Semester" error={errors.currentSemester} required>
          <select value={data.currentSemester} onChange={e => onChange('currentSemester', e.target.value)}>
            <option value="">Select semester</option>
            {getSemesterOptions().map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="BTU Roll Number" error={errors.btuRollNumber} required>
          <input
            type="text"
            value={data.btuRollNumber}
            onChange={e => onChange('btuRollNumber', e.target.value)}
            placeholder="Enter BTU roll number"
          />
        </Field>
        <Field label="Enrollment Number" error={errors.enrollmentNumber} required>
          <input
            type="text"
            value={data.enrollmentNumber}
            onChange={e => onChange('enrollmentNumber', e.target.value)}
            placeholder="Enter enrollment number"
          />
        </Field>
      </div>

      <h3 className="section-label">Current Academic Performance</h3>
      <div className="form-grid">
        <Field label="CGPA" error={errors.cgpa} required>
          <input
            type="text"
            value={data.cgpa}
            onChange={e => onChange('cgpa', e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="e.g. 8.5"
          />
        </Field>
        <Field label="Active Backlogs" error={errors.activeBacklogs} required>
          <input
            type="text"
            value={data.activeBacklogs}
            onChange={e => onChange('activeBacklogs', e.target.value.replace(/\D/g, ''))}
            placeholder="Number of active backlogs"
          />
        </Field>
        <Field label="Passive Backlogs" error={errors.passiveBacklogs} required>
          <input
            type="text"
            value={data.passiveBacklogs}
            onChange={e => onChange('passiveBacklogs', e.target.value.replace(/\D/g, ''))}
            placeholder="Number of passive backlogs"
          />
        </Field>
      </div>

      {data.course && data.currentSemester && parseInt(data.currentSemester) > 1 && (
        <>
          <h3 className="section-label">Semester-wise SGPA</h3>
          <div className="form-grid">
            {Array.from({ length: parseInt(data.currentSemester) - 1 }, (_, i) => {
              const sem = i + 1
              return (
                <Field key={sem} label={`Semester ${sem} SGPA`}>
                  <input
                    type="text"
                    value={data.sgpa?.[sem] || ''}
                    onChange={e => onSgpaChange(sem, e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder={`SGPA for semester ${sem}`}
                  />
                </Field>
              )
            })}
          </div>
        </>
      )}

      <h3 className="section-label">10th Standard Details</h3>
      <div className="form-grid">
        <Field label="Percentage" error={errors.tenthPercentage} required>
          <input
            type="text"
            value={data.tenthPercentage}
            onChange={e => onChange('tenthPercentage', e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="e.g. 85.5"
          />
        </Field>
        <Field label="Year of Passing" error={errors.tenthYear} required>
          <select value={data.tenthYear} onChange={e => onChange('tenthYear', e.target.value)}>
            <option value="">Select year</option>
            {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <div className="field-full">
          <Field label="Board" error={errors.tenthBoard} required>
            <input
              type="text"
              value={data.tenthBoard}
              onChange={e => onChange('tenthBoard', e.target.value)}
              placeholder="e.g. RBSE, CBSE"
            />
          </Field>
        </div>
      </div>

      <h3 className="section-label">12th Standard Details</h3>
      <div className="form-grid">
        <Field label="Percentage" error={errors.twelfthPercentage} required>
          <input
            type="text"
            value={data.twelfthPercentage}
            onChange={e => onChange('twelfthPercentage', e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="e.g. 80.0"
          />
        </Field>
        <Field label="Year of Passing" error={errors.twelfthYear} required>
          <select value={data.twelfthYear} onChange={e => onChange('twelfthYear', e.target.value)}>
            <option value="">Select year</option>
            {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <div className="field-full">
          <Field label="Board" error={errors.twelfthBoard} required>
            <input
              type="text"
              value={data.twelfthBoard}
              onChange={e => onChange('twelfthBoard', e.target.value)}
              placeholder="e.g. RBSE, CBSE"
            />
          </Field>
        </div>
      </div>

      <h3 className="section-label">Diploma Details (if applicable)</h3>
      <div className="form-grid">
        <Field label="Percentage (optional)" error={errors.diplomaPercentage}>
          <input
            type="text"
            value={data.diplomaPercentage}
            onChange={e => onChange('diplomaPercentage', e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="e.g. 78.0"
          />
        </Field>
        <Field label="Year of Passing (optional)" error={errors.diplomaYear}>
          <select value={data.diplomaYear} onChange={e => onChange('diplomaYear', e.target.value)}>
            <option value="">Select year</option>
            {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
      </div>
    </div>
  )
}

function ContactInfoStep({ data, errors, onChange }) {
  return (
    <div className="step-form">
      <h3 className="section-label">Permanent Address</h3>
      <div className="form-grid">
        <div className="field-full">
          <Field label="Permanent Address" error={errors.permanentAddress} required>
            <textarea
              value={data.permanentAddress}
              onChange={e => onChange('permanentAddress', e.target.value)}
              placeholder="Enter permanent address"
              rows={3}
            />
          </Field>
        </div>
      </div>

      <h3 className="section-label">Current Address</h3>
      <div className="form-grid">
        <div className="field-full">
          <Field label="Address" error={errors.currentAddress} required>
            <textarea
              value={data.currentAddress}
              onChange={e => onChange('currentAddress', e.target.value)}
              placeholder="Enter your current address"
              rows={3}
            />
          </Field>
        </div>
        <Field label="City" error={errors.nativeCity} required>
          <input
            type="text"
            value={data.nativeCity}
            onChange={e => onChange('nativeCity', e.target.value)}
            placeholder="Enter city"
          />
        </Field>
        <Field label="District" error={errors.nativeDistrict} required>
          <input
            type="text"
            value={data.nativeDistrict}
            onChange={e => onChange('nativeDistrict', e.target.value)}
            placeholder="Enter district"
          />
        </Field>
        <Field label="State" error={errors.nativeState} required>
          <select value={data.nativeState} onChange={e => onChange('nativeState', e.target.value)}>
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
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

function DocumentsStep({ data, errors, onChange }) {
  return (
    <div className="step-form">
      <h3 className="section-label">Academic Documents</h3>
      <div className="form-grid">
        <div className="field-full">
          <Field label="Resume Link" error={errors.resume} required>
            <input
              type="url"
              value={data.resumeUrl}
              onChange={e => onChange('resumeUrl', e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
            />
            <span className="field-hint">Paste your Google Drive or cloud storage link</span>
          </Field>
        </div>
      </div>

      <h3 className="section-label">Professional Links</h3>
      <div className="form-grid">
        <Field label="LinkedIn Profile (optional)" error={errors.linkedinUrl}>
          <input
            type="url"
            value={data.linkedinUrl}
            onChange={e => onChange('linkedinUrl', e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
        </Field>
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
