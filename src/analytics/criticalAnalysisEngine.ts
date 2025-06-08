import { StorageAdapter } from '../storage/StorageAdapter.js';
import { 
  BusinessGoal, 
  StrategyConversation, 
  ProgressSnapshot,
  GoalMetric 
} from '../types/index.js';

// Simple interface for technical milestones (to be properly defined later)
interface TechnicalMilestone {
  id: string;
  name: string;
  description: string;
  plannedDate: string;
  category: string;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  completionPercentage?: number;
  status: string;
}

export interface CriticalAnalysisReport {
  summary: {
    overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    criticalIssueCount: number;
    mitigationPriority: string[];
  };
  weaknesses: CriticalWeakness[];
  blindSpots: BlindSpot[];
  mitigationStrategies: MitigationStrategy[];
  hardTruths: HardTruth[];
  recommendations: CriticalRecommendation[];
}

export interface CriticalWeakness {
  id: string;
  category: 'strategic' | 'execution' | 'market' | 'financial' | 'technical' | 'organizational';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  title: string;
  description: string;
  evidence: string[];
  potentialImpact: string;
  riskScore: number; // 0-100
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
}

export interface BlindSpot {
  id: string;
  area: string;
  description: string;
  whyMissed: string;
  potentialConsequences: string[];
  detectionMethods: string[];
}

export interface MitigationStrategy {
  id: string;
  targetWeaknesses: string[];
  strategy: string;
  implementation: {
    steps: string[];
    timeframe: string;
    resources: string[];
    owner: string;
    successMetrics: string[];
  };
  riskReduction: number; // 0-100
  cost: 'low' | 'medium' | 'high';
  feasibility: 'low' | 'medium' | 'high';
}

export interface HardTruth {
  id: string;
  category: 'market-reality' | 'competitive-position' | 'execution-gaps' | 'resource-constraints' | 'timeline-reality';
  truth: string;
  evidence: string[];
  implications: string[];
  whatMostDont: string; // What most teams don't want to hear about this
}

