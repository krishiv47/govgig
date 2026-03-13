const http = require("http");

const PORT = process.env.PORT || 4000;

const workers = [
  {
    id: "worker-001",
    name: "Arjun Singh",
    status: "REGISTERED",
    anonymous_rating: 4.6,
    working_hours_today: 6.2,
    insurance_opt_in: true,
  },
];

const companyRequests = [
  {
    id: "ORD-4821",
    company: "Spice Garden Logistics",
    role: "Food Delivery",
    area: "Sector 14, Gurugram",
    payout: 85,
  },
  {
    id: "ORD-4822",
    company: "PizzaStop Fleet",
    role: "Express Dispatch",
    area: "DLF Phase 2",
    payout: 65,
  },
];

const insurancePlans = [
  {
    id: "care-basic",
    provider: "CareSure Health",
    plan: "Gig Shield Basic",
    cover: "₹3 lakh",
    premium: "₹149/month",
  },
  {
    id: "safe-family",
    provider: "SafeLife Insurance",
    plan: "Worker Family Plus",
    cover: "₹5 lakh",
    premium: "₹249/month",
  },
];

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(payload, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.url === "/health") {
    json(res, 200, { ok: true, service: "govgig-portal-backend" });
    return;
  }

  if (req.url === "/api/workers") {
    json(res, 200, workers);
    return;
  }

  if (req.url === "/api/company-requests") {
    json(res, 200, companyRequests);
    return;
  }

  if (req.url === "/api/insurance-plans") {
    json(res, 200, insurancePlans);
    return;
  }

  json(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`GovGig mock backend running on http://localhost:${PORT}`);
});
