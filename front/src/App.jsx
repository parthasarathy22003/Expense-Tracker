import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './Comp/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import Incomes from './pages/Incomes.jsx';
import Reports from './pages/Reports.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="incomes" element={<Incomes />} />
        <Route path="reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}