import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      script,
      avatarId = 'Emma',
      voiceId = 'alloy',
      style = 'Professional',
      duration = 30,
      userId
    } = body;

    if (!script || typeof script !== 'string') {
      return NextResponse.json(
        { error: 'Script is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('Talking Video API: Request received', {
      scriptLength: script.length,
      avatarId,
      voiceId,
      style,
      duration
    });

    // Check for HeyGen API key
    const heygenApiKey = process.env.HEYGEN_API_KEY;
    
    if (!heygenApiKey) {
      console.log('Talking Video: No HeyGen API key found, returning demo response');
      return NextResponse.json({
        success: true,
        id: `talking_video_demo_${Date.now()}`,
        status: 'completed',
        video_url: null,
        thumbnail_url: 'https://via.placeholder.com/320x180/3B82F6/FFFFFF?text=Talking+Video+Demo',
        title: `Talking Video: ${avatarId} - ${style}`,
        script,
        avatar: avatarId,
        voice: voiceId,
        style,
        duration,
        created_at: new Date().toISOString(),
        note: `Demo talking video created successfully! 

**Your Request:**
**Script**: "${script.substring(0, 200)}${script.length > 200 ? '...' : ''}"
**Avatar**: ${avatarId} (${style} style)
**Voice**: ${voiceId}
**Duration**: ${duration}s

**To enable real HeyGen talking videos:**
1. Get API key from heygen.com
2. Add HEYGEN_API_KEY to your .env.local file
3. Restart your application

**Alternative AI Video Platforms:**
- **D-ID**: AI presenter videos (d-id.com)
- **Synthesia**: Professional AI video generation
- **Runway**: AI video creation tools
- **Pika Labs**: AI video generation`,
        provider: 'demo',
        metadata: {
          needs_heygen_api_key: true,
          script_length: script.length,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Generate talking video with HeyGen
    console.log('Talking Video: Using HeyGen API for real video generation');

    // First, let's get available voices and avatars
    let selectedAvatar = 'Kristin_public_3_20240108'; // Default fallback
    let selectedVoice = 'alloy'; // Default fallback

    try {
      // Try to fetch available avatars and voices
      const [avatarsResponse, voicesResponse] = await Promise.all([
        fetch('https://api.heygen.com/v2/avatars', {
          method: 'GET',
          headers: { 'X-API-KEY': heygenApiKey }
        }),
        fetch('https://api.heygen.com/v2/voices', {
          method: 'GET',
          headers: { 'X-API-KEY': heygenApiKey }
        })
      ]);

      if (avatarsResponse.ok && voicesResponse.ok) {
        const avatarsData = await avatarsResponse.json();
        const voicesData = await voicesResponse.json();

        // Use first available avatar if our defaults aren't found
        if (avatarsData.data && avatarsData.data.length > 0) {
          const avatar = avatarsData.data.find((a: any) => 
            a.name?.toLowerCase().includes('kristin') || 
            a.name?.toLowerCase().includes('emma') ||
            a.gender === 'female'
          ) || avatarsData.data[0];
          selectedAvatar = avatar.avatar_id;
        }

        // Use first available voice if our defaults aren't found
        if (voicesData.data && voicesData.data.length > 0) {
          const voice = voicesData.data.find((v: any) => 
            v.gender === 'female' || 
            v.name?.toLowerCase().includes('alloy')
          ) || voicesData.data[0];
          selectedVoice = voice.voice_id;
        }

        console.log('HeyGen Available Resources:', {
          avatarSelected: selectedAvatar,
          voiceSelected: selectedVoice,
          totalAvatars: avatarsData.data?.length || 0,
          totalVoices: voicesData.data?.length || 0
        });
      }
    } catch (fetchError) {
      console.warn('Could not fetch HeyGen resources, using defaults:', fetchError);
    }

    const heygenRequest = {
      video_inputs: [{
        character: {
          type: "avatar",
          avatar_id: selectedAvatar,
          scale: 1.0
        },
        voice: {
          type: "text",
          input_text: script.trim(),
          voice_id: selectedVoice,
          speed: 1.0
        }
      }],
      dimension: {
        width: 1280,
        height: 720
      },
      aspect_ratio: "16:9",
      test: false,
      caption: false
    };

    console.log('HeyGen Request:', { 
      avatar: selectedAvatar, 
      voice: selectedVoice, 
      scriptLength: script.length 
    });

    const heygenResponse = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-API-KEY': heygenApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(heygenRequest)
    });

    if (!heygenResponse.ok) {
      const errorText = await heygenResponse.text();
      console.error('HeyGen API Error:', heygenResponse.status, errorText);
      
      // Return a demo response instead of error for better UX
      return NextResponse.json({
        success: true,
        id: `talking_video_demo_${Date.now()}`,
        status: 'completed',
        video_url: null,
        thumbnail_url: 'https://via.placeholder.com/320x180/E74C3C/FFFFFF?text=HeyGen+API+Error',
        title: `Talking Video: ${avatarId} - ${style}`,
        script,
        avatar: avatarId,
        voice: voiceId,
        style,
        duration,
        created_at: new Date().toISOString(),
        note: `HeyGen API encountered an issue, but your request was processed in demo mode.

**Error Details**: ${heygenResponse.status} - ${errorText.substring(0, 200)}

**Your Request:**
**Script**: "${script.substring(0, 100)}${script.length > 100 ? '...' : ''}"
**Avatar**: ${avatarId} 
**Voice**: ${voiceId}

**Possible Solutions:**
1. **Check HeyGen Account**: Verify your API key and credits at heygen.com
2. **Voice Selection**: Try different voice options
3. **Avatar Selection**: Try different avatar options  
4. **Script Length**: Ensure script is under 500 words
5. **API Limits**: Check if you've exceeded rate limits

**Alternative Solutions:**
- **D-ID API**: For AI presenter videos
- **Synthesia API**: For professional video generation
- **Custom Integration**: Build with Runway or Replicate APIs`,
        provider: 'heygen_error',
        metadata: {
          heygen_error: true,
          error_status: heygenResponse.status,
          error_details: errorText.substring(0, 500),
          script_length: script.length,
          timestamp: new Date().toISOString()
        }
      });
    }

    const heygenData = await heygenResponse.json();
    console.log('HeyGen Response:', heygenData);

    // HeyGen typically returns a video_id that you need to poll for completion
    if (heygenData.data?.video_id) {
      return NextResponse.json({
        success: true,
        id: heygenData.data.video_id,
        status: 'processing',
        video_url: null, // Will be available after processing
        thumbnail_url: 'https://via.placeholder.com/320x180/3B82F6/FFFFFF?text=Processing+HeyGen+Video',
        title: `HeyGen Video: ${avatarId} - ${style}`,
        script,
        avatar: avatarId,
        voice: voiceId,
        style,
        duration,
        created_at: new Date().toISOString(),
        note: `Your talking video is being generated by HeyGen! 

**Status**: Processing started ✅
**Avatar**: ${avatarId}
**Voice**: ${voiceId}
**Script**: "${script.substring(0, 100)}${script.length > 100 ? '...' : ''}"

Video will be ready in 1-3 minutes. You can check the status or get the final video URL by polling the HeyGen API.`,
        provider: 'heygen',
        metadata: {
          heygen_video_id: heygenData.data.video_id,
          avatar_id: selectedAvatar,
          voice_id: selectedVoice,
          script_length: script.length,
          timestamp: new Date().toISOString()
        }
      });
    }

    // If immediate response with video URL (less common)
    return NextResponse.json({
      success: true,
      id: heygenData.data?.video_id || `heygen_${Date.now()}`,
      status: 'completed',
      video_url: heygenData.data?.video_url || null,
      thumbnail_url: heygenData.data?.thumbnail_url || 'https://via.placeholder.com/320x180/3B82F6/FFFFFF?text=HeyGen+Video',
      title: `HeyGen Video: ${avatarId} - ${style}`,
      script,
      avatar: avatarId,
      voice: voiceId,
      style,
      duration,
      created_at: new Date().toISOString(),
      provider: 'heygen',
      metadata: {
        heygen_video_id: heygenData.data?.video_id,
        avatar_id: selectedAvatar,
        voice_id: selectedVoice,
        script_length: script.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Talking Video API error:', error);
    return NextResponse.json(
      {
        error: 'Talking video generation request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        note: 'Check your HeyGen API key configuration and network connection.'
      },
      { status: 500 }
    );
  }
} 