import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Check, ChevronRight, ChevronLeft,
  User, GraduationCap, MapPin, FileText,
  CheckCircle, Home, Camera, Info
} from 'lucide-react'
import { createStudentProfile, createSemesterResult, uploadDocument } from '../../services/student.service'
import * as V from '../../utils/validations'
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
  admissionYear: '', graduationYear: '', currentYear: '', currentSemester: '',
  collegeId: '', btuRollNumber: '', enrollmentNumber: '',
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
  'MBA': ['Marketing', 'Finance', 'Human Resources'],
  'MCA': ['Computer Applications'],
}

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

const STEP_FIELDS = {
  0: ['fullName', 'email', 'personalEmail', 'mobileNumber', 'whatsappNumber', 'dateOfBirth', 'aadharNumber'],
  1: ['course', 'department', 'admissionYear', 'currentYear', 'currentSemester', 'collegeId', 'btuRollNumber', 'enrollmentNumber', 'cgpa', 'activeBacklogs', 'passiveBacklogs', 'tenthPercentage', 'tenthYear', 'tenthBoard', 'twelfthPercentage', 'twelfthYear', 'twelfthBoard', 'graduationYear'],
  2: ['currentAddress', 'permanentAddress', 'nativeCity', 'nativeDistrict', 'nativeState', 'pinCode'],
  3: ['resumeUrl'],
}

export default function Registration() {
  const navigate = useNavigate()
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
    mode: 'onSubmit',
    defaultValues: INITIAL_DATA,
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [photoPreview, setPhotoPreview] = useState('')
  const [sgpaData, setSgpaData] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)

  const watchedCourse = watch('course')
  const watchedAdmissionYear = watch('admissionYear')
  const watchedCurrentSemester = watch('currentSemester')

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
        setValue('fullName', user.fullName || '')
        setValue('email', user.collegeEmail || '')
      } catch (_) {}
    }
  }, [navigate, setValue])

  useEffect(() => {
    if (watchedAdmissionYear && watchedCourse) {
      const duration = COURSE_DURATION[watchedCourse]
      if (duration) {
        const gradYear = parseInt(watchedAdmissionYear) + duration
        setValue('graduationYear', String(gradYear))
      }
    }
  }, [watchedAdmissionYear, watchedCourse, setValue])

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const updateSgpa = (semester, value) => {
    setSgpaData(prev => ({ ...prev, [semester]: value }))
  }

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[currentStep])
    if (valid) setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const onSubmitForm = async (data) => {
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
        course: data.course === 'B.Tech' ? 'BTECH' : data.course === 'M.Tech' ? 'MTECH' : data.course.toUpperCase(),
        department: data.department,
        admissionYear: parseInt(data.admissionYear),
        graduationYear: parseInt(data.graduationYear),
        currentYear: parseInt(data.currentYear || '1'),
        currentSemester: parseInt(data.currentSemester),
        collegeId: data.collegeId,
        btuRollNumber: data.btuRollNumber,
        enrollmentNumber: data.enrollmentNumber,
        dob: new Date(data.dateOfBirth).toISOString(),
        gender: 'Female',
        phoneNumber: data.mobileNumber,
        whatsappNumber: data.whatsappNumber,
        alternatePhone: data.alternateMobile || null,
        alternateEmail: data.alternateEmail || null,
        currentAddress: data.currentAddress,
        permanentAddress: data.permanentAddress || data.currentAddress,
        nativeCity: data.nativeCity,
        nativeDistrict: data.nativeDistrict,
        nativeState: data.nativeState,
        aadharNumber: data.aadharNumber,
        panNumber: data.panNumber || null,
        tenthPercentage: parseFloat(data.tenthPercentage),
        tenthYear: parseInt(data.tenthYear),
        tenthBoard: data.tenthBoard,
        twelfthPercentage: parseFloat(data.twelfthPercentage),
        twelfthYear: parseInt(data.twelfthYear),
        twelfthBoard: data.twelfthBoard,
        diplomaPercentage: data.diplomaPercentage ? parseFloat(data.diplomaPercentage) : null,
        diplomaYear: data.diplomaYear ? parseInt(data.diplomaYear) : null,
        cgpa: parseFloat(data.cgpa),
        activeBacklogs: parseInt(data.activeBacklogs),
        passiveBacklogs: parseInt(data.passiveBacklogs),
        linkedinUrl: data.linkedinUrl || null,
      }

      await createStudentProfile(profilePayload)

      const sgpaEntries = Object.entries(sgpaData).filter(
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

      if (data.resumeUrl.trim()) {
        await uploadDocument({ resumeUrl: data.resumeUrl })
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
    if (!watchedCourse) return SEMESTERS
    const duration = COURSE_DURATION[watchedCourse]
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
                register={register}
                errors={errors}
                photoPreview={photoPreview}
                onPhotoChange={handlePhotoChange}
                setValue={setValue}
              />
            )}
            {currentStep === 1 && (
              <AcademicInfoStep
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                sgpaData={sgpaData}
                onSgpaChange={updateSgpa}
                getSemesterOptions={getSemesterOptions}
              />
            )}
            {currentStep === 2 && (
              <ContactInfoStep
                register={register}
                errors={errors}
                setValue={setValue}
              />
            )}
            {currentStep === 3 && (
              <DocumentsStep
                register={register}
                errors={errors}
              />
            )}
          </div>

          {currentStep === STEPS.length - 1 && (
            <div className="consent-section">
              <label className="consent-label">
                <input
                  type="checkbox"
                  className="consent-checkbox"
                  checked={consentGiven}
                  onChange={(e) => {
                    setConsentGiven(e.target.checked)
                    if (e.target.checked) setSubmitError('')
                  }}
                />
                <span className="consent-text">
                  I hereby confirm that all the information provided by me is true and accurate.
                  I understand that I am solely responsible for the correctness of the information submitted.
                </span>
              </label>
            </div>
          )}

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
                <button
                  className="btn-primary"
                  onClick={() => {
                    if (!consentGiven) {
                      setSubmitError('Please accept the declaration to continue with your registration.')
                      return
                    }
                    handleSubmit(onSubmitForm)()
                  }}
                  disabled={submitting}
                >
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

