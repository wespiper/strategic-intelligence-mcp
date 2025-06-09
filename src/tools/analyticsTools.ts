// Analytics tools that integrate pattern recognition, goal analytics, and insight generation
import { v4 as uuidv4 } from 'uuid';
import { ToolResponse } from '../types/index.js';
import { StorageAdapter } from '../storage/StorageAdapter.js';
import { TechnicalMilestoneTracker } from '../intelligence/technicalMilestoneTracker.js';
import { ProgressCorrelationEngine } from '../intelligence/progressCorrelationEngine.js';
import { PatternRecognitionEngine } from '../analytics/patternRecognitionEngine.js';
import { GoalProgressAnalytics } from '../analytics/goalProgressAnalytics.js';
import { StrategicInsightGenerator } from '../analytics/strategicInsightGenerator.js';
import { CriticalAnalysisEngine } from '../analytics/criticalAnalysisEngine.js';
import { EnhancedContextAnalyzer } from '../analytics/enhancedContextAnalyzer.js';
import { InsightValidationEngine } from '../analytics/insightValidationEngine.js';

export class AnalyticsTools {
  private milestoneTracker: TechnicalMilestoneTracker;
  private correlationEngine: ProgressCorrelationEngine;
  private patternEngine: PatternRecognitionEngine;
  private goalAnalytics: GoalProgressAnalytics;
  private insightGenerator: StrategicInsightGenerator;
  private criticalAnalysis: CriticalAnalysisEngine;
  private contextAnalyzer: EnhancedContextAnalyzer;
  private validationEngine: InsightValidationEngine;

  constructor(private storage: StorageAdapter) {
    this.milestoneTracker = new TechnicalMilestoneTracker(storage);
    this.correlationEngine = new ProgressCorrelationEngine();
    this.patternEngine = new PatternRecognitionEngine();
    this.goalAnalytics = new GoalProgressAnalytics();
    this.insightGenerator = new StrategicInsightGenerator();
    this.criticalAnalysis = new CriticalAnalysisEngine(storage);
    this.contextAnalyzer = new EnhancedContextAnalyzer(storage);
    this.validationEngine = new InsightValidationEngine(storage);
  }

  async runComprehensiveAnalysis(args: {
    includePatterns?: boolean;
    includeTrends?: boolean;
    includeGoalHealth?: boolean;
    includeInsights?: boolean;
    analysisDepth?: 'basic' | 'standard' | 'comprehensive';
  } = {}): Promise<ToolResponse> {
    try {
      const {
        includePatterns = true,
        includeTrends = true,
        includeGoalHealth = true,
        includeInsights = true,
        analysisDepth = 'comprehensive'
      } = args;

      // Load all data
      await this.milestoneTracker.loadMilestones();
      const data = await this.storage.load();
      
      const milestones = this.milestoneTracker.getAllMilestones();
      const businessGoals = Object.values(data.goals || {});
      const conversations = Object.values(data.conversations || {});

      // Generate correlations
      const correlations = [];
      for (const milestone of milestones) {
        const milestoneCorrelations = this.correlationEngine.analyzeCorrelation(milestone, businessGoals);
        correlations.push(...milestoneCorrelations);
      }

      const analysis: any = {
        summary: {
          analysisDate: new Date().toISOString(),
          analysisDepth,
          dataPoints: {
            milestones: milestones.length,
            businessGoals: businessGoals.length,
            correlations: correlations.length,
            conversations: conversations.length
          }
        }
      };

      // Pattern Analysis
      if (includePatterns) {
        const patterns = this.patternEngine.analyzePatterns(milestones, correlations, businessGoals, conversations);
        analysis.patterns = {
          total: patterns.length,
          byType: this.groupPatternsByType(patterns),
          highConfidence: patterns.filter(p => p.confidence >= 80),
          criticalBusiness: patterns.filter(p => p.businessImpact.opportunity === 'critical' || p.businessImpact.risk === 'critical'),
          data: analysisDepth === 'comprehensive' ? patterns : patterns.slice(0, 10)
        };
      }

      // Trend Analysis
      if (includeTrends) {
        const trends = this.patternEngine.generateTrendAnalysis(milestones, '90-days');
        const crossAnalyses = this.patternEngine.analyzeCorrelationsAcrossMilestones(milestones, correlations);
        
        analysis.trends = {
          total: trends.length,
          crossMilestoneAnalyses: crossAnalyses.length,
          data: trends,
          crossAnalyses: analysisDepth === 'comprehensive' ? crossAnalyses : crossAnalyses.slice(0, 5)
        };
      }

      // Goal Health Analysis
      if (includeGoalHealth) {
        const goalHealthAssessments = [];
        for (const goal of businessGoals) {
          const relatedMilestones = milestones.filter(m => m.linkedGoals.includes(goal.id));
          const goalCorrelations = correlations.filter(c => c.businessGoalId === goal.id);
          const healthAssessment = this.goalAnalytics.assessGoalHealth(goal, relatedMilestones, goalCorrelations);
          goalHealthAssessments.push(healthAssessment);
        }

        analysis.goalHealth = {
          total: goalHealthAssessments.length,
          healthDistribution: this.getHealthDistribution(goalHealthAssessments),
          criticalGoals: goalHealthAssessments.filter(g => g.overallHealth === 'critical'),
          excellentGoals: goalHealthAssessments.filter(g => g.overallHealth === 'excellent'),
          averageHealthScore: goalHealthAssessments.length > 0 
            ? goalHealthAssessments.reduce((sum, g) => sum + g.healthScore, 0) / goalHealthAssessments.length 
            : 0,
          data: analysisDepth === 'comprehensive' ? goalHealthAssessments : goalHealthAssessments.slice(0, 5)
        };
      }

      // Strategic Insights
      if (includeInsights) {
        const patterns = analysis.patterns?.data || [];
        const trends = analysis.trends?.data || [];
        const crossAnalyses = analysis.trends?.crossAnalyses || [];
        const goalHealth = analysis.goalHealth?.data || [];

        const insights = this.insightGenerator.generateInsights(
          patterns, trends, crossAnalyses, goalHealth, milestones, businessGoals
        );

        const executiveSummary = this.insightGenerator.generateExecutiveSummary(insights);

        analysis.insights = {
          total: insights.length,
          byType: this.groupInsightsByType(insights),
          byPriority: this.groupInsightsByPriority(insights),
          executiveSummary,
          criticalInsights: insights.filter(i => i.priority === 'critical'),
          data: analysisDepth === 'comprehensive' ? insights : insights.slice(0, 10)
        };
      }

      // Calculate overall strategic score
      analysis.strategicScore = this.calculateOverallStrategicScore(analysis);

      // Generate key recommendations
      analysis.keyRecommendations = this.generateKeyRecommendations(analysis);

      return {
        success: true,
        data: analysis,
        message: `Comprehensive strategic analysis completed. Analyzed ${milestones.length} milestones, ${businessGoals.length} goals, found ${correlations.length} correlations${includeInsights ? `, generated ${analysis.insights.total} strategic insights` : ''}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to run comprehensive analysis: ${error}`
      };
    }
  }

