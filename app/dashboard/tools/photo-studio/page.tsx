'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Upload, Download, Loader2, Camera, Wand2, Image as ImageIcon, Palette, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface PhotoEdit {
  id: string
  originalImageUrl: string
  editedImageUrl: string
  enhancement: string
  settings: {
    brightness?: number
    contrast?: number
    saturation?: number
    sharpness?: number
  }
  status: 'processing' | 'completed' | 'failed'
  createdAt: Date
}

export default function PhotoStudioPage() {
  const { user } = useAuth()
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [selectedEnhancement, setSelectedEnhancement] = useState('auto-enhance')
  const [brightness, setBrightness] = useState([0])
  const [contrast, setContrast] = useState([0])
  const [saturation, setSaturation] = useState([0])
  const [sharpness, setSharpness] = useState([0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [photoEdits, setPhotoEdits] = useState<PhotoEdit[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const enhancements = [
    { value: 'auto-enhance', label: 'Auto Enhance', description: 'Automatic intelligent enhancement', icon: '✨' },
    { value: 'portrait', label: 'Portrait Mode', description: 'Optimize for people photos', icon: '👤' },
    { value: 'landscape', label: 'Landscape Mode', description: 'Enhance scenic photos', icon: '🏞️' },
    { value: 'vintage', label: 'Vintage Effect', description: 'Classic film-like appearance', icon: '📸' },
    { value: 'black-white', label: 'Black & White', description: 'Artistic monochrome conversion', icon: '⚫' },
    { value: 'hdr', label: 'HDR Effect', description: 'High dynamic range enhancement', icon: '🌅' },
    { value: 'color-pop', label: 'Color Pop', description: 'Enhance color vibrancy', icon: '🌈' },
    { value: 'noise-reduction', label: 'Noise Reduction', description: 'Remove grain and artifacts', icon: '🔍' },
  ]

  const quickFilters = [
    { name: 'Natural', brightness: 10, contrast: 15, saturation: 5, sharpness: 10 },
    { name: 'Vivid', brightness: 20, contrast: 30, saturation: 40, sharpness: 15 },
    { name: 'Warm', brightness: 15, contrast: 10, saturation: 20, sharpness: 5 },
    { name: 'Cool', brightness: 5, contrast: 20, saturation: -10, sharpness: 10 },
    { name: 'Dramatic', brightness: -10, contrast: 50, saturation: 15, sharpness: 20 },
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const applyQuickFilter = (filter: typeof quickFilters[0]) => {
    setBrightness([filter.brightness])
    setContrast([filter.contrast])
    setSaturation([filter.saturation])
    setSharpness([filter.sharpness])
  }

  const resetSettings = () => {
    setBrightness([0])
    setContrast([0])
    setSaturation([0])
    setSharpness([0])
  }

  const handleEnhance = async () => {
    if (!uploadedImage) return

    setIsProcessing(true)
    
    const newEdit: PhotoEdit = {
      id: Date.now().toString(),
      originalImageUrl: previewUrl,
      editedImageUrl: '',
      enhancement: selectedEnhancement,
      settings: {
        brightness: brightness[0],
        contrast: contrast[0],
        saturation: saturation[0],
        sharpness: sharpness[0]
      },
      status: 'processing',
      createdAt: new Date()
    }

    setPhotoEdits(prev => [newEdit, ...prev])

    try {
      const formData = new FormData()
      formData.append('image', uploadedImage)
      formData.append('enhancement', selectedEnhancement)
      formData.append('brightness', brightness[0].toString())
      formData.append('contrast', contrast[0].toString())
      formData.append('saturation', saturation[0].toString())
      formData.append('sharpness', sharpness[0].toString())
      formData.append('userId', user?.id || '')

      const response = await fetch('/api/ai/photo-enhance', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setPhotoEdits(prev => 
          prev.map(edit => 
            edit.id === newEdit.id 
              ? { ...edit, editedImageUrl: data.editedImageUrl, status: 'completed' }
              : edit
          )
        )
      } else {
        throw new Error(data.message || 'Photo enhancement failed')
      }

    } catch (error) {
      console.error('Photo enhancement error:', error)
      setPhotoEdits(prev => 
        prev.map(edit => 
          edit.id === newEdit.id 
            ? { ...edit, status: 'failed' }
            : edit
        )
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const clearImage = () => {
    setUploadedImage(null)
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Camera className="w-8 h-8" />
            AI Photo Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            Professional photo editing and enhancement powered by AI
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Upload & Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Photo</CardTitle>
              <CardDescription>
                Upload a photo to start editing and enhancing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {previewUrl ? (
                  <div className="relative">
                    <Image
                      src={previewUrl}
                      alt="Uploaded photo"
                      width={800}
                      height={384}
                      className="w-full h-96 object-contain rounded-lg bg-muted/50"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Upload your photo</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Drag and drop a photo, or click to browse
                    </p>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                      size="lg"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Supported formats: JPG, PNG, WebP, HEIC (Max size: 10MB)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Enhancement Options */}
          {uploadedImage && (
            <Card>
              <CardHeader>
                <CardTitle>Enhancement Options</CardTitle>
                <CardDescription>
                  Choose how you want to enhance your photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhancement Type */}
                <div>
                  <Label>Enhancement Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {enhancements.slice(0, 4).map((enhancement) => (
                      <div
                        key={enhancement.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors text-center ${
                          selectedEnhancement === enhancement.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedEnhancement(enhancement.value)}
                      >
                        <div className="text-lg mb-1">{enhancement.icon}</div>
                        <div className="font-medium text-xs">{enhancement.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  <Select value={selectedEnhancement} onValueChange={setSelectedEnhancement}>
                    <SelectTrigger className="mt-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {enhancements.map((enhancement) => (
                        <SelectItem key={enhancement.value} value={enhancement.value}>
                          <div className="flex items-center gap-2">
                            <span>{enhancement.icon}</span>
                            <div>
                              <div className="font-medium">{enhancement.label}</div>
                              <div className="text-xs text-muted-foreground">{enhancement.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Filters */}
                <div>
                  <Label>Quick Filters</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {quickFilters.map((filter) => (
                      <Button
                        key={filter.name}
                        variant="outline"
                        size="sm"
                        onClick={() => applyQuickFilter(filter)}
                      >
                        {filter.name}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetSettings}
                    >
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Manual Adjustments */}
                <div className="space-y-4">
                  <Label>Manual Adjustments</Label>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Brightness</span>
                      <span>{brightness[0]}%</span>
                    </div>
                    <Slider
                      value={brightness}
                      onValueChange={setBrightness}
                      max={100}
                      min={-100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Contrast</span>
                      <span>{contrast[0]}%</span>
                    </div>
                    <Slider
                      value={contrast}
                      onValueChange={setContrast}
                      max={100}
                      min={-100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Saturation</span>
                      <span>{saturation[0]}%</span>
                    </div>
                    <Slider
                      value={saturation}
                      onValueChange={setSaturation}
                      max={100}
                      min={-100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Sharpness</span>
                      <span>{sharpness[0]}%</span>
                    </div>
                    <Slider
                      value={sharpness}
                      onValueChange={setSharpness}
                      max={100}
                      min={-100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleEnhance} 
                  disabled={!uploadedImage || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enhancing Photo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Enhance Photo
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Enhancement:</span>
                  <span className="capitalize">
                    {enhancements.find(e => e.value === selectedEnhancement)?.label}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Brightness:</span>
                  <span>{brightness[0]}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Contrast:</span>
                  <span>{contrast[0]}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Saturation:</span>
                  <span>{saturation[0]}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sharpness:</span>
                  <span>{sharpness[0]}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Studio Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>AI auto-enhancement</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Professional filters</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Manual adjustments</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Noise reduction</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Color correction</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>High-resolution output</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enhancement Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-2">
                <p>• Use Auto Enhance for quick improvements</p>
                <p>• Portrait mode optimizes skin tones</p>
                <p>• Landscape mode enhances scenery</p>
                <p>• Start with quick filters, then fine-tune</p>
                <p>• Avoid over-sharpening for natural results</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Photo History */}
      {photoEdits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Photo Enhancement History</CardTitle>
            <CardDescription>
              Your enhanced photos and editing history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photoEdits.map((edit) => (
                <div key={edit.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={edit.status === 'completed' ? 'default' : 'secondary'}>
                      {edit.status === 'processing' ? 'Processing...' : edit.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {edit.createdAt.toLocaleTimeString()}
                    </span>
                  </div>

                  {edit.status === 'processing' && (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Enhancing...</p>
                      </div>
                    </div>
                  )}

                  {edit.status === 'completed' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Original</p>
                          <Image
                            src={edit.originalImageUrl}
                            alt="Original"
                            width={200}
                            height={200}
                            className="w-full aspect-square object-cover rounded"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Enhanced</p>
                          <Image
                            src={edit.editedImageUrl || '/api/placeholder/200/200'}
                            alt="Enhanced"
                            width={200}
                            height={200}
                            className="w-full aspect-square object-cover rounded"
                          />
                        </div>
                      </div>

                      <div className="text-xs space-y-1">
                        <p><strong>Enhancement:</strong> {enhancements.find(e => e.value === edit.enhancement)?.label}</p>
                        <p><strong>Adjustments:</strong> B:{edit.settings.brightness}% C:{edit.settings.contrast}% S:{edit.settings.saturation}%</p>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <ImageIcon className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  )}

                  {edit.status === 'failed' && (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-sm text-red-500">Enhancement failed</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 