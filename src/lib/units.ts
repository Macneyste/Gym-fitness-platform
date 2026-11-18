import type { Units } from '@/types/models';

export const KG_PER_LB = 0.45359237;

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;

/** Converts a stored kg value for display in the user's units. */
export function displayWeight(kg: number, units: Units): number {
  const v = units === 'lb' ? kgToLb(kg) : kg;
  return Math.round(v * 10) / 10;
}

export function formatWeight(kg: number | undefined, units: Units, bodyweightLabel = 'bodyweight') {
  if (kg === undefined) return bodyweightLabel;
  const v = displayWeight(kg, units);
  return `${Number.isInteger(v) ? v : v.toFixed(1)} ${units}`;
}
