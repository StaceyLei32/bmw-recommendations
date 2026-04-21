import express from 'express';
import pg from 'pg';
import cors from 'cors';

const { Pool } = pg;
const app = express();
app.use(cors());

// Connects to cloud DB (Supabase)
const pool = new Pool({
  connectionString: 'postgresql://postgres:thewhitespace123!@db.hfhsqauawpgmtkzfwyxf.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

// Endpoint: dynamic map spots based on visitor telemetry
app.get('/api/spots', async (req, res) => {
  try {
    // We dynamically count how many driver_events happened at each place_id
    const placesQuery = await pool.query(`
      SELECT 
        p.*, 
        COUNT(de.id) as visitors 
      FROM places p
      LEFT JOIN driver_events de ON p.id = de.place_id
      GROUP BY p.id
    `);

    const itemsQuery = await pool.query(`SELECT * FROM place_items`);
    
    // Stitch items into the places
    const spots = placesQuery.rows.map(spot => {
      return {
        id: spot.id,
        name: spot.name,
        type: spot.type,
        category: spot.category,
        x: spot.lat,
        y: spot.lng,
        rating: Number(spot.rating),
        tagline: spot.tagline,
        peakHour: spot.peak_hour,
        avgSpend: spot.avg_spend,
        trend: spot.trend,
        visitors: Number(spot.visitors),
        items: itemsQuery.rows
          .filter(item => item.place_id === spot.id)
          .map(i => ({
             name: i.name,
             orders: i.orders_count,
             label: i.label,
             pct: i.pct,
             hot: i.is_hot
          }))
          .sort((a,b) => b.orders - a.orders)
      };
    });

    res.json(spots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB Error" });
  }
});

// Endpoint: Dynamic contextual suggestions
app.get('/api/discovery-features/:segment_id', async (req, res) => {
  const { segment_id } = req.params;
  const features = [];

  try {
    if (segment_id === 'pch_seg_22') {
      // Aggregate: What % of drivers opened their windows here?
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_drivers,
          COUNT(*) FILTER (WHERE window_status = 'open') as windows_open_count
        FROM driver_events
        WHERE road_segment_id = $1
      `, [segment_id]);
      
      const row = result.rows[0];
      const pct = Math.round((row.windows_open_count / row.total_drivers) * 100);
      
      if (pct > 50) {
        features.push({
          id: "df1", 
          title: "Roll Down Your Windows",
          stat: `${pct}% of drivers`, 
          statDetail: "roll windows down on this stretch",
          desc: "You're approaching the coastal overlook — ocean breeze and salt air ahead. 68°F and clear.",
          cta: "Lower Windows", icon: "◐", color: "#3DD6C8",
          context: "Weather · Scenic Route · Coastline"
        });
      }
    }

    if (segment_id === 'carmel_entry') {
      // Aggregate: What % of drivers switched to comfort mode here?
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_drivers,
          COUNT(*) FILTER (WHERE event_type = 'drive_mode_changed' AND action_value = 'comfort') as comfort_count
        FROM driver_events
        WHERE road_segment_id = $1
      `, [segment_id]);
      
      const row = result.rows[0];
      const pct = Math.round((row.comfort_count / row.total_drivers) * 100);
      
      if (pct > 60) {
        features.push({
          id: "df5", 
          title: "Switch to Comfort Mode",
          stat: `${pct}% of drivers`, 
          statDetail: "switch to Comfort entering the city",
          desc: "Approaching Carmel-by-the-Sea — lower speed zone, tighter streets. Comfort softens the ride.",
          cta: "Comfort Mode", icon: "◎", color: "#A87CE8",
          context: "City Zone · Speed Reduction",
        });
      }
    }

    res.json(features);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB Error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
