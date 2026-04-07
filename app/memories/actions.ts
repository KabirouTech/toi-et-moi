'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createMemory(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const { data: coupleMember } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!coupleMember) throw new Error('No couple found');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;

  if (!title || !date) throw new Error('Title and date are required');

  const { data: memory, error: memoryError } = await supabase
    .from('memories')
    .insert({
      couple_id: coupleMember.couple_id,
      title,
      description: description || null,
      date,
      created_by: user.id,
    })
    .select()
    .single();

  if (memoryError || !memory) throw new Error('Failed to create memory');

  // Handle image uploads
  const images = formData.getAll('images') as File[];

  for (const image of images) {
    if (!image || !image.size || image.size === 0) continue;

    const fileExt = image.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${coupleMember.couple_id}/${memory.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('memories')
      .upload(filePath, image);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('memories').getPublicUrl(filePath);

    await supabase.from('memory_photos').insert({
      memory_id: memory.id,
      image_url: publicUrl,
    });
  }

  revalidatePath('/memories');
}

export async function deleteMemory(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const memoryId = formData.get('memoryId') as string;
  if (!memoryId) throw new Error('Memory ID is required');

  const { data: coupleMember } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (!coupleMember) throw new Error('No couple found');

  const { data: memory } = await supabase
    .from('memories')
    .select('id, couple_id')
    .eq('id', memoryId)
    .eq('couple_id', coupleMember.couple_id)
    .single();

  if (!memory) throw new Error('Memory not found');

  // Delete photos from storage
  const storagePath = `${coupleMember.couple_id}/${memoryId}`;
  const { data: files } = await supabase.storage
    .from('memories')
    .list(storagePath);

  if (files && files.length > 0) {
    const filePaths = files.map((file) => `${storagePath}/${file.name}`);
    await supabase.storage.from('memories').remove(filePaths);
  }

  await supabase.from('memory_photos').delete().eq('memory_id', memoryId);
  await supabase.from('memories').delete().eq('id', memoryId);

  revalidatePath('/memories');
}
