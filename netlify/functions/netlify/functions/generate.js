// netlify/functions/generate.js

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { message, tone } = JSON.parse(event.body || "{}");

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing message" })
      };
    }

    const OPENAI_KEY = process.env.OPENAI_API_KEY;

    const prompt = `
You are a tone rewriting assistant.

Rewrite the message below in a ${tone} tone.

Keep it natural, human, and realistic.

Message:
"${message}"
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You rewrite messages in different tones." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    const result = data.choices?.[0]?.message?.content || "No response";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ result })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
