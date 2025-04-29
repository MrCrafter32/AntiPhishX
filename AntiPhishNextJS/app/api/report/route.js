// pages/api/report-false-analysis.js

import prisma from '@/lib/prisma';  // Make sure to import the Prisma client correctly
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { emailBody, analysis } = body;
        // console.log("Received data:", body);

        // Ensure required fields are present
        if (!emailBody || !analysis) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        // Optionally, validate the data (e.g., ensure score and label are valid)
        if (typeof analysis.score !== 'number' || typeof analysis.label !== 'string') {
            return NextResponse.json({ error: "Invalid analysis data." }, { status: 400 });
        }

        // Create a report for the false analysis in the database
        const falseAnalysisReport = await prisma.falseAnalysisReport.create({
            data: {
                emailBody: emailBody,
                score: analysis.score,
                label: analysis.label,
            },
        });

        // Respond with a success message
        return NextResponse.json({
            message: "False analysis reported successfully.",
            report: falseAnalysisReport,
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
}
