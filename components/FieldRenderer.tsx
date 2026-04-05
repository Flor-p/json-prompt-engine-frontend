'use client';

import { Field } from '@/config/modelSchemas';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FieldRendererProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value !== undefined && value !== null ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="bg-zinc-900 border-zinc-700"
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value !== undefined && value !== null ? value : ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="bg-zinc-900 border-zinc-700 min-h-[100px] font-mono"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value !== undefined && value !== null ? value : ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            className="bg-zinc-900 border-zinc-700"
          />
        );

      case 'select':
        return (
          <Select value={value || field.defaultValue} onValueChange={onChange}>
            <SelectTrigger className="bg-zinc-900 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700">
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>{field.min}</span>
              <span className="font-medium text-zinc-200">{value}</span>
              <span>{field.max}</span>
            </div>
            <Slider
              value={[value !== undefined ? value : field.defaultValue]}
              onValueChange={(vals) => onChange(vals[0])}
              min={field.min}
              max={field.max}
              step={field.step}
              className="py-4"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value || false}
              onCheckedChange={onChange}
              id={field.name}
            />
            <label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.description}
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <div className="flex justify-between items-baseline">
          <Label className="text-zinc-200">{field.label}</Label>
          {field.description && (
            <span className="text-xs text-zinc-500">{field.description}</span>
          )}
        </div>
      )}
      {renderField()}
    </div>
  );
}