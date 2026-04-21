import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:thewhitespace123!@db.hfhsqauawpgmtkzfwyxf.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runSeed() {
  const client = await pool.connect();
  try {
    console.log("Setting up driver_events table...");
    // 1. Create driver_events table and then alter to add missing context fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS driver_events (
        id serial PRIMARY KEY,
        trip_id text,
        place_id text,
        road_segment_id text,
        event_type text,
        action_value text,
        temperature_f int,
        weather_condition text
      );
    `);
    const alterCommands = `
      ALTER TABLE driver_events ADD COLUMN IF NOT EXISTS window_status text;
      ALTER TABLE driver_events ADD COLUMN IF NOT EXISTS roof_status text;
      ALTER TABLE driver_events ADD COLUMN IF NOT EXISTS exhaust_valves_open boolean;
      ALTER TABLE driver_events ADD COLUMN IF NOT EXISTS seat_heater_level int;
      ALTER TABLE driver_events ADD COLUMN IF NOT EXISTS audio_volume_pct int;
      ALTER TABLE driver_events ADD COLUMN IF NOT EXISTS cruise_control_active boolean;
      ALTER TABLE driver_events ADD COLUMN IF NOT EXISTS audio_system_active boolean;
    `;
    await client.query(alterCommands);

    console.log("Creating visits table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id serial PRIMARY KEY,
        place_id text,
        engine_off_at timestamptz,
        engine_on_at timestamptz,
        dwell_minutes int,
        item_name text,
        drive_mode text,
        window_status text,
        temperature_f int,
        weather_condition text,
        created_at timestamptz DEFAULT now()
      );
    `);

    console.log("Creating map spots tables...");
    // 2. Create tables for Map Spots
    await client.query(`
      CREATE TABLE IF NOT EXISTS places (
        id text PRIMARY KEY,
        name text,
        type text,
        category text,
        tagline text,
        lat double precision,
        lng double precision,
        rating numeric(3, 2),
        peak_hour text,
        avg_spend text,
        trend text
      );

      CREATE TABLE IF NOT EXISTS place_items (
        id serial PRIMARY KEY,
        place_id text REFERENCES places(id),
        name text,
        label text,
        orders_count int,
        is_hot boolean,
        pct int
      );
    `);

    // 3. Clear old data to prevent dupes during multiple runs
    await client.query(`DELETE FROM place_items`);
    await client.query(`DELETE FROM places`);
    await client.query(`DELETE FROM driver_events`);

    // 4. Insert Places Data
    console.log("Inserting map places...");
    const mapSpots = [
      { id:"spot1", name:"Boba Guys", type:"food", x:32, y:22, visitors:94, rating:4.8, category:"Boba & Tea", tagline:"Most visited boba spot on this route", peakHour:"2–4 PM", avgSpend:"$7.40", trend:"+23% this week", items: [{ name:"Classic Milk Tea", orders:312, pct:38, hot:true }, { name:"Strawberry Matcha", orders:198, pct:24 }] },
      { id:"spot2", name:"Duarte's Tavern", type:"food", x:28, y:38, visitors:203, rating:4.6, category:"Restaurant", tagline:"Legendary artichoke soup since 1894", peakHour:"12–1:30 PM", avgSpend:"$28.50", trend:"+8% this week", items: [{ name:"Cream of Artichoke Soup", orders:589, pct:42, hot:true }] },
      { id:"spot3", name:"Hawk Hill Overlook", type:"scenic", x:42, y:12, visitors:631, rating:4.9, category:"Scenic Viewpoint", tagline:"#1 photo spot for BMW drivers on PCH", peakHour:"5:30–7 PM", avgSpend:"Free", trend:"+15% this week", items: [{ name:"Golden Gate photo", orders:1842, pct:45, hot:true, label:"photos" }]}
    ];

    for (const spot of mapSpots) {
      await client.query(`
        INSERT INTO places (id, name, type, category, tagline, lat, lng, rating, peak_hour, avg_spend, trend) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [spot.id, spot.name, spot.type, spot.category, spot.tagline, spot.x, spot.y, spot.rating, spot.peakHour, spot.avgSpend, spot.trend]);

      for (const item of spot.items) {
         await client.query(`
           INSERT INTO place_items (place_id, name, label, orders_count, is_hot, pct)
           VALUES ($1, $2, $3, $4, $5, $6)
         `, [spot.id, item.name, item.label || 'orders', item.orders, item.hot || false, item.pct]);
      }
      
      // Simulate visitors for the aggregation
      console.log(`Generating ${spot.visitors} driver_events for ${spot.name}...`);
      let values = [];
      for(let i=0; i<spot.visitors; i++) {
        // Just raw SQL insert to mock visitor
        await client.query(`INSERT INTO driver_events (trip_id, place_id) VALUES ($1, $2)`, [`trip_${Math.random().toString(36).substring(7)}`, spot.id]);
      }
    }

    // 5. Insert mock driver events on roads to test the aggregation logic
    console.log("Generating road segment driving events for discovery features...");
    // PCH SEGMENT 22 - For Window Roll Down (let's say 20 total pass throughs, 15 roll down window = 75%)
    for(let i=0; i<20; i++) {
      const windowOpen = i < 15 ? 'open' : 'closed';
      await client.query(`
        INSERT INTO driver_events (trip_id, road_segment_id, window_status, temperature_f, weather_condition)
        VALUES ('trip_pch_w_${i}', 'pch_seg_22', $1, 68, 'clear')
      `, [windowOpen]);
    }

    // CARMEL CITY ZONE - For Comfort Mode (let's say 30 total pass, 24 switch to comfort = 80%)
    for(let i=0; i<30; i++) {
      await client.query(`
        INSERT INTO driver_events (trip_id, road_segment_id, event_type, action_value)
        VALUES ('trip_carmel_c_${i}', 'carmel_entry', $1, $2)
      `, [i < 24 ? 'drive_mode_changed' : 'keep_speed', i < 24 ? 'comfort' : null]);
    }

    console.log("Database seeded completely!");
  } catch (e) {
    console.error("Error seeding DB:", e);
  } finally {
    client.release();
    pool.end();
  }
}

runSeed();
