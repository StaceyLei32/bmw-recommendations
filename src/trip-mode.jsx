import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════
   TWO APPS: Trip Mode + Recommendations (Map-based)
   Aesthetic: Dark automotive HMI / cockpit instrument
   ═══════════════════════════════════════════════════ */

const A = "#E8A838";
const AD = "#E8A83820";
const T = "#3DD6C8";
const R = "#E8574A";
const O = "#E87C4A";
const P = "#A87CE8";
const SRF = "rgba(14,165,255,0.07)";
const BDR = "rgba(14,165,255,0.18)";
/* BMW blue palette */
const EB  = "#0EA5FF";   // electric blue
const EBD = "rgba(14,165,255,0.18)";
const EBS = "rgba(14,165,255,0.07)";
const NBG = "#060C1A";   // navy background
const NPL = "rgba(8,18,48,0.9)"; // navy panel

/* ── Data ── */

const initCars = [
  { id:"c1", name:"Marcus W.", car:"M4 Competition", avatar:"MW", accent:A, status:"driving", speed:71, eta:"3:42 PM", dist:0, isLeader:true, fuel:72,
    homePos:{x:22,y:9}, tripPos:{x:65,y:74} },
  { id:"c2", name:"Priya S.", car:"iX M60", avatar:"PS", accent:T, status:"driving", speed:69, eta:"3:44 PM", dist:0.3, isLeader:false, fuel:58,
    homePos:{x:25,y:11}, tripPos:{x:62,y:71} },
  { id:"c3", name:"Tyler K.", car:"M340i", avatar:"TK", accent:O, status:"fuel_stop", speed:0, eta:"3:55 PM", dist:2.1, isLeader:false, fuel:11,
    homePos:{x:20,y:15}, tripPos:{x:55,y:67} },
  { id:"c4", name:"Noa R.", car:"X3 M40i", avatar:"NR", accent:P, status:"resting", speed:0, eta:"4:05 PM", dist:4.8, isLeader:false, fuel:44,
    homePos:{x:27,y:17}, tripPos:{x:50,y:62} },
];

const initItinerary = [
  { id:"s1", time:"09:00", label:"Depart — Downtown Berkeley BART", sub:"Assembly point, Shattuck & Center", done:true },
  { id:"s2", time:"09:45", label:"Cheeseboard Pizza", sub:"Quick stop, Gourmet Ghetto", done:true },
  { id:"s3", time:"10:30", label:"UC Berkeley Campus Loop", sub:"North Gate → Campanile", done:true },
  { id:"s4", time:"11:30", label:"Claremont Canyon Ascent", sub:"Sport mode — twisty switchbacks", done:false, active:true },
  { id:"s5", time:"12:30", label:"Grizzly Peak Blvd", sub:"Ridgeline views, 5.6 mi", done:false },
  { id:"s6", time:"13:30", label:"Arrive Tilden Regional Park", sub:"Lake Anza & Nimitz Way Trail", done:false },
];

const initMsgs = [
  { id:1, who:"Marcus W.", text:"Rolling out! Keep radios on ch.4 as backup.", ts:"09:02", kind:"msg", avatar:"MW", accent:A },
  { id:2, who:"sys", text:"Trip started — 4 cars joined.", ts:"09:03", kind:"sys" },
  { id:3, who:"sys", text:"⛽ Tyler K. pulling into Chevron — +12 min ETA.", ts:"11:48", kind:"alert" },
  { id:4, who:"Priya S.", text:"Beautiful morning for this. Let's go! 🌊", ts:"09:15", kind:"msg", avatar:"PS", accent:T },
  { id:5, who:"Tyler K.", text:"Fueled up — back in 5.", ts:"12:02", kind:"msg", avatar:"TK", accent:O },
  { id:6, who:"sys", text:"😴 Noa R. resting. ETA → 4:05 PM.", ts:"13:20", kind:"alert" },
];

const mapSpots = [
  {
    id:"spot1", name:"Cheeseboard Pizza", type:"food", x:32, y:22,
    visitors:287, rating:4.9, category:"Pizza & Bakery",
    tagline:"Worker-owned collective — always a line, always worth it",
    items:[
      { name:"Daily Veggie Pizza", orders:534, pct:44, hot:true },
      { name:"Cheese Board Selection", orders:298, pct:25 },
      { name:"Sourdough Loaf", orders:178, pct:15 },
      { name:"Croissant", orders:112, pct:9 },
      { name:"Cookie", orders:89, pct:7 },
    ],
    peakHour:"12–1:30 PM", avgSpend:"$9", trend:"+18% this week", waitMinutes:20, fitScore:88,
    tips:[
      { text:"The daily pizza changes — follow their IG for a heads up.", by:"The Weekend Wanderer" },
      { text:"Get there 15 min before opening or the line wraps the block.", by:"The Efficiency Optimizer" },
    ],
    popularity:{ bestDay:"Friday", grid:[[0,2,2,0],[0,2,2,0],[0,2,2,0],[0,3,3,0],[0,3,3,1],[1,3,3,2],[0,3,3,1]] },
  },
  {
    id:"spot2", name:"Chez Panisse", type:"food", x:28, y:38,
    visitors:178, rating:4.8, category:"Farm-to-Table",
    tagline:"Alice Waters' iconic restaurant — California cuisine birthplace",
    items:[
      { name:"Prix Fixe Dinner", orders:389, pct:46, hot:true },
      { name:"Café Lunch", orders:234, pct:28 },
      { name:"Seasonal Tasting Menu", orders:134, pct:16 },
      { name:"Wine Pairing", orders:84, pct:10 },
    ],
    peakHour:"7–9 PM", avgSpend:"$115", trend:"Steady", waitMinutes:0, fitScore:82,
    tips:[
      { text:"Book at least 4 weeks ahead — the café downstairs is easier.", by:"The Road Captain" },
      { text:"Café menu is half the price and just as good.", by:"The Efficiency Optimizer" },
    ],
    popularity:{ bestDay:"Saturday", grid:[[0,0,1,1],[0,0,1,1],[0,0,1,1],[0,0,1,2],[0,0,2,2],[0,0,2,2],[0,0,2,2]] },
  },
  {
    id:"spot3", name:"Campanile (Sather Tower)", type:"scenic", x:42, y:12,
    visitors:631, rating:4.9, category:"Landmark & Viewpoint",
    tagline:"Best 360° view of the Bay Area — SF, Oakland, Marin",
    items:[
      { name:"Tower visit + bay view", orders:1842, pct:48, hot:true, label:"visits" },
      { name:"Carillon concert (noon)", orders:523, pct:14, label:"visits" },
      { name:"Sunset panorama", orders:412, pct:11, label:"visits" },
      { name:"Campus photo tour", orders:367, pct:10, label:"visits" },
      { name:"Drone footage", orders:201, pct:5, label:"clips" },
    ],
    peakHour:"12–1 PM", avgSpend:"$3", trend:"+12% this month", waitMinutes:10, fitScore:96,
    tips:[
      { text:"Noon carillon concert every day — worth timing your visit.", by:"The Spirited Tourer" },
      { text:"Climb to the top for the bay view. $3 is worth every penny.", by:"The Weekend Wanderer" },
    ],
    popularity:{ bestDay:"Saturday", grid:[[0,2,3,2],[0,2,3,2],[0,2,3,2],[0,2,3,2],[1,3,3,2],[1,3,3,3],[1,3,3,2]] },
  },
  {
    id:"spot4", name:"Top Dog", type:"food", x:62, y:58,
    visitors:203, rating:4.6, category:"Hot Dogs & Sausages",
    tagline:"Berkeley institution since 1966 — open until 2 AM",
    items:[
      { name:"Polish Sausage", orders:445, pct:38, hot:true },
      { name:"Hot Link", orders:312, pct:27 },
      { name:"Italian Sausage", orders:201, pct:17 },
      { name:"Frankfurter", orders:134, pct:11 },
      { name:"Turkey Dog", orders:84, pct:7 },
    ],
    peakHour:"12–2 PM & 10 PM–2 AM", avgSpend:"$6", trend:"+8% this week", waitMinutes:8, fitScore:79,
    tips:[
      { text:"Late night after a show at the Greek is the move.", by:"The Weekend Wanderer" },
      { text:"Cash only. Polish sausage with mustard — that's the order.", by:"The Road Captain" },
    ],
    popularity:{ bestDay:"Friday", grid:[[0,2,1,1],[0,2,1,1],[0,2,1,1],[0,2,2,2],[1,2,2,3],[1,2,2,3],[0,2,2,3]] },
  },
  {
    id:"spot5", name:"The Greek Theatre", type:"event", x:70, y:68,
    visitors:445, rating:4.8, category:"Concert Venue",
    tagline:"Outdoor amphitheater — iconic Berkeley summer concerts",
    items:[
      { name:"Concert / Live Show", orders:1234, pct:65, hot:true, label:"events" },
      { name:"Graduation Ceremony", orders:312, pct:16, label:"events" },
      { name:"Comedy Show", orders:189, pct:10, label:"events" },
      { name:"Special Event", orders:178, pct:9, label:"events" },
    ],
    peakHour:"7–10 PM", avgSpend:"$65", trend:"+28% this month", waitMinutes:0, fitScore:92,
    tips:[
      { text:"Section C has the best sound and sightlines.", by:"The Spirited Tourer" },
      { text:"Arrive via Gayley Rd — much less traffic than the main entrance.", by:"The Efficiency Optimizer" },
    ],
    popularity:{ bestDay:"Saturday", grid:[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,1,1],[0,0,2,2],[1,1,3,3],[1,1,2,2]] },
  },
  {
    id:"spot6", name:"Bongo Burger", type:"food", x:18, y:30,
    visitors:312, rating:4.5, category:"Burgers & Shakes",
    tagline:"Berkeley's favorite no-frills burger — cash only",
    items:[
      { name:"Double Cheeseburger", orders:623, pct:38, hot:true },
      { name:"Vanilla Shake", orders:389, pct:24 },
      { name:"Bacon Burger", orders:267, pct:16 },
      { name:"Veggie Burger", orders:234, pct:14 },
      { name:"Chili Cheese Fries", orders:134, pct:8 },
    ],
    peakHour:"12–1:30 PM", avgSpend:"$12", trend:"+6% this week", waitMinutes:10, fitScore:77,
    tips:[
      { text:"Cash only, ATM on-site. The double with special sauce is the pick.", by:"The Road Captain" },
      { text:"Lunch rush is real — go before noon or after 1:30.", by:"The Efficiency Optimizer" },
    ],
    popularity:{ bestDay:"Thursday", grid:[[0,2,2,0],[0,2,2,0],[0,3,3,0],[0,3,3,0],[0,3,3,1],[0,2,2,0],[0,1,1,0]] },
  },
  {
    id:"spot7", name:"Tilden Regional Park", type:"scenic", x:38, y:32,
    visitors:412, rating:4.9, category:"Regional Park",
    tagline:"Hidden gem above Berkeley — trails, lake, and bay views",
    items:[
      { name:"Nimitz Way Trail", orders:623, pct:32, hot:true, label:"visits" },
      { name:"Lake Anza swim", orders:412, pct:21, label:"visits" },
      { name:"Grizzly Peak overlook", orders:389, pct:20, label:"visits" },
      { name:"Botanical Garden", orders:312, pct:16, label:"visits" },
      { name:"Steam Train ride", orders:201, pct:11, label:"rides" },
    ],
    peakHour:"9 AM–12 PM", avgSpend:"Free", trend:"+14% this month", waitMinutes:0, fitScore:94,
    tips:[
      { text:"Drive Grizzly Peak Blvd at dusk — Bay Area city lights coming on.", by:"The Spirited Tourer" },
      { text:"Roads up here are twisty and mostly empty — sport mode territory.", by:"The Performance Seeker" },
    ],
    popularity:{ bestDay:"Sunday", grid:[[0,1,2,1],[0,1,2,1],[0,1,2,1],[0,2,3,2],[1,3,3,2],[1,3,3,2],[1,3,3,2]] },
  },
  {
    id:"spot8", name:"CREAM", type:"food", x:78, y:74,
    visitors:178, rating:4.5, category:"Ice Cream & Desserts",
    tagline:"Build your own cookie sandwich — Telegraph Ave staple",
    items:[
      { name:"Cookie Sandwich", orders:534, pct:52, hot:true },
      { name:"Ice Cream Cup", orders:234, pct:23 },
      { name:"Cookie Only", orders:156, pct:15 },
      { name:"Vegan Options", orders:104, pct:10 },
    ],
    peakHour:"2–5 PM", avgSpend:"$6", trend:"+11% this week", waitMinutes:6, fitScore:73,
    tips:[
      { text:"Snickerdoodle + vanilla is the classic combo.", by:"The Weekend Wanderer" },
      { text:"Line moves fast — don't let the queue scare you off.", by:"The Efficiency Optimizer" },
    ],
    popularity:{ bestDay:"Saturday", grid:[[0,1,1,0],[0,1,1,0],[0,1,1,0],[0,1,2,1],[0,2,3,2],[0,2,3,2],[0,2,3,2]] },
  },
];

