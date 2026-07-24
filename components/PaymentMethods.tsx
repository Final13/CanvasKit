/**
 * Способы оплаты, доступные через ЮKassa.
 * Порядок важен: QR-код (СБП) выводится первым по требованию витрины.
 *
 * Маппинг на payment_method_type для API ЮKassa:
 *   sbp, bank_card, sberbank, tinkoff_bank, alfabank, yoo_money, cash
 */
export const PAYMENT_METHODS = [
  { label: "QR-код (СБП)", type: "sbp" },
  { label: "Банковская карта", type: "bank_card" },
  { label: "SberPay", type: "sberbank" },
  { label: "T-Pay", type: "tinkoff_bank" },
  { label: "Alfa Pay", type: "alfabank" },
  { label: "ЮMoney", type: "yoo_money" },
  { label: "Наличные", type: "cash" },
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHODS)[number]["type"];

/** Метод оплаты по умолчанию — QR-код (СБП) */
export const DEFAULT_PAYMENT_METHOD: PaymentMethodType = "sbp";

interface PaymentMethodBadgesProps {
  /** dark — для тёмного фона футера, иначе для светлых карточек. */
  dark?: boolean;
}

export function PaymentMethodBadges({ dark = false }: PaymentMethodBadgesProps) {
  const className = dark
    ? "rounded bg-white/10 px-2 py-1 text-xs font-bold"
    : "rounded bg-white px-2 py-1 text-xs font-bold text-zinc-700 shadow-sm";
  return (
    <>
      {PAYMENT_METHODS.map(({ label }) => (
        <span key={label} className={className}>
          {label}
        </span>
      ))}
    </>
  );
}
