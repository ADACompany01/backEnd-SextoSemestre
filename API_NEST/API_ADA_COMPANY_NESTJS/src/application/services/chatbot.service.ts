import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatbotOption {
  id: string;
  label: string;
  description: string;
  nextNodeId: string;
}

export interface ChatbotNode {
  id: string;
  title: string;
  message: string;
  category?: string;
  options: ChatbotOption[];
  action?: {
    type: 'navigate' | 'handoff' | 'finish';
    label: string;
    url?: string;
  };
}

export interface ChatbotReply {
  node: ChatbotNode;
  breadcrumb: string[];
}

export interface ChatbotLlmMessage {
  message: string;
  contextTitle?: string;
  history?: Array<{
    author: string;
    text: string;
  }>;
}

export interface ChatbotLlmReply {
  text: string;
  model: string;
  provider: 'openai';
}

interface OpenAIResponsePayload {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
}

const ADA_COMPANY_CONTEXT = `
Empresa: AdaCompany.
Personagem: Ada, assistente virtual da AdaCompany.
Atuacao: desenvolvimento de sites acessiveis, sistemas, area do cliente, orcamentos, contratos, suporte, manutencao, integracoes e orientacao em acessibilidade digital.
Tom: acolhedor, claro, objetivo e profissional.
Orientacao: responda em portugues do Brasil, como Ada falando diretamente com o cliente. Faca no maximo uma pergunta por resposta quando precisar de mais dados. Nao invente valores, prazos fechados, contratos ou politicas. Quando o cliente pedir orcamento, colete tipo de projeto, objetivo, prazo, recursos desejados e contato. Quando o assunto exigir decisao comercial ou suporte humano, explique que a equipe pode assumir depois com o contexto.
`;

const CHATBOT_NODES: Record<string, ChatbotNode> = {
  inicio: {
    id: 'inicio',
    title: 'Inicio',
    message: 'Ola! Como posso ajudar voce hoje?',
    options: [
      {
        id: 'site',
        label: '1 - Site',
        description: 'Quero um site para meu negocio',
        nextNodeId: 'site',
      },
      {
        id: 'orcamento',
        label: '2 - Orcamento',
        description: 'Quero solicitar um orcamento',
        nextNodeId: 'orcamento',
      },
      {
        id: 'sistema',
        label: '3 - Sistema',
        description: 'Quero informacoes sobre o sistema',
        nextNodeId: 'sistema',
      },
      {
        id: 'outras-funcoes',
        label: '4 - Outras funcoes',
        description: 'Quero saber sobre outras funcoes',
        nextNodeId: 'outras-funcoes',
      },
      {
        id: 'atendente',
        label: '5 - Falar com atendente',
        description: 'Quero falar com um atendente',
        nextNodeId: 'atendente',
      },
    ],
  },
  site: {
    id: 'site',
    title: 'Site',
    category: 'Sites',
    message:
      'Criamos sites acessiveis e responsivos. Escolha o assunto que melhor combina com sua duvida.',
    options: [
      {
        id: 'wcag',
        label: '1.1 - Conformidade WCAG',
        description: 'Quero um site acessivel conforme as diretrizes WCAG',
        nextNodeId: 'wcag',
      },
      {
        id: 'tipos-site',
        label: '1.2 - Tipos de Site',
        description: 'Quero conhecer os tipos de sites que voces criam',
        nextNodeId: 'tipos-site',
      },
      {
        id: 'recursos-site',
        label: '1.3 - Recursos Inclusos',
        description: 'Quero saber o que esta incluido nos sites',
        nextNodeId: 'recursos-site',
      },
    ],
  },
  orcamento: {
    id: 'orcamento',
    title: 'Orcamento',
    category: 'Orcamentos',
    message:
      'Posso te direcionar para informar os dados do projeto ou para solicitar uma proposta personalizada.',
    options: [
      {
        id: 'informar-dados',
        label: '2.1 - Informar Dados',
        description: 'Vou informar os dados do meu projeto',
        nextNodeId: 'informar-dados',
      },
      {
        id: 'enviar-orcamento',
        label: '2.2 - Enviar Orcamento',
        description: 'Quero receber uma proposta personalizada',
        nextNodeId: 'enviar-orcamento',
      },
    ],
  },
  sistema: {
    id: 'sistema',
    title: 'Sistema',
    category: 'Sistemas',
    message:
      'Aqui voce encontra informacoes sobre funcionamento, planos, recursos e duvidas tecnicas.',
    options: [
      {
        id: 'sobre-sistema',
        label: '3.1 - Sobre o Sistema',
        description: 'Quero entender como o sistema funciona',
        nextNodeId: 'sobre-sistema',
      },
      {
        id: 'planos-recursos',
        label: '3.2 - Planos e Recursos',
        description: 'Quero conhecer os planos e recursos disponiveis',
        nextNodeId: 'planos-recursos',
      },
      {
        id: 'duvidas-tecnicas',
        label: '3.3 - Duvidas Tecnicas',
        description: 'Tenho duvidas sobre o uso ou funcionamento',
        nextNodeId: 'duvidas-tecnicas',
      },
    ],
  },
  'outras-funcoes': {
    id: 'outras-funcoes',
    title: 'Outras Funcoes',
    category: 'Suporte',
    message:
      'Tambem posso ajudar com suporte, treinamentos, tutoriais, integracoes e recursos adicionais.',
    options: [
      {
        id: 'manutencao-suporte',
        label: '4.1 - Manutencao e Suporte',
        description: 'Preciso de suporte ou manutencao',
        nextNodeId: 'manutencao-suporte',
      },
      {
        id: 'treinamentos',
        label: '4.2 - Treinamentos e Tutoriais',
        description: 'Quero aprender mais com treinamentos e tutoriais',
        nextNodeId: 'treinamentos',
      },
      {
        id: 'integracoes',
        label: '4.3 - Integracoes e Recursos',
        description: 'Quero saber sobre integracoes e recursos extras',
        nextNodeId: 'integracoes',
      },
    ],
  },
  atendente: {
    id: 'atendente',
    title: 'Falar com Atendente',
    category: 'Atendimento',
    message:
      'Vou te direcionar para um atendente especializado. Se preferir, faca login para acompanhar seus pedidos pelo painel.',
    options: [],
    action: { type: 'handoff', label: 'Ir para login', url: '/signin' },
  },
  wcag: {
    id: 'wcag',
    title: 'Conformidade WCAG',
    message:
      'A WCAG organiza a acessibilidade em niveis A, AA e AAA. Recomendamos AA para a maioria dos sites e avaliamos criterios como contraste, navegacao por teclado, textos alternativos e estrutura semantica.',
    options: [],
    action: { type: 'finish', label: 'Encerrar atendimento' },
  },
  'tipos-site': {
    id: 'tipos-site',
    title: 'Tipos de Site',
    message:
      'Desenvolvemos sites institucionais, portfolios, blogs, landing pages, paginas de servicos e experiencias acessiveis para diferentes publicos.',
    options: [],
    action: { type: 'navigate', label: 'Ver exemplos', url: '/projects' },
  },
  'recursos-site': {
    id: 'recursos-site',
    title: 'Recursos Inclusos',
    message:
      'Os projetos podem incluir layout responsivo, boas praticas de acessibilidade, conteudo estruturado, formularios, integracoes, publicacao e suporte inicial.',
    options: [],
    action: {
      type: 'navigate',
      label: 'Solicitar orcamento',
      url: '/signuporcamento',
    },
  },
  'informar-dados': {
    id: 'informar-dados',
    title: 'Informar Dados',
    message:
      'Para montar seu orcamento, informe tipo de projeto, objetivo, publico, prazo, recursos desejados e dados de contato.',
    options: [],
    action: {
      type: 'navigate',
      label: 'Preencher orcamento',
      url: '/signuporcamento',
    },
  },
  'enviar-orcamento': {
    id: 'enviar-orcamento',
    title: 'Enviar Orcamento',
    message:
      'Vamos preparar uma proposta personalizada com base nas necessidades do seu projeto.',
    options: [],
    action: {
      type: 'navigate',
      label: 'Solicitar proposta',
      url: '/signuporcamento',
    },
  },
  'sobre-sistema': {
    id: 'sobre-sistema',
    title: 'Sobre o Sistema',
    message:
      'O sistema da AdaCompany centraliza solicitacoes, orcamentos, contratos e acompanhamento de projetos em um painel para clientes e equipe.',
    options: [],
    action: { type: 'navigate', label: 'Acessar painel', url: '/signin' },
  },
  'planos-recursos': {
    id: 'planos-recursos',
    title: 'Planos e Recursos',
    message:
      'Os planos variam conforme escopo, funcionalidades, integracoes, nivel de suporte e necessidades de acessibilidade do projeto.',
    options: [],
    action: {
      type: 'navigate',
      label: 'Solicitar proposta',
      url: '/signuporcamento',
    },
  },
  'duvidas-tecnicas': {
    id: 'duvidas-tecnicas',
    title: 'Duvidas Tecnicas',
    message:
      'Podemos ajudar com duvidas de uso, funcionamento, acessibilidade, desempenho, integracoes e manutencao.',
    options: [],
    action: { type: 'handoff', label: 'Falar com atendente', url: '/signin' },
  },
  'manutencao-suporte': {
    id: 'manutencao-suporte',
    title: 'Manutencao e Suporte',
    message:
      'Nosso suporte ajuda com ajustes, atualizacoes, correcao de problemas, melhoria de acessibilidade e acompanhamento tecnico.',
    options: [],
    action: { type: 'handoff', label: 'Solicitar suporte', url: '/signin' },
  },
  treinamentos: {
    id: 'treinamentos',
    title: 'Treinamentos e Tutoriais',
    message:
      'Oferecemos orientacoes para uso do sistema, boas praticas de conteudo acessivel e tutoriais para administrar seu projeto.',
    options: [],
    action: { type: 'finish', label: 'Encerrar atendimento' },
  },
  integracoes: {
    id: 'integracoes',
    title: 'Integracoes e Recursos',
    message:
      'Avaliamos integracoes com formularios, automacoes, ferramentas externas, area do cliente e recursos especificos do seu negocio.',
    options: [],
    action: {
      type: 'navigate',
      label: 'Solicitar integracao',
      url: '/signuporcamento',
    },
  },
};

@Injectable()
export class ChatbotService {
  constructor(private readonly configService: ConfigService) {}

  getTree() {
    return {
      rootNodeId: 'inicio',
      nodes: CHATBOT_NODES,
    };
  }

  reply(nodeId = 'inicio', optionId?: string): ChatbotReply {
    const currentNode = CHATBOT_NODES[nodeId] ?? CHATBOT_NODES.inicio;
    const selectedOption = optionId
      ? currentNode.options.find((option) => option.id === optionId)
      : undefined;
    const nextNode = selectedOption
      ? CHATBOT_NODES[selectedOption.nextNodeId]
      : currentNode;

    return {
      node: nextNode ?? CHATBOT_NODES.inicio,
      breadcrumb: selectedOption
        ? [currentNode.title, selectedOption.label]
        : [currentNode.title],
    };
  }

  async replyWithLlm(payload: ChatbotLlmMessage): Promise<ChatbotLlmReply> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    const model =
      this.configService.get<string>('OPENAI_CHATBOT_MODEL') || 'gpt-5.1';

    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OPENAI_API_KEY nao configurada no backend',
      );
    }

    const history = (payload.history || [])
      .slice(-8)
      .map((message) => `${message.author}: ${message.text}`)
      .join('\n');

    const context = payload.contextTitle
      ? `Contexto atual da conversa guiada: ${payload.contextTitle}.`
      : 'Contexto atual da conversa guiada: contato geral.';

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        instructions: ADA_COMPANY_CONTEXT,
        input: [
          context,
          history ? `Historico recente:\n${history}` : 'Sem historico recente.',
          `Mensagem do cliente: ${payload.message}`,
        ].join('\n\n'),
      }),
    });

    const result = (await response.json()) as OpenAIResponsePayload;

    if (!response.ok) {
      throw new BadGatewayException(
        result.error?.message || 'Falha ao consultar a OpenAI',
      );
    }

    const text =
      result.output_text ||
      result.output
        ?.flatMap((item) => item.content || [])
        .map((content) => content.text)
        .filter(Boolean)
        .join('\n')
        .trim();

    if (!text) {
      throw new BadGatewayException('A OpenAI nao retornou texto para a Ada');
    }

    return {
      text,
      model,
      provider: 'openai',
    };
  }
}
