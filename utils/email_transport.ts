import { createTransport } from "nodemailer";



// Create a transport to send emails using Mailtrap
const transporter = createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port:  2525,
  auth: {
    user: process.env.MAILTRAP_USER as string,
    pass: process.env.MAILTRAP_PASSWORD as string,
  },
});

export default transporter