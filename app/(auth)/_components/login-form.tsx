"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { IconEye, IconEyeOff, IconAlertCircle } from "@tabler/icons-react";
import { loginSchema, LoginFormValues } from "@/modules/login/validation";
import { loginApi } from "@/modules/login/api";
import { setToken, setUser } from "@/lib/auth";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      setIsLoading(true);
      const response = await loginApi.login(data);

      const token = response.data?.accessToken || response.data?.token || "authenticated";
      setToken(token);
      setUser(response.data?.user);

      toast.success("Login successful!");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error("Login failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Unable to sign in. Please verify your credentials and try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Login to your account</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              disabled={isLoading}
              className="bg-background"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">
                {form.formState.errors.email.message}
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter Your Password"
                className="bg-background pr-10"
                disabled={isLoading}
                {...form.register("password")}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <IconEyeOff className="h-4 w-4" />
                ) : (
                  <IconEye className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle password visibility</span>
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">
                {form.formState.errors.password.message}
              </p>
            )}
          </Field>

          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
