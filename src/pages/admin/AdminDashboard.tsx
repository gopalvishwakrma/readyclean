
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from './AdminLayout';
import { getAllOrders, updateOrderStatus } from '../../lib/orderService';
import { Order } from '@/types';
import { toast } from '@/lib/toast';

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

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const statusStyles = {
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    returned: "bg-purple-100 text-purple-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Dashboard stats
  const [stats, setStats] = useState({
    totalRentals: 0,
    totalUsers: 0,
    totalBooks: 0,
    revenue: 0,
    pendingOrders: 0,
    returnedBooks: 0,
  });

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const allOrders = await getAllOrders();
      setOrders(allOrders);
      
      // Update stats
      setStats({
        totalRentals: allOrders.length,
        totalUsers: new Set(allOrders.map(order => order.userId)).size,
        totalBooks: allOrders.reduce((acc, order) => acc + order.books.length, 0),
        revenue: allOrders.reduce((acc, order) => acc + order.totalAmount, 0),
        pendingOrders: allOrders.filter(order => order.status === 'pending').length,
        returnedBooks: allOrders.filter(order => order.status === 'returned').reduce(
          (acc, order) => acc + order.books.length, 0
        ),
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders data");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    // If not loading and user is either not logged in or not an admin, redirect
    if (!loading && (!currentUser || !isAdmin)) {
      navigate('/login');
      return;
    }

    if (isAdmin) {
      fetchOrders();
    }
  }, [currentUser, isAdmin, loading, navigate]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      // Update local state to reflect the change
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Update statistics
      if (newStatus === 'pending') {
        setStats(prev => ({ ...prev, pendingOrders: prev.pendingOrders + 1 }));
      } else if (newStatus === 'returned') {
        const orderBooks = orders.find(o => o.id === orderId)?.books.length || 0;
        setStats(prev => ({ 
          ...prev, 
          returnedBooks: prev.returnedBooks + orderBooks,
          pendingOrders: prev.pendingOrders - (
            orders.find(o => o.id === orderId)?.status === 'pending' ? 1 : 0
          )
        }));
      }
    }
  };

  const handleOpenStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setStatusDialogOpen(true);
  };

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
                value={stats.totalRentals} 
                icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />} 
                change="12%"
                isPositive={true}
              />
              <StatCard 
                title="Total Users" 
                value={stats.totalUsers} 
                icon={<Users className="h-4 w-4 text-muted-foreground" />} 
                change="8%"
                isPositive={true}
              />
              <StatCard 
                title="Books in Catalog" 
                value={stats.totalBooks} 
                icon={<BookOpen className="h-4 w-4 text-muted-foreground" />} 
                change="5%"
                isPositive={true}
              />
              <StatCard 
                title="Revenue (This Month)" 
                value={`$${stats.revenue.toFixed(2)}`} 
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} 
                change="3%"
                isPositive={true}
              />
              <StatCard 
                title="Pending Orders" 
                value={stats.pendingOrders} 
                icon={<Package className="h-4 w-4 text-muted-foreground" />} 
              />
              <StatCard 
                title="Returned This Month" 
                value={stats.returnedBooks} 
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
                    {ordersLoading ? (
                      <p>Loading orders...</p>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{order.id.substring(0, 8)}...</p>
                            <p className="text-sm text-muted-foreground">{order.userEmail}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                            <OrderStatusBadge status={order.status} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.length > 0 ? (
                      Array.from(new Set(orders.map(o => o.userEmail)))
                        .slice(0, 5)
                        .map((email, index) => {
                          const order = orders.find(o => o.userEmail === email);
                          return (
                            <div key={index} className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{order?.userName || "User"}</p>
                                <p className="text-sm text-muted-foreground">{email}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                  {orders.filter(o => o.userEmail === email).length} orders
                                </p>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <p>No users found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">Loading orders...</TableCell>
                        </TableRow>
                      ) : orders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center">No orders found</TableCell>
                        </TableRow>
                      ) : (
                        orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.id.substring(0, 8)}...</TableCell>
                            <TableCell>
                              <div>
                                <p>{order.userName || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {order.createdAt?.toDate
                                ? new Date(order.createdAt.toDate()).toLocaleDateString()
                                : new Date().toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <OrderStatusBadge status={order.status} />
                            </TableCell>
                            <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mr-2"
                                onClick={() => handleOpenStatusDialog(order)}
                              >
                                Update Status
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">Loading users...</TableCell>
                        </TableRow>
                      ) : (
                        Array.from(
                          new Map(
                            orders.map(order => [
                              order.userEmail,
                              {
                                email: order.userEmail,
                                name: order.userName || "Unknown",
                                orderCount: orders.filter(o => o.userEmail === order.userEmail).length,
                                totalSpent: orders
                                  .filter(o => o.userEmail === order.userEmail)
                                  .reduce((sum, o) => sum + o.totalAmount, 0)
                              }
                            ])
                          ).values()
                        ).map((user, index) => (
                          <TableRow key={index}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.orderCount}</TableCell>
                            <TableCell>${user.totalSpent.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/admin/users/${encodeURIComponent(user.email)}`)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Order Status Update Dialog */}
        <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update Order Status</AlertDialogTitle>
              <AlertDialogDescription>
                Change the status of order #{selectedOrder?.id.substring(0, 8)}...
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant={selectedOrder?.status === 'pending' ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleUpdateOrderStatus(selectedOrder?.id || '', 'pending')}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Pending
                </Button>
                
                <Button
                  variant={selectedOrder?.status === 'confirmed' ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleUpdateOrderStatus(selectedOrder?.id || '', 'confirmed')}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirmed
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant={selectedOrder?.status === 'delivered' ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleUpdateOrderStatus(selectedOrder?.id || '', 'delivered')}
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Delivered
                </Button>
                
                <Button
                  variant={selectedOrder?.status === 'returned' ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => handleUpdateOrderStatus(selectedOrder?.id || '', 'returned')}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Returned
                </Button>
              </div>
              
              <Button
                variant={selectedOrder?.status === 'cancelled' ? "default" : "outline"}
                className="w-full"
                onClick={() => handleUpdateOrderStatus(selectedOrder?.id || '', 'cancelled')}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelled
              </Button>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
