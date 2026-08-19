import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { changeJobStatus, deleteJob, getJobs } from '../../api/jobs';
import Loader from '../../components/Loader';

export default function ManageJobs() {
  const location = useLocation();
  const [jobs, setJobs] = useState();
  const [error, setError] = useState('');

  const load = () => {
    setError('');

    return getJobs({ all: true })
      .then(r => setJobs(Array.isArray(r.data) ? r.data : []))
      .catch(e =>
        setError(
          e.response?.data?.message ||
            'Could not load jobs. Please try again.'
        )
      );
  };

  useEffect(() => {
    load();
  }, []);

  if (!jobs && !error) return <Loader />;

  const remove = async id => {
    if (confirm('Delete this job?')) {
      try {
        await deleteJob(id);
        await load();
      } catch (e) {
        setError(e.response?.data?.message || 'Could not delete job');
      }
    }
  };

  return (
    <section>
      <div className="section-title">
        <div>
          <p className="eyebrow">Job management</p>
          <h1>Open positions</h1>
        </div>

        <Link className="button" to="/admin/jobs/new">
          Post a job
        </Link>
      </div>

      {location.state?.message && (
        <p className="success-message" role="status">
          {location.state.message}
        </p>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {jobs && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {jobs.map(j => (
                <tr key={j._id}>
                  <td>
                    <b>{j.title}</b>
                    <br />
                    <small>{j.company}</small>
                  </td>

                  <td>{j.location}</td>
                  <td>{j.jobType}</td>

                  <td>
                    <button
                      className="status-button"
                      onClick={async () => {
                        try {
                          await changeJobStatus(
                            j._id,
                            j.status === 'Active' ? 'Inactive' : 'Active'
                          );
                          await load();
                        } catch (e) {
                          setError(
                            e.response?.data?.message ||
                              'Could not update job status'
                          );
                        }
                      }}
                    >
                      {j.status}
                    </button>
                  </td>

                  <td>
                    <Link to={`/admin/jobs/${j._id}/edit`}>
                      Edit
                    </Link>{' '}
                    <button
                      className="danger text-button"
                      onClick={() => remove(j._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}