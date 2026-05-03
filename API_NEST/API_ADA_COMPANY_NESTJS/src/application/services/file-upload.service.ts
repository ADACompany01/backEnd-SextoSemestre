import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Tipo para arquivo do Multer
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Criar diretórios de upload se não existirem
    this.ensureUploadDirectories();
  }

  /**
   * Garante que os diretórios de upload existam
   */
  private ensureUploadDirectories(): void {
    const directories = [
      this.uploadsDir,
      path.join(this.uploadsDir, 'orcamentos'),
      path.join(this.uploadsDir, 'contratos'),
      path.join(this.uploadsDir, 'contratos-assinados'),
    ];

    directories.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.logger.log(`Diretório criado: ${dir}`);
      }
    });
  }

  /**
   * Valida se o arquivo é um PDF
   */
  validatePDFFile(file: MulterFile): void {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Apenas arquivos PDF são permitidos');
    }

    // Limite de 10MB
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Arquivo muito grande. Tamanho máximo: 10MB');
    }
  }

  /**
   * Salva um arquivo PDF
   * @param file - Arquivo do multer
   * @param category - Categoria do arquivo ('orcamento' | 'contrato')
   * @param entityId - ID da entidade (orcamento ou contrato)
   * @returns Caminho relativo do arquivo salvo
   */
  async savePDFFile(
    file: MulterFile,
    category: 'orcamento' | 'contrato',
    entityId: string,
  ): Promise<string> {
    this.validatePDFFile(file);

    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.originalname) || '.pdf';
    const fileName = `${category}_${entityId}_${uuidv4()}${fileExtension}`;
    
    // Determinar diretório baseado na categoria
    const categoryDir = category === 'orcamento' ? 'orcamentos' : 'contratos';
    const targetDir = path.join(this.uploadsDir, categoryDir);
    
    // Garantir que o diretório existe
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Caminho completo do arquivo
    const filePath = path.join(targetDir, fileName);

    // Salvar arquivo
    fs.writeFileSync(filePath, file.buffer);

    // Retornar caminho relativo (para facilitar migração para AWS)
    const relativePath = path.join('uploads', categoryDir, fileName);
    
    this.logger.log(`Arquivo salvo: ${relativePath}`);
    return relativePath;
  }

  /**
   * Obtém o caminho completo do arquivo
   */
  getFullPath(relativePath: string): string {
    return path.join(process.cwd(), relativePath);
  }

  /**
   * Verifica se um arquivo existe
   */
  fileExists(relativePath: string): boolean {
    const fullPath = this.getFullPath(relativePath);
    return fs.existsSync(fullPath);
  }

  /**
   * Remove um arquivo
   */
  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = this.getFullPath(relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      this.logger.log(`Arquivo removido: ${relativePath}`);
    }
  }

  /**
   * Lê um arquivo como buffer
   */
  readFile(relativePath: string): Buffer {
    const fullPath = this.getFullPath(relativePath);
    if (!fs.existsSync(fullPath)) {
      throw new BadRequestException(`Arquivo não encontrado: ${relativePath}`);
    }
    return fs.readFileSync(fullPath);
  }
}