function uppercaseOnChange(setValue, fieldName) {
  return (e) => {
    setValue(fieldName, e.target.value.toUpperCase())
  }
}

function digitsOnChange(setValue, fieldName, maxLen) {
  return (e) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, maxLen)
    setValue(fieldName, cleaned)
  }
}

function PersonalInfoStep({ register, errors, photoPreview, onPhotoChange, setValue }) {
  return (
    <div className="step-form">
      <div className="photo-upload-section">
        <div className="photo-preview" onClick={() => document.getElementById('photo-input')?.click()}>
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" />
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
            readOnly
            placeholder="Enter your full name"
            {...register('fullName', V.fullName())}
          />
        </Field>
        <Field label="College Email" error={errors.email} required>
          <input
            type="email"
            readOnly
            placeholder="@gweca.ac.in"
            {...register('email', V.collegeEmail())}
          />
        </Field>
        <Field label="Personal Email" error={errors.personalEmail} required>
          <input
            type="email"
            placeholder="your@email.com"
            {...register('personalEmail', V.personalEmail())}
          />
        </Field>
        <Field label="Alternative Email" error={errors.alternateEmail}>
          <input
            type="email"
            placeholder="you@college.edu.in"
            {...register('alternateEmail', V.optionalEmail())}
          />
        </Field>
        <Field label="Mobile Number" error={errors.mobileNumber} required>
          <input
            type="tel"
            placeholder="9876543210"
            {...register('mobileNumber', V.phone10('Mobile number'))}
            onChange={digitsOnChange(setValue, 'mobileNumber', 10)}
          />
        </Field>
        <Field label="WhatsApp Number" error={errors.whatsappNumber} required>
          <input
            type="tel"
            placeholder="WhatsApp number"
            {...register('whatsappNumber', V.phone10('WhatsApp number'))}
            onChange={digitsOnChange(setValue, 'whatsappNumber', 10)}
          />
        </Field>
        <Field label="Date of Birth" error={errors.dateOfBirth} required>
          <input
            type="date"
            {...register('dateOfBirth', V.ageRange(15, 30))}
          />
        </Field>
        <Field label="Gender" error={errors.gender} required>
          <div className="gender-fixed">Female</div>
        </Field>
        <Field label="Aadhar Number" error={errors.aadharNumber} required>
          <input
            type="text"
            placeholder="12-digit Aadhar number"
            {...register('aadharNumber', V.aadhar())}
            onChange={digitsOnChange(setValue, 'aadharNumber', 12)}
          />
        </Field>
        <Field label="PAN Number (optional)" error={errors.panNumber}>
          <input
            type="text"
            placeholder="e.g. ABCDE1234F"
            {...register('panNumber', V.pan())}
          />
        </Field>
      </div>
    </div>
  )
}

