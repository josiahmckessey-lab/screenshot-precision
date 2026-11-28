// User-facing names and copy shared across screens.
// Banned words (see src/test/product-rules.test.ts) must never appear in user-facing text.
// The library may address readers directly, but never speaks in first person.
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
export const LAMP_LABEL = "A lamp glowing on a shelf in a dark room";
export const HOME_GUIDE_TEXT = "Josiah, a guide, keeps this library. Messages are read in time, and a reply may take a few days.";
export const INSTALL_HINT_TITLE = "Keep The Gift close";
export const INSTALL_LABEL = "Add to home screen";
export const INSTALL_NOT_NOW = "Not now";
export const INSTALL_HINT_BODY = "Keep The Gift on the home screen, one tap away.";
export const INSTALL_PAGE_TITLE = "Add The Gift to a home screen";
export const INSTALL_SECTIONS = [
  { heading: "iPhone", steps: ["Open the library in Safari.", "Tap the Share button, the square with an arrow.", "Scroll down and tap Add to Home Screen.", "Tap Add."] },
  { heading: "Android", steps: ["Open the library in Chrome.", "Tap the menu, the three dots.", "Tap Install app or Add to Home screen.", "Confirm."] },
] as const;

// A quoted line the owner supplied verbatim; quotation marks are part of the text.
export const WELCOME_QUOTE = "\u201cWe are the gift, and life unwraps us.\u201d";

export const ABOUT_TEXT =
  "This library is a collection of ideas drawn from one model of change. It is not professional care, not crisis care, and not medical advice. Questions left in the question box are saved without names or accounts and are read by a person later, not right away.";

