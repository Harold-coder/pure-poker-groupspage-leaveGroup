const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const groupsTableName = process.env.GROUPS_TABLE;

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const { groupId, userId } = body;

    try {
        // Retrieve the current group data
        const result = await dynamoDb.get({
            TableName: groupsTableName,
            Key: { groupId },
        }).promise();

        const group = result.Item;

        if (!group) {
            return { 
                statusCode: 404, 
                body: JSON.stringify({ message: "Group not found." }),
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Allow-Methods": "OPTIONS,POST"
                }  
            };
        }

        // Remove the user from membersList
        const updatedMembersList = group.membersList.filter(member => member !== userId);

        // Update the group with the new members list
        await dynamoDb.update({
            TableName: groupsTableName,
            Key: { groupId },
            UpdateExpression: "SET membersList = :membersList",
            ExpressionAttributeValues: {
                ":membersList": updatedMembersList,
            },
        }).promise();

        return {
            statusCode: 200, 
            body: JSON.stringify({ message: "User removed from group." }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            }            
        };
    } catch (err) {
        console.error('Error leaving group:', err);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ message: "Failed to leave group" }),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            }  
        };
    }
};
