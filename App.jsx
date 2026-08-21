// App.jsx
import React, { useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useParams,
} from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import "./App.css";

const sources = [
  {
    id: "SRC-001",
    sector: "Cement",
    process: "Kiln / Cooler",
    temperature: 250,
    capacity: 500,
    hours: "08:00–20:00",
    recovery: "Partial recovery",
    status: "SIMULATED",
    province: "Jawa Timur",
    lat: -7.75,
    lng: 112.65,
    locationLabel: "Approximate industrial cluster",
    type: "High-temperature",
    reference: "Demonstration dataset",
  },
  {
    id: "SRC-002",
    sector: "Sulfuric Acid",
    process: "Process Gas",
    temperature: 300,
    capacity: 620,
    hours: "07:00–19:00",
    recovery: "WHB documented",
    status: "LITERATURE",
    province: "Jawa Timur",
    lat: -7.16,
    lng: 112.65,
    locationLabel: "Approximate visualization only",
    type: "High-temperature",
    reference: "Petrokimia Gresik — DISTILAT",
  },
  {
    id: "SRC-003",
    sector: "Refinery",
    process: "Incinerator Off-Gas",
    temperature: 220,
    capacity: 420,
    hours: "00:00–24:00",
    recovery: "WHB documented",
    status: "LITERATURE",
    province: "Riau",
    lat: 1.68,
    lng: 101.45,
    locationLabel: "Approximate visualization only",
    type: "Medium-temperature",
    reference: "PT Pertamina RU II Dumai — UISI Repository",
  },
  {
    id: "SRC-004",
    sector: "Food Processing",
    process: "Boiler Exhaust",
    temperature: 165,
    capacity: 280,
    hours: "09:00–17:00",
    recovery: "Unknown",
    status: "SIMULATED",
    province: "Jawa Barat",
    lat: -6.91,
    lng: 107.61,
    locationLabel: "Approximate industrial cluster",
    type: "Medium-temperature",
    reference: "Demonstration dataset",
  },
];

const demands = [
  {
    id: "DEM-001",
    sector: "Food Processing",
    process: "Drying",
    temperature: 150,
    capacity: 300,
    hours: "10:00–18:00",
    fuel: "Natural gas",
    province: "Jawa Timur",
    lat: -7.77,
    lng: 112.67,
    status: "SIMULATED",
  },
  {
    id: "DEM-002",
    sector: "Textile",
    process: "Process Heating",
    temperature: 180,
    capacity: 240,
    hours: "08:00–18:00",
    fuel: "Natural gas",
    province: "Jawa Barat",
    lat: -6.92,
    lng: 107.64,
    status: "SIMULATED",
  },
  {
    id: "DEM-003",
    sector: "Chemical",
    process: "Preheating",
    temperature: 190,
    capacity: 350,
    hours: "08:00–20:00",
    fuel: "Fuel oil",
    province: "Riau",
    lat: 1.70,
    lng: 101.47,
    status: "SIMULATED",
  },
  {
    id: "DEM-004",
    sector: "Food Processing",
    process: "Hot Water",
    temperature: 90,
    capacity: 180,
    hours: "09:00–17:00",
    fuel: "Diesel",
    province: "Jawa Timur",
    lat: -7.74,
    lng: 112.69,
    status: "SIMULATED",
  },
];

const evidenceCases = [
  {
    case: "Indonesian cement industry",
    problem: "Waste heat and energy loss",
    evidence: "Peer-reviewed research",
    source: "ScienceDirect",
    url: "https://www.sciencedirect.com/science/article/pii/S1359431105000840",
    detail:
      "Waste heat from kiln and cooler exhaust and energy-conservation opportunities have been studied.",
  },
  {
    case: "PT Petrokimia Gresik",
    problem: "Waste heat recovery and energy losses",
    evidence: "Academic research",
    source: "DISTILAT / Polinema",
    url: "https://jurnal.polinema.ac.id/index.php/distilat/article/view/2181",
    detail:
      "Waste Heat Boiler performance and thermal-energy recovery in the sulfuric-acid unit have been evaluated.",
  },
  {
    case: "PT Petrokimia Gresik — Sulfuric Acid III B",
    problem: "Energy losses in process equipment",
    evidence: "Academic research",
    source: "DISTILAT / Polinema",
    url: "https://jurnal.polinema.ac.id/index.php/distilat/article/view/2249",
    detail:
      "An energy-balance study identified energy losses around the converter and heat exchanger.",
  },
  {
    case: "PT Pertamina RU II Dumai",
    problem: "Excess heat and WHB",
    evidence: "Academic repository report",
    source: "UISI Repository",
    url: "https://repository.uisi.ac.id/5683/",
    detail:
      "Waste Heat Boiler and excess heat associated with incinerator off-gas have been documented.",
  },
];

const defaultWeights = {
  temperature: 30,
  capacity: 20,
  temporal: 15,
  spatial: 15,
  recovery: 10,
  economic: 5,
  co2: 5,
};

const navItems = [
  ["Overview", "/dashboard", "▦"],
  ["Thermal Map", "/map", "⌖"],
  ["Heat Sources", "/sources", "♨"],
  ["Heat Demands", "/demands", "◉"],
  ["Matching Engine", "/matching", "↔"],
  ["Simulation", "/simulation", "◌"],
  ["Impact", "/impact", "↗"],
  ["Methodology", "/methodology", "⌬"],
  ["Data Provenance", "/data", "◫"],
];

