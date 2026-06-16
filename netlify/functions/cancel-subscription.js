// netlify/functions/cancel-subscription.js

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: "Method Not Allowed"
    };
  }

  try {
    const { subscriptionId } = JSON.parse(event.body || "{}");

    if (!subscriptionId || typeof subscriptionId !== "string" || !subscriptionId.startsWith("sub_")) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ error: "A valid subscriptionId (starting with 'sub_') is required" })
      };
    }

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

    if (!STRIPE_SECRET_KEY) {
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ error: "Server configuration error" })
      };
    }

    const response = await fetch(
      `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + STRIPE_SECRET_KEY,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ error: data.error?.message || "Failed to cancel subscription" })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Subscription cancelled successfully",
        subscription: data
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "An unexpected error occurred" })
    };
  }
};
