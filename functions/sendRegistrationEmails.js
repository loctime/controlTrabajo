const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({ origin: true }); // permite desde cualquier origen

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

module.exports = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Método no permitido");
    }

    try {
      const { email, nombre, ciudad } = req.body;

      let adminMail = "";
      let adminMsg = "";
      const userMsg = `¡Bienvenido/a ${nombre}!¡Bienvenido/a a la Bolsa de Trabajo de la Coalición Cívica!
Nos alegra que estés utilizando esta plataforma. Este espacio fue creado con el objetivo de conectar a personas que buscan empleo con empleadores que necesitan cubrir puestos de trabajo. Creemos en el valor del trabajo digno y en la importancia de fortalecer los vínculos dentro de nuestra comunidad.

La Coalición Cívica ofrece esta herramienta de búsqueda laboral como un servicio gratuito y comunitario.

⚠️ Importante: La Coalición Cívica no asume ninguna responsabilidad sobre el proceso de contratación, ni mantiene relación laboral alguna con las partes involucradas (contratante y contratado).

Esperamos que esta herramienta te sea útil y te deseamos mucho éxito en tu búsqueda.`;

      if (ciudad === "San Nicolás") {
        adminMail = "coalicioncivicasannicolas@hotmail.com";
        adminMsg = `Se registró una persona de San Nicolás: ${nombre} (${email})`;
      } else if (ciudad === "Ramallo") {
        adminMail = "ccariramallo@gmail.com";
        adminMsg = `Se registró una persona de Ramallo: ${nombre} (${email})`;
      } else {
        return res.status(400).json({ success: false, error: "Ciudad no soportada" });
      }

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

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error al enviar correo:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });
});
