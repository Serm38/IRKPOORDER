import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatPhone, cleanPhone } from '../utils/phoneUtils';
import { getBuildings } from '../services/buildingApi';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ surname: '', name: '', patronymic: '', phone: '', password: '', roleId: '', vkId: '', buildingId: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchUsers = async () => { try { const res = await axios.get('/api/admin/users'); setUsers(res.data); } catch { setError('Ошибка загрузки'); } };
  const fetchRoles = async () => { try { const res = await axios.get('/api/admin/roles'); setRoles(res.data); } catch { setError('Ошибка загрузки ролей'); } };
  const fetchBuildings = async () => { try { const data = await getBuildings(); setBuildings(data); } catch { setError('Ошибка загрузки корпусов'); } };
  useEffect(() => { fetchUsers(); fetchRoles(); fetchBuildings(); }, []);

  const resetForm = () => setForm({ surname: '', name: '', patronymic: '', phone: '', password: '', roleId: '', vkId: '', buildingId: '' }) || setEditingId(null) || setFieldErrors({});
  
  const validate = () => {
    const errors = {};
    if (!form.surname.trim() || form.surname.length < 2) errors.surname = 'Минимум 2 символа';
    if (!form.name.trim() || form.name.length < 2) errors.name = 'Минимум 2 символа';
    if (!form.phone.trim()) errors.phone = 'Обязательно';
    if (!form.roleId) errors.roleId = 'Выберите роль';
    if (!editingId && (!form.password || form.password.length < 6)) errors.password = 'Минимум 6 символов';
    const selectedRole = roles.find(r => r.id == form.roleId);
    if (selectedRole && selectedRole.name === 'employee' && !form.buildingId) {
      errors.buildingId = 'Для сотрудника укажите корпус';
    }
    if (selectedRole && selectedRole.name === 'employee' && !form.vkId) errors.vkId = 'Требуется VK ID';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const data = { ...form, phone: cleanPhone(form.phone) };
    try {
      if (editingId) await axios.put(`/api/admin/users/${editingId}`, data);
      else await axios.post('/api/admin/users', data);
      resetForm(); fetchUsers();
    } catch (err) { setError(err.response?.data?.message || 'Ошибка'); }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({ ...user, password: '', vkId: user.vkId || '', buildingId: user.buildingId || '' });
  };
  const handleDelete = async (id) => { if (window.confirm('Удалить?')) await axios.delete(`/api/admin/users/${id}`); fetchUsers(); };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') setForm(prev => ({ ...prev, phone: formatPhone(value) }));
    else setForm(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  };
  const selectedRole = roles.find(r => r.id == form.roleId);
  const showBuilding = selectedRole && selectedRole.name === 'employee';
  const showVkId = selectedRole && selectedRole.name === 'employee';

  return (
    <div className="user-manager">
      <h2>Пользователи</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group"><input name="surname" placeholder="Фамилия" value={form.surname} onChange={handleChange} />{fieldErrors.surname && <span className="field-error">{fieldErrors.surname}</span>}</div>
        <div className="form-group"><input name="name" placeholder="Имя" value={form.name} onChange={handleChange} />{fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}</div>
        <div className="form-group"><input name="patronymic" placeholder="Отчество" value={form.patronymic} onChange={handleChange} /></div>
        <div className="form-group"><input name="phone" placeholder="Телефон" value={form.phone} onChange={handleChange} />{fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}</div>
        <div className="form-group"><input name="password" type="password" placeholder={editingId ? 'Новый пароль' : 'Пароль'} value={form.password} onChange={handleChange} />{fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}</div>
        <div className="form-group"><select name="roleId" value={form.roleId} onChange={handleChange}><option value="">Роль</option>{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>{fieldErrors.roleId && <span className="field-error">{fieldErrors.roleId}</span>}</div>
        {showBuilding && (
          <div className="form-group">
            <select name="buildingId" value={form.buildingId} onChange={handleChange}>
              <option value="">Выберите корпус</option>
              {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            {fieldErrors.buildingId && <span className="field-error">{fieldErrors.buildingId}</span>}
          </div>
        )}
        {showVkId && <div className="form-group"><input name="vkId" placeholder="VK ID" value={form.vkId} onChange={handleChange} />{fieldErrors.vkId && <span className="field-error">{fieldErrors.vkId}</span>}</div>}
        <div className="form-buttons"><button type="submit">{editingId ? 'Сохранить' : 'Создать'}</button>{editingId && <button type="button" onClick={resetForm}>Отмена</button>}</div>
      </form>
      <table className="user-table">
        <thead><tr><th>ID</th><th>ФИО</th><th>Телефон</th><th>Роль</th><th>Корпус</th><th>VK ID</th><th>Действия</th></tr></thead>
        <tbody>{users.map(u => <tr key={u.id}>
          <td>{u.id}</td><td>{u.surname} {u.name} {u.patronymic}</td><td>{u.phone}</td><td>{u.role?.name}</td>
          <td>{u.building?.name || '-'}</td><td>{u.vkId || '-'}</td>
          <td><button onClick={() => handleEdit(u)}>✏️</button><button onClick={() => handleDelete(u.id)}>🗑️</button></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
};

export default UserManager;