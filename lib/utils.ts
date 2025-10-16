import { getOrder, Order } from "./api";

export function formatPrice(price: number): string {
  if (price % 1 === 0) {
    return price.toString();
  }
  return price.toFixed(2);
}

export type PaymentStatus = "paid" | "failed" | "timeout" | "cancelled";

/**
 * Poll order status until paid/failed or timeout
 * Used after payment redirect to detect backend status updates from VNPAY/Stripe webhooks
 */
export async function waitForPayment(
  orderId: string,
  abort: AbortSignal,
  maxAttempts: number = 60,
  intervalMs: number = 3000
): Promise<{ status: PaymentStatus; order: Order | null }> {
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (let i = 0; i < maxAttempts; i++) {
    if (abort.aborted) {
      return { status: "cancelled", order: null };
    }
    
    try {
      const order = await getOrder(orderId);
      
      if (order.status === "paid") {
        return { status: "paid", order };
      }
      if (order.status === "failed") {
        return { status: "failed", order };
      }
      
      if (i < maxAttempts - 1) {
        await sleep(intervalMs);
      }
    } catch (error) {
      console.warn(`Polling attempt ${i + 1} failed:`, error);
      
      if (i < maxAttempts - 1) {
        await sleep(intervalMs);
      }
    }
  }
  
  return { status: "timeout", order: null };
}

