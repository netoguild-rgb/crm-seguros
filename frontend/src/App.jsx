import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, FileText, Settings, Plus, Search, 
  Bot, AlertTriangle, Download, X, Folder, Mail, HardDrive, Upload, 
  AlertOctagon, Wrench, Activity, Camera, TrendingUp, Lock, LogOut, Car, CheckCircle,
  Calendar as CalendarIcon, Clock, DollarSign, ChevronDown, UserPlus, Filter
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, BarController);

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://crm-seguros.onrender.com';
const api = axios.create({ baseURL: API_URL });

const useAuth = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('crm_user')));
    const login = (userData) => { localStorage.setItem('crm_user', JSON.stringify(userData)); setUser(userData); };
    const logout = () => { localStorage.removeItem('crm_user'); setUser(null); };
    return { user, login, logout };
};

const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 mx-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      <Icon size={20} className={isActive ? 'scale-110' : 'group-hover:scale-110'} />
      <span className="font-medium text-sm tracking-wide">{label}</span>
    </Link>
  );
};

const StatusBadge = ({ status }) => {
    const styles = {
        'ATIVA': 'bg-green-100 text-green-700 border-green-200', 'PENDENTE': 'bg-yellow-100 text-yellow-700 border-yellow-200', 
        'VENCIDA': 'bg-red-100 text-red-700 border-red-200', 'PAGO': 'bg-green-100 text-green-700 border-green-200', 
        'ATRASADO': 'bg-red-100 text-red-700 border-red-200', 'NOVO': 'bg-blue-100 text-blue-700 border-blue-200',
        'CONTATADO': 'bg-purple-100 text-purple-700 border-purple-200', 'VENDA': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'PERDIDO': 'bg-gray-100 text-gray-500 border-gray-200'
    };
    return <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${styles[status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>{status}</span>;
};

const Modal = ({ title, children, onClose, maxWidth = "max-w-md" }) => (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className={`modal-content ${maxWidth}`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition text-slate-400 hover:text-red-500"><X size={20}/></button>
                </div>
                {children}
            </div>
        </div>
    </div>
);

// --- COMPONENTES PRINCIPAIS ---

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('DADOS'); // DADOS, PERFIL, ARQUIVOS
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDocs, setClientDocs] = useState([]);
  const [form, setForm] = useState({});
  const [docFile, setDocFile] = useState(null);
  const [docForm, setDocForm] = useState({ nome: '', categoria: 'Geral' });
  const [search, setSearch] = useState('');

  useEffect(() => { loadClients(); }, []);
  const loadClients = async () => { try { const res = await api.get('/clients'); setClients(res.data); } catch(e){} };
  
  const openClient = (client) => { setSelectedClient(client); setForm(client); setActiveTab('DADOS'); setModalOpen(true); loadDocs(client.id); };
  const loadDocs = async (id) => { const r = await api.get(`/clients/${id}/documents`); setClientDocs(r.data); };
  
  const handleSaveClient = async (e) => { e.preventDefault(); if(selectedClient) await api.put(`/clients/${selectedClient.id}`, form); else await api.post('/clients', form); setModalOpen(false); loadClients(); };
  
  const handleUploadDoc = async (e) => { 
      e.preventDefault(); 
      if(!docFile) return alert("Selecione um arquivo"); 
      const data = new FormData(); 
      data.append('file', docFile); data.append('nome', docForm.nome || docFile.name); data.append('categoria', docForm.categoria); data.append('clientId', selectedClient.id); 
      await api.post('/documents', data); 
      alert("Arquivo salvo!"); setDocFile(null); setDocForm({nome:'', categoria:'Geral'}); loadDocs(selectedClient.id); 
  };
  
  const handleSendEmail = async (docId) => { if(confirm("Enviar por e-mail?")) { try { await api.post(`/documents/${docId}/send-email`); alert("Enviado!"); } catch(e) { alert("Erro ao enviar"); } } };

  const filteredClients = clients.filter(c => c.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-orange-500"/> Clientes</h2>
          <div className="flex gap-2">
              <input className="input-field w-64" placeholder="Buscar cliente..." value={search} onChange={e=>setSearch(e.target.value)}/>
              <button onClick={() => {setForm({}); setSelectedClient(null); setActiveTab('DADOS'); setModalOpen(true);}} className="btn-primary"><Plus size={20}/> Novo</button>
          </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b"><tr><th className="p-5">Nome</th><th className="p-5">Veículo</th><th className="p-5 text-center">Ações</th></tr></thead>
              <tbody className="divide-y divide-slate-50">{filteredClients.map(c => (<tr key={c.id} className="hover:bg-slate-50 transition-colors"><td className="p-5 font-bold text-slate-700">{c.nome}<div className="text-xs font-normal text-slate-400">{c.whatsapp}</div></td><td className="p-5 text-sm">{c.modelo_veiculo || '-'}</td><td className="p-5 text-center"><button onClick={() => openClient(c)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg text-xs font-bold transition-colors">Abrir Ficha</button></td></tr>))}</tbody>
          </table>
      </div>
      
      {modalOpen && (
          <Modal title={selectedClient ? `Ficha: ${selectedClient.nome}` : "Novo Cliente"} onClose={()=>setModalOpen(false)} maxWidth="max-w-4xl">
              <div className="flex gap-4 border-b mb-6 overflow-x-auto">
                  {['DADOS', 'PERFIL', 'ARQUIVOS'].map(tab => (
                      <button key={tab} onClick={()=>setActiveTab(tab)} className={`pb-2 text-sm font-bold transition-colors ${activeTab===tab?'text-orange-500 border-b-2 border-orange-500':'text-slate-400 hover:text-slate-600'}`}>{tab === 'ARQUIVOS' ? 'ARQUIVO DIGITAL (GED)' : tab}</button>
                  ))}
              </div>

              {/* ABA DADOS */}
              {activeTab === 'DADOS' && (
                  <form onSubmit={handleSaveClient} className="space-y-4">
                      <input className="input-field" placeholder="Nome Completo" value={form.nome||''} onChange={e=>setForm({...form, nome:e.target.value})} required/>
                      <div className="grid grid-cols-2 gap-3"><input className="input-field" placeholder="Email" value={form.email||''} onChange={e=>setForm({...form, email:e.target.value})}/><input className="input-field" placeholder="WhatsApp" value={form.whatsapp||''} onChange={e=>setForm({...form, whatsapp:e.target.value})}/></div>
                      <h4 className="text-xs font-bold text-slate-400 mt-4 uppercase">Dados do Veículo (Opcional)</h4>
                      <div className="grid grid-cols-3 gap-3"><input className="input-field" placeholder="Modelo" value={form.modelo_veiculo||''} onChange={e=>setForm({...form, modelo_veiculo:e.target.value})}/><input className="input-field" placeholder="Placa" value={form.placa||''} onChange={e=>setForm({...form, placa:e.target.value})}/><input className="input-field" placeholder="Renavam" value={form.renavam||''} onChange={e=>setForm({...form, renavam:e.target.value})}/></div>
                      <button className="btn-primary w-full mt-4">Salvar Alterações</button>
                  </form>
              )}

              {/* ABA PERFIL */}
              {activeTab === 'PERFIL' && (
                  <form onSubmit={handleSaveClient} className="space-y-4">
                      <div className="space-y-2"><label className="text-xs font-bold text-slate-500">PREFERÊNCIAS & OBSERVAÇÕES</label><textarea className="input-field h-24" placeholder="Ex: Prefere contato por Zap, Aniversário..." value={form.obs_final||''} onChange={e=>setForm({...form, obs_final:e.target.value})}/></div>
                      <div className="space-y-2"><label className="text-xs font-bold text-slate-500">QUESTIONÁRIO DE RISCO (JSON/TEXTO)</label><textarea className="input-field h-32 font-mono text-xs" placeholder='{"garagem": "Sim", "condutor_jovem": "Não"}' value={typeof form.questionnaires === 'object' ? JSON.stringify(form.questionnaires,null,2) : form.questionnaires} onChange={e=>setForm({...form, questionnaires:e.target.value})}/></div>
                      <button className="btn-primary w-full mt-4">Salvar Perfil</button>
                  </form>
              )}

              {/* ABA ARQUIVOS (INTEGRADA) */}
              {activeTab === 'ARQUIVOS' && selectedClient && (
                  <div className="flex flex-col md:flex-row gap-6 h-96">
                      <div className="md:w-1/3 md:border-r md:pr-4 space-y-4">
                          <h4 className="font-bold text-xs uppercase text-slate-400">Novo Documento</h4>
                          <form onSubmit={handleUploadDoc} className="space-y-3">
                              <input className="input-field" placeholder="Nome do Arquivo" value={docForm.nome} onChange={e=>setDocForm({...docForm, nome:e.target.value})}/>
                              <select className="input-field bg-white" value={docForm.categoria} onChange={e=>setDocForm({...docForm, categoria:e.target.value})}><option>Geral</option><option>Apólice</option><option>CNH/RG</option><option>Vistoria</option><option>Sinistro</option></select>
                              <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl text-center hover:bg-slate-50 cursor-pointer relative"><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e=>setDocFile(e.target.files[0])}/><Upload className="mx-auto text-slate-300 mb-2"/><p className="text-xs text-slate-500 font-bold">{docFile ? docFile.name : "Selecionar Arquivo"}</p></div>
                              <button className="btn-primary w-full text-sm">Enviar para Nuvem/Local</button>
                          </form>
                      </div>
                      <div className="md:w-2/3 overflow-y-auto space-y-3 pr-2">
                          <h4 className="font-bold text-xs uppercase text-slate-400">Arquivos Armazenados</h4>
                          {clientDocs.map(doc=>(
                              <div key={doc.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-sm transition">
                                  <div className="flex items-center gap-3"><div className="bg-white p-2 rounded-lg border"><FileText size={16} className="text-orange-500"/></div><div><p className="font-bold text-sm text-slate-700">{doc.nome}</p><p className="text-[10px] text-slate-400 uppercase">{doc.categoria} • {new Date(doc.criadoEm).toLocaleDateString()}</p></div></div>
                                  <div className="flex gap-2"><a href={doc.url} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Baixar"><Download size={16}/></a><button onClick={()=>handleSendEmail(doc.id)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Enviar Email"><Mail size={16}/></button></div>
                              </div>
                          ))}
                          {clientDocs.length===0 && <div className="text-center text-slate-400 py-10">Nenhum documento encontrado.</div>}
                      </div>
                  </div>
              )}
          </Modal>
      )}
    </div>
  );
};

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [clientForm, setClientForm] = useState({});
    const [search, setSearch] = useState('');

    useEffect(() => { loadLeads(); }, []);
    const loadLeads = async () => { try { const r = await api.get('/leads'); setLeads(r.data); } catch(e){} };
    const updateStatus = async (id, status) => { await api.put(`/leads/${id}`, { status }); loadLeads(); };
    
    const handleConvert = (lead) => {
        setClientForm({
            nome: lead.nome, whatsapp: lead.whatsapp, email: '', tipo: 'PF', obs_final: lead.obs_final,
            modelo_veiculo: lead.modelo_veiculo, renavam: lead.renavan, placa: lead.placa, 
            ano_veiculo: lead.ano_do_veiculo, uso_veiculo: lead.uso_veiculo, 
            condutor_principal: lead.condutor_principal, idade_condutor: lead.idade_do_condutor,
            km: lead.km_guincho, guincho: lead.km_guincho, 
            carro_reserva: lead.carro_reserva, danos_terceiros: lead.cobertura_terceiros, cobertura_roubo: lead.cobertura_roubo,
            capital_vida: lead.capital_vida, profissao: lead.profissao, motivo_vida: lead.motivo_vida,
            preferencia_rede: lead.preferencia_rede, idades_saude: lead.idades_saude, plano_saude: lead.plano_saude
        });
        setIsConvertModalOpen(true);
    };

    const confirmConversion = async (e) => {
        e.preventDefault(); await api.post('/clients', clientForm); await api.put(`/leads/${selectedLead.id}`, { status: 'VENDA' });
        alert("Lead promovido a Cliente!"); setIsConvertModalOpen(false); setSelectedLead(null); loadLeads();
    };

    const filteredLeads = leads.filter(l => l.nome.toLowerCase().includes(search.toLowerCase()) || l.whatsapp.includes(search));

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Bot className="text-orange-500"/> Leads</h2>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                    <input className="pl-10 input-field" placeholder="Buscar lead..." value={search} onChange={e=>setSearch(e.target.value)}/>
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b"><tr><th className="p-5">Nome / Tipo</th><th className="p-5">Contato</th><th className="p-5">Status</th><th className="p-5 text-center">Ações</th></tr></thead>
                    <tbody className="divide-y divide-slate-50">{filteredLeads.map(lead => (<tr key={lead.id} className="hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => setSelectedLead(lead)}><td className="p-5 font-bold text-slate-700">{lead.nome}<div className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded w-fit mt-1 border border-slate-200">{lead.tipo_seguro || 'Geral'}</div></td><td className="p-5 text-sm">{lead.whatsapp}</td><td className="p-5"><StatusBadge status={lead.status}/></td><td className="p-5 text-center"><button className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">Detalhes</button></td></tr>))}</tbody>
                </table>
            </div>
            {selectedLead && !isConvertModalOpen && (
                <Modal title={`Detalhes: ${selectedLead.nome}`} onClose={()=>setSelectedLead(null)} maxWidth="max-w-2xl">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                        <div className="col-span-2 bg-orange-50 border border-orange-100 p-4 rounded-xl text-orange-900"><strong>Observações:</strong> {selectedLead.obs_final || 'Nenhuma.'}</div>
                        <div><span className="text-slate-400 text-xs font-bold uppercase">WhatsApp</span><p className="font-medium">{selectedLead.whatsapp}</p></div>
                        <div><span className="text-slate-400 text-xs font-bold uppercase">Tipo</span><p className="font-medium">{selectedLead.tipo_seguro}</p></div>
                        {selectedLead.modelo_veiculo && <div className="col-span-2 pt-2 border-t"><span className="text-slate-400 text-xs font-bold uppercase">Veículo de Interesse</span><p className="font-medium">{selectedLead.modelo_veiculo} - {selectedLead.placa}</p></div>}
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button onClick={()=>handleConvert(selectedLead)} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold hover:bg-green-700 flex justify-center gap-2 shadow-lg shadow-green-600/20"><UserPlus size={18}/> Promover a Cliente</button>
                        <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold text-slate-600 outline-none" value={selectedLead.status} onClick={(e)=>e.stopPropagation()} onChange={(e)=>updateStatus(selectedLead.id, e.target.value)}><option value="NOVO">Novo</option><option value="CONTATADO">Contatado</option><option value="PERDIDO">Perdido</option></select>
                    </div>
                </Modal>
            )}
            {isConvertModalOpen && (
                <Modal title="Novo Cliente (Conversão)" onClose={()=>setIsConvertModalOpen(false)} maxWidth="max-w-2xl">
                    <form onSubmit={confirmConversion} className="space-y-4">
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 border border-blue-100">Revise os dados importados antes de salvar.</div>
                        <input className="input-field" placeholder="Nome" value={clientForm.nome} onChange={e=>setClientForm({...clientForm, nome:e.target.value})} required/>
                        <div className="grid grid-cols-2 gap-3"><input className="input-field" placeholder="Email" value={clientForm.email} onChange={e=>setClientForm({...clientForm, email:e.target.value})}/><input className="input-field" placeholder="WhatsApp" value={clientForm.whatsapp} onChange={e=>setClientForm({...clientForm, whatsapp:e.target.value})}/></div>
                        <button className="btn-primary w-full mt-4">Confirmar e Salvar</button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

const Agenda = () => {
    const [appointments, setAppointments] = useState([]);
    const [clients, setClients] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [filterType, setFilterType] = useState('');
    const [form, setForm] = useState({ title: '', date: '', time: '', type: 'REUNIAO', clientId: '' });

    useEffect(() => { loadData(); }, []);
    const loadData = async () => { const [a, c] = await Promise.all([api.get('/appointments'), api.get('/clients')]); setAppointments(a.data); setClients(c.data); };
    
    const handleSave = async (e) => { e.preventDefault(); const fullDate = `${form.date}T${form.time}:00`; await api.post('/appointments', { ...form, date: fullDate }); setModalOpen(false); loadData(); };
    const handleDelete = async (id) => { if(confirm("Remover?")) { await api.delete(`/appointments/${id}`); loadData(); } };

    const filteredApps = filterType ? appointments.filter(a => a.type === filterType) : appointments;

    return ( 
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><CalendarIcon className="text-orange-500"/> Agenda</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <select className="input-field w-auto" onChange={e=>setFilterType(e.target.value)}>
                        <option value="">Todos Tipos</option>
                        <option value="REUNIAO">Reunião</option>
                        <option value="VISTORIA">Vistoria</option>
                        <option value="LIGACAO">Ligação</option>
                    </select>
                    <button onClick={()=>setModalOpen(true)} className="btn-primary whitespace-nowrap"><Plus size={20}/> Novo</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApps.map(app => (
                    <div key={app.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${app.type==='REUNIAO'?'bg-blue-500':app.type==='VISTORIA'?'bg-orange-500':'bg-purple-500'}`}></div>
                        <div className="flex justify-between items-start pl-3">
                            <div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${app.type==='REUNIAO'?'bg-blue-50 text-blue-600':app.type==='VISTORIA'?'bg-orange-50 text-orange-600':'bg-purple-50 text-purple-600'}`}>{app.type}</span>
                                <h4 className="font-bold text-lg mt-2 text-slate-800">{app.title}</h4>
                            </div>
                            <button onClick={()=>handleDelete(app.id)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={18}/></button>
                        </div>
                        <div className="pl-3 mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-500"><Clock size={14}/> {new Date(app.date).toLocaleDateString()} às {new Date(app.date).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
                            <div className="flex items-center gap-2 text-sm text-slate-500"><Users size={14}/> {app.client?.nome || 'Sem cliente'}</div>
                        </div>
                    </div>
                ))}
                {filteredApps.length === 0 && <div className="col-span-full p-10 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">Nenhum compromisso encontrado.</div>}
            </div>

            {modalOpen && (<Modal title="Novo Compromisso" onClose={()=>setModalOpen(false)}><form onSubmit={handleSave} className="space-y-4"><input className="input-field" placeholder="Título" onChange={e=>setForm({...form, title:e.target.value})} required/><div className="grid grid-cols-2 gap-3"><input className="input-field" type="date" onChange={e=>setForm({...form, date:e.target.value})} required/><input className="input-field" type="time" onChange={e=>setForm({...form, time:e.target.value})} required/></div><select className="input-field bg-white" onChange={e=>setForm({...form, type:e.target.value})}><option value="REUNIAO">Reunião</option><option value="VISTORIA">Vistoria</option><option value="LIGACAO">Ligação</option></select><select className="input-field bg-white" onChange={e=>setForm({...form, clientId:e.target.value})}><option value="">Cliente (Opcional)</option>{clients.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select><button className="btn-primary w-full mt-4">Agendar</button></form></Modal>)}
        </div> 
    );
};

const Finance = () => {
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState({ receita:0, despesa:0, saldo:0 });
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [typeFilter, setTypeFilter] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ description: '', amount: '', type: 'DESPESA', category: 'Geral', dueDate: '', status: 'PENDENTE' });

    useEffect(() => { loadData(); }, []);
    useEffect(() => {
        if(typeFilter) setFilteredRecords(records.filter(r => r.type === typeFilter));
        else setFilteredRecords(records);
    }, [typeFilter, records]);

    const loadData = async () => { const [r, s] = await Promise.all([api.get('/financial'), api.get('/financial-stats')]); setRecords(r.data); setFilteredRecords(r.data); setStats(s.data); };
    const handleSave = async (e) => { e.preventDefault(); await api.post('/financial', form); setModalOpen(false); loadData(); };
    const toggleStatus = async (rec) => { await api.put(`/financial/${rec.id}`, { status: rec.status==='PAGO'?'PENDENTE':'PAGO' }); loadData(); };

    return ( 
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><DollarSign className="text-orange-500"/> Financeiro</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <select className="input-field w-auto" onChange={e=>setTypeFilter(e.target.value)}>
                        <option value="">Todas Movimentações</option>
                        <option value="RECEITA">Receitas</option>
                        <option value="DESPESA">Despesas</option>
                    </select>
                    <button onClick={()=>setModalOpen(true)} className="btn-primary"><Plus size={20}/> Nova</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Entradas</p><h3 className="text-3xl font-bold text-green-600 mt-1">R$ {stats.receita.toFixed(2)}</h3></div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Saídas</p><h3 className="text-3xl font-bold text-red-600 mt-1">R$ {stats.despesa.toFixed(2)}</h3></div>
                <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl"><p className="text-xs text-orange-400 font-bold uppercase tracking-wider">Saldo Atual</p><h3 className="text-3xl font-bold mt-1">R$ {stats.saldo.toFixed(2)}</h3></div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider"><tr><th className="p-5">Descrição</th><th className="p-5">Vencimento</th><th className="p-5">Valor</th><th className="p-5">Status</th><th className="p-5">Ação</th></tr></thead>
                    <tbody className="divide-y divide-slate-50">{filteredRecords.map(r=>(
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-5 font-bold text-slate-800">{r.description}<div className="text-xs font-normal text-slate-400">{r.category}</div></td>
                            <td className="p-5 text-sm text-slate-600">{new Date(r.dueDate).toLocaleDateString()}</td>
                            <td className={`p-5 font-bold ${r.type==='RECEITA'?'text-green-600':'text-red-600'}`}>{r.type==='DESPESA'?'- ':''}R$ {r.amount.toFixed(2)}</td>
                            <td className="p-5"><StatusBadge status={r.status}/></td>
                            <td className="p-5"><button onClick={()=>toggleStatus(r)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg text-xs font-bold transition-colors">{r.status==='PAGO'?'Desmarcar':'Marcar Pago'}</button></td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
            {modalOpen && (<Modal title="Nova Movimentação" onClose={()=>setModalOpen(false)}><form onSubmit={handleSave} className="space-y-4"><div className="grid grid-cols-2 gap-3"><select className="input-field" onChange={e=>setForm({...form, type:e.target.value})}><option value="DESPESA">Despesa (-)</option><option value="RECEITA">Receita (+)</option></select><input className="input-field" type="date" onChange={e=>setForm({...form, dueDate:e.target.value})} required/></div><input className="input-field" placeholder="Descrição" onChange={e=>setForm({...form, description:e.target.value})} required/><div className="grid grid-cols-2 gap-3"><input className="input-field" type="number" placeholder="Valor R$" onChange={e=>setForm({...form, amount:e.target.value})} required/><input className="input-field" placeholder="Categoria" onChange={e=>setForm({...form, category:e.target.value})}/></div><button className="btn-primary w-full mt-4">Salvar</button></form></Modal>)}
        </div> 
    );
};

// --- MÓDULOS ANTIGOS (COM NOVO DESIGN) ---

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
      <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Apólices</h2><button onClick={() => setModalOpen(true)} className="btn-primary"><Plus size={20}/> Nova</button></div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3"><Search className="text-slate-400" size={20}/><input placeholder="Buscar por número ou cliente..." className="bg-transparent outline-none w-full" onChange={e=>setSearchTerm(e.target.value)}/></div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider"><tr><th className="p-5">Apólice</th><th className="p-5">Cliente</th><th className="p-5">Status</th><th className="p-5 text-center">PDF</th></tr></thead><tbody className="divide-y divide-slate-50">{filteredPolicies.map(p => (<tr key={p.id} className="hover:bg-slate-50 transition-colors"><td className="p-5 font-mono font-bold text-slate-700">{p.numero}</td><td className="p-5 text-sm">{p.client?.nome}</td><td className="p-5"><StatusBadge status={p.status}/></td><td className="p-5 text-center">{p.pdf_url ? <a href={p.pdf_url} target="_blank" className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg inline-block transition-colors"><Download size={16}/></a> : '-'}</td></tr>))}</tbody></table></div>
          {modalOpen && (
              <Modal title="Nova Apólice" onClose={()=>setModalOpen(false)} maxWidth="max-w-lg">
                  <form onSubmit={handleSave} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3"><input className="input-field" placeholder="Número" onChange={e=>setForm({...form, numero:e.target.value})}/><select className="input-field bg-white" onChange={e=>setForm({...form, clientId:e.target.value})}><option>Cliente...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
                      <div className="grid grid-cols-2 gap-3"><input className="input-field" type="date" onChange={e=>setForm({...form, data_inicio:e.target.value})}/><input className="input-field" type="date" onChange={e=>setForm({...form, data_fim:e.target.value})}/></div>
                      <div className="grid grid-cols-2 gap-3"><input className="input-field" type="number" placeholder="Prêmio (R$)" onChange={e=>setForm({...form, premio:e.target.value})}/><input className="input-field" type="number" placeholder="Comissão (R$)" onChange={e=>setForm({...form, comissao:e.target.value})}/></div>
                      <input type="file" className="input-field" onChange={e=>setFile(e.target.files[0])}/>
                      <button className="btn-primary w-full mt-4">Salvar</button>
                  </form>
              </Modal>
          )}
      </div>
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
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Sinistros</h2><button onClick={()=>setModalOpen(true)} className="btn-primary bg-red-500 hover:bg-red-600 shadow-red-500/20"><AlertOctagon size={20}/> Abrir Sinistro</button></div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider"><tr><th className="p-5">Tipo</th><th className="p-5">Cliente</th><th className="p-5">Oficina</th><th className="p-5">Status</th></tr></thead><tbody className="divide-y divide-slate-50">{claims.map(c=>(<tr key={c.id} className="hover:bg-slate-50 transition-colors"><td className="p-5 font-bold flex items-center gap-2 text-slate-700"><Car size={16} className="text-slate-400"/> {c.tipo_sinistro}</td><td className="p-5 text-sm">{c.client?.nome}</td><td className="p-5 text-sm">{c.oficina_nome||'-'}</td><td className="p-5"><StatusBadge status={c.status}/></td></tr>))}</tbody></table></div>
            {modalOpen && (
                <Modal title="Abertura de Sinistro" onClose={()=>setModalOpen(false)} maxWidth="max-w-lg">
                    <form onSubmit={handleSave} className="space-y-4">
                        <select className="input-field bg-white" onChange={e=>setForm({...form, clientId:e.target.value})}><option>Cliente...</option>{clients.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select>
                        <div className="grid grid-cols-2 gap-3"><input className="input-field" type="date" onChange={e=>setForm({...form, data_ocorrencia:e.target.value})}/><select className="input-field" onChange={e=>setForm({...form, tipo_sinistro:e.target.value})}><option>Colisão</option><option>Roubo</option><option>Terceiros</option></select></div>
                        <input className="input-field" placeholder="Oficina Indicada" onChange={e=>setForm({...form, oficina_nome:e.target.value})}/>
                        <button className="btn-primary w-full bg-red-500 hover:bg-red-600 mt-4">Confirmar Abertura</button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

const Integrations = () => {
    const [config, setConfig] = useState({ storageType: 'LOCAL', localPath: '' });
    useEffect(() => { api.get('/config').then(r => setConfig(r.data)); }, []);
    const save = async () => { await api.post('/config', config); alert("Salvo!"); };
    return (
        <div className="space-y-6 animate-fade-in"><h2 className="text-2xl font-bold text-slate-800">Configurações</h2><div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-2xl"><h3 className="font-bold flex gap-2 mb-6 text-slate-700"><HardDrive className="text-orange-500"/> Armazenamento de Arquivos</h3><div className="flex gap-4 mb-4"><button onClick={()=>setConfig({...config, storageType:'LOCAL'})} className={`flex-1 py-3 rounded-xl border font-bold text-sm ${config.storageType==='LOCAL'?'bg-slate-800 text-white border-slate-800':'bg-white text-slate-500'}`}>Local (PC)</button><button onClick={()=>setConfig({...config, storageType:'DRIVE'})} className={`flex-1 py-3 rounded-xl border font-bold text-sm ${config.storageType==='DRIVE'?'bg-blue-600 text-white border-blue-600':'bg-white text-slate-500'}`}>Google Drive</button></div>{config.storageType==='LOCAL' && <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200"><label className="text-xs font-bold text-slate-500 uppercase">Caminho da Pasta (No Servidor)</label><input className="input-field" placeholder="Ex: C:\Arquivos\Seguros" value={config.localPath || ''} onChange={e=>setConfig({...config, localPath:e.target.value})}/><p className="text-xs text-slate-400">Cole aqui o caminho completo da pasta.</p></div>}{config.storageType==='DRIVE' && <textarea placeholder="JSON Credenciais Google..." className="input-field h-32 text-xs font-mono" value={JSON.stringify(config.googleDriveJson||{})} onChange={e=>setConfig({...config, googleDriveJson:e.target.value})}/>}<button onClick={save} className="btn-primary w-full mt-6">Salvar</button></div></div>
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
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800">Extrato de Produção</h2>
                <div className="flex gap-2">
                    <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-600" value={filter.mes} onChange={e=>setFilter({...filter, mes:e.target.value})}>{[1,2,3,4,5,6,7,8,9,10,11,12].map(m=><option key={m} value={m}>Mês {m}</option>)}</select>
                    {user.perfil === 'ADMIN' && (<select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-600" value={filter.userId} onChange={e=>setFilter({...filter, userId:e.target.value})}><option value="">Todos</option>{usersList.map(u=><option key={u.id} value={u.id}>{u.nome}</option>)}</select>)}
                    <button onClick={loadData} className="btn-primary py-2 px-4 text-sm">Filtrar</button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Vendas</p><h3 className="text-3xl font-bold text-slate-800">{data.resumo.vendas}</h3></div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Prêmio Total</p><h3 className="text-3xl font-bold text-slate-800">R$ {data.resumo.premio.toFixed(2)}</h3></div>
                <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl"><p className="text-xs text-orange-400 font-bold uppercase tracking-wider">Comissão Estimada</p><h3 className="text-3xl font-bold">R$ {data.resumo.comissao.toFixed(2)}</h3></div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b"><tr><th className="p-5">Apólice</th><th className="p-5">Cliente</th><th className="p-5">Produtor</th><th className="p-5">Comissão</th></tr></thead><tbody className="divide-y divide-slate-50">{data.lista.map(p => (<tr key={p.id} className="hover:bg-slate-50"><td className="p-5 font-bold text-slate-700">{p.numero}<br/><span className="text-xs font-normal text-slate-400">{p.tipo_seguro}</span></td><td className="p-5 text-sm">{p.client?.nome}</td><td className="p-5 text-sm text-slate-500">{p.user?.nome || '-'}</td><td className="p-5 font-bold text-green-600">R$ {p.comissao_produtor.toFixed(2)}</td></tr>))}</tbody></table></div>
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
        <div className="space-y-6 animate-fade-in"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-slate-800">Usuários</h2><button onClick={()=>setModalOpen(true)} className="btn-primary"><Plus size={20}/> Novo</button></div><div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b"><tr><th className="p-5">Nome</th><th className="p-5">Perfil</th><th className="p-5">Comissão</th></tr></thead><tbody className="divide-y divide-slate-50">{users.map(u=>(<tr key={u.id} className="hover:bg-slate-50"><td className="p-5 font-bold text-slate-800">{u.nome}<div className="text-xs font-normal text-slate-400">{u.email}</div></td><td className="p-5"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{u.perfil}</span></td><td className="p-5 font-mono text-sm">{u.comissao}%</td></tr>))}</tbody></table></div>{modalOpen && (<Modal title="Novo Usuário" onClose={()=>setModalOpen(false)}><form onSubmit={handleSave} className="space-y-4"><input className="input-field" placeholder="Nome" onChange={e=>setForm({...form, nome:e.target.value})} required/><input className="input-field" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})} required/><input className="input-field" placeholder="Senha" type="password" onChange={e=>setForm({...form, senha:e.target.value})} required/><div className="grid grid-cols-2 gap-4"><select className="input-field bg-white" onChange={e=>setForm({...form, perfil:e.target.value})}><option value="PRODUTOR">Produtor</option><option value="ADMIN">Admin</option></select><input className="input-field" placeholder="Comissão %" type="number" onChange={e=>setForm({...form, comissao:e.target.value})}/></div><button className="btn-primary w-full mt-4">Salvar</button></form></Modal>)}</div>
    );
};

const Login = ({ onLogin }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'PRODUTOR' });
    const handleSubmit = async (e) => { e.preventDefault(); try { if (isRegister) { await api.post('/users', form); alert("Cadastrado!"); setIsRegister(false); } else { const res = await api.post('/login', { email: form.email, senha: form.senha }); onLogin(res.data); } } catch (err) { alert("Erro login"); } };
    return ( <div className="flex h-screen bg-slate-900 items-center justify-center p-4"><div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl text-center"><div className="mb-8"><h1 className="text-4xl font-extrabold text-slate-800">CRM</h1><span className="text-xs font-bold text-orange-500 tracking-[0.3em] uppercase">CG Seguros</span></div><form onSubmit={handleSubmit} className="space-y-4">{isRegister && <input className="input-field" placeholder="Nome" onChange={e=>setForm({...form, nome:e.target.value})}/>}<input className="input-field" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})}/><input className="input-field" type="password" placeholder="Senha" onChange={e=>setForm({...form, senha:e.target.value})}/><button className="btn-primary w-full">{isRegister ? "Cadastrar" : "Entrar"}</button></form><button onClick={()=>setIsRegister(!isRegister)} className="mt-4 text-sm text-blue-600 hover:underline">{isRegister ? "Já tenho conta" : "Criar conta"}</button></div></div> );
};

const Dashboard = () => { 
    const [s, setS] = useState({}); 
    useEffect(() => { api.get('/dashboard-stats').then(r => setS(r.data)); }, []); 
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4"> 
                {[{t:'Clientes',v:s.totalClients||0,i:Users,c:'text-blue-600'},{t:'Apólices',v:s.activePolicies||0,i:FileText,c:'text-green-600'},{t:'Novos Leads',v:s.newLeads||0,i:Bot,c:'text-purple-600'},{t:'Renovações',v:s.expiring||0,i:AlertTriangle,c:'text-red-600'}].map((x,i)=>(
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow">
                        <div><h3 className="text-3xl font-bold text-slate-800">{x.v}</h3><p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{x.t}</p></div>
                        <div className={`p-3 rounded-xl bg-gray-50 ${x.c}`}><x.i size={24}/></div>
                    </div>
                ))} 
            </div>
        </div> 
    );
};

// --- LAYOUT ---
const Layout = ({ user, logout }) => (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
        <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
            <div className="p-8 pb-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
                    CRM <div className="w-3 h-3 rounded-full bg-orange-500 mt-1"></div>
                </h1>
                <span className="text-xs font-bold text-orange-500 tracking-[0.2em] uppercase block mt-1">CG Seguros</span>
                <p className="text-xs text-slate-500 mt-4 font-medium">Olá, {user.nome}</p>
            </div>
            <nav className="flex-1 space-y-2 mt-6 overflow-y-auto">
                <SidebarItem to="/" icon={LayoutDashboard} label="Visão Geral" />
                <SidebarItem to="/leads" icon={Bot} label="Leads (Typebot)" />
                <SidebarItem to="/agenda" icon={CalendarIcon} label="Agenda" />
                <SidebarItem to="/finance" icon={DollarSign} label="Financeiro" />
                <SidebarItem to="/clients" icon={Users} label="Clientes & Perfil" />
                <SidebarItem to="/policies" icon={FileText} label="Apólices" />
                <SidebarItem to="/claims" icon={AlertOctagon} label="Sinistros" />
                <SidebarItem to="/extract" icon={TrendingUp} label="Extrato Produtor" />
                {user.perfil === 'ADMIN' && (<><div className="pt-4 pb-2 px-8"><p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Admin</p></div><SidebarItem to="/users" icon={Lock} label="Usuários" /><SidebarItem to="/integrations" icon={Settings} label="Configurações" /></>)}
            </nav>
            <div className="p-6 border-t border-slate-800"><button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-white transition font-medium"><LogOut size={16}/> Sair</button></div>
        </aside>
        <main className="flex-1 overflow-auto p-8 relative"><Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/policies" element={<Policies user={user} />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/extract" element={<ProducerExtract user={user} />} />
            <Route path="/users" element={<UsersManager />} />
            <Route path="/integrations" element={<Integrations />} />
        </Routes></main>
    </div>
);

export default function App() {
  const { user, login, logout } = useAuth();
  if (!user) return <Login onLogin={login} />;
  return <BrowserRouter><Layout user={user} logout={logout} /><style>{` .input-field { width: 100%; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; outline: none; background: #fff; transition: all 0.2s; font-size: 0.95rem; } .input-field:focus { border-color: #f97316; box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1); } .btn-primary { background-color: #f97316; color: white; padding: 0.6rem 1.2rem; border-radius: 0.75rem; font-weight: bold; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background 0.2s; } .btn-primary:hover { background-color: #ea580c; } `}</style></BrowserRouter>;
}