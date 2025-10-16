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
  
  console.log(`[Payment Polling] Starting for order: ${orderId}, max attempts: ${maxAttempts}, interval: ${intervalMs}ms`);
  
  for (let i = 0; i < maxAttempts; i++) {
    if (abort.aborted) {
      console.log(`[Payment Polling] Cancelled for order: ${orderId}`);
      return { status: "cancelled", order: null };
    }
    
    try {
      console.log(`[Payment Polling] Attempt ${i + 1}/${maxAttempts} for order: ${orderId}`);
      const order = await getOrder(orderId);
      console.log(`[Payment Polling] Order status: ${order.status}`, order);
      
      if (order.status === "paid") {
        console.log(`[Payment Polling] ✅ Payment confirmed for order: ${orderId}`);
        return { status: "paid", order };
      }
      if (order.status === "failed") {
        console.log(`[Payment Polling] ❌ Payment failed for order: ${orderId}`);
        return { status: "failed", order };
      }
      
      if (i < maxAttempts - 1) {
        console.log(`[Payment Polling] Still pending, waiting ${intervalMs}ms before next attempt...`);
        await sleep(intervalMs);
      }
    } catch (error) {
      console.error(`[Payment Polling] ⚠️ Attempt ${i + 1} failed:`, error);
      
      if (i < maxAttempts - 1) {
        await sleep(intervalMs);
      }
    }
  }
  
  console.log(`[Payment Polling] ⏱️ Timeout after ${maxAttempts} attempts for order: ${orderId}`);
  return { status: "timeout", order: null };
}

