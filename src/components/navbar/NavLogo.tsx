
import { Link } from "react-router-dom";

interface NavLogoProps {
  isAuthenticated: boolean;
}

export const NavLogo = ({ isAuthenticated }: NavLogoProps) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="bg-paintergrowth-600 h-8 w-8 rounded-md flex items-center justify-center">
        <span className="text-white font-bold text-xl">P</span>
      </div>
      <Link to={isAuthenticated ? "/dashboard" : "/"} className="text-paintergrowth-800 font-bold text-xl">
        Paintergrowth.ai
      </Link>
    </div>
  );
};
