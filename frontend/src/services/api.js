const API_BASE = '/api';

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    const text = await res.text();

    if (!res.ok) {
      let serverError = '';
      try {
        const errorData = JSON.parse(text);
        serverError = errorData.error || errorData.message;
      } catch {
        // text is not JSON
      }
      throw new Error(serverError || `Server returned error (${res.status})`);
    }

    if (!text || !text.trim()) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Received invalid response from server.');
    }
  } catch (err) {
    if (
      err.name === 'TypeError' && 
      (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed'))
    ) {
      throw new Error('Cannot connect to the Backend API. Please ensure the Django server is running on http://127.0.0.1:8000');
    }
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboard() {
    return request('/dashboard/');
  },

  // Students
  getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/students/${query ? `?${query}` : ''}`);
  },

  getStudent(id) {
    return request(`/students/${id}/`);
  },

  createStudent(data) {
    return request('/students/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  updateStudent(id, data) {
    return request(`/students/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  deleteStudent(id) {
    return request(`/students/${id}/`, {
      method: 'DELETE',
    });
  },

  // Subjects
  getSubjects() {
    return request('/subjects/');
  },

  createSubject(data) {
    return request('/subjects/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  deleteSubject(id) {
    return request(`/subjects/${id}/`, {
      method: 'DELETE',
    });
  },

  // Results
  getResults(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/results/${query ? `?${query}` : ''}`);
  },

  createResult(data) {
    return request('/results/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  deleteResult(id) {
    return request(`/results/${id}/`, {
      method: 'DELETE',
    });
  },

  // Analytics
  getAnalysis() {
    return request('/analysis/');
  },

  getClassRankings(className = '') {
    const query = className ? `?class_name=${encodeURIComponent(className)}` : '';
    return request(`/class-rankings/${query}`);
  },

  // Charts
  getGradeDist() {
    return request('/chart/grade-dist/');
  },

  getSubjectAvg() {
    return request('/chart/subject-avg/');
  },

  getClassPerformance() {
    return request('/chart/class-performance/');
  },

  getTopStudents() {
    return request('/chart/top-students/');
  },

  getExamTrend() {
    return request('/chart/exam-trend/');
  },

  getStudentChart(id) {
    return request(`/chart/student/${id}/`);
  },

  // Upload
  uploadData(formData) {
    return request('/upload/', {
      method: 'POST',
      body: formData,
    });
  }
};
