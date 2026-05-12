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

## 🗄️ Database Management

The database is populated with mock place locations (e.g., Boba Guys, Hawk Hill) and simulated driver events (e.g., opening windows over coastal roads). 

If you ever modify the mock data structures or need to reset the database from scratch, you can run the seed script:

```bash
node seed.js
```

This script will seamlessly recreate the tables on Supabase and re-inject all the mock data!
