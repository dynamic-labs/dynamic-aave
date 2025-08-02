export function safeParseFloat(
  value:
    | { value: string }
    | { raw: string; decimals: number; value: string }
    | string
    | number
    | null
    | undefined,
  decimals: number = 2
): string {
  if (!value) return "0.00";

  try {
    let parsed: number;

    if (typeof value === "string") {
      parsed = parseFloat(value);
    } else if (typeof value === "number") {
      parsed = value;
    } else if (typeof value === "object") {
      if ("raw" in value && "decimals" in value && "value" in value) {
        parsed = parseFloat(value.value);
      } else if ("value" in value) {
        parsed = parseFloat(value.value);
      } else {
        return "0.00";
      }
    } else {
      return "0.00";
    }

    if (isNaN(parsed)) return "0.00";

    return parsed.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  } catch {
    return "0.00";
  }
}

export function safeParseUSD(
  value: { value: string } | string | number | null | undefined
): string {
  if (!value) return "$0.00";

  try {
    let parsed: number;

    if (typeof value === "string") {
      parsed = parseFloat(value);
    } else if (typeof value === "number") {
      parsed = value;
    } else if (typeof value === "object" && "value" in value) {
      parsed = parseFloat(value.value);
    } else {
      return "$0.00";
    }

    if (isNaN(parsed)) return "$0.00";

    return `$${parsed.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } catch {
    return "$0.00";
  }
}

export function safeParseHealthFactor(
  value: 
    | { value: string }
    | { raw: string; decimals: number; value: string }
    | string
    | number
    | null
    | undefined
): string {
  if (!value) return "0.00";

  try {
    let parsed: number;

    if (typeof value === "string") {
      parsed = parseFloat(value);
    } else if (typeof value === "number") {
      parsed = value;
    } else if (typeof value === "object") {
      if ("raw" in value && "decimals" in value && "value" in value) {
        parsed = parseFloat(value.value);
      } else if ("value" in value) {
        parsed = parseFloat(value.value);
      } else {
        return "0.00";
      }
    } else {
      return "0.00";
    }

    if (isNaN(parsed)) return "0.00";

    if (parsed > 1e18) return "∞";

    return parsed.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return "0.00";
  }
}
