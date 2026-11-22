import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BACK_LABEL } from "@/lib/brand";

export function BackButton() {
  const router = useRouter();
  const pathname = useLocation({ select: (location) => location.pathname });
  const index = router.history.location.state.__TSR_index;
  // TanStack starts its first in-app entry at zero, even after an outside link.
  const canBack = Number.isFinite(index) && index > 0 && router.history.canGoBack();
  const match = /^\/topic\/([^/]+)\/more\//.exec(pathname);
  const slug = match?.[1];
  const content = <><ArrowLeft aria-hidden="true" />{BACK_LABEL}</>;
  const className = "min-h-12 justify-start px-0 text-base";
  if (canBack) return <Button variant="ghost" className={className} onClick={() => router.history.back()}>{content}</Button>;
  return <Button asChild variant="ghost" className={className}>
    {slug ? <Link to="/topic/$slug" params={{ slug }} search={{ chooser: true, read: 1 }} replace>{content}</Link> : <Link to="/" replace>{content}</Link>}
  </Button>;
}