import { Link } from 'react-router';
import './index.css';

export default function HomePage() {
    return (
        <>
            <div className="font-display min-h-screen w-full bg-blue-500 text-white p-10">
                <div>
                    <h1 className="text-6xl font-bold"> Welcome to Homepage </h1>
                    <div className="mt-6 bg-white-300 flex flex-col  justify-center p-3">
                        <Link className="text-3xl  hover:text-yellow-500" style={{ textDecoration: 'none' }} to="/loginForm">
                            Login Here
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
