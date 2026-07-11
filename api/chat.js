import { getRelevantKnowledge, formatKnowledgeForPrompt } from './_lib/knowledge.js';

const SYSTEM_PROMPT = `You are Erin, a Demski Group assistant.

Your ONLY purpose is to assist visitors with information related to The Demski Group, its services, solutions, case studies, technologies, consultation process, and lead qualification.

## Your Job
Your job is to understand the user's project and, over the course of a natural conversation, collect: the type of project they need, the problem they're trying to solve, whether they have an existing platform or are starting fresh, their budget, and their contact details (name, phone, email). Respond naturally to whatever the user actually says, in the order they bring it up, rather than forcing a fixed sequence. Guide the conversation toward booking a meeting once their need is understood. Use only The Demski Group's own context (this prompt and the knowledge base below) to answer, never outside/general knowledge unrelated to Demski.

## Core Identity
You are a professional, friendly, knowledgeable business consultant representing The Demski Group.
You speak naturally and conversationally.
You are NOT ChatGPT. You are NOT a general-purpose AI assistant.

## About The Demski Group
- US-based custom software development firm with 12+ years of experience and 600+ successful projects
- Headquartered in Olean, NY with offices in Cincinnati, OH and Kalispell, MT
- Phone: 406-936-3049 | Email: contact@demskigroup.com

## Knowledge Base
A "## Relevant Knowledge For This Question" section may be appended below this prompt for a given message — it contains real case studies, company facts, process details, pricing approach, and services pulled from a knowledge base that grows over time. When present, treat it as ground truth and answer from it directly, citing client names/quotes/results naturally rather than vaguely. When it's NOT present for a question that needs specifics you don't have (a client/industry/detail not covered), say something like "I don't have that specific detail in front of me, but our team can cover it on a quick call" rather than inventing facts.

## Conversation Priority
You are reached at this point specifically because the visitor asked a real question, described their project in their own words, or said something that isn't a simple menu pick. Respond the way an experienced consultant would on a discovery call, not like a form collecting inputs:
1. Acknowledge what they actually said first, in your own words, specific to their message. Never open with a stock phrase like "Great question!", "That's a great point!", or "I'd be happy to help!" on every reply, vary it or skip a lead-in entirely.
2. Answer what they actually asked, directly and specifically, using the knowledge base when it's relevant, and add brief expert framing when it helps (e.g. what an "ERP system" or "automation" can actually span, what's typical at their stage) so you read as someone who knows the space, not just someone collecting answers. This is never skipped or rushed past.
3. Keep the conversation's context in mind: don't repeat yourself, don't ask something already answered earlier in the conversation, and mirror the visitor's own wording/terminology naturally instead of restating it in generic phrasing.
4. If the visitor signals uncertainty ("not sure", "I don't know yet", "haven't decided", "still exploring", "just looking"), lead with brief, genuine reassurance that this is normal before anything else, never just re-ask the same question at them.
5. Only after genuinely answering (and reassuring, if relevant), you may add exactly ONE short, natural follow-up question that moves the conversation forward, if it fits naturally, written like a person would actually ask it, never two or more questions stacked in the same reply. If it's not obvious why you're asking something, especially budget or timeline, briefly say why in one clause (e.g. "I ask because a $10k project and a $500k platform get planned very differently") instead of asking cold. If the visitor asks several questions in a row, keep answering them in conversation mode rather than forcing a follow-up onto every single reply.
Never respond with just a bare qualifying question and no real answer. Never make the reply feel like a form field or an interrogation, you are a consultant having a conversation.
You are a senior consultant, not customer support and not a general AI assistant. Sound like someone who has spent years scoping and building software: confident, relaxed, practical, never overly polished or corporate. When a visitor declines to share something, acknowledge it once, briefly, and move the conversation forward, never re-ask for the same thing in different words a moment later. When a conversation is genuinely winding down (the visitor thanks you, says they're all set, or has nothing left to ask), close warmly and simply rather than pushing harder or repeating what's already been covered.

## Services & Solutions
Custom Software Development, Mobile App Development (iOS & Android), CRM Development & Optimization, SaaS Platform Development, AI & Automation Solutions, Business Process Automation, Workflow Automation Solutions, Sales & Lead Tracking Tools, Custom Business Dashboards, Digital Transformation Strategy, Technology Consulting for SMBs, eCommerce Development, Customer Self-Service Portals, Data Decision Tools, Employee Scheduling & Time Tracking, Inventory Management Systems, Operations & Logistics Software, Paid Media Management, Cloud Solutions & Integrations.

## Your Objectives
1. Help visitors understand Demski services
2. Answer questions about software development and business solutions
3. Recommend relevant services based on their needs
4. Qualify leads by understanding their project
5. Naturally collect: what they're building, budget range
6. Guide users toward booking a free consultation
7. Increase conversion into qualified leads

## Lead Qualification (ask naturally, one at a time)
When someone shows interest, gather:
- What type of solution are they looking to build?
- What business problem are they solving?
- Do they have an existing platform or starting fresh?
- What budget range are they considering?

## Allowed Topics
The Demski Group, Custom Software, Mobile Apps, SaaS, AI Solutions, Automation, Digital Transformation, Cloud, Technology Consulting, Case Studies (by name or topic, e.g. "FlowerMoxie", "Biopac"), Clients Worked With, Industries Served, Development Process, Project Timelines, Team Members and Leadership (by name, e.g. Andrew Demski, Aaron Demski), Team Capabilities, Past Projects and Work History, Integrations, Pricing Discussions, Discovery Calls, Consultation Booking.

## Forbidden Topics
Movies, TV, Celebrities, Sports, Politics, Religion, Medical Advice, Legal Advice, Personal Advice, Homework, General Coding Tutorials, Recipes, Travel, Cryptocurrency, General Internet Questions, anything unrelated to The Demski Group.

## Off-Topic Response
"I'm here specifically to help with The Demski Group's services and solutions. If you have a question about software development, AI solutions, automation, or working with Demski, I'd be happy to help!"

## Lead Collection Trigger
When the user is clearly interested, asks to be connected with someone, asks for a callback, or you've otherwise qualified their need, acknowledge naturally (e.g. "I'd love to connect you with our team, let me grab a few details so they can reach out.") but do NOT ask for their name, phone, or email yourself, the widget's own validated flow handles that. See the [[COLLECT_CONTACT]] marker rule below when a qualification question is active.

## Communication Style
- Professional, helpful, human, concise, business-focused, conversational
- Avoid robotic responses and large paragraphs
- Prefer short, natural responses (2-4 sentences max per reply)
- Vary your sentence openings and phrasing turn to turn, don't reuse the same template or stock opener (e.g. "Great question!") on every reply. Write each answer like you're actually thinking about that specific message, not filling in a form letter. This applies across different conversations too, two different visitors asking near-identical questions should not get back near-identical wording.
- A little natural, warm, non-offensive humor or personality is welcome when it genuinely fits the moment (never forced, never sarcastic toward the visitor, never used on serious or sensitive topics)
- Never invent company information
- If info unavailable: "Our team would be happy to cover that on a consultation call."
- Never use the em dash character (—) anywhere in your replies. Use a comma, period, or rephrase instead.
- Never use Markdown formatting: no **bold**, *italics*, # headings, bullet markers like - or *, backticks, or [link](url) syntax. The chat UI displays raw text exactly as written, so Markdown characters would show up literally to the user. Write plain conversational sentences; for multiple items, use plain numbered sentences or natural prose instead of a Markdown list.

## Ultimate Rule
Always remain a Demski Group business assistant. Never act as a general AI. Redirect off-topic back to Demski services.`;

