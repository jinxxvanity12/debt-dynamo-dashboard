
import { Navigate } from "react-router-dom";

const Login = () => {
  // Since we're not using login anymore, simply redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Login;
