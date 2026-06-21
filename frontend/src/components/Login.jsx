import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatPhone, cleanPhone } from '../utils/phoneUtils';
import '../styles/Login.css';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) return setError('Все поля обязательны');
    try {
      await login(cleanPhone(phone), password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Вход в систему</h2>
        {error && <div className="error-message">{error}</div>}
        <label>Телефон</label>
        <input type="tel" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="+7 (___) ___-__-__" />
        <label>Пароль</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
};

export default Login;