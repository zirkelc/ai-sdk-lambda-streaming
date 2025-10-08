import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  FunctionUrlAuthType,
  InvokeMode,
  Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { Construct } from 'constructs';
import 'dotenv/config';

export class AISDKChatStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const streamFunction = new NodejsFunction(this, 'aisdk-stream', {
      functionName: 'aisdk-stream',
      entry: 'src/functions/stream.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(60),
      memorySize: 1024,
      environment: {
        NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      },
      bundling: {
        format: OutputFormat.ESM,
        nodeModules: ['@smithy/eventstream-codec'],
      },
    });

    const streamFunctionUrl = streamFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      invokeMode: InvokeMode.RESPONSE_STREAM,
      cors: {
        allowedOrigins: Cors.ALL_ORIGINS,
      },
    });

    streamFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          'bedrock:InvokeModel',
          'bedrock:InvokeModelWithResponseStream',
        ],
        resources: [
          `arn:aws:bedrock:*:*:foundation-model/*`,
          `arn:aws:bedrock:*:*:inference-profile/*`,
        ],
      }),
    );

    new cdk.CfnOutput(this, 'FunctionUrl', {
      value: streamFunctionUrl.url,
    });
  }
}
