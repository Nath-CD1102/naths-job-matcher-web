import { detectProtocolCompliance, DetectorInput } from '@/lib/protocol';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, company, description } = body as DetectorInput;

    if (!title || !company || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, company, description' },
        { status: 400 }
      );
    }

    const result = detectProtocolCompliance({
      title,
      company,
      description,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Detector error:', error);
    return NextResponse.json(
      { error: 'Failed to process job description' },
      { status: 500 }
    );
  }
}
