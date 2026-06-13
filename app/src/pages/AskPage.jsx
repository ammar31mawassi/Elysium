import React from "react";
import PageLayout from "@/components/layout/PageLayout";
import ElyAssistant from "@/components/elysium/ElyAssistant";

export default function AskPage() {
  return <PageLayout wide showEly={false}><ElyAssistant embedded defaultOpen /></PageLayout>;
}
