/**
 * Formats numeric values to currency representation
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formats a date string YYYY-MM-DD into localized Spanish format (e.g., "Lun, 2 Nov 2026")
 */
export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current time formatted as HH:MM:SS
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Calculates the operational salon cycle: from previous Tuesday to Sunday
 * E.g., on Monday, it returns the Tuesday of last week up to yesterday (Sunday).
 */
export function getDefaultTuesdayToSundayRange(refDate?: Date): { startDate: string; endDate: string } {
  const d = refDate ? new Date(refDate) : new Date();
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday, etc.

  let daysToLastSunday = 0;
  if (dayOfWeek === 1) { // Monday -> yesterday was Sunday
    daysToLastSunday = 1;
  } else if (dayOfWeek === 0) { // Sunday -> today is Sunday
    daysToLastSunday = 0;
  } else {
    // Tuesday (2) to Saturday (6): the last closed Sunday was dayOfWeek days ago
    daysToLastSunday = dayOfWeek;
  }

  const endSunday = new Date(d);
  endSunday.setDate(d.getDate() - daysToLastSunday);

  const startTuesday = new Date(endSunday);
  startTuesday.setDate(endSunday.getDate() - 5); // Tuesday is 5 days before Sunday

  const formatYMD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatYMD(startTuesday),
    endDate: formatYMD(endSunday),
  };
}
