export function formatPetBirthDate(iso?: string) {
  if (!iso) return 'Não informado';
  const [year, month, day] = iso.slice(0, 10).split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

export function isValidBirthDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}
