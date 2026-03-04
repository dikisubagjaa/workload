import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc'; 
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat'; 

dayjs.extend(utc);
dayjs.extend(timezone); 
dayjs.extend(customParseFormat); 


export const getCurrentTimestamp = () => {
    return new Date().toISOString().slice(0, 19).replace("T", " "); // Format: YYYY-MM-DD HH:mm:ss
};

export const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split("T")[0]; // Format: YYYY-MM-DD
};

export const formatDateTime = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().slice(0, 19).replace("T", " "); // Format: YYYY-MM-DD HH:mm:ss
};

export const getStartOfDay = (date) => {
    const d = new Date(date || new Date());
    d.setHours(0, 0, 0, 0);
    return formatDateTime(d);
};

export const getEndOfDay = (date) => {
    const d = new Date(date || new Date());
    d.setHours(23, 59, 59, 999);
    return formatDateTime(d);
};

export const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return formatDateTime(d);
};

export const subtractDays = (date, days) => {
    return addDays(date, -days);
};

export const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};



// Hitung selisih dalam minggu
export const calculateWeeksBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMs = end - start;
    return Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000)); // 1 minggu = 7 hari
};

// Hitung selisih dalam bulan
export const calculateMonthsBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) {
        months--; // Jika tanggal di bulan akhir lebih kecil dari bulan awal, kurangi 1 bulan
    }
    return months;
};

// Hitung selisih dalam tahun
export const calculateYearsBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let years = end.getFullYear() - start.getFullYear();
    if (end.getMonth() < start.getMonth() || (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())) {
        years--; // Jika bulan/tanggal di tahun akhir lebih kecil, kurangi 1 tahun
    }
    return years;
};


/**
 * Mengembalikan Unix timestamp saat ini dalam detik (UTC 0).
 * Berguna untuk kolom DB bertipe INTEGER.
 * @returns {number} Unix timestamp dalam detik.
 */
export const nowUnix = () => {
    return dayjs().utc().unix();
};

/**
 * Mengembalikan objek dayjs dari Unix timestamp (detik) dalam UTC.
 * @param {number} timestamp - Unix timestamp dalam detik.
 * @returns {dayjs.Dayjs | null} Objek dayjs dalam UTC atau null.
 */
export const fromUnixTimestampUTC = (timestamp) => {
    return typeof timestamp === 'number' ? dayjs.unix(timestamp).utc() : null;
};

/**
 * Mengembalikan string datetime YYYY-MM-DD HH:mm:ss dari objek dayjs atau Unix timestamp (detik) dalam UTC.
 * Berguna untuk kolom DB bertipe DATETIME/TIMESTAMP.
 * @param {dayjs.Dayjs|number|string} date - Objek dayjs, Unix timestamp, atau string tanggal.
 * @returns {string | null} String datetime atau null.
 */
export const formatToDatetimeStringUTC = (date) => {
    if (!date) return null;
    let d = dayjs.isDayjs(date) ? date : dayjs.unix(date); // Jika angka, parse sebagai Unix timestamp
    if (typeof date === 'string') d = dayjs.utc(date); // Jika string, parse sebagai UTC string
    return d && d.isValid() ? d.utc().format('YYYY-MM-DD HH:mm:ss') : null;
};
