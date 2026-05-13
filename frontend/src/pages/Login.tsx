import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import { Card, Input, Button, Icon } from '../components';
import { resetAllStores } from '../utils/resetStores';
import { debugLog } from '../utils/logger';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const validateForm = () => {
    let isValid = true;

    if (!username.trim()) {
      setUsernameError('请输入用户名');
      isValid = false;
    } else {
      setUsernameError('');
    }

    if (!password.trim()) {
      setPasswordError('请输入密码');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleGuestMode = async () => {
    setLoginError('');
    setUsernameError('');
    setPasswordError('');
    setGuestLoading(true);

    try {
      const response = await apiClient.startGuestSession();
      const userInfo = response.user || response.user_info;
      const token = response.token || (response as any).access_token;

      if (!token || !userInfo) {
        throw new Error('无法进入尝鲜模式，请稍后重试');
      }

      setAuth(token, userInfo);
      resetAllStores();
      navigate('/');
    } catch (error) {
      let errorMessage = '无法进入尝鲜模式，请稍后重试';

      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      setLoginError(errorMessage);
    } finally {
      setGuestLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = (await apiClient.login({ username, password })) as any;

      if (response) {
        const userInfo = response.user || response.user_info || { username };
        const token = response.token || response.access_token;

        setAuth(token, userInfo);
        resetAllStores();
        navigate('/');

        setTimeout(() => {
          if (window.location.pathname === '/login') {
            window.location.href = '/';
          }
        }, 1000);
      }
    } catch (error) {
      let errorMessage = '登录失败，请检查用户名和密码';

      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }

      debugLog('login request failed without retry');
      setLoginError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card variant="center" padding="large" className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.headerLeft}>
            <img src="/logopic.svg" alt="Otium" className={styles.logoImage} />
          </div>
          <div className={styles.headerDivider}></div>
          <div className={styles.headerRight}>
            <h1 className={styles.loginTitle}>Otium</h1>
            <p className={styles.loginSubtitle}>拯救拖延症儿童的论文DDL</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={usernameError}
            placeholder="请输入用户名"
            fullWidth
            disabled={loading}
          />

          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            placeholder="请输入密码"
            fullWidth
            disabled={loading}
          />

          {loginError && (
            <div className={styles.errorMessage}>
              <Icon name="close" size="sm" variant="error" />
              <span>{loginError}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="large"
            loading={loading}
            fullWidth
            className={styles.loginButton}
            disabled={guestLoading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="large"
            loading={guestLoading}
            fullWidth
            className={styles.guestButton}
            disabled={loading}
            onClick={handleGuestMode}
          >
            {guestLoading ? '进入中...' : '尝鲜模式'}
          </Button>
        </form>

        <div className={styles.authLinks}>
          <Link to="/register" className={styles.authLink}>
            注册新账户
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
