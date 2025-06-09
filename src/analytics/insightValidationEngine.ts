import { StorageAdapter } from '../storage/StorageAdapter.js';
import { ProjectContext, ContextualInsight, ValidationResult, EnhancedContextAnalyzer } from './enhancedContextAnalyzer.js';

export interface InsightQualityScore {
  relevance: number; // 0-100
  accuracy: number; // 0-100
  actionability: number; // 0-100
  specificity: number; // 0-100
  evidenceBased: number; // 0-100
  overall: number; // 0-100
}

export interface ValidationReport {
  insight: any;
  qualityScore: InsightQualityScore;
  contextAlignment: {
    valueProposition: number;
    strategicPriorities: number;
    projectCharacteristics: number;
    industry: number;
  };
  issues: {
    critical: string[];
    moderate: string[];
    minor: string[];
  };
  recommendations: {
    improve: string[];
    replace: string[];
    enhance: string[];
  };
  confidence: number; // 0-100
  shouldUse: boolean;
}

export interface AnalysisAccuracyMetrics {
  totalInsights: number;
  validInsights: number;
  invalidInsights: number;
  accuracyRate: number;
  avgRelevanceScore: number;
  avgQualityScore: number;
  commonIssues: string[];
  improvementAreas: string[];
}

export class InsightValidationEngine {
  private contextAnalyzer: EnhancedContextAnalyzer;

  constructor(private storage: StorageAdapter) {
    this.contextAnalyzer = new EnhancedContextAnalyzer(storage);
  }

  async validateInsight(
    insight: any, 
    projectContext?: ProjectContext
  ): Promise<ValidationReport> {
    
    // Get or create project context
    let context = projectContext;
    if (!context) {
      context = await this.contextAnalyzer.analyzeProjectContext();
    }

    // Calculate quality scores
    const qualityScore = this.calculateQualityScore(insight, context);
    
    // Check context alignment
    const contextAlignment = this.assessContextAlignment(insight, context);
    
    // Identify issues
    const issues = this.identifyInsightIssues(insight, context, qualityScore);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(insight, context, issues, qualityScore);
    
    // Calculate overall confidence
    const confidence = this.calculateOverallConfidence(qualityScore, contextAlignment);
    
    // Determine if insight should be used
    const shouldUse = confidence >= 65 && qualityScore.overall >= 60;

    return {
      insight,
      qualityScore,
      contextAlignment,
      issues,
      recommendations,
      confidence,
      shouldUse
    };
  }

  async validateMultipleInsights(
    insights: any[],
    projectContext?: ProjectContext
  ): Promise<ValidationReport[]> {
    
    const context = projectContext || await this.contextAnalyzer.analyzeProjectContext();
    
    const validationPromises = insights.map(insight => 
      this.validateInsight(insight, context)
    );
    
    return Promise.all(validationPromises);
  }

  async generateAccuracyReport(
    insights: any[],
    projectContext?: ProjectContext
  ): Promise<AnalysisAccuracyMetrics> {
    
    const validations = await this.validateMultipleInsights(insights, projectContext);
    
    const validInsights = validations.filter(v => v.shouldUse);
    const invalidInsights = validations.filter(v => !v.shouldUse);
    
    const avgRelevanceScore = this.calculateAverage(validations.map(v => v.qualityScore.relevance));
    const avgQualityScore = this.calculateAverage(validations.map(v => v.qualityScore.overall));
    
    const commonIssues = this.identifyCommonIssues(validations);
    const improvementAreas = this.identifyImprovementAreas(validations);

    return {
      totalInsights: insights.length,
      validInsights: validInsights.length,
      invalidInsights: invalidInsights.length,
      accuracyRate: (validInsights.length / insights.length) * 100,
      avgRelevanceScore,
      avgQualityScore,
      commonIssues,
      improvementAreas
    };
  }

