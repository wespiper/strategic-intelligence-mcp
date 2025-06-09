import { StorageAdapter } from '../storage/StorageAdapter.js';
import { BusinessGoal, StrategyConversation } from '../types/index.js';

export interface ProjectContext {
  // Core Identity
  identity: {
    name: string;
    description: string;
    industry: string;
    businessModel: string;
    stage: string;
    targetMarket: string;
  };
  
  // Value Proposition Analysis
  valueProposition: {
    coreValue: string;
    differentiators: string[];
    targetCustomer: string;
    problemSolved: string;
    uniqueAdvantage: string;
    competitivePosition: string;
    confidence: number; // 0-100
  };
  
  // Strategic Context
  strategicContext: {
    keySuccessFactors: string[];
    criticalAssumptions: string[];
    riskFactors: string[];
    opportunityAreas: string[];
    timeConstraints: string[];
    resourceConstraints: string[];
  };
  
  // Analysis Framework
  analysisFramework: {
    relevantMetrics: string[];
    keyQuestions: string[];
    focusAreas: string[];
    blindSpotAreas: string[];
    analysisDepth: 'surface' | 'standard' | 'deep';
  };
  
  // Contextual Intelligence
  intelligence: {
    projectType: 'product' | 'platform' | 'service' | 'infrastructure' | 'marketplace' | 'tool';
    complexityLevel: 'simple' | 'moderate' | 'complex' | 'highly-complex';
    innovationLevel: 'incremental' | 'substantial' | 'breakthrough' | 'disruptive';
    marketMaturity: 'nascent' | 'emerging' | 'growing' | 'mature' | 'declining';
    competitiveIntensity: 'low' | 'moderate' | 'high' | 'intense';
  };
}

export interface ContextualInsight {
  id: string;
  content: string;
  category: string;
  relevanceScore: number; // 0-100
  accuracyConfidence: number; // 0-100
  contextAlignment: {
    valueProposition: number;
    strategicContext: number;
    projectCharacteristics: number;
  };
  evidence: string[];
  assumptions: string[];
  limitations: string[];
  actionability: number; // 0-100
}

export interface ValidationResult {
  isRelevant: boolean;
  relevanceScore: number;
  issues: string[];
  improvements: string[];
  contextGaps: string[];
  recommendedActions: string[];
}

export class EnhancedContextAnalyzer {
  constructor(private storage: StorageAdapter) {}

  async analyzeProjectContext(projectData?: {
    name?: string;
    description?: string;
    industry?: string;
    businessModel?: string;
    stage?: string;
    existingGoals?: BusinessGoal[];
    conversations?: StrategyConversation[];
  }): Promise<ProjectContext> {
    const data = await this.storage.load();
    
    // Get project data from storage or parameters
    const goals = projectData?.existingGoals || Object.values(data.goals || {});
    const conversations = projectData?.conversations || Object.values(data.conversations || {});
    
    // Build comprehensive project context
    const identity = await this.analyzeProjectIdentity(projectData, goals, conversations);
    const valueProposition = await this.analyzeValueProposition(identity, goals, conversations);
    const strategicContext = await this.analyzeStrategicContext(goals, conversations, valueProposition);
    const analysisFramework = await this.buildAnalysisFramework(identity, valueProposition, strategicContext);
    const intelligence = await this.generateContextualIntelligence(identity, valueProposition, strategicContext);

    return {
      identity,
      valueProposition,
      strategicContext,
      analysisFramework,
      intelligence
    };
  }

  private async analyzeProjectIdentity(
    projectData: any, 
    goals: BusinessGoal[], 
    conversations: StrategyConversation[]
  ): Promise<ProjectContext['identity']> {
    
    // Extract identity from various sources
    const name = projectData?.name || this.inferProjectName(goals, conversations);
    const description = projectData?.description || this.inferProjectDescription(goals, conversations);
    const industry = projectData?.industry || this.inferIndustry(goals, conversations);
    const businessModel = projectData?.businessModel || this.inferBusinessModel(goals, conversations);
    const stage = projectData?.stage || this.inferProjectStage(goals, conversations);
    const targetMarket = this.inferTargetMarket(goals, conversations);

    return {
      name,
      description,
      industry,
      businessModel,
      stage,
      targetMarket
    };
  }

