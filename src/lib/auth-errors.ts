const ERROR_MAP: Record<string, string> = {
  "Invalid password": "Mot de passe incorrect",
  "Invalid email or password": "Email ou mot de passe incorrect",
  "Invalid credentials": "Identifiants invalides",
  "Incorrect password": "Mot de passe incorrect",
  "User already exists": "Un compte existe déjà avec cet email",
  "User already exists. Use another email.": "Un compte existe déjà avec cet email",
  "User not found": "Aucun compte trouvé avec cet email",
  "Email already in use": "Cet email est déjà utilisé",
  "Account not found": "Compte introuvable",
  "Email is not verified": "Email non vérifié",
  "Email not verified": "Email non vérifié",
  "Verification email isn't enabled": "Renvoi d'email non disponible",
  "Invalid token": "Lien invalide ou expiré",
  "Token expired": "Lien expiré, demandez-en un nouveau",
  "Password is too short": "Mot de passe trop court (8 caractères minimum)",
  "Password is too long": "Mot de passe trop long",
  "Password doesn't match": "Les mots de passe ne correspondent pas",
  "Unauthorized": "Non autorisé",
  "Session not found": "Session expirée, reconnectez-vous",
  "Too many requests": "Trop de tentatives, réessayez plus tard",
  "Rate limit exceeded": "Trop de tentatives, réessayez plus tard",
  "Invalid OTP": "Code invalide",
};

export function translateAuthError(message: string | undefined): string {
  if (!message) return "Une erreur est survenue";
  return ERROR_MAP[message] ?? message;
}