export const TOPIC_PICTURE_LABEL = "The picture";
export const TOPIC_SENTENCE_LABEL = "In one sentence";
export const KNOW_MORE_LABEL = "Want to know more about this?";
export const BACK_LABEL = "Back";
export const KEEP_READING_LABEL = "Keep reading";
export const ASK_DIFFERENT_LABEL = "Ask a different question";
export const showAllSayingsLabel = (count: number) => `Show all ${count} sayings`;
export const DEPTH_TITLES = ["The plain why", "How it works", "Research and roots"] as const;
export const TRY_LABEL = "One small thing to try";
export const SCRIPTURE_LABEL = "For readers who want Scripture";
export const SCRIPTURE_WHY_LABEL = "Why this verse fits";
export const SCRIPTURE_MORE_LABEL = "Want more verses on this topic?";
export const DEEPER_PROMPT = "Was this specific enough for you?";
export const DEEPER_FITS = "Yes, this fits";
export const DEEPER_OPEN = "Something more specific";
export const DEEPER_ACCEPTED = "Take what fits. The rest of the library stays open.";
export const DEEPER_BROWSE = "Browse the topics";
export const DEEPER_NONE = "None of these";
export const DEEPER_TRY = "One thing to try";
export const DEEPER_SURE = "How sure";
export const DEEPER_END_TITLE = "This is as far as the library goes on that question.";
export const DEEPER_END_BODY = "This library is built from one body of work and points only to that. It does not search the internet or draw on anything else. The author is sorry when a question reaches past what is here.";
export const DEEPER_REMINDER_TITLE = "A friendly reminder from the author";
export const DEEPER_REMINDER = "This is said again on purpose. A person is made to be whole, with every part of life held together as one identity, and that wholeness starts with love. Every topic in this library grows from that starting point, and a question usually reads differently when it is held from there.";
export const DEEPER_ROOM = "Choose any room and begin there.";
export const DEEPER_CARE = "A hard season in life can need more than a library can give. Professional care and the people close to a person can go where this cannot. If safety is a concern, help is available right now.";
export const DEEPER_GUIDE = "Write to a guide";
export const DEEPER_WORDS = "Words used on this page";
export const DEEPER_RELATED = "Also related";
export const DEEPER_BACK = "Back to the other sayings";
export const DEEPER_OTHER = "Other sayings on this topic";
export const QUESTION_TITLE = "Set a question down here";
export const QUESTION_TOPIC_TITLE = QUESTION_TITLE;
export const QUESTION_EXAMPLES_LINK = "Just looking around? Try a few of these";
export const QUESTION_PLACEHOLDER = "What has been on your mind?";
export const QUESTION_SHOW_OTHERS = "Show others";
export const QUESTION_HANDLED_LINK = "How this is handled";
export const QUESTION_FINDING = "Finding ideas that relate";
export const HOME_LINK_TOPICS = "Browse the topics";
export const HOME_LINK_EXAMPLES = "Try a few of these";
export const CLOSEST_SAYING_LABEL = "Closest saying";
export const IDEAS_LOOSE_FIT = "These are the nearest ideas. They may not fit exactly.";
export const IDEAS_ECHO_LABEL = "What you set down";
export const IDEAS_ECHO_END = "...";
export const LANDING_LABEL = "Where does this land?";
export const LANDING_CHOICES = [
  { id: "fits", label: "This fits", reply: "Good. A picture that fits is worth keeping. One small thing is enough for now." },
  { id: "part", label: "Part of it fits", reply: "Part is a fine place to begin. Parts can be looked at one at a time." },
  { id: "not", label: "Not quite", reply: "That is useful to know. Some ideas land and some do not. Another question may open a better door." },
  { id: "curious", label: "Just curious", reply: "Curiosity is a good reason to read. Anything here can be tried, kept, or simply thought about." },
] as const;
export const KEEP_LATER_LABEL = "Keep this for later";
export const KEPT_CONFIRMATION = "Kept on this device only. It will be waiting on the home screen.";
export const SEE_SAYINGS_LABEL = "See the sayings";
export const keptTopicLabel = (title: string) => `A small thing kept from ${title}`;
export const KEPT_QUESTION = "How did it go?";
export const KEPT_CHOICES = [
  { id: "tried", label: "Tried it", reply: "One point counts. The next one tends to be a little easier. Keeping it small is the whole trick." },
  { id: "later", label: "Not yet", reply: "That is fine. It will keep. One small go, whenever a moment shows up." },
  { id: "else", label: "Tried something else", reply: "Something that fits is the one to keep. That counts too." },
] as const;
export const KEPT_DONE = "Done";
export const KEPT_TOPIC_LINK = "Look at the topic again";
export const KEPT_PRIVACY = "If a small thing is kept for later, a note of which topic stays on this device only. It is never sent anywhere, and it is cleared once it has been answered.";
export const EXAMPLES_TITLE = "Questions to start with";
export const QUESTION_SENT_SHORT = "Question saved. A person will read it later, not right away.";
export const QUESTION_ERROR = "The question could not be saved. Please try again later.";
export const FIND_GUIDE = "Find a guide";
export const TOPIC_FOOTER = "This library is not professional care or crisis care.";
export const GUIDE_TEXT = "A guide is not professional care and not crisis care.";
export const QUESTION_CRISIS_TEXT =
  "If someone is in danger, call or text 988 (Suicide and Crisis Lifeline). For immediate danger, call 911.";
export const QUESTION_SEND = "Send";
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
export const WALK_TITLE = "Walk the whole path";
export const WALK_INTRO = "Twenty pictures, one at a time, from the first to the last. Each ends with one question and a few ways to answer. Nothing is scored, and the walk can be left at any point.";
export const WALK_BEGIN = "Begin";
export const WALK_CONTINUE = "Continue";
export const WALK_RESTART = "Start from the beginning";
export const WALK_QUESTION_LABEL = "A question";
export const WALK_NEXT = "Next";
export const WALK_READ_TOPIC = "Read this topic";
export const WALK_DONE_TITLE = "That is the whole path.";
export const WALK_DONE_TEXT = "From the first picture to the last. The path has no finish line, and nothing here needs to be completed. The best next step is often a conversation with a steady person a little further along the same road.";
export const WALK_AGAIN = "Walk it again";
export const WALK_LOAD_ERROR = "The path could not be opened. Please try again later.";
export const WALK_RETRY = "Try again";
export const WALK_PRIVACY = "If the walk is started, the number of the last picture stays on this device only. It is never sent anywhere.";
