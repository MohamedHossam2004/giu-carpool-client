import { ProfileCard } from "@/components/profile-card"
import { RidesList } from "@/components/rides-list"

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <ProfileCard name="Omar Sherif" rating={4.6} phone="01098****36" email="***ro@gmail.com" />
      <RidesList />
    </div>
  )
}
