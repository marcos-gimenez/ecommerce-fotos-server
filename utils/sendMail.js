import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail({ to, orderId }) {
  const url = `${process.env.FRONT_URL}/thanks/${orderId}`;

  await resend.emails.send({
    from: 'Compras <onboarding@resend.dev>', // permitido sin dominio propio
    to,
    subject: 'Tu compra está lista',
    html: `
      <h2>Gracias por tu compra</h2>
      <p>Pedido <strong>${orderId}</strong></p>
      <p>
        Descargá tus archivos acá:<br/>
        <a href="${url}">${url}</a>
      </p>
      <p>Los links expiran.</p>
    `,
  });
}