  private async analyzeValueProposition(
    identity: ProjectContext['identity'],
    goals: BusinessGoal[],
    conversations: StrategyConversation[]
  ): Promise<ProjectContext['valueProposition']> {
    
    // Analyze value proposition from multiple sources
    const coreValue = this.extractCoreValue(identity, goals, conversations);
    const differentiators = this.identifyDifferentiators(goals, conversations);
    const targetCustomer = this.identifyTargetCustomer(identity, goals, conversations);
    const problemSolved = this.identifyProblemSolved(identity, goals, conversations);
    const uniqueAdvantage = this.identifyUniqueAdvantage(differentiators, conversations);
    const competitivePosition = this.assessCompetitivePosition(conversations, differentiators);
    const confidence = this.calculateValuePropConfidence(coreValue, differentiators, targetCustomer);

    return {
      coreValue,
      differentiators,
      targetCustomer,
      problemSolved,
      uniqueAdvantage,
      competitivePosition,
      confidence
    };
  }

  private async analyzeStrategicContext(
    goals: BusinessGoal[],
    conversations: StrategyConversation[],
    valueProposition: ProjectContext['valueProposition']
  ): Promise<ProjectContext['strategicContext']> {
    
    const keySuccessFactors = this.identifyKeySuccessFactors(goals, conversations, valueProposition);
    const criticalAssumptions = this.extractCriticalAssumptions(goals, conversations);
    const riskFactors = this.identifyRiskFactors(goals, conversations);
    const opportunityAreas = this.identifyOpportunityAreas(goals, conversations);
    const timeConstraints = this.identifyTimeConstraints(goals);
    const resourceConstraints = this.identifyResourceConstraints(goals, conversations);

    return {
      keySuccessFactors,
      criticalAssumptions,
      riskFactors,
      opportunityAreas,
      timeConstraints,
      resourceConstraints
    };
  }

  private async buildAnalysisFramework(
    identity: ProjectContext['identity'],
    valueProposition: ProjectContext['valueProposition'],
    strategicContext: ProjectContext['strategicContext']
  ): Promise<ProjectContext['analysisFramework']> {
    
    const relevantMetrics = this.identifyRelevantMetrics(identity, valueProposition);
    const keyQuestions = this.generateKeyQuestions(identity, valueProposition, strategicContext);
    const focusAreas = this.determineFocusAreas(identity, strategicContext);
    const blindSpotAreas = this.identifyPotentialBlindSpots(identity, valueProposition, strategicContext);
    const analysisDepth = this.determineOptimalAnalysisDepth(identity, strategicContext);

    return {
      relevantMetrics,
      keyQuestions,
      focusAreas,
      blindSpotAreas,
      analysisDepth
    };
  }

  private async generateContextualIntelligence(
    identity: ProjectContext['identity'],
    valueProposition: ProjectContext['valueProposition'],
    strategicContext: ProjectContext['strategicContext']
  ): Promise<ProjectContext['intelligence']> {
    
    const projectType = this.classifyProjectType(identity, valueProposition);
    const complexityLevel = this.assessComplexityLevel(strategicContext, valueProposition);
    const innovationLevel = this.assessInnovationLevel(valueProposition, strategicContext);
    const marketMaturity = this.assessMarketMaturity(identity, strategicContext);
    const competitiveIntensity = this.assessCompetitiveIntensity(valueProposition, strategicContext);

    return {
      projectType,
      complexityLevel,
      innovationLevel,
      marketMaturity,
      competitiveIntensity
    };
  }

  // Validation and Accuracy Methods
  async validateInsightRelevance(
    insight: any,
    projectContext: ProjectContext
  ): Promise<ValidationResult> {
    
    const relevanceScore = this.calculateRelevanceScore(insight, projectContext);
    const isRelevant = relevanceScore >= 60; // Threshold for relevance
    
    const issues = this.identifyInsightIssues(insight, projectContext);
    const improvements = this.suggestInsightImprovements(insight, projectContext);
    const contextGaps = this.identifyContextGaps(insight, projectContext);
    const recommendedActions = this.generateRecommendedActions(insight, projectContext, issues);

    return {
      isRelevant,
      relevanceScore,
      issues,
      improvements,
      contextGaps,
      recommendedActions
    };
  }

