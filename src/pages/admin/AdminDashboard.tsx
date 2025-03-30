
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import AdminLayout from './AdminLayout';

// Mock data for the dashboard
const mockStats = {
  totalRentals: 128,
  totalUsers: 72,
  totalBooks: 542,
  revenue: 3824.50,
  pendingOrders: 18,
  returnedBooks: 96,
};

const recentOrders = [
  { id: 'ORD123', user: 'john.doe@example.com', date: '2023-06-18', amount: 45.99, status: 'pending' },
  { id: 'ORD122', user: 'jane.smith@example.com', date: '2023-06-17', amount: 32.50, status: 'delivered' },
  { id: 'ORD121', user: 'bob.jones@example.com', date: '2023-06-16', amount: 28.75, status: 'returned' },
  { id: 'ORD120', user: 'sarah.wilson@example.com', date: '2023-06-15', amount: 37.25, status: 'delivered' },
  { id: 'ORD119', user: 'mike.brown@example.com', date: '2023-06-14', amount: 19.99, status: 'cancelled' },
];

const recentUsers = [
  { id: 'USR123', name: 'John Doe', email: 'john.doe@example.com', date: '2023-06-17' },
  { id: 'USR122', name: 'Jane Smith', email: 'jane.smith@example.com', date: '2023-06-16' },
  { id: 'USR121', name: 'Bob Jones', email: 'bob.jones@example.com', date: '2023-06-15' },
  { id: 'USR120', name: 'Sarah Wilson', email: 'sarah.wilson@example.com', date: '2023-06-14' },
  { id: 'USR119', name: 'Mike Brown', email: 'mike.brown@example.com', date: '2023-06-13' },
];

// Component for showing stats cards
const StatCard = ({ title, value, icon, change, isPositive }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  change?: string;
  isPositive?: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <p className={`text-xs flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
          {change} from last month
        </p>
      )}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // If not loading and user is either not logged in or not an admin, redirect
    if (!loading && (!currentUser || !isAdmin)) {
      navigate('/login');
    }
  }, [currentUser, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <StatCard 
                title="Total Rentals" 
                value={mockStats.totalRentals} 
                icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />} 
                change="12%"
                isPositive={true}
              />
              <StatCard 
                title="Total Users" 
                value={mockStats.totalUsers} 
                icon={<Users className="h-4 w-4 text-muted-foreground" />} 
                change="8%"
                isPositive={true}
              />
              <StatCard 
                title="Books in Catalog" 
                value={mockStats.totalBooks} 
                icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} 
                change="5%"
                isPositive={true}
              />
              <StatCard 
                title="Revenue (This Month)" 
                value={`$${mockStats.revenue.toFixed(2)}`} 
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} 
                change="3%"
                isPositive={false}
              />
              <StatCard 
                title="Pending Orders" 
                value={mockStats.pendingOrders} 
                icon={<Package className="h-4 w-4 text-muted-foreground" />} 
              />
              <StatCard 
                title="Returned This Month" 
                value={mockStats.returnedBooks} 
                icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} 
                change="15%"
                isPositive={true}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.user}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.amount.toFixed(2)}</p>
                          <p className={`text-xs ${
                            order.status === 'pending' ? 'text-amber-500' : 
                            order.status === 'delivered' ? 'text-green-500' : 
                            order.status === 'returned' ? 'text-blue-500' : 'text-red-500'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers.map((user) => (
                      <div key={user.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Joined {user.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-3">Order ID</th>
                        <th className="text-left pb-3">Customer</th>
                        <th className="text-left pb-3">Date</th>
                        <th className="text-left pb-3">Status</th>
                        <th className="text-right pb-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="py-3">{order.id}</td>
                          <td className="py-3">{order.user}</td>
                          <td className="py-3">{order.date}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'returned' ? 'bg-blue-100 text-blue-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 text-right">${order.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-3">User ID</th>
                        <th className="text-left pb-3">Name</th>
                        <th className="text-left pb-3">Email</th>
                        <th className="text-left pb-3">Joined</th>
                        <th className="text-right pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3">{user.id}</td>
                          <td className="py-3">{user.name}</td>
                          <td className="py-3">{user.email}</td>
                          <td className="py-3">{user.date}</td>
                          <td className="py-3 text-right">
                            <button className="text-blue-600 hover:text-blue-800 text-sm mr-2">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-sm">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
