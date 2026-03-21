// src/api/routes.ts
export interface RouteItem {
  path: string;
  target: string;
  name: string;
  description: string;
}

export async function fetchRoutes(): Promise<RouteItem[]> {
  const res = await fetch('/api/routes');
  if (!res.ok) throw new Error('Failed to fetch routes');
  const json = await res.json();
  return json.data;
}
