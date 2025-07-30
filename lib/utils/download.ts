// Download utilities for the One AI platform

export interface DownloadOptions {
  filename?: string;
  mimeType?: string;
  quality?: number;
}

/**
 * Download a file from URL
 */
export async function downloadFromUrl(url: string, filename: string): Promise<void> {
  try {
    if (!url) {
      throw new Error('No URL provided for download')
    }

    // Use server-side proxy for external URLs to avoid CORS
    const isExternalUrl = url.startsWith('http') && !url.includes('localhost')
    const downloadUrl = isExternalUrl 
      ? `/api/proxy-image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`
      : url

    console.log('Download:', { original: url, proxy: downloadUrl, isExternal: isExternalUrl })

    const response = await fetch(downloadUrl)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Download failed:', response.status, errorText)
      throw new Error(`Failed to download: ${response.status}`)
    }

    const blob = await response.blob()
    
    // Create download link
    const downloadLink = document.createElement('a')
    const objectUrl = URL.createObjectURL(blob)
    
    downloadLink.href = objectUrl
    downloadLink.download = filename
    downloadLink.style.display = 'none'
    
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    
    // Clean up
    URL.revokeObjectURL(objectUrl)
    
  } catch (error) {
    console.error('Download failed:', error)
    throw new Error('Failed to download file. Please try again.')
  }
}

/**
 * Download content as a text file
 */
export function downloadAsTextFile(content: string, filename: string, mimeType = 'text/plain'): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Text download failed:', error);
    throw new Error('Failed to download text file. Please try again.');
  }
}

/**
 * Download canvas as image
 */
export function downloadCanvasAsImage(canvas: HTMLCanvasElement, filename: string, options: DownloadOptions = {}): void {
  try {
    const { mimeType = 'image/png', quality = 0.9 } = options;
    
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${mimeType.split('/')[1]}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    }, mimeType, quality);
  } catch (error) {
    console.error('Canvas download failed:', error);
    throw new Error('Failed to download image. Please try again.');
  }
}

/**
 * Download audio data as file
 */
export function downloadAudioData(audioData: string, filename: string): void {
  try {
    // Check if audioData is valid
    if (!audioData || typeof audioData !== 'string') {
      throw new Error('Invalid audio data - no audio URL provided');
    }

    // Handle data URLs
    if (audioData.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = audioData;
      link.download = `${filename}.mp3`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (audioData.startsWith('http')) {
      // Handle regular URLs
      downloadFromUrl(audioData, `${filename}.mp3`);
    } else {
      throw new Error('Invalid audio format - must be data URL or HTTP URL');
    }
  } catch (error) {
    console.error('Audio download failed:', error);
    throw new Error('Failed to download audio file. Please try again.');
  }
}

/**
 * Download multiple files as a ZIP (requires external library or API)
 */
export async function downloadMultipleFiles(files: Array<{ url: string; name: string }>): Promise<void> {
  try {
    // For now, download files individually
    // In production, you might want to use a library like JSZip
    for (const file of files) {
      await downloadFromUrl(file.url, file.name);
      // Add small delay between downloads to avoid overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('Multiple file download failed:', error);
    throw new Error('Failed to download files. Please try again.');
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    throw new Error('Failed to copy to clipboard. Please try again.');
  }
}

/**
 * Share content using Web Share API (if available)
 */
export async function shareContent(data: { title?: string; text?: string; url?: string }): Promise<void> {
  try {
    if (navigator.share) {
      await navigator.share(data);
    } else {
      // Fallback: copy URL to clipboard
      if (data.url) {
        await copyToClipboard(data.url);
        throw new Error('Shared link copied to clipboard!');
      } else {
        throw new Error('Sharing not supported on this device');
      }
    }
  } catch (error) {
    console.error('Share failed:', error);
    throw error;
  }
}

/**
 * Extract filename from URL
 */
function extractFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    return filename || 'download';
  } catch {
    return 'download';
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate timestamp for file naming
 */
export function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

/**
 * Generate unique filename with timestamp
 */
export function generateUniqueFilename(baseName: string, extension: string): string {
  const timestamp = generateTimestamp();
  return `${baseName}_${timestamp}.${extension}`;
} 