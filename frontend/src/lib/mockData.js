// In-memory mock data. Shapes mirror the Suggested Data Model in the brief
// so swapping USE_MOCKS off and pointing at the real Django API is a
// drop-in change — no component code should need to change.

let db = {
  departments: [
    { id: 1, name: 'Manufacturing', code: 'MFG', head: 'Rina Kapoor', parent: null, employeeCount: 142, status: 'Active' },
    { id: 2, name: 'Logistics & Fleet', code: 'LOG', head: 'Amit Sen', parent: null, employeeCount: 58, status: 'Active' },
    { id: 3, name: 'People & Culture', code: 'PPL', head: 'Dana Ruiz', parent: null, employeeCount: 24, status: 'Active' },
    { id: 4, name: 'Finance & Procurement', code: 'FIN', head: 'Leo Marchetti', parent: null, employeeCount: 31, status: 'Active' },
    { id: 5, name: 'R&D', code: 'RND', head: 'Priya Nair', parent: null, employeeCount: 47, status: 'Active' },
  ],

  categories: [
    { id: 1, name: 'Tree Plantation', type: 'CSR Activity', status: 'Active' },
    { id: 2, name: 'Blood Donation', type: 'CSR Activity', status: 'Active' },
    { id: 3, name: 'Community Education', type: 'CSR Activity', status: 'Active' },
    { id: 4, name: 'Energy Reduction', type: 'Challenge', status: 'Active' },
    { id: 5, name: 'Waste Diversion', type: 'Challenge', status: 'Active' },
    { id: 6, name: 'Commute', type: 'Challenge', status: 'Active' },
  ],

  emissionFactors: [
    { id: 1, name: 'Grid Electricity (IN)', scope: 'Scope 2', unit: 'kWh', factor: 0.71, uom: 'kg CO2e/kWh' },
    { id: 2, name: 'Diesel (Fleet)', scope: 'Scope 1', unit: 'litre', factor: 2.68, uom: 'kg CO2e/L' },
    { id: 3, name: 'Natural Gas', scope: 'Scope 1', unit: 'm3', factor: 2.02, uom: 'kg CO2e/m3' },
    { id: 4, name: 'Air Travel (Domestic)', scope: 'Scope 3', unit: 'km', factor: 0.15, uom: 'kg CO2e/km' },
    { id: 5, name: 'Purchased Steel', scope: 'Scope 3', unit: 'kg', factor: 1.9, uom: 'kg CO2e/kg' },
  ],

  productESGProfiles: [
    { id: 1, product: 'Steel Chassis A1', category: 'Raw Material', carbonPerUnit: 42.5, recycledContentPct: 18 },
    { id: 2, product: 'Aluminium Casing B2', category: 'Raw Material', carbonPerUnit: 19.1, recycledContentPct: 34 },
    { id: 3, product: 'Packaging Film C3', category: 'Packaging', carbonPerUnit: 3.2, recycledContentPct: 60 },
  ],

  environmentalGoals: [
    { id: 1, title: 'Reduce Scope 1+2 emissions', target: 20, unit: '% reduction', deadline: '2026-12-31', progress: 47, status: 'On Track' },
    { id: 2, title: 'Zero landfill waste', target: 100, unit: '% diverted', deadline: '2027-03-31', progress: 61, status: 'On Track' },
    { id: 3, title: 'Renewable electricity share', target: 60, unit: '% of grid mix', deadline: '2026-09-30', progress: 38, status: 'At Risk' },
  ],

  esgPolicies: [
    { id: 1, title: 'Code of Conduct', category: 'Governance', version: 'v3.1', effectiveDate: '2025-01-10', mandatory: true },
    { id: 2, title: 'Anti-Bribery & Corruption', category: 'Governance', version: 'v2.0', effectiveDate: '2025-06-01', mandatory: true },
    { id: 3, title: 'Environmental Data Handling', category: 'Environmental', version: 'v1.4', effectiveDate: '2026-02-15', mandatory: true },
    { id: 4, title: 'Supplier Diversity Standard', category: 'Social', version: 'v1.0', effectiveDate: '2026-04-01', mandatory: false },
  ],

  badges: [
    { id: 1, name: 'Seedling', description: 'Complete your first challenge', unlockRule: 'completedChallenges >= 1', icon: '🌱' },
    { id: 2, name: 'Grove Builder', description: 'Earn 500 XP', unlockRule: 'xp >= 500', icon: '🌳' },
    { id: 3, name: 'Carbon Cutter', description: 'Complete 5 Energy Reduction challenges', unlockRule: 'category:EnergyReduction >= 5', icon: '⚡' },
    { id: 4, name: 'Community Pillar', description: 'Log 10 approved CSR activities', unlockRule: 'csrApproved >= 10', icon: '🤝' },
    { id: 5, name: 'Canopy', description: 'Reach 2000 XP', unlockRule: 'xp >= 2000', icon: '🌲' },
  ],

  rewards: [
    { id: 1, name: 'Reusable Bottle Kit', description: 'Bamboo-fibre bottle + pouch', pointsRequired: 150, stock: 40, status: 'Active' },
    { id: 2, name: 'Extra Day Off', description: 'One additional paid leave day', pointsRequired: 800, stock: 12, status: 'Active' },
    { id: 3, name: '₹1000 Green Voucher', description: 'Redeemable at partner eco-stores', pointsRequired: 400, stock: 25, status: 'Active' },
    { id: 4, name: 'EV Charging Credit', description: '50 kWh charging credit', pointsRequired: 600, stock: 0, status: 'Out of Stock' },
  ],

  employees: [
    { id: 1, name: 'Ananya Rao', department: 'Manufacturing', xp: 2140, points: 310 },
    { id: 2, name: 'Vikram Shah', department: 'Logistics & Fleet', xp: 1875, points: 190 },
    { id: 3, name: 'Meera Iyer', department: 'People & Culture', xp: 1640, points: 520 },
    { id: 4, name: 'Sam Okafor', department: 'R&D', xp: 1420, points: 260 },
    { id: 5, name: 'Julia Fernandes', department: 'Finance & Procurement', xp: 980, points: 140 },
    { id: 6, name: 'Devraj Patil', department: 'Manufacturing', xp: 870, points: 75 },
  ],

  carbonTransactions: [
    { id: 1, department: 'Manufacturing', source: 'Purchase', emissionFactor: 'Purchased Steel', quantity: 4200, co2e: 7980, date: '2026-07-01' },
    { id: 2, department: 'Logistics & Fleet', source: 'Fleet', emissionFactor: 'Diesel (Fleet)', quantity: 1850, co2e: 4958, date: '2026-07-03' },
    { id: 3, department: 'Manufacturing', source: 'Manufacturing', emissionFactor: 'Grid Electricity (IN)', quantity: 12500, co2e: 8875, date: '2026-07-05' },
    { id: 4, department: 'R&D', source: 'Expense', emissionFactor: 'Air Travel (Domestic)', quantity: 3200, co2e: 480, date: '2026-07-08' },
    { id: 5, department: 'Finance & Procurement', source: 'Purchase', emissionFactor: 'Purchased Steel', quantity: 600, co2e: 1140, date: '2026-07-10' },
  ],

  csrActivities: [
    { id: 1, title: 'Coastal Cleanup Drive', category: 'Tree Plantation', date: '2026-06-14', department: 'Manufacturing', participants: 34 },
    { id: 2, title: 'Blood Donation Camp', category: 'Blood Donation', date: '2026-06-28', department: 'People & Culture', participants: 51 },
    { id: 3, title: 'Digital Literacy Workshop', category: 'Community Education', date: '2026-07-05', department: 'R&D', participants: 19 },
  ],

  employeeParticipation: [
    { id: 1, employee: 'Ananya Rao', activity: 'Coastal Cleanup Drive', proof: 'photo_01.jpg', approvalStatus: 'Approved', pointsEarned: 40, completionDate: '2026-06-14' },
    { id: 2, employee: 'Meera Iyer', activity: 'Blood Donation Camp', proof: 'certificate.pdf', approvalStatus: 'Approved', pointsEarned: 60, completionDate: '2026-06-28' },
    { id: 3, employee: 'Devraj Patil', activity: 'Digital Literacy Workshop', proof: null, approvalStatus: 'Pending', pointsEarned: 0, completionDate: null },
    { id: 4, employee: 'Vikram Shah', activity: 'Coastal Cleanup Drive', proof: 'photo_02.jpg', approvalStatus: 'Under Review', pointsEarned: 0, completionDate: null },
  ],

  challenges: [
    { id: 1, title: 'Cut Desk Energy 10%', category: 'Energy Reduction', description: 'Reduce personal workstation energy use by 10% this month.', xp: 120, difficulty: 'Easy', evidenceRequired: true, deadline: '2026-07-31', status: 'Active' },
    { id: 2, title: 'Zero-Waste Week', category: 'Waste Diversion', description: 'Divert 100% of your waste from landfill for one full week.', xp: 200, difficulty: 'Medium', evidenceRequired: true, deadline: '2026-07-25', status: 'Active' },
    { id: 3, title: 'Bike to Work Month', category: 'Commute', description: 'Commute by bike or public transit at least 15 days this month.', xp: 250, difficulty: 'Hard', evidenceRequired: true, deadline: '2026-07-31', status: 'Active' },
    { id: 4, title: 'Q2 Recycling Audit', category: 'Waste Diversion', description: 'Complete department recycling audit and submit findings.', xp: 150, difficulty: 'Medium', evidenceRequired: false, deadline: '2026-06-30', status: 'Under Review' },
    { id: 5, title: 'Carbon Literacy 101', category: 'Energy Reduction', description: 'Complete the internal carbon-literacy micro-course.', xp: 80, difficulty: 'Easy', evidenceRequired: false, deadline: '2026-05-31', status: 'Completed' },
  ],

  challengeParticipation: [
    { id: 1, challenge: 'Cut Desk Energy 10%', employee: 'Ananya Rao', progress: 80, proof: 'meter_reading.jpg', approval: 'Approved', xpAwarded: 120 },
    { id: 2, challenge: 'Zero-Waste Week', employee: 'Sam Okafor', progress: 55, proof: null, approval: 'In Progress', xpAwarded: 0 },
    { id: 3, challenge: 'Bike to Work Month', employee: 'Julia Fernandes', progress: 40, proof: 'commute_log.csv', approval: 'In Progress', xpAwarded: 0 },
  ],

  policyAcknowledgements: [
    { id: 1, employee: 'Ananya Rao', policy: 'Code of Conduct', acknowledgedOn: '2026-01-20', status: 'Acknowledged' },
    { id: 2, employee: 'Vikram Shah', policy: 'Anti-Bribery & Corruption', acknowledgedOn: null, status: 'Pending' },
    { id: 3, employee: 'Meera Iyer', policy: 'Environmental Data Handling', acknowledgedOn: '2026-02-18', status: 'Acknowledged' },
    { id: 4, employee: 'Devraj Patil', policy: 'Code of Conduct', acknowledgedOn: null, status: 'Overdue' },
  ],

  audits: [
    { id: 1, title: 'Annual Governance Audit FY26', scope: 'Board & Committees', auditor: 'KPMG', date: '2026-04-10', outcome: 'Minor findings' },
    { id: 2, title: 'Supplier Compliance Review', scope: 'Procurement', auditor: 'Internal', date: '2026-06-02', outcome: 'Satisfactory' },
  ],

  complianceIssues: [
    { id: 1, audit: 'Annual Governance Audit FY26', severity: 'Medium', description: 'Delegation-of-authority matrix not updated post-reorg.', owner: 'Leo Marchetti', dueDate: '2026-07-20', status: 'Open' },
    { id: 2, audit: 'Annual Governance Audit FY26', severity: 'Low', description: 'Board meeting minutes archived 3 days late.', owner: 'Dana Ruiz', dueDate: '2026-06-30', status: 'Overdue' },
    { id: 3, audit: 'Supplier Compliance Review', severity: 'High', description: 'Tier-2 supplier missing signed code-of-conduct.', owner: 'Amit Sen', dueDate: '2026-07-18', status: 'Open' },
    { id: 4, audit: 'Supplier Compliance Review', severity: 'Low', description: 'Minor gap in procurement audit trail.', owner: 'Leo Marchetti', dueDate: '2026-06-15', status: 'Resolved' },
  ],

  departmentScores: [
    { id: 1, department: 'Manufacturing', environmental: 68, social: 74, governance: 81, total: 73 },
    { id: 2, department: 'Logistics & Fleet', environmental: 54, social: 66, governance: 77, total: 64 },
    { id: 3, department: 'People & Culture', environmental: 71, social: 91, governance: 85, total: 82 },
    { id: 4, department: 'Finance & Procurement', environmental: 62, social: 58, governance: 88, total: 68 },
    { id: 5, department: 'R&D', environmental: 76, social: 69, governance: 79, total: 74 },
  ],

  notifications: [
    { id: 1, type: 'Compliance', message: 'New compliance issue raised: Tier-2 supplier missing code-of-conduct.', date: '2026-07-14', read: false },
    { id: 2, type: 'Approval', message: 'Your Coastal Cleanup Drive participation was approved (+40 pts).', date: '2026-07-13', read: false },
    { id: 3, type: 'Policy', message: 'Reminder: acknowledge "Anti-Bribery & Corruption" policy.', date: '2026-07-12', read: true },
    { id: 4, type: 'Badge', message: 'You unlocked the "Grove Builder" badge!', date: '2026-07-10', read: true },
  ],

  diversityMetrics: [
    { id: 1, department: 'Manufacturing', womenPct: 28, genderDiversePct: 2, pwdPct: 3, underrepresentedPct: 14 },
    { id: 2, department: 'Logistics & Fleet', womenPct: 19, genderDiversePct: 1, pwdPct: 2, underrepresentedPct: 11 },
    { id: 3, department: 'People & Culture', womenPct: 61, genderDiversePct: 4, pwdPct: 5, underrepresentedPct: 22 },
    { id: 4, department: 'Finance & Procurement', womenPct: 45, genderDiversePct: 2, pwdPct: 3, underrepresentedPct: 17 },
    { id: 5, department: 'R&D', womenPct: 37, genderDiversePct: 3, pwdPct: 4, underrepresentedPct: 19 },
  ],

  trainingCompletion: [
    { id: 1, department: 'Manufacturing', course: 'Workplace Safety', completionPct: 94 },
    { id: 2, department: 'Manufacturing', course: 'Anti-Harassment', completionPct: 88 },
    { id: 3, department: 'Logistics & Fleet', course: 'Workplace Safety', completionPct: 97 },
    { id: 4, department: 'People & Culture', course: 'Anti-Harassment', completionPct: 100 },
    { id: 5, department: 'R&D', course: 'Data Ethics', completionPct: 76 },
    { id: 6, department: 'Finance & Procurement', course: 'Anti-Bribery Training', completionPct: 82 },
  ],

  esgConfig: [
    {
      id: 1,
      weights: { environmental: 40, social: 30, governance: 30 },
      autoEmissionCalculation: true,
      evidenceRequired: true,
      badgeAutoAward: true,
    },
  ],
}