  async generateStrategicDashboard(args: {
    timeframe?: '30-days' | '90-days' | '6-months' | '12-months';
    focus?: 'overview' | 'risks' | 'opportunities' | 'performance';
  } = {}): Promise<ToolResponse> {
    try {
      const { timeframe = '90-days', focus = 'overview' } = args;

      await this.milestoneTracker.loadMilestones();
      const data = await this.storage.load();
      
      const milestones = this.milestoneTracker.getAllMilestones();
      const businessGoals = Object.values(data.goals || {});

      // Generate correlations for dashboard
      const correlations = [];
      for (const milestone of milestones) {
        const milestoneCorrelations = this.correlationEngine.analyzeCorrelation(milestone, businessGoals);
        correlations.push(...milestoneCorrelations);
      }

      const dashboard: any = {
        generatedAt: new Date().toISOString(),
        timeframe,
        focus,
        
        // Executive Summary Metrics
        executiveMetrics: {
          totalMilestones: milestones.length,
          completedMilestones: milestones.filter(m => m.status === 'completed').length,
          milestonesInProgress: milestones.filter(m => m.status === 'in-progress').length,
          delayedMilestones: milestones.filter(m => m.status === 'delayed').length,
          totalBusinessGoals: businessGoals.length,
          averageGoalConfidence: businessGoals.length > 0 
            ? businessGoals.reduce((sum, g) => sum + (g.confidence || 50), 0) / businessGoals.length 
            : 0,
          strongCorrelations: correlations.filter(c => Math.abs(c.correlationStrength) >= 70).length,
          totalProjectedRevenue: milestones.reduce((sum, m) => sum + m.businessContext.revenueImplication, 0)
        },

        // Performance Indicators
        performanceIndicators: {
          developmentVelocity: this.calculateDevelopmentVelocity(milestones),
          strategicAlignment: this.calculateStrategicAlignment(correlations),
          businessImpactRealization: this.calculateBusinessImpactRealization(milestones),
          riskExposure: this.calculateRiskExposure(milestones)
        }
      };

      // Focus-specific content
      if (focus === 'risks' || focus === 'overview') {
        const riskPatterns = this.patternEngine.analyzePatterns(milestones, correlations, businessGoals, [])
          .filter(p => p.type === 'risk');
        
        dashboard.riskAnalysis = {
          totalRisks: riskPatterns.length,
          criticalRisks: riskPatterns.filter(p => p.businessImpact.risk === 'critical'),
          revenueAtRisk: riskPatterns.reduce((sum, p) => sum + Math.abs(p.businessImpact.revenue), 0),
          topRisks: riskPatterns.slice(0, 5)
        };
      }

      if (focus === 'opportunities' || focus === 'overview') {
        const opportunityPatterns = this.patternEngine.analyzePatterns(milestones, correlations, businessGoals, [])
          .filter(p => p.type === 'opportunity');
        
        dashboard.opportunityAnalysis = {
          totalOpportunities: opportunityPatterns.length,
          criticalOpportunities: opportunityPatterns.filter(p => p.businessImpact.opportunity === 'critical'),
          revenueOpportunity: opportunityPatterns.reduce((sum, p) => sum + Math.max(0, p.businessImpact.revenue), 0),
          topOpportunities: opportunityPatterns.slice(0, 5)
        };
      }

      if (focus === 'performance' || focus === 'overview') {
        const trends = this.patternEngine.generateTrendAnalysis(milestones, timeframe);
        
        dashboard.performanceTrends = {
          totalTrends: trends.length,
          improvingTrends: trends.filter(t => t.direction === 'increasing').length,
          decliningTrends: trends.filter(t => t.direction === 'decreasing').length,
          trendData: trends
        };
      }

      // Strategic recommendations for dashboard
      dashboard.strategicRecommendations = this.generateDashboardRecommendations(dashboard);

      return {
        success: true,
        data: dashboard,
        message: `Strategic dashboard generated for ${timeframe} timeframe with ${focus} focus`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate strategic dashboard: ${error}`
      };
    }
  }

  async generateGoalHealthReport(args: {
    goalId?: string;
    includeForecasting?: boolean;
    includeRecommendations?: boolean;
  } = {}): Promise<ToolResponse> {
    try {
      const { goalId, includeForecasting = true, includeRecommendations = true } = args;

      await this.milestoneTracker.loadMilestones();
      const data = await this.storage.load();
      
      const milestones = this.milestoneTracker.getAllMilestones();
      const businessGoals = Object.values(data.goals || {});

      let targetGoals = businessGoals;
      if (goalId) {
        targetGoals = businessGoals.filter(g => g.id === goalId);
        if (targetGoals.length === 0) {
          return {
            success: false,
            error: `Goal ${goalId} not found`
          };
        }
      }

      const correlations = [];
      for (const milestone of milestones) {
        const milestoneCorrelations = this.correlationEngine.analyzeCorrelation(milestone, businessGoals);
        correlations.push(...milestoneCorrelations);
      }

      const report: any = {
        generatedAt: new Date().toISOString(),
        scope: goalId ? 'single-goal' : 'all-goals',
        totalGoals: targetGoals.length
      };

      // Generate health assessments
      const healthAssessments = [];
      const velocityMetrics = [];
      const completionForecasts = [];

      for (const goal of targetGoals) {
        const relatedMilestones = milestones.filter(m => m.linkedGoals.includes(goal.id));
        const goalCorrelations = correlations.filter(c => c.businessGoalId === goal.id);
        
        const healthAssessment = this.goalAnalytics.assessGoalHealth(goal, relatedMilestones, goalCorrelations);
        healthAssessments.push(healthAssessment);

        const velocity = this.goalAnalytics.calculateVelocityMetrics(goal, milestones);
        velocityMetrics.push(velocity);

        if (includeForecasting) {
          const forecast = this.goalAnalytics.generateCompletionForecast(goal, milestones, goalCorrelations);
          completionForecasts.push(forecast);
        }
      }

      report.healthAssessments = {
        total: healthAssessments.length,
        healthDistribution: this.getHealthDistribution(healthAssessments),
        averageHealthScore: healthAssessments.reduce((sum, h) => sum + h.healthScore, 0) / healthAssessments.length,
        data: healthAssessments
      };

      report.velocityAnalysis = {
        total: velocityMetrics.length,
        averageEfficiency: velocityMetrics.reduce((sum, v) => sum + v.efficiency, 0) / velocityMetrics.length,
        acceleratingGoals: velocityMetrics.filter(v => v.velocityTrend === 'accelerating').length,
        stalledGoals: velocityMetrics.filter(v => v.velocityTrend === 'stalled').length,
        data: velocityMetrics
      };

      if (includeForecasting) {
        report.completionForecasts = {
          total: completionForecasts.length,
          averageConfidence: completionForecasts.reduce((sum, f) => sum + f.confidence, 0) / completionForecasts.length,
          data: completionForecasts
        };
      }

      if (includeRecommendations) {
        report.recommendations = this.generateGoalHealthRecommendations(healthAssessments, velocityMetrics);
      }

      // Overall goal portfolio health
      report.portfolioHealth = {
        overallScore: report.healthAssessments.averageHealthScore,
        riskFactors: this.identifyPortfolioRisks(healthAssessments),
        strengthAreas: this.identifyPortfolioStrengths(healthAssessments),
        strategicPriorities: this.identifyStrategicPriorities(healthAssessments, velocityMetrics)
      };

      return {
        success: true,
        data: report,
        message: `Goal health report generated for ${targetGoals.length} goals with ${report.healthAssessments.averageHealthScore.toFixed(1)}% average health score`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate goal health report: ${error}`
      };
    }
  }

