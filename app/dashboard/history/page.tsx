import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, MessageSquare, Image as ImageIcon, Video } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HistoryPage() {
  const [recent, setRecent] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch('/api/history/recent'),
          fetch('/api/pdf/list').catch(() => null), // optional, in case not implemented
        ]);
        const j1 = await r1.json();
        const j2 = r2 ? await r2.json().catch(() => ({})) : {};
        if (j1?.success) setRecent(j1.recent || []);
        if (j2?.success) setDocs(j2.documents || []);
      } catch {}
    };
    run();
  }, []);

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>History</h1>
        <p className='text-muted-foreground'>View your past activities and interactions</p>
      </div>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='size-5' />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest interactions with the AI platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {recent.length === 0 && (
                <div className='text-sm text-muted-foreground'>No recent activity yet.</div>
              )}
              {recent.map((item) => (
                <div key={`${item.kind}-${item.id}`} className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='flex items-center gap-3'>
                    {item.kind === 'chat' && <MessageSquare className='size-5 text-blue-500' />}
                    {item.kind === 'image' && <ImageIcon className='size-5 text-green-500' />}
                    {item.kind === 'video' && <Video className='size-5 text-purple-500' />}
                    <div>
                      <p className='font-medium'>{item.title}</p>
                      <p className='text-sm text-muted-foreground'>{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {item.href && (
                    <Button asChild variant='outline' size='sm'>
                      <a href={item.href}>View</a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='size-5' />
              Document History
            </CardTitle>
            <CardDescription>Previously created and processed documents</CardDescription>
          </CardHeader>
          <CardContent>
            {docs.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                <FileText className='size-12 mx-auto mb-4 opacity-50' />
                <p>No documents found</p>
                <p className='text-sm'>Your document history will appear here</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {docs.map((d: any) => (
                  <div key={d.id} className='flex items-center justify-between p-3 border rounded'>
                    <div>
                      <div className='font-medium'>{d.original_name || 'Document'}</div>
                      <div className='text-xs text-muted-foreground'>{new Date(d.created_at).toLocaleString()}</div>
                    </div>
                    <Button asChild size='sm' variant='outline'>
                      <a href={`/dashboard/ai-apps/chat-with-pdf?doc=${d.id}`}>Open</a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
