export function getAcademicHonor(gwa: number) {
    if (gwa >= 1.00 && gwa <= 1.50) return "University Scholar";
    if (gwa > 1.50 && gwa <= 1.75) return "College Scholar";
    if (gwa > 1.75 && gwa <= 2.00) return "Dean's Lister";
    return null;
}