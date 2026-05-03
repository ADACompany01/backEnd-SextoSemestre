const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function createLogsTable() {
  const tableName = process.env.DYNAMODB_TABLE_LOGS || 'ada-company-logs';

  try {
    // Verificar se a tabela já existe
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`✅ Tabela ${tableName} já existe!`);
    return;
  } catch (error) {
    if (error.name !== 'ResourceNotFoundException') {
      throw error;
    }
  }

  const params = {
    TableName: tableName,
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH', // Partition key
      },
      {
        AttributeName: 'timestamp',
        KeyType: 'RANGE', // Sort key
      },
    ],
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S', // String
      },
      {
        AttributeName: 'timestamp',
        AttributeType: 'S', // String
      },
    ],
    BillingMode: 'PAY_PER_REQUEST', // On-demand billing
    GlobalSecondaryIndexes: [
      {
        IndexName: 'level-timestamp-index',
        KeySchema: [
          {
            AttributeName: 'level',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'timestamp',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
      },
      {
        IndexName: 'context-timestamp-index',
        KeySchema: [
          {
            AttributeName: 'context',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'timestamp',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
      },
      {
        IndexName: 'userId-timestamp-index',
        KeySchema: [
          {
            AttributeName: 'userId',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'timestamp',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
      },
    ],
  };

  // Adicionar definições de atributos para os GSI
  params.AttributeDefinitions.push(
    { AttributeName: 'level', AttributeType: 'S' },
    { AttributeName: 'context', AttributeType: 'S' },
    { AttributeName: 'userId', AttributeType: 'S' }
  );

  try {
    await client.send(new CreateTableCommand(params));
    console.log(`✅ Tabela ${tableName} criada com sucesso!`);
    console.log('📋 Configuração:');
    console.log(`   - Partition Key: id (String)`);
    console.log(`   - Sort Key: timestamp (String)`);
    console.log(`   - Billing Mode: Pay per request`);
    console.log(`   - GSI: level-timestamp-index, context-timestamp-index, userId-timestamp-index`);
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createLogsTable()
    .then(() => {
      console.log('🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro:', error);
      process.exit(1);
    });
}

module.exports = { createLogsTable };
