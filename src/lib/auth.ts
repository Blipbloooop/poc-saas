import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP, organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import {
  sendOTPEmail,
  sendNewUserNotification,
  sendInvitationEmail,
} from "./email-service";
import { db } from "./db";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET est requis dans les variables d'environnement");
}
if (!process.env.BETTER_AUTH_URL) {
  throw new Error("BETTER_AUTH_URL est requis dans les variables d'environnement");
}

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    // Le lien classique est désactivé : la confirmation se fait par code à 6
    // chiffres (plugin emailOTP ci-dessous, sendVerificationOnSignUp) pour
    // rester dans le wizard d'inscription sans redirection.
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
  },
  session: {
    cookieCache: {
      enabled: false,
    },
  },
  callbacks: {
    async redirect({ baseUrl }: { baseUrl: string }) {
      return `${baseUrl}/dashboard`;
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (process.env.NODE_ENV !== "production") return;

          const provider = await db.account.findFirst({
            where: { userId: user.id },
            select: { providerId: true },
          });

          sendNewUserNotification({
            userEmail: user.email,
            userName: user.name ?? user.email.split("@")[0],
            provider: provider?.providerId ?? "credential",
            createdAt: new Date(),
          }).catch((err) => {
            console.error("[notification] Échec envoi notif nouvel utilisateur :", err);
          });
        },
      },
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        try {
          await sendOTPEmail({ email, otp, type });
        } catch (error) {
          console.error("Failed to send OTP:", error);
          throw error;
        }
      },
    }),
    organization({
      creatorRole: "admin",
      async sendInvitationEmail(data) {
        const url = `${process.env.BETTER_AUTH_URL}/accept-invite/${data.id}`;
        await sendInvitationEmail({
          email: data.email,
          organizationName: data.organization.name,
          inviterName: data.inviter.user.name,
          role: data.role,
          url,
        });
      },
    }),
    // Doit rester le dernier plugin : propage les Set-Cookie des appels
    // auth.api.* (ex. setActiveOrganization) exécutés depuis des Server Actions.
    nextCookies(),
  ],
});
