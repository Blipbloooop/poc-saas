import { createTransport } from "nodemailer";

const APP_NAME = "NaviBat";
const CONTACT_EMAIL = "contact@navibat.fr";

// Tokens du design system NaviBat (~/Desktop/NaviBat/design/HANDOFF.md)
const NAVY = "#1E2A5A";
const ORANGE = "#F5821F";
const BG = "#F6F7FB";
const BORDER = "#E6E9F2";
const FOREGROUND = "#1C2542";
const BODY_TEXT = "#3D4867";
const MUTED = "#6B7591";
const FAINT = "#9AA3BC";
const WARNING_BG = "#FDEEDD";
const WARNING_TEXT = "#B45E09";

// Marque vectorielle blanche (public/brand/navibat-mark-white.svg), inlinée
// pour s'afficher dans les clients mail qui bloquent les images distantes.
const LOGO_MARK_SVG = `<svg width="26" height="25" viewBox="0 0 210 200" xmlns="http://www.w3.org/2000/svg" style="display:block;">
  <defs>
    <linearGradient id="ogw" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F9A03F"></stop>
      <stop offset="1" stop-color="#EE7A11"></stop>
    </linearGradient>
  </defs>
  <path fill="#FFFFFF" d="M22 88 L52 58 L52 198 L22 198 Z"></path>
  <path fill="#FFFFFF" d="M52 58 L118 152 L118 198 L52 104 Z"></path>
  <path fill="#FFFFFF" d="M118 50 L148 32 L148 198 L118 198 Z"></path>
  <rect fill="url(#ogw)" x="154" y="70" width="6" height="128"></rect>
  <path fill="url(#ogw)" d="M166 56 L198 32 L198 198 L166 198 Z"></path>
  <g fill="#FFFFFF">
    <rect x="62" y="150" width="11" height="11"></rect>
    <rect x="79" y="150" width="11" height="11"></rect>
    <rect x="62" y="167" width="11" height="11"></rect>
    <rect x="79" y="167" width="11" height="11"></rect>
  </g>
</svg>`;

// En-tête de marque commun à tous les emails — table (pas flex) pour un
// alignement fiable dans Outlook desktop.
function emailHeader(): string {
  return `
    <div style="background:${NAVY};padding:24px 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;padding-right:9px;">${LOGO_MARK_SVG}</td>
          <td style="vertical-align:middle;font-size:20px;font-weight:900;letter-spacing:-0.02em;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
            <span style="color:#ffffff;">Navi</span><span style="color:${ORANGE};">Bat</span>
          </td>
        </tr>
      </table>
    </div>
  `;
}

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

type OTPType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";

interface OTPEmailData {
  email: string;
  otp: string;
  type: OTPType;
  userName?: string;
}

const OTP_CONFIG: Record<
  OTPType,
  { subject: string; title: string; description: string; label: string }
> = {
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
    description:
      "Voici votre code de confirmation pour changer votre adresse email :",
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
    <body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;border:1px solid ${BORDER};overflow:hidden;">
        ${emailHeader()}
        <div style="padding:32px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:${MUTED};">${config.label}</p>
          <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:${FOREGROUND};">Bonjour ${name} 👋</h1>
          <p style="margin:0 0 24px;font-size:14px;color:${BODY_TEXT};line-height:1.6;">${config.description}</p>
          <div style="background:${BG};border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:${MUTED};">Votre code</p>
            <div style="font-size:40px;font-weight:700;letter-spacing:0.2em;color:${FOREGROUND};font-family:monospace;">${otp}</div>
            <p style="margin:10px 0 0;font-size:12px;color:${MUTED};">Expire dans <strong style="color:${FOREGROUND};">10 minutes</strong></p>
          </div>
          <div style="background:${WARNING_BG};border-radius:8px;padding:12px 16px;margin-bottom:24px;">
            <p style="margin:0;font-size:13px;color:${WARNING_TEXT};line-height:1.5;">⚠️ Ne partagez jamais ce code. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          </div>
          <p style="margin:0;font-size:12px;color:${FAINT};text-align:center;">
            Un problème ? <a href="mailto:${CONTACT_EMAIL}" style="color:${NAVY};text-decoration:none;">${CONTACT_EMAIL}</a>
          </p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid ${BORDER};text-align:center;">
          <p style="margin:0;font-size:11px;color:${FAINT};">© ${new Date().getFullYear()} ${APP_NAME}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const maskedEmail = email.replace(/(.{2}).+(@.+)/, "$1***$2");
  try {
    await sendEmail({
      to: email,
      subject: config.subject,
      html,
      text: `${APP_NAME} — ${config.title}\n\nBonjour ${name},\n\n${config.description}\n\nCode : ${otp}\n\nValide 10 minutes.`,
    });
    console.log(`OTP [${type}] envoyé à ${maskedEmail}`);
  } catch (error) {
    console.error(`Échec envoi OTP [${type}] à ${maskedEmail}`);
    throw new Error("Impossible d'envoyer l'email de vérification");
  }
}

