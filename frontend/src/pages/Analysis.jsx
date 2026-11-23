import React, { useEffect, useState } from 'react';
import { BarChart3, Building, PieChart, TrendingUp } from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { api } from '../services/api';
import { AnalysisSkeleton } from '../components/LoadingSkeleton';

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

export const Analysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [gradeData, setGradeData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAnalysis(),
      api.getSubjectAvg(),
      api.getClassPerformance(),
      api.getGradeDist(),
      api.getExamTrend(),
    ]).then(([anal, subj, cls, grade, trend]) => {
      setAnalysisData(anal);
      setSubjectData(subj);
      setClassData(cls);
      setGradeData(grade);
      setTrendData(trend);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <AnalysisSkeleton />;
  }

  const subjectChartConfig = subjectData ? {
    labels: subjectData.labels,
    datasets: [{
      label: 'Average %',
      data: subjectData.data,
      backgroundColor: 'rgba(5, 150, 105, 0.85)',
      borderRadius: 8,
    }]
  } : null;

  const classChartConfig = classData ? {
    labels: classData.labels,
    datasets: [{
      label: 'Class Average %',
      data: classData.data,
      backgroundColor: 'rgba(20, 184, 166, 0.85)',
      borderRadius: 8,
    }]
  } : null;

  const gradeChartConfig = gradeData ? {
    labels: gradeData.labels.filter((_, i) => gradeData.data[i] > 0),
    datasets: [{
      data: gradeData.data.filter(v => v > 0),
      backgroundColor: gradeData.labels.filter((_, i) => gradeData.data[i] > 0).map(l => GRADE_COLORS[l] || '#059669'),
      borderWidth: 2,
      borderColor: '#ffffff',
    }]
  } : null;

  const trendChartConfig = trendData ? {
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

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Comprehensive Academic Analytics</h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Cohort performance analysis across subjects, classes, and exam tiers</p>
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3><BarChart3 size={18} color="#059669" /> Subject-wise Average</h3>
          </div>
          <div className="card-body">
            {subjectChartConfig && (
              <Bar 
                data={subjectChartConfig} 
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } }, x: { grid: { display: false } } }
                }} 
              />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><Building size={18} color="#0d9488" /> Class-wise Average Performance</h3>
          </div>
          <div className="card-body">
            {classChartConfig && (
              <Bar 
                data={classChartConfig} 
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } }, x: { grid: { display: false } } }
                }} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3><PieChart size={18} color="#10b981" /> Cohort Grade Distribution</h3>
          </div>
          <div className="card-body" style={{ maxHeight: '320px', display: 'flex', justifyContent: 'center' }}>
            {gradeChartConfig && (
              <Doughnut 
                data={gradeChartConfig} 
                options={{ responsive: true, plugins: { legend: { position: 'right' } }, cutout: '65%' }} 
              />
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3><TrendingUp size={18} color="#059669" /> Progressive Exam Trend</h3>
          </div>
          <div className="card-body">
            {trendChartConfig && (
              <Line 
                data={trendChartConfig} 
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } }, x: { grid: { display: false } } }
                }} 
              />
            )}
          </div>
        </div>
      </div>

      {/* Subject Statistics Table */}
      <div className="card">
        <div className="card-header">
          <h3>Subject Breakdown & Pass Rates</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Avg %</th>
                  <th>Highest %</th>
                  <th>Lowest %</th>
                  <th>Pass Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analysisData?.subject_stats?.map((s) => (
                  <tr key={s.code}>
                    <td style={{ fontWeight: 600 }}>{s.subject} ({s.code})</td>
                    <td><strong style={{ color: s.avg >= 75 ? '#10b981' : s.avg >= 50 ? '#f59e0b' : '#ef4444' }}>{s.avg}%</strong></td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{s.max}%</td>
                    <td style={{ color: '#ef4444', fontWeight: 600 }}>{s.min}%</td>
                    <td>
                      <div className="progress-bar-wrap">
                        <div className="progress-track">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${s.pass_pct}%`, 
                              background: s.pass_pct >= 75 ? '#10b981' : s.pass_pct >= 50 ? '#f59e0b' : '#ef4444' 
                            }}
                          ></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{s.pass_pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-tag ${s.performance === 'Excellent' ? 'success' : s.performance === 'Good' ? 'info' : s.performance === 'Average' ? 'warning' : 'danger'}`}>
                        {s.performance}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Class Statistics Table */}
      <div className="card">
        <div className="card-header">
          <h3>Class Performance Breakdown</h3>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Total Enrolled Students</th>
                  <th>Class Average Score</th>
                  <th>Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {analysisData?.class_stats?.map((c) => (
                  <tr key={c.class}>
                    <td style={{ fontWeight: 700, color: '#059669' }}>Class {c.class}</td>
                    <td>{c.count} students</td>
                    <td>
                      <div className="progress-bar-wrap">
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${c.avg}%`, background: 'linear-gradient(90deg, #059669, #14b8a6)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{c.avg}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-tag ${c.performance === 'Excellent' ? 'success' : c.performance === 'Good' ? 'info' : c.performance === 'Average' ? 'warning' : 'danger'}`}>
                        {c.performance}
                      </span>
                    </td>
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
