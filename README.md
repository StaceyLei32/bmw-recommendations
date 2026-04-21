# BMW Research Prototype

This is the backend and API for the BMW Research app, driving the contextual map suggestions and Trip Mode features. 

The API uses an Express server and connects to a live PostgreSQL database hosted on Supabase.

## 🚀 Getting Started (Zero Setup)

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

## 🗄️ Database Management

The database is populated with mock place locations (e.g., Boba Guys, Hawk Hill) and simulated driver events (e.g., opening windows over coastal roads). 

If you ever modify the mock data structures or need to reset the database from scratch, you can run the seed script:

```bash
node seed.js
```

This script will seamlessly recreate the tables on Supabase and re-inject all the mock data!
