// Development script to clear Supabase instances
// Run this in the browser console when you see "Multiple GoTrueClient instances" warning

console.log('Clearing Supabase instances...');

// Clear global instances
if (typeof window !== 'undefined') {
  if (window.__supabaseInstance) {
    window.__supabaseInstance = undefined;
    console.log('Cleared __supabaseInstance');
  }
  if (window.__supabaseAdminInstance) {
    window.__supabaseAdminInstance = undefined;
    console.log('Cleared __supabaseAdminInstance');
  }
}

// Clear localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('oneai-auth');
  console.log('Cleared oneai-auth from localStorage');
}

console.log('Supabase instances cleared. Refresh the page to reinitialize.'); 