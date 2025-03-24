
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { 
  LayoutDashboard, 
  CircleDollarSign, 
  PiggyBank, 
  CreditCard, 
  BarChart3, 
  Tag, 
  ArrowLeftCircle,
  ArrowRightCircle,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: CircleDollarSign,
    },
    {
      title: "Budget",
      href: "/budget",
      icon: PiggyBank,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart3,
    },
    {
      title: "Categories",
      href: "/categories",
      icon: Tag,
    },
  ];

  const savingsNavItems = [
    {
      title: "Savings Goals",
      href: "/savings",
      icon: PiggyBank,
    },
    {
      title: "Debt Tracker",
      href: "/debt",
      icon: CreditCard,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Successfully logged out");
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-border transition-all duration-300 ease-in-out",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center px-4 h-14 border-b border-border">
        <Link
          to="/dashboard"
          className={cn(
            "flex items-center font-semibold text-primary text-lg transition-all duration-300",
            collapsed && "justify-center"
          )}
        >
          <span className="text-primary">
            <CircleDollarSign className="h-6 w-6" />
          </span>
          {!collapsed && <span className="ml-2">SavingsSaga</span>}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center"
              )}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>

        <div className="mt-8">
          <h3 className={cn(
            "px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
            collapsed && "text-center"
          )}>
            {!collapsed ? "Financial Goals" : "Goals"}
          </h3>
          <nav className="mt-2 space-y-1">
            {savingsNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "mr-0" : "mr-2")} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-3 border-t border-border">
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                {user?.name.charAt(0)}
              </div>
              <div className="text-sm font-medium truncate-text max-w-[130px]">
                {user?.name}
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <ArrowRightCircle size={20} /> : <ArrowLeftCircle size={20} />}
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={handleLogout}
          className={cn(
            "mt-2 w-full text-muted-foreground hover:text-foreground",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={18} className={collapsed ? "" : "mr-2"} />
          {!collapsed && "Logout"}
        </Button>
      </div>
    </div>
  );
}
