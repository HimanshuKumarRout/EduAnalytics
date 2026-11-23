import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { TableRowsSkeleton } from '../components/LoadingSkeleton';

export const Results = () => {
  const [results, setResults] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [classFilter, setClassFilter] = useState('');
  const [examTypeFilter, setExamTypeFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Add Result Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [formData, setFormData] = useState({
    student: '',
    subject: '',
    exam_type: 'Final',
    marks_obtained: '',
    max_marks: 100,
    exam_date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const loadResults = () => {
    setLoading(true);
    api.getResults({ class_name: classFilter, exam_type: examTypeFilter, subject: subjectFilter })
      .then(data => {
        setResults(data.results || []);
        if (data.classes) setClasses(data.classes);
        if (data.subjects) setSubjects(data.subjects);
        if (data.exam_types) setExamTypes(data.exam_types);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadResults();
  }, [classFilter, examTypeFilter, subjectFilter]);

  const handleOpenAdd = () => {
    api.getStudents().then(res => {
      setStudentsList(res.students || []);
      setFormData({
        student: res.students?.[0]?.id || '',
        subject: subjects?.[0]?.id || '',
        exam_type: 'Final',
        marks_obtained: '',
        max_marks: 100,
        exam_date: new Date().toISOString().split('T')[0],
        remarks: '',
      });
      setIsModalOpen(true);
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    await api.createResult(formData);
    setIsModalOpen(false);
    loadResults();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this result record?')) {
      await api.deleteResult(id);
      loadResults();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Exam Results</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{results.length} result(s) recorded</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Result
        </button>
      </div>

      {/* Filter Card */}
      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label className="form-label">Class</label>
              <select className="form-select" value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <label className="form-label">Exam Type</label>
              <select className="form-select" value={examTypeFilter} onChange={e => setExamTypeFilter(e.target.value)}>
                <option value="">All Exam Types</option>
                {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <label className="form-label">Subject</label>
              <select className="form-select" value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {(classFilter || examTypeFilter || subjectFilter) && (
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => { setClassFilter(''); setExamTypeFilter(''); setSubjectFilter(''); }}
              >
                <X size={16} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Exam</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableRowsSkeleton columns={9} rows={6} />
                ) : (
                  results.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link to={`/students/${r.student_pk}`} style={{ fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}>
                          {r.student_name}
                        </Link>
                      </td>
                      <td>{r.class_name}</td>
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
                      <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(r.id)} title="Delete Result">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && results.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No exam results matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Result Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Exam Result">
        <form onSubmit={handleCreateSubmit}>
          <div className="form-grid">
            <div>
              <label className="form-label">Student</label>
              <select 
                className="form-select" 
                required 
                value={formData.student} 
                onChange={e => setFormData({ ...formData, student: e.target.value })}
              >
                {studentsList.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.student_id} - {s.class_name})</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Subject</label>
              <select 
                className="form-select" 
                required 
                value={formData.subject} 
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Exam Type</label>
              <select 
                className="form-select" 
                value={formData.exam_type} 
                onChange={e => setFormData({ ...formData, exam_type: e.target.value })}
              >
                {examTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Exam Date</label>
              <input 
                type="date" 
                className="form-control" 
                required 
                value={formData.exam_date} 
                onChange={e => setFormData({ ...formData, exam_date: e.target.value })} 
              />
            </div>
            <div>
              <label className="form-label">Marks Obtained</label>
              <input 
                type="number" 
                step="0.5" 
                className="form-control" 
                required 
                value={formData.marks_obtained} 
                onChange={e => setFormData({ ...formData, marks_obtained: e.target.value })} 
              />
            </div>
            <div>
              <label className="form-label">Max Marks</label>
              <input 
                type="number" 
                className="form-control" 
                required 
                value={formData.max_marks} 
                onChange={e => setFormData({ ...formData, max_marks: e.target.value })} 
              />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Remarks</label>
            <textarea 
              className="form-control" 
              rows="2" 
              value={formData.remarks} 
              onChange={e => setFormData({ ...formData, remarks: e.target.value })} 
            />
          </div>
          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Result
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
