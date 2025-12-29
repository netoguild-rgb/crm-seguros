-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" SERIAL NOT NULL,
    "googleDriveJson" JSONB,
    "googleFolderId" TEXT,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'PF',
    "cpf_cnpj" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "renavam" TEXT,
    "modelo_veiculo" TEXT,
    "ano_veiculo" TEXT,
    "condutor_principal" TEXT,
    "km" TEXT,
    "guincho" TEXT,
    "carro_reserva" TEXT,
    "danos_terceiros" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" SERIAL NOT NULL,
    "numero" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVA',
    "tipo_seguro" TEXT NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "premio_liquido" DOUBLE PRECISION,
    "comissao" DOUBLE PRECISION,
    "pdf_url" TEXT,
    "pdf_file_id" TEXT,
    "clientId" INTEGER NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nome" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT,
    "cpf" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOVO',
    "tipo_seguro" TEXT,
    "placa" TEXT,
    "modelo_veiculo" TEXT,
    "ano_veiculo" TEXT,
    "uso_veiculo" TEXT,
    "dados_extras" JSONB,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_cpf_cnpj_key" ON "Client"("cpf_cnpj");

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
