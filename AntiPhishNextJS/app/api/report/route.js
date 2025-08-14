import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { emailBody, analysis } = body;

        if (!emailBody || !analysis) {
            return NextResponse.json({
                error: "Missing required fields",
                code: "MISSING_REQUIRED_FIELDS",
                details: "emailBody and analysis are both required fields"
            }, { status: 400 });
        }

        if (typeof analysis.score !== 'number' || typeof analysis.label !== 'string') {
            return NextResponse.json({
                error: "Invalid analysis data",
                code: "INVALID_ANALYSIS_DATA",
                details: "Analysis must contain numeric score and string label"
            }, { status: 400 });
        }

        const falseAnalysisReport = await prisma.falseAnalysisReport.create({
            data: {
                emailBody: emailBody,
                score: analysis.score,
                label: analysis.label,
            },
        });

        return NextResponse.json({
            message: "False analysis reported successfully.",
            report: falseAnalysisReport,
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            error: "Internal server error",
            code: "REPORT_CREATION_ERROR",
            details: error.message
        }, { status: 500 });
    }
}
