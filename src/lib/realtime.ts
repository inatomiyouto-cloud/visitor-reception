import type { Visitor } from "@/lib/types";

export const REALTIME_CHANNEL = "visitor-reception-realtime";

export type RealtimeEvent =
  | { type: "INSERT"; visitor: Visitor }
  | { type: "UPDATE"; visitor: Visitor }
  | { type: "DELETE"; id: string };

export function broadcastRealtimeEvent(event: RealtimeEvent): void {
  if (typeof window === "undefined") return;

  const channel = new BroadcastChannel(REALTIME_CHANNEL);
  channel.postMessage(event);
  channel.close();
}

export function subscribeRealtimeEvents(
  handler: (event: RealtimeEvent) => void,
): () => void {
  const channel = new BroadcastChannel(REALTIME_CHANNEL);
  channel.onmessage = (message) => {
    handler(message.data as RealtimeEvent);
  };

  return () => channel.close();
}
