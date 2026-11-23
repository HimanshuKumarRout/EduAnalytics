import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { TableRowsSkeleton } from '../components/LoadingSkeleton';

export const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    gender: 'Male',
    class_name: '',
    section: '',
    roll_number: '',
    parent_name: '',
    contact: '',
    address: '',
  });

  const loadStudents = () => {
    setLoading(true);
    api.getStudents({ q: search, class_name: classFilter, gender: genderFilter })
      .then((data) => {
        setStudents(data.students || []);
        if (data.classes) setClasses(data.classes);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStudents();
  }, [classFilter, genderFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStudents();
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      gender: 'Male',
      class_name: classes[0] || '10A',
      section: 'A',
      roll_number: '',
      parent_name: '',
      contact: '',
      address: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      gender: student.gender,
      class_name: student.class_name,
      section: student.section || '',
      roll_number: student.roll_number || '',
      parent_name: student.parent_name || '',
      contact: student.contact || '',
      address: student.address || '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingStudent) {
      await api.updateStudent(editingStudent.id, formData);
    } else {
      await api.createStudent(formData);
    }
    setIsModalOpen(false);
    loadStudents();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      await api.deleteStudent(id);
      loadStudents();
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Student Directory</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{students.length} student(s) found</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Filters Card */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 250px' }}>
              <label className="form-label">Search</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Name, Student ID, or Email..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label className="form-label">Class</label>
              <select 
                className="form-select" 
                value={classFilter} 
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 130px' }}>
              <label className="form-label">Gender</label>
              <select 
                className="form-select" 
                value={genderFilter} 
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary">
                <Search size={16} /> Filter
              </button>
              {(search || classFilter || genderFilter) && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearch('');
                    setClassFilter('');
                    setGenderFilter('');
                  }}
                >
                  <X size={16} /> Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Avg Score</th>
                  <th>Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <TableRowsSkeleton columns={8} rows={6} />
                ) : (
                  students.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: '#059669' }}>{s.student_id}</td>
                      <td>
                        <Link to={`/students/${s.id}`} style={{ fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}>
                          {s.full_name}
                        </Link>
                      </td>
                      <td>{s.class_name} {s.section ? `– ${s.section}` : ''}</td>
                      <td>
                        <span className={`badge-tag ${s.gender === 'Female' ? 'pink' : s.gender === 'Male' ? 'info' : 'secondary'}`}>
                          {s.gender}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{s.email}</td>
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
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <Link to={`/students/${s.id}`} className="btn btn-sm btn-outline-primary" title="View Profile">
                            <Eye size={14} />
                          </Link>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => handleOpenEdit(s)} title="Edit Student">
                            <Edit size={14} />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s.id)} title="Delete Student">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && students.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'Add New Student'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-grid">
            <div>
              <label className="form-label">Student ID</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                disabled={!!editingStudent}
                value={formData.student_id} 
                onChange={e => setFormData({ ...formData, student_id: e.target.value })} 
                placeholder="e.g. STU1001"
              />
            </div>
            <div>
              <label className="form-label">First Name</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={formData.first_name} 
                onChange={e => setFormData({ ...formData, first_name: e.target.value })} 
              />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={formData.last_name} 
                onChange={e => setFormData({ ...formData, last_name: e.target.value })} 
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                required 
                value={formData.email} 
                onChange={e => setFormData({ ...formData, email: e.target.value })} 
              />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select 
                className="form-select"
                value={formData.gender} 
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Class</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={formData.class_name} 
                onChange={e => setFormData({ ...formData, class_name: e.target.value })} 
                placeholder="e.g. 10A"
              />
            </div>
            <div>
              <label className="form-label">Section</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.section} 
                onChange={e => setFormData({ ...formData, section: e.target.value })} 
                placeholder="e.g. A"
              />
            </div>
            <div>
              <label className="form-label">Roll Number</label>
              <input 
                type="number" 
                className="form-control" 
                value={formData.roll_number} 
                onChange={e => setFormData({ ...formData, roll_number: e.target.value })} 
              />
            </div>
            <div>
              <label className="form-label">Parent Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.parent_name} 
                onChange={e => setFormData({ ...formData, parent_name: e.target.value })} 
              />
            </div>
            <div>
              <label className="form-label">Contact</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.contact} 
                onChange={e => setFormData({ ...formData, contact: e.target.value })} 
              />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">Address</label>
            <textarea 
              className="form-control" 
              rows="2"
              value={formData.address} 
              onChange={e => setFormData({ ...formData, address: e.target.value })} 
            />
          </div>
          <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingStudent ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
