import { mean, standardDeviation, quantile } from 'simple-statistics';
import { dbHelpers } from '@/lib/supabase/client';
import { aiModelManager } from '@/lib/ai/models';
import { TimeSeriesData } from '@/lib/forecasting';

export interface AnomalyDetectionOptions {
  method?: 'zscore' | 'iqr' | 'isolation_forest' | 'lstm' | 'ai_detection';
  threshold?: number;
  window_size?: number;
  sensitivity?: 'low' | 'medium' | 'high';
  seasonal_adjustment?: boolean;
  min_anomaly_score?: number;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  explanation?: string;
  metadata?: Record<string, any>;
}

export interface AnomalyDetectionResult {
  anomalies: Array<{
    index: number;
    timestamp: Date | string;
    value: number;
    result: AnomalyResult;
  }>;
  summary: {
    total_anomalies: number;
    anomaly_rate: number;
    severity_distribution: Record<string, number>;
    method_used: string;
    confidence: number;
  };
  recommendations?: string[];
}

class AnomalyDetectionService {
  // Z-Score based anomaly detection
  private zScoreDetection(
    data: number[],
    threshold: number = 3,
    windowSize?: number
  ): Array<{ index: number; score: number; isAnomaly: boolean }> {
    const results: Array<{ index: number; score: number; isAnomaly: boolean }> = [];
    
    if (windowSize && windowSize > 0) {
      // Rolling window Z-score
      for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const window = data.slice(start, i + 1);
        
        if (window.length >= 3) {
          const windowMean = mean(window);
          const windowStd = standardDeviation(window);
          const zScore = windowStd > 0 ? Math.abs((data[i] - windowMean) / windowStd) : 0;
          
          results.push({
            index: i,
            score: zScore,
            isAnomaly: zScore > threshold
          });
        } else {
          results.push({
            index: i,
            score: 0,
            isAnomaly: false
          });
        }
      }
    } else {
      // Global Z-score
      const dataMean = mean(data);
      const dataStd = standardDeviation(data);
      
      data.forEach((value, index) => {
        const zScore = dataStd > 0 ? Math.abs((value - dataMean) / dataStd) : 0;
        results.push({
          index,
          score: zScore,
          isAnomaly: zScore > threshold
        });
      });
    }
    
