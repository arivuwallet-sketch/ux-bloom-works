import { ArrowUpRight } from "lucide-react";

export function BuyPackButton({
  label,
  featured,
}: {
  packId: string;
  label: string;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      title="Checkout is currently unavailable"
      className={`${featured ? "button-primary" : "button-secondary"} w-full justify-center disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {label} <ArrowUpRight className="h-4 w-4" />
    </button>
  );
}
