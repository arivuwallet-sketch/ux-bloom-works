declare module "@cashfreepayments/cashfree-js" {
  export type CashfreeInstance = {
    checkout: (options: {
      paymentSessionId: string;
      redirectTarget?: "_self" | "_blank" | "_top" | "_modal";
    }) => Promise<unknown>;
  };
  export function load(options: { mode: "production" | "sandbox" }): Promise<CashfreeInstance>;
}
