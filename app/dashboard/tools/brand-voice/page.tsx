import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, Play, Download, Settings } from 'lucide-react';

export default function BrandVoicePage() {
  return (
    <div className='container mx-auto p-6'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Brand Voice Generator</h1>
        <p className='text-muted-foreground'>Create and customize your brand's unique voice</p>
      </div>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Mic className='w-5 h-5' />
              Create Brand Voice
            </CardTitle>
            <CardDescription>Define your brand's personality and tone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='brand-name'>Brand Name</Label>
                <Input id='brand-name' placeholder='Enter your brand name' />
              </div>

              <div>
                <Label htmlFor='brand-description'>Brand Description</Label>
                <Textarea
                  id='brand-description'
                  placeholder='Describe your brand, values, and target audience...'
                  rows={4}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='tone'>Tone</Label>
                  <select id='tone' className='w-full p-2 border rounded-md'>
                    <option>Professional</option>
                    <option>Friendly</option>
                    <option>Casual</option>
                    <option>Formal</option>
                    <option>Humorous</option>
                    <option>Authoritative</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor='style'>Style</Label>
                  <select id='style' className='w-full p-2 border rounded-md'>
                    <option>Modern</option>
                    <option>Traditional</option>
                    <option>Innovative</option>
                    <option>Conservative</option>
                    <option>Bold</option>
                    <option>Subtle</option>
                  </select>
                </div>
              </div>

              <Button className='w-full'>
                <Mic className='w-4 h-4 mr-2' />
                Generate Brand Voice
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='w-5 h-5' />
              Voice Settings
            </CardTitle>
            <CardDescription>Customize voice parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <Label htmlFor='speed'>Speed</Label>
                <select id='speed' className='w-full p-2 border rounded-md'>
                  <option>Slow</option>
                  <option>Normal</option>
                  <option>Fast</option>
                </select>
              </div>
              <div>
                <Label htmlFor='pitch'>Pitch</Label>
                <select id='pitch' className='w-full p-2 border rounded-md'>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <Label htmlFor='clarity'>Clarity</Label>
                <select id='clarity' className='w-full p-2 border rounded-md'>
                  <option>Standard</option>
                  <option>Enhanced</option>
                  <option>Ultra Clear</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Voice</CardTitle>
            <CardDescription>Preview and download your brand voice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-8 text-muted-foreground'>
              <Mic className='w-12 h-12 mx-auto mb-4 opacity-50' />
              <p>No voice generated yet</p>
              <p className='text-sm'>Create your brand voice to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
