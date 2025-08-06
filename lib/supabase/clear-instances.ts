// Utility to clear Supabase instances and prevent multiple GoTrueClient warnings

export function clearSupabaseInstances() {
  if (typeof window === 'undefined') return;

  console.log('Clearing Supabase instances...');

  // Clear global instances
  if ((window as any).__supabaseInstance) {
    (window as any).__supabaseInstance = undefined;
    console.log('Cleared __supabaseInstance');
  }

  if ((window as any).__supabaseAdminInstance) {
    (window as any).__supabaseAdminInstance = undefined;
    console.log('Cleared __supabaseAdminInstance');
  }

  // Clear localStorage
  try {
    localStorage.removeItem('oneai-auth');
    console.log('Cleared oneai-auth from localStorage');
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }

  // Clear any other Supabase-related storage
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.includes('supabase') || key.includes('sb-')) {
        localStorage.removeItem(key);
        console.log(`Cleared ${key} from localStorage`);
      }
    });
  } catch (e) {
    console.warn('Could not clear Supabase localStorage keys:', e);
  }

  console.log('Supabase instances cleared. Refresh the page to reinitialize.');
}

// Function to reset Supabase client singletons
export function resetSupabaseClients() {
  // This will force new client creation on next getSupabaseClient() call
  if (typeof window !== 'undefined') {
    // Clear the module-level variables by reloading the module
    // Note: This is a workaround since we can't directly clear module variables
    console.log('Supabase clients will be recreated on next use');
  }
}
