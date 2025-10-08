# AI SDK Streaming with AWS Lambda

Install dependencies:

```sh
pnpm install
```

Deploy the stack:

```sh
pnpm run deploy
```

The deployment will output the `FunctionUrl` for the Lambda function, that you can open in your browser.

Append `/text` to the URL to test the text streaming endpoint.