import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginDto, LoginSchema, type RegisterDto, RegisterSchema } from "@projet/shared-types";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../api/api";

import { useAuth } from "../auth/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import InputPassword from "../components/ui/InputPassword";

export default function AuthPage() {
  const location = useLocation();
  const isRegisterUrl = location.pathname === "/inscription";
  const [isLoginView, setIsLoginView] = useState(!isRegisterUrl);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-bgapp py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex bg-white rounded-2xl shadow-soft overflow-hidden">
        {/* VISUEL (caché sur mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-secondary items-center justify-center p-12 text-white relative overflow-hidden">
          <div className="relative z-10 text-center">
            <h2 className="text-3xl font-bold font-montserrat mb-4">
              {isLoginView ? "Heureux de vous revoir !" : "Rejoignez l'aventure !"}
            </h2>
            <p className="text-gray-100 font-openSans mb-8">
              {isLoginView
                ? "Connectez-vous pour suivre vos demandes et retrouver vos favoris."
                : "Créez un compte pour proposer votre aide ou adopter votre futur compagnon."}
            </p>
            <button
              type="button"
              onClick={() => setIsLoginView(!isLoginView)}
              className="px-6 py-2 border-2 border-white rounded-full font-bold hover:bg-white hover:text-secondary transition"
            >
              {isLoginView ? "Créer un compte" : "Se connecter"}
            </button>
          </div>
        </div>

        {/* FORMULAIRE */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-montserrat text-primary mb-2">
              {isLoginView ? "Connexion" : "Inscription"}
            </h1>
            <p className="text-sm text-gray-500 md:hidden">
              {isLoginView ? "Pas encore de compte ?" : "Déjà inscrit ?"}
              <button
                type="button"
                onClick={() => setIsLoginView(!isLoginView)}
                className="ml-1 text-primary font-bold hover:underline"
              >
                {isLoginView ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>

          {isLoginView ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

// LOGIN
function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false); // ⚡ AJOUT

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginDto) => {
    setIsSubmitting(true); // ⚡ VERROUILLAGE
    try {
      await login(data);
      toast.success("Connexion réussie !", {
        position: "top-right",
        autoClose: 2000,
      });
      navigate("/");
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, "Erreur serveur. Veuillez réessayer.");

      // Gestion spécifique du 401 pour un message plus précis
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Email ou mot de passe incorrect !", { position: "top-right" });
      } else {
        toast.error(errorMessage, { position: "top-right" });
      }
    } finally {
      setIsSubmitting(false); // ⚡ DÉVERROUILLAGE
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="exemple@email.com"
        {...register("email")}
        error={errors.email?.message}
      />
      <InputPassword
        label="Mot de passe"
        placeholder="••••••••"
        {...register("password")}
        error={errors.password?.message}
      />
      <div className="text-right">
        <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-primary transition">
          Mot de passe oublié ?
        </Link>
      </div>
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Connexion en cours..." : "Se connecter"}
      </Button>
    </form>
  );
}

// REGISTER
function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterDto>({
    resolver: zodResolver(RegisterSchema),
  });

  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const selectedRole = watch("role");
  const [isSubmitting, setIsSubmitting] = useState(false); // ⚡ AJOUT

  const onSubmit = async (data: RegisterDto) => {
    setIsSubmitting(true); // ⚡ VERROUILLAGE
    try {
      await registerUser(data);
      toast.success("Compte créé avec succès 🎉", {
        position: "top-right",
        autoClose: 2000,
      });
      navigate("/");
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(
        err,
        "Erreur lors de l'inscription. Veuillez réessayer."
      );

      // Gestion spécifique du 409
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error("Cet email est déjà utilisé", { position: "top-right" });
      } else {
        toast.error(errorMessage, { position: "top-right" });
      }
    } finally {
      setIsSubmitting(false); // ⚡ DÉVERROUILLAGE
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
      <InputPassword
        label="Mot de passe"
        {...register("password")}
        error={errors.password?.message}
      />

      {/* Champs conditionnels */}
      {selectedRole === "shelter" && (
        <>
          <Input label="Siret" type="text" {...register("siret")} error={errors.siret?.message} />
          <Input
            label="Nom du refuge"
            type="text"
            {...register("shelterName")}
            error={errors.shelterName?.message}
          />
        </>
      )}

      <div className="flex flex-col gap-2">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-gray-700">Vous êtes :</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="individual"
                {...register("role")}
                className="accent-primary"
              />
              <span className="text-sm">Particulier</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="shelter"
                {...register("role")}
                className="accent-primary"
              />
              <span className="text-sm">Association</span>
            </label>
          </div>
          {errors.role && <span className="text-xs text-error">{errors.role.message}</span>}
        </fieldset>
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Création en cours..." : "Créer mon compte"}
      </Button>
    </form>
  );
}
