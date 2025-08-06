import { FC } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const modelOptions = [
  {
    value: 'gpt-35',
    label: 'GPT-3.5',
  },
  {
    value: 'gpt-4',
    label: 'GPT-4',
  },
  {
    value: 'claude',
    label: 'Claude',
  },
  {
    value: 'gemini',
    label: 'Gemini',
  },
  {
    value: 'groq',
    label: 'Groq',
  },
  {
    value: 'mistral',
    label: 'Mistral',
  },
  {
    value: 'llama-2',
    label: 'Llama 2',
  },
];

interface SelectChatModelProps {
  defaultModel: string;
  onSelect: (value: string) => void;
  isDisabled: boolean;
}

const SelectChatModel: FC<SelectChatModelProps> = ({ defaultModel, onSelect, isDisabled }) => {
  return (
    <Select defaultValue={defaultModel} onValueChange={onSelect} disabled={isDisabled}>
      <SelectTrigger className='w-40 rounded-lg bg-secondary mb-4 md:mb-0'>
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {modelOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectChatModel;