export function getMock(key) {
  if (key.endsWith(':one')) {
    const base = key.replace(':one', '')
    return Promise.resolve(db[base]?.[0] ?? null)
  }
  if (key === 'dashboardOverview') {
    return Promise.resolve(buildOverview())
  }
  return Promise.resolve(db[key] ?? [])
}

export function mockCreate(key, payload) {
  const item = { id: Date.now(), ...payload }
  db[key] = [item, ...(db[key] || [])]
  return Promise.resolve(item)
}

export function mockUpdate(key, id, payload) {
  db[key] = (db[key] || []).map((item) => (item.id === id ? { ...item, ...payload } : item))
  return Promise.resolve(db[key].find((i) => i.id === id))
}

export function mockRemove(key, id) {
  db[key] = (db[key] || []).filter((item) => item.id !== id)
  return Promise.resolve({ success: true })
}

function buildOverview() {
  const scores = db.departmentScores
  const avg = (field) => Math.round(scores.reduce((a, s) => a + s[field], 0) / scores.length)
  const environmental = avg('environmental')
  const social = avg('social')
  const governance = avg('governance')
  const total = Math.round(environmental * 0.4 + social * 0.3 + governance * 0.3)

  return {
    scores: { environmental, social, governance, total },
    totalCO2e: db.carbonTransactions.reduce((a, t) => a + t.co2e, 0),
    openComplianceIssues: db.complianceIssues.filter((c) => c.status !== 'Resolved').length,
    overdueIssues: db.complianceIssues.filter((c) => c.status === 'Overdue').length,
    activeChallenges: db.challenges.filter((c) => c.status === 'Active').length,
    pendingApprovals:
      db.employeeParticipation.filter((p) => p.approvalStatus !== 'Approved').length +
      db.challengeParticipation.filter((p) => p.approval === 'In Progress').length,
    emissionsTrend: [
      { month: 'Feb', co2e: 21200 },
      { month: 'Mar', co2e: 20100 },
      { month: 'Apr', co2e: 19800 },
      { month: 'May', co2e: 18650 },
      { month: 'Jun', co2e: 17490 },
      { month: 'Jul', co2e: 16200 },
    ],
    departmentScores: scores,
  }
}
