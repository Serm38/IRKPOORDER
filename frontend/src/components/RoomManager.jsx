import { useState, useEffect } from 'react';
import axios from 'axios';
import { getBuildings } from '../services/buildingApi';

const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [number, setNumber] = useState('');
  const [hasProjector, setHasProjector] = useState(false);
  const [buildingId, setBuildingId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchRooms = async () => { try { const res = await axios.get('/api/rooms'); setRooms(res.data); } catch { setError('Ошибка загрузки'); } };
  const fetchBuildings = async () => { try { const data = await getBuildings(); setBuildings(data); } catch { setError('Ошибка загрузки корпусов'); } };
  useEffect(() => { fetchRooms(); fetchBuildings(); }, []);

  const resetForm = () => { setNumber(''); setHasProjector(false); setBuildingId(''); setEditingId(null); setError(''); };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!number.trim()) return setError('Номер обязателен');
    if (!buildingId) return setError('Выберите корпус');
    try {
      if (editingId) await axios.put(`/api/rooms/${editingId}`, { number: number.trim(), hasProjector, buildingId });
      else await axios.post('/api/rooms', { number: number.trim(), hasProjector, buildingId });
      resetForm(); fetchRooms();
    } catch (err) { setError(err.response?.data?.message || 'Ошибка'); }
  };
  const handleEdit = (room) => { setEditingId(room.id); setNumber(room.number); setHasProjector(room.hasProjector); setBuildingId(room.buildingId); };
  const handleDelete = async (id) => { if (window.confirm('Удалить?')) await axios.delete(`/api/rooms/${id}`); fetchRooms(); };

  return (
    <div className="room-manager">
      <h2>Аудитории</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="room-form">
        <input type="text" placeholder="Номер" value={number} onChange={e => setNumber(e.target.value)} required />
        <label><input type="checkbox" checked={hasProjector} onChange={e => setHasProjector(e.target.checked)} /> Проектор</label>
        <select value={buildingId} onChange={e => setBuildingId(e.target.value)} required>
          <option value="">Корпус</option>
          {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button type="submit">{editingId ? 'Обновить' : 'Добавить'}</button>
        {editingId && <button type="button" onClick={resetForm}>Отмена</button>}
      </form>
      <table className="room-table">
        <thead><tr><th>ID</th><th>Номер</th><th>Проектор</th><th>Корпус</th><th>Действия</th></tr></thead>
        <tbody>{rooms.map(room => <tr key={room.id}>
          <td>{room.id}</td><td>{room.number}</td><td>{room.hasProjector ? 'Да' : 'Нет'}</td>
          <td>{room.building?.name}</td>
          <td><button onClick={() => handleEdit(room)}>✏️</button><button onClick={() => handleDelete(room.id)}>🗑️</button></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
};

export default RoomManager;