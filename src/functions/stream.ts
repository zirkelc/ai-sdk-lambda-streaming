import { pipeline } from 'node:stream/promises';
import { createAmazonBedrock, } from '@ai-sdk/amazon-bedrock';
import { fromNodeProviderChain } from '@aws-sdk/credential-providers';
import { streamText } from 'ai';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

const bedrock = createAmazonBedrock({
  region: 'us-east-1',
  credentialProvider: fromNodeProviderChain(),
});

export const handler = awslambda.streamifyResponse<APIGatewayProxyEventV2>(
  async (event, responseStream) => {

    if (event.rawPath === '/text') {
      responseStream.setContentType('text/plain; charset=utf-8');

      const result = streamText({
        model: bedrock('us.anthropic.claude-sonnet-4-5-20250929-v1:0'),
        prompt: 'Invent a new holiday and describe its traditions.',
      });

      await pipeline(result.textStream, responseStream);
      return;
    }

    responseStream.setContentType('text/plain; charset=utf-8');
    responseStream.end("Not Found");
  },
);
