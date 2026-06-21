import { useAuth } from '../context/AuthContext';
import axiosClient from '../utils/axiosClient';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, setUser, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axiosClient.post("/users/logout");
    setUser(null);
    return navigate('/auth', { replace: true });
  };

  if (loading) {
    return <p className="text-center p-4 text-red-400">Loading...</p>;
  }
  if (!user) {
    return (
      <div className="text-center">
        <p className="text-center p-4 text-red-400">You are not logged in. Please log in to access the home page.</p>
        <Link to="/auth" className="text-blue-500 underline">Go to Login</Link>
      </div>
    );

  }
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mt-8">Welcome, {user.username}!</h1>
      <button className=" bg-red-500 text-white px-4 py-2 rounded mt-4" onClick={handleLogout}>Logout</button>
    </div>
  )
}