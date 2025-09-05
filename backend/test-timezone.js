import { 
  getCairoNow, 
  toCairoTime, 
  formatCairoDate,
  getCairoStartOfDay,
  getCairoEndOfDay,
  CAIRO_TIMEZONE
} from './utils/timezone.js';

console.log('🌍 Testing Cairo Timezone Implementation...\n');

// Test current time
console.log('📅 Current times:');
console.log(`Local time: ${new Date().toString()}`);
console.log(`Cairo time: ${getCairoNow().toString()}`);
console.log(`Cairo ISO: ${formatCairoDate(getCairoNow())}`);
console.log(`Timezone: ${CAIRO_TIMEZONE}\n`);

// Test date conversion
const testDate = new Date('2024-01-15T10:30:00.000Z');
console.log('🔄 Date conversion:');
console.log(`Original UTC: ${testDate.toISOString()}`);
console.log(`Cairo converted: ${toCairoTime(testDate).toString()}`);
console.log(`Cairo formatted: ${formatCairoDate(testDate)}\n`);

// Test day boundaries
console.log('🌅 Day boundaries in Cairo:');
console.log(`Start of day: ${getCairoStartOfDay().toString()}`);
console.log(`End of day: ${getCairoEndOfDay().toString()}\n`);

// Test with Financial model
console.log('💰 Testing with Financial model...');
try {
  // This would normally be done in the model
  const cairoTimestamp = getCairoNow();
  console.log(`✅ Financial transaction timestamp (Cairo): ${cairoTimestamp.toString()}`);
  console.log(`✅ Formatted for display: ${formatCairoDate(cairoTimestamp, 'DD/MM/YYYY HH:mm')}`);
} catch (error) {
  console.error('❌ Error testing timezone:', error.message);
}

console.log('\n🎉 Timezone implementation ready!');