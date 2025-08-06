'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Textarea } from './textarea';
import { Checkbox } from './checkbox';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Switch } from './switch';
import { Slider } from './slider';
import { Progress } from './progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './toast';
import { useToast } from './use-toast';
import { 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Download, 
  Upload,
  Plus,
  Minus,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Enhanced Input with copy functionality
interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  copyable?: boolean;
  showPassword?: boolean;
  onCopy?: (value: string) => void;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
}

export function EnhancedInput({
  copyable = false,
  showPassword = false,
  onCopy,
  suffix,
  prefix,
  className = '',
  ...props
}: EnhancedInputProps) {
  const [copied, setCopied] = useState(false);
  const [showValue, setShowValue] = useState(!showPassword);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    if (inputRef.current) {
      await navigator.clipboard.writeText(inputRef.current.value);
      setCopied(true);
      onCopy?.(inputRef.current.value);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      {prefix && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {prefix}
        </div>
      )}
      <Input
        ref={inputRef}
        type={showPassword && !showValue ? 'password' : 'text'}
        className={`${prefix ? 'pl-10' : ''} ${suffix || copyable ? 'pr-10' : ''} ${className}`}
        {...props}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
        {suffix}
        {showPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowValue(!showValue)}
          >
            {showValue ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        )}
        {copyable && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        )}
      </div>
    </div>
  );
}

// Enhanced Button with loading states
interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function EnhancedButton({
  loading = false,
  loadingText,
  icon,
  children,
  disabled,
  className = '',
  ...props
}: EnhancedButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Button>
  );
}

// Enhanced Card with actions
interface EnhancedCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function EnhancedCard({
  title,
  description,
  children,
  actions,
  footer,
  className = '',
  collapsible = false,
  defaultCollapsed = false
}: EnhancedCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <Card className={className}>
      {(title || description || actions || collapsible) && (
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex-1">
            {title && <CardTitle className="text-lg">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center space-x-2">
            {actions}
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardHeader>
      )}
      {!collapsed && <CardContent>{children}</CardContent>}
      {footer && !collapsed && (
        <div className="px-6 py-4 border-t bg-muted/50">
          {footer}
        </div>
      )}
    </Card>
  );
}

// Enhanced Select with search
interface EnhancedSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string; description?: string }[];
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
}

export function EnhancedSelect({
  value,
  onValueChange,
  placeholder = 'Select an option',
  options,
  searchable = false,
  multiple = false,
  className = ''
}: EnhancedSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(value ? [value] : []);

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleSelect = (selectedValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(selectedValue)
        ? selectedValues.filter(v => v !== selectedValue)
        : [...selectedValues, selectedValue];
      setSelectedValues(newValues);
      onValueChange?.(newValues.join(','));
    } else {
      onValueChange?.(selectedValue);
    }
  };

  return (
    <div className={className}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {searchable && (
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          )}
          {filteredOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div>
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Enhanced Textarea with character count
interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
  showCount?: boolean;
  autoResize?: boolean;
}

export function EnhancedTextarea({
  maxLength,
  showCount = false,
  autoResize = false,
  className = '',
  ...props
}: EnhancedTextareaProps) {
  const [value, setValue] = useState(props.value || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    props.onChange?.(e);

    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        className={className}
        {...props}
      />
      {showCount && maxLength && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}

// Enhanced Alert with actions
interface EnhancedAlertProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'warning' | 'info' | 'success';
  actions?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function EnhancedAlert({
  title,
  description,
  variant = 'default',
  actions,
  dismissible = false,
  onDismiss
}: EnhancedAlertProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Alert className={getVariantStyles()}>
      <div className="flex items-start space-x-2">
        {getIcon()}
        <div className="flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          {description && <AlertDescription>{description}</AlertDescription>}
        </div>
        <div className="flex items-center space-x-2">
          {actions}
          {dismissible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}

// Enhanced Progress with labels
interface EnhancedProgressProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function EnhancedProgress({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  variant = 'default'
}: EnhancedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-2';
      case 'lg':
        return 'h-4';
      default:
        return 'h-3';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'destructive':
        return 'bg-red-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="space-y-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showValue && <span className="text-muted-foreground">{value}/{max}</span>}
        </div>
      )}
      <div className={`w-full bg-muted rounded-full ${getSizeClasses()}`}>
        <div
          className={`${getVariantClasses()} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Enhanced Badge with status
interface EnhancedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

export function EnhancedBadge({
  children,
  variant = 'default',
  status,
  className = ''
}: EnhancedBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <Badge variant={variant} className={className}>
        {children}
      </Badge>
      {status && (
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      )}
    </div>
  );
}

// Enhanced Tabs with lazy loading
interface EnhancedTabsProps {
  tabs: {
    value: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
  }[];
  defaultValue?: string;
  className?: string;
}

export function EnhancedTabs({
  tabs,
  defaultValue,
  className = ''
}: EnhancedTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={className}>
      <TabsList className="grid w-full grid-cols-3">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map(tab => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Enhanced Accordion with custom styling
interface EnhancedAccordionProps {
  items: {
    value: string;
    title: string;
    content: React.ReactNode;
    disabled?: boolean;
  }[];
  type?: 'single' | 'multiple';
  className?: string;
}

export function EnhancedAccordion({
  items,
  type = 'single',
  className = ''
}: EnhancedAccordionProps) {
  return (
    <Accordion type={type} className={className}>
      {items.map(item => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger disabled={item.disabled}>
            {item.title}
          </AccordionTrigger>
          <AccordionContent>
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// Enhanced Switch with labels
interface EnhancedSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function EnhancedSwitch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className = ''
}: EnhancedSwitchProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      {(label || description) && (
        <div className="space-y-1">
          {label && <Label className="text-sm font-medium">{label}</Label>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
    </div>
  );
}

// Enhanced Slider with labels and steps
interface EnhancedSliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function EnhancedSlider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  className = ''
}: EnhancedSliderProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <Label>{label}</Label>}
          {showValue && <span className="text-muted-foreground">{value.join(' - ')}</span>}
        </div>
      )}
      <Slider
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}
