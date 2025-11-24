
// Mock Storage Service
// Since Supabase is disconnected, we simulate uploads by creating local Object URLs.
// In a real app without a backend, you might convert files to Base64 (localStorage) 
// or just use ephemeral Object URLs (session only).

export const uploadFile = async (file: File | Blob, bucket: 'media', path?: string): Promise<string | null> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      resolve(url);
    }, 800);
  });
};
