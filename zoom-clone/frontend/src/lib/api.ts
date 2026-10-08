// Typed API client. Every component talks to the backend only through this file.
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type User = { id: number; name: string; email: string; avatar_color: string };
export type Meeting = {
  id: number; meeting_code: string; formatted_code: string; title: string; description: string;
  type: "instant" | "scheduled"; status: "scheduled" | "live" | "ended";
  scheduled_start: string | null; duration_minutes: number; host_name: string; join_url: string;
};
export type Participant = {
  id: number; display_name: string; role: "host" | "participant"; is_muted: boolean; joined_at: string;
};

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Is the backend running?");
  }
  if (!res.ok) {
    let msg = "Something went wrong. Please try again.";
    try {
      const body = await res.json();
      msg = typeof body.detail === "string" ? body.detail : body.detail?.[0]?.msg ?? msg;
    } catch {}
    throw new ApiError(res.status, msg);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const post = <T,>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });

export const api = {
  me: () => request<User>("/api/me"),
  upcoming: () => request<Meeting[]>("/api/meetings/upcoming"),
  recent: () => request<Meeting[]>("/api/meetings/recent"),
  createInstant: (title?: string) => post<Meeting>("/api/meetings/instant", { title }),
  schedule: (b: { title: string; description: string; start: string; duration_minutes: number }) =>
    post<Meeting>("/api/meetings/schedule", b),
  lookup: (q: string) => request<Meeting>(`/api/meetings/lookup?q=${encodeURIComponent(q)}`),
  getMeeting: (code: string) => request<Meeting>(`/api/meetings/${code}`),
  join: (code: string, b: { display_name: string; as_host?: boolean }) =>
    post<{ participant: Participant; meeting: Meeting }>(`/api/meetings/${code}/join`, b),
  participants: (code: string) => request<Participant[]>(`/api/meetings/${code}/participants`),
  leave: (code: string, pid: number) => post<void>(`/api/meetings/${code}/leave?participant_id=${pid}`),
  muteAll: (code: string, rid: number) => post<void>(`/api/meetings/${code}/mute-all?requester_id=${rid}`),
  remove: (code: string, pid: number, rid: number) =>
    request<void>(`/api/meetings/${code}/participants/${pid}?requester_id=${rid}`, { method: "DELETE" }),
  end: (code: string, rid: number) => post<void>(`/api/meetings/${code}/end?requester_id=${rid}`),
};