  async generatePatternAnalysisReport(args: {
    patternTypes?: string[];
    confidenceThreshold?: number;
    includeActionablePlan?: boolean;
  } = {}): Promise<ToolResponse> {
    try {
      const { 
        patternTypes = ['efficiency', 'velocity', 'correlation', 'risk', 'opportunity'], 
        confidenceThreshold = 70,
        includeActionablePlan = true 
      } = args;

      await this.milestoneTracker.loadMilestones();
      const data = await this.storage.load();
      
      const milestones = this.milestoneTracker.getAllMilestones();
      const businessGoals = Object.values(data.goals || {});
      const conversations = Object.values(data.conversations || {});

      const correlations = [];
      for (const milestone of milestones) {
        const milestoneCorrelations = this.correlationEngine.analyzeCorrelation(milestone, businessGoals);
        correlations.push(...milestoneCorrelations);
      }

      // Analyze patterns
      const allPatterns = this.patternEngine.analyzePatterns(milestones, correlations, businessGoals, conversations);
      const filteredPatterns = allPatterns.filter(p => 
        patternTypes.includes(p.type) && p.confidence >= confidenceThreshold
      );

      const report: any = {
        generatedAt: new Date().toISOString(),
        analysisParameters: {
          patternTypes,
          confidenceThreshold,
          totalPatternsFound: allPatterns.length,
          qualifyingPatterns: filteredPatterns.length
        }
      };

      // Pattern analysis by type
      report.patternAnalysis = {};
      patternTypes.forEach(type => {
        const typePatterns = filteredPatterns.filter(p => p.type === type);
        report.patternAnalysis[type] = {
          count: typePatterns.length,
          averageConfidence: typePatterns.length > 0 
            ? typePatterns.reduce((sum, p) => sum + p.confidence, 0) / typePatterns.length 
            : 0,
          totalBusinessImpact: typePatterns.reduce((sum, p) => sum + Math.abs(p.businessImpact.revenue), 0),
          patterns: typePatterns
        };
      });

      // Trend analysis
      const trends = this.patternEngine.generateTrendAnalysis(milestones, '90-days');
      const crossAnalyses = this.patternEngine.analyzeCorrelationsAcrossMilestones(milestones, correlations);

      report.trendAnalysis = {
        totalTrends: trends.length,
        significantTrends: trends.filter(t => t.confidence >= confidenceThreshold),
        crossMilestonePatterns: crossAnalyses.length,
        data: {
          trends: trends.filter(t => t.confidence >= confidenceThreshold),
          crossAnalyses
        }
      };

      // Pattern insights
      report.insights = {
        strengthPatterns: filteredPatterns.filter(p => p.type === 'efficiency' || p.type === 'opportunity'),
        riskPatterns: filteredPatterns.filter(p => p.type === 'risk'),
        emergingPatterns: filteredPatterns.filter(p => p.frequency === 1), // New patterns
        consistentPatterns: filteredPatterns.filter(p => p.frequency > 2) // Recurring patterns
      };

      if (includeActionablePlan) {
        report.actionablePlan = this.generatePatternActionPlan(filteredPatterns, trends);
      }

      return {
        success: true,
        data: report,
        message: `Pattern analysis completed. Found ${filteredPatterns.length} qualifying patterns across ${patternTypes.length} categories with ${confidenceThreshold}%+ confidence`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate pattern analysis report: ${error}`
      };
    }
  }

  async generateExecutiveInsightsBrief(args: {
    timeframe?: '30-days' | '90-days' | '6-months';
    focusAreas?: string[];
  } = {}): Promise<ToolResponse> {
    try {
      const { timeframe = '90-days', focusAreas = ['all'] } = args;

      // Run comprehensive analysis
      const analysisResult = await this.runComprehensiveAnalysis({
        includePatterns: true,
        includeTrends: true,
        includeGoalHealth: true,
        includeInsights: true,
        analysisDepth: 'comprehensive'
      });

      if (!analysisResult.success) {
        return analysisResult;
      }

      const analysis = analysisResult.data;
      const insights = analysis.insights?.data || [];

      // Generate executive summary
      const executiveSummary = this.insightGenerator.generateExecutiveSummary(insights);

      const brief: any = {
        generatedAt: new Date().toISOString(),
        timeframe,
        focusAreas,
        executiveSummary,

        // Strategic highlights
        strategicHighlights: {
          criticalInsights: insights.filter((i: any) => i.priority === 'critical').length,
          revenueOpportunity: executiveSummary.businessImpactSummary.totalRevenueOpportunity,
          revenueAtRisk: executiveSummary.businessImpactSummary.totalRevenueAtRisk,
          keyThemes: executiveSummary.strategicThemes.slice(0, 3)
        },

        // Immediate actions required
        immediateActions: insights
          .filter((i: any) => i.urgency === 'immediate')
          .slice(0, 5)
          .map((i: any) => ({
            title: i.title,
            action: i.actionableRecommendations[0]?.action,
            rationale: i.actionableRecommendations[0]?.rationale,
            businessImpact: i.businessImpact.revenue
          })),

        // Strategic opportunities
        keyOpportunities: insights
          .filter((i: any) => i.type === 'opportunity')
          .slice(0, 3)
          .map((i: any) => ({
            title: i.title,
            description: i.description,
            revenueImpact: i.businessImpact.revenue,
            timeframe: i.businessImpact.timeframe,
            confidence: i.confidence
          })),

        // Risk assessment
        riskAssessment: {
          criticalRisks: insights.filter((i: any) => i.type === 'risk' && i.priority === 'critical').length,
          totalRiskExposure: insights
            .filter((i: any) => i.type === 'risk')
            .reduce((sum: number, i: any) => sum + Math.abs(i.businessImpact.revenue), 0),
          topRisks: insights
            .filter((i: any) => i.type === 'risk')
            .slice(0, 3)
            .map((i: any) => ({
              title: i.title,
              description: i.description,
              impact: Math.abs(i.businessImpact.revenue),
              urgency: i.urgency
            }))
        },

        // Performance metrics
        performanceMetrics: {
          overallStrategicScore: analysis.strategicScore,
          goalHealthAverage: analysis.goalHealth?.averageHealthScore || 0,
          developmentVelocity: analysis.summary?.dataPoints || {},
          correlationStrength: analysis.patterns?.byType || {}
        }
      };

      // Add focus area specific content
      if (focusAreas.includes('competitive-advantage') || focusAreas.includes('all')) {
        brief.competitiveAdvantages = insights
          .filter((i: any) => i.type === 'competitive-advantage')
          .map((i: any) => ({
            title: i.title,
            description: i.description,
            sustainability: i.businessImpact.timeframe,
            advantage: i.supportingEvidence[0]?.description
          }));
      }

      return {
        success: true,
        data: brief,
        message: `Executive insights brief generated covering ${timeframe} with ${executiveSummary.totalInsights} total insights and ${executiveSummary.criticalInsights} critical items`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate executive insights brief: ${error}`
      };
    }
  }

