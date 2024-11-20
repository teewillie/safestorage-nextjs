import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/serverClient';

export async function POST(request: Request) {
  const client = await createClient();

  try {
    // Get current user
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileName } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { error: 'No file name provided' },
        { status: 400 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([fileName]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 }
      );
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('file_name', fileName)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'File deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}