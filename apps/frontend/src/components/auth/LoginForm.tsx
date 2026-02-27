import { useState } from "react";
import type { LoginDto } from "@projet/shared-types";
import Input from "../ui/Input";
import InputPassword from "../ui/InputPassword";
import Button from "../ui/Button";

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
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="exemple@email.com"
      />

      <InputPassword
        label="Mot de passe"
        id="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Connexion en cours..." : "Se connecter"}
      </Button>
    </form>
  );
};

export default LoginForm;