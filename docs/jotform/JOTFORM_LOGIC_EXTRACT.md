# Jotform Logic Extract (Fall 2025 Source)

- Source archive: `Generator Buildathon Registration Fall 2025.zip`
- Source form file: `The_Generator_Buildathon_Registration_-_Fall_2025.html`
- Purpose: preserve all registration branching/visibility logic for Spring 2026 planning.

## Core Registration Paths

- **Spectator path**: skips team-building pages and disables/unrequires most team and skill fields.
- **Individual path**: hides pre-formed-team details and jumps to AI/skills matching page.
- **Team path**: hides individual-only questions and jumps directly into team details page.
- **Partial team signal**: field for teams that still need members toggles follow-up criteria field visibility.

## Condition Decision Table (JotForm.setConditions)

| # | Type | When | Action(s) |
|---|---|---|---|
| 0 | page | Q6 - Are you registering as an individual or as a team? * equals 'SPECTATOR (FOR FACULTY, SPONSORS, JUDGES, PARENTS, ETC)' | skipTo -> page-4 |
| 1 | require | Q6 - Are you registering as an individual or as a team? * equals 'SPECTATOR (FOR FACULTY, SPONSORS, JUDGES, PARENTS, ETC)' | Disable Q24 - What is your team's collective experience with AI? (Select all that apply) *; Disable Q23 - Email - Additional Team Member 4 (please use their college .edu email) *; Disable Q22 - Full Name - Additional Team Member 4 *; Disable Q21 - Email - Additional Team Member 3 (please use their college .edu email) *; Disable Q19 - Email - Additional Team Member 2 (please use their college .edu email) *; Disable Q20 - Full Name - Additional Team Member 3 *; Disable Q18 - Full Name - Additional Team Member 2 *; Disable Q17 - Email - Additional Team Member 1 (please use their college .edu email) *; Disable Q27 - How many more team members do you want to be matched with? *; Disable Q26 - Does your team need any additional members? *; Disable Q40 - Which theme(s) is your team interested in?? (We'll use this for room judge balancing + matching) *; Disable Q24 - What is your team's collective experience with AI? (Select all that apply) *; Disable Q16 - Full Name - Additional Team Member 1 *; Disable Q15 - How many additional team members do you have? (not including yourself) - *Reminder, teams are restricted to 5 members maximum. Make sure you enter the additional members information in the following questions. If you do not, they will not be placed on your team. *; Unrequire Q12 - Any specific project ideas or interests you'd like potential teammates to know about?; Disable Q11 - Which theme are you most interested in? (We'll use this for team matching) *; Disable Q10 - Which AI tools or platforms are you familiar with? (Select all that apply) *; Disable Q9 - AI Experience Level * |
| 2 | field | Q26 - Does your team need any additional members? * equals 'No, our team is complete' | Hide Q27 - How many more team members do you want to be matched with? * |
| 3 | field | Q26 - Does your team need any additional members? * isEmpty | Hide Q27 - How many more team members do you want to be matched with? * |
| 4 | field | Q15 - How many additional team members do you have? (not including yourself) - *Reminder, teams are restricted to 5 members maximum. Make sure you enter the additional members information in the following questions. If you do not, they will not be placed on your team. * isEmpty | HideMultiple [Q16 - Full Name - Additional Team Member 1 *, Q17 - Email - Additional Team Member 1 (please use their college .edu email) *, Q18 - Full Name - Additional Team Member 2 *, Q19 - Email - Additional Team Member 2 (please use their college .edu email) *, Q20 - Full Name - Additional Team Member 3 *, Q21 - Email - Additional Team Member 3 (please use their college .edu email) *, Q22 - Full Name - Additional Team Member 4 *, Q23 - Email - Additional Team Member 4 (please use their college .edu email) *] |
| 5 | field | Q15 - How many additional team members do you have? (not including yourself) - *Reminder, teams are restricted to 5 members maximum. Make sure you enter the additional members information in the following questions. If you do not, they will not be placed on your team. * equals '3' | HideMultiple [Q23 - Email - Additional Team Member 4 (please use their college .edu email) *, Q22 - Full Name - Additional Team Member 4 *] |
| 6 | field | Q15 - How many additional team members do you have? (not including yourself) - *Reminder, teams are restricted to 5 members maximum. Make sure you enter the additional members information in the following questions. If you do not, they will not be placed on your team. * equals '2' | HideMultiple [Q23 - Email - Additional Team Member 4 (please use their college .edu email) *, Q22 - Full Name - Additional Team Member 4 *, Q21 - Email - Additional Team Member 3 (please use their college .edu email) *, Q20 - Full Name - Additional Team Member 3 *] |
| 7 | field | Q15 - How many additional team members do you have? (not including yourself) - *Reminder, teams are restricted to 5 members maximum. Make sure you enter the additional members information in the following questions. If you do not, they will not be placed on your team. * equals '1' | HideMultiple [Q23 - Email - Additional Team Member 4 (please use their college .edu email) *, Q22 - Full Name - Additional Team Member 4 *, Q21 - Email - Additional Team Member 3 (please use their college .edu email) *, Q20 - Full Name - Additional Team Member 3 *, Q19 - Email - Additional Team Member 2 (please use their college .edu email) *, Q18 - Full Name - Additional Team Member 2 *] |
| 8 | page | Q6 - Are you registering as an individual or as a team? * equals 'I am registering as an individual (I'll be matched with others)' | hidePage -> page-3 |
| 9 | field | Q6 - Are you registering as an individual or as a team? * equals 'I am registering as an individual (I'll be matched with others)' | HideMultiple [Q14, Q15 - How many additional team members do you have? (not including yourself) - *Reminder, teams are restricted to 5 members maximum. Make sure you enter the additional members information in the following questions. If you do not, they will not be placed on your team. *, Q28 - Any additional information, questions, or special requirements we need to know?, Q27 - How many more team members do you want to be matched with? *, Q26 - Does your team need any additional members? *, Q25, Q24 - What is your team's collective experience with AI? (Select all that apply) *, Q23 - Email - Additional Team Member 4 (please use their college .edu email) *, Q22 - Full Name - Additional Team Member 4 *, Q21 - Email - Additional Team Member 3 (please use their college .edu email) *, Q20 - Full Name - Additional Team Member 3 *, Q19 - Email - Additional Team Member 2 (please use their college .edu email) *, Q16 - Full Name - Additional Team Member 1 *, Q17 - Email - Additional Team Member 1 (please use their college .edu email) *, Q18 - Full Name - Additional Team Member 2 *, Q30] |
| 10 | field | Q6 - Are you registering as an individual or as a team? * equals 'I am registering as a team (I'm signing up my entire team 4-5 people) - you can edit this form even after submission if your team changes.' | HideMultiple [Q8, Q9 - AI Experience Level *, Q10 - Which AI tools or platforms are you familiar with? (Select all that apply) *, Q11 - Which theme are you most interested in? (We'll use this for team matching) *, Q12 - Any specific project ideas or interests you'd like potential teammates to know about?, Q13] |
| 11 | page | Q6 - Are you registering as an individual or as a team? * equals 'I am registering as a team (I'm signing up my entire team 4-5 people) - you can edit this form even after submission if your team changes.' | skipTo -> page-3 |

