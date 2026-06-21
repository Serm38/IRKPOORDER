import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RequestList from './RequestList';
import RequestForm from './RequestForm';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get('/api/requests');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleStatusChange = async (id, newStatus) => {
    await axios.patch(`/api/requests/${id}/status`, { status: newStatus });
    fetchRequests();
  };

  if (loading) return <div>Загрузка...</div>;
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>IRKPO ORDERS</h1>
        <div className="user-info">
          <span>{user?.fio}</span>
          <span className="role-badge">{user?.role === 'admin' ? 'Администратор' : user?.role === 'employee' ? 'Работник' : 'Пользователь'}</span>
          {user?.role === 'admin' && <button onClick={() => navigate('/admin')}>Админ-панель</button>}
          <button onClick={logout} className="logout-btn">Выйти</button>
        </div>
      </header>
      <button className="create-request-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Отмена' : 'Создать заявку'}
      </button>
      {showForm && <RequestForm onCreated={() => { setShowForm(false); fetchRequests(); }} />}
      <RequestList requests={requests} userRole={user?.role} onStatusChange={handleStatusChange} />
    </div>
  );
};

export default Dashboard;