import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MeetingPointFormProps {
  selectedAreaName: string;
  point: {
    name: string;
    lat: string;
    long: string;
    isActive: boolean;
  };
  setPoint: (point: any) => void;
  onCreatePoint: () => void;
  existingPoints: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
  }>;
  onDeletePoint: (pointId: string) => void;
}

export function MeetingPointForm({
  selectedAreaName,
  point,
  setPoint,
  onCreatePoint,
  existingPoints,
  onDeletePoint
}: MeetingPointFormProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Add Meeting Point to {selectedAreaName}
      </h2>
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="mb-2" htmlFor="pointName">Point Name</Label>
            <Input
              id="pointName"
              value={point.name}
              onChange={e => setPoint({ ...point, name: e.target.value })}
              placeholder="Enter point name"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pointActive"
              checked={point.isActive}
              onCheckedChange={(checked) => setPoint({ ...point, isActive: checked as boolean })}
            />
            <Label htmlFor="pointActive">Active</Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2" htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={point.lat}
                readOnly
                placeholder="Click on map"
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={point.long}
                readOnly
                placeholder="Click on map"
              />
            </div>
          </div>
          <Button onClick={onCreatePoint}>Add Point</Button>
        </div>

        {existingPoints.length > 0 && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Existing Meeting Points</h3>
            <div className="space-y-2">
              {existingPoints.map((existingPoint) => (
                <div
                  key={existingPoint.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{existingPoint.name}</span>
                    <Badge variant={existingPoint.isActive ? "default" : "secondary"}>
                      {existingPoint.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeletePoint(existingPoint.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 