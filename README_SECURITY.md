# API Key Security Guide (AWS SSM)

To securely manage your API keys and avoid exposing them in your Chrome Extension, follow these steps:

## 1. Store your API Key in AWS SSM
Run this command from your terminal (ensure AWS CLI is configured):

```bash
aws ssm put-parameter \
    --name "/linkedin-assistant/groq-api-key" \
    --value "gsk_..." \
    --type "SecureString" \
    --overwrite
```

## 2. Deploy the AWS Lambda Proxy
We have created a template in `aws/lambda/index.mjs`.
1. Create a new Lambda in AWS.
2. Grant it `ssm:GetParameter` permission for the resource.
3. Deploy the code from `aws/lambda/index.mjs`.
4. Enable **Lambda Function URL** (or API Gateway) and set it to `auth: NONE` (Public) but handle your own logic check or use AWS_IAM if possible.

## 3. Update your Extension
In your `.env` file (or build process), set the `PROXY_ENDPOINT`:

```env
PROXY_ENDPOINT=https://your-lambda-url.lambda-url.us-east-1.on.aws/
```

The extension will now automatically route requests through your Lambda, which securely fetches the key from SSM on every call.

> [!TIP]
> This architecture prevents your API keys from being bundled into the extension and found by users.
