import dayjs from "dayjs";
import "dayjs/locale/vi";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";

// Thêm plugin để parse custom format
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

// Hàm helper để parse ngày từ backend
export const parseDate = (dateString) => {
  if (!dateString) return null;

  // Thử parse với nhiều format khác nhau
  const formats = [
    "DD/MM/YYYY HH:mm:ss",
    "DD/MM/YYYY",
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD",
  ];

  for (const format of formats) {
    const parsed = dayjs(dateString, format, true); // strict mode
    if (parsed.isValid()) {
      return parsed;
    }
  }

  // Fallback - parse thông thường
  const fallback = dayjs(dateString);
  return fallback.isValid() ? fallback : null;
};

export const formatDateDisplay = (dateString) => {
  if (!dateString) return "";
  const parsed = parseDate(dateString);
  return parsed && parsed.isValid()
    ? parsed.format("DD/MM/YYYY HH:mm:ss")
    : dateString;
};
