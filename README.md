## 🚀 Live Demo & Testing

To see the dashboard in action, you can use the live link below:

* **Link to test:** [https://dashboard-tickets-azure.vercel.app/](https://dashboard-tickets-azure.vercel.app/)
* **Test Data:** Use the `simulacao_tickets_atendimento.csv` file available in this repository to test the link above.

**Customer Support Intelligence: A Real-World Problem-Solving Case Study (2017 Simulation)**

📊 **Project Context & Origin**
This project is a high-fidelity simulation of a strategic delivery I led in 2017 as a Support Team Coordinator for a major global mobility company. 
At the time, I managed a team of 60 people, 40 of whom were dedicated to solving a specific operational bottleneck during a period of aggressive global expansion.
The goal of this repository is to demonstrate how a data-driven framework can solve complex operational crises. The "Vibe Coding" approach used here simulates the analytics tool that would have scaled our decision-making process at that time.
🧠 The 6-Step Problem-Solving Framework

**1. Problem Definition**
The company was experiencing explosive growth (doubling trip volume month-over-month). This created a massive ticket backlog that shattered response SLAs, caused operational stress, and severely damaged the customer experience.

**2. Data Collection**
With over 350 analysts potentially receiving these tickets but only my specialized team of 40-60 being able to resolve them, we implemented a centralized data collection system. We tracked every case via a complex data pipeline (simulated here) involving owed amounts, contact dates, driver IDs, and more.

**3. Impact on Key Performance Indicators (KPIs)**
The data revealed a critical correlation: the high backlog was driving SLA response times to over 15 business days. This directly impacted Driver Engagement (drivers stopped logging in or taking rides until they were paid) and plummeted CSAT scores. The process that worked for a small volume was failing under the weight of hyper-growth.

**4. Data Visualization**
Data was organized into actionable dashboards to identify trends. This was made using Google Sheets at 2017. While this GitHub project focuses on financial and volume KPIs, the full strategic analysis (anonymized for privacy) can be found in the presentation below:

👉 **Deep Dive:** https://docs.google.com/presentation/d/e/2PACX-1vTL46COnk196H5Kn1WFWfk4IuVaBi-mGwyhsf2HqOkwy-CwV6u5P54h4vl8FDcD5OMuNqoVdtOk8SR3/pub?start=false&loop=true&delayms=10000

**5. Hypothesis & Rapid Testing**
We tested several hypotheses:
Scaling Headcount: Not scalable due to cost and too slow for our needs.
Improving Process Efficiency: Even if every analyst performed like the top 10%, we couldn't beat the growth rate.
The Winning Hypothesis: Automated approval for cases under R$ 100.
  The Logic: These cases represented 80% of ticket volume but only 50% of financial value.
  The Risk: We validated a human error/fraud rate of only 3% via sampling. Accepting this 3% error was significantly cheaper than the cost of hiring and training enough analysts to clear the 80% volume.
  Efficiency: Analyzing an R$ 1 case took the same time as an R$ 1,000 case. By automating the small ones, analysts could focus on high-value/high-risk cases.

**6. Monitoring & Feedback Loops**
Post-implementation, we monitored:
  Error Rates: Weekly sampling to prevent fraud patterns.
  Repeat Offenders: Tracking the 4% rate of recurring issues to spot bad actors.
  Results: After a couple of weeks, the SLA dropped from 15+ business days to under 1 business day, often resulting in real-time payments and restored driver trust.

💻 **Technical Simulation: The "Vibe Coding" Process**

This project utilizes Python and React to simulate the tool that would have automated this analysis in 2017.

**Tech Stack & Justification**

Python (Pandas): Chosen for its speed in "Data Engineering." It generated a synthetic dataset of 50,000 rows that accurately mimics the 80/20 distribution and 4% user recurrence mentioned in the case study.

React.js & Recharts: Used to create a real-time "Analytics Cockpit." This allows a manager to upload a raw CSV and instantly see the Pareto distribution and financial trends.

**Development Iterations**

The project was built using an iterative AI-assisted process:

Scope Definition: Moving from a simple data script to a full interactive dashboard.

Data Integrity: Adjusting the Python script to ensure financial sums matched the target business rules (80% volume vs 50% value).

Environment Fixes: Resolving technical hurdles in the StackBlitz/Vite environment, including dependency management (Recharts/Lucide) and path resolution for a seamless portfolio preview.

UI/UX Refinement: Implementing Tailwind CSS to ensure the dashboard looks like a professional enterprise tool.

📬 **Portfolio**

InfoDeveloper: Eduardo Duarte e Araujo

AI Tool: Gemini Pro (with Canvas tool)

Role in Case Study: Team Coordinator (2017)

Status: Simulation Complete / Case Study Verified

Disclaimer: All data shown in this tool is synthetic and generated via Python to demonstrate the methodology without compromising sensitive historical information.
