import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PDFDocument, PDFPage, rgb } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SignatureService {
  private readonly logger = new Logger(SignatureService.name);

  /**
   * Insere uma assinatura em um PDF
   * @param pdfPath - Caminho do PDF original
   * @param signatureBase64 - Assinatura em base64 (PNG)
   * @param outputPath - Caminho onde salvar o PDF assinado
   * @returns Caminho do PDF assinado
   */
  async signPDF(
    pdfPath: string,
    signatureBase64: string,
    outputPath: string,
  ): Promise<string> {
    try {
      // Verificar se o arquivo PDF existe
      if (!fs.existsSync(pdfPath)) {
        throw new BadRequestException(`Arquivo PDF não encontrado: ${pdfPath}`);
      }

      // Ler o PDF original
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes);

      // Converter assinatura base64 para bytes
      const signatureImageBytes = Buffer.from(
        signatureBase64.replace(/^data:image\/\w+;base64,/, ''),
        'base64',
      );

      // Adicionar a imagem da assinatura ao PDF
      let signatureImage;
      try {
        signatureImage = await pdfDoc.embedPng(signatureImageBytes);
      } catch (error) {
        // Tentar como JPEG se PNG falhar
        try {
          signatureImage = await pdfDoc.embedJpg(signatureImageBytes);
        } catch (jpegError) {
          this.logger.error('Erro ao processar imagem da assinatura', error);
          throw new BadRequestException(
            'Formato de imagem da assinatura inválido. Use PNG ou JPEG.',
          );
        }
      }

      // Obter a última página do PDF
      const pages = pdfDoc.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();

      // Tamanho da assinatura (ajustável)
      const signatureWidth = 150;
      const signatureHeight = 60;

      // Posição da assinatura (canto inferior direito com margem)
      const x = width - signatureWidth - 50;
      const y = 50;

      // Desenhar a assinatura na página
      lastPage.drawImage(signatureImage, {
        x,
        y,
        width: signatureWidth,
        height: signatureHeight,
      });

      // Adicionar linha de assinatura e data
      const fontSize = 10;
      const lineY = y - 15;
      const dateText = new Date().toLocaleDateString('pt-BR');

      // Linha para assinatura
      lastPage.drawLine({
        start: { x, y: lineY },
        end: { x: x + signatureWidth, y: lineY },
        thickness: 1,
        color: rgb(0, 0, 0),
      });

      // Data da assinatura
      lastPage.drawText(`Assinado em: ${dateText}`, {
        x,
        y: lineY - 15,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      // Salvar o PDF assinado
      const modifiedPdfBytes = await pdfDoc.save();

      // Criar diretório se não existir
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Salvar arquivo
      fs.writeFileSync(outputPath, modifiedPdfBytes);

      this.logger.log(`PDF assinado salvo em: ${outputPath}`);
      return outputPath;
    } catch (error) {
      this.logger.error(`Erro ao assinar PDF: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Valida se a string base64 é uma imagem válida
   */
  validateSignatureBase64(signatureBase64: string): boolean {
    if (!signatureBase64 || signatureBase64.trim() === '') {
      return false;
    }

    // Verificar se é base64 válido
    const base64Regex = /^data:image\/(png|jpeg|jpg);base64,/;
    return base64Regex.test(signatureBase64);
  }
}

