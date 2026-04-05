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
      defaultValue: '7',
      options: [
     { value: '8', label: 'V8 (coming soon)' },
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
        name: 'stop',
        label: 'Stop (--stop)',
        type: 'slider',
        defaultValue: 100,
        min: 10,
        max: 100,
        step: 10,
        description: 'Stop generation early (10-100)'
      }
    ]
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion (AUTOMATIC1111)',
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
    id: 'sora',
    name: 'Sora',
    tab: 'video',
    fields: [
      {
        name: 'subject',
        label: 'Subject',
        type: 'textarea',
        defaultValue: '',
        placeholder: 'Describe the scene...',
        description: 'Main content of the video'
      },
      {
        name: 'style',
        label: 'Style',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., cinematic, documentary, anime',
        description: 'Visual style'
      },
      {
        name: 'mood',
        label: 'Mood',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., peaceful, intense, whimsical',
        description: 'Emotional atmosphere'
      },
      {
        name: 'camera_motion',
        label: 'Camera Motion',
        type: 'text',
        defaultValue: '',
        placeholder: 'e.g., slow pan, tracking shot, static',
        description: 'Camera movement'
      },
      {
        name: 'duration',
        label: 'Duration',
        type: 'select',
        defaultValue: '5s',
        options: [
          { value: '5s', label: '5 seconds' },
          { value: '10s', label: '10 seconds' },
          { value: '20s', label: '20 seconds' }
        ],
        description: 'Video length'
      },
      {
        name: 'aspect_ratio',
        label: 'Aspect Ratio',
        type: 'select',
        defaultValue: '16:9',
        options: [
          { value: '16:9', label: '16:9 (Landscape)' },
          { value: '9:16', label: '9:16 (Portrait)' },
          { value: '1:1', label: '1:1 (Square)' },
          { value: '21:9', label: '21:9 (Cinematic)' }
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
  }
];

export const getModelById = (id: string): ModelSchema | undefined => {
  return MODEL_SCHEMAS.find(model => model.id === id);
};

export const getModelsByTab = (tab: 'image' | 'video'): ModelSchema[] => {
  return MODEL_SCHEMAS.filter(model => model.tab === tab);
};
