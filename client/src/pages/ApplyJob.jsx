import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apply } from '../api/applications';
import { useAuth } from '../context/AuthContext';

export default function ApplyJob() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Personal Information
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    // Contact Information
    address: '',
    city: '',
    state: '',
    pincode: '',
    // Qualification Details
    highestQualification: '',
    degree: '',
    specialization: '',
    university: '',
    graduationYear: new Date().getFullYear(),
    percentage: '',
    // Work Experience
    workStatus: 'Fresher',
    companyName: '',
    jobTitle: '',
    yearsOfExperience: '',
    startDate: '',
    endDate: '',
    experienceDescription: '',
    // Skills
    skills: '',
    // Resume
    resume: '',
    resumeFileName: '',
    // Additional Information
    coverLetter: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = () => {
    const newErrors = {};

    // Personal Information validation
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Qualification validation
    if (!formData.highestQualification) newErrors.highestQualification = 'Highest qualification is required';
    if (!formData.degree.trim()) newErrors.degree = 'Degree/Course is required';
    if (!formData.university.trim()) newErrors.university = 'University/College is required';
    if (!formData.graduationYear) newErrors.graduationYear = 'Graduation year is required';
    else if (isNaN(formData.graduationYear) || formData.graduationYear < 1950) {
      newErrors.graduationYear = 'Invalid graduation year';
    }

    // Skills validation
    const skillsArray = formData.skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s);
    if (skillsArray.length === 0) newErrors.skills = 'At least one skill is required';

    // Resume validation
    if (!formData.resume) newErrors.resume = 'Resume is required';

    // URL validation
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    if (formData.linkedinUrl && !urlRegex.test(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'Invalid LinkedIn URL';
    }
    if (formData.githubUrl && !urlRegex.test(formData.githubUrl)) {
      newErrors.githubUrl = 'Invalid GitHub URL';
    }
    if (formData.portfolioUrl && !urlRegex.test(formData.portfolioUrl)) {
      newErrors.portfolioUrl = 'Invalid Portfolio URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        resume: 'Only PDF, DOC, or DOCX files are allowed',
      }));
      return;
    }

    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        resume: 'File size must not exceed 5 MB',
      }));
      return;
    }

    // For now, store filename and size. File upload would be handled separately in a full implementation
    setFormData(prev => ({
      ...prev,
      resume: file.name,
      resumeFileName: file.name,
    }));
    setErrors(prev => ({
      ...prev,
      resume: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

      const applicationData = {
        job: id,
        // Personal Information
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        // Contact Information
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        // Qualification Details
        highestQualification: formData.highestQualification,
        degree: formData.degree,
        specialization: formData.specialization,
        university: formData.university,
        graduationYear: parseInt(formData.graduationYear),
        percentage: formData.percentage ? parseFloat(formData.percentage) : null,
        // Work Experience
        workStatus: formData.workStatus,
        companyName: formData.companyName,
        jobTitle: formData.jobTitle,
        yearsOfExperience: formData.yearsOfExperience ? parseFloat(formData.yearsOfExperience) : 0,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        experienceDescription: formData.experienceDescription,
        // Skills
        skills: skillsArray,
        // Resume
        resume: formData.resume,
        resumeFileName: formData.resumeFileName,
        // Additional Information
        coverLetter: formData.coverLetter,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
        portfolioUrl: formData.portfolioUrl,
      };

      const response = await apply(applicationData);
      setSubmitted(true);
      setTimeout(() => {
        navigate('/applicant/applications');
      }, 2000);
    } catch (error) {
      // Handle different error codes with appropriate messages
      let errorMessage = 'Failed to submit application';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            errorMessage = data.message || 'Please check your form and try again.';
            break;
          case 401:
            errorMessage = 'Your session has expired. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to apply for this job.';
            break;
          case 404:
            errorMessage = 'Job not found or has been removed.';
            break;
          case 409:
            errorMessage = data.message || 'You have already applied for this job.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = data.message || 'An error occurred. Please try again.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="auth">
        <div className="form-card wide success-card">
          <p className="eyebrow">Success</p>
          <h1>Application Submitted!</h1>
          <p>Your application has been successfully submitted.</p>
          <div className="success-actions">
            <button 
              className="button" 
              onClick={() => navigate('/applicant/applications')}
            >
              View My Applications
            </button>
            <button 
              className="button secondary" 
              onClick={() => navigate('/jobs')}
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="auth">
      <form className="form-card wide" onSubmit={handleSubmit}>
        <p className="eyebrow">Application</p>
        <h1>Apply for this job</h1>

        {submitError && <p className="error">{submitError}</p>}

        {/* SECTION 1: Personal Information */}
        <div className="form-section">
          <h2>Personal Information</h2>

          <label>
            Full Name *
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
            {errors.fullName && <span className="error-text">{errors.fullName}</span>}
          </label>

          <label>
            Email *
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </label>

          <label>
            Phone Number *
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="Enter your phone number"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </label>
        </div>

        {/* SECTION 2: Contact Information */}
        <div className="form-section">
          <h2>Contact Information</h2>

          <label>
            Address
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your street address"
            />
          </label>

          <div className="form-row">
            <label>
              City
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter your city"
              />
            </label>
            <label>
              State
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter your state"
              />
            </label>
            <label>
              Pincode
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Enter your pincode"
              />
            </label>
          </div>
        </div>

        {/* SECTION 3: Qualification Details */}
        <div className="form-section">
          <h2>Qualification Details</h2>

          <label>
            Highest Qualification *
            <select name="highestQualification" value={formData.highestQualification} onChange={handleInputChange} required>
              <option value="">-- Select qualification --</option>
              <option value="10th">10th</option>
              <option value="12th">12th</option>
              <option value="Diploma">Diploma</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD">PhD</option>
              <option value="Other">Other</option>
            </select>
            {errors.highestQualification && <span className="error-text">{errors.highestQualification}</span>}
          </label>

          <label>
            Degree / Course *
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={handleInputChange}
              required
              placeholder="e.g., B.Tech in Computer Science"
            />
            {errors.degree && <span className="error-text">{errors.degree}</span>}
          </label>

          <label>
            Specialization
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              placeholder="e.g., Web Development"
            />
          </label>

          <label>
            College / University *
            <input
              type="text"
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              required
              placeholder="Enter your college/university name"
            />
            {errors.university && <span className="error-text">{errors.university}</span>}
          </label>

          <div className="form-row">
            <label>
              Graduation Year *
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleInputChange}
                required
                min="1950"
                max={new Date().getFullYear() + 10}
                placeholder="YYYY"
              />
              {errors.graduationYear && <span className="error-text">{errors.graduationYear}</span>}
            </label>
            <label>
              Percentage / CGPA
              <input
                type="number"
                name="percentage"
                value={formData.percentage}
                onChange={handleInputChange}
                placeholder="e.g., 8.5"
                step="0.01"
                min="0"
                max="100"
              />
            </label>
          </div>
        </div>

        {/* SECTION 4: Work Experience */}
        <div className="form-section">
          <h2>Work Experience</h2>

          <fieldset className="radio-group">
            <legend>Are you a:</legend>
            <label>
              <input
                type="radio"
                name="workStatus"
                value="Fresher"
                checked={formData.workStatus === 'Fresher'}
                onChange={handleInputChange}
              />
              Fresher
            </label>
            <label>
              <input
                type="radio"
                name="workStatus"
                value="Experienced"
                checked={formData.workStatus === 'Experienced'}
                onChange={handleInputChange}
              />
              Experienced
            </label>
          </fieldset>

          {formData.workStatus === 'Experienced' && (
            <>
              <label>
                Company Name
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
              </label>

              <label>
                Job Title
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="Enter your job title"
                />
              </label>

              <div className="form-row">
                <label>
                  Years of Experience
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    placeholder="e.g., 3"
                    min="0"
                    step="0.5"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Start Date
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  End Date
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <label>
                Description
                <textarea
                  name="experienceDescription"
                  value={formData.experienceDescription}
                  onChange={handleInputChange}
                  placeholder="Describe your work experience"
                />
              </label>
            </>
          )}
        </div>

        {/* SECTION 5: Skills */}
        <div className="form-section">
          <h2>Skills</h2>

          <label>
            Skills (comma-separated) *
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              required
              placeholder="Enter skills separated by commas. Example: JavaScript, React, Node.js"
            />
            {errors.skills && <span className="error-text">{errors.skills}</span>}
            <small>Separate multiple skills with commas. Example: Python, Java, SQL, MongoDB</small>
          </label>
        </div>

        {/* SECTION 6: Resume */}
        <div className="form-section">
          <h2>Resume</h2>

          <label>
            Upload Resume *
            <div className="file-input-wrapper">
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeChange}
                required
              />
              <div className="file-input-label">
                {formData.resumeFileName ? (
                  <>
                    <span className="file-name">✓ {formData.resumeFileName}</span>
                  </>
                ) : (
                  <span>Click to upload or drag and drop</span>
                )}
              </div>
            </div>
            {errors.resume && <span className="error-text">{errors.resume}</span>}
            <small>Allowed formats: PDF, DOC, DOCX (Max 5 MB)</small>
          </label>
        </div>

        {/* SECTION 7: Additional Information */}
        <div className="form-section">
          <h2>Additional Information</h2>

          <label>
            Cover Letter
            <textarea
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              placeholder="Write a brief cover letter about yourself and why you're interested in this role"
            />
          </label>

          <label>
            LinkedIn URL
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            {errors.linkedinUrl && <span className="error-text">{errors.linkedinUrl}</span>}
          </label>

          <label>
            GitHub URL
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleInputChange}
              placeholder="https://github.com/yourprofile"
            />
            {errors.githubUrl && <span className="error-text">{errors.githubUrl}</span>}
          </label>

          <label>
            Portfolio URL
            <input
              type="url"
              name="portfolioUrl"
              value={formData.portfolioUrl}
              onChange={handleInputChange}
              placeholder="https://yourportfolio.com"
            />
            {errors.portfolioUrl && <span className="error-text">{errors.portfolioUrl}</span>}
          </label>
        </div>

        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Submitting application...' : 'Submit application'}
        </button>
      </form>
    </section>
  );
}
