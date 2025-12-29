import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, FileText, Settings, Plus, Search, 
  Bot, AlertTriangle, Calendar, DollarSign, Download, Filter, X, 
  Folder, Mail, HardDrive, Upload, AlertOctagon, Wrench, Activity, 
  Camera, TrendingUp, Lock, LogOut, CheckCircle, Car, Shield
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController);

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://crm-seguros.onrender.com';
const api = axios.create({ baseURL: API_URL });

// --- AUTH CONTEXT ---
const useAuth = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('crm_user')));
    const login = (userData) => { localStorage.setItem('crm_user', JSON.stringify(userData)); setUser(userData); };
    const logout = () => { localStorage.removeItem('crm_user'); setUser(null); };
    return { user, login, logout };
};

// --- COMPONENTES UI ---
const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3.5 mx-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon size={20} className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="font-medium text-sm tracking-wide">{label}</span>
    </Link>
  );
};

const StatCard = ({ title, value, sub, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}><Icon size={24} /></div>
    </div>
    <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
    <p className="text-sm text-slate-500 uppercase font-bold mt-1">{title}</p>
    <p className="text-xs text-slate-400 mt-2">{sub}</p>
  </div>
);

const StatusBadge = ({ status }) => {
    const colors = { 'ATIVA': 'bg-green-100 text-green-700', 'PENDENTE': 'bg-yellow-100 text-yellow-700', 'VENCIDA': 'bg-red-100 text-red-700', 'ABERTO': 'bg-blue-100 text-blue-700', 'CONCLUIDO': 'bg-green-100 text-green-700' };
    return <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
};

// --- TELA DE LOGIN ---
const Login = ({ onLogin }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'PRODUTOR' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); setError('');
        try {
            if (isRegister) {
                await api.post('/users', form);
                alert("Usuário criado! Faça login."); setIsRegister(false);
            } else {
                const res = await api.post('/login', { email: form.email, senha: form.senha });
                onLogin(res.data);
            }
        } catch (err) { setError("Erro de credenciais ou usuário já existente."); }
    };

    return (
        <div className="flex h-screen bg-slate-900 items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-2">CG SEGUROS <div className="w-3 h-3 rounded-full bg-orange-500"></div></h1>
                    <p className="text-slate-500 mt-2">{isRegister ? "Criar nova conta" : "Acesso ao Sistema"}</p>
                </div>
                {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center text-sm font-bold">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && <div><label className="label-text">Nome</label><input className="input-field" value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} required/></div>}
                    <div><label className="label-text">Email</label><input className="input-field" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required/></div>
                    <div><label className="label-text">Senha</label><input className="input-field" type="password" value={form.senha} onChange={e=>setForm({...form, senha:e.target.value})} required/></div>
                    <button type="submit" className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition">{isRegister ? "Cadastrar" : "Entrar"}</button>
                </form>
                <button onClick={() => setIsRegister(!isRegister)} className="w-full mt-4 text-sm text-blue-600 font-bold hover:underline">{isRegister ? "Já tem conta? Faça Login" : "Primeiro acesso? Cadastre-se"}</button>
            </div>
        </div>
    );
};

// --- PÁGINAS DO SISTEMA ---

