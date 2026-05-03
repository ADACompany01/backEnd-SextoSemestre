import { Injectable } from '@nestjs/common';
import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import { execSync } from 'child_process';

// O pacote 'chromium' (npm) não é mais usado para o caminho
// import chromium from 'chromium'; // <--- REMOVIDO OU IGNORADO

@Injectable()
export class LighthouseService {
  /**
   * Tenta encontrar o caminho do Chromium executando comandos do sistema
   */
  private findChromiumPath(): string | null {
    try {
      // Tentar usar 'which' ou 'command -v' para encontrar o Chromium
      const commands = [
        'which chromium-browser',
        'which chromium',
        'command -v chromium-browser',
        'command -v chromium',
      ];
      
      for (const cmd of commands) {
        try {
          const result = execSync(cmd, { 
            encoding: 'utf-8', 
            stdio: ['ignore', 'pipe', 'ignore'],
            timeout: 5000 // Timeout de 5 segundos
          }).trim();
          
          if (result && fs.existsSync(result)) {
            // Verificar se é um arquivo ou link simbólico válido
            try {
              const stats = fs.statSync(result);
              if (stats.isFile() || stats.isSymbolicLink()) {
                // Se for link simbólico, tentar resolver
                const resolvedPath = stats.isSymbolicLink() 
                  ? fs.readlinkSync(result) 
                  : result;
                
                console.log(`[LighthouseService] Chromium encontrado via comando do sistema: ${result}${stats.isSymbolicLink() ? ` (link para: ${resolvedPath})` : ''}`);
                return result;
              }
            } catch (statError) {
              // Continuar tentando outros comandos
              continue;
            }
          }
        } catch (e) {
          // Comando falhou, tentar próximo
          continue;
        }
      }
      
      // Tentar procurar manualmente em diretórios comuns
      const commonDirs = ['/usr/bin', '/usr/local/bin', '/opt/chromium'];
      for (const dir of commonDirs) {
        try {
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            const chromiumFiles = files.filter(f => 
              f.includes('chromium') && !f.includes('.so')
            );
            
            for (const file of chromiumFiles) {
              const fullPath = require('path').join(dir, file);
              try {
                const stats = fs.statSync(fullPath);
                if (stats.isFile() && (stats.mode & parseInt('111', 8)) !== 0) {
                  console.log(`[LighthouseService] Chromium encontrado via busca manual: ${fullPath}`);
                  return fullPath;
                }
              } catch (e) {
                continue;
              }
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.warn(`[LighthouseService] Erro ao tentar encontrar Chromium via comandos do sistema: ${error.message}`);
      return null;
    }
  }
  /**
   * Verifica a saúde do serviço Lighthouse (se o Chromium está disponível)
   */
  async checkHealth() {
    // Tentar encontrar o Chromium em vários caminhos possíveis
    // No Alpine Linux, o Chromium pode estar em diferentes locais
    const possiblePaths = [
      process.env.CHROME_PATH,
      process.env.CHROME_BIN,
      process.env.PUPPETEER_EXECUTABLE_PATH,
      // Buscar dinamicamente via comandos do sistema
      this.findChromiumPath(),
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      // Caminhos alternativos no Alpine
      '/usr/bin/chromium/chrome',
      '/opt/chromium/chromium',
    ].filter(Boolean) as string[];

    let CHROME_EXECUTABLE_PATH = possiblePaths[0] || '/usr/bin/chromium';
    
    // Procurar o Chromium nos caminhos possíveis
    for (const path of possiblePaths) {
      if (path && fs.existsSync(path)) {
        CHROME_EXECUTABLE_PATH = path;
        break;
      }
    }
    
    try {
      // Verificar se o Chromium existe
      const chromiumExists = fs.existsSync(CHROME_EXECUTABLE_PATH);
      
      if (!chromiumExists) {
        // Listar caminhos possíveis para debug
        const checkedPaths = possiblePaths.map(p => ({ path: p, exists: fs.existsSync(p) }));
        return {
          chromium: {
            available: false,
            path: CHROME_EXECUTABLE_PATH,
            checkedPaths,
            error: 'Chromium não encontrado em nenhum dos caminhos verificados',
          },
        };
      }

      // Tentar iniciar o Chrome brevemente para verificar se funciona
      try {
        const chromeLauncherModule = await import('chrome-launcher');
        const chromeLauncher = chromeLauncherModule.default || chromeLauncherModule;
        
        const chrome = await chromeLauncher.launch({
          chromePath: CHROME_EXECUTABLE_PATH,
          chromeFlags: [
            '--headless',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
          ],
        });
        
        await chrome.kill();
        
        return {
          chromium: {
            available: true,
            path: CHROME_EXECUTABLE_PATH,
            version: 'OK',
          },
        };
      } catch (error) {
        return {
          chromium: {
            available: false,
            path: CHROME_EXECUTABLE_PATH,
            error: error.message || 'Erro ao iniciar Chromium',
          },
        };
      }
    } catch (error) {
      return {
        chromium: {
          available: false,
          path: CHROME_EXECUTABLE_PATH,
          error: error.message || 'Erro desconhecido',
        },
      };
    }
  }

  /**
   * Valida se a URL está acessível antes de executar o Lighthouse
   * Retorna rapidamente (timeout de 5 segundos) para evitar espera desnecessária
   */
  private async validateUrlAccessibility(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const timeout = 5000; // 5 segundos
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const request = client.get(url, { timeout }, (response) => {
          // Qualquer resposta (mesmo erro 404) significa que o site está acessível
          resolve(response.statusCode !== undefined);
          request.destroy();
        });

        request.on('error', () => {
          resolve(false);
        });

        request.on('timeout', () => {
          request.destroy();
          resolve(false);
        });

        // Timeout de segurança
        setTimeout(() => {
          if (!request.destroyed) {
            request.destroy();
          }
          resolve(false);
        }, timeout);
      } catch (error) {
        // URL inválida ou outro erro
        resolve(false);
      }
    });
  }

