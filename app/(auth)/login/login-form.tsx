"use client";

import { useActionState } from "react";
import { TbLoader2, TbLock } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="panel w-full max-w-sm overflow-hidden">
      <div className="border-b border-border px-6 py-5">
        <span className="font-display text-2xl font-bold uppercase tracking-tight text-white">
          Axios<span className="text-primary">Calc</span>
        </span>
        <p className="mt-1 text-xs text-muted-foreground">Entre com sua conta da oficina.</p>
      </div>
      <div className="space-y-4 p-6">
        {state.error ? <div role="alert" className="border-l-2 border-red-500/60 bg-white/[0.02] px-4 py-3 text-sm text-red-300">{state.error}</div> : null}
        <div>
          <Label htmlFor="username">Usuário</Label>
          <Input id="username" name="username" autoFocus required autoComplete="username" />
        </div>
        <div>
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <TbLoader2 className="animate-spin" /> : <TbLock />}
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </div>
    </form>
  );
}
