const ORDERS = [
  { id: "ORD-4821", restaurant: "Spice Garden", customer: "Rahul Sharma", address: "Block 7, Sector 14, Gurugram", distance: "3.2 km", earn: "₹85", eta: "18 min", priority: "normal", items: 2 },
  { id: "ORD-4822", restaurant: "The Pizza Stop", customer: "Priya Mehta", address: "House 22, DLF Phase 2", distance: "1.8 km", earn: "₹65", eta: "12 min", priority: "high", items: 1 },
  { id: "ORD-4823", restaurant: "Biryani Hub", customer: "Amit Gupta", address: "Tower C, Cyber City", distance: "4.5 km", earn: "₹110", eta: "25 min", priority: "normal", items: 3 },
];

const ALERTS = [
  { type: "speed", msg: "Current traffic allows 42 km/h here - reduce speed to stay compliant.", color: "#FF4757", icon: "⚡" },
  { type: "fuel", msg: "Fuel at 18% - refuel soon to avoid delays", color: "#FFA502", icon: "⛽" },
  { type: "hours", msg: "Working hours are getting high - review duty compliance.", color: "#2ED573", icon: "⏱️" },
];

const EARNINGS = [
  { day: "Mon", earn: 420, trips: 6 },
  { day: "Tue", earn: 680, trips: 9 },
  { day: "Wed", earn: 530, trips: 7 },
  { day: "Thu", earn: 890, trips: 12 },
  { day: "Fri", earn: 1120, trips: 15 },
  { day: "Sat", earn: 1380, trips: 18 },
  { day: "Sun", earn: 760, trips: 10 },
];

const INSURANCE_PLANS = [
  {
    id: "care-basic",
    company: "CareSure Health",
    plan: "Gig Shield Basic",
    cover: "₹3 lakh",
    premium: "₹149/month",
    hospitals: 42,
    benefit: "Cashless hospitalization and accident support",
    tag: "Gov Approved",
  },
  {
    id: "safe-family",
    company: "SafeLife Insurance",
    plan: "Worker Family Plus",
    cover: "₹5 lakh",
    premium: "₹249/month",
    hospitals: 67,
    benefit: "Family add-on, OPD support, emergency claims",
    tag: "Popular",
  },
  {
    id: "niva-pro",
    company: "Niva Health Partners",
    plan: "Shift Secure Pro",
    cover: "₹4 lakh",
    premium: "₹199/month",
    hospitals: 53,
    benefit: "Lower premium for high anonymous compliance ratings",
    tag: "Low Premium",
  },
];

const FEEDBACK_QUESTIONS = [
  "How was your work experience today?",
  "Did the routes feel manageable?",
  "Any concerns about safety or wellbeing?",
];

const TABS = [
  { id: "dashboard", icon: "🏠", label: "Home" },
  { id: "orders", icon: "🏢", label: "Companies" },
  { id: "safety", icon: "📋", label: "Compliance" },
  { id: "earnings", icon: "🛡️", label: "Schemes" },
  { id: "feedback", icon: "🪪", label: "Registry" },
];

const ROUTES = {
  default: {
    path: [
      [28.4691, 77.0724],
      [28.4702, 77.0699],
      [28.4715, 77.0672],
      [28.4737, 77.0648],
      [28.4762, 77.0624],
    ],
    rider: [28.4691, 77.0724],
    pickup: [28.4715, 77.0672],
    dropoff: [28.4762, 77.0624],
  },
  "ORD-4821": {
    path: [
      [28.4691, 77.0724],
      [28.4702, 77.0699],
      [28.4715, 77.0672],
      [28.4737, 77.0648],
      [28.4762, 77.0624],
    ],
    rider: [28.4691, 77.0724],
    pickup: [28.4715, 77.0672],
    dropoff: [28.4762, 77.0624],
  },
  "ORD-4822": {
    path: [
      [28.4678, 77.0808],
      [28.4689, 77.0783],
      [28.4698, 77.0761],
      [28.4711, 77.0744],
      [28.4726, 77.0726],
    ],
    rider: [28.4678, 77.0808],
    pickup: [28.4698, 77.0761],
    dropoff: [28.4726, 77.0726],
  },
  "ORD-4823": {
    path: [
      [28.4624, 77.0721],
      [28.4638, 77.0704],
      [28.4651, 77.0682],
      [28.4674, 77.0666],
      [28.4709, 77.0643],
    ],
    rider: [28.4624, 77.0721],
    pickup: [28.4651, 77.0682],
    dropoff: [28.4709, 77.0643],
  },
};

const state = {
  tab: "dashboard",
  speed: 38,
  fuel: 72,
  trafficLimit: 42,
  activeAlert: null,
  onBreak: false,
  breakTimer: 0,
  rideTime: 6.2,
  todayEarnings: 1240,
  trips: 8,
  feedbackStep: 0,
  feedbackAnswers: [],
  feedbackDone: false,
  selectedRating: null,
  showBreakPrompt: false,
  activeOrder: null,
  showOrderAccepted: false,
  routeProgress: 0,
  boughtInsuranceId: null,
};

const root = document.getElementById("root");
const maxEarn = Math.max(...EARNINGS.map((entry) => entry.earn));
let toastTimeout = null;
let rideInterval = null;
let breakInterval = null;
let shellMounted = false;
let routeMap = null;
let routeLine = null;
let riderMarker = null;
let pickupMarker = null;
let dropoffMarker = null;
let routeMapNode = null;

function getRouteForOrder(order) {
  if (!order) {
    return ROUTES.default;
  }
  return ROUTES[order.id] || ROUTES.default;
}

function getOrderDistanceKm(order) {
  if (!order) {
    return 3.2;
  }
  return Number.parseFloat(order.distance);
}

function interpolatePoint(path, progress) {
  if (!path.length) {
    return [0, 0];
  }
  if (path.length === 1) {
    return path[0];
  }

  const clamped = Math.max(0, Math.min(0.9999, progress));
  const scaled = clamped * (path.length - 1);
  const index = Math.floor(scaled);
  const localProgress = scaled - index;
  const start = path[index];
  const end = path[Math.min(index + 1, path.length - 1)];

  return [
    start[0] + (end[0] - start[0]) * localProgress,
    start[1] + (end[1] - start[1]) * localProgress,
  ];
}

