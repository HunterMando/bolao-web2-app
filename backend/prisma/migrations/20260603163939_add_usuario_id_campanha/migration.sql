-- AlterTable
ALTER TABLE "campanha" ADD COLUMN     "usuario_id" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "campanha" ADD CONSTRAINT "campanha_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
