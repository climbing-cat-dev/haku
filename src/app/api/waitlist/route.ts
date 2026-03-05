import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_WAITLIST_DB_ID!;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_ORIGINS = new Set([
  "https://climbingcat.dev",
  "https://www.climbingcat.dev",
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
]);

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);

  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  try {
    const headerList = await headers();
    const origin = headerList.get("origin") ?? "";
    if (!ALLOWED_ORIGINS.has(origin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { name, email } = await request.json();

    if (!isNonEmptyString(name)) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!isNonEmptyString(email) || !EMAIL_PATTERN.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: name.trim() } }] },
        Email: { rich_text: [{ text: { content: email.trim() } }] },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Waitlist error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
