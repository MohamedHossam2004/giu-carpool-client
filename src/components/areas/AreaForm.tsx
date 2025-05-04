import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface AreaFormProps {
  areaName: string;
  setAreaName: (name: string) => void;
  areaActive: boolean;
  setAreaActive: (active: boolean) => void;
  onCreateArea: () => void;
}

export function AreaForm({
  areaName,
  setAreaName,
  areaActive,
  setAreaActive,
  onCreateArea
}: AreaFormProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Select or Create Area</h2>
      <div className="space-y-4">
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">Create New Area</h3>
          <div className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="areaName">Area Name</Label>
          
              <Input
                id="areaName"
                value={areaName}
                onChange={e => setAreaName(e.target.value)}
                placeholder=" Enter area name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="areaActive"
                checked={areaActive}
                onCheckedChange={(checked) => setAreaActive(checked as boolean)}
              />
              <Label htmlFor="areaActive">Active</Label>
            </div>
            <Button onClick={onCreateArea}>Create Area</Button>
          </div>
        </div>
      </div>
    </Card>
  )
} 