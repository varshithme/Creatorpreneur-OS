import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Subscription check
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .single();

    if (!sub || sub.status !== 'active') {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 });
    }

    const { metrics, sourceBreakdown, viewMode } = await request.json();

    if (!metrics || metrics.length === 0) {
      return NextResponse.json({ error: 'No metrics data provided' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `You are a sales performance analyst. Analyze these sales metrics and provide structured, actionable insights.

View mode: ${viewMode}

Metrics data:
${JSON.stringify(metrics, null, 2)}

Lead Source Breakdown:
${JSON.stringify(sourceBreakdown, null, 2)}

IMPORTANT: Structure your response EXACTLY as follows with these section headers:

## PERFORMANCE SUMMARY
[Brief 2-3 sentence overview of overall performance]

## KEY METRICS
- Total Revenue: [value]
- Average Booking Rate: [value]
- Average Conversion Rate: [value]
- Best Performing Source: [value]

## LEAD SOURCE ANALYSIS
[Analyze performance by Inbound, Outbound, and Referral]

## TRENDS & PATTERNS
[Identify important trends over time]

## AREAS OF CONCERN
[List specific problems or bottlenecks]

## TOP 3 RECOMMENDATIONS
1. [First recommendation with specific action]
2. [Second recommendation with specific action]
3. [Third recommendation with specific action]

## QUICK WINS
[List 2-3 easy improvements that can be implemented immediately]`,
        },
      ],
    });

    const insightText = message.content[0].type === 'text' ? message.content[0].text : '';

    const parseSection = (header: string): string => {
      const match = insightText.match(
        new RegExp(`## ${header}\\n([\\s\\S]*?)(?=\\n## |$)`)
      );
      return match ? match[1].trim() : '';
    };

    const sections = {
      summary: parseSection('PERFORMANCE SUMMARY'),
      metrics: parseSection('KEY METRICS'),
      sources: parseSection('LEAD SOURCE ANALYSIS'),
      trends: parseSection('TRENDS & PATTERNS'),
      concerns: parseSection('AREAS OF CONCERN'),
      recommendations: parseSection('TOP 3 RECOMMENDATIONS'),
      quickWins: parseSection('QUICK WINS'),
    };

    return NextResponse.json(sections);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate insights';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
