import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { sendOTPEmail, sendVerificationLinkEmail, sendNewUserNotification } from "./email-service";
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
    // TODO: réactiver quand SMTP configuré
    // requireEmailVerification: true,
  },
  // TODO: réactiver quand SMTP configuré
  // emailVerification: {
  //   sendOnSignUp: true,
  //   expiresIn: 60 * 60 * 24,
  //   sendVerificationEmail: async ({ user, url }) => {
  //     await sendVerificationLinkEmail({ email: user.email, url, userName: user.name ?? undefined });
  //   },
  // },
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
      async sendVerificationOTP({ email, otp, type }) {
        try {
          await sendOTPEmail({ email, otp, type });
        } catch (error) {
          console.error("Failed to send OTP:", error);
          throw error;
        }
      },
    }),
  ],
});
