import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Publish to Blotato
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const {
      contentId,
      platform,
      blotatoApiKey,
      copyHook,
      copyBody,
      copyCta,
      hashtags,
    } = body;

    // 1. Call Blotato API to publish
    const blotatoResponse = await fetch('https://api.blotato.io/v1/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${blotatoApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        platforms: [platform.toLowerCase()],
        text: `${copyHook}\n\n${copyBody}\n\n${copyCta}\n\n${hashtags.join(' ')}`,
        scheduledAt: new Date().toISOString(),
      }),
    });

    const blotatoData = await blotatoResponse.json();

    if (!blotatoResponse.ok) {
      return NextResponse.json(
        { error: 'Blotato API error: ' + blotatoData.message },
        { status: 400 }
      );
    }

    // 2. Update content queue with blotato ID
    const { data: updatedContent, error: updateError } = await supabase
      .from('content_queue')
      .update({
        status: 'PUBLISHED',
        blotato_post_id: blotatoData.id,
        published_at: new Date().toISOString(),
        published_to: platform,
      })
      .eq('id', contentId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // 3. Create published_content record
    const { data: publishedRecord, error: publishError } = await supabase
      .from('published_content')
      .insert({
        cliente_id: updatedContent.cliente_id,
        content_queue_id: contentId,
        blotato_post_id: blotatoData.id,
        platform: platform,
        content_type: updatedContent.content_type,
        topic: updatedContent.topic,
        posted_at: new Date().toISOString(),
        posting_time: new Date().toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })
      .select()
      .single();

    if (publishError) {
      return NextResponse.json(
        { error: publishError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        contentId,
        blotatoId: blotatoData.id,
        platform,
        publishedAt: new Date().toISOString(),
      },
      message: `Content published to ${platform}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Sync engagement from Blotato
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const { publishedContentId, blotatoApiKey, blotatoPostId } = body;

    // 1. Fetch from Blotato
    const blotatoResponse = await fetch(
      `https://api.blotato.io/v1/posts/${blotatoPostId}`,
      {
        headers: {
          'Authorization': `Bearer ${blotatoApiKey}`,
        },
      }
    );

    const blotatoData = await blotatoResponse.json();

    if (!blotatoResponse.ok) {
      return NextResponse.json(
        { error: 'Blotato fetch error' },
        { status: 400 }
      );
    }

    // 2. Update published_content with engagement metrics
    const engagementRate =
      blotatoData.reach > 0
        ? ((blotatoData.engagement || 0) / blotatoData.reach) * 100
        : 0;

    const performanceScore =
      engagementRate > 8 ? 'EXCELLENT' : engagementRate > 5 ? 'GOOD' : 'NEEDS_WORK';

    const { data: updated, error: updateError } = await supabase
      .from('published_content')
      .update({
        reach: blotatoData.reach || 0,
        impressions: blotatoData.impressions || 0,
        engagement_count: blotatoData.engagement || 0,
        engagement_rate: engagementRate,
        likes: blotatoData.likes || 0,
        comments: blotatoData.comments || 0,
        shares: blotatoData.shares || 0,
        saves: blotatoData.saves || 0,
        conversions: blotatoData.clicks || 0,
        performance_score: performanceScore,
        synced_at: new Date().toISOString(),
      })
      .eq('id', publishedContentId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Engagement metrics synced',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
