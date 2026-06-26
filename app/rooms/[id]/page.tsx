import { RoomShell } from '@/components/rooms/room-shell'

// This is a Server Component — it awaits the async params/searchParams
// and passes plain objects to the client shell, eliminating the
// use(Promise) re-suspension loop that caused infinite reloads.
export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { id } = await params
  const sp     = await searchParams

  return (
    <RoomShell
      id={id}
      name={sp.name ?? 'Study Room'}
      exam={sp.exam ?? 'SAT'}
      topic={sp.topic ?? ''}
    />
  )
}
