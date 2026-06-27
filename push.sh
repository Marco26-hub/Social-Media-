#!/bin/bash

echo "🚀 Pushing to GitHub..."

git add .
git commit -m "feat: Add 6 automation agents + migrations + APIs + on-demand execution

- Agents: Lead Scraper, SEO+GEO, ADS Optimizer, Competitor Watcher, Client Report, Strategic Planner
- Migrations: 005_seo_geo.sql, 006_reports_ads_competitor.sql
- APIs: seo-audit, geo-analysis, seo-recommendations, client-reports, ads-performance, competitor-tracking
- Components: SEOAnalysisApproval, ScrapedLeadsApproval, ClientReportBoard, AdsBoard, CompetitorBoard
- Documentation: AGENTS_SCHEDULE.md, SEO_GEO_SETUP.md
- Execution: On-demand only (user clicks [Run Now] button per agent)"

git push origin main

echo "✅ Pushed to GitHub!"
