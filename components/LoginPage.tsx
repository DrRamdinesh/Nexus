import React, { useState } from 'react';
import { NexusLogo, AtSymbolIcon, LockClosedIcon } from '../constants';

interface LoginPageProps {
    onLogin: (username: string, password: string) => boolean;
    onRegister: (username: string, password: string) => { success: boolean, message: string };
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onRegister }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (mode === 'login') {
            if (!onLogin(username, password)) {
                setError('Invalid username or password.');
            }
        } else { // signup
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
            if(password.length < 6) {
                setError('Password must be at least 6 characters long.');
                return;
            }
            const result = onRegister(username, password);
            if (!result.success) {
                setError(result.message);
            }
        }
    };

    const toggleMode = () => {
        setMode(prev => prev === 'login' ? 'signup' : 'login');
        setError(null);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
    }
    
    const commonInputClass = "w-full bg-slate-800/50 border border-slate-600/50 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500";

    return (
        <div className="min-h-screen w-full flex items-center justify-center font-sans p-4 bg-slate-800">
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-indigo-600 p-3 rounded-xl mb-4">
                        <NexusLogo className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Nexus</h1>
                    <p className="text-slate-300">AIfy.Predict.Deliver</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold text-white text-center mb-4">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
                    
                    {error && <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm rounded-md p-3 text-center">{error}</div>}

                    <div className="relative">
                         <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <AtSymbolIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={commonInputClass}
                            required
                            aria-label="Username"
                        />
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <LockClosedIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={commonInputClass}
                            required
                            aria-label="Password"
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <LockClosedIcon className="w-5 h-5 text-slate-400" />
                            </div>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={commonInputClass}
                                required
                                aria-label="Confirm Password"
                            />
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                    >
                        {mode === 'login' ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button onClick={toggleMode} className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors">
                        {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};