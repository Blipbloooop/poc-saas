-- DropIndex
DROP INDEX "Chantier_reference_key";

-- AlterTable
ALTER TABLE "Chantier" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "prestations" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE INDEX "Chantier_organizationId_idx" ON "Chantier"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Chantier_organizationId_reference_key" ON "Chantier"("organizationId", "reference");

-- CreateIndex
CREATE INDEX "prestations_organizationId_idx" ON "prestations"("organizationId");

-- AddForeignKey
ALTER TABLE "Chantier" ADD CONSTRAINT "Chantier_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestations" ADD CONSTRAINT "prestations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
