'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Upload,
  Download,
  Play,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  LineChart,
  Calendar,
  FileText,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

interface DataPoint {
  date: string;
  value: number;
  predicted?: number;
  anomaly?: boolean;
  confidence?: number;
}

interface ForecastResult {
  id: string;
  name: string;
  data: DataPoint[];
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
    accuracy: number;
  };
  anomalies: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: boolean;
  timestamp: Date;
}

const SAMPLE_DATA: DataPoint[] = [
  { date: '2024-01-01', value: 100 },
  { date: '2024-01-02', value: 105 },
  { date: '2024-01-03', value: 95 },
  { date: '2024-01-04', value: 110 },
  { date: '2024-01-05', value: 108 },
  { date: '2024-01-06', value: 120, anomaly: true },
  { date: '2024-01-07', value: 98 },
  { date: '2024-01-08', value: 102 },
  { date: '2024-01-09', value: 115 },
  { date: '2024-01-10', value: 118 },
];

const FORECAST_MODELS = [
  {
    id: 'arima',
    name: 'ARIMA',
    description: 'Auto-Regressive Integrated Moving Average',
    complexity: 'Medium',
    accuracy: '85%',
    useCase: 'Time series with trends and seasonality',
  },
  {
    id: 'prophet',
    name: 'Prophet',
    description: "Facebook's forecasting tool",
    complexity: 'Low',
    accuracy: '82%',
    useCase: 'Business time series with strong seasonality',
  },
  {
    id: 'lstm',
    name: 'LSTM Neural Network',
    description: 'Long Short-Term Memory deep learning model',
    complexity: 'High',
    accuracy: '88%',
    useCase: 'Complex patterns and non-linear relationships',
  },
  {
    id: 'linear_regression',
    name: 'Linear Regression',
    description: 'Simple linear trend forecasting',
    complexity: 'Low',
    accuracy: '75%',
    useCase: 'Basic trend analysis',
  },
];

const ANOMALY_METHODS = [
  {
    id: 'isolation_forest',
    name: 'Isolation Forest',
    description: 'Unsupervised anomaly detection',
    sensitivity: 'Medium',
  },
  {
    id: 'statistical',
    name: 'Statistical (Z-Score)',
    description: 'Statistical outlier detection',
    sensitivity: 'High',
  },
  {
    id: 'dbscan',
    name: 'DBSCAN',
    description: 'Density-based clustering',
    sensitivity: 'Low',
  },
];

