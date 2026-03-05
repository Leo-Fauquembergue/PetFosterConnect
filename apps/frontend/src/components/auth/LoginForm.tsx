import type { LoginDto } from "@projet/shared-types";
import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import InputPassword from "../ui/InputPassword";

interface LoginFormProps {
  onSubmit: (credentials: LoginDto) => void;
  isLoading: boolean;
}

const LoginForm = ({ onSubmit, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Adresse Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="exemple@email.com"
      />

      <InputPassword
        label="Mot de passe"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      <Button type="submit" disabled={isLoading} fullWidth className="mt-2">
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </Button>
    </form>
  );
};

export default LoginForm;
