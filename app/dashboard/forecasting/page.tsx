import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3 } from 'lucide-react';

export default function ForecastingPage() {
  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Forecasting</h1>
        <p className='text-muted-foreground'>AI-powered time series forecasting and predictions</p>
      </div>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='size-5' />
              Create New Forecast
            </CardTitle>
            <CardDescription>Upload your data and generate AI-powered forecasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>Forecast Type</label>
                  <select className='w-full p-2 border rounded-md'>
                    <option>Time Series</option>
                    <option>Sales Prediction</option>
                    <option>Demand Forecasting</option>
                    <option>Trend Analysis</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>Time Period</label>
                  <select className='w-full p-2 border rounded-md'>
                    <option>Next 30 days</option>
                    <option>Next 3 months</option>
                    <option>Next 6 months</option>
                    <option>Next year</option>
                  </select>
                </div>
              </div>
              <Button className='w-full'>
                <TrendingUp className='size-4 mr-2' />
                Generate Forecast
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='size-5' />
              Recent Forecasts
            </CardTitle>
            <CardDescription>Your previously generated forecasts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-muted-foreground'>
              <BarChart3 className='size-12 mx-auto mb-4 opacity-50' />
              <p>No forecasts found</p>
              <p className='text-sm'>Create your first forecast to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
