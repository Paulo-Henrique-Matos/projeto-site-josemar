const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const db = require('./database');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'https://luxeform-front.vercel.app'],
    methods: ['POST'],
    allowedHeaders: ['Content-Type']
})); // URL aqui

// Trava de Segurança Anti-Spam (Máximo 3 requisições por minuto por IP)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 3,
    message: { error: 'Too many requests from this IP, please try again later.' }
});

// Configuração do Transportador de E-mail (Nodemailer)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),  
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Endpoint Único de Orçamento
app.post('/api/estimates', limiter, async (req, res) => {
    const { fullName, email, phoneNumber, service, projectDetails } = req.body;

    if (!fullName || !email || !phoneNumber) {
        return res.status(400).json({ error: 'Required fields are missing.' });
    }

    try {
        // Salvar no Banco de Dados
        const queryText = `
            INSERT INTO tb_estimates (full_name, email, phone_number, service_type, project_details)
            VALUES (?, ?, ?, ?, ?) 
        `;

        const values = [fullName, email, phoneNumber, service, projectDetails];
        const [result] = await db.query(queryText, values);
        const leadId = result.insertId;

        // 1️⃣ Limpa o número de telefone tirando espaços, parênteses e traços (Deixa só números)
        // O WhatsApp exige o código do país. Como a LuxeForm é na Flórida (EUA), o padrão é +1.
        // Se o número já vier com +1 do front, mantemos, senão adicionamos o 1 da região deles.
        let cleanPhone = phoneNumber.replace(/\D/g, '');
        if (!cleanPhone.startsWith('1') && cleanPhone.length === 10) {
            cleanPhone = '1' + cleanPhone; // Adiciona o código dos EUA se o Paulo não colocou no front
        }

        // 2️⃣ Cria a mensagem personalizada codificada para a URL do WhatsApp
        const whatsappText = encodeURIComponent(
            `Hi ${fullName}, thank you for contacting LuxeForm Remodeling! ` +
            `We received your request for the "${service}" project. Let's schedule your consultation?`
        );

        // 3️⃣ Monta o link final do WhatsApp
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappText}`;

        // 2. Disparo do e-mail de notificação para o cliente LuxeForm
        await transporter.sendMail({
            from: `"LuxeForm Sistema" <no-reply@luxeform.com>`,
            to: 'luxeform.llc@gmail.com', // luxeform.llc@gmail.com
            subject: `🔥 Novo Orçamento #${leadId} Solicitado - ${service}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #8B1E2F; border-bottom: 2px solid #8B1E2F; padding-bottom: 10px;">New Estimate Request #${leadId}</h2>
                    
                    <p><strong>Name:</strong> ${fullName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phoneNumber}</p>
                    <p><strong>Service Type:</strong> ${service}</p>
                    <p><strong>Project Details:</strong></p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #8B1E2F; margin-bottom: 25px; border-radius: 4px;">
                        ${projectDetails || 'No details provided.'}
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${whatsappUrl}" target="_blank" style="background-color: #25D366; color: white; text-decoration: none; padding: 14px 25px; font-weight: bold; border-radius: 5px; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            📤 Reply via WhatsApp
                        </a>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #e0e0e0; margin-top: 30px;">
                    <p style="font-size: 12px; color: #777; text-align: center;">Automated notification from LuxeForm Landing Page.</p>
                </div>
            `,
        });

        return res.status(200).json({ message: 'Thank you! Your estimate request has been submitted successfully. LuxeForm Remodeling has received your project details, and you will receive a WhatsApp message shortly to continue the conversation.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal error processing request.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running in port ${PORT}`));