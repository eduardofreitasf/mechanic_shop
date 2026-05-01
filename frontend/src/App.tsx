import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Plus, Phone, User, Users, Wrench, Car, Hash, Info, Calendar, ClipboardList, PlusCircle, Trash2, ArrowLeft, Clock, FileText, DollarSign, LayoutDashboard, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ServiceItem {
  id?: string;
  description: string;
  price: number;
}

interface ServiceOrder {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  items: ServiceItem[];
  hourlyRate: number;
  labourHours: number;
  observation?: string;
  totalPrice: number;
  createdAt: string;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  ownerId: string;
  owner?: Client;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  phone: string;
  vehicles?: Vehicle[];
  createdAt: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'vehicles' | 'service-orders'>('dashboard');

  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  
  const [search, setSearch] = useState('');
  
  // Modals / Views
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  
  // Service Orders Sub-views
  const [orderView, setOrderView] = useState<'list' | 'create'>('list');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  // Client Form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Vehicle Form
  const [newLicensePlate, setNewLicensePlate] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newMileage, setNewMileage] = useState('');
  const [newOwnerId, setNewOwnerId] = useState('');

  // Service Order Form
  const [orderClientId, setOrderClientId] = useState('');
  const [orderVehicleId, setOrderVehicleId] = useState('');
  const [orderMileage, setOrderMileage] = useState('');
  const [orderHourlyRate, setOrderHourlyRate] = useState('50');
  const [orderLabourHours, setOrderLabourHours] = useState('');
  const [orderObservation, setOrderObservation] = useState('');
  const [orderItems, setOrderItems] = useState<ServiceItem[]>([{ description: '', price: 0 }]);

  const fetchClients = async () => {
    try { const { data } = await axios.get('http://localhost:3000/clients', { params: { query: search } }); setClients(data); } 
    catch (error) { console.error('Failed to fetch clients:', error); }
  };

  const fetchVehicles = async () => {
    try { const { data } = await axios.get('http://localhost:3000/vehicles', { params: { query: search } }); setVehicles(data); } 
    catch (error) { console.error('Failed to fetch vehicles:', error); }
  };

  const fetchServiceOrders = async () => {
    try { const { data } = await axios.get('http://localhost:3000/service-orders'); setServiceOrders(data); } 
    catch (error) { console.error('Failed to fetch service orders:', error); }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchClients();
      fetchVehicles();
      fetchServiceOrders();
    } else if (activeTab === 'clients') {
      fetchClients();
    } else if (activeTab === 'vehicles') {
      fetchVehicles();
    } else if (activeTab === 'service-orders' && orderView === 'list') {
      fetchServiceOrders();
    }
  }, [search, activeTab, orderView]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/clients', { name: newName, phone: newPhone });
      setNewName(''); setNewPhone(''); setIsClientModalOpen(false); fetchClients();
    } catch (error) { console.error('Failed to create client:', error); }
  };

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/vehicles', {
        licensePlate: newLicensePlate, brand: newBrand, model: newModel,
        year: newYear, mileage: newMileage, ownerId: newOwnerId,
      });
      setNewLicensePlate(''); setNewBrand(''); setNewModel(''); setNewYear(''); setNewMileage(''); setNewOwnerId('');
      setIsVehicleModalOpen(false); fetchVehicles();
    } catch (error) { console.error('Failed to create vehicle:', error); }
  };

  const handleCreateServiceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/service-orders', {
        vehicleId: orderVehicleId,
        currentMileage: orderMileage,
        hourlyRate: orderHourlyRate,
        labourHours: orderLabourHours,
        observation: orderObservation,
        items: orderItems,
      });
      setOrderClientId(''); setOrderVehicleId(''); setOrderMileage(''); setOrderLabourHours(''); setOrderObservation(''); setOrderItems([{ description: '', price: 0 }]);
      setOrderView('list');
    } catch (error) { console.error('Failed to create service order:', error); }
  };

  const openVehicleModal = () => { fetchClients(); setIsVehicleModalOpen(true); };
  
  const openOrderCreatePage = () => { 
    fetchClients(); 
    fetchVehicles(); 
    setOrderView('create'); 
  };

  const handleClientChangeInOrder = (clientId: string) => {
    setOrderClientId(clientId);
    setOrderVehicleId('');
    setOrderMileage('');
  };

  const handleVehicleChangeInOrder = (vehicleId: string) => {
    setOrderVehicleId(vehicleId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setOrderMileage(vehicle.mileage.toString());
    }
  };

  const addOrderItem = () => { setOrderItems([...orderItems, { description: '', price: 0 }]); };
  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) setOrderItems(orderItems.filter((_, i) => i !== index));
  };
  const updateOrderItem = (index: number, field: keyof ServiceItem, value: string | number) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const orderTotalEstimation = useMemo(() => {
    const rate = parseFloat(orderHourlyRate) || 0;
    const hours = parseFloat(orderLabourHours) || 0;
    const partsTotal = orderItems.reduce((acc, item) => acc + (parseFloat(item.price as any) || 0), 0);
    return partsTotal + (hours * rate);
  }, [orderItems, orderHourlyRate, orderLabourHours]);

  const clientVehicles = useMemo(() => vehicles.filter(v => v.ownerId === orderClientId), [vehicles, orderClientId]);

  // Dashboard Statistics
  const totalRevenue = useMemo(() => serviceOrders.reduce((acc, order) => acc + order.totalPrice, 0), [serviceOrders]);
  
  // Chart Data: Last 7 Days Revenue
  const chartData = useMemo(() => {
    const days = 7;
    const data = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - i);
      const dateStr = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      
      const revenue = serviceOrders.reduce((sum, order) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate.toDateString() === targetDate.toDateString()) {
          return sum + order.totalPrice;
        }
        return sum;
      }, 0);

      data.push({ name: dateStr, revenue });
    }
    return data;
  }, [serviceOrders]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0 shadow-2xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-indigo-500 p-2 rounded-lg shadow-lg shadow-indigo-500/30"><Wrench size={24} className="text-white" /></div>
          <span className="text-xl font-bold tracking-wide">MechanicPro</span>
        </div>
        <nav className="flex-1 p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>
          <ul className="space-y-1.5">
            <li>
              <button onClick={() => { setActiveTab('dashboard'); setSearch(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                <LayoutDashboard size={20} className={activeTab === 'dashboard' ? 'text-indigo-200' : ''} /> Dashboard
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('clients'); setSearch(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'clients' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                <Users size={20} className={activeTab === 'clients' ? 'text-indigo-200' : ''} /> Clients
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('vehicles'); setSearch(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'vehicles' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                <Car size={20} className={activeTab === 'vehicles' ? 'text-indigo-200' : ''} /> Vehicles
              </button>
            </li>
            <li>
              <button onClick={() => { setActiveTab('service-orders'); setSearch(''); setOrderView('list'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'service-orders' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
                <ClipboardList size={20} className={activeTab === 'service-orders' ? 'text-indigo-200' : ''} /> Service Orders
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 z-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'clients' && 'Clients Management'}
              {activeTab === 'vehicles' && 'Vehicles Management'}
              {activeTab === 'service-orders' && orderView === 'list' && 'Service Orders'}
              {activeTab === 'service-orders' && orderView === 'create' && 'Register Service Order'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab === 'dashboard' && 'Welcome back. Here is what is happening in your shop today.'}
              {activeTab === 'clients' && 'Manage your customer base and contact info.'}
              {activeTab === 'vehicles' && 'Manage the vehicles registered in the shop.'}
              {activeTab === 'service-orders' && orderView === 'list' && 'Track and view all past services.'}
              {activeTab === 'service-orders' && orderView === 'create' && 'Fill out the form below to create a new service record.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {(activeTab === 'clients' || activeTab === 'vehicles' || (activeTab === 'service-orders' && orderView === 'list')) && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder={`Search ${activeTab}...`} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 bg-slate-100 border-transparent rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all w-64 shadow-sm" />
              </div>
            )}
            {activeTab === 'clients' && <button onClick={() => setIsClientModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm shadow-indigo-200 whitespace-nowrap"><Plus size={18} /> New Client</button>}
            {activeTab === 'vehicles' && <button onClick={openVehicleModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm shadow-indigo-200 whitespace-nowrap"><Plus size={18} /> New Vehicle</button>}
            {activeTab === 'service-orders' && orderView === 'list' && <button onClick={openOrderCreatePage} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm shadow-indigo-200 whitespace-nowrap"><Plus size={18} /> New Order</button>}
            {activeTab === 'service-orders' && orderView === 'create' && (
              <button onClick={() => setOrderView('list')} className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm whitespace-nowrap">
                <ArrowLeft size={18} /> Back to List
              </button>
            )}
            {activeTab === 'dashboard' && (
              <button onClick={() => { setActiveTab('service-orders'); setOrderView('create'); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm shadow-indigo-200 whitespace-nowrap"><Plus size={18} /> Quick Order</button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-8 relative">
          
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 relative z-10">
                    <DollarSign size={28} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900">€{totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 relative z-10">
                    <ClipboardList size={28} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-500 mb-1">Service Orders</p>
                    <h3 className="text-2xl font-bold text-slate-900">{serviceOrders.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 relative z-10">
                    <Car size={28} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-500 mb-1">Vehicles</p>
                    <h3 className="text-2xl font-bold text-slate-900">{vehicles.length}</h3>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0 relative z-10">
                    <Users size={28} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-500 mb-1">Clients</p>
                    <h3 className="text-2xl font-bold text-slate-900">{clients.length}</h3>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="text-indigo-500" size={20} />
                    <h3 className="text-lg font-bold text-slate-800">Revenue (Last 7 Days)</h3>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `€${value}`} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          formatter={(value: number) => [`€${value.toFixed(2)}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity className="text-emerald-500" size={20} />
                    <h3 className="text-lg font-bold text-slate-800">Recent Services</h3>
                  </div>
                  <div className="flex-1 overflow-auto">
                    {serviceOrders.length > 0 ? (
                      <div className="space-y-4">
                        {serviceOrders.slice(0, 5).map((order) => (
                          <div key={order.id} onClick={() => setSelectedOrder(order)} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium">
                                {order.vehicle?.owner?.name.charAt(0) || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{order.vehicle?.owner?.name}</p>
                                <p className="text-xs text-slate-500">{order.vehicle?.licensePlate}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600 text-sm">€{order.totalPrice.toFixed(2)}</p>
                              <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 pb-8">
                        <ClipboardList size={32} className="opacity-20" />
                        <p className="text-sm">No recent orders found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tables (Clients / Vehicles / Service Orders List) */}
          {((activeTab === 'clients') || (activeTab === 'vehicles') || (activeTab === 'service-orders' && orderView === 'list')) && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  {activeTab === 'clients' && (
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                      <th className="px-6 py-4 font-medium">Client Name</th><th className="px-6 py-4 font-medium">Phone Number</th><th className="px-6 py-4 font-medium">Vehicles Count</th><th className="px-6 py-4 font-medium">Added On</th>
                    </tr>
                  )}
                  {activeTab === 'vehicles' && (
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                      <th className="px-6 py-4 font-medium">License Plate</th><th className="px-6 py-4 font-medium">Brand & Model</th><th className="px-6 py-4 font-medium">Year / Mileage</th><th className="px-6 py-4 font-medium">Owner</th>
                    </tr>
                  )}
                  {activeTab === 'service-orders' && (
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                      <th className="px-6 py-4 font-medium">Customer Name</th><th className="px-6 py-4 font-medium">Vehicle</th><th className="px-6 py-4 font-medium">Total Price</th><th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTab === 'clients' && (
                    clients.length > 0 ? clients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="bg-indigo-100 text-indigo-600 p-2 rounded-full"><User size={18} /></div><span className="font-medium text-slate-900">{client.name}</span></div></td>
                        <td className="px-6 py-4"><div className="flex items-center gap-2 text-slate-600"><Phone size={16} className="text-slate-400" />{client.phone}</div></td>
                        <td className="px-6 py-4"><div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-sm font-medium"><Car size={14} />{client.vehicles?.length || 0}</div></td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{new Date(client.createdAt).toLocaleDateString()}</td>
                      </tr>
                    )) : (<tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500"><div className="flex flex-col items-center"><Users size={32} className="text-slate-300 mb-2" /><p className="font-medium text-slate-700">No clients found</p></div></td></tr>)
                  )}
                  {activeTab === 'vehicles' && (
                    vehicles.length > 0 ? vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4"><div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg font-mono text-sm font-bold tracking-widest inline-block border border-indigo-200">{vehicle.licensePlate.toUpperCase()}</div></td>
                        <td className="px-6 py-4"><div className="flex flex-col"><span className="font-medium text-slate-900">{vehicle.brand}</span><span className="text-sm text-slate-500">{vehicle.model}</span></div></td>
                        <td className="px-6 py-4"><div className="flex flex-col gap-1 text-sm text-slate-600"><div className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {vehicle.year}</div><div className="flex items-center gap-1.5"><Hash size={14} className="text-slate-400"/> {vehicle.mileage.toLocaleString()} km</div></div></td>
                        <td className="px-6 py-4"><div className="flex items-center gap-2 text-slate-700"><User size={16} className="text-slate-400" />{vehicle.owner?.name || 'Unknown'}</div></td>
                      </tr>
                    )) : (<tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500"><div className="flex flex-col items-center"><Car size={32} className="text-slate-300 mb-2" /><p className="font-medium text-slate-700">No vehicles found</p></div></td></tr>)
                  )}
                  {activeTab === 'service-orders' && orderView === 'list' && (
                    serviceOrders.length > 0 ? serviceOrders.map((order) => (
                      <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-slate-50/80 transition-colors group cursor-pointer">
                        <td className="px-6 py-4 font-medium text-slate-900">{order.vehicle?.owner?.name || 'Unknown'}</td>
                        <td className="px-6 py-4"><div className="flex flex-col"><span className="font-medium text-slate-900">{order.vehicle?.brand} {order.vehicle?.model}</span><span className="text-sm text-slate-500">{order.vehicle?.licensePlate}</span></div></td>
                        <td className="px-6 py-4 font-medium text-emerald-600">€{order.totalPrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    )) : (<tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500"><div className="flex flex-col items-center"><ClipboardList size={32} className="text-slate-300 mb-2" /><p className="font-medium text-slate-700">No orders found</p></div></td></tr>)
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Create Order Page */}
          {activeTab === 'service-orders' && orderView === 'create' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-200">
              <form onSubmit={handleCreateServiceOrder} className="p-8">
                
                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><Car size={20} className="text-indigo-600"/> Vehicle Information</h3>
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                    <select required value={orderClientId} onChange={e => handleClientChangeInOrder(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
                      <option value="" disabled>Select Client</option>
                      {clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
                    <select required disabled={!orderClientId || clientVehicles.length === 0} value={orderVehicleId} onChange={e => handleVehicleChangeInOrder(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-50">
                      <option value="" disabled>Select Vehicle</option>
                      {clientVehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} ({vehicle.licensePlate})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Update Mileage (km)</label>
                    <input type="number" required min="0" value={orderMileage} onChange={e => setOrderMileage(e.target.value)} disabled={!orderVehicleId} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Labour Rate (€)</label>
                    <input type="number" step="0.01" required min="0" value={orderHourlyRate} onChange={e => setOrderHourlyRate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Wrench size={20} className="text-indigo-600"/> Operations</h3>
                  <button type="button" onClick={addOrderItem} className="text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"><PlusCircle size={16}/> Add Operation</button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-sm font-medium text-slate-500 w-full">Description</th>
                        <th className="px-4 py-3 text-sm font-medium text-slate-500 w-32">Price (€)</th>
                        <th className="px-4 py-3 text-sm font-medium text-slate-500 w-16 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orderItems.map((item, index) => (
                        <tr key={index} className="bg-white">
                          <td className="px-4 py-3">
                            <input type="text" required value={item.description} onChange={e => updateOrderItem(index, 'description', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 text-sm" placeholder="e.g. Oil change" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="number" required min="0" step="0.01" value={item.price} onChange={e => updateOrderItem(index, 'price', e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 text-sm" />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {orderItems.length > 1 && (
                              <button type="button" onClick={() => removeOrderItem(index)} className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"><Trash2 size={16}/></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><Clock size={20} className="text-indigo-600"/> Finalizing</h3>
                <div className="grid grid-cols-12 gap-6 mb-10">
                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Labour (hours)</label>
                    <input type="number" required min="0" step="0.1" value={orderLabourHours} onChange={e => setOrderLabourHours(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" placeholder="e.g. 2.5" />
                  </div>
                  <div className="col-span-12 md:col-span-8">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observation (optional)</label>
                    <input type="text" value={orderObservation} onChange={e => setOrderObservation(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" placeholder="e.g. Front brakes will need replacement soon" />
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-indigo-900 text-lg">Total Estimated Price</h4>
                    <p className="text-sm text-indigo-700/80">Includes all operations and {orderLabourHours || 0} hours of labour</p>
                  </div>
                  <div className="text-3xl font-bold text-indigo-700">
                    €{orderTotalEstimation.toFixed(2)}
                  </div>
                </div>

                <div className="mt-8 flex gap-3 justify-end pt-6 border-t border-slate-100">
                  <button type="button" onClick={() => setOrderView('list')} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                  <button type="submit" disabled={!orderVehicleId} className="px-8 py-3 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">Save Order</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Service Order Details Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full h-[90vh] md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Order Details</h2>
                <p className="text-sm text-slate-500 font-mono mt-1">#{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="bg-white p-2 rounded-full shadow-sm text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">✕</button>
            </div>
            
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Customer & Vehicle Info */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-2 uppercase tracking-wider"><User size={16}/> Customer</div>
                  <p className="text-lg font-medium text-slate-900">{selectedOrder.vehicle.owner?.name}</p>
                  <p className="text-slate-500 mt-1 flex items-center gap-1.5"><Phone size={14}/> {selectedOrder.vehicle.owner?.phone}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-2 uppercase tracking-wider"><Car size={16}/> Vehicle</div>
                  <p className="text-lg font-medium text-slate-900">{selectedOrder.vehicle.brand} {selectedOrder.vehicle.model}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">{selectedOrder.vehicle.licensePlate}</span>
                    <span className="text-slate-500 text-sm flex items-center gap-1"><Hash size={14}/> {selectedOrder.vehicle.mileage.toLocaleString()} km</span>
                  </div>
                </div>
              </div>

              {/* Operations Table */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2"><Wrench size={16}/> Operations Performed</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase">Description</th>
                        <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-5 py-3 text-slate-700">{item.description}</td>
                          <td className="px-5 py-3 text-slate-900 font-medium text-right">€{item.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observation */}
              {selectedOrder.observation && (
                <div className="mb-8 bg-amber-50 p-4 rounded-xl border border-amber-100/50">
                  <h3 className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-1.5"><FileText size={16}/> Observations</h3>
                  <p className="text-amber-900/80 text-sm leading-relaxed">{selectedOrder.observation}</p>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2"><DollarSign size={16}/> Cost Breakdown</h3>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-3 text-slate-600">
                    <span>Parts / Operations Total</span>
                    <span className="font-medium text-slate-900">€{selectedOrder.items.reduce((acc, i) => acc + i.price, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 text-slate-600 pb-4 border-b border-slate-200 border-dashed">
                    <span>Labour ({selectedOrder.labourHours}h @ €{selectedOrder.hourlyRate}/h)</span>
                    <span className="font-medium text-slate-900">€{(selectedOrder.labourHours * selectedOrder.hourlyRate).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total Price</span>
                    <span className="text-2xl font-bold text-emerald-600">€{selectedOrder.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h2 className="text-lg font-semibold text-slate-800">Add New Client</h2><button onClick={() => setIsClientModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button></div>
            <form onSubmit={handleCreateClient} className="p-6">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label><input type="text" required value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label><input type="tel" required value={newPhone} onChange={e => setNewPhone(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" /></div>
              </div>
              <div className="mt-8 flex gap-3 justify-end"><button type="button" onClick={() => setIsClientModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" className="px-5 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700">Save Client</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h2 className="text-lg font-semibold text-slate-800">Add New Vehicle</h2><button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button></div>
            <form onSubmit={handleCreateVehicle} className="p-6">
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">License Plate</label><input type="text" required value={newLicensePlate} onChange={e => setNewLicensePlate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 uppercase" /></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Brand</label><input type="text" required value={newBrand} onChange={e => setNewBrand(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Model</label><input type="text" required value={newModel} onChange={e => setNewModel(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" /></div></div>
                <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Year</label><input type="number" required min="1900" max="2100" value={newYear} onChange={e => setNewYear(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Mileage (km)</label><input type="number" required min="0" value={newMileage} onChange={e => setNewMileage(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" /></div></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Owner</label><select required value={newOwnerId} onChange={e => setNewOwnerId(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"><option value="" disabled>Select a client</option>{clients.map(client => <option key={client.id} value={client.id}>{client.name}</option>)}</select></div>
              </div>
              <div className="mt-8 flex gap-3 justify-end"><button type="button" onClick={() => setIsVehicleModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100">Cancel</button><button type="submit" disabled={clients.length === 0} className="px-5 py-2.5 rounded-xl font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">Save Vehicle</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