function AcademicInfoStep({ register, errors, watch, setValue, sgpaData, onSgpaChange, getSemesterOptions }) {
  const departments = COURSE_DEPARTMENTS[watch('course')] || []

  return (
    <div className="step-form">
      <h3 className="section-label">Course & College Details</h3>
      <div className="form-grid">
        <Field label="Course" error={errors.course} required>
          <select {...register('course', V.selectRequired('course'))} onChange={(e) => {
            register('course').onChange(e)
            setValue('department', '')
          }}>
            <option value="">Select course</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Department / Branch" error={errors.department} required>
          <select
            {...register('department', V.selectRequired('department'))}
            disabled={!watch('course')}
          >
              <option value="">{watch('course') ? 'Select department' : 'Select a course first'}</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>

        <Field label="Admission Year" error={errors.admissionYear} required>
          <select {...register('admissionYear', V.yearSelect('admission year'))}>
            <option value="">Select year</option>
            {ADMISSION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <Field label="Graduation Year" error={errors.graduationYear} required>
          <input
            type="text"
            readOnly
            placeholder="Auto-calculated"
            {...register('graduationYear', V.yearSelect('graduation year'))}
          />
        </Field>
        <Field label="Current Year" error={errors.currentYear} required>
          <select {...register('currentYear', V.selectRequired('current year'))}>
            <option value="">Select year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </Field>
        <Field label="Current Semester" error={errors.currentSemester} required>
          <select {...register('currentSemester', V.selectRequired('semester'))}>
            <option value="">Select semester</option>
            {getSemesterOptions().map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="College ID" error={errors.collegeId} required>
          <input
            type="text"
            placeholder="e.g. 23CAC091"
            {...register('collegeId', V.selectRequired('College ID'))}
            onChange={uppercaseOnChange(setValue, 'collegeId')}
          />
        </Field>
        <Field label="BTU Roll Number" error={errors.btuRollNumber} required>
          <input
            type="text"
            placeholder="Enter BTU roll number"
            {...register('btuRollNumber', V.selectRequired('BTU roll number'))}
            onChange={uppercaseOnChange(setValue, 'btuRollNumber')}
          />
        </Field>
        <Field label="Enrollment Number" error={errors.enrollmentNumber} required>
          <input
            type="text"
            placeholder="Enter enrollment number"
            {...register('enrollmentNumber', V.selectRequired('enrollment number'))}
            onChange={uppercaseOnChange(setValue, 'enrollmentNumber')}
          />
        </Field>
      </div>

      <h3 className="section-label">Current Academic Performance</h3>
      <div className="form-grid">
        <Field label="CGPA" error={errors.cgpa} required>
          <input
            type="text"
            placeholder="e.g. 8.5"
            {...register('cgpa', V.cgpa())}
          />
        </Field>
        <Field label="Active Backlogs" error={errors.activeBacklogs} required>
          <input
            type="text"
            placeholder="Number of active backlogs"
            {...register('activeBacklogs', V.nonNegativeInt('Active backlogs'))}
          />
        </Field>
        <Field label="Passive Backlogs" error={errors.passiveBacklogs} required>
          <input
            type="text"
            placeholder="Number of passive backlogs"
            {...register('passiveBacklogs', V.nonNegativeInt('Passive backlogs'))}
          />
        </Field>
      </div>

      {watch('course') && watch('currentSemester') && parseInt(watch('currentSemester')) > 1 && (
        <>
          <h3 className="section-label">Semester-wise SGPA</h3>
          <div className="form-grid">
            {Array.from({ length: parseInt(watch('currentSemester')) - 1 }, (_, i) => {
              const sem = i + 1
              return (
                <Field key={sem} label={`Semester ${sem} SGPA`}>
                  <input
                    type="text"
                    value={sgpaData?.[sem] || ''}
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
            placeholder="e.g. 85.5"
            {...register('tenthPercentage', V.percentage('10th percentage'))}
          />
        </Field>
        <Field label="Year of Passing" error={errors.tenthYear} required>
          <select {...register('tenthYear', V.yearSelect('10th year'))}>
            <option value="">Select year</option>
            {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <div className="field-full">
          <Field label="Board" error={errors.tenthBoard} required>
            <input
              type="text"
              placeholder="e.g. RBSE, CBSE"
              {...register('tenthBoard', V.selectRequired('10th board'))}
              onChange={uppercaseOnChange(setValue, 'tenthBoard')}
            />
          </Field>
        </div>
      </div>

      <h3 className="section-label">12th Standard Details</h3>
      <div className="form-grid">
        <Field label="Percentage" error={errors.twelfthPercentage} required>
          <input
            type="text"
            placeholder="e.g. 80.0"
            {...register('twelfthPercentage', V.percentage('12th percentage'))}
          />
        </Field>
        <Field label="Year of Passing" error={errors.twelfthYear} required>
          <select {...register('twelfthYear', V.yearSelect('12th year'))}>
            <option value="">Select year</option>
            {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <div className="field-full">
          <Field label="Board" error={errors.twelfthBoard} required>
            <input
              type="text"
              placeholder="e.g. RBSE, CBSE"
              {...register('twelfthBoard', V.selectRequired('12th board'))}
              onChange={uppercaseOnChange(setValue, 'twelfthBoard')}
            />
          </Field>
        </div>
      </div>

      <h3 className="section-label">Diploma Details (if applicable)</h3>
      <div className="form-grid">
        <Field label="Percentage (optional)" error={errors.diplomaPercentage}>
          <input
            type="text"
            placeholder="e.g. 78.0"
            {...register('diplomaPercentage', V.optionalPercentage())}
          />
        </Field>
        <Field label="Year of Passing (optional)" error={errors.diplomaYear}>
          <select {...register('diplomaYear')}>
            <option value="">Select year</option>
            {Array.from({ length: 15 }, (_, i) => `${CURRENT_YEAR - 14 + i}`).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
      </div>
    </div>
  )
}

function ContactInfoStep({ register, errors, setValue }) {
  return (
    <div className="step-form">
      <h3 className="section-label">Permanent Address</h3>
      <div className="form-grid">
        <div className="field-full">
          <Field label="Permanent Address" error={errors.permanentAddress} required>
            <textarea
              placeholder="Enter permanent address"
              rows={3}
              {...register('permanentAddress', V.address('Permanent address'))}
            />
          </Field>
        </div>
      </div>

      <h3 className="section-label">Current Address</h3>
      <div className="form-grid">
        <div className="field-full">
          <Field label="Address" error={errors.currentAddress} required>
            <textarea
              placeholder="Enter your current address"
              rows={3}
              {...register('currentAddress', V.address('Current address'))}
            />
          </Field>
        </div>
        <Field label="City" error={errors.nativeCity} required>
          <input
            type="text"
            placeholder="Enter city"
            {...register('nativeCity', V.city('City'))}
          />
        </Field>
        <Field label="District" error={errors.nativeDistrict} required>
          <input
            type="text"
            placeholder="Enter district"
            {...register('nativeDistrict', V.city('District'))}
          />
        </Field>
        <Field label="State" error={errors.nativeState} required>
          <select {...register('nativeState', V.stateSelect())}>
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="PIN Code" error={errors.pinCode} required>
          <input
            type="text"
            placeholder="6-digit PIN code"
            {...register('pinCode', V.pinCode())}
            onChange={digitsOnChange(setValue, 'pinCode', 6)}
          />
        </Field>
      </div>
    </div>
  )
}

function DocumentsStep({ register, errors }) {
  return (
    <div className="step-form">
      <h3 className="section-label">Academic Documents</h3>
      <div className="form-grid">
        <div className="field-full">
          <Field label="Resume Link" error={errors.resumeUrl} required>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              {...register('resumeUrl', V.resumeUrl())}
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
            placeholder="https://linkedin.com/in/username"
            {...register('linkedinUrl', V.linkedinUrl())}
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
      {error && <span className="field-error-msg">{error.message}</span>}
    </div>
  )
}
