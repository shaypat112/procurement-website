import { LoginExperience } from "@/components/login-experience";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <LoginExperience error={error} />;
}
