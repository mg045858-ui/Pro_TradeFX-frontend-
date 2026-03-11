import React from "react";
import { Icons } from "../../ui/Icons/Icons";
import "./Footer.css";

const FOOTER_LINKS = {
  Platform: ["Web Terminal","Mobile App","Desktop App","API"],
  Trading:  ["Forex","Stocks","Crypto","Commodities"],
  Company:  ["About Us","Careers","Press","Contact"],
  Legal:    ["Terms of Service","Privacy Policy","Risk Disclosure","AML Policy"],
};

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div>
            <a href="#" className="footer__brand-logo">
              <Icons.TrendingUp size={22} style={{ color:"var(--primary)" }} />
              <span className="footer__brand-text">TradeX</span>
            </a>
            <p className="footer__brand-desc">The modern trading platform for everyone.</p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="footer__col-title">{title}</h4>
              <ul className="footer__col-list">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="footer__col-link">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">© 2026 TradeX. All rights reserved.</p>
          <p className="footer__risk">
            Risk Warning: Trading involves significant risk. You may lose your invested capital. Trade responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
