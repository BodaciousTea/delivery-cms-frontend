// src/cognitoConfig.ts
import { CognitoUserPool } from "amazon-cognito-identity-js";

export const poolData = {
  UserPoolId:
    import.meta.env.VITE_COGNITO_USER_POOL_ID || "us-east-2_gIQFxMRxj",
  ClientId:
    import.meta.env.VITE_COGNITO_APP_CLIENT_ID || "6fkkuhbvirj76kd3vrokvaqqag",
};

export const userPool = new CognitoUserPool(poolData);
