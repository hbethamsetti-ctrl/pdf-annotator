import { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import './App.css';

export default function App() {
  const [token, setToken] = useState('');
  const [view, setView] = useState('login');
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (token, email) => {
    setToken(token);
    setUserEmail(email);
    setView('dashboard');
    localStorage.setItem('jwt', token);
    localStorage.setItem('email', email);
  };

  const handleLogout = () => {
    setToken('');
    setUserEmail('');
    setView('login');
    localStorage.removeItem('jwt');
    localStorage.removeItem('email');
  };

  return (
    <div className="container">
      <h1>PDF Annotator</h1>
      {!token && (
        <div>
          <div className="tab">
            <button onClick={() => setView('login')}>Login</button>
            <button onClick={() => setView('register')}>Register</button>
          </div>
          {view === 'login' && <LoginForm onLogin={handleLogin} />}
          {view === 'register' && <RegisterForm onRegister={() => setView('login')} />}
        </div>
      )}
      {token && <Dashboard onLogout={handleLogout} email={userEmail} />}
    </div>
  );
}