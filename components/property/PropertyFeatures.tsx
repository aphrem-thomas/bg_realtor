import { Check } from "lucide-react";
import type { ListingFeatureGroup, ListingRoom } from "@/lib/ddf/types";

export function PropertyFeatures({ groups }: { groups: ListingFeatureGroup[] }) {
  if (groups.length === 0) return null;
  return (
    <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="text-sm font-semibold text-ink">{group.label}</h3>
          <ul className="mt-2.5 space-y-1.5 text-sm text-ink-soft">
            {group.items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function RoomsTable({ rooms }: { rooms: ListingRoom[] }) {
  if (rooms.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-line">
      <table className="w-full min-w-[420px] text-left text-sm">
        <caption className="sr-only">Room dimensions</caption>
        <thead className="bg-paper text-xs text-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Room</th>
            <th scope="col" className="px-4 py-3 font-medium">Level</th>
            <th scope="col" className="px-4 py-3 font-medium">Dimensions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-surface">
          {rooms.map((room, i) => (
            <tr key={`${room.type}-${i}`}>
              <th scope="row" className="px-4 py-3 font-medium text-ink">{room.type}</th>
              <td className="px-4 py-3 text-ink-soft">{room.level ?? "—"}</td>
              <td className="px-4 py-3 text-ink-soft">{room.dimensions ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
