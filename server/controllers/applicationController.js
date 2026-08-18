import Application from '../models/Application.js';

export const createApplication = async (req, res, next) => {
  try {
    const {
      job,
      fullName,
      email,
      phone,
      highestQualification,
      degree,
      university,
      graduationYear,
      skills,
      resume,
    } = req.body;

    // Validate job ID
    if (!job) {
      return res.status(400).json({
        message: 'Job ID is required',
      });
    }

    // Validate required personal information
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        message: 'Missing required personal information: fullName, email, phone',
      });
    }

    // Validate qualification details
    if (!highestQualification || !degree || !university || !graduationYear) {
      return res.status(400).json({
        message: 'Missing required qualification details',
      });
    }

    // Validate skills
    if (!skills || (Array.isArray(skills) && skills.length === 0)) {
      return res.status(400).json({
        message: 'At least one skill is required',
      });
    }

    // Validate resume
    if (!resume) {
      return res.status(400).json({
        message: 'Resume is required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate graduation year
    const currentYear = new Date().getFullYear();
    if (isNaN(graduationYear) || graduationYear < 1950 || graduationYear > currentYear + 10) {
      return res.status(400).json({ message: 'Invalid graduation year' });
    }

    // Validate URLs if provided
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    if (req.body.linkedin && req.body.linkedin.trim() && !urlRegex.test(req.body.linkedin)) {
      return res.status(400).json({ message: 'Invalid LinkedIn URL format' });
    }
    if (req.body.github && req.body.github.trim() && !urlRegex.test(req.body.github)) {
      return res.status(400).json({ message: 'Invalid GitHub URL format' });
    }
    if (req.body.portfolio && req.body.portfolio.trim() && !urlRegex.test(req.body.portfolio)) {
      return res.status(400).json({ message: 'Invalid Portfolio URL format' });
    }

    // Check for duplicate application - authenticated user + job
    const existingApplication = await Application.findOne({
      applicant: req.user._id,
      job: job,
    });

    if (existingApplication) {
      return res.status(409).json({
        message: 'You have already applied for this job.',
      });
    }

    // Process skills - handle both array and comma-separated string
    const processedSkills = Array.isArray(skills)
      ? skills
      : String(skills || '')
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);

    // Map frontend field names to model field names and merge with request body
    const applicationData = {
      ...req.body,
      skills: processedSkills,
      applicant: req.user._id,
      job: job,
      // Map frontend field names to schema field names
      percentageOrCGPA: req.body.percentage || req.body.percentageOrCGPA || null,
      experienceType: (req.body.workStatus || 'fresher').toLowerCase(),
      company: req.body.companyName || req.body.company || '',
      description: req.body.experienceDescription || req.body.description || '',
      linkedin: req.body.linkedinUrl || req.body.linkedin || '',
      github: req.body.githubUrl || req.body.github || '',
      portfolio: req.body.portfolioUrl || req.body.portfolio || '',
      originalFilename: req.body.resumeFileName || '',
    };

    // Create application
    const app = await Application.create(applicationData);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: app,
    });
  } catch (e) {
    // Handle MongoDB unique constraint errors
    if (e.code === 11000) {
      return res.status(409).json({
        message: 'You have already applied for this job.',
      });
    }
    next(e);
  }
};

export const myApplications = async (req, res, next) => {
  try {
    res.json(
      await Application.find({ applicant: req.user._id })
        .populate('job', 'title company location')
        .sort({ createdAt: -1 })
    );
  } catch (e) {
    next(e);
  }
};

export const getApplication = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('applicant', 'name email phone')
      .populate('job');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (req.user.role !== 'admin' && String(app.applicant._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(app);
  } catch (e) {
    next(e);
  }
};

export const checkApplicationStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const application = await Application.findOne({
      applicant: req.user._id,
      job: jobId,
    });

    res.json({
      hasApplied: !!application,
      application: application || null,
    });
  } catch (e) {
    next(e);
  }
};
