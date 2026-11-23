import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Award, Eye } from 'lucide-react';
import { api } from '../services/api';
import { TableRowsSkeleton } from '../components/LoadingSkeleton';

export const ClassRankings = () => {
  const [rankings, setRankings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  const loadRankings = () => {
    setLoading(true);
    api.getClassRankings(selectedClass)
      .then(data => {
        setRankings(data.rankings || []);
        if (data.classes) setClasses(data.classes);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRankings();
  }, [selectedClass]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Academic Leaderboard</h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Student rankings based on comprehensive cumulative exam performance</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{ maxWidth: '320px' }}>
            <label className="form-label">Filter by Class</label>
            <select 
              className="form-select" 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes (Cohort-wide)</option>
              {classes.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>
            <Trophy size={18} color="#f59e0b" />
            {selectedClass ? `Class ${selectedClass} Rankings` : 'Cohort-wide Rankings'}
          </h3>
          <span className="badge-tag primary">{rankings.length} Students Ranked</span>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Average %</th>
                  <th>Grade</th>
                  <th>Performance</th>
                  <th style={{ width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableRowsSkeleton columns={8} rows={6} />
                ) : (
                  rankings.map((s, idx) => (
                    <tr key={s.pk}>
                      <td>
                        {idx === 0 ? (
                          <span className="rank-badge rank-1"><Trophy size={13} /> 1</span>
                        ) : idx === 1 ? (
                          <span className="rank-badge rank-2"><Award size={13} /> 2</span>
                        ) : idx === 2 ? (
                          <span className="rank-badge rank-3"><Award size={13} /> 3</span>
                        ) : (
                          <span style={{ fontWeight: 600, color: '#64748b', paddingLeft: '0.5rem' }}>#{idx + 1}</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, color: '#059669' }}>{s.id}</td>
                      <td>
                        <Link to={`/students/${s.pk}`} style={{ fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}>
                          {s.name}
                        </Link>
                      </td>
                      <td>{s.class_name}</td>
                      <td>
                        <div className="progress-bar-wrap">
                          <div className="progress-track">
                            <div 
                              className="progress-fill" 
                              style={{ 
                                width: `${s.avg}%`, 
                                background: s.avg >= 75 ? '#10b981' : s.avg >= 50 ? '#f59e0b' : '#ef4444' 
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{s.avg}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`grade-badge grade-${s.grade.replace('+', '-plus').replace('-', '-minus')}`}>
                          {s.grade}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-tag ${s.performance === 'Excellent' ? 'success' : s.performance === 'Good' ? 'info' : s.performance === 'Pass' ? 'warning' : 'danger'}`}>
                          {s.performance}
                        </span>
                      </td>
                      <td>
                        <Link to={`/students/${s.pk}`} className="btn btn-sm btn-outline-primary" title="View Profile">
                          <Eye size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && rankings.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No ranking data available for this class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