function parseTime(value) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function overlapHours(a, b) {
  const [a1, a2] = a.split("–").map(parseTime);
  const [b1, b2] = b.split("–").map(parseTime);
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1)) / 60;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function temperatureScore(sourceT, demandT) {
  const approach = 20;
  if (sourceT < demandT) return 0;
  return Math.min(100, Math.max(0, 70 + ((sourceT - demandT - approach) / 100) * 30));
}

function capacityScore(sourceQ, demandQ) {
  return Math.min(100, (sourceQ / demandQ) * 100);
}

function temporalScore(sourceHours, demandHours) {
  const overlap = overlapHours(sourceHours, demandHours);
  const demandDuration = Math.max(1, overlapHours(demandHours, demandHours));
  return Math.min(100, (overlap / demandDuration) * 100);
}

function spatialScore(distance) {
  return Math.max(0, Math.min(100, 100 - (distance / 10) * 100));
}

function calculateMatch(source, demand, weights = defaultWeights) {
  const distance = haversine(
    source.lat,
    source.lng,
    demand.lat,
    demand.lng
  );
  const temp = temperatureScore(source.temperature, demand.temperature);
  const capacity = capacityScore(source.capacity, demand.capacity);
  const temporal = temporalScore(source.hours, demand.hours);
  const spatial = spatialScore(distance);
  const recovery = source.recovery.includes("documented")
    ? 85
    : source.recovery === "Partial recovery"
    ? 80
    : 65;
  const economic = Math.max(20, 100 - distance * 5);
  const co2 = Math.min(100, capacity * 0.65 + temp * 0.35);

  const totalWeight =
    Object.values(weights).reduce((a, b) => a + b, 0) || 1;

  const score =
    (temp * weights.temperature +
      capacity * weights.capacity +
      temporal * weights.temporal +
      spatial * weights.spatial +
      recovery * weights.recovery +
      economic * weights.economic +
      co2 * weights.co2) /
    totalWeight;

  const transfer = Math.min(source.capacity, demand.capacity);
  const overlap = overlapHours(source.hours, demand.hours);
  const annualHours = overlap * 300;
  const utilization = 0.8;
  const annualMWh = (transfer * annualHours * utilization) / 1000;

  return {
    source,
    demand,
    distance,
    temp,
    capacity,
    temporal,
    spatial,
    recovery,
    economic,
    co2,
    score,
    transfer,
    overlap,
    annualMWh,
  };
}

function generateMatches(weights = defaultWeights) {
  return sources
    .flatMap((source) =>
      demands.map((demand) => calculateMatch(source, demand, weights))
    )
    .filter((m) => m.temp > 0 && m.temporal > 0)
    .sort((a, b) => b.score - a.score);
}

function Badge({ children, type = "" }) {
  return <span className={`badge ${type.toLowerCase()}`}>{children}</span>;
}

function DataNotice({ children = "SIMULATED DEMONSTRATION DATA — NOT FIELD MEASUREMENT" }) {
  return <div className="data-notice">ⓘ {children}</div>;
}

function Layout({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/" className="brand">
          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>HEATLINK</strong>
            <small>THERMAL SYMBIOSIS</small>
          </div>
        </Link>

        <div className="sidebar-section">
          <span className="sidebar-label">RESEARCH PLATFORM</span>
          <nav>
            {navItems.map(([label, path, icon]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <i>{icon}</i>
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="prototype-status">
            <span className="status-dot" />
            Research Prototype
          </div>
          <small>Version 1.0 · Academic Demo</small>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">INDUSTRIAL ENERGY INTELLIGENCE</span>
            <h1>Spatial-Temporal Thermal Opportunity</h1>
          </div>
          <div className="topbar-right">
            <div className="demo-pill">
              <span /> DEMONSTRATION ENVIRONMENT
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="pulse" /> INDUSTRIAL THERMAL ENERGY SYMBIOSIS
          </div>
          <h2>
            Turn residual industrial heat
            <em> into a shared energy resource.</em>
          </h2>
          <p className="hero-subtitle">
            An explainable spatial-temporal decision-support system for
            identifying feasible cross-industrial thermal energy opportunities.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/map">
              Explore Thermal Map <span>→</span>
            </Link>
            <Link className="btn secondary" to="/simulation">
              Run Matching Simulation <span>↗</span>
            </Link>
          </div>
          <div className="hero-disclaimer">
            <span>◆</span>
            Research prototype — potential matches require engineering
            validation.
          </div>
        </div>

        <div className="hero-network">
          <div className="network-grid" />
          <div className="island indonesia-silhouette">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className={`map-node n${i + 1}`}
              >
                <i />
              </span>
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={`d${i}`}
                className={`demand-node d${i + 1}`}
              />
            ))}
            <svg className="connection-lines" viewBox="0 0 600 430">
              <line x1="115" y1="250" x2="280" y2="235" />
              <line x1="280" y1="235" x2="390" y2="275" />
              <line x1="390" y1="275" x2="480" y2="190" />
              <line x1="180" y1="315" x2="390" y2="275" />
              <line x1="330" y1="165" x2="480" y2="190" />
            </svg>
          </div>
          <div className="network-legend">
            <span><i className="thermal-dot" /> Thermal source</span>
            <span><i className="demand-dot" /> Thermal demand</span>
            <span><i className="match-dot" /> Potential match</span>
          </div>
        </div>
      </section>

      <section className="concept-strip">
        <div>
          <small>SOURCE</small>
          <strong>Residual Heat</strong>
        </div>
        <span>+</span>
        <div>
          <small>DEMAND</small>
          <strong>Thermal Need</strong>
        </div>
        <span>+</span>
        <div>
          <small>ANALYSIS</small>
          <strong>Thermodynamics</strong>
        </div>
        <span>+</span>
        <div>
          <small>CONTEXT</small>
          <strong>Time & Space</strong>
        </div>
        <b>→</b>
        <div className="concept-result">
          <small>OUTPUT</small>
          <strong>Explainable Thermal Match</strong>
        </div>
      </section>

      <section className="landing-info">
        <div>
          <span className="eyebrow">THE HEATLINK CONCEPT</span>
          <h3>From isolated energy losses to connected thermal opportunities.</h3>
        </div>
        <p>
          HEATLINK maps where residual industrial heat exists, identifies where
          thermal demand exists, and calculates which cross-industrial
          connections are technically and economically worth investigating.
        </p>
      </section>
    </div>
  );
}

