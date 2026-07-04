"use client";

import { useFormStatus } from "react-dom";
import { TbLoader2, TbTrash } from "react-icons/tb";
import { Button, type ButtonProps } from "@/components/ui/button";

export function SubmitButton({ children, pendingText = "Salvando...", ...props }: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending || props.disabled} {...props}>{pending ? <TbLoader2 className="animate-spin" /> : null}{pending ? pendingText : children}</Button>;
}

export function ConfirmSubmit({ message, children = "Excluir", ...props }: ButtonProps & { message: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="destructive"
      disabled={pending || props.disabled}
      onClick={(event) => { if (!window.confirm(message)) event.preventDefault(); }}
      {...props}
    >
      {pending ? <TbLoader2 className="animate-spin" /> : <TbTrash />}{pending ? "Excluindo..." : children}
    </Button>
  );
}
