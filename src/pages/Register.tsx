
import { Navigate } from "react-router-dom";

const Register = () => {
  // Since we're not using register anymore, simply redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Register;
