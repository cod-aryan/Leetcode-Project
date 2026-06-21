import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../utils/axiosClient';

const Logout = () => {
  const { user, setUser } = useAuth();

    if (user) {
        axiosClient.post('/users/logout').then(() => {
            setUser(null);
        });
    }
    return <Navigate to="/auth" replace />;
};

export default Logout;