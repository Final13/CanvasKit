import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Контакты — Event Space",
  description:
    "Свяжитесь с нами по любым вопросам: выбор шаблона, оформление заказа, оплата и поддержка.",
};

export default function ContactsPage() {
  return (
    <LegalPage title="Контакты">
      <p>
        Мы всегда рады помочь вам с выбором шаблона, оформлением заказа или
        любыми вопросами, связанными с работой конструктора приглашений Event
        Space.
      </p>

      <h2>Свяжитесь с нами</h2>
      <ul>
        <li>
          <strong>Электронная почта:</strong>{" "}
          <a
            href="mailto:support@evspc.com"
            className="text-fuchsia-600 underline"
          >
            support@evspc.com
          </a>
        </li>
        <li>
          <strong>Сайт:</strong>{" "}
          <a href="https://evspc.com" className="text-fuchsia-600 underline">
            https://evspc.com
          </a>
        </li>
      </ul>

      <h2>По вопросам оплаты</h2>
      <p>
        Оплата услуг на сайте производится через платёжного агрегатора ООО НКО
        «Монета.ру» (ЮКАССА). По всем вопросам, связанным с проведением платежей,
        списаниями и возвратами, пожалуйста, пишите нам на support@evspc.com.
      </p>

      <h2>Режим работы поддержки</h2>
      <p>
        Письма рассматриваются в течение 1–2 рабочих дней. Мы стараемся
        отвечать как можно быстрее и ценим ваше терпение.
      </p>
    </LegalPage>
  );
}
