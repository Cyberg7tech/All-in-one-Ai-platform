import { mean, standardDeviation, linearRegression, linearRegressionLine } from 'simple-statistics';

export interface TimeSeriesData {
  timestamp: Date | string;
  value: number;
  metadata?: Record<string, any>;
}

export interface ForecastResult {
  predictions: TimeSeriesData[];
  confidence: number;
  method: string;
  metadata: {
    mae?: number;  // Mean Absolute Error
    rmse?: number; // Root Mean Square Error
    mape?: number; // Mean Absolute Percentage Error
    trend?: 'increasing' | 'decreasing' | 'stable';
    seasonality?: boolean;
    accuracy?: number;
  };
}

export interface ForecastOptions {
  method?: 'moving_average' | 'linear_regression' | 'exponential_smoothing' | 'arima' | 'ai_forecast';
  periods?: number;
  confidence_level?: number;
  seasonality?: boolean;
  trend?: boolean;
  external_factors?: Record<string, number[]>;
}

class ForecastingService {
  // Simple Moving Average
  private calculateMovingAverage(
    data: number[],
    windowSize: number = 7
  ): number[] {
    const result: number[] = [];
    
    for (let i = windowSize - 1; i < data.length; i++) {
      const window = data.slice(i - windowSize + 1, i + 1);
      result.push(mean(window));
    }
    
    return result;
  }

  // Exponential Smoothing
  private exponentialSmoothing(
    data: number[],
    alpha: number = 0.3
  ): number[] {
    const result: number[] = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      const smoothed = alpha * data[i] + (1 - alpha) * result[i - 1];
      result.push(smoothed);
    }
    
