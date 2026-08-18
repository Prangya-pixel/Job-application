import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getJob } from '../api/jobs';
import { checkApplicationStatus } from '../api/applications';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    setLoading(true);
    getJob(id)
      .then((response) => {
        setJob(response.data);
        setError(null);
      })
      .catch((err) => {
        setJob(null);
        setError('Job not found');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === 'applicant' && id) {
      checkApplicationStatus(id)
        .then((response) => {
          setHasApplied(response.data.hasApplied);
        })
        .catch(() => {
          setHasApplied(false);
        });
    }
  }, [user, id]);

  if (loading) return <Loader />;
  if (!job) return <section className="detail"><p className="error">{error || 'Job not found.'}</p></section>;

  const applicationDeadline = new Date(job.deadline).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isApplicant = user?.role === 'applicant';
  let applyButtonText = user ? 'Apply now' : 'Sign in to apply';
  let applyButtonLink = isApplicant ? `/jobs/${id}/apply` : '/login';
  let isDisabled = false;

  if (isApplicant && hasApplied) {
    applyButtonText = 'Already Applied';
    isDisabled = true;
  }

  return (
    <section className="detail">
      {/* Header Section */}
      <div className="job-header">
        <p className="eyebrow">{job.company}</p>
        <h1>{job.title}</h1>
        <p className="lead">
          {job.location} · {job.jobType} · {job.experienceLevel} · {job.salary || 'Competitive salary'}
        </p>
      </div>

      {/* Apply Button */}
      <div className="apply-section">
        {isDisabled ? (
          <button className="button disabled" disabled>
            {applyButtonText}
          </button>
        ) : (
          <Link className="button" to={applyButtonLink}>
            {applyButtonText}
          </Link>
        )}
      </div>

      <hr />

      {/* About the Role */}
      <section className="job-section">
        <h2>About the role</h2>
        <p className="prose">{job.description}</p>
      </section>

      {/* Responsibilities */}
      {job.responsibilities && job.responsibilities.length > 0 && (
        <section className="job-section">
          <h2>Responsibilities</h2>
          <ul className="job-list">
            {job.responsibilities.map((responsibility) => (
              <li key={responsibility}>{responsibility}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Requirements */}
      <section className="job-section">
        <h2>Requirements</h2>
        <ul className="job-list">
          {job.requirements &&
            job.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
        </ul>
      </section>

      {/* Skills */}
      <section className="job-section">
        <h2>Skills</h2>
        <div className="skills-container">
          {job.skills &&
            job.skills.map((skill) => (
              <span className="tag" key={skill}>
                {skill}
              </span>
            ))}
        </div>
      </section>

      {/* Application Deadline */}
      <div className="deadline-section">
        <p className="muted">Applications close <strong>{applicationDeadline}</strong></p>
      </div>
    </section>
  );
}
