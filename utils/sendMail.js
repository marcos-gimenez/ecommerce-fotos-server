import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendOrderEmail({ to, orderId }) {
  const url = `${process.env.FRONT_URL}/thanks/${orderId}`;

  await transporter.sendMail({
    from: `"Tienda Fotos" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Tu compra está lista',
    html: `
      <h2>Gracias por tu compra</h2>
      <p>Tu pedido <strong>${orderId}</strong> fue confirmado.</p>
      <p>
        Descargá tus archivos acá:<br/>
        <a href="${url}">${url}</a>
      </p>
      <p>Los links expiran.</p>
    `,
  });
}
