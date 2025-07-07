import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FormPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('github_token', token);
      console.log('✅ GitHub token saved:', token);
      navigate('/'); 
    } else {
      console.error('❌ No GitHub token found in URL');
    }
  }, [navigate]);

  return <p>Processing login...</p>;
};

export default FormPage;
