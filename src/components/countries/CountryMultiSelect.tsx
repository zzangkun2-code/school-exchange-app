"use client";

import { X } from "lucide-react";
import { CONTINENTS, COUNTRY_CONTINENTS, COUNTRY_OPTIONS } from "@/lib/country-data";
import type { Continent, CountrySelection } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextInput } from "@/components/ui/Input";

export function CountryMultiSelect({
  value,
  onChange,
  label = "교류국가"
}: {
  value: CountrySelection[];
  onChange: (value: CountrySelection[]) => void;
  label?: string;
}) {
  const hasOther = value.some((item) => item.isOther);
  const other = value.find((item) => item.isOther);

  const toggleCountry = (country: CountrySelection) => {
    const exists = value.some((item) => !item.isOther && item.country === country.country);
    onChange(exists ? value.filter((item) => item.country !== country.country) : [...value, country]);
  };

  const setOtherEnabled = (enabled: boolean) => {
    if (enabled) {
      onChange([...value, { country: "", continent: "동북아시아", isOther: true }]);
      return;
    }
    onChange(value.filter((item) => !item.isOther));
  };

  const updateOther = (patch: Partial<CountrySelection>) => {
    onChange(
      value.map((item) =>
        item.isOther
          ? {
              ...item,
              ...patch,
              isOther: true
            }
          : item
      )
    );
  };

  const removeCountry = (country: string) => {
    onChange(value.filter((item) => item.country !== country));
  };

  return (
    <div className="grid gap-3">
      <Field label={label}>
        <div className="grid gap-3 rounded-card border border-skysoft-100 bg-white/70 p-3">
          {value.filter((item) => item.country).length ? (
            <div className="flex flex-wrap gap-2">
              {value
                .filter((item) => item.country)
                .map((item) => (
                  <span
                    key={`${item.country}-${item.continent}`}
                    className="inline-flex items-center gap-2 rounded-full bg-mint-100 px-3 py-1 text-xs font-extrabold text-mint-700"
                  >
                    {item.country} · {item.continent}
                    <button
                      type="button"
                      className="rounded-full bg-white/70 p-0.5"
                      onClick={() => removeCountry(item.country)}
                      aria-label={`${item.country} 삭제`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
            </div>
          ) : null}

          <div className="grid gap-3">
            {CONTINENTS.map((continent) => (
              <section key={continent}>
                <p className="mb-2 text-xs font-black text-slate-500">{continent}</p>
                <div className="flex flex-wrap gap-2">
                  {COUNTRY_CONTINENTS[continent].map((country) => {
                    const selected = value.some((item) => item.country === country);
                    const option = COUNTRY_OPTIONS.find((item) => item.country === country)!;
                    return (
                      <button
                        key={country}
                        type="button"
                        className={`focus-ring rounded-full px-3 py-1.5 text-xs font-extrabold transition hover:-translate-y-0.5 ${
                          selected
                            ? "bg-skysoft-500 text-white shadow-soft"
                            : "bg-white text-slate-600"
                        }`}
                        onClick={() => toggleCountry(option)}
                      >
                        {country}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="rounded-card bg-peach-50 p-3">
            <label className="flex items-center gap-2 text-sm font-extrabold text-peach-700">
              <input
                type="checkbox"
                checked={hasOther}
                onChange={(event) => setOtherEnabled(event.target.checked)}
              />
              기타 국가 직접 입력
            </label>

            {hasOther ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="기타 국가명">
                  <TextInput
                    value={other?.country ?? ""}
                    onChange={(event) => updateOther({ country: event.target.value })}
                    placeholder="예: 튀르키예"
                    required
                  />
                </Field>
                <Field label="대륙 선택">
                  <Select
                    value={other?.continent ?? "동북아시아"}
                    onChange={(event) =>
                      updateOther({ continent: event.target.value as Continent })
                    }
                  >
                    {CONTINENTS.map((continent) => (
                      <option key={continent} value={continent}>
                        {continent}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            ) : null}
          </div>
        </div>
      </Field>

      {value.some((item) => item.country) ? (
        <Button type="button" variant="ghost" className="w-fit px-3" onClick={() => onChange([])}>
          국가 선택 초기화
        </Button>
      ) : null}
    </div>
  );
}
