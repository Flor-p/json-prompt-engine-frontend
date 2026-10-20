export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'slider';

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  defaultValue?: any;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export interface ModelSchema {
  id: string;
  name: string;
  tab: 'image' | 'video';
  fields: Field[];
}

// ─── Shared video fields ─────────────────────────────────────────────
// Prompt-content fields are always empty by default: everything creative
// is written live from the brief. Only technical settings have defaults.

const SEEDANCE_ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '21:9', label: '21:9 (Cinematic)' }
];

const videoCoreFields = (): Field[] => [
  {
    name: 'subject',
    label: 'Subject',
    type: 'textarea',
    defaultValue: '',
    placeholder: 'Who or what the scene is about...',
    description: 'Main subject, specific and visual'
  },
  {
    name: 'action',
    label: 'Action',
    type: 'text',
    defaultValue: '',
    placeholder: 'e.g., slowly turns toward the window',
    description: 'One clear action per clip'
  },
  {
    name: 'camera',
    label: 'Camera',
    type: 'text',
    defaultValue: '',
    placeholder: 'e.g., slow dolly-in, medium close-up, eye level',
    description: 'Shot size + movement + angle'
  },
  {
    name: 'scene',
    label: 'Scene',
    type: 'text',
    defaultValue: '',
    placeholder: 'e.g., empty diner at dawn, rain on the windows',
    description: 'Location + atmosphere'
  },
  {
    name: 'lighting',
    label: 'Lighting',
    type: 'text',
    defaultValue: '',
    placeholder: 'e.g., soft window light, warm practicals',
    description: 'Light source, quality, color'
  },
  {
    name: 'style',
    label: 'Style',
    type: 'text',
    defaultValue: '',
    placeholder: 'e.g., 35mm film, muted palette, commercial polish',
    description: 'Look, film stock, color treatment'
  }
];

const videoAudioFields = ({ withLanguage }: { withLanguage: boolean }): Field[] => [
  {
    name: 'ambience',
    label: 'Ambient Sound',
    type: 'text',
    defaultValue: '',
    placeholder: 'e.g., distant traffic, rain on glass',
    description: 'Room tone / environment, near to far'
  },
  {
    name: 'sfx',
    label: 'Sound Effects',
    type: 'text',
    defaultValue: '',
    placeholder: 'e.g., cup clinks on the counter',
    description: 'Tie each sound to its source'
  },
  {
    name: 'music',
    label: 'Music',
    type: 'text',
    defaultValue: '',
    placeholder: 'e.g., minimal piano, slow build',
    description: 'Genre, instruments, energy'
  },
  {
    name: 'dialogue',
    label: 'Dialogue / Voice-over',
    type: 'textarea',
    defaultValue: '',
    placeholder: withLanguage
      ? 'Speaker, delivery: line  →  The barista, softly: Your coffee is ready'
      : 'Speaker, delivery: line  →  The barista, softly: Your coffee is ready (no quotes)',
    description: 'One or two short lines sync best'
  },
  ...(withLanguage
    ? [
        {
          name: 'dialogue_language',
          label: 'Dialogue Language',
          type: 'select' as FieldType,
          defaultValue: 'English',
          options: [
            { value: 'English', label: 'English' },
            { value: 'Spanish', label: 'Spanish' },
            { value: 'Portuguese', label: 'Portuguese' },
            { value: 'French', label: 'French' }
          ],
          description: 'Language of the spoken line'
        }
      ]
    : [])
];

const videoClosingFields = (): Field[] => [
  {
    name: 'ending',
    label: 'Final Beat',
    type: 'text',
    defaultValue: '',
    placeholder: 'e.g., product hero shot, camera settles',
    description: 'How the clip resolves'
  },
  {
    name: 'on_screen_text',
    label: 'On-screen Text / Slogan',
    type: 'text',
    defaultValue: '',
    placeholder: 'Short — 2 to 4 words',
    description: 'Optional · models may misspell long text'
  },
  {
    name: 'constraints',
    label: 'Avoid',
    type: 'text',
    defaultValue: '',
    placeholder: 'e.g., subtitles, watermark, extra cuts',
    description: 'Written inline into the prompt'
  }
];

