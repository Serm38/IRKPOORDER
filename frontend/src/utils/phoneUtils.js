export const formatPhone = (value) => {
  let raw = value.replace(/[^\d+]/g, '');
  if (!raw.startsWith('+7')) {
    if (raw.startsWith('8')) raw = '+7' + raw.slice(1);
    else if (raw.startsWith('7')) raw = '+7' + raw.slice(1);
    else if (raw.length > 0) raw = '+7' + raw;
  }
  raw = raw.slice(0, 12);
  let formatted = '+7';
  if (raw.length > 2) formatted += ' (' + raw.slice(2, 5);
  if (raw.length > 5) formatted += ') ' + raw.slice(5, 8);
  if (raw.length > 8) formatted += '-' + raw.slice(8, 10);
  if (raw.length > 10) formatted += '-' + raw.slice(10, 12);
  return formatted;
};

export const cleanPhone = (formatted) => {
  const digits = formatted.replace(/[^\d+]/g, '');
  if (digits.startsWith('+7')) return digits.slice(0, 12);
  if (digits.startsWith('8')) return '+7' + digits.slice(1, 11);
  if (digits.startsWith('7')) return '+7' + digits.slice(1, 11);
  return digits;
};