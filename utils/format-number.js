export default function formatNumber(value) {
  // Se for string, tenta converter para número
  if (typeof value === 'string') {
    const num = Number(value);
    if (isNaN(num)) return value; // retorna original se não for um número válido
    return formatNumber(num).toString();
  }

  // Se for número, formata
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return value;
    } else {
      return Number(value.toFixed(3));
    }
  }

  // Se não for número nem string, retorna como está
  return value;
}