function getCurrentLocation() {
  const route = getRouteForOrder(state.activeOrder);
  return interpolatePoint(route.path, state.routeProgress);
}

function getRemainingDistanceKm() {
  if (!state.activeOrder) {
    return getOrderDistanceKm(ORDERS[0]);
  }
  return Math.max(0, getOrderDistanceKm(state.activeOrder) * (1 - state.routeProgress));
}

function getRemainingEtaMinutes() {
  const speedForEta = Math.max(18, state.speed);
  return Math.max(1, Math.round((getRemainingDistanceKm() / speedForEta) * 60));
}

function updateAlerts() {
  if (state.speed > state.trafficLimit) {
    state.activeAlert = ALERTS[0];
  } else if (state.fuel < 20) {
    state.activeAlert = ALERTS[1];
  } else if (state.rideTime > 9 && !state.onBreak) {
    state.activeAlert = ALERTS[2];
    state.showBreakPrompt = true;
  } else {
    state.activeAlert = null;
    state.showBreakPrompt = false;
  }
}

function startTimers() {
  if (!rideInterval) {
    rideInterval = window.setInterval(() => {
      const delta = Math.random() > 0.5 ? 2 : -2;
      state.speed = Math.max(15, Math.min(85, state.speed + delta));
      state.trafficLimit = 32 + Math.floor(Math.random() * 18);
      state.fuel = Math.max(0, state.fuel - 0.05);
      if (!state.onBreak) {
        state.rideTime += 0.05;
        if (state.activeOrder && state.routeProgress < 1) {
          const distanceCoveredKm = (state.speed * 1.5) / 3600;
          state.routeProgress = Math.min(
            1,
            state.routeProgress + distanceCoveredKm / getOrderDistanceKm(state.activeOrder)
          );
        }
      }
      updateAlerts();
      renderChrome();
      updateLiveTabValues();
      updateMapMotion();
    }, 1500);
  }
}

function syncBreakTimer() {
  if (state.onBreak && !breakInterval) {
    breakInterval = window.setInterval(() => {
      state.breakTimer += 1;
      renderChrome();
      updateLiveTabValues();
    }, 1000);
  }

  if (!state.onBreak && breakInterval) {
    clearInterval(breakInterval);
    breakInterval = null;
    state.breakTimer = 0;
  }
}

function setTab(tab) {
  state.tab = tab;
  renderCurrentTab();
  renderChrome();
}

function acceptOrder(orderId) {
  const order = ORDERS.find((entry) => entry.id === orderId);
  if (!order) {
    return;
  }

  state.activeOrder = order;
  state.routeProgress = 0;
  state.todayEarnings += Number(order.earn.replace(/[^\d]/g, ""));
  state.trips += 1;
  state.showOrderAccepted = true;
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  toastTimeout = window.setTimeout(() => {
    state.showOrderAccepted = false;
    renderChrome();
  }, 2500);
  renderCurrentTab();
  renderChrome();
  ensureRouteMap();
}

function toggleBreak() {
  state.onBreak = !state.onBreak;
  syncBreakTimer();
  updateAlerts();
  renderCurrentTab();
  renderChrome();
}

function answerFeedback(index) {
  state.selectedRating = index;
  renderCurrentTab();
  window.setTimeout(() => {
    state.feedbackAnswers.push(index);
    state.selectedRating = null;
    if (state.feedbackStep < FEEDBACK_QUESTIONS.length - 1) {
      state.feedbackStep += 1;
    } else {
      state.feedbackDone = true;
    }
    renderCurrentTab();
  }, 400);
}

function resetFeedback() {
  state.feedbackDone = false;
  state.feedbackStep = 0;
  state.feedbackAnswers = [];
  state.selectedRating = null;
  renderCurrentTab();
}

function buyInsurance(planId) {
  state.boughtInsuranceId = planId;
  state.showOrderAccepted = true;
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  toastTimeout = window.setTimeout(() => {
    state.showOrderAccepted = false;
    renderChrome();
  }, 2500);
  renderCurrentTab();
  renderChrome();
}

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function statPill(color, icon, value, label, valueColor) {
  return `
    <div class="stat-pill" style="--pill:${color}">
      <span class="stat-icon">${icon}</span>
      <div>
        <div class="stat-value" style="color:${valueColor}">${value}</div>
        <div class="stat-label">${label}</div>
      </div>
    </div>
  `;
}

