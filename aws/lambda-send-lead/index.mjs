// AWS Lambda entry point for the lead-submission endpoint. Wraps the
// original Vercel handler (api/send-lead.js, copied here unmodified) in a
// shim that translates a Lambda Function URL event into the (req, res)
// shape Vercel functions expect, so the actual lead/email logic never has
// to be duplicated or rewritten for this runtime — see ../README.md for
// deploy steps.
import sendLeadHandler from './api/send-lead.js';

function toLambdaHandler(vercelHandler) {
  return async function (event) {
    const method =
      (event.requestContext && event.requestContext.http && event.requestContext.http.method) ||
      event.httpMethod ||
      'POST';

    let body = {};
    if (event.body) {
      const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
      try {
        body = JSON.parse(raw);
      } catch (e) {
        body = {};
      }
    }

    const req = { method, body };
    const headers = { 'Content-Type': 'application/json' };
    let statusCode = 200;
    let response = null;

    const res = {
      setHeader(key, value) {
        headers[key] = value;
        return res;
      },
      status(code) {
        statusCode = code;
        return res;
      },
      json(payload) {
        response = { statusCode, headers, body: JSON.stringify(payload) };
        return res;
      },
      end(payload) {
        response = { statusCode, headers, body: payload || '' };
        return res;
      },
    };

    await vercelHandler(req, res);
    return response || { statusCode: 500, headers, body: JSON.stringify({ error: 'No response produced' }) };
  };
}

export const handler = toLambdaHandler(sendLeadHandler);
