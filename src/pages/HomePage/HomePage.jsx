import React from "react";
import { NavbarSection }      from "./sections/NavbarSection";
import { HeroSection }        from "./sections/HeroSection";
import { TickerSection }      from "./sections/TickerSection";
import { StatsSection }       from "./sections/StatsSection";
import { ProfitSection }      from "./sections/ProfitSection";
import { MarketsSection }     from "./sections/MarketsSection";
import { HowItWorksSection }  from "./sections/HowItWorksSection";
import { AccountsSection }    from "./sections/AccountsSection";
import { ExpertSection }      from "./sections/ExpertSection";
import { TestimonialsSection } from "./sections/TestimonialsSection";
import { CTASection }         from "./sections/CTASection";
import { FooterSection }      from "./sections/FooterSection";
import { WhatsAppFloat }      from "./sections/WhatsAppFloat";
import "./HomePage.css";

export function HomePage({ onNavigate }) {
  return (
    <div className="hp-root">
      <NavbarSection      onNavigate={onNavigate} />
      <HeroSection        onNavigate={onNavigate} />
      <TickerSection />
      <StatsSection />
      <ProfitSection      onNavigate={onNavigate} />
      <MarketsSection     onNavigate={onNavigate} />
      <HowItWorksSection />
      <AccountsSection    onNavigate={onNavigate} />
      <ExpertSection />
      <TestimonialsSection />
      <CTASection         onNavigate={onNavigate} />
      <FooterSection />
      <WhatsAppFloat />
    </div>
  );
}
