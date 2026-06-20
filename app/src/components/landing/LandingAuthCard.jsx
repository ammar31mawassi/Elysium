import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LandingAuthCard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("new");
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : "";
    navigate(`${mode === "new" ? "/register" : "/login"}${query}`);
  };

  return (
    <section data-landing-reveal className="landing-auth-card landing-motion-card" aria-labelledby="landing-auth-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Start with your campus hub</p>
          <h2 id="landing-auth-title" className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            Sign in or create your student space
          </h2>
        </div>
        <span className="landing-motion-icon hidden size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:flex">
          <LockKeyhole className="size-5" aria-hidden="true" />
        </span>
      </div>

      <Tabs value={mode} onValueChange={setMode} className="mt-6">
        <TabsList className="landing-auth-tabs grid h-11 w-full grid-cols-2 rounded-md bg-muted/80 p-1">
          <TabsTrigger value="new" className="rounded-sm">
            New student
          </TabsTrigger>
          <TabsTrigger value="returning" className="rounded-sm">
            Returning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-5">
          <AuthLead
            title="Create an account in under a minute."
            body="Add your university, courses, interests, and languages after sign-up so Elysium can organize what matters next."
          />
        </TabsContent>
        <TabsContent value="returning" className="mt-5">
          <AuthLead
            title="Jump back into your day."
            body="Open your personal dashboard with deadlines, joined activities, study sessions, and recommended next steps."
          />
        </TabsContent>
      </Tabs>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="landing-email">Student email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="landing-email"
              type="email"
              autoComplete="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 rounded-md bg-background pl-10 text-sm"
            />
          </div>
        </div>

        <Button type="submit" className="landing-primary-button h-12">
          {mode === "new" ? "Sign up with email" : "Continue to sign in"}
          <ArrowRight data-icon="inline-end" className="size-4 rtl:rotate-180" aria-hidden="true" />
        </Button>

      </form>

      <div className="mt-5 grid gap-2 text-sm text-muted-foreground">
        <TrustRow icon={ShieldCheck} text="Your profile controls what is public." />
        <TrustRow icon={CheckCircle2} text="Tutors, peer helpers, and activities stay clearly separated." />
      </div>
    </section>
  );
}

function AuthLead({ title, body }) {
  return (
    <div className="landing-auth-lead rounded-md border border-border bg-muted/35 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function TrustRow({ icon: Icon, text }) {
  return (
    <div className="landing-trust-row flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