export const MODEL_SCHEMAS: ModelSchema[] = [
  {
    id: 'midjourney',
    name: 'Midjourney',
    tab: 'image',
    fields: [
      {
        name: 'subject',
        label: 'Subject',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Describe the main subject...',
        description: 'Main subject of the image'
      },
      {
        name: 'style',
        label: 'Style',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., photorealistic, anime, oil painting',
        description: 'Artistic style'
      },
      {
        name: 'mood',
        label: 'Mood',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., dramatic, serene, energetic',
        description: 'Overall mood or atmosphere'
      },
      {
        name: 'lighting',
        label: 'Lighting',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., golden hour, studio lighting',
        description: 'Lighting conditions'
      },
      {
        name: 'camera',
        label: 'Camera',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., wide angle, close-up, 50mm',
        description: 'Camera angle or lens'
      },
      {
        name: 'negative',
        label: 'Negative Prompt',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'What to avoid...',
        description: 'Things to exclude'
      },
      {
        name: 'ar',
        label: 'Aspect Ratio (--ar)',
        type: 'select',
        defaultValue: '1:1',
        options: [
          { value: '1:1', label: '1:1 (Square)' },
          { value: '16:9', label: '16:9 (Landscape)' },
          { value: '9:16', label: '9:16 (Portrait)' },
          { value: '4:3', label: '4:3' },
          { value: '3:2', label: '3:2' },
          { value: '21:9', label: '21:9 (Ultrawide)' }
        ],
        description: 'Image aspect ratio'
      },
      {
        name: 'v',
        label: 'Version (--v)',
        type: 'select',
        defaultValue: '8.1',
        options: [
          { value: '8.1', label: 'V8.1' },
          { value: '8.0', label: 'V8.0' },
          { value: '7', label: 'V7' },
          { value: '6.1', label: 'V6.1' },
          { value: '6', label: 'V6' }
        ],
        description: 'Midjourney version'
      },
      {
        name: 'stylize',
        label: 'Stylize (--stylize)',
        type: 'slider',
        defaultValue: 100,
        min: 0,
        max: 1000,
        step: 50,
        description: 'How artistic vs literal (0-1000)'
      },
      {
        name: 'chaos',
        label: 'Chaos (--chaos)',
        type: 'slider',
        defaultValue: 0,
        min: 0,
        max: 100,
        step: 10,
        description: 'Variation amount (0-100)'
      },
      {
        name: 'seed',
        label: 'Seed (--seed)',
        type: 'number',
        defaultValue: '',
        placeholder: 'e.g., 12345',
        description: 'Random seed for reproducibility'
      },
      {
        name: 'sref',
        label: 'Style Reference (--sref)',
        type: 'text',
        defaultValue: '',
        placeholder: 'Paste image URL...',
        description: 'Style reference image URL'
      },
      {
        name: 'image_prompt',
        label: 'Image Prompt URL',
        type: 'text',
        defaultValue: '',
        placeholder: 'Paste image URL for image prompting',
        description: 'Image prompt reference'
      },
      {
        name: 'iw',
        label: 'Image Weight (--iw)',
        type: 'slider',
        defaultValue: 1,
        min: 0,
        max: 2,
        step: 0.25,
        description: 'Image prompt weight (0-2)'
      },
      {
        name: 'hd_mode',
        label: 'HD Mode',
        type: 'checkbox',
        defaultValue: true,
        description: 'Run in HD mode (3x faster in V8.1)'
      }
    ]
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    tab: 'image',
    fields: [
      {
        name: 'positive_prompt',
        label: 'Positive Prompt',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Use (word:1.3) for emphasis, (word:0.8) for de-emphasis',
        description: 'Main prompt with optional weights'
      },
      {
        name: 'negative_prompt',
        label: 'Negative Prompt',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'What to avoid...',
        description: 'Things to exclude'
      },
      {
        name: 'cfg_scale',
        label: 'CFG Scale',
        type: 'slider',
        defaultValue: 7,
        min: 1,
        max: 30,
        step: 0.5,
        description: 'How closely to follow prompt (1-30)'
      },
      {
        name: 'steps',
        label: 'Steps',
        type: 'slider',
        defaultValue: 20,
        min: 1,
        max: 150,
        step: 1,
        description: 'Number of sampling steps'
      },
      {
        name: 'sampler',
        label: 'Sampler',
        type: 'select',
        defaultValue: 'DPM++ 2M Karras',
        options: [
          { value: 'Euler', label: 'Euler' },
          { value: 'Euler a', label: 'Euler a' },
          { value: 'DPM++ 2M Karras', label: 'DPM++ 2M Karras' },
          { value: 'DPM++ SDE Karras', label: 'DPM++ SDE Karras' },
          { value: 'DDIM', label: 'DDIM' },
          { value: 'PLMS', label: 'PLMS' },
          { value: 'UniPC', label: 'UniPC' }
        ],
        description: 'Sampling method'
      },
      {
        name: 'seed',
        label: 'Seed',
        type: 'number',
        defaultValue: -1,
        placeholder: '-1 for random',
        description: 'Random seed (-1 for random)'
      },
      {
        name: 'width',
        label: 'Width',
        type: 'select',
        defaultValue: '512',
        options: [
          { value: '512', label: '512' },
          { value: '768', label: '768' },
          { value: '1024', label: '1024' }
        ],
        description: 'Image width'
      },
      {
        name: 'height',
        label: 'Height',
        type: 'select',
        defaultValue: '512',
        options: [
          { value: '512', label: '512' },
          { value: '768', label: '768' },
          { value: '1024', label: '1024' }
        ],
        description: 'Image height'
      },
      {
        name: 'checkpoint',
        label: 'Checkpoint',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., sd_xl_base_1.0',
        description: 'Model checkpoint'
      },
      {
        name: 'lora',
        label: 'LoRA',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., <lora:style:0.8>',
        description: 'LoRA model'
      }
    ]
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    tab: 'image',
    fields: [
      {
        name: 'subject',
        label: 'Subject',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Describe what you want to generate...',
        description: 'Main subject or scene'
      },
      {
        name: 'style',
        label: 'Style',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., photorealistic, illustration',
        description: 'Visual style'
      },
      {
        name: 'mood',
        label: 'Mood',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., uplifting, mysterious',
        description: 'Emotional tone'
      },
      {
        name: 'lighting',
        label: 'Lighting',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., natural light, dramatic shadows',
        description: 'Lighting setup'
      },
      {
        name: 'aspect_ratio',
        label: 'Aspect Ratio',
        type: 'select',
        defaultValue: '1:1',
        options: [
          { value: '1:1', label: '1:1 (Square)' },
          { value: '16:9', label: '16:9 (Landscape)' },
          { value: '9:16', label: '9:16 (Portrait)' },
          { value: '4:3', label: '4:3' },
          { value: '3:4', label: '3:4' }
        ],
        description: 'Image dimensions'
      },
      {
        name: 'person_generation',
        label: 'Person Generation',
        type: 'select',
        defaultValue: 'allow_adult',
        options: [
          { value: 'allow_adult', label: 'Allow Adults' },
          { value: 'allow_all', label: 'Allow All Ages' },
          { value: 'dont_allow', label: "Don't Allow" }
        ],
        description: 'Control person generation'
      },
      {
        name: 'safety_filter_level',
        label: 'Safety Filter Level',
        type: 'select',
        defaultValue: 'block_some',
        options: [
          { value: 'block_most', label: 'Block Most' },
          { value: 'block_some', label: 'Block Some' },
          { value: 'block_few', label: 'Block Few' }
        ],
        description: 'Content filtering'
      },
      {
        name: 'language',
        label: 'Language',
        type: 'select',
        defaultValue: 'auto',
        options: [
          { value: 'auto', label: 'Auto-detect' },
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
          { value: 'ja', label: 'Japanese' }
        ],
        description: 'Prompt language'
      },
      {
        name: 'seed',
        label: 'Seed',
        type: 'number',
        defaultValue: '',
        placeholder: 'Random if empty',
        description: 'Random seed'
      }
    ]
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tab: 'image',
    fields: [
      {
        name: 'subject',
        label: 'Subject',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Describe what you want to generate...',
        description: 'Main subject or scene'
      },
      {
        name: 'style',
        label: 'Style',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., photorealistic, illustration',
        description: 'Visual style'
      },
      {
        name: 'mood',
        label: 'Mood',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., uplifting, mysterious',
        description: 'Emotional tone'
      },
      {
        name: 'lighting',
        label: 'Lighting',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., natural light, dramatic shadows',
        description: 'Lighting setup'
      },
      {
        name: 'aspect_ratio',
        label: 'Aspect Ratio',
        type: 'select',
        defaultValue: '1:1',
        options: [
          { value: '1:1', label: '1:1 (Square)' },
          { value: '16:9', label: '16:9 (Landscape)' },
          { value: '9:16', label: '9:16 (Portrait)' },
          { value: '4:3', label: '4:3' },
          { value: '3:4', label: '3:4' }
        ],
        description: 'Image dimensions'
      },
      {
        name: 'person_generation',
        label: 'Person Generation',
        type: 'select',
        defaultValue: 'allow_adult',
        options: [
          { value: 'allow_adult', label: 'Allow Adults' },
          { value: 'allow_all', label: 'Allow All Ages' },
          { value: 'dont_allow', label: "Don't Allow" }
        ],
        description: 'Control person generation'
      },
      {
        name: 'safety_filter_level',
        label: 'Safety Filter Level',
        type: 'select',
        defaultValue: 'block_some',
        options: [
          { value: 'block_most', label: 'Block Most' },
          { value: 'block_some', label: 'Block Some' },
          { value: 'block_few', label: 'Block Few' }
        ],
        description: 'Content filtering'
      },
      {
        name: 'language',
        label: 'Language',
        type: 'select',
        defaultValue: 'auto',
        options: [
          { value: 'auto', label: 'Auto-detect' },
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
          { value: 'ja', label: 'Japanese' }
        ],
        description: 'Prompt language'
      },
      {
        name: 'seed',
        label: 'Seed',
        type: 'number',
        defaultValue: '',
        placeholder: 'Random if empty',
        description: 'Random seed'
      }
    ]
  },
  {
    id: 'runway-gen4',
    name: 'Runway Gen-4',
    tab: 'video',
    fields: [
      {
        name: 'subject',
        label: 'Subject',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Describe the video scene...',
        description: 'Main content'
      },
      {
        name: 'style',
        label: 'Style',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., realistic, stylized, abstract',
        description: 'Visual style'
      },
      {
        name: 'mood',
        label: 'Mood',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., energetic, calm, suspenseful',
        description: 'Emotional tone'
      },
      {
        name: 'camera_motion',
        label: 'Camera Motion',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., zoom in, orbit, dolly forward',
        description: 'Camera movement'
      },
      {
        name: 'duration',
        label: 'Duration',
        type: 'select',
        defaultValue: '5s',
        options: [
          { value: '5s', label: '5 seconds' },
          { value: '10s', label: '10 seconds' }
        ],
        description: 'Video length'
      },
      {
        name: 'motion_amount',
        label: 'Motion Amount',
        type: 'slider',
        defaultValue: 5,
        min: 1,
        max: 10,
        step: 1,
        description: 'Amount of motion (1-10)'
      },
      {
        name: 'aspect_ratio',
        label: 'Aspect Ratio',
        type: 'select',
        defaultValue: '16:9',
        options: [
          { value: '16:9', label: '16:9 (Landscape)' },
          { value: '9:16', label: '9:16 (Portrait)' },
          { value: '1:1', label: '1:1 (Square)' }
        ],
        description: 'Video dimensions'
      },
      {
        name: 'seed',
        label: 'Seed',
        type: 'number',
        defaultValue: '',
        placeholder: 'Random if empty',
        description: 'Random seed'
      }
    ]
  },
  {
    id: 'luma-dream-machine',
    name: 'Luma Dream Machine',
    tab: 'video',
    fields: [
      {
        name: 'subject',
        label: 'Subject',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Describe the video...',
        description: 'Main content'
      },
      {
        name: 'style',
        label: 'Style',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., photorealistic, dreamy, artistic',
        description: 'Visual style'
      },
      {
        name: 'mood',
        label: 'Mood',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., ethereal, vibrant, moody',
        description: 'Emotional atmosphere'
      },
      {
        name: 'camera_motion',
        label: 'Camera Motion',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., smooth pan, fly through, static',
        description: 'Camera movement'
      },
      {
        name: 'aspect_ratio',
        label: 'Aspect Ratio',
        type: 'select',
        defaultValue: '16:9',
        options: [
          { value: '16:9', label: '16:9 (Landscape)' },
          { value: '9:16', label: '9:16 (Portrait)' },
          { value: '1:1', label: '1:1 (Square)' }
        ],
        description: 'Video aspect ratio'
      },
      {
        name: 'loop',
        label: 'Loop',
        type: 'checkbox',
        defaultValue: false,
        description: 'Create seamless loop'
      },
      {
        name: 'keyframe_start',
        label: 'Keyframe Start',
        type: 'text',
        defaultValue: '',
        placeholder: 'Optional: URL or description',
        description: 'Starting keyframe'
      },
      {
        name: 'keyframe_end',
        label: 'Keyframe End',
        type: 'text',
        defaultValue: '',
        placeholder: 'Optional: URL or description',
        description: 'Ending keyframe'
      },
      {
        name: 'enhance_prompt',
        label: 'Enhance Prompt',
        type: 'checkbox',
        defaultValue: true,
        description: 'Auto-enhance prompt quality'
      }
    ]
  },
  {
    id: 'seedance-2',
    name: 'Seedance 2.0',
    tab: 'video',
    fields: [
      ...videoCoreFields(),
      ...videoAudioFields({ withLanguage: true }),
      ...videoClosingFields(),
      {
        name: 'duration',
        label: 'Duration',
        type: 'select',
        defaultValue: '10s',
        options: [
          { value: '5s', label: '5 seconds' },
          { value: '10s', label: '10 seconds' },
          { value: '15s', label: '15 seconds (max)' }
        ],
        description: 'Set in platform UI · not added to prompt'
      },
      {
        name: 'aspect_ratio',
        label: 'Aspect Ratio',
        type: 'select',
        defaultValue: '16:9',
        options: SEEDANCE_ASPECT_RATIOS,
        description: 'Set in platform UI · not added to prompt'
      },
      {
        name: 'resolution',
        label: 'Resolution',
        type: 'select',
        defaultValue: '1080p',
        options: [
          { value: '480p', label: '480p' },
          { value: '720p', label: '720p' },
          { value: '1080p', label: '1080p' }
        ],
        description: 'Set in platform UI · not added to prompt'
      },
      {
        name: 'generate_audio',
        label: 'Generate Audio',
        type: 'checkbox',
        defaultValue: true,
        description: 'Native audio (turn on in platform UI too)'
      }
    ]
  },
  {
    id: 'seedance-2-5',
    name: 'Seedance 2.5',
    tab: 'video',
    fields: [
      ...videoCoreFields(),
      ...videoAudioFields({ withLanguage: true }),
      ...videoClosingFields(),
      {
        name: 'duration',
        label: 'Duration',
        type: 'select',
        defaultValue: '10s',
        options: [
          { value: '5s', label: '5 seconds' },
          { value: '10s', label: '10 seconds' },
          { value: '15s', label: '15 seconds' },
          { value: '20s', label: '20 seconds' },
          { value: '30s', label: '30 seconds (max)' }
        ],
        description: 'Set in platform UI · longer = slower render'
      },
      {
        name: 'aspect_ratio',
        label: 'Aspect Ratio',
        type: 'select',
        defaultValue: '16:9',
        options: SEEDANCE_ASPECT_RATIOS,
        description: 'Set in platform UI · not added to prompt'
      },
      {
        name: 'resolution',
        label: 'Resolution',
        type: 'select',
        defaultValue: '1080p',
        options: [
          { value: '480p', label: '480p' },
          { value: '720p', label: '720p' },
          { value: '1080p', label: '1080p' }
        ],
        description: 'Set in platform UI · not added to prompt'
      },
      {
        name: 'generate_audio',
        label: 'Generate Audio',
        type: 'checkbox',
        defaultValue: true,
        description: 'Native audio (turn on in platform UI too)'
      }
    ]
  },
  {
    id: 'kling-3',
    name: 'Kling 3.0',
    tab: 'video',
    fields: [
      ...videoCoreFields(),
      ...videoAudioFields({ withLanguage: true }),
      ...videoClosingFields(),
      {
        name: 'variant',
        label: 'Variant',
        type: 'select',
        defaultValue: 'kling-3.0',
        options: [
          { value: 'kling-3.0', label: 'Kling 3.0' },
          { value: 'kling-3.0-turbo', label: 'Kling 3.0 Turbo (faster)' },
          { value: 'kling-omni-3', label: 'Kling Omni 3' }
        ],
        description: 'Select in platform UI · not added to prompt'
      },
      {
        name: 'duration',
        label: 'Duration',
        type: 'select',
        defaultValue: '10s',
        options: [
          { value: '5s', label: '5 seconds' },
          { value: '10s', label: '10 seconds' },
          { value: '15s', label: '15 seconds (max)' }
        ],
        description: 'Set in platform UI · not added to prompt'
      },
      {
        name: 'aspect_ratio',
        label: 'Aspect Ratio',
        type: 'select',
        defaultValue: '16:9',
        options: [
          { value: '16:9', label: '16:9 (Landscape)' },
          { value: '9:16', label: '9:16 (Portrait)' },
          { value: '1:1', label: '1:1 (Square)' }
        ],
        description: 'Set in platform UI · not added to prompt'
      },
      {
        name: 'resolution',
        label: 'Resolution',
        type: 'select',
        defaultValue: '1080p',
        options: [
          { value: '720p', label: '720p' },
          { value: '1080p', label: '1080p' },
          { value: '4K', label: '4K (slower)' }
        ],
        description: 'Set in platform UI · not added to prompt'
      },
      {
        name: 'generate_audio',
        label: 'Generate Audio',
        type: 'checkbox',
        defaultValue: true,
        description: 'Native audio is optional in Kling — enable it in platform UI'
      }
    ]
  },
  {
    id: 'veo-3-1',
    name: 'Veo 3.1',
    tab: 'video',
    fields: [
      ...videoCoreFields(),
      ...videoAudioFields({ withLanguage: false }),
      ...videoClosingFields(),
      {
        name: 'variant',
        label: 'Variant',
        type: 'select',
        defaultValue: 'veo-3.1-fast',
        options: [
          { value: 'veo-3.1', label: 'Veo 3.1 (best quality)' },
          { value: 'veo-3.1-fast', label: 'Veo 3.1 Fast' },
          { value: 'veo-3.1-lite', label: 'Veo 3.1 Lite' }
        ],
        description: 'Select in platform UI · fixed 8s clip, audio always on'
      },
      {
        name: 'aspect_ratio',
        label: 'Aspect Ratio',
        type: 'select',
        defaultValue: '16:9',
        options: [
          { value: '16:9', label: '16:9 (Landscape)' },
          { value: '9:16', label: '9:16 (Portrait)' }
        ],
        description: 'Set in platform UI · not added to prompt'
      },
      {
        name: 'resolution',
        label: 'Resolution',
        type: 'select',
        defaultValue: '1080p',
        options: [
          { value: '720p', label: '720p' },
          { value: '1080p', label: '1080p' },
          { value: '4K', label: '4K (slower)' }
        ],
        description: 'Set in platform UI · not added to prompt'
      }
    ]
  }
];

export const getModelById = (id: string): ModelSchema | undefined => {
  return MODEL_SCHEMAS.find(model => model.id === id);
};

export const getModelsByTab = (tab: 'image' | 'video'): ModelSchema[] => {
  return MODEL_SCHEMAS.filter(model => model.tab === tab);
};
