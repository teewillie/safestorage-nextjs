import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/serverClient';

export async function POST(request: Request) {
  const client = await createClient();

  try {
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { fileName, newFileName } = await request.json();

    console.log(fileName, newFileName);

    if (!fileName || !newFileName) {
      return NextResponse.json(
        { error: 'File names not provided' },
        { status: 400 }
      );
    }

    console.log('Moving file from:', fileName, 'to:', newFileName);
    const { error: storageError } = await supabase.storage
      .from('files')
      .move(fileName, newFileName);

    if (storageError) {
      console.error('Storage rename error:', storageError, 'Attempted paths:', { from: fileName, to: newFileName });
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 }
      );
    }

    // Update the database record
    const { error: dbError } = await supabase
      .from('files')
      .update({ file_name: newFileName })
      .eq('file_name', fileName)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database update error:', dbError);
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'File renamed successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Rename error:', error);
    return NextResponse.json(
      { error: 'Failed to rename file' },
      { status: 500 }
    );
  }
}