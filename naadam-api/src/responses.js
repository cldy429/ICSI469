export function json(value, status = 200, headers = {}) {
  return Response.json(value, {status, headers: {'Cache-Control': 'no-store', ...headers}});
}

// Canceling an SSE response releases its interval or removes the shared-room client.
export function streamEvents(connect) {
  const encoder = new TextEncoder();
  let disconnect = () => {};
  let closed = false;
  const body = new ReadableStream({
    start(controller) {
      const close = () => {
        if (closed) return;
        closed = true;
        disconnect();
        controller.close();
      };
      const send = packet => {
        if (closed) return;
        if (controller.desiredSize < -32) {
          close();
          return;
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(packet)}\n\n`));
      };
      disconnect = connect(send, close);
    },
    cancel() {
      closed = true;
      disconnect();
    },
  });
  return new Response(body, {headers: {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'X-Accel-Buffering': 'no',
  }});
}

export async function readJson(request) {
  if (!request.body) throw json({error: 'bad json'}, 400);
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let body = '';
  try {
    for (;;) {
      const {value, done} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 8000) {
        await reader.cancel();
        throw json({error: 'body too large'}, 413);
      }
      body += decoder.decode(value, {stream: true});
    }
    const parsed = JSON.parse(body + decoder.decode());
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected an object');
    return parsed;
  } catch (error) {
    if (error instanceof Response) throw error;
    throw json({error: 'bad json'}, 400);
  } finally {
    reader.releaseLock();
  }
}
