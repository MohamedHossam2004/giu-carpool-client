import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface EnhancedToggleSwitchProps {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function EnhancedToggleSwitch({
  id,
  label,
  checked,
  onCheckedChange,
}: EnhancedToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3 cursor-pointer" 
         onClick={() => onCheckedChange(!checked)}>
      <Label 
        htmlFor={id} 
        className="font-medium text-black text-base cursor-pointer"
      >
        {label}
      </Label>
      <Switch 
        id={id} 
        checked={checked} 
        onCheckedChange={onCheckedChange} 
      />
    </div>
  )
}