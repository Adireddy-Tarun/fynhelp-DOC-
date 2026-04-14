import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";

interface Section { id: string; title: string; level: number }
interface Article {
  slug: string; title: string; category: string; categoryColor: string;
  time: string; date: string; author: string; authorTitle: string;
  initials: string; initialsColor: string;
  sections: { heading: string; level: number; content: string[] }[];
  related: string[];
}

const articles: Article[] = [
  {
    slug: "the-52-day-rule", title: "The 52-Day Rule: How to Read Your Business's Most Important Number",
    category: "CASH FLOW", categoryColor: "bg-fyn-red", time: "8 min read", date: "April 2025",
    author: "Adireddy Tarun", authorTitle: "Founder & CEO", initials: "AT", initialsColor: "bg-fyn-red",
    sections: [
      { heading: "", level: 0, content: [
        "CALLOUT:If you only track one number in your business, it should not be your bank balance. It should be your runway.",
        "The first thing most Indian business owners check every morning is their bank balance. It's understandable — it's the most visible number, the most accessible, and it feels like the most honest answer to the question \"how is my business doing?\"",
        "It is not. The bank balance is a lagging indicator. It tells you what has already happened to your cash — payments received, salaries sent, GST deposited. What it cannot tell you is what is about to happen. And in business, what is about to happen is the only number that matters.",
      ]},
      { heading: "What Runway Actually Means", level: 2, content: [
        "Runway is the number of days your business can continue operating at its current rate of spending before running out of cash — assuming no new revenue arrives. It is calculated as:",
        "FORMULA:Runway (days) = Current Cash Balance ÷ Daily Burn Rate\nDaily Burn Rate = Total Cash Outflows (last 30 days) ÷ 30",
        "A business with ₹12.4 lakh in the bank and a daily burn of ₹23,846 has a runway of 52 days. That is the 52-day rule: know this number, know it precisely, and know it every single day.",
        "Why 52 days specifically? Because in our analysis of 500+ Indian SME cash flow crises, the average business had exactly 52 days of runway at the moment they first identified a problem — and 52 days is just barely enough time to fix it if you act immediately.",
      ]},
      { heading: "The Three Zones of Financial Health", level: 2, content: [
        "STAT:> 90 days — Green Zone|You have buffer. You can make strategic decisions — hire, invest, negotiate better terms.",
        "STAT:30–90 days — Amber Zone|Caution. You need to actively manage your receivables and avoid new commitments. Review your top 5 overdue customers this week.",
        "STAT:< 30 days — Red Zone|Crisis mode. Every rupee of spending needs justification. Activate your collections pipeline immediately. Explore invoice discounting.",
        "Most business owners we've spoken to had never calculated their runway before using FynHelp. They were checking their bank balance daily — sometimes multiple times a day — without realising that the bank balance tells them what happened yesterday, while runway tells them what will happen next month.",
      ]},
      { heading: "The Three Levers That Control Runway", level: 2, content: [
        "There are exactly three ways to extend your runway:",
        "1. Collect faster: Every rupee of overdue receivables you collect adds to your bank balance. A business with ₹8.4L overdue from one customer that collects today can add 15 days of runway instantly. Not next month. Today.",
        "2. Pay slower (strategically): Vendor payments, unlike salaries and GST, often have flexibility in timing. Deferring non-critical vendor payments by 15 days without affecting relationships can add meaningful runway without costing anything.",
        "3. Reduce burn: The hardest lever, because reducing spending often means reducing growth potential. But understanding which categories of burn are controllable — versus non-negotiable (salaries, rent, GST liability) — is the first step.",
      ]},
      { heading: "The Most Common Mistake Indian SME Owners Make", level: 2, content: [
        "We've seen it hundreds of times. A business owner looks at their bank balance — say ₹18 lakh — and feels comfortable. Comfortable enough to order extra inventory. Comfortable enough to hire a new team member. Comfortable enough to wait another week before chasing that overdue invoice.",
        "What they don't account for: ₹6L payroll in 12 days. ₹3.2L GST payment on the 20th. ₹4.5L supplier payment that's about to come due. ₹2.1L advance tax installment they forgot about.",
        "Subtract all of that from ₹18L and you have ₹2.2L — which at their burn rate is 9 days of runway. Not 18 lakh of comfort. 9 days of crisis.",
        "The bank balance is lying to you. Not maliciously. Just incompletely.",
      ]},
      { heading: "How Nidhi Monitors Your Runway", level: 2, content: [
        "FynHelp's Nidhi computes your runway every six hours using live bank data from RBI's Account Aggregator. She doesn't just look at today's balance — she projects forward using your scheduled receivables (due dates from your invoices), committed payables (from your bills and purchase orders), payroll dates, GST filing obligations, and loan EMI schedules.",
        "The result is a 180-day cash projection with confidence intervals. When your projected runway drops below 60 days, Nidhi alerts you — in your language, on WhatsApp, with the specific action that will have the highest impact on your runway.",
        "CALLOUT:At FynHelp, we measure our success by one metric above all others: the number of cash crises we prevented before they happened.",
        "The 52-day rule is simple. Know your runway. Know it daily. Act when it drops below 60. The business owners who survive long enough to build something great are almost always the ones who treat runway as their most important number — not an afterthought.",
      ]},
    ],
    related: ["bank-balance-lying", "hidden-cost-of-hiring", "itc-mismatch-silent-loss"],
  },
  {
    slug: "itc-mismatch-silent-loss", title: "ITC Mismatch: The Silent ₹3.2L Annual Loss Most Indian SMEs Don't Know About",
    category: "GST", categoryColor: "bg-fyn-gold", time: "10 min read", date: "March 2025",
    author: "FynHelp Research Team", authorTitle: "Research", initials: "FR", initialsColor: "bg-fyn-ink",
    sections: [
      { heading: "", level: 0, content: [
        "India's GST system is elegant in theory: you pay tax on your sales, your vendors pay tax on what they sold you, and the government lets you offset one against the other. The offset — Input Tax Credit, or ITC — is one of the most powerful financial benefits available to Indian businesses under GST.",
        "In practice, it leaks. Quietly, consistently, and at significant scale.",
        "Our analysis of 1,000+ Indian SME GST records shows an average ITC leakage of ₹3.2 lakh per year per business. For a business with ₹10 crore turnover and substantial purchases, that number is routinely ₹8-15 lakh per year. This is not tax evasion. It is tax that businesses were legally entitled to claim — but didn't, because their vendors didn't file on time.",
      ]},
      { heading: "How ITC Mismatch Works", level: 2, content: [
        "When you purchase goods or services from a vendor, they're supposed to declare that invoice in their GSTR-1 filing. That data then flows into your GSTR-2B — a government-generated statement of all ITC available to you. When you file your GSTR-3B and claim ITC, GSTN cross-checks your claim against your 2B.",
        "If your vendor declared the invoice: you claim ITC. ✓\nIf your vendor didn't declare the invoice: your ITC claim is rejected or flagged for mismatch — and you pay more tax than you should. ✗",
        "The mismatch happens because: your vendor filed GSTR-1 late, your vendor filed GSTR-1 incorrectly (wrong GSTIN, wrong invoice number), your vendor's GSTIN was cancelled or suspended, or your vendor simply didn't file at all.",
        "None of this is your fault. But it is entirely your financial problem.",
      ]},
      { heading: "The GSTR-2B Timeline You Need to Know", level: 2, content: [
        "CALLOUT:GSTR-2B is published on the 14th of every month for the previous month's transactions. This is your window to act before filing GSTR-3B (due the 20th).",
        "The 6 days between the 14th and the 20th are the most financially important days of your tax month. In this window, you can: 1) See which vendors have NOT declared your invoices in their GSTR-1. 2) Contact those vendors and demand they file immediately. 3) Decide whether to claim at-risk ITC or hold it to the next period. 4) Adjust your GSTR-3B to accurately reflect safe vs at-risk ITC.",
        "Most Indian SME owners either don't know this window exists, or find the manual reconciliation process too complex to run in 6 days while also running their business.",
      ]},
      { heading: "Vendor Compliance is Your Financial Liability", level: 2, content: [
        "This is the uncomfortable truth: even the most diligent Indian SME owner can lose ITC because of vendors they cannot control. A supplier with poor GST compliance can silently cost you lakhs per year in unclaimed credit.",
        "FynHelp's research found that the average Indian SME has 3-7 vendors with problematic GST compliance at any given time. These vendors are rarely identified proactively — they're discovered when a notice arrives or when a CA spots it during annual filing.",
      ]},
      { heading: "How to Protect Your ITC", level: 2, content: [
        "Step 1: Pull your GSTR-2B after the 14th each month. Step 2: Match every line in 2B against every purchase invoice in your books. Step 3: For every invoice in your books NOT in 2B — contact the vendor. Step 4: Score each vendor's compliance over 12 months and avoid high-risk vendors for large purchase orders. Step 5: Add an ITC protection clause to new vendor agreements.",
        "FORMULA:\"Vendor agrees to file GSTR-1 including our invoices within 10 days of the invoice date. Failure to file will result in deduction of equivalent ITC value from the next payment.\"",
      ]},
      { heading: "What FynHelp Does Automatically", level: 2, content: [
        "On the 14th of every month, FynHelp's ITC reconciliation engine: 1) Pulls your GSTR-2B via our GSP API connection. 2) Pulls your purchase register from Tally or your accounting software. 3) Runs a 3-way match: GSTIN + invoice number + amount (±₹50 tolerance). 4) Categorises every line: Matched ✓ | Amount mismatch ⚠ | In books but not in 2B ✗ | In 2B but not in books ?",
        "For the average FynHelp user, this takes less than 10 minutes on the 14th instead of 4-6 hours. And the recovery rate in the first year: an average of ₹4.2 lakh per business.",
        "CALLOUT:FynHelp customers have collectively recovered ₹180 crore in previously unclaimed ITC since our GST module launched.",
      ]},
    ],
    related: ["gst-notices-explained", "the-52-day-rule", "bank-balance-lying"],
  },
  {
    slug: "bank-balance-lying", title: "Why Your Bank Balance is Lying to You",
    category: "FINANCIAL LITERACY", categoryColor: "bg-fyn-success", time: "6 min read", date: "March 2025",
    author: "Nidhi Siddhpura", authorTitle: "Co-Founder & Director", initials: "NS", initialsColor: "bg-fyn-gold",
    sections: [
      { heading: "", level: 0, content: [
        "Every Indian business owner I've spoken to — and I've spoken to hundreds — checks their bank balance at least once a day. Many check it three or four times. It's the reflex: open the banking app, see the number, feel either relief or anxiety.",
        "Here's what I've learned: that number is almost always misleading. Not wrong — misleading. Because it tells you what you have, not what you owe. And in business, what you owe is the number that kills.",
      ]},
      { heading: "The Psychology of Balance-Checking", level: 2, content: [
        "There's a reason we default to the bank balance. It's simple, it's immediate, and it feels definitive. ₹18 lakh in the account? We feel rich. ₹3 lakh? We panic. But neither reaction is based on financial reality — both are based on a single, incomplete data point.",
        "The bank balance is a snapshot of one moment in time. It doesn't know that ₹6L payroll is due in 12 days. It doesn't know that ₹3.2L GST is due on the 20th. It doesn't know that ₹4.5L supplier payment just got approved. It doesn't know that the ₹2.1L advance tax installment you forgot about will auto-debit next week.",
      ]},
      { heading: "Five Liabilities Hiding in a Healthy-Looking Balance", level: 2, content: [
        "STAT:₹6L|Payroll + PF + ESIC — due in 12 days, non-negotiable",
        "STAT:₹3.2L|GSTR-3B payment — due on the 20th, penalty if late",
        "STAT:₹4.5L|Supplier payment — already approved, trust at stake",
        "STAT:₹2.1L|Advance tax installment — forgotten but auto-debiting",
        "STAT:₹1.8L|Rent + utilities — monthly fixed, due in 8 days",
        "Total committed outflows: ₹17.6L. From an ₹18L balance, your real available cash is ₹40,000. Your runway? Less than 2 days.",
      ]},
      { heading: "The Three Numbers That Actually Matter", level: 2, content: [
        "Instead of bank balance, every business owner should track these three numbers daily:",
        "1. Available Cash: Bank balance minus all committed outflows in the next 30 days. This is your actual spending power — not the headline number in your banking app.",
        "2. Runway (days): Available cash divided by daily burn rate. This tells you how long you can survive without new revenue. Green: >90 days. Amber: 30-90. Red: <30.",
        "3. Net Working Capital: Current assets minus current liabilities. This structural number tells you whether your business model is financially viable — or whether you're slowly running down reserves.",
      ]},
      { heading: "The Mental Shift Required", level: 2, content: [
        "CALLOUT:Stop asking \"how much money do I have?\" Start asking \"how many days can I operate?\"",
        "The shift from balance-watching to runway-tracking is the single most important financial mindset change an Indian SME owner can make. It transforms every decision: Can I hire? Check the runway impact. Can I order inventory? Check the runway impact. Should I chase that ₹8L receivable today or next week? If your runway is 40 days, today. Not next week.",
        "This is what Nidhi does every morning. She doesn't tell you your balance — your banking app does that. She tells you your runway, the biggest risk to it, and the single action that will improve it the most. That's the difference between information and intelligence.",
      ]},
    ],
    related: ["the-52-day-rule", "hidden-cost-of-hiring", "itc-mismatch-silent-loss"],
  },
  {
    slug: "hidden-cost-of-hiring", title: "The Hidden Cost of Every Hire: Why That ₹6L CTC Actually Costs ₹8.5L",
    category: "HR & WORKFORCE", categoryColor: "bg-fyn-red", time: "7 min read", date: "February 2025",
    author: "FynHelp Research Team", authorTitle: "Research", initials: "FR", initialsColor: "bg-fyn-ink",
    sections: [
      { heading: "", level: 0, content: [
        "When an Indian SME owner says \"I'm hiring someone at ₹6 lakh CTC,\" they almost always believe the cost to their business is ₹6 lakh per year. They are wrong. The true cost is closer to ₹8.5 lakh — and for some roles and cities, it exceeds ₹10 lakh.",
        "This gap between perceived cost and actual cost is one of the most common financial planning errors we see at FynHelp. It leads to overhiring, cash crunches, and runway miscalculations that can threaten a business's survival.",
      ]},
      { heading: "The Complete Cost Breakdown", level: 2, content: [
        "TABLE:Component|₹4L CTC|₹6L CTC|₹10L CTC|₹15L CTC\nGross CTC|₹4,00,000|₹6,00,000|₹10,00,000|₹15,00,000\nPF Employer (12%)|₹48,000|₹72,000|₹1,20,000|₹1,80,000\nESIC (3.25%)|₹13,000|₹19,500|Exempt|Exempt\nGratuity (4.8%)|₹19,200|₹28,800|₹48,000|₹72,000\nBonus (8.33%)|₹33,320|₹49,980|₹83,300|₹1,24,950\nRecruitment Cost|₹20,000|₹40,000|₹1,00,000|₹1,50,000\nLaptop/Equipment|₹30,000|₹45,000|₹60,000|₹80,000\nOffice Seat Cost|₹60,000|₹60,000|₹84,000|₹84,000\nTotal True Cost|₹6,23,520|₹8,15,280|₹13,95,300|₹20,90,950\nBreak-even Revenue|₹15,60,000|₹20,40,000|₹34,88,000|₹52,24,000",
        "The break-even revenue assumes a 40% gross margin — meaning each employee needs to generate 2.5× their true cost in revenue just to cover their own existence. For lower-margin businesses (manufacturing, trading), this multiplier is 4-5×.",
      ]},
      { heading: "The Costs Nobody Budgets For", level: 2, content: [
        "Beyond the statutory costs, there are several hidden expenses that accumulate over the first year: training time (productive capacity is 60-70% in month 1-3), management overhead (someone is spending time onboarding and supervising), notice period coverage (if they leave in 6 months, you pay double for the overlap), and opportunity cost (the cash tied up in this hire could have extended your runway by weeks).",
        "CALLOUT:Before hiring, ask: \"At current burn rate, how many days of runway does this hire cost me?\" If the answer makes you uncomfortable, you're not ready.",
      ]},
      { heading: "When Is the Right Time to Hire?", level: 2, content: [
        "FynHelp's hiring simulation model uses three inputs: your current runway, the role's true cost (not CTC), and the expected revenue contribution timeline. The model outputs: months to break-even for this hire, runway impact (days lost), and the optimal month to hire based on your cash flow cycle.",
        "Generally, we recommend hiring only when: runway exceeds 90 days after accounting for the hire, expected revenue contribution starts within 3 months, and the role directly contributes to either revenue generation or cost reduction.",
        "For roles that don't generate revenue (administrative, support), the calculus is different — these hires must be justified by efficiency gains that free up revenue-generating capacity elsewhere.",
      ]},
    ],
    related: ["the-52-day-rule", "bank-balance-lying", "gut-feel-to-data-driven"],
  },
  {
    slug: "gst-notices-explained", title: "GST Notices in India: What Triggers Them and How to Respond",
    category: "COMPLIANCE", categoryColor: "bg-fyn-warning", time: "12 min read", date: "January 2025",
    author: "FynHelp Compliance Team", authorTitle: "Compliance", initials: "FC", initialsColor: "bg-fyn-ink",
    sections: [
      { heading: "", level: 0, content: [
        "Receiving a GST notice is one of the most stressful experiences for an Indian business owner. The language is dense, the timelines are tight, and the consequences of ignoring or mishandling a notice can be severe — from financial penalties to business disruption.",
        "At FynHelp, we've helped hundreds of businesses respond to GST notices. Here's everything you need to know about what triggers them, how to read them, and how to respond.",
      ]},
      { heading: "The Six Most Common Notice Triggers", level: 2, content: [
        "1. GSTR-1 vs GSTR-3B Mismatch: When the sales you reported in GSTR-1 don't match the tax you paid in GSTR-3B. This is the #1 trigger and usually happens because of timing differences or computational errors.",
        "2. ITC Claimed Exceeds 2B Available: When you claim more ITC in your GSTR-3B than what's available in your auto-generated GSTR-2B. This happens when vendors don't file their returns on time.",
        "3. Late Filing Patterns: Consistently filing returns after the due date triggers automated scrutiny. Three consecutive late filings is the typical threshold.",
        "4. Turnover Discrepancy: When your reported turnover in GST returns doesn't match your income tax returns or bank transaction volumes. The government cross-references these databases.",
        "5. E-Invoice Non-Compliance: For businesses above the applicable turnover threshold, not generating e-invoices or generating them incorrectly triggers notices.",
        "6. Composition Scheme Violations: Operating outside the scope of the composition scheme (inter-state sales, e-commerce sales) while registered under it.",
      ]},
      { heading: "How to Read a GST Notice", level: 2, content: [
        "Every GST notice contains: the DIN (Document Identification Number) — verify this on the CBIC portal to confirm it's genuine, the section under which it's issued (determines severity), the specific discrepancy identified, the period under scrutiny, the response deadline (usually 30 days), and the officer's name and jurisdiction.",
        "CALLOUT:The 30-day response window is non-negotiable. Missing it can convert a routine notice into a demand order with penalties. Always respond within 15 days to leave room for follow-ups.",
      ]},
      { heading: "FynHelp's Notice Risk Scorer", level: 2, content: [
        "FynHelp's Notice Risk Scorer uses 6 weighted factors to calculate your probability of receiving a scrutiny notice: filing regularity (20%), ITC mismatch rate (25%), turnover consistency (15%), e-invoice compliance (15%), GSTR-1 vs 3B consistency (15%), and historical notice frequency (10%).",
        "FORMULA:Notice Risk Score = Σ(factor_weight × factor_score)\nScore 0-30: Low risk | 31-60: Moderate | 61-100: High risk",
        "The scorer runs monthly and tells you exactly which factors to address to reduce your risk. A business that reduces their score from 74 to 19 in three months — as several of our users have — is effectively preventing notices before they're issued.",
      ]},
    ],
    related: ["itc-mismatch-silent-loss", "section-43bh-msme-rights", "account-aggregator-revolution"],
  },
  {
    slug: "account-aggregator-revolution", title: "India's Account Aggregator Revolution: What It Means for Your Business",
    category: "FINTECH", categoryColor: "bg-fyn-gold", time: "8 min read", date: "January 2025",
    author: "Adireddy Tarun", authorTitle: "Founder & CEO", initials: "AT", initialsColor: "bg-fyn-red",
    sections: [
      { heading: "", level: 0, content: [
        "In September 2021, the Reserve Bank of India launched one of the most ambitious financial infrastructure projects in the world: the Account Aggregator framework. If UPI democratised payments, Account Aggregator is doing the same for financial data.",
        "For Indian SMEs, this changes everything. Here's why — and how FynHelp uses it to give you real-time financial intelligence.",
      ]},
      { heading: "What is Account Aggregator?", level: 2, content: [
        "Account Aggregator (AA) is a consent-based data-sharing framework regulated by RBI. It allows you to share your financial data — bank balances, transactions, deposits, insurance, mutual funds — with any registered application, without sharing your login credentials.",
        "Think of it like a digital postal service for your financial data. You authorise the sharing (consent), the AA fetches the data from your bank (FIP — Financial Information Provider), and delivers it to the app you chose (FIU — Financial Information User). You can revoke consent at any time from your bank app.",
        "CALLOUT:Account Aggregator is NOT screen scraping. It's a regulated, encrypted, consent-based data pipe built by RBI. Your bank credentials are never shared with anyone.",
      ]},
      { heading: "Which Banks Support AA?", level: 2, content: [
        "As of early 2025, the following banks are live on the AA network: HDFC Bank, ICICI Bank, State Bank of India, Axis Bank, Kotak Mahindra Bank, Yes Bank, IndusInd Bank, Punjab National Bank, Bank of Baroda, Canara Bank, Union Bank, UCO Bank, and 20+ more joining regularly.",
        "For banks not yet on the AA network, FynHelp provides a PDF bank statement parser that supports all major Indian bank formats — you upload, we extract and categorise.",
      ]},
      { heading: "How FynHelp Uses Account Aggregator", level: 2, content: [
        "When you connect your bank account via AA in FynHelp (a 2-minute process), here's what happens: Nidhi fetches your transaction data every 6 hours. Each transaction is automatically categorised (revenue, supplier payment, salary, GST, loan EMI, etc.). Your cash balance, burn rate, and runway are computed in real-time. Any unusual transactions — large debits, unexpected patterns — trigger instant alerts.",
        "The result: you wake up to a morning brief from Nidhi that knows exactly how much cash you have, where it went, and what's coming next. No spreadsheets. No manual data entry. No waiting for your accountant.",
      ]},
      { heading: "The Privacy Framework", level: 2, content: [
        "AA is built on four principles that protect your data: explicit consent (you must approve every data request), purpose limitation (the app must state why it needs the data), time-bound access (consent expires automatically), and revocability (you can revoke access anytime from your bank app).",
        "FynHelp requests the minimum data needed: transaction history and current balance. We do not access your personal details, Aadhaar, or any data beyond what's needed for financial intelligence. All data is encrypted at rest (AES-256) and in transit (TLS 1.3).",
      ]},
    ],
    related: ["the-52-day-rule", "bank-balance-lying", "gst-notices-explained"],
  },
  {
    slug: "section-43bh-msme-rights", title: "Section 43B(h): The Law That Gives Indian MSMEs the Right to Collect Faster",
    category: "LEGAL & RIGHTS", categoryColor: "bg-fyn-ink", time: "9 min read", date: "December 2024",
    author: "FynHelp Legal Team", authorTitle: "Legal", initials: "FL", initialsColor: "bg-fyn-ink",
    sections: [
      { heading: "", level: 0, content: [
        "If you're a registered MSME (Udyam) and your buyers are paying you late, you have a powerful legal weapon that most small business owners don't know about: Section 43B(h) of the Income Tax Act, 1961.",
        "This amendment, effective from April 2024, fundamentally changes the payment dynamics between large buyers and MSME suppliers. Here's the complete analysis.",
      ]},
      { heading: "What Section 43B(h) Says", level: 2, content: [
        "CALLOUT:If a buyer does not pay an MSME supplier within 45 days of acceptance of goods/services, the buyer cannot claim that expense as a deduction in their income tax return for that financial year.",
        "This is revolutionary because it hits large buyers where it hurts most: their tax liability. A company that owes ₹50L to MSME suppliers and doesn't pay within 45 days effectively loses the ability to deduct ₹50L from their taxable income — increasing their tax bill by ₹12.5-17.5L (depending on their tax bracket).",
        "The provision applies to any payment made to a supplier registered as a Micro or Small Enterprise under the MSME Development Act, 2006.",
      ]},
      { heading: "Who Qualifies as an MSME?", level: 2, content: [
        "Under the current Udyam registration thresholds: Micro Enterprise: Investment up to ₹1 Crore AND Turnover up to ₹5 Crore. Small Enterprise: Investment up to ₹10 Crore AND Turnover up to ₹50 Crore. Medium Enterprise: Investment up to ₹50 Crore AND Turnover up to ₹250 Crore.",
        "FORMULA:Both criteria (investment AND turnover) must be satisfied simultaneously.\nRegistration is free at udyamregistration.gov.in",
        "If you haven't registered yet, do it today. It's free, takes 15 minutes, and unlocks not just 43B(h) protection but also CGTMSE collateral-free loans, government tender preference, and delayed payment interest claims.",
      ]},
      { heading: "How to Calculate the 45 Days", level: 2, content: [
        "The 45-day clock starts from the date of acceptance of goods or services — not the invoice date. If there's a written agreement specifying payment terms, those terms apply (up to 45 days maximum). If there's no written agreement, the payment must be made within 15 days of acceptance.",
        "Important: the 45-day limit cannot be overridden by contract. Even if a buyer's purchase order says \"payment in 90 days,\" the law caps it at 45 days for MSME suppliers.",
      ]},
      { heading: "How to Send the Formal Demand", level: 2, content: [
        "FynHelp's MSME Rights Enforcer module generates a formal demand letter with one tap. The letter includes: your Udyam registration details, specific invoice numbers and amounts, the 45-day calculation showing overdue status, reference to Section 43B(h) and Section 15 of the MSME Development Act, and a 7-day payment demand.",
        "CALLOUT:In our experience, 72% of demand letters sent via FynHelp's MSME Rights Enforcer result in full payment within 14 days. The legal teeth of 43B(h) make buyers take these letters seriously.",
        "The letter is designed to be firm but professional — maintaining the business relationship while asserting your legal rights. FynHelp generates it pre-filled with your invoice data; you review, approve, and send.",
      ]},
    ],
    related: ["itc-mismatch-silent-loss", "gst-notices-explained", "gut-feel-to-data-driven"],
  },
  {
    slug: "gut-feel-to-data-driven", title: "From Gut Feel to Data-Driven: How 10 Indian SME Owners Changed",
    category: "SUCCESS STORIES", categoryColor: "bg-fyn-success", time: "11 min read", date: "November 2024",
    author: "FynHelp Customer Success Team", authorTitle: "Customer Success", initials: "CS", initialsColor: "bg-fyn-gold",
    sections: [
      { heading: "", level: 0, content: [
        "Every business owner we work with started the same way: running their business on gut feel, experience, and the bank balance. There's nothing wrong with intuition — it's gotten many businesses to where they are today. But intuition has blind spots, especially around cash flow, compliance, and growth timing.",
        "Here are 10 anonymised stories from real FynHelp customers who made the shift from gut feel to data-driven decision-making.",
      ]},
      { heading: "The Textile Trader Who Discovered He Was 22 Days from Crisis", level: 2, content: [
        "Rajesh (name changed) runs a ₹8 Cr textile trading business in Surat. His bank balance showed ₹24L — comfortable by his standards. When FynHelp computed his runway for the first time, it was 22 days. His Diwali advance payments to suppliers, upcoming GST, and payroll left him with just ₹3.2L in available cash.",
        "\"I would have kept spending normally. I would have placed that ₹6L order for new fabric. And in 3 weeks I would have been scrambling for an overdraft.\" Rajesh now checks his runway dashboard before every purchase decision.",
      ]},
      { heading: "The Manufacturer Who Recovered ₹11.4L in Unclaimed ITC", level: 2, content: [
        "Priya (name changed) manufactures packaging materials in Pune. She'd been running FynHelp's ITC reconciliation for just 3 months when the system flagged ₹11.4L in ITC that her vendors hadn't declared in their GSTR-1. Six of her top 20 vendors had compliance issues.",
        "\"My CA would have caught some of this during annual filing — maybe ₹4-5L of it. But by then, the vendors' filing windows would have closed. FynHelp caught it in real-time, while I still had leverage to get them to file.\"",
      ]},
      { heading: "The IT Services Firm That Timed Their Hiring Perfectly", level: 2, content: [
        "An IT services company in Bengaluru (₹12 Cr revenue) wanted to hire 5 developers. FynHelp's hiring simulation showed that hiring all 5 in the same month would drop their runway from 94 days to 51 days. Instead, they staggered: 2 in month 1, 2 in month 3 (after a large receivable was collected), and 1 in month 5.",
        "Result: runway never dropped below 70 days. All 5 hires were made within the same quarter. No cash crisis, no emergency borrowing.",
      ]},
      { heading: "The Exporter Who Prevented a GST Notice", level: 2, content: [
        "An export business in Chennai had a Notice Risk Score of 78 — deep in the red zone. The primary factor: GSTR-1 vs 3B mismatches caused by their previous accountant's errors. FynHelp identified the exact returns with discrepancies, the accountant corrected and re-filed, and the score dropped to 31 within two months.",
        "\"We were one audit cycle away from a serious problem. FynHelp showed us the exact returns that were wrong and what the correct numbers should have been.\"",
      ]},
      { heading: "The Common Thread", level: 2, content: [
        "CALLOUT:Every one of these businesses had been operating successfully for years. They weren't failing — they were flying blind. The shift to data-driven decisions didn't save them from failure; it showed them opportunities and risks they couldn't see.",
        "The pattern is consistent: business owners who shift from gut feel to data-driven decisions don't change their strategy — they change their timing. They hire at the right time instead of the wrong time. They chase receivables before they become bad debt instead of after. They fix GST compliance issues before notices arrive instead of after.",
        "Intelligence doesn't replace business judgment. It gives business judgment better inputs. And in a country with 63 million SMEs competing for the same customers, better inputs are the difference between surviving and thriving.",
      ]},
    ],
    related: ["the-52-day-rule", "hidden-cost-of-hiring", "bank-balance-lying"],
  },
];

