import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, FileText, Settings, Cloud, Plus, Search, 
  User, Bell, CheckCircle, Bot, Copy, ChevronRight, Car, Shield, AlertTriangle,
  Calendar, DollarSign, Download, Filter, FileCheck, X, Folder, Mail, HardDrive, Upload
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : 'https://crm-seguros.onrender.com';
const api = axios.create({ baseURL: API_URL });

// --- COMPONENTES UI ---
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

// --- CLIENTES COM GESTÃO DE ARQUIVOS ---
const Clients = () => {
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filesModalOpen, setFilesModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDocs, setClientDocs] = useState([]);
  
  // Form Cliente
  const [form, setForm] = useState({ nome: '', whatsapp: '', email: '', tipo: 'PF', renavam: '', modelo_veiculo: '', ano_veiculo: '', condutor_principal: '', km: '', guincho: '', carro_reserva: '', danos_terceiros: '' });
  
  // Form Upload Arquivo
  const [docForm, setDocForm] = useState({ nome: '', categoria: 'Documentos Pessoais' });
  const [docFile, setDocFile] = useState(null);

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => { try { const res = await api.get('/clients'); setClients(res.data); } catch(e){} };
  
  const openFiles = async (client) => {
      setSelectedClient(client);
      setFilesModalOpen(true);
      loadDocs(client.id);
  };

  const loadDocs = async (id) => {
      try { const res = await api.get(`/clients/${id}/documents`); setClientDocs(res.data); } catch(e){}
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    await api.post('/clients', form);
    setModalOpen(false); loadClients();
  };

  const handleUploadDoc = async (e) => {
      e.preventDefault();
      if(!docFile) return alert("Selecione um arquivo");
      const data = new FormData();
      data.append('nome', docForm.nome);
      data.append('categoria', docForm.categoria);
      data.append('clientId', selectedClient.id);
      data.append('file', docFile);

      try {
          await api.post('/documents', data);
          alert("Arquivo salvo!");
          setDocFile(null); setDocForm({nome:'', categoria:'Documentos Pessoais'});
          loadDocs(selectedClient.id);
      } catch(e) { alert("Erro no upload"); }
  };

  const handleSendEmail = async (docId) => {
      if(!confirm("Enviar este documento por e-mail para o cliente?")) return;
      try {
          await api.post(`/documents/${docId}/send-email`);
          alert("E-mail enviado com sucesso!");
      } catch(e) { alert("Erro ao enviar e-mail. Verifique a configuração SMTP."); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Carteira de Clientes</h2>
        <button onClick={() => setModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg flex items-center gap-2">
          <Plus size={20}/> Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
            <tr><th className="p-5">Nome</th><th className="p-5">Contato</th><th className="p-5 text-center">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="p-5 font-bold text-slate-700">{c.nome}</td>
                <td className="p-5 text-sm">{c.email} <br/><span className="text-slate-400">{c.whatsapp}</span></td>
                <td className="p-5 text-center">
                    <button onClick={() => openFiles(c)} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mx-auto border border-blue-200">
                        <Folder size={16}/> Arquivos
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ARQUIVOS DO CLIENTE */}
      {filesModalOpen && selectedClient && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
              <div className="bg-white p-8 rounded-2xl w-full max-w-4xl shadow-2xl h-[80vh] flex flex-col">
                  <div className="flex justify-between items-center border-b pb-4 mb-4">
                      <div>
                          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Folder className="text-orange-500"/> Área de Arquivos</h3>
                          <p className="text-sm text-slate-500">Cliente: <b>{selectedClient.nome}</b></p>
                      </div>
                      <button onClick={()=>setFilesModalOpen(false)}><X/></button>
                  </div>

                  <div className="flex gap-6 h-full overflow-hidden">
                      {/* Lado Esquerdo: Upload */}
                      <div className="w-1/3 border-r pr-6 flex flex-col gap-4">
                          <h4 className="font-bold text-sm uppercase text-slate-500">Novo Arquivo</h4>
                          <form onSubmit={handleUploadDoc} className="space-y-4">
                              <input placeholder="Nome do Arquivo" className="input-field" value={docForm.nome} onChange={e=>setDocForm({...docForm, nome:e.target.value})} required/>
                              <select className="input-field bg-white" value={docForm.categoria} onChange={e=>setDocForm({...docForm, categoria:e.target.value})}>
                                  <option>Documentos Pessoais</option>
                                  <option>Contratos</option>
                                  <option>Vistorias</option>
                                  <option>Sinistros</option>
                                  <option>Outros</option>
                              </select>
                              <div className="border-2 border-dashed border-slate-200 p-4 rounded-xl text-center cursor-pointer hover:bg-slate-50 relative">
                                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e=>setDocFile(e.target.files[0])}/>
                                  <Upload className="mx-auto text-slate-400 mb-2"/>
                                  <p className="text-xs text-slate-500">{docFile ? docFile.name : "Clique para selecionar"}</p>
                              </div>
                              <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded-xl font-bold hover:bg-slate-900">Salvar Arquivo</button>
                          </form>
                      </div>

                      {/* Lado Direito: Lista */}
                      <div className="w-2/3 overflow-y-auto pr-2">
                          <h4 className="font-bold text-sm uppercase text-slate-500 mb-4">Arquivos Armazenados</h4>
                          <div className="space-y-3">
                              {clientDocs.map(doc => (
                                  <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-md transition">
                                      <div className="flex items-center gap-3">
                                          <div className="p-2 bg-white rounded-lg border border-slate-200">
                                              <FileText size={20} className="text-orange-500"/>
                                          </div>
                                          <div>
                                              <p className="font-bold text-slate-700">{doc.nome}</p>
                                              <p className="text-xs text-slate-400">{doc.categoria} • {new Date(doc.criadoEm).toLocaleDateString()}</p>
                                          </div>
                                      </div>
                                      <div className="flex gap-2">
                                          <a href={doc.url} target="_blank" className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Baixar">
                                              <Download size={18}/>
                                          </a>
                                          <button onClick={()=>handleSendEmail(doc.id)} className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Enviar por E-mail">
                                              <Mail size={18}/>
                                          </button>
                                      </div>
                                  </div>
                              ))}
                              {clientDocs.length === 0 && <p className="text-center text-slate-400 py-10">Nenhum arquivo encontrado.</p>}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Modal Novo Cliente (Oculto para brevidade, usar o mesmo de antes) */}
      {modalOpen && <div className="fixed inset-0 bg-black/50 flex justify-center items-center"><div className="bg-white p-6 rounded">Use o código anterior para este modal</div><button onClick={()=>setModalOpen(false)}>Fechar</button></div>}
    </div>
  );
};

