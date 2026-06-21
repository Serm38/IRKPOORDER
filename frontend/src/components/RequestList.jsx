import { useState } from 'react';
import '../styles/RequestList.css';

const statusMap = { pending: 'В ожидании', in_progress: 'В работе', completed: 'Выполнена', rejected: 'Отклонена' };

const RequestList = ({ requests, userRole, onStatusChange }) => {
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const filtered = requests.filter(req => (!filterType || req.type === filterType) && (!filterStatus || req.status === filterStatus));
  const canChange = userRole === 'employee' || userRole === 'admin';

  return (
    <div className="request-list-container">
      <h2>Список заявок</h2>
      <div className="filters">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Все типы</option>
          <option value="event">Мероприятия</option>
          <option value="repair">Ремонт</option>
          <option value="video">Видеосъёмка</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Все статусы</option>
          <option value="pending">В ожидании</option>
          <option value="in_progress">В работе</option>
          <option value="completed">Выполнена</option>
          <option value="rejected">Отклонена</option>
        </select>
      </div>
      {filtered.length === 0 ? <p>Нет заявок</p> : (
        <div className="request-cards">
          {filtered.map(req => (
            <div key={req.id} className="request-card">
              <div className="card-header">
                <span>№{req.id}</span>
                <span>{req.type === 'event' ? 'Мероприятие' : req.type === 'repair' ? 'Ремонт' : 'Видеосъёмка'}</span>
                <span className={`status-badge ${req.status}`}>{statusMap[req.status]}</span>
              </div>
              <div><strong>Создатель:</strong> {req.creatorFio}</div>
              {req.details && (
                <div>
                  {req.type === 'event' && <div>📅 {req.details.date} {req.details.startTime}-{req.details.endTime}, ауд. {req.details.room}</div>}
                  {req.type === 'repair' && <div>🔧 Ауд. {req.details.room}: {req.details.description}</div>}
                  {req.type === 'video' && <div>🎥 {req.details.date} {req.details.startTime}-{req.details.endTime}, {req.details.location}</div>}
                  {req.buildingName && <div>🏢 Корпус: {req.buildingName}</div>}
                </div>
              )}
              <div className="dates">Создана: {new Date(req.createdAt).toLocaleString()}</div>
              {req.statusChangedAt && <div>Изменена: {new Date(req.statusChangedAt).toLocaleString()}</div>}
              {canChange && req.status !== 'completed' && req.status !== 'rejected' && (
                <div className="card-actions">
                  {req.status === 'pending' && <button onClick={() => onStatusChange(req.id, 'in_progress')}>В работу</button>}
                  {req.status === 'in_progress' && <>
                    <button onClick={() => onStatusChange(req.id, 'completed')}>Выполнена</button>
                    <button onClick={() => onStatusChange(req.id, 'rejected')}>Отклонить</button>
                  </>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestList;