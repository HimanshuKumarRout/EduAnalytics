import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { StudentDetail } from './pages/StudentDetail';
import { Subjects } from './pages/Subjects';
import { Results } from './pages/Results';
import { Analysis } from './pages/Analysis';
import { ClassRankings } from './pages/ClassRankings';
import { UploadData } from './pages/UploadData';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="results" element={<Results />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="rankings" element={<ClassRankings />} />
        <Route path="upload" element={<UploadData />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default App;