const discoveryFeatures = [
  {
    id:"df1", title:"Roll Down Your Windows",
    stat:"73% of drivers", statDetail:"roll windows down on this stretch",
    desc:"You're approaching the coastal overlook — ocean breeze and salt air ahead. 68°F and clear.",
    cta:"Lower Windows", icon:"◐", color:T,
    context:"Weather · Scenic Route · Coastline",
  },
  {
    id:"df2", title:"Activate Sport Mode",
    stat:"87% of drivers", statDetail:"switch to Sport on this road",
    desc:"Pacific Coast Highway's curves are a favorite for spirited driving. Sharper throttle, tighter steering.",
    cta:"Try Sport Mode", icon:"◉", color:A,
    context:"Twisty Road · Elevation Change",
  },
  {
    id:"df3", title:"Open Panoramic Roof",
    stat:"61% of drivers", statDetail:"open their roof on this route",
    desc:"Clear skies and redwood canopy ahead. Let the scenery in from above.",
    cta:"Open Roof", icon:"◇", color:"#6BC5E8",
    context:"Clear Weather · Scenic · Daytime",
  },
  {
    id:"df4", title:"Tunnel Mode — Exhaust + Windows",
    stat:"92% of M drivers", statDetail:"pop their exhaust in tunnels",
    desc:"You're 0.4 mi from Devil's Slide Tunnel. Hear that M exhaust echo — windows down, sport exhaust on.",
    cta:"Activate Tunnel Mode", icon:"▣", color:O,
    context:"Tunnel Ahead · M Vehicle Detected",
  },
  {
    id:"df5", title:"Switch to Comfort Mode",
    stat:"78% of drivers", statDetail:"switch to Comfort entering the city",
    desc:"Approaching Carmel-by-the-Sea — lower speed zone, tighter streets. Comfort softens the ride.",
    cta:"Comfort Mode", icon:"◎", color:P,
    context:"City Zone · Speed Reduction",
  },
  {
    id:"df6", title:"Ambient Lighting — Sunset",
    stat:"54% of drivers", statDetail:"change ambient lighting at dusk",
    desc:"Golden hour on the coast. Match your cabin mood — warm amber or deep twilight.",
    cta:"Set Sunset Mode", icon:"✦", color:"#E8C438",
    context:"Sunset · Evening Drive · Scenic",
  },
  {
    id:"df7", title:"Turn On Heated Seats",
    stat:"82% of morning drivers", statDetail:"use heated seats before 9 AM",
    desc:"It's 52°F outside with coastal fog. Warm up before the drive.",
    cta:"Heat Seats", icon:"◈", color:"#E86838",
    context:"Morning · Cold · Fog Detected",
  },
  {
    id:"df8", title:"Start Driving Recorder",
    stat:"44% of drivers", statDetail:"record this stretch of road",
    desc:"Bixby Bridge is 2 mi ahead — one of the most photographed roads in California.",
    cta:"Start Recording", icon:"●", color:R,
    context:"Scenic Highlight · Landmark Ahead",
  },
  {
    id:"df9", title:"Surround Sound — Highway",
    stat:"68% of drivers", statDetail:"turn up the audio system here",
    desc:"Long straight with ocean views. Let the Harman Kardon system fill the cabin.",
    cta:"Optimize Audio", icon:"♫", color:"#38C8E8",
    context:"Highway · Straight Road · Cruising",
  },
  {
    id:"df10", title:"Adaptive Cruise Control",
    stat:"71% of drivers", statDetail:"enable cruise control on this merge",
    desc:"Merging onto Hwy 1 southbound. Let the car handle speed and distance in the convoy.",
    cta:"Enable Cruise", icon:"◌", color:"#88C878",
    context:"Highway Merge · Convoy · Steady Speed",
  },
];

const typeColors = { food:T, scenic:A, event:P, service:O };
const typeIcons = { food:"◉", scenic:"✦", event:"▣", service:"⚙" };

const pinScale = v => v >= 500 ? 50 : v >= 350 ? 44 : v >= 200 ? 38 : v >= 120 ? 32 : 28;
const pinGlow = (v, col) => {
  if (v >= 500) return `0 0 18px ${col}60, 0 0 36px ${col}30`;
  if (v >= 350) return `0 0 14px ${col}50, 0 0 28px ${col}22`;
  if (v >= 200) return `0 0 10px ${col}38, 0 0 20px ${col}15`;
  return `0 0 6px ${col}22`;
};

/* ── Shared Components ── */

const Badge = ({ text, color="#888", bg=SRF }) => (
  <span style={{ fontSize:9, fontWeight:700, letterSpacing:0.8, textTransform:"uppercase", color, background:bg, padding:"3px 7px", borderRadius:4, border:`1px solid ${color}33` }}>{text}</span>
);