    return results;
  }

  // Interquartile Range (IQR) based detection
  private iqrDetection(
    data: number[],
    multiplier: number = 1.5
  ): Array<{ index: number; score: number; isAnomaly: boolean }> {
    const q1 = quantile(data, 0.25);
    const q3 = quantile(data, 0.75);
    const iqr = q3 - q1;
    const lowerBound = q1 - multiplier * iqr;
    const upperBound = q3 + multiplier * iqr;
    
    return data.map((value, index) => {
      const isAnomaly = value < lowerBound || value > upperBound;
      const score = isAnomaly 
        ? Math.max(
            Math.abs(value - upperBound) / iqr,
            Math.abs(value - lowerBound) / iqr
          )
        : 0;
      
      return { index, score, isAnomaly };
    });
  }

  // Simple isolation forest simulation
  private isolationForestDetection(
    data: number[],
    contamination: number = 0.1
  ): Array<{ index: number; score: number; isAnomaly: boolean }> {
    // Simplified isolation forest - in production, use a proper implementation
    const scores = data.map((value, index) => {
      // Calculate isolation score based on distance from local neighbors
      const neighbors = data.slice(Math.max(0, index - 5), index + 6);
      const neighborMean = mean(neighbors);
      const neighborStd = standardDeviation(neighbors);
      
      const isolationScore = neighborStd > 0 ? Math.abs((value - neighborMean) / neighborStd) : 0;
      return { index, score: isolationScore };
    });
    
    // Sort by score and mark top percentile as anomalies
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);
    const threshold = sortedScores[Math.floor(data.length * contamination)]?.score || 0;
    
    return scores.map(item => ({
      ...item,
      isAnomaly: item.score >= threshold
    }));
  }

  // AI-powered anomaly detection
  private async aiAnomalyDetection(
    data: TimeSeriesData[],
    context?: string
  ): Promise<Array<{ index: number; score: number; isAnomaly: boolean; explanation?: string }>> {
    const values = data.map(d => d.value);
    const recentData = values.slice(-50); // Use last 50 points for analysis
    
    const prompt = `As a data scientist, analyze this time series data for anomalies. 

Data: ${recentData.join(', ')}
${context ? `Context: ${context}` : ''}

For each data point, determine if it's an anomaly and provide a score (0-1).
Consider:
1. Statistical outliers
2. Trend breaks
3. Seasonal deviations
4. Context-specific patterns

Return JSON format: {"anomalies": [{"index": 45, "score": 0.8, "explanation": "sudden spike"}]}`;

    try {
      const response = await aiModelManager.generateText(
        'gpt-3.5-turbo',
        prompt,
        {
          maxTokens: 500,
          temperature: 0.2
        }
      );

      const result = JSON.parse(response);
      const anomalies = result.anomalies || [];
      
      // Map AI results to our format
      return values.map((_, index) => {
        const aiAnomaly = anomalies.find((a: any) => a.index === index);
        return {
          index,
          score: aiAnomaly?.score || 0,
          isAnomaly: (aiAnomaly?.score || 0) > 0.7,
          explanation: aiAnomaly?.explanation
        };
      });
    } catch (error) {
      console.error('AI anomaly detection error:', error);
      // Fallback to Z-score
      return this.zScoreDetection(values, 2.5);
    }
  }

  // Seasonal decomposition for seasonal anomaly detection
  private detectSeasonalAnomalies(
    data: number[],
    seasonLength: number = 12,
    threshold: number = 2
  ): Array<{ index: number; score: number; isAnomaly: boolean }> {
    if (data.length < seasonLength * 2) {
      return this.zScoreDetection(data, threshold);
    }

    const seasonalComponents: number[] = [];
    const trendComponents: number[] = [];
    const residualComponents: number[] = [];

    // Simple seasonal decomposition
    for (let i = 0; i < data.length; i++) {
      // Calculate seasonal component
      const seasonalIndices = [];
      for (let j = i % seasonLength; j < data.length; j += seasonLength) {
        seasonalIndices.push(j);
      }
      const seasonalValues = seasonalIndices.map(idx => data[idx]);
      const seasonal = mean(seasonalValues);

      // Calculate trend (simple moving average)
      const trendStart = Math.max(0, i - Math.floor(seasonLength / 2));
      const trendEnd = Math.min(data.length, i + Math.floor(seasonLength / 2) + 1);
      const trendWindow = data.slice(trendStart, trendEnd);
      const trend = mean(trendWindow);

      // Calculate residual
      const residual = data[i] - seasonal - trend;

      seasonalComponents.push(seasonal);
      trendComponents.push(trend);
      residualComponents.push(residual);
    }

    // Detect anomalies in residuals
    return this.zScoreDetection(residualComponents, threshold);
  }

  // Main anomaly detection method
  async detectAnomalies(
    data: TimeSeriesData[],
    options: AnomalyDetectionOptions = {}
  ): Promise<AnomalyDetectionResult> {
    const {
      method = 'zscore',
      threshold = 3,
      window_size,
      sensitivity = 'medium',
      seasonal_adjustment = false,
      min_anomaly_score = 0.5
    } = options;

    const values = data.map(d => d.value);
    const timestamps = data.map(d => new Date(d.timestamp));

    // Adjust threshold based on sensitivity
    const sensitivityMultipliers = {
      low: 1.5,
      medium: 1.0,
      high: 0.7
    };
    const adjustedThreshold = threshold * sensitivityMultipliers[sensitivity];

    let detectionResults: Array<{ index: number; score: number; isAnomaly: boolean; explanation?: string }> = [];

    // Apply anomaly detection method
    switch (method) {
      case 'zscore':
        detectionResults = this.zScoreDetection(values, adjustedThreshold, window_size);
        break;

      case 'iqr':
        detectionResults = this.iqrDetection(values, adjustedThreshold);
        break;

      case 'isolation_forest':
        detectionResults = this.isolationForestDetection(values, min_anomaly_score);
        break;

      case 'ai_detection':
        detectionResults = await this.aiAnomalyDetection(data);
        break;

      default:
        throw new Error(`Unsupported anomaly detection method: ${method}`);
    }

    // Apply seasonal adjustment if requested
    if (seasonal_adjustment && method !== 'ai_detection') {
      const seasonalResults = this.detectSeasonalAnomalies(values, 12, adjustedThreshold);
      // Combine results (anomaly if either method detects it)
      detectionResults = detectionResults.map((result, index) => ({
        ...result,
        isAnomaly: result.isAnomaly || seasonalResults[index]?.isAnomaly || false,
        score: Math.max(result.score, seasonalResults[index]?.score || 0)
      }));
    }

    // Calculate severity based on score
    const anomalies = detectionResults
      .map((result, index) => ({
        index,
        timestamp: timestamps[index],
        value: values[index],
        result: {
          ...result,
          severity: this.calculateSeverity(result.score),
          explanation: result.explanation || this.generateExplanation(result, values[index], values)
        } as AnomalyResult
      }))
      .filter(item => item.result.isAnomaly && item.result.score >= min_anomaly_score);

    // Calculate summary statistics
    const severityDistribution = anomalies.reduce((acc, anomaly) => {
      acc[anomaly.result.severity] = (acc[anomaly.result.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summary = {
      total_anomalies: anomalies.length,
      anomaly_rate: (anomalies.length / data.length) * 100,
      severity_distribution: severityDistribution,
      method_used: method,
      confidence: this.calculateConfidence(method, anomalies.length, data.length)
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(anomalies, summary);

    return {
      anomalies,
      summary,
      recommendations
    };
  }

  // Calculate severity based on anomaly score
  private calculateSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 5) return 'critical';
    if (score >= 3) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  // Generate explanation for anomaly
  private generateExplanation(
    result: { score: number; isAnomaly: boolean },
    value: number,
    allValues: number[]
  ): string {
    const valueMean = mean(allValues);
    const valueStd = standardDeviation(allValues);
    
    if (value > valueMean + 2 * valueStd) {
      return `Value ${value.toFixed(2)} is significantly higher than expected (${(value - valueMean).toFixed(2)} above mean)`;
    } else if (value < valueMean - 2 * valueStd) {
      return `Value ${value.toFixed(2)} is significantly lower than expected (${(valueMean - value).toFixed(2)} below mean)`;
    } else {
      return `Value ${value.toFixed(2)} shows unusual pattern (anomaly score: ${result.score.toFixed(2)})`;
    }
  }

  // Calculate confidence in detection
  private calculateConfidence(method: string, anomalyCount: number, dataLength: number): number {
    const methodConfidence = {
      zscore: 0.8,
      iqr: 0.75,
      isolation_forest: 0.85,
      ai_detection: 0.9
    }[method] || 0.7;

    // Adjust confidence based on anomaly rate
    const anomalyRate = anomalyCount / dataLength;
    let rateAdjustment = 1.0;
    
    if (anomalyRate > 0.2) rateAdjustment = 0.8; // Too many anomalies might indicate noise
    if (anomalyRate < 0.01) rateAdjustment = 0.9; // Very few anomalies might be missed

    return Math.min(methodConfidence * rateAdjustment, 1.0);
  }

  // Generate actionable recommendations
  private generateRecommendations(
    anomalies: AnomalyDetectionResult['anomalies'],
    summary: AnomalyDetectionResult['summary']
  ): string[] {
    const recommendations: string[] = [];

    if (summary.total_anomalies === 0) {
      recommendations.push('No anomalies detected. Data appears normal.');
      return recommendations;
    }

    if (summary.anomaly_rate > 20) {
      recommendations.push('High anomaly rate detected. Consider reviewing data quality or adjusting detection sensitivity.');
    }

    if (summary.severity_distribution.critical > 0) {
      recommendations.push('Critical anomalies found. Immediate investigation recommended.');
    }

    if (summary.severity_distribution.high > 3) {
      recommendations.push('Multiple high-severity anomalies detected. Review underlying processes.');
    }

    // Pattern-based recommendations
    const recentAnomalies = anomalies.filter(a => {
      const anomalyTime = new Date(a.timestamp).getTime();
      const now = Date.now();
      return now - anomalyTime < 7 * 24 * 60 * 60 * 1000; // Last 7 days
    });

    if (recentAnomalies.length > anomalies.length * 0.5) {
      recommendations.push('Anomalies are concentrated in recent time period. Monitor current conditions closely.');
    }

    if (summary.confidence < 0.7) {
      recommendations.push('Detection confidence is moderate. Consider using multiple detection methods for validation.');
    }

    return recommendations;
  }

  // Real-time anomaly detection for streaming data
  async detectRealTimeAnomaly(
    newDataPoint: TimeSeriesData,
    historicalData: TimeSeriesData[],
    options: AnomalyDetectionOptions = {}
  ): Promise<AnomalyResult> {
    const { method = 'zscore', threshold = 3, window_size = 50 } = options;

    // Use recent historical data for context
    const contextData = historicalData.slice(-window_size);
    const values = contextData.map(d => d.value);
    values.push(newDataPoint.value);

    // Detect anomaly for the new point (last in the array)
    let detectionResult;
    
    switch (method) {
      case 'zscore':
        const zResults = this.zScoreDetection(values, threshold);
        detectionResult = zResults[zResults.length - 1];
        break;

      case 'iqr':
        const iqrResults = this.iqrDetection(values, threshold);
        detectionResult = iqrResults[iqrResults.length - 1];
        break;

      default:
        detectionResult = this.zScoreDetection(values, threshold)[values.length - 1];
    }

    return {
      isAnomaly: detectionResult.isAnomaly,
      score: detectionResult.score,
      severity: this.calculateSeverity(detectionResult.score),
      explanation: this.generateExplanation(detectionResult, newDataPoint.value, values),
      metadata: {
        method,
        timestamp: newDataPoint.timestamp,
        contextSize: contextData.length
      }
    };
  }

  // Save anomaly detection configuration
  async saveAnomalyDetectionConfig(
    userId: string,
    name: string,
    dataSource: string,
    config: AnomalyDetectionOptions
  ) {
    return await dbHelpers.createAnomalyDetection({
      user_id: userId,
      name,
      data_source: dataSource,
      threshold_config: config as any
    });
  }

  // Batch anomaly detection for multiple datasets
  async batchDetectAnomalies(
    datasets: Array<{
      id: string;
      data: TimeSeriesData[];
      options?: AnomalyDetectionOptions;
    }>
  ): Promise<Array<{ id: string; result: AnomalyDetectionResult }>> {
    const results = [];

    for (const dataset of datasets) {
      try {
        const result = await this.detectAnomalies(dataset.data, dataset.options);
        results.push({ id: dataset.id, result });
      } catch (error) {
        console.error(`Error detecting anomalies in dataset ${dataset.id}:`, error);
        results.push({
          id: dataset.id,
          result: {
            anomalies: [],
            summary: {
              total_anomalies: 0,
              anomaly_rate: 0,
              severity_distribution: {},
              method_used: 'error',
              confidence: 0
            },
            recommendations: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
          }
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const anomalyDetectionService = new AnomalyDetectionService();

// Utility functions for anomaly detection
export const anomalyUtils = {
  // Convert anomaly results to alerts
  generateAlerts: (anomalies: AnomalyDetectionResult['anomalies']) => {
    return anomalies
      .filter(a => a.result.severity === 'high' || a.result.severity === 'critical')
      .map(anomaly => ({
        id: `anomaly_${anomaly.index}_${Date.now()}`,
        timestamp: anomaly.timestamp,
        severity: anomaly.result.severity,
        message: `Anomaly detected: ${anomaly.result.explanation}`,
        value: anomaly.value,
        score: anomaly.result.score
      }));
  },

  // Calculate anomaly trends
  calculateAnomalyTrends: (
    results: AnomalyDetectionResult[],
    timeWindow: 'day' | 'week' | 'month' = 'week'
  ) => {
    const trends = {
      increasing: false,
      anomaly_rate_change: 0,
      severity_trends: {} as Record<string, number>
    };

    if (results.length < 2) return trends;

    const recent = results[results.length - 1];
    const previous = results[results.length - 2];

    trends.anomaly_rate_change = recent.summary.anomaly_rate - previous.summary.anomaly_rate;
    trends.increasing = trends.anomaly_rate_change > 0;

    // Calculate severity trends
    Object.keys(recent.summary.severity_distribution).forEach(severity => {
      const recentCount = recent.summary.severity_distribution[severity] || 0;
      const previousCount = previous.summary.severity_distribution[severity] || 0;
      trends.severity_trends[severity] = recentCount - previousCount;
    });

    return trends;
  },

  // Filter anomalies by criteria
  filterAnomalies: (
    anomalies: AnomalyDetectionResult['anomalies'],
    criteria: {
      severity?: Array<'low' | 'medium' | 'high' | 'critical'>;
      timeRange?: { start: Date; end: Date };
      minScore?: number;
    }
  ) => {
    return anomalies.filter(anomaly => {
      if (criteria.severity && !criteria.severity.includes(anomaly.result.severity)) {
        return false;
      }

      if (criteria.timeRange) {
        const anomalyTime = new Date(anomaly.timestamp);
        if (anomalyTime < criteria.timeRange.start || anomalyTime > criteria.timeRange.end) {
          return false;
        }
      }

      if (criteria.minScore && anomaly.result.score < criteria.minScore) {
        return false;
      }

      return true;
    });
  }
}; 