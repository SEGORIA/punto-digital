import { MercadoPagoConfig, Payment, PaymentMethod } from "mercadopago";
import { randomUUID } from "crypto";

function getClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MP_ACCESS_TOKEN no está configurada en el servidor.");
  }
  return new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
}

export type CreateCardPaymentInput = {
  token: string;
  transactionAmount: number;
  installments: number;
  paymentMethodId: string;
  payerEmail: string;
  externalReference: string;
};

export async function createCardPayment(input: CreateCardPaymentInput) {
  const payment = new Payment(getClient());

  return payment.create({
    body: {
      transaction_amount: input.transactionAmount,
      token: input.token,
      installments: input.installments,
      payment_method_id: input.paymentMethodId,
      payer: { email: input.payerEmail },
      external_reference: input.externalReference,
      description: `Pedido Punto Digital ${input.externalReference}`,
    },
    requestOptions: { idempotencyKey: randomUUID() },
  });
}

export type CreatePsePaymentInput = {
  transactionAmount: number;
  payerEmail: string;
  financialInstitution: string;
  documentType: string;
  documentNumber: string;
  externalReference: string;
  callbackUrl: string;
};

export async function createPsePayment(input: CreatePsePaymentInput) {
  const payment = new Payment(getClient());

  return payment.create({
    body: {
      transaction_amount: input.transactionAmount,
      payment_method_id: "pse",
      payer: {
        email: input.payerEmail,
        entity_type: "individual",
        identification: {
          type: input.documentType,
          number: input.documentNumber,
        },
      },
      transaction_details: {
        financial_institution: input.financialInstitution,
      },
      external_reference: input.externalReference,
      callback_url: input.callbackUrl,
      description: `Pedido Punto Digital ${input.externalReference}`,
    },
    requestOptions: { idempotencyKey: randomUUID() },
  });
}

export async function getPseBanks() {
  const paymentMethod = new PaymentMethod(getClient());
  const methods = await paymentMethod.get();
  const pse = methods.find((m) => m.id === "pse") as
    | { financial_institutions?: { id: string; description: string }[] }
    | undefined;

  return pse?.financial_institutions ?? [];
}

export async function getPayment(paymentId: string) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}

/** approved -> PAID | pending/in_process -> PENDING | rejected/cancelled -> CANCELLED */
export function mapMpStatusToOrderStatus(mpStatus: string): "PAID" | "PENDING" | "CANCELLED" {
  if (mpStatus === "approved") return "PAID";
  if (mpStatus === "pending" || mpStatus === "in_process") return "PENDING";
  return "CANCELLED";
}
