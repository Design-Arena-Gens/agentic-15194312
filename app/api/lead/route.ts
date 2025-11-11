import { NextRequest, NextResponse } from 'next/server';
import { leadSchema } from '@/lib/lead';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const lead = leadSchema.parse(json);

    const payload = {
      ...lead,
      receivedAt: new Date().toISOString(),
      ip: req.ip || req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    };

    const webhook = process.env.LEADS_WEBHOOK_URL;
    let forwarded = false;
    let forwardStatus: number | undefined;

    if (webhook) {
      try {
        const res = await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        forwarded = res.ok;
        forwardStatus = res.status;
      } catch {
        forwarded = false;
      }
    }

    return NextResponse.json({ ok: true, id: crypto.randomUUID(), forwarded, forwardStatus, payload }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Invalid payload' }, { status: 400 });
  }
}