const Dashboard = () => {
  const [stats, setStats] = useState({ totalClients: 0, activePolicies: 0, newLeads: 0, expiring: 0 });
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => { try { const [s, c] = await Promise.all([api.get('/dashboard-stats'), api.get('/dashboard-charts')]); setStats(s.data); setChartData({ labels: c.data.labels, datasets: [{ data: c.data.distribuicao, backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#64748b'], borderWidth: 0 }] }); } catch (e) {} };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Painel de Controle</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Clientes" value={stats.totalClients} sub="Total" icon={Users} trend="up" />
        <StatCard title="Apólices" value={stats.activePolicies} sub="Ativas" icon={FileText} trend="up" />
        <StatCard title="Leads" value={stats.newLeads} sub="Novos" icon={Bot} trend="up" />
        <StatCard title="Renovações" value={stats.expiring} sub="30 dias" icon={AlertTriangle} trend="down" />
      </div>
      <div className="bg-white p-6 rounded-2xl border shadow-sm w-full md:w-1/2">
          <h3 className="font-bold text-slate-700 mb-4">Mix de Carteira</h3>
          <div className="h-64 flex justify-center">{chartData && <Doughnut data={chartData} options={{ maintainAspectRatio:false }} />}</div>
      </div>
    </div>
  );
};

const UsersManager = () => {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'PRODUTOR', comissao: 10 });
    const [modalOpen, setModalOpen] = useState(false);
    useEffect(() => { api.get('/users').then(r=>setUsers(r.data)); }, []);
    const handleSave = async (e) => { e.preventDefault(); await api.post('/users', form); setModalOpen(false); api.get('/users').then(r=>setUsers(r.data)); };
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Gestão de Usuários</h2><button onClick={()=>setModalOpen(true)} className="btn-primary"><Plus size={20}/> Novo</button></div>
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-xs font-bold text-slate-500"><tr><th className="p-5">Nome</th><th className="p-5">Perfil</th><th className="p-5">Comissão</th></tr></thead><tbody>{users.map(u=>(<tr key={u.id} className="hover:bg-slate-50"><td className="p-5 font-bold">{u.nome}<br/><span className="text-xs font-normal text-slate-400">{u.email}</span></td><td className="p-5">{u.perfil}</td><td className="p-5">{u.comissao}%</td></tr>))}</tbody></table></div>
            {modalOpen && <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"><form onSubmit={handleSave} className="bg-white p-8 rounded-xl space-y-4 w-96"><h3 className="font-bold">Novo Usuário</h3><input className="input-field" placeholder="Nome" onChange={e=>setForm({...form, nome:e.target.value})}/><input className="input-field" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})}/><input className="input-field" placeholder="Senha" type="password" onChange={e=>setForm({...form, senha:e.target.value})}/><select className="input-field bg-white" onChange={e=>setForm({...form, perfil:e.target.value})}><option value="PRODUTOR">Produtor</option><option value="ADMIN">Admin</option></select><input className="input-field" placeholder="Comissão %" type="number" onChange={e=>setForm({...form, comissao:e.target.value})}/><button className="btn-primary w-full">Salvar</button><button type="button" onClick={()=>setModalOpen(false)} className="w-full text-center text-slate-500 mt-2">Cancelar</button></form></div>}
        </div>
    );
};

const ProducerExtract = ({ user }) => {
    const [filter, setFilter] = useState({ mes: new Date().getMonth()+1, ano: new Date().getFullYear(), userId: user.perfil === 'ADMIN' ? '' : user.id });
    const [data, setData] = useState({ resumo: { vendas:0, premio:0, comissao:0 }, lista: [] });
    const [usersList, setUsersList] = useState([]);
    useEffect(() => { loadData(); if(user.perfil === 'ADMIN') api.get('/users').then(r => setUsersList(r.data)); }, [filter]);
    const loadData = async () => { try { const res = await api.get('/producer-stats', { params: filter }); setData(res.data); } catch(e){} };
    return (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800">Extrato de Produção</h2>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
                <select className="input-field w-32 bg-white" value={filter.mes} onChange={e=>setFilter({...filter, mes:e.target.value})}>{[1,2,3,4,5,6,7,8,9,10,11,12].map(m=><option key={m} value={m}>Mês {m}</option>)}</select>
                <select className="input-field w-32 bg-white" value={filter.ano} onChange={e=>setFilter({...filter, ano:e.target.value})}><option value="2024">2024</option><option value="2025">2025</option></select>
                {user.perfil === 'ADMIN' && (<select className="input-field w-48 bg-white" value={filter.userId} onChange={e=>setFilter({...filter, userId:e.target.value})}><option value="">Todos</option>{usersList.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}</select>)}
                <button onClick={loadData} className="btn-primary">Filtrar</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm"><p className="text-sm text-slate-400 uppercase font-bold">Vendas</p><h3 className="text-3xl font-bold text-slate-800">{data.resumo.vendas}</h3></div>
                <div className="bg-white p-6 rounded-2xl border shadow-sm"><p className="text-sm text-slate-400 uppercase font-bold">Prêmio Total</p><h3 className="text-3xl font-bold text-slate-800">R$ {data.resumo.premio.toFixed(2)}</h3></div>
                <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl"><p className="text-sm text-orange-400 uppercase font-bold">Comissão Estimada</p><h3 className="text-3xl font-bold">R$ {data.resumo.comissao.toFixed(2)}</h3></div>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500"><tr><th className="p-5">Apólice</th><th className="p-5">Cliente</th><th className="p-5">Produtor</th><th className="p-5">Comissão</th></tr></thead><tbody>{data.lista.map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="p-5 font-bold text-slate-700">{p.numero}<br/><span className="text-xs font-normal text-slate-400">{p.tipo_seguro}</span></td><td className="p-5">{p.client?.nome}</td><td className="p-5 text-sm">{p.user?.nome || '-'}</td><td className="p-5 font-bold text-green-600">R$ {p.comissao_produtor.toFixed(2)}</td></tr>))}</tbody></table></div>
        </div>
    );
};

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filesModalOpen, setFilesModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDocs, setClientDocs] = useState([]);
  const [form, setForm] = useState({ nome: '', whatsapp: '', email: '', tipo: 'PF', renavam: '', modelo_veiculo: '', ano_veiculo: '', condutor_principal: '', km: '', guincho: '', carro_reserva: '', danos_terceiros: '' });
  const [docForm, setDocForm] = useState({ nome: '', categoria: 'Documentos Pessoais' });
  const [docFile, setDocFile] = useState(null);

  useEffect(() => { loadClients(); }, []);
  const loadClients = async () => { try { const res = await api.get('/clients'); setClients(res.data); } catch(e){} };
  
  const openFiles = async (client) => { setSelectedClient(client); setFilesModalOpen(true); try { const res = await api.get(`/clients/${client.id}/documents`); setClientDocs(res.data); } catch(e){} };
  const handleSaveClient = async (e) => { e.preventDefault(); await api.post('/clients', form); setModalOpen(false); loadClients(); };
  const handleUploadDoc = async (e) => { e.preventDefault(); if(!docFile) return alert("Selecione um arquivo"); const data = new FormData(); data.append('nome', docForm.nome); data.append('categoria', docForm.categoria); data.append('clientId', selectedClient.id); data.append('file', docFile); await api.post('/documents', data); alert("Salvo!"); setDocFile(null); openFiles(selectedClient); };
  const handleSendEmail = async (docId) => { if(confirm("Enviar por e-mail?")) { try { await api.post(`/documents/${docId}/send-email`); alert("Enviado!"); } catch(e) { alert("Erro ao enviar"); } } };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Clientes</h2><button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={20}/> Novo</button></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500"><tr><th className="p-5">Nome</th><th className="p-5">Veículo</th><th className="p-5 text-center">Ações</th></tr></thead><tbody>{clients.map(c => (<tr key={c.id} className="hover:bg-slate-50"><td className="p-5 font-bold">{c.nome}</td><td className="p-5">{c.modelo_veiculo}</td><td className="p-5 text-center"><button onClick={() => openFiles(c)} className="text-blue-600 font-bold flex items-center justify-center gap-2 mx-auto"><Folder size={16}/> Docs</button></td></tr>))}</tbody></table></div>
      
      {modalOpen && (<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"><form onSubmit={handleSaveClient} className="bg-white p-8 rounded-2xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"><h3 className="font-bold">Novo Cliente</h3><input placeholder="Nome" className="input-field" onChange={e=>setForm({...form, nome:e.target.value})}/><input placeholder="Email" className="input-field" onChange={e=>setForm({...form, email:e.target.value})}/><div className="grid grid-cols-2 gap-2"><input placeholder="Modelo Veículo" className="input-field" onChange={e=>setForm({...form, modelo_veiculo:e.target.value})}/><input placeholder="Placa/Renavam" className="input-field" onChange={e=>setForm({...form, renavam:e.target.value})}/></div><button className="btn-primary w-full">Salvar</button><button type="button" onClick={()=>setModalOpen(false)} className="w-full text-center text-slate-500 mt-2">Cancelar</button></form></div>)}

      {filesModalOpen && selectedClient && (<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"><div className="bg-white p-8 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col"><div className="flex justify-between mb-4"><h3 className="font-bold text-xl">Arquivos de {selectedClient.nome}</h3><button onClick={()=>setFilesModalOpen(false)}><X/></button></div><div className="flex gap-6 h-full overflow-hidden"><div className="w-1/3 border-r pr-4"><h4 className="font-bold text-sm mb-4">Novo Upload</h4><form onSubmit={handleUploadDoc} className="space-y-4"><input placeholder="Nome do Arquivo" className="input-field" onChange={e=>setDocForm({...docForm, nome:e.target.value})}/><select className="input-field bg-white" onChange={e=>setDocForm({...docForm, categoria:e.target.value})}><option>Documentos Pessoais</option><option>Apólices</option><option>Outros</option></select><input type="file" className="input-field" onChange={e=>setDocFile(e.target.files[0])}/><button className="btn-primary w-full">Enviar</button></form></div><div className="w-2/3 overflow-y-auto"><h4 className="font-bold text-sm mb-4">Lista de Arquivos</h4><div className="space-y-2">{clientDocs.map(doc=>(<div key={doc.id} className="flex justify-between items-center p-3 bg-slate-50 rounded border"><div className="flex items-center gap-2"><FileText size={16}/><span>{doc.nome}</span></div><div className="flex gap-2"><a href={doc.url} target="_blank" className="text-blue-600"><Download size={16}/></a><button onClick={()=>handleSendEmail(doc.id)} className="text-green-600"><Mail size={16}/></button></div></div>))}</div></div></div></div></div>)}
    </div>
  );
};

const Policies = ({ user }) => {
    const [policies, setPolicies] = useState([]);
    const [clients, setClients] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({ numero: '', clientId: '', tipo_seguro: 'Auto', status: 'ATIVA', data_inicio: '', data_fim: '', premio: '', comissao: '' });
    const [file, setFile] = useState(null);
    useEffect(() => { api.get('/policies').then(r=>setPolicies(r.data)); api.get('/clients').then(r=>setClients(r.data)); }, []);
    const handleSave = async (e) => { e.preventDefault(); const data = new FormData(); Object.keys(form).forEach(k => data.append(k, form[k])); data.append('userId', user.id); if (file) data.append('file', file); await api.post('/policies', data); setModalOpen(false); api.get('/policies').then(r=>setPolicies(r.data)); };
    const filteredPolicies = policies.filter(p => p.numero?.includes(searchTerm) || p.client?.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    return (
      <div className="space-y-6 animate-fade-in"><div className="flex justify-between"><h2 className="text-2xl font-bold text-slate-800">Apólices</h2><button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={20}/> Nova</button></div><div className="bg-white p-4 rounded-xl border"><Search className="text-slate-400 mb-1 inline mr-2"/><input placeholder="Buscar..." className="outline-none" onChange={e=>setSearchTerm(e.target.value)}/></div><div className="bg-white rounded-2xl border shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500"><tr><th className="p-5">Apólice</th><th className="p-5">Cliente</th><th className="p-5">Produtor</th><th className="p-5">Status</th><th className="p-5">PDF</th></tr></thead><tbody>{filteredPolicies.map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="p-5 font-bold">{p.numero}</td><td className="p-5">{p.client?.nome}</td><td className="p-5 text-sm">{p.user?.nome}</td><td className="p-5"><StatusBadge status={p.status}/></td><td className="p-5">{p.pdf_url && <a href={p.pdf_url} target="_blank" className="text-blue-600"><Download size={16}/></a>}</td></tr>))}</tbody></table></div>
      {modalOpen && <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"><form onSubmit={handleSave} className="bg-white p-8 rounded-2xl w-full max-w-lg space-y-4"><h3 className="font-bold">Nova Apólice</h3><input className="input-field" placeholder="Número" onChange={e=>setForm({...form, numero:e.target.value})}/><select className="input-field bg-white" onChange={e=>setForm({...form, clientId:e.target.value})}><option>Cliente...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select><div className="grid grid-cols-2 gap-2"><input type="date" className="input-field" onChange={e=>setForm({...form, data_inicio:e.target.value})}/><input type="date" className="input-field" onChange={e=>setForm({...form, data_fim:e.target.value})}/></div><div className="grid grid-cols-2 gap-2"><input className="input-field" type="number" placeholder="Prêmio (R$)" onChange={e=>setForm({...form, premio:e.target.value})}/><input className="input-field" type="number" placeholder="Comissão (R$)" onChange={e=>setForm({...form, comissao:e.target.value})}/></div><input type="file" className="input-field" onChange={e=>setFile(e.target.files[0])}/><button className="btn-primary w-full">Salvar</button><button type="button" onClick={()=>setModalOpen(false)} className="w-full text-center text-slate-500 mt-2">Cancelar</button></form></div>}</div>
    );
};

const Claims = () => {
    const [claims, setClaims] = useState([]);
    const [clients, setClients] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({});
    useEffect(() => { api.get('/claims').then(r=>setClaims(r.data)); api.get('/clients').then(r=>setClients(r.data)); }, []);
    const handleSave = async (e) => { e.preventDefault(); await api.post('/claims', form); setModalOpen(false); api.get('/claims').then(r=>setClaims(r.data)); };
    return (
        <div className="space-y-6 animate-fade-in"><div className="flex justify-between"><h2 className="text-2xl font-bold">Sinistros</h2><button onClick={()=>setModalOpen(true)} className="bg-red-500 text-white px-4 py-2 rounded-xl flex gap-2 font-bold"><AlertOctagon/> Abrir Sinistro</button></div>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-xs font-bold text-slate-500"><tr><th className="p-5">Tipo</th><th className="p-5">Cliente</th><th className="p-5">Oficina</th><th className="p-5">Status</th></tr></thead><tbody>{claims.map(c=>(<tr key={c.id} className="hover:bg-slate-50"><td className="p-5 font-bold flex items-center gap-2"><Car size={16}/> {c.tipo_sinistro}</td><td className="p-5">{c.client?.nome}</td><td className="p-5">{c.oficina_nome||'-'}</td><td className="p-5"><StatusBadge status={c.status}/></td></tr>))}</tbody></table></div>
        {modalOpen && <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"><form onSubmit={handleSave} className="bg-white p-8 rounded-2xl w-full max-w-lg space-y-4"><h3 className="font-bold">Abertura de Sinistro</h3><select className="input-field bg-white" onChange={e=>setForm({...form, clientId:e.target.value})}><option>Cliente...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select><input type="date" className="input-field" onChange={e=>setForm({...form, data_ocorrencia:e.target.value})}/><select className="input-field bg-white" onChange={e=>setForm({...form, tipo_sinistro:e.target.value})}><option>Colisão</option><option>Roubo</option><option>Terceiros</option></select><input className="input-field" placeholder="Oficina" onChange={e=>setForm({...form, oficina_nome:e.target.value})}/><button className="bg-red-500 text-white w-full py-2 rounded font-bold">Confirmar</button><button type="button" onClick={()=>setModalOpen(false)} className="w-full text-center text-slate-500 mt-2">Cancelar</button></form></div>}</div>
    );
};

const Integrations = () => {
    const [config, setConfig] = useState({});
    useEffect(() => { api.get('/config').then(r => setConfig(r.data)); }, []);
    const save = async () => { await api.post('/config', config); alert("Salvo!"); };
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in"><h2 className="text-2xl font-bold">Integrações</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="font-bold flex gap-2 mb-4"><HardDrive className="text-orange-500"/> Armazenamento</h3><div className="flex gap-4 mb-4"><button onClick={()=>setConfig({...config, storageType:'LOCAL'})} className={`flex-1 py-2 border rounded font-bold ${config.storageType==='LOCAL'?'bg-slate-800 text-white':''}`}>Local</button><button onClick={()=>setConfig({...config, storageType:'DRIVE'})} className={`flex-1 py-2 border rounded font-bold ${config.storageType==='DRIVE'?'bg-blue-600 text-white':''}`}>Drive</button></div>{config.storageType==='DRIVE' && <textarea placeholder="JSON Credenciais" className="input-field h-24 text-xs font-mono" value={JSON.stringify(config.googleDriveJson||{})} onChange={e=>setConfig({...config, googleDriveJson:e.target.value})}/>}</div><div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="font-bold flex gap-2 mb-4"><Mail className="text-orange-500"/> SMTP E-mail</h3><input placeholder="Host" className="input-field mb-2" value={config.smtpHost||''} onChange={e=>setConfig({...config, smtpHost:e.target.value})}/><input placeholder="User" className="input-field mb-2" value={config.smtpUser||''} onChange={e=>setConfig({...config, smtpUser:e.target.value})}/><input placeholder="Pass" type="password" className="input-field" value={config.smtpPass||''} onChange={e=>setConfig({...config, smtpPass:e.target.value})}/></div></div><button onClick={save} className="btn-primary w-full">Salvar Configurações</button></div>
    );
};

// --- LAYOUT ---
const Layout = ({ user, logout }) => {
    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
                <div className="p-8 pb-4"><h1 className="text-2xl font-extrabold flex items-center gap-2">CG SEGUROS<div className="w-2 h-2 rounded-full bg-orange-500"></div></h1><p className="text-xs text-slate-500 mt-2 font-medium">Olá, {user.nome}</p></div>
                <nav className="flex-1 space-y-2 mt-6">
                    <SidebarItem to="/" icon={LayoutDashboard} label="Visão Geral" />
                    <SidebarItem to="/extract" icon={TrendingUp} label="Extrato Produtor" />
                    <SidebarItem to="/clients" icon={Users} label="Carteira Clientes" />
                    <SidebarItem to="/policies" icon={FileText} label="Apólices" />
                    <SidebarItem to="/claims" icon={AlertOctagon} label="Sinistros" />
                    {user.perfil === 'ADMIN' && (<><div className="pt-4 pb-2 px-8"><p className="text-[10px] font-bold text-slate-600 uppercase">Admin</p></div><SidebarItem to="/users" icon={Lock} label="Gestão Usuários" /><SidebarItem to="/integrations" icon={Settings} label="Configurações" /></>)}
                </nav>
                <div className="p-6 border-t border-slate-800"><button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-white transition"><LogOut size={16}/> Sair</button></div>
            </aside>
            <main className="flex-1 overflow-auto p-8 relative"><Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/extract" element={<ProducerExtract user={user}/>} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/policies" element={<Policies user={user} />} />
                <Route path="/claims" element={<Claims />} />
                <Route path="/users" element={user.perfil === 'ADMIN' ? <UsersManager /> : <Navigate to="/" />} />
                <Route path="/integrations" element={user.perfil === 'ADMIN' ? <Integrations /> : <Navigate to="/" />} />
            </Routes></main>
        </div>
    );
};

export default function App() {
  const { user, login, logout } = useAuth();
  if (!user) return <Login onLogin={login} />;
  return (
    <BrowserRouter>
      <Layout user={user} logout={logout} />
      <style>{` .input-field { width: 100%; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; outline: none; background: #fff; } .btn-primary { background-color: #f97316; color: white; padding: 0.5rem 1rem; border-radius: 0.75rem; font-weight: bold; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; } .btn-primary:hover { background-color: #ea580c; } .label-text { font-size: 0.85rem; font-weight: 700; color: #64748b; margin-bottom: 0.25rem; display: block; } .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } `}</style>
    </BrowserRouter>
  );
}