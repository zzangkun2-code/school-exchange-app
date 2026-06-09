import type { Continent, CountrySelection } from "@/lib/types";

export const COUNTRY_CONTINENTS: Record<Continent, string[]> = {
  "동북아시아": ["일본", "중국", "대만", "몽골"],
  "동남아시아": ["인도네시아", "싱가포르", "베트남", "필리핀", "말레이시아", "태국", "캄보디아"],
  "서남/중앙아시아": ["우즈베키스탄", "카자흐스탄", "인도"],
  "오세아니아": ["호주", "뉴질랜드"],
  "유럽": ["영국", "프랑스", "독일", "스페인", "포르투갈", "이탈리아"],
  "북미": ["미국", "캐나다", "멕시코"],
  "남미": ["브라질", "페루", "아르헨티나"],
  "아프리카/중동": ["남아프리카공화국", "아랍에미리트"]
};

export const CONTINENTS = Object.keys(COUNTRY_CONTINENTS) as Continent[];

export const COUNTRY_OPTIONS: CountrySelection[] = CONTINENTS.flatMap((continent) =>
  COUNTRY_CONTINENTS[continent].map((country) => ({ country, continent }))
);

export function getCountryContinent(country: string): Continent | null {
  const found = COUNTRY_OPTIONS.find((item) => item.country === country);
  return found?.continent ?? null;
}

export function normalizeCountries(value: unknown): CountrySelection[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          const continent = getCountryContinent(item);
          return continent ? { country: item, continent } : null;
        }

        if (
          item &&
          typeof item === "object" &&
          "country" in item &&
          "continent" in item &&
          typeof item.country === "string" &&
          typeof item.continent === "string"
        ) {
          return {
            country: item.country,
            continent: item.continent as Continent,
            isOther: Boolean("isOther" in item && item.isOther)
          };
        }

        return null;
      })
      .filter(Boolean) as CountrySelection[];
  }

  if (typeof value === "string") {
    const continent = getCountryContinent(value);
    return continent ? [{ country: value, continent }] : [];
  }

  return [];
}

export function countriesToText(countries: CountrySelection[]) {
  return countries.map((item) => `${item.country}(${item.continent})`).join(", ");
}