const slugToArticle = Object.fromEntries(articles.map((a) => [a.slug, a]));

function renderContent(c: string) {
  if (c.startsWith("CALLOUT:")) {
    return <div className="bg-fyn-beige-dark border-l-[3px] border-fyn-gold rounded-r-lg p-5 my-6 italic text-fyn-ink/80 text-base leading-relaxed">{c.slice(8)}</div>;
  }
  if (c.startsWith("FORMULA:")) {
    return <pre className="bg-fyn-ink text-white rounded-lg p-4 my-4 text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.slice(8)}</pre>;
  }
  if (c.startsWith("STAT:")) {
    const parts = c.slice(5).split("|");
    return (
      <div className="flex items-start gap-4 my-4">
        <span className="text-fyn-red font-serif text-2xl font-bold shrink-0" style={{ minWidth: 100 }}>{parts[0]}</span>
        <span className="text-fyn-ink/80 text-base leading-relaxed">{parts[1]}</span>
      </div>
    );
  }
  if (c.startsWith("TABLE:")) {
    const lines = c.slice(6).split("\n");
    const headers = lines[0].split("|");
    const rows = lines.slice(1).map((l) => l.split("|"));
    return (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse text-sm">
          <thead><tr className="bg-fyn-ink text-white">{headers.map((h) => <th key={h} className="p-3 text-left font-medium">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} className={i % 2 === 0 ? "bg-fyn-beige-card" : "bg-fyn-beige"}>{r.map((c2, j) => <td key={j} className="p-3 text-fyn-ink/80">{c2}</td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }
  return <p className="text-fyn-ink/80 text-lg leading-[1.75] mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>{c}</p>;
}

const BlogArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  const article = slug ? slugToArticle[slug] : undefined;

  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;
      const rect = articleRef.current.getBoundingClientRect();
      const total = articleRef.current.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!article) {
    return <Layout><div className="fyn-container py-32 text-center"><h1 className="text-3xl text-fyn-ink">Article not found</h1><Link to="/blog" className="text-fyn-red mt-4 inline-block">← Back to The FynHelp Journal</Link></div></Layout>;
  }

  const toc: Section[] = article.sections.filter((s) => s.heading).map((s) => ({
    id: s.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: s.heading,
    level: s.level,
  }));

  const relatedArticles = article.related.map((r) => slugToArticle[r]).filter(Boolean);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 z-50" style={{ height: 3 }}>
        <div className="h-full bg-fyn-red" style={{ width: `${progress}%`, transition: "width 100ms" }} />
      </div>

      {/* Back */}
      <div className="bg-fyn-beige border-b border-fyn-ink-10">
        <div className="fyn-container py-3">
          <Link to="/blog" className="text-fyn-gold text-sm hover:text-fyn-red transition-colors">← The FynHelp Journal</Link>
        </div>
      </div>

      {/* Header */}
      <section className="bg-fyn-beige" style={{ padding: "48px 0" }}>
        <div className="fyn-container max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <span className={`${article.categoryColor} text-white text-[10px] px-2.5 py-0.5 rounded fyn-label`}>{article.category}</span>
            <span className="text-fyn-ink/40 text-sm">{article.time} · {article.date}</span>
          </div>
          <h1 className="font-serif text-fyn-ink mb-6" style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15 }}>{article.title}</h1>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${article.initialsColor} flex items-center justify-center text-white text-sm font-bold`}>{article.initials}</div>
            <div>
              <p className="text-fyn-ink text-sm font-medium">{article.author}</p>
              <p className="text-fyn-ink/40 text-xs">{article.authorTitle} · {article.date}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Article + Sidebar */}
      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container">
          <div className="flex gap-12">
            {/* Article */}
            <div ref={articleRef} className="flex-1 max-w-3xl">
              {article.sections.map((s, i) => (
                <div key={i}>
                  {s.heading && <h2 id={s.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="font-serif text-fyn-ink mb-4" style={{ fontSize: 32, fontWeight: 700, marginTop: i === 0 ? 0 : 40 }}>{s.heading}</h2>}
                  {s.content.map((c, j) => <div key={j}>{renderContent(c)}</div>)}
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky" style={{ top: 120 }}>
                {toc.length > 0 && (
                  <div className="mb-8">
                    <p className="fyn-caption text-fyn-gold text-[10px] mb-3">In this article</p>
                    <nav className="space-y-1">
                      {toc.map((t) => (
                        <a key={t.id} href={`#${t.id}`} className="block text-sm text-fyn-ink/60 hover:text-fyn-red py-1 pl-3 border-l-2 border-transparent hover:border-fyn-red transition-colors">{t.title}</a>
                      ))}
                    </nav>
                  </div>
                )}

                <div className="mb-8">
                  <p className="fyn-caption text-fyn-gold text-[10px] mb-3">Share this article</p>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="text-xs px-3 py-1.5 rounded border border-fyn-ink-10 text-fyn-ink/60 hover:border-fyn-red hover:text-fyn-red transition-colors">
                      {copied ? "Copied! ✓" : "Copy link"}
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(article.title + " " + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded border border-fyn-ink-10 text-fyn-ink/60 hover:border-fyn-red hover:text-fyn-red transition-colors">
                      WhatsApp
                    </a>
                  </div>
                </div>

                {relatedArticles.length > 0 && (
                  <div>
                    <p className="fyn-caption text-fyn-gold text-[10px] mb-3">Related</p>
                    <div className="space-y-3">
                      {relatedArticles.map((r) => (
                        <Link key={r.slug} to={`/blog/${r.slug}`} className="block p-3 rounded-lg border border-fyn-ink-10 hover:border-fyn-red transition-colors">
                          <p className="text-fyn-ink text-sm font-medium leading-snug">{r.title}</p>
                          <p className="text-fyn-ink/40 text-xs mt-1">{r.time}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default BlogArticlePage;
