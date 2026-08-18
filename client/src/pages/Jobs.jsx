import { useEffect, useState } from 'react';
import { getJobs } from '../api/jobs';
import { checkApplicationStatus, myApplications } from '../api/applications';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import Loader from '../components/Loader';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
    experienceLevel: '',
  });
  const [loading, setLoading] = useState(true);

  const loadJobs = () => {
    setLoading(true);
    getJobs(filters)
      .then((r) => setJobs(r.data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  const loadAppliedJobs = async () => {
    if (!user || user.role !== 'applicant') {
      setAppliedJobIds(new Set());
      return;
    }

    try {
      const response = await myApplications();
      const jobIds = new Set(response.data.map((app) => app.job._id));
      setAppliedJobIds(jobIds);
    } catch (e) {
      setAppliedJobIds(new Set());
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    loadAppliedJobs();
  }, [user]);

  return (
    <section>
      <p className="eyebrow">Opportunities</p>
      <h1>Find your next role</h1>
      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          loadJobs();
        }}
      >
        <input
          placeholder="Job title, skill, or company"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <select
          value={filters.jobType}
          onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
        >
          <option value="">Any type</option>
          {['Full-Time', 'Part-Time', 'Internship', 'Contract', 'Remote'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select
          value={filters.experienceLevel}
          onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
        >
          <option value="">Any level</option>
          {['Entry', 'Mid', 'Senior', 'Lead'].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <button className="button">Search</button>
      </form>
      {loading ? (
        <Loader />
      ) : (
        <div className="jobs-grid">
          {jobs.length ? (
            jobs.map((j) => (
              <JobCard
                key={j._id}
                job={j}
                alreadyApplied={appliedJobIds.has(j._id)}
                user={user}
              />
            ))
          ) : (
            <p>No roles match those filters.</p>
          )}
        </div>
      )}
    </section>
  );
}
