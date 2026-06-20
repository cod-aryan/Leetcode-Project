import { useAuth } from '../context/AuthContext';
import axiosClient from '../utils/axiosClient';

export default function Home() {
  const { user, setUser, loading } = useAuth();

  const handleLogout = async () => {
    setUser(null);
    await axiosClient.post("/users/logout");
    window.location.href = "/auth";
  };

  if (loading) {
    return <p className="text-center p-4 text-red-400">Loading...</p>;
  }
  if (!user) {
    return <p className="text-center p-4 text-red-400">You are not logged in. Please log in to access the home page.</p>;
  }
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mt-8">Welcome, {user.username}!</h1>
      <button className=" bg-red-500 text-white px-4 py-2 rounded mt-4" onClick={handleLogout}>Logout</button>
    </div>
  )
}