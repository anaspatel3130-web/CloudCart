import {
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Errors } from "./errors.js";

export function createDynamoStore(docClient, tables) {
  return {
    async getProduct(id) {
      const result = await docClient.send(
        new GetCommand({ TableName: tables.products, Key: { id } })
      );
      return result.Item || null;
    },

    async listAllProducts(maxItems) {
      const items = [];
      let ExclusiveStartKey;
      do {
        const result = await docClient.send(
          new ScanCommand({
            TableName: tables.products,
            ExclusiveStartKey,
          })
        );
        items.push(...(result.Items || []));
        ExclusiveStartKey = result.LastEvaluatedKey;
      } while (ExclusiveStartKey && items.length < maxItems);
      return items.slice(0, maxItems);
    },

    async updateProductStock(id, stock) {
      try {
        const result = await docClient.send(
          new UpdateCommand({
            TableName: tables.products,
            Key: { id },
            UpdateExpression: "SET stock = :stock, updatedAt = :updatedAt",
            ConditionExpression: "attribute_exists(id)",
            ExpressionAttributeValues: {
              ":stock": stock,
              ":updatedAt": new Date().toISOString(),
            },
            ReturnValues: "ALL_NEW",
          })
        );
        return result.Attributes;
      } catch (error) {
        if (error?.name === "ConditionalCheckFailedException") {
          throw Errors.productNotFound();
        }
        throw error;
      }
    },

    async getCart(userId) {
      const result = await docClient.send(
        new GetCommand({ TableName: tables.carts, Key: { userId } })
      );
      return result.Item || null;
    },

    async putCart(cart) {
      await docClient.send(
        new PutCommand({
          TableName: tables.carts,
          Item: cart,
        })
      );
      return cart;
    },

    async getOrder(orderId) {
      const result = await docClient.send(
        new GetCommand({ TableName: tables.orders, Key: { orderId } })
      );
      return result.Item || null;
    },

    async listOrdersByUser(userId) {
      const items = [];
      let ExclusiveStartKey;
      do {
        const result = await docClient.send(
          new QueryCommand({
            TableName: tables.orders,
            IndexName: "UserOrdersIndex",
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: { ":userId": userId },
            ScanIndexForward: false,
            ExclusiveStartKey,
          })
        );
        items.push(...(result.Items || []));
        ExclusiveStartKey = result.LastEvaluatedKey;
      } while (ExclusiveStartKey);
      return items;
    },

    async updateOrderStatus(orderId, status) {
      try {
        const result = await docClient.send(
          new UpdateCommand({
            TableName: tables.orders,
            Key: { orderId },
            UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
            ConditionExpression: "attribute_exists(orderId)",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
              ":status": status,
              ":updatedAt": new Date().toISOString(),
            },
            ReturnValues: "ALL_NEW",
          })
        );
        return result.Attributes;
      } catch (error) {
        if (error?.name === "ConditionalCheckFailedException") {
          throw Errors.orderNotFound();
        }
        throw error;
      }
    },

    async transactCheckout({ decrements, order, cart }) {
      const now = new Date().toISOString();
      const transactItems = [
        ...decrements.map((item) => ({
          Update: {
            TableName: tables.products,
            Key: { id: item.productId },
            UpdateExpression: "SET stock = stock - :qty, updatedAt = :now",
            ConditionExpression: "attribute_exists(id) AND stock >= :qty",
            ExpressionAttributeValues: {
              ":qty": item.quantity,
              ":now": now,
            },
          },
        })),
        {
          Put: {
            TableName: tables.orders,
            Item: order,
            ConditionExpression: "attribute_not_exists(orderId)",
          },
        },
        {
          Put: {
            TableName: tables.carts,
            Item: cart,
          },
        },
      ];

      try {
        await docClient.send(new TransactWriteCommand({ TransactItems: transactItems }));
      } catch (error) {
        if (error?.name === "TransactionCanceledException") {
          throw Errors.conflict(
            "CHECKOUT_CONFLICT",
            "The order could not be completed because stock changed. Refresh the cart and try again."
          );
        }
        throw error;
      }
    },
  };
}
