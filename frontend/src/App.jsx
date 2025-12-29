import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, FileText, Settings, Cloud, Plus, Search, 
  User, Bell, CheckCircle, Bot, Copy, ChevronRight, Car, Shield, AlertTriangle
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

// Configuração API
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://crm-seguros.onrender.com';
const api = axios.create({ baseURL: API_URL });

// --- COMPONENTES UI (DESIGN SYSTEM) ---

const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3.5 mx-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon size={20} className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="font-medium text-sm tracking-wide">{label}</span>
      {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </Link>
  );
};

const StatCard = ({ title, value, sub, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
      <Icon size={80} />
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
          <Icon size={24} />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {trend === 'up' ? '▲ Alta' : '▼ Atenção'}
        </span>
      </div>
      <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
      <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mt-1">{title}</p>
      <p className="text-xs text-slate-400 mt-2">{sub}</p>
    </div>
  </div>
);

// --- PÁGINAS ---

const Dashboard = () => {
  const [stats, setStats] = useState({ totalClients: 0, activePolicies: 0, newLeads: 0, expiring: 0 });
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [s, c] = await Promise.all([
                api.get('/dashboard-stats'),
                api.get('/dashboard-charts')
            ]);
            setStats(s.data);
            setChartData({
                labels: c.data.labels,
                datasets: [{
                    data: c.data.distribuicao,
                    backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#64748b'],
                    borderWidth: 0,
                }]
            });
        } catch (e) { console.error("Erro dashboard", e); }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Dashboard Geral</h2>
            <p className="text-slate-500">Bem-vindo de volta, Neto.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
            <span className="flex h-3 w-3 relative ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600 pr-2">Sistema Operacional</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Clientes Totais" value={stats.totalClients} sub="Base ativa atualizada" icon={Users} trend="up" />
        <StatCard title="Apólices Ativas" value={stats.activePolicies} sub="Proteção garantida" icon={Shield} trend="up" />
        <StatCard title="Novos Leads" value={stats.newLeads} sub="Captados via Typebot" icon={Bot} trend="up" />
        <StatCard title="Vencendo (30d)" value={stats.expiring} sub="Necessita ação imediata" icon={AlertTriangle} trend="down" />
      </div>

      {/* Charts & Financials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Financeiro */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <p className="text-slate-400 font-medium mb-1">Receita Mensal Estimada</p>
                <h3 className="text-4xl font-bold">R$ 142.300,00</h3>
                <div className="mt-8 flex gap-8">
                    <div>
                        <p className="text-slate-400 text-sm">Comissão Projetada</p>
                        <p className="text-2xl font-bold text-green-400">R$ 24.500,00</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Crescimento</p>
                        <p className="text-2xl font-bold text-orange-400">+12%</p>
                    </div>
                </div>
            </div>
            {/* Elemento decorativo */}
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                <FileText size={200} />
            </div>
        </div>

        {/* Gráfico Distribuição */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <h4 className="text-slate-800 font-bold mb-6 w-full text-left">Carteira por Produto</h4>
            <div className="w-48 h-48 relative">
                {chartData && <Doughnut data={chartData} options={{cutout: '70%', plugins: {legend: {display: false}}}} />}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-700">{stats.activePolicies}</span>
                </div>
            </div>
            <div className="flex gap-4 mt-6 text-sm text-slate-500">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div>Auto</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Vida</div>
            </div>
        </div>
      </div>
    </div>
  );
};

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const initialForm = { 
    nome: '', whatsapp: '', email: '', tipo: 'PF', cidade: '',
    renavam: '', modelo_veiculo: '', ano_veiculo: '', condutor_principal: '',
    km: '', guincho: '', carro_reserva: '', danos_terceiros: ''
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => { loadClients(); }, []);
  const loadClients = async () => { 
      try { const res = await api.get('/clients'); setClients(res.data); } catch(e){} 
  };
  
  const handleSave = async (e) => {
    e.preventDefault();
    await api.post('/clients', form);
    setModalOpen(false); setForm(initialForm); loadClients();
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Carteira de Clientes</h2>
            <p className="text-slate-500">Gerencie segurados e dados veiculares.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all active:scale-95">
          <Plus size={20}/> Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
            <tr>
              <th className="p-5 tracking-wider">Segurado</th>
              <th className="p-5 tracking-wider">Contato</th>
              <th className="p-5 tracking-wider">Veículo</th>
              <th className="p-5 tracking-wider">Coberturas</th>
              <th className="p-5 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                <td className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                            {c.nome.charAt(0)}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">{c.nome}</div>
                            <div className="text-xs text-slate-400">{c.tipo}</div>
                        </div>
                    </div>
                </td>
                <td className="p-5">
                    <div className="text-sm font-medium text-slate-700">{c.whatsapp || '-'}</div>
                    <div className="text-xs text-slate-400">{c.email}</div>
                </td>
                <td className="p-5">
                    {c.modelo_veiculo ? (
                         <div className="flex flex-col gap-1">
                             <span className="flex items-center gap-1 text-sm font-bold text-slate-700">
                                 <Car size={14} className="text-orange-500"/> {c.modelo_veiculo}
                             </span>
                             <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1 rounded w-fit">
                                 {c.renavam}
                             </span>
                         </div>
                    ) : <span className="text-slate-300">-</span>}
                </td>
                <td className="p-5 text-xs">
                   {c.guincho && <div className="text-slate-600 mb-1">🚗 <b>Guincho:</b> {c.guincho}</div>}
                   {c.danos_terceiros && <div className="text-slate-600">🛡️ <b>RCF:</b> R$ {c.danos_terceiros}</div>}
                </td>
                <td className="p-5 text-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 fade-in">
            <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                    <h3 className="font-bold text-xl text-slate-800">Novo Cliente</h3>
                    <button type="button" onClick={()=>setModalOpen(false)} className="text-slate-400 hover:text-red-500">✕</button>
                </div>
                
                <div className="space-y-6">
                    {/* Seção Pessoal */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                            <User size={14}/> Dados Pessoais
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input placeholder="Nome Completo" className="input-field" value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} required/>
                            <input placeholder="Condutor Principal" className="input-field" value={form.condutor_principal} onChange={e=>setForm({...form, condutor_principal:e.target.value})}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="WhatsApp" className="input-field" value={form.whatsapp} onChange={e=>setForm({...form, whatsapp:e.target.value})}/>
                            <input placeholder="Email" type="email" className="input-field" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
                        </div>
                    </div>

                    {/* Seção Veículo */}
                    <div className="space-y-4 pt-4 border-t border-slate-50">
                        <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                            <Car size={14}/> Veículo
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Modelo (Ex: Onix 1.0)" className="input-field" value={form.modelo_veiculo} onChange={e=>setForm({...form, modelo_veiculo:e.target.value})}/>
                            <input placeholder="Renavam" className="input-field font-mono" value={form.renavam} onChange={e=>setForm({...form, renavam:e.target.value})}/>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <input placeholder="Ano" className="input-field" value={form.ano_veiculo} onChange={e=>setForm({...form, ano_veiculo:e.target.value})}/>
                            <input placeholder="KM" className="input-field" value={form.km} onChange={e=>setForm({...form, km:e.target.value})}/>
                            <select className="input-field bg-white" value={form.tipo} onChange={e=>setForm({...form, tipo:e.target.value})}>
                                <option value="PF">Pessoa Física</option>
                                <option value="PJ">Pessoa Jurídica</option>
                            </select>
                        </div>
                    </div>

                    {/* Seção Coberturas */}
                    <div className="space-y-4 pt-4 border-t border-slate-50">
                        <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                            <Shield size={14}/> Coberturas
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Guincho (Km)" className="input-field" value={form.guincho} onChange={e=>setForm({...form, guincho:e.target.value})}/>
                            <input placeholder="Carro Reserva (Dias)" className="input-field" value={form.carro_reserva} onChange={e=>setForm({...form, carro_reserva:e.target.value})}/>
                            <input placeholder="Danos Terceiros (R$)" className="input-field col-span-2" value={form.danos_terceiros} onChange={e=>setForm({...form, danos_terceiros:e.target.value})}/>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                    <button type="button" onClick={()=>setModalOpen(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-50 rounded-xl font-medium transition-colors">Cancelar</button>
                    <button type="submit" className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95">Salvar Cliente</button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
};

// Componentes Policies e Integrations mantidos simplificados mas com estilo
const Policies = () => (
    <div className="p-10 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
        <FileText size={48} className="mx-auto mb-4 opacity-20"/>
        <h3 className="text-lg font-bold text-slate-600">Módulo de Apólices</h3>
        <p>Use o menu lateral para voltar ou implemente o código de apólices aqui.</p>
    </div>
);

const Integrations = () => (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
             <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-2"><Settings className="text-orange-500"/> Configurações do Sistema</h3>
             <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-sm">
                 Use esta área para conectar o Google Drive e o Typebot. As alterações são salvas automaticamente.
             </div>
        </div>
    </div>
);

// --- LAYOUT PRINCIPAL ---
export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-800 selection:bg-orange-100 selection:text-orange-900">
        {/* SIDEBAR MODERNA */}
        <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
          <div className="p-8">
            <h1 className="text-3xl font-bold flex items-center gap-2 tracking-tighter">
              <span className="text-orange-500">CRM</span>Pro<span className="text-slate-600">.</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Gestão Inteligente</p>
          </div>
          
          <nav className="flex-1 space-y-2 mt-4">
            <SidebarItem to="/" icon={LayoutDashboard} label="Visão Geral" />
            <SidebarItem to="/clients" icon={Users} label="Carteira Clientes" />
            <SidebarItem to="/policies" icon={FileText} label="Gestão Apólices" />
            <div className="pt-8 pb-2 px-8">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Sistema</p>
            </div>
            <SidebarItem to="/integrations" icon={Settings} label="Configurações" />
          </nav>

          <div className="p-6 border-t border-slate-800">
             <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg">N</div>
                 <div>
                     <p className="text-sm font-bold text-white">Neto</p>
                     <p className="text-xs text-slate-400">Administrador</p>
                 </div>
             </div>
          </div>
        </aside>

        {/* CONTEÚDO */}
        <main className="flex-1 overflow-auto p-8 md:p-12 relative">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none"></div>
            <div className="relative z-10 max-w-7xl mx-auto">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/policies" element={<Policies />} />
                    <Route path="/integrations" element={<Integrations />} />
                </Routes>
            </div>
        </main>
      </div>
      
      {/* Estilo Global Injetado para Inputs */}
      <style>{`
        .input-field {
            width: 100%;
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
            outline: none;
            transition: all 0.2s;
            font-size: 0.95rem;
            color: #1e293b;
        }
        .input-field:focus {
            border-color: #f97316;
            box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
        }
      `}</style>
    </BrowserRouter>
  );
}