import ProtectedRoute from '@/components/ProtectedRoute';
import FindRideForm from "@/components/FindRideForm";
export default function FindRidePage() {
    return (<ProtectedRoute passengerOnly={true}><FindRideForm/></ProtectedRoute>);
}
