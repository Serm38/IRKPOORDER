import { useState, useEffect } from 'react';
import axios from 'axios';
import { getBuildings } from '../services/buildingApi';
import '../styles/RequestForm.css';

const RequestForm = ({ onCreated }) => {
  const [type, setType] = useState('event');
  const [responsibleId, setResponsibleId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    date: '', startTime: '', endTime: '', room: '',
    needVideo: false, needSound: false, needProjector: false, extraInfo: '',
    repairRoom: '', description: '',
    videoDate: '', location: '', videoStartTime: '', videoEndTime: '', usageInfo: '',
    buildingId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, employeesRes, buildingsData] = await Promise.all([
          axios.get('/api/rooms'),
          axios.get('/api/admin/employees'),
          getBuildings()
        ]);
        setRooms(roomsRes.data);
        setEmployees(employeesRes.data);
        setBuildings(buildingsData);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const filteredRooms = formData.buildingId
    ? rooms.filter(room => room.buildingId === parseInt(formData.buildingId))
    : rooms;

  const filteredEmployees = formData.buildingId
    ? employees.filter(emp => emp.buildingId === parseInt(formData.buildingId))
    : employees;

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: inputType === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    if (type === 'event') {
      if (!formData.date) newErrors.date = 'Дата обязательна';
      if (!formData.startTime) newErrors.startTime = 'Время начала обязательно';
      if (!formData.endTime) newErrors.endTime = 'Время окончания обязательно';
      if (!formData.room) newErrors.room = 'Выберите аудиторию';
      if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime)
        newErrors.endTime = 'Окончание позже начала';
      if (formData.date && formData.startTime && new Date(`${formData.date}T${formData.startTime}`) < new Date())
        newErrors.startTime = 'Нельзя в прошлом';
      if (!formData.buildingId) newErrors.buildingId = 'Укажите корпус';
    } else if (type === 'repair') {
      if (!formData.repairRoom) newErrors.repairRoom = 'Аудитория обязательна';
      if (!formData.description.trim()) newErrors.description = 'Опишите проблему';
      if (!formData.buildingId) newErrors.buildingId = 'Укажите корпус';
    } else {
      if (!formData.videoDate) newErrors.videoDate = 'Укажите дату съёмки';
      if (!formData.location) newErrors.location = 'Место обязательно';
      if (!formData.videoStartTime) newErrors.videoStartTime = 'Время начала обязательно';
      if (!formData.videoEndTime) newErrors.videoEndTime = 'Время окончания обязательно';
      if (formData.videoStartTime && formData.videoEndTime && formData.videoStartTime >= formData.videoEndTime)
        newErrors.videoEndTime = 'Окончание позже начала';
      if (formData.videoDate && new Date(formData.videoDate) < new Date(new Date().setHours(0,0,0,0)))
        newErrors.videoDate = 'Дата не может быть в прошлом';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildDetails = () => {
    if (type === 'event') {
      return {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        room: formData.room,
        needVideo: formData.needVideo,
        needSound: formData.needSound,
        needProjector: formData.needProjector,
        extraInfo: formData.extraInfo
      };
    }
    if (type === 'repair') {
      return {
        room: formData.repairRoom,
        description: formData.description
      };
    }
    return {
      date: formData.videoDate,
      location: formData.location,
      startTime: formData.videoStartTime,
      endTime: formData.videoEndTime,
      usageInfo: formData.usageInfo
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      type,
      responsibleId: responsibleId || null,
      details: buildDetails(),
      buildingId: (type === 'event' || type === 'repair') ? formData.buildingId : null
    };
    try {
      await axios.post('/api/requests', payload);
      onCreated();
    } catch (err) {
      alert('Ошибка создания заявки: ' + (err.response?.data?.message || ''));
    }
  };

  return (
    <form className="request-form" onSubmit={handleSubmit}>
      <h2>Новая заявка</h2>
      <div className="form-group">
        <label>Тип</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="event">Мероприятие</option>
          <option value="repair">Ремонт</option>
          <option value="video">Видеосъёмка</option>
        </select>
      </div>

      {(type === 'event' || type === 'repair') && (
        <div className="form-group">
          <label>Корпус</label>
          <select name="buildingId" value={formData.buildingId} onChange={handleChange} required>
            <option value="">Выберите корпус</option>
            {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {errors.buildingId && <span className="field-error">{errors.buildingId}</span>}
        </div>
      )}

      <div className="form-group">
        <label>Ответственный</label>
        <select value={responsibleId} onChange={e => setResponsibleId(e.target.value)}>
          <option value="">Все сотрудники</option>
          {filteredEmployees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.surname} {emp.name} {emp.building ? `(${emp.building.name})` : ''}</option>
          ))}
        </select>
      </div>

      {type === 'event' && (
        <>
          <div className="form-group"><label>Дата</label><input type="date" name="date" value={formData.date} onChange={handleChange} required />{errors.date && <span className="field-error">{errors.date}</span>}</div>
          <div className="form-row">
            <div className="form-group"><label>Начало</label><input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />{errors.startTime && <span className="field-error">{errors.startTime}</span>}</div>
            <div className="form-group"><label>Окончание</label><input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />{errors.endTime && <span className="field-error">{errors.endTime}</span>}</div>
          </div>
          <div className="form-group">
            <label>Аудитория</label>
            <select name="room" value={formData.room} onChange={handleChange} required>
              <option value="">Выберите</option>
              {filteredRooms.map(r => <option key={r.id} value={r.number}>{r.number} ({r.building?.name})</option>)}
            </select>
            {errors.room && <span className="field-error">{errors.room}</span>}
          </div>
          <div className="checkbox-group">
            <label><input type="checkbox" name="needVideo" checked={formData.needVideo} onChange={handleChange} />Видеосъёмка</label>
            <label><input type="checkbox" name="needSound" checked={formData.needSound} onChange={handleChange} />Звукооператор</label>
            <label><input type="checkbox" name="needProjector" checked={formData.needProjector} onChange={handleChange} />Проектор</label>
          </div>
          <div className="form-group"><label>Доп. инфо</label><textarea name="extraInfo" rows="3" value={formData.extraInfo} onChange={handleChange} /></div>
        </>
      )}

      {type === 'repair' && (
        <>
          <div className="form-group">
            <label>Аудитория</label>
            <select name="repairRoom" value={formData.repairRoom} onChange={handleChange} required>
              <option value="">Выберите</option>
              {filteredRooms.map(r => <option key={r.id} value={r.number}>{r.number} ({r.building?.name})</option>)}
            </select>
            {errors.repairRoom && <span className="field-error">{errors.repairRoom}</span>}
          </div>
          <div className="form-group"><label>Описание</label><textarea name="description" rows="4" value={formData.description} onChange={handleChange} required />{errors.description && <span className="field-error">{errors.description}</span>}</div>
        </>
      )}

      {type === 'video' && (
        <>
          <div className="form-group">
            <label>Дата съёмки</label>
            <input type="date" name="videoDate" value={formData.videoDate} onChange={handleChange} required />
            {errors.videoDate && <span className="field-error">{errors.videoDate}</span>}
          </div>
          <div className="form-group">
            <label>Место съёмки</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required />
            {errors.location && <span className="field-error">{errors.location}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Начало</label>
              <input type="time" name="videoStartTime" value={formData.videoStartTime} onChange={handleChange} required />
              {errors.videoStartTime && <span className="field-error">{errors.videoStartTime}</span>}
            </div>
            <div className="form-group">
              <label>Окончание</label>
              <input type="time" name="videoEndTime" value={formData.videoEndTime} onChange={handleChange} required />
              {errors.videoEndTime && <span className="field-error">{errors.videoEndTime}</span>}
            </div>
          </div>
          <div className="form-group">
            <label>Использование материала</label>
            <textarea name="usageInfo" rows="3" value={formData.usageInfo} onChange={handleChange} />
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="submit">Отправить</button>
        <button type="button" onClick={onCreated}>Отмена</button>
      </div>
    </form>
  );
};

export default RequestForm;