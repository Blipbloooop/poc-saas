import { createTransport } from "nodemailer";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "SaaS BTP";
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "contact@example.com";

const transporter = createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"${APP_NAME}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(options: MailOptions): Promise<void> {
  await transporter.sendMail({ from: FROM, ...options });
}

type OTPType = "sign-in" | "email-verification" | "forget-password" | "change-email";

interface OTPEmailData {
  email: string;
  otp: string;
  type: OTPType;
  userName?: string;
}

const OTP_CONFIG: Record<OTPType, { subject: string; title: string; description: string; label: string }> = {
  "sign-in": {
    subject: `Code de connexion ${APP_NAME}`,
    title: "Connexion à votre compte",
    description: "Voici votre code de connexion sécurisé :",
    label: "Connexion sécurisée",
  },
  "email-verification": {
    subject: `Vérifiez votre compte ${APP_NAME}`,
    title: "Vérifiez votre compte",
    description: "Voici votre code de vérification pour activer votre compte :",
    label: "Vérification du compte",
  },
  "forget-password": {
    subject: `Réinitialisation de votre mot de passe ${APP_NAME}`,
    title: "Réinitialisez votre mot de passe",
    description: "Voici votre code pour réinitialiser votre mot de passe :",
    label: "Réinitialisation du mot de passe",
  },
  "change-email": {
    subject: `Confirmation de changement d'email ${APP_NAME}`,
    title: "Changement d'adresse email",
    description: "Voici votre code de confirmation pour changer votre adresse email :",
    label: "Changement d'email",
  },
};

export async function sendOTPEmail(data: OTPEmailData): Promise<void> {
  const { email, otp, type, userName } = data;
  const name = userName || email.split("@")[0];
  const config = OTP_CONFIG[type];

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>${config.subject}</title>
    </head>
    <body style="margin:0;padding:0;background:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">
        <div style="background:#1E3A5F;padding:28px 32px;">
          <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">${APP_NAME}</div>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:#6B7280;">${config.label}</p>
          <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#111827;">Bonjour ${name} 👋</h1>
          <p style="margin:0 0 24px;font-size:14px;color:#4B5563;line-height:1.6;">${config.description}</p>
          <div style="background:#F3F4F6;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:#6B7280;">Votre code</p>
            <div style="font-size:40px;font-weight:700;letter-spacing:0.2em;color:#111827;font-family:monospace;">${otp}</div>
            <p style="margin:10px 0 0;font-size:12px;color:#6B7280;">Expire dans <strong style="color:#111827;">10 minutes</strong></p>
          </div>
          <div style="background:#FEF3C7;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
            <p style="margin:0;font-size:13px;color:#92400E;line-height:1.5;">⚠️ Ne partagez jamais ce code. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          </div>
          <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">
            Un problème ? <a href="mailto:${CONTACT_EMAIL}" style="color:#1E3A5F;text-decoration:none;">${CONTACT_EMAIL}</a>
          </p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #E5E7EB;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9CA3AF;">© ${new Date().getFullYear()} ${APP_NAME}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1***$2");
  try {
    await sendEmail({ to: email, subject: config.subject, html, text: `${APP_NAME} — ${config.title}\n\nBonjour ${name},\n\n${config.description}\n\nCode : ${otp}\n\nValide 10 minutes.` });
    console.log(`OTP [${type}] envoyé à ${maskedEmail}`);
  } catch (error) {
    console.error(`Échec envoi OTP [${type}] à ${maskedEmail}`);
    throw new Error("Impossible d'envoyer l'email de vérification");
  }
}

export async function sendVerificationLinkEmail({ email, url, userName }: { email: string; url: string; userName?: string }): Promise<void> {
  const name = userName || email.split("@")[0];

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;border:1px solid #E5E7EB;overflow:hidden;">
        <div style="background:#1E3A5F;padding:28px 32px;">
          <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">${APP_NAME}</div>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:#6B7280;">Activation du compte</p>
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">Bonjour ${name} 👋</h1>
          <p style="margin:0 0 28px;font-size:14px;color:#4B5563;line-height:1.6;">
            Merci de rejoindre ${APP_NAME}. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte.
          </p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${url}" style="display:inline-block;background:#1E3A5F;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">
              Confirmer mon adresse email →
            </a>
          </div>
          <div style="background:#FEF3C7;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
            <p style="margin:0;font-size:13px;color:#92400E;line-height:1.5;">⚠️ Ce lien est valide <strong>24 heures</strong>. Si vous n'avez pas créé de compte, ignorez cet email.</p>
          </div>
          <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6;">
            Si le bouton ne fonctionne pas :<br/>
            <a href="${url}" style="color:#1E3A5F;word-break:break-all;">${url}</a>
          </p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #E5E7EB;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9CA3AF;">© ${new Date().getFullYear()} ${APP_NAME} · <a href="mailto:${CONTACT_EMAIL}" style="color:#9CA3AF;text-decoration:none;">${CONTACT_EMAIL}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1***$2");
  await sendEmail({
    to: email,
    subject: `Confirmez votre adresse email — ${APP_NAME}`,
    html,
    text: `${APP_NAME} — Confirmez votre adresse email\n\nBonjour ${name},\n\nCliquez sur ce lien pour activer votre compte :\n${url}\n\nCe lien est valide 24 heures.`,
  });
  console.log(`Email de vérification envoyé à ${maskedEmail}`);
}

interface NewUserNotificationData {
  userEmail: string;
  userName: string;
  provider: string;
  createdAt: Date;
}

export async function sendNewUserNotification(data: NewUserNotificationData): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || CONTACT_EMAIL;
  const { userEmail, userName, provider, createdAt } = data;
  const providerLabel = provider === "credential" ? "Email / Mot de passe" : provider;
  const dateFormatted = createdAt.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris",
  });

  await sendEmail({
    to: adminEmail,
    subject: `🎉 Nouvel utilisateur ${APP_NAME} — ${userName}`,
    html: `<p>Nouvel utilisateur inscrit.<br/><br/>Nom : ${userName}<br/>Email : ${userEmail}<br/>Méthode : ${providerLabel}<br/>Date : ${dateFormatted}</p>`,
    text: `Nouvel utilisateur inscrit sur ${APP_NAME}.\n\nNom : ${userName}\nEmail : ${userEmail}\nMéthode : ${providerLabel}\nDate : ${dateFormatted}`,
  });
}