function dashboardView() {
  const mapOrder = state.activeOrder || ORDERS[0];
  const currentLocation = getCurrentLocation();
  return `
    <section class="screen">
      <div class="map-area">
        <div id="route-map" class="route-map"></div>
        <div class="map-copy">
          <div class="muted tiny">${state.activeOrder ? "CURRENT ROUTE" : "LIVE LOCATION"}</div>
          <div class="route-title">${state.activeOrder ? `${esc(mapOrder.restaurant)} → ${esc(mapOrder.customer)}` : "Your location + nearby pickup and drop"}</div>
          <div id="dashboard-route-status" class="success tiny">${state.activeOrder ? `Live trip in progress · ${Math.round(state.routeProgress * 100)}% done` : "No active order · accept one to start live routing"}</div>
        </div>
        <div class="map-eta">
          <div id="dashboard-distance" class="eta-distance">${state.activeOrder ? `${getRemainingDistanceKm().toFixed(1)} km` : "Nearby"}</div>
          <div id="dashboard-eta" class="muted tiny">${state.activeOrder ? `${getRemainingEtaMinutes()} min ETA` : "Pickup and drop preview only"}</div>
        </div>
        <div id="dashboard-location-pill" class="you-pill">📍 ${currentLocation[0].toFixed(4)}, ${currentLocation[1].toFixed(4)}</div>
      </div>

      ${state.activeOrder ? `
        <div class="card active-card">
          <div class="row between start">
            <div>
              <div class="success tiny strong">ACTIVE DELIVERY</div>
              <div class="card-title">${esc(state.activeOrder.restaurant)}</div>
              <div class="muted small">${esc(state.activeOrder.address)}</div>
            </div>
            <div class="right">
              <div class="money">${esc(state.activeOrder.earn)}</div>
              <div class="muted tiny">earning</div>
            </div>
          </div>
          <div class="row gap8 mt12">
            <button class="btn btn-ghost danger-fill" data-action="cancel-order">Cancel</button>
            <button class="btn btn-primary grow">Mark Delivered ✓</button>
          </div>
        </div>
      ` : ""}

      <div class="quick-grid">
        ${[
          { label: "Working Hours", value: `${state.rideTime.toFixed(1)} hrs`, sub: "today on duty", icon: "⏱️", color: "0,229,255" },
          { label: "Gov Status", value: "Verified", sub: "registry active", icon: "🪪", color: "46,213,115" },
          { label: "Live Speed", value: `${Math.round(state.speed)} / ${state.trafficLimit} km/h`, sub: "traffic-adjusted", icon: "🛣️", color: "46,213,115" },
          { label: "Fuel Est.", value: `${Math.max(0, Math.round(state.fuel * 0.5))} km`, sub: "remaining range", icon: "⛽", color: "255,165,2" },
        ].map((item) => `
          <div class="quick-card" style="--quick:${item.color}">
            <div class="quick-icon">${item.icon}</div>
            <div class="quick-value"
              ${item.label === "Working Hours" ? 'id="dashboard-ride-time"' : ""}
              ${item.label === "Live Speed" ? 'id="dashboard-live-speed"' : ""}
              ${item.label === "Fuel Est." ? 'id="dashboard-fuel-range"' : ""}
            >${item.value}</div>
            <div class="quick-label">${item.label}</div>
            <div class="muted tiny">${item.sub}</div>
          </div>
        `).join("")}
      </div>

      <div class="card wellbeing-card">
        <div class="row between center">
          <div>
            <div class="muted tiny">GOV REGISTRATION STATUS</div>
            <div class="big-score">Active<span> worker</span></div>
            <div class="muted small mt4">Data sharing with government and verified partners is enabled.</div>
          </div>
          <div class="trophy-ring">🪪</div>
        </div>
      </div>
    </section>
  `;
}

function ordersView() {
  return `
    <section class="screen">
      <div class="section-head">COMPANY DEMAND BOARD</div>
      <div class="info-banner">
        <span>ℹ️</span>
        <div>Government-registered companies can source verified gig workers based on demand and compliance data.</div>
      </div>
      ${ORDERS.map((order) => `
        <div class="card ${order.priority === "high" ? "order-high" : ""}">
          <div class="row between start">
            <div class="grow">
              <div class="row gap8 center mb6">
                <span class="tiny strong ${order.priority === "high" ? "accent" : "muted"}">${order.priority === "high" ? "🏢 PRIORITY REQUEST" : "📦 STANDARD REQUEST"}</span>
                <span class="tiny muted">${order.id}</span>
              </div>
              <div class="card-title">${esc(order.restaurant)}</div>
              <div class="small mt2">Need: ${esc(order.customer)}</div>
              <div class="tiny muted mt2">📍 ${esc(order.address)}</div>
            </div>
            <div class="right min70">
              <div class="money">${esc(order.earn)}</div>
              <div class="muted tiny">base pay</div>
            </div>
          </div>
          <div class="row gap16 meta-row">
            <span>📏 ${order.distance}</span>
            <span>⏱️ ~${order.eta}</span>
            <span>🍱 ${order.items} item${order.items > 1 ? "s" : ""}</span>
          </div>
          <button class="btn btn-primary full mt12" data-action="accept-order" data-id="${order.id}">
            Assign Through Gov Registry
          </button>
        </div>
      `).join("")}
    </section>
  `;
}