function PageTitle({ kicker, title, description, action }) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

function KpiCard({ label, value, suffix, icon }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <span>{label}</span>
        <i>{icon}</i>
      </div>
      <strong>{value}</strong>
      {suffix && <small>{suffix}</small>}
    </div>
  );
}

function Dashboard() {
  const chartData = [
    { month: "JAN", heat: 74, demand: 61 },
    { month: "FEB", heat: 82, demand: 67 },
    { month: "MAR", heat: 79, demand: 72 },
    { month: "APR", heat: 91, demand: 78 },
    { month: "MAY", heat: 88, demand: 75 },
    { month: "JUN", heat: 98, demand: 84 },
    { month: "JUL", heat: 103, demand: 91 },
  ];

  return (
    <>
      <PageTitle
        kicker="OVERVIEW / NATIONAL THERMAL OPPORTUNITY"
        title="Thermal Opportunity Dashboard"
        description="A demonstration view of the spatial-temporal industrial thermal ecosystem."
        action={<Link to="/matching" className="btn primary">Open Matching Engine →</Link>}
      />
      <DataNotice />

      <div className="kpi-grid">
        <KpiCard label="Thermal Sources" value="24" suffix="records" icon="♨" />
        <KpiCard label="Thermal Demands" value="31" suffix="profiles" icon="◉" />
        <KpiCard label="Potential Matches" value="17" suffix="candidates" icon="↔" />
        <KpiCard label="Recoverable Thermal Potential" value="128.4" suffix="MWth" icon="△" />
        <KpiCard label="Potential CO₂ Avoidance" value="42.7" suffix="ktCO₂e / year" icon="CO₂" />
        <KpiCard label="Estimated Energy Displacement" value="18.6" suffix="GWhth / year" icon="↗" />
      </div>

      <div className="section-grid two">
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">THERMAL LANDSCAPE</span>
              <h3>Available Heat vs Thermal Demand</h3>
            </div>
            <Badge type="simulated">SIMULATED</Badge>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="heat" stroke="#ef6c32" fill="#ef6c3220" />
              <Area type="monotone" dataKey="demand" stroke="#4285b8" fill="#4285b820" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="panel opportunity-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">OPPORTUNITY DISTRIBUTION</span>
              <h3>Screening Summary</h3>
            </div>
          </div>
          <div className="opportunity-list">
            {[
              ["High-temperature", 41, "source"],
              ["Medium-temperature", 35, "source"],
              ["Low-temperature", 24, "source"],
              ["Steam demand", 48, "demand"],
              ["Drying demand", 26, "demand"],
              ["Process heating", 26, "demand"],
            ].map(([label, value, type]) => (
              <div className="opp-row" key={label}>
                <div><span className={type} /> {label}</div>
                <strong>{value}%</strong>
                <div className="progress"><i style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="research-note">
        <div className="research-note-icon">!</div>
        <div>
          <strong>Interpretation boundary</strong>
          <p>
            Dashboard values are intentionally synthetic. They demonstrate how
            HEATLINK could aggregate source-demand opportunities and must not be
            interpreted as national industrial measurements.
          </p>
        </div>
        <Link to="/data">View provenance →</Link>
      </section>
    </>
  );
}

function MapPage() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const visibleSources = sources.filter(
    (s) => filter === "all" || s.sector === filter || s.type === filter
  );

  return (
    <>
      <PageTitle
        kicker="GEOSPATIAL INTELLIGENCE"
        title="Industrial Thermal Map"
        description="Explore potential thermal source and demand locations. Locations are approximate where public coordinates are unavailable."
      />

      <div className="map-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All sectors</option>
          <option>Cement</option>
          <option>Sulfuric Acid</option>
          <option>Refinery</option>
          <option>Food Processing</option>
          <option>High-temperature</option>
          <option>Medium-temperature</option>
        </select>
        <select>
          <option>All provinces</option>
          <option>Jawa Timur</option>
          <option>Jawa Barat</option>
          <option>Riau</option>
        </select>
        <select>
          <option>All temperature ranges</option>
          <option>&gt; 250°C</option>
          <option>150–250°C</option>
          <option>&lt; 150°C</option>
        </select>
        <select>
          <option>All operating hours</option>
          <option>24 hours</option>
          <option>12+ hours</option>
          <option>8+ hours</option>
        </select>
      </div>

      <div className="map-layout">
        <div className="gis-map">
          <div className="map-background">
            <div className="map-water-grid" />
            <div className="indonesia-map-shape">
              <span className="island island-sumatra" />
              <span className="island island-java" />
              <span className="island island-borneo" />
              <span className="island island-sulawesi" />
              <span className="island island-papua" />
              <span className="island island-bali" />
            </div>

            <svg className="map-routes" viewBox="0 0 900 560">
              <path d="M210 310 C310 290, 420 360, 510 330" />
              <path d="M510 330 C600 285, 670 310, 745 350" />
              <path d="M430 220 C500 270, 570 280, 650 235" />
            </svg>

            {visibleSources.map((s, i) => (
              <button
                key={s.id}
                className={`map-marker source-marker m${i + 1}`}
                onClick={() => setSelected({ ...s, kind: "source" })}
                title={s.id}
              >
                <span className="flame-icon">🔥</span>
              </button>
            ))}

            {demands.map((d, i) => (
              <button
                key={d.id}
                className={`map-marker demand-marker dm${i + 1}`}
                onClick={() => setSelected({ ...d, kind: "demand" })}
                title={d.id}
              >
                <span />
              </button>
            ))}
          </div>

          <div className="map-controls">
            <button>+</button>
            <button>−</button>
          </div>

          <div className="map-label">
            <span>INDONESIA</span>
            <small>Research visualization layer</small>
          </div>

          <div className="map-legend">
            <strong>THERMAL LAYERS</strong>
            <span><i className="legend-high" /> High-temperature source</span>
            <span><i className="legend-medium" /> Medium-temperature source</span>
            <span><i className="legend-demand" /> Thermal demand</span>
            <span><i className="legend-line" /> Potential connection</span>
          </div>
        </div>

        <aside className={`map-detail ${selected ? "open" : ""}`}>
          {!selected ? (
            <div className="empty-detail">
              <div>⌖</div>
              <h3>Select a thermal node</h3>
              <p>
                Click a source or demand marker to inspect its available
                metadata and provenance.
              </p>
            </div>
          ) : (
            <>
              <div className="detail-head">
                <div>
                  <span className="eyebrow">
                    {selected.kind === "source" ? "THERMAL SOURCE" : "THERMAL DEMAND"}
                  </span>
                  <h3>{selected.id}</h3>
                </div>
                <button onClick={() => setSelected(null)}>×</button>
              </div>

              <Badge type={selected.status}>{selected.status}</Badge>

              <div className="detail-fields">
                <div><span>Sector</span><strong>{selected.sector}</strong></div>
                <div><span>Process</span><strong>{selected.process}</strong></div>
                <div><span>Temperature</span><strong>{selected.temperature}°C</strong></div>
                <div><span>Thermal power</span><strong>{selected.capacity} kWth</strong></div>
                <div><span>Operating schedule</span><strong>{selected.hours}</strong></div>
                <div><span>Location</span><strong>{selected.locationLabel || "Approximate / visualization only"}</strong></div>
              </div>

              <div className="provenance-mini">
                <span>DATA PROVENANCE</span>
                <strong>{selected.reference || "Demonstration demand profile"}</strong>
                <small>
                  Exact industrial measurements and commercial availability
                  are not implied.
                </small>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

function SourcesPage() {
  const [status, setStatus] = useState("ALL");
  const filtered = sources.filter((s) => status === "ALL" || s.status === status);

  return (
    <>
      <PageTitle
        kicker="SOURCE DATABASE"
        title="Thermal Sources"
        description="Industrial residual-heat source records with explicit data provenance."
        action={<Link className="btn secondary" to="/data">Data Provenance →</Link>}
      />
      <DataNotice />

      <div className="table-filter">
        <button className={status === "ALL" ? "selected" : ""} onClick={() => setStatus("ALL")}>ALL</button>
        <button className={status === "VERIFIED" ? "selected" : ""} onClick={() => setStatus("VERIFIED")}>VERIFIED</button>
        <button className={status === "LITERATURE" ? "selected" : ""} onClick={() => setStatus("LITERATURE")}>LITERATURE</button>
        <button className={status === "SIMULATED" ? "selected" : ""} onClick={() => setStatus("SIMULATED")}>SIMULATED</button>
        <button className={status === "USER INPUT" ? "selected" : ""} onClick={() => setStatus("USER INPUT")}>USER INPUT</button>
      </div>

      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Source ID</th>
              <th>Industry</th>
              <th>Process</th>
              <th>Temperature</th>
              <th>Capacity</th>
              <th>Operating</th>
              <th>Recovery</th>
              <th>Data status</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.id}</strong></td>
                <td>{s.sector}</td>
                <td>{s.process}</td>
                <td>{s.status === "LITERATURE" ? "Literature-derived" : `${s.temperature}°C`}</td>
                <td>{s.status === "LITERATURE" ? "Literature-derived" : `${s.capacity} kWth`}</td>
                <td>{s.hours}</td>
                <td>{s.recovery}</td>
                <td><Badge type={s.status}>{s.status}</Badge></td>
                <td>{s.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function DemandsPage() {
  return (
    <>
      <PageTitle
        kicker="DEMAND DATABASE"
        title="Thermal Demands"
        description="Demonstration demand profiles representing industrial processes that may require thermal energy."
      />
      <DataNotice />

      <div className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>Demand ID</th>
              <th>Industry</th>
              <th>Process</th>
              <th>Required temperature</th>
              <th>Thermal power</th>
              <th>Operating hours</th>
              <th>Current energy carrier</th>
              <th>Location</th>
              <th>Data status</th>
            </tr>
          </thead>
          <tbody>
            {demands.map((d) => (
              <tr key={d.id}>
                <td><strong>{d.id}</strong></td>
                <td>{d.sector}</td>
                <td>{d.process}</td>
                <td>{d.temperature}°C</td>
                <td>{d.capacity} kWth</td>
                <td>{d.hours}</td>
                <td>{d.fuel}</td>
                <td>{d.province} · Approx.</td>
                <td><Badge type={d.status}>{d.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MatchingPage() {
  const [weights, setWeights] = useState(defaultWeights);
  const matches = useMemo(() => generateMatches(weights), [weights]);

  const updateWeight = (key, value) => {
    setWeights((w) => ({ ...w, [key]: Number(value) }));
  };

  return (
    <>
      <PageTitle
        kicker="CORE ANALYTICS"
        title="Matching Engine"
        description="Rank potential source-demand connections using transparent, adjustable screening criteria."
        action={<Link className="btn primary" to="/simulation">Run Scenario →</Link>}
      />

      <div className="prototype-warning">
        <strong>Prototype weighting scheme — subject to expert validation.</strong>
        <span>
          Weights are configurable and are not presented as scientifically
          established universal constants.
        </span>
      </div>

      <div className="matching-layout">
        <div className="panel weighting-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">MATCHING LOGIC</span>
              <h3>Adjust scoring weights</h3>
            </div>
            <span className="weight-total">
              {Object.values(weights).reduce((a, b) => a + b, 0)}%
            </span>
          </div>

          {[
            ["temperature", "Temperature Compatibility"],
            ["capacity", "Capacity Compatibility"],
            ["temporal", "Temporal Compatibility"],
            ["spatial", "Spatial Compatibility"],
            ["recovery", "Recovery Potential"],
            ["economic", "Economic Potential"],
            ["co2", "CO₂ Reduction Potential"],
          ].map(([key, label]) => (
            <div className="weight-row" key={key}>
              <div>
                <span>{label}</span>
                <strong>{weights[key]}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={weights[key]}
                onChange={(e) => updateWeight(key, e.target.value)}
              />
            </div>
          ))}

          <button
            className="reset-btn"
            onClick={() => setWeights(defaultWeights)}
          >
            Reset prototype weights
          </button>
        </div>

        <div className="panel ranking-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">RANKED OUTPUT</span>
              <h3>Potential Thermal Matches</h3>
            </div>
            <Badge type="simulated">DEMO DATA</Badge>
          </div>

          <div className="match-list">
            {matches.slice(0, 7).map((m, index) => (
              <Link
                to={`/match/${m.source.id}-${m.demand.id}`}
                state={{ match: m }}
                className="match-row"
                key={`${m.source.id}-${m.demand.id}`}
              >
                <div className="rank">{String(index + 1).padStart(2, "0")}</div>
                <div className="match-route">
                  <strong>{m.source.id}</strong>
                  <span>→</span>
                  <strong>{m.demand.id}</strong>
                  <small>{m.source.process} → {m.demand.process}</small>
                </div>
                <div className="match-distance">{m.distance.toFixed(1)} km</div>
                <div className="score">
                  <strong>{Math.round(m.score)}%</strong>
                  <span>match score</span>
                </div>
                <div className="arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function MatchDetail() {
  const { id } = useParams();
  const [weights] = useState(defaultWeights);

  const found = generateMatches(weights).find(
    (m) => `${m.source.id}-${m.demand.id}` === id
  );

  if (!found) {
    return (
      <div className="empty-state">
        <h2>Match not found</h2>
        <Link to="/matching" className="btn primary">Back to Matching Engine</Link>
      </div>
    );
  }

  const metrics = [
    ["Temperature", found.temp],
    ["Capacity", found.capacity],
    ["Temporal", found.temporal],
    ["Spatial", found.spatial],
    ["Recovery", found.recovery],
    ["Economic", found.economic],
    ["CO₂", found.co2],
  ];

  return (
    <>
      <PageTitle
        kicker="MATCH ANALYSIS"
        title={`MATCH ${found.source.id} × ${found.demand.id}`}
        description="Explainable screening analysis for a potential cross-industrial thermal connection."
        action={<Link className="btn secondary" to="/matching">← Back to matches</Link>}
      />

      <div className="match-hero">
        <div className="match-party source">
          <span>THERMAL SOURCE</span>
          <strong>{found.source.id}</strong>
          <p>{found.source.sector} · {found.source.process}</p>
          <b>{found.source.temperature}°C · {found.source.capacity} kWth</b>
        </div>
        <div className="match-score-large">
          <small>MATCH SCORE</small>
          <strong>{Math.round(found.score)}<i>%</i></strong>
          <span>Screening candidate</span>
        </div>
        <div className="match-party demand">
          <span>THERMAL DEMAND</span>
          <strong>{found.demand.id}</strong>
          <p>{found.demand.sector} · {found.demand.process}</p>
          <b>{found.demand.temperature}°C · {found.demand.capacity} kWth</b>
        </div>
      </div>

      <div className="section-grid two">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SCORE BREAKDOWN</span>
              <h3>Why this match?</h3>
            </div>
          </div>
          <div className="metric-bars">
            {metrics.map(([label, value]) => (
              <div className="metric-bar" key={label}>
                <div>
                  <span>{label}</span>
                  <strong>{Math.round(value)}%</strong>
                </div>
                <div className="bar-track">
                  <i style={{ width: `${Math.min(100, value)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel why-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">EXPLAINABLE ANALYSIS</span>
              <h3>WHY THIS MATCH?</h3>
            </div>
          </div>
          <ul className="why-list">
            <li><b>✓</b> Source temperature exceeds demand requirement with a screening temperature approach.</li>
            <li><b>✓</b> Transferable heat is limited to the lower of source availability and demand requirement.</li>
            <li><b>✓</b> Operating schedules overlap by {found.overlap.toFixed(1)} hours/day.</li>
            <li><b>✓</b> Approximate spatial distance is {found.distance.toFixed(1)} km.</li>
            <li><b>⚠</b> Infrastructure, heat-exchanger design and pipeline feasibility require engineering assessment.</li>
          </ul>
        </div>
      </div>

      <div className="result-cards">
        <div><span>Potential transferable heat</span><strong>{found.transfer} kWth</strong></div>
        <div><span>Annual thermal displacement</span><strong>{found.annualMWh.toFixed(0)} MWhth/year</strong></div>
        <div><span>Spatial screening</span><strong>{found.distance.toFixed(1)} km</strong></div>
        <div><span>Status</span><strong>Potentially feasible</strong></div>
      </div>

      <div className="validation-banner">
        <div>!</div>
        <div>
          <strong>Potentially feasible — requires engineering validation</strong>
          <p>
            HEATLINK identifies a screening candidate. It does not establish
            physical feasibility, company willingness, commercial agreement,
            or guaranteed energy savings.
          </p>
        </div>
      </div>
    </>
  );
}

function Simulation() {
  const [values, setValues] = useState({
    sourceT: 250,
    sourceQ: 500,
    demandT: 150,
    demandQ: 300,
    distance: 2.4,
    overlap: 8,
    utilization: 0.8,
    fuel: "Natural gas",
  });

  const simulation = useMemo(() => {
    const temp = temperatureScore(values.sourceT, values.demandT);
    const capacity = capacityScore(values.sourceQ, values.demandQ);
    const temporal = Math.min(100, (values.overlap / 8) * 100);
    const spatial = spatialScore(values.distance);
    const recovery = 82;
    const economic = Math.max(20, 100 - values.distance * 5);
    const co2 = Math.min(100, capacity * 0.65 + temp * 0.35);
    const score =
      temp * 0.3 +
      capacity * 0.2 +
      temporal * 0.15 +
      spatial * 0.15 +
      recovery * 0.1 +
      economic * 0.05 +
      co2 * 0.05;

    const transfer = Math.min(values.sourceQ, values.demandQ);
    const annualMWh =
      (transfer * values.overlap * 300 * values.utilization) / 1000;

    const factors = {
      "Natural gas": 0.202,
      Diesel: 0.267,
      Coal: 0.341,
      "Fuel oil": 0.319,
      "Grid electricity": 0.45,
    };

    const emissionFactor = factors[values.fuel];
    const co2t = annualMWh * emissionFactor;

    return {
      score,
      temp,
      capacity,
      temporal,
      spatial,
      transfer,
      annualMWh,
      co2t,
      emissionFactor,
    };
  }, [values]);

  const setValue = (key, value) =>
    setValues((v) => ({ ...v, [key]: Number(value) }));

  const flowData = [
    { name: "Useful heat", value: values.sourceQ * 0.55 },
    { name: "Recoverable", value: simulation.transfer },
    { name: "Displaced demand", value: simulation.transfer * values.utilization },
    { name: "Residual", value: values.sourceQ * 0.15 },
  ];

  return (
    <>
      <PageTitle
        kicker="SCENARIO LABORATORY"
        title="Thermal Matching Simulation"
        description="Change the scenario inputs and observe how the screening result responds."
      />

      <div className="simulation-warning">
        <span>SIMULATION — NOT FIELD MEASUREMENT</span>
        <small>Prototype equations for demonstration only.</small>
      </div>

      <div className="simulation-grid">
        <div className="panel controls-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">SCENARIO INPUTS</span>
              <h3>Thermal conditions</h3>
            </div>
          </div>

          {[
            ["sourceT", "Source temperature", 50, 500, "°C"],
            ["sourceQ", "Source thermal power", 50, 1000, "kWth"],
            ["demandT", "Demand temperature", 50, 400, "°C"],
            ["demandQ", "Demand thermal power", 50, 1000, "kWth"],
            ["distance", "Distance", 0.5, 20, "km"],
            ["overlap", "Operating overlap", 0, 24, "hours/day"],
            ["utilization", "Utilization factor", 0.2, 1, ""],
          ].map(([key, label, min, max, unit]) => (
            <div className="sim-control" key={key}>
              <div>
                <span>{label}</span>
                <strong>
                  {key === "utilization"
                    ? `${Math.round(values[key] * 100)}%`
                    : `${values[key]} ${unit}`}
                </strong>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                step={key === "distance" ? 0.1 : key === "utilization" ? 0.05 : 1}
                value={values[key]}
                onChange={(e) => setValue(key, e.target.value)}
              />
            </div>
          ))}

          <div className="sim-select">
            <span>Displaced fuel</span>
            <select
              value={values.fuel}
              onChange={(e) =>
                setValues((v) => ({ ...v, fuel: e.target.value }))
              }
            >
              <option>Natural gas</option>
              <option>Diesel</option>
              <option>Coal</option>
              <option>Fuel oil</option>
              <option>Grid electricity</option>
            </select>
          </div>
        </div>

        <div className="simulation-results">
          <div className="sim-result-head">
            <div>
              <span className="eyebrow">LIVE OUTPUT</span>
              <h3>Screening Result</h3>
            </div>
            <div className="score-ring">
              <strong>{Math.round(simulation.score)}%</strong>
              <span>match</span>
            </div>
          </div>

          <div className="sim-kpis">
            <div><span>Transferable heat</span><strong>{simulation.transfer} kWth</strong></div>
            <div><span>Annual energy displacement</span><strong>{simulation.annualMWh.toFixed(0)} MWhth</strong></div>
            <div><span>Estimated CO₂ avoidance</span><strong>{simulation.co2t.toFixed(1)} tCO₂e</strong></div>
          </div>

          <div className="panel inner-chart">
            <span className="eyebrow">THERMAL ENERGY FLOW</span>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={flowData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={110} />
                <Tooltip />
                <Bar dataKey="value" fill="#ef6c32" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="sim-comparison">
            <div>
              <span>BEFORE</span>
              <strong>{values.demandQ} kWth</strong>
              <small>Additional thermal demand</small>
            </div>
            <div className="comparison-arrow">→</div>
            <div>
              <span>AFTER HEATLINK</span>
              <strong>{Math.max(0, values.demandQ - simulation.transfer)} kWth</strong>
              <small>Screening-level displaced demand</small>
            </div>
          </div>

          <div className="factor-note">
            Emission factor used: <strong>{simulation.emissionFactor} kgCO₂e/kWh</strong>.
            This is a prototype value and should be replaced with an appropriate
            official or project-specific factor before real analysis.
          </div>
        </div>
      </div>
    </>
  );
}

function Impact() {
  const data = [
    { name: "Energy displacement", value: 18.6 },
    { name: "Potential avoided emissions", value: 42.7 },
    { name: "Thermal recovery", value: 128.4 },
  ];

  return (
    <>
      <PageTitle
        kicker="IMPACT SCREENING"
        title="Environmental & Economic Impact"
        description="Screening-level indicators derived from the demonstration matching dataset."
      />
      <DataNotice />

      <div className="impact-hero">
        <div>
          <span>ESTIMATED CO₂ AVOIDANCE</span>
          <strong>42.7 <i>ktCO₂e/year</i></strong>
          <small>Demonstration calculation · not actual reduction</small>
        </div>
        <div>
          <span>ENERGY DISPLACEMENT</span>
          <strong>18.6 <i>GWhth/year</i></strong>
          <small>Demonstration calculation</small>
        </div>
        <div>
          <span>RECOVERABLE THERMAL POTENTIAL</span>
          <strong>128.4 <i>MWth</i></strong>
          <small>Demonstration aggregation</small>
        </div>
      </div>

      <div className="section-grid two">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">IMPACT PROFILE</span>
              <h3>Potential displacement indicators</h3>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ef6c32" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel economics">
          <span className="eyebrow">ECONOMIC SCREENING</span>
          <h3>Potential annual saving</h3>
          <strong>Screening-level estimate</strong>
          <div className="economic-number">DATA NOT PUBLICLY AVAILABLE</div>
          <p>
            Actual financial feasibility requires site-specific CAPEX, OPEX,
            fuel prices, heat-exchanger design, transport distance, pressure
            requirements, maintenance, and commercial arrangements.
          </p>
          <Badge type="simulated">NOT A FINANCIAL FEASIBILITY STUDY</Badge>
        </div>
      </div>

      <div className="equation-panel">
        <span className="eyebrow">ENVIRONMENTAL METHOD</span>
        <h3>CO₂ avoided = displaced fuel energy × emission factor</h3>
        <p>
          Every emission factor should retain its source, year, unit, and
          applicability. Users must be able to replace prototype factors with
          official Indonesian values.
        </p>
      </div>
    </>
  );
}

function Methodology() {
  const steps = [
    ["01", "Data collection", "Gather public evidence, literature and user-provided industrial data."],
    ["02", "Thermal characterization", "Classify temperature, capacity, operating profile and recovery status."],
    ["03", "Source / demand database", "Separate thermal supply from process-level thermal demand."],
    ["04", "Spatial-temporal filter", "Evaluate approximate distance and operating-time overlap."],
    ["05", "Thermodynamic matching", "Test temperature approach and capacity compatibility."],
    ["06", "Economic screening", "Estimate energy displacement and infrastructure burden."],
    ["07", "Environmental impact", "Estimate displaced emissions using traceable emission factors."],
    ["08", "Ranking", "Produce a transparent weighted match score."],
    ["09", "Engineering validation", "Validate heat transfer, piping, equipment and stakeholder feasibility."],
  ];

  return (
    <>
      <PageTitle
        kicker="SCIENTIFIC FRAMEWORK"
        title="Methodology"
        description="HEATLINK uses an explainable screening workflow rather than a black-box prediction model."
      />

      <div className="method-flow">
        {[
          "DATA",
          "THERMAL CHARACTERIZATION",
          "SOURCE / DEMAND DATABASE",
          "SPATIAL-TEMPORAL FILTER",
          "THERMODYNAMIC MATCHING",
          "ECONOMIC SCREENING",
          "ENVIRONMENTAL IMPACT",
          "RANKED MATCHES",
          "ENGINEERING VALIDATION",
        ].map((step, i) => (
          <React.Fragment key={step}>
            <div className="flow-step">{step}</div>
            {i < 8 && <span>↓</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="method-grid">
        {steps.map(([num, title, desc]) => (
          <div className="method-card" key={num}>
            <span>{num}</span>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>

      <div className="equations">
        <div>
          <span className="eyebrow">TRANSFERABLE HEAT</span>
          <code>Q_transfer = MIN(Q_source_available, Q_demand_required)</code>
        </div>
        <div>
          <span className="eyebrow">ANNUAL THERMAL ENERGY</span>
          <code>E = Q_transfer × H_overlap × U</code>
        </div>
        <div>
          <span className="eyebrow">SPATIAL DISTANCE</span>
          <code>d = 2R × arcsin(√(...))</code>
        </div>
      </div>

      <section className="limitations">
        <div className="limitations-icon">!</div>
        <div>
          <span className="eyebrow">RESEARCH LIMITATIONS</span>
          <h2>HEATLINK IS NOT A REPLACEMENT FOR ENGINEERING DESIGN.</h2>
          <div className="limit-grid">
            <span>• No automatic physical connection</span>
            <span>• No guaranteed heat transfer</span>
            <span>• No assumption of company cooperation</span>
            <span>• Public data may be incomplete</span>
            <span>• Exact process parameters require field validation</span>
            <span>• Pipeline / heat exchanger design requires engineering study</span>
            <span>• Economic results are screening estimates</span>
            <span>• Environmental results depend on emission factors</span>
          </div>
        </div>
      </section>
    </>
  );
}

function DataPage() {
  return (
    <>
      <PageTitle
        kicker="TRACEABILITY LAYER"
        title="Data Provenance & Verification"
        description="Every input in HEATLINK must retain its origin and evidence status."
      />

      <div className="provenance-grid">
        {[
          ["VERIFIED DATA", "Directly supported by an identifiable verified/public source or user-provided verified measurement.", "high"],
          ["LITERATURE-DERIVED DATA", "Derived from peer-reviewed research or academic documentation.", "medium"],
          ["DEMONSTRATION / SIMULATED DATA", "Synthetic values used solely to demonstrate system functionality.", "low"],
          ["USER-INPUT DATA", "Data entered by an authorized project user; verification may remain pending.", "medium"],
        ].map(([title, text, level]) => (
          <div className="provenance-card" key={title}>
            <Badge type={title.split(" ")[0]}>{title}</Badge>
            <p>{text}</p>
            <div className="confidence">
              Confidence <strong>{level.toUpperCase()}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="panel provenance-table">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">INDONESIAN EVIDENCE LIBRARY</span>
            <h3>Publicly accessible industrial cases</h3>
          </div>
        </div>
        <div className="evidence-list">
          {evidenceCases.map((item) => (
            <div className="evidence-item" key={item.case}>
              <div className="evidence-index">CASE</div>
              <div className="evidence-content">
                <h3>{item.case}</h3>
                <p><strong>Problem:</strong> {item.problem}</p>
                <p><strong>Evidence:</strong> {item.evidence}</p>
                <p>{item.detail}</p>
                <a href={item.url} target="_blank" rel="noreferrer">
                  View source · {item.source} ↗
                </a>
              </div>
              <Badge type="literature">LITERATURE</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="critical-data-rule">
        <strong>CRITICAL DATA RULE</strong>
        <p>
          HEATLINK never fabricates company measurements, exact process
          parameters, exact coordinates, operating schedules, contracts,
          financial savings or actual CO₂ reductions. When information is
          unavailable, the interface must show: <b>DATA NOT PUBLICLY AVAILABLE</b>.
        </p>
      </div>

      <div className="evidence-boundary">
        <span>IMPORTANT</span>
        <p>
          These cases demonstrate the existence of industrial thermal-energy
          generation, recovery or loss opportunities. They do not constitute
          confirmed HEATLINK source-demand partnerships.
        </p>
      </div>
    </>
  );
}

function About() {
  return (
    <>
      <PageTitle
        kicker="RESEARCH PROJECT"
        title="About HEATLINK"
        description="An academic prototype for investigating cross-industrial thermal energy symbiosis in Indonesia."
      />
      <div className="about-hero">
        <div className="about-mark">HL</div>
        <div>
          <span className="eyebrow">HEATLINK</span>
          <h2>Spatial-Temporal Industrial Waste Heat Matching & Energy Symbiosis Platform</h2>
          <p>
            HEATLINK is designed as an explainable decision-support system that
            maps residual industrial heat, maps thermal demand, and evaluates
            potential connections using thermodynamic, temporal, spatial,
            economic and environmental criteria.
          </p>
        </div>
      </div>

      <div className="about-grid">
        <div>
          <span className="eyebrow">POSITIONING</span>
          <h3>Not a website that simply finds waste heat.</h3>
          <p>
            The core innovation is the integration of source, demand,
            thermodynamics, time, space, economics and environment into one
            transparent thermal matching workflow.
          </p>
        </div>
        <div>
          <span className="eyebrow">TARGET USERS</span>
          <ul>
            <li>Industrial energy managers</li>
            <li>Industrial estate managers</li>
            <li>Energy consultants</li>
            <li>Government / regional energy planners</li>
            <li>Researchers</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/sources" element={<SourcesPage />} />
                <Route path="/demands" element={<DemandsPage />} />
                <Route path="/matching" element={<MatchingPage />} />
                <Route path="/match/:id" element={<MatchDetail />} />
                <Route path="/simulation" element={<Simulation />} />
                <Route path="/impact" element={<Impact />} />
                <Route path="/methodology" element={<Methodology />} />
                <Route path="/data" element={<DataPage />} />
                <Route path="/about" element={<About />} />
                <Route
                  path="*"
                  element={
                    <div className="empty-state">
                      <h2>Page not found</h2>
                      <Link to="/dashboard" className="btn primary">Go to Dashboard</Link>
                    </div>
                  }
                />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

