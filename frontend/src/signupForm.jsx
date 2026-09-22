import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

export function SignupForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        age: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const URL = 'http://localhost:3000/signup';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to complete signup');
            }
            const data = await response.json();
            console.log('Signup successful:', data);
            setFormData({ email: '', password: '', name: '', age: '' });
            navigate('/loginForm');
        } catch (err) {
            console.error('Error posting item:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className=" font-display min-h-screen w-full bg-blue-500 text-white flex flex-col justify-center p-10">
            <p className="text-3xl font-bold"> Signup here </p>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <form className="flex flex-col gap-4 mt-6 p-10" onSubmit={handleSignup}>
                    <div>
                        <label className="text-xl inline-block w-30" htmlFor="email">
                            Email
                        </label>
                        <input
                            className="border-1 inline-60 p-2"
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            placeholder="abc@gmail.com"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xl inline-block w-30" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="border-1 inline-60 p-2"
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            placeholder="Password must be alphanumeric"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xl inline-block w-30" htmlFor="name">
                            Name
                        </label>
                        <input
                            className="border-1 inline-60 p-2"
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            placeholder="Enter your name"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xl inline-block w-30" htmlFor="age">
                            Age
                        </label>

                        <input
                            className="border-1 inline-60 p-2"
                            id="age"
                            name="age"
                            type="number"
                            value={formData.age}
                            placeholder="Enter your age"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <button
                            className="border-1 mx-30 inline-32 rounded-xl p-1 hover:cursor-pointer mt-4 text-xl"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Signing up...' : 'Sign up'}
                        </button>
                    </div>
                </form>
            </div>
            <Link style={{ textDecoration: 'none' }} to="/loginForm">
                Go back to <span className="text-yellow-500"> Login page</span>
            </Link>
        </div>
    );
}
