import { base44 } from "@/api/base44Client";

export async function notifyRoles(targetRoles, { type = "info", title, message, ref_id = null, link = null }) {
  try {
    await base44.entities.Notification.create({
      type,
      title,
      message,
      ref_id,
      link,
      target_roles: Array.isArray(targetRoles) ? targetRoles : [targetRoles],
      read_by: [],
    });
  } catch {
    /* noop */
  }
}
