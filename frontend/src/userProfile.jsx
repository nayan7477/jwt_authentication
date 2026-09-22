import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:3000/users/me`, {
            method: 'GET',
            credentials: 'include', // Ensures HTTP-only cookies are sent
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        navigate('/loginForm');
                        throw new Error('Unauthorized');
                    }
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                return response.json();
            })
            .then((data) => {
                console.log('User data received from backend:', data);
                setUser(data);
                setLoading(false);
            })
            .catch((err) => {
                if (err.message !== 'Unauthorized') {
                    setError(err.message);
                }
                setLoading(false);
            });
    }, [navigate]);

    if (loading) return <p>Loading user...</p>;
    if (error) return <p>Error: {error}</p>;

    async function handleLogout() {
        try {
            const response = await fetch('http://localhost:3000/log-out', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                navigate('/loginForm');
            } else {
                console.error('Logout failed');
            }
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