const Toggle = ({ on, onFlip, color=A }) => (
  <button onClick={onFlip} style={{ width:42, height:22, borderRadius:11, border:"none", background:on?color:"rgba(255,255,255,0.08)", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
    <span style={{ position:"absolute", top:2, left:on?22:2, width:18, height:18, borderRadius:9, background:on?"#111":"#666", transition:"all 0.2s", boxShadow:on?`0 0 6px ${color}66`:"none" }}/>
  </button>
);

const stCfg = { driving:{ label:"En Route", color:T }, fuel_stop:{ label:"Fuel Stop", color:O }, resting:{ label:"Rest Stop", color:P } };

/* ════════════════════════════
   APP 1: TRIP MODE
   ════════════════════════════ */

const TripModeApp = () => {
  const [tab, setTab] = useState("convoy");
  const [cars, setCars] = useState(initCars);
  const [itin, setItin] = useState(initItinerary);
  const [msgs, setMsgs] = useState(initMsgs);
  const [input, setInput] = useState("");
  const [elapsed, setElapsed] = useState(18420);
  const [tripStarted, setTripStarted] = useState(false);
  const endRef = useRef(null);

  const stopPositions = {
    s1:{x:22,y:9}, s2:{x:17,y:22}, s3:{x:28,y:52},
    s4:{x:63,y:74}, s5:{x:68,y:79}, s6:{x:76,y:83},
  };

  useEffect(() => { const t = setInterval(() => setElapsed(e => e+1), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const setLeader = id => setCars(p => p.map(c => ({...c, isLeader:c.id===id})));
  const toggleStop = id => {
    setItin(prev => {
      const u = prev.map(s => s.id===id ? {...s, done:!s.done, active:false} : s);
      const nxt = u.find(s => !s.done);
      return nxt ? u.map(s => ({...s, active:s.id===nxt.id})) : u;
    });
  };
  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p, { id:Date.now(), who:"You", text:input.trim(), ts:"Now", kind:"msg", avatar:"YU", accent:A }]);
    setInput("");
    setTimeout(() => setMsgs(p => [...p, { id:Date.now()+1, who:"sys", text:"📡 Broadcast to 4 cars.", ts:"Now", kind:"sys" }]), 600);
  };

  const leader = cars.find(c => c.isLeader);
  const tabs = [{ id:"map", label:"Map", icon:"◌" }, { id:"convoy", label:"Convoy", icon:"◉" }, { id:"route", label:"Route", icon:"◈" }, { id:"chat", label:"Chat", icon:"◎" }];

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:9, fontWeight:800, letterSpacing:3, color:A, textTransform:"uppercase", marginBottom:8 }}>◉ Trip Mode</div>
        <h2 style={{ fontFamily:"'Anybody',sans-serif", fontSize:22, fontWeight:800, margin:0, color:"#F5F5F5", letterSpacing:-0.5 }}>Berkeley Hills Drive</h2>
        <div style={{ display:"flex", gap:0, marginTop:12, padding:"10px 0", background:SRF, border:`1px solid ${BDR}`, borderRadius:10, justifyContent:"space-around" }}>
          {[["ELAPSED", fmt(elapsed), A], ["CONVOY", `${cars.length} cars`, "#DDD"], ["ETA", leader?.eta, "#DDD"], ["STOPS", `${itin.filter(s=>s.done).length}/${itin.length}`, "#DDD"]].map(([l,v,c]) => (
            <div key={l} style={{ textAlign:"center", padding:"0 8px" }}>
              <div style={{ fontSize:9, color:"#555", fontWeight:600, letterSpacing:0.5, marginBottom:2 }}>{l}</div>
              <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:13, fontWeight:700, color:c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", gap:4, marginBottom:18, padding:3, background:"rgba(255,255,255,0.02)", borderRadius:11, border:`1px solid ${BDR}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5,
            padding:"9px 12px", borderRadius:8, border:"none",
            background:tab===t.id?`${A}15`:"transparent", color:tab===t.id?A:"#555",
            fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", transition:"all 0.2s",
          }}>
            <span style={{ fontFamily:"'Anybody',sans-serif", fontSize:11 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === "convoy" && (
        <div className="fade-in">
          <div style={{ background:`linear-gradient(135deg,${A}14,transparent)`, border:`1px solid ${A}30`, borderRadius:14, padding:"14px 18px", marginBottom:14 }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:A, textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:4 }}>Designated Leader</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#F2F2F2" }}>{leader?.name} <span style={{ fontSize:12, color:"#888", fontWeight:400 }}>· {leader?.car}</span></div>
            <div style={{ fontSize:11, color:"#555", marginTop:4 }}>Navigation syncs from this car. Tap below to reassign.</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {cars.map(c => (
              <div key={c.id} onClick={()=>setLeader(c.id)} style={{ display:"flex", alignItems:"center", gap:14, cursor:"pointer", background:c.isLeader?`${A}0C`:SRF, border:`1px solid ${c.isLeader?A+"35":BDR}`, borderRadius:14, padding:"14px 16px", transition:"all 0.25s" }}>
                <div style={{ width:40, height:40, borderRadius:10, background:`${c.accent}25`, border:`1.5px solid ${c.accent}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:c.accent, fontFamily:"'Anybody',sans-serif", flexShrink:0 }}>{c.avatar}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}><span style={{ fontSize:13, fontWeight:600, color:"#EEE" }}>{c.name}</span>{c.isLeader && <Badge text="Leader" color={A} bg={AD}/>}</div>
                  <div style={{ fontSize:11, color:"#777", marginBottom:4 }}>{c.car}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:10, fontWeight:600, color:stCfg[c.status]?.color, padding:"2px 8px", borderRadius:20, background:`${stCfg[c.status]?.color}18` }}>
                      <span style={{ width:5, height:5, borderRadius:"50%", background:stCfg[c.status]?.color, animation:c.status==="driving"?"blink 2s infinite":"none" }}/>{stCfg[c.status]?.label}
                    </span>
                    {c.dist > 0 && <span style={{ fontSize:10, color:"#555" }}>{c.dist} mi back</span>}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:20, fontWeight:700, color:c.speed>0?"#F0F0F0":"#444" }}>{c.speed>0?c.speed:"—"}</div>
                  <div style={{ fontSize:9, color:"#555" }}>{c.speed>0?"MPH":""}</div>
                  <div style={{ width:44, height:3, borderRadius:2, background:"rgba(255,255,255,0.06)", marginTop:4, overflow:"hidden" }}><div style={{ height:"100%", borderRadius:2, width:`${c.fuel}%`, background:c.fuel<20?R:c.fuel<40?A:T }}/></div>
                  <div style={{ fontSize:8, color:"#555", marginTop:2 }}>{c.fuel}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "route" && (
        <div className="fade-in">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:A, textTransform:"uppercase", fontFamily:"'Anybody',sans-serif" }}>Shared Itinerary</div>
            <div style={{ fontSize:10, color:"#555", background:SRF, border:`1px solid ${BDR}`, padding:"4px 10px", borderRadius:8 }}>Synced · 4 cars</div>
          </div>
          {itin.map((s,i) => (
            <div key={s.id} style={{ display:"flex", gap:14, position:"relative" }}>
              {i < itin.length-1 && <div style={{ position:"absolute", left:16, top:34, bottom:-4, width:1.5, background:s.done?`${T}40`:BDR }}/>}
              <div onClick={()=>toggleStop(s.id)} style={{ width:34, height:34, borderRadius:10, flexShrink:0, cursor:"pointer", background:s.done?`${T}18`:s.active?`${A}15`:SRF, border:`1.5px solid ${s.done?T+"50":s.active?A+"40":BDR}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:s.done?14:11, color:s.done?T:s.active?A:"#555", fontWeight:700, transition:"all 0.25s" }}>{s.done?"✓":"◉"}</div>
              <div style={{ flex:1, paddingBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}><span style={{ fontFamily:"'Anybody',sans-serif", fontSize:11, fontWeight:600, color:s.active?A:"#555" }}>{s.time}</span>{s.active && <Badge text="Next" color={A} bg={AD}/>}</div>
                <div style={{ fontSize:13.5, fontWeight:600, color:s.done?"#555":"#E8E8E8", textDecoration:s.done?"line-through":"none", marginBottom:2 }}>{s.label}</div>
                <div style={{ fontSize:11.5, color:"#666" }}>{s.sub}</div>
              </div>
            </div>
          ))}
          <div style={{ textAlign:"center", fontSize:10, color:"#444", marginTop:8, fontStyle:"italic" }}>Tap circles to mark complete</div>
        </div>
      )}

      {tab === "chat" && (
        <div className="fade-in" style={{ display:"flex", flexDirection:"column", height:400 }}>
          <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:8, paddingRight:4 }}>
            {msgs.map(m => {
              if (m.kind==="sys") return <div key={m.id} style={{ textAlign:"center", fontSize:11, color:"#555", padding:"4px 0", fontStyle:"italic" }}>{m.text}</div>;
              if (m.kind==="alert") return <div key={m.id} style={{ background:`${O}10`, border:`1px solid ${O}25`, borderRadius:12, padding:"10px 14px", fontSize:12, color:"#CCC" }}>{m.text}<div style={{ fontSize:9, color:"#555", marginTop:3 }}>{m.ts}</div></div>;
              const me = m.who==="You";
              return (
                <div key={m.id} style={{ display:"flex", gap:10, alignSelf:me?"flex-end":"flex-start", flexDirection:me?"row-reverse":"row", maxWidth:"82%" }}>
                  <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:`${m.accent}25`, border:`1px solid ${m.accent}35`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700, color:m.accent, fontFamily:"'Anybody',sans-serif" }}>{m.avatar}</div>
                  <div>
                    <div style={{ fontSize:10, color:"#555", marginBottom:2, textAlign:me?"right":"left" }}>{m.who} · {m.ts}</div>
                    <div style={{ background:me?`${A}18`:SRF, border:`1px solid ${me?A+"30":BDR}`, borderRadius:12, padding:"9px 13px", fontSize:13, color:"#DDD", lineHeight:1.45 }}>{m.text}</div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef}/>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Broadcast to convoy..."
              style={{ flex:1, background:SRF, border:`1px solid ${BDR}`, borderRadius:10, padding:"10px 14px", color:"#EEE", fontSize:13, fontFamily:"'Instrument Sans',sans-serif", outline:"none" }}/>
            <button onClick={send} style={{ background:A, border:"none", borderRadius:10, padding:"10px 20px", color:"#111", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>Send</button>
          </div>
        </div>
      )}

      {tab === "map" && (
        <div className="fade-in">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:A, textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:2 }}>{tripStarted ? "◉ Live Convoy" : "Pre-Trip"}</div>
              <div style={{ fontSize:12, color:"#666" }}>{tripStarted ? "Real-time positions · PCH" : "4 cars · Ready to depart"}</div>
            </div>
            {tripStarted ? (
              <div style={{ display:"flex", alignItems:"center", gap:6, background:`${T}10`, border:`1px solid ${T}25`, borderRadius:8, padding:"7px 14px" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:T, animation:"blink 2s infinite", display:"inline-block", flexShrink:0 }}/>
                <span style={{ fontSize:11, fontWeight:700, color:T }}>Trip Active</span>
              </div>
            ) : (
              <button onClick={()=>setTripStarted(true)} style={{ background:A, border:"none", borderRadius:10, padding:"9px 22px", color:"#111", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>Start Trip →</button>
            )}
          </div>

          <div style={{ position:"relative", width:"100%", height:440, borderRadius:16, overflow:"hidden", background:"linear-gradient(160deg, #040A1C 0%, #060E22 40%, #081426 100%)", border:`1px solid ${BDR}` }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.07 }}>
              {[10,20,30,40,50,60,70,80,90].map(v=><line key={`h${v}`} x1="0" y1={v} x2="100" y2={v} stroke="white" strokeWidth="0.1"/>)}
              {[10,20,30,40,50,60,70,80,90].map(v=><line key={`v${v}`} x1={v} y1="0" x2={v} y2="100" stroke="white" strokeWidth="0.1"/>)}
            </svg>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
              <path d="M 22,9 C 20,15 18,22 17,30 C 16,38 22,46 28,53 C 34,59 40,63 50,67 C 58,70 63,73 66,76 C 70,79 73,81 76,84" fill="none" stroke={A} strokeWidth="5" strokeLinecap="round" opacity={tripStarted?0.09:0.04}/>
              {tripStarted && <path d="M 22,9 C 20,15 18,22 17,30 C 16,38 22,46 28,53" fill="none" stroke={T} strokeWidth="2" strokeLinecap="round" opacity="0.9"/>}
              <path d="M 22,9 C 20,15 18,22 17,30 C 16,38 22,46 28,53 C 34,59 40,63 50,67 C 58,70 63,73 66,76 C 70,79 73,81 76,84" fill="none" stroke={A} strokeWidth={tripStarted?1.4:0.9} strokeLinecap="round" opacity={tripStarted?0.6:0.25} strokeDasharray={tripStarted?"3,3":"2,5"}/>
            </svg>
            <div style={{ position:"absolute", top:8, left:12, fontSize:7, color:"rgba(255,255,255,0.1)", fontFamily:"'Anybody',sans-serif", fontWeight:700, letterSpacing:1.5 }}>SAN FRANCISCO</div>
            <div style={{ position:"absolute", bottom:8, right:12, fontSize:7, color:"rgba(255,255,255,0.1)", fontFamily:"'Anybody',sans-serif", fontWeight:700, letterSpacing:1.5 }}>CARMEL</div>

            {tripStarted && Object.entries(stopPositions).map(([id, pos]) => {
              const stop = itin.find(s => s.id === id);
              if (!stop) return null;
              return (
                <div key={id} style={{ position:"absolute", left:`${pos.x}%`, top:`${pos.y}%`, transform:"translate(-50%,-50%)", zIndex:3 }}>
                  <div style={{ width:stop.active?11:7, height:stop.active?11:7, borderRadius:"50%", background:stop.done?T:stop.active?A:"rgba(255,255,255,0.1)", border:`1.5px solid ${stop.done?T+"90":stop.active?A+"90":"rgba(255,255,255,0.2)"}`, boxShadow:stop.active?`0 0 10px ${A}70`:stop.done?`0 0 6px ${T}50`:"none", transition:"all 0.3s" }}/>
                </div>
              );
            })}

            {cars.map(c => {
              const pos = tripStarted ? c.tripPos : c.homePos;
              return (
                <div key={c.id} style={{ position:"absolute", left:`${pos.x}%`, top:`${pos.y}%`, transform:"translate(-50%,-50%)", zIndex:c.isLeader?15:10, transition:"all 1.2s ease" }}>
                  {c.isLeader && tripStarted && (
                    <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:48, height:48, borderRadius:"50%", border:`1.5px solid ${c.accent}35`, animation:"pulse-ring 2.5s infinite" }}/>
                  )}
                  <div style={{ width:c.isLeader?34:28, height:c.isLeader?34:28, borderRadius:c.isLeader?10:8, background:`${c.accent}22`, border:`2px solid ${c.accent}${c.isLeader?"AA":"55"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:c.isLeader?11:9, fontWeight:700, color:c.accent, fontFamily:"'Anybody',sans-serif", boxShadow:`0 0 ${c.isLeader?14:8}px ${c.accent}${c.isLeader?"50":"28"}`, backdropFilter:"blur(6px)" }}>
                    {c.avatar}
                  </div>
                  <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", marginTop:5, whiteSpace:"nowrap", textAlign:"center", background:"rgba(0,0,0,0.88)", padding:"3px 8px", borderRadius:6, border:`1px solid ${c.accent}25`, zIndex:20 }}>
                    <div style={{ fontSize:8, fontWeight:700, color:c.accent }}>{c.name.split(" ")[0]}</div>
                    {c.status !== "driving" && <div style={{ fontSize:7, color:stCfg[c.status]?.color, marginTop:1 }}>{stCfg[c.status]?.label}</div>}
                  </div>
                </div>
              );
            })}

            {!tripStarted && (
              <div style={{ position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)", fontSize:9, color:"rgba(255,255,255,0.22)", background:"rgba(0,0,0,0.5)", padding:"5px 14px", borderRadius:16, backdropFilter:"blur(4px)", whiteSpace:"nowrap" }}>
                Tap Start Trip to go live
              </div>
            )}
          </div>

          {!tripStarted && (
            <div className="fade-in" style={{ marginTop:12, background:SRF, border:`1px solid ${BDR}`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:11, color:"#666", lineHeight:1.55, marginBottom:12 }}>Your convoy is assembled. Start the trip to broadcast your route and sync all positions live.</div>
              <div style={{ display:"flex", gap:6 }}>
                {cars.map(c => (
                  <div key={c.id} style={{ flex:1, textAlign:"center", background:`${c.accent}10`, border:`1px solid ${c.accent}25`, borderRadius:8, padding:"10px 4px" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:c.accent, fontFamily:"'Anybody',sans-serif" }}>{c.avatar}</div>
                    <div style={{ fontSize:8, color:"#888", marginTop:3 }}>{c.name.split(" ")[0]}</div>
                    <div style={{ fontSize:7, color:stCfg[c.status]?.color, marginTop:2 }}>{stCfg[c.status]?.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tripStarted && (
            <div className="fade-in" style={{ marginTop:12, display:"flex", gap:6 }}>
              {cars.map(c => (
                <div key={c.id} style={{ flex:1, background:c.isLeader?`${c.accent}10`:SRF, border:`1px solid ${c.isLeader?c.accent+"30":BDR}`, borderRadius:10, padding:"10px 10px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:`${c.accent}25`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:700, color:c.accent, fontFamily:"'Anybody',sans-serif", flexShrink:0 }}>{c.avatar}</div>
                    <div>
                      <div style={{ fontSize:10, fontWeight:600, color:"#EEE" }}>{c.name.split(" ")[0]}</div>
                      <div style={{ fontSize:8, color:stCfg[c.status]?.color }}>{stCfg[c.status]?.label}</div>
                    </div>
                  </div>
                  <div style={{ fontSize:8, color:"#555" }}>{c.dist===0?"At front":`${c.dist} mi back`}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════
   APP 2: RECOMMENDATIONS (MAP)
   ═══════════════════════════════ */

const RecommendationsApp = () => {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [closeFriends, setCloseFriends] = useState(false);
  const [sharingToggles, setSharingToggles] = useState({ maint:true, food:true, scenic:true, mode:false, events:true });
  const [discoverIdx, setDiscoverIdx] = useState(0);
  const [activatedFeatures, setActivatedFeatures] = useState(new Set());
  const [compareId, setCompareId] = useState(null);
  const [comparePicking, setComparePicking] = useState(false);
  const [checkIn, setCheckIn] = useState(null); // { placeId, startTime }
  const [elapsed, setElapsed] = useState(0);    // seconds since engine off
  const [selectedItem, setSelectedItem] = useState(null);
  const [driveMode, setDriveMode] = useState("Sport");
  const [visitLog, setVisitLog] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!checkIn) { setElapsed(0); return; }
    const timer = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(timer);
  }, [checkIn]);

  const fmtElapsed = (s) => s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${String(s%60).padStart(2,'0')}s`;

  const submitVisit = async () => {
    if (!checkIn) return;
    setSubmitting(true);
    const visitSpot = mapSpots.find(s => s.id === checkIn.placeId);
    const payload = {
      place_id: checkIn.placeId,
      place_name: visitSpot?.name || checkIn.placeId,
      engine_off_at: new Date(checkIn.startTime).toISOString(),
      engine_on_at: new Date().toISOString(),
      dwell_minutes: Math.max(1, Math.round(elapsed / 60)),
      item_name: selectedItem || null,
      drive_mode: driveMode,
      window_status: 'closed',
      temperature_f: 68,
      weather_condition: 'clear',
    };
    let entry = { ...payload, id: Date.now(), place_name: visitSpot?.name, category: visitSpot?.category, type: visitSpot?.type, elapsed };
    try {
      const r = await fetch('http://localhost:3000/api/visits', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (r.ok) { const d = await r.json(); entry = { ...entry, ...d }; }
    } catch (e) { console.warn("API offline — visit logged locally"); }
    setVisitLog(p => [entry, ...p]);
    setCheckIn(null);
    setElapsed(0);
    setSelectedItem(null);
    setSubmitting(false);
  };

  const filtered = filter === "all" ? mapSpots : mapSpots.filter(s => s.type === filter);
  const spot = mapSpots.find(s => s.id === selected);

  const filters = [
    { id:"all", label:"All", count:mapSpots.length },
    { id:"food", label:"Food", count:mapSpots.filter(s=>s.type==="food").length },
    { id:"scenic", label:"Scenic", count:mapSpots.filter(s=>s.type==="scenic").length },
    { id:"event", label:"Events", count:mapSpots.filter(s=>s.type==="event").length },
    { id:"service", label:"Service", count:mapSpots.filter(s=>s.type==="service").length },
  ];

  return (
    <div>
      <div style={{ marginBottom:12, display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:9, fontWeight:800, letterSpacing:3, color:T, textTransform:"uppercase", marginBottom:6 }}>✦ Recommendations</div>
          <h2 style={{ fontFamily:"'Anybody',sans-serif", fontSize:22, fontWeight:800, margin:0, color:"#F5F5F5", letterSpacing:-0.5 }}>Popular Near You</h2>
        </div>
        <div style={{ fontSize:11, color:"#3A5A7A" }}>Aggregated from BMW drivers · UC Berkeley</div>
      </div>

      {/* Full-width map with everything overlaid */}
      <div onClick={() => setSelected(null)} style={{ position:"relative", width:"100%", height:580, borderRadius:18, overflow:"hidden", background:"linear-gradient(160deg, #040A1C 0%, #060E22 40%, #081426 70%, #040A1C 100%)", border:`1px solid ${BDR}`, marginBottom:20, cursor:"default" }}>

        {/* Filter tabs — overlaid top-left */}
        <div style={{ position:"absolute", top:14, left:14, zIndex:20, display:"flex", gap:5, flexWrap:"wrap" }}>
          {filters.map(f => (
            <button key={f.id} onClick={(e)=>{ e.stopPropagation(); setFilter(f.id); setSelected(null); }} style={{ padding:"5px 12px", borderRadius:16, border:`1px solid ${filter===f.id?T+"60":BDR}`, background:filter===f.id?`${T}20`:"rgba(4,10,28,0.75)", color:filter===f.id?T:"#4A7A9B", fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap", backdropFilter:"blur(8px)", transition:"all 0.2s" }}>
              {f.label} <span style={{ fontSize:8, opacity:0.6 }}>{f.count}</span>
            </button>
          ))}
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.2 }}>
          <path d="M 0,0 Q 5,10 8,20 Q 12,30 10,42 Q 8,52 15,60 Q 22,68 18,78 Q 15,88 20,100 L 0,100 Z" fill={T} opacity="0.25"/>
          <path d="M 10,5 Q 20,15 15,25 Q 10,35 18,45 Q 25,55 22,65 Q 20,75 30,80 Q 45,88 55,82 Q 65,76 75,80 Q 85,85 90,95" fill="none" stroke={T} strokeWidth="0.5" strokeDasharray="2,2"/>
          {[20,40,60,80].map(v => <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v} stroke="white" strokeWidth="0.1" opacity="0.4"/>)}
          {[20,40,60,80].map(v => <line key={`v${v}`} x1={v} y1="0" x2={v} y2="100" stroke="white" strokeWidth="0.1" opacity="0.4"/>)}
        </svg>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
          <path d="M 25,8 C 30,18 20,28 28,38 C 35,48 30,55 40,60 C 55,68 65,62 72,70 C 78,76 80,82 85,90" fill="none" stroke={A} strokeWidth="0.5" opacity="0.3" strokeLinecap="round"/>
          <path d="M 25,8 C 30,18 20,28 28,38 C 35,48 30,55 40,60 C 55,68 65,62 72,70 C 78,76 80,82 85,90" fill="none" stroke={A} strokeWidth="0.25" opacity="0.6" strokeDasharray="1.5,3"/>
        </svg>
        <div style={{ position:"absolute", top:8, left:12, fontSize:8, color:"rgba(255,255,255,0.12)", fontFamily:"'Anybody',sans-serif", fontWeight:700, letterSpacing:1.5 }}>SAN FRANCISCO</div>
        <div style={{ position:"absolute", bottom:8, right:12, fontSize:8, color:"rgba(255,255,255,0.12)", fontFamily:"'Anybody',sans-serif", fontWeight:700, letterSpacing:1.5 }}>MONTEREY</div>

        {filtered.map(s => {
          const isSel = selected === s.id; const col = typeColors[s.type];
          const sz = pinScale(s.visitors);
          return (
            <div key={s.id} onClick={(e) => { e.stopPropagation(); setSelected(isSel ? null : s.id); setComparePicking(false); }} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, transform:"translate(-50%,-50%)", cursor:"pointer", zIndex:isSel?20:s.visitors>400?5:1, transition:"all 0.3s ease" }}>
              {s.visitors > 150 && !isSel && (<div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:sz+14, height:sz+14, borderRadius:"50%", border:`1px solid ${col}${s.visitors>400?"35":"20"}`, animation:"pulse-ring 3s infinite" }}/>)}
              <div style={{ width:isSel?sz+10:sz, height:isSel?sz+10:sz, borderRadius:"50%", background:`radial-gradient(circle at 40% 35%, ${col}${s.visitors>=400?"55":"38"}, ${col}${s.visitors>=400?"25":"12"})`, border:`2px solid ${col}${isSel?"CC":s.visitors>=400?"75":"45"}`, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", boxShadow:isSel?`0 0 24px ${col}50, 0 0 48px ${col}20`:pinGlow(s.visitors,col), transition:"all 0.3s ease" }}>
                <span style={{ fontSize:isSel?12:Math.max(8,Math.round(sz*0.3)), fontWeight:800, color:"#FFF", fontFamily:"'Anybody',sans-serif", lineHeight:1, textShadow:`0 0 8px ${col}` }}>{s.visitors}</span>
                <span style={{ fontSize:isSel?7:Math.max(5,Math.round(sz*0.16)), color:"rgba(255,255,255,0.6)", fontWeight:600, marginTop:1 }}>visits</span>
              </div>
              <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", marginTop:5, whiteSpace:"nowrap", textAlign:"center", background:isSel?"rgba(0,0,0,0.92)":"rgba(0,0,0,0.7)", padding:isSel?"5px 12px":"3px 8px", borderRadius:7, border:`1px solid ${col}${isSel?"60":"30"}`, backdropFilter:"blur(8px)", zIndex:30, transition:"all 0.2s" }}>
                <div style={{ fontSize:isSel?11:9, fontWeight:600, color:"#FFF" }}>{s.name}</div>
                {isSel && <div style={{ fontSize:8, color:col, marginTop:2 }}>{s.category} · ★{s.rating}</div>}
              </div>
            </div>
          );
        })}
        {!selected && (<div style={{ position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)", fontSize:10, color:"rgba(255,255,255,0.25)", background:"rgba(0,0,0,0.5)", padding:"5px 14px", borderRadius:20, backdropFilter:"blur(4px)" }}>Tap a spot to see what's popular</div>)}

        {/* Suggestion notification — bottom-left overlay */}
        {!activatedFeatures.has(discoveryFeatures[discoverIdx].id) ? (
          <div className="fade-in" key={discoverIdx} onClick={e=>e.stopPropagation()} style={{
            position:"absolute", bottom:14, left:14, width:260, zIndex:40,
            background:"rgba(4,10,28,0.88)",
            border:`1px solid ${discoveryFeatures[discoverIdx].color}50`,
            borderRadius:14, padding:"12px 14px",
            backdropFilter:"blur(18px)",
            boxShadow:`0 0 0 1px ${discoveryFeatures[discoverIdx].color}20, 0 0 18px ${discoveryFeatures[discoverIdx].color}30, 0 0 40px ${discoveryFeatures[discoverIdx].color}12`,
            animation:"suggGlow 2.5s ease-in-out infinite",
          }}>
            <style>{`@keyframes suggGlow { 0%,100%{box-shadow:0 0 0 1px ${discoveryFeatures[discoverIdx].color}20,0 0 14px ${discoveryFeatures[discoverIdx].color}25,0 0 32px ${discoveryFeatures[discoverIdx].color}10} 50%{box-shadow:0 0 0 1px ${discoveryFeatures[discoverIdx].color}40,0 0 24px ${discoveryFeatures[discoverIdx].color}45,0 0 52px ${discoveryFeatures[discoverIdx].color}20} }`}</style>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:`${discoveryFeatures[discoverIdx].color}20`, border:`1px solid ${discoveryFeatures[discoverIdx].color}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{discoveryFeatures[discoverIdx].icon}</div>
                  <div style={{ position:"absolute", top:-3, right:-3, width:8, height:8, borderRadius:"50%", background:discoveryFeatures[discoverIdx].color, border:"1.5px solid rgba(4,10,28,0.9)", animation:"blink 1.8s infinite" }}/>
                </div>
                <div>
                  <div style={{ fontSize:7, fontWeight:700, letterSpacing:1.2, color:discoveryFeatures[discoverIdx].color, textTransform:"uppercase", marginBottom:1 }}>Suggestion</div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#E0F0FF", lineHeight:1.2 }}>{discoveryFeatures[discoverIdx].title}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:3 }}>
                <button onClick={()=>setDiscoverIdx(i=>(i-1+discoveryFeatures.length)%discoveryFeatures.length)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#4A7A9B", fontSize:11, cursor:"pointer", padding:"2px 7px", borderRadius:5 }}>‹</button>
                <button onClick={()=>setDiscoverIdx(i=>(i+1)%discoveryFeatures.length)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#4A7A9B", fontSize:11, cursor:"pointer", padding:"2px 7px", borderRadius:5 }}>›</button>
              </div>
            </div>
            <div style={{ fontSize:10, color:"rgba(180,210,240,0.65)", lineHeight:1.45, marginBottom:10 }}>{discoveryFeatures[discoverIdx].desc}</div>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <button onClick={()=>setActivatedFeatures(p=>new Set([...p,discoveryFeatures[discoverIdx].id]))} style={{ flex:1, background:discoveryFeatures[discoverIdx].color, border:"none", borderRadius:7, padding:"7px 10px", color:"#0A0A14", fontSize:10, fontWeight:700, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>{discoveryFeatures[discoverIdx].cta} →</button>
              <button onClick={()=>setDiscoverIdx(i=>(i+1)%discoveryFeatures.length)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:7, padding:"7px 10px", color:"#4A7A9B", fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>Skip</button>
            </div>
          </div>
        ) : (
          <div className="fade-in" onClick={e=>e.stopPropagation()} style={{
            position:"absolute", bottom:14, left:14, zIndex:40,
            background:"rgba(4,10,28,0.88)", border:`1px solid ${T}40`, borderRadius:12, padding:"10px 14px",
            backdropFilter:"blur(18px)", display:"flex", alignItems:"center", gap:10,
            boxShadow:`0 0 14px ${T}25`,
          }}>
            <div style={{ width:22, height:22, borderRadius:6, background:`${T}20`, border:`1px solid ${T}50`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:T }}>✓</div>
            <div style={{ fontSize:11, fontWeight:600, color:T }}>{discoveryFeatures[discoverIdx].title} — Activated</div>
            <button onClick={()=>{setActivatedFeatures(p=>{const n=new Set(p);n.delete(discoveryFeatures[discoverIdx].id);return n;})}} style={{ background:"transparent", border:"none", color:"#4A7A9B", fontSize:10, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", paddingLeft:4 }}>Undo</button>
          </div>
        )}

        {/* Spot detail panel — overlaid bottom-right on the map */}
        {spot && (
          <div className="fade-in" onClick={e=>e.stopPropagation()} style={{ position:"absolute", bottom:14, right:14, width:340, maxHeight:500, overflowY:"auto", zIndex:40, borderRadius:16, backdropFilter:"blur(20px)" }}>
        <div className="fade-in" style={{ background:`linear-gradient(160deg, ${typeColors[spot.type]}0A, transparent 60%)`, border:`1px solid ${typeColors[spot.type]}30`, borderRadius:18, padding:20, marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}><span style={{ fontFamily:"'Anybody',sans-serif", fontSize:14, color:typeColors[spot.type] }}>{typeIcons[spot.type]}</span><span style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:typeColors[spot.type], textTransform:"uppercase", fontFamily:"'Anybody',sans-serif" }}>{spot.category}</span></div>
              <div style={{ fontSize:20, fontWeight:800, color:"#F2F2F2", fontFamily:"'Anybody',sans-serif", letterSpacing:-0.3 }}>{spot.name}</div>
              <div style={{ fontSize:12, color:"#888", fontStyle:"italic", marginTop:3 }}>{spot.tagline}</div>
            </div>
            <button onClick={()=>setSelected(null)} style={{ background:SRF, border:`1px solid ${BDR}`, color:"#888", fontSize:14, cursor:"pointer", padding:"4px 10px", borderRadius:8, fontWeight:600 }}>×</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:16 }}>
            {[["Visitors",`${spot.visitors}`,"this week"],["Rating",`★ ${spot.rating}`,"average"],["Peak",spot.peakHour,""],["Spend",spot.avgSpend,"per visit"]].map(([l,v,s]) => (
              <div key={l} style={{ background:SRF, border:`1px solid ${BDR}`, borderRadius:10, padding:"10px 8px", textAlign:"center" }}><div style={{ fontSize:8, color:"#555", fontWeight:600, letterSpacing:0.5, textTransform:"uppercase", marginBottom:3 }}>{l}</div><div style={{ fontFamily:"'Anybody',sans-serif", fontSize:13, fontWeight:700, color:"#EEE" }}>{v}</div>{s && <div style={{ fontSize:8, color:"#444", marginTop:1 }}>{s}</div>}</div>
            ))}
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:8, background:`${T}12`, border:`1px solid ${T}25`, marginBottom:16, fontSize:11, color:T, fontWeight:600 }}>📈 {spot.trend}</div>

          {/* ── Check-In Panel ── */}
          {(() => {
            const isHere = checkIn?.placeId === spot.id;
            const otherCheckIn = checkIn && checkIn.placeId !== spot.id;
            const col = typeColors[spot.type];
            if (isHere) return (
              <div className="fade-in" style={{ marginBottom:16, background:`${EB}08`, border:`1px solid ${EB}35`, borderRadius:14, padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:R, animation:"blink 1.2s infinite", flexShrink:0 }}/>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:R, textTransform:"uppercase" }}>Engine Off · Parked</div>
                  </div>
                  <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:22, fontWeight:800, color:"#E0F0FF", letterSpacing:-0.5 }}>{fmtElapsed(elapsed)}</div>
                </div>
                {spot.type === "food" && (
                  <div style={{ marginBottom:12 }}>
                    <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, color:"#555", textTransform:"uppercase", marginBottom:7 }}>What did you get?</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {spot.items.map(item => (
                        <button key={item.name} onClick={()=>setSelectedItem(p => p===item.name ? null : item.name)} style={{ padding:"5px 10px", borderRadius:8, border:`1px solid ${selectedItem===item.name?col+"70":BDR}`, background:selectedItem===item.name?`${col}20`:"rgba(255,255,255,0.04)", color:selectedItem===item.name?col:"#666", fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", transition:"all 0.15s" }}>{item.name}</button>
                      ))}
                      <button onClick={()=>setSelectedItem(p => p==="Something else" ? null : "Something else")} style={{ padding:"5px 10px", borderRadius:8, border:`1px solid ${selectedItem==="Something else"?col+"70":BDR}`, background:selectedItem==="Something else"?`${col}20`:"rgba(255,255,255,0.04)", color:selectedItem==="Something else"?col:"#666", fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>Other</button>
                    </div>
                  </div>
                )}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, color:"#555", textTransform:"uppercase", marginBottom:7 }}>Drive Mode</div>
                  <div style={{ display:"flex", gap:5 }}>
                    {["Sport","Comfort","Sport+","Eco"].map(m => (
                      <button key={m} onClick={()=>setDriveMode(m)} style={{ flex:1, padding:"5px 4px", borderRadius:8, border:`1px solid ${driveMode===m?EB+"60":BDR}`, background:driveMode===m?`${EB}18`:"rgba(255,255,255,0.04)", color:driveMode===m?EB:"#555", fontSize:9, fontWeight:700, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>{m}</button>
                    ))}
                  </div>
                </div>
                <button onClick={submitVisit} disabled={submitting} style={{ width:"100%", background:submitting?"#1A2A3A":EB, border:"none", borderRadius:10, padding:"10px 16px", color:submitting?"#4A7A9B":"#060C1A", fontSize:12, fontWeight:700, cursor:submitting?"not-allowed":"pointer", fontFamily:"'Instrument Sans',sans-serif", transition:"all 0.2s" }}>
                  {submitting ? "Recording…" : "⚡ Engine On — Record Visit"}
                </button>
              </div>
            );
            if (otherCheckIn) return (
              <div style={{ marginBottom:16, background:SRF, border:`1px solid ${BDR}`, borderRadius:12, padding:"10px 14px", fontSize:11, color:"#555" }}>
                Already parked at another spot — engine on first to check in here.
              </div>
            );
            return (
              <button onClick={()=>setCheckIn({ placeId:spot.id, startTime:Date.now() })} style={{ width:"100%", marginBottom:16, background:"rgba(255,255,255,0.04)", border:`1px solid ${col}40`, borderRadius:12, padding:"11px 16px", color:col, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s" }}>
                <span style={{ fontSize:10 }}>▐▌</span> Engine Off — I'm Here
              </button>
            );
          })()}

          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, color:"#777", textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:10 }}>{spot.type==="food"?"Most Ordered Items":spot.type==="scenic"?"Popular Activities":spot.type==="event"?"Attendance Breakdown":"Most Requested Services"}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {spot.items.map((item, i) => { const col = typeColors[spot.type]; return (
                <div key={item.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderRadius:12, position:"relative", overflow:"hidden", background:i===0?`${col}0C`:SRF, border:`1px solid ${i===0?col+"25":BDR}` }}>
                  <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${item.pct}%`, background:`${col}06`, borderRadius:12, transition:"width 0.5s ease" }}/>
                  <div style={{ width:24, height:24, borderRadius:7, flexShrink:0, position:"relative", background:i===0?`${col}25`:"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:i===0?col:i<3?"#AAA":"#555", fontFamily:"'Anybody',sans-serif" }}>{i+1}</div>
                  <div style={{ flex:1, position:"relative", minWidth:0 }}><div style={{ fontSize:13, fontWeight:600, color:i===0?"#F0F0F0":"#CCC", display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>{item.name}{item.hot && <span style={{ fontSize:7, fontWeight:800, color:col, background:`${col}18`, padding:"2px 6px", borderRadius:4, letterSpacing:0.5 }}>🔥 TOP</span>}</div><div style={{ fontSize:11, color:"#666", marginTop:2 }}>{item.orders.toLocaleString()} {item.label || "orders"}</div></div>
                  <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:16, fontWeight:800, color:i===0?col:`${col}99`, position:"relative", flexShrink:0 }}>{item.pct}<span style={{ fontSize:10, opacity:0.6 }}>%</span></div>
                </div>
              ); })}
            </div>
          </div>
          {spot.tips && spot.tips.length > 0 && (
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#555", textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:8 }}>Driver Tips</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {spot.tips.map((tip, i) => (
                  <div key={i} style={{ background:SRF, border:`1px solid ${BDR}`, borderRadius:10, padding:"10px 14px", display:"flex", gap:10, alignItems:"flex-start" }}>
                    <span style={{ fontSize:13, flexShrink:0 }}>💬</span>
                    <div><div style={{ fontSize:12.5, color:"#CCC", lineHeight:1.45 }}>"{tip.text}"</div><div style={{ fontSize:9, color:"#555", marginTop:4, fontWeight:600 }}>— {tip.by}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {spot.popularity && (
            <div style={{ marginTop:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#555", textTransform:"uppercase", fontFamily:"'Anybody',sans-serif" }}>Hour by Day</div>
                <div style={{ fontSize:9, fontWeight:700, color:typeColors[spot.type] }}>Best: {spot.popularity.bestDay}</div>
              </div>
              {(()=>{
                const days=["M","T","W","T","F","S","S"];
                const slots=["AM","Mid","PM","Eve"];
                const col=typeColors[spot.type];
                const bg=v=>v===0?"rgba(255,255,255,0.04)":v===1?`${col}22`:v===2?`${col}55`:col;
                return (
                  <div>
                    <div style={{ display:"grid", gridTemplateColumns:"14px 1fr 1fr 1fr 1fr", gap:3, marginBottom:4 }}>
                      <div/>{slots.map(s=><div key={s} style={{ fontSize:7, color:"#444", textAlign:"center" }}>{s}</div>)}
                    </div>
                    {spot.popularity.grid.map((row,di)=>(
                      <div key={di} style={{ display:"grid", gridTemplateColumns:"14px 1fr 1fr 1fr 1fr", gap:3, marginBottom:3 }}>
                        <div style={{ fontSize:7, color:"#444", lineHeight:"14px", paddingRight:2, textAlign:"right" }}>{days[di]}</div>
                        {row.map((v,ti)=><div key={ti} style={{ height:14, borderRadius:3, background:bg(v), transition:"background 0.3s" }}/>)}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
          <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${BDR}` }}>
            {!comparePicking && !compareId && (
              <button onClick={()=>setComparePicking(true)} style={{ width:"100%", background:SRF, border:`1px solid ${BDR}`, borderRadius:10, padding:"9px 16px", color:"#888", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>↔ Compare with another spot</button>
            )}
            {comparePicking && !compareId && (
              <div className="fade-in">
                <div style={{ fontSize:10, color:"#777", fontWeight:600, marginBottom:8 }}>Pick a spot to compare:</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {mapSpots.filter(s=>s.id!==spot.id).map(s=>(
                    <button key={s.id} onClick={()=>{setCompareId(s.id);setComparePicking(false);}} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${typeColors[s.type]}30`, background:`${typeColors[s.type]}10`, color:typeColors[s.type], fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>{s.name}</button>
                  ))}
                </div>
                <button onClick={()=>setComparePicking(false)} style={{ marginTop:8, background:"transparent", border:"none", color:"#555", fontSize:11, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>Cancel</button>
              </div>
            )}
          </div>
        </div>
        {compareId && (()=>{
          const cspot=mapSpots.find(s=>s.id===compareId);
          if(!cspot) return null;
          const col1=typeColors[spot.type], col2=typeColors[cspot.type];
          const metrics=[
            {label:"Visitors",  a:spot.visitors,    b:cspot.visitors,    fmt:v=>`${v}`,  win:(a,b)=>a>b},
            {label:"Rating",    a:spot.rating,      b:cspot.rating,      fmt:v=>`★${v}`, win:(a,b)=>a>b},
            {label:"Avg Spend", a:spot.avgSpend,    b:cspot.avgSpend,    fmt:v=>v,       win:null},
            {label:"Wait",      a:spot.waitMinutes, b:cspot.waitMinutes, fmt:v=>v===0?"None":`${v}m`, win:(a,b)=>a<b},
            {label:"Fit Score", a:spot.fitScore,    b:cspot.fitScore,    fmt:v=>`${v}`,  win:(a,b)=>a>b},
          ];
          return (
            <div className="fade-in" style={{ background:SRF, border:`1px solid ${BDR}`, borderRadius:16, padding:16, marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#555", textTransform:"uppercase", fontFamily:"'Anybody',sans-serif" }}>Comparison</div>
                <button onClick={()=>{setCompareId(null);setComparePicking(false);}} style={{ background:"transparent", border:`1px solid ${BDR}`, color:"#555", fontSize:11, cursor:"pointer", padding:"3px 8px", borderRadius:6, fontWeight:600 }}>Clear ×</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"68px 1fr 1fr", gap:6, marginBottom:10 }}>
                <div/>
                <div style={{ fontSize:11, fontWeight:700, color:col1, textAlign:"center", padding:"6px 8px", background:`${col1}12`, borderRadius:8 }}>{spot.name}</div>
                <div style={{ fontSize:11, fontWeight:700, color:col2, textAlign:"center", padding:"6px 8px", background:`${col2}12`, borderRadius:8 }}>{cspot.name}</div>
              </div>
              {metrics.map(m=>{
                const aW=m.win&&m.win(m.a,m.b), bW=m.win&&m.win(m.b,m.a);
                return (
                  <div key={m.label} style={{ display:"grid", gridTemplateColumns:"68px 1fr 1fr", gap:6, marginBottom:5 }}>
                    <div style={{ fontSize:9, color:"#555", fontWeight:600, textTransform:"uppercase", letterSpacing:0.5, alignSelf:"center" }}>{m.label}</div>
                    <div style={{ background:aW?`${col1}18`:SRF, border:`1px solid ${aW?col1+"35":BDR}`, borderRadius:8, padding:"7px 6px", textAlign:"center" }}>
                      <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:13, fontWeight:700, color:aW?col1:"#CCC" }}>{m.fmt(m.a)}</div>
                      {aW&&<div style={{ fontSize:7, color:col1, fontWeight:700 }}>▲ Better</div>}
                    </div>
                    <div style={{ background:bW?`${col2}18`:SRF, border:`1px solid ${bW?col2+"35":BDR}`, borderRadius:8, padding:"7px 6px", textAlign:"center" }}>
                      <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:13, fontWeight:700, color:bW?col2:"#CCC" }}>{m.fmt(m.b)}</div>
                      {bW&&<div style={{ fontSize:7, color:col2, fontWeight:700 }}>▲ Better</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
          </div>
        )}

      </div>{/* end map container */}

      {/* Visit Log */}
      {visitLog.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:EB, textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:10 }}>This Drive · Stops Recorded</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {visitLog.map((v, i) => {
              const col = v.type ? typeColors[v.type] : EB;
              const mins = v.dwell_minutes || Math.max(1, Math.round(v.elapsed/60));
              return (
                <div key={v.id || i} className="fade-in" style={{ background:SRF, border:`1px solid ${col}25`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${col}15`, border:`1px solid ${col}35`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:14 }}>{v.type==="food"?"🍴":v.type==="scenic"?"⛰":"📍"}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#E0E0E0", marginBottom:2 }}>{v.place_name || v.place_id}</div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      {v.item_name && <span style={{ fontSize:10, color:col, fontWeight:600 }}>✓ {v.item_name}</span>}
                      {v.drive_mode && <span style={{ fontSize:10, color:"#555" }}>{v.drive_mode} mode</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:18, fontWeight:800, color:"#E0F0FF", lineHeight:1 }}>{mins}<span style={{ fontSize:10, fontWeight:500, color:"#4A7A9B" }}>m</span></div>
                    <div style={{ fontSize:9, color:"#4A7A9B", marginTop:2 }}>parked</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#555", textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:10 }}>Your Data Sharing</div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {[["food","Food Spots"], ["scenic","Scenic Spots"], ["events","Events & Meets"], ["maint","Service Shops"], ["mode","Drive Mode Stats"]].map(([id, label]) => (
            <div key={id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:SRF, border:`1px solid ${BDR}`, borderRadius:10, padding:"10px 14px" }}><span style={{ fontSize:12.5, fontWeight:500, color:"#CCC" }}>{label}</span><Toggle on={sharingToggles[id]} onFlip={()=>setSharingToggles(p=>({...p,[id]:!p[id]}))}/></div>
          ))}
        </div>
        <div style={{ marginTop:10, background:closeFriends?`${P}08`:SRF, border:`1px solid ${closeFriends?P+"25":BDR}`, borderRadius:12, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", transition:"all 0.3s" }}>
          <div><div style={{ fontSize:13, fontWeight:600, color:"#DDD" }}>Close Friends Mode</div><div style={{ fontSize:11, color:"#666", marginTop:2 }}>Share detailed data with trusted drivers</div></div>
          <Toggle on={closeFriends} onFlip={()=>setCloseFriends(!closeFriends)} color={P}/>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════
   APP 3: PAST DRIVES
   ═══════════════════════════ */

const archetypes = [
  { id:"spirited", name:"The Spirited Tourer", icon:"◉", color:A, desc:"You live for the open road. Sport mode is your default, you chase elevation, and you're the one who finds the best twisty stretch on every route.", match:31 },
  { id:"comfort", name:"The Comfort Cruiser", icon:"◎", color:T, desc:"Smooth, intentional, scenic. You choose Comfort mode, keep a steady pace, and always find the best overlook for a break.", match:18 },
  { id:"performance", name:"The Performance Seeker", icon:"▲", color:R, desc:"Sport+ is a lifestyle. You push limits, hit high speeds, and your drives read like a track session on public roads.", match:12 },
  { id:"captain", name:"The Road Captain", icon:"◈", color:P, desc:"Convoy leader by instinct. You set the pace, keep the group together, and know exactly when to call a fuel stop.", match:9 },
  { id:"wanderer", name:"The Weekend Wanderer", icon:"✦", color:O, desc:"No strict agenda. You mix modes, explore detours, and the best part of every drive is the unexpected stop along the way.", match:22 },
  { id:"optimizer", name:"The Efficiency Optimizer", icon:"◌", color:"#88C878", desc:"Every mile is calculated. Eco mode, smooth acceleration, minimal fuel stops — you squeeze the most out of every tank.", match:8 },
];

const userArchetype = archetypes[0];

const driveModes = [
  { label:"Sport", pct:54, color:A },
  { label:"Comfort", pct:22, color:T },
  { label:"Sport+", pct:16, color:R },
  { label:"Eco", pct:8, color:"#88C878" },
];

const pastTrips = [
  { id:"t1", name:"Pacific Coast Highway", date:"Apr 5, 2025", distance:"187 mi", duration:"4h 22m", topSpeed:"84 mph", avgSpeed:"71 mph", stops:4, group:[{avatar:"MW",accent:A},{avatar:"PS",accent:T},{avatar:"TK",accent:O},{avatar:"NR",accent:P}] },
  { id:"t2", name:"Napa Valley Loop", date:"Mar 22, 2025", distance:"134 mi", duration:"3h 05m", topSpeed:"79 mph", avgSpeed:"68 mph", stops:3, group:[{avatar:"MW",accent:A},{avatar:"PS",accent:T}] },
  { id:"t3", name:"Tahoe Rim Circuit", date:"Mar 8, 2025", distance:"218 mi", duration:"5h 14m", topSpeed:"91 mph", avgSpeed:"74 mph", stops:5, group:[{avatar:"MW",accent:A},{avatar:"TK",accent:O},{avatar:"NR",accent:P}] },
  { id:"t4", name:"Highway 1 Solo Run", date:"Feb 14, 2025", distance:"96 mi", duration:"2h 18m", topSpeed:"88 mph", avgSpeed:"76 mph", stops:2, group:[{avatar:"MW",accent:A}] },
  { id:"t5", name:"Carmel–Big Sur Blitz", date:"Jan 31, 2025", distance:"72 mi", duration:"1h 48m", topSpeed:"93 mph", avgSpeed:"79 mph", stops:1, group:[{avatar:"MW",accent:A},{avatar:"PS",accent:T},{avatar:"TK",accent:O}] },
];

const PastDrivesApp = () => {
  const [tripsOpen, setTripsOpen] = useState(false);
  const totalMiles = pastTrips.reduce((s,t) => s + parseInt(t.distance), 0);
  const totalDrives = pastTrips.length;

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:9, fontWeight:800, letterSpacing:3, color:P, textTransform:"uppercase", marginBottom:8 }}>◈ Past Drives</div>
        <h2 style={{ fontFamily:"'Anybody',sans-serif", fontSize:22, fontWeight:800, margin:0, color:"#F5F5F5", letterSpacing:-0.5 }}>Your Drive Profile</h2>
        <div style={{ fontSize:12, color:"#666", marginTop:4 }}>Marcus W. · M4 Competition</div>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:22 }}>
        {[["DRIVES",totalDrives,P],["TOTAL MILES",`${totalMiles}`,"#DDD"],["AVG SPEED","73 mph",A]].map(([l,v,c]) => (
          <div key={l} style={{ flex:1, textAlign:"center", background:SRF, border:`1px solid ${BDR}`, borderRadius:12, padding:"12px 8px" }}><div style={{ fontSize:9, color:"#555", fontWeight:600, letterSpacing:0.5, marginBottom:3 }}>{l}</div><div style={{ fontFamily:"'Anybody',sans-serif", fontSize:16, fontWeight:700, color:c }}>{v}</div></div>
        ))}
      </div>
      <div style={{ background:SRF, border:`1px solid ${BDR}`, borderRadius:16, padding:"18px 18px 16px", marginBottom:16 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#555", textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:14 }}>Drive Mode Breakdown</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {driveModes.map(m => (<div key={m.label}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}><span style={{ fontSize:12, fontWeight:600, color:"#CCC" }}>{m.label}</span><span style={{ fontFamily:"'Anybody',sans-serif", fontSize:13, fontWeight:700, color:m.color }}>{m.pct}%</span></div><div style={{ height:5, borderRadius:3, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}><div style={{ height:"100%", width:`${m.pct}%`, borderRadius:3, background:m.color, transition:"width 0.6s ease" }}/></div></div>))}
        </div>
        <div style={{ marginTop:14, fontSize:11, color:"#555", borderTop:`1px solid ${BDR}`, paddingTop:12 }}>Sport-dominant driver — you're in the top <span style={{ color:A, fontWeight:600 }}>15%</span> of M4 owners by Sport mode usage.</div>
      </div>
      <div style={{ background:`linear-gradient(135deg, ${userArchetype.color}12, transparent)`, border:`1px solid ${userArchetype.color}35`, borderRadius:16, padding:"20px 20px 18px", marginBottom:16 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#555", textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:10 }}>Your Driver Archetype</div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:`${userArchetype.color}20`, border:`1.5px solid ${userArchetype.color}45`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><span style={{ fontFamily:"'Anybody',sans-serif", fontSize:22, color:userArchetype.color }}>{userArchetype.icon}</span></div>
          <div><div style={{ fontFamily:"'Anybody',sans-serif", fontSize:18, fontWeight:800, color:userArchetype.color, letterSpacing:-0.3 }}>{userArchetype.name}</div><div style={{ fontSize:11, color:"#666", marginTop:2 }}>{userArchetype.match}% of BMW drivers share this profile</div></div>
        </div>
        <div style={{ fontSize:13, color:"#AAA", lineHeight:1.6, marginBottom:14 }}>{userArchetype.desc}</div>
      </div>
      <div style={{ background:SRF, border:`1px solid ${BDR}`, borderRadius:16, padding:"16px 18px", marginBottom:16 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#555", textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:12 }}>BMW Driver Archetypes</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {archetypes.map(a => { const isUser = a.id === userArchetype.id; return (
            <div key={a.id} style={{ display:"flex", alignItems:"center", gap:12, background:isUser?`${a.color}10`:SRF, border:`1px solid ${isUser?a.color+"35":BDR}`, borderRadius:12, padding:"10px 14px" }}>
              <span style={{ fontFamily:"'Anybody',sans-serif", fontSize:16, color:a.color, width:20, textAlign:"center" }}>{a.icon}</span>
              <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:600, color:isUser?a.color:"#CCC" }}>{a.name}</div></div>
              <div style={{ textAlign:"right", flexShrink:0 }}><div style={{ fontFamily:"'Anybody',sans-serif", fontSize:13, fontWeight:700, color:isUser?a.color:"#555" }}>{a.match}%</div><div style={{ fontSize:9, color:"#444" }}>of drivers</div></div>
              {isUser && <Badge text="You" color={a.color} bg={`${a.color}18`}/>}
            </div>
          ); })}
        </div>
      </div>
      <div style={{ border:`1px solid ${BDR}`, borderRadius:16, overflow:"hidden" }}>
        <button onClick={() => setTripsOpen(o => !o)} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", background:tripsOpen?SRF:"transparent", border:"none", padding:"16px 18px", cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}><span style={{ fontFamily:"'Anybody',sans-serif", fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#555", textTransform:"uppercase" }}>Past Trips</span><span style={{ background:SRF, border:`1px solid ${BDR}`, borderRadius:6, padding:"2px 8px", fontSize:10, color:"#666", fontWeight:600 }}>{totalDrives}</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:11, color:"#555" }}>{totalMiles} mi total</span><span style={{ fontFamily:"'Anybody',sans-serif", fontSize:14, color:"#555", transition:"transform 0.25s", display:"inline-block", transform:tripsOpen?"rotate(180deg)":"rotate(0deg)" }}>▾</span></div>
        </button>
        {tripsOpen && (
          <div className="fade-in" style={{ borderTop:`1px solid ${BDR}`, maxHeight:520, overflowY:"auto", padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
            {pastTrips.map(trip => (
              <div key={trip.id} style={{ background:SRF, border:`1px solid ${BDR}`, borderRadius:14, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}><div><div style={{ fontSize:13.5, fontWeight:700, color:"#EEE", marginBottom:2 }}>{trip.name}</div><div style={{ fontSize:11, color:"#555" }}>{trip.date}</div></div><div style={{ textAlign:"right" }}><div style={{ fontFamily:"'Anybody',sans-serif", fontSize:16, fontWeight:700, color:"#F0F0F0" }}>{trip.distance}</div><div style={{ fontSize:10, color:"#555" }}>{trip.duration}</div></div></div>
                <div style={{ display:"flex", gap:6, marginBottom:12 }}>{[["AVG",trip.avgSpeed],["TOP",trip.topSpeed],["STOPS",trip.stops]].map(([l,v]) => (<div key={l} style={{ flex:1, background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"7px 0", textAlign:"center" }}><div style={{ fontSize:8, color:"#444", letterSpacing:0.5, marginBottom:2 }}>{l}</div><div style={{ fontFamily:"'Anybody',sans-serif", fontSize:12, fontWeight:700, color:"#CCC" }}>{v}</div></div>))}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:10, color:"#555" }}>{trip.group.length===1?"Solo drive":`${trip.group.length} drivers`}</span><div style={{ display:"flex", gap:4 }}>{trip.group.map((m,i) => (<div key={i} style={{ width:26, height:26, borderRadius:7, background:`${m.accent}25`, border:`1.5px solid ${m.accent}45`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, fontWeight:700, color:m.accent, fontFamily:"'Anybody',sans-serif" }}>{m.avatar}</div>))}</div></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════
   APP 4: VIBE MAP
   ═══════════════════════════ */

const vibeEmojis = {
  exhilarating: { emoji:"⚡", label:"Exhilarating", color:"#E8A838", colorEnd:"#E8C838" },
  peaceful: { emoji:"🍃", label:"Peaceful", color:"#3DD6C8", colorEnd:"#38E8A8" },
  scenic: { emoji:"✨", label:"Scenic", color:"#A87CE8", colorEnd:"#C87CE8" },
  boring: { emoji:"😐", label:"Boring", color:"#666666", colorEnd:"#555555" },
  stressful: { emoji:"😤", label:"Stressful", color:"#E8574A", colorEnd:"#E87C4A" },
  focused: { emoji:"🎯", label:"Focused", color:"#4A9DE8", colorEnd:"#5AB8E8" },
};

const roadSegments = [
  { id:"seg1", name:"University Ave → Campus", from:{x:22,y:6}, to:{x:18,y:18}, vibe:"peaceful", pct:82, votes:312, miles:2.1, details:"The main artery from the bay to campus. Light signals keep pace steady — a scenic approach through the Berkeley flats.", breakdown:[{v:"peaceful",p:82},{v:"scenic",p:58},{v:"boring",p:28},{v:"focused",p:14},{v:"stressful",p:8}] },
  { id:"seg2", name:"Shattuck Ave (Gourmet Ghetto)", from:{x:18,y:18}, to:{x:15,y:28}, vibe:"peaceful", pct:76, votes:267, miles:1.8, details:"North Berkeley's food corridor. Slow roll past Chez Panisse and Cheeseboard — windows down, no rush.", breakdown:[{v:"peaceful",p:76},{v:"scenic",p:54},{v:"boring",p:24},{v:"focused",p:16},{v:"stressful",p:8}] },
  { id:"seg3", name:"Bancroft Way (Campus Edge)", from:{x:15,y:28}, to:{x:20,y:40}, vibe:"scenic", pct:87, votes:398, miles:0.9, details:"Tree-lined edge of campus with pedestrians, bikes, and stadium views. The quintessential Berkeley experience.", breakdown:[{v:"scenic",p:87},{v:"peaceful",p:72},{v:"exhilarating",p:18},{v:"focused",p:14},{v:"boring",p:3}] },
  { id:"seg4", name:"Telegraph Ave Strip", from:{x:20,y:40}, to:{x:28,y:52}, vibe:"focused", pct:71, votes:287, miles:1.4, details:"Dense pedestrian traffic and double-parked delivery trucks. Navigate carefully — rewards the patient driver.", breakdown:[{v:"focused",p:71},{v:"stressful",p:45},{v:"scenic",p:32},{v:"peaceful",p:12},{v:"exhilarating",p:8}] },
  { id:"seg5", name:"Claremont Canyon Road", from:{x:28,y:52}, to:{x:38,y:60}, vibe:"exhilarating", pct:88, votes:445, miles:2.8, details:"Climbing switchbacks through Claremont Canyon. Tight curves through the eucalyptus trees — Sport mode required.", breakdown:[{v:"exhilarating",p:88},{v:"focused",p:76},{v:"scenic",p:62},{v:"peaceful",p:18},{v:"stressful",p:12}] },
  { id:"seg6", name:"Grizzly Peak Blvd", from:{x:38,y:60}, to:{x:52,y:66}, vibe:"exhilarating", pct:94, votes:523, miles:5.6, details:"THE drive in the Berkeley Hills. Sweeping ridgeline road with 180° bay views. Empty at dawn, perfect at golden hour.", breakdown:[{v:"exhilarating",p:94},{v:"scenic",p:91},{v:"focused",p:55},{v:"peaceful",p:22},{v:"stressful",p:6}] },
  { id:"seg7", name:"Stadium Rim Road", from:{x:52,y:66}, to:{x:62,y:72}, vibe:"scenic", pct:84, votes:234, miles:1.5, details:"Winding above Memorial Stadium with hillside views. Light traffic, great pavement — a little-known gem.", breakdown:[{v:"scenic",p:84},{v:"exhilarating",p:48},{v:"peaceful",p:42},{v:"focused",p:22},{v:"boring",p:4}] },
  { id:"seg8", name:"College Ave (Elmwood)", from:{x:62,y:72}, to:{x:74,y:80}, vibe:"peaceful", pct:79, votes:312, miles:2.2, details:"Charming neighborhood main street. Boutiques, cafés, and tree canopy — the nicest surface street in Berkeley.", breakdown:[{v:"peaceful",p:79},{v:"scenic",p:65},{v:"boring",p:18},{v:"focused",p:12},{v:"exhilarating",p:6}] },
  { id:"seg9", name:"Tilden Park Road", from:{x:74,y:80}, to:{x:82,y:90}, vibe:"scenic", pct:91, votes:412, miles:3.2, details:"Into the East Bay wilderness above Berkeley. Open meadows and redwoods — feels miles from the city.", breakdown:[{v:"scenic",p:91},{v:"peaceful",p:78},{v:"exhilarating",p:38},{v:"focused",p:24},{v:"boring",p:4}] },
];

const VibeMapApp = () => {
  const [selectedSeg, setSelectedSeg] = useState(null);
  const [vibeFilter, setVibeFilter] = useState("all");
  const [userRatings, setUserRatings] = useState({});

  const seg = roadSegments.find(s => s.id === selectedSeg);
  const rateSeg = (segId, vibe) => setUserRatings(p => ({...p, [segId]: vibe}));
  const totalVotes = roadSegments.reduce((s,r) => s + r.votes, 0);
  const totalMiles = roadSegments.reduce((s,r) => s + r.miles, 0).toFixed(1);

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:9, fontWeight:800, letterSpacing:3, color:"#E8C438", textTransform:"uppercase", marginBottom:8 }}>🍃 Vibe Map</div>
        <h2 style={{ fontFamily:"'Anybody',sans-serif", fontSize:22, fontWeight:800, margin:0, color:"#F5F5F5", letterSpacing:-0.5 }}>Emotional Road Map</h2>
        <div style={{ fontSize:12, color:"#666", marginTop:4 }}>How drivers <em>feel</em> on every Berkeley road — {totalVotes.toLocaleString()} ratings across {totalMiles} mi</div>
      </div>

      <div style={{ display:"flex", gap:5, marginBottom:14, overflowX:"auto", paddingBottom:2 }}>
        <button onClick={()=>{setVibeFilter("all");setSelectedSeg(null);}} style={{ padding:"5px 12px", borderRadius:16, border:`1px solid ${vibeFilter==="all"?"#E8C43840":BDR}`, background:vibeFilter==="all"?"#E8C43815":"transparent", color:vibeFilter==="all"?"#E8C438":"#666", fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", whiteSpace:"nowrap" }}>All Vibes</button>
        {Object.entries(vibeEmojis).map(([k,v]) => (
          <button key={k} onClick={()=>{setVibeFilter(k);setSelectedSeg(null);}} style={{ padding:"5px 12px", borderRadius:16, border:`1px solid ${vibeFilter===k?v.color+"40":BDR}`, background:vibeFilter===k?`${v.color}15`:"transparent", color:vibeFilter===k?v.color:"#666", fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:4 }}>
            <span style={{fontSize:12}}>{v.emoji}</span>{v.label}
          </button>
        ))}
      </div>

      {/* Heat Map */}
      <div onClick={()=>setSelectedSeg(null)} style={{ position:"relative", width:"100%", height:400, borderRadius:16, overflow:"hidden", background:"linear-gradient(170deg, #040A1C 0%, #050C1E 50%, #060E22 100%)", border:`1px solid ${BDR}`, marginBottom:16 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.1 }}>
          {[10,20,30,40,50,60,70,80,90].map(v => <line key={`h${v}`} x1="0" y1={v} x2="100" y2={v} stroke="white" strokeWidth="0.08"/>)}
          {[10,20,30,40,50,60,70,80,90].map(v => <line key={`v${v}`} x1={v} y1="0" x2={v} y2="100" stroke="white" strokeWidth="0.08"/>)}
        </svg>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.08 }}>
          <path d="M 0,0 Q 6,8 10,16 Q 14,24 12,34 Q 8,44 14,54 Q 20,62 16,72 Q 12,82 18,92 L 18,100 L 0,100 Z" fill="#3DD6C8"/>
        </svg>
        <div style={{ position:"absolute", top:4, left:10, fontSize:7, color:"rgba(255,255,255,0.08)", fontFamily:"'Anybody',sans-serif", fontWeight:700, letterSpacing:1.5 }}>SAN FRANCISCO</div>
        <div style={{ position:"absolute", bottom:4, right:10, fontSize:7, color:"rgba(255,255,255,0.08)", fontFamily:"'Anybody',sans-serif", fontWeight:700, letterSpacing:1.5 }}>CARMEL</div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
          <defs>
            {roadSegments.map(s => (
              <linearGradient key={`g-${s.id}`} id={`grad-${s.id}`} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={vibeEmojis[s.vibe].color} stopOpacity="0.9"/><stop offset="100%" stopColor={vibeEmojis[s.vibe].colorEnd} stopOpacity="0.9"/>
              </linearGradient>
            ))}
          </defs>
          {roadSegments.map(s => { const vis = vibeFilter==="all"||s.vibe===vibeFilter; return (
            <line key={`sh-${s.id}`} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke={vibeEmojis[s.vibe].color} strokeWidth="4" strokeLinecap="round" opacity={vis?0.15:0.02} style={{transition:"opacity 0.4s"}}/>
          ); })}
          {roadSegments.map(s => { const vis = vibeFilter==="all"||s.vibe===vibeFilter; const isSel = selectedSeg===s.id; return (
            <line key={`ln-${s.id}`} x1={s.from.x} y1={s.from.y} x2={s.to.x} y2={s.to.y} stroke={`url(#grad-${s.id})`} strokeWidth={isSel?2.5:1.5} strokeLinecap="round" opacity={vis?(isSel?1:0.75):0.08} style={{transition:"all 0.4s"}}/>
          ); })}
        </svg>

        {roadSegments.map(s => {
          const vis = vibeFilter==="all"||s.vibe===vibeFilter;
          const isSel = selectedSeg===s.id;
          const mx = (s.from.x+s.to.x)/2, my = (s.from.y+s.to.y)/2;
          const v = vibeEmojis[s.vibe];
          return (
            <div key={s.id} onClick={e=>{e.stopPropagation();setSelectedSeg(isSel?null:s.id);}}
              style={{ position:"absolute", left:`${mx}%`, top:`${my}%`, transform:"translate(-50%,-50%)", cursor:"pointer", zIndex:isSel?20:5, transition:"all 0.3s", opacity:vis?1:0.15, pointerEvents:vis?"auto":"none" }}>
              <div style={{ width:isSel?40:28, height:isSel?40:28, borderRadius:"50%", background:`radial-gradient(circle at 40% 35%, ${v.color}50, ${v.color}20)`, border:`2px solid ${v.color}${isSel?"DD":"60"}`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:isSel?`0 0 20px ${v.color}40, 0 0 40px ${v.color}15`:`0 0 8px ${v.color}20`, transition:"all 0.3s" }}>
                <span style={{ fontSize:isSel?16:12 }}>{v.emoji}</span>
              </div>
              {vis && (
                <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", marginTop:5, whiteSpace:"nowrap", textAlign:"center", background:isSel?"rgba(0,0,0,0.9)":"rgba(0,0,0,0.5)", padding:isSel?"4px 10px":"2px 6px", borderRadius:6, border:`1px solid ${isSel?v.color+"50":"transparent"}`, transition:"all 0.3s" }}>
                  <div style={{ fontSize:isSel?9:7, fontWeight:600, color:isSel?"#FFF":"#AAA" }}>{s.name.split("→").pop().trim()}</div>
                  {isSel && <div style={{ fontSize:7, color:v.color, marginTop:1 }}>{v.label} · {s.pct}%</div>}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ position:"absolute", left:"22%", top:"6%", transform:"translate(-50%,-50%)", width:8, height:8, borderRadius:"50%", background:"#FFF", border:"2px solid #0D1B2A", boxShadow:"0 0 8px rgba(255,255,255,0.3)", zIndex:10 }}/>
        <div style={{ position:"absolute", left:"82%", top:"90%", transform:"translate(-50%,-50%)", width:8, height:8, borderRadius:"50%", background:"#E8C438", border:"2px solid #0D1B2A", boxShadow:"0 0 8px #E8C43840", zIndex:10 }}/>
        {!selectedSeg && <div style={{ position:"absolute", bottom:10, left:"50%", transform:"translateX(-50%)", fontSize:9, color:"rgba(255,255,255,0.2)", background:"rgba(0,0,0,0.4)", padding:"4px 12px", borderRadius:14 }}>Tap a segment to see how drivers feel</div>}
      </div>

      {/* Segment Detail */}
      {seg && (
        <div className="fade-in" key={seg.id} style={{ background:`linear-gradient(160deg, ${vibeEmojis[seg.vibe].color}0A, transparent 60%)`, border:`1px solid ${vibeEmojis[seg.vibe].color}30`, borderRadius:18, padding:20, marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:20 }}>{vibeEmojis[seg.vibe].emoji}</span>
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:vibeEmojis[seg.vibe].color, textTransform:"uppercase", fontFamily:"'Anybody',sans-serif" }}>{vibeEmojis[seg.vibe].label}</span>
                <span style={{ fontFamily:"'Anybody',sans-serif", fontSize:14, fontWeight:800, color:vibeEmojis[seg.vibe].color }}>{seg.pct}%</span>
              </div>
              <div style={{ fontSize:17, fontWeight:800, color:"#F2F2F2", fontFamily:"'Anybody',sans-serif", letterSpacing:-0.3 }}>{seg.name}</div>
              <div style={{ fontSize:11, color:"#888", marginTop:3 }}>{seg.miles} miles · {seg.votes} driver ratings</div>
            </div>
            <button onClick={()=>setSelectedSeg(null)} style={{ background:SRF, border:`1px solid ${BDR}`, color:"#888", fontSize:14, cursor:"pointer", padding:"4px 10px", borderRadius:8 }}>×</button>
          </div>
          <div style={{ fontSize:13, color:"#AAA", lineHeight:1.6, marginBottom:16, paddingLeft:2 }}>"{seg.details}"</div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#555", textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:10 }}>Community Vibe Breakdown</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {seg.breakdown.sort((a,b) => b.p - a.p).map(b => { const vd = vibeEmojis[b.v]; return (
                <div key={b.v}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:14 }}>{vd.emoji}</span><span style={{ fontSize:12, fontWeight:600, color:"#CCC" }}>{vd.label}</span></div>
                    <span style={{ fontFamily:"'Anybody',sans-serif", fontSize:14, fontWeight:700, color:vd.color }}>{b.p}%</span>
                  </div>
                  <div style={{ height:8, borderRadius:4, background:"rgba(255,255,255,0.04)", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:4, width:`${b.p}%`, background:`linear-gradient(90deg, ${vd.color}, ${vd.colorEnd||vd.color})`, boxShadow:`0 0 8px ${vd.color}30`, transition:"width 0.6s ease" }}/>
                  </div>
                </div>
              ); })}
            </div>
          </div>

          <div style={{ background:SRF, border:`1px solid ${BDR}`, borderRadius:14, padding:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:"#CCC", marginBottom:10 }}>{userRatings[seg.id] ? `You rated this: ${vibeEmojis[userRatings[seg.id]].emoji} ${vibeEmojis[userRatings[seg.id]].label}` : "How did this stretch feel to you?"}</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {Object.entries(vibeEmojis).map(([k,v]) => { const isRated = userRatings[seg.id]===k; return (
                <button key={k} onClick={()=>rateSeg(seg.id,k)} style={{ display:"flex", alignItems:"center", gap:5, padding:"7px 12px", borderRadius:10, border:`1px solid ${isRated?v.color+"60":BDR}`, background:isRated?`${v.color}18`:SRF, color:isRated?v.color:"#888", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", transition:"all 0.2s" }}>
                  <span style={{fontSize:14}}>{v.emoji}</span>{v.label}
                </button>
              ); })}
            </div>
          </div>
        </div>
      )}

      {/* Vibe Summary */}
      <div style={{ background:SRF, border:`1px solid ${BDR}`, borderRadius:16, padding:"18px 18px 16px", marginBottom:16 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#555", textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:14 }}>Route Vibe Summary</div>
        <div style={{ height:14, borderRadius:7, overflow:"hidden", display:"flex", marginBottom:14 }}>
          {(() => { const t={}; roadSegments.forEach(s=>{s.breakdown.forEach(b=>{t[b.v]=(t[b.v]||0)+b.p;})}); const sum=Object.values(t).reduce((a,b)=>a+b,0); return Object.entries(t).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(<div key={k} style={{width:`${(v/sum)*100}%`,height:"100%",background:`linear-gradient(90deg,${vibeEmojis[k].color},${vibeEmojis[k].colorEnd})`}} title={`${vibeEmojis[k].label}: ${Math.round((v/sum)*100)}%`}/>)); })()}
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {(() => { const t={}; roadSegments.forEach(s=>{s.breakdown.forEach(b=>{t[b.v]=(t[b.v]||0)+b.p;})}); const sum=Object.values(t).reduce((a,b)=>a+b,0); return Object.entries(t).sort((a,b)=>b[1]-a[1]).map(([k,v])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:vibeEmojis[k].color}}/><span style={{fontSize:10,color:"#888"}}>{vibeEmojis[k].emoji} {vibeEmojis[k].label}</span><span style={{fontFamily:"'Anybody',sans-serif",fontSize:10,fontWeight:700,color:vibeEmojis[k].color}}>{Math.round((v/sum)*100)}%</span></div>)); })()}
        </div>
      </div>

      {/* Highlights */}
      <div>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:"#555", textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:10 }}>Highlights</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[{label:"Most Exhilarating",seg:roadSegments.find(s=>s.vibe==="exhilarating"&&s.pct>=90),vibe:"exhilarating"},{label:"Most Peaceful",seg:roadSegments.find(s=>s.vibe==="peaceful"&&s.pct>=90),vibe:"peaceful"},{label:"Most Scenic",seg:roadSegments.find(s=>s.vibe==="scenic"&&s.pct>=86),vibe:"scenic"}].filter(h=>h.seg).map(h => { const v=vibeEmojis[h.vibe]; return (
            <div key={h.label} onClick={()=>setSelectedSeg(h.seg.id)} style={{ display:"flex", alignItems:"center", gap:14, cursor:"pointer", background:`${v.color}08`, border:`1px solid ${v.color}20`, borderRadius:14, padding:"14px 16px", transition:"all 0.2s" }}>
              <div style={{ width:42, height:42, borderRadius:12, background:`${v.color}15`, border:`1.5px solid ${v.color}35`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><span style={{ fontSize:20 }}>{v.emoji}</span></div>
              <div style={{ flex:1 }}><div style={{ fontSize:10, color:"#666", marginBottom:2 }}>{h.label}</div><div style={{ fontSize:14, fontWeight:700, color:"#EEE" }}>{h.seg.name}</div><div style={{ fontSize:11, color:"#888", marginTop:2 }}>{h.seg.miles} mi · {h.seg.pct}% rated {v.label.toLowerCase()}</div></div>
              <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:22, fontWeight:800, color:v.color }}>{h.seg.pct}%</div>
            </div>
          ); })}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════
   ROOT — App Switcher
   ═══════════════════ */

/* ── Small reusable UI atoms for BMW HMI shell ── */
const DockBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={{
    display:"flex", flexDirection:"column", alignItems:"center", gap:5,
    background:"transparent", border:"none", cursor:"pointer",
    padding:"8px 14px", borderRadius:12,
    transition:"all 0.2s",
  }}>
    <div style={{
      width:38, height:38, borderRadius:10,
      background: active ? "rgba(14,165,255,0.18)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${active ? "#0EA5FF55" : "rgba(255,255,255,0.08)"}`,
      display:"flex", alignItems:"center", justifyContent:"center",
      boxShadow: active ? "0 0 14px #0EA5FF40, inset 0 0 8px #0EA5FF15" : "none",
      transition:"all 0.2s",
    }}>{icon}</div>
    <span style={{ fontSize:9, fontWeight:600, color: active ? "#0EA5FF" : "#445", letterSpacing:0.5, textTransform:"uppercase" }}>{label}</span>
  </button>
);

const StatusPill = ({ children }) => (
  <span style={{ fontSize:10, color:"#4A7A9B", fontWeight:500, display:"flex", alignItems:"center", gap:3 }}>{children}</span>
);

export default function Root() {
  const [app, setApp] = useState("recs");
  const [time, setTime] = useState(() => {
    const d = new Date(); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  });
  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date(); setTime(`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`);
    }, 10000);
    return () => clearInterval(t);
  }, []);

  const navItems = [
    { id:"trip", label:"Trip",    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><path d="m4.9 4.9 2.1 2.1M16.9 16.9l2.1 2.1M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1"/></svg> },
    { id:"recs", label:"Spots",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg> },
    { id:"past", label:"Drives",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg> },
    { id:"vibe", label:"Vibe",    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg> },
    { id:"home", label:"Home",    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
    { id:"phone", label:"Phone",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.22 2 2 0 012 .04h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg> },
    { id:"climate", label:"Climate", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anybody:wght@400;600;700;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%{transform:translate(-50%,-50%) scale(0.8);opacity:0.5} 100%{transform:translate(-50%,-50%) scale(1.5);opacity:0} }
        @keyframes blueGlow { 0%,100%{box-shadow:0 0 18px #0EA5FF22} 50%{box-shadow:0 0 32px #0EA5FF44} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        .fade-in { animation: fadeIn 0.3s ease both; }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:2px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(14,165,255,0.2); border-radius:2px; }
        input::placeholder { color:#1E3A5F; }
        button:focus { outline:none; }
      `}</style>

      {/* Outer bezel — angled corners */}
      <div style={{
        fontFamily:"'Instrument Sans',sans-serif",
        background: NBG,
        color:"#D0E8FF",
        minHeight:"100vh",
        display:"flex",
        flexDirection:"column",
        position:"relative",
        overflow:"hidden",
        clipPath:"polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)",
      }}>

        {/* Ambient background glow */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
          background:`radial-gradient(ellipse 60% 50% at 65% 40%, rgba(14,165,255,0.06) 0%, transparent 70%),
                     radial-gradient(ellipse 40% 30% at 20% 60%, rgba(14,165,255,0.04) 0%, transparent 60%)`
        }}/>
        {/* Subtle scanline texture */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0,
          backgroundImage:"repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          opacity:0.4,
        }}/>
        {/* Top edge glow line */}
        <div style={{ position:"fixed", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg, transparent 5%, #0EA5FF60 30%, #0EA5FFaa 50%, #0EA5FF60 70%, transparent 95%)", zIndex:100, pointerEvents:"none" }}/>

        {/* ── TOP STATUS BAR ── */}
        <div style={{
          position:"relative", zIndex:20,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"10px 24px 10px 20px",
          background:"rgba(4,10,28,0.85)",
          borderBottom:"1px solid rgba(14,165,255,0.14)",
          backdropFilter:"blur(12px)",
          flexShrink:0,
        }}>
          {/* Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:26, height:26, borderRadius:6, background:"rgba(14,165,255,0.12)", border:"1px solid rgba(14,165,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 10px #0EA5FF30" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#0EA5FF" strokeWidth="1.5"/><path d="M12 2C12 2 7 6 7 12s5 10 5 10" stroke="#0EA5FF" strokeWidth="1.5" strokeLinecap="round"/><path d="M12 2c0 0 5 4 5 10s-5 10-5 10" stroke="#0EA5FF" strokeWidth="1.5" strokeLinecap="round"/><line x1="2" y1="12" x2="22" y2="12" stroke="#0EA5FF" strokeWidth="1.5"/></svg>
            </div>
            <div>
              <div style={{ fontSize:7, fontWeight:700, letterSpacing:2.5, color:"rgba(14,165,255,0.5)", textTransform:"uppercase" }}>BMW Research</div>
              <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:13, fontWeight:800, color:"#D0E8FF", letterSpacing:0.5 }}>Driver HMI</div>
            </div>
          </div>

          {/* Nav tabs centered */}
          <div style={{ display:"flex", gap:2, background:"rgba(14,165,255,0.06)", border:"1px solid rgba(14,165,255,0.14)", borderRadius:12, padding:3 }}>
            {navItems.slice(0,4).map(n => (
              <button key={n.id} onClick={()=>setApp(n.id)} style={{
                display:"flex", alignItems:"center", gap:7,
                padding:"7px 16px", borderRadius:9, border:"none",
                background: app===n.id ? "rgba(14,165,255,0.2)" : "transparent",
                color: app===n.id ? "#0EA5FF" : "rgba(100,160,200,0.55)",
                fontSize:11, fontWeight:700, cursor:"pointer",
                fontFamily:"'Anybody',sans-serif", letterSpacing:0.3,
                transition:"all 0.2s",
                boxShadow: app===n.id ? "0 0 12px #0EA5FF30, inset 0 0 6px #0EA5FF15" : "none",
              }}>
                <span style={{ color:"inherit", opacity:0.9 }}>{n.icon}</span>{n.label}
              </button>
            ))}
          </div>

          {/* Right status cluster */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {/* Signal bars */}
            <StatusPill>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="2" y="14" width="3" height="8" rx="1" fill="#0EA5FF" opacity="0.4"/><rect x="7" y="10" width="3" height="12" rx="1" fill="#0EA5FF" opacity="0.6"/><rect x="12" y="6" width="3" height="16" rx="1" fill="#0EA5FF" opacity="0.8"/><rect x="17" y="2" width="3" height="20" rx="1" fill="#0EA5FF"/></svg>
            </StatusPill>
            {/* Bluetooth */}
            <StatusPill>
              <svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke="#0EA5FF" strokeWidth="2" strokeLinecap="round"><path d="M6 7l12 10-6 5V2l6 5L6 17"/></svg>
            </StatusPill>
            {/* Wifi */}
            <StatusPill>
              <svg width="14" height="11" viewBox="0 0 24 24" fill="none" stroke="#0EA5FF" strokeWidth="2" strokeLinecap="round"><path d="M1.42 9a16 16 0 0121.16 0"/><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M10.54 16.1a6 6 0 012.92 0"/><circle cx="12" cy="20" r="1" fill="#0EA5FF"/></svg>
            </StatusPill>
            {/* Divider */}
            <div style={{ width:1, height:16, background:"rgba(14,165,255,0.15)" }}/>
            {/* Temp */}
            <div style={{ fontSize:12, fontWeight:700, color:"#0EA5FF", fontFamily:"'Anybody',sans-serif" }}>22°C</div>
            {/* Time */}
            <div style={{ fontSize:14, fontWeight:800, color:"#D0E8FF", fontFamily:"'Anybody',sans-serif", letterSpacing:1.5 }}>{time}</div>
            {/* Profile */}
            <div style={{ width:28, height:28, borderRadius:8, background:"rgba(14,165,255,0.15)", border:"1px solid rgba(14,165,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5FF" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex:1, overflowY:"auto", position:"relative", zIndex:10 }}>
          <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 32px 100px" }}>
            <div key={app} className="fade-in">
              {app === "trip" ? <TripModeApp /> : app === "recs" ? <RecommendationsApp /> : app === "past" ? <PastDrivesApp /> : <VibeMapApp />}
            </div>
          </div>
        </div>

        {/* ── BOTTOM DOCK ── */}
        <div style={{
          position:"fixed", bottom:0, left:0, right:0, zIndex:50,
          background:"rgba(4,10,28,0.92)",
          borderTop:"1px solid rgba(14,165,255,0.18)",
          backdropFilter:"blur(20px)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 32px",
          boxShadow:"0 -4px 30px rgba(14,165,255,0.08)",
        }}>
          {/* Left climate */}
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:120 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5FF" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/></svg>
            <div>
              <div style={{ fontSize:16, fontWeight:800, color:"#0EA5FF", fontFamily:"'Anybody',sans-serif", lineHeight:1 }}>22.0°</div>
              <div style={{ fontSize:8, color:"rgba(14,165,255,0.45)", letterSpacing:0.5, fontWeight:600 }}>DRIVER</div>
            </div>
          </div>

          {/* Center dock icons */}
          <div style={{ display:"flex", alignItems:"center", gap:2 }}>
            {navItems.map(n => (
              <DockBtn key={n.id} icon={<span style={{ color: app===n.id ? "#0EA5FF" : "rgba(100,160,200,0.45)" }}>{n.icon}</span>} label={n.label} active={app===n.id} onClick={()=>{ if(["trip","recs","past","vibe"].includes(n.id)) setApp(n.id); }}/>
            ))}
          </div>

          {/* Right climate */}
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:120, justifyContent:"flex-end" }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:16, fontWeight:800, color:"#0EA5FF", fontFamily:"'Anybody',sans-serif", lineHeight:1 }}>21.0°</div>
              <div style={{ fontSize:8, color:"rgba(14,165,255,0.45)", letterSpacing:0.5, fontWeight:600 }}>PASSENGER</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0EA5FF" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/></svg>
          </div>
        </div>

        {/* Bottom edge glow */}
        <div style={{ position:"fixed", bottom:72, left:0, right:0, height:1, background:"linear-gradient(90deg, transparent 5%, #0EA5FF30 30%, #0EA5FF55 50%, #0EA5FF30 70%, transparent 95%)", zIndex:49, pointerEvents:"none" }}/>
      </div>
    </>
  );
}