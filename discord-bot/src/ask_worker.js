export default {
  async fetch(request, env, ctx) {
    console.log("ask worker received:", request.method, request.url);

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

     // Verify shared secret
    const secret = request.headers.get("X-Bot-Secret");
    if (!secret || secret !== env.BOT_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
    const { question, application_id, token } = await request.json();

    ctx.waitUntil(handleAsk(question, application_id, token, env));

    return new Response("ok", { status: 200 });
  }
};

async function handleAsk(question, application_id, token, env) {
  try {
    const response = await fetch(
      "https://bf002610-921a-4047-9298-cc2d2668451a.search.ai.cloudflare.com/chat/completions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant for the YWCC Capstone program. Answer questions clearly and concisely. Do not use markdown links like [text](url). If you need to include URLs, just paste them plainly. Do not use excessive formatting."
            },
            { role: "user", content: question }
          ],
          stream: false,
        }),
      }
    );

    console.log("AutoRAG status:", response.status);
    const data = await response.json();
    let answer = data.choices?.[0]?.message?.content || "No answer found for your question.";

    if (answer.length > 2000) {
      answer = answer.slice(0, 1997) + "...";
    }

    await sendFollowup(application_id, token, answer);
  } catch (err) {
    console.error("handleAsk error:", err.message, err.stack);
    await sendFollowup(application_id, token, "⚠️ Something went wrong. Please try again.");
  }
}

async function sendFollowup(application_id, token, content) {
  await fetch(`https://discord.com/api/v10/webhooks/${application_id}/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, allowed_mentions: { parse: [] } }),
  });
}