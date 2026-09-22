import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import apiClient from './ApiClient.jsx';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError(null);
        try {
            const response = await apiClient.post('/login', { email, password }); // use of axios instead of fetch API , along with interceptors
            console.log('Success:', response.data);
            navigate('/userProfile');
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data || err.message;
            console.error(`Error: ${message}`);
            setError(typeof message === 'string' ? message : 'Login failed. Please try again.');
        }
    }

    return (
        <div className="font-display min-h-screen w-full bg-blue-500 text-white flex flex-col justify-center p-10">
            <p className="text-3xl font-semibold">Login</p>
            <div className="p-10 mt-5">
                {error && <p className="text-red-300 font-medium mb-4">{error}</p>}
                <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                    <div>
                        <label className="text-xl inline-block w-30">Email</label>
                        <input
                            className="border border-white/40 w-60 p-2 rounded"
                            type="email"
                            value={email}
                            placeholder="abc@gmail.com"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xl inline-block w-30">Password</label>
                        <input
                            className="border border-white/40 w-60 p-2 rounded"
                            type="password"
                            value={password}
                            placeholder="Enter password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        className="text-xl w-32 rounded-xl cursor-pointer border border-white p-1 hover:bg-white hover:text-blue-500 transition-colors"
                        type="submit"
                    >
                        Login
                    </button>
                </form>
            </div>
            <div>
                <h3>Don't have an account?</h3>
                <Link className="text-yellow-300 underline" to="/signupForm">
                    Sign Up here
                </Link>
            </div>
        </div>
    );
}
