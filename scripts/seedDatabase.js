import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
  console.error("❌ Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SEED_COUNT = 10;

async function seed() {
  console.log(`🌱 Seeding database with ${SEED_COUNT} fake patients...`);

  const patients = Array.from({ length: SEED_COUNT }).map(() => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 70 }),
    condition: faker.helpers.arrayElement(['ACL Tear', 'Rotator Cuff Tendinitis', 'Lower Back Strain', 'Ankle Sprain', 'Post-Op Knee Replacement']),
    status: faker.helpers.arrayElement(['Active', 'Recovering', 'Discharged']),
    progress: faker.number.int({ min: 10, max: 100 }),
    sport: faker.helpers.arrayElement(['Football', 'Basketball', 'Tennis', 'Track & Field', 'Swimming', 'None']),
    last_session_date: faker.date.recent({ days: 10 }).toISOString(),
    next_session_date: faker.date.soon({ days: 5 }).toISOString(),
  }));

  const { data, error } = await supabase
    .from('patients')
    .insert(patients)
    .select();

  if (error) {
    console.error("❌ Error seeding database:", error);
  } else {
    console.log(`✅ Successfully inserted ${data.length} records!`);
  }
}

seed();
