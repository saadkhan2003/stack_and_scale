export type CurrencyCode = string & { readonly __currencyCode: unique symbol };

export type Money = Readonly<{
  minorUnits: number;
  currency: CurrencyCode;
}>;

export type RoundingMode = "half-up" | "half-even" | "down" | "up";

const currencyPattern = /^[A-Z]{3}$/;

function requireText(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${field} must not be empty`);
  }
}

function requireSafeInteger(value: number, field: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${field} must be a safe integer`);
  }
}

export function createCurrencyCode(value: string): CurrencyCode {
  if (!currencyPattern.test(value)) {
    throw new Error("currency must be a three-letter uppercase ISO code");
  }

  return value as CurrencyCode;
}

export type Organization = Readonly<{
  id: string;
  legalName: string;
  displayName: string;
}>;

export type Contact = Readonly<{
  id: string;
  name: string;
  email?: string;
  phone?: string;
}>;

export type Address = Readonly<{
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  countryCode: string;
}>;

export function createOrganization(input: Organization): Organization {
  requireText(input.id, "organization id");
  requireText(input.legalName, "legalName");
  requireText(input.displayName, "displayName");
  return Object.freeze({ ...input });
}

export function createContact(input: Contact): Contact {
  requireText(input.id, "contact id");
  requireText(input.name, "contact name");
  if (
    input.email !== undefined &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)
  ) {
    throw new Error("email must be valid when provided");
  }
  return Object.freeze({ ...input });
}

export function createAddress(input: Address): Address {
  requireText(input.line1, "address line1");
  requireText(input.city, "address city");
  requireText(input.countryCode, "countryCode");
  if (!/^[A-Z]{2}$/.test(input.countryCode)) {
    throw new Error("countryCode must be a two-letter uppercase ISO code");
  }
  return Object.freeze({ ...input });
}

export function createMoney(minorUnits: number, currency: string): Money {
  requireSafeInteger(minorUnits, "minorUnits");
  return Object.freeze({ minorUnits, currency: createCurrencyCode(currency) });
}

function requireSameCurrency(left: Money, right: Money): void {
  if (left.currency !== right.currency) {
    throw new Error("money currency mismatch");
  }
}

function checkedInteger(value: bigint, field: string): number {
  const numberValue = Number(value);
  requireSafeInteger(numberValue, field);
  return numberValue;
}

export function addMoney(left: Money, right: Money): Money {
  requireSameCurrency(left, right);
  return createMoney(
    checkedInteger(
      BigInt(left.minorUnits) + BigInt(right.minorUnits),
      "minorUnits",
    ),
    left.currency,
  );
}

export function subtractMoney(left: Money, right: Money): Money {
  requireSameCurrency(left, right);
  return createMoney(
    checkedInteger(
      BigInt(left.minorUnits) - BigInt(right.minorUnits),
      "minorUnits",
    ),
    left.currency,
  );
}

type Decimal = Readonly<{ coefficient: bigint; scale: bigint }>;

function parseDecimal(value: string, field: string): Decimal {
  if (!/^[+]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) {
    throw new Error(`${field} must be a non-negative decimal string`);
  }

  const unsigned = value.startsWith("+") ? value.slice(1) : value;
  const [whole, fraction = ""] = unsigned.split(".");
  return {
    coefficient: BigInt(`${whole}${fraction}`),
    scale: 10n ** BigInt(fraction.length),
  };
}

function roundQuotient(
  numerator: bigint,
  denominator: bigint,
  mode: RoundingMode,
): bigint {
  if (denominator <= 0n) {
    throw new Error("rounding denominator must be positive");
  }

  const sign = numerator < 0n ? -1n : 1n;
  const absolute = numerator < 0n ? -numerator : numerator;
  const quotient = absolute / denominator;
  const remainder = absolute % denominator;

  let increment = false;
  if (mode === "up") increment = remainder !== 0n;
  if (mode === "half-up") increment = remainder * 2n >= denominator;
  if (mode === "half-even") {
    increment =
      remainder * 2n > denominator ||
      (remainder * 2n === denominator && quotient % 2n === 1n);
  }

  return sign * (quotient + (increment ? 1n : 0n));
}

