import { Button } from "@/components/ui/button"

interface ModeSwitcherProps {
  mode: 'area' | 'meeting-point';
  onModeChange: (mode: 'area' | 'meeting-point') => void;
}

export function ModeSwitcher({ mode, onModeChange }: ModeSwitcherProps) {
  return (
    <div className="flex space-x-2 mb-4">
      <Button
        variant={mode === 'area' ? 'default' : 'outline'}
        onClick={() => onModeChange('area')}
        className="flex-1"
      >
        Create Area
      </Button>
      <Button
        variant={mode === 'meeting-point' ? 'default' : 'outline'}
        onClick={() => onModeChange('meeting-point')}
        className="flex-1"
      >
        Add Meeting Point
      </Button>
    </div>
  )
} 