  private calculateRelevanceScore(insight: any, context: ProjectContext): number {
    let score = 0;
    
    // Check alignment with value proposition (40% weight)
    const valuePropAlignment = this.checkValuePropositionAlignment(insight, context.valueProposition);
    score += valuePropAlignment * 0.4;
    
    // Check strategic context relevance (30% weight)
    const strategicRelevance = this.checkStrategicRelevance(insight, context.strategicContext);
    score += strategicRelevance * 0.3;
    
    // Check project characteristics alignment (30% weight)
    const characteristicsAlignment = this.checkCharacteristicsAlignment(insight, context.intelligence);
    score += characteristicsAlignment * 0.3;
    
    return Math.round(score);
  }

  // Enhanced Analysis Methods
  async generateContextuallyAccurateInsights(
    projectContext: ProjectContext,
    dataToAnalyze: any
  ): Promise<ContextualInsight[]> {
    
    const insights: ContextualInsight[] = [];
    
    // Generate insights based on project context
    const focusedInsights = await this.generateFocusedInsights(projectContext, dataToAnalyze);
    const valuePropInsights = await this.generateValuePropositionInsights(projectContext, dataToAnalyze);
    const strategicInsights = await this.generateStrategicContextInsights(projectContext, dataToAnalyze);
    
    insights.push(...focusedInsights, ...valuePropInsights, ...strategicInsights);
    
    // Validate and score each insight
    for (const insight of insights) {
      const validation = await this.validateInsightRelevance(insight, projectContext);
      insight.relevanceScore = validation.relevanceScore;
      insight.contextAlignment = {
        valueProposition: this.checkValuePropositionAlignment(insight, projectContext.valueProposition),
        strategicContext: this.checkStrategicRelevance(insight, projectContext.strategicContext),
        projectCharacteristics: this.checkCharacteristicsAlignment(insight, projectContext.intelligence)
      };
    }
    
    // Filter out low-relevance insights
    return insights.filter(insight => insight.relevanceScore >= 60);
  }

  // Implementation of helper methods
  private inferProjectName(goals: BusinessGoal[], conversations: StrategyConversation[]): string {
    // Extract project name from goals or conversations
    if (goals.length > 0) {
      const goalTitles = goals.map(g => g.title);
      return this.extractCommonTheme(goalTitles) || 'Project';
    }
    return 'Unnamed Project';
  }

  private inferProjectDescription(goals: BusinessGoal[], conversations: StrategyConversation[]): string {
    const descriptions: string[] = [];
    
    goals.forEach(g => descriptions.push(g.description));
    conversations.forEach(c => descriptions.push(c.conversationSummary));
    
    return this.synthesizeDescription(descriptions);
  }

  private inferIndustry(goals: BusinessGoal[], conversations: StrategyConversation[]): string {
    const industryKeywords = {
      'saas': ['software', 'platform', 'api', 'service'],
      'fintech': ['financial', 'payment', 'banking', 'money'],
      'ecommerce': ['commerce', 'retail', 'marketplace', 'shop'],
      'healthcare': ['health', 'medical', 'patient', 'care'],
      'education': ['education', 'learning', 'student', 'course']
    };

    const allText = this.extractAllText(goals, conversations);
    return this.classifyByKeywords(allText, industryKeywords) || 'technology';
  }

  private inferBusinessModel(goals: BusinessGoal[], conversations: StrategyConversation[]): string {
    const modelKeywords = {
      'subscription': ['subscription', 'recurring', 'monthly', 'saas'],
      'marketplace': ['marketplace', 'platform', 'commission', 'sellers'],
      'enterprise': ['enterprise', 'b2b', 'corporate', 'business'],
      'freemium': ['freemium', 'free', 'premium', 'upgrade']
    };

    const allText = this.extractAllText(goals, conversations);
    return this.classifyByKeywords(allText, modelKeywords) || 'b2b';
  }

  private inferProjectStage(goals: BusinessGoal[], conversations: StrategyConversation[]): string {
    const stageIndicators = {
      'mvp': ['mvp', 'prototype', 'proof', 'concept'],
      'early-stage': ['early', 'launch', 'beta', 'initial'],
      'growth': ['growth', 'scale', 'expand', 'user acquisition'],
      'mature': ['mature', 'optimize', 'maintain', 'established']
    };

    const allText = this.extractAllText(goals, conversations);
    return this.classifyByKeywords(allText, stageIndicators) || 'growth';
  }

