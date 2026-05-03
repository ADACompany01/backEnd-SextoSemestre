import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ContratoRepository } from '../../../infrastructure/database/repositories/contrato.repository';
import { SignatureService } from '../../services/signature.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SignContratoUseCase {
  constructor(
    private readonly contratoRepository: ContratoRepository,
    private readonly signatureService: SignatureService,
  ) {}

  async execute(
    contratoId: string,
    signatureBase64: string,
    contractFilePath?: string,
  ): Promise<{ signedContractPath: string }> {
    // Buscar o contrato
    const contrato = await this.contratoRepository.findById(contratoId);
    if (!contrato) {
      throw new NotFoundException(`Contrato não encontrado: ${contratoId}`);
    }

    // Validar assinatura
    if (!this.signatureService.validateSignatureBase64(signatureBase64)) {
      throw new BadRequestException('Assinatura inválida. Forneça uma imagem em base64 válida.');
    }

    // Determinar caminho do PDF original
    let pdfPath: string;
    
    if (contractFilePath && fs.existsSync(contractFilePath)) {
      pdfPath = contractFilePath;
    } else if ((contrato as any).arquivo_contrato && fs.existsSync((contrato as any).arquivo_contrato)) {
      pdfPath = (contrato as any).arquivo_contrato;
    } else {
      throw new BadRequestException('Arquivo do contrato não encontrado. Faça upload do contrato antes de assinar.');
    }

    // Gerar caminho para o PDF assinado
    const uploadsDir = path.join(process.cwd(), 'uploads', 'contratos-assinados');
    const fileName = `contrato_${contratoId}_assinado_${Date.now()}.pdf`;
    const outputPath = path.join(uploadsDir, fileName);

    // Assinar o PDF
    const signedPath = await this.signatureService.signPDF(
      pdfPath,
      signatureBase64,
      outputPath,
    );

    // Atualizar o contrato com o caminho do PDF assinado
    // Nota: Você pode precisar adicionar um campo 'contrato_assinado_url' na entidade
    await this.contratoRepository.update(contratoId, {
      ...contrato,
      // Adicione aqui o campo para armazenar o caminho do PDF assinado
      // contrato_assinado_url: signedPath,
    } as any);

    return {
      signedContractPath: signedPath,
    };
  }
}