export function roundDecimal(
  value: string,
  decimals: number,
  mode: RoundingMode = "half-up",
): string {
  requireSafeInteger(decimals, "decimals");
  if (decimals < 0) throw new Error("decimals must not be negative");
  const decimal = parseDecimal(value, "value");
  const targetScale = 10n ** BigInt(decimals);
  const numerator = decimal.coefficient * targetScale;
  const rounded = roundQuotient(numerator, decimal.scale, mode);
  const negative = rounded < 0n;
  const absolute = negative ? -rounded : rounded;
  const digits = absolute.toString().padStart(decimals + 1, "0");
  if (decimals === 0) return `${negative ? "-" : ""}${digits}`;
  return `${negative ? "-" : ""}${digits.slice(0, -decimals)}.${digits.slice(-decimals)}`;
}

function multiplyByDecimal(
  value: number,
  decimalValue: string,
  mode: RoundingMode,
): number {
  const decimal = parseDecimal(decimalValue, "rate");
  return checkedInteger(
    roundQuotient(BigInt(value) * decimal.coefficient, decimal.scale, mode),
    "calculated minorUnits",
  );
}

function multiplyByPercent(
  value: number,
  percent: string,
  mode: RoundingMode,
): number {
  const decimal = parseDecimal(percent, "percentage");
  return checkedInteger(
    roundQuotient(
      BigInt(value) * decimal.coefficient,
      decimal.scale * 100n,
      mode,
    ),
    "calculated minorUnits",
  );
}

export function multiplyMoney(
  money: Money,
  factor: string,
  mode: RoundingMode = "half-up",
): Money {
  return createMoney(
    multiplyByDecimal(money.minorUnits, factor, mode),
    money.currency,
  );
}

export type TaxConfiguration = Readonly<{
  code: string;
  ratePercent: string;
  jurisdiction?: string;
  rounding?: RoundingMode;
}>;

export type DiscountConfiguration = Readonly<
  | { kind: "percentage"; valuePercent: string }
  | { kind: "fixed"; amount: Money }
>;

export type CommercialLineItem = Readonly<{
  id: string;
  description: string;
  quantity: number;
  unitPrice: Money;
  discount?: DiscountConfiguration;
  tax?: TaxConfiguration;
}>;

export type CalculatedLineItem = Readonly<{
  id: string;
  gross: Money;
  discount: Money;
  taxable: Money;
  tax: Money;
  total: Money;
}>;

export type CommercialTotals = Readonly<{
  currency: CurrencyCode;
  lines: readonly CalculatedLineItem[];
  subtotal: Money;
  discount: Money;
  tax: Money;
  total: Money;
}>;

function nonNegativeDecimal(value: string, field: string): void {
  parseDecimal(value, field);
}

export function calculateCommercialTotals(
  items: readonly CommercialLineItem[],
  rounding: RoundingMode = "half-up",
): CommercialTotals {
  if (items.length === 0) throw new Error("at least one line item is required");
  const currency = items[0]?.unitPrice.currency;
  if (currency === undefined)
    throw new Error("at least one line item is required");

  const lines = items.map((item) => {
    requireText(item.id, "line item id");
    requireText(item.description, "line item description");
    requireSafeInteger(item.quantity, "quantity");
    if (item.quantity <= 0) throw new Error("quantity must be positive");
    if (item.unitPrice.currency !== currency)
      throw new Error("money currency mismatch");
    if (item.unitPrice.minorUnits < 0)
      throw new Error("unitPrice must not be negative");

    const gross = createMoney(
      checkedInteger(
        BigInt(item.unitPrice.minorUnits) * BigInt(item.quantity),
        "gross minorUnits",
      ),
      currency,
    );
    let discount = createMoney(0, currency);
    if (item.discount?.kind === "percentage") {
      nonNegativeDecimal(item.discount.valuePercent, "discount percentage");
      discount = createMoney(
        multiplyByPercent(
          gross.minorUnits,
          item.discount.valuePercent,
          rounding,
        ),
        currency,
      );
    } else if (item.discount?.kind === "fixed") {
      requireSameCurrency(gross, item.discount.amount);
      if (item.discount.amount.minorUnits < 0)
        throw new Error("discount must not be negative");
      discount = item.discount.amount;
    }
    if (discount.minorUnits > gross.minorUnits)
      throw new Error("discount must not exceed line amount");

    const taxable = subtractMoney(gross, discount);
    let tax = createMoney(0, currency);
    if (item.tax !== undefined) {
      requireText(item.tax.code, "tax code");
      nonNegativeDecimal(item.tax.ratePercent, "tax rate");
      tax = createMoney(
        multiplyByPercent(
          taxable.minorUnits,
          item.tax.ratePercent,
          item.tax.rounding ?? rounding,
        ),
        currency,
      );
    }

    return Object.freeze({
      id: item.id,
      gross,
      discount,
      taxable,
      tax,
      total: addMoney(taxable, tax),
    });
  });

  const zero = createMoney(0, currency);
  const sum = (field: "gross" | "discount" | "tax" | "total"): Money =>
    lines.reduce((result, line) => addMoney(result, line[field]), zero);
  return Object.freeze({
    currency,
    lines,
    subtotal: sum("gross"),
    discount: sum("discount"),
    tax: sum("tax"),
    total: sum("total"),
  });
}