  // Helper methods
  private groupPatternsByType(patterns: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    patterns.forEach((p: any) => {
      grouped[p.type] = (grouped[p.type] || 0) + 1;
    });
    return grouped;
  }

  private groupInsightsByType(insights: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    insights.forEach((i: any) => {
      grouped[i.type] = (grouped[i.type] || 0) + 1;
    });
    return grouped;
  }

  private groupInsightsByPriority(insights: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    insights.forEach((i: any) => {
      grouped[i.priority] = (grouped[i.priority] || 0) + 1;
    });
    return grouped;
  }

  private getHealthDistribution(assessments: any[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    assessments.forEach((a: any) => {
      distribution[a.overallHealth] = (distribution[a.overallHealth] || 0) + 1;
    });
    return distribution;
  }

  private calculateOverallStrategicScore(analysis: any): number {
    let score = 50; // Base score

    // Factor in goal health
    if (analysis.goalHealth) {
      score += (analysis.goalHealth.averageHealthScore - 50) * 0.3;
    }

    // Factor in patterns
    if (analysis.patterns) {
      const positivePatterns = (analysis.patterns.byType.efficiency || 0) + (analysis.patterns.byType.opportunity || 0);
      const negativePatterns = analysis.patterns.byType.risk || 0;
      score += (positivePatterns - negativePatterns) * 5;
    }

    // Factor in insights
    if (analysis.insights) {
      const criticalInsights = analysis.insights.byPriority.critical || 0;
      score -= criticalInsights * 10; // Critical insights reduce score (they need attention)
      
      const opportunities = analysis.insights.byType.opportunity || 0;
      score += opportunities * 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateKeyRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    if (analysis.goalHealth?.criticalGoals?.length > 0) {
      recommendations.push(`Address ${analysis.goalHealth.criticalGoals.length} critical goal health issues immediately`);
    }

    if (analysis.insights?.criticalInsights?.length > 0) {
      recommendations.push('Review and act on critical strategic insights');
    }

    if (analysis.patterns?.criticalBusiness?.length > 0) {
      recommendations.push('Leverage high-impact business patterns for competitive advantage');
    }

    return recommendations.slice(0, 5);
  }

  private calculateDevelopmentVelocity(milestones: any[]): number {
    const completed = milestones.filter((m: any) => m.status === 'completed' && m.completionDate);
    if (completed.length < 2) return 0;

    const completionDates = completed.map((m: any) => new Date(m.completionDate).getTime()).sort();
    const timeSpan = (completionDates[completionDates.length - 1] - completionDates[0]) / (1000 * 60 * 60 * 24 * 30);
    return completed.length / Math.max(timeSpan, 0.5);
  }

  private calculateStrategicAlignment(correlations: any[]): number {
    if (correlations.length === 0) return 0;
    return correlations.reduce((sum: number, c: any) => sum + Math.abs(c.correlationStrength), 0) / correlations.length;
  }

  private calculateBusinessImpactRealization(milestones: any[]): number {
    const completed = milestones.filter((m: any) => m.status === 'completed');
    const total = milestones.reduce((sum: number, m: any) => sum + m.businessContext.revenueImplication, 0);
    const realized = completed.reduce((sum: number, m: any) => sum + m.businessContext.revenueImplication, 0);
    return total > 0 ? (realized / total) * 100 : 0;
  }

  private calculateRiskExposure(milestones: any[]): number {
    const delayed = milestones.filter((m: any) => m.status === 'delayed');
    return delayed.reduce((sum: number, m: any) => sum + m.businessContext.revenueImplication, 0);
  }

  private generateDashboardRecommendations(dashboard: any): string[] {
    const recommendations: string[] = [];

    if (dashboard.riskAnalysis?.criticalRisks?.length > 0) {
      recommendations.push('Address critical risks immediately');
    }

    if (dashboard.performanceIndicators?.developmentVelocity < 1) {
      recommendations.push('Improve development velocity');
    }

    if (dashboard.performanceIndicators?.strategicAlignment < 60) {
      recommendations.push('Strengthen technical-business alignment');
    }

    return recommendations;
  }

  private generateGoalHealthRecommendations(healthAssessments: any[], velocityMetrics: any[]): string[] {
    const recommendations: string[] = [];

    const criticalGoals = healthAssessments.filter(h => h.overallHealth === 'critical');
    if (criticalGoals.length > 0) {
      recommendations.push(`Immediately address ${criticalGoals.length} critical goal(s)`);
    }

    const stalledVelocity = velocityMetrics.filter(v => v.velocityTrend === 'stalled');
    if (stalledVelocity.length > 0) {
      recommendations.push(`Investigate and restart progress on ${stalledVelocity.length} stalled goal(s)`);
    }

    return recommendations;
  }

  private identifyPortfolioRisks(healthAssessments: any[]): string[] {
    const risks: string[] = [];
    
    const criticalCount = healthAssessments.filter(h => h.overallHealth === 'critical').length;
    if (criticalCount > 0) {
      risks.push(`${criticalCount} goals in critical health status`);
    }

    return risks;
  }

  private identifyPortfolioStrengths(healthAssessments: any[]): string[] {
    const strengths: string[] = [];
    
    const excellentCount = healthAssessments.filter(h => h.overallHealth === 'excellent').length;
    if (excellentCount > 0) {
      strengths.push(`${excellentCount} goals performing excellently`);
    }

    return strengths;
  }

  private identifyStrategicPriorities(healthAssessments: any[], velocityMetrics: any[]): string[] {
    const priorities: string[] = [];

    // Priority 1: Fix critical goals
    const criticalGoals = healthAssessments.filter(h => h.overallHealth === 'critical');
    if (criticalGoals.length > 0) {
      priorities.push('Address critical goal health issues');
    }

    // Priority 2: Accelerate stalled goals
    const stalledGoals = velocityMetrics.filter(v => v.velocityTrend === 'stalled');
    if (stalledGoals.length > 0) {
      priorities.push('Restart progress on stalled goals');
    }

    return priorities;
  }

  private generatePatternActionPlan(patterns: any[], trends: any[]): any {
    return {
      immediateActions: patterns
        .filter(p => p.businessImpact.urgency === 'critical')
        .map(p => p.recommendations[0]),
      
      shortTermActions: patterns
        .filter(p => p.businessImpact.urgency === 'high')
        .map(p => p.recommendations[0]),
      
      longTermActions: patterns
        .filter(p => p.type === 'opportunity')
        .map(p => p.recommendations[0])
    };
  }

  // Critical Analysis Tools - The "Skeptical Board Member"
  async runCriticalAnalysis(args: {
    analysisDepth?: 'surface' | 'standard' | 'deep';
    focusAreas?: string[];
    includeHardTruths?: boolean;
    includeMitigationStrategies?: boolean;
  } = {}): Promise<ToolResponse> {
    try {
      const {
        analysisDepth = 'standard',
        focusAreas = [],
        includeHardTruths = true,
        includeMitigationStrategies = true
      } = args;

      const report = await this.criticalAnalysis.runCriticalAnalysis({
        analysisDepth,
        focusAreas,
        includeHardTruths,
        includeMitigationStrategies
      });

      return {
        success: true,
        data: report,
        message: `Critical analysis completed. Found ${report.weaknesses.length} weaknesses (${report.summary.criticalIssueCount} critical), ${report.blindSpots.length} blind spots, and ${report.mitigationStrategies.length} mitigation strategies.`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to run critical analysis: ${error}`
      };
    }
  }

  async generateSkepticalReport(args: {
    focusAreas?: string[];
    includeHardTruths?: boolean;
    analysisDepth?: 'surface' | 'standard' | 'deep';
  } = {}): Promise<ToolResponse> {
    try {
      const {
        focusAreas = [],
        includeHardTruths = true,
        analysisDepth = 'deep'
      } = args;

      // Run the critical analysis
      const criticalResult = await this.runCriticalAnalysis({
        analysisDepth,
        focusAreas,
        includeHardTruths,
        includeMitigationStrategies: true
      });

      if (!criticalResult.success) {
        return criticalResult;
      }

      const criticalData = criticalResult.data;
      
      // Also run comprehensive analysis for context
      const positiveResult = await this.runComprehensiveAnalysis({
        includePatterns: true,
        includeTrends: true,
        includeGoalHealth: true,
        includeInsights: true,
        analysisDepth: 'standard'
      });

      const skepticalReport = {
        reportTitle: 'Skeptical Strategic Analysis',
        subtitle: 'Unvarnished truths and critical weaknesses requiring immediate attention',
        generatedAt: new Date().toISOString(),
        analysisParameters: {
          depth: analysisDepth,
          focusAreas: focusAreas.length > 0 ? focusAreas : ['all areas'],
          includeHardTruths
        },

        executiveSummary: {
          overallRiskLevel: criticalData.summary.overallRiskLevel,
          criticalIssueCount: criticalData.summary.criticalIssueCount,
          totalWeaknessCount: criticalData.weaknesses.length,
          blindSpotCount: criticalData.blindSpots.length,
          topMitigationPriorities: criticalData.summary.mitigationPriority,
          
          // The hard truth summary
          realityCheck: this.generateRealityCheck(criticalData, positiveResult.data)
        },

        criticalWeaknesses: {
          byCategory: this.groupWeaknessesByCategory(criticalData.weaknesses),
          bySeverity: this.groupWeaknessesBySeverity(criticalData.weaknesses),
          immediateThreats: criticalData.weaknesses.filter((w: any) => w.timeframe === 'immediate'),
          systemicIssues: criticalData.weaknesses.filter((w: any) => w.category === 'organizational' || w.category === 'strategic'),
          detailedWeaknesses: criticalData.weaknesses
        },

        blindSpotAnalysis: {
          totalBlindSpots: criticalData.blindSpots.length,
          highRiskBlindSpots: criticalData.blindSpots.filter((bs: any) => 
            bs.potentialConsequences.length >= 3
          ),
          detectionGaps: this.analyzeDetectionGaps(criticalData.blindSpots),
          blindSpots: criticalData.blindSpots
        },

        hardTruths: includeHardTruths ? {
          totalTruths: criticalData.hardTruths.length,
          byCategory: this.groupHardTruthsByCategory(criticalData.hardTruths),
          mostCritical: criticalData.hardTruths.slice(0, 3),
          allTruths: criticalData.hardTruths
        } : null,

        mitigationStrategies: {
          totalStrategies: criticalData.mitigationStrategies.length,
          highImpactStrategies: criticalData.mitigationStrategies.filter((s: any) => s.riskReduction >= 75),
          quickWins: criticalData.mitigationStrategies.filter((s: any) => 
            s.cost === 'low' && s.feasibility === 'high'
          ),
          allStrategies: criticalData.mitigationStrategies
        },

        criticalRecommendations: {
          immediateActions: criticalData.recommendations.filter((r: any) => r.priority === 'immediate'),
          urgentActions: criticalData.recommendations.filter((r: any) => r.priority === 'urgent'),
          importantActions: criticalData.recommendations.filter((r: any) => r.priority === 'important'),
          allRecommendations: criticalData.recommendations
        },

        // Contrasting perspective
        perspectiveContrast: positiveResult.success ? {
          note: 'For balance, here\'s what the optimistic analysis shows',
          opportunitiesCount: positiveResult.data?.insights?.byType?.opportunity || 0,
          strengthsCount: positiveResult.data?.patterns?.byType?.efficiency || 0,
          strategicScore: positiveResult.data?.strategicScore || 0,
          comparison: this.generatePerspectiveComparison(criticalData, positiveResult.data)
        } : null
      };

      return {
        success: true,
        data: skepticalReport,
        message: `Skeptical analysis complete. Identified ${criticalData.summary.criticalIssueCount} critical issues across ${criticalData.weaknesses.length} weaknesses. ${includeHardTruths ? `${criticalData.hardTruths.length} hard truths included.` : ''}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate skeptical report: ${error}`
      };
    }
  }

  // Helper methods for critical analysis
  private generateRealityCheck(criticalData: any, positiveData: any): string {
    const criticalCount = criticalData.summary.criticalIssueCount;
    const riskLevel = criticalData.summary.overallRiskLevel;
    
    if (criticalCount >= 3 && riskLevel === 'critical') {
      return 'Your project has fundamental issues that require immediate attention before pursuing any growth initiatives.';
    } else if (criticalCount >= 2 && riskLevel === 'high') {
      return 'While there are opportunities, significant weaknesses are undermining your strategic execution.';
    } else if (criticalCount >= 1) {
      return 'Progress is being made, but critical gaps need addressing to avoid future setbacks.';
    } else {
      return 'The foundation appears solid, though vigilance on identified weaknesses remains important.';
    }
  }

  private groupWeaknessesByCategory(weaknesses: any[]): Record<string, any> {
    const grouped: Record<string, any> = {};
    weaknesses.forEach(w => {
      if (!grouped[w.category]) {
        grouped[w.category] = { count: 0, items: [], averageRiskScore: 0 };
      }
      grouped[w.category].count++;
      grouped[w.category].items.push(w);
    });

    // Calculate average risk scores
    Object.keys(grouped).forEach(category => {
      const items = grouped[category].items;
      grouped[category].averageRiskScore = 
        items.reduce((sum: number, item: any) => sum + item.riskScore, 0) / items.length;
    });

    return grouped;
  }

  private groupWeaknessesBySeverity(weaknesses: any[]): Record<string, any> {
    const grouped: Record<string, any> = {};
    weaknesses.forEach(w => {
      if (!grouped[w.severity]) {
        grouped[w.severity] = { count: 0, items: [] };
      }
      grouped[w.severity].count++;
      grouped[w.severity].items.push(w);
    });
    return grouped;
  }

  private analyzeDetectionGaps(blindSpots: any[]): string[] {
    const gaps: string[] = [];
    
    if (blindSpots.some(bs => bs.area.includes('Customer'))) {
      gaps.push('Lack of customer feedback mechanisms');
    }
    
    if (blindSpots.some(bs => bs.area.includes('Resource'))) {
      gaps.push('No capacity planning or resource tracking');
    }
    
    if (blindSpots.some(bs => bs.area.includes('Risk'))) {
      gaps.push('Insufficient risk assessment processes');
    }

    return gaps;
  }

  private groupHardTruthsByCategory(hardTruths: any[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    hardTruths.forEach(ht => {
      grouped[ht.category] = (grouped[ht.category] || 0) + 1;
    });
    return grouped;
  }

  private generatePerspectiveComparison(criticalData: any, positiveData: any): string[] {
    const comparisons: string[] = [];
    
    if (positiveData?.strategicScore > 70 && criticalData.summary.overallRiskLevel === 'high') {
      comparisons.push('Optimistic view shows high strategic score, but critical analysis reveals execution risks');
    }
    
    if (positiveData?.insights?.byType?.opportunity > 3 && criticalData.weaknesses.length > 5) {
      comparisons.push('Many opportunities identified, but significant weaknesses may prevent capitalizing on them');
    }
    
    return comparisons;
  }

  // Enhanced Accuracy Analysis Tools
  async analyzeProjectContext(args: {
    projectName?: string;
    projectDescription?: string;
    industry?: string;
    businessModel?: string;
    stage?: string;
    forceRefresh?: boolean;
  } = {}): Promise<ToolResponse> {
    try {
      const {
        projectName,
        projectDescription,
        industry,
        businessModel,
        stage,
        forceRefresh = false
      } = args;

      const projectData = {
        name: projectName,
        description: projectDescription,
        industry,
        businessModel,
        stage
      };

      const context = await this.contextAnalyzer.analyzeProjectContext(projectData);

      return {
        success: true,
        data: {
          projectContext: context,
          accuracyInsights: {
            valuePropositionClarity: context.valueProposition.confidence,
            contextCompleteness: this.calculateContextCompleteness(context),
            analysisReadiness: this.assessAnalysisReadiness(context),
            recommendedFocusAreas: context.analysisFramework.focusAreas,
            potentialBlindSpots: context.analysisFramework.blindSpotAreas
          },
          recommendations: this.generateContextRecommendations(context)
        },
        message: `Project context analyzed. Value proposition confidence: ${context.valueProposition.confidence}%. ${context.analysisFramework.focusAreas.length} focus areas identified.`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to analyze project context: ${error}`
      };
    }
  }

  async validateInsightAccuracy(args: {
    insights?: any[];
    insightId?: string;
    includeRecommendations?: boolean;
  } = {}): Promise<ToolResponse> {
    try {
      const {
        insights,
        insightId,
        includeRecommendations = true
      } = args;

      let insightsToValidate: any[] = [];

      if (insightId) {
        // Find specific insight
        const data = await this.storage.load();
        const allInsights = Object.values(data.insights || {});
        const specificInsight = allInsights.find((i: any) => i.id === insightId);
        if (specificInsight) {
          insightsToValidate = [specificInsight];
        }
      } else if (insights) {
        insightsToValidate = insights;
      } else {
        // Validate all recent insights
        const data = await this.storage.load();
        insightsToValidate = Object.values(data.insights || {});
      }

      if (insightsToValidate.length === 0) {
        return {
          success: false,
          error: 'No insights found to validate'
        };
      }

      const validationReports = await this.validationEngine.validateMultipleInsights(insightsToValidate);
      const accuracyMetrics = await this.validationEngine.generateAccuracyReport(insightsToValidate);

      return {
        success: true,
        data: {
          validationReports,
          accuracyMetrics,
          summary: {
            totalInsights: accuracyMetrics.totalInsights,
            validInsights: accuracyMetrics.validInsights,
            accuracyRate: accuracyMetrics.accuracyRate,
            avgQualityScore: accuracyMetrics.avgQualityScore,
            topIssues: accuracyMetrics.commonIssues.slice(0, 3)
          },
          recommendations: includeRecommendations ? this.generateAccuracyRecommendations(accuracyMetrics) : undefined
        },
        message: `Validated ${accuracyMetrics.totalInsights} insights. Accuracy rate: ${Math.round(accuracyMetrics.accuracyRate)}%. ${accuracyMetrics.validInsights} insights passed validation.`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to validate insight accuracy: ${error}`
      };
    }
  }

  async generateContextuallyAccurateInsights(args: {
    analysisDepth?: 'surface' | 'standard' | 'deep';
    focusAreas?: string[];
    includeValidation?: boolean;
    maxInsights?: number;
  } = {}): Promise<ToolResponse> {
    try {
      const {
        analysisDepth = 'standard',
        focusAreas = [],
        includeValidation = true,
        maxInsights = 10
      } = args;

      // Get project context
      const projectContext = await this.contextAnalyzer.analyzeProjectContext();
      
      // Load current data
      const data = await this.storage.load();
      
      // Generate contextually aware insights
      const contextualInsights = await this.contextAnalyzer.generateContextuallyAccurateInsights(
        projectContext, 
        data
      );

      // Validate insights if requested
      let validatedInsights = contextualInsights;
      if (includeValidation) {
        const validationReports = await this.validationEngine.validateMultipleInsights(contextualInsights, projectContext);
        validatedInsights = validationReports
          .filter(report => report.shouldUse)
          .map(report => ({
            ...report.insight,
            validationScore: report.qualityScore.overall,
            contextAlignment: report.contextAlignment
          }));
      }

      // Sort by relevance and limit
      const topInsights = validatedInsights
        .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
        .slice(0, maxInsights);

      return {
        success: true,
        data: {
          insights: topInsights,
          projectContext,
          generationMetrics: {
            totalGenerated: contextualInsights.length,
            afterValidation: validatedInsights.length,
            avgRelevanceScore: this.calculateAverageScore(topInsights, 'relevanceScore'),
            avgAccuracyConfidence: this.calculateAverageScore(topInsights, 'accuracyConfidence')
          },
          contextSummary: {
            valuePropositionClarity: projectContext.valueProposition.confidence,
            projectType: projectContext.intelligence.projectType,
            focusAreas: projectContext.analysisFramework.focusAreas,
            analysisDepth: projectContext.analysisFramework.analysisDepth
          }
        },
        message: `Generated ${topInsights.length} contextually accurate insights. Avg relevance: ${Math.round(this.calculateAverageScore(topInsights, 'relevanceScore'))}%.`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate contextually accurate insights: ${error}`
      };
    }
  }

  async generateAnalysisQualityReport(args: {
    timeframe?: '7-days' | '30-days' | '90-days' | 'all';
    includeRecommendations?: boolean;
  } = {}): Promise<ToolResponse> {
    try {
      const {
        timeframe = '30-days',
        includeRecommendations = true
      } = args;

      const data = await this.storage.load();
      const allInsights = Object.values(data.insights || {});
      const allConversations = Object.values(data.conversations || {});

      // Filter by timeframe
      const cutoffDate = this.getTimeframeCutoff(timeframe);
      const recentInsights = allInsights.filter((insight: any) => 
        timeframe === 'all' || new Date(insight.timestamp) >= cutoffDate
      );

      // Validate all insights
      const accuracyMetrics = await this.validationEngine.generateAccuracyReport(recentInsights);
      
      // Analyze context coverage
      const projectContext = await this.contextAnalyzer.analyzeProjectContext();
      const contextCoverage = this.analyzeContextCoverage(recentInsights, projectContext);
      
      // Generate improvement recommendations
      const improvements = includeRecommendations ? 
        this.generateQualityImprovements(accuracyMetrics, contextCoverage, projectContext) : [];

      return {
        success: true,
        data: {
          timeframe,
          accuracyMetrics,
          contextCoverage,
          qualityTrends: this.analyzeQualityTrends(allInsights),
          improvements,
          summary: {
            overallQuality: this.calculateOverallQuality(accuracyMetrics, contextCoverage),
            keyStrengths: this.identifyQualityStrengths(accuracyMetrics, contextCoverage),
            criticalGaps: this.identifyQualityCriticalGaps(accuracyMetrics, contextCoverage),
            actionPriority: this.determineActionPriority(accuracyMetrics)
          }
        },
        message: `Analysis quality report generated for ${timeframe}. Overall quality: ${this.calculateOverallQuality(accuracyMetrics, contextCoverage)}%. ${accuracyMetrics.commonIssues.length} common issues identified.`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate analysis quality report: ${error}`
      };
    }
  }

  async improveInsightAccuracy(args: {
    insightId?: string;
    improvementType?: 'relevance' | 'accuracy' | 'actionability' | 'specificity' | 'all';
    includeAlternatives?: boolean;
  } = {}): Promise<ToolResponse> {
    try {
      const {
        insightId,
        improvementType = 'all',
        includeAlternatives = true
      } = args;

      if (!insightId) {
        return {
          success: false,
          error: 'Insight ID is required for improvement'
        };
      }

      // Get the insight
      const data = await this.storage.load();
      const insight = Object.values(data.insights || {}).find((i: any) => i.id === insightId);
      
      if (!insight) {
        return {
          success: false,
          error: `Insight with ID ${insightId} not found`
        };
      }

      // Validate the insight
      const validationReport = await this.validationEngine.validateInsight(insight);
      
      // Generate improvements
      const improvements = this.generateSpecificImprovements(insight, validationReport, improvementType);
      
      // Generate alternatives if requested
      const alternatives = includeAlternatives ? 
        await this.generateAlternativeInsights(insight, validationReport) : [];

      return {
        success: true,
        data: {
          originalInsight: insight,
          validationReport,
          improvements,
          alternatives,
          improvementSummary: {
            currentQuality: validationReport.qualityScore.overall,
            primaryIssues: [...validationReport.issues.critical, ...validationReport.issues.moderate],
            improvementPotential: this.calculateImprovementPotential(validationReport),
            recommendedActions: validationReport.recommendations.improve.slice(0, 3)
          }
        },
        message: `Improvement plan generated for insight. Current quality: ${validationReport.qualityScore.overall}%. ${improvements.length} improvements and ${alternatives.length} alternatives provided.`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to improve insight accuracy: ${error}`
      };
    }
  }

  // Helper methods for enhanced accuracy
  private calculateContextCompleteness(context: any): number {
    let completeness = 0;
    let totalFactors = 0;

    // Check identity completeness
    const identityFields = ['name', 'description', 'industry', 'businessModel', 'stage'];
    const completedIdentity = identityFields.filter(field => context.identity[field] && context.identity[field] !== 'Unnamed Project');
    completeness += (completedIdentity.length / identityFields.length) * 25;
    totalFactors += 25;

    // Check value proposition completeness
    completeness += (context.valueProposition.confidence / 100) * 30;
    totalFactors += 30;

    // Check strategic context completeness
    const strategicComplete = (context.strategicContext.keySuccessFactors.length > 0 ? 15 : 0) +
                             (context.strategicContext.riskFactors.length > 0 ? 15 : 0) +
                             (context.strategicContext.opportunityAreas.length > 0 ? 15 : 0);
    completeness += strategicComplete;
    totalFactors += 45;

    return Math.round((completeness / totalFactors) * 100);
  }

  private assessAnalysisReadiness(context: any): number {
    let readiness = 50; // Base readiness

    if (context.valueProposition.confidence >= 70) readiness += 20;
    if (context.strategicContext.keySuccessFactors.length >= 3) readiness += 15;
    if (context.analysisFramework.focusAreas.length >= 2) readiness += 15;

    return Math.min(100, readiness);
  }

  private generateContextRecommendations(context: any): string[] {
    const recommendations: string[] = [];

    if (context.valueProposition.confidence < 60) {
      recommendations.push('Clarify value proposition through customer interviews and market validation');
    }

    if (context.strategicContext.keySuccessFactors.length < 3) {
      recommendations.push('Identify and document key success factors for strategic focus');
    }

    if (context.analysisFramework.blindSpotAreas.length > 0) {
      recommendations.push(`Address potential blind spots: ${context.analysisFramework.blindSpotAreas.slice(0, 2).join(', ')}`);
    }

    return recommendations;
  }

  private generateAccuracyRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.accuracyRate < 70) {
      recommendations.push('Focus on improving insight relevance and accuracy validation');
    }

    if (metrics.avgQualityScore < 65) {
      recommendations.push('Enhance insight specificity and actionability');
    }

    metrics.improvementAreas.forEach((area: string) => {
      recommendations.push(`Priority improvement: ${area}`);
    });

    return recommendations;
  }

