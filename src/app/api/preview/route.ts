import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/serverClient';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const client = await createClient();
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get('file');

  if (!fileName) {
    return NextResponse.json({ error: 'No file specified' }, { status: 400 });
  }

  try {
    // Auth check
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Download file from Supabase storage
    const { data, error } = await supabase.storage
      .from('files')
      .download(fileName);

    if (error) {
      console.error('Preview error:', error);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Get file type from the file name
    const fileType = fileName.split('.').pop()?.toLowerCase();
    const contentType = getContentType(fileType);

    // Return the file with appropriate headers
    return new Response(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Preview error:', error);
    return NextResponse.json({ error: 'Failed to preview file' }, { status: 500 });
  }
}

function getContentType(fileType: string | undefined): string {
  const contentTypes: { [key: string]: string } = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    txt: 'text/plain',
  };

  return contentTypes[fileType || ''] || 'application/octet-stream';
} 