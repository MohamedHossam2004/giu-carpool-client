export interface MeetingPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
}

export interface Area {
  id: string;
  name: string;
  isActive: boolean;
  meetingPoints: MeetingPoint[];
}