// Canonical intent/budget taxonomy — mirrors widget.js's INTENT_OPTIONS and
// showBudgetStep's 5 budget buttons exactly. Duplicated here (this is a
// separate serverless file with no shared import path to widget.js) so the
// always-on turn-signal extraction below can map free text to the *exact*
// bucket strings the widget's own state machine expects, the same way
// formatStepContext's option-matching already does for an explicitly open
// step. Must be kept in sync with widget.js if either list ever changes.
const INTENT_TAXONOMY = {
  'New startup or app idea':   ['Mobile App', 'Web App', 'SaaS Platform', 'eCommerce', 'Other'],
  'Software for my business':  ['Automate Workflows', 'Customer Management', 'Reporting & Analytics', 'Employee Tools', 'Other'],
  'Digital marketing help':    ['Increase Website Traffic', 'Generate More Leads', 'Social Media Growth', 'Paid Advertising', 'Other'],
  'Just exploring':            ['Planning a Future Project', 'Comparing Vendors', 'Learning About Tech', 'Just Curious'],
};
const BUDGET_TAXONOMY = ['Under $10k', '$10k - $25k', '$25k - $50k', '$50k+', 'Not sure yet'];

// stepContext shape: { question: string, options: string[], hint?: string }
// Tells the model what qualification question is currently active (if
// any) so it can decide whether the user's message already answered it,
// without forcing the widget to fall back to a separate classifier call.
// `hint` is optional: a medium-confidence guess the visitor already dropped
// earlier (see formatTurnSignalInstructions' intentHint/budgetHint) that
// this same question can be softly confirmed against instead of asked cold.
function formatStepContext(stepContext) {
  if (!stepContext || !stepContext.question) return '';
  const optionsText = Array.isArray(stepContext.options) && stepContext.options.length
    ? ' The options being offered as shortcuts are: ' + stepContext.options.map((o) => '"' + o + '"').join(', ') + '.'
    : '';
  const hintText = stepContext.hint
    ? ' One more thing: earlier in the conversation the visitor gave a partial signal here ("' + stepContext.hint + '"), not confirmed yet. If it fits naturally, phrase this question as a soft confirmation of that instead of asking cold (e.g. "Sounds like this might lean toward inventory tracking, is that the right direction, or something else?"), but don\'t force it if it doesn\'t fit this turn.'
    : '';
  return '\n\n## Current Qualification Question\n' +
    'The widget is currently waiting on an answer to: "' + stepContext.question + '"' + optionsText + hintText +
    ' Always answer/acknowledge what the user actually said first, naturally, like a real consultant would, before anything else. ' +
    'Then decide which ONE of these situations applies, and end your reply with exactly one machine-readable marker reflecting it, on its own at the very end, never described or explained in the visible text:\n' +
    '1. Their message answers the current question and clearly maps to one of the listed options: end with [[STEP_ANSWERED:exact option text]], copied exactly as given above.\n' +
    '2. Their message answers the current question in their own words but does not map to any listed option: end with [[STEP_ANSWERED:]] (empty).\n' +
    '3. Their message does NOT answer the current question, but you did NOT ask your own new specific question in reply (e.g. you just answered an unrelated question, or made a general comment): end with [[STEP_NOT_ANSWERED]] — the widget will re-show the original option buttons since the current question is still open.\n' +
    '4. Their message does NOT answer the current question, AND your reply itself asks the user something new and specific that needs a typed answer, BUT it is NOT about getting their name/phone/email (e.g. asking what platform they currently use): end with [[REDIRECTED]] — the widget will wait for a typed reply to YOUR new question instead of showing the original option buttons.\n' +
    '5. The current question is asking for the user\'s name, phone number, or email, AND their message is an explicit refusal to provide it OR a statement that it doesn\'t exist for them (any wording: "I don\'t want to give that", "I\'d rather not say", "that\'s private", "I refuse", "I don\'t have an email", "I dont have phone", "I don\'t have one", typos and all, etc.) OR a hostile/dismissive non-answer ("shut up", "go away", "none of your business", "whatever", etc.) rather than a genuine attempt at an answer: end with [[REFUSED]] instead of any other marker, even if your visible reply is empathetic/understanding in tone, and even if your visible reply already offers an alternative like contacting by phone instead. Treat "I don\'t have an X" exactly the same as "I won\'t give you my X" for this marker, since the practical effect for the widget is identical (it must stop asking for that field), and never follow an empathetic acknowledgment of a missing/refused field with a sentence that asks for that same field again, that contradiction is exactly what this marker prevents. This is the single most important case to get right on this question, because the widget uses it to stop re-asking and move the conversation forward instead of looping — a refusal or hostile dismissal must NEVER be classified as [[STEP_ANSWERED:...]] (never store it as if it were their actual name/phone/email) and must NEVER be left as plain [[STEP_NOT_ANSWERED]] either (that just re-asks the same question again, which is exactly the loop this marker exists to prevent).\n' +
    '6. The user wants to be connected with the team, asked for contact/a callback, or otherwise made it clear it is time to collect their contact details (e.g. "can someone contact me", "can you connect me with somebody", "I\'d like to talk to someone"): do NOT ask for their name/phone/email yourself in the visible text at all, just acknowledge naturally (e.g. "Of course, let me grab a few details so our team can reach out.") and end with [[COLLECT_CONTACT]] instead — the widget itself will take over asking for name, phone, and email one at a time through its own validated flow, skipping any of those three it may already have on file. Never ask for name, phone, or email yourself in the visible reply text under any circumstance, even if the user offers it unprompted — always defer to the widget via [[COLLECT_CONTACT]].\n' +
    'This marker is REQUIRED on every single reply while a qualification question is active, with no exceptions, even for short replies, off-topic answers, or replies that just answer a factual question. Forgetting it causes the widget to show the wrong buttons to the user, which is a visible bug. Double-check before finishing your reply that it ends with exactly one of [[STEP_ANSWERED:...]], [[STEP_NOT_ANSWERED]], [[REDIRECTED]], [[REFUSED]], or [[COLLECT_CONTACT]].';
}

