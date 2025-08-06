import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Activity, Shield, Upload } from 'lucide-react';

export default function AnomaliesPage() {
  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Anomaly Detection</h1>
        <p className='text-muted-foreground'>AI-powered anomaly detection and monitoring</p>
      </div>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='w-5 h-5' />
              Detect Anomalies
            </CardTitle>
            <CardDescription>Upload your data to identify unusual patterns and outliers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>Detection Method</label>
                  <select className='w-full p-2 border rounded-md'>
                    <option>Statistical Analysis</option>
                    <option>Machine Learning</option>
                    <option>Isolation Forest</option>
                    <option>DBSCAN</option>
                  </select>
                </div>
                <div>
                  <label className='block text-sm font-medium mb-2'>Sensitivity</label>
                  <select className='w-full p-2 border rounded-md'>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <Button className='w-full'>
                <Upload className='w-4 h-4 mr-2' />
                Upload Data & Detect
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='w-5 h-5' />
              Recent Detections
            </CardTitle>
            <CardDescription>Previously detected anomalies in your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-muted-foreground'>
              <Activity className='w-12 h-12 mx-auto mb-4 opacity-50' />
              <p>No anomalies detected</p>
              <p className='text-sm'>Upload data to start anomaly detection</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Shield className='w-5 h-5' />
              Monitoring Rules
            </CardTitle>
            <CardDescription>Set up automated monitoring for your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-muted-foreground'>
              <Shield className='w-12 h-12 mx-auto mb-4 opacity-50' />
              <p>No monitoring rules configured</p>
              <p className='text-sm'>Create rules to automatically detect anomalies</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
