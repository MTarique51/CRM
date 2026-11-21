export function validatePhone(phone: string) {
  return (
    /^\+?[0-9\s()-]{10,16}$/.test(phone || "") &&
    (phone || "").replace(/\D/g, "").length >= 10
  );
}
export function validatePassword(password: string) {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}
export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}
export function validatePayload(resource: string, data: any) {
  const errors: string[] = [];
  if (resource === "customers") {
    if (!data.name?.trim()) errors.push("Customer name is required.");
    if (data.name?.length > 100)
      errors.push("Customer name must be 100 characters or fewer.");
    if (!validateEmail(data.email)) errors.push("Enter a valid email address.");
    if (!validatePhone(data.phone)) errors.push("Enter a valid phone number.");
  }
  if (resource === "leads") {
    if (!data.name?.trim()) errors.push("Lead name is required.");
    if (data.name?.length > 100)
      errors.push("Lead name must be 100 characters or fewer.");
    if (data.email && !validateEmail(data.email))
      errors.push("Enter a valid email address.");
    if (data.phone && !validatePhone(data.phone))
      errors.push("Enter a valid phone number.");
    if (data.expectedValue != null && Number(data.expectedValue) < 0)
      errors.push("Expected value cannot be negative.");
  }
  if (resource === "opportunities") {
    if (!data.name?.trim()) errors.push("Opportunity name is required.");
    if (!(Number(data.amount) > 0))
      errors.push("Opportunity Amount must be greater than 0.");
    if (Number(data.probability) < 0 || Number(data.probability) > 100)
      errors.push("Probability must be between 0 and 100.");
    if (
      data.stage !== "Won" &&
      data.stage !== "Lost" &&
      data.expectedCloseDate &&
      new Date(data.expectedCloseDate) < new Date(new Date().toDateString())
    )
      errors.push("Expected Close Date cannot be in the past.");
  }
  if (resource === "followups") {
    if (!data.subject?.trim()) errors.push("Follow-up subject is required.");
    if (!data.date) errors.push("Follow-up date is required.");
    if (
      data.status !== "Completed" &&
      data.status !== "Missed" &&
      data.date &&
      new Date(data.date) < new Date(new Date().toDateString())
    )
      errors.push("Follow-up date cannot be earlier than today.");
    if (!data.customer && !data.lead && !data.opportunity)
      errors.push("Select a related customer, lead or opportunity.");
  }
  if (resource === "activities" && !data.subject?.trim())
    errors.push("Activity subject is required.");
  return errors;
}
