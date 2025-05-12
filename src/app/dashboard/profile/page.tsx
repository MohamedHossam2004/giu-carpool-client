import { ProfileCard } from "@/components/profile-card"
import { RidesList } from "@/components/rides-list"

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <ProfileCard/>
      <RidesList />
    </div>
  )
}