## Field Catalog (All QIDs found in form)

| QID | Type | Required | Field Label | Options |
|---|---|---|---|---|
| 2 | control_textbox | No | Full Name * | - |
| 3 | control_textbox | No | Email Address (please use your college's .edu email) * | - |
| 4 | control_radio | No | College * | Babson; Olin; Wellesley; MIT; Harvard; Stanford; Northeastern; Brandeis; ... (+1 more) |
| 5 | control_radio | No | Year of Study * | Freshman; Sophomore; Junior; Senior; Graduate Student; Other |
| 6 | control_radio | No | Are you registering as an individual or as a team? * | I am registering as an individual (I'll be matched with others); I am registering as a team (I'm signing up my entire team 4-5 people) - you can edit this form even after submission if your team changes.; I am registering as a partial team (i'm signing up 2-3 people, but an incomplete team); SPECTATOR (FOR FACULTY, SPONSORS, JUDGES, PARENTS, ETC) |
| 9 | control_radio | No | AI Experience Level * | Beginner (I've used ChatGPT or similar tools); Intermediate (I've used AI tools for projects); Advanced (I've built or modified AI models); Expert (I've developed custom AI solutions) |
| 10 | control_checkbox | No | Which AI tools or platforms are you familiar with? (Select all that apply) * | v0.dev (Coding & Development); Lovable (Coding & Development); Bolt (Coding & Development); Gemini Command Line Coding Tool; Cursor (Coding & Development); Claude Code; Chat GPT Codex; Windsurf (Coding & Development); ... (+61 more) |
| 11 | control_radio | No | Which theme are you most interested in? (We'll use this for team matching) * | Applied Biotech Solutions: Practical Tools for Health & SustainabilityCreate practical biotechnology tools and solutions that address real-world problems in health, sustainability, and quality of life with immediate applications.; Biotech DiscoveryResearch-Driven Innovation: Develop research-driven ideas that push the boundaries of biotechnology, focusing on breakthrough innovations in healthcare, agriculture, environment, and global health equity. Focus Areas:Healthcare innovations and novel therapeutic approaches. Agricultural and environmental biotechnology solutions Global access & equity in health technologies AI-powered drug discovery and development Example Projects with Real Data: Skin cancer detection using iPhone camera images Gait analysis via phone accelerometer for neurological disorders Plant disease identification through real-time image captureVoice biomarkers for respiratory conditions using microphone data; Entrepreneurial AI for Unseen Markets: Innovating in Untapped Spaces; Open to any theme |
| 12 | control_textbox | No | Any specific project ideas or interests you'd like potential teammates to know about? | - |
| 15 | control_radio | No | How many additional team members do you have? (not including yourself) - *Reminder, teams are restricted to 5 members maximum. Make sure you enter the additional members information in the following questions. If you do not, they will not be placed on your team. * | - |
| 16 | control_textbox | No | Full Name - Additional Team Member 1 * | - |
| 17 | control_textbox | No | Email - Additional Team Member 1 (please use their college .edu email) * | - |
| 18 | control_textbox | No | Full Name - Additional Team Member 2 * | - |
| 19 | control_textbox | No | Email - Additional Team Member 2 (please use their college .edu email) * | - |
| 20 | control_textbox | No | Full Name - Additional Team Member 3 * | - |
| 21 | control_textbox | No | Email - Additional Team Member 3 (please use their college .edu email) * | - |
| 22 | control_textbox | No | Full Name - Additional Team Member 4 * | - |
| 23 | control_textbox | No | Email - Additional Team Member 4 (please use their college .edu email) * | - |
| 24 | control_checkbox | No | What is your team's collective experience with AI? (Select all that apply) * | Using AI tools (ChatGPT, Claude, etc.); Implementing AI solutions; Building/modifying AI models; Business applications of AI; No prior AI experience (That's OK!); Other |
| 26 | control_radio | No | Does your team need any additional members? * | No, our team is complete; Yes, we could use more members |
| 27 | control_textbox | No | How many more team members do you want to be matched with? * | - |
| 28 | control_textbox | No | Any additional information, questions, or special requirements we need to know? | - |
| 29 | control_button | No |  | - |
| 32 | control_text | No |  | - |
| 33 | control_text | No |  | - |
| 40 | control_radio | No | Which theme(s) is your team interested in?? (We'll use this for room judge balancing + matching) * | Applied Biotech Solutions: Practical Tools for Health & SustainabilityCreate practical biotechnology tools and solutions that address real-world problems in health, sustainability, and quality of life with immediate applications.; Biotech DiscoveryResearch-Driven Innovation: Develop research-driven ideas that push the boundaries of biotechnology, focusing on breakthrough innovations in healthcare, agriculture, environment, and global health equity. Focus Areas:Healthcare innovations and novel therapeutic approaches. Agricultural and environmental biotechnology solutions; Global access & equity in health technologies AI-powered drug discovery and development Example Projects with Real Data: Skin cancer detection using iPhone camera images Gait analysis via phone accelerometer for neurological disorders Plant disease identification through real-time image capture Voice biomarkers for respiratory conditions using microphone data; Open to any theme |
| 41 | control_radio | No | Are you registering as an individual or as a team? * | I am registering as an individual (I'll be matched with others); I am registering as a team (I'm signing up my entire team 4-5 people) - you can edit this form even after submission if your team changes.; I am registering as a partial team (i'm signing up 2-3 people, but an incomplete team) |

## High-Risk Logic to Preserve Exactly

1. Registration type branching on **Q6** (spectator vs individual vs team).
2. Teammate field reveal logic driven by **Q15** team member count (1/2/3/4).
3. Team completion gate via **Q26** + follow-up criteria in **Q27**.
4. Spectator flow hard-disables team fields and unrequires team skills to avoid accidental validation blocks.
5. Individual flow removes all team pre-form fields to force algorithmic matching path.

## Notes for Spring 2026 Port

- Keep this file as source-of-truth for conditional behavior before refactors.
- Any new schema/UI must map each affected QID to app-level fields and validation rules.
- Do not allow pre-build abuse: preserve distinction between complete teams, partial teams, and individual matching.