import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    // Associations
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    // Personal Information
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },

    // Contact Information
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    pincode: {
      type: String,
      default: '',
    },

    // Qualification Details
    highestQualification: {
      type: String,
      enum: ['10th', '12th', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'],
      default: '',
    },
    degree: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      default: '',
    },
    university: {
      type: String,
      default: '',
    },
    graduationYear: {
      type: Number,
      default: null,
    },
    percentageOrCGPA: {
      type: Number,
      default: null,
    },

    // Work Experience
    experienceType: {
      type: String,
      enum: ['fresher', 'experienced'],
      default: 'fresher',
    },
    company: {
      type: String,
      default: '',
    },
    jobTitle: {
      type: String,
      default: '',
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },

    // Skills
    skills: {
      type: [String],
      default: [],
    },

    // Resume
    originalFilename: {
      type: String,
      default: '',
    },
    storedFilename: {
      type: String,
      default: '',
    },
    path: {
      type: String,
      default: '',
    },
    resume: {
      type: String,
      required: true,
    },

    // Additional Information
    coverLetter: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
    },
    portfolio: {
      type: String,
      default: '',
    },

    // Application Status
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique applications per user-job combination
applicationSchema.index({ applicant: 1, job: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
