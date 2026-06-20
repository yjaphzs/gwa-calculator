import type { SchoolType } from "@/types";

export interface School {
    /** Stable slug id — persisted on profiles and used as the leaderboard group key. */
    id: string;
    name: string;
    type: SchoolType;
}

/**
 * Curated list of Philippine higher-education institutions for the leaderboard's
 * per-school grouping. Names are sourced from the unirank PH directory
 * (https://www.unirank.org/ph/a-z/).
 *
 * Each entry's `id` is a stable slug derived from its name, and its `type`
 * (`university` vs `college`) is inferred from the name for the dropdown's
 * grouping. To add a school, just add its name below — keep the spelling stable,
 * since the derived slug is stored on user profiles and leaderboard docs.
 */
const SCHOOL_NAMES: readonly string[] = [
    "Adamson University",
    "Adventist International Institute of Advanced Studies",
    "Adventist University of the Philippines",
    "Aklan State University",
    "Aldersgate College",
    "AMA Computer University",
    "Angeles University Foundation",
    "Araullo University - PHINMA",
    "Arellano University",
    "Asia Pacific College",
    "Asian Institute of Journalism and Communication",
    "Asian Institute of Management",
    "Asian Institute of Maritime Studies",
    "Asian Social Institute",
    "Assumption College San Lorenzo",
    "Ateneo de Davao University",
    "Ateneo de Manila University",
    "Ateneo de Naga University",
    "Ateneo de Zamboanga University",
    "Aurora State College of Technology",
    "Baliuag University",
    "Bataan Peninsula State University",
    "Batangas State University",
    "Benguet State University",
    "Bicol University",
    "Biliran Province State University",
    "Bohol Island State University",
    "Bukidnon State University",
    "Bulacan Agricultural State College",
    "Bulacan State University",
    "Cagayan State University",
    "Camarines Norte State College",
    "Camarines Sur Polytechnic Colleges",
    "Capitol University",
    "Capiz State University",
    "Caraga State University",
    "Catanduanes State University",
    "Cavite State University",
    "Cebu Doctors' University",
    "Cebu Institute of Medicine",
    "Cebu Institute of Technology",
    "Cebu Normal University",
    "Cebu Technological University",
    "Central Colleges of the Philippines",
    "Central Luzon State University",
    "Central Mindanao University",
    "Central Philippine Adventist College",
    "Central Philippine University",
    "Centro Escolar University",
    "Chiang Kai Shek College",
    "Christ the King College",
    "Colegio de San Juan de Letran",
    "College of the Holy Spirit",
    "Cor Jesu College",
    "Davao Doctors College",
    "De La Salle Lipa",
    "De La Salle Medical and Health Sciences Institute",
    "De La Salle University",
    "De La Salle-College of Saint Benilde",
    "Don Bosco Technical College",
    "Don Mariano Marcos Memorial State University",
    "Eastern Samar State University",
    "Eastern Visayas State University",
    "Emilio Aguinaldo College",
    'Eulogio "Amang" Rodriguez Institute of Science and Technology',
    "Far Eastern University",
    "Father Saturnino Urios University",
    "FEATI University",
    "FEU Institute of Technology",
    "Filamer Christian University",
    "Guagua National Colleges",
    "Guimaras State University",
    "Holy Angel University",
    "Holy Cross of Davao College",
    "Holy Name University",
    "Holy Trinity University",
    "Ilocos Sur Polytechnic State College",
    "Iloilo Science and Technology University",
    "Isabela State University",
    "John B. Lacson Foundation Maritime University",
    "José Rizal University",
    "La Consolacion College",
    "La Consolacion College Manila",
    "La Consolacion University Philippines",
    "La Salle University, Ozamiz City",
    "Laguna State Polytechnic University",
    "Leyte Normal University",
    "Liceo de Cagayan University",
    "Lipa City Colleges",
    "Lorma Colleges",
    "Lourdes College",
    "Lyceum of the Philippines University",
    "Lyceum-Northwestern University",
    "Manila Central University",
    "Manuel L. Quezon University",
    "Manuel S. Enverga University Foundation",
    "Mapúa University",
    "Mariano Marcos State University",
    "Marinduque State University",
    "Meycauayan College",
    "Mindanao State University",
    "Mindanao State University - Iligan Institute of Technology",
    "Miriam College",
    "Misamis Oriental State College of Agriculture and Technology",
    "Misamis University",
    "Mountain View College",
    "National College of Business and Arts",
    "National Defense College of the Philippines",
    "National Teachers College",
    "National University, Philippines",
    "Negros Oriental State University",
    "New Era University",
    "North Eastern Mindanao State University",
    "Northern Luzon Adventist College",
    "Northwest Samar State University",
    "Northwestern University, Philippines",
    "Notre Dame of Dadiangas University",
    "Notre Dame of Kidapawan College",
    "Notre Dame of Marbel University",
    "Notre Dame University",
    "Nueva Ecija University of Science and Technology",
    "Nueva Vizcaya State University",
    "Olivarez College",
    "Our Lady of Fatima University",
    "Palawan State University",
    "Pamantasan ng Lungsod ng Maynila",
    "Pampanga State University",
    "Pangasinan State University",
    "Partido State University",
    "Pasig Catholic College",
    "PATTS College of Aeronautics",
    "Philippine Christian University",
    "Philippine Normal University",
    "Philippine School of Business Administration",
    "Polytechnic University of the Philippines",
    "President Ramon Magsaysay State University",
    "Quirino State University",
    "Republic Central Colleges",
    "Rizal Technological University",
    "Romblon State University",
    "Sacred Heart College",
    "Saint Joseph Institute of Technology",
    "Saint Jude College",
    "Saint Louis University, Baguio City",
    "Saint Mary's University of Bayombong",
    "Saint Michael's College of Laguna",
    "Saint Pedro Poveda College",
    "Samar State University",
    "San Beda University",
    "San Sebastian College-Recoletos de Cavite",
    "Santa Isabel College",
    "Siena College of Taytay",
    "Silliman University",
    "Sorsogon State University",
    "Southern Leyte State University",
    "Southern Luzon State University",
    "Southwestern University - PHINMA",
    "St. Joseph's College of Quezon City",
    "St. Louis College Valenzuela",
    "St. Luke's College of Medicine - WHQM",
    "St. Mary's College",
    "St. Paul University Dumaguete",
    "St. Paul University Iloilo",
    "St. Paul University Manila",
    "St. Paul University Philippines",
    "St. Paul University Quezon City",
    "St. Paul University Surigao",
    "St. Scholastica's College",
    "STI West Negros University",
    "Sultan Kudarat State University",
    "Tarlac Agricultural University",
    "Tarlac State University",
    "Technological Institute of the Philippines",
    "Technological University of the Philippines",
    "The Philippine Women's University",
    "The University of Manila",
    "Trinity University of Asia",
    "Union Christian College",
    "Universidad de Dagupan",
    "Universidad de Sta. Isabel",
    "Universidad de Zamboanga",
    "University of Abra",
    "University of Antique",
    "University of Asia and the Pacific",
    "University of Baguio",
    "University of Batangas",
    "University of Bohol",
    "University of Cagayan Valley",
    "University of Cebu",
    "University of Eastern Philippines",
    "University of Iloilo - PHINMA",
    "University of La Salette",
    "University of Luzon",
    "University of Mindanao",
    "University of Negros Occidental - Recoletos",
    "University of Northern Philippines",
    "University of Nueva Caceres",
    "University of Pangasinan - PHINMA",
    "University of Perpetual Help System DALTA",
    "University of Perpetual Help System Jonelta",
    "University of Rizal System",
    "University of Saint Louis",
    "University of San Agustin",
    "University of San Carlos",
    "University of San Jose-Recoletos",
    "University of Santo Tomas",
    "University of Santo Tomas-Legazpi",
    "University of Science and Technology of Southern Philippines",
    "University of Southeastern Philippines",
    "University of Southern Mindanao",
    "University of Southern Philippines Foundation",
    "University of St. La Salle",
    "University of the Assumption",
    "University of the Cordilleras",
    "University of the East",
    "University of the East Ramon Magsaysay",
    "University of the Immaculate Conception",
    "University of the Philippines Baguio",
    "University of the Philippines Diliman",
    "University of the Philippines in the Visayas",
    "University of the Philippines Los Baños",
    "University of the Philippines Manila",
    "University of the Philippines Mindanao",
    "University of the Philippines System",
    "University of the Visayas",
    "Urdaneta City University",
    "Virgen Milagrosa University Foundation",
    "Visayas State University",
    "Wesleyan University-Philippines",
    "West Visayas State University",
    "Western Institute of Technology",
    "Western Mindanao State University",
    "Western Philippines University",
    "Xavier University-Ateneo de Cagayan",
    "Zamboanga State College of Marine Sciences and Technology",
];

/** Lowercase, strip diacritics/punctuation, and hyphenate into a stable slug. */
function slugify(name: string): string {
    return name
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/** Universities say so in their name; everything else groups as a college. */
function inferType(name: string): SchoolType {
    return /\buniversit(y|ies)\b|\buniversidad\b/i.test(name)
        ? "university"
        : "college";
}

/**
 * The curated schools, plus an "Other (not listed)" catch-all, de-duplicated by
 * slug and sorted by display name.
 */
export const SCHOOLS: readonly School[] = (() => {
    const seen = new Set<string>();
    const list: School[] = [];
    for (const name of SCHOOL_NAMES) {
        const id = slugify(name);
        if (seen.has(id)) continue;
        seen.add(id);
        list.push({ id, name, type: inferType(name) });
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    list.push({ id: "other", name: "Other (not listed)", type: "college" });
    return list;
})();

/** Look up a curated school by id. Returns undefined for unknown ids. */
export function getSchoolById(id: string | null | undefined): School | undefined {
    if (!id) return undefined;
    return SCHOOLS.find((s) => s.id === id);
}
