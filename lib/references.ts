import { Customer, Lead, Opportunity, User } from "@/models";
const validId = (value: any) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
export async function validateReferences(resource: string, data: any) {
  const checks: [string, any][] = [];
  if (resource === "opportunities") {
    if (data.customer) checks.push(["Customer", Customer]);
    if (data.lead) checks.push(["Lead", Lead]);
  }
  if (resource === "followups") {
    if (!data.customer && !data.lead && !data.opportunity)
      return "Select a related customer, lead or opportunity.";
    if (data.customer) checks.push(["Customer", Customer]);
    if (data.lead) checks.push(["Lead", Lead]);
    if (data.opportunity) checks.push(["Opportunity", Opportunity]);
  }
  if (resource === "activities") {
    if (data.customer) checks.push(["Customer", Customer]);
    if (data.lead) checks.push(["Lead", Lead]);
  }
  for (const [label, Model] of checks) {
    const key = label.toLowerCase();
    const value = data[key];
    if (!validId(String(value)))
      return `Select a valid ${label.toLowerCase()}.`;
    if (!(await Model.exists({ _id: value })))
      return `The selected ${label.toLowerCase()} does not exist.`;
  }
  for (const key of ["owner", "assignedTo"]) {
    if (data[key]) {
      if (!validId(String(data[key]))) return "Select a valid assigned user.";
      const assigned = await User.findById(data[key]).select("isActive");
      if (!assigned || !assigned.isActive)
        return "The assigned user does not exist or is inactive.";
    }
  }
  return null;
}
