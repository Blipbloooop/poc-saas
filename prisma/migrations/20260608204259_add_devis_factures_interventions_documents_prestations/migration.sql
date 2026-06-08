-- CreateEnum
CREATE TYPE "DevisStatus" AS ENUM ('BROUILLON', 'ENVOYE', 'SIGNE', 'REFUSE', 'EXPIRE');

-- CreateEnum
CREATE TYPE "FactureStatus" AS ENUM ('BROUILLON', 'ENVOYEE', 'PAYEE', 'IMPAYEE');

-- CreateEnum
CREATE TYPE "InterventionStatus" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "DocumentCategorie" AS ENUM ('PLAN', 'PHOTO', 'BON_COMMANDE', 'RAPPORT', 'CONTRAT', 'AUTRE');

-- CreateTable
CREATE TABLE "prestations" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "prix" DOUBLE PRECISION NOT NULL,
    "unite" TEXT NOT NULL DEFAULT 'forfait',
    "tva" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prestations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devis" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "chantierId" TEXT NOT NULL,
    "status" "DevisStatus" NOT NULL DEFAULT 'BROUILLON',
    "clientNom" TEXT NOT NULL DEFAULT '',
    "clientEmail" TEXT,
    "clientAdresse" TEXT,
    "validiteJours" INTEGER NOT NULL DEFAULT 30,
    "tvaDefault" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "mentionsLegales" TEXT,
    "notes" TEXT,
    "totalHT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTVA" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTTC" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "signatureToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_devis" (
    "id" TEXT NOT NULL,
    "devisId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "quantite" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unite" TEXT NOT NULL DEFAULT 'forfait',
    "prixUnitaire" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tva" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "totalHT" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "lignes_devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "chantierId" TEXT NOT NULL,
    "devisId" TEXT,
    "status" "FactureStatus" NOT NULL DEFAULT 'BROUILLON',
    "clientNom" TEXT NOT NULL DEFAULT '',
    "clientEmail" TEXT,
    "clientAdresse" TEXT,
    "totalHT" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTVA" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTTC" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "echeanceDate" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_facture" (
    "id" TEXT NOT NULL,
    "factureId" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "quantite" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unite" TEXT NOT NULL DEFAULT 'forfait',
    "prixUnitaire" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tva" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "totalHT" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "lignes_facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" TEXT NOT NULL,
    "chantierId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "status" "InterventionStatus" NOT NULL DEFAULT 'PLANIFIEE',
    "dateDebut" TIMESTAMP(3),
    "dateFin" TIMESTAMP(3),
    "memo" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" "DocumentCategorie" NOT NULL DEFAULT 'AUTRE',
    "url" TEXT NOT NULL,
    "taille" INTEGER,
    "mimeType" TEXT,
    "memo" TEXT,
    "chantierId" TEXT,
    "interventionId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "devis_numero_key" ON "devis"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "devis_signatureToken_key" ON "devis"("signatureToken");

-- CreateIndex
CREATE INDEX "devis_chantierId_idx" ON "devis"("chantierId");

-- CreateIndex
CREATE INDEX "lignes_devis_devisId_idx" ON "lignes_devis"("devisId");

-- CreateIndex
CREATE UNIQUE INDEX "factures_numero_key" ON "factures"("numero");

-- CreateIndex
CREATE INDEX "factures_chantierId_idx" ON "factures"("chantierId");

-- CreateIndex
CREATE INDEX "lignes_facture_factureId_idx" ON "lignes_facture"("factureId");

-- CreateIndex
CREATE INDEX "interventions_chantierId_idx" ON "interventions"("chantierId");

-- CreateIndex
CREATE INDEX "documents_chantierId_idx" ON "documents"("chantierId");

-- CreateIndex
CREATE INDEX "documents_interventionId_idx" ON "documents"("interventionId");

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "Chantier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_devis" ADD CONSTRAINT "lignes_devis_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "devis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "Chantier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "devis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_facture" ADD CONSTRAINT "lignes_facture_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "factures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "Chantier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_chantierId_fkey" FOREIGN KEY ("chantierId") REFERENCES "Chantier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_interventionId_fkey" FOREIGN KEY ("interventionId") REFERENCES "interventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
