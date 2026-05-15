import React from 'react';
import { TrendingUp, RotateCcw, BarChart3 } from 'lucide-react';

export const PREINDEXED_DOCS = [
  {
    id: 'doc-1',
    name: 'acme_q1_business_report.pdf',
    size: '6.4 KB',
    pages: 3,
    type: 'Q1 Business Report',
    pdfUrl: '/documents/acme_q1_business_report.pdf',
    description: 'Executive internal management summary detailing $1.18M in net sales across 5 products, regional performance (NA 46%, EU 27%, APAC 18.1%), return rates, and support ticket themes.',
    fullText: [
      {
        page: 1,
        content: `ACME COMMERCE | Q1 2026 Business Report\nReporting period: January 1 to March 31, 2026\n\nExecutive summary:\nAcme Commerce generated $1.18 million in Q1 net sales across five core products. AirBuds X2 had the highest unit volume, while SmartWatch Pro generated the highest product revenue. HomeHub Mini recorded the lowest return rate.\n\nProduct Performance Table:\n- SmartWatch Pro: 2,180 units | $652,820 Net Revenue | 4.8% Return Rate | 142 Support Tickets\n- AirBuds X2: 3,950 units | $576,700 Net Revenue | 6.9% Return Rate | 231 Support Tickets\n- HomeHub Mini: 2,760 units | $273,240 Net Revenue | 2.1% Return Rate | 96 Support Tickets\n- PowerBank 20K: 2,430 units | $192,440 Net Revenue | 3.4% Return Rate | 71 Support Tickets\n- FitScale: 1,880 units | $129,720 Net Revenue | 5.7% Return Rate | 88 Support Tickets`
      },
      {
        page: 2,
        content: `Regional Breakdown:\n- North America: $542,600 (46.0% share) | Top Product: SmartWatch Pro\n- Europe: $318,900 (27.0% share) | Top Product: AirBuds X2\n- Asia-Pacific: $213,500 (18.1% share) | Top Product: HomeHub Mini\n- Other: $105,000 (8.9% share) | Top Product: PowerBank 20K\n\nCustomer Feedback Themes:\n- Battery Life: SmartWatch Pro & AirBuds X2 (High frequency)\n- Connectivity Setup: HomeHub Mini (Medium frequency)\n- Charging Speed: PowerBank 20K (Low frequency)\n- Measurement Consistency: FitScale (Medium frequency)`
      },
      {
        page: 3,
        content: `Q1 Decisions & Recommendations:\n1. Promote SmartWatch Pro in North America ($652k revenue leader, 4.8% return rate).\n2. Review AirBuds X2 returns in Europe (Highest unit sales, elevated 6.9% return rate).\n3. Expand HomeHub Mini education in Asia-Pacific (Lowest return rate at 2.1%, 24-month warranty differentiator).`
      }
    ]
  },
  {
    id: 'doc-2',
    name: 'acme_product_catalog.pdf',
    size: '6.7 KB',
    pages: 3,
    type: 'Product Catalog',
    pdfUrl: '/documents/acme_product_catalog.pdf',
    description: 'Defines list prices ($299 SmartWatch Pro, $149 AirBuds X2, $99 HomeHub Mini, $79 PowerBank 20K, $69 FitScale), key specs, 12 to 24-month warranty durations, and positioning.',
    fullText: [
      {
        page: 1,
        content: `ACME COMMERCE | Product Catalog Q1 2026\nAcme Commerce is a direct-to-consumer electronics company.\n\nProduct Portfolio:\n- SmartWatch Pro (Wearables): $299 | 7-day battery, GPS, ECG, 5 ATM water resistance\n- AirBuds X2 (Audio): $149 | 32h total battery, Active Noise Cancellation (ANC), Multipoint BT\n- HomeHub Mini (Smart Home): $99 | Matter-compatible, Wi-Fi 6, Voice control\n- PowerBank 20K (Accessories): $79 | 20,000 mAh, 65W USB-C Power Delivery\n- FitScale (Health): $69 | Bluetooth, body composition analysis, 180kg capacity`
      },
      {
        page: 2,
        content: `Detailed Specifications & Warranty:\n- SmartWatch Pro: Bluetooth 5.3, Wi-Fi | 12-Month Warranty | Includes Watch, charger, sport band\n- AirBuds X2: Bluetooth 5.3 | 12-Month Warranty | Includes Buds, case, USB-C cable\n- HomeHub Mini: Wi-Fi 6, Matter | 24-Month Warranty | Includes Hub, USB-C adapter\n- PowerBank 20K: 65W PD | 18-Month Warranty | Includes Power bank, USB-C cable\n- FitScale: Bluetooth 5.0 | 12-Month Warranty | Includes Scale, batteries, quick guide`
      },
      {
        page: 3,
        content: `Commercial Reference & Campaign Data:\n- SmartWatch Pro: Target - Active professionals | Q1 Campaign: Performance Week\n- AirBuds X2: Target - Urban commuters | Q1 Campaign: Commute Better\n- HomeHub Mini: Target - First-time smart-home buyers | Q1 Campaign: Simple Smart Home\n- PowerBank 20K: Target - Frequent travelers | Q1 Campaign: Power Anywhere\n- FitScale: Target - Fitness beginners | Q1 Campaign: Start at Home`
      }
    ]
  },
  {
    id: 'doc-3',
    name: 'acme_customer_policies.pdf',
    size: '6.2 KB',
    pages: 3,
    type: 'Customer Policies',
    pdfUrl: '/documents/acme_customer_policies.pdf',
    description: 'Defines the standard 30-day return policy window, packaging requirements, 12 to 24-month hardware warranty assessment procedures, return shipping rules, and decision examples.',
    fullText: [
      {
        page: 1,
        content: `ACME COMMERCE | Customer Policies & Support Guide\n\nReturn Policy:\n- Standard Return Window: Customers may return products within 30 days from purchase date for a full refund or exchange.\n- Eligibility: Items must be unused, in resalable condition, and in original packaging with proof of purchase.\n\nWarranty Coverage:\n- SmartWatch Pro: 12 months\n- AirBuds X2: 12 months\n- HomeHub Mini: 24 months\n- PowerBank 20K: 18 months\n- FitScale: 12 months`
      },
      {
        page: 2,
        content: `Warranty Claims & Escalation Procedures:\n- Hardware Defects: Covered under manufacturer warranty for the specified duration.\n- Exclusions: Accidental damage, water submersion beyond 5 ATM rating, unauthorized modification.\n- Return Shipping: Acme arranges prepaid return shipping for verified defective products.`
      },
      {
        page: 3,
        content: `Support Decision Examples:\n- Example A: SmartWatch Pro bought 8 months ago with battery defect -> Outside 30-day return window, but INSIDE 12-month warranty period. Process as Warranty Claim.\n- Example B: AirBuds X2 bought 20 days ago, unwanted -> Inside 30-day return window and resalable. Process as Standard Return.\n- Example C: HomeHub Mini bought 20 months ago with hardware issue -> Outside 30-day return window, but INSIDE 24-month warranty period. Process as Warranty Assessment.`
      }
    ]
  }
];