interface NewUserNotificationData {
  userEmail: string;
  userName: string;
  provider: string;
  createdAt: Date;
}

export async function sendNewUserNotification(
  data: NewUserNotificationData,
): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || CONTACT_EMAIL;
  const { userEmail, userName, provider, createdAt } = data;
  const providerLabel =
    provider === "credential" ? "Email / Mot de passe" : provider;
  const dateFormatted = createdAt.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });

  await sendEmail({
    to: adminEmail,
    subject: `🎉 Nouvel utilisateur ${APP_NAME} — ${userName}`,
    html: `<p>Nouvel utilisateur inscrit.<br/><br/>Nom : ${userName}<br/>Email : ${userEmail}<br/>Méthode : ${providerLabel}<br/>Date : ${dateFormatted}</p>`,
    text: `Nouvel utilisateur inscrit sur ${APP_NAME}.\n\nNom : ${userName}\nEmail : ${userEmail}\nMéthode : ${providerLabel}\nDate : ${dateFormatted}`,
  });
}

const INVITATION_ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  member: "Membre",
};

interface InvitationEmailData {
  email: string;
  organizationName: string;
  inviterName: string;
  role: string;
  url: string;
}

export async function sendInvitationEmail(
  data: InvitationEmailData,
): Promise<void> {
  const { email, organizationName, inviterName, role, url } = data;
  const roleLabel = INVITATION_ROLE_LABELS[role] ?? role;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;border:1px solid ${BORDER};overflow:hidden;">
        ${emailHeader()}
        <div style="padding:32px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.14em;color:${MUTED};">Invitation</p>
          <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:${FOREGROUND};">Rejoignez ${organizationName}</h1>
          <p style="margin:0 0 28px;font-size:14px;color:${BODY_TEXT};line-height:1.6;">
            ${inviterName} vous invite à rejoindre <strong>${organizationName}</strong> sur ${APP_NAME} en tant que <strong>${roleLabel}</strong>. Créez votre mot de passe pour accéder à votre espace.
          </p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${url}" style="display:inline-block;background:${ORANGE};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;">
              Rejoindre l'équipe →
            </a>
          </div>
          <p style="margin:0;font-size:12px;color:${FAINT};line-height:1.6;">
            Si le bouton ne fonctionne pas :<br/>
            <a href="${url}" style="color:${NAVY};word-break:break-all;">${url}</a>
          </p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid ${BORDER};text-align:center;">
          <p style="margin:0;font-size:11px;color:${FAINT};">© ${new Date().getFullYear()} ${APP_NAME} · <a href="mailto:${CONTACT_EMAIL}" style="color:${FAINT};text-decoration:none;">${CONTACT_EMAIL}</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: `${inviterName} vous invite à rejoindre ${organizationName} sur ${APP_NAME}`,
    html,
    text: `${inviterName} vous invite à rejoindre ${organizationName} sur ${APP_NAME} en tant que ${roleLabel}.\n\nRejoignez l'équipe :\n${url}`,
  });
}
