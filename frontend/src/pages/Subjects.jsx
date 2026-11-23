import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { TableRowsSkeleton } from '../components/LoadingSkeleton';

export const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    class_name: '10A',
    max_marks: 100,
    teacher: '',
  });

  const loadSubjects = () => {
    setLoading(true);
    api.getSubjects()
      .then(data => setSubjects(data.subjects || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.createSubject(formData);
    setIsModalOpen(false);
    setFormData({ name: '', code: '', class_name: '10A', max_marks: 100, teacher: '' });
    loadSubjects();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this subject and its results?')) {
      await api.deleteSubject(id);
      loadSubjects();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Subject Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{subjects.length} subject(s) configured</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Add Subject
        </button>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject Name</th>
                  <th>Class</th>
                  <th>Max Marks</th>
                  <th>Teacher</th>
                  <th>Total Results</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableRowsSkeleton columns={7} rows={4} />
                ) : (
                  subjects.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: '#059669' }}>{s.code}</td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.class_name}</td>
                      <td>{s.max_marks}</td>
                      <td style={{ color: '#64748b' }}>{s.teacher || '—'}</td>
                      <td><span className="badge-tag primary">{s.results_count}</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)} title="Delete Subject">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && subjects.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No subjects added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Subject">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label className="form-label">Subject Code</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                placeholder="e.g. MATH10" 
                value={formData.code} 
                onChange={e => setFormData({ ...formData, code: e.target.value })} 
              />
            </div>
            <div>
              <label className="form-label">Subject Name</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                placeholder="e.g. Mathematics" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
              />
            </div>
            <div>
              <label className="form-label">Class</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                placeholder="e.g. 10A" 
                value={formData.class_name} 
                onChange={e => setFormData({ ...formData, class_name: e.target.value })} 
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
            <label className="form-label">Teacher In-Charge</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Mr. Sharma" 
              value={formData.teacher} 
              onChange={e => setFormData({ ...formData, teacher: e.target.value })} 
            />
          </div>
          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
