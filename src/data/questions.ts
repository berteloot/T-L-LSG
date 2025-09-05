export const questions = [
  {
    id: "company_roles",
    title: "Company Profile - Roles in Logistics Value Chain",
    subtitle: "What roles does your company play in the logistics value chain?\n(Select all that apply, then we'll ask for your primary focus)",
    type: "multi",
    category: "Company Profile",
    weight: 0,
    maxPoints: 0,
    options: [
      { value: "freight_brokerage", label: "Freight brokerage (e.g., 3PL, domestic load planning)" },
      { value: "carrier", label: "Carrier (asset-based trucking)" },
      { value: "freight_forwarding", label: "Freight forwarding (air/ocean)" },
      { value: "warehousing_fulfillment", label: "Warehousing & fulfillment" },
      { value: "shipper_brand", label: "Shipper / brand / manufacturer" },
      { value: "other", label: "Other" }
    ]
  },
  {
    id: "primary_focus",
    title: "Primary Focus",
    subtitle: "Which is your primary focus today?",
    type: "single",
    category: "Company Profile",
    weight: 0,
    maxPoints: 0,
    options: [
      { value: "freight_brokerage", label: "Freight brokerage (e.g., 3PL, domestic load planning)" },
      { value: "carrier", label: "Carrier (asset-based trucking)" },
      { value: "freight_forwarding", label: "Freight forwarding (air/ocean)" },
      { value: "warehousing_fulfillment", label: "Warehousing & fulfillment" },
      { value: "shipper_brand", label: "Shipper / brand / manufacturer" },
      { value: "other", label: "Other" }
    ]
  },
  {
    id: "operational_footprint",
    title: "Operational Footprint",
    subtitle: "What is your operational footprint?",
    type: "single",
    category: "Company Profile",
    weight: 0,
    maxPoints: 0,
    options: [
      { value: "us_based", label: "Primarily U.S.-based" },
      { value: "regional", label: "Regional (e.g., LATAM, EMEA)" },
      { value: "global", label: "Global/multinational" }
    ]
  },
  {
    id: "company_size",
    title: "Company Size",
    subtitle: "What best describes your company size?",
    type: "single",
    category: "Company Profile",
    weight: 0,
    maxPoints: 0,
    options: [
      { value: "under_100", label: "Fewer than 100 employees" },
      { value: "100_499", label: "100–499" },
      { value: "500_999", label: "500–999" },
      { value: "1000_plus", label: "1,000 or more" }
    ]
  },
  {
    id: "improvement_areas",
    title: "Process Focus - Areas Needing Improvement",
    subtitle: "In which of these areas do you think your company needs to improve?\n(Select up to 3)",
    type: "multi",
    category: "Process Focus",
    weight: 0,
    maxPoints: 0,
    maxSelections: 3,
    options: [
      { value: "quoting_rate_requests", label: "Quoting & customer rate requests" },
      { value: "track_trace_visibility", label: "Track & trace / visibility" },
      { value: "dispatch_planning_routing", label: "Dispatch / planning & routing" },
      { value: "document_processing", label: "Document processing (PODs, invoices, customs docs)" },
      { value: "carrier_sales_load_matching", label: "Carrier sales / load matching" },
      { value: "warehouse_staffing_flow", label: "Warehouse staffing & flow" },
      { value: "driver_recruiting_onboarding", label: "Driver recruiting / onboarding" },
      { value: "sla_compliance_reporting", label: "SLA / compliance reporting" }
    ]
  },
  {
    id: "pressure_areas",
    title: "Areas of Pressure",
    subtitle: "Where do you feel the most pressure to improve?\n(Select up to 3)",
    type: "multi",
    category: "Process Focus",
    weight: 0,
    maxPoints: 0,
    maxSelections: 3,
    options: [
      { value: "reducing_cost", label: "Reducing cost per transaction / load" },
      { value: "improving_service", label: "Improving service levels or response times" },
      { value: "workforce_capacity", label: "Solving workforce capacity or attrition issues" },
      { value: "digital_tools", label: "Adopting digital tools to stay competitive" },
      { value: "not_sure", label: "Not sure yet; exploring use cases" }
    ]
  },
  {
    id: "system_count",
    title: "System Integration",
    subtitle: "How many systems are involved in completing these processes?",
    type: "single",
    category: "Current State",
    weight: 0,
    maxPoints: 0,
    options: [
      { value: "one", label: "One" },
      { value: "two_three", label: "Two or three" },
      { value: "more_three", label: "More than three" }
    ]
  },
  {
    id: "performance_tracking",
    title: "Performance Tracking",
    subtitle: "How do you track performance today?",
    type: "single",
    category: "Current State",
    weight: 0,
    maxPoints: 0,
    options: [
      { value: "dashboards", label: "KPIs tracked and shared on dashboards" },
      { value: "siloed", label: "KPIs exist but siloed or inconsistently reviewed" },
      { value: "manual", label: "Managers monitor outputs manually" },
      { value: "no_visibility", label: "Little to no visibility" }
    ]
  },
  {
    id: "leadership_views",
    title: "Openness to Change - Leadership Views",
    subtitle: "How would you describe leadership and staff views on AI or automation?",
    type: "single",
    category: "Openness to Change",
    weight: 0,
    maxPoints: 0,
    options: [
      { value: "curious_unsure", label: "Curious but unsure where to start" },
      { value: "open_pilots", label: "Open to pilots if tied to improvements" },
      { value: "actively_exploring", label: "Actively exploring or testing solutions" },
      { value: "skeptical_resistant", label: "Skeptical or resistant" }
    ]
  },
  {
    id: "ai_concerns",
    title: "AI Concerns",
    subtitle: "What are your biggest concerns about adopting AI?\nRank each concern from 1 (Major Concern) to 5 (Not Applicable)",
    type: "ranking",
    category: "Openness to Change",
    weight: 0,
    maxPoints: 0,
    rankingOptions: [
      { value: "workflow_disruption", label: "Workflow disruption" },
      { value: "cost_unclear_roi", label: "Cost or unclear ROI" },
      { value: "staff_resistance", label: "Staff resistance" },
      { value: "data_privacy_compliance", label: "Data privacy or compliance" },
      { value: "not_concerned", label: "Not concerned" }
    ],
    rankingLevels: [
      { value: "1", label: "1 = Major Concern", points: 1 },
      { value: "2", label: "2 = Moderate Concern", points: 2 },
      { value: "3", label: "3 = Minor Concern", points: 3 },
      { value: "4", label: "4 = Not a Concern", points: 4 },
      { value: "5", label: "5 = Not Applicable", points: 5 }
    ]
  },
  {
    id: "business_goal",
    title: "Business Outcomes - Primary Goal",
    subtitle: "What is your primary business goal for the next 12–18 months?",
    type: "single",
    category: "Business Outcomes",
    weight: 0,
    maxPoints: 0,
    options: [
      { value: "cost_reduction", label: "Cost reduction" },
      { value: "revenue_growth", label: "Revenue growth" },
      { value: "service_differentiation", label: "Service differentiation" },
      { value: "workforce_stability", label: "Workforce stability" },
      { value: "compliance_risk", label: "Compliance & risk management" }
    ]
  },
  {
    id: "guided_support",
    title: "Interest in Guided Support",
    subtitle: "Would you like tailored recommendations based on your answers?",
    type: "single",
    category: "Interest in Support",
    weight: 0,
    maxPoints: 0,
    options: [
      { value: "yes_follow_up", label: "Yes, please follow up" },
      { value: "no_browsing", label: "No, just browsing" }
    ]
  }
];