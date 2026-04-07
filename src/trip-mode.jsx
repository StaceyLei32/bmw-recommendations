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
const SRF = "rgba(255,255,255,0.035)";
const BDR = "rgba(255,255,255,0.07)";

/* ── Data ── */

const initCars = [
  { id:"c1", name:"Marcus W.", car:"M4 Competition", avatar:"MW", accent:A, status:"driving", speed:71, eta:"3:42 PM", dist:0, isLeader:true, fuel:72 },
  { id:"c2", name:"Priya S.", car:"iX M60", avatar:"PS", accent:T, status:"driving", speed:69, eta:"3:44 PM", dist:0.3, isLeader:false, fuel:58 },
  { id:"c3", name:"Tyler K.", car:"M340i", avatar:"TK", accent:O, status:"fuel_stop", speed:0, eta:"3:55 PM", dist:2.1, isLeader:false, fuel:11 },
  { id:"c4", name:"Noa R.", car:"X3 M40i", avatar:"NR", accent:P, status:"resting", speed:0, eta:"4:05 PM", dist:4.8, isLeader:false, fuel:44 },
];

const initItinerary = [
  { id:"s1", time:"09:00", label:"Depart San Francisco", sub:"Golden Gate meetup", done:true },
  { id:"s2", time:"10:30", label:"Pacifica Overlook", sub:"10-min photo stop", done:true },
  { id:"s3", time:"12:00", label:"Lunch — Davenport", sub:"Whale City Bakery", done:true },
  { id:"s4", time:"14:15", label:"Big Sur — Bixby Bridge", sub:"Vista point pulloff", done:false, active:true },
  { id:"s5", time:"15:30", label:"Pfeiffer Beach", sub:"Purple sand, 30 min", done:false },
  { id:"s6", time:"17:00", label:"Arrive Carmel", sub:"L'Auberge check-in", done:false },
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
    id:"spot1", name:"Boba Guys", type:"food", x:32, y:22,
    visitors:94, rating:4.8, category:"Boba & Tea",
    tagline:"Most visited boba spot on this route",
    items:[
      { name:"Classic Milk Tea", orders:312, pct:38, hot:true },
      { name:"Strawberry Matcha", orders:198, pct:24 },
      { name:"Horchata Boba", orders:147, pct:18 },
      { name:"Jasmine Green Tea", orders:89, pct:11 },
      { name:"Mango Lassi", orders:73, pct:9 },
    ],
    peakHour:"2–4 PM", avgSpend:"$7.40", trend:"+23% this week",
  },
  {
    id:"spot2", name:"Duarte's Tavern", type:"food", x:28, y:38,
    visitors:203, rating:4.6, category:"Restaurant",
    tagline:"Legendary artichoke soup since 1894",
    items:[
      { name:"Cream of Artichoke Soup", orders:589, pct:42, hot:true },
      { name:"Crab Cioppino", orders:301, pct:22 },
      { name:"Fish & Chips", orders:234, pct:17 },
      { name:"Olallieberry Pie", orders:178, pct:13 },
      { name:"Clam Chowder", orders:87, pct:6 },
    ],
    peakHour:"12–1:30 PM", avgSpend:"$28.50", trend:"+8% this week",
  },
  {
    id:"spot3", name:"Hawk Hill Overlook", type:"scenic", x:42, y:12,
    visitors:631, rating:4.9, category:"Scenic Viewpoint",
    tagline:"#1 photo spot for BMW drivers on PCH",
    items:[
      { name:"Golden Gate photo", orders:1842, pct:45, hot:true, label:"photos" },
      { name:"Sunset visit", orders:723, pct:18, label:"visits" },
      { name:"Sunrise visit", orders:412, pct:10, label:"visits" },
      { name:"Drone footage", orders:289, pct:7, label:"clips" },
      { name:"Timelapse", orders:198, pct:5, label:"recordings" },
    ],
    peakHour:"5:30–7 PM", avgSpend:"Free", trend:"+15% this week",
  },
  {
    id:"spot4", name:"Phil's Fish Market", type:"food", x:62, y:58,
    visitors:178, rating:4.7, category:"Seafood",
    tagline:"Cioppino so good you'll want seconds",
    items:[
      { name:"Cioppino in Bread Bowl", orders:445, pct:40, hot:true },
      { name:"Grilled Calamari", orders:267, pct:24 },
      { name:"Fish Tacos", orders:189, pct:17 },
      { name:"Clam Strips", orders:123, pct:11 },
      { name:"Seafood Pasta", orders:89, pct:8 },
    ],
    peakHour:"11:30–1 PM", avgSpend:"$22", trend:"+12% this week",
  },
  {
    id:"spot5", name:"Cars & Coffee", type:"event", x:70, y:68,
    visitors:445, rating:4.8, category:"Car Meet",
    tagline:"Saturday mornings — biggest BMW turnout in NorCal",
    items:[
      { name:"M3/M4 owners", orders:89, pct:32, hot:true, label:"attendees" },
      { name:"3-Series", orders:67, pct:24, label:"attendees" },
      { name:"X models", orders:56, pct:20, label:"attendees" },
      { name:"i-Series EV", orders:42, pct:15, label:"attendees" },
      { name:"Classic/Vintage", orders:25, pct:9, label:"attendees" },
    ],
    peakHour:"8–10 AM Sat", avgSpend:"$5 coffee", trend:"+31% this month",
  },
  {
    id:"spot6", name:"Bavarian Motorwerks", type:"service", x:18, y:30,
    visitors:412, rating:4.9, category:"BMW Service",
    tagline:"Top-rated independent BMW shop on the coast",
    items:[
      { name:"Oil Change / Inspection", orders:623, pct:35, hot:true, label:"services" },
      { name:"Brake Service", orders:389, pct:22, label:"services" },
      { name:"Suspension Work", orders:267, pct:15, label:"services" },
      { name:"Software / Coding", orders:234, pct:13, label:"services" },
      { name:"Performance Upgrades", orders:178, pct:10, label:"services" },
    ],
    peakHour:"9 AM–12 PM", avgSpend:"$185", trend:"Steady",
  },
  {
    id:"spot7", name:"Alice's Restaurant", type:"food", x:38, y:32,
    visitors:287, rating:4.4, category:"Cafe & Meetup",
    tagline:"Weekend car meet with great breakfast",
    items:[
      { name:"Breakfast Burrito", orders:401, pct:34, hot:true },
      { name:"Eggs Benedict", orders:278, pct:23 },
      { name:"Avocado Toast", orders:198, pct:17 },
      { name:"Drip Coffee", orders:189, pct:16 },
      { name:"Smoothie Bowl", orders:112, pct:10 },
    ],
    peakHour:"9–11 AM", avgSpend:"$16", trend:"+5% this week",
  },
  {
    id:"spot8", name:"Laguna Seca", type:"event", x:78, y:74,
    visitors:312, rating:4.9, category:"Track Day",
    tagline:"Put your M car where it belongs",
    items:[
      { name:"Track day pass", orders:312, pct:45, hot:true, label:"bookings" },
      { name:"Instructor session", orders:156, pct:22, label:"bookings" },
      { name:"Ride-along", orders:112, pct:16, label:"bookings" },
      { name:"Photography pkg", orders:78, pct:11, label:"bookings" },
      { name:"Car rental (track)", orders:42, pct:6, label:"bookings" },
    ],
    peakHour:"All day events", avgSpend:"$350", trend:"+18% this month",
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
  const endRef = useRef(null);

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
  const tabs = [{ id:"convoy", label:"Convoy", icon:"◉" }, { id:"route", label:"Route", icon:"◈" }, { id:"chat", label:"Chat", icon:"◎" }];

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:9, fontWeight:800, letterSpacing:3, color:A, textTransform:"uppercase", marginBottom:8 }}>◉ Trip Mode</div>
        <h2 style={{ fontFamily:"'Anybody',sans-serif", fontSize:22, fontWeight:800, margin:0, color:"#F5F5F5", letterSpacing:-0.5 }}>Pacific Coast Highway</h2>
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
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:"'Anybody',sans-serif", fontSize:9, fontWeight:800, letterSpacing:3, color:T, textTransform:"uppercase", marginBottom:8 }}>✦ Recommendations</div>
        <h2 style={{ fontFamily:"'Anybody',sans-serif", fontSize:22, fontWeight:800, margin:0, color:"#F5F5F5", letterSpacing:-0.5 }}>Popular Near You</h2>
        <div style={{ fontSize:12, color:"#666", marginTop:4 }}>Aggregated from BMW drivers on Pacific Coast Highway</div>
      </div>

      <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:2 }}>
        {filters.map(f => (
          <button key={f.id} onClick={()=>{ setFilter(f.id); setSelected(null); }} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${filter===f.id?T+"40":BDR}`, background:filter===f.id?`${T}15`:"transparent", color:filter===f.id?T:"#666", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", transition:"all 0.2s" }}>
            {f.label} <span style={{ fontSize:9, opacity:0.6 }}>{f.count}</span>
          </button>
        ))}
      </div>

      <div onClick={() => setSelected(null)} style={{ position:"relative", width:"100%", height:360, borderRadius:16, overflow:"hidden", background:"linear-gradient(160deg, #0D1B2A 0%, #0A1628 40%, #0F1D2F 70%, #0B1420 100%)", border:`1px solid ${BDR}`, marginBottom:16, cursor:"default" }}>
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
          return (
            <div key={s.id} onClick={(e) => { e.stopPropagation(); setSelected(isSel ? null : s.id); }} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, transform:"translate(-50%,-50%)", cursor:"pointer", zIndex:isSel?20:s.visitors>400?5:1, transition:"all 0.3s ease" }}>
              {s.visitors > 300 && !isSel && (<div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:52, height:52, borderRadius:"50%", border:`1px solid ${col}25`, animation:"pulse-ring 3s infinite" }}/>)}
              <div style={{ width:isSel?46:36, height:isSel?46:36, borderRadius:"50%", background:`radial-gradient(circle at 40% 35%, ${col}40, ${col}15)`, border:`2px solid ${col}${isSel?"CC":"55"}`, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", boxShadow:isSel?`0 0 24px ${col}50, 0 0 48px ${col}20`:`0 0 10px ${col}15`, transition:"all 0.3s ease" }}>
                <span style={{ fontSize:isSel?12:10, fontWeight:800, color:"#FFF", fontFamily:"'Anybody',sans-serif", lineHeight:1, textShadow:`0 0 8px ${col}` }}>{s.visitors}</span>
                <span style={{ fontSize:isSel?7:6, color:"rgba(255,255,255,0.6)", fontWeight:600, marginTop:1 }}>visits</span>
              </div>
              <div style={{ position:"absolute", top:"100%", left:"50%", transform:"translateX(-50%)", marginTop:6, whiteSpace:"nowrap", textAlign:"center", background:isSel?"rgba(0,0,0,0.9)":"rgba(0,0,0,0.65)", padding:isSel?"5px 12px":"3px 8px", borderRadius:8, border:`1px solid ${isSel?col+"60":"rgba(255,255,255,0.06)"}`, backdropFilter:"blur(8px)", transition:"all 0.3s" }}>
                <div style={{ fontSize:isSel?11:9, fontWeight:600, color:isSel?"#FFF":"#CCC" }}>{s.name}</div>
                {isSel && <div style={{ fontSize:8, color:col, marginTop:2 }}>{s.category} · ★{s.rating}</div>}
              </div>
            </div>
          );
        })}
        {!selected && (<div style={{ position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)", fontSize:10, color:"rgba(255,255,255,0.25)", background:"rgba(0,0,0,0.5)", padding:"5px 14px", borderRadius:20, backdropFilter:"blur(4px)" }}>Tap a spot to see what's popular</div>)}
      </div>

      {spot && (
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
        </div>
      )}

      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.5, color:A, textTransform:"uppercase", fontFamily:"'Anybody',sans-serif", marginBottom:3 }}>Discover Your Car</div>
            <div style={{ fontSize:12, color:"#666" }}>Contextual suggestions based on road, weather & driving data</div>
          </div>
        </div>
        {!activatedFeatures.has(discoveryFeatures[discoverIdx].id) ? (
          <div className="fade-in" key={discoverIdx} style={{ background:`linear-gradient(160deg, ${discoveryFeatures[discoverIdx].color}12, transparent 70%)`, border:`1px solid ${discoveryFeatures[discoverIdx].color}30`, borderRadius:16, padding:18, marginBottom:10, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:`${discoveryFeatures[discoverIdx].color}06` }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10, position:"relative" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontFamily:"'Anybody',sans-serif", fontSize:18, color:discoveryFeatures[discoverIdx].color }}>{discoveryFeatures[discoverIdx].icon}</span><div style={{ fontSize:9, fontWeight:700, letterSpacing:1, color:discoveryFeatures[discoverIdx].color, textTransform:"uppercase", fontFamily:"'Anybody',sans-serif" }}>Suggestion · Now</div></div>
              <div style={{ display:"flex", gap:4 }}>
                <button onClick={()=>setDiscoverIdx(i => (i-1+discoveryFeatures.length)%discoveryFeatures.length)} style={{ background:SRF, border:`1px solid ${BDR}`, color:"#888", fontSize:12, cursor:"pointer", padding:"3px 8px", borderRadius:6, fontFamily:"'Anybody',sans-serif" }}>‹</button>
                <button onClick={()=>setDiscoverIdx(i => (i+1)%discoveryFeatures.length)} style={{ background:SRF, border:`1px solid ${BDR}`, color:"#888", fontSize:12, cursor:"pointer", padding:"3px 8px", borderRadius:6, fontFamily:"'Anybody',sans-serif" }}>›</button>
              </div>
            </div>
            <div style={{ fontSize:17, fontWeight:700, color:"#F0F0F0", marginBottom:4, position:"relative" }}>{discoveryFeatures[discoverIdx].title}</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, position:"relative" }}><span style={{ fontFamily:"'Anybody',sans-serif", fontSize:13, fontWeight:700, color:discoveryFeatures[discoverIdx].color }}>{discoveryFeatures[discoverIdx].stat}</span><span style={{ fontSize:12, color:"#888" }}>{discoveryFeatures[discoverIdx].statDetail}</span></div>
            <div style={{ fontSize:12, color:"#999", lineHeight:1.5, marginBottom:14, position:"relative" }}>{discoveryFeatures[discoverIdx].desc}</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, position:"relative" }}><span style={{ fontSize:9, color:"#555", background:SRF, padding:"3px 8px", borderRadius:6, border:`1px solid ${BDR}` }}>{discoveryFeatures[discoverIdx].context}</span></div>
            <div style={{ display:"flex", gap:8, position:"relative" }}>
              <button onClick={()=>{ setActivatedFeatures(p => new Set([...p, discoveryFeatures[discoverIdx].id])); }} style={{ background:discoveryFeatures[discoverIdx].color, border:"none", borderRadius:8, padding:"9px 20px", color:"#111", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>{discoveryFeatures[discoverIdx].cta} →</button>
              <button onClick={()=>setDiscoverIdx(i => (i+1)%discoveryFeatures.length)} style={{ background:SRF, border:`1px solid ${BDR}`, borderRadius:8, padding:"9px 16px", color:"#888", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>Skip</button>
            </div>
            <div style={{ position:"relative", marginTop:12, display:"flex", gap:3, justifyContent:"center" }}>
              {discoveryFeatures.map((_, i) => (<div key={i} onClick={()=>setDiscoverIdx(i)} style={{ width:i===discoverIdx?16:6, height:6, borderRadius:3, cursor:"pointer", background:activatedFeatures.has(discoveryFeatures[i].id)?`${T}60`:i===discoverIdx?discoveryFeatures[discoverIdx].color:"rgba(255,255,255,0.1)", transition:"all 0.25s" }}/>))}
            </div>
          </div>
        ) : (
          <div className="fade-in" style={{ background:`${T}0C`, border:`1px solid ${T}25`, borderRadius:14, padding:14, marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:16, color:T }}>✓</span>
            <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600, color:T }}>{discoveryFeatures[discoverIdx].title} — Activated</div><div style={{ fontSize:11, color:"#888", marginTop:2 }}>Tap arrows above to browse more suggestions</div></div>
            <button onClick={()=>{ setActivatedFeatures(p => { const n = new Set(p); n.delete(discoveryFeatures[discoverIdx].id); return n; }); }} style={{ background:SRF, border:`1px solid ${BDR}`, borderRadius:6, padding:"5px 10px", color:"#888", fontSize:10, fontWeight:600, cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif" }}>Undo</button>
          </div>
        )}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
          {discoveryFeatures.filter((_,i) => i !== discoverIdx).slice(0,4).map(f => { const active = activatedFeatures.has(f.id); return (
            <div key={f.id} onClick={() => setDiscoverIdx(discoveryFeatures.findIndex(d => d.id === f.id))} style={{ background:active?`${T}08`:SRF, border:`1px solid ${active?T+"20":BDR}`, borderRadius:10, padding:"10px 12px", cursor:"pointer", transition:"all 0.2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}><span style={{ fontFamily:"'Anybody',sans-serif", fontSize:12, color:active?T:f.color }}>{active?"✓":f.icon}</span><span style={{ fontSize:11, fontWeight:600, color:active?"#999":"#CCC" }}>{f.title}</span></div>
              <div style={{ fontSize:10, color:"#555" }}><span style={{ color:active?T:f.color, fontWeight:600 }}>{f.stat}</span> {f.statDetail.split(" ").slice(0,3).join(" ")}…</div>
            </div>
          ); })}
        </div>
        {activatedFeatures.size > 0 && (<div style={{ textAlign:"center", marginTop:10, fontSize:11, color:T }}>{activatedFeatures.size} feature{activatedFeatures.size>1?"s":""} activated this drive</div>)}
      </div>

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
  { id:"seg1", name:"Golden Gate → Pacifica", from:{x:22,y:6}, to:{x:18,y:18}, vibe:"exhilarating", pct:89, votes:342, miles:12.4, details:"Sweeping bridge exit into coastal curves. Sport mode territory — every driver loves this opening.", breakdown:[{v:"exhilarating",p:89},{v:"scenic",p:68},{v:"focused",p:42},{v:"peaceful",p:12},{v:"stressful",p:5}] },
  { id:"seg2", name:"Pacifica → Devil's Slide", from:{x:18,y:18}, to:{x:15,y:28}, vibe:"focused", pct:78, votes:298, miles:8.2, details:"Tight cliff-edge curves with ocean drops. Requires attention — tunnels ahead get the exhaust echoing.", breakdown:[{v:"focused",p:78},{v:"exhilarating",p:65},{v:"stressful",p:28},{v:"scenic",p:45},{v:"peaceful",p:8}] },
  { id:"seg3", name:"Half Moon Bay Stretch", from:{x:15,y:28}, to:{x:20,y:40}, vibe:"peaceful", pct:94, votes:445, miles:15.8, details:"Long coastal flats with farm views and ocean on the left. Roll down your windows, open the roof.", breakdown:[{v:"peaceful",p:94},{v:"scenic",p:82},{v:"boring",p:12},{v:"exhilarating",p:8},{v:"stressful",p:2}] },
  { id:"seg4", name:"Pescadero → Davenport", from:{x:20,y:40}, to:{x:28,y:52}, vibe:"scenic", pct:91, votes:387, miles:18.6, details:"Redwood groves transition to open cliffs. The most photographed stretch — pull over at Shark Fin Cove.", breakdown:[{v:"scenic",p:91},{v:"peaceful",p:76},{v:"exhilarating",p:34},{v:"focused",p:18},{v:"boring",p:3}] },
  { id:"seg5", name:"Davenport → Santa Cruz", from:{x:28,y:52}, to:{x:38,y:60}, vibe:"boring", pct:52, votes:234, miles:11.2, details:"Flat agricultural stretch connecting to the city. Highway vibes — put on a podcast and cruise.", breakdown:[{v:"boring",p:52},{v:"peaceful",p:34},{v:"stressful",p:18},{v:"focused",p:22},{v:"scenic",p:12}] },
  { id:"seg6", name:"Santa Cruz → Moss Landing", from:{x:38,y:60}, to:{x:52,y:66}, vibe:"peaceful", pct:72, votes:267, miles:22.4, details:"Coastal highway with wetland views. Sea otters in the harbor if you stop. Comfortable cruising.", breakdown:[{v:"peaceful",p:72},{v:"scenic",p:58},{v:"boring",p:28},{v:"focused",p:12},{v:"exhilarating",p:6}] },
  { id:"seg7", name:"Monterey Peninsula", from:{x:52,y:66}, to:{x:62,y:72}, vibe:"scenic", pct:86, votes:412, miles:14.8, details:"17-Mile Drive adjacent. Cypress trees, ocean, Pebble Beach. Drive slow — it's all about the views.", breakdown:[{v:"scenic",p:86},{v:"peaceful",p:78},{v:"exhilarating",p:22},{v:"focused",p:14},{v:"boring",p:4}] },
  { id:"seg8", name:"Big Sur — Bixby Bridge", from:{x:62,y:72}, to:{x:74,y:80}, vibe:"exhilarating", pct:96, votes:523, miles:24.6, details:"THE stretch. Bixby Bridge, cliff-hugging curves, 1000ft drops to the Pacific. Peak driving experience.", breakdown:[{v:"exhilarating",p:96},{v:"scenic",p:94},{v:"focused",p:72},{v:"peaceful",p:18},{v:"stressful",p:8}] },
  { id:"seg9", name:"Big Sur → Carmel", from:{x:74,y:80}, to:{x:82,y:90}, vibe:"peaceful", pct:82, votes:378, miles:16.2, details:"Winding descent into Carmel. The drive mellows out — golden light through the trees as you arrive.", breakdown:[{v:"peaceful",p:82},{v:"scenic",p:74},{v:"exhilarating",p:28},{v:"focused",p:16},{v:"boring",p:6}] },
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
        <div style={{ fontSize:12, color:"#666", marginTop:4 }}>How drivers <em>feel</em> on every stretch — {totalVotes.toLocaleString()} ratings across {totalMiles} mi</div>
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
      <div onClick={()=>setSelectedSeg(null)} style={{ position:"relative", width:"100%", height:400, borderRadius:16, overflow:"hidden", background:"linear-gradient(170deg, #0D1B2A 0%, #080E18 50%, #0B1420 100%)", border:`1px solid ${BDR}`, marginBottom:16 }}>
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

export default function Root() {
  const [app, setApp] = useState("recs");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anybody:wght@400;600;700;800&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%{transform:translate(-50%,-50%) scale(0.8);opacity:0.5} 100%{transform:translate(-50%,-50%) scale(1.5);opacity:0} }
        .fade-in { animation: fadeIn 0.35s ease both; }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:3px; }
        input::placeholder { color:#555; }
      `}</style>

      <div style={{ fontFamily:"'Instrument Sans',sans-serif", background:"#08080C", color:"#F0F0F0", minHeight:"100vh" }}>
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", backgroundImage:`radial-gradient(circle at 50% 0%, ${app==="trip"?A:app==="past"?P:app==="vibe"?"#E8C438":T}06 0%, transparent 50%)` }}/>

        <div style={{ position:"relative", maxWidth:520, margin:"0 auto", padding:"16px 16px 40px" }}>
          <div style={{ display:"flex", gap:3, marginBottom:20, padding:3, background:"rgba(255,255,255,0.02)", borderRadius:12, border:`1px solid ${BDR}` }}>
            {[
              { id:"trip", label:"Trip Mode", icon:"◉", color:A },
              { id:"recs", label:"Recommendations", icon:"✦", color:T },
              { id:"past", label:"Past Drives", icon:"◈", color:P },
              { id:"vibe", label:"Vibe Map", icon:"🍃", color:"#E8C438" },
            ].map(a => (
              <button key={a.id} onClick={()=>setApp(a.id)} style={{
                flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                padding:"11px 8px", borderRadius:9, border:"none",
                background:app===a.id?`${a.color}15`:"transparent",
                color:app===a.id?a.color:"#555",
                fontSize:11, fontWeight:700, cursor:"pointer",
                fontFamily:"'Anybody',sans-serif", letterSpacing:0.2, transition:"all 0.25s",
              }}>
                <span style={{ fontSize:10 }}>{a.icon}</span>{a.label}
              </button>
            ))}
          </div>

          <div key={app} className="fade-in">
            {app === "trip" ? <TripModeApp /> : app === "recs" ? <RecommendationsApp /> : app === "past" ? <PastDrivesApp /> : <VibeMapApp />}
          </div>
        </div>
      </div>
    </>
  );
}