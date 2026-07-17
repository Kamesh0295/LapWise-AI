import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  MdAdminPanelSettings,
  MdDashboard,
  MdComputer,
  MdPeople,
  MdAdd,
  MdDelete,
  MdEdit,
  MdTrendingUp
} from 'react-icons/md';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import adminService from '../services/adminService';
import laptopService from '../services/laptopService';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'laptops' | 'users'
  const [showAddLaptopModal, setShowAddLaptopModal] = useState(false);

  // Add Laptop form fields
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [series, setSeries] = useState('');
  const [launchYear, setLaunchYear] = useState(2024);
  const [brightness, setBrightness] = useState(300);
  const [warranty, setWarranty] = useState('1 Year Manufacturer Warranty');
  const [price, setPrice] = useState('');
  const [processor, setProcessor] = useState('');
  const [gpu, setGpu] = useState('');
  const [ram, setRam] = useState(16);
  const [storage, setStorage] = useState('');
  const [display, setDisplay] = useState('');
  const [battery, setBattery] = useState('');
  const [weight, setWeight] = useState(1.8);
  const [screenSize, setScreenSize] = useState(15.6);
  const [refreshRate, setRefreshRate] = useState(144);
  const [operatingSystem, setOperatingSystem] = useState('Windows 11 Home');
  const [description, setDescription] = useState('');
  const [specScores, setSpecScores] = useState({
    cpu: 80, gpu: 70, cooling: 75, ram: 80, display: 75,
    battery: 70, keyboard: 80, weight: 70, speakers: 75, storage: 80
  });

  // Guard admin access
  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Query: Fetch core stats
  const { data: statsRes } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getStats()
  });
  const stats = statsRes?.data || { usersCount: 0, laptopsCount: 0, reviewsCount: 0, averageRating: 0 };

  // Query: Fetch platform analytics charts data
  const { data: analyticsRes } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => adminService.getAnalytics()
  });
  const analytics = analyticsRes?.data || { topWishlistedLaptops: [], popularSearchQueries: [], recommendationCategoryDistribution: [] };

  // Query: Fetch all laptops
  const { data: laptopsRes } = useQuery({
    queryKey: ['adminLaptops'],
    queryFn: () => laptopService.getAllLaptops({ limit: 100 })
  });
  const laptops = laptopsRes?.data?.laptops || [];

  // Query: Fetch users list
  const { data: usersRes } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminService.getUsers(1)
  });
  const users = usersRes?.data?.users || [];

  // Mutations
  const addLaptopMutation = useMutation({
    mutationFn: (formData) => laptopService.addLaptop(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminLaptops']);
      setShowAddLaptopModal(false);
      resetForm();
    },
    onError: (err) => alert(err.message)
  });

  const deleteLaptopMutation = useMutation({
    mutationFn: (id) => laptopService.deleteLaptop(id),
    onSuccess: () => queryClient.invalidateQueries(['adminLaptops']),
    onError: (err) => alert(err.message)
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => adminService.updateRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries(['adminUsers']),
    onError: (err) => alert(err.message)
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onSuccess: () => queryClient.invalidateQueries(['adminUsers']),
    onError: (err) => alert(err.message)
  });

  const resetForm = () => {
    setBrand(''); setModel(''); setPrice(''); setProcessor(''); setGpu('');
    setSeries(''); setLaunchYear(2024); setBrightness(300); setWarranty('1 Year Manufacturer Warranty');
    setRam(16); setStorage(''); setDisplay(''); setBattery(''); setWeight(1.8);
    setScreenSize(15.6); setRefreshRate(144); setOperatingSystem('Windows 11 Home');
    setDescription('');
    setSpecScores({
      cpu: 80, gpu: 70, cooling: 75, ram: 80, display: 75,
      battery: 70, keyboard: 80, weight: 70, speakers: 75, storage: 80
    });
  };

  const handleAddLaptopSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('brand', brand);
    formData.append('model', model);
    formData.append('series', series);
    formData.append('launchYear', launchYear);
    formData.append('brightness', brightness);
    formData.append('warranty', warranty);
    formData.append('price', price);
    formData.append('processor', processor);
    formData.append('gpu', gpu);
    formData.append('ram', ram);
    formData.append('storage', storage);
    formData.append('display', display);
    formData.append('battery', battery);
    formData.append('weight', weight);
    formData.append('screenSize', screenSize);
    formData.append('refreshRate', refreshRate);
    formData.append('operatingSystem', operatingSystem);
    formData.append('description', description);
    formData.append('purpose', JSON.stringify(['General'])); // default purpose
    formData.append('specScores', JSON.stringify(specScores));

    // Create custom mock store links automatically to satisfy the price comparison layout:
    const basePrice = Number(price);
    const storeLinks = [
      {
        storeName: "Amazon",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
        price: basePrice,
        discount: 10,
        availability: "In Stock",
        buyUrl: "https://www.amazon.in"
      },
      {
        storeName: "Flipkart",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg",
        price: basePrice - 800,
        discount: 12,
        availability: "In Stock",
        buyUrl: "https://www.flipkart.com"
      }
    ];
    formData.append('storeLinks', JSON.stringify(storeLinks));

    // Seed initial price history
    const priceHistory = [
      { price: basePrice + 3000, recordedAt: new Date(Date.now() - 30 * 24 * 65 * 60 * 1000) },
      { price: basePrice, recordedAt: new Date() }
    ];
    formData.append('priceHistory', JSON.stringify(priceHistory));

    // Handle dummy file to satisfy multer limits
    addLaptopMutation.mutate(formData);
  };

  const handleToggleRole = (userObj) => {
    const nextRole = userObj.role === 'admin' ? 'user' : 'admin';
    updateRoleMutation.mutate({ userId: userObj._id, role: nextRole });
  };

  // Chart Formatting
  const COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899'];
  
  const popularQueryChartData = analytics.popularSearchQueries.map(item => ({
    query: item._id,
    count: item.searchCount
  }));

  const categoryDistributionData = analytics.recommendationCategoryDistribution.map((item, idx) => ({
    name: item._id,
    value: item.count
  }));

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <MdAdminPanelSettings className="text-primary-500" size={32} />
        <div>
          <h1 className="font-outfit text-3xl font-extrabold">Admin Console</h1>
          <p className="text-xs text-gray-400 mt-1">Audit platforms operations, manage catalogs inventories, and configure access permissions.</p>
        </div>
      </div>

      {/* Stats Summary cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { title: 'Registered Users', val: stats.usersCount, desc: 'Excluding administrators', icon: <MdPeople size={24} /> },
          { title: 'Laptops Seeded', val: stats.laptopsCount, desc: 'Active specifications profiles', icon: <MdComputer size={24} /> },
          { title: 'Reviews Logged', val: stats.reviewsCount, desc: 'Ratings written by users', icon: <MdDashboard size={24} /> },
          { title: 'Average Review Star', val: `${stats.averageRating} ★`, desc: 'Overall catalog score', icon: <MdTrendingUp size={24} /> },
        ].map((sCard) => (
          <div key={sCard.title} className="p-6 bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-3xl shadow-sm space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">{sCard.title}</span>
              {sCard.icon}
            </div>
            <h3 className="font-outfit text-3xl font-extrabold">{sCard.val}</h3>
            <p className="text-[10px] text-gray-400">{sCard.desc}</p>
          </div>
        ))}
      </div>

      {/* Tab controls */}
      <div className="flex border-b border-gray-200 dark:border-darkBorder gap-6">
        {['overview', 'laptops', 'users'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-3 text-sm font-bold capitalize transition-colors ${
              activeTab === t
                ? 'border-b-2 border-primary-500 text-primary-500'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab charts */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Popular Search Queries (Bar Chart) */}
          <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-3xl p-6 shadow-sm">
            <h3 className="font-outfit text-sm font-bold mb-4">Trending Search Queries</h3>
            <div className="h-64">
              {popularQueryChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-400">No query logs logged yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularQueryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="query" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Chart 2: Recommendations Categories distributions (Pie Chart) */}
          <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-3xl p-6 shadow-sm">
            <h3 className="font-outfit text-sm font-bold mb-4">Recommendations Category Split</h3>
            <div className="h-64 flex items-center justify-center">
              {categoryDistributionData.length === 0 ? (
                <div className="text-xs text-gray-400">No recommendation runs logged yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Laptops management tab */}
      {activeTab === 'laptops' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-outfit text-lg font-bold">Laptop Inventory</h3>
            <button 
              onClick={() => setShowAddLaptopModal(true)}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow"
            >
              <MdAdd size={16} />
              <span>SeedTest Laptop</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200/50 dark:border-darkBorder shadow-sm bg-white dark:bg-darkCard">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-darkBorder bg-gray-50/50 dark:bg-gray-800/10 font-bold text-gray-400">
                  <th className="p-4">Brand</th>
                  <th className="p-4">Model</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">RAM / Storage</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 font-semibold text-gray-700 dark:text-gray-300">
                {laptops.map(laptop => (
                  <tr key={laptop._id}>
                    <td className="p-4 capitalize">{laptop.brand}</td>
                    <td className="p-4">{laptop.model}</td>
                    <td className="p-4 text-green-600 font-extrabold">₹{laptop.price.toLocaleString('en-IN')}</td>
                    <td className="p-4">{laptop.ram}GB / {laptop.storage}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => deleteLaptopMutation.mutate(laptop._id)}
                        className="p-1.5 border rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 border-red-100 dark:border-red-950 transition-colors"
                        title="Delete laptop profile"
                      >
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users management tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h3 className="font-outfit text-lg font-bold">Registered Users Panel</h3>

          <div className="overflow-x-auto rounded-2xl border border-gray-200/50 dark:border-darkBorder shadow-sm bg-white dark:bg-darkCard">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-darkBorder bg-gray-50/50 dark:bg-gray-800/10 font-bold text-gray-400">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 font-semibold text-gray-700 dark:text-gray-300">
                {users.map(uObj => (
                  <tr key={uObj._id}>
                    <td className="p-4">{uObj.name}</td>
                    <td className="p-4">{uObj.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 font-bold rounded-full text-[10px] uppercase tracking-wider ${
                        uObj.role === 'admin' ? 'bg-primary-100 text-primary-800 dark:bg-primary-950' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 text-gray-400'
                      }`}>
                        {uObj.role}
                      </span>
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => handleToggleRole(uObj)}
                        className="px-3 py-1 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-[10px] font-bold"
                      >
                        Toggle Admin Role
                      </button>
                      <button
                        onClick={() => deleteUserMutation.mutate(uObj._id)}
                        className="p-1.5 border rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-100 dark:border-red-950/50"
                        title="Delete user account"
                      >
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SeedTest Laptop modal */}
      {showAddLaptopModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-6">
            <h3 className="font-outfit text-lg font-bold">Add Laptop</h3>

            <form onSubmit={handleAddLaptopSubmit} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 block mb-1">Brand</label>
                  <input type="text" required value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Dell" className="w-full p-2 border rounded-lg dark:bg-darkBg dark:border-gray-800" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Model</label>
                  <input type="text" required value={model} onChange={e => setModel(e.target.value)} placeholder="e.g. XPS 15" className="w-full p-2 border rounded-lg dark:bg-darkBg dark:border-gray-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 block mb-1">Series</label>
                  <input type="text" value={series} onChange={e => setSeries(e.target.value)} placeholder="e.g. XPS" className="w-full p-2 border rounded-lg dark:bg-darkBg dark:border-gray-800" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Launch Year</label>
                  <input type="number" required value={launchYear} onChange={e => setLaunchYear(Number(e.target.value))} placeholder="2024" className="w-full p-2 border rounded-lg dark:bg-darkBg dark:border-gray-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 block mb-1">Display Brightness (nits)</label>
                  <input type="number" value={brightness} onChange={e => setBrightness(Number(e.target.value))} placeholder="300" className="w-full p-2 border rounded-lg dark:bg-darkBg dark:border-gray-800" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Warranty Period</label>
                  <input type="text" value={warranty} onChange={e => setWarranty(e.target.value)} placeholder="1 Year Warranty" className="w-full p-2 border rounded-lg dark:bg-darkBg dark:border-gray-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 block mb-1">Price (₹)</label>
                  <input type="number" required value={price} onChange={e => setPrice(e.target.value)} placeholder="90000" className="w-full p-2 border rounded-lg dark:bg-darkBg dark:border-gray-800" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Processor</label>
                  <input type="text" required value={processor} onChange={e => setProcessor(e.target.value)} placeholder="Core i7" className="w-full p-2 border rounded-lg dark:bg-darkBg dark:border-gray-800" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 block mb-1">RAM (GB)</label>
                  <input type="number" required value={ram} onChange={e => setRam(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-darkBg dark:border-gray-800" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Storage</label>
                  <input type="text" required value={storage} onChange={e => setStorage(e.target.value)} placeholder="1TB SSD" className="w-full p-2 border rounded-lg dark:bg-darkBg dark:border-gray-800" />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Weight (kg)</label>
                  <input type="number" step="0.1" required value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-darkBg dark:border-gray-800" />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-850">
                <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Configure Spec Scores (1-100)</span>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(specScores).slice(0, 4).map(key => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="capitalize">{key} Score</span>
                      <input 
                        type="number" 
                        min="1" 
                        max="100" 
                        value={specScores[key]}
                        onChange={(e) => setSpecScores(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                        className="w-16 p-1 border rounded dark:bg-darkBg dark:border-gray-800 text-center" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 justify-end">
                <button type="button" onClick={() => setShowAddLaptopModal(false)} className="px-4 py-2 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-bold">Cancel</button>
                <button type="submit" disabled={addLaptopMutation.isPending} className="px-6 py-2 bg-primary-500 text-white font-bold rounded-xl shadow">Save Laptop</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
