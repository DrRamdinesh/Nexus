import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';
import { ThemeProvider } from './components/ThemeContext';
import { saveUser, loadUser, clearUser } from './services/storageService';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<string | null>(() => loadUser());
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!loadUser());

    const handleLogin = (username: string, password: string): boolean => {
        // This is a mock authentication. In a real app, you'd call an API.
        // For this prototype, any non-empty username/password is valid.
        if (username.trim() !== '' && password.trim() !== '') {
            setIsAuthenticated(true);
            setCurrentUser(username);
            saveUser(username);
            return true;
        }
        return false;
    };
    
    const handleRegister = (username: string, password: string): { success: boolean; message: string } => {
        // This is a mock registration.
        if (username.trim() !== '' && password.trim() !== '') {
            setIsAuthenticated(true);
            setCurrentUser(username);
            saveUser(username);
            console.log(`User registered: ${username}`);
            return { success: true, message: 'Registration successful!' };
        }
        return { success: false, message: 'Username and password cannot be empty.'};
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentUser(null);
        clearUser();
        console.log('User logged out.');
    };

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
    }

    return (
      <ThemeProvider>
        <Dashboard onLogout={handleLogout} username={currentUser || 'pm_user'} />
      </ThemeProvider>
    );
};

export default App;