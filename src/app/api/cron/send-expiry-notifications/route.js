// app/api/cron/send-expiry-notifications/route.js

import { NextResponse } from 'next/server';
import { handleDailyExpiryCheck } from '@/services/expiryCheckService';

export async function GET(req) {
    // 1. Authenticate the request
    // This ensures that only Vercel's scheduler (or someone with the secret) can run this job.
    const { searchParams } = new URL(req.url);
    if (searchParams.get('cron_secret') !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Trigger the core logic from the dedicated service file
    try {
        const result = await handleDailyExpiryCheck();
        return NextResponse.json(result);
    } catch (error) {
        console.error("Cron job API handler encountered an error:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
