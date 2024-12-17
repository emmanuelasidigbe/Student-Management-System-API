export function isFieldValid(model: any, field: string): boolean {
  return Object.keys(model.schema.obj).includes(field);
}

export function isValidOrder(order: string | undefined): boolean {
  return order === "asc" || order === "desc";
}
