import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Clock, TrendingUp, Users } from 'lucide-react';

export default function ActivityPage() {
  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Activity</h1>
        <p className='text-muted-foreground'>Monitor your platform usage and activity</p>
      </div>

      <div className='grid gap-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-3'>
                <Activity className='w-8 h-8 text-blue-500' />
                <div>
                  <p className='text-2xl font-bold'>127</p>
                  <p className='text-sm text-muted-foreground'>Total Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-3'>
                <Clock className='w-8 h-8 text-green-500' />
                <div>
                  <p className='text-2xl font-bold'>24</p>
                  <p className='text-sm text-muted-foreground'>This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-3'>
                <TrendingUp className='w-8 h-8 text-purple-500' />
                <div>
                  <p className='text-2xl font-bold'>+15%</p>
                  <p className='text-sm text-muted-foreground'>Growth</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='w-5 h-5' />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest platform interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <div>
                    <p className='font-medium'>AI Chat Session</p>
                    <p className='text-sm text-muted-foreground'>2 minutes ago</p>
                  </div>
                </div>
                <span className='text-sm text-muted-foreground'>5 messages</span>
              </div>

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <div>
                    <p className='font-medium'>Image Generated</p>
                    <p className='text-sm text-muted-foreground'>15 minutes ago</p>
                  </div>
                </div>
                <span className='text-sm text-muted-foreground'>DALL-E 3</span>
              </div>

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                  <div>
                    <p className='font-medium'>Video Created</p>
                    <p className='text-sm text-muted-foreground'>1 hour ago</p>
                  </div>
                </div>
                <span className='text-sm text-muted-foreground'>HeyGen</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='w-5 h-5' />
              Activity Summary
            </CardTitle>
            <CardDescription>Overview of your platform usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h3 className='font-semibold mb-3'>Most Used Features</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>AI Chat</span>
                    <span className='text-muted-foreground'>45%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Image Generation</span>
                    <span className='text-muted-foreground'>30%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Video Creation</span>
                    <span className='text-muted-foreground'>15%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Other Tools</span>
                    <span className='text-muted-foreground'>10%</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className='font-semibold mb-3'>Usage Trends</h3>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>Daily Average</span>
                    <span className='text-muted-foreground'>8 activities</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Peak Hours</span>
                    <span className='text-muted-foreground'>2-4 PM</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Most Active Day</span>
                    <span className='text-muted-foreground'>Wednesday</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