  private calculateQualityScore(insight: any, context: ProjectContext): InsightQualityScore {
    const relevance = this.scoreRelevance(insight, context);
    const accuracy = this.scoreAccuracy(insight, context);
    const actionability = this.scoreActionability(insight);
    const specificity = this.scoreSpecificity(insight);
    const evidenceBased = this.scoreEvidenceBased(insight);
    
    const overall = (relevance * 0.3 + accuracy * 0.25 + actionability * 0.2 + 
                    specificity * 0.15 + evidenceBased * 0.1);

    return {
      relevance: Math.round(relevance),
      accuracy: Math.round(accuracy),
      actionability: Math.round(actionability),
      specificity: Math.round(specificity),
      evidenceBased: Math.round(evidenceBased),
      overall: Math.round(overall)
    };
  }

  private scoreRelevance(insight: any, context: ProjectContext): number {
    let score = 50; // Base score
    
    const content = this.getInsightContent(insight);
    
    // Check alignment with value proposition
    if (this.contentAlignsWith(content, context.valueProposition.coreValue)) {
      score += 20;
    }
    
    // Check alignment with key success factors
    const alignedFactors = context.strategicContext.keySuccessFactors.filter(factor =>
      this.contentAlignsWith(content, factor)
    );
    score += alignedFactors.length * 10;
    
    // Check industry relevance
    if (this.contentAlignsWith(content, context.identity.industry)) {
      score += 15;
    }
    
    // Check project type relevance
    if (this.contentAlignsWith(content, context.intelligence.projectType)) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  private scoreAccuracy(insight: any, context: ProjectContext): number {
    let score = 60; // Base score assuming moderate accuracy
    
    const content = this.getInsightContent(insight);
    
    // Check for accuracy indicators
    if (this.hasSpecificMetrics(content)) {
      score += 20;
    }
    
    // Check for evidence backing
    if (insight.evidence && insight.evidence.length > 0) {
      score += 15;
    }
    
    // Check for realistic assumptions
    if (this.hasRealisticAssumptions(content, context)) {
      score += 10;
    }
    
    // Penalty for generic statements
    if (this.isGenericStatement(content)) {
      score -= 20;
    }
    
    // Penalty for conflicting with context
    if (this.conflictsWithContext(content, context)) {
      score -= 30;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private scoreActionability(insight: any): number {
    let score = 40; // Base score
    
    const content = this.getInsightContent(insight);
    
    // Check for specific actions
    const actionWords = ['implement', 'create', 'develop', 'improve', 'optimize', 'reduce', 'increase'];
    const hasActions = actionWords.some(word => content.toLowerCase().includes(word));
    if (hasActions) score += 25;
    
    // Check for timeline indicators
    const timeWords = ['immediately', 'within', 'by', 'next', 'quarter', 'month'];
    const hasTimeline = timeWords.some(word => content.toLowerCase().includes(word));
    if (hasTimeline) score += 20;
    
    // Check for ownership indicators
    const ownerWords = ['team', 'owner', 'responsible', 'assign', 'lead'];
    const hasOwnership = ownerWords.some(word => content.toLowerCase().includes(word));
    if (hasOwnership) score += 15;
    
    return Math.min(100, score);
  }

  private scoreSpecificity(insight: any): number {
    let score = 50; // Base score
    
    const content = this.getInsightContent(insight);
    
    // Check for specific numbers/metrics
    const hasNumbers = /\d+/.test(content);
    if (hasNumbers) score += 20;
    
    // Check for specific names/technologies
    const hasSpecificTerms = this.hasSpecificTerms(content);
    if (hasSpecificTerms) score += 15;
    
    // Penalty for vague language
    const vageWords = ['should', 'might', 'could', 'possibly', 'perhaps'];
    const hasVagueLanguage = vageWords.some(word => content.toLowerCase().includes(word));
    if (hasVagueLanguage) score -= 15;
    
    // Penalty for generic advice
    if (this.isGenericAdvice(content)) {
      score -= 20;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private scoreEvidenceBased(insight: any): number {
    let score = 30; // Base score
    
    // Check for explicit evidence
    if (insight.evidence && insight.evidence.length > 0) {
      score += 40;
    }
    
    // Check for data references
    const content = this.getInsightContent(insight);
    const dataWords = ['data', 'metrics', 'analysis', 'measurement', 'tracking'];
    const hasDataRef = dataWords.some(word => content.toLowerCase().includes(word));
    if (hasDataRef) score += 20;
    
    // Check for supporting facts
    if (insight.supportingEvidence || this.hasSupportingFacts(content)) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  private assessContextAlignment(insight: any, context: ProjectContext): ValidationReport['contextAlignment'] {
    const content = this.getInsightContent(insight);
    
    return {
      valueProposition: this.calculateValuePropAlignment(content, context.valueProposition),
      strategicPriorities: this.calculateStrategicAlignment(content, context.strategicContext),
      projectCharacteristics: this.calculateProjectAlignment(content, context.intelligence),
      industry: this.calculateIndustryAlignment(content, context.identity.industry)
    };
  }

  private identifyInsightIssues(
    insight: any, 
    context: ProjectContext, 
    qualityScore: InsightQualityScore
  ): ValidationReport['issues'] {
    const critical: string[] = [];
    const moderate: string[] = [];
    const minor: string[] = [];
    
    const content = this.getInsightContent(insight);
    
    // Critical issues
    if (qualityScore.relevance < 40) {
      critical.push('Insight not relevant to project context');
    }
    
    if (this.conflictsWithContext(content, context)) {
      critical.push('Insight conflicts with established project context');
    }
    
    if (qualityScore.accuracy < 30) {
      critical.push('Low accuracy - insight may be incorrect');
    }
    
    // Moderate issues
    if (qualityScore.actionability < 50) {
      moderate.push('Insight lacks clear actionable recommendations');
    }
    
    if (qualityScore.specificity < 40) {
      moderate.push('Insight is too generic or vague');
    }
    
    if (!this.contentAlignsWith(content, context.valueProposition.coreValue)) {
      moderate.push('Insight not aligned with core value proposition');
    }
    
    // Minor issues
    if (qualityScore.evidenceBased < 60) {
      minor.push('Insight could benefit from more evidence');
    }
    
    if (this.isGenericStatement(content)) {
      minor.push('Insight uses generic language');
    }
    
    return { critical, moderate, minor };
  }

  private generateRecommendations(
    insight: any,
    context: ProjectContext,
    issues: ValidationReport['issues'],
    qualityScore: InsightQualityScore
  ): ValidationReport['recommendations'] {
    const improve: string[] = [];
    const replace: string[] = [];
    const enhance: string[] = [];
    
    // Recommendations based on issues
    if (issues.critical.length > 0) {
      replace.push('Consider replacing this insight with one more aligned to project context');
      replace.push(`Focus on ${context.valueProposition.coreValue} instead`);
    }
    
    if (qualityScore.actionability < 60) {
      improve.push('Add specific action items with timelines and owners');
      improve.push('Include measurable success criteria');
    }
    
    if (qualityScore.specificity < 50) {
      improve.push('Add specific metrics, numbers, or concrete examples');
      improve.push('Replace vague language with precise recommendations');
    }
    
    if (qualityScore.evidenceBased < 60) {
      enhance.push('Include supporting data or evidence');
      enhance.push('Reference specific metrics or analysis');
    }
    
    // Context-specific recommendations
    enhance.push(`Consider impact on ${context.intelligence.projectType} projects`);
    enhance.push(`Align with ${context.identity.stage} stage priorities`);
    
    return { improve, replace, enhance };
  }

  private calculateOverallConfidence(
    qualityScore: InsightQualityScore,
    contextAlignment: ValidationReport['contextAlignment']
  ): number {
    const qualityWeight = 0.6;
    const alignmentWeight = 0.4;
    
    const avgAlignment = (
      contextAlignment.valueProposition +
      contextAlignment.strategicPriorities +
      contextAlignment.projectCharacteristics +
      contextAlignment.industry
    ) / 4;
    
    return Math.round(qualityScore.overall * qualityWeight + avgAlignment * alignmentWeight);
  }

  // Helper methods
  private getInsightContent(insight: any): string {
    return insight.content || insight.insight || insight.description || insight.title || '';
  }

  private contentAlignsWith(content: string, target: string): boolean {
    if (!target) return false;
    
    const contentWords = content.toLowerCase().split(' ');
    const targetWords = target.toLowerCase().split(' ');
    
    // Check for word overlap
    const overlap = contentWords.filter(word => 
      targetWords.some(targetWord => 
        word.includes(targetWord) || targetWord.includes(word)
      )
    );
    
    return overlap.length > 0;
  }

  private hasSpecificMetrics(content: string): boolean {
    const metricPatterns = [
      /\d+%/, // Percentages
      /\$\d+/, // Dollar amounts
      /\d+x/, // Multipliers
      /\d+\s+(days|weeks|months|quarters)/, // Time periods
      /\d+\s+(users|customers|clients)/ // User counts
    ];
    
    return metricPatterns.some(pattern => pattern.test(content));
  }

  private hasRealisticAssumptions(content: string, context: ProjectContext): boolean {
    // Check if assumptions align with project stage and context
    const unrealisticIndicators = [
      'overnight success',
      'viral growth',
      'instant adoption',
      'zero competition',
      'unlimited resources'
    ];
    
    return !unrealisticIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private isGenericStatement(content: string): boolean {
    const genericPhrases = [
      'improve performance',
      'increase revenue',
      'better user experience',
      'optimize operations',
      'enhance quality',
      'reduce costs'
    ];
    
    return genericPhrases.some(phrase => 
      content.toLowerCase().includes(phrase)
    ) && !this.hasSpecificDetails(content);
  }

  private hasSpecificDetails(content: string): boolean {
    return this.hasSpecificMetrics(content) || this.hasSpecificTerms(content);
  }

  private hasSpecificTerms(content: string): boolean {
    // Look for specific technologies, methodologies, or industry terms
    const specificTermPatterns = [
      /[A-Z]{2,}/, // Acronyms
      /\w+\s+(API|SDK|platform|framework|methodology)/, // Technical terms
      /\w+\s+(strategy|approach|model)/ // Business terms
    ];
    
    return specificTermPatterns.some(pattern => pattern.test(content));
  }

  private conflictsWithContext(content: string, context: ProjectContext): boolean {
    // Check for direct conflicts with established context
    const contentLower = content.toLowerCase();
    
    // Check against established value proposition
    if (context.valueProposition.differentiators.length > 0) {
      const conflicts = context.valueProposition.differentiators.some(diff =>
        contentLower.includes('not ' + diff.toLowerCase()) ||
        contentLower.includes('unlike ' + diff.toLowerCase())
      );
      if (conflicts) return true;
    }
    
    // Check against project stage
    const stageConflicts = {
      'mvp': ['scaling', 'enterprise', 'massive'],
      'early-stage': ['mature market', 'established'],
      'mature': ['experimental', 'unproven', 'beta']
    };
    
    const conflictTerms = stageConflicts[context.identity.stage as keyof typeof stageConflicts] || [];
    return conflictTerms.some(term => contentLower.includes(term));
  }

  private isGenericAdvice(content: string): boolean {
    const genericAdvicePatterns = [
      'focus on customers',
      'improve quality',
      'increase efficiency',
      'reduce waste',
      'optimize performance',
      'enhance user experience'
    ];
    
    return genericAdvicePatterns.some(pattern => 
      content.toLowerCase().includes(pattern)
    ) && content.length < 100; // Short and generic
  }

  private hasSupportingFacts(content: string): boolean {
    const factIndicators = [
      'research shows',
      'studies indicate',
      'data reveals',
      'analysis suggests',
      'evidence points to',
      'metrics demonstrate'
    ];
    
    return factIndicators.some(indicator => 
      content.toLowerCase().includes(indicator)
    );
  }

  private calculateValuePropAlignment(content: string, valueProposition: ProjectContext['valueProposition']): number {
    let score = 0;
    
    if (this.contentAlignsWith(content, valueProposition.coreValue)) score += 40;
    
    const alignedDifferentiators = valueProposition.differentiators.filter(diff =>
      this.contentAlignsWith(content, diff)
    );
    score += alignedDifferentiators.length * 15;
    
    if (this.contentAlignsWith(content, valueProposition.targetCustomer)) score += 10;
    
    return Math.min(100, score);
  }

  private calculateStrategicAlignment(content: string, strategicContext: ProjectContext['strategicContext']): number {
    let score = 0;
    
    const alignedFactors = strategicContext.keySuccessFactors.filter(factor =>
      this.contentAlignsWith(content, factor)
    );
    score += alignedFactors.length * 20;
    
    const alignedOpportunities = strategicContext.opportunityAreas.filter(opp =>
      this.contentAlignsWith(content, opp)
    );
    score += alignedOpportunities.length * 15;
    
    return Math.min(100, score);
  }

  private calculateProjectAlignment(content: string, intelligence: ProjectContext['intelligence']): number {
    let score = 50; // Base score
    
    if (this.contentAlignsWith(content, intelligence.projectType)) score += 20;
    if (this.contentAlignsWith(content, intelligence.complexityLevel)) score += 15;
    if (this.contentAlignsWith(content, intelligence.innovationLevel)) score += 15;
    
    return Math.min(100, score);
  }

  private calculateIndustryAlignment(content: string, industry: string): number {
    if (this.contentAlignsWith(content, industry)) {
      return 80;
    }
    
    // Check for industry-relevant terms
    const industryTerms = {
      'saas': ['software', 'subscription', 'cloud', 'platform'],
      'fintech': ['financial', 'payment', 'banking', 'transaction'],
      'ecommerce': ['commerce', 'retail', 'marketplace', 'shopping'],
      'healthcare': ['health', 'medical', 'patient', 'clinical'],
      'education': ['education', 'learning', 'student', 'training']
    };
    
    const terms = industryTerms[industry as keyof typeof industryTerms] || [];
    const hasIndustryTerms = terms.some(term => content.toLowerCase().includes(term));
    
    return hasIndustryTerms ? 60 : 30;
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private identifyCommonIssues(validations: ValidationReport[]): string[] {
    const issueFrequency: Record<string, number> = {};
    
    validations.forEach(validation => {
      [...validation.issues.critical, ...validation.issues.moderate, ...validation.issues.minor]
        .forEach(issue => {
          issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
        });
    });
    
    return Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);
  }

  private identifyImprovementAreas(validations: ValidationReport[]): string[] {
    const lowScoreAreas: string[] = [];
    
    const avgScores = {
      relevance: this.calculateAverage(validations.map(v => v.qualityScore.relevance)),
      accuracy: this.calculateAverage(validations.map(v => v.qualityScore.accuracy)),
      actionability: this.calculateAverage(validations.map(v => v.qualityScore.actionability)),
      specificity: this.calculateAverage(validations.map(v => v.qualityScore.specificity)),
      evidenceBased: this.calculateAverage(validations.map(v => v.qualityScore.evidenceBased))
    };
    
    Object.entries(avgScores).forEach(([area, score]) => {
      if (score < 65) {
        lowScoreAreas.push(`Improve ${area} (current avg: ${Math.round(score)})`);
      }
    });
    
    return lowScoreAreas;
  }
}