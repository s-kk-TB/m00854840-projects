import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient();

export const handler = async (event) => {
    let connId = event.requestContext.connectionId;
    console.log("Client connected with ID: " + connId);

    const params = {
        TableName: "web_socket_clients",
        Item: {
            client_id: connId,
            time: Date.now()
        }
    };

    try {
        await ddbClient.send( new PutCommand(params) );
        console.log("Connection ID stored.");

        return {
            statusCode: 200,
            body: "Client connected with ID: " + connId
        };
    }
    catch (err) {
        console.error(JSON.stringify(err));
        return {
            statusCode: 500,
            body: "Server Error: " + JSON.stringify(err)
        };
    }
};
