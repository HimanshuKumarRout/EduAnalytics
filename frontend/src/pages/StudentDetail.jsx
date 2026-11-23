import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, GraduationCap, Phone, Award, BarChart2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { api } from '../services/api';
import { StudentDetailSkeleton } from '../components/LoadingSkeleton';

export const StudentDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getStudent(id),
      api.getStudentChart(id),
    ]).then(([studentRes, chartRes]) => {
      setData(studentRes);
      if (chartRes.labels && chartRes.labels.length > 0) {
        setChartData({
          labels: chartRes.labels,
          datasets: [{
            label: 'Average %',
            data: chartRes.data,
            backgroundColor: chartRes.data.map(v => v >= 75 ? 'rgba(16, 185, 129, 0.85)' : v >= 50 ? 'rgba(245, 158, 11, 0.85)' : 'rgba(239, 68, 68, 0.85)'),
            borderRadius: 8,
          }]
        });
      }
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <StudentDetailSkeleton />;
  }

  const { student, results } = data || {};

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/students" className="btn btn-sm btn-outline-secondary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={14} /> Back to Students
        </Link>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '320px 1fr' }}>
        {/* Profile Card */}
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669 0%, #14b8a6 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.3)'
          }}>
            {student?.first_name?.[0]}{student?.last_name?.[0]}
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{student?.full_name}</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>{student?.student_id}</p>

          <div style={{ marginBottom: '1.5rem' }}>
            <span className={`grade-badge grade-${student?.grade?.replace('+', '-plus').replace('-', '-minus')}`} style={{ fontSize: '1rem', padding: '0.4rem 1.25rem' }}>
              Grade {student?.grade}
            </span>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', textAlign: 'left', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#334155' }}>
              <GraduationCap size={16} color="#059669" />
              <span>Class {student?.class_name} {student?.section ? `– ${student.section}` : ''}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#334155' }}>
              <Mail size={16} color="#0d9488" />
              <span>{student?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#334155' }}>
              <User size={16} color="#059669" />
              <span>Gender: {student?.gender}</span>
            </div>
            {student?.contact && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#334155' }}>
                <Phone size={16} color="#10b981" />
                <span>{student.contact}</span>
              </div>
            )}
            {student?.parent_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', color: '#334155' }}>
                <Award size={16} color="#f59e0b" />
                <span>Parent: {student.parent_name}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{student?.average_score}%</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>AVG SCORE</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>#{student?.rank || '–'}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>CLASS RANK</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#3b82f6' }}>{student?.attendance_pct}%</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>ATTENDANCE</div>
            </div>
          </div>
        </div>

        {/* Right side: Chart and Results */}
        <div>
          {/* Subject Performance Chart */}
          <div className="card">
            <div className="card-header">
              <h3><BarChart2 size={18} color="#059669" /> Subject Performance Overview</h3>
            </div>
            <div className="card-body">
              {chartData ? (
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } },
                      x: { grid: { display: false } }
                    }
                  }} 
                />
              ) : (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>No exam results recorded yet for subjects.</p>
              )}
            </div>
          </div>

          {/* Results Table */}
          <div className="card">
            <div className="card-header">
              <h3>Exam History</h3>
              <span className="badge-tag primary">{results?.length || 0} Results</span>
            </div>
            <div className="card-body p-0">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Exam</th>
                      <th>Marks</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results?.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.subject_name}</td>
                        <td><span className="badge-tag secondary">{r.exam_type}</span></td>
                        <td>{r.marks_obtained} / {r.max_marks}</td>
                        <td>
                          <div className="progress-bar-wrap">
                            <div className="progress-track">
                              <div 
                                className="progress-fill" 
                                style={{ 
                                  width: `${r.percentage}%`, 
                                  background: r.percentage >= 75 ? '#10b981' : r.percentage >= 50 ? '#f59e0b' : '#ef4444' 
                                }}
                              ></div>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{r.percentage}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`grade-badge grade-${r.grade.replace('+', '-plus').replace('-', '-minus')}`}>
                            {r.grade}
                          </span>
                        </td>
                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{r.exam_date}</td>
                      </tr>
                    ))}
                    {(!results || results.length === 0) && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                          No results on record.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