  private extractCoreValue(
    identity: ProjectContext['identity'],
    goals: BusinessGoal[],
    conversations: StrategyConversation[]
  ): string {
    // Extract the core value proposition from multiple sources
    const valueIndicators = this.extractValueIndicators(goals, conversations);
    return this.synthesizeCoreValue(valueIndicators, identity);
  }

  private identifyKeySuccessFactors(
    goals: BusinessGoal[],
    conversations: StrategyConversation[],
    valueProposition: ProjectContext['valueProposition']
  ): string[] {
    const factors: string[] = [];
    
    // Extract from goal dependencies
    goals.forEach(goal => {
      if (goal.dependencies) {
        factors.push(...goal.dependencies.technicalFeatures);
        factors.push(...goal.dependencies.businessPrerequisites);
      }
    });
    
    // Add value proposition factors
    if (valueProposition.differentiators.length > 0) {
      factors.push('Maintain competitive differentiation');
    }
    
    return [...new Set(factors)].slice(0, 5); // Top 5 unique factors
  }

  private generateKeyQuestions(
    identity: ProjectContext['identity'],
    valueProposition: ProjectContext['valueProposition'],
    strategicContext: ProjectContext['strategicContext']
  ): string[] {
    const questions: string[] = [];
    
    // Value proposition questions
    if (valueProposition.confidence < 70) {
      questions.push('How can we validate and strengthen our value proposition?');
    }
    
    // Industry-specific questions
    switch (identity.industry) {
      case 'saas':
        questions.push('What is our customer acquisition cost and lifetime value ratio?');
        break;
      case 'marketplace':
        questions.push('How do we achieve liquidity on both sides of the marketplace?');
        break;
      default:
        questions.push('What are our key competitive advantages?');
    }
    
    // Risk-based questions
    if (strategicContext.riskFactors.length > 2) {
      questions.push('How do we mitigate our top strategic risks?');
    }
    
    return questions.slice(0, 7); // Top 7 questions
  }

  // Utility methods
  private extractCommonTheme(titles: string[]): string | null {
    // Simple implementation - could be enhanced with NLP
    const words = titles.flatMap(title => title.toLowerCase().split(' '));
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommon = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    return mostCommon && mostCommon[1] > 1 ? mostCommon[0] : null;
  }

  private synthesizeDescription(descriptions: string[]): string {
    // Simple synthesis - could be enhanced with AI
    const filtered = descriptions.filter(d => d && d.length > 10);
    return filtered.length > 0 ? filtered[0] : 'Strategic project focused on business growth';
  }

  private extractAllText(goals: BusinessGoal[], conversations: StrategyConversation[]): string {
    const texts: string[] = [];
    
    goals.forEach(g => {
      texts.push(g.title, g.description);
    });
    
    conversations.forEach(c => {
      texts.push(c.title, c.conversationSummary);
    });
    
    return texts.join(' ').toLowerCase();
  }

  private classifyByKeywords(text: string, keywordMap: Record<string, string[]>): string | null {
    const scores: Record<string, number> = {};
    
    Object.entries(keywordMap).forEach(([category, keywords]) => {
      scores[category] = keywords.reduce((score, keyword) => {
        return score + (text.includes(keyword) ? 1 : 0);
      }, 0);
    });
    
    const bestMatch = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0];
    