// Always appended (independent of stepContext) so the widget can capture
// whatever a visitor volunteers in their own words, anywhere in the
// conversation, not only while that field's own qualification step happens
// to be open, and can react to two soft signals (needsOptions,
// readyForContact) that don't belong to any single field. See widget.js's
// applyInferredLeadInfo, which merges the result into the lead object
// (re-validated locally, never trusted as-is) and lets any step skip a
// field already known this way instead of asking again — closing the "the
// bot doesn't remember what I just told it" gap.
function formatTurnSignalInstructions() {
  const intentTaxonomyText = Object.entries(INTENT_TAXONOMY)
    .map(([intent, details]) => '"' + intent + '" (sub-types: ' + details.map((d) => '"' + d + '"').join(', ') + ')')
    .join('; ');
  const intentKeysText = Object.keys(INTENT_TAXONOMY).map((i) => '"' + i + '"').join(', ');
  const budgetKeysText = BUDGET_TAXONOMY.map((b) => '"' + b + '"').join(', ');
  return '\n\n## Turn Signal (always required)\n' +
    "Independent of anything else above, silently consider the visitor's latest message (and the conversation so far, for contact info) for anything worth remembering, then end your reply with ONE marker capturing what you found, in this exact form: [[TURN_SIGNAL:{...}]], including only the keys you actually have something for (omit the rest, and omit the marker entirely if there's truly nothing new). It is never visible to the user and must never be described in the visible text of your reply. It does not need to be in any particular position relative to any other required marker.\n" +
    '\n### Contact info\n' +
    "If the visitor gives their OWN name, phone number, email, or company as an ordinary statement, not a refusal, not someone else's, not a hypothetical, include it verbatim under \"name\"/\"phone\"/\"email\"/\"company\".\n" +
    '\n### Project type & budget, be confident, not eager\n' +
    'Treat this like a consultant who only writes down what they actually heard, never what they\'re guessing:\n' +
    '- HIGH CONFIDENCE, the visitor stated it plainly ("I need an ERP system", "budget is around $80k", "we\'re replacing our current CRM"): map it to the closest exact match and include it under "intent" (one of: ' + intentKeysText + '), "intentDetail" (one of that intent\'s own sub-types: ' + intentTaxonomyText + '), and/or "budget" (one of: ' + budgetKeysText + '). Once you are this confident, never ask a question whose answer you already hold this way, that repetition is exactly what makes a chatbot feel like a form.\n' +
    '- MEDIUM CONFIDENCE, a partial or vague-but-suggestive hint ("something for inventory", "probably next year", "leaning toward automating things but not sure yet"): do NOT put this under "intent"/"intentDetail"/"budget", you are not sure enough to lock it in. Instead include it as short freeform text under "intentHint" and/or "budgetHint" so it can be confirmed naturally later instead of forgotten or asked cold.\n' +
    '- LOW CONFIDENCE, too vague to act on ("need software", "not sure"): include nothing for that field. Never guess just to fill it in.\n' +
    '\n### Options / uncertainty signal\n' +
    'Include "needsOptions": true only when the visitor is explicitly unsure, asks what their options are, asks for examples, or says something like "I don\'t know" or "can you give me some choices". This is NOT the default, omit this key entirely on a normal reply. It tells the widget this is a good moment to offer a quick-pick button list instead of continuing purely as free text.\n' +
    '\n### Ready for contact\n' +
    'Include "readyForContact": true when the conversation has genuinely reached a natural close and the visitor seems ready to be connected with the team RIGHT NOW, judge this by intent, not by keyword. A message that is satisfied and has nothing left to ask ("thanks, that\'s really helpful", "sounds great, that answers it") qualifies. A message that merely contains a polite word but also asks or implies something else ("thanks, what about pricing though?") does NOT qualify, the conversation isn\'t actually over. This is broader than, and independent of, the [[COLLECT_CONTACT]] marker described elsewhere for an explicit "connect me with someone" ask, use this one for the softer, inferred case, including when no qualification question is currently open at all.\n' +
    '\n### Conversation ending / deferring\n' +
    'Include "conversationEnding": true when the visitor is stepping away or deferring rather than continuing right now, this is DIFFERENT from readyForContact above (which means ready to move forward immediately) — this one means the opposite, they are pausing. Examples: "I\'ll talk about it later", "maybe later", "I\'ll think about it", "not right now", "I\'ll come back", "that\'s enough for now", "I\'ll reach out", "I need some time", "I have to go", "I\'ll review it first", or similar. Never set both readyForContact and conversationEnding on the same reply, they are mutually exclusive. When you set this, your own visible reply must acknowledge it warmly and briefly (per the Conversation Priority section above: no rush, happy to continue whenever they\'re ready) and must NOT ask another project/qualification question, the discovery part of the conversation is over regardless of how much was covered. The widget takes over from there.';
}

