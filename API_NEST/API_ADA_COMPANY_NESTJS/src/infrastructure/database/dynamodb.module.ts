import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DynamoDBClient',
      useFactory: async (configService: ConfigService) => {
        const client = new DynamoDBClient({
          region: configService.get<string>('AWS_REGION') || 'us-east-1',
          credentials: {
            accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID') || '',
            secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
          },
        });

        return DynamoDBDocumentClient.from(client);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DynamoDBClient'],
})
export class DynamoDBModule {}