  private calculateAverageScore(items: any[], scoreField: string): number {
    if (!items.length) return 0;
    const scores = items.map(item => item[scoreField] || 0);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private getTimeframeCutoff(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case '7-days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30-days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90-days':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0); // All time
    }
  }

  private analyzeContextCoverage(insights: any[], context: any): any {
    let coverage = {
      valueProposition: 0,
      strategicContext: 0,
      focusAreas: 0,
      blindSpots: 0
    };

    insights.forEach((insight: any) => {
      const content = insight.content || insight.insight || '';
      
      // Check value proposition coverage
      if (this.contentCoversArea(content, context.valueProposition.coreValue)) {
        coverage.valueProposition++;
      }
      
      // Check strategic context coverage
      context.strategicContext.keySuccessFactors.forEach((factor: string) => {
        if (this.contentCoversArea(content, factor)) {
          coverage.strategicContext++;
        }
      });
      
      // Check focus areas coverage
      context.analysisFramework.focusAreas.forEach((area: string) => {
        if (this.contentCoversArea(content, area)) {
          coverage.focusAreas++;
        }
      });
      
      // Check blind spot coverage
      context.analysisFramework.blindSpotAreas.forEach((area: string) => {
        if (this.contentCoversArea(content, area)) {
          coverage.blindSpots++;
        }
      });
    });

    return {
      ...coverage,
      totalInsights: insights.length,
      coveragePercentage: {
        valueProposition: Math.min(100, (coverage.valueProposition / insights.length) * 100),
        strategicContext: Math.min(100, (coverage.strategicContext / insights.length) * 100),
        focusAreas: Math.min(100, (coverage.focusAreas / insights.length) * 100),
        blindSpots: Math.min(100, (coverage.blindSpots / insights.length) * 100)
      }
    };
  }

  private contentCoversArea(content: string, area: string): boolean {
    if (!area) return false;
    const contentLower = content.toLowerCase();
    const areaLower = area.toLowerCase();
    return contentLower.includes(areaLower) || areaLower.includes(contentLower);
  }

  private analyzeQualityTrends(allInsights: any[]): any {
    // Simple trend analysis - could be enhanced
    const trends = {
      improving: false,
      stable: true,
      declining: false,
      recommendation: 'Continue current approach'
    };

    if (allInsights.length < 10) {
      trends.recommendation = 'Need more data for trend analysis';
    }

    return trends;
  }

  private generateQualityImprovements(metrics: any, coverage: any, context: any): string[] {
    const improvements: string[] = [];

    if (metrics.accuracyRate < 70) {
      improvements.push('Implement pre-publication insight validation');
    }

    if (coverage.coveragePercentage.valueProposition < 50) {
      improvements.push('Focus more insights on core value proposition');
    }

    if (coverage.coveragePercentage.blindSpots < 30) {
      improvements.push('Address identified blind spot areas more systematically');
    }

    return improvements;
  }

  private calculateOverallQuality(metrics: any, coverage: any): number {
    const qualityWeight = 0.6;
    const coverageWeight = 0.4;
    
    const avgCoverage = Object.values(coverage.coveragePercentage).reduce((sum: number, val: unknown) => sum + (val as number), 0) / 4;
    
    return Math.round(metrics.avgQualityScore * qualityWeight + avgCoverage * coverageWeight);
  }

  private identifyQualityStrengths(metrics: any, coverage: any): string[] {
    const strengths: string[] = [];

    if (metrics.accuracyRate >= 80) {
      strengths.push('High insight accuracy rate');
    }

    if (metrics.avgQualityScore >= 75) {
      strengths.push('Strong overall insight quality');
    }

    if (coverage.coveragePercentage.focusAreas >= 70) {
      strengths.push('Good coverage of focus areas');
    }

    return strengths;
  }

  private identifyQualityCriticalGaps(metrics: any, coverage: any): string[] {
    const gaps: string[] = [];

    if (metrics.accuracyRate < 60) {
      gaps.push('Low insight accuracy requires immediate attention');
    }

    if (coverage.coveragePercentage.valueProposition < 40) {
      gaps.push('Insufficient focus on value proposition');
    }

    if (metrics.avgQualityScore < 50) {
      gaps.push('Overall insight quality below acceptable threshold');
    }

    return gaps;
  }

  private determineActionPriority(metrics: any): 'low' | 'medium' | 'high' | 'critical' {
    if (metrics.accuracyRate < 50 || metrics.avgQualityScore < 40) {
      return 'critical';
    } else if (metrics.accuracyRate < 70 || metrics.avgQualityScore < 60) {
      return 'high';
    } else if (metrics.accuracyRate < 80 || metrics.avgQualityScore < 75) {
      return 'medium';
    }
    return 'low';
  }

  private generateSpecificImprovements(insight: any, validation: any, type: string): any[] {
    const improvements: any[] = [];

    if (type === 'all' || type === 'relevance') {
      if (validation.qualityScore.relevance < 70) {
        improvements.push({
          type: 'relevance',
          current: validation.qualityScore.relevance,
          target: 85,
          actions: validation.recommendations.improve.filter((r: string) => r.includes('relevant'))
        });
      }
    }

    if (type === 'all' || type === 'actionability') {
      if (validation.qualityScore.actionability < 70) {
        improvements.push({
          type: 'actionability',
          current: validation.qualityScore.actionability,
          target: 80,
          actions: ['Add specific action items', 'Include timelines and owners', 'Define success metrics']
        });
      }
    }

    return improvements;
  }

  private async generateAlternativeInsights(insight: any, validation: any): Promise<any[]> {
    // Generate alternative versions of the insight
    const alternatives: any[] = [];

    if (validation.qualityScore.overall < 60) {
      alternatives.push({
        id: 'alt-1',
        content: `Improved version: Focus on specific actionable recommendations for ${insight.category}`,
        improvements: ['More specific', 'Action-oriented', 'Context-aligned']
      });
    }

    return alternatives;
  }

  private calculateImprovementPotential(validation: any): number {
    const currentScore = validation.qualityScore.overall;
    const maxPossibleImprovement = 95; // Realistic maximum
    return Math.round((maxPossibleImprovement - currentScore) * 0.7); // 70% of gap is realistic
  }
}