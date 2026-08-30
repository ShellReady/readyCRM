import { Lead, WorkBlock, DayOfWeek } from '../types';

export interface IANATimezoneOption {
  value: string;
  label: string;
  region: string;
  utcOffset: string;
}

export const COMMON_TIMEZONES: IANATimezoneOption[] = [
  { value: 'America/Bogota', label: 'Bogotá / Lima / Quito (UTC-5)', region: 'Colombia, Perú, Ecuador', utcOffset: 'UTC-5' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (UTC-6)', region: 'México', utcOffset: 'UTC-6' },
  { value: 'America/Santiago', label: 'Santiago de Chile (UTC-4 / UTC-3)', region: 'Chile', utcOffset: 'UTC-3/4' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (UTC-3)', region: 'Argentina', utcOffset: 'UTC-3' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)', region: 'Brasil', utcOffset: 'UTC-3' },
  { value: 'America/Caracas', label: 'Caracas (UTC-4)', region: 'Venezuela', utcOffset: 'UTC-4' },
  { value: 'America/New_York', label: 'Nueva York / Miami (EST / EDT, UTC-5/4)', region: 'EE.UU. Este', utcOffset: 'UTC-4/5' },
  { value: 'America/Chicago', label: 'Chicago / Dallas (CST / CDT, UTC-6/5)', region: 'EE.UU. Centro', utcOffset: 'UTC-5/6' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles / San Francisco (PST / PDT, UTC-8/7)', region: 'EE.UU. Oeste', utcOffset: 'UTC-7/8' },
  { value: 'Europe/Madrid', label: 'Madrid / Barcelona (CET / CEST, UTC+1/2)', region: 'España', utcOffset: 'UTC+1/2' },
  { value: 'Europe/London', label: 'Londres (GMT / BST, UTC+0/1)', region: 'Reino Unido', utcOffset: 'UTC+0/1' },
];

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

/**
 * Validates if an IANA timezone identifier is supported by the runtime
 */
export function isValidTimezone(tz?: string): boolean {
  if (!tz) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Calculates current real-time local time for a lead
 */
export function getLeadLocalTimeInfo(
  leadTimezone?: string,
  userDefaultTimezone: string = 'America/Bogota'
): {
  formattedTime: string;
  timezone: string;
  hour24: number;
  isInBusinessHours: boolean;
  businessStatusText: string;
  gmtOffset: string;
} {
  const tz = isValidTimezone(leadTimezone) ? leadTimezone! : userDefaultTimezone;
  const matchTz = COMMON_TIMEZONES.find((c) => c.value === tz);
  const gmtOffset = matchTz?.utcOffset || 'Local';

  try {
    const now = new Date();

    // Get 24-hour hour integer in that timezone
    const hourFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      hour12: false,
    });
    const hour24 = parseInt(hourFormatter.format(now), 10) || 12;

    // Get formatted 12-hour string (e.g., "10:45 AM")
    const timeFormatter = new Intl.DateTimeFormat('es-ES', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const formattedTime = timeFormatter.format(now);

    // Business hours are standard 9:00 AM (09:00) to 6:00 PM (18:00)
    const isInBusinessHours = hour24 >= 9 && hour24 < 18;

    let businessStatusText = '🟢 En horario laboral';
    if (hour24 < 8) {
      businessStatusText = '🌙 Madrugada / Fuera de horario';
    } else if (hour24 < 9) {
      businessStatusText = '🟡 Pre-jornada (8:00-9:00)';
    } else if (hour24 >= 18 && hour24 < 21) {
      businessStatusText = '🟡 Fin de jornada / Tarde';
    } else if (hour24 >= 21) {
      businessStatusText = '🌙 Noche / Fuera de horario';
    }

    return {
      formattedTime,
      timezone: tz,
      hour24,
      isInBusinessHours,
      businessStatusText,
      gmtOffset,
    };
  } catch (error) {
    return {
      formattedTime: new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date()),
      timezone: userDefaultTimezone,
      hour24: 12,
      isInBusinessHours: true,
      businessStatusText: '🟢 En horario laboral',
      gmtOffset: 'UTC-5',
    };
  }
}

/**
 * Returns current day of week in Spanish
 */
export function getCurrentDayOfWeek(userTimezone: string = 'America/Bogota'): DayOfWeek {
  try {
    const dayFormatter = new Intl.DateTimeFormat('es-ES', {
      timeZone: userTimezone,
      weekday: 'long',
    });
    const dayStr = dayFormatter.format(new Date()).toLowerCase();

    if (dayStr.startsWith('lun')) return 'Lunes';
    if (dayStr.startsWith('mar')) return 'Martes';
    if (dayStr.startsWith('mié') || dayStr.startsWith('mie')) return 'Miércoles';
    if (dayStr.startsWith('jue')) return 'Jueves';
    if (dayStr.startsWith('vie')) return 'Viernes';
    if (dayStr.startsWith('sáb') || dayStr.startsWith('sab')) return 'Sábado';
    return 'Domingo';
  } catch (e) {
    return 'Lunes';
  }
}

/**
 * Returns the currently active work block for user's local time
 */
export function getActiveWorkBlock(
  workBlocks: WorkBlock[],
  userTimezone: string = 'America/Bogota'
): {
  activeBlock: WorkBlock | null;
  currentDay: DayOfWeek;
  currentTimeStr: string;
  nextBlock: WorkBlock | null;
} {
  const currentDay = getCurrentDayOfWeek(userTimezone);

  let currentTimeStr = '10:00';
  try {
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: userTimezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    currentTimeStr = timeFormatter.format(new Date());
  } catch (e) {
    currentTimeStr = new Date().toTimeString().slice(0, 5);
  }

  const todayBlocks = workBlocks.filter((b) => b.day === currentDay);

  const activeBlock =
    todayBlocks.find((b) => currentTimeStr >= b.startTime && currentTimeStr < b.endTime) || null;

  const nextBlock =
    todayBlocks.find((b) => b.startTime > currentTimeStr) || null;

  return {
    activeBlock,
    currentDay,
    currentTimeStr,
    nextBlock,
  };
}
