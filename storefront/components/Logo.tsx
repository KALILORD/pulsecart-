import Link from "next/link";
import { PulseIcon } from "./Icons";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="PulseCart home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink transition group-hover:bg-signal">
        <PulseIcon className="h-5 w-5 text-acid" />
      </span>
      {!compact && (
        <span className="font-display text-[1.35rem] font-bold leading-none tracking-[-0.04em]">
          Pulse<span className="text-signal-deep">Cart</span>
        </span>
      )}
    </Link>
  );
}