  async runLighthouse(url: string) {
    console.log(`[LighthouseService] Iniciando análise para: ${url}`);
    
    // Validação prévia rápida da URL (5 segundos máximo)
    console.log(`[LighthouseService] Validando acessibilidade da URL...`);
    const isAccessible = await this.validateUrlAccessibility(url);
    
    if (!isAccessible) {
      console.error(`[LighthouseService] URL não acessível: ${url}`);
      throw new Error(`A URL "${url}" não pôde ser acessada. Verifique se o endereço está correto e se o site está online.`);
    }
    console.log(`[LighthouseService] URL validada com sucesso`);
    
    // Tentar encontrar o Chromium em vários caminhos possíveis
    // No Alpine Linux, o Chromium pode estar em diferentes locais
    
    // Primeiro, tentar buscar dinamicamente via comandos do sistema
    const dynamicPath = this.findChromiumPath();
    
    const possiblePaths = [
      process.env.CHROME_PATH,
      process.env.CHROME_BIN,
      process.env.PUPPETEER_EXECUTABLE_PATH,
      dynamicPath, // Buscar dinamicamente via comandos do sistema
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      // Caminhos alternativos no Alpine
      '/usr/bin/chromium/chrome',
      '/opt/chromium/chromium',
    ].filter(Boolean) as string[];

    let CHROME_EXECUTABLE_PATH: string | null = null;
    
    // Procurar o Chromium nos caminhos possíveis
    console.log(`[LighthouseService] Procurando Chromium nos caminhos: ${possiblePaths.join(', ')}`);
    for (const path of possiblePaths) {
      if (path && fs.existsSync(path)) {
        // Verificar se é um arquivo executável
        try {
          const stats = fs.statSync(path);
          if (stats.isFile() && (stats.mode & parseInt('111', 8)) !== 0) {
            CHROME_EXECUTABLE_PATH = path;
            console.log(`[LighthouseService] Chromium encontrado e é executável em: ${CHROME_EXECUTABLE_PATH}`);
            break;
          }
        } catch (statError) {
          // Se não conseguir verificar permissões, ainda pode tentar usar
          CHROME_EXECUTABLE_PATH = path;
          console.log(`[LighthouseService] Chromium encontrado em: ${CHROME_EXECUTABLE_PATH} (permissões não verificadas)`);
          break;
        }
      }
    }
    
    // Verificar se o Chromium foi encontrado
    if (!CHROME_EXECUTABLE_PATH || !fs.existsSync(CHROME_EXECUTABLE_PATH)) {
      const checkedPaths = possiblePaths.map(p => ({ 
        path: p, 
        exists: p ? fs.existsSync(p) : false 
      }));
      console.error(`[LighthouseService] Chromium não encontrado em nenhum dos caminhos:`, JSON.stringify(checkedPaths, null, 2));
      
      // Tentar listar o que existe em /usr/bin para debug
      try {
        const usrBinFiles = fs.readdirSync('/usr/bin').filter(f => f.includes('chrom'));
        console.error(`[LighthouseService] Arquivos relacionados ao chromium em /usr/bin:`, usrBinFiles);
        
        // Se encontrar chromium-browser mas não chromium, tentar criar link simbólico
        if (usrBinFiles.includes('chromium-browser') && !usrBinFiles.includes('chromium')) {
          console.log(`[LighthouseService] Tentando criar link simbólico em runtime...`);
          try {
            execSync('ln -sf /usr/bin/chromium-browser /usr/bin/chromium', { 
              encoding: 'utf-8',
              stdio: 'pipe'
            });
            // Verificar se o link foi criado
            if (fs.existsSync('/usr/bin/chromium')) {
              CHROME_EXECUTABLE_PATH = '/usr/bin/chromium';
              console.log(`[LighthouseService] Link simbólico criado com sucesso em runtime!`);
            }
          } catch (linkError: any) {
            console.error(`[LighthouseService] Erro ao criar link simbólico:`, linkError?.message || linkError);
          }
        }
      } catch (e: any) {
        console.error(`[LighthouseService] Não foi possível ler /usr/bin:`, e?.message || e);
      }
      
      // Se ainda não encontrou, tentar buscar novamente
      if (!CHROME_EXECUTABLE_PATH || !fs.existsSync(CHROME_EXECUTABLE_PATH)) {
        const retryPath = this.findChromiumPath();
        if (retryPath && fs.existsSync(retryPath)) {
          CHROME_EXECUTABLE_PATH = retryPath;
          console.log(`[LighthouseService] Chromium encontrado na segunda tentativa: ${CHROME_EXECUTABLE_PATH}`);
        }
      }
      
      // Última tentativa: verificar se o arquivo existe mesmo que não tenha sido encontrado
      if (!CHROME_EXECUTABLE_PATH || !fs.existsSync(CHROME_EXECUTABLE_PATH)) {
        throw new Error(`Chromium não encontrado. Caminhos verificados: ${possiblePaths.filter(Boolean).join(', ')}`);
      }
    }
    
    // Garantir que o caminho seja absoluto
    CHROME_EXECUTABLE_PATH = require('path').resolve(CHROME_EXECUTABLE_PATH);
    console.log(`[LighthouseService] Usando Chromium em: ${CHROME_EXECUTABLE_PATH}`);
    
    // Verificação final antes de passar para o chrome-launcher
    if (!fs.existsSync(CHROME_EXECUTABLE_PATH)) {
      console.error(`[LighthouseService] ERRO CRÍTICO: Caminho do Chromium não existe após resolução: ${CHROME_EXECUTABLE_PATH}`);
      // Como último recurso, tentar usar o chrome-launcher sem especificar o caminho
      console.warn(`[LighthouseService] Tentando usar chrome-launcher sem especificar caminho (busca automática)...`);
      CHROME_EXECUTABLE_PATH = null; // Será undefined para o chrome-launcher usar busca automática
    }
    
    let chrome: any = null;

    try {
      console.log(`[LighthouseService] Iniciando Chrome Launcher...`);
      // Importação dinâmica do chrome-launcher (ES Module)
      const chromeLauncherModule = await import('chrome-launcher');
      const chromeLauncher = chromeLauncherModule.default || chromeLauncherModule;
      
      // Configurar opções do chrome-launcher
      const launchOptions: any = {
        logLevel: 'silent', // Reduzir logs do chrome-launcher
        chromeFlags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-extensions',
          '--disable-background-networking',
          '--disable-sync',
          '--disable-translate',
          '--hide-scrollbars',
          '--mute-audio',
          '--no-first-run',
          '--disable-default-apps',
          '--disable-software-rasterizer',
          '--disable-setuid-sandbox',
          '--single-process', // Importante para ambientes com poucos recursos
        ],
      };
      
      // Verificação final antes de lançar - se o caminho não existir, remover e deixar busca automática
      if (CHROME_EXECUTABLE_PATH && fs.existsSync(CHROME_EXECUTABLE_PATH)) {
        launchOptions.chromePath = CHROME_EXECUTABLE_PATH;
        console.log(`[LighthouseService] Iniciando Chrome Launcher com caminho específico: ${CHROME_EXECUTABLE_PATH}`);
      } else {
        console.warn(`[LighthouseService] Caminho do Chromium não especificado ou inválido. Tentando última busca antes de usar busca automática...`);
        // Tentar mais uma vez encontrar o Chromium
        const lastAttempt = this.findChromiumPath();
        if (lastAttempt && fs.existsSync(lastAttempt)) {
          launchOptions.chromePath = lastAttempt;
          console.log(`[LighthouseService] Chromium encontrado no último momento: ${lastAttempt}`);
        } else {
          // Não definir chromePath - o chrome-launcher vai tentar encontrar automaticamente
          console.warn(`[LighthouseService] Deixando chrome-launcher encontrar Chromium automaticamente (sem especificar caminho)...`);
        }
      }
      
      // Verificação de segurança final: se o caminho foi especificado, garantir que existe
      if (launchOptions.chromePath && !fs.existsSync(launchOptions.chromePath)) {
        console.error(`[LighthouseService] Caminho especificado não existe: ${launchOptions.chromePath}. Removendo e usando busca automática.`);
        delete launchOptions.chromePath;
      }
      
      chrome = await chromeLauncher.launch(launchOptions);
      console.log(`[LighthouseService] Chrome iniciado com sucesso na porta: ${chrome.port}`);
    } catch (error) {
      const errorMessage = error.message || error.toString();
      console.error(`[LighthouseService] Erro ao iniciar Chrome:`, errorMessage);
      if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) {
        throw new Error(`Chromium não encontrado no caminho: ${CHROME_EXECUTABLE_PATH}. Verifique a instalação do Chromium no container.`);
      }
      throw new Error(`Erro ao iniciar o Chrome: ${errorMessage}`);
    }

    const options: any = {
      logLevel: 'error', // Reduzir logs para apenas erros
      output: 'json',
      port: chrome.port,
      onlyCategories: ['accessibility'],
      locale: 'pt-BR',
      maxWaitForLoad: 15000, // Aumentado para 15 segundos para sites mais lentos
      maxWaitForFcp: 10000, // Timeout para First Contentful Paint aumentado
      throttling: {
        rttMs: 40, // Reduzir latência simulada
        throughputKbps: 10240, // Aumentar throughput
        cpuSlowdownMultiplier: 1, // Sem desaceleração de CPU
      },
      skipAudits: [
        // Pular auditorias que não são essenciais para acessibilidade
        'uses-http2',
        'uses-long-cache-ttl',
        'total-byte-weight',
        'dom-size',
      ],
    };

    try {
      console.log(`[LighthouseService] Executando Lighthouse...`);
      // Importação dinâmica do Lighthouse (ES Module)
      const lighthouseModule = await import('lighthouse');
      const lighthouse = lighthouseModule.default;
      
      if (typeof lighthouse !== 'function') {
        throw new Error('Função lighthouse não encontrada no módulo');
      }
      
      // Timeout total de 45 segundos para a execução do Lighthouse (reduzido para evitar timeout do proxy)
      const lighthouseStartTime = Date.now();
      const lighthousePromise = lighthouse(url, options);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: A análise do Lighthouse excedeu o tempo limite de 45 segundos'));
        }, 45000); // Reduzido para 45 segundos
      });
      
      const runnerResult = await Promise.race([lighthousePromise, timeoutPromise]) as any;
      const lighthouseDuration = Date.now() - lighthouseStartTime;
      console.log(`[LighthouseService] Lighthouse executado com sucesso em ${lighthouseDuration}ms`);
      const reportJson = Array.isArray(runnerResult.report) 
        ? runnerResult.report[0] 
        : runnerResult.report;
      const reportObject = JSON.parse(reportJson as string);
      await chrome.kill();
      
      // Verificar detalhes da navegação (sem logs excessivos)
      const finalUrl = reportObject.finalDisplayedUrl || reportObject.finalUrl || reportObject.requestedUrl;
      const runtimeError = reportObject.runtimeError;
      
      // Se há erro de runtime ou URL final é chrome-error, significa que não conseguiu acessar
      if (runtimeError || 
          (finalUrl && finalUrl.includes('chrome-error://')) ||
          (finalUrl && finalUrl.includes('data:text/html')) ||
          reportObject.categories.accessibility.score === null) {
        throw new Error(`A URL "${url}" não pôde ser acessada. Verifique se o endereço está correto e se o site está online.`);
      }
      
      const auditsArray = Object.values(reportObject.audits) as any[];
      const reprovadas = auditsArray.filter(a => a.score === 0);
      const aprovadas = auditsArray.filter(a => a.score === 1);
      const manuais = auditsArray.filter(a => a.score === null && a.scoreDisplayMode === 'manual');
      const naoAplicaveis = auditsArray.filter(a => a.scoreDisplayMode === 'notApplicable');
      
      // Verificar se retornou dados válidos (se tudo está vazio, algo deu errado)
      if (reprovadas.length === 0 && aprovadas.length === 0 && manuais.length === 0) {
        throw new Error(`A URL "${url}" não pôde ser acessada. Verifique se o endereço está correto e se o site está online.`);
      }
      
      return {
        notaAcessibilidade: reportObject.categories.accessibility.score * 100,
        reprovadas,
        aprovadas,
        manuais,
        naoAplicaveis
      };
    } catch (error) {
      // Garantir que o Chrome seja fechado mesmo em caso de erro
      if (chrome) {
        try {
          await chrome.kill();
        } catch (killError) {
          // Ignorar erros ao matar o Chrome
        }
      }
      
      // Identificar tipo de erro
      const errorMessage = error.message || error.toString();
      
      // Erros de timeout
      if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
        throw new Error(`A análise do site demorou muito tempo. Tente novamente ou verifique se o site está acessível.`);
      }
      
      // Erros comuns de URL inacessível
      if (errorMessage.includes('ENOTFOUND') || 
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('net::ERR_NAME_NOT_RESOLVED') ||
          errorMessage.includes('ERR_CONNECTION')) {
        throw new Error(`A URL "${url}" não pôde ser acessada. Verifique se o endereço está correto e se o site está online.`);
      }
      
      // Erros relacionados ao Chrome/Chromium
      if (errorMessage.includes('ENOENT') || 
          errorMessage.includes('not found') ||
          errorMessage.includes('No usable sandbox') ||
          errorMessage.includes('Chromium')) {
        throw new Error(`Erro na configuração do navegador. Entre em contato com o suporte técnico.`);
      }
      
      // Outros erros - mensagem genérica sem mencionar Lighthouse
      throw new Error(`Não foi possível analisar o site. Verifique se a URL está correta e tente novamente.`);
    }
  }
}