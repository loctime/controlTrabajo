const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

app.post("/sendRegistrationEmails", async (req, res) => {
  try {
    const { email, nombre, ciudad } = req.body;

    const adminMail = "ccariramallo@gmail.com";
    const adminMsg = `Se registró una persona: ${nombre} (${email}) de ${ciudad}`;
    const userMsg = `¡Bienvenido/a ${nombre}!¡Bienvenido/a a la Bolsa de Trabajo de la Coalición Cívica!
    Nos alegra que estés utilizando esta plataforma. Este espacio fue creado con el objetivo de conectar a personas que buscan empleo con empleadores que necesitan cubrir puestos de trabajo. Creemos en el valor del trabajo digno y en la importancia de fortalecer los vínculos dentro de nuestra comunidad.
    
    La Coalición Cívica ofrece esta herramienta de búsqueda laboral como un servicio gratuito y comunitario.
    
    ⚠️ Importante: La Coalición Cívica no asume ninguna responsabilidad sobre el proceso de contratación, ni mantiene relación laboral alguna con las partes involucradas (contratante y contratado).
    
    Esperamos que esta herramienta te sea útil y te deseamos mucho éxito en tu búsqueda.`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: adminMail,
      subject: "Nuevo registro Bolsa de Trabajo",
      text: adminMsg,
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Bienvenido/a Bolsa de Trabajo",
      text: userMsg,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});
