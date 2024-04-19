import { createModel } from 'polynomial-regression';
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const model = createModel();
const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event, context) => {
  let body,tempBody,dataBody,requestedData;
  let statusCode = 200;
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const connectionId = event.requestContext.connectionId;
  const callbackUrl = `https://${domain}/${stage}`;
  const client = new ApiGatewayManagementApiClient({ endpoint: callbackUrl });
  const headers = {
    "Content-Type": "application/json",
  };
  let data = [];
  
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
  }catch (err) {
    statusCode = 500;
    body = "Error: "+err.message;
  }


  for(let i=0; i<dataBody.length; i++){
    data.push([dataBody[i].year,dataBody[i].amount]);
  }
  let numPred = {
      "first": [],
      "second": [],
      "third": [],
      "years": []
  }
  
  model.fit(data, [1, 2, 3]);
  for(let i=2024; i<=2033; i++){
      numPred.first.push(model.estimate(1,i));
      numPred.second.push(model.estimate(2,i));
      numPred.third.push(model.estimate(3,i));
      numPred.years.push(i);
  }
  
  requestedData = {
    "lambdaId": 2,
    "numPredictives": numPred
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
}