    return bestMatch && bestMatch[1] > 0 ? bestMatch[0] : null;
  }

  private extractValueIndicators(goals: BusinessGoal[], conversations: StrategyConversation[]): string[] {
    const indicators: string[] = [];
    
    // Extract from competitive advantage insights
    conversations.forEach(conv => {
      conv.insights.forEach(insight => {
        if (insight.category === 'competitive-advantage') {
          indicators.push(insight.content);
        }
      });
    });
    
    return indicators;
  }

  private synthesizeCoreValue(valueIndicators: string[], identity: ProjectContext['identity']): string {
    if (valueIndicators.length > 0) {
      return valueIndicators[0]; // Use first indicator as primary value
    }
    
    // Default based on business model
    switch (identity.businessModel) {
      case 'subscription':
        return 'Providing ongoing value through reliable service delivery';
      case 'marketplace':
        return 'Connecting buyers and sellers efficiently';
      case 'enterprise':
        return 'Solving complex business problems at scale';
      default:
        return 'Delivering unique value to target customers';
    }
  }

  // Validation helper methods
  private checkValuePropositionAlignment(insight: any, valueProposition: ProjectContext['valueProposition']): number {
    // Simple keyword matching - could be enhanced with semantic analysis
    const insightText = (insight.content || insight.insight || '').toLowerCase();
    const valuePropText = [
      valueProposition.coreValue,
      ...valueProposition.differentiators,
      valueProposition.uniqueAdvantage
    ].join(' ').toLowerCase();
    
    const commonWords = this.findCommonWords(insightText, valuePropText);
    return Math.min(100, commonWords.length * 20); // Score based on overlap
  }

  private checkStrategicRelevance(insight: any, strategicContext: ProjectContext['strategicContext']): number {
    const insightText = (insight.content || insight.insight || '').toLowerCase();
    const contextText = [
      ...strategicContext.keySuccessFactors,
      ...strategicContext.opportunityAreas,
      ...strategicContext.riskFactors
    ].join(' ').toLowerCase();
    
    const commonWords = this.findCommonWords(insightText, contextText);
    return Math.min(100, commonWords.length * 25);
  }

  private checkCharacteristicsAlignment(insight: any, intelligence: ProjectContext['intelligence']): number {
    const insightText = (insight.content || insight.insight || '').toLowerCase();
    
    // Check alignment with project characteristics
    let score = 50; // Base score
    
    if (insightText.includes(intelligence.projectType)) score += 20;
    if (insightText.includes(intelligence.complexityLevel)) score += 15;
    if (insightText.includes(intelligence.innovationLevel)) score += 15;
    
    return Math.min(100, score);
  }

  private findCommonWords(text1: string, text2: string): string[] {
    const words1 = new Set(text1.split(' ').filter(w => w.length > 3));
    const words2 = new Set(text2.split(' ').filter(w => w.length > 3));
    
    return Array.from(words1).filter(word => words2.has(word));
  }

  private identifyInsightIssues(insight: any, context: ProjectContext): string[] {
    const issues: string[] = [];
    
    if (this.checkValuePropositionAlignment(insight, context.valueProposition) < 30) {
      issues.push('Insight not aligned with core value proposition');
    }
    
    if (this.checkStrategicRelevance(insight, context.strategicContext) < 30) {
      issues.push('Insight not relevant to strategic context');
    }
    
    return issues;
  }

  private suggestInsightImprovements(insight: any, context: ProjectContext): string[] {
    const improvements: string[] = [];
    
    improvements.push('Focus more on ' + context.valueProposition.coreValue);
    improvements.push('Consider impact on ' + context.strategicContext.keySuccessFactors[0]);
    
    return improvements;
  }

  private identifyContextGaps(insight: any, context: ProjectContext): string[] {
    const gaps: string[] = [];
    
    if (context.valueProposition.confidence < 60) {
      gaps.push('Value proposition needs clarification');
    }
    
    return gaps;
  }

  private generateRecommendedActions(insight: any, context: ProjectContext, issues: string[]): string[] {
    const actions: string[] = [];
    
    if (issues.length > 0) {
      actions.push('Refine insight to better align with project context');
      actions.push('Gather more specific data about ' + context.intelligence.projectType + ' projects');
    }
    
    return actions;
  }

  // Additional helper methods for comprehensive analysis
  private identifyDifferentiators(goals: BusinessGoal[], conversations: StrategyConversation[]): string[] {
    const differentiators: string[] = [];
    
    conversations.forEach(conv => {
      conv.insights.forEach(insight => {
        if (insight.category === 'competitive-advantage') {
          differentiators.push(insight.content);
        }
      });
    });
    
    return differentiators;
  }

  private identifyTargetCustomer(
    identity: ProjectContext['identity'],
    goals: BusinessGoal[],
    conversations: StrategyConversation[]
  ): string {
    // Extract from market analysis conversations
    const marketConversations = conversations.filter(c => c.type === 'market-analysis');
    if (marketConversations.length > 0) {
      return this.extractCustomerFromConversations(marketConversations);
    }
    
    return identity.targetMarket || 'Business customers';
  }

  private extractCustomerFromConversations(conversations: StrategyConversation[]): string {
    // Simple extraction - could be enhanced
    return 'Target customers identified in market analysis';
  }

  private identifyProblemSolved(
    identity: ProjectContext['identity'],
    goals: BusinessGoal[],
    conversations: StrategyConversation[]
  ): string {
    // Extract problem from product roadmap conversations
    const productConversations = conversations.filter(c => c.type === 'product-roadmap');
    if (productConversations.length > 0) {
      return this.extractProblemFromConversations(productConversations);
    }
    
    return 'Solving business challenges in ' + identity.industry;
  }

  private extractProblemFromConversations(conversations: StrategyConversation[]): string {
    return 'Key business problems identified in product discussions';
  }

  private identifyUniqueAdvantage(differentiators: string[], conversations: StrategyConversation[]): string {
    if (differentiators.length > 0) {
      return differentiators[0]; // Primary differentiator
    }
    
    return 'Unique approach to solving customer problems';
  }

  private assessCompetitivePosition(conversations: StrategyConversation[], differentiators: string[]): string {
    const competitiveConversations = conversations.filter(c => c.type === 'competitive-strategy');
    
    if (competitiveConversations.length > 0) {
      return 'Positioned based on competitive analysis';
    }
    
    if (differentiators.length > 2) {
      return 'Strong differentiation';
    } else if (differentiators.length > 0) {
      return 'Some differentiation';
    } else {
      return 'Needs differentiation';
    }
  }

  private calculateValuePropConfidence(coreValue: string, differentiators: string[], targetCustomer: string): number {
    let confidence = 30; // Base confidence
    
    if (coreValue && coreValue !== 'Delivering unique value to target customers') confidence += 25;
    if (differentiators.length > 0) confidence += 20;
    if (differentiators.length > 2) confidence += 15;
    if (targetCustomer && targetCustomer !== 'Business customers') confidence += 10;
    
    return Math.min(100, confidence);
  }

  private inferTargetMarket(goals: BusinessGoal[], conversations: StrategyConversation[]): string {
    const allText = this.extractAllText(goals, conversations);
    
    const marketKeywords = {
      'SMB': ['small business', 'smb', 'small companies'],
      'Enterprise': ['enterprise', 'large companies', 'corporations'],
      'Consumers': ['consumers', 'individuals', 'personal'],
      'Developers': ['developers', 'engineers', 'technical']
    };
    
    return this.classifyByKeywords(allText, marketKeywords) || 'Business customers';
  }

  private identifyRiskFactors(goals: BusinessGoal[], conversations: StrategyConversation[]): string[] {
    const risks: string[] = [];
    
    // Extract from goal risks
    goals.forEach(goal => {
      if (goal.progressHistory) {
        goal.progressHistory.forEach(progress => {
          risks.push(...progress.risks);
        });
      }
    });
    
    // Extract from risk mitigation insights
    conversations.forEach(conv => {
      conv.insights.forEach(insight => {
        if (insight.category === 'risk-mitigation') {
          risks.push(insight.content);
        }
      });
    });
    
    return [...new Set(risks)];
  }

  private identifyOpportunityAreas(goals: BusinessGoal[], conversations: StrategyConversation[]): string[] {
    const opportunities: string[] = [];
    
    // Extract from market opportunity insights
    conversations.forEach(conv => {
      conv.insights.forEach(insight => {
        if (insight.category === 'market-opportunity') {
          opportunities.push(insight.content);
        }
      });
    });
    
    return opportunities;
  }

  private identifyTimeConstraints(goals: BusinessGoal[]): string[] {
    const constraints: string[] = [];
    
    goals.forEach(goal => {
      if (goal.milestones) {
        goal.milestones.forEach(milestone => {
          if (milestone.status === 'delayed') {
            constraints.push(`Delayed milestone: ${milestone.title}`);
          }
        });
      }
    });
    
    return constraints;
  }

  private identifyResourceConstraints(goals: BusinessGoal[], conversations: StrategyConversation[]): string[] {
    const constraints: string[] = [];
    
    // Look for resource mentions in conversations
    const allText = this.extractAllText(goals, conversations);
    const resourceIndicators = ['limited', 'constraint', 'shortage', 'capacity', 'bandwidth'];
    
    resourceIndicators.forEach(indicator => {
      if (allText.includes(indicator)) {
        constraints.push(`Resource constraint: ${indicator}`);
      }
    });
    
    return constraints;
  }

  private identifyRelevantMetrics(
    identity: ProjectContext['identity'],
    valueProposition: ProjectContext['valueProposition']
  ): string[] {
    const metrics: string[] = [];
    
    // Industry-specific metrics
    switch (identity.industry) {
      case 'saas':
        metrics.push('MRR', 'CAC', 'LTV', 'Churn Rate', 'NPS');
        break;
      case 'marketplace':
        metrics.push('GMV', 'Take Rate', 'Liquidity', 'Time to First Transaction');
        break;
      case 'ecommerce':
        metrics.push('Conversion Rate', 'AOV', 'Customer Acquisition Cost');
        break;
      default:
        metrics.push('Revenue Growth', 'Customer Satisfaction', 'Market Share');
    }
    
    return metrics;
  }

  private determineFocusAreas(
    identity: ProjectContext['identity'],
    strategicContext: ProjectContext['strategicContext']
  ): string[] {
    const focusAreas: string[] = [];
    
    // Based on key success factors
    if (strategicContext.keySuccessFactors.length > 0) {
      focusAreas.push(...strategicContext.keySuccessFactors.slice(0, 3));
    }
    
    // Stage-specific focus areas
    switch (identity.stage) {
      case 'mvp':
        focusAreas.push('Product-Market Fit', 'User Validation');
        break;
      case 'growth':
        focusAreas.push('Scaling', 'Market Expansion');
        break;
      case 'mature':
        focusAreas.push('Optimization', 'Competitive Defense');
        break;
    }
    
    return [...new Set(focusAreas)];
  }

  private identifyPotentialBlindSpots(
    identity: ProjectContext['identity'],
    valueProposition: ProjectContext['valueProposition'],
    strategicContext: ProjectContext['strategicContext']
  ): string[] {
    const blindSpots: string[] = [];
    
    // Low confidence value prop indicates blind spot
    if (valueProposition.confidence < 60) {
      blindSpots.push('Value Proposition Clarity');
    }
    
    // No competitive analysis
    if (!strategicContext.opportunityAreas.length) {
      blindSpots.push('Market Opportunities');
    }
    
    // Industry-specific blind spots
    switch (identity.industry) {
      case 'saas':
        blindSpots.push('Customer Success', 'Product Stickiness');
        break;
      case 'marketplace':
        blindSpots.push('Supply-Demand Balance', 'Network Effects');
        break;
    }
    
    return blindSpots;
  }

  private determineOptimalAnalysisDepth(
    identity: ProjectContext['identity'],
    strategicContext: ProjectContext['strategicContext']
  ): 'surface' | 'standard' | 'deep' {
    
    // Complex projects need deep analysis
    if (strategicContext.riskFactors.length > 3 || strategicContext.criticalAssumptions.length > 3) {
      return 'deep';
    }
    
    // Early stage projects need standard analysis
    if (identity.stage === 'mvp' || identity.stage === 'early-stage') {
      return 'standard';
    }
    
    return 'standard';
  }

  private classifyProjectType(
    identity: ProjectContext['identity'],
    valueProposition: ProjectContext['valueProposition']
  ): ProjectContext['intelligence']['projectType'] {
    
    const description = identity.description.toLowerCase();
    
    if (description.includes('platform') || description.includes('marketplace')) {
      return 'marketplace';
    } else if (description.includes('service')) {
      return 'service';
    } else if (description.includes('tool')) {
      return 'tool';
    } else if (description.includes('infrastructure')) {
      return 'infrastructure';
    }
    
    return 'product';
  }

  private assessComplexityLevel(
    strategicContext: ProjectContext['strategicContext'],
    valueProposition: ProjectContext['valueProposition']
  ): ProjectContext['intelligence']['complexityLevel'] {
    
    let complexityScore = 0;
    
    complexityScore += strategicContext.keySuccessFactors.length;
    complexityScore += strategicContext.riskFactors.length;
    complexityScore += strategicContext.criticalAssumptions.length;
    
    if (complexityScore > 15) return 'highly-complex';
    if (complexityScore > 10) return 'complex';
    if (complexityScore > 5) return 'moderate';
    return 'simple';
  }

  private assessInnovationLevel(
    valueProposition: ProjectContext['valueProposition'],
    strategicContext: ProjectContext['strategicContext']
  ): ProjectContext['intelligence']['innovationLevel'] {
    
    if (valueProposition.differentiators.length > 3) {
      return 'breakthrough';
    } else if (valueProposition.differentiators.length > 1) {
      return 'substantial';
    } else if (valueProposition.differentiators.length > 0) {
      return 'incremental';
    }
    
    return 'incremental';
  }

  private assessMarketMaturity(
    identity: ProjectContext['identity'],
    strategicContext: ProjectContext['strategicContext']
  ): ProjectContext['intelligence']['marketMaturity'] {
    
    // Simple assessment based on available data
    if (strategicContext.opportunityAreas.length > 3) {
      return 'emerging';
    }
    
    return 'growing';
  }

  private assessCompetitiveIntensity(
    valueProposition: ProjectContext['valueProposition'],
    strategicContext: ProjectContext['strategicContext']
  ): ProjectContext['intelligence']['competitiveIntensity'] {
    
    if (valueProposition.competitivePosition === 'Strong differentiation') {
      return 'moderate';
    } else if (valueProposition.competitivePosition === 'Some differentiation') {
      return 'high';
    } else {
      return 'intense';
    }
  }

  private extractCriticalAssumptions(goals: BusinessGoal[], conversations: StrategyConversation[]): string[] {
    const assumptions: string[] = [];
    
    // Extract assumptions from goal dependencies
    goals.forEach(goal => {
      if (goal.dependencies) {
        assumptions.push(...goal.dependencies.externalFactors);
      }
    });
    
    return [...new Set(assumptions)];
  }

  private async generateFocusedInsights(context: ProjectContext, data: any): Promise<ContextualInsight[]> {
    const insights: ContextualInsight[] = [];
    
    // Generate insights focused on the project's key areas
    context.analysisFramework.focusAreas.forEach((area, index) => {
      insights.push({
        id: `focused-${index}`,
        content: `Strategic focus needed on ${area} based on project context`,
        category: 'strategic-focus',
        relevanceScore: 85,
        accuracyConfidence: 80,
        contextAlignment: {
          valueProposition: 85,
          strategicContext: 90,
          projectCharacteristics: 80
        },
        evidence: [`Project type: ${context.intelligence.projectType}`, `Stage: ${context.identity.stage}`],
        assumptions: [`${area} is critical for success`],
        limitations: ['Based on current project data'],
        actionability: 85
      });
    });
    
    return insights;
  }

  private async generateValuePropositionInsights(context: ProjectContext, data: any): Promise<ContextualInsight[]> {
    const insights: ContextualInsight[] = [];
    
    if (context.valueProposition.confidence < 70) {
      insights.push({
        id: 'value-prop-clarity',
        content: `Value proposition needs strengthening. Current confidence: ${context.valueProposition.confidence}%. Focus on clarifying: ${context.valueProposition.coreValue}`,
        category: 'value-proposition',
        relevanceScore: 95,
        accuracyConfidence: 90,
        contextAlignment: {
          valueProposition: 95,
          strategicContext: 80,
          projectCharacteristics: 85
        },
        evidence: [`Low value prop confidence: ${context.valueProposition.confidence}%`],
        assumptions: ['Clear value proposition is critical for success'],
        limitations: ['Assessment based on available data'],
        actionability: 90
      });
    }
    
    return insights;
  }

  private async generateStrategicContextInsights(context: ProjectContext, data: any): Promise<ContextualInsight[]> {
    const insights: ContextualInsight[] = [];
    
    // Generate insights about strategic risks
    if (context.strategicContext.riskFactors.length > 2) {
      insights.push({
        id: 'strategic-risks',
        content: `High number of strategic risks identified (${context.strategicContext.riskFactors.length}). Recommend prioritizing risk mitigation for: ${context.strategicContext.riskFactors.slice(0, 2).join(', ')}`,
        category: 'risk-management',
        relevanceScore: 90,
        accuracyConfidence: 85,
        contextAlignment: {
          valueProposition: 75,
          strategicContext: 95,
          projectCharacteristics: 80
        },
        evidence: [`${context.strategicContext.riskFactors.length} risk factors identified`],
        assumptions: ['Multiple risks require active management'],
        limitations: ['Risk assessment based on current data'],
        actionability: 85
      });
    }
    
    return insights;
  }
}