// --- INTEGRAÇÕES (NOVA) ---
const Integrations = () => {
    const [config, setConfig] = useState({ storageType: 'LOCAL', smtpHost: '', smtpPort: 587, smtpUser: '', smtpPass: '', googleFolderId: '', googleDriveJson: '' });
    
    useEffect(() => {
        api.get('/config').then(res => { if(res.data) setConfig({...config, ...res.data, googleDriveJson: JSON.stringify(res.data.googleDriveJson || {}, null, 2)}); });
    }, []);

    const save = async () => {
        try { await api.post('/config', config); alert("Configurações Salvas!"); } catch(e) { alert("Erro ao salvar"); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800">Integrações & Sistema</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cartão Armazenamento */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><HardDrive className="text-orange-500"/> Armazenamento</h3>
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-600">Onde salvar os arquivos?</label>
                        <div className="flex gap-4">
                            <button onClick={()=>setConfig({...config, storageType:'LOCAL'})} className={`flex-1 py-3 rounded-xl border font-bold ${config.storageType==='LOCAL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}>
                                Local (PC)
                            </button>
                            <button onClick={()=>setConfig({...config, storageType:'DRIVE'})} className={`flex-1 py-3 rounded-xl border font-bold ${config.storageType==='DRIVE' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'}`}>
                                Google Drive
                            </button>
                        </div>
                        
                        {config.storageType === 'DRIVE' && (
                            <div className="space-y-3 pt-4 border-t animate-fade-in">
                                <input placeholder="ID da Pasta do Drive" className="input-field" value={config.googleFolderId} onChange={e=>setConfig({...config, googleFolderId:e.target.value})}/>
                                <textarea placeholder="JSON de Credenciais" className="input-field h-24 text-xs font-mono" value={config.googleDriveJson} onChange={e=>setConfig({...config, googleDriveJson:e.target.value})}/>
                            </div>
                        )}
                        {config.storageType === 'LOCAL' && (
                            <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg">Os arquivos serão salvos na pasta <b>/uploads</b> dentro do servidor.</p>
                        )}
                    </div>
                </div>

                {/* Cartão E-mail */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Mail className="text-orange-500"/> Servidor de E-mail (SMTP)</h3>
                    <div className="space-y-3">
                        <input placeholder="Host SMTP (Ex: smtp.gmail.com)" className="input-field" value={config.smtpHost} onChange={e=>setConfig({...config, smtpHost:e.target.value})}/>
                        <div className="grid grid-cols-2 gap-3">
                            <input placeholder="Porta (587)" type="number" className="input-field" value={config.smtpPort} onChange={e=>setConfig({...config, smtpPort:e.target.value})}/>
                            <input placeholder="Usuário/Email" className="input-field" value={config.smtpUser} onChange={e=>setConfig({...config, smtpUser:e.target.value})}/>
                        </div>
                        <input placeholder="Senha do App" type="password" className="input-field" value={config.smtpPass} onChange={e=>setConfig({...config, smtpPass:e.target.value})}/>
                    </div>
                </div>
            </div>
            
            <button onClick={save} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95">Salvar Todas as Configurações</button>
        </div>
    );
};

// ... Mantenha Dashboard e Policies como no código anterior ou importe-os ...
// (Para brevidade, assumi que Dashboard e Policies estão ok, foquei nas mudanças pedidas)

const Dashboard = () => <div className="p-10 text-center text-slate-400">Dashboard Carregado</div>;
const Policies = () => <div className="p-10 text-center text-slate-400">Apólices Carregado</div>;

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
        <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
          <div className="p-8 pb-4">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-0.5">CRM</span>
                <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">CG SEGUROS<div className="w-2 h-2 rounded-full bg-orange-500 mt-1"></div></h1>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">Gestão Premium</p>
          </div>
          <nav className="flex-1 space-y-2 mt-6">
            <SidebarItem to="/" icon={LayoutDashboard} label="Visão Geral" />
            <SidebarItem to="/clients" icon={Users} label="Carteira Clientes" />
            <SidebarItem to="/policies" icon={FileText} label="Apólices" />
            <SidebarItem to="/integrations" icon={Settings} label="Integrações" />
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-8 relative">
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/integrations" element={<Integrations />} />
            </Routes>
        </main>
      </div>
      <style>{` .input-field { width: 100%; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; outline: none; background: #fff; } `}</style>
    </BrowserRouter>
  );
}