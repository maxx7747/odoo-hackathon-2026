<<<<<<< HEAD
# EcoSphere — Governance Module

A working implementation of the **Governance module** for the EcoSphere ESG Management Platform hackathon problem statement.

Covers:
- **Policies** — create/edit ESG governance policies, versioned, Draft → Active → Archived
- **Policy Acknowledgements** — assign a policy to an employee, track Pending/Acknowledged, send reminder notifications
- **Audits** — schedule and track governance audits by department
- **Compliance Issues** — every issue requires an **owner** and a **due date**; issues past their due date while still Open are automatically flagged as **Overdue**
- **Notifications** — in-app notifications for: new compliance issue raised, policy acknowledgement reminders, overdue compliance issues
- **Departments & Employees** — supporting master data used across the module

## Tech stack

- **Backend:** Node.js + Express + better-sqlite3 (file-based SQL database, zero setup — no external DB server needed)
- **Frontend:** Plain HTML/CSS/JavaScript (no framework/build step, served as static files by Express)
- No authentication — this module keeps Owner/Role as plain data fields, as scoped for the hackathon submission.

## Project structure

```
governance-module/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── db.js                  # SQLite connection + schema (auto-creates tables)
│   ├── notify.js              # Notification helper + overdue-issue scanner
│   ├── seed.js                # Optional sample data loader
│   ├── package.json
│   └── routes/
│       ├── departments.js
│       ├── employees.js
│       ├── policies.js
│       ├── acknowledgements.js
│       ├── audits.js
│       ├── complianceIssues.js
│       └── notifications.js
└── frontend/
    ├── index.html
    ├── styles.css
    └── app.js
```
=======
# odoo-hackathon-2026

# 🌍 EcoSphere – ESG Management Platform

EcoSphere is an Odoo-based ESG (Environmental, Social, and Governance) Management Platform developed during the Odoo Hackathon 2026.

## 📌 Problem Statement

Organizations need a centralized platform to monitor, manage, and improve their Environmental, Social, and Governance (ESG) performance. EcoSphere integrates sustainability metrics, employee engagement, governance compliance, and reporting into a unified Odoo application.

---

## 🚀 Features

### 🌱 Environmental
- Carbon Emission Tracking
- Emission Factors
- Sustainability Goals
- Department-wise Environmental Score

### 👥 Social
- CSR Activities
- Employee Participation
- Challenges
- Diversity & Engagement

### 🛡 Governance
- ESG Policies
- Compliance Issues
- Audits
- Policy Acknowledgements

### 🎮 Gamification
- Challenges
- XP & Rewards
- Badges
- Leaderboard

### 📊 Dashboard
- Overall ESG Score
- Environmental Score
- Social Score
- Governance Score
- Department Rankings
- KPI Cards

### 📑 Reports
- Environmental Report
- Social Report
- Governance Report
- ESG Summary Report

---

## 🛠 Tech Stack

- Odoo
- Python
- XML
- PostgreSQL
- Git & GitHub

---

## 📂 Project Structure

```
custom_addons/
└── ecosphere/
    ├── models/
    ├── views/
    ├── security/
    ├── data/
    ├── report/
    └── static/
```

---

## 👥 Team


---

## 🎯 Goal

To provide organizations with a centralized ESG management solution that simplifies sustainability tracking, governance compliance, employee engagement, and decision-making through real-time dashboards and reports.

---

## 📄 License

Developed for **Odoo Hackathon 2026**.
>>>>>>> 1d6489bb726c5b85e813bfd318772e65d7d69618
