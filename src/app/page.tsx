import Header from "@/components/header"
import FindRideForm from "@/components/FindRideForm"

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <Header />
      <div className="flex-1 p-6">
        <FindRideForm />
      </div>
    </div>
  )
}
