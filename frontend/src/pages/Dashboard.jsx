import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon, 
  Trophy, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement, 
  Filler 
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { DashboardSkeleton } from '../components/LoadingSkeleton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const GRADE_COLORS = {
  'A+': '#059669',
  'A':  '#10b981',
  'A-': '#14b8a6',
  'B+': '#0284c7',
  'B':  '#3b82f6',
  'B-': '#6366f1',
  'C+': '#8b5cf6',
  'C':  '#d97706',
  'C-': '#f59e0b',
  'D':  '#f43f5e',
  'F':  '#e11d48',
};

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [topStudentsChartData, setTopStudentsChartData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    api.getDashboard()
      .then(dash => {
        if (!dash) {
          setError('Could not connect to the Backend API. Please ensure the Django server is running on http://127.0.0.1:8000');
        } else {
          setData(dash);
          if (dash.charts) {
            setGradeData(dash.charts.grade_dist);
            setSubjectData(dash.charts.subject_avg);
            setTopStudentsChartData(dash.charts.top_students);
            setTrendData(dash.charts.exam_trend);
          }
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to load analytics data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '12px', 
          padding: '2rem',
          color: '#991b1b' 
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Connection Notice</h3>
          <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>{error}</p>
          <button 
            onClick={loadData}
            style={{
              background: '#059669',
              color: '#fff',
              border: 'none',
              padding: '0.625rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Grade Doughnut
  const gradeChartConfig = gradeData ? {
    labels: gradeData.labels.filter((_, i) => gradeData.data[i] > 0),
    datasets: [{
      data: gradeData.data.filter(v => v > 0),
      backgroundColor: gradeData.labels.filter((_, i) => gradeData.data[i] > 0).map(l => GRADE_COLORS[l] || '#8b5cf6'),
      borderWidth: 2,
      borderColor: '#ffffff',
    }]
  } : null;

  // Subject Bar
  const subjectChartConfig = subjectData ? {
    labels: subjectData.labels,
    datasets: [{
      label: 'Average %',
      data: subjectData.data,
      backgroundColor: 'rgba(5, 150, 105, 0.85)',
      borderRadius: 8,
    }]
  } : null;

  // Top Students Horizontal Bar
  const topStudentsConfig = topStudentsChartData ? {
    labels: topStudentsChartData.labels,
    datasets: [{
      label: 'Average %',
      data: topStudentsChartData.data,
      backgroundColor: [
        '#059669', '#14b8a6', '#0d9488', '#10b981', '#f59e0b', 
        '#8b5cf6', '#0284c7', '#ec4899', '#06b6d4', '#d97706'
      ],
      borderRadius: 6,
    }]
  } : null;

  // Trend Line
  const trendConfig = trendData ? {
    labels: trendData.labels,
    datasets: [{
      label: 'Average %',
      data: trendData.data,
      borderColor: '#059669',
      backgroundColor: 'rgba(5, 150, 105, 0.12)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#059669',
      pointRadius: 5,
    }]
  } : null;

  // Pass Fail Doughnut
  const passFailConfig = data ? {
    labels: ['Pass', 'Fail'],
    datasets: [{
      data: [data.pass_count, data.fail_count],
      backgroundColor: ['rgba(16, 185, 129, 0.9)', 'rgba(244, 63, 94, 0.9)'],
      borderWidth: 2,
      borderColor: '#ffffff',
    }]
  } : null;

  return (
    <div>
      {/* 4 Stat Cards */}
      <div className="stat-grid">
        <StatCard 
          icon={<Users size={24} />} 
          value={data?.total_students || 0} 
          label="Total Students" 
          variant="blue" 
        />
        <StatCard 
          icon={<BookOpen size={24} />} 
          value={data?.total_subjects || 0} 
          label="Subjects" 
          variant="purple" 
        />
        <StatCard 
          icon={<ClipboardCheck size={24} />} 
          value={data?.total_results || 0} 
          label="Exam Results" 
          variant="green" 
        />
        <StatCard 
          icon={<TrendingUp size={24} />} 
          value={`${data?.avg_score || 0}%`} 
          label="Average Score" 
          variant="orange" 
        />
      </div>

      {/* Row 1: Subject Avg & Grade Dist */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3><BarChart3 size={18} color="#059669" /> Subject-wise Average Scores</h3>
          </div>
          <div className="card-body">
            {subjectChartConfig && subjectChartConfig.labels.length > 0 ? (
              <Bar 
                data={subjectChartConfig} 
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
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No subject scores recorded yet
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><PieIcon size={18} color="#10b981" /> Grade Distribution</h3>
          </div>
          <div className="card-body" style={{ maxHeight: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {gradeChartConfig && gradeChartConfig.datasets[0].data.length > 0 ? (
              <Doughnut 
                data={gradeChartConfig} 
                options={{
                  responsive: true,
                  plugins: { legend: { position: 'right' } },
                  cutout: '65%',
                }} 
              />
            ) : (
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No grade data recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Top Students & Exam Trend */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3><Trophy size={18} color="#f59e0b" /> Top 10 Students</h3>
          </div>
          <div className="card-body">
            {topStudentsConfig && topStudentsConfig.labels.length > 0 ? (
              <Bar 
                data={topStudentsConfig} 
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { 
                    x: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } },
                    y: { grid: { display: false } }
                  }
                }} 
              />
            ) : (
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No student rankings recorded yet
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><TrendingUp size={18} color="#3b82f6" /> Exam Trend (Average %)</h3>
          </div>
          <div className="card-body">
            {trendConfig && trendConfig.labels.length > 0 ? (
              <Line 
                data={trendConfig} 
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
              <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No exam trends recorded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Pass/Fail and Top Students Table */}
      <div className="grid-2">
        {/* Pass / Fail */}
        <div className="card">
          <div className="card-header">
            <h3><CheckCircle2 size={18} color="#10b981" /> Pass / Fail Overview</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '220px', height: '220px' }}>
              {passFailConfig && (
                <Doughnut 
                  data={passFailConfig} 
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    cutout: '70%',
                  }} 
                />
              )}
            </div>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{data?.pass_count}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Passed (≥50%)</div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444' }}>{data?.fail_count}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Failed (&lt;50%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Students Table */}
        <div className="card">
          <div className="card-header">
            <h3><Trophy size={18} color="#f59e0b" /> Top Students</h3>
            <Link to="/students" className="btn btn-sm btn-outline-primary">View All</Link>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Avg Score</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.top_students?.map((s, idx) => (
                    <tr key={s.id}>
                      <td>
                        <span className={`rank-badge rank-${idx + 1}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td>
                        <Link to={`/students/${s.id}`} style={{ fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}>
                          {s.full_name}
                        </Link>
                      </td>
                      <td>{s.class_name}</td>
                      <td>
                        <div className="progress-bar-wrap">
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${s.average_score}%`, background: 'linear-gradient(90deg, #059669, #14b8a6)' }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{s.average_score}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`grade-badge grade-${s.grade.replace('+', '-plus').replace('-', '-minus')}`}>
                          {s.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data?.top_students || data.top_students.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No records available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exam Results Table */}
      <div className="card">
        <div className="card-header">
          <h3><Clock size={18} color="#64748b" /> Recent Exam Results</h3>
          <Link to="/results" className="btn btn-sm btn-outline-primary">View All Results</Link>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Exam</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.recent_results?.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/students/${r.student_pk}`} style={{ fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}>
                        {r.student_name}
                      </Link>
                    </td>
                    <td>{r.subject_name} ({r.subject_code})</td>
                    <td><span className="badge-tag secondary">{r.exam_type}</span></td>
                    <td>{r.marks_obtained} / {r.max_marks}</td>
                    <td>
                      <span className={`grade-badge grade-${r.grade.replace('+', '-plus').replace('-', '-minus')}`}>
                        {r.grade}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{r.exam_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
