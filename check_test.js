import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kyqwqjxynmqmkvpknzha.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5cXdxanh5bm1xbWt2cGtuemhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODE2NTksImV4cCI6MjA4OTY1NzY1OX0.SeHErFNxw91iG0eZF_7ZL5YD6UTpusbgtUyS93uilSw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConfig(name, metadata) {
  const email = `test_${Date.now()}_${name}@example.com`;
  const password = 'Password123!';
  
  console.log(`\n--- Testing: ${name} ---`);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: metadata ? { data: metadata } : undefined
  });
  
  if (error) {
    console.error(`Result for ${name}: FAILED`, error.message);
  } else {
    console.log(`Result for ${name}: SUCCESS`, data.user?.id);
  }
}

async function runAll() {
  // 1. No metadata
  await testConfig('NoMetadata', null);
  
  // 2. Name only
  await testConfig('NameOnly', { full_name: 'Name Only' });
  
  // 3. Complete metadata with ieee_member
  await testConfig('IeeeMember', {
    full_name: 'Test User',
    role: 'ieee_member',
    ias_status: 'none',
    membership_id: String(Math.floor(10000000 + Math.random() * 90000000)),
    subsection: 'Kochi',
    membership_expiry: '2026-12-31',
    is_guest: false
  });

  // 4. Complete metadata with non_ieee_member (guest)
  await testConfig('GuestMember', {
    full_name: 'Test Guest',
    role: 'non_ieee_member',
    ias_status: 'none',
    membership_id: null,
    subsection: null,
    membership_expiry: null,
    is_guest: true
  });
}

runAll();
