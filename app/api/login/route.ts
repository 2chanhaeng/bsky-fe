import { NextRequest as Request, NextResponse as Response } from "next/server";
import {
  AtpAgent,
  AtpSessionData,
  AtpSessionEvent,
  AtpAgentLoginOpts,
  AtpPersistSessionHandler,
} from "@atproto/api";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";

const agent = new AtpAgent({
  service: "https://bsky.social",
});
export async function POST(req: Request): Promise<Response> {
  const body = await req.text();
  const params = new URLSearchParams(body);
  const login = Object.fromEntries(
    params.entries()
  ) as unknown as AtpAgentLoginOpts;
  await agent.login(login);
  const url = req.nextUrl.clone();
  const to = url.searchParams.get("prev")?.toString() || "/feed";
  agent.setPersistSessionHandler(getPersistSessionHandler(req));
  return new Response("redirect", {
    status: 302,
    headers: {
      location: to,
    },
  });
}

function setSessionAtCookie(cookie: RequestCookies, sess: AtpSessionData) {
  (
    [
      "refreshJwt",
      "accessJwt",
      "handle",
      "did",
      "email",
    ] as (keyof AtpSessionData)[]
  ).forEach((key) => cookie.set(key, sess[key]!));
}

function getPersistSessionHandler(req: Request): AtpPersistSessionHandler {
  return (evt: AtpSessionEvent, sess?: AtpSessionData) => {
    switch (evt) {
      case "create":
      case "update":
        setSessionAtCookie(req.cookies, sess!);
        break;
      case "expired":
      case "create-failed":
        break;
    }
  };
}