    return result;
  }

  // Linear Regression Forecast
  private linearRegressionForecast(
    data: number[],
    periods: number
  ): { predictions: number[]; r2: number } {
    const points: [number, number][] = data.map((value, index) => [index, value]);
    const regression = linearRegression(points);
    const line = linearRegressionLine(regression);
    
    const predictions: number[] = [];
    for (let i = data.length; i < data.length + periods; i++) {
      predictions.push(line(i));
    }

    // Calculate R-squared
    const predicted = data.map((_, index) => line(index));
    const meanActual = mean(data);
    const ssTotal = data.reduce((sum, actual) => sum + Math.pow(actual - meanActual, 2), 0);
    const ssRes = data.reduce((sum, actual, index) => sum + Math.pow(actual - predicted[index], 2), 0);
    const r2 = 1 - (ssRes / ssTotal);

    return { predictions, r2 };
  }

  // Detect seasonality
  private detectSeasonality(data: number[], period: number = 12): boolean {
    if (data.length < period * 2) return false;

    const seasonal: number[] = [];
    for (let i = 0; i < data.length - period; i++) {
      seasonal.push(data[i + period] - data[i]);
    }

    const seasonalMean = mean(seasonal);
    const seasonalStd = standardDeviation(seasonal);
    
    // Simple seasonality detection: low variance in seasonal differences
    return seasonalStd < Math.abs(seasonalMean) * 0.5;
  }

  // Detect trend
  private detectTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 3) return 'stable';

    const points: [number, number][] = data.map((value, index) => [index, value]);
    const regression = linearRegression(points);
    
    if (Math.abs(regression.m) < 0.01) return 'stable';
    return regression.m > 0 ? 'increasing' : 'decreasing';
  }

  // Calculate forecast accuracy metrics
  private calculateAccuracyMetrics(
    actual: number[],
    predicted: number[]
  ): { mae: number; rmse: number; mape: number } {
    const n = Math.min(actual.length, predicted.length);
    let mae = 0;
    let rmse = 0;
    let mape = 0;

    for (let i = 0; i < n; i++) {
      const error = Math.abs(actual[i] - predicted[i]);
      mae += error;
      rmse += Math.pow(error, 2);
      if (actual[i] !== 0) {
        mape += Math.abs((actual[i] - predicted[i]) / actual[i]);
      }
    }

    return {
      mae: mae / n,
      rmse: Math.sqrt(rmse / n),
      mape: (mape / n) * 100
    };
  }

  // AI-powered forecasting using LLM
  private async aiPoweredForecast(
    data: TimeSeriesData[],
    periods: number,
    context?: string
  ): Promise<number[]> {
    const values = data.map(d => d.value);
    const recentData = values.slice(-20); // Use last 20 points for context

    const prompt = `As a data scientist, analyze this time series data and provide ${periods} future predictions.

Data points (most recent): ${recentData.join(', ')}
${context ? `Context: ${context}` : ''}

Consider:
1. Trend analysis
2. Seasonality patterns
3. Recent changes
4. External factors if mentioned

Provide only the predicted numbers separated by commas, no explanations.`;

    try {
      // Call the real AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-3.5-turbo',
          maxTokens: 200,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'API request failed');
      }

      const predictions = responseData.content
        .split(',')
        .map((s: string) => parseFloat(s.trim()))
        .filter((n: number) => !isNaN(n))
        .slice(0, periods);

      return predictions.length === periods ? predictions : [];
    } catch (error) {
      console.error('AI forecast error:', error);
      return [];
    }
  }

  // Main forecasting method
  async createForecast(
    data: TimeSeriesData[],
    options: ForecastOptions = {}
  ): Promise<ForecastResult> {
    const {
      method = 'moving_average',
      periods = 12,
      confidence_level = 0.95,
      seasonality,
      trend
    } = options;

    const values = data.map(d => d.value);
    const timestamps = data.map(d => new Date(d.timestamp));
    
    // Detect patterns
    const detectedTrend = this.detectTrend(values);
    const detectedSeasonality = this.detectSeasonality(values);

    let predictions: number[] = [];
    let confidence = 0.5;
    let metadata: ForecastResult['metadata'] = {
      trend: trend !== undefined ? (trend ? detectedTrend : 'stable') : detectedTrend,
      seasonality: seasonality !== undefined ? seasonality : detectedSeasonality
    };

    switch (method) {
      case 'moving_average':
        const movingAvg = this.calculateMovingAverage(values, 7);
        const lastAvg = movingAvg[movingAvg.length - 1];
        predictions = Array(periods).fill(lastAvg);
        confidence = 0.6;
        break;

      case 'exponential_smoothing':
        const smoothed = this.exponentialSmoothing(values);
        const lastSmoothed = smoothed[smoothed.length - 1];
        predictions = Array(periods).fill(lastSmoothed);
        confidence = 0.7;
        break;

      case 'linear_regression':
        const regression = this.linearRegressionForecast(values, periods);
        predictions = regression.predictions;
        confidence = Math.min(regression.r2, 0.95);
        metadata.accuracy = regression.r2;
        break;

      case 'ai_forecast':
        const aiPredictions = await this.aiPoweredForecast(data, periods);
        if (aiPredictions.length === periods) {
          predictions = aiPredictions;
          confidence = 0.8;
        } else {
          // Fallback to linear regression
          const fallback = this.linearRegressionForecast(values, periods);
          predictions = fallback.predictions;
          confidence = fallback.r2 * 0.7; // Lower confidence for fallback
        }
        break;

      default:
        throw new Error(`Unsupported forecasting method: ${method}`);
    }

    // Generate future timestamps
    const lastTimestamp = timestamps[timestamps.length - 1];
    const timeDiff = timestamps.length > 1 
      ? timestamps[timestamps.length - 1].getTime() - timestamps[timestamps.length - 2].getTime()
      : 24 * 60 * 60 * 1000; // Default to 1 day

    const forecastData: TimeSeriesData[] = predictions.map((value, index) => ({
      timestamp: new Date(lastTimestamp.getTime() + (index + 1) * timeDiff),
      value,
      metadata: { forecast: true, method, confidence }
    }));

    // Calculate accuracy metrics if we have enough historical data
    if (values.length > periods) {
      const testData = values.slice(-periods);
      const testPredictions = method === 'linear_regression' 
        ? this.linearRegressionForecast(values.slice(0, -periods), periods).predictions
        : Array(periods).fill(mean(values.slice(0, -periods)));
      
      const accuracyMetrics = this.calculateAccuracyMetrics(testData, testPredictions);
      metadata = { ...metadata, ...accuracyMetrics };
    }

    return {
      predictions: forecastData,
      confidence,
      method,
      metadata
    };
  }

  // Demand forecasting for e-commerce/business
  async demandForecast(
    historicalSales: TimeSeriesData[],
    externalFactors?: {
      promotions?: number[];
      seasonality?: number[];
      economicIndicators?: number[];
    }
  ): Promise<ForecastResult> {
    // Enhanced forecasting considering external factors
    const baseOptions: ForecastOptions = {
      method: 'ai_forecast',
      periods: 12,
      seasonality: true,
      trend: true
    };

    if (externalFactors) {
      baseOptions.external_factors = externalFactors;
    }

    const result = await this.createForecast(historicalSales, baseOptions);
    
    // Adjust predictions based on external factors
    if (externalFactors?.promotions) {
      result.predictions = result.predictions.map((pred, index) => ({
        ...pred,
        value: pred.value * (1 + (externalFactors.promotions![index] || 0))
      }));
    }

    return result;
  }

  // Revenue forecasting
  async revenueForecast(
    revenueData: TimeSeriesData[],
    options: {
      growth_rate?: number;
      seasonal_adjustment?: boolean;
      market_conditions?: 'bullish' | 'bearish' | 'neutral';
    } = {}
  ): Promise<ForecastResult> {
    const { growth_rate, seasonal_adjustment = true, market_conditions = 'neutral' } = options;

    const forecastOptions: ForecastOptions = {
      method: 'linear_regression',
      periods: 12,
      seasonality: seasonal_adjustment,
      trend: true
    };

    const result = await this.createForecast(revenueData, forecastOptions);

    // Apply growth rate if provided
    if (growth_rate) {
      result.predictions = result.predictions.map((pred, index) => ({
        ...pred,
        value: pred.value * Math.pow(1 + growth_rate, index + 1)
      }));
    }

    // Adjust for market conditions
    const marketMultiplier = {
      bullish: 1.1,
      bearish: 0.9,
      neutral: 1.0
    }[market_conditions];

    result.predictions = result.predictions.map(pred => ({
      ...pred,
      value: pred.value * marketMultiplier
    }));

    return result;
  }

  // Save forecasting model to database
  async saveForecastingModel(
    userId: string,
    name: string,
    type: 'timeseries' | 'demand' | 'revenue',
    config: ForecastOptions,
    trainingData: TimeSeriesData[]
  ) {
    // For now, store in localStorage as a demo
    try {
      const models = JSON.parse(localStorage.getItem('forecasting_models') || '[]');
      const model = {
        id: Date.now().toString(),
        userId,
        name,
        type,
        config,
        trainingData,
        createdAt: new Date().toISOString()
      };
      models.push(model);
      localStorage.setItem('forecasting_models', JSON.stringify(models));
      return model;
    } catch (error) {
      console.error('Error saving model:', error);
      throw new Error('Failed to save model');
    }
  }

  // Load and use saved model
  async useForecastingModel(
    modelId: string,
    newData: TimeSeriesData[]
  ): Promise<ForecastResult> {
    try {
      // Load model from localStorage for demo
      const models = JSON.parse(localStorage.getItem('forecasting_models') || '[]');
      const model = models.find((m: any) => m.id === modelId);
      
      if (!model) {
        throw new Error('Model not found');
      }

      // Apply the saved model configuration to new data
      return await this.createForecast(newData, model.config);
    } catch (error) {
      console.error('Error loading model:', error);
      throw new Error('Failed to load model');
    }
  }

  // Batch forecasting for multiple series
  async batchForecast(
    datasets: Array<{
      id: string;
      data: TimeSeriesData[];
      options?: ForecastOptions;
    }>
  ): Promise<Array<{ id: string; result: ForecastResult }>> {
    const results = [];

    for (const dataset of datasets) {
      try {
        const result = await this.createForecast(dataset.data, dataset.options);
        results.push({ id: dataset.id, result });
      } catch (error) {
        console.error(`Error forecasting dataset ${dataset.id}:`, error);
        results.push({ 
          id: dataset.id, 
          result: {
            predictions: [],
            confidence: 0,
            method: 'error',
            metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
          } as ForecastResult
        });
      }
    }

    return results;
  }

  // Cross-validation for model accuracy
  async crossValidateForecast(
    data: TimeSeriesData[],
    method: ForecastOptions['method'] = 'linear_regression',
    folds: number = 5
  ): Promise<{ averageAccuracy: number; accuracyRange: [number, number] }> {
    const foldSize = Math.floor(data.length / folds);
    const accuracies: number[] = [];

    for (let i = 0; i < folds; i++) {
      const testStart = i * foldSize;
      const testEnd = testStart + foldSize;
      
      const trainData = [...data.slice(0, testStart), ...data.slice(testEnd)];
      const testData = data.slice(testStart, testEnd);

      try {
        const result = await this.createForecast(trainData, { 
          method, 
          periods: testData.length 
        });

        const actualValues = testData.map(d => d.value);
        const predictedValues = result.predictions.map(d => d.value);
        
        const metrics = this.calculateAccuracyMetrics(actualValues, predictedValues);
        accuracies.push(1 - (metrics.mape / 100)); // Convert MAPE to accuracy
      } catch (error) {
        console.error(`Cross-validation fold ${i} failed:`, error instanceof Error ? error.message : 'Unknown error');
        accuracies.push(0);
      }
    }

    return {
      averageAccuracy: mean(accuracies),
      accuracyRange: [Math.min(...accuracies), Math.max(...accuracies)]
    };
  }
}

