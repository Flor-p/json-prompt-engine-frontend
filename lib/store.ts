import { create } from 'zustand';
import { MODEL_SCHEMAS, getModelById } from '@/config/modelSchemas';

export interface PromptState {
  activeTab: 'image' | 'video';
  activeModel: string;
  currentData: Record<string, any>;
  jsonError: string | null;
  outputText: string;
}

interface PromptEngineStore extends PromptState {
  setActiveTab: (tab: 'image' | 'video') => void;
  setActiveModel: (modelId: string) => void;
  updateField: (fieldName: string, value: any) => void;
  setCurrentData: (data: Record<string, any>) => void;
  setJsonError: (error: string | null) => void;
  setOutputText: (text: string) => void;
  resetToDefaults: () => void;
}

const getDefaultData = (modelId: string): Record<string, any> => {
  const model = getModelById(modelId);
  if (!model) return {};

  const defaults: Record<string, any> = {};
  model.fields.forEach(field => {
    defaults[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
  });
  return defaults;
};

export const usePromptStore = create<PromptEngineStore>((set, get) => ({
  activeTab: 'image',
  activeModel: 'midjourney',
  currentData: getDefaultData('midjourney'),
  jsonError: null,
  outputText: '',

  setActiveTab: (tab) => {
    const modelsInTab = MODEL_SCHEMAS.filter(m => m.tab === tab);
    const firstModel = modelsInTab[0];

    set({
      activeTab: tab,
      activeModel: firstModel?.id || '',
      currentData: firstModel ? getDefaultData(firstModel.id) : {},
      jsonError: null,
      outputText: ''
    });
  },

  setActiveModel: (modelId) => {
    set({
      activeModel: modelId,
      currentData: getDefaultData(modelId),
      jsonError: null,
      outputText: ''
    });
  },

  updateField: (fieldName, value) => {
    set((state) => ({
      currentData: {
        ...state.currentData,
        [fieldName]: value
      }
    }));
  },

  setCurrentData: (data) => {
    set({ currentData: data });
  },

  setJsonError: (error) => {
    set({ jsonError: error });
  },

  setOutputText: (text) => {
    set({ outputText: text });
  },

  resetToDefaults: () => {
    const { activeModel } = get();
    set({
      currentData: getDefaultData(activeModel),
      jsonError: null,
      outputText: ''
    });
  }
}));
