import { defaultAc, defaultRoles } from "better-auth/plugins/admin/access"

export const authRoles = {
  ...defaultRoles,
  student: defaultAc.newRole({}),
  tutor: defaultAc.newRole({}),
}
