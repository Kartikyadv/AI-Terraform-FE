import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FormPage from './pages/FormPage';
import Chat from './components/Chat';

function App() {
  const [githubUser, setGithubUser] = useState(null);

  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/github';
  };

  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.login) {
            setGithubUser(data);
            console.log('✅ GitHub user:', data);
          }
        })
        .catch(err => console.error('❌ GitHub user fetch error:', err));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="app-container">
              <h2>Welcome to the Chat App</h2>
              {githubUser ? (
                <div>
                  <p>🔓 Logged in as <strong>{githubUser.login}</strong></p>
                  <img
                    src={githubUser.avatar_url}
                    alt="avatar"
                    className="avatar"
                  />
                </div>
              ) : (
                <button className="login-btn" onClick={handleLogin}>
                  Login with GitHub
                </button>
              )}
            </div>
          }
        />
        <Route path="/form" element={<FormPage />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