export interface CriticalRecommendation {
  id: string;
  priority: 'immediate' | 'urgent' | 'important' | 'consider';
  action: string;
  rationale: string;
  consequences: string; // What happens if we don't do this
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export class CriticalAnalysisEngine {
  constructor(private storage: StorageAdapter) {}

  async runCriticalAnalysis(options: {
    analysisDepth?: 'surface' | 'standard' | 'deep';
    focusAreas?: string[];
    includeHardTruths?: boolean;
    includeMitigationStrategies?: boolean;
  } = {}): Promise<CriticalAnalysisReport> {
    const {
      analysisDepth = 'standard',
      focusAreas = [],
      includeHardTruths = true,
      includeMitigationStrategies = true
    } = options;

    const data = await this.storage.load();
    
    const weaknesses = await this.identifyWeaknesses(data, analysisDepth, focusAreas);
    const blindSpots = await this.identifyBlindSpots(data, analysisDepth);
    const hardTruths = includeHardTruths ? await this.generateHardTruths(data, weaknesses) : [];
    const mitigationStrategies = includeMitigationStrategies ? 
      await this.generateMitigationStrategies(weaknesses, data) : [];
    const recommendations = await this.generateCriticalRecommendations(weaknesses, blindSpots, data);

    const criticalIssues = weaknesses.filter(w => w.severity === 'critical' || w.severity === 'major');
    const overallRiskLevel = this.calculateOverallRisk(weaknesses);

    return {
      summary: {
        overallRiskLevel,
        criticalIssueCount: criticalIssues.length,
        mitigationPriority: mitigationStrategies
          .sort((a, b) => b.riskReduction - a.riskReduction)
          .slice(0, 3)
          .map(s => s.strategy)
      },
      weaknesses,
      blindSpots,
      mitigationStrategies,
      hardTruths,
      recommendations
    };
  }

  private async identifyWeaknesses(data: any, depth: string, focusAreas: string[]): Promise<CriticalWeakness[]> {
    const weaknesses: CriticalWeakness[] = [];

    // Strategic Weaknesses
    if (focusAreas.length === 0 || focusAreas.includes('strategic')) {
      weaknesses.push(...await this.analyzeStrategicWeaknesses(data));
    }

    // Execution Weaknesses
    if (focusAreas.length === 0 || focusAreas.includes('execution')) {
      weaknesses.push(...await this.analyzeExecutionWeaknesses(data));
    }

    // Market Weaknesses
    if (focusAreas.length === 0 || focusAreas.includes('market')) {
      weaknesses.push(...await this.analyzeMarketWeaknesses(data));
    }

    // Financial Weaknesses
    if (focusAreas.length === 0 || focusAreas.includes('financial')) {
      weaknesses.push(...await this.analyzeFinancialWeaknesses(data));
    }

    // Technical Weaknesses
    if (focusAreas.length === 0 || focusAreas.includes('technical')) {
      weaknesses.push(...await this.analyzeTechnicalWeaknesses(data));
    }

    // Organizational Weaknesses
    if (focusAreas.length === 0 || focusAreas.includes('organizational')) {
      weaknesses.push(...await this.analyzeOrganizationalWeaknesses(data));
    }

    return weaknesses.sort((a, b) => b.riskScore - a.riskScore);
  }

  private async analyzeStrategicWeaknesses(data: any): Promise<CriticalWeakness[]> {
    const weaknesses: CriticalWeakness[] = [];
    const goals = data.businessGoals || [];
    const conversations = data.strategyConversations || [];

    // Lack of clear differentiation
    const competitiveInsights = conversations
      .flatMap((c: StrategyConversation) => c.insights || [])
      .filter((i: any) => i.category === 'competitive-advantage');
    
    if (competitiveInsights.length === 0) {
      weaknesses.push({
        id: 'sw-001',
        category: 'strategic',
        severity: 'major',
        title: 'No Clear Competitive Differentiation',
        description: 'Analysis shows no documented competitive advantages or differentiation strategy.',
        evidence: ['Zero competitive advantage insights captured', 'No unique value proposition documented'],
        potentialImpact: 'Risk of being commoditized and losing market share to competitors',
        riskScore: 85,
        timeframe: 'medium-term'
      });
    }

    // Unclear or conflicting goals
    const conflictingGoals = this.findConflictingGoals(goals);
    if (conflictingGoals.length > 0) {
      weaknesses.push({
        id: 'sw-002',
        category: 'strategic',
        severity: 'moderate',
        title: 'Conflicting Strategic Goals',
        description: 'Multiple goals compete for same resources or pull in different directions.',
        evidence: conflictingGoals.map(c => `${c.goal1} conflicts with ${c.goal2}`),
        potentialImpact: 'Resource dilution, team confusion, and reduced execution effectiveness',
        riskScore: 70,
        timeframe: 'short-term'
      });
    }

    // Overambitious timelines
    const overambitiousGoals = goals.filter((g: BusinessGoal) => {
      return this.isTimelineOverambitious(g);
    });

    if (overambitiousGoals.length > 0) {
      weaknesses.push({
        id: 'sw-003',
        category: 'strategic',
        severity: 'moderate',
        title: 'Unrealistic Timeline Expectations',
        description: 'Multiple goals have timelines that appear overly optimistic given current progress.',
        evidence: overambitiousGoals.map((g: BusinessGoal) => `${g.title} - ambitious timeline given current velocity`),
        potentialImpact: 'Team burnout, missed deadlines, stakeholder confidence loss',
        riskScore: 75,
        timeframe: 'short-term'
      });
    }

    return weaknesses;
  }

  private async analyzeExecutionWeaknesses(data: any): Promise<CriticalWeakness[]> {
    const weaknesses: CriticalWeakness[] = [];
    const goals = data.businessGoals || [];
    const milestones = data.technicalMilestones || [];

    // Low confidence trends
    const lowConfidenceGoals = goals.filter((g: BusinessGoal) => {
      const latestProgress = g.progressHistory?.[g.progressHistory.length - 1];
      return latestProgress?.confidence && latestProgress.confidence < 60;
    });

    if (lowConfidenceGoals.length >= goals.length * 0.4) {
      weaknesses.push({
        id: 'ex-001',
        category: 'execution',
        severity: 'major',
        title: 'Widespread Low Execution Confidence',
        description: 'Over 40% of goals show low confidence levels, indicating systemic execution challenges.',
        evidence: lowConfidenceGoals.map((g: BusinessGoal) => `${g.title} - low confidence trend`),
        potentialImpact: 'High probability of missing strategic objectives and stakeholder commitments',
        riskScore: 80,
        timeframe: 'immediate'
      });
    }

    // Milestone completion delays
    const delayedMilestones = milestones.filter((m: TechnicalMilestone) => {
      return this.isMilestoneDelayed(m);
    });

    if (delayedMilestones.length > 0) {
      weaknesses.push({
        id: 'ex-002',
        category: 'execution',
        severity: 'moderate',
        title: 'Technical Milestone Delays',
        description: 'Key technical milestones are behind schedule, risking downstream business goals.',
        evidence: delayedMilestones.map((m: TechnicalMilestone) => `${m.name} - behind schedule`),
        potentialImpact: 'Cascading delays to business milestones and market opportunities',
        riskScore: 70,
        timeframe: 'short-term'
      });
    }

    return weaknesses;
  }

  private async analyzeMarketWeaknesses(data: any): Promise<CriticalWeakness[]> {
    const weaknesses: CriticalWeakness[] = [];
    const conversations = data.strategyConversations || [];

    // Lack of market validation
    const marketAnalysis = conversations.filter((c: StrategyConversation) => c.type === 'market-analysis');
    if (marketAnalysis.length === 0) {
      weaknesses.push({
        id: 'mw-001',
        category: 'market',
        severity: 'major',
        title: 'No Market Validation Evidence',
        description: 'No documented market analysis or validation conversations found.',
        evidence: ['Zero market analysis conversations', 'No customer validation documented'],
        potentialImpact: 'Building products/features without market demand, wasted resources',
        riskScore: 85,
        timeframe: 'medium-term'
      });
    }

    // Outdated competitive analysis
    const competitiveConversations = conversations.filter((c: StrategyConversation) => 
      c.type === 'competitive-strategy' && 
      new Date(c.timestamp) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
    );

    if (competitiveConversations.length === 0) {
      weaknesses.push({
        id: 'mw-002',
        category: 'market',
        severity: 'moderate',
        title: 'Stale Competitive Intelligence',
        description: 'No recent competitive strategy discussions in the last 90 days.',
        evidence: ['No competitive analysis in 90+ days', 'Potential blindness to market shifts'],
        potentialImpact: 'Surprised by competitor moves, missed market opportunities',
        riskScore: 65,
        timeframe: 'medium-term'
      });
    }

    return weaknesses;
  }

  private async analyzeFinancialWeaknesses(data: any): Promise<CriticalWeakness[]> {
    const weaknesses: CriticalWeakness[] = [];
    const goals = data.businessGoals || [];

    // Revenue goal concentration risk
    const revenueGoals = goals.filter((g: BusinessGoal) => g.category === 'revenue');
    const totalRevenueDependencies = revenueGoals.flatMap((g: BusinessGoal) => 
      g.dependencies?.technicalFeatures || []
    );

    if (revenueGoals.length > 0 && totalRevenueDependencies.length < 3) {
      weaknesses.push({
        id: 'fw-001',
        category: 'financial',
        severity: 'major',
        title: 'Revenue Concentration Risk',
        description: 'Revenue goals depend on too few technical capabilities, creating single points of failure.',
        evidence: [`Only ${totalRevenueDependencies.length} technical dependencies for all revenue goals`],
        potentialImpact: 'Revenue vulnerability if key technical capabilities fail or delay',
        riskScore: 75,
        timeframe: 'medium-term'
      });
    }

    // Lack of financial metrics
    const financialMetrics = goals.flatMap((g: BusinessGoal) => 
      g.metrics?.filter((m: GoalMetric) => m.type === 'revenue') || []
    );

    if (goals.length > 0 && financialMetrics.length === 0) {
      weaknesses.push({
        id: 'fw-002',
        category: 'financial',
        severity: 'moderate',
        title: 'No Financial Performance Tracking',
        description: 'No revenue or financial metrics defined across any business goals.',
        evidence: ['Zero financial metrics tracked', 'No revenue measurement framework'],
        potentialImpact: 'Flying blind on business performance, unable to course-correct',
        riskScore: 70,
        timeframe: 'immediate'
      });
    }

    return weaknesses;
  }

  private async analyzeTechnicalWeaknesses(data: any): Promise<CriticalWeakness[]> {
    const weaknesses: CriticalWeakness[] = [];
    const milestones = data.technicalMilestones || [];
    const goals = data.businessGoals || [];

    // Technical debt accumulation
    const complexMilestones = milestones.filter((m: TechnicalMilestone) => m.complexity === 'high' || m.complexity === 'critical');
    if (complexMilestones.length >= milestones.length * 0.6) {
      weaknesses.push({
        id: 'tw-001',
        category: 'technical',
        severity: 'moderate',
        title: 'High Technical Complexity Burden',
        description: 'Over 60% of milestones are high/critical complexity, indicating potential technical debt.',
        evidence: [`${complexMilestones.length}/${milestones.length} milestones are high complexity`],
        potentialImpact: 'Slower development velocity, increased bug risk, maintenance overhead',
        riskScore: 65,
        timeframe: 'medium-term'
      });
    }

    // Lack of performance focus
    const performanceMilestones = milestones.filter((m: TechnicalMilestone) => m.category === 'performance');
    if (performanceMilestones.length === 0 && milestones.length > 0) {
      weaknesses.push({
        id: 'tw-002',
        category: 'technical',
        severity: 'moderate',
        title: 'No Performance Optimization Focus',
        description: 'No technical milestones dedicated to performance improvements.',
        evidence: ['Zero performance-focused milestones', 'Potential scalability blindness'],
        potentialImpact: 'Performance issues at scale, poor user experience, technical crises',
        riskScore: 60,
        timeframe: 'long-term'
      });
    }

    return weaknesses;
  }

  private async analyzeOrganizationalWeaknesses(data: any): Promise<CriticalWeakness[]> {
    const weaknesses: CriticalWeakness[] = [];
    const goals = data.businessGoals || [];
    const collaborationSessions = data.collaborationSessions || [];

    // Single points of failure in ownership
    const ownershipMap = new Map<string, number>();
    goals.forEach((g: BusinessGoal) => {
      const owner = g.owner;
      ownershipMap.set(owner, (ownershipMap.get(owner) || 0) + 1);
    });

    const overloadedOwners = Array.from(ownershipMap.entries())
      .filter(([_, count]) => count >= 3);

    if (overloadedOwners.length > 0) {
      weaknesses.push({
        id: 'ow-001',
        category: 'organizational',
        severity: 'moderate',
        title: 'Goal Ownership Concentration',
        description: 'Too many critical goals owned by single individuals, creating bottlenecks.',
        evidence: overloadedOwners.map(([owner, count]) => `${owner} owns ${count} goals`),
        potentialImpact: 'Single points of failure, burnout risk, execution bottlenecks',
        riskScore: 70,
        timeframe: 'short-term'
      });
    }

    // Lack of collaboration
    if (collaborationSessions.length === 0 && goals.length > 3) {
      weaknesses.push({
        id: 'ow-002',
        category: 'organizational',
        severity: 'moderate',
        title: 'No Strategic Collaboration',
        description: 'No documented collaboration sessions despite multiple complex goals.',
        evidence: ['Zero collaboration sessions', 'Complex goals likely need team coordination'],
        potentialImpact: 'Misalignment, duplicated efforts, missed synergies',
        riskScore: 60,
        timeframe: 'short-term'
      });
    }

    return weaknesses;
  }

  private async identifyBlindSpots(data: any, depth: string): Promise<BlindSpot[]> {
    const blindSpots: BlindSpot[] = [];
    const goals = data.businessGoals || [];
    const conversations = data.strategyConversations || [];

    // Customer voice blindspot
    const customerFocusedInsights = conversations
      .flatMap((c: StrategyConversation) => c.insights || [])
      .filter((i: any) => i.content.toLowerCase().includes('customer') || i.content.toLowerCase().includes('user'));

    if (customerFocusedInsights.length === 0) {
      blindSpots.push({
        id: 'bs-001',
        area: 'Customer Voice',
        description: 'No insights capture customer feedback, needs, or behavior patterns.',
        whyMissed: 'Team may be too internally focused on features rather than customer outcomes',
        potentialConsequences: [
          'Building features customers don\'t want',
          'Missing critical user experience issues',
          'Losing touch with market needs'
        ],
        detectionMethods: [
          'Regular customer interviews',
          'User behavior analytics',
          'Customer satisfaction surveys',
          'Support ticket analysis'
        ]
      });
    }

    // Resource constraint blindspot
    const resourceConstraintMentions = conversations
      .flatMap((c: StrategyConversation) => c.insights || [])
      .filter((i: any) => i.content.toLowerCase().includes('resource') || 
                   i.content.toLowerCase().includes('capacity') ||
                   i.content.toLowerCase().includes('bandwidth'));

    if (resourceConstraintMentions.length === 0 && goals.length > 2) {
      blindSpots.push({
        id: 'bs-002',
        area: 'Resource Reality',
        description: 'No discussion of resource constraints despite multiple ambitious goals.',
        whyMissed: 'Optimism bias and focus on what we want to achieve vs. capacity reality',
        potentialConsequences: [
          'Overcommitment and underdelivery',
          'Team burnout and quality issues',
          'Missed deadlines and stakeholder disappointment'
        ],
        detectionMethods: [
          'Capacity planning exercises',
          'Resource allocation reviews',
          'Team workload assessments',
          'Velocity tracking'
        ]
      });
    }

    // Risk discussion blindspot
    const riskDiscussions = conversations
      .flatMap((c: StrategyConversation) => c.insights || [])
      .filter((i: any) => i.category === 'risk-mitigation');

    if (riskDiscussions.length === 0) {
      blindSpots.push({
        id: 'bs-003',
        area: 'Risk Assessment',
        description: 'No strategic conversations include risk mitigation insights.',
        whyMissed: 'Focus on opportunities and positive outcomes, avoiding uncomfortable risk discussions',
        potentialConsequences: [
          'Unprepared for setbacks',
          'No contingency plans',
          'Crisis-driven decision making'
        ],
        detectionMethods: [
          'Regular risk assessment sessions',
          'Pre-mortem exercises',
          'Scenario planning',
          'Assumption testing'
        ]
      });
    }

    return blindSpots;
  }

  private async generateHardTruths(data: any, weaknesses: CriticalWeakness[]): Promise<HardTruth[]> {
    const hardTruths: HardTruth[] = [];
    const goals = data.businessGoals || [];
    const milestones = data.technicalMilestones || [];

    // Resource allocation truth
    if (goals.length > 3 && weaknesses.some(w => w.id === 'bs-002')) {
      hardTruths.push({
        id: 'ht-001',
        category: 'resource-constraints',
        truth: 'You probably can\'t do all these goals well simultaneously with current resources.',
        evidence: [
          `${goals.length} active goals requiring focused attention`,
          'No resource constraint discussions documented',
          'Multiple high-priority initiatives competing for same people'
        ],
        implications: [
          'Something will be done poorly or not at all',
          'Team will be spread too thin to execute excellently',
          'Quality will suffer across all initiatives'
        ],
        whatMostDont: 'Most teams don\'t want to hear that they need to choose fewer things to do well, rather than many things poorly.'
      });
    }

    // Timeline reality truth
    if (weaknesses.some(w => w.id === 'sw-003')) {
      hardTruths.push({
        id: 'ht-002',
        category: 'timeline-reality',
        truth: 'Your timelines are probably too aggressive for the scope of work involved.',
        evidence: [
          'Multiple goals flagged with unrealistic timelines',
          'No buffer time built into milestone planning',
          'Historical velocity not factored into estimates'
        ],
        implications: [
          'You\'ll miss deadlines and disappoint stakeholders',
          'Team morale will suffer from constant "failure"',
          'Quality shortcuts will accumulate as technical debt'
        ],
        whatMostDont: 'Most teams don\'t want to add buffer time because it feels like "admitting defeat" or "being lazy", but professionals plan for reality.'
      });
    }

    // Market position truth
    if (weaknesses.some(w => w.id === 'sw-001')) {
      hardTruths.push({
        id: 'ht-003',
        category: 'competitive-position',
        truth: 'Without clear differentiation, you\'re building a commodity that will compete only on price.',
        evidence: [
          'No documented competitive advantages',
          'No unique value proposition captured',
          'Feature-focused rather than outcome-focused strategy'
        ],
        implications: [
          'Race to the bottom on pricing',
          'Vulnerable to well-funded competitors',
          'Difficult to build customer loyalty'
        ],
        whatMostDont: 'Most teams don\'t want to hear that their "great features" aren\'t automatically competitive advantages.'
      });
    }

    return hardTruths;
  }

  private async generateMitigationStrategies(weaknesses: CriticalWeakness[], data: any): Promise<MitigationStrategy[]> {
    const strategies: MitigationStrategy[] = [];

    // Strategy for competitive differentiation weakness
    const competitiveWeakness = weaknesses.find(w => w.id === 'sw-001');
    if (competitiveWeakness) {
      strategies.push({
        id: 'ms-001',
        targetWeaknesses: ['sw-001'],
        strategy: 'Develop and Document Competitive Differentiation Strategy',
        implementation: {
          steps: [
            'Conduct customer interviews to identify unique value props',
            'Analyze competitor weaknesses and market gaps',
            'Define 2-3 core differentiators that are hard to replicate',
            'Document competitive positioning and messaging',
            'Train team on competitive advantages'
          ],
          timeframe: '6-8 weeks',
          resources: ['Product Manager', 'Marketing Lead', 'Customer Success'],
          owner: 'Head of Product',
          successMetrics: [
            'Clear competitive positioning document',
            'Team can articulate differentiation in 30 seconds',
            'Customer feedback validates unique value'
          ]
        },
        riskReduction: 80,
        cost: 'medium',
        feasibility: 'high'
      });
    }

    // Strategy for resource overcommitment
    const resourceWeakness = weaknesses.find(w => w.id === 'ow-001' || w.category === 'execution');
    if (resourceWeakness) {
      strategies.push({
        id: 'ms-002',
        targetWeaknesses: [resourceWeakness.id],
        strategy: 'Implement Ruthless Prioritization and Resource Allocation',
        implementation: {
          steps: [
            'List all goals and rank by business impact',
            'Calculate actual team capacity (80% of theoretical)',
            'Select 2-3 goals that fit within capacity',
            'Put remaining goals in "later" backlog',
            'Establish goal ownership distribution rules'
          ],
          timeframe: '2-3 weeks',
          resources: ['Leadership Team', 'Goal Owners'],
          owner: 'CEO/CPO',
          successMetrics: [
            'No individual owns more than 2 critical goals',
            'Team reports manageable workload',
            'Progress velocity increases on selected goals'
          ]
        },
        riskReduction: 75,
        cost: 'low',
        feasibility: 'medium'
      });
    }

    // Strategy for market validation weakness
    const marketWeakness = weaknesses.find(w => w.id === 'mw-001');
    if (marketWeakness) {
      strategies.push({
        id: 'ms-003',
        targetWeaknesses: ['mw-001'],
        strategy: 'Establish Continuous Market Validation Process',
        implementation: {
          steps: [
            'Set up monthly customer interview program',
            'Create market research dashboard',
            'Implement customer feedback loops in product',
            'Schedule quarterly competitive analysis',
            'Document market insights in strategic conversations'
          ],
          timeframe: '4-6 weeks',
          resources: ['Product Manager', 'Customer Success', 'Marketing'],
          owner: 'Head of Product',
          successMetrics: [
            '10+ customer interviews per month',
            'Market insights captured in strategic sessions',
            'Product decisions backed by customer data'
          ]
        },
        riskReduction: 85,
        cost: 'medium',
        feasibility: 'high'
      });
    }

    return strategies.sort((a, b) => b.riskReduction - a.riskReduction);
  }

  private async generateCriticalRecommendations(
    weaknesses: CriticalWeakness[], 
    blindSpots: BlindSpot[], 
    data: any
  ): Promise<CriticalRecommendation[]> {
    const recommendations: CriticalRecommendation[] = [];

    // Immediate actions for critical weaknesses
    const criticalWeaknesses = weaknesses.filter(w => w.severity === 'critical');
    if (criticalWeaknesses.length > 0) {
      recommendations.push({
        id: 'cr-001',
        priority: 'immediate',
        action: 'Address all critical weaknesses within 2 weeks',
        rationale: 'Critical weaknesses pose immediate threat to business success',
        consequences: 'Risk of business failure or major setbacks if not addressed quickly',
        effort: 'high',
        impact: 'high'
      });
    }

    // Goal reduction recommendation
    const goals = data.businessGoals || [];
    if (goals.length > 4) {
      recommendations.push({
        id: 'cr-002',
        priority: 'urgent',
        action: `Reduce active goals from ${goals.length} to 2-3 highest impact goals`,
        rationale: 'Too many concurrent goals leads to execution fragmentation and poor results',
        consequences: 'All goals will be executed poorly, team burnout, missed deadlines',
        effort: 'low',
        impact: 'high'
      });
    }

    // Risk assessment recommendation
    if (blindSpots.some(bs => bs.id === 'bs-003')) {
      recommendations.push({
        id: 'cr-003',
        priority: 'urgent',
        action: 'Conduct formal risk assessment for all major initiatives',
        rationale: 'No risk discussions documented, leaving team unprepared for setbacks',
        consequences: 'Surprised by preventable failures, no contingency plans, crisis management',
        effort: 'medium',
        impact: 'high'
      });
    }

    // Customer validation recommendation
    if (blindSpots.some(bs => bs.id === 'bs-001')) {
      recommendations.push({
        id: 'cr-004',
        priority: 'important',
        action: 'Establish regular customer feedback collection and analysis',
        rationale: 'No customer voice in strategic planning leads to building wrong things',
        consequences: 'Product-market fit issues, wasted development effort, competitor advantage',
        effort: 'medium',
        impact: 'high'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { immediate: 4, urgent: 3, important: 2, consider: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Helper methods
  private findConflictingGoals(goals: BusinessGoal[]): Array<{goal1: string, goal2: string}> {
    // Simplified conflict detection - in real implementation, this would be more sophisticated
    const conflicts: Array<{goal1: string, goal2: string}> = [];
    
    for (let i = 0; i < goals.length; i++) {
      for (let j = i + 1; j < goals.length; j++) {
        const goal1 = goals[i];
        const goal2 = goals[j];
        
        // Check for resource conflicts (same owner, overlapping dependencies)
        if (goal1.owner === goal2.owner && 
            goal1.dependencies?.technicalFeatures?.some(tf => 
              goal2.dependencies?.technicalFeatures?.includes(tf)
            )) {
          conflicts.push({ goal1: goal1.title, goal2: goal2.title });
        }
      }
    }
    
    return conflicts;
  }

  private isTimelineOverambitious(goal: BusinessGoal): boolean {
    // Simple heuristic - real implementation would be more sophisticated
    const milestoneCount = goal.milestones?.length || 0;
    const dependencyCount = (goal.dependencies?.technicalFeatures?.length || 0) + 
                           (goal.dependencies?.businessPrerequisites?.length || 0);
    
    // If many dependencies/milestones, likely needs more time
    return milestoneCount > 3 && dependencyCount > 4;
  }

  private isMilestoneDelayed(milestone: TechnicalMilestone): boolean {
    const planned = new Date(milestone.plannedDate);
    const now = new Date();
    const completion = milestone.completionPercentage || 0;
    
    // Simple delay detection
    return now > planned && completion < 100;
  }

  private calculateOverallRisk(weaknesses: CriticalWeakness[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = weaknesses.filter(w => w.severity === 'critical').length;
    const majorCount = weaknesses.filter(w => w.severity === 'major').length;
    const avgRiskScore = weaknesses.reduce((sum, w) => sum + w.riskScore, 0) / weaknesses.length;

    if (criticalCount > 0 || avgRiskScore > 80) return 'critical';
    if (majorCount > 2 || avgRiskScore > 70) return 'high';
    if (majorCount > 0 || avgRiskScore > 50) return 'medium';
    return 'low';
  }
}