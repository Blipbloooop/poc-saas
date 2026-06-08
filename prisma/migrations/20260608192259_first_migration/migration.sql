-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "ChantierStatus" AS ENUM ('PROSPECT', 'EN_COURS', 'TERMINE', 'ANNULE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chantier" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "status" "ChantierStatus" NOT NULL DEFAULT 'PROSPECT',
    "adresse" TEXT,
    "ville" TEXT,
    "codePostal" TEXT,
    "budget" DOUBLE PRECISION,
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "responsableId" TEXT,

    CONSTRAINT "Chantier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Chantier_reference_key" ON "Chantier"("reference");

-- CreateIndex
CREATE INDEX "Chantier_status_idx" ON "Chantier"("status");

-- CreateIndex
CREATE INDEX "Chantier_responsableId_idx" ON "Chantier"("responsableId");

-- AddForeignKey
ALTER TABLE "Chantier" ADD CONSTRAINT "Chantier_responsableId_fkey" FOREIGN KEY ("responsableId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
