import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event, context) => {
  let body,tempBody,dataBody,requestedData;
  let tempBody2,dataBody2,dataBody3;
  let statusCode = 200;
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const connectionId = event.requestContext.connectionId;
  const callbackUrl = `https://${domain}/${stage}`;
  const client = new ApiGatewayManagementApiClient({ endpoint: callbackUrl });
  const headers = {
    "Content-Type": "application/json",
  };
  
  try {
    let tempGenreName = JSON.parse(event.body);
    const genreName = tempGenreName.data;
    let params = {
      TableName: "no_of_movies",
      FilterExpression: "genre = :genreName",
      ExpressionAttributeValues: {
          ":genreName": genreName
      }
    };
    tempBody = await dynamo.send(
      new ScanCommand(params)
    );
    
    dataBody = tempBody.Items;
    dataBody.sort((a,b) => {
      if(a.year > b.year){
          return 1;
      }else if(a.year < b.year){
          return -1;
      }else{
          return b.year - a.year;
      }
    })
    
    let params2 = {
      TableName: "sentiment_data",
      FilterExpression: "genre = :genreName",
      ExpressionAttributeValues: {
          ":genreName": genreName
      }
    };
    
    tempBody2 = await dynamo.send(
      new ScanCommand(params2)
    );
    
    let count = 0;
    let neg = 0;
    let neutral = 0;
    let pos = 0;
    let total = 0;
    
    let parseBody = tempBody2.Items;
    for(count; count<parseBody.length; count++){
      neg += parseBody[count].neg;
      neutral += parseBody[count].neurtal;
      pos += parseBody[count].pos; 
      total = count;
    }
    
    dataBody2 = {
      "neg": neg,
      "neutral": neutral,
      "pos": pos,
      "total": total
    };


    requestedData = {
      "lambdaId": 1,
      "no_of_movies": dataBody,
      "sentiment_data": dataBody2
    };
    
    const requestParams = {
      ConnectionId: connectionId,
      Data: JSON.stringify(requestedData)
    };
    
    const command = new PostToConnectionCommand(requestParams);
  
    try {
      await client.send(command);
    } catch (error) {
      console.log(error);
    }

  }catch (err) {
    statusCode = 500;
    body = "Error: "+err.message;
  }

  return {
    statusCode,
    body,
    headers,
  };
};