function safetyView() {
  return `
    <section class="screen">
      <div class="section-head">COMPLIANCE AND DUTY TRACKER</div>
      <div class="card center-text">
        <div class="muted tiny mb8">TRAFFIC-AWARE SPEED</div>
        <div id="safety-speed" class="speed-number ${state.speed > state.trafficLimit ? "danger" : state.speed > state.trafficLimit - 5 ? "warn" : "success"}">${Math.round(state.speed)}</div>
        <div class="muted small">km/h</div>
        <div id="safety-speed-status" class="status-line ${state.speed > state.trafficLimit ? "danger" : state.speed > state.trafficLimit - 5 ? "warn" : "success"}">
          ${state.speed > state.trafficLimit ? `⚠️ Above traffic limit of ${state.trafficLimit} km/h` : `✅ Within traffic limit of ${state.trafficLimit} km/h`}
        </div>
      </div>

      <div class="card">
        <div class="row between center mb10">
          <div class="strong">⛽ Fuel Level</div>
          <div id="safety-fuel-value" class="fuel-value ${state.fuel < 20 ? "danger" : "warn"}">${Math.round(state.fuel)}%</div>
        </div>
        <div class="fuel-bar"><div id="safety-fuel-fill" class="fuel-fill ${state.fuel < 20 ? "low" : ""}" style="width:${state.fuel}%"></div></div>
        <div id="safety-fuel-text" class="muted tiny mt8">
          ${state.fuel < 20 ? "🔴 Low fuel - plan a stop soon" : state.fuel < 40 ? "🟡 Consider refueling in next 30 min" : "🟢 Fuel level is good"}
        </div>
      </div>

      <div class="card break-card">
        <div class="strong">⏱️ Working Hours</div>
        <div class="muted tiny mt4">Duty hours are tracked for compliance and worker protection. Government and approved companies can review this data.</div>
        <div class="quick-grid mt12">
          <div class="mini-box">
            <div id="safety-ride-time" class="accent big-mini">${state.rideTime.toFixed(1)}h</div>
            <div class="muted tiny">Working hours</div>
          </div>
          <div class="mini-box mini-box-green">
            <div class="success big-mini">Gov</div>
            <div class="muted tiny">Data synced</div>
          </div>
          <div class="mini-box">
            <div class="violet big-mini">Anon</div>
            <div class="muted tiny">Rating mode</div>
          </div>
        </div>
        <div class="break-live">
          <div id="safety-break-time" class="break-time">${state.rideTime > 9 ? "Review" : "Clear"}</div>
          <div class="muted tiny">Working-hours compliance status</div>
        </div>
      </div>

      <div class="card">
        <div class="strong mb12">📜 Compliance Notes</div>
        ${[
          "Speed is checked against live traffic limits",
          "Working hours are shared with the government registry",
          "Ratings are stored anonymously for fairness",
          "Companies can source only verified workers",
        ].map((tip, index) => `
          <div class="tip-row ${index < 3 ? "tip-divider" : ""}">
            <span>${["🛣️", "🪪", "🙈", "🏢"][index]}</span>
            <span class="small">${tip}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function earningsView() {
  return `
    <section class="screen">
      <div class="section-head">INSURANCE AND WELFARE SCHEMES</div>
      <div class="quick-grid">
        ${[
          { label: "Active Schemes", value: "12", icon: "🛡️", color: "0,229,255" },
          { label: "Gov Verified", value: "8", icon: "🏛️", color: "46,213,115" },
          { label: "Insurance Firms", value: "5", icon: "🏥", color: "255,165,2" },
          { label: "Applied", value: "2", icon: "📄", color: "155,89,182" },
        ].map((item) => `
          <div class="quick-card" style="--quick:${item.color}">
            <div class="quick-icon">${item.icon}</div>
            <div class="quick-value">${item.value}</div>
            <div class="muted tiny mt2">${item.label}</div>
          </div>
        `).join("")}
      </div>
      <div class="card mt12">
        <div class="strong mb16">Scheme Activity</div>
        <div class="chart-row">
          ${EARNINGS.map((entry, index) => `
            <div class="chart-col">
              <div class="muted tiny">${entry.trips}</div>
              <div class="chart-bar ${index === 5 ? "chart-best" : ""}" style="height:${(entry.earn / maxEarn) * 70}px"></div>
              <div class="muted tiny">${entry.day}</div>
            </div>
          `).join("")}
        </div>
      </div>
      <div class="card bonus-card">
        <div class="strong mb12">🏥 Insurance Company Schemes</div>
        ${[
          { label: "Accident Cover", desc: "₹5 lakh emergency cover for registered workers", reward: "Available", done: true },
          { label: "Health Plan", desc: "Outpatient and hospital support with partner hospitals", reward: "New", done: true },
          { label: "Fuel Support Add-on", desc: "Monthly add-on cover linked to verified duty data", reward: "Open", done: false, progress: "Apply" },
          { label: "Anonymous Rating Benefit", desc: "Good anonymous ratings unlock lower premiums", reward: "Eligible", done: false, progress: "4.6★ anon" },
        ].map((item, index) => `
          <div class="incentive-row ${index < 3 ? "tip-divider" : ""}">
            <div class="grow">
              <div class="${item.done ? "success" : ""}">${item.done ? "✓ " : ""}${item.label}</div>
              <div class="muted tiny">${item.desc}</div>
            </div>
            <div class="right">
              <div class="${item.done ? "success" : "warn"} strong">${item.reward}</div>
              ${item.done ? "" : `<div class="muted tiny">${item.progress}</div>`}
            </div>
          </div>
        `).join("")}
      </div>
      <div class="card health-card">
        <div class="row between center mb12">
          <div>
            <div class="strong">❤️ Health Insurance</div>
            <div class="muted tiny mt4">Government-linked protection for registered gig workers and families.</div>
          </div>
          <div class="scheme-badge">ACTIVE</div>
        </div>
        <div class="quick-grid">
          <div class="mini-box">
            <div class="success big-mini">₹3L</div>
            <div class="muted tiny">Hospital cover</div>
          </div>
          <div class="mini-box">
            <div class="accent big-mini">42</div>
            <div class="muted tiny">Partner hospitals</div>
          </div>
          <div class="mini-box">
            <div class="warn big-mini">80%</div>
            <div class="muted tiny">Premium subsidy</div>
          </div>
          <div class="mini-box">
            <div class="violet big-mini">Family</div>
            <div class="muted tiny">Optional add-on</div>
          </div>
        </div>
        <div class="incentive-row tip-divider mt12">
          <div class="grow">
            <div class="strong">Cashless treatment</div>
            <div class="muted tiny">Use worker ID and registered mobile number at listed hospitals.</div>
          </div>
          <div class="success strong">Enabled</div>
        </div>
        <div class="incentive-row tip-divider">
          <div class="grow">
            <div class="strong">OPD and medicine support</div>
            <div class="muted tiny">Small outpatient claims can be filed monthly through the portal.</div>
          </div>
          <div class="warn strong">Open</div>
        </div>
        <div class="incentive-row">
          <div class="grow">
            <div class="strong">Emergency claim helpline</div>
            <div class="muted tiny">24x7 assistance for accident and hospital admission support.</div>
          </div>
          <div class="success strong">24x7</div>
        </div>
        <div class="row gap8 mt12">
          <button class="btn btn-primary grow">View Health Card</button>
          <button class="btn btn-ghost grow">File Claim</button>
        </div>
      </div>
      <div class="card mt12">
        <div class="strong mb12">🛒 Buy Health Insurance From Companies</div>
        ${INSURANCE_PLANS.map((plan, index) => `
          <div class="insurance-plan ${index < INSURANCE_PLANS.length - 1 ? "tip-divider" : ""}">
            <div class="row between start">
              <div class="grow">
                <div class="row gap8 center mb6">
                  <span class="scheme-badge">${plan.tag}</span>
                  <span class="tiny muted">${plan.company}</span>
                </div>
                <div class="card-title">${plan.plan}</div>
                <div class="muted tiny mt4">${plan.benefit}</div>
                <div class="row gap16 mt8 small">
                  <span>Cover: ${plan.cover}</span>
                  <span>Hospitals: ${plan.hospitals}</span>
                </div>
              </div>
              <div class="right">
                <div class="money" style="font-size:20px">${plan.premium}</div>
                <div class="muted tiny">premium</div>
              </div>
            </div>
            <div class="row gap8 mt12">
              <button class="btn btn-ghost grow">View Details</button>
              <button class="btn btn-primary grow" data-action="buy-insurance" data-id="${plan.id}">
                ${state.boughtInsuranceId === plan.id ? "Purchased" : "Buy Now"}
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function feedbackView() {
  return `
    <section class="screen">
      <div class="section-head">GOV WORKER REGISTRY</div>
      <div class="info-banner">Registered gig workers can share verified work data with government systems. Company access and anonymous ratings are controlled here.</div>
      ${!state.feedbackDone ? `
        <div class="card mt12">
          <div class="muted tiny mb6">REGISTRY CHECK ${state.feedbackStep + 1} of ${FEEDBACK_QUESTIONS.length}</div>
          <div class="progress"><div class="progress-fill" style="width:${((state.feedbackStep + 1) / FEEDBACK_QUESTIONS.length) * 100}%"></div></div>
          <div class="question">${["Is your government worker profile up to date?", "Do you allow verified companies to view your work data?", "Should your rating remain anonymous?"][state.feedbackStep]}</div>
          <div class="row gap8">
            ${["😔", "😐", "🙂", "😊", "🤩"].map((emoji, index) => `
              <button class="rating-btn ${state.selectedRating === index ? "rating-active" : ""}" data-action="feedback-rate" data-id="${index}">${emoji}</button>
            `).join("")}
          </div>
          <div class="row between center mt8">
            <span class="muted tiny">Poor</span>
            <span class="muted tiny">Excellent</span>
          </div>
        </div>
      ` : `
        <div class="card thank-card mt12">
          <div class="thanks-emoji">🪪</div>
          <div class="thanks-title">Registry Updated</div>
          <div class="muted small">Your worker profile, anonymous rating preference, and data-sharing choices have been recorded.</div>
          <button class="btn btn-primary full mt16" data-action="feedback-reset">Share More Feedback</button>
        </div>
      `}
      <div class="card mt12">
        <div class="strong mb12">📄 Registry Controls</div>
        ${["Update KYC details", "Share work data with government", "Allow companies to request workers", "Keep rating anonymous", "Review insurance eligibility"].map((issue) => `
          <button class="issue-btn">${issue}</button>
        `).join("")}
      </div>
      <div class="card sos-card">
        <div class="strong mb4">🏛️ Government Access</div>
        <div class="muted tiny mb12">Verified agencies and insurance partners can consume approved worker data from here.</div>
        <button class="btn btn-sos full">OPEN DATA CONSENT</button>
      </div>
    </section>
  `;
}

function renderContent() {
  switch (state.tab) {
    case "orders":
      return ordersView();
    case "safety":
      return safetyView();
    case "earnings":
      return earningsView();
    case "feedback":
      return feedbackView();
    default:
      return dashboardView();
  }
}

function mountShell() {
  if (shellMounted) {
    return;
  }

  root.innerHTML = `
    <style>
      * { box-sizing: border-box; }
      body { font-family: "Segoe UI", Arial, sans-serif; color: #e8eaf0; }
      button { font: inherit; }
      .app { min-height: 100vh; background: #0a0e1a; max-width: 430px; margin: 0 auto; display: flex; flex-direction: column; }
      .header { background: linear-gradient(135deg, #0d1b3e 0%, #0a0e1a 100%); padding: 20px 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 20; }
      .row { display: flex; }
      .between { justify-content: space-between; }
      .center { align-items: center; }
      .start { align-items: flex-start; }
      .gap8 { gap: 8px; }
      .gap16 { gap: 16px; }
      .grow { flex: 1; }
      .right { text-align: right; }
      .min70 { min-width: 70px; }
      .mt2 { margin-top: 2px; }
      .mt4 { margin-top: 4px; }
      .mt8 { margin-top: 8px; }
      .mt10 { margin-top: 10px; }
      .mt12 { margin-top: 12px; }
      .mt16 { margin-top: 16px; }
      .mb4 { margin-bottom: 4px; }
      .mb6 { margin-bottom: 6px; }
      .mb8 { margin-bottom: 8px; }
      .mb10 { margin-bottom: 10px; }
      .mb12 { margin-bottom: 12px; }
      .mb16 { margin-bottom: 16px; }
      .logo { font-size: 22px; font-weight: 800; background: linear-gradient(90deg, #00e5ff, #00ff88); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .badge { background: rgba(0,229,255,0.12); border: 1px solid rgba(0,229,255,0.25); color: #00e5ff; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; display: inline-block; }
      .muted { color: #5a6478; }
      .small { font-size: 12px; color: #8892a4; }
      .tiny { font-size: 11px; }
      .strong { font-weight: 700; }
      .accent { color: #00e5ff; }
      .success { color: #2ed573; }
      .warn { color: #ffa502; }
      .danger { color: #ff4757; }
      .violet { color: #9b59b6; }
      .status-row { display: flex; gap: 10px; margin-top: 12px; }
      .stat-pill { flex: 1; background: rgba(var(--pill),0.10); border: 1px solid rgba(var(--pill),0.25); border-radius: 12px; padding: 8px 10px; display: flex; align-items: center; gap: 6px; }
      .stat-icon { font-size: 16px; }
      .stat-value { font-size: 17px; font-weight: 800; }
      .stat-label { font-size: 9px; color: #5a6478; }
      .alert { margin: 12px 16px 0; border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; gap: 10px; animation: pulse 2s infinite; }
      .break-prompt, .info-banner { margin-top: 12px; background: rgba(0,229,255,0.06); border: 1px solid rgba(0,229,255,0.15); border-radius: 14px; padding: 12px 14px; color: #8892a4; font-size: 12px; }
      .break-prompt { background: rgba(46,213,115,0.10); border-color: rgba(46,213,115,0.25); color: #a7f3c6; }
      .toast { position: fixed; top: 160px; left: 50%; transform: translateX(-50%); background: #2ed573; color: #0a0e1a; border-radius: 14px; padding: 12px 24px; font-weight: 800; font-size: 14px; z-index: 999; animation: slideIn 0.3s ease; box-shadow: 0 10px 40px rgba(46,213,115,0.4); }
      .content { flex: 1; overflow-y: auto; padding: 16px 16px 8px; }
      .screen { animation: fadeIn 0.3s ease; }
      .section-head { font-size: 13px; font-weight: 700; color: #5a6478; margin-bottom: 14px; letter-spacing: 1px; }
      .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 16px; margin-bottom: 12px; }
      .card-title { font-size: 16px; font-weight: 700; }
      .active-card { border-color: rgba(46,213,115,0.3); background: rgba(46,213,115,0.06); }
      .money { font-size: 24px; font-weight: 800; color: #2ed573; }
      .map-area { background: linear-gradient(145deg, #0d1b3e, #0a1628); border-radius: 18px; padding: 20px; height: 180px; position: relative; overflow: hidden; margin-bottom: 12px; border: 1px solid rgba(0,229,255,0.1); }
      .route-map { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; }
      .map-copy { position: absolute; top: 16px; left: 16px; z-index: 1; }
      .route-title { font-size: 14px; font-weight: 700; }
      .map-eta { position: absolute; bottom: 16px; right: 16px; background: rgba(0,229,255,0.1); border: 1px solid rgba(0,229,255,0.2); border-radius: 10px; padding: 6px 12px; text-align: right; z-index: 1; backdrop-filter: blur(8px); }
      .eta-distance { font-size: 18px; font-weight: 800; color: #00e5ff; }
      .you-pill { position: absolute; bottom: 16px; left: 16px; background: #2ed573; border-radius: 20px; padding: 4px 10px; font-size: 11px; color: #0a0e1a; font-weight: 700; z-index: 1; }
      .custom-map-marker { display: flex; flex-direction: column; align-items: center; }
      .leaflet-container { background: #0a1628; font-family: "Segoe UI", Arial, sans-serif; }
      .leaflet-control-attribution { background: rgba(10,14,26,0.72); color: #c6d0de; }
      .leaflet-control-attribution a { color: #8edfff; }
      .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .quick-card { background: rgba(var(--quick),0.06); border: 1px solid rgba(var(--quick),0.2); border-radius: 14px; padding: 14px; }
      .quick-icon { font-size: 18px; }
      .quick-value { font-size: 20px; font-weight: 800; color: rgb(var(--quick)); margin-top: 6px; }
      .quick-label { font-size: 11px; font-weight: 600; margin-top: 2px; }
      .wellbeing-card { background: linear-gradient(135deg, rgba(0,229,255,0.08), rgba(0,255,136,0.05)); border-color: rgba(0,229,255,0.15); }
      .big-score { font-size: 28px; font-weight: 800; color: #00ff88; }
      .big-score span { font-size: 14px; color: #5a6478; }
      .trophy-ring { width: 64px; height: 64px; border-radius: 50%; border: 6px solid #00e5ff; display: flex; align-items: center; justify-content: center; font-size: 18px; box-shadow: inset 0 0 0 6px rgba(0,255,136,0.2); }
      .meta-row { margin-top: 10px; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.05); font-size: 12px; color: #8892a4; }
      .order-high { background: rgba(0,229,255,0.06); border-color: rgba(0,229,255,0.3); }
      .btn { border: none; border-radius: 12px; padding: 10px 20px; cursor: pointer; }
      .btn-primary { background: linear-gradient(135deg, #00e5ff, #00ff88); color: #0a0e1a; font-weight: 800; }
      .btn-ghost { background: rgba(255,255,255,0.06); color: #e8eaf0; }
      .danger-fill { background: rgba(255,71,87,0.1); border: 1px solid rgba(255,71,87,0.3); color: #ff4757; }
      .btn-break { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #e8eaf0; font-weight: 700; }
      .btn-break-active { background: rgba(46,213,115,0.15); border: 1px solid #2ed573; color: #2ed573; font-weight: 700; }
      .btn-sos { background: #ff4757; color: #fff; font-weight: 800; font-size: 16px; }
      .full { width: 100%; }
      .speed-number { font-size: 48px; font-weight: 800; }
      .status-line { margin-top: 8px; font-size: 12px; font-weight: 700; }
      .fuel-value { font-size: 15px; font-weight: 800; }
      .fuel-bar { background: rgba(255,255,255,0.06); border-radius: 8px; height: 10px; overflow: hidden; }
      .fuel-fill { height: 100%; background: linear-gradient(90deg, #ffa502, #2ed573); border-radius: 8px; transition: width 0.5s ease; }
      .fuel-fill.low { background: #ff4757; }
      .break-card { border-color: rgba(46,213,115,0.2); background: rgba(46,213,115,0.05); }
      .mini-box { flex: 1; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 10px; text-align: center; }
      .mini-box-green { background: rgba(46,213,115,0.08); border: 1px solid rgba(46,213,115,0.2); }
      .big-mini { font-size: 18px; font-weight: 800; }
      .break-live { background: rgba(46,213,115,0.1); border: 1px solid rgba(46,213,115,0.3); border-radius: 12px; padding: 12px; text-align: center; margin-top: 12px; }
      .break-time { font-size: 22px; font-weight: 800; color: #2ed573; }
      .tip-row, .incentive-row { display: flex; gap: 10px; align-items: center; padding: 8px 0; }
      .tip-divider { border-bottom: 1px solid rgba(255,255,255,0.04); }
      .center-text { text-align: center; }
      .chart-row { display: flex; align-items: flex-end; gap: 6px; height: 100px; }
      .chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
      .chart-bar { width: 100%; border-radius: 6px 6px 0 0; background: rgba(255,255,255,0.1); transition: height 0.5s ease; }
      .chart-best { background: linear-gradient(180deg, #00e5ff, #00ff88); }
      .bonus-card { background: linear-gradient(135deg, rgba(155,89,182,0.1), rgba(0,229,255,0.05)); border-color: rgba(155,89,182,0.2); }
      .health-card { background: linear-gradient(135deg, rgba(47,227,138,0.08), rgba(0,229,255,0.04)); border-color: rgba(47,227,138,0.22); }
      .scheme-badge { background: rgba(46,213,115,0.14); border: 1px solid rgba(46,213,115,0.3); color: #2ed573; border-radius: 999px; padding: 6px 10px; font-size: 11px; font-weight: 800; }
      .progress { background: rgba(255,255,255,0.04); border-radius: 8px; height: 3px; margin-bottom: 16px; overflow: hidden; }
      .progress-fill { height: 100%; background: linear-gradient(90deg,#00e5ff,#00ff88); }
      .question { font-size: 16px; font-weight: 700; margin-bottom: 20px; line-height: 1.4; }
      .rating-btn { flex: 1; padding: 12px 6px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #8892a4; font-size: 22px; cursor: pointer; }
      .rating-active { background: rgba(0,229,255,0.15); border-color: #00e5ff; color: #00e5ff; }
      .thank-card { text-align: center; border-color: rgba(46,213,115,0.3); background: rgba(46,213,115,0.06); }
      .thanks-emoji { font-size: 48px; margin-bottom: 12px; }
      .thanks-title { font-size: 20px; font-weight: 800; color: #2ed573; margin-bottom: 8px; }
      .issue-btn { display: block; width: 100%; text-align: left; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 10px 14px; color: #8892a4; font-size: 12px; cursor: pointer; margin-bottom: 8px; }
      .sos-card { background: rgba(255,71,87,0.06); border-color: rgba(255,71,87,0.2); text-align: center; }
      .nav { display: flex; background: #0d1221; border-top: 1px solid rgba(255,255,255,0.06); position: sticky; bottom: 0; z-index: 20; }
      .nav-btn { flex: 1; padding: 12px 4px 10px; background: none; border: none; color: #4a5568; font-size: 10px; font-weight: 500; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; border-top: 2px solid transparent; }
      .nav-active { color: #00e5ff; font-weight: 700; border-top-color: #00e5ff; }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.7; } }
      @keyframes slideIn { from { transform: translate(-50%, -20px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    </style>
    <div class="app">
      <div id="app-header" class="header"></div>
      <div id="app-alerts"></div>
      <div id="app-content" class="content"></div>
      <div id="app-nav" class="nav"></div>
    </div>
  `;
  shellMounted = true;
}

function renderHeader() {
  const header = document.getElementById("app-header");
  if (!header) {
    return;
  }

  header.innerHTML = `
    <div class="row between center">
      <div>
        <div class="logo">🏛️ GovGig Portal</div>
        <div class="tiny muted mt2">Government registry for verified gig workers</div>
      </div>
      <div class="right">
        <div class="badge">🟢 Online</div>
        <div class="tiny muted mt4">Arjun Singh · Registered Worker</div>
      </div>
    </div>
    <div class="status-row">
      ${statPill("0,229,255", "🏍️", Math.round(state.speed), "km/h", state.speed > 65 ? "#FF4757" : "#00E5FF")}
      ${statPill("255,165,2", "⛽", `${Math.round(state.fuel)}%`, "fuel", state.fuel < 20 ? "#FF4757" : "#FFA502")}
      ${statPill("46,213,115", "💰", `₹${state.todayEarnings}`, "today", "#2ED573")}
      ${statPill("155,89,182", "📦", state.trips, "trips", "#9B59B6")}
    </div>
  `;
}

function renderAlerts() {
  const alerts = document.getElementById("app-alerts");
  if (!alerts) {
    return;
  }

  alerts.innerHTML = `
    ${state.activeAlert ? `
      <div class="alert" style="background:${state.activeAlert.color}18;border:1px solid ${state.activeAlert.color}55">
        <span style="font-size:22px">${state.activeAlert.icon}</span>
        <div>
          <div class="strong" style="font-size:13px;color:${state.activeAlert.color}">
            ${state.activeAlert.type === "speed" ? "Traffic Speed Alert" : state.activeAlert.type === "fuel" ? "Low Fuel" : "Working Hours Alert"}
          </div>
          <div class="small mt2">${state.activeAlert.msg}</div>
        </div>
      </div>
    ` : ""}
    ${state.showOrderAccepted ? `<div class="toast">${state.boughtInsuranceId ? "✓ Insurance Purchased!" : "✓ Order Accepted!"}</div>` : ""}
    ${state.showBreakPrompt && !state.onBreak ? '<div class="break-prompt">Working hours are high. Review duty limits and compliance status.</div>' : ""}
  `;
}

function renderNav() {
  const nav = document.getElementById("app-nav");
  if (!nav) {
    return;
  }

  nav.innerHTML = TABS.map((tab) => `
    <button class="nav-btn ${state.tab === tab.id ? "nav-active" : ""}" data-action="tab" data-id="${tab.id}">
      <span style="font-size:20px">${tab.icon}</span>
      ${tab.label}
    </button>
  `).join("");
}

function renderCurrentTab() {
  const content = document.getElementById("app-content");
  if (!content) {
    return;
  }

  content.innerHTML = renderContent();
  if (state.tab === "dashboard") {
    ensureRouteMap();
  }
}

function updateLiveTabValues() {
  const dashboardRideTime = document.getElementById("dashboard-ride-time");
  if (dashboardRideTime) {
    dashboardRideTime.textContent = `${state.rideTime.toFixed(1)} hrs`;
  }

  const dashboardLiveSpeed = document.getElementById("dashboard-live-speed");
  if (dashboardLiveSpeed) {
    dashboardLiveSpeed.textContent = `${Math.round(state.speed)} / ${state.trafficLimit} km/h`;
  }

  const dashboardFuelRange = document.getElementById("dashboard-fuel-range");
  if (dashboardFuelRange) {
    dashboardFuelRange.textContent = `${Math.max(0, Math.round(state.fuel * 0.5))} km`;
  }

  const dashboardDistance = document.getElementById("dashboard-distance");
  if (dashboardDistance) {
    dashboardDistance.textContent = state.activeOrder ? `${getRemainingDistanceKm().toFixed(1)} km` : "Nearby";
  }

  const dashboardEta = document.getElementById("dashboard-eta");
  if (dashboardEta) {
    dashboardEta.textContent = state.activeOrder ? `${getRemainingEtaMinutes()} min ETA` : "Pickup and drop preview only";
  }

  const dashboardLocationPill = document.getElementById("dashboard-location-pill");
  if (dashboardLocationPill) {
    const currentLocation = getCurrentLocation();
    dashboardLocationPill.textContent = `📍 ${currentLocation[0].toFixed(4)}, ${currentLocation[1].toFixed(4)}`;
  }

  const dashboardRouteStatus = document.getElementById("dashboard-route-status");
  if (dashboardRouteStatus) {
    dashboardRouteStatus.textContent = state.activeOrder
      ? `Live trip in progress · ${Math.round(state.routeProgress * 100)}% done`
      : "No active order · accept one to start live routing";
  }

  const safetySpeed = document.getElementById("safety-speed");
  const safetySpeedStatus = document.getElementById("safety-speed-status");
  if (safetySpeed && safetySpeedStatus) {
    safetySpeed.textContent = `${Math.round(state.speed)}`;
    safetySpeed.className = `speed-number ${state.speed > state.trafficLimit ? "danger" : state.speed > state.trafficLimit - 5 ? "warn" : "success"}`;
    safetySpeedStatus.textContent = state.speed > state.trafficLimit ? `⚠️ Above traffic limit of ${state.trafficLimit} km/h` : `✅ Within traffic limit of ${state.trafficLimit} km/h`;
    safetySpeedStatus.className = `status-line ${state.speed > state.trafficLimit ? "danger" : state.speed > state.trafficLimit - 5 ? "warn" : "success"}`;
  }

  const safetyFuelValue = document.getElementById("safety-fuel-value");
  const safetyFuelFill = document.getElementById("safety-fuel-fill");
  const safetyFuelText = document.getElementById("safety-fuel-text");
  if (safetyFuelValue && safetyFuelFill && safetyFuelText) {
    safetyFuelValue.textContent = `${Math.round(state.fuel)}%`;
    safetyFuelValue.className = `fuel-value ${state.fuel < 20 ? "danger" : "warn"}`;
    safetyFuelFill.style.width = `${state.fuel}%`;
    safetyFuelFill.className = `fuel-fill ${state.fuel < 20 ? "low" : ""}`;
    safetyFuelText.textContent = state.fuel < 20 ? "🔴 Low fuel - plan a stop soon" : state.fuel < 40 ? "🟡 Consider refueling in next 30 min" : "🟢 Fuel level is good";
  }

  const safetyRideTime = document.getElementById("safety-ride-time");
  if (safetyRideTime) {
    safetyRideTime.textContent = `${state.rideTime.toFixed(1)}h`;
  }

  const safetyBreakTime = document.getElementById("safety-break-time");
  if (safetyBreakTime) {
    safetyBreakTime.textContent = state.rideTime > 9 ? "Review" : "Clear";
  }
}

function renderChrome() {
  updateAlerts();
  renderHeader();
  renderAlerts();
  renderNav();
}

function render() {
  mountShell();
  renderChrome();
  renderCurrentTab();
}

function createMapIcon(color, label) {
  return L.divIcon({
    className: "custom-map-marker",
    html: `<div style="background:${color};width:14px;height:14px;border:2px solid #ffffff;border-radius:999px;box-shadow:0 0 0 4px rgba(10,14,26,0.35)"></div><span style="margin-top:6px;background:rgba(10,14,26,0.85);color:#fff;padding:3px 6px;border-radius:999px;font-size:10px;font-weight:700">${label}</span>`,
    iconSize: [20, 34],
    iconAnchor: [10, 14],
  });
}

function ensureRouteMap() {
  const mapNode = document.getElementById("route-map");
  if (!mapNode || typeof L === "undefined") {
    return;
  }

  const routeKey = state.activeOrder ? state.activeOrder.id : "default";
  const activeRoute = ROUTES[routeKey] || ROUTES.default;
  const hasActiveRoute = Boolean(state.activeOrder);

  if (routeMap && routeMapNode !== mapNode) {
    routeMap.remove();
    routeMap = null;
    routeLine = null;
    riderMarker = null;
    pickupMarker = null;
    dropoffMarker = null;
    routeMapNode = null;
  }

  if (!routeMap) {
    routeMapNode = mapNode;
    routeMap = L.map(mapNode, {
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(routeMap);

    routeLine = L.polyline(activeRoute.path, {
      color: "#00E5FF",
      weight: 5,
      opacity: 0.9,
    }).addTo(routeMap);

    riderMarker = L.marker(activeRoute.rider, {
      icon: createMapIcon("#2ED573", "You"),
    }).addTo(routeMap);

    pickupMarker = L.marker(activeRoute.pickup, {
      icon: createMapIcon("#FFA502", "Pickup"),
    }).addTo(routeMap);

    dropoffMarker = L.marker(activeRoute.dropoff, {
      icon: createMapIcon("#FF4757", "Drop"),
    }).addTo(routeMap);

    if (hasActiveRoute) {
      routeMap.fitBounds(routeLine.getBounds(), {
        padding: [20, 20],
      });
    } else {
      routeLine.setStyle({ opacity: 0, weight: 0 });
      routeMap.fitBounds(L.latLngBounds([activeRoute.rider, activeRoute.pickup, activeRoute.dropoff]), {
        padding: [30, 30],
      });
    }
  } else {
    routeLine.setLatLngs(activeRoute.path);
    riderMarker.setLatLng(getCurrentLocation());
    pickupMarker.setLatLng(activeRoute.pickup);
    dropoffMarker.setLatLng(activeRoute.dropoff);
    routeLine.setStyle(hasActiveRoute ? { opacity: 0.9, weight: 5 } : { opacity: 0, weight: 0 });
    if (hasActiveRoute) {
      routeMap.fitBounds(routeLine.getBounds(), {
        padding: [20, 20],
      });
    } else {
      routeMap.fitBounds(L.latLngBounds([activeRoute.rider, activeRoute.pickup, activeRoute.dropoff]), {
        padding: [30, 30],
      });
    }
    routeMap.invalidateSize();
  }
}

function updateMapMotion() {
  if (!routeMap || !riderMarker || state.tab !== "dashboard") {
    return;
  }

  riderMarker.setLatLng(getCurrentLocation());
}

root.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }

  const action = target.getAttribute("data-action");
  const id = target.getAttribute("data-id");

  if (action === "tab") {
    setTab(id);
  } else if (action === "accept-order") {
    acceptOrder(id);
  } else if (action === "toggle-break") {
    toggleBreak();
  } else if (action === "feedback-rate") {
    answerFeedback(Number(id));
  } else if (action === "feedback-reset") {
    resetFeedback();
  } else if (action === "buy-insurance") {
    buyInsurance(id);
  } else if (action === "cancel-order") {
    state.activeOrder = null;
    state.routeProgress = 0;
    renderCurrentTab();
    ensureRouteMap();
  }
});

startTimers();
syncBreakTimer();
render();
