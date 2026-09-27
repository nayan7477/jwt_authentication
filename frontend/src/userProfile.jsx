import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import apiClient from './ApiClient.jsx';

export function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiClient.get('/users/me'); // use of axios instead of fetch API , along with interceptors
                setUser(response.data);
                setLoading(false);
            } catch (err) {
                const message = err.response?.data?.message || err.response?.data || err.message;
                console.error(`Error: ${message}`);
                setLoading(false);
                navigate('/loginForm');
            }
        };
        fetchData();
    }, [navigate]);

    if (loading) return <p>Loading user...</p>;

    async function handleLogout() {
        try {
            await apiClient.post('/log-out');
            navigate('/loginForm');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    return (
        <div className="font-display w-full bg-blue-500 text-white p-8">
            <div className="flex flex-row justify-between">
                <h1 className="text-2xl">
                    Welcome <span className="text-yellow-500">{user?.name}</span>
                </h1>
                <button className="hover:cursor-pointer font-semibold" onClick={handleLogout}>
                    Log Out
                </button>
            </div>
        </div>
    );
}
