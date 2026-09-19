import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CarSetup, SetupComment } from '../types';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Fetch all shared community setups from Supabase 'setups' table
 */
export async function fetchSetupsFromSupabase(): Promise<CarSetup[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('setups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      title: row.title || '',
      gameId: row.game_id || row.gameId || 'f1_25',
      trackId: row.track_id || row.trackId || '',
      carName: row.car_name || row.carName || '',
      creatorUsername: row.creator_username || row.creatorUsername || 'Anonymous',
      creatorBadge: row.creator_badge || row.creatorBadge || 'Community',
      creatorAvatar: row.creator_avatar || row.creatorAvatar || '',
      bestLapTime: row.best_lap_time || row.bestLapTime || '1:30.000',
      lapTimeSeconds: Number(row.lap_time_seconds || row.lapTimeSeconds || 90),
      averageRating: Number(row.average_rating || row.averageRating || 5.0),
      ratingCount: Number(row.rating_count || row.ratingCount || 1),
      userRating: row.user_rating ? Number(row.user_rating) : undefined,
      condition: row.condition || 'Dry',
      type: row.type || 'Qualifying',
      downforceLevel: row.downforce_level || row.downforceLevel || 'Medium',
      dateAdded: row.date_added || row.dateAdded || new Date().toISOString().split('T')[0],
      downloads: Number(row.downloads || 0),
      notes: row.notes || '',
      specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs || {},
      inputDevice: row.input_device || row.inputDevice || 'Wheel',
      isUserSubmitted: true,
      proofScreenshot: row.proof_screenshot || row.proofScreenshot || '',
      isProofVerified: Boolean(row.is_proof_verified ?? row.isProofVerified ?? false),
      verificationStatus: row.verification_status || row.verificationStatus || 'verified',
      verificationNotes: row.verification_notes || row.verificationNotes || '',
      proofTimestamp: row.proof_timestamp || row.proofTimestamp || '',
      setupScreenshots: typeof row.setup_screenshots === 'string' ? JSON.parse(row.setup_screenshots) : row.setup_screenshots || [],
      customTrackName: row.custom_track_name || row.customTrackName || '',
    }));
  } catch (err) {
    console.warn('Failed to read setups from Supabase:', err);
    return null;
  }
}

/**
 * Upsert a setup to Supabase 'setups' table
 */
export async function saveSetupToSupabase(setup: CarSetup): Promise<boolean> {
  if (!supabase) return false;
  try {
    const dbPayload = {
      id: setup.id,
      title: setup.title,
      game_id: setup.gameId,
      track_id: setup.trackId,
      car_name: setup.carName,
      creator_username: setup.creatorUsername,
      creator_badge: setup.creatorBadge || 'Community',
      creator_avatar: setup.creatorAvatar || '',
      best_lap_time: setup.bestLapTime,
      lap_time_seconds: setup.lapTimeSeconds,
      average_rating: setup.averageRating,
      rating_count: setup.ratingCount,
      user_rating: setup.userRating,
      condition: setup.condition,
      type: setup.type,
      downforce_level: setup.downforceLevel,
      date_added: setup.dateAdded,
      downloads: setup.downloads,
      notes: setup.notes,
      specs: JSON.stringify(setup.specs || {}),
      input_device: setup.inputDevice || 'Wheel',
      is_user_submitted: true,
      proof_screenshot: setup.proofScreenshot || '',
      is_proof_verified: setup.isProofVerified || false,
      verification_status: setup.verificationStatus || 'verified',
      verification_notes: setup.verificationNotes || '',
      proof_timestamp: setup.proofTimestamp || '',
      setup_screenshots: JSON.stringify(setup.setupScreenshots || []),
      custom_track_name: setup.customTrackName || '',
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('setups').upsert(dbPayload, { onConflict: 'id' });
    if (error) {
      console.error('Supabase save setup error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save setup to Supabase:', err);
    return false;
  }
}

/**
 * Delete a setup from Supabase 'setups' table
 */
export async function deleteSetupFromSupabase(setupId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('setups').delete().eq('id', setupId);
    if (error) {
      console.error('Supabase delete setup error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to delete setup from Supabase:', err);
    return false;
  }
}

/**
 * Fetch all comments from Supabase 'comments' table
 */
export async function fetchCommentsFromSupabase(): Promise<SetupComment[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch comments error:', error.message);
      return null;
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      setupId: row.setup_id || row.setupId,
      parentId: row.parent_id || row.parentId || null,
      authorUsername: row.author_username || row.authorUsername,
      authorBadge: row.author_badge || row.authorBadge,
      authorAvatar: row.author_avatar || row.authorAvatar,
      content: row.content,
      createdAt: row.created_at || row.createdAt,
      likes: Number(row.likes || 0),
      tag: row.tag,
      isPinned: Boolean(row.is_pinned ?? row.isPinned ?? false),
    }));
  } catch (err) {
    console.warn('Failed to fetch comments from Supabase:', err);
    return null;
  }
}

/**
 * Save comment to Supabase 'comments' table
 */
export async function saveCommentToSupabase(comment: SetupComment): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: comment.id,
      setup_id: comment.setupId,
      parent_id: comment.parentId || null,
      author_username: comment.authorUsername,
      author_badge: comment.authorBadge || 'Community',
      author_avatar: comment.authorAvatar || '',
      content: comment.content,
      created_at: comment.createdAt || new Date().toISOString(),
      likes: comment.likes || 0,
      tag: comment.tag || 'General',
      is_pinned: comment.isPinned || false,
    };

    const { error } = await supabase.from('comments').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Supabase comment error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to save comment to Supabase:', err);
    return false;
  }
}

/**
 * Real-time subscription helper for Supabase
 */
export function subscribeToSupabaseSetups(onChange: () => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('public:setups')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'setups' }, () => {
      onChange();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToSupabaseComments(onChange: () => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('public:comments')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
      onChange();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
