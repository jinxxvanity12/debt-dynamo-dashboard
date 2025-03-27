
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Calendar, 
  Receipt, 
  PieChart, 
  Layers, 
  DollarSign, 
  CreditCard, 
  LogOut, 
  UserCircle
} from "lucide-react"; 
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const onLogout = () => {
    logout();
    toast.success("Logged out successfully");
  }

  const routes = [
    {
      path: "/monthly-overview",
      label: "Monthly Overview",
      icon: <Calendar className="h-5 w-5 mr-3" />
    },
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />
    },
    {
      path: "/transactions",
      label: "Transactions",
      icon: <Receipt className="h-5 w-5 mr-3" />
    },
    {
      path: "/budget",
      label: "Budget",
      icon: <PieChart className="h-5 w-5 mr-3" />
    },
    {
      path: "/categories",
      label: "Categories",
      icon: <Layers className="h-5 w-5 mr-3" />
    },
    {
      path: "/savings",
      label: "Savings Goals",
      icon: <DollarSign className="h-5 w-5 mr-3" />
    },
    {
      path: "/debt",
      label: "Debt Tracker",
      icon: <CreditCard className="h-5 w-5 mr-3" />
    },
    {
      path: "/reports",
      label: "Reports",
      icon: <PieChart className="h-5 w-5 mr-3" />
    }
  ];

  return (
    <div className={cn("pb-12 border-r h-screen relative", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl">
            <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
              <DollarSign className="h-5 w-5" />
            </span>
            <span>SavingsSaga</span>
          </Link>
          <div className="mt-3 flex items-center gap-2 px-2">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{user?.name || "User"}</span>
          </div>
        </div>
        <div className="px-3">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link key={route.path} to={route.path}>
                <Button
                  variant={location.pathname === route.path ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", location.pathname === route.path ? "font-semibold" : "")}
                >
                  {route.icon}
                  {route.label}
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Log out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
