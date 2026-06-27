import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Save generated content to queue
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const {
      clienteId,
      contentType,
      topic,
      copyHook,
      copyBody,
      copyCta,
      hashtags,
      suggestedSound,
      generatedBy,
    } = body;

    const { data, error } = await supabase
      .from('content_queue')
      .insert({
        cliente_id: clienteId,
        content_type: contentType,
        topic,
        copy_hook: copyHook,
        copy_body: copyBody,
        copy_cta: copyCta,
        hashtags: JSON.stringify(hashtags),
        suggested_sound: suggestedSound,
        generated_by: generatedBy,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Content generated and queued for approval',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET pending content for approval
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get('clienteId');

    const { data, error } = await supabase
      .from('content_queue')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      data,
      count: data?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH: Approve/Reject content
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const { contentId, status, blotatoPostId } = body;

    const { data, error } = await supabase
      .from('content_queue')
      .update({
        status,
        approved_at: status === 'APPROVED' ? new Date().toISOString() : null,
        blotato_post_id: blotatoPostId,
      })
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Content ${status.toLowerCase()}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
