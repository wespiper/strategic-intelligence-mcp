// Project initialization and context setup tools
import { v4 as uuidv4 } from 'uuid';
import { StorageAdapter } from '../storage/StorageAdapter.js';
import { BusinessGoal } from '../types/index.js';
import { TechnicalMilestone } from '../intelligence/technicalMilestoneTracker.js';
import { GoalTools } from './goalTools.js';
import { IntelligenceTools } from './intelligenceTools.js';

export interface ProjectContext {
  id: string;
  projectName: string;
  projectDescription: string;
  industry: string;
  businessModel: string;
  stage: string;
  targetMarket?: string;
  competitiveAdvantage?: string;
  keyMetrics: string[];
  strategicPriorities: string[];
  createdAt: string;
  lastUpdated: string;
}

export interface DocumentExtraction {
  id: string;
  documentType: string;
  extractedInfo: {
    businessGoals: ExtractedGoal[];
    technicalMilestones: ExtractedMilestone[];
    competitiveAnalysis: string[];
    marketStrategy: string[];
    productRoadmap: string[];
    financialProjections: string[];
  };
  createdAt: string;
}

export interface ExtractedGoal {
  title: string;
  description: string;
  category: 'revenue' | 'product' | 'market' | 'technical' | 'operational';
  priority: 'high' | 'medium' | 'low';
  timeframe: string;
  metrics?: string[];
}

export interface ExtractedMilestone {
  name: string;
  description: string;
  category: 'architecture' | 'feature' | 'performance' | 'security' | 'integration' | 'infrastructure';
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: string;
  businessImpact: string;
}

