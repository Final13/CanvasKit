import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  // Дефолт 465: почтовый сервер проекта работает по SSL на 465;
  // если SMTP_PORT не задан, не должны молча уходить на 587.
  const port = Number(process.env.SMTP_PORT ?? "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    // На почтовом сервере хостинга самоподписанный сертификат — цепочку CA
    // не проверяем (соединение всё равно шифруется TLS).
    tls: { rejectUnauthorized: false },
    // Таймауты обязательны: без них зависший SMTP-сервер вешает HTTP-запрос
    // (504 Gateway Time-out на прода).
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  );
}

function getFrom(): string {
  return process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@example.com";
}

export async function sendWelcomeEmail(data: {
  to: string;
  name?: string;
  login: string;
  password: string;
  siteUrl: string;
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP is not configured, welcome email not sent");
    return false;
  }

  const loginBlock = data.login
    ? `<p style="font-size:16px;line-height:1.6;margin:0 0 8px"><strong>Ваш логин:</strong> ${escapeHtml(data.login)}</p>`
    : "";

  await transporter.sendMail({
    from: getFrom(),
    to: data.to,
    subject: "Добро пожаловать! Данные для входа в личный кабинет",
    html: `<div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;color:#333;text-align:center">
      <p style="font-size:24px;margin:24px 0">Привет${data.name ? ", " + escapeHtml(data.name) : ""} 👋</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 16px">Спасибо за регистрацию на нашем сервисе.</p>
      ${loginBlock}
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px"><strong>Ваш пароль:</strong> ${escapeHtml(data.password)}</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px">Сохраните это письмо. Вы можете войти в личный кабинет, чтобы просмотреть заказы и скачать файлы.</p>
      <a href="${data.siteUrl}/my-account" style="display:inline-block;background:#f0abfc;color:#111;text-decoration:none;padding:14px 32px;border-radius:9999px;font-weight:600">Войти в аккаунт</a>
      <p style="font-size:14px;color:#666;margin-top:24px">Мы рады, что вы с нами! Спасибо за доверие ❤️</p>
    </div>`,
  });

  return true;
}

export async function sendOrderConfirmationEmail(data: {
  to: string;
  name?: string;
  orderId: string;
  total: number;
  siteUrl: string;
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP is not configured, order email not sent");
    return false;
  }

  await transporter.sendMail({
    from: getFrom(),
    to: data.to,
    subject: `Заказ №${data.orderId.slice(0, 8)} оформлен`,
    html: `<div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;color:#333">
      <p style="font-size:20px;margin:24px 0">Здравствуйте${data.name ? ", " + escapeHtml(data.name) : ""}!</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 16px">Ваш заказ <strong>№${escapeHtml(data.orderId.slice(0, 8))}</strong> на сумму <strong>${data.total} ₽</strong> оформлен.</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px">После оплаты файлы будут доступны в личном кабинете.</p>
      <a href="${data.siteUrl}/my-account/orders" style="display:inline-block;background:#f0abfc;color:#111;text-decoration:none;padding:14px 32px;border-radius:9999px;font-weight:600">Перейти к заказам</a>
    </div>`,
  });

  return true;
}

export async function sendPasswordResetEmail(data: {
  to: string;
  name?: string | null;
  login: string;
  password: string;
  siteUrl: string;
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP is not configured, password reset email not sent");
    return false;
  }

  await transporter.sendMail({
    from: getFrom(),
    to: data.to,
    subject: "Восстановление пароля — новые данные для входа",
    html: `<div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;color:#333;text-align:center">
      <p style="font-size:24px;margin:24px 0">Восстановление пароля</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 16px">Здравствуйте${data.name ? ", " + escapeHtml(data.name) : ""}! Мы получили запрос на восстановление пароля от вашего аккаунта.</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 8px"><strong>Ваш логин:</strong> ${escapeHtml(data.login)}</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px"><strong>Новый пароль:</strong> ${escapeHtml(data.password)}</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px">Рекомендуем сменить пароль после входа в личном кабинете.</p>
      <a href="${data.siteUrl}/my-account" style="display:inline-block;background:#f0abfc;color:#111;text-decoration:none;padding:14px 32px;border-radius:9999px;font-weight:600">Войти в аккаунт</a>
      <p style="font-size:14px;color:#666;margin-top:24px">Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо — новые данные видите только вы.</p>
    </div>`,
  });

  return true;
}

export async function sendPasswordChangedEmail(data: {
  to: string;
  name?: string | null;
  siteUrl: string;
}) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("SMTP is not configured, password changed email not sent");
    return false;
  }

  await transporter.sendMail({
    from: getFrom(),
    to: data.to,
    subject: "Ваш пароль был изменён",
    html: `<div style="max-width:480px;margin:0 auto;font-family:Arial,sans-serif;color:#333;text-align:center">
      <p style="font-size:24px;margin:24px 0">Пароль изменён</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px">Здравствуйте${data.name ? ", " + escapeHtml(data.name) : ""}! Пароль от вашего аккаунта был успешно изменён.</p>
      <p style="font-size:16px;line-height:1.6;margin:0 0 24px">Если это были не вы, как можно скорее восстановите доступ к аккаунту.</p>
      <a href="${data.siteUrl}/my-account" style="display:inline-block;background:#f0abfc;color:#111;text-decoration:none;padding:14px 32px;border-radius:9999px;font-weight:600">Перейти в аккаунт</a>
    </div>`,
  });

  return true;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
