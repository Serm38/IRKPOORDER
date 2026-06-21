import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserManager from './UserManager';
import RoomManager from './RoomManager';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const navigate = useNavigate();
  return (
    <div className="admin-panel">
      <header className="admin-header">
        <button onClick={() => navigate('/')}>← На главную</button>
        <h1>Панель администрирования</h1>
      </header>
      <div className="tabs">
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Пользователи</button>
        <button className={activeTab === 'rooms' ? 'active' : ''} onClick={() => setActiveTab('rooms')}>Аудитории</button>
      </div>
      {activeTab === 'users' && <UserManager />}
      {activeTab === 'rooms' && <RoomManager />}
    </div>
  );
};

export default AdminPanel;