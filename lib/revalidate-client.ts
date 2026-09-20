// Ask the server to refresh the public pages after an admin change (fire and forget).
export function revalidateSite() {
  fetch("/api/admin/revalidate", { method: "POST", keepalive: true }).catch(() => {});
}
