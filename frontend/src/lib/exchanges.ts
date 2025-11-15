export const EXCHANGE_OPTIONS = [
  { value: 'binance', label: 'Binance' },
  { value: 'bybit', label: 'Bybit' },
  { value: 'okx', label: 'OKX' },
];

export const DEFAULT_EXCHANGE_VALUES = EXCHANGE_OPTIONS.map((option) => option.value);

export function toExchangeLabel(value: string): string {
  return EXCHANGE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function normalizeExchange(value: string): string {
  return value?.toLowerCase() ?? '';
}
