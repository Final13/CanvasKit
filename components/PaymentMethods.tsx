/**
 * Способы оплаты, доступные через ЮKassa.
 * Порядок важен: QR-код (СБП) выводится первым по требованию витрины.
 */
export const PAYMENT_METHODS = [
  "QR-КОД",
  "СБП",
  "МИР",
  "VISA",
  "MC",
  "SBERPAY",
  "T-PAY",
] as const;

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
      {PAYMENT_METHODS.map((method) => (
        <span key={method} className={className}>
          {method}
        </span>
      ))}
    </>
  );
}
