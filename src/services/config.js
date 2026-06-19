// Environment-specific configuration loader
export const config = {
  supabaseUrl: "https://xpqduepvrlhzsofxcukn.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcWR1ZXB2cmxoenNvZnhjdWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NDExOTcsImV4cCI6MjA5NzQxNzE5N30.SlLcLcRimo5uTacJVQvuOHR1UM0JkZF5GNJqseF2zt0"
};

export async function loadConfig() {
  try {
    const response = await fetch("./config.json");
    if (response.ok) {
      const json = await response.json();
      if (json.supabaseUrl) config.supabaseUrl = json.supabaseUrl;
      if (json.supabaseAnonKey) config.supabaseAnonKey = json.supabaseAnonKey;
    }
  } catch (error) {
    // Ignore and fallback to production keys in default state
  }
}