// Export singleton instance
export const forecastingService = new ForecastingService();

// Utility functions for forecasting
export const forecastUtils = {
  // Convert various data formats to TimeSeriesData
  convertToTimeSeries: (
    data: Array<{ date: string | Date; value: number }>,
    metadata?: Record<string, any>
  ): TimeSeriesData[] => {
    return data.map(item => ({
      timestamp: new Date(item.date),
      value: item.value,
      metadata
    }));
  },

  // Generate sample data for testing
  generateSampleData: (
    days: number = 365,
    trend: number = 0.01,
    seasonality: boolean = true,
    noise: number = 0.1
  ): TimeSeriesData[] => {
    const data: TimeSeriesData[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      let value = 100 + i * trend;
      
      if (seasonality) {
        value += 20 * Math.sin((i / 365) * 2 * Math.PI);
        value += 10 * Math.sin((i / 30) * 2 * Math.PI);
      }
      
      value += (Math.random() - 0.5) * noise * value;

      data.push({
        timestamp: date,
        value: Math.max(0, value)
      });
    }

    return data;
  },

  // Smooth data for better forecasting
  smoothData: (data: TimeSeriesData[], windowSize: number = 3): TimeSeriesData[] => {
    if (windowSize <= 1) return data;

    return data.map((item, index) => {
      const start = Math.max(0, index - Math.floor(windowSize / 2));
      const end = Math.min(data.length, start + windowSize);
      const window = data.slice(start, end);
      const smoothedValue = mean(window.map(d => d.value));

      return {
        ...item,
        value: smoothedValue
      };
    });
  }
}; 