export const STARTER_PROMPTS = [
  {
    icon: <TrendingUp size={22} color="var(--accent-groq)" />,
    title: 'Product Revenue & Warranty',
    prompt: 'Which product generated the highest revenue in Q1, and what is its listed price and warranty period?'
  },
  {
    icon: <RotateCcw size={22} color="#3b82f6" />,
    title: 'Return Policies & Regional Returns',
    prompt: 'What is the return policy window, and which product had the highest return rate in Europe?'
  },
  {
    icon: <BarChart3 size={22} color="#10b981" />,
    title: 'Net Sales & Regional Performance',
    prompt: 'What was Acme Commerce Q1 total net sales, and which region generated the highest revenue share?'
  }
];

export const MOCK_KNOWLEDGE_BASE = [
  {
    keywords: ['highest revenue', 'listed price', 'warranty period', 'smartwatch pro'],
    answer: `Based on **[Document: acme_q1_business_report.pdf, Page 1]** and **[Document: acme_product_catalog.pdf, Page 1 & 2]**:\n\n1. **Highest Revenue Product**: **SmartWatch Pro** generated the highest product revenue in Q1 with **$652,820** (2,180 units sold).\n2. **Listed Price**: Listed at **$299** in the Acme Product Catalog.\n3. **Warranty Period**: Comes with a **12-month warranty** covering hardware and battery defects.`,
    citations: [
      {
        citation_id: 1,
        source: 'acme_q1_business_report.pdf',
        page: 1,
        rerank_score: 0.9810,
        content_snippet: 'SmartWatch Pro generated the highest product revenue ($652,820 across 2,180 units). AirBuds X2 had the highest unit volume.'
      },
      {
        citation_id: 2,
        source: 'acme_product_catalog.pdf',
        page: 1,
        rerank_score: 0.9420,
        content_snippet: 'SmartWatch Pro | Wearables | $299 | 7-day battery; GPS; ECG; 5 ATM water resistance | Fitness and professional users. Warranty: 12 months.'
      }
    ]
  },
  {
    keywords: ['return policy window', 'highest return rate', 'europe', 'airbuds x2', '30-day'],
    answer: `According to **[Document: acme_customer_policies.pdf, Page 1]** and **[Document: acme_q1_business_report.pdf, Page 1 & 2]**:\n\n1. **Standard Return Window**: Customers qualify for a standard return within **30 days from purchase date** provided the item is unwanted but in resalable condition.\n2. **Highest Return Rate**: **AirBuds X2** recorded the highest return rate at **6.9%** (with 231 support tickets), particularly highlighted as needing attention in **Europe** where audio demand is high but return rate is elevated due to battery life feedback.`,
    citations: [
      {
        citation_id: 1,
        source: 'acme_customer_policies.pdf',
        page: 1,
        rerank_score: 0.9650,
        content_snippet: 'Standard Return Window: Customers may return products within 30 days from the purchase date for a full refund or exchange, provided items are in resalable condition.'
      },
      {
        citation_id: 2,
        source: 'acme_q1_business_report.pdf',
        page: 2,
        rerank_score: 0.9280,
        content_snippet: 'Europe: $318,900 revenue (27.0% share). Top product: AirBuds X2. Observation: High audio demand; return rate (6.9%) needs attention due to battery complaints.'
      }
    ]
  },
  {
    keywords: ['net sales', 'total net sales', 'highest revenue share', 'north america', '1.18 million'],
    answer: `According to **[Document: acme_q1_business_report.pdf, Page 1 & 2]**:\n\n1. **Q1 Total Net Sales**: Acme Commerce generated **$1.18 Million** in Q1 net sales across five core products.\n2. **Highest Revenue Share Region**: **North America** produced the highest share at **46.0%** of total revenue (**$542,600**), led by strong performance of SmartWatch Pro.`,
    citations: [
      {
        citation_id: 1,
        source: 'acme_q1_business_report.pdf',
        page: 1,
        rerank_score: 0.9890,
        content_snippet: 'Executive summary: Acme Commerce generated $1.18 million in Q1 net sales across five core products. AirBuds X2 had highest unit volume.'
      },
      {
        citation_id: 2,
        source: 'acme_q1_business_report.pdf',
        page: 2,
        rerank_score: 0.9540,
        content_snippet: 'North America: $542,600 revenue (46.0% share of Q1 revenue). Top product: SmartWatch Pro. Observation: Premium products perform strongly.'
      }
    ]
  }
];
