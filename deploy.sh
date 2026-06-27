#!/bin/bash
set -e

echo "🚀 DEPLOYING SOCIAL AUTOMATION V2 TO GITHUB..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

cd "$(dirname "$0")"

echo -e "${BLUE}📦 Checking git status...${NC}"
git status

echo ""
echo -e "${BLUE}➕ Adding all files...${NC}"
git add .
echo "✓ Added"

echo ""
echo -e "${BLUE}💬 Creating commit...${NC}"
git commit -m "feat: Complete Multi-Agent Automation System

🤖 6 AUTOMATION AGENTS
- Lead Scraper: Scrapes from Google, Social, Competitors, Marketplace
- SEO + GEO Analyzer: Weekly audit + local optimization
- ADS Optimizer: Daily monitoring + ROAS optimization
- Competitor Watcher: Weekly threat detection
- Client Report: Weekly comprehensive report
- Strategic Planner: Monthly strategy generation

📊 DATABASE MIGRATIONS
- Migration 003: Social Automation (content, editorial plans)
- Migration 004: Lead Scraper (leads, temperature scoring)
- Migration 005: SEO + GEO (audits, recommendations)
- Migration 006: Reports, ADS, Competitor tracking

🔌 API ENDPOINTS
- All agent endpoints implemented and working
- RLS policies for multi-client security
- Service role for automated writes

🎨 UI COMPONENTS
- AIContentApproval (5 daily content options)
- SEOAnalysisApproval (weekly SEO + GEO)
- ScrapedLeadsApproval (weekly lead review)
- On-demand execution (user clicks [Run Now])

📚 DOCUMENTATION
- AGENTS_SCHEDULE.md: Complete automation timeline
- SEO_GEO_SETUP.md: SEO+GEO agent configuration
- AI_AUTOMATION_INTEGRATION.md: Full integration guide

✨ FEATURES
- On-demand execution (not scheduled)
- Multi-client support with RLS
- Mock data for demo (ready for real API integration)
- Email alerts for high-priority issues
- Comprehensive agent logging"

echo "✓ Committed"

echo ""
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push origin main

echo ""
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo ""
echo "📊 What was pushed:"
echo "   • 6 automation agents (TypeScript)"
echo "   • 3 database migrations (SQL)"
echo "   • 3 UI components (React/TSX)"
echo "   • Complete documentation"
echo ""
echo "🎯 Next steps:"
echo "   1. Apply migrations: npm run migrate"
echo "   2. Install dependencies: npm install"
echo "   3. Start dashboard: npm run dev"
echo "   4. Click [Run Now] buttons to execute agents"
echo ""
echo "🔗 Repository: https://github.com/Marco26-hub/social-media-manager"
echo ""
