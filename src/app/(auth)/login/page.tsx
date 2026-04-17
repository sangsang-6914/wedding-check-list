import { AuthForm } from "@/components/AuthForm";
import { login } from "@/actions/auth";

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
