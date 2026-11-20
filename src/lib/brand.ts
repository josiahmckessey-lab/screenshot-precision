// User-facing names and copy shared across screens.
// Banned words (see src/test/product-rules.test.ts) must never appear in user-facing text.
// No first- or second-person words in app text: write "a person" and "people".
export const APP_NAME = "The Gift";
export const APP_TAGLINE = "A quiet library of ideas about how people change.";
export const APP_PREVIEW_TITLE = `${APP_NAME}, ${APP_TAGLINE.charAt(0).toLowerCase()}${APP_TAGLINE.slice(1)}`;
export const APP_DESCRIPTION = `${APP_TAGLINE} For adults 18 and older.`;
export const RESEARCH_LINK = "About this library";
export const RESEARCH_NOTICE = "The Gift is a wellbeing library for personal growth, not a standalone source of help.";

export const CRISIS_TEXT =
  "For someone in danger, call or text 988 (Suicide and Crisis Lifeline). For immediate danger, call 911.";

export const AGE_TEXT = "This library is for adults, 18 and older.";
export const AGE_LABEL = "18 or older";
export const AGE_STOP = "This library is only for adults, 18 and older.";
export const AGE_ACCEPTED_KEY = "daybreak-adult-v1";

export const ABOUT_TEXT =
  "This library is a collection of ideas drawn from one model of change. It is not professional care, not crisis care, and not medical advice. Questions left in the question box are saved without names or accounts and are read by a person later, not right away.";

export const TOPIC_PICTURE_LABEL = "The picture";
export const TOPIC_SENTENCE_LABEL = "In one sentence";
export const KNOW_MORE_LABEL = "Want to know more about this?";
export const DEPTH_TITLES = ["The plain why", "How it works", "Research and roots"] as const;
export const TRY_LABEL = "One small thing to try";
export const SCRIPTURE_LABEL = "For readers who want Scripture";
export const QUESTION_TITLE = "Pose a question";
export const QUESTION_TOPIC_TITLE = "Pose a question about this topic";
export const QUESTION_EXAMPLES_HEADING = "Having trouble thinking of a question? Try a few of these.";
export const QUESTION_EXAMPLES_SHUFFLE = "Show different examples";
export const QUESTION_NOTICE =
  "An automated sorter reads the typed text only to pick which pages fit. The text is then saved for a person to read later, not right away. No names or accounts. Not for emergencies. For someone in danger, call or text 988. For immediate danger, call 911.";
export const QUESTION_SENT_SHORT = "Question saved. A person will read it later, not right away.";
export const QUESTION_ERROR = "The question could not be saved. Please try again later.";
export const FIND_GUIDE = "Find a guide";
export const TOPIC_FOOTER = "This library is not professional care or crisis care.";
export const GUIDE_TEXT = "A guide is not professional care and not crisis care.";
export const QUESTION_CRISIS_TEXT =
  "If someone is in danger, call or text 988 (Suicide and Crisis Lifeline). For immediate danger, call 911.";
export const QUESTION_SEND = "Send question";
export const QUESTION_IDEAS_HEADING = "Ideas from the model that relate";
export const QUESTION_SIT_LABEL = "A question to sit with";
export const QUESTION_KNOW_MORE = "Know more";
export const QUESTION_ENDS =
  "That is where this library ends. For anything further, a guide can be reached here.";
export const QUESTION_START_OVER = "Start over";
export const ASK_ANOTHER_QUESTION = "Ask another question";
export const BACK_TO_IDEAS = "Back to the ideas";
export const BACK_TO_LIBRARY = "Back to the library";
export const NEED_MORE_TITLE = "Need more than this?";
export const NEED_MORE_TEXT = "If this is not enough, or if there is feedback to share, a message can go straight to Josiah, a guide.";
export const MESSAGE_GUIDE = "Message a guide";
export const GUIDE_MESSAGE_LABEL = "Message";
export const GUIDE_MESSAGE_TITLE = "Send a message or feedback to Josiah, a guide";
export const GUIDE_MESSAGE_PLACEHOLDER = "A message or feedback, in a few words or a few paragraphs.";
export const GUIDE_REPLY_LABEL = "An email address, only if a reply is wanted";
export const GUIDE_INCLUDE_LABEL = "Include the last question asked in the library";
export const GUIDE_MESSAGE_NOTICE = "Messages are sent to a person, who reads them later, not right away. Replies may take a few days. Not for emergencies. For someone in danger, call or text 988. For immediate danger, call 911. An email address is used only to reply and is never shown anywhere else.";
export const GUIDE_SEND_LABEL = "Send message";
export const GUIDE_RECEIVED = "Received. A person reads these later, not right away.";
export const GUIDE_SEND_ERROR = "The message could not be received. Please try again later.";
export const GUIDE_LIMIT_TEXT = "The message limit has been reached. Please try again later.";
export const GUIDE_INVALID_TEXT = "A message of 1 to 3000 characters and a valid optional email address are required.";
export const GUIDE_REPLY_INVALID = "That email address does not look complete. Check it, or leave it empty.";

// Guide page. All three contact lines are real.
export const GUIDE_TITLE = "Find a guide";
export const GUIDE_INTRO =
  "A guide is a steady person a little further along the same road, who has walked something similar and walks with another in ordinary life. A guide is not professional care and not crisis care. This library can point toward a guide. It cannot be one.";
export const GUIDE_CONTACT_LABEL = "For now, a guide can be reached here:";
export const GUIDE_NAME = "Josiah";
export const GUIDE_PHONE = "(407) 243-8448";
export const GUIDE_PHONE_HREF = "tel:+14072438448";
export const GUIDE_EMAIL = "JosiahMcKessey@proton.me";
export const GUIDE_EMAIL_HREF = "mailto:JosiahMcKessey@proton.me";
export const GUIDE_HOURS = "Replies to calls, texts, and messages may take a few days.";
export const GUIDE_CRISIS_TEXT =
  "If someone is in danger, call or text 988. For immediate danger, call 911.";