export default function ForecastingPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'configure' | 'results'>('upload');
  const [uploadedData, setUploadedData] = useState<DataPoint[]>([]);
  const [selectedModel, setSelectedModel] = useState('arima');
  const [selectedAnomalyMethod, setSelectedAnomalyMethod] = useState('isolation_forest');
  const [forecastHorizon, setForecastHorizon] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ForecastResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ForecastResult | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (file.name.endsWith('.csv')) {
          parseCsvData(content);
        } else if (file.name.endsWith('.json')) {
          parseJsonData(content);
        }
      } catch (error) {
        alert('Error parsing file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const parseCsvData = (content: string) => {
    const lines = content.split('\n').filter((line) => line.trim());
    const headers = lines[0].split(',').map((h) => h.trim());

    const data: DataPoint[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      if (values.length >= 2) {
        data.push({
          date: values[0],
          value: parseFloat(values[1]) || 0,
        });
      }
    }

    setUploadedData(data);
    setActiveTab('configure');
  };

  const parseJsonData = (content: string) => {
    const jsonData = JSON.parse(content);
    if (Array.isArray(jsonData)) {
      const data: DataPoint[] = jsonData.map((item) => ({
        date: item.date || item.timestamp || new Date().toISOString(),
        value: parseFloat(item.value || item.amount || 0),
      }));
      setUploadedData(data);
      setActiveTab('configure');
    }
  };

  const useSampleData = () => {
    setUploadedData(SAMPLE_DATA);
    setActiveTab('configure');
  };

  const runForecast = async () => {
    if (uploadedData.length === 0) return;

    setIsProcessing(true);

    try {
      // Simulate API call for forecasting
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generate mock forecast results
      const forecastData = generateMockForecast(uploadedData);
      const newResult: ForecastResult = {
        id: Date.now().toString(),
        name: `${selectedModel.toUpperCase()} Forecast - ${new Date().toLocaleDateString()}`,
        data: forecastData,
        metrics: {
          mae: Math.random() * 10 + 5,
          rmse: Math.random() * 15 + 8,
          mape: Math.random() * 20 + 10,
          accuracy: Math.random() * 20 + 80,
        },
        anomalies: forecastData.filter((d) => d.anomaly).length,
        trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
        seasonality: Math.random() > 0.5,
        timestamp: new Date(),
      };

      setResults((prev) => [newResult, ...prev]);
      setCurrentResult(newResult);
      setActiveTab('results');
    } catch (error) {
      alert('Forecasting failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMockForecast = (data: DataPoint[]): DataPoint[] => {
    const result = [...data];
    const lastValue = data[data.length - 1]?.value || 100;

    // Add forecast points
    for (let i = 0; i < forecastHorizon; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);

      const trend = Math.random() * 10 - 5;
      const noise = Math.random() * 20 - 10;
      const predicted = lastValue + trend * i + noise;

      result.push({
        date: date.toISOString().split('T')[0],
        value: 0, // No actual value for future points
        predicted: Math.max(0, predicted),
        confidence: Math.random() * 0.3 + 0.7,
        anomaly: Math.random() < 0.05, // 5% chance of anomaly
      });
    }

    // Add anomaly detection to historical data
    const threshold = data.reduce((sum, d) => sum + d.value, 0) / data.length;
    result.forEach((point, index) => {
      if (index < data.length && Math.abs(point.value - threshold) > threshold * 0.5) {
        point.anomaly = true;
      }
    });

    return result;
  };

  const downloadResults = () => {
    if (!currentResult) return;

    const csvContent = [
      'Date,Actual,Predicted,Anomaly,Confidence',
      ...currentResult.data.map(
        (d) => `${d.date},${d.value || ''},${d.predicted || ''},${d.anomaly || false},${d.confidence || ''}`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forecast_results_${Date.now()}.csv`;
    a.click();
  };

  const renderChart = (data: DataPoint[]) => {
    const maxValue = Math.max(...data.map((d) => Math.max(d.value || 0, d.predicted || 0)));

    return (
      <div className='h-64 border rounded-lg p-4 bg-muted/20'>
        <div className='flex items-end justify-between h-full space-x-1'>
          {data.slice(-50).map((point, index) => {
            const actualHeight = point.value ? (point.value / maxValue) * 200 : 0;
            const predictedHeight = point.predicted ? (point.predicted / maxValue) * 200 : 0;

            return (
              <div key={index} className='flex flex-col items-center flex-1 min-w-0'>
                <div className='flex flex-col justify-end h-full space-y-1'>
                  {point.predicted && (
                    <div
                      className='bg-blue-400 rounded-t-sm opacity-70 min-h-1'
                      style={{ height: `${predictedHeight}px` }}
                      title={`Predicted: ${point.predicted.toFixed(2)}`}
                    />
                  )}
                  {point.value > 0 && (
                    <div
                      className={`rounded-t-sm min-h-1 ${point.anomaly ? 'bg-red-500' : 'bg-primary'}`}
                      style={{ height: `${actualHeight}px` }}
                      title={`Actual: ${point.value.toFixed(2)}${point.anomaly ? ' (Anomaly)' : ''}`}
                    />
                  )}
                </div>
                <span className='text-xs text-muted-foreground mt-1 truncate'>
                  {new Date(point.date).getMonth() + 1}/{new Date(point.date).getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className='p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex items-center mb-6'>
        <Button variant='ghost' asChild className='mr-4'>
          <Link href='/dashboard/explore'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Explore
          </Link>
        </Button>
        <div>
          <h1 className='text-3xl font-bold flex items-center'>
            <TrendingUp className='w-8 h-8 mr-3 text-primary' />
            Forecasting & Anomaly Detection
          </h1>
          <p className='text-muted-foreground'>
            Predict future trends and detect anomalies in your time series data
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex space-x-4 mb-6'>
        <Button
          variant={activeTab === 'upload' ? 'default' : 'outline'}
          onClick={() => setActiveTab('upload')}>
          <Upload className='w-4 h-4 mr-2' />
          Upload Data
        </Button>
        <Button
          variant={activeTab === 'configure' ? 'default' : 'outline'}
          onClick={() => setActiveTab('configure')}
          disabled={uploadedData.length === 0}>
          <Settings className='w-4 h-4 mr-2' />
          Configure Models
        </Button>
        <Button
          variant={activeTab === 'results' ? 'default' : 'outline'}
          onClick={() => setActiveTab('results')}
          disabled={results.length === 0}>
          <BarChart3 className='w-4 h-4 mr-2' />
          Results ({results.length})
        </Button>
      </div>

      {activeTab === 'upload' && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Time Series Data</CardTitle>
              <CardDescription>Upload CSV or JSON files with date and value columns</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='border-2 border-dashed border-border rounded-lg p-8 text-center'>
                <Upload className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                <h3 className='text-lg font-semibold mb-2'>Drag & drop your data file</h3>
                <p className='text-muted-foreground mb-4'>Support for CSV and JSON formats</p>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.csv,.json'
                  onChange={handleFileUpload}
                  className='hidden'
                />
                <Button onClick={() => fileInputRef.current?.click()}>Choose File</Button>
              </div>

              <div className='text-center'>
                <p className='text-sm text-muted-foreground mb-2'>Or try with sample data</p>
                <Button variant='outline' onClick={useSampleData}>
                  Use Sample Dataset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Format Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Data Format Guide</CardTitle>
              <CardDescription>Required format for your time series data</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h4 className='font-medium mb-2'>CSV Format:</h4>
                <div className='bg-muted p-3 rounded text-sm font-mono'>
                  date,value
                  <br />
                  2024-01-01,100
                  <br />
                  2024-01-02,105
                  <br />
                  2024-01-03,95
                </div>
              </div>

              <div>
                <h4 className='font-medium mb-2'>JSON Format:</h4>
                <div className='bg-muted p-3 rounded text-sm font-mono'>
                  [<br />
                  &nbsp;&nbsp;{'{'}"date": "2024-01-01", "value": 100{'}'},<br />
                  &nbsp;&nbsp;{'{'}"date": "2024-01-02", "value": 105{'}'}
                  <br />]
                </div>
              </div>

              <div className='space-y-2 text-sm'>
                <h4 className='font-medium'>Requirements:</h4>
                <ul className='list-disc list-inside space-y-1 text-muted-foreground'>
                  <li>Date column in YYYY-MM-DD format</li>
                  <li>Numeric value column</li>
                  <li>At least 10 data points</li>
                  <li>Chronologically ordered data</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'configure' && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Configuration Panel */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Data Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>{uploadedData.length} data points loaded</CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedData.length > 0 && renderChart(uploadedData)}
                <div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>First Date:</span>
                    <p className='font-medium'>{uploadedData[0]?.date}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Last Date:</span>
                    <p className='font-medium'>{uploadedData[uploadedData.length - 1]?.date}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Min Value:</span>
                    <p className='font-medium'>{Math.min(...uploadedData.map((d) => d.value)).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Max Value:</span>
                    <p className='font-medium'>{Math.max(...uploadedData.map((d) => d.value)).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Model Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Forecasting Models</CardTitle>
                <CardDescription>Choose the best model for your data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {FORECAST_MODELS.map((model) => (
                    <div
                      key={model.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedModel === model.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedModel(model.id)}>
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-medium'>{model.name}</h4>
                        <div className='flex space-x-2'>
                          <Badge variant='outline' className='text-xs'>
                            {model.complexity}
                          </Badge>
                          <Badge variant='secondary' className='text-xs'>
                            {model.accuracy}
                          </Badge>
                        </div>
                      </div>
                      <p className='text-sm text-muted-foreground mb-2'>{model.description}</p>
                      <p className='text-xs text-muted-foreground'>{model.useCase}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Anomaly Detection */}
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Detection</CardTitle>
                <CardDescription>Configure outlier detection methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {ANOMALY_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnomalyMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedAnomalyMethod(method.id)}>
                      <h4 className='font-medium mb-2'>{method.name}</h4>
                      <p className='text-sm text-muted-foreground mb-2'>{method.description}</p>
                      <Badge variant='outline' className='text-xs'>
                        {method.sensitivity} Sensitivity
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className='space-y-6'>
            {/* Forecast Horizon */}
            <Card>
              <CardHeader>
                <CardTitle>Forecast Settings</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>Forecast Horizon (days)</label>
                  <input
                    type='number'
                    value={forecastHorizon}
                    onChange={(e) => setForecastHorizon(parseInt(e.target.value) || 30)}
                    min='1'
                    max='365'
                    className='w-full p-2 border border-input rounded'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>Number of future periods to predict</p>
                </div>

                <div className='space-y-2'>
                  <label className='flex items-center space-x-2'>
                    <input type='checkbox' defaultChecked />
                    <span className='text-sm'>Include confidence intervals</span>
                  </label>
                  <label className='flex items-center space-x-2'>
                    <input type='checkbox' defaultChecked />
                    <span className='text-sm'>Detect seasonality</span>
                  </label>
                  <label className='flex items-center space-x-2'>
                    <input type='checkbox' defaultChecked />
                    <span className='text-sm'>Remove outliers before training</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Run Forecast */}
            <Card>
              <CardHeader>
                <CardTitle>Execute Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={runForecast}
                  disabled={isProcessing || uploadedData.length === 0}
                  className='w-full'>
                  {isProcessing ? (
                    <>
                      <div className='w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className='w-4 h-4 mr-2' />
                      Run Forecast
                    </>
                  )}
                </Button>

                {isProcessing && (
                  <div className='mt-4 space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>Training model...</span>
                      <span>60%</span>
                    </div>
                    <div className='w-full bg-muted rounded-full h-2'>
                      <div
                        className='bg-primary h-2 rounded-full animate-pulse'
                        style={{ width: '60%' }}></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'results' && currentResult && (
        <div className='space-y-6'>
          {/* Results Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-semibold'>{currentResult.name}</h2>
              <p className='text-muted-foreground'>Generated on {currentResult.timestamp.toLocaleString()}</p>
            </div>
            <div className='flex space-x-2'>
              <Button variant='outline' onClick={downloadResults}>
                <Download className='w-4 h-4 mr-2' />
                Export Results
              </Button>
              <Button variant='outline'>
                <FileText className='w-4 h-4 mr-2' />
                Generate Report
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Accuracy</p>
                    <p className='text-2xl font-bold'>{currentResult.metrics.accuracy.toFixed(1)}%</p>
                  </div>
                  <BarChart3 className='w-8 h-8 text-green-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Anomalies</p>
                    <p className='text-2xl font-bold text-red-500'>{currentResult.anomalies}</p>
                  </div>
                  <AlertTriangle className='w-8 h-8 text-red-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>MAPE</p>
                    <p className='text-2xl font-bold'>{currentResult.metrics.mape.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className='w-8 h-8 text-blue-500' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Trend</p>
                    <p className='text-sm font-medium capitalize'>{currentResult.trend}</p>
                  </div>
                  <LineChart className='w-8 h-8 text-purple-500' />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Forecast Visualization</CardTitle>
              <CardDescription>
                Historical data (blue), predictions (light blue), anomalies (red)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderChart(currentResult.data)}

              <div className='flex items-center justify-center space-x-6 mt-4 text-sm'>
                <div className='flex items-center space-x-2'>
                  <div className='w-4 h-4 bg-primary rounded'></div>
                  <span>Historical Data</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-4 h-4 bg-blue-400 rounded'></div>
                  <span>Forecast</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='w-4 h-4 bg-red-500 rounded'></div>
                  <span>Anomalies</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between'>
                  <span>Mean Absolute Error (MAE)</span>
                  <span className='font-medium'>{currentResult.metrics.mae.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Root Mean Square Error (RMSE)</span>
                  <span className='font-medium'>{currentResult.metrics.rmse.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Mean Absolute Percentage Error (MAPE)</span>
                  <span className='font-medium'>{currentResult.metrics.mape.toFixed(2)}%</span>
                </div>
                <div className='flex justify-between'>
                  <span>Forecast Accuracy</span>
                  <span className='font-medium'>{currentResult.metrics.accuracy.toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Insights</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex justify-between'>
                  <span>Trend Direction</span>
                  <Badge
                    className={
                      currentResult.trend === 'increasing'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }>
                    {currentResult.trend}
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span>Seasonality Detected</span>
                  <Badge variant={currentResult.seasonality ? 'default' : 'secondary'}>
                    {currentResult.seasonality ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span>Anomalies Found</span>
                  <span className='font-medium text-red-500'>{currentResult.anomalies} points</span>
                </div>
                <div className='flex justify-between'>
                  <span>Data Quality</span>
                  <Badge className='bg-green-100 text-green-700'>Good</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Previous Results */}
          {results.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Forecasts</CardTitle>
                <CardDescription>Compare with previous runs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {results.slice(1).map((result) => (
                    <div
                      key={result.id}
                      className='flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50'
                      onClick={() => setCurrentResult(result)}>
                      <div>
                        <p className='font-medium'>{result.name}</p>
                        <p className='text-sm text-muted-foreground'>{result.timestamp.toLocaleString()}</p>
                      </div>
                      <div className='text-right'>
                        <p className='text-sm font-medium'>{result.metrics.accuracy.toFixed(1)}% accuracy</p>
                        <p className='text-sm text-muted-foreground'>{result.anomalies} anomalies</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
