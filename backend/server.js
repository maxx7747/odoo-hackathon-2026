const express = require('express');
const cors = require('cors');
const path = require('path');

const departmentsRoute = require('./routes/departments');
const employeesRoute = require('./routes/employees');
const policiesRoute = require('./routes/policies');
const acknowledgementsRoute = require('./routes/acknowledgements');
const auditsRoute = require('./routes/audits');
const complianceIssuesRoute = require('./routes/complianceIssues');
const notificationsRoute = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/departments', departmentsRoute);
app.use('/api/employees', employeesRoute);
app.use('/api/policies', policiesRoute);
app.use('/api/acknowledgements', acknowledgementsRoute);
app.use('/api/audits', auditsRoute);
app.use('/api/compliance-issues', complianceIssuesRoute);
app.use('/api/notifications', notificationsRoute);

app.get('/api/health', (req, res) => res.json({ status: 'ok', module: 'Governance' }));

// Serve the frontend (static files)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Fallback to index.html for any non-API route (Express 5 wildcard syntax)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Governance Module server running at http://localhost:${PORT}`);
});
