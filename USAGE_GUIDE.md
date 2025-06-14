# Strategic Intelligence MCP Server - Usage Guide

This is a standalone MCP server that provides strategic intelligence capabilities for any software project.

## Quick Start

### 1. Installation

#### NPM Package (Recommended)
```bash
npm install strategic-intelligence-mcp
```

#### From Source
```bash
git clone https://github.com/wespiper/strategic-intelligence-mcp.git
cd strategic-intelligence-mcp
npm install
npm run build
```

### 2. Claude Desktop Configuration

#### For NPM Package Installation

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "strategic-intelligence": {
      "command": "strategic-intelligence-mcp"
    }
  }
}
```

#### For Source Installation

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "strategic-intelligence": {
      "command": "node",
      "args": ["./dist/index.js"],
      "cwd": "/path/to/strategic-intelligence-mcp"
    }
  }
}
```

Replace `/path/to/strategic-intelligence-mcp` with the actual path to this directory.

### 3. Initialize Your Project

**IMPORTANT**: Start by initializing the strategic intelligence system with your project context. This makes all subsequent tools much more effective.

#### Option A: Quick Setup Wizard
```javascript
quick_setup_wizard({"wizardStep": "start"})
```

#### Option B: Manual Initialization
```javascript
initialize_project_context({
  "projectName": "Your Project Name",
  "projectDescription": "Brief description of your project",
  "industry": "saas", // or fintech, ecommerce, gaming, etc.
  "businessModel": "b2b", // or b2c, subscription, enterprise, etc.
  "stage": "growth", // or mvp, early-stage, scaling, etc.
  "keyMetrics": ["Monthly Recurring Revenue", "Customer Acquisition Cost"],
  "strategicPriorities": ["Improve API performance", "Launch mobile app", "Expand to enterprise"]
})
```

#### Option C: Import from Existing Documents
```javascript
import_context_from_document({
  "documentContent": "... paste your README, business plan, or strategy doc here ...",
  "documentType": "readme", // or business-plan, strategy-doc, etc.
  "extractionFocus": ["business-goals", "technical-milestones"],
  "createInitialGoals": true,
  "createInitialMilestones": true
})
```

### 4. Start Using Tools

Once initialized, you can use the 60+ strategic intelligence tools in Claude:

- **Project Setup**: `initialize_project_context`, `import_context_from_document`, `quick_setup_wizard`
- **Strategic Conversations**: `start_strategy_session`, `capture_strategic_insight`
- **Business Goals**: `create_business_goal`, `update_goal_progress`
- **Technical Milestones**: `create_technical_milestone`, `analyze_development_business_alignment`
- **Analytics & Forecasting**: `run_comprehensive_analysis`, `generate_scenario_forecast`
- **Critical Analysis**: `run_critical_analysis`, `generate_skeptical_report` (The "Skeptical Board Member")
- **Reporting**: `generate_strategic_report`, `export_report_data`

## Key Features

- **🚀 Easy Project Setup** - Initialize with business plans, README files, or interactive wizard
- **🎯 60+ Strategic Tools** for systematic business intelligence
- **📊 Smart Document Import** - Extract goals and milestones from existing documentation
- **🏗️ Project-Neutral** - works with any software development project (SaaS, fintech, ecommerce, etc.)
- **📈 Comprehensive Analytics** - patterns, trends, forecasting, and insights
- **🤝 Collaborative Planning** - team-based strategic sessions
- **📋 Executive Reporting** - multiple formats (Markdown, HTML, PDF)
- **💾 JSON Storage** with PostgreSQL-ready schema design

## Example Usage

```javascript
// Start a strategic conversation
start_strategy_session({
  "type": "technical-milestone-review",
  "title": "API Performance Optimization Review",
  "context": {
    "technicalMilestone": "Completed API response time optimization",
    "urgency": "medium"
  }
})

// Create a business goal
create_business_goal({
  "category": "technical",
  "title": "Improve API Response Times",
  "description": "Reduce average API response time to under 100ms",
  "owner": "Engineering Team",
  "initialMetrics": [{
    "name": "API Response Time",
    "type": "efficiency",
    "target": 100,
    "unit": "milliseconds",
    "timeframe": "90-days"
  }]
})

// Get tough-love analysis (The "Skeptical Board Member")
generate_skeptical_report({
  "focusAreas": ["strategic", "execution", "market"],
  "includeHardTruths": true,
  "analysisDepth": "deep"
})
```

## Critical Analysis - The "Skeptical Board Member"

The strategic intelligence server includes critical analysis tools that act like a skeptical board member - providing objective, tough-love analysis to identify blind spots and weaknesses:

### Key Features
- **Objective Weakness Detection**: Identifies strategic, execution, market, financial, technical, and organizational weaknesses
- **Blind Spot Analysis**: Finds areas the team isn't discussing or considering
- **Hard Truths**: Uncomfortable realities that teams often avoid discussing
- **Mitigation Strategies**: Specific, actionable strategies to address identified issues
- **Reality Check**: Contrasts optimistic analysis with critical assessment

### When to Use
- Before major strategic decisions
- When things seem "too good to be true"
- During quarterly reviews
- When progress has stalled
- Before investor or board presentations

### Example Critical Analysis

```javascript
// Run focused critical analysis
run_critical_analysis({
  "analysisDepth": "deep",
  "focusAreas": ["execution", "market"],
  "includeHardTruths": true,
  "includeMitigationStrategies": true
})

// Generate comprehensive skeptical report
generate_skeptical_report({
  "focusAreas": ["strategic", "financial", "organizational"],
  "includeHardTruths": true,
  "analysisDepth": "standard"
})
```

## Core Workflows

### Strategic Planning Session
1. Create collaboration sessions for team planning
2. Capture strategic insights and decisions
3. Track action items with owners and deadlines
4. Generate comprehensive session reports

### Business Goal Tracking
1. Define measurable business objectives
2. Set up metrics and success criteria
3. Track progress with confidence levels
4. Generate goal health reports

### Technical Milestone Management
1. Record technical achievements with business context
2. Analyze development-business alignment
3. Generate business impact forecasts
4. Identify strategic opportunities

### Strategic Reporting
1. Generate executive summaries
2. Create board presentations
3. Export data in multiple formats
4. Schedule automated reports

## Development

```bash
npm run dev     # Watch mode for development
npm run lint    # ESLint checking
npm test       # Run tests (when available)
```

## Integration with Development Workflow

The MCP server can integrate with existing development practices:

1. **Extract insights** from `.claude/insights` and `.claude/reflections` files
2. **Link technical work** to strategic implications
3. **Generate business context** for development decisions
4. **Create strategic conversations** based on accumulated learnings

## Strategic Questions This Answers

- "What's our competitive position in the market?"
- "Which technical milestones drive the most business value?"
- "What are our revenue projections with confidence intervals?"
- "Where are the gaps between our strategy and execution?"
- "How do our development priorities align with business goals?"
- "Which opportunities have the highest ROI potential?"

## License

MIT License - Open source strategic intelligence for any development project.