# BMW Research Prototype

This is the full-stack prototype for the BMW Research app, driving the contextual map suggestions and Trip Mode features. 

The application uses a Vite + React frontend and an Express API backend that connects to a live PostgreSQL database hosted on Supabase.

## Getting Started (Zero Setup)

To make collaboration as seamless as possible, the database connection is already securely configured to point to the live cloud database. There is **no local database setup or `.env` file required!**

To run the project locally:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the backend server**
   ```bash
   node server.js
   ```
   *(The API will start running on port 3000)*

3. **Start the frontend application**
   Open a new terminal window/tab and run:
   ```bash
   npm run dev
   ```
   *(This will start the Vite dev server, typically on port 5173, providing a localhost link to open the app in your browser)*

## 🗄️ Data Architecture & Supabase Integration

This prototype leverages a live **PostgreSQL database on Supabase** to simulate real-world, cloud-synced vehicle telemetry and crowdsourced recommendations.

### Simulated Telemetry & Dummy Data
Rather than relying on static JSON files, the application fetches live aggregated data from Supabase to demonstrate how a production environment would handle dynamic data points:
- **`driver_events`**: Stores raw, anonymized vehicle telemetry tied to specific road segments and places (e.g., `window_status`, `drive_mode`, `temperature`).
- **`places` & `place_items`**: Contains crowdsourced points of interest (food, scenic overlooks) along with their aggregated popularity metrics.
- **`visits`**: Records granular stop data, including engine dwell times, weather conditions, and active drive modes.

### Seeding the Database
The project includes a robust `seed.js` script that generates intelligent dummy data to make the UI feel alive. It simulates hundreds of individual driver events—such as calculating the percentage of drivers who switch to "Comfort" mode entering city limits or roll down their windows along coastal stretches—which directly powers the dynamic "Discover Your Car" map feature.

If you ever modify the schema or need to reset the data from scratch, you can run:

```bash
node seed.js
```

*(This script will seamlessly drop existing records, recreate the necessary tables on Supabase, and re-inject all the simulated telemetry!)*
