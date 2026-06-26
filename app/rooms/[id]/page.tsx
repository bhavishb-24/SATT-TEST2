import { RoomShell } from '@/components/rooms/room-shell'

// Server Component: awaits params/searchParams and passes plain values to the
// client RoomShell. The shell fetches authoritative room data from the DB on
// mount; the URL params below are only used as loading-state fallbacks.
export default async function RoomPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { id } = await params
  const sp     = await searchParams

  return (
    <RoomShell
      id={id}
      name={sp.name  ?? 'Study Room'}
      exam={sp.exam  ?? 'SAT'}
      topic={sp.topic ?? 'General Review'}
    />
  )
}
