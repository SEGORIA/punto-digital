import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre completo"),
  email: z.string().email("Correo inválido"),
  phone: z.string().min(7, "Teléfono inválido"),
  address: z.string().min(5, "Dirección inválida"),
  city: z.string().min(2, "Ciudad inválida"),
  paymentMethod: z.enum(["PSE", "NEQUI", "CARD"]),
  couponCode: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().int().positive(),
      })
    )
    .min(1, "El carrito está vacío"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

const baseCheckoutFields = {
  name: z.string().min(2, "Ingresa tu nombre completo"),
  email: z.string().email("Correo inválido"),
  phone: z.string().min(7, "Teléfono inválido"),
  address: z.string().min(5, "Dirección inválida"),
  city: z.string().min(2, "Ciudad inválida"),
  couponCode: z.string().trim().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().int().positive(),
      })
    )
    .min(1, "El carrito está vacío"),
};

export const checkoutPaymentSchema = z.discriminatedUnion("paymentMethod", [
  z.object({
    ...baseCheckoutFields,
    paymentMethod: z.literal("CARD"),
    token: z.string().min(1, "Token de tarjeta inválido"),
    installments: z.number().int().positive(),
    cardPaymentMethodId: z.string().min(1),
  }),
  z.object({
    ...baseCheckoutFields,
    paymentMethod: z.literal("PSE"),
    financialInstitution: z.string().min(1, "Selecciona tu banco"),
    documentType: z.enum(["CC", "CE", "NIT"]),
    documentNumber: z.string().min(4, "Número de documento inválido"),
  }),
]);

export type CheckoutPaymentInput = z.infer<typeof checkoutPaymentSchema>;
