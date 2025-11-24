
// Supabase has been disconnected.
// This file remains to prevent import errors during the transition, 
// but the client is null and should not be used.

export const supabase = {
  from: () => ({ select: () => ({ eq: () => ({ single: () => ({}) }) }) }),
  auth: { getSession: () => ({ data: { session: null } }) },
  storage: { from: () => ({ upload: () => ({}), getPublicUrl: () => ({}) }) },
  channel: () => ({ on: () => ({ subscribe: () => ({}) }), unsubscribe: () => ({}) }),
  removeChannel: () => ({})
} as any;
