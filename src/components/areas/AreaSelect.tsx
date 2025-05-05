import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface AreaSelectProps {
  selectedAreaId: string;
  onAreaSelect: (areaId: string) => void;
  onDeleteArea: () => void;
  areas: Array<{
    id: string;
    name: string;
    isActive: boolean;
  }>;
}

export function AreaSelect({
  selectedAreaId,
  onAreaSelect,
  onDeleteArea,
  areas
}: AreaSelectProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2" htmlFor="areaSelect">Select Existing Area</Label>
        <Select 
          value={selectedAreaId} 
          onValueChange={onAreaSelect}
        >
          <SelectTrigger id="areaSelect">
            <SelectValue placeholder="Select an area" />
          </SelectTrigger>
          <SelectContent>
            {areas?.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedAreaId && (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onDeleteArea}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Area
        </Button>
      )}
    </div>
  )
} 