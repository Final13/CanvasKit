/**
 * Способы оплаты, доступные через ЮKassa.
 * Порядок важен: QR-код (СБП) выводится первым по требованию витрины.
 *
 * Маппинг на payment_method_type для API ЮKassa:
 *   sbp, bank_card, sberbank, tinkoff_bank, alfabank, yoo_money, cash
 */
import {
  QrCode,
  CreditCard,
  Smartphone,
  Nfc,
  Landmark,
  Wallet,
  Banknote,
} from "lucide-react";

export const PAYMENT_METHODS = [
  { label: "QR-код (СБП)", type: "sbp", icon: QrCode, chipClass: "bg-sky-100 text-sky-700" },
  { label: "Банковская карта", type: "bank_card", icon: CreditCard, chipClass: "bg-zinc-100 text-zinc-700" },
  { label: "SberPay", type: "sberbank", icon: Smartphone, chipClass: "bg-green-100 text-green-700" },
  { label: "T-Pay", type: "tinkoff_bank", icon: Nfc, chipClass: "bg-yellow-100 text-yellow-700" },
  { label: "Alfa Pay", type: "alfabank", icon: Landmark, chipClass: "bg-red-100 text-red-700" },
  { label: "ЮMoney", type: "yoo_money", icon: Wallet, chipClass: "bg-violet-100 text-violet-700" },
  { label: "Наличные", type: "cash", icon: Banknote, chipClass: "bg-lime-100 text-lime-700" },
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