export type DocumentNumberInput = Readonly<{
  prefix: string;
  sequence: number;
  width?: number;
}>;

export function formatDocumentNumber(input: DocumentNumberInput): string {
  requireText(input.prefix, "prefix");
  requireSafeInteger(input.sequence, "sequence");
  if (input.sequence <= 0) throw new Error("sequence must be positive");
  const width = input.width ?? 4;
  requireSafeInteger(width, "width");
  if (width <= 0) throw new Error("width must be positive");
  return `${input.prefix}-${input.sequence.toString().padStart(width, "0")}`;
}

export class DocumentNumberRegistry {
  readonly #numbers = new Set<string>();

  reserve(number: string): void {
    requireText(number, "number");
    if (this.#numbers.has(number))
      throw new Error("document number already reserved");
    this.#numbers.add(number);
  }

  has(number: string): boolean {
    return this.#numbers.has(number);
  }
}

export type IssuedDocumentVersion<TPayload> = Readonly<{
  documentId: string;
  version: number;
  issuedAt: string;
  payload: TPayload;
  status: "issued";
}>;

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function createIssuedDocumentVersion<TPayload>(
  input: Omit<IssuedDocumentVersion<TPayload>, "status">,
): IssuedDocumentVersion<TPayload> {
  requireText(input.documentId, "documentId");
  requireSafeInteger(input.version, "version");
  if (input.version <= 0) throw new Error("version must be positive");
  if (Number.isNaN(Date.parse(input.issuedAt)))
    throw new Error("issuedAt must be an ISO-8601 timestamp");
  return deepFreeze({ ...input, status: "issued" });
}

export type CommercialStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "issued"
  | "accepted"
  | "rejected"
  | "expired"
  | "due"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "cancelled"
  | "void";

const commercialStatusTransitions: Readonly<
  Record<CommercialStatus, readonly CommercialStatus[]>
> = {
  draft: ["pending_approval", "cancelled"],
  pending_approval: ["approved", "rejected", "cancelled"],
  approved: ["issued", "cancelled"],
  issued: ["accepted", "rejected", "expired", "due", "cancelled", "void"],
  accepted: ["due", "cancelled"],
  rejected: [],
  expired: [],
  due: ["partially_paid", "paid", "overdue", "void"],
  partially_paid: ["paid", "overdue", "void"],
  paid: [],
  overdue: ["partially_paid", "paid", "void"],
  cancelled: [],
  void: [],
};

export function canTransitionCommercialStatus(
  from: CommercialStatus,
  to: CommercialStatus,
): boolean {
  return commercialStatusTransitions[from].includes(to);
}

export function transitionCommercialStatus(
  from: CommercialStatus,
  to: CommercialStatus,
): CommercialStatus {
  if (!canTransitionCommercialStatus(from, to)) {
    throw new Error(
      `invalid commercial status transition from ${from} to ${to}`,
    );
  }
  return to;
}
