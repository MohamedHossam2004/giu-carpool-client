import { ridesClient } from '../apollo-client';
import { GET_AREAS } from '../graphql/queries';

interface MeetingPoint {
  id: string;
  name: string;
  longitude: number;
  latitude: number;
  isActive: boolean;
}

interface Area {
  id: string;
  name: string;
  isActive: boolean;
  meetingPoints: MeetingPoint[];
}

let areasCache: Area[] = [];

export async function getAreas(): Promise<Area[]> {
  if (areasCache.length > 0) {
    return areasCache;
  }

  try {
    const { data } = await ridesClient.query({
      query: GET_AREAS,
      fetchPolicy: 'network-only'
    });

    areasCache = data.getAreas;
    console.log(areasCache)
    return areasCache;
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
}

export function getMeetingPointName(areaId: string): string {
  if (areasCache.length === 0) {
    return `Area ID: ${areaId}`;
  }

  const area = areasCache.find(a => parseInt(a.id) === parseInt(areaId));
  if (area) {
    return area.name;
  }

  return `Area ID: ${areaId}`;
}