// Finds and strips a [[TURN_SIGNAL:{...}]] marker (see
// formatTurnSignalInstructions) ANYWHERE in the raw text, not anchored to
// the end, so it's extracted correctly regardless of whether the model
// places it before or after the separate step-answer marker
// extractStepSignal looks for below — leaving everything else in the
// string untouched for that function to process exactly as it did before
// this existed. Parses the captured JSON defensively: a malformed or
// missing marker, or one with unexpected keys/shapes, just yields nulls (a
// no-op for the caller), since the model's own judgment is never trusted
// directly for what gets stored, only used to notice that something was
// said — widget.js's applyInferredLeadInfo re-validates every value with
// the same local checks used everywhere else before it's ever written to
// the lead object (intentDetail's cross-check against the current intent
// specifically happens there, not here, since only the widget knows the
// visitor's already-confirmed intent from earlier turns).
function extractTurnSignal(raw) {
  const empty = { text: raw, leadInfo: null, hints: null, needsOptions: false, readyForContact: false, conversationEnding: false };
  const match = raw.match(/\[\[TURN_SIGNAL:(\{[\s\S]*?\})\]\]/i);
  if (!match) return empty;
  const text = (raw.slice(0, match.index) + raw.slice(match.index + match[0].length)).replace(/[ \t]{2,}/g, ' ').trim();
  let parsed;
  try {
    parsed = JSON.parse(match[1]);
  } catch (e) {
    return { ...empty, text };
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ...empty, text };
  }

  const leadInfo = {};
  for (const key of ['name', 'phone', 'email', 'company']) {
    if (typeof parsed[key] === 'string' && parsed[key].trim()) {
      leadInfo[key] = parsed[key].trim().slice(0, 200);
    }
  }
  if (typeof parsed.intent === 'string' && INTENT_TAXONOMY[parsed.intent.trim()]) {
    leadInfo.intent = parsed.intent.trim();
  }
  if (typeof parsed.intentDetail === 'string' && parsed.intentDetail.trim()) {
    leadInfo.intentDetail = parsed.intentDetail.trim().slice(0, 80);
  }
  if (typeof parsed.budget === 'string' && BUDGET_TAXONOMY.includes(parsed.budget.trim())) {
    leadInfo.budget = parsed.budget.trim();
  }

  const hints = {};
  if (typeof parsed.intentHint === 'string' && parsed.intentHint.trim()) hints.intent = parsed.intentHint.trim().slice(0, 160);
  if (typeof parsed.budgetHint === 'string' && parsed.budgetHint.trim()) hints.budget = parsed.budgetHint.trim().slice(0, 160);

  // Defensive mutual exclusivity, even though the prompt already says never
  // to set both: if the model does anyway, prefer backing off
  // (conversationEnding) over pushing forward (readyForContact) — the
  // safer default when the signal is ambiguous.
  const conversationEnding = parsed.conversationEnding === true;
  const readyForContact = !conversationEnding && parsed.readyForContact === true;

  return {
    text,
    leadInfo: Object.keys(leadInfo).length ? leadInfo : null,
    hints: Object.keys(hints).length ? hints : null,
    needsOptions: parsed.needsOptions === true,
    readyForContact,
    conversationEnding,
  };
}

// Strips the [[STEP_ANSWERED:...]] / [[STEP_NOT_ANSWERED]] / [[REDIRECTED]] /
// [[REFUSED]] / [[COLLECT_CONTACT]] marker the model was asked to append
// (see formatStepContext) and converts it into { stepAnswered, matchedOption,
// redirected, collectContact, refused } the widget can act on directly. All
// fields are null when no stepContext was sent for this request — nothing to
// extract.
function extractStepSignal(raw, hadStepContext) {
  if (!hadStepContext) return { reply: raw.trim(), stepAnswered: null, matchedOption: null, redirected: null, collectContact: null, refused: null };
  const answeredMatch = raw.match(/\[\[STEP_ANSWERED:([^\]]*)\]\]\s*$/i);
  if (answeredMatch) {
    const option = answeredMatch[1].trim();
    return { reply: raw.replace(answeredMatch[0], '').trim(), stepAnswered: true, matchedOption: option || null, redirected: false, collectContact: false, refused: false };
  }
  const collectContactMatch = /\[\[COLLECT_CONTACT\]\]\s*$/i;
  if (collectContactMatch.test(raw)) {
    return { reply: raw.replace(collectContactMatch, '').trim(), stepAnswered: false, matchedOption: null, redirected: true, collectContact: true, refused: false };
  }
  // Checked before STEP_NOT_ANSWERED/REDIRECTED: a refusal/hostile dismissal
  // is its own outcome, not a generic "still open" or "asked something
  // else" — conflating it with either one is exactly how the widget ends up
  // silently re-asking the same name/phone/email question forever after an
  // explicit refusal (the bug this marker exists to close, on top of the
  // widget's own local regex/keyword refusal detection — this is the
  // second line of defense for phrasing the local heuristics don't
  // recognize).
  const refusedMatch = /\[\[REFUSED\]\]\s*$/i;
  if (refusedMatch.test(raw)) {
    return { reply: raw.replace(refusedMatch, '').trim(), stepAnswered: false, matchedOption: null, redirected: false, collectContact: false, refused: true };
  }
  const redirectedMatch = /\[\[REDIRECTED\]\]\s*$/i;
  if (redirectedMatch.test(raw)) {
    return { reply: raw.replace(redirectedMatch, '').trim(), stepAnswered: false, matchedOption: null, redirected: true, collectContact: false, refused: false };
  }
  const notAnsweredMatch = /\[\[STEP_NOT_ANSWERED\]\]\s*$/i;
  if (notAnsweredMatch.test(raw)) {
    return { reply: raw.replace(notAnsweredMatch, '').trim(), stepAnswered: false, matchedOption: null, redirected: false, collectContact: false, refused: false };
  }
  // Model didn't include a marker at all — happens often enough with
  // gpt-4o-mini that the widget cannot depend on the marker being present.
  // Restored to the QA-approved bias: when we can't prove what happened,
  // default to treating the question as STILL OPEN (same as
  // [[STEP_NOT_ANSWERED]]) so the MCQ buttons reliably reappear. The
  // alternative (defaulting to redirected:true) was tried and caused the
  // qualification flow to silently stall into open-ended chat mode on
  // every marker omission, which is the more damaging failure mode for a
  // guided-qualification widget — a visible "still here, options below"
  // beats a silent dead end.
  return { reply: raw.trim(), stepAnswered: false, matchedOption: null, redirected: false, collectContact: false, refused: false };
}

// Backstop for the "never use Markdown" rule in SYSTEM_PROMPT — the widget
// renders bot text via createTextNode (see widget.js's buildBotMsgBubble),
// never innerHTML, so Markdown syntax is never parsed into formatting; it
// shows up as literal asterisks/hashes/backticks to the user instead. The
// prompt instruction stops most of it at the source, but gpt-4o-mini still
// drifts into Markdown often enough (lists, bold phrases) that this mirrors
// the existing em-dash strip below: a deterministic guarantee on top of the
// prompt instruction, not a replacement for it. Order matters — bold/italic
// markers are stripped before list markers so a literal list bullet like
// "* Discovery phase" (a single, unpaired asterisk) is never mistaken for
// the opening half of an *italic* span.
function stripMarkdown(text) {
  return text
    // ***bold italic***, ___bold italic___
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/___(.+?)___/g, '$1')
    // **bold**, __bold__
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // *italic*, _italic_ — only matches a genuine pair on the same line, so
    // an unpaired list-bullet asterisk at the start of a line is untouched.
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/(?<![a-zA-Z0-9])_(.+?)_(?![a-zA-Z0-9])/g, '$1')
    // # / ## / ### headings
    .replace(/^#{1,6}\s+/gm, '')
    // fenced and inline code
    .replace(/```[\s\S]*?```/g, function (m) { return m.replace(/```/g, '').trim(); })
    .replace(/`([^`]+)`/g, '$1')
    // [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // leading -, *, + list markers (after emphasis stripping, so this only
    // ever matches a real bullet, never a leftover italic delimiter)
    .replace(/^[ \t]*[-*+]\s+/gm, '')
    // blockquote markers
    .replace(/^>\s+/gm, '')
    .trim();
}

export default async function handler(req, res) {
  // CORS preflight: the widget may be served from a different origin than
  // this API (e.g. embedded via the standalone widget domain), which makes
  // the browser send an OPTIONS preflight before the real POST. Without
  // this, the preflight gets a 405 and the browser blocks the POST,
  // producing a silent failure with no reply ever received.
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { messages, stepContext } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  try {
    // Retrieval: pull the most relevant knowledge-base entries for the
    // latest user message and append them to the system prompt for this
    // request only — keeps token usage proportional to relevance, not to
    // the total size of the knowledge base, and lets the KB grow to
    // hundreds of entries without bloating every request.
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const relevantEntries = lastUserMessage ? getRelevantKnowledge(lastUserMessage.content) : [];
    const knowledgeBlock = formatKnowledgeForPrompt(relevantEntries);

    // stepContext lets the widget ask, in addition to a normal reply,
    // "did this message already answer the current qualification
    // question?" — so the widget can skip re-showing that step's MCQ
    // buttons when the user already answered it in their own words,
    // instead of always showing them regardless of context.
    const stepBlock = formatStepContext(stepContext);
    const turnSignalBlock = formatTurnSignalInstructions();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + knowledgeBlock + stepBlock + turnSignalBlock },
          ...messages,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const rawFull = data.choices?.[0]?.message?.content || '';
    const { text: rawAfterTurnSignal, leadInfo, hints, needsOptions, readyForContact, conversationEnding } = extractTurnSignal(rawFull);
    const { reply, stepAnswered, matchedOption, redirected, collectContact, refused } = extractStepSignal(rawAfterTurnSignal, !!stepContext);
    return res.status(200).json({ reply: stripMarkdown(reply.replace(/—/g, ',')), stepAnswered, matchedOption, redirected, collectContact, refused, leadInfo, hints, needsOptions, readyForContact, conversationEnding });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
