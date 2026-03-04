import { NextResponse } from "next/server";

function normalizePayload(payload) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload;
  }
  return { data: payload };
}

export function jsonResponse(payload = {}, initOrStatus) {
  const init =
    typeof initOrStatus === "number"
      ? { status: initOrStatus }
      : initOrStatus || {};

  const status = typeof init.status === "number" ? init.status : 200;
  const body = normalizePayload(payload);
  const {
    success: successFromBody,
    msg: msgFromBody,
    ...rest
  } = body;

  const success =
    successFromBody ??
    (status >= 200 && status < 300);

  const msg =
    msgFromBody ??
    (success ? "OK" : "Error");

  return NextResponse.json(
    { success: !!success, msg, ...rest },
    init
  );
}
