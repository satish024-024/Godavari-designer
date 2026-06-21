const https = require('https');

const supabaseUrl = "https://xpqduepvrlhzsofxcukn.supabase.co";
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwcWR1ZXB2cmxoenNvZnhjdWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NDExOTcsImV4cCI6MjA5NzQxNzE5N30.SlLcLcRimo5uTacJVQvuOHR1UM0JkZF5GNJqseF2zt0";

function apiGet(table) {
  return new Promise((resolve, reject) => {
    const url = `${supabaseUrl}/rest/v1/${table}?select=*`;
    const req = https.get(url, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse data for ${table}: ${data}`));
        }
      });
    });
    req.on('error', reject);
  });
}

async function run() {
  try {
    const categories = await apiGet('categories');
    console.log(JSON.stringify(categories.map(c => ({ id: c.id, name: c.name, slug: c.slug, parent: c.parent_category_id })), null, 2));
  } catch (error) {
    console.error("Error querying Supabase:", error);
  }
}

run();