export class InitializationTools {
  private storage: StorageAdapter;
  private goalTools: GoalTools;
  private intelligenceTools: IntelligenceTools;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
    this.goalTools = new GoalTools(storage);
    this.intelligenceTools = new IntelligenceTools(storage);
  }

  async initializeProjectContext(params: {
    projectName: string;
    projectDescription: string;
    industry: string;
    businessModel: string;
    stage: string;
    targetMarket?: string;
    competitiveAdvantage?: string;
    keyMetrics?: string[];
    strategicPriorities?: string[];
  }): Promise<{ success: boolean; projectContext: ProjectContext; suggestions: string[] }> {
    
    const projectContext: ProjectContext = {
      id: uuidv4(),
      projectName: params.projectName,
      projectDescription: params.projectDescription,
      industry: params.industry,
      businessModel: params.businessModel,
      stage: params.stage,
      targetMarket: params.targetMarket,
      competitiveAdvantage: params.competitiveAdvantage,
      keyMetrics: params.keyMetrics || [],
      strategicPriorities: params.strategicPriorities || [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Store the project context
    const data = await this.storage.load();
    (data as any).projectContext = projectContext;
    await this.storage.save(data);

    // Generate suggestions based on the project context
    const suggestions = await this.generateSetupSuggestions(projectContext);

    return {
      success: true,
      projectContext,
      suggestions
    };
  }

  async importContextFromDocument(params: {
    documentContent: string;
    documentType: string;
    extractionFocus?: string[];
    createInitialGoals?: boolean;
    createInitialMilestones?: boolean;
  }): Promise<{ success: boolean; extraction: DocumentExtraction; createdGoals: any[]; createdMilestones: any[] }> {
    
    const extraction: DocumentExtraction = {
      id: uuidv4(),
      documentType: params.documentType,
      extractedInfo: await this.extractStrategicInfo(params.documentContent, params.documentType, params.extractionFocus),
      createdAt: new Date().toISOString()
    };

    // Store the extraction
    const data = await this.storage.load();
    if (!(data as any).documentExtractions) (data as any).documentExtractions = [];
    (data as any).documentExtractions.push(extraction);
    await this.storage.save(data);

    const createdGoals: any[] = [];
    const createdMilestones: any[] = [];

    // Optionally create initial goals and milestones
    if (params.createInitialGoals) {
      for (const extractedGoal of extraction.extractedInfo.businessGoals.slice(0, 5)) { // Limit to top 5
        try {
          const goal = await this.goalTools.createBusinessGoal({
            category: extractedGoal.category,
            title: extractedGoal.title,
            description: extractedGoal.description,
            owner: 'Project Lead', // Default owner
            initialMetrics: extractedGoal.metrics?.map(metric => ({
              name: metric,
              type: 'growth' as const,
              target: 100, // Default target
              unit: 'units',
              timeframe: extractedGoal.timeframe || '90-days'
            })) || []
          });
          createdGoals.push(goal);
        } catch (error) {
          console.error('Error creating goal:', error);
        }
      }
    }

    if (params.createInitialMilestones) {
      for (const extractedMilestone of extraction.extractedInfo.technicalMilestones.slice(0, 5)) { // Limit to top 5
        try {
          const milestone = await this.intelligenceTools.createTechnicalMilestone({
            name: extractedMilestone.name,
            description: extractedMilestone.description,
            category: extractedMilestone.category,
            plannedDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Default to 90 days
            effort: this.parseEffortToHours(extractedMilestone.effort),
            complexity: extractedMilestone.priority === 'critical' ? 'critical' : 
                       extractedMilestone.priority === 'high' ? 'high' : 'medium',
            codebaseChanges: ['TBD'], // Default placeholder
            businessContext: {
              strategicImportance: extractedMilestone.priority === 'critical' ? 90 : 
                                 extractedMilestone.priority === 'high' ? 75 : 50,
              customerImpact: extractedMilestone.businessImpact,
              revenueImplication: 0, // Will be configured later
              competitiveAdvantage: 'Strategic capability development',
              marketTiming: 'competitive' as const
            }
          });
          createdMilestones.push(milestone);
        } catch (error) {
          console.error('Error creating milestone:', error);
        }
      }
    }

    return {
      success: true,
      extraction,
      createdGoals,
      createdMilestones
    };
  }

  async quickSetupWizard(params: {
    wizardStep: string;
    responses?: any;
  }): Promise<{ success: boolean; step: string; questions?: any[]; suggestions?: string[]; complete?: boolean }> {
    
    switch (params.wizardStep) {
      case 'start':
        return {
          success: true,
          step: 'basic-info',
          questions: [
            {
              id: 'projectName',
              type: 'text',
              question: 'What is the name of your project?',
              required: true
            },
            {
              id: 'projectDescription',
              type: 'text',
              question: 'Briefly describe your project (1-2 sentences)',
              required: true
            },
            {
              id: 'industry',
              type: 'select',
              question: 'What industry does your project operate in?',
              options: ['saas', 'fintech', 'ecommerce', 'gaming', 'healthcare', 'education', 'enterprise', 'consumer', 'other'],
              required: true
            },
            {
              id: 'businessModel',
              type: 'select',
              question: 'What is your primary business model?',
              options: ['b2b', 'b2c', 'marketplace', 'freemium', 'subscription', 'enterprise', 'advertising', 'transaction-based', 'other'],
              required: true
            },
            {
              id: 'stage',
              type: 'select',
              question: 'What stage is your project currently in?',
              options: ['idea', 'mvp', 'early-stage', 'growth', 'scaling', 'mature'],
              required: true
            }
          ]
        };

      case 'basic-info':
        if (!params.responses) {
          throw new Error('Responses required for basic-info step');
        }
        return {
          success: true,
          step: 'goals',
          questions: [
            {
              id: 'strategicGoals',
              type: 'multitext',
              question: 'What are your top 3-5 strategic goals for the next 6-12 months?',
              placeholder: 'e.g., Reach $10K MRR, Launch mobile app, Acquire 1000 users'
            },
            {
              id: 'keyMetrics',
              type: 'multitext',
              question: 'What key metrics will you track to measure success?',
              placeholder: 'e.g., Monthly Recurring Revenue, Daily Active Users, Conversion Rate'
            },
            {
              id: 'competitiveAdvantage',
              type: 'text',
              question: 'What is your main competitive advantage or differentiator?'
            }
          ]
        };

      case 'goals':
        return {
          success: true,
          step: 'milestones',
          questions: [
            {
              id: 'technicalPriorities',
              type: 'multitext',
              question: 'What are your top technical priorities or milestones?',
              placeholder: 'e.g., API optimization, User dashboard, Payment integration'
            },
            {
              id: 'timeframe',
              type: 'select',
              question: 'What timeframe are you planning for?',
              options: ['3-months', '6-months', '12-months']
            }
          ]
        };

      case 'milestones':
        return {
          success: true,
          step: 'complete',
          complete: true,
          suggestions: [
            'Start by creating your first strategic conversation',
            'Set up regular weekly strategic check-ins',
            'Configure goal progress tracking',
            'Review and refine your business goals',
            'Connect technical milestones to business outcomes'
          ]
        };

      default:
        throw new Error(`Unknown wizard step: ${params.wizardStep}`);
    }
  }

  private async generateSetupSuggestions(projectContext: ProjectContext): Promise<string[]> {
    const suggestions = [
      `Initialize your first strategic conversation for ${projectContext.projectName}`,
      'Create business goals based on your strategic priorities',
      'Set up key metrics tracking for your industry',
      'Define technical milestones aligned with business objectives'
    ];

    // Industry-specific suggestions
    switch (projectContext.industry) {
      case 'saas':
        suggestions.push(
          'Track MRR, churn rate, and customer acquisition cost',
          'Set up milestone for user onboarding optimization',
          'Consider competitive analysis for SaaS market positioning'
        );
        break;
      case 'ecommerce':
        suggestions.push(
          'Monitor conversion rates, average order value, and customer lifetime value',
          'Plan for seasonal demand patterns in your forecasting',
          'Set up milestones for payment and fulfillment systems'
        );
        break;
      case 'fintech':
        suggestions.push(
          'Prioritize security and compliance milestones',
          'Track transaction volume and processing efficiency',
          'Plan for regulatory compliance and audit preparations'
        );
        break;
    }

    // Stage-specific suggestions
    switch (projectContext.stage) {
      case 'mvp':
        suggestions.push(
          'Focus on user validation and product-market fit metrics',
          'Plan rapid iteration cycles for feature development',
          'Set up user feedback collection and analysis'
        );
        break;
      case 'growth':
        suggestions.push(
          'Optimize for scaling metrics and operational efficiency',
          'Plan infrastructure scaling milestones',
          'Set up competitive intelligence monitoring'
        );
        break;
      case 'scaling':
        suggestions.push(
          'Focus on unit economics and profitability metrics',
          'Plan for enterprise features and capabilities',
          'Set up advanced analytics and forecasting'
        );
        break;
    }

    return suggestions;
  }

  private async extractStrategicInfo(
    content: string, 
    documentType: string, 
    extractionFocus?: string[]
  ): Promise<DocumentExtraction['extractedInfo']> {
    
    const extracted = {
      businessGoals: [] as ExtractedGoal[],
      technicalMilestones: [] as ExtractedMilestone[],
      competitiveAnalysis: [] as string[],
      marketStrategy: [] as string[],
      productRoadmap: [] as string[],
      financialProjections: [] as string[]
    };

    // Simple keyword-based extraction (in a real implementation, you'd use more sophisticated NLP)
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract business goals
    if (!extractionFocus || extractionFocus.includes('business-goals') || extractionFocus.includes('all')) {
      for (const line of lines) {
        if (this.isBusinessGoalLine(line)) {
          const goal = this.parseBusinessGoal(line);
          if (goal) extracted.businessGoals.push(goal);
        }
      }
    }

    // Extract technical milestones
    if (!extractionFocus || extractionFocus.includes('technical-milestones') || extractionFocus.includes('all')) {
      for (const line of lines) {
        if (this.isTechnicalMilestoneLine(line)) {
          const milestone = this.parseTechnicalMilestone(line);
          if (milestone) extracted.technicalMilestones.push(milestone);
        }
      }
    }

    // Extract competitive analysis
    if (!extractionFocus || extractionFocus.includes('competitive-analysis') || extractionFocus.includes('all')) {
      for (const line of lines) {
        if (this.isCompetitiveAnalysisLine(line)) {
          extracted.competitiveAnalysis.push(line);
        }
      }
    }

    // Extract market strategy
    if (!extractionFocus || extractionFocus.includes('market-strategy') || extractionFocus.includes('all')) {
      for (const line of lines) {
        if (this.isMarketStrategyLine(line)) {
          extracted.marketStrategy.push(line);
        }
      }
    }

    return extracted;
  }

  private isBusinessGoalLine(line: string): boolean {
    const goalKeywords = ['goal', 'objective', 'target', 'achieve', 'reach', 'increase', 'grow', 'revenue', 'users', 'customers', 'mrr', 'arr'];
    const lowerLine = line.toLowerCase();
    return goalKeywords.some(keyword => lowerLine.includes(keyword)) && 
           (lowerLine.includes('$') || lowerLine.includes('%') || lowerLine.includes('by'));
  }

  private isTechnicalMilestoneLine(line: string): boolean {
    const techKeywords = ['implement', 'build', 'develop', 'create', 'deploy', 'integrate', 'optimize', 'api', 'database', 'frontend', 'backend', 'feature', 'system'];
    const lowerLine = line.toLowerCase();
    return techKeywords.some(keyword => lowerLine.includes(keyword));
  }

  private isCompetitiveAnalysisLine(line: string): boolean {
    const compKeywords = ['competitor', 'competitive', 'vs', 'versus', 'compared to', 'advantage', 'differentiate', 'unique'];
    const lowerLine = line.toLowerCase();
    return compKeywords.some(keyword => lowerLine.includes(keyword));
  }

  private isMarketStrategyLine(line: string): boolean {
    const marketKeywords = ['market', 'customer', 'segment', 'targeting', 'positioning', 'value proposition', 'pricing', 'channel'];
    const lowerLine = line.toLowerCase();
    return marketKeywords.some(keyword => lowerLine.includes(keyword));
  }

  private parseBusinessGoal(line: string): ExtractedGoal | null {
    // Simple parsing - extract title and try to determine category
    const title = line.length > 100 ? line.substring(0, 100) + '...' : line;
    
    let category: ExtractedGoal['category'] = 'operational';
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('revenue') || lowerLine.includes('$') || lowerLine.includes('mrr') || lowerLine.includes('arr')) {
      category = 'revenue';
    } else if (lowerLine.includes('product') || lowerLine.includes('feature') || lowerLine.includes('launch')) {
      category = 'product';
    } else if (lowerLine.includes('market') || lowerLine.includes('customer') || lowerLine.includes('user')) {
      category = 'market';
    } else if (lowerLine.includes('technical') || lowerLine.includes('system') || lowerLine.includes('api')) {
      category = 'technical';
    }

    let priority: ExtractedGoal['priority'] = 'medium';
    if (lowerLine.includes('critical') || lowerLine.includes('urgent') || lowerLine.includes('priority')) {
      priority = 'high';
    }

    return {
      title,
      description: line,
      category,
      priority,
      timeframe: '90-days' // Default timeframe
    };
  }

  private parseTechnicalMilestone(line: string): ExtractedMilestone | null {
    const name = line.length > 80 ? line.substring(0, 80) + '...' : line;
    
    let category: ExtractedMilestone['category'] = 'feature';
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('architecture') || lowerLine.includes('system') || lowerLine.includes('design')) {
      category = 'architecture';
    } else if (lowerLine.includes('performance') || lowerLine.includes('optimize') || lowerLine.includes('speed')) {
      category = 'performance';
    } else if (lowerLine.includes('security') || lowerLine.includes('auth') || lowerLine.includes('encrypt')) {
      category = 'security';
    } else if (lowerLine.includes('integrate') || lowerLine.includes('api') || lowerLine.includes('connect')) {
      category = 'integration';
    } else if (lowerLine.includes('deploy') || lowerLine.includes('infrastructure') || lowerLine.includes('server')) {
      category = 'infrastructure';
    }

    let priority: ExtractedMilestone['priority'] = 'medium';
    if (lowerLine.includes('critical') || lowerLine.includes('urgent')) {
      priority = 'critical';
    } else if (lowerLine.includes('important') || lowerLine.includes('priority')) {
      priority = 'high';
    }

    return {
      name,
      description: line,
      category,
      priority,
      effort: 'medium',
      businessImpact: 'Supports overall project objectives'
    };
  }

  private parseEffortToHours(effort: string): number {
    switch (effort.toLowerCase()) {
      case 'low': return 20;
      case 'medium': return 80;
      case 'high': return 200;
      default: return 80;
    }
  }
}