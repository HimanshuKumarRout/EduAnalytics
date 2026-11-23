import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const UploadData = () => {
  const [uploadType, setUploadType] = useState('students');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const lower = selectedFile.name.toLowerCase();
      if (lower.includes('subject')) {
        setUploadType('subjects');
      } else if (lower.includes('result') || lower.includes('mark') || lower.includes('score')) {
        setUploadType('results');
      } else if (lower.includes('student') || lower.includes('roster')) {
        setUploadType('students');
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('csv_file', file);
    formData.append('upload_type', uploadType);

    try {
      const res = await api.uploadData(formData);
      if (res.success) {
        setStatus({ type: 'success', message: res.message });
        setFile(null);
        e.target.reset();
      } else {
        setStatus({ type: 'error', message: res.error || 'Upload failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Error processing upload file.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Bulk Data Import</h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Import rosters, curricula, and marks via CSV or Excel (.xlsx / .xls)</p>
      </div>

      <div className="grid-2">
        {/* Upload Box Card */}
        <div className="card">
          <div className="card-header">
            <h3><UploadCloud size={18} color="#059669" /> File Upload</h3>
          </div>
          <div className="card-body">
            {status && (
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                fontSize: '0.875rem',
                background: status.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: status.type === 'success' ? '#065f46' : '#991b1b',
                border: `1px solid ${status.type === 'success' ? '#a7f3d0' : '#fca5a5'}`
              }}>
                {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Data Type to Import</label>
                <select 
                  className="form-select"
                  value={uploadType} 
                  onChange={e => setUploadType(e.target.value)}
                >
                  <option value="students">Students Roster</option>
                  <option value="results">Exam Results</option>
                  <option value="subjects">Subjects Curriculum</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Select File (.csv, .xlsx, .xls)</label>
                <input 
                  type="file" 
                  className="form-control"
                  required
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileChange}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                  Supported formats: CSV, XLSX, XLS with UTF-8 encoding.
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                {loading ? 'Processing & Importing...' : 'Upload & Import Data'}
              </button>
            </form>
          </div>
        </div>

        {/* Sample Templates Card */}
        <div>
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-header">
              <h3><FileSpreadsheet size={16} color="#10b981" /> Sample: Students CSV Format</h3>
            </div>
            <div className="card-body">
              <pre style={{
                background: '#f8fafc',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                overflowX: 'auto',
                border: '1px solid #e2e8f0',
                color: '#334155'
              }}>
{`student_id,first_name,last_name,email,gender,class_name,section,roll_number,parent_name,contact
STU001,Alice,Johnson,alice@school.edu,Female,10A,A,1,Mr. Johnson,9812345671
STU002,Bob,Smith,bob@school.edu,Male,10A,A,2,Mrs. Smith,9812345672`}
              </pre>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3><FileSpreadsheet size={16} color="#f59e0b" /> Sample: Results CSV Format</h3>
            </div>
            <div className="card-body">
              <pre style={{
                background: '#f8fafc',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                overflowX: 'auto',
                border: '1px solid #e2e8f0',
                color: '#334155'
              }}>
{`student_id,subject_code,exam_type,exam_date,marks_obtained,max_marks
STU001,MATH10,Final,2024-03-15,85,100
STU001,SCI10,Final,2024-03-16,90,100`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Import Guide */}
      <div className="card">
        <div className="card-header">
          <h3>Column Specifications & Requirements</h3>
        </div>
        <div className="card-body">
          <div className="grid-3">
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#059669' }}>
                1. Students
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <strong>Required:</strong> student_id, first_name, last_name, email, gender, class_name<br />
                <strong>Optional:</strong> section, roll_number, parent_name, contact
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#10b981' }}>
                2. Subjects
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <strong>Required:</strong> code, name, class_name, max_marks<br />
                <strong>Optional:</strong> teacher
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem', color: '#f59e0b' }}>
                3. Results
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <strong>Required:</strong> student_id, subject_code, exam_type, exam_date, marks_obtained, max_marks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
