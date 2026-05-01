// netlify/functions/hello.js

exports.handler = async (event) => {
  const name = event.queryStringParameters?.name || "stranger";

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello, ${Chris} 🚀`
    })
  };
};
