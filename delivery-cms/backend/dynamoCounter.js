// delivery-cms/backend/dynamoCounter.js
require("dotenv").config();
const AWS = require("aws-sdk");

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const TABLE_NAME = "ClientCounter"; // Make sure this table exists in DynamoDB
const COUNTER_ID = "clientCounter";   // The primary key value for your counter

async function getNextClientNumber() {
  const params = {
    TableName: TABLE_NAME,
    Key: { counterId: COUNTER_ID },
    UpdateExpression: "SET currentValue = currentValue + :inc",
    ExpressionAttributeValues: {
      ":inc": 1,
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const result = await dynamoDb.update(params).promise();
    return result.Attributes.currentValue;
  } catch (err) {
    console.error("Error updating client counter:", err);
    throw err;
  }
}

module.exports = { getNextClientNumber };
