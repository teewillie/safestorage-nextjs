import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/serverClient';

export async function POST(request: Request) {
  const client = await createClient();
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file received' },
        { status: 400 }
      );
    }

    // Create unique filename
    const fileName = `${Date.now()}-${file.name}`;
    
    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('files') // Replace with your bucket name
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('files')
        .getPublicUrl(fileName);

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

    // Insert file metadata into files table
    const { error: dbError } = await supabase
      .from('files')
      .insert([
        {
          file_name: fileName,
          file_type: file.type,
          file_size: file.size,
          file_url: publicUrl,
          user_id: user.id
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      );
    }

        

    if (error) {
      console.error('Supabase storage error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }



    return NextResponse.json({
      message: 'File uploaded successfully',
      url: publicUrl
    }, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}