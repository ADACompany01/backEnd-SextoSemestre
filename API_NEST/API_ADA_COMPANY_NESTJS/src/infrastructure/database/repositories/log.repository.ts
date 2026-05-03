import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  ScanCommand,
  DeleteCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { LogRepositoryInterface } from '../../../domain/repositories/log.repository.interface';
import { LogModel, CreateLogRequest, LogFilters, LogLevel } from '../../../domain/models/log.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LogRepository implements LogRepositoryInterface {
  private readonly tableName: string;

  constructor(
    @Inject('DynamoDBClient') private readonly dynamoClient: DynamoDBDocumentClient,
    private readonly configService: ConfigService,
  ) {
    this.tableName = this.configService.get<string>('DYNAMODB_TABLE_LOGS') || 'ada-company-logs';
  }

  async create(logData: CreateLogRequest): Promise<LogModel> {
    const now = new Date().toISOString();
    const id = uuidv4();
    const timestamp = logData.timestamp ? new Date(logData.timestamp).toISOString() : now;

    const logItem: LogModel = {
      id,
      timestamp,
      level: logData.level,
      message: logData.message,
      context: logData.context,
      userId: logData.userId,
      userEmail: logData.userEmail,
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      method: logData.method,
      url: logData.url,
      statusCode: logData.statusCode,
      responseTime: logData.responseTime,
      metadata: logData.metadata,
      createdAt: now,
      updatedAt: now,
    };

    await this.dynamoClient.send(new PutCommand({
      TableName: this.tableName,
      Item: logItem,
    }));

    return logItem;
  }

  async findById(id: string, timestamp: string): Promise<LogModel | null> {
    const result = await this.dynamoClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { id, timestamp },
    }));

    return result.Item as LogModel || null;
  }

  async findByFilters(filters: LogFilters): Promise<{
    logs: LogModel[];
    lastEvaluatedKey?: Record<string, any>;
  }> {
    let queryParams: any = {
      TableName: this.tableName,
      Limit: filters.limit || 100,
    };

    // Se temos um lastEvaluatedKey, use para paginação
    if (filters.lastEvaluatedKey) {
      queryParams.ExclusiveStartKey = filters.lastEvaluatedKey;
    }

    // Construir filtros de expressão
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (filters.level) {
      filterExpressions.push('#level = :level');
      expressionAttributeNames['#level'] = 'level';
      expressionAttributeValues[':level'] = filters.level;
    }

    if (filters.context) {
      filterExpressions.push('#context = :context');
      expressionAttributeNames['#context'] = 'context';
      expressionAttributeValues[':context'] = filters.context;
    }

    if (filters.userId) {
      filterExpressions.push('#userId = :userId');
      expressionAttributeNames['#userId'] = 'userId';
      expressionAttributeValues[':userId'] = filters.userId;
    }

    if (filters.userEmail) {
      filterExpressions.push('#userEmail = :userEmail');
      expressionAttributeNames['#userEmail'] = 'userEmail';
      expressionAttributeValues[':userEmail'] = filters.userEmail;
    }

    if (filters.startDate || filters.endDate) {
      if (filters.startDate) {
        filterExpressions.push('#timestamp >= :startDate');
        expressionAttributeNames['#timestamp'] = 'timestamp';
        expressionAttributeValues[':startDate'] = filters.startDate;
      }
      if (filters.endDate) {
        filterExpressions.push('#timestamp <= :endDate');
        expressionAttributeNames['#timestamp'] = 'timestamp';
        expressionAttributeValues[':endDate'] = filters.endDate;
      }
    }

    if (filterExpressions.length > 0) {
      queryParams.FilterExpression = filterExpressions.join(' AND ');
      queryParams.ExpressionAttributeNames = expressionAttributeNames;
      queryParams.ExpressionAttributeValues = expressionAttributeValues;
    }

    // Usar Scan para consultas complexas
    const result = await this.dynamoClient.send(new ScanCommand(queryParams));

    return {
      logs: result.Items as LogModel[] || [],
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  }

  async findByUserId(userId: string, limit: number = 100, lastEvaluatedKey?: Record<string, any>): Promise<{
    logs: LogModel[];
    lastEvaluatedKey?: Record<string, any>;
  }> {
    return this.findByFilters({ userId, limit, lastEvaluatedKey });
  }

  async findByLevel(level: string, limit: number = 100, lastEvaluatedKey?: Record<string, any>): Promise<{
    logs: LogModel[];
    lastEvaluatedKey?: Record<string, any>;
  }> {
    return this.findByFilters({ level: level as LogLevel, limit, lastEvaluatedKey });
  }

  async findByDateRange(startDate: string, endDate: string, limit: number = 100, lastEvaluatedKey?: Record<string, any>): Promise<{
    logs: LogModel[];
    lastEvaluatedKey?: Record<string, any>;
  }> {
    return this.findByFilters({ startDate, endDate, limit, lastEvaluatedKey });
  }

  async deleteOldLogs(olderThan: string): Promise<number> {
    // Buscar logs antigos
    const result = await this.findByFilters({
      endDate: olderThan,
      limit: 1000, // DynamoDB tem limite de 25 itens por batch
    });

    if (result.logs.length === 0) {
      return 0;
    }

    // Deletar em lotes
    const deleteRequests = result.logs.map(log => ({
      DeleteRequest: {
        Key: { id: log.id, timestamp: log.timestamp },
      },
    }));

    await this.dynamoClient.send(new BatchWriteCommand({
      RequestItems: {
        [this.tableName]: deleteRequests,
      },
    }));

    return result.logs.length;
  }

  async getLogStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byContext: Record<string, number>;
  }> {
    // Scan para obter estatísticas
    const result = await this.dynamoClient.send(new ScanCommand({
      TableName: this.tableName,
      Select: 'ALL_ATTRIBUTES',
    }));

    const logs = result.Items as LogModel[] || [];
    
    const stats = {
      total: logs.length,
      byLevel: {} as Record<string, number>,
      byContext: {} as Record<string, number>,
    };

    logs.forEach(log => {
      // Contar por nível
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      
      // Contar por contexto
      if (log.context) {
        stats.byContext[log.context] = (stats.byContext[log.context] || 0) + 1;
      }
    });

    return stats;
  }
}
