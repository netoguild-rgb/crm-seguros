const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const { google } = require('googleapis');
const stream = require('stream');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const prisma = new PrismaClient();

// Configurar Pasta Local
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.use(cors());
app.use(express.json());
// Servir arquivos locais estaticamente
app.use('/uploads', express.static(UPLOAD_DIR));

// --- CONFIGURAÇÃO MULTER (Híbrido) ---
const storageLocal = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const uploadLocal = multer({ storage: storageLocal });
const uploadMemory = multer({ storage: multer.memoryStorage() });

// Middleware Dinâmico de Upload
const dynamicUpload = async (req, res, next) => {
    try {
        const config = await prisma.systemConfig.findFirst();
        if (config?.storageType === 'DRIVE') {
            uploadMemory.single('file')(req, res, next);
        } else {
            uploadLocal.single('file')(req, res, next);
        }
    } catch (e) { next(e); }
};

// --- FUNÇÕES AUXILIARES ---
const uploadToDrive = async (fileObject, folderId, credentials) => {
  const auth = new google.auth.JWT(
    credentials.client_email, null, credentials.private_key, ['https://www.googleapis.com/auth/drive.file']
  );
  const drive = google.drive({ version: 'v3', auth });
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileObject.buffer);

  const response = await drive.files.create({
    requestBody: { name: fileObject.originalname, parents: [folderId] },
    media: { mimeType: fileObject.mimetype, body: bufferStream },
    fields: 'id, webViewLink'
  });
  return { id: response.data.id, url: response.data.webViewLink };
};

const sendEmail = async (to, subject, text, attachmentPath) => {
    const config = await prisma.systemConfig.findFirst();
    if (!config?.smtpHost) throw new Error("SMTP não configurado");

    const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: { user: config.smtpUser, pass: config.smtpPass }
    });

    const mailOptions = {
        from: `"CG Seguros" <${config.smtpUser}>`,
        to, subject, text,
        attachments: attachmentPath ? [{ path: attachmentPath }] : []
    };

    return transporter.sendMail(mailOptions);
};

// --- ROTAS DE DOCUMENTOS (NOVO) ---

// 1. Upload de Documento (Cliente Específico)
app.post('/documents', dynamicUpload, async (req, res) => {
    try {
        const { nome, categoria, clientId } = req.body;
        const file = req.file;
        if (!file) throw new Error("Nenhum arquivo enviado");

        const config = await prisma.systemConfig.findFirst();
        let finalUrl = '', finalType = 'LOCAL', finalPath = '';

        if (config?.storageType === 'DRIVE' && config.googleDriveJson) {
            // Upload Drive
            console.log("Upload Nuvem...");
            const result = await uploadToDrive(file, config.googleFolderId, config.googleDriveJson);
            finalUrl = result.url;
            finalType = 'DRIVE';
            finalPath = ''; // Drive não tem path local direto fácil para anexo sem download
        } else {
            // Upload Local
            console.log("Upload Local...");
            const protocol = req.protocol;
            const host = req.get('host');
            finalUrl = `${protocol}://${host}/uploads/${file.filename}`;
            finalType = 'LOCAL';
            finalPath = file.path;
        }

        const doc = await prisma.document.create({
            data: {
                nome, categoria, clientId: parseInt(clientId),
                url: finalUrl, tipo: finalType, path: finalPath
            }
        });
        res.json(doc);
    } catch (e) { 
        console.error(e);
        res.status(500).json({ erro: e.message }); 
    }
});

// 2. Listar Documentos de um Cliente
app.get('/clients/:id/documents', async (req, res) => {
    const docs = await prisma.document.findMany({
        where: { clientId: parseInt(req.params.id) },
        orderBy: { criadoEm: 'desc' }
    });
    res.json(docs);
});

// 3. Enviar Documento por Email
app.post('/documents/:id/send-email', async (req, res) => {
    try {
        const doc = await prisma.document.findUnique({ where: { id: parseInt(req.params.id) }, include: { client: true } });
        if (!doc) throw new Error("Documento não encontrado");
        if (!doc.client.email) throw new Error("Cliente sem e-mail cadastrado");

        // Se for Drive, enviamos apenas o link. Se for Local, enviamos o anexo.
        if (doc.tipo === 'LOCAL' && doc.path) {
            await sendEmail(doc.client.email, `Documento: ${doc.nome}`, `Olá ${doc.client.nome},\n\nSegue em anexo o documento solicitado.\n\nAtt,\nCG Seguros`, doc.path);
        } else {
            await sendEmail(doc.client.email, `Documento: ${doc.nome}`, `Olá ${doc.client.nome},\n\nPara acessar seu documento, clique no link abaixo:\n${doc.url}\n\nAtt,\nCG Seguros`);
        }
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

// --- ROTAS EXISTENTES (ATUALIZADAS) ---

app.post('/config', async (req, res) => {
    try {
        const data = req.body;
        // Se vier JSON de string, faz parse
        let driveJson = undefined;
        if (data.googleDriveJson) driveJson = JSON.parse(data.googleDriveJson);

        await prisma.systemConfig.upsert({
            where: { id: 1 },
            update: {
                storageType: data.storageType,
                googleFolderId: data.googleFolderId,
                googleDriveJson: driveJson,
                smtpHost: data.smtpHost,
                smtpPort: parseInt(data.smtpPort),
                smtpUser: data.smtpUser,
                smtpPass: data.smtpPass
            },
            create: {
                storageType: data.storageType,
                googleFolderId: data.googleFolderId,
                googleDriveJson: driveJson,
                smtpHost: data.smtpHost,
                smtpPort: parseInt(data.smtpPort),
                smtpUser: data.smtpUser,
                smtpPass: data.smtpPass
            }
        });
        res.json({ ok: true });
    } catch (e) { res.status(500).json({ erro: e.message }); }
});

app.get('/config', async (req, res) => {
    const config = await prisma.systemConfig.findFirst();
    res.json(config || {});
});

// ... (Mantenha as rotas de /clients, /policies, /leads, /dashboard-stats iguais às anteriores)

// Clientes
app.get('/clients', async (req, res) => { const c = await prisma.client.findMany({ orderBy: { nome: 'asc' } }); res.json(c); });
app.post('/clients', async (req, res) => { try { const c = await prisma.client.create({ data: req.body }); res.json(c); } catch(e) { res.status(400).json({erro: "Erro"}); } });

// Apólices
app.get('/policies', async (req, res) => { const p = await prisma.policy.findMany({ include: { client: true }, orderBy: { id: 'desc' } }); res.json(p); });
app.post('/policies', dynamicUpload, async (req, res) => { /* Lógica de Apólice Simplificada para manter compatibilidade, mas idealmente usa a mesma lógica de upload */ res.json({ok:true}); });

// Dashboard
app.get('/dashboard-stats', async (req, res) => {
    const totalClients = await prisma.client.count();
    const activePolicies = await prisma.policy.count({ where: { status: 'ATIVA' } });
    const newLeads = await prisma.lead.count({ where: { status: 'NOVO' } });
    const expiring = await prisma.policy.count({ where: { data_fim: { gte: new Date(), lte: new Date(new Date().setDate(new Date().getDate() + 30)) } } });
    res.json({ totalClients, activePolicies, newLeads, expiring });
});

// Charts
app.get('/dashboard-charts', async (req, res) => { res.json({ labels: ['Auto', 'Vida'], distribuicao: [10, 5], receitaTotal: 1000, comissaoTotal: 100 }); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));