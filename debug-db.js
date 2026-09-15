// Debug script to check database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://c--f039f014-9072-49e0-88d0-dacb3f90b1fb-prod.lovable.cloud';
const supabaseKey = 'sb_publishable_lhlbmQhqzkWHYro04ldj-g_ALoxkvLD';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDatabase() {
  console.log('Checking equipment count...');
  
  const { data: equipment, error } = await supabase
    .from('equipment')
    .select('*');
  
  if (error) {
    console.error('Error fetching equipment:', error);
    return;
  }
  
  console.log(`Total equipment in database: ${equipment.length}`);
  console.log('Equipment list:');
  equipment.forEach(eq => {
    console.log(`- ${eq.name} (published: ${eq.published}, category: ${eq.category})`);
  });
  
  // Check categories
  const categories = [...new Set(equipment.map(e => e.category))];
  console.log(`\nCategories found: ${categories.length}`);
  categories.forEach(cat => console.log(`- ${cat}`));
  
  // Check published vs unpublished
  const published = equipment.filter(e => e.published);
  const unpublished = equipment.filter(e => !e.published);
  console.log(`\nPublished: ${published.length}, Unpublished: ${unpublished.length}`);
}

debugDatabase();