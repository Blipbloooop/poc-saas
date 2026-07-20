-- AlterTable
ALTER TABLE "company_profile" ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "invitation" ADD COLUMN     "nom" TEXT,
ADD COLUMN     "prenom" TEXT,
ADD COLUMN     "telephone" TEXT;
