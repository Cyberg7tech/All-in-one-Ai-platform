// Auth cleanup utility to clear only problematic storage

export function clearProblematicStorage() {
  if (typeof window === 'undefined') return;

  try {
    // Only clear specific problematic keys that cause conflicts
    const problematicKeys = [
      'nuclear-oneai-auth',
      'oneai-auth-permanent'
    ];

    problematicKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    console.log('Problematic storage keys cleared');
  } catch (error) {
    console.warn('Error clearing problematic storage:', error);
  }
}

export function emergencyAuthCleanup() {
  if (typeof window === 'undefined') return;
  
  try {
    // Emergency cleanup - only use when auth is completely broken
    const allStorageKeys = Object.keys(localStorage);
    
    allStorageKeys.forEach(key => {
      if (key.includes('nuclear') || key.includes('oneai-auth-permanent')) {
        localStorage.removeItem(key);
        console.log(`Removed problematic key: ${key}`);
      }
    });

    console.log('Emergency auth cleanup completed');
  } catch (error) {
    console.warn('Error in emergency cleanup:', error);
  }
}

// Only run emergency cleanup if there are clear signs of issues
if (typeof window !== 'undefined') {
  // Check for known problematic keys
  const hasProblematicKeys = Object.keys(localStorage).some(key => 
    key.includes('nuclear-oneai') || key.includes('oneai-auth-permanent')
  );

  if (hasProblematicKeys) {
    console.log('Detected problematic storage keys, cleaning up...');
    clearProblematicStorage();
  }
}
