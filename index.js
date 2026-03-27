const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  AttachmentBuilder,
  Partials,
  StringSelectMenuBuilder,
  ComponentType,
  ChannelType,
  RoleSelectMenuBuilder,
  UserSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActivityType,
  AuditLogEvent,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ThumbnailBuilder,
  SectionBuilder,
  MessageFlags
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

// ============ CONFIG FILES ============
const config = require("./config.json");
let db = (() => { try { return JSON.parse(fs.readFileSync("./database.json", "utf8")); } catch { return {}; } })();
const nsfwWords = require("./nsfwWords");
const badWordData = require("./badWords");
const badWords = badWordData.words;

// ============ CONSTANTS ============
const DEFAULT_PREFIX = "!";
const CONFESSION_PREFIX = "$";
const BOT_COLOR = 0x2B2D31;

// ============ EMOJIS ============
const EMOJIS = {
  // Status emojis
  success: '<:senable:1485900930002980914>',
  error: '<:sdisable:1485900938475475045>',
  warning: '<:sdisable:1485900938475475045>',
  info: '<:shelp:1486302541380718643>',
  loading: '<:shelp:1486302541380718643>',

  // Feature emojis
  moderation: '<:smodaration:1486305496473272421>',
  afk: '<:safk:1486303860153913365>',
  autorespond: '<:sticket:1486303342689914980>',
  autoreact: '<:sautoreact:1486303559673970728>',
  sticker: '<:ssticky:1486303773151461456>',
  media: '<:smedia:1486303935244275843>',
  reminders: '<:sreminder:1486303430979883178>',
  confession: '<:sconfession:1486304718128021544>',
  birthday: '<:sbirthday:1486304294885003275>',
  filter: '<:sfilter:1486303212884721816>',
  immune: '<:simmune:1486304025388257330>',
  utility: '<:sutility:1486304176798437448>',
  ticket: '<:sticket:1486303342689914980>',
  welcome: '<:sjoindm:1486304581309829201>',
  giveaway: '<:sgiveaway:1486302489996427274>',
  logging: '<:slogging:1486303165421850675>',
  antibot: '<:santimod:1486305042024890399>',
  antinuke: '<:santinuke:1486305633232752762>',
  antilink: '<:santilink:1486305000534839379>',
  tempvoice: '<:stempvoice:1486304114181931140>',
  levels: '<:slevel:1486305765605244928>',
  economy: '<:seconomy:1486304373104709741>',
  fun: '<:sfun:1486304227369291807>',
  automod: '<:sfilter:1486303212884721816>',
  music: '<:smusic:1486304838978375730>',
  wall: '<:swall:1486305960510226522>',
  voice: '<:svoice:1486304774264590366>',
  customroles: '<:scustomrole:1486305206202536016>',
  boost: '<:sboost:1486306196431568988>',
  buttonroles: '<:sreactionroles:1486304933404872716>',
  connectionroles: '<:scustomrole:1486305206202536016>',
  dropdownroles: '<:sreactionroles:1486304933404872716>',
  invites: '<:invites:1486304480340344925>',
  joindm: '<:sjoindm:1486304581309829201>',
  mediachannels: '<:smedia:1486303935244275843>',
  messages: '<:ssticky:1486303773151461456>',
  sticky: '<:ssticky:1486303773151461456>',
  file: '<:smedia:1486303935244275843>',
  settings: '<:sutility:1486304176798437448>',
  goodbye: '<:sjoindm:1486304581309829201>',
  counting: '<:slevel:1486305765605244928>',
  suggestions: '<:ssupport:1486305567562797076>',
  reports: '<:smodaration:1486305496473272421>',
  
  // Action emojis
  ban: '🔨',
  kick: '👢',
  mute: '🔇',
  unmute: '🔊',
  warn: '⚠️',
  lock: '🔒',
  unlock: '🔓',
  purge: '🗑️',
  slowmode: '🐌',
  
  // Other
  crown: '👑',
  star: '⭐',
  heart: '❤️',
  fire: '🔥',
  trophy: '🏆',
  medal: '🎖️',
  gift: '🎁',
  party: '🎉',
  sparkle: '✨',
  clock: '⏰',
  calendar: '📅',
  chart: '📊',
  money: '💰',
  coin: '🪙',
  gem: '💎',
  dice: '🎲',
  slot: '🎰',
  music_note: '🎵',
  microphone: '🎤',
  headphones: '🎧',
  ping: '🏓',
  link: '🔗',
  image: '<:emoji_27:1469795460851040497>',
  video: '🎬',
  audio: '🔊',
  document: '📄',
  folder: '📁',
  search: '🔍',
  edit: '✏️',
  delete: '🗑️',
  add: '➕',
  remove: '➖',
 check: '<:senable:1485900930002980914>',
  cross: '<:sdisable:1485900938475475045>',
  question: '❓',
  exclamation: '❗',
  arrow_right: '➡️',
  arrow_left: '⬅️',
  arrow_up: '⬆️',
  arrow_down: '⬇️',
  refresh: '🔄',
  home: '🏠',
  gear: '⚙️',
  wrench: '🔧',
  hammer: '🔨',
  shield: '🛡️',
  key: '🔑',
  bell: '🔔',
  muted_bell: '🔕',
  speaker: '📢',
  megaphone: '📣',
  mail: '📧',
  inbox: '📥',
  outbox: '📤',
  package: '📦',
  tag: '🏷️',
  bookmark: '🔖',
  clip: '📎',
  pushpin: '📌',
  round_pushpin: '📍',
  triangular_flag: '🚩',
  white_flag: '🏳️',
  black_flag: '🏴',
  crossed_flags: '🎌',
  label: '🏷️',
  verified: '✅',
  unverified: '❌'
};

// ============ ANTINUKE EVENTS ============
const ANTINUKE_EVENTS = [
  { id: "antibot",           label: "Antibot" },
  { id: "antiautomod",       label: "AntiAutomod Update" },
  { id: "antiban",           label: "Antiban" },
  { id: "antikick",          label: "Antikick" },
  { id: "antichannelcreate", label: "Antichannel Create" },
  { id: "antichanneldelete", label: "Antichannel Delete" },
  { id: "antichannelupdate", label: "Antichannel Update" },
  { id: "antistickercreate", label: "Antisticker Create" },
  { id: "antistickerdelete", label: "Antisticker Delete" },
  { id: "antistickerupdate", label: "Antisticker Update" },
  { id: "antiguildupdate",   label: "Antiguild Update" },
  { id: "antirolecreate",    label: "Antirole Create" },
  { id: "antiroledelete",    label: "Antirole Delete" },
  { id: "antiroleupdate",    label: "Antirole Update" },
  { id: "antiunban",         label: "Antiunban" },
  { id: "antiwebhookcreate", label: "Antiwebhook Create" },
  { id: "antiwebhookdelete", label: "Antiwebhook Delete" },
  { id: "antiwebhookupdate", label: "Antiwebhook Update" },
  { id: "antimemberupdate",  label: "Antimember Update" },
  { id: "antiemojiupdate",   label: "AntiEmoji Update" },
  { id: "antiemojicreate",   label: "AntiEmoji Create" },
  { id: "antiemojidelete",   label: "AntiEmoji Delete" },
  { id: "antiautomodcreate", label: "AntiAutomod Create" },
  { id: "antiautomoddelete", label: "AntiAutomod Delete" },
];

const EMOJI_ENABLE  = "✅";
const EMOJI_DISABLE = "❌";

function buildAntiNukeEventsMessage(guildId) {
  const events = guildData(guildId).antinuke.events || {};
  const lines = ANTINUKE_EVENTS.map(e => {
    const on = events[e.id] !== false; // default enabled
    return `${on ? "<:enable:1486743355277967460>" : "<:disable:1486743464455438500>"} **${e.label}**`;
  }).join("\n");

  return {
    content: `**Select the events you want to enable for antinuke measures:**\n${lines}`,
    components: [
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("antinuke_event_select")
          .setPlaceholder("Select events to toggle...")
          .setMinValues(1)
          .setMaxValues(ANTINUKE_EVENTS.length)
          .addOptions(ANTINUKE_EVENTS.map(e => {
            const on = events[e.id] !== false;
            return {
              label: e.label,
              value: e.id,
              emoji: on ? { id: "1486743355277967460", name: "enable" } : { id: "1486743464455438500", name: "disable" }
            };
          }))
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("antinuke_enable_all")
          .setLabel("Enable All")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("antinuke_disable_all")
          .setLabel("Disable All")
          .setStyle(ButtonStyle.Danger)
      )
    ]
  };
}

// ============ TICKET CONFIG PANEL ============
function buildTicketConfigPanel(guild, guildId, sessionId) {
  const t = guildData(guildId).ticket || {};
  const ARROW = "<a:zzz_arrow_hash:1485872093437497434>";
  const EXCL  = "<a:zzz_Exclamation:1485872115662983288>";

  const staffRole    = t.supportRole       ? `<@&${t.supportRole}>`       : "`Not set`";
  const category     = t.category          ? `<#${t.category}>`           : "`Not set`";
  const panelChannel = t.channel           ? `<#${t.channel}>`            : "`Not set`";
  const transcriptCh = t.transcriptChannel ? `<#${t.transcriptChannel}>` : "`Not set`";
  const logChannel   = t.logs              ? `<#${t.logs}>`               : "`Not set`";
  const maxTickets   = t.maxTickets ?? 5;
  const autoClose    = t.autoClose         ? `${EMOJI_ENABLE} Enabled`    : `${EMOJI_DISABLE} Disabled`;
  const dmOnClose    = t.dmOnClose !== false ? `${EMOJI_ENABLE} Enabled`  : `${EMOJI_DISABLE} Disabled`;

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId(`tkcfg_select_${sessionId}`)
    .setPlaceholder("<:ssetting:1486660331207004220> Select an option to configure...")
    .addOptions([
      { label: "Staff Role",         description: "Set the support staff role",            value: `tkcfg_staffrole_${sessionId}`,   },
      { label: "Panel Channel",      description: "Set the ticket panel channel",          value: `tkcfg_panchannel_${sessionId}`,  },
      { label: "Category",           description: "Set the ticket category",               value: `tkcfg_category_${sessionId}`,    },
      { label: "Transcript Channel", description: "Set where transcripts are sent",        value: `tkcfg_transcript_${sessionId}`,  },
      { label: "Log Channel",        description: "Set the ticket log channel",            value: `tkcfg_logchannel_${sessionId}`,  },
      { label: "Customize Panel",    description: "Edit the ticket panel embed",           value: `tkcfg_custpanel_${sessionId}`,   },
      { label: "Advanced Settings",  description: "Max tickets, auto-close, DM on close", value: `tkcfg_advanced_${sessionId}`,    },
      { label: "Deploy Panel",       description: "Send the ticket panel to the channel",  value: `tkcfg_deploy_${sessionId}`,     },
    ]);

  const dropdownRow = new ActionRowBuilder().addComponents(dropdown);

  const container = new ContainerBuilder()
    .addSectionComponents(section =>
      section
        .addTextDisplayComponents(text =>
          text.setContent(`## \uD83C\uDFAB Ticket System Configuration`)
        )
        .setThumbnailAccessory(thumb =>
          thumb.setURL(guild.iconURL({ dynamic: true }) || "https://cdn.discordapp.com/embed/avatars/0.png"))
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(
        `${ARROW} **Staff Role:** ${staffRole}${EXCL}\n` +
        `${ARROW} **Panel Channel:** ${panelChannel}${EXCL}\n` +
        `${ARROW} **Category:** ${category}${EXCL}\n` +
        `${ARROW} **Transcript Channel:** ${transcriptCh}${EXCL}\n` +
        `${ARROW} **Log Channel:** ${logChannel}${EXCL}\n` +
        `${ARROW} **Max Tickets:** \`${maxTickets}\`${EXCL}\n` +
        `${ARROW} **Auto-Close:** ${autoClose}${EXCL}\n` +
        `${ARROW} **DM on Close:** ${dmOnClose}${EXCL}`
      )
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addActionRowComponents(dropdownRow)
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(`-# Session: tkcfg_${sessionId}`)
    );

  return { container, components: [] };
}

// ============ WELCOME CONFIG PANEL ============
function buildWelcomeConfigPanel(guild, guildId, sessionId) {
  const w = guildData(guildId).welcome || {};
  const ARROW = "<a:zzz_arrow_hash:1485872093437497434>";
  const EXCL  = "<a:zzz_Exclamation:1485872115662983288>";

  const welcomeChannel = w.channel ? `<#${w.channel}>` : "`Not set`";
  const welcomeMsg     = w.message ? `\`${w.message.slice(0, 50)}${w.message.length > 50 ? "..." : ""}\`` : "`Default`";
  const embedStatus    = w.embedEnabled !== false ? `${EMOJI_ENABLE} Enabled` : `${EMOJI_DISABLE} Disabled`;
  const dmStatus       = w.dmEnabled ? `${EMOJI_ENABLE} Enabled` : `${EMOJI_DISABLE} Disabled`;

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId(`wlcfg_select_${sessionId}`)
    .setPlaceholder("Select an option to configure...")
    .addOptions([
      { label: w.enabled ? "Disable Welcome System" : "Enable Welcome System", description: w.enabled ? "Turn off welcome messages" : "Turn on welcome messages", value: `wlcfg_toggle_${sessionId}` },
      { label: "Set Channel",      description: "Set the welcome message channel",    value: `wlcfg_channel_${sessionId}`   },
      { label: "Set Message",      description: "Customize the welcome message text", value: `wlcfg_message_${sessionId}`   },
      { label: "Toggle Embed",     description: "Enable or disable embed style",      value: `wlcfg_embed_${sessionId}`     },
      { label: "Toggle DM",        description: "Enable or disable DM on join",       value: `wlcfg_dm_${sessionId}`        },
      { label: "Set DM Message",   description: "Set the DM message for new members", value: `wlcfg_dmmsg_${sessionId}`    },
      { label: "Test Message",     description: "Send a test welcome message",        value: `wlcfg_test_${sessionId}`      },
    ]);

  const dropdownRow = new ActionRowBuilder().addComponents(dropdown);

  const container = new ContainerBuilder()
    .addSectionComponents(section =>
      section
        .addTextDisplayComponents(text =>
          text.setContent(`## ${EMOJIS.welcome} Welcome System Configuration`)
        )
        .setThumbnailAccessory(thumb =>
          thumb.setURL(guild.iconURL({ dynamic: true }) || "https://cdn.discordapp.com/embed/avatars/0.png"))
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(
        `${ARROW} **Status:** ${w.enabled ? `${EMOJI_ENABLE} Enabled` : `${EMOJI_DISABLE} Disabled`}${EXCL}\n` +
        `${ARROW} **Channel:** ${welcomeChannel}${EXCL}\n` +
        `${ARROW} **Message:** ${welcomeMsg}${EXCL}\n` +
        `${ARROW} **Embed Style:** ${embedStatus}${EXCL}\n` +
        `${ARROW} **DM on Join:** ${dmStatus}${EXCL}`
      )
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(`${ARROW} **Placeholders:** \`{user}\` — Mention  •  \`{username}\` — Name  •  \`{server}\` — Server  •  \`{membercount}\` — Count${EXCL}`)
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addActionRowComponents(dropdownRow)
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(`-# Session: wlcfg_${sessionId}`)
    );

  return { container };
}

// ============ BOOST CONFIG PANEL ============
function buildBoostConfigPanel(guild, guildId, sessionId) {
  const b = guildData(guildId).boost || {};
  const ARROW = "<a:zzz_arrow_hash:1485872093437497434>";
  const EXCL  = "<a:zzz_Exclamation:1485872115662983288>";

  const boostChannel = b.channel ? `<#${b.channel}>` : "`Not set`";
  const e = b.embed || {};

  const dropdown = new StringSelectMenuBuilder()
    .setCustomId(`bstcfg_select_${sessionId}`)
    .setPlaceholder("Select an option to configure...")
    .addOptions([
      { label: b.enabled ? "Disable Boost Messages" : "Enable Boost Messages", description: b.enabled ? "Turn off boost messages" : "Turn on boost messages", value: `bstcfg_toggle_${sessionId}` },
      { label: "Set Channel",     description: "Set the boost message channel",      value: `bstcfg_channel_${sessionId}` },
      { label: "Customize Embed", description: "Edit the boost embed title/message", value: `bstcfg_embed_${sessionId}`   },
      { label: "Test Message",    description: "Send a test boost message",          value: `bstcfg_test_${sessionId}`    },
    ]);

  const dropdownRow = new ActionRowBuilder().addComponents(dropdown);

  const container = new ContainerBuilder()
    .addSectionComponents(section =>
      section
        .addTextDisplayComponents(text =>
          text.setContent(`## ${EMOJIS.boost} Boost Message Configuration`)
        )
        .setThumbnailAccessory(thumb =>
          thumb.setURL(guild.iconURL({ dynamic: true }) || "https://cdn.discordapp.com/embed/avatars/0.png"))
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(
        `${ARROW} **Status:** ${b.enabled ? `${EMOJI_ENABLE} Enabled` : `${EMOJI_DISABLE} Disabled`}${EXCL}\n` +
        `${ARROW} **Channel:** ${boostChannel}${EXCL}\n` +
        `${ARROW} **Embed Title:** ${e.title ? `\`${e.title.slice(0, 40)}\`` : "`Default`"}${EXCL}\n` +
        `${ARROW} **Embed Description:** ${e.description ? `\`${e.description.slice(0, 40)}...\`` : "`Default`"}${EXCL}`
      )
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(`${ARROW} **Placeholders:** \`{user}\` — Mention  •  \`{username}\` — Name  •  \`{count}\` — Boost count${EXCL}`)
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addActionRowComponents(dropdownRow)
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(`-# Session: bstcfg_${sessionId}`)
    );

  return { container };
}


const autoResponders = new Map();
const disabledChannels = new Set();
const autoDeleteTextOnly = new Map();
const globalAutoResponders = new Map();
const mediaDeleteLogs = new Map();
const stolenStickers = new Map();
const giveaways = new Map();
const giveawayTimeouts = new Map();
const stickyMessages = new Map();
const inviteTracking = new Map();
const tempVoiceChannels = new Map();
const customRoles = new Map();
const userCooldowns = new Map();
const snipedMessages = new Map();
const editSnipedMessages = new Map();
const musicQueues = new Map();
const channelSnipeHistory = new Map();
const channelEditHistory = new Map();
const countingChannels = new Map();
const antiNukeActions = new Map();
const spamTracker = new Map();
const ticketTranscripts = new Map();
const disabledCommands = new Map();
const embedEditorData = new Map();
const rrSessions = new Map(); // reaction role builder sessions

// Action GIFs for fun commands
const actionGifs = {
  hug: [
    "https://cdn.discordapp.com/attachments/1473568523866476645/1473608862484398171/image0.gif?ex=69c25633&is=69c104b3&hm=017a2c143293eadd2b0749a9d9df89e6b75ba3937451d0e2a8fb880181413bf5&",
    "https://cdn.discordapp.com/attachments/1473568523866476645/1473608863084318843/image1.gif?ex=69c25633&is=69c104b3&hm=021d23b4ab81d4c131432c716d5bd001834b2e81cdbf5fa7ba26045b9eb5d648&",
    "https://cdn.discordapp.com/attachments/1473568523866476645/1473608863562338324/image2.gif?ex=69c25633&is=69c104b3&hm=6cea6c06f2f0b62cf702f88281a8b201a78f8f9866b0e547ebd981f62d6459cd&",
    "https://cdn.discordapp.com/attachments/1473568523866476645/1473608864435011646/image3.gif?ex=69c25633&is=69c104b3&hm=1452e034e4fc3f06e15c6bab5fcb08c2d12a25978c4ed16c71086f08e46106e3&",
    "https://cdn.discordapp.com/attachments/1473568523866476645/1473608865055510639/image4.gif?ex=69c25633&is=69c104b3&hm=ac7e4890ed73be5f0dac2028a66d9e2e40f827552a9d03155438f5dae4281999&",
    "https://cdn.discordapp.com/attachments/1473568523866476645/1473608865512820776/image5.gif?ex=69c25633&is=69c104b3&hm=ce0d1ac6b347c9ff01f1375ba0321b7a2025af82bbd6b5592c1f177a62a8d336&",
    "https://cdn.discordapp.com/attachments/1473568523866476645/1473608866141831260/image6.gif?ex=69c25634&is=69c104b4&hm=2e3da16d8d27c6ca35bdcbf8aebfdc6e7808d7c242f2fc299d2f41ca366bb536&",
    "https://cdn.discordapp.com/attachments/1473568523866476645/1473608866972307530/image7.gif?ex=69c25634&is=69c104b4&hm=d6f4f1c282cddab2320a41d7e08a9ad01766bebab6aa4e15814602e6a1e6cc2c&",
    "https://cdn.discordapp.com/attachments/1473568523866476645/1473608867282948217/image8.gif?ex=69c25634&is=69c104b4&hm=c11626714bda27490358d80c3dc97e4839d5bd0ed5461cb4d9d1d13a61cb951e&",
    "https://cdn.discordapp.com/attachments/1473568523866476645/1473608867798585455/image9.gif?ex=69c25634&is=69c104b4&hm=ed2c08de321b4bd80392dcc84441cf87e85c0f5a47158820945db8e5847b51b9&",
  ],
  kiss: [
    "https://cdn.discordapp.com/attachments/1473568599242440816/1473609042319638651/image0.gif?ex=69c2565e&is=69c104de&hm=b71dde73da071acd768769c45d39ef25d35f829452c793df6b8200b342eddac9&",
    "https://cdn.discordapp.com/attachments/1473568599242440816/1473609042638274725/image1.gif?ex=69c2565e&is=69c104de&hm=1736dd940cc44adf280a6f1da8d9dec9fa711e5753622240aaf369822fca3579&",
    "https://cdn.discordapp.com/attachments/1473568599242440816/1473609042961371237/image2.gif?ex=69c2565e&is=69c104de&hm=d78f94d70229198863859b4c0154ace7f89dba7166b954dd74d16d1ddb9a74d3&",
    "https://cdn.discordapp.com/attachments/1473568599242440816/1473609043322077238/image3.gif?ex=69c2565e&is=69c104de&hm=3d8ace1c5b7f369c0ebf6caf720a653f89468be44e76ca62e391967467601453&",
    "https://cdn.discordapp.com/attachments/1473568599242440816/1473609043674267781/image4.gif?ex=69c2565e&is=69c104de&hm=d3334185ea9593451dbc19743eb1b1a4fa5b433b880ab4ff191f9edefdc6a142&",
    "https://cdn.discordapp.com/attachments/1473568599242440816/1473609044039307305/image5.gif?ex=69c2565e&is=69c104de&hm=4e63c7fa45bddad80a5624e4f0ebd82a241368cecf3bdf8d3546f00e7e7a0d8c&",
    "https://cdn.discordapp.com/attachments/1473568599242440816/1473609044295155732/image6.gif?ex=69c2565e&is=69c104de&hm=18e1f8660090cb74daee3d63fc5485c341e58373eb8d5c73dbc5fbb978372aa7&",
    "https://cdn.discordapp.com/attachments/1473568599242440816/1473609044609470496/image7.gif?ex=69c2565e&is=69c104de&hm=dc2545a8b2490d7068308ea246bbd7b8613e8be9d4eb51954d9c1b28b50dc637&",
    "https://cdn.discordapp.com/attachments/1473568599242440816/1473609044991283230/image8.gif?ex=69c2565e&is=69c104de&hm=4caa3142526101851d62019f41c92b133096b331ea9d98b8342d304bdc2d017a&",
    "https://cdn.discordapp.com/attachments/1473568599242440816/1473609086305177660/image0.gif?ex=69c25668&is=69c104e8&hm=fdc493068b7f823d6a1917399ba89fe9aa6f14489be48e3b1ae4a807c3dc4155&",
  ],
  pat: [
    "https://cdn.discordapp.com/attachments/1473568716342956136/1473609198159007856/image0.gif?ex=69c25683&is=69c10503&hm=9ab78e3f08250ae65394f64148d73e7118b384c0a1a7306af4cad386310aada0&",
    "https://cdn.discordapp.com/attachments/1473568716342956136/1473609198829961327/image1.gif?ex=69c25683&is=69c10503&hm=66c58626b846b37e66c893bf294499aa1fbc566d75d4783c43a4d2a2ca5d1daf&",
    "https://cdn.discordapp.com/attachments/1473568716342956136/1473609199299592314/image2.gif?ex=69c25683&is=69c10503&hm=88a81d45d189cb3fcedf3fee948ef8afcf8864738fb8c53b155b9fb2d1b3f582&",
    "https://cdn.discordapp.com/attachments/1473568716342956136/1473609199626879058/image3.gif?ex=69c25683&is=69c10503&hm=77f9701fc9598fc8dc94814a00bfdaf4ce71468fb88f441828e6745519b9d784&",
    "https://cdn.discordapp.com/attachments/1473568716342956136/1473609200008695838/image4.gif?ex=69c25683&is=69c10503&hm=e7b6e39b1e7f9dddf749eef10f8ab58b517e72eafb4a066db10d409ac56f14c8&",
    "https://cdn.discordapp.com/attachments/1473568716342956136/1473609200549498972/image5.gif?ex=69c25683&is=69c10503&hm=7e10c83843f37395885b83e17d3540aad335cc460264024fc11c6a2c3cacaa43&",
    "https://cdn.discordapp.com/attachments/1473568716342956136/1473609201019518976/image6.gif?ex=69c25683&is=69c10503&hm=ce1dcc19adef67d5b0455cfc8c3c8deab8e0c53c444a0e1ba95abab410cb539c&",
    "https://cdn.discordapp.com/attachments/1473568716342956136/1473609201367388170/image7.gif?ex=69c25683&is=69c10503&hm=391e61dc564bb5d237c77a3519908e55f568c2261a8bac294d8ff8b90aef7151&",
    "https://cdn.discordapp.com/attachments/1473568716342956136/1473609201749327882/image8.gif?ex=69c25684&is=69c10504&hm=165e0a9c20c131d0e568460394b2c6a850ced80cda6fd8073a2edb268627e5a7&",
    "https://cdn.discordapp.com/attachments/1473568716342956136/1473609202042667049/image9.gif?ex=69c25684&is=69c10504&hm=2fe049285c46e8e0d57b45471b7b4c92493020e4caa8b6a5d15402d25e6296c4&",
  ],
  slap: [
    "https://cdn.discordapp.com/attachments/1473568769493172371/1473609315968352349/image0.gif?ex=69c2569f&is=69c1051f&hm=e1c6a5cc8f34e42ac6dad5828ace35c0c7cd9a3f8d8cc3a9b533cc1a7d7dbb90&",
    "https://cdn.discordapp.com/attachments/1473568769493172371/1473609316396302419/image1.gif?ex=69c2569f&is=69c1051f&hm=c44f4a4165c5de48866fe6aef60f3f885b53b25ea80c26f2f03cf947d11b3076&",
    "https://cdn.discordapp.com/attachments/1473568769493172371/1473609316744298577/image2.gif?ex=69c2569f&is=69c1051f&hm=2c67ab7c6c408400382433134b208622edb30853bf76d27fde98e05be73a4b6f&",
    "https://cdn.discordapp.com/attachments/1473568769493172371/1473609317168054436/image3.gif?ex=69c2569f&is=69c1051f&hm=e139bdb695f54c0b96d70c809bb90f1eb7bc2b11deee0b8b7c3e3605aaf4fcd0&",
    "https://cdn.discordapp.com/attachments/1473568769493172371/1473609317532827770/image4.gif?ex=69c2569f&is=69c1051f&hm=95f5a109a572c0d5dc17ab30e0ce86c7768fb8d3a14f8f33fce001200df6cb66&",
    "https://cdn.discordapp.com/attachments/1473568769493172371/1473609317814112256/image5.gif?ex=69c2569f&is=69c1051f&hm=23a81261d501c3332e921b32dfbbfdbbba28c4b73ecc61506d9754109dc6a06c&",
    "https://cdn.discordapp.com/attachments/1473568769493172371/1473609318086738061/image6.gif?ex=69c2569f&is=69c1051f&hm=5e9f1ea59edf6510e4c6c26bb8a12a5204d4cc48c46b8e7583e1f67b2cb5ce7c&",
    "https://cdn.discordapp.com/attachments/1473568769493172371/1473609318409437297/image7.gif?ex=69c2569f&is=69c1051f&hm=0376847adc284bd2aac0cc1193c13de53fe3d6403a81901cc80bef19035f9eb1&",
    "https://cdn.discordapp.com/attachments/1473568769493172371/1473609318711693312/image8.gif?ex=69c2569f&is=69c1051f&hm=403d1d623cace7b109528f42e4645110f2e4a83930590d3f0c6c746f3f60bf5f&",
    "https://cdn.discordapp.com/attachments/1473568769493172371/1473609319051427986/image9.gif?ex=69c2569f&is=69c1051f&hm=d5a5dbbad03b4be87bc57307b280f039136ca51b0aafc94f71602102922cdad1&",
  ],
  cuddle: [
    "https://cdn.discordapp.com/attachments/1473568882068426815/1473609552296542338/image0.gif?ex=69c256d7&is=69c10557&hm=e29493c33ec71e2f50e8cd027c955f69b08953860d488b800f85a03fd33fba5c&",
    "https://cdn.discordapp.com/attachments/1473568882068426815/1473609552695132230/image1.gif?ex=69c256d7&is=69c10557&hm=215a5e26314382f003c8359482fe9088602656cb64c30acec78140480dcc118b&",
    "https://cdn.discordapp.com/attachments/1473568882068426815/1473609553059774577/image2.gif?ex=69c256d7&is=69c10557&hm=f15a2520d4b4da2c81ddd75f53c4c9f86aa9bab7d8c6ceef789111e91273b628&",
    "https://cdn.discordapp.com/attachments/1473568882068426815/1473609553508827221/image3.gif?ex=69c256d7&is=69c10557&hm=566eb607d0a08eabf3e04383850a727018ed4fc42ecf8ee0b7d8a22646601b0d&",
    "https://cdn.discordapp.com/attachments/1473568882068426815/1473609553999564822/image4.gif?ex=69c256d8&is=69c10558&hm=e6336853398b9b8b3025f10bb321c8315c07b7d723b9ac6ae6e8844a74804b7e&",
    "https://cdn.discordapp.com/attachments/1473568882068426815/1473609554355814463/image5.gif?ex=69c256d8&is=69c10558&hm=1f0e59cbf7b4ad6170940c22a5f52bbfff8b5750aebce271a27624cf51d921a5&",
    "https://cdn.discordapp.com/attachments/1473568882068426815/1473609555014324347/image6.gif?ex=69c256d8&is=69c10558&hm=b19f98aae17234be7c7530c3f0c7cfd58414d25b2be4094016e04879bca5315b&",
    "https://cdn.discordapp.com/attachments/1473568882068426815/1473609555396001812/image7.gif?ex=69c256d8&is=69c10558&hm=0179abf2f5a8c2bf16da418b697d086d48c9cf2c94d68ddd36ab1bfdfbecec5d&",
    "https://cdn.discordapp.com/attachments/1473568882068426815/1473609555953848321/image8.gif?ex=69c256d8&is=69c10558&hm=c5b5d18305383e3d4d52362fe58e93ccb8f9e638c34b7cc0873d514b322e2875&",
    "https://cdn.discordapp.com/attachments/1473568882068426815/1473609556398575708/image9.gif?ex=69c256d8&is=69c10558&hm=e41ac111f5d4db52d722f4ca67cf5c5e1e5db8d7407a845554839d56dfd3b9b4&",
  ],
  poke: [
    "https://cdn.discordapp.com/attachments/1473568916365119593/1473609709603913881/image0.gif?ex=69c256fd&is=69c1057d&hm=b95756f0531cc7236a0443f172e7e4b3112677e3a1c6631c8c4ce9a620fe30ec&",
    "https://cdn.discordapp.com/attachments/1473568916365119593/1473609709993988219/image1.gif?ex=69c256fd&is=69c1057d&hm=a49f2b4dd3d7f0f3ed64babc420a6ec652c0fa83dc4ef874ccea6f6e217377e4&",
    "https://cdn.discordapp.com/attachments/1473568916365119593/1473609710405025812/image2.gif?ex=69c256fd&is=69c1057d&hm=7d6777978f1bcf8331b0ab888a84a89f729158d215ddf5591f4f552823e42f09&",
    "https://cdn.discordapp.com/attachments/1473568916365119593/1473609710719729706/image3.gif?ex=69c256fd&is=69c1057d&hm=8170211cd9adbd987fa06b1b2dff4f323f5d65a40c8c0d7269f02facce1520a2&",
    "https://cdn.discordapp.com/attachments/1473568916365119593/1473609711432765492/image4.gif?ex=69c256fd&is=69c1057d&hm=8e3ceea0e2e5a3005817e0ca2e9d7142bd77faafa89bfb9a99810e695f0c339c&",
    "https://cdn.discordapp.com/attachments/1473568916365119593/1473609711768043602/image5.gif?ex=69c256fd&is=69c1057d&hm=8fc11019853b5262982ca977b26227f5131dc44df423b3e341bb45684791ed8e&",
    "https://cdn.discordapp.com/attachments/1473568916365119593/1473609712325890202/image6.gif?ex=69c256fd&is=69c1057d&hm=b00eec9132a6e710ec43a1b2fb7e8e0ef0a15e96f1c7432e013dc5c734c6cf0c&",
    "https://cdn.discordapp.com/attachments/1473568916365119593/1473609712737058857/image7.gif?ex=69c256fd&is=69c1057d&hm=8351932007fdc4a71563976f2aae44585a6ed0e593b78739a0fbccfc85f1c4e6&",
    "https://cdn.discordapp.com/attachments/1473568916365119593/1473609713269866569/image8.gif?ex=69c256fd&is=69c1057d&hm=26b0abd6df1800681425fbee996c2c4fbf7e75f9fbcf4ca047f642691bfbc505&",
    "https://cdn.discordapp.com/attachments/1473568916365119593/1473609713596895354/image9.gif?ex=69c256fe&is=69c1057e&hm=c1d5a360477f154ff23f64f6152a7d8bd4322e0e9ea31f0f814d1699f8192de0&",
  ],
  wave: [
    "https://cdn.discordapp.com/attachments/1473568980202557521/1473609853867004058/image0.gif?ex=69c2571f&is=69c1059f&hm=f3ef9b871ea6ee98e2365932ea4babbe22b9ef9431dde27965e39b90b58f1abe&",
    "https://cdn.discordapp.com/attachments/1473568980202557521/1473609854491951188/image1.gif?ex=69c2571f&is=69c1059f&hm=bc4940a6d042da6605b291c032de222e74a65e198e0fffbc2cab62fe460fc211&",
    "https://cdn.discordapp.com/attachments/1473568980202557521/1473609855737532529/image2.gif?ex=69c2571f&is=69c1059f&hm=5b13bc0b673a3a86ed3369ab8fe68ac63b5ee34871f2c4dac3017ed78c09c9ca&",
    "https://cdn.discordapp.com/attachments/1473568980202557521/1473609856203227248/image3.gif?ex=69c25720&is=69c105a0&hm=757f5eb7c035cdff4e1bde6ff3599baf099a5aaf087328698618a815bd5112ae&",
    "https://cdn.discordapp.com/attachments/1473568980202557521/1473609856765136987/image4.gif?ex=69c25720&is=69c105a0&hm=6c3c904537aa6829b409e500133c8fbc1086e12e321b0b1b8d465c7780acba51&",
    "https://cdn.discordapp.com/attachments/1473568980202557521/1473609857516044389/image5.gif?ex=69c25720&is=69c105a0&hm=1d7e7e8a50eca4ff06caa187dee3f10aa8da2a3bff60232787b9b475c41ba605&",
    "https://cdn.discordapp.com/attachments/1473568980202557521/1473609858161836124/image6.gif?ex=69c25720&is=69c105a0&hm=506eb3a6c2fb86eb68d31a862825c21f51983e96fc4bd6a722b84a1e28c8e355&",
    "https://cdn.discordapp.com/attachments/1473568980202557521/1473609858703032463/image7.gif?ex=69c25720&is=69c105a0&hm=4015cc65afacb147c4214b45327786b0e70f6d5ad8b83e802f102de8905d5ac8&",
    "https://cdn.discordapp.com/attachments/1473568980202557521/1473609859495759894/image8.gif?ex=69c25720&is=69c105a0&hm=b9305fc2e508612ae6e4b096612b62b7c3d6c3b4c62852207546435e7a2f66c7&",
    "https://cdn.discordapp.com/attachments/1473568980202557521/1473609860460445786/image9.gif?ex=69c25721&is=69c105a1&hm=629a15a5fa8254c34c7fc52443d49358b6025bb947dfae5f404318de1d4577a3&",
  ],
  bite: [
    "https://cdn.discordapp.com/attachments/1473569008203857960/1473609971936661606/image0.gif?ex=69c2573b&is=69c105bb&hm=d31218ec8708d49ff8aff740ad1259c93d22bafe63cd91a3825cd53ddc661471&",
    "https://cdn.discordapp.com/attachments/1473569008203857960/1473609972255555719/image1.gif?ex=69c2573b&is=69c105bb&hm=a46b8fde3993d62049843dc42de33557e95a28dda91586133262c7adf6b6aa7e&",
    "https://cdn.discordapp.com/attachments/1473569008203857960/1473609972616007731/image2.gif?ex=69c2573b&is=69c105bb&hm=ebfb05b39a91dec3e6414492bc5d1a811bad33bf9f30884b0907ba8d66314104&",
    "https://cdn.discordapp.com/attachments/1473569008203857960/1473609972939100211/image3.gif?ex=69c2573b&is=69c105bb&hm=2371a01c4f28ebfe3a6ae73fcf380f1fcefbe901e587ea7fbe07ec9d6621b58f&",
    "https://cdn.discordapp.com/attachments/1473569008203857960/1473609973685817447/image4.gif?ex=69c2573c&is=69c105bc&hm=00b879862d0d3d4fa3fe771468ae3d49406d54296f275a383b30e3b17326250d&",
    "https://cdn.discordapp.com/attachments/1473569008203857960/1473609974138536107/image5.gif?ex=69c2573c&is=69c105bc&hm=4d4c0da6f72494c752e46fe2dbe42157af6e718f632b38dab180fabc4e25d5e7&",
    "https://cdn.discordapp.com/attachments/1473569008203857960/1473609974684061796/image6.gif?ex=69c2573c&is=69c105bc&hm=d3da3ab165bc58227045c198cad4ab4b8abab57561523d71800c91aa7571ca53&",
    "https://cdn.discordapp.com/attachments/1473569008203857960/1473609975161946206/image7.gif?ex=69c2573c&is=69c105bc&hm=d4f713adcae18ddbef103b1925dafd6e4b1f1c16abea949ff5a5ae5886b64cee&",
    "https://cdn.discordapp.com/attachments/1473569008203857960/1473609975812325468/image8.gif?ex=69c2573c&is=69c105bc&hm=060d0dfbc0402b8e6418e9bd42513e09be62fe197e65ebda1ab0c302ab68e3fe&",
    "https://cdn.discordapp.com/attachments/1473569008203857960/1473609976428761140/image9.gif?ex=69c2573c&is=69c105bc&hm=74d52fddcf179cdfece1923c6e8a7d754e748adfc74fdc2b9d1ba99dffbf50bc&",
  ],
  cry: [
    "https://cdn.discordapp.com/attachments/1473570009447141501/1485591269697654844/image0.gif?ex=69c26c2f&is=69c11aaf&hm=2302f3835ab4ce33ad0d800606d5929193c06e9a031cd6b075ba06da0717d7d0&",
    "https://cdn.discordapp.com/attachments/1473570009447141501/1485591270394171432/image1.gif?ex=69c26c2f&is=69c11aaf&hm=55f131fd8e29da6e78ea7d332cd16458d3c6770efed538be35ae5bf573687c66&",
    "https://cdn.discordapp.com/attachments/1473570009447141501/1485591270830116929/image2.gif?ex=69c26c2f&is=69c11aaf&hm=6b9c18cb6239c9c8113cfccf370fd58692b38573c9bb1537e830b1508014dc1d&",
    "https://cdn.discordapp.com/attachments/1473570009447141501/1485591271262392493/image3.gif?ex=69c26c30&is=69c11ab0&hm=c5e4a99948c116a636b63f217ab6a381d4a0713d8b754765a23d9f73c9a7cba5&",
    "https://cdn.discordapp.com/attachments/1473570009447141501/1485591271614582865/image4.gif?ex=69c26c30&is=69c11ab0&hm=d152c5512330dd5d5b68ada78adefa03c0e1bb6400b3f66b06527d80ce3df6d7&",
    "https://cdn.discordapp.com/attachments/1473570009447141501/1485591271992066099/image5.gif?ex=69c26c30&is=69c11ab0&hm=a8ab4d2a691c559dc86f6f7f176d5056176434123cfd8eaa39d22b576ab25827&",
    "https://cdn.discordapp.com/attachments/1473570009447141501/1485591272445054996/image6.gif?ex=69c26c30&is=69c11ab0&hm=117547bf31d777b8b62d03746de5967e6daf7b9f49d746af9d157cb5c3fbf8bc&",
    "https://cdn.discordapp.com/attachments/1473570009447141501/1485591272834994307/image7.gif?ex=69c26c30&is=69c11ab0&hm=a87a3f5a7fe03ef6ead6bc9aebaba96f0acb3b0f1a41b5978fdc0315fb201894&",
    "https://cdn.discordapp.com/attachments/1473570009447141501/1485591273313407006/image8.gif?ex=69c26c30&is=69c11ab0&hm=d4b502fe1f2f2123f7722fb5854ef588be28030caf9cc504676888b75b380780&",
    "https://cdn.discordapp.com/attachments/1473570009447141501/1485591273740959916/image9.gif?ex=69c26c30&is=69c11ab0&hm=ef03086a7a042e643218feb06dffcc042efbfec39529572d43348e2cd7e3bb6b&",
  ],
  dance: [
    "https://cdn.discordapp.com/attachments/1473570048479199338/1485591435389440132/image0.gif?ex=69c26c57&is=69c11ad7&hm=cd018312e71f00dfd8c7194c6b80fb06e8ec38789def314a8ed000be8d6ea56c&",
    "https://cdn.discordapp.com/attachments/1473570048479199338/1485591435834294362/image1.gif?ex=69c26c57&is=69c11ad7&hm=2c5b337dcb85ed157567b3f9a1755d2f326642d8a600b4f70a25fa31a92201c6&",
    "https://cdn.discordapp.com/attachments/1473570048479199338/1485591436358324265/image2.gif?ex=69c26c57&is=69c11ad7&hm=f67d7a565d8452af38687ea9af55e5ab2ee48960df6caeaa7649b772f9a8cf9f&",
    "https://cdn.discordapp.com/attachments/1473570048479199338/1485591436773818499/image3.gif?ex=69c26c57&is=69c11ad7&hm=1d97177eedab0c152f13a61dee0f2f75882c8ee3876d98286d7920a3d51bfa57&",
    "https://cdn.discordapp.com/attachments/1473570048479199338/1485591437155242155/image4.gif?ex=69c26c57&is=69c11ad7&hm=85b673aeee1d4f1f021e585a5fc4c7824bf7490bc04c24fdc1c69a5715798ca8&",
    "https://cdn.discordapp.com/attachments/1473570048479199338/1485591437591707709/image5.gif?ex=69c26c57&is=69c11ad7&hm=a9dd20ee56ab451ac1f020753fb790daa7c8b01862c96c576b8f70f03121088f&",
    "https://cdn.discordapp.com/attachments/1473570048479199338/1485591437990039652/image6.gif?ex=69c26c57&is=69c11ad7&hm=1377b7892b7c50d48a53286555ae6d0278a8b6b7a95b6131e874dfa7a2024a7c&",
    "https://cdn.discordapp.com/attachments/1473570048479199338/1485591438484836395/image7.gif?ex=69c26c57&is=69c11ad7&hm=d4f7c5855944a42d43ca5bf28fb4879a2e87a19e211ba186013cee2f9fc7418b&",
    "https://cdn.discordapp.com/attachments/1473570048479199338/1485591439097200771/image8.gif?ex=69c26c58&is=69c11ad8&hm=8a69d285649807dcace56e428a272b6fb978449e4b6006c85fc5ef922bb67857&",
    "https://cdn.discordapp.com/attachments/1473570048479199338/1485591439474950174/image9.gif?ex=69c26c58&is=69c11ad8&hm=092b8b0a60ec8fa143de4dcb513e4d5949f58fa36518d02480288b62715389ec&",
  ],
  blush: [
    "https://cdn.discordapp.com/attachments/1473570111641223289/1485591517509980210/image0.gif?ex=69c26c6a&is=69c11aea&hm=ced6e58453b20ec77f24793b7f1abaa729363131ff91a1c722f95017bbd2ca2d&",
    "https://cdn.discordapp.com/attachments/1473570111641223289/1485591518075945031/image1.gif?ex=69c26c6a&is=69c11aea&hm=00b8c1c1108319612db8589f377918d2b2b7dfae1d136e720abfab4a88740b9f&",
    "https://cdn.discordapp.com/attachments/1473570111641223289/1485591518646632589/image2.gif?ex=69c26c6b&is=69c11aeb&hm=83152f909661b31087b4b3e894c1f6a19af74161491e3cd0fd426e87a09d7658&",
    "https://cdn.discordapp.com/attachments/1473570111641223289/1485591519053217863/image3.gif?ex=69c26c6b&is=69c11aeb&hm=cb5c17f2e9ddb421c75a1442afe0b64eb60c731b505723d0fcdf2ba8b24daeb1&",
    "https://cdn.discordapp.com/attachments/1473570111641223289/1485591519493885952/image4.gif?ex=69c26c6b&is=69c11aeb&hm=ac27d81eb32fba19d54fd916eb21a3431791d5420de0ce6f8036f90c8798d3f2&",
    "https://cdn.discordapp.com/attachments/1473570111641223289/1485591519842009188/image5.gif?ex=69c26c6b&is=69c11aeb&hm=888b36455aef5cb7dac98302a7406ff10156060edb020f580717bb31f438b97e&",
    "https://cdn.discordapp.com/attachments/1473570111641223289/1485591520231817421/image6.gif?ex=69c26c6b&is=69c11aeb&hm=805830361e413a79d8576f797426380cfc1e440fc95f9bac2fc033f66555097f&",
    "https://cdn.discordapp.com/attachments/1473570111641223289/1485591520630407231/image7.gif?ex=69c26c6b&is=69c11aeb&hm=02752cddd8da9a6064750e7991ccd3e303c724d71388da3f5b0f33536c9cc24b&",
    "https://cdn.discordapp.com/attachments/1473570111641223289/1485591520978407456/image8.gif?ex=69c26c6b&is=69c11aeb&hm=2b60666faeb51bf04911df4d8892f3bda510a9d9a5735c3c697da2b15e94f1e9&",
    "https://cdn.discordapp.com/attachments/1473570111641223289/1485591521318404096/image9.gif?ex=69c26c6b&is=69c11aeb&hm=f46c6fdcea94252d146cc63d962f7f2c576628a6362758d6216e7cb82de7d2b1&",
  ],
  smile: [
    "https://cdn.discordapp.com/attachments/1473570154490364116/1485591626603696271/image0.gif?ex=69c26c84&is=69c11b04&hm=fc9e31e8c6bf6467dc2f6e7bfe3595b6568822547ec49eead50c8d88efece6d5&",
    "https://cdn.discordapp.com/attachments/1473570154490364116/1485591627186835487/image1.gif?ex=69c26c84&is=69c11b04&hm=46c671967185bab8a5405065896c6ada073a70058312ee6f9d56d54839bb0e56&",
    "https://cdn.discordapp.com/attachments/1473570154490364116/1485591627710992464/image2.gif?ex=69c26c85&is=69c11b05&hm=f3951d6718768fc2210c49c0d6a178f822c9c66c83d6dd7a85d8f03dcdcb7213&",
    "https://cdn.discordapp.com/attachments/1473570154490364116/1485591628608569425/image3.gif?ex=69c26c85&is=69c11b05&hm=b77c4a728d5680a36889aee0b8f85fc0d114621ca7161ffb50ad349b50ac6e73&",
    "https://cdn.discordapp.com/attachments/1473570154490364116/1485591629250302062/image4.gif?ex=69c26c85&is=69c11b05&hm=725c0d16e445e5a0ed223e893d9ffd17a7a9d5696f7ac65a02b451406ecc4c71&",
    "https://cdn.discordapp.com/attachments/1473570154490364116/1485591629828984932/image5.gif?ex=69c26c85&is=69c11b05&hm=c0632c52ce62dcfea7657e3fbf2dc332cb3aa7469fac6374bac61bd60febde05&",
    "https://cdn.discordapp.com/attachments/1473570154490364116/1485591630596673546/image6.gif?ex=69c26c85&is=69c11b05&hm=234c2c64f6e9b6d8925215fc4c29f30d3fc438bae22a1ec8974a677132d3b6f0&",
    "https://cdn.discordapp.com/attachments/1473570154490364116/1485591631116636272/image7.gif?ex=69c26c85&is=69c11b05&hm=2a63180a73b308bd7a8d1ae255cfe8cdc6ca21d115a71a5541b423f85130bb7e&",
    "https://cdn.discordapp.com/attachments/1473570154490364116/1485591631393722429/image8.gif?ex=69c26c85&is=69c11b05&hm=9c4caefdbc6fa31c2ed2f929e3112bcffd123c85f77c4622f785f44e3c94900b&",
    "https://cdn.discordapp.com/attachments/1473570154490364116/1485591631708160130/image9.gif?ex=69c26c85&is=69c11b05&hm=0853afcfe680ef38f460a08a57454bec4a539f4ea3a040f4df184395553dbb11&",
  ],
  highfive: [
    "https://cdn.discordapp.com/attachments/1473569092035412171/1473610209904693309/image0.gif?ex=69c25774&is=69c105f4&hm=5f31bb9075a539427bf0cfa4d8473e3aaa6c137e63960dbf9405928377273e38&",
    "https://cdn.discordapp.com/attachments/1473569092035412171/1473610210437365772/image1.gif?ex=69c25774&is=69c105f4&hm=8aff323b61cdfa172b48b6955f39a7b051a643f4f72d136941c557896e80ef41&",
    "https://cdn.discordapp.com/attachments/1473569092035412171/1473610210974240893/image2.gif?ex=69c25774&is=69c105f4&hm=d4a193e0919e9a08cf96909eed1302a9afa3e48b42a8958b7761681a832e3132&",
    "https://cdn.discordapp.com/attachments/1473569092035412171/1473610211313844284/image3.gif?ex=69c25774&is=69c105f4&hm=762b74c8ce9c764cd2b6ea1cd294a5c281885f51ed02488c043068eb4d72b11d&",
    "https://cdn.discordapp.com/attachments/1473569092035412171/1473610211867627623/image4.gif?ex=69c25774&is=69c105f4&hm=713cdde71a153b4611f80d3931827a7404932542e12e23782e489c200b7fce7c&",
    "https://cdn.discordapp.com/attachments/1473569092035412171/1473610212257562725/image5.gif?ex=69c25774&is=69c105f4&hm=71a10f1fd629c8e47d2ca9516bb78a0527c6d65efc7bfefd92e42e610e6d99e1&",
    "https://cdn.discordapp.com/attachments/1473569092035412171/1473610212597567662/image6.gif?ex=69c25775&is=69c105f5&hm=8c0049e30c5a529a46159527dbd5b3bf89f082f5eb6d2db5b97bbad19052bf91&",
    "https://cdn.discordapp.com/attachments/1473569092035412171/1473610212962340864/image7.gif?ex=69c25775&is=69c105f5&hm=f93d1b9bf1d3357fc5bc854e6e32d4df97f7f51f83c0a4a968704aafd63ef12d&",
    "https://cdn.discordapp.com/attachments/1473569092035412171/1473610213297754266/image8.gif?ex=69c25775&is=69c105f5&hm=d0db94478927dcc243381f048cfa22a2692d93928483a304773bcc099517b60f&",
    "https://cdn.discordapp.com/attachments/1473569092035412171/1473610213612589186/image9.gif?ex=69c25775&is=69c105f5&hm=4bf1612c11fcdfa9a7dbc23a43486a06843402766d870dcd2626933473f0ecf2&",
  ],
  bonk: [
    "https://cdn.discordapp.com/attachments/1473569167339945994/1473610327752048711/image0.gif?ex=69c25790&is=69c10610&hm=bbe7a3649f844024031caccc6cb05f39f0687ea3e90b8e196f20bfe60caa1881&",
    "https://cdn.discordapp.com/attachments/1473569167339945994/1473610328427200553/image1.gif?ex=69c25790&is=69c10610&hm=8e0b4629ccbc21101f7d244c4709450701f22dc355fa06cc387f16cf5011d0b5&",
    "https://cdn.discordapp.com/attachments/1473569167339945994/1473610329157140562/image2.gif?ex=69c25790&is=69c10610&hm=239424a77b15266cbc1b4bdecd9bed43a5037c30b1a4e3ff91d0591da109d685&",
    "https://cdn.discordapp.com/attachments/1473569167339945994/1473610329710792724/image3.gif?ex=69c25790&is=69c10610&hm=aafe4ec45b965df98414521149b60621262e2aab37e1b95db25c172a66f075ed&",
    "https://cdn.discordapp.com/attachments/1473569167339945994/1473610330314903592/image4.gif?ex=69c25791&is=69c10611&hm=769f20bbe76781f3a875716a9f54492402d8c41bc65a2639249072d370f5f9e1&",
    "https://cdn.discordapp.com/attachments/1473569167339945994/1473610330709037168/image5.gif?ex=69c25791&is=69c10611&hm=26e4c64ccc3434a0bfebb81cf3333cc0e008f8cff0677b59147242240d515203&",
    "https://cdn.discordapp.com/attachments/1473569167339945994/1473610331170541578/image6.gif?ex=69c25791&is=69c10611&hm=aaecaf94cd7325fe436fd853499effb6a606e13a0b6f85b9bf5de90b16a863e3&",
    "https://cdn.discordapp.com/attachments/1473569167339945994/1473610331506081832/image7.gif?ex=69c25791&is=69c10611&hm=5884e39143612028fbe9ec85e87343078f31c92fd14b5678c216210da9a3b091&",
    "https://cdn.discordapp.com/attachments/1473569167339945994/1473610331870990397/image8.gif?ex=69c25791&is=69c10611&hm=94ed9d9c53529323a02144940d4f79249b0f70d7b582f5e2ffb4624320c82a63&",
    "https://cdn.discordapp.com/attachments/1473569167339945994/1473610332189491220/image9.gif?ex=69c25791&is=69c10611&hm=8012760b23497661316bf8c5e9e8fae41a85e66bb31d1816ac2252d5cef40818&",
  ],
  yeet: [
    "https://cdn.discordapp.com/attachments/1473569232322166886/1473610463651696641/image0.gif?ex=69c257b0&is=69c10630&hm=3877e2e5e6484fc2fbe27c49e9ef6ed539128310506913bdfedf52c7c7e85e4b&",
    "https://cdn.discordapp.com/attachments/1473569232322166886/1473610464129978419/image1.gif?ex=69c257b1&is=69c10631&hm=97b549076ce1a0b08a8dcd21c3ccb7f279539a05af0564fdf0b2c416fba2ca0e&",
    "https://cdn.discordapp.com/attachments/1473569232322166886/1473610464452804699/image2.gif?ex=69c257b1&is=69c10631&hm=e38a4371031bdaa10be68b3a773398d37b7802f596c59a2fad5848aed3d428ae&",
    "https://cdn.discordapp.com/attachments/1473569232322166886/1473610464779829319/image3.gif?ex=69c257b1&is=69c10631&hm=666e683e24b44c95fafdfee58569b29e340428e78494ffed6d585205f463be87&",
    "https://cdn.discordapp.com/attachments/1473569232322166886/1473610465115508827/image4.gif?ex=69c257b1&is=69c10631&hm=2e829d3dc324123b4f76b843d201f1f601753b5372b8b0181c73640b297b7e89&",
    "https://cdn.discordapp.com/attachments/1473569232322166886/1473610465434407044/image5.gif?ex=69c257b1&is=69c10631&hm=873062d57dbf41201135bca27265c247cf10c26e375bdb0de20c7dcc81e8c3eb&",
    "https://cdn.discordapp.com/attachments/1473569232322166886/1473610465710968986/image6.gif?ex=69c257b1&is=69c10631&hm=e6b55e78c8896984c4e372602553836c9ceabdaab047bb47664d037250a72315&",
    "https://cdn.discordapp.com/attachments/1473569232322166886/1473610466101035079/image7.gif?ex=69c257b1&is=69c10631&hm=625d1ae217d3b7c41248c2fe186243f1445c3091eb5e2949f7118b3d0be4155c&",
    "https://cdn.discordapp.com/attachments/1473569232322166886/1473610466537377873/image8.gif?ex=69c257b1&is=69c10631&hm=dadf306366e7930b163a13472fa4859f2e6f7930fa20f2264b37e8711ff69cba&",
    "https://cdn.discordapp.com/attachments/1473569232322166886/1473610466969256007/image9.gif?ex=69c257b1&is=69c10631&hm=9eb5bb37068b3be2e64d92a317058078dc453392da100bde4ba5c77fc77cd35f&",
  ],
  punch: [
    "https://cdn.discordapp.com/attachments/1473569262269632533/1473610734138032231/image0.gif?ex=69c257f1&is=69c10671&hm=2ef648018f49fd7c3e3cb50b4fe7d98228cf8ec5d920793cadf2eeff54c9dc94&",
    "https://cdn.discordapp.com/attachments/1473569262269632533/1473610734515654697/image1.gif?ex=69c257f1&is=69c10671&hm=735f3c7bc298b0ce843c997afd513565d71cf7c5a520a3f64c4f0603dbdb8a43&",
    "https://cdn.discordapp.com/attachments/1473569262269632533/1473610734947536916/image2.gif?ex=69c257f1&is=69c10671&hm=a4fea14e6bcddf61fea6187d38ba36a9b44501237935c5e40a55411d12aca6ea&",
    "https://cdn.discordapp.com/attachments/1473569262269632533/1473610735241134193/image3.gif?ex=69c257f1&is=69c10671&hm=5119ff3606c3a0e15ecf1cf6be5f0ef2fd274cd998f3d85bd7e672253e97ee48&",
    "https://cdn.discordapp.com/attachments/1473569262269632533/1473610735539060736/image4.gif?ex=69c257f1&is=69c10671&hm=8d6efe458a44d1bba1458eecd2e9e2b921db557cbe0075582dd3cc576536fa09&",
    "https://cdn.discordapp.com/attachments/1473569262269632533/1473610735933194343/image5.gif?ex=69c257f1&is=69c10671&hm=c1457d9022b22bdd46fc1656897dabecc1e0f375b1218a325e0a48d55ecfa665&",
    "https://cdn.discordapp.com/attachments/1473569262269632533/1473610736264675431/image6.gif?ex=69c257f1&is=69c10671&hm=bb65448310f17941249b2511cb319afd768be0a03a585b3cb03e09ccbadbc64f&",
    "https://cdn.discordapp.com/attachments/1473569262269632533/1473610736659075188/image7.gif?ex=69c257f1&is=69c10671&hm=6b5763119641bd4796e2aafc31fda8ffd7222c2eee3d148c4aa985d6856858a0&",
    "https://cdn.discordapp.com/attachments/1473569262269632533/1473610736960798928/image8.gif?ex=69c257f2&is=69c10672&hm=020e18ab326a7d0b641da9da1b2498b61b14ef22772504e19ce3b485dbbadd07&",
    "https://cdn.discordapp.com/attachments/1473569262269632533/1473610737292279838/image9.gif?ex=69c257f2&is=69c10672&hm=8b1a08ca98f634db5c8919a348662fa58056192b4da75ef6ccfb9537df5613af&",
  ],
  kill: [
    "https://cdn.discordapp.com/attachments/1473569316115845160/1473611028565852302/image0.gif?ex=69c25837&is=69c106b7&hm=4eb3ed8aa9ccf90bfa9205835c3d91a74fce56c8673fc2ebe6ab57ed3c224bac&",
    "https://cdn.discordapp.com/attachments/1473569316115845160/1473611028901400586/image1.gif?ex=69c25837&is=69c106b7&hm=9d147b18965ce88138f74408e868317f02e0be63a5dda8bc862e092b77b1c33d&",
    "https://cdn.discordapp.com/attachments/1473569316115845160/1473611029266042891/image2.gif?ex=69c25837&is=69c106b7&hm=e0735dab54974824f2e89a281aea1f87502c35f1eb1ea7dd25b61a33ecea2cce&",
    "https://cdn.discordapp.com/attachments/1473569316115845160/1473611029580873748/image3.gif?ex=69c25837&is=69c106b7&hm=073abd842fa3d510827a46be786c5aa62e443ab0f449de103411b177dd37e390&",
    "https://cdn.discordapp.com/attachments/1473569316115845160/1473611029937262622/image4.gif?ex=69c25837&is=69c106b7&hm=d5b0fb5ea8aa8472a6b8b25ffb08d283b001e88a5911ea1fcf6d894842097ed1&",
    "https://cdn.discordapp.com/attachments/1473569316115845160/1473611030247637085/image5.gif?ex=69c25837&is=69c106b7&hm=65cb340cc43f1dc423cee388129a8286b5ffdbe2417f0f6026ab15f34274b94a&",
    "https://cdn.discordapp.com/attachments/1473569316115845160/1473611031044690021/image7.gif?ex=69c25838&is=69c106b8&hm=b51f7df025c30cf53c7be7d9cb7712596ce4c6f6d2fba0e9c27d09254d7064d1&",
    "https://cdn.discordapp.com/attachments/1473569316115845160/1473611031464116294/image8.gif?ex=69c25838&is=69c106b8&hm=63ae2f2af0b8d055f0c41895695ceee9b0f52c45d746b091418fa29991d04bee&",
    "https://cdn.discordapp.com/attachments/1473569316115845160/1473611031820636324/image9.gif?ex=69c25838&is=69c106b8&hm=b8803cc9f47f0e02c96e69392310cfe4a79a250f59e21d60ab0d43de75e86026&",
    "https://cdn.discordapp.com/attachments/1473569316115845160/1473611081422340106/image0.gif?ex=69c25844&is=69c106c4&hm=690197c777c165e1b80d089df0d43405707724982282162e308fe3741692f664&",
  ],
  wink: [
    "https://cdn.discordapp.com/attachments/1473569355039248466/1485588993969229842/image0.gif?ex=69c26a11&is=69c11891&hm=a7a5be00b6b73a842052c1195a84e9e1d9ad11ba478e4a98f970e736adcdcd31&",
    "https://cdn.discordapp.com/attachments/1473569355039248466/1485588994656960592/image1.gif?ex=69c26a11&is=69c11891&hm=85b7b7d0cb4f016f04735d41d71761af7a1d1fa995e1378ecf165de7ea13b814&",
    "https://cdn.discordapp.com/attachments/1473569355039248466/1485588995412070441/image2.gif?ex=69c26a11&is=69c11891&hm=36877a48912a53634a7bac6f9ea24d420f731252332a562a6b9bf71c600a6ac5&",
    "https://cdn.discordapp.com/attachments/1473569355039248466/1485588997077205132/image3.gif?ex=69c26a11&is=69c11891&hm=296ba5ccd9c059fe09f0875c26e75ac6b6bf565e29c628a8747866062bf72598&",
    "https://cdn.discordapp.com/attachments/1473569355039248466/1485588998306009209/image4.gif?ex=69c26a12&is=69c11892&hm=e50a59e41294f2c923b551c4299e6e78d3ea93e4f43956709fd9042f6dd537e6&",
    "https://cdn.discordapp.com/attachments/1473569355039248466/1485588999119573123/image5.gif?ex=69c26a12&is=69c11892&hm=fe04514b7e39bd8f5d8743a11537a7f2b09bf89a3ba5b41790f915d6fae6fb7d&",
    "https://cdn.discordapp.com/attachments/1473569355039248466/1485588999795114085/image6.gif?ex=69c26a12&is=69c11892&hm=f0388d5df22b5959e66c789b51bff38bb7b445a85d79d1217e9ea091df9499e3&",
    "https://cdn.discordapp.com/attachments/1473569355039248466/1485589000679854080/image7.gif?ex=69c26a12&is=69c11892&hm=604fc6ee437aaf4ac63c8b2b1c465139d2497f258bd715f7678defa056d6447d&",
    "https://cdn.discordapp.com/attachments/1473569355039248466/1485589001611120760/image8.gif?ex=69c26a12&is=69c11892&hm=e179a452cf5880a5e837afc113c1f93a285cc05d531c036cfffb9b733793c38a&",
    "https://cdn.discordapp.com/attachments/1473569355039248466/1485589002324017217/image9.gif?ex=69c26a13&is=69c11893&hm=f1328001e71ae42bb9ad51dad3c838a3795f48e144908e1182ed35c5d0285822&",
  ],
  pout: [
    "https://cdn.discordapp.com/attachments/1473570260232831110/1485591698460508170/image0.gif?ex=69c26c95&is=69c11b15&hm=93c73a3b77c7f6f42630ad5003db51c048494317bdc74eb7456354cd7bde55cf&",
    "https://cdn.discordapp.com/attachments/1473570260232831110/1485591698783342622/image1.gif?ex=69c26c95&is=69c11b15&hm=746203644ce6f59526710044ac861be46d32f93dff6fa1b8f61ca544189b459e&",
    "https://cdn.discordapp.com/attachments/1473570260232831110/1485591699119149117/image2.gif?ex=69c26c96&is=69c11b16&hm=cc28bfcd879caa4ff2d099066f197944ed582e33d501ed4d1c30a5523ba37286&",
    "https://cdn.discordapp.com/attachments/1473570260232831110/1485591699500564530/image3.gif?ex=69c26c96&is=69c11b16&hm=5a4b107ae0e2f50dc5c738e7c9e1deae66229f118c0b593e02894542b4c90485&",
    "https://cdn.discordapp.com/attachments/1473570260232831110/1485591699848695908/image4.gif?ex=69c26c96&is=69c11b16&hm=db849c5233bbdb574777628ed7d840464a37bdc145012a102246572c43d3c4a0&",
    "https://cdn.discordapp.com/attachments/1473570260232831110/1485591700217921677/image5.gif?ex=69c26c96&is=69c11b16&hm=d96107130a46f22e4bcf00e8d38e510ea3c3e9c688dfd689d6260591393f0a4f&",
    "https://cdn.discordapp.com/attachments/1473570260232831110/1485591700528304138/image6.gif?ex=69c26c96&is=69c11b16&hm=17a7cfd33c96674b118c743784320efec26586d6c29748ae7ee17413e25abc1e&",
    "https://cdn.discordapp.com/attachments/1473570260232831110/1485591700859785216/image7.gif?ex=69c26c96&is=69c11b16&hm=d93fba75889812c55282c6ea7fa69b57bd845344bd76c4c1580cffaed029527c&",
    "https://cdn.discordapp.com/attachments/1473570260232831110/1485591701174091918/image8.gif?ex=69c26c96&is=69c11b16&hm=387add65a349aafe334f83503b1c586c467bfee8b47d22c8a9fb67b9c74bdf31&",
    "https://cdn.discordapp.com/attachments/1473570260232831110/1485591701480538153/image9.gif?ex=69c26c96&is=69c11b16&hm=9e5c929a20fca4da3667b44421e44013dadd94958ed8ef43d974d9525e2ae60b&",
  ],
  laugh: [
    "https://cdn.discordapp.com/attachments/1473570381272055901/1485591839485464596/image0.gif?ex=69c26cb7&is=69c11b37&hm=e94addde1158746ac93bfa07b3d7a9f9e266c7e6a6a47cf50bd3bd81b06d703c&",
    "https://cdn.discordapp.com/attachments/1473570381272055901/1485591839821004931/image1.gif?ex=69c26cb7&is=69c11b37&hm=c355571ea9fc0ad268beca69773284e7223b0de45eac7ead1f8f545f80af2193&",
    "https://cdn.discordapp.com/attachments/1473570381272055901/1485591840152485969/image2.gif?ex=69c26cb7&is=69c11b37&hm=d78342e72586cdded15215a29339abe3ff27ed56c71900a066ada3311e83fc42&",
    "https://cdn.discordapp.com/attachments/1473570381272055901/1485591840458543235/image3.gif?ex=69c26cb7&is=69c11b37&hm=e10f0788dcde465ce0cae1f981ff0ca54fa68cbe28db9269ecf51f7016ef0a7d&",
    "https://cdn.discordapp.com/attachments/1473570381272055901/1485591840802472038/image4.gif?ex=69c26cb7&is=69c11b37&hm=ac664f3c9897ad93074583cf0cf4bb1cfd9f3de855c9f95be9b792d184f802f1&",
    "https://cdn.discordapp.com/attachments/1473570381272055901/1485591841335279766/image5.gif?ex=69c26cb7&is=69c11b37&hm=5ae26c37ad657db535b53515eae7e54e70acbd675fd8ba60a02c3ad8c17cd7f2&",
    "https://cdn.discordapp.com/attachments/1473570381272055901/1485591841725485178/image6.gif?ex=69c26cb8&is=69c11b38&hm=e661b1f590a534d2b5f749c4f474bc3f1deddbe17eb5f08050e821ad2346ed16&",
    "https://cdn.discordapp.com/attachments/1473570381272055901/1485591842123677736/image7.gif?ex=69c26cb8&is=69c11b38&hm=3503f87bef532fb949c421157750af8d6d27781e05de083c16ee674e681987db&",
    "https://cdn.discordapp.com/attachments/1473570381272055901/1485591842451095592/image8.gif?ex=69c26cb8&is=69c11b38&hm=1270081585a81f0b1875ad6533fbe6a2113eb5c72bfaf0f8bdc1958c417dc6e1&",
    "https://cdn.discordapp.com/attachments/1473570381272055901/1485591842941567006/image9.gif?ex=69c26cb8&is=69c11b38&hm=641010f24829c5034ca1c9580aad68d5a90859eacc01fa88de8684d827954e4e&",
  ],
  confused: [
    "https://cdn.discordapp.com/attachments/1473570472539980042/1485591909094391828/image0.gif?ex=69c26cc8&is=69c11b48&hm=4f498d5a14dadfc22ef5c20604ace2c53ed17413fbe38304888590fd3444c5ab&",
    "https://cdn.discordapp.com/attachments/1473570472539980042/1485591909576478881/image1.gif?ex=69c26cc8&is=69c11b48&hm=cffad40a14e03105ce915979ba7ec2475e4d2d43629ae954a436e449d089a327&",
    "https://cdn.discordapp.com/attachments/1473570472539980042/1485591909991976990/image2.gif?ex=69c26cc8&is=69c11b48&hm=36d9c8c1a7ca2ddd9e06b4bc6b882e5f30ff12eea7127d77af9df1622ce20048&",
    "https://cdn.discordapp.com/attachments/1473570472539980042/1485591910507872306/image3.gif?ex=69c26cc8&is=69c11b48&hm=710b59458c00b655cf1c2c9eb05057257d253e6673f2f5b13e2413b64211e545&",
    "https://cdn.discordapp.com/attachments/1473570472539980042/1485591911472304199/image4.gif?ex=69c26cc8&is=69c11b48&hm=82a519672be29ca2a12c4058d9aed0db9da8d78b565294ec61f9b6485d451fb6&",
    "https://cdn.discordapp.com/attachments/1473570472539980042/1485591912105771008/image5.gif?ex=69c26cc8&is=69c11b48&hm=4120920086678739caf7dedb32a649badb141ad5551a31fbc750e42deae85997&",
    "https://cdn.discordapp.com/attachments/1473570472539980042/1485591912583794749/image6.gif?ex=69c26cc8&is=69c11b48&hm=31d702ead2d6b1615f618ea093e6cf9db75ce2dae973076208e2546caa8afc6f&",
    "https://cdn.discordapp.com/attachments/1473570472539980042/1485591912974127144/image7.gif?ex=69c26cc9&is=69c11b49&hm=f830e9fb3cbb56640f09cc7537ab5c1212da5cf13ef7b4eb64e469231f285fe7&",
    "https://cdn.discordapp.com/attachments/1473570472539980042/1485591913414262844/image8.gif?ex=69c26cc9&is=69c11b49&hm=02d1fa958f76bb6b27da0be39276d93361e93e35bf49401388c68fa84a751dcd&",
    "https://cdn.discordapp.com/attachments/1473570472539980042/1485591914270167050/image9.gif?ex=69c26cc9&is=69c11b49&hm=bd713751d125c2daf6c88a59a4909f72499d825d974b60d102accaedc09fe1cf&",
  ],
  sleep: [
    "https://cdn.discordapp.com/attachments/1473570562705195058/1485591963574210570/image0.gif?ex=69c26cd5&is=69c11b55&hm=78af21b99d0b289f255bc1df69ee1a94f86f1d1bd38ae6b91fae4151fe7fd444&",
    "https://cdn.discordapp.com/attachments/1473570562705195058/1485591964010156122/image1.gif?ex=69c26cd5&is=69c11b55&hm=3243fc8856b2e4b9e71db3ed59ae54b7f601250fa84e8ac07c297ee7b3592661&",
    "https://cdn.discordapp.com/attachments/1473570562705195058/1485591964412940328/image2.gif?ex=69c26cd5&is=69c11b55&hm=df6b529f4c3f1e0639f90315b0dbdd5ed4b134c217fd9eb4c2313f3b30917b5a&",
    "https://cdn.discordapp.com/attachments/1473570562705195058/1485591964786364458/image3.gif?ex=69c26cd5&is=69c11b55&hm=3533536acc0cf17a17ff6450a53af43d9d08435227a8421491331d91d9c17e62&",
    "https://cdn.discordapp.com/attachments/1473570562705195058/1485591965058728038/image4.gif?ex=69c26cd5&is=69c11b55&hm=03cc29604bb8060d004f7f52082dbaec1fc539fd03a22e75a4bb36f7cd73b0ab&",
    "https://cdn.discordapp.com/attachments/1473570562705195058/1485591965457453096/image5.gif?ex=69c26cd5&is=69c11b55&hm=3bb566f82a4c63c711cc8949b223a3b6eb78ac0c1192ba86b8454c244bf34fe8&",
    "https://cdn.discordapp.com/attachments/1473570562705195058/1485591965910433853/image6.gif?ex=69c26cd5&is=69c11b55&hm=699afb0f8de0415740d64aac5ccd5640804d118337b7b52db196de144a6f8914&",
    "https://cdn.discordapp.com/attachments/1473570562705195058/1485591966451368096/image7.gif?ex=69c26cd5&is=69c11b55&hm=0108e00c5cefa4c5e2b408eea68132632b2b42c6817e8cabc35834436fb28cc4&",
    "https://cdn.discordapp.com/attachments/1473570562705195058/1485591966920999023/image8.gif?ex=69c26cd5&is=69c11b55&hm=3f735a6235c17c4815633498c1334179127377cf6f75fb6322f1cb373188116f&",
    "https://cdn.discordapp.com/attachments/1473570562705195058/1485591974647042088/image9.gif?ex=69c26cd7&is=69c11b57&hm=0af37b6b49c3d304732a6dd6807baa5a508b7a331eb27d7b95eab5ecfe39513a&",
  ],
  run: [
    "https://cdn.discordapp.com/attachments/1473570594028261388/1485592064849612820/image0.gif?ex=69c26ced&is=69c11b6d&hm=14d0868595553fb47f0df15c022ba01221a295ba4351e2b2f54bf845c54d909f&",
    "https://cdn.discordapp.com/attachments/1473570594028261388/1485592065101529169/image1.gif?ex=69c26ced&is=69c11b6d&hm=5243b7fe3203ab93826c222752b9ab83277f28058b36135450d4d88d909aa885&",
    "https://cdn.discordapp.com/attachments/1473570594028261388/1485592177047371816/image2.gif?ex=69c26d07&is=69c11b87&hm=4643255833f0a43fda2a3a37e45780519f9cb8f79da666099e955fdbcb7af9ed&",
    "https://cdn.discordapp.com/attachments/1473570594028261388/1485592177386983455/image3.gif?ex=69c26d08&is=69c11b88&hm=53dee80d5cc8fd5a733857d596c2a86a18d7a555851b100ca9907be23382bec9&",
    "https://cdn.discordapp.com/attachments/1473570594028261388/1485592176338669719/image1.gif?ex=69c26d07&is=69c11b87&hm=f3fdb56d9a452e3e3c51b803f79601b94907f7aa47a6194b471bf5935e367697&",
    "https://cdn.discordapp.com/attachments/1473570594028261388/1485592066078674944/image4.gif?ex=69c26ced&is=69c11b6d&hm=60db2e5b4efa951991781cdb8129811d9e3f81435f2b535dbbad8aa17a748c65&",
    "https://cdn.discordapp.com/attachments/1473570594028261388/1485592066925924472/image7.gif?ex=69c26ced&is=69c11b6d&hm=5bf49c8d04fcece0bdec6fa11a86ef08c2371a9d6e50142b65a4d1342cb669ff&",
    "https://cdn.discordapp.com/attachments/1473570594028261388/1485592067504607313/image9.gif?ex=69c26ced&is=69c11b6d&hm=72f36c6f5cad17aff67dfb8dede5c7b55e16b536c5338f28e4ca95c7dd4454cc&",
    "https://cdn.discordapp.com/attachments/1473570594028261388/1485592065395134524/image2.gif?ex=69c26ced&is=69c11b6d&hm=f6097c30da77290f4ef1e920eb80bcae1cf60f8a929744dbe206d447e6d79ed7&",
    "https://cdn.discordapp.com/attachments/1473570594028261388/1485592065709572186/image3.gif?ex=69c26ced&is=69c11b6d&hm=5e06b5055d1b4783914c0a447156c1952c057e4adfdce8c3497f1152a9d54e32&",
  ],
  lick: [
    "https://cdn.discordapp.com/attachments/1473569482252353638/1485590289367302206/image2.gif?ex=69c26b45&is=69c119c5&hm=33d42ab5380e73937e89fba72f60f0a0154a9279c30c369c001e690609228dcd&",
    "https://cdn.discordapp.com/attachments/1473569482252353638/1485590290428596224/image4.gif?ex=69c26b46&is=69c119c6&hm=65041811654b29cd4b04107a8c2d1eacb741e13b3c5bf5b07e6ef976062b34f4&",
    "https://cdn.discordapp.com/attachments/1473569482252353638/1485590288843145436/image1.gif?ex=69c26b45&is=69c119c5&hm=93fd66eea5b81c792c6bb838f892ca0e53604e66d86d6404aae966d49da59935&",
    "https://cdn.discordapp.com/attachments/1473569482252353638/1485590208622759946/image2.gif?ex=69c26b32&is=69c119b2&hm=45f1d963815a42b6a3e6207c70f806a518f54e746fe0a633da0992a39927e097&",
    "https://cdn.discordapp.com/attachments/1473569482252353638/1485590209344049153/image4.gif?ex=69c26b32&is=69c119b2&hm=ea0db3dbfea179b40b913da5c68e4cbddde0c82a5faafd8eb083bafd4308ea5b&",
    "https://cdn.discordapp.com/attachments/1473569482252353638/1485590208971014164/image3.gif?ex=69c26b32&is=69c119b2&hm=15deddfd56120aa578693a30e4b4eafd0cbac40f0a3e2fa7ffffce8859fb713d&",
    "https://cdn.discordapp.com/attachments/1473569482252353638/1485590210757791864/image7.gif?ex=69c26b33&is=69c119b3&hm=0e8936ee29baac66ff90aa2831945ff2b1eba10c2f23478b77985dbae8f98978&",
    "https://cdn.discordapp.com/attachments/1473569482252353638/1485590211244326952/image8.gif?ex=69c26b33&is=69c119b3&hm=5b1bd37bf7a20191bfcf084bff166998d47c65dd76da227f7e8dbed396e7e394&",
    "https://cdn.discordapp.com/attachments/1473569482252353638/1485590207985094777/image0.gif?ex=69c26b32&is=69c119b2&hm=5e3668fa6f5ddbef27480b32e7a325a3192ceecd6bdf59c5b49aba8402e9c28c&",
    "https://cdn.discordapp.com/attachments/1473569482252353638/1485590208291405941/image1.gif?ex=69c26b32&is=69c119b2&hm=c054b468e92809b6e1f70b1d27d473084b32084e4fff90d8ad8c03831cda4243&",
  ],
  stare: [
    "https://cdn.discordapp.com/attachments/1473569521691394142/1485590287148388502/image0.gif?ex=69c26b45&is=69c119c5&hm=35314502cb9b813d51c560e4186026fd72cb0f8279c3fcb67309ae1705d608a8&",
    "https://cdn.discordapp.com/attachments/1473569521691394142/1485590287635185766/image1.gif?ex=69c26b45&is=69c119c5&hm=755584b26f5e9e70cdeea865f83d11d418ff971f7bed9393014071b10f78b51c&",
    "https://cdn.discordapp.com/attachments/1473569521691394142/1485590288079650926/image2.gif?ex=69c26b45&is=69c119c5&hm=4f82ee8fe77d8beec963996a3af71dc4affd2fd3a72bcd2f8a91a3695115ed56&",
    "https://cdn.discordapp.com/attachments/1473569521691394142/1485590288612462712/image3.gif?ex=69c26b45&is=69c119c5&hm=80e340feda154765feede75007a7b9c2a800e5051ab1356589177406a9f6d911&",
    "https://cdn.discordapp.com/attachments/1473569521691394142/1485590289052733470/image4.gif?ex=69c26b45&is=69c119c5&hm=27f1d12c190e871ce12d1aa242aa7a06258bc5dfc347ecb4a532218b4e7fd3ae&",
    "https://cdn.discordapp.com/attachments/1473569521691394142/1485590289774018560/image5.gif?ex=69c26b46&is=69c119c6&hm=fe4d3655f32bdaa983f1be0dc48d8afb084e3ba528475a086ec23625b8c63cc1&",
    "https://cdn.discordapp.com/attachments/1473569521691394142/1485590290021748796/image6.gif?ex=69c26b46&is=69c119c6&hm=d2488252c7f4d1bc2b9bdc218f209a0a1b6316100c160387a9285863596bbcfe&",
    "https://cdn.discordapp.com/attachments/1473569521691394142/1485590290323607613/image7.gif?ex=69c26b46&is=69c119c6&hm=6fe35fe7c08ea4335d6ec45baeeb0f56b099cec8977943c1c238d13c1f323f59&",
    "https://cdn.discordapp.com/attachments/1473569521691394142/1485590290763878490/image8.gif?ex=69c26b46&is=69c119c6&hm=86c6d981c7fe42fae18fc6dabb6558cb0ac79c5e5a022a1ea67e26407f023d6e&",
    "https://cdn.discordapp.com/attachments/1473569521691394142/1485590291300880404/image9.gif?ex=69c26b46&is=69c119c6&hm=6ea3ddf9c86de678fa1cd85927fb2e91d62788b1349bc2d46d152d1bd227eaa7&",
  ],
  thumbsup: [
    "https://cdn.discordapp.com/attachments/1473570702358478970/1485592285956800512/image0.gif?ex=69c26d21&is=69c11ba1&hm=f488972db519a8d6cb6e85f67477706e827d523d782bc47958d4229e3be1c4f3&",
    "https://cdn.discordapp.com/attachments/1473570702358478970/1485592286229172304/image1.gif?ex=69c26d22&is=69c11ba2&hm=71e945bf56710a51dae6ca8b19c2af60efd0b86c6fa736ec421c178646e52218&",
    "https://cdn.discordapp.com/attachments/1473570702358478970/1485592286502064239/image2.gif?ex=69c26d22&is=69c11ba2&hm=d0ddfbfd7d5dfd21b13af77dc20a5beece6e1d6c15c83837b2ae71b4431bd1d2&",
    "https://cdn.discordapp.com/attachments/1473570702358478970/1485592293556617287/image3.gif?ex=69c26d23&is=69c11ba3&hm=4cd5e1e2972c9a6718b31bb3e6e23fcabb5938f6b251dc4de77763e9399738e7&",
    "https://cdn.discordapp.com/attachments/1473570702358478970/1485592293980504124/image4.gif?ex=69c26d23&is=69c11ba3&hm=1d131e96b25d10c3f508938ef69d8604062f3426ffa3af38b140f0aaa54424ff&",
    "https://cdn.discordapp.com/attachments/1473570702358478970/1485592294508728430/image5.gif?ex=69c26d23&is=69c11ba3&hm=65c7db385a917e22471e37cbc02f75095186536d122b684a9db2cadf58943059&",
    "https://cdn.discordapp.com/attachments/1473570702358478970/1485592294852788264/image6.gif?ex=69c26d24&is=69c11ba4&hm=54e81bfaa2918e49f0446e731d02c80e06f7cbd3c2a2a647916e5a5736e7e69f&",
    "https://cdn.discordapp.com/attachments/1473570702358478970/1485592295402111006/image7.gif?ex=69c26d24&is=69c11ba4&hm=3f2cfe9c9057ecb3dee0ebf16e34663c0ec23676b2290c481581806ae8add21a&",
    "https://cdn.discordapp.com/attachments/1473570702358478970/1485592296052494428/image8.gif?ex=69c26d24&is=69c11ba4&hm=dc36a96a94c98375cda4396bbcab8d606ec157063b95ef47a1d2780cabfbfe85&",
    "https://cdn.discordapp.com/attachments/1473570702358478970/1485592296412942356/image9.gif?ex=69c26d24&is=69c11ba4&hm=0cc039845b3da8e9b7262c85b988e4f2d2f2a946b2237923f69142e3447d9ee9&",
  ],
  facepalm: [
    "https://cdn.discordapp.com/attachments/1473570862186893343/1485592388062937168/image0.gif?ex=69c26d3a&is=69c11bba&hm=c47af6b053a209610e39e5ac13ed587354129f0f90b5c411c908643e8ba2f9a5&",
    "https://cdn.discordapp.com/attachments/1473570862186893343/1485592388331245679/image1.gif?ex=69c26d3a&is=69c11bba&hm=f9e544fc7e69fa700f654c504803f92ae6b8422ce4e785777b263549631f62a2&",
    "https://cdn.discordapp.com/attachments/1473570862186893343/1485592388633104506/image2.gif?ex=69c26d3a&is=69c11bba&hm=fe364603d34185e091626bd9e6b9e4258b57da8a73460b08461175265cadf910&",
    "https://cdn.discordapp.com/attachments/1473570862186893343/1485592388910055555/image3.gif?ex=69c26d3a&is=69c11bba&hm=b814b869f55a85cfabefc5e7fa8f93c449febd92cb5dcddc53685648268905ea&",
    "https://cdn.discordapp.com/attachments/1473570862186893343/1485592389249663056/image4.gif?ex=69c26d3a&is=69c11bba&hm=1eee7ec241281b62748f6c5016261fd188ec111fe782773aaabc6e2851f9a27e&",
    "https://cdn.discordapp.com/attachments/1473570862186893343/1485592389799248012/image5.gif?ex=69c26d3a&is=69c11bba&hm=e5070de1c8f5c4a7cac340a0df30c958df2aafba86c3d8ef5eb64355c1725c35&",
    "https://cdn.discordapp.com/attachments/1473570862186893343/1485592390227071026/image6.gif?ex=69c26d3a&is=69c11bba&hm=2aeef348e4f81845363061b9a5c929f84db46b6080b16cd45444c829d41f07af&",
    "https://cdn.discordapp.com/attachments/1473570862186893343/1485592390516346980/image7.gif?ex=69c26d3a&is=69c11bba&hm=750e4b3bd3ffbc6dda6ea738dad2d96e088a789f5f52c2490766911373e85c8e&",
    "https://cdn.discordapp.com/attachments/1473570862186893343/1485592390852018297/image8.gif?ex=69c26d3a&is=69c11bba&hm=8ef4faebc35582b13f2d1b7e3eb2cc48f36fc18d4c0f23db2b6c99b591a4ab9d&",
    "https://cdn.discordapp.com/attachments/1473570862186893343/1485592391372116071/image9.gif?ex=69c26d3b&is=69c11bbb&hm=79a57c79e631597a7d757f013bffa3be614aafc25c46062f5925185c6ba50390&",
  ],
  shrug: [
    "https://cdn.discordapp.com/attachments/1473571000305188896/1485592477695082536/image0.gif?ex=69c26d4f&is=69c11bcf&hm=97364b05bacfd6c2ca61cb1bc19f0d33d9d13c31ba383b31023a9e0b37cd058e&",
    "https://cdn.discordapp.com/attachments/1473571000305188896/1485592477984358410/image1.gif?ex=69c26d4f&is=69c11bcf&hm=08d4fda9aaf3109e62ba66ec57620147f39f52e7fc5e70711b212ec4c3ad53ef&",
    "https://cdn.discordapp.com/attachments/1473571000305188896/1485592478265638975/image2.gif?ex=69c26d4f&is=69c11bcf&hm=0b9ab9831584f786d7837cf2d865fabc8e68f22d35b5d6299008981fc644f714&",
    "https://cdn.discordapp.com/attachments/1473571000305188896/1485592478672490496/image3.gif?ex=69c26d4f&is=69c11bcf&hm=ef03231a329fcd68535ce5f82837064bdd8faaea7b7c4cd33f2f28ab4a696d8f&",
    "https://cdn.discordapp.com/attachments/1473571000305188896/1485592479159025714/image4.gif?ex=69c26d50&is=69c11bd0&hm=b917584c808b99f0d75b1605d7bcdde61e5f53815482fb33277f33316e9f6897&",
    "https://cdn.discordapp.com/attachments/1473571000305188896/1485592479540576308/image5.gif?ex=69c26d50&is=69c11bd0&hm=86935b1233c15e334c2b7ea24a3f5a105bd7f8c402d59b3b8d39de577bbc7337&",
    "https://cdn.discordapp.com/attachments/1473571000305188896/1485592479846629437/image6.gif?ex=69c26d50&is=69c11bd0&hm=631ba750893eaee76155d86370a2bfd780b1daae0e9e6eca60060c2bca514a48&",
    "https://cdn.discordapp.com/attachments/1473571000305188896/1485592480236834876/image7.gif?ex=69c26d50&is=69c11bd0&hm=65f5ec5b0ca2eec7074ab005d39d30a62adf72a2cb3689f700aa30f5c75cb2df&",
    "https://cdn.discordapp.com/attachments/1473571000305188896/1485592480807387226/image8.gif?ex=69c26d50&is=69c11bd0&hm=028e385844b6247bd819f2110354745a73bca576cf99f1eff5b2fccd8baade5a&",
    "https://cdn.discordapp.com/attachments/1473571000305188896/1485592481256046642/image9.gif?ex=69c26d50&is=69c11bd0&hm=d4a955ddca0ec3361c8f2779b8d9247b3a97a11670069a87227c33baff1cc409&",
  ],
  boop: [
    "https://cdn.discordapp.com/attachments/1473569603673129043/1485590374687969360/image0.gif?ex=69c26b5a&is=69c119da&hm=c22013a9aec8dbca6776b78385eba990c9bfa0a92c76c666af6e47b5f72222ca&",
    "https://cdn.discordapp.com/attachments/1473569603673129043/1485590375321043035/image1.gif?ex=69c26b5a&is=69c119da&hm=b496389073c612b167397c533466aa66e20ab3612017720fae597cf89c5fd55d&",
    "https://cdn.discordapp.com/attachments/1473569603673129043/1485590375694471310/image2.gif?ex=69c26b5a&is=69c119da&hm=01eb193e3eb341e3cb5c49a8552b75cd9a1f0acd8d20ff949ad07b4601a11f9a&",
    "https://cdn.discordapp.com/attachments/1473569603673129043/1485590376197656657/image3.gif?ex=69c26b5a&is=69c119da&hm=730a994e390eb00c0585f24f0c01849bdd49a3199368861b875f13667681be1e&",
    "https://cdn.discordapp.com/attachments/1473569603673129043/1485590376822734928/image4.gif?ex=69c26b5a&is=69c119da&hm=8b291634af9413b29f72b76e20afb2623cf3e485e6738d47a2f413fdace9ddca&",
    "https://cdn.discordapp.com/attachments/1473569603673129043/1485590377422651433/image5.gif?ex=69c26b5a&is=69c119da&hm=9761dd914865f021eb526f8116de516a6b9b8f66c4bb4c3c09db7793ef34385a&",
    "https://cdn.discordapp.com/attachments/1473569603673129043/1485590378055864371/image6.gif?ex=69c26b5b&is=69c119db&hm=a14351a0e1c56a07b9f4803f1f917a12b0d50add2e29ea5a73a19e4d5fdb6cfe&",
    "https://cdn.discordapp.com/attachments/1473569603673129043/1485590378538336290/image7.gif?ex=69c26b5b&is=69c119db&hm=0738e9e4fe7519b91e4c98288e2279c8cc279447426f334e1b19e3bf543dea9f&",
    "https://cdn.discordapp.com/attachments/1473569603673129043/1485590379146379365/image8.gif?ex=69c26b5b&is=69c119db&hm=13b2f6a1fd66968b348c266a3b5cec6abfc27d919027906aad14bb258f3a1f09&",
    "https://cdn.discordapp.com/attachments/1473569603673129043/1485590379825987686/image9.gif?ex=69c26b5b&is=69c119db&hm=9a6c63ff62bdf0dd6b8ebc42c8747fbe3c32f46dee1a273155f2f861b2bf387b&",
  ],
  nom: [
    "https://cdn.discordapp.com/attachments/1473569649730781264/1485590745040814170/image0.gif?ex=69c26bb2&is=69c11a32&hm=17b843e1156e61edbd7ec917b2b7299d3d14ace916f6d2cbf5f14c2294620236&",
    "https://cdn.discordapp.com/attachments/1473569649730781264/1485590745602588742/image1.gif?ex=69c26bb2&is=69c11a32&hm=0acd87d62b603dbd3061be4090efceafdb2e16b772bcd553740bae8a35e0c9e1&",
    "https://cdn.discordapp.com/attachments/1473569649730781264/1485590746047447121/image2.gif?ex=69c26bb2&is=69c11a32&hm=2fb83f6cc6f1de3aea2b872fd98debaa04284174eeb51fd7f859aa4c8cff38d4&",
    "https://cdn.discordapp.com/attachments/1473569649730781264/1485590746672140408/image3.gif?ex=69c26bb2&is=69c11a32&hm=a8cd75e127e184790971823ebfbb7041456c0c7f7e4c7f49e489459964af53f7&",
    "https://cdn.discordapp.com/attachments/1473569649730781264/1485590747054084117/image4.gif?ex=69c26bb3&is=69c11a33&hm=699c6ce4350d9f78151d9ace79980058fec299ea96999a0e961f1176f8c40961&",
    "https://cdn.discordapp.com/attachments/1473569649730781264/1485590747620048966/image5.gif?ex=69c26bb3&is=69c11a33&hm=df1ccb4f06fdeb265e7c42076481571f5647d8e80e083467706f928cf6008243&",
    "https://cdn.discordapp.com/attachments/1473569649730781264/1485590748001992744/image6.gif?ex=69c26bb3&is=69c11a33&hm=15128fed3a54478aa9dc9c3a5def569c38c31abadb1bff02ae84e4f2251e9837&",
    "https://cdn.discordapp.com/attachments/1473569649730781264/1485590748593262592/image7.gif?ex=69c26bb3&is=69c11a33&hm=383144fed8ba97a5ba808052421246c7169e2c4b5feb4136dd98c4772b661c12&",
    "https://cdn.discordapp.com/attachments/1473569649730781264/1485590749222273044/image8.gif?ex=69c26bb3&is=69c11a33&hm=8c1e8e2eb67a48b9c794a1a484f19a43b374363259216ade99acc26bfefdf7b3&",
    "https://cdn.discordapp.com/attachments/1473569649730781264/1485590749851684964/image9.gif?ex=69c26bb3&is=69c11a33&hm=cda570b33a7b52c6fe88a95b367a8605a2a2e17369f8ee90e2ac53883d938e6c&",
  ],
  handhold: [
    "https://cdn.discordapp.com/attachments/1473569768014348329/1485590870450372659/image0.gif?ex=69c26bd0&is=69c11a50&hm=03a705cb525db170f0c5bd76ffbff8d4c897cfe06d3822a085120618eecb9776&",
    "https://cdn.discordapp.com/attachments/1473569768014348329/1485590870769143868/image1.gif?ex=69c26bd0&is=69c11a50&hm=c28959d44c1f29675c51e33e66838fc7a290900ef8b655314b062e2fa66a7598&",
    "https://cdn.discordapp.com/attachments/1473569768014348329/1485590871121596486/image2.gif?ex=69c26bd0&is=69c11a50&hm=cf6925a4a8f46cfc683ca3a081da8475afbb2df5100b47dd0294119bf96a47b6&",
    "https://cdn.discordapp.com/attachments/1473569768014348329/1485590871792550008/image3.gif?ex=69c26bd0&is=69c11a50&hm=ed7b3a1140532f5fdd7e11b06f5d86f69e5ca3d02fda1c221e44dcbefc7344df&",
    "https://cdn.discordapp.com/attachments/1473569768014348329/1485590872283287605/image4.gif?ex=69c26bd0&is=69c11a50&hm=cebfb785fe21c8a44148abccdc6d65218d40fd6ed0e4be0b79cfc847993db1c7&",
    "https://cdn.discordapp.com/attachments/1473569768014348329/1485590872669032489/image5.gif?ex=69c26bd0&is=69c11a50&hm=4d683aa77ee6f7afed632f6c38441a2655c336ce960f09373c8307ae4a6e2888&",
    "https://cdn.discordapp.com/attachments/1473569768014348329/1485590873034068098/image6.gif?ex=69c26bd1&is=69c11a51&hm=87e5ad2fd56d1c0eb94c38eb62c5a59c4a40c99204ba95a58f3dd14f739f1bf2&",
    "https://cdn.discordapp.com/attachments/1473569768014348329/1485590873466212352/image7.gif?ex=69c26bd1&is=69c11a51&hm=9272a2a87dfc99e7134566882b16a6be4f5e5a21c150331ee227e107424f4a19&",
    "https://cdn.discordapp.com/attachments/1473569768014348329/1485590873948291072/image8.gif?ex=69c26bd1&is=69c11a51&hm=90cab69a75f6f59cf1b296054d15e2d91bfabba086b0e7bba8d7e0988c20c38d&",
    "https://cdn.discordapp.com/attachments/1473569768014348329/1485590874262999110/image9.gif?ex=69c26bd1&is=69c11a51&hm=2aedacb5fd3790610fc0ccd9b7ec1f398088d2cba5dde5fe68b1748f36fb7ad0&",
  ],
  tickle: [
    "https://cdn.discordapp.com/attachments/1473569838545768655/1485591007188750416/image0.gif?ex=69c26bf1&is=69c11a71&hm=3ffdc4c807dbc161e5812a174f19f7b198a6f2c7c56ecf44fa32d0945c4af4ab&",
    "https://cdn.discordapp.com/attachments/1473569838545768655/1485591007524556800/image1.gif?ex=69c26bf1&is=69c11a71&hm=aa25e150046e612e1da4714b76c4480ec6c1181b2edd7ecd75424f896e405d2f&",
    "https://cdn.discordapp.com/attachments/1473569838545768655/1485591008048840785/image2.gif?ex=69c26bf1&is=69c11a71&hm=dffe321b4f3871a075ea5ce621087ae26ee7238ad480b805c6754c95060bd78e&",
    "https://cdn.discordapp.com/attachments/1473569838545768655/1485591008358957107/image3.gif?ex=69c26bf1&is=69c11a71&hm=574602438366b8917521ccf9be919713f0899ce35bc6aea1705580ec98199968&",
    "https://cdn.discordapp.com/attachments/1473569838545768655/1485591008623464608/image4.gif?ex=69c26bf1&is=69c11a71&hm=9ce24e21f2b1957e971962e415b0583237cd85de1e86897e13286c77849bf2f6&",
    "https://cdn.discordapp.com/attachments/1473569838545768655/1485591009101479976/image5.gif?ex=69c26bf1&is=69c11a71&hm=ff049a78c6381b6063a151fe07e9aef7d01dcb3ab6c868a2b462b1875cbebe6e&",
    "https://cdn.discordapp.com/attachments/1473569838545768655/1485591009386565672/image6.gif?ex=69c26bf1&is=69c11a71&hm=0fae51df1ce1fd6d3cca220d69a60cc5ef4f417c99f69ed2ab41114471f73e24&",
    "https://cdn.discordapp.com/attachments/1473569838545768655/1485591009760120882/image7.gif?ex=69c26bf1&is=69c11a71&hm=cc4170c85ce4af86d16b8af1fb846afef4c35ef3089f87a9927c5e8ea6674372&",
    "https://cdn.discordapp.com/attachments/1473569838545768655/1485591010179416087/image8.gif?ex=69c26bf1&is=69c11a71&hm=bfcde69caa0ec36af4856a8358b79ce38bd1ffae1b79d7564658776aa97809f5&",
    "https://cdn.discordapp.com/attachments/1473569838545768655/1485591010607239258/image9.gif?ex=69c26bf1&is=69c11a71&hm=df37ac06683527c06f95b13bb67ab4c44601503d7f24cd664740c4d5ce78e225&",
  ],
  feed: [
    "https://cdn.discordapp.com/attachments/1473569946041716758/1485591100541505546/image0.gif?ex=69c26c07&is=69c11a87&hm=c738dab1d211969474a05b02ddcfd8d993176bc8de6ef8ea73941b391a1052b8&",
    "https://cdn.discordapp.com/attachments/1473569946041716758/1485591101300539432/image1.gif?ex=69c26c07&is=69c11a87&hm=7d94c2d238efc3e873f5d923d9fade0a4409dd6853d788c35f33423c6f0120cc&",
    "https://cdn.discordapp.com/attachments/1473569946041716758/1485591101929951343/image2.gif?ex=69c26c07&is=69c11a87&hm=d7a3d928107b55419602e0047c9433c44ede27c978376652970cb330396598af&",
    "https://cdn.discordapp.com/attachments/1473569946041716758/1485591102479269970/image3.gif?ex=69c26c07&is=69c11a87&hm=3e0d1d7435a0eab093ed7e1c34bddbaae9cd3e8220b8de36a5aa8a23ce7e32bc&",
    "https://cdn.discordapp.com/attachments/1473569946041716758/1485591103850942546/image5.gif?ex=69c26c08&is=69c11a88&hm=47ffb88fc29977b3a8b41a5650de7ca261641a00a64579c8e8554375a85bebbe&",
    "https://cdn.discordapp.com/attachments/1473569946041716758/1485591103204753489/image4.gif?ex=69c26c07&is=69c11a87&hm=b68a79c617ec4659f2e897da9bac1d7463803dd582575d528363e2596252f431&",
    "https://cdn.discordapp.com/attachments/1473569946041716758/1485591104429625425/image6.gif?ex=69c26c08&is=69c11a88&hm=c75ad760107b2ee079218af0be10c49c6c487763371ca4bfdfef9713ffa09f4d&",
    "https://cdn.discordapp.com/attachments/1473569946041716758/1485591105117622293/image7.gif?ex=69c26c08&is=69c11a88&hm=c39c3d4145478da841b8038faa5f5b73f5f5186d881d7a20429243b7be33a014&",
    "https://cdn.discordapp.com/attachments/1473569946041716758/1485591105553698836/image8.gif?ex=69c26c08&is=69c11a88&hm=8f0211a62d279af5387a8b2ca209d93d3de5c9ecbceab54b430645096c7f8445&",
    "https://cdn.discordapp.com/attachments/1473569946041716758/1485591106115735633/image9.gif?ex=69c26c08&is=69c11a88&hm=2485d54bdd0c4dde014e18bfd771596d4a4e618421b1a94883c2faef885e95ab&",
  ],
};

function getRandomGif(action) {
  const gifs = actionGifs[action];
  if (!gifs || gifs.length === 0) {
    const fallbacks = [
      "https://cdn.discordapp.com/attachments/1452341424409542849/1473250119645135079/image0.gif?ex=69958698&is=69943518&hm=0057b74b34c97c0aaff9d08ac98ad0712e5e2e786e7bf3d39a6bc0196e6f1040&",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
  return gifs[Math.floor(Math.random() * gifs.length)];
}

// ============ BAD WORD FILTER CONFIG ============
const badWordFilter = {
  enabled: true,
  timeoutMs: (badWordData.timeoutSeconds ?? 30) * 1000, // stored in seconds, converted to ms
  warningMessage: "You used a prohibited word and have been muted."
};
// Merge static badWords file with runtime-added words from db
function getBadWordSet() {
  const extra = Array.isArray(db.customBadWords) ? db.customBadWords : [];
  return new Set([...badWords, ...extra].map(w => w.toLowerCase()));
}
const badWordSet = new Set(badWords.map(w => w.toLowerCase()));

// ============ AUTOMOD CONFIG ============
const automodConfig = {
  antiSpam: {
    enabled: false,
    maxMessages: 5,
    interval: 5000,
    action: "mute",
    duration: 300000
  },
  antiMassMention: {
    enabled: false,
    maxMentions: 5,
    action: "mute",
    duration: 300000
  },
  antiCaps: {
    enabled: false,
    percentage: 70,
    minLength: 10,
    action: "delete"
  },
  antiEmoji: {
    enabled: false,
    maxEmojis: 10,
    action: "delete"
  }
};

/* ================= CLIENT SETUP ================= */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User, Partials.GuildMember]
});

/* ================= PREFIX FUNCTIONS ================= */
function getPrefix(guildId) {
  if (!guildId) return DEFAULT_PREFIX;
  return db.prefixes?.[guildId] || DEFAULT_PREFIX;
}

function setPrefix(guildId, prefix) {
  if (!db.prefixes) db.prefixes = {};
  db.prefixes[guildId] = prefix;
  saveDB();
}

/* ================= DATABASE FUNCTIONS ================= */
function saveDB() {
  try {
    const tmp = "./database.tmp.json";
    const data = JSON.stringify(db, null, 2);
    fs.writeFileSync(tmp, data);
    fs.renameSync(tmp, "./database.json");
  } catch (err) {
    console.error("Failed to save database (tmp method):", err);
    // Direct write fallback
    try {
      fs.writeFileSync("./database.json", JSON.stringify(db, null, 2));
    } catch (err2) {
      console.error("Failed to save database (direct fallback):", err2);
    }
  }
}

function reloadDB() {
  try {
    const fresh = JSON.parse(fs.readFileSync("./database.json", "utf8"));
    // Reload global giveaway index
    if (fresh.giveaways) {
      if (!db.giveaways) db.giveaways = {};
      for (const [id, data] of Object.entries(fresh.giveaways)) {
        db.giveaways[id] = data;
        if (!data.ended && !data.cancelled) {
          giveaways.set(id, data);
        }
      }
    }
    // Reload guild data
    if (fresh.guilds) {
      db.guilds = fresh.guilds;
    }
  } catch (err) {
    console.error("reloadDB failed:", err);
  }
}


/* ================= PER-GUILD DATA HELPERS ================= */
/**
 * Returns the per-guild data object (creates/initializes if needed).
 * ALL guild-specific settings must be read/written through this function
 * to prevent cross-server data leakage.
 */
function guildData(guildId) {
  if (!db.guilds) db.guilds = {};
  if (!db.guilds[guildId]) {
    db.guilds[guildId] = {};
    initGuildDB(guildId);
  }
  return db.guilds[guildId];
}

function initGuildDB(guildId) {
  const g = db.guilds[guildId];

  if (!g.ticket) g.ticket = {
    enabled: false, channel: "", category: "", supportRole: "",
    logs: "", transcriptChannel: null,
    embed: { title: "", description: "", color: "", image: "", footer: "" },
    tickets: {}, maxTickets: 5, autoClose: false, dmOnClose: true
  };
  if (g.ticket.maxTickets === undefined) g.ticket.maxTickets = 5;
  if (g.ticket.autoClose  === undefined) g.ticket.autoClose  = false;
  if (g.ticket.dmOnClose  === undefined) g.ticket.dmOnClose  = true;

  if (!g.welcome) g.welcome = { enabled: false, channel: null, message: "Welcome {user} to {server}!", embedEnabled: true, dmEnabled: false, dmMessage: "" };
  if (!g.goodbye) g.goodbye = { enabled: false, channel: null, message: "Goodbye {user}! We'll miss you.", embedEnabled: true };
  if (!g.boost) g.boost = { enabled: false, channel: null, embed: { title: "", description: "", image: null, footer: "", timestamp: false, color: "" } };
  if (!g.logging) g.logging = { enabled: false, channel: null, events: { messageDelete:true, messageEdit:true, memberJoin:true, memberLeave:true, memberBan:true, memberUnban:true, roleCreate:true, roleDelete:true, channelCreate:true, channelDelete:true, voiceJoin:true, voiceLeave:true, voiceMove:true } };
  if (!g.antibot) g.antibot = { enabled: false, joinLogs: null, whitelist: [], action: "kick" };
  if (!g.antinuke) g.antinuke = { enabled: false, whitelist: [], logs: null, maxBans: 3, maxKicks: 3, maxChannelDelete: 3, maxRoleDelete: 3, punishment: "ban", timeWindow: 10000, events: {} };
  if (!g.antinuke.events) g.antinuke.events = {};
  if (!g.antilink) g.antilink = { enabled: false, whitelist: [], immuneRoles: [], immuneChannels: [], action: "delete" };
  if (!g.antispam) g.antispam = { enabled: false, maxMessages: 5, interval: 5000, action: "mute", duration: 300000 };
  if (!g.antimention) g.antimention = { enabled: false, maxMentions: 5, action: "mute", duration: 300000 };
  if (!g.automod) g.automod = { enabled: false, antiSpam: { enabled: false, maxMessages: 5, interval: 5000, action: "mute", duration: 300000 }, antiMassMention: { enabled: false, maxMentions: 5, action: "mute", duration: 300000 }, antiCaps: { enabled: false, percentage: 70, minLength: 10, action: "delete" }, antiEmoji: { enabled: false, maxEmojis: 10, action: "delete" }, antiInvite: { enabled: false, action: "delete" } };
  if (!g.confession) g.confession = { enabled: false, channel: null, logs: null, lastId: 0, bannedUsers: [], confessions: [] };
  if (!g.birthday) g.birthday = { enabled: false, channel: null, role: null, message: "🎂 Happy Birthday {user}! 🎉", users: {} };
  if (!g.autoresponder) g.autoresponder = { enabled: true, triggers: {} };
  if (!g.autoreact) g.autoreact = { enabled: true, triggers: {} };
  if (!g.media) g.media = { enabled: false, deleteLogsChannel: null, onlyChannels: [], logs: {} };
  if (!g.stickerChannel) g.stickerChannel = null;
  if (!g.stickyMessages) g.stickyMessages = {};
  if (!g.invites) g.invites = {};
  if (!g.inviteRewards) g.inviteRewards = {};
  if (!g.inviteSystem) g.inviteSystem = { enabled: true };
  if (!g.wallSystem) g.wallSystem = { enabled: false, immuneRoleId: null, quarantineRoleId: null, logChannel: null, quarantined: {} };
  if (!g.tempVoice) g.tempVoice = { enabled: false, createChannel: null, category: null, channels: {}, defaultName: "{user}'s Channel", defaultLimit: 0 };
  if (!g.joinDm) g.joinDm = { enabled: false, message: "Welcome to {server}!" };
  if (!g.warnings) g.warnings = {};
  if (!g.reactionRoles) g.reactionRoles = {};
  if (!g.levels) g.levels = { enabled: false, users: {}, channel: null, roles: {}, xpRate: 1, ignoredChannels: [], ignoredRoles: [], message: "🎉 {user} leveled up to level {level}!" };
  if (!g.economy) g.economy = { enabled: true, users: {}, daily: 100, work: { min: 50, max: 200 }, shopItems: {}, currency: "💰" };
  if (!g.counting) g.counting = {};
  if (!g.countingSystem) g.countingSystem = { enabled: true };
  if (!g.suggestions) g.suggestions = { enabled: false, channel: null, count: 0 };
  if (!g.reports) g.reports = { enabled: false, channel: null };
  if (!g.voiceRoles) g.voiceRoles = {};
  if (!g.modLogs) g.modLogs = null;
  if (!g.autoRoles) g.autoRoles = {};
  if (!g.buttonRoles) g.buttonRoles = {};
  if (!g.dropdownRoles) g.dropdownRoles = {};
  if (!g.connectionRoles) g.connectionRoles = {};
  if (!g.customRoles) g.customRoles = { enabled: false, maxRoles: 1, users: {} };
  if (!g.serverStats) g.serverStats = { enabled: false, channels: {} };
  if (!g.messageCount) g.messageCount = {};
  if (!g.polls) g.polls = {};
  if (!g.music) g.music = { enabled: true, queues: {}, djRole: null, defaultVolume: 100 };
  if (!g.fun) g.fun = { enabled: true };
  if (!g.disabledChannels) g.disabledChannels = [];
  if (!g.autoDeleteChannels) g.autoDeleteChannels = [];
  if (!g.autoDeleteTextOnly) g.autoDeleteTextOnly = {};
  if (!g.disabledCommands) g.disabledCommands = {};
  if (!g.nsfwProtection) g.nsfwProtection = true;
  if (!g.badWordImmuneRoles) g.badWordImmuneRoles = [];
  if (!g.badWordImmuneChannels) g.badWordImmuneChannels = [];
  if (!g.nsfwImmuneRoles) g.nsfwImmuneRoles = [];
  if (!g.nsfwImmuneChannels) g.nsfwImmuneChannels = [];
  if (!g.reminders) g.reminders = [];
  if (!g.reminderChannel) g.reminderChannel = {};
  if (!g.giveaways) g.giveaways = {};
  if (!g.stolenStickers) g.stolenStickers = {};
  if (!g.embeds) g.embeds = {};
  if (!g.afk) g.afk = { enabled: true, message: "{user} is AFK: {reason}", users: {} };
  if (!g.guildBotIdentity) g.guildBotIdentity = {};
  if (!g.selfRoles) g.selfRoles = {};
  if (!g.systems) g.systems = {};
  if (g.nsfwProtection === undefined) g.nsfwProtection = true;
}

/**
 * Safe guild-scoped field accessor.
 * Usage: getGF(guildId, 'ticket')
 * Returns the per-guild field, initializing if needed.
 */
function getGF(guildId, field) {
  if (!guildId) return null;
  return guildData(guildId)[field];
}

/**
 * Set a guild-scoped field value and save.
 * Usage: setGF(guildId, 'ticket', updatedObj)
 */
function setGF(guildId, field, value) {
  if (!guildId) return;
  guildData(guildId)[field] = value;
  saveDB();
}

function initDB() {
  // ── Global (top-level db) fields only ──
  // All per-guild fields are handled lazily by initGuildDB() inside guildData()

  // Per-guild feature toggles
  if (!db.guildSystems)  db.guildSystems  = {};
  // Global feature toggles (bot-owner level)
  if (!db.globalSystems) db.globalSystems = {};

  // Premium System
  if (!db.premium)         db.premium        = { users: {}, guilds: {} };
  if (!db.premium.users)   db.premium.users  = {};
  if (!db.premium.guilds)  db.premium.guilds = {};

  // Prefixes
  if (!db.prefixes) db.prefixes = {};

  // Global AFK (cross-server AFK storage)
  if (!db.globalAfk) db.globalAfk = {};

  // ── Re-hydrate in-memory caches from every guild already in the database ──
  if (db.guilds) {
    for (const gId of Object.keys(db.guilds)) {
      const g = guildData(gId); // ensures initGuildDB ran for this guild

      // Normalise auto-delete map (remove bad entries)
      if (g.autoDeleteTextOnly && typeof g.autoDeleteTextOnly === "object") {
        for (const [channelId, duration] of Object.entries(g.autoDeleteTextOnly)) {
          if (typeof duration !== "number" || duration <= 0) {
            delete g.autoDeleteTextOnly[channelId];
          }
        }
      }

      // Normalise global auto-responder keys to lowercase
      if (g.globalAutoResponders && typeof g.globalAutoResponders === "object") {
        const normalised = {};
        for (const [trigger, data] of Object.entries(g.globalAutoResponders)) {
          normalised[trigger.toLowerCase()] = data;
        }
        g.globalAutoResponders = normalised;
      }

      // Populate giveaways Map
      if (g.giveaways && typeof g.giveaways === "object") {
        for (const [id, data] of Object.entries(g.giveaways)) {
          giveaways.set(id, data);
        }
      }
    }
  }

  saveDB();

  // ── DEAD CODE removed (was referencing undefined _gId / guildId) ──
  // Per-guild defaults are now fully covered by initGuildDB(). Nothing more needed here.
  if (false) {
  
  // Welcome System
  if (!guildData(guildId).welcome) guildData(guildId).welcome = { 
    enabled: false, 
    channel: null, 
    message: "Welcome {user} to {server}!", 
    embedEnabled: true,
    dmEnabled: false,
    dmMessage: ""
  };
  
  // Goodbye System
  if (!guildData(guildId).goodbye) guildData(guildId).goodbye = { 
    enabled: false, 
    channel: null, 
    message: "Goodbye {user}! We'll miss you.", 
    embedEnabled: true 
  };
  
  // Greet (legacy support)
  if (!guildData(guildId).greet) guildData(guildId).greet = { channel: null, message: "" };
  
  // Embeds
  if (!guildData(guildId).embeds) guildData(guildId).embeds = {};
  if (!guildData(guildId).embedChannel) guildData(guildId).embedChannel = null;
  
  // Boost System
  if (!guildData(guildId).boost) {
    guildData(guildId).boost = {
      enabled: false,
      channel: null,
      embed: {
        title: "",
        description: "",
        image: null,
        footer: "",
        timestamp: false,
        color: ""
      }
    };
  }
  
  // AFK System
  if (!guildData(guildId).afk) guildData(guildId).afk = { 
    enabled: true, 
    message: "{user} is AFK: {reason}", 
    users: {} 
  };
  
  // No-Prefix Users
  if (!guildData(guildId).noPrefixUsers) guildData(guildId).noPrefixUsers = [];

  // Disabled Channels
  if (!guildData(guildId).disabledChannels) guildData(guildId).disabledChannels = [];
  
  // Disabled Commands per guild
  if (!guildData(guildId).disabledCommands) guildData(guildId).disabledCommands = {};
  
  // Auto Delete Channels
  if (!guildData(guildId).autoDeleteChannels) guildData(guildId).autoDeleteChannels = [];
  if (!guildData(guildId).autoDeleteTextOnly) guildData(guildId).autoDeleteTextOnly = {};
  
  // Ticket System
  if (!guildData(guildId).ticket) {
    guildData(guildId).ticket = {
      enabled: false,
      channel: "",
      category: "",
      supportRole: "",
      logs: "",
      transcriptChannel: null,
      embed: { title: "", description: "", color: "", image: "", footer: "" },
      tickets: {},
      maxTickets: 5,
      autoClose: false,
      dmOnClose: true
    };
  }
  if (guildData(guildId).ticket && guildData(guildId).ticket.maxTickets === undefined) guildData(guildId).ticket.maxTickets = 5;
  if (guildData(guildId).ticket && guildData(guildId).ticket.autoClose === undefined) guildData(guildId).ticket.autoClose = false;
  if (guildData(guildId).ticket && guildData(guildId).ticket.dmOnClose === undefined) guildData(guildId).ticket.dmOnClose = true;
  
  // Moderation Logs
  if (!guildData(guildId).modLogs) guildData(guildId).modLogs = null;
  
  // Confession System
  if (!guildData(guildId).confession) guildData(guildId).confession = {
    enabled: false,
    channel: null,
    logs: null,
    lastId: 0,
    bannedUsers: [],
    confessions: []
  };
  // Legacy support
  if (!guildData(guildId).confessions) guildData(guildId).confessions = [];
  if (!guildData(guildId).confessionChannel) guildData(guildId).confessionChannel = null;
  if (!guildData(guildId).confessionLogs) guildData(guildId).confessionLogs = null;
  if (!guildData(guildId).confessionLastId) guildData(guildId).confessionLastId = 0;
  if (!guildData(guildId).confessionBannedUsers) guildData(guildId).confessionBannedUsers = [];
  
  // Role Systems
  if (!guildData(guildId).autoRoles) guildData(guildId).autoRoles = {};
  if (!guildData(guildId).selfRoles) guildData(guildId).selfRoles = {};
  if (!guildData(guildId).buttonRoles) guildData(guildId).buttonRoles = {};
  if (!guildData(guildId).dropdownRoles) guildData(guildId).dropdownRoles = {};
  if (!guildData(guildId).connectionRoles) guildData(guildId).connectionRoles = {};
  if (!guildData(guildId).customRoles) guildData(guildId).customRoles = { enabled: false, maxRoles: 1, users: {} };
  
  // Statistics
  if (!guildData(guildId).messageCount) guildData(guildId).messageCount = {};
  
  // Birthday System
  if (!guildData(guildId).birthday) guildData(guildId).birthday = {
    enabled: false,
    channel: null,
    role: null,
    message: "🎂 Happy Birthday {user}! 🎉",
    users: {}
  };
  // Legacy support
  if (!guildData(guildId).birthdays) guildData(guildId).birthdays = {};
  if (!guildData(guildId).birthdayRoles) guildData(guildId).birthdayRoles = {};
  if (!guildData(guildId).birthdayMessages) guildData(guildId).birthdayMessages = {};
  if (!guildData(guildId).birthdayChecked) guildData(guildId).birthdayChecked = {};
  
  // Filter Immunities
  if (!guildData(guildId).badWordImmuneRoles) guildData(guildId).badWordImmuneRoles = [];
  if (!guildData(guildId).badWordImmuneChannels) guildData(guildId).badWordImmuneChannels = [];
  if (!guildData(guildId).nsfwImmuneRoles) guildData(guildId).nsfwImmuneRoles = [];
  if (!guildData(guildId).nsfwImmuneChannels) guildData(guildId).nsfwImmuneChannels = [];
  
  // Reminders
  if (!guildData(guildId).reminders) guildData(guildId).reminders = [];
  if (!guildData(guildId).reminderChannel) guildData(guildId).reminderChannel = {};
  
  // Auto Responders
  if (!guildData(guildId).autoresponder) guildData(guildId).autoresponder = { enabled: true, triggers: {} };
  if (!guildData(guildId).globalAutoResponders) guildData(guildId).globalAutoResponders = {};
  
  // Auto React
  if (!guildData(guildId).autoreact) guildData(guildId).autoreact = { enabled: true, triggers: {} };
  if (!guildData(guildId).autoReact) guildData(guildId).autoReact = {};
  
  // Media System
  if (!guildData(guildId).media) guildData(guildId).media = {
    enabled: false,
    deleteLogsChannel: null,
    onlyChannels: [],
    logs: {}
  };
  if (!guildData(guildId).mediaDeleteLogs) guildData(guildId).mediaDeleteLogs = {};
  if (!guildData(guildId).mediaDeleteChannel) guildData(guildId).mediaDeleteChannel = null;
  if (!guildData(guildId).mediaOnlyChannels) guildData(guildId).mediaOnlyChannels = [];
  
  // Stickers
  if (!guildData(guildId).stolenStickers) guildData(guildId).stolenStickers = {};
  if (!guildData(guildId).stickerChannel) guildData(guildId).stickerChannel = null;
  
  // Giveaways
  if (!guildData(guildId).giveaways) guildData(guildId).giveaways = {};
  if (!guildData(guildId).giveawaySystem) guildData(guildId).giveawaySystem = { enabled: true };

  // Per-guild feature toggles
  if (!db.guildSystems) db.guildSystems = {};

  // Global feature toggles (bot-owner level, applies across all servers)
  if (!db.globalSystems) db.globalSystems = {};

  // Premium System
  if (!db.premium) db.premium = {
    users: {},   // userId -> { plan, expiresAt, activatedBy, activatedAt }
    guilds: {}   // guildId -> { plan, expiresAt, activatedBy, activatedAt }
  };
  if (!db.premium.users)  db.premium.users  = {};
  if (!db.premium.guilds) db.premium.guilds = {};

  // Prefixes
  if (!db.prefixes) db.prefixes = {};
  
  // Roles
  if (!guildData(guildId).roles) guildData(guildId).roles = { selfRoles: {}, connectionRoles: {}, buttonRoles: {}, dropdownRoles: {} };
  
  // Logging System
  if (!guildData(guildId).logging) guildData(guildId).logging = { 
    enabled: false, 
    channel: null, 
    events: {
      messageDelete: true,
      messageEdit: true,
      memberJoin: true,
      memberLeave: true,
      memberBan: true,
      memberUnban: true,
      roleCreate: true,
      roleDelete: true,
      channelCreate: true,
      channelDelete: true,
      voiceJoin: true,
      voiceLeave: true,
      voiceMove: true
    } 
  };
  
  // Antibot System
  if (!guildData(guildId).antibot) guildData(guildId).antibot = { 
    enabled: false, 
    joinLogs: null, 
    whitelist: [],
    action: "kick" // kick, ban
  };
  
  // Antinuke System
  if (!guildData(guildId).antinuke) guildData(guildId).antinuke = { 
    enabled: false, 
    whitelist: [], 
    logs: null,
    maxBans: 3,
    maxKicks: 3,
    maxChannelDelete: 3,
    maxRoleDelete: 3,
    punishment: "ban",
    timeWindow: 10000,
    events: {}
  };
  if (!guildData(guildId).antinuke.events) guildData(guildId).antinuke.events = {};
  
  // Antilink System
  if (!guildData(guildId).antilink) guildData(guildId).antilink = { 
    enabled: false, 
    whitelist: [], 
    immuneRoles: [], 
    immuneChannels: [],
    action: "delete" // delete, warn, mute, kick, ban
  };
  
  // Antispam System
  if (!guildData(guildId).antispam) guildData(guildId).antispam = { 
    enabled: false, 
    maxMessages: 5, 
    interval: 5000, 
    action: "mute", 
    duration: 300000 
  };
  
  // Antimention System
  if (!guildData(guildId).antimention) guildData(guildId).antimention = { 
    enabled: false, 
    maxMentions: 5, 
    action: "mute", 
    duration: 300000 
  };
  
  // Automod
  if (!guildData(guildId).automod) guildData(guildId).automod = {
    enabled: false,
    antiSpam: { enabled: false, maxMessages: 5, interval: 5000, action: "mute", duration: 300000 },
    antiMassMention: { enabled: false, maxMentions: 5, action: "mute", duration: 300000 },
    antiCaps: { enabled: false, percentage: 70, minLength: 10, action: "delete" },
    antiEmoji: { enabled: false, maxEmojis: 10, action: "delete" },
    antiInvite: { enabled: false, action: "delete" }
  };
  
  // Invites Tracking
  if (!guildData(guildId).invites) guildData(guildId).invites = {};
  if (!guildData(guildId).inviteRewards) guildData(guildId).inviteRewards = {};
  if (!guildData(guildId).inviteSystem) guildData(guildId).inviteSystem = { enabled: true };
  
  // Sticky Messages
  if (!guildData(guildId).stickyMessages) guildData(guildId).stickyMessages = {};
  if (!guildData(guildId).stickySystem) guildData(guildId).stickySystem = { enabled: true };
  
  // Wall System (Role Quarantine)
  if (!guildData(guildId).wallSystem) guildData(guildId).wallSystem = {
    enabled: false,
    immuneRoleId: null,
    quarantineRoleId: null,
    logChannel: null,
    quarantined: {}
  };
  // Migrate old wall structure
  if (guildData(guildId).wallSystem && guildData(guildId).wallSystem.messages !== undefined) {
    guildData(guildId).wallSystem = {
      enabled: guildData(guildId).wallSystem.enabled || false,
      immuneRoleId: guildData(guildId).wallSystem.immuneRoleId || null,
      quarantineRoleId: guildData(guildId).wallSystem.quarantineRoleId || null,
      logChannel: guildData(guildId).wallSystem.logChannel || null,
      quarantined: guildData(guildId).wallSystem.quarantined || {}
    };
  }
  
  // NSFW Protection
  if (guildData(guildId).nsfwProtection === undefined) guildData(guildId).nsfwProtection = true;
  
  // Temp Voice
  if (!guildData(guildId).tempVoice) guildData(guildId).tempVoice = { 
    enabled: false, 
    createChannel: null, 
    category: null, 
    channels: {},
    defaultName: "{user}'s Channel",
    defaultLimit: 0
  };
  
  // Join DM
  if (!guildData(guildId).joinDm) guildData(guildId).joinDm = { 
    enabled: false, 
    message: "Welcome to {server}!" 
  };
  
  // Warnings
  if (!guildData(guildId).warnings) guildData(guildId).warnings = {};
  
  // User Info
  if (!guildData(guildId).userInfo) guildData(guildId).userInfo = {};
  
  // Server Stats
  if (!guildData(guildId).serverStats) guildData(guildId).serverStats = { enabled: false, channels: {} };
  
  // Reaction Roles
  if (!guildData(guildId).reactionRoles) guildData(guildId).reactionRoles = {};

  // Per-Guild Bot Identity (nickname, custom avatar/banner for embeds)
  if (!guildData(guildId).guildBotIdentity) guildData(guildId).guildBotIdentity = {};
  
  // Polls
  if (!guildData(guildId).polls) guildData(guildId).polls = {};
  
  // Music
  if (!guildData(guildId).music) guildData(guildId).music = { 
    enabled: true,
    queues: {}, 
    djRole: null,
    defaultVolume: 100
  };
  
  // Levels
  if (!guildData(guildId).levels) guildData(guildId).levels = { 
    enabled: false, 
    users: {}, 
    channel: null, 
    roles: {}, 
    xpRate: 1, 
    ignoredChannels: [], 
    ignoredRoles: [],
    message: "🎉 {user} leveled up to level {level}!"
  };
  
  // Economy
  if (!guildData(guildId).economy) guildData(guildId).economy = { 
    enabled: true,
    users: {}, 
    daily: 100, 
    work: { min: 50, max: 200 }, 
    shopItems: {},
    currency: "💰"
  };
  
  // Counting
  if (!guildData(guildId).counting) guildData(guildId).counting = {};
  if (!guildData(guildId).countingSystem) guildData(guildId).countingSystem = { enabled: true };
  
  // Suggestions
  if (!guildData(guildId).suggestions) guildData(guildId).suggestions = { 
    enabled: false,
    channel: null, 
    count: 0 
  };
  
  // Reports
  if (!guildData(guildId).reports) guildData(guildId).reports = { 
    enabled: false,
    channel: null 
  };
  
  // Voice Roles
  if (!guildData(guildId).voiceRoles) guildData(guildId).voiceRoles = {};
  
  // Fun System
  if (!guildData(guildId).fun) guildData(guildId).fun = { enabled: true };
  
  // Load disabled channels
  disabledChannels.clear();
  if (Array.isArray(guildData(guildId).disabledChannels)) {
    for (const id of guildData(guildId).disabledChannels) {
      (() => { const _dc = guildData(guildId).disabledChannels; if (!_dc.includes(id)) _dc.push(id); })();
    }
  }

  // Load auto delete
  autoDeleteTextOnly.clear();
  if (guildData(guildId).autoDeleteTextOnly && typeof guildData(guildId).autoDeleteTextOnly === "object") {
    for (const [channelId, duration] of Object.entries(guildData(guildId).autoDeleteTextOnly)) {
      if (typeof duration === "number" && duration > 0) {
        guildData(guildId).autoDeleteTextOnly[channelId] = duration;
      }
    }
  }

  // Load auto responders
  globalAutoResponders.clear();
  for (const [trigger, data] of Object.entries(guildData(guildId).globalAutoResponders)) {
    guildData(guildId).globalAutoResponders[trigger.toLowerCase()] = data;
  }

  // Load stolen stickers
  stolenStickers.clear();
  for (const [id, data] of Object.entries(guildData(guildId).stolenStickers)) {
    guildData(guildId).stolenStickers[id] = data;
  }

  // Load giveaways
  for (const [id, data] of Object.entries(guildData(guildId).giveaways)) {
    giveaways.set(id, data);
  }
  
  } // end if(false) — dead code guard
}

initDB();

/* ================= HELPER FUNCTIONS ================= */

function parseDuration(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') return null;
  
  const regex = /^(\d+(?:\.\d+)?)\s*(s|sec|second|seconds|m|min|minute|minutes|h|hr|hour|hours|d|day|days|w|week|weeks)$/i;
  const match = durationStr.trim().match(regex);
  
  if (!match) {
    const simpleMatch = durationStr.toLowerCase().match(/^(\d+)([smhdw])$/);
    if (!simpleMatch) return null;
    
    const value = parseInt(simpleMatch[1], 10);
    const unit = simpleMatch[2];
    
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 };
    return value * (multipliers[unit] || 0);
  }
  
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  
  if (value <= 0 || !isFinite(value)) return null;
  
  const multipliers = {
    s: 1000, sec: 1000, second: 1000, seconds: 1000,
    m: 60000, min: 60000, minute: 60000, minutes: 60000,
    h: 3600000, hr: 3600000, hour: 3600000, hours: 3600000,
    d: 86400000, day: 86400000, days: 86400000,
    w: 604800000, week: 604800000, weeks: 604800000
  };
  
  return Math.floor(value * (multipliers[unit] || 0));
}

function formatDuration(ms) {
  if (ms < 0) ms = 0;
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

async function safeDelete(msg) {
  try {
    if (!msg || msg.deleted) return;
    await msg.delete();
  } catch (err) {
    if (err.code !== 10008) {
      console.error("Delete failed:", err);
    }
  }
}

function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function autoDeleteReply(msg, text, timeout = 10000) {
  return msg.reply(text).then(m => {
    setTimeout(() => m.delete().catch(() => {}), timeout);
  }).catch(() => {});
}

function getMediaType(url, contentType = "") {
  const ext = url.split(".").pop()?.toLowerCase().split("?")[0];
  if (contentType.includes("video") || ["mp4", "webm", "mov", "avi"].includes(ext)) return "video";
  if (contentType.includes("gif") || ext === "gif") return "gif";
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "image";
  return "image";
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    }).on("error", reject);
  });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkCooldown(userId, command, cooldownMs = 3000) {
  const key = `${userId}-${command}`;
  const now = Date.now();
  if (userCooldowns.has(key)) {
    const expiry = userCooldowns.get(key);
    if (now < expiry) {
      return expiry - now;
    }
  }
  userCooldowns.set(key, now + cooldownMs);
  return 0;
}

function bold(text) {
  return `**${text}**`;
}

function formatSuccess(text) {
  return `${EMOJIS.success} ${bold(text)}`;
}

function formatError(text) {
  return `${EMOJIS.error} ${bold(text)}`;
}

function formatWarning(text) {
  return `${EMOJIS.warning} ${bold(text)}`;
}

function formatInfo(text) {
  return `${EMOJIS.info} ${bold(text)}`;
}

// ================= FUN COMMAND HANDLER =================
// Command configuration with metadata
const funCommands = {
  // Commands that require a target user
  hug: {
    requiresTarget: true,
    allowSelf: false,
    selfMessage: "You can't hug yourself!",
    description: (author, target) => `${author} hugs ${target}!`,
    color: 0xFFB6C1,
    action: "hug"
  },
  kiss: {
    requiresTarget: true,
    allowSelf: false,
    selfMessage: "You can't kiss yourself!",
    description: (author, target) => `${author} kisses ${target}!`,
    color: 0xFF69B4,
    action: "kiss"
  },
  pat: {
    aliases: ["headpat"],
    requiresTarget: true,
    allowSelf: false,
    selfMessage: "You can't pat yourself!",
    description: (author, target) => `${author} pats ${target}!`,
    color: 0xFFC0CB,
    action: "pat"
  },
  slap: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "Why would you slap yourself?",
    description: (author, target) => `${author} slaps ${target}!`,
    color: 0xFF4500,
    action: "slap"
  },
  cuddle: {
    aliases: ["snuggle"],
    requiresTarget: true,
    allowSelf: false,
    selfMessage: "You can't cuddle yourself!",
    description: (author, target) => `${author} cuddles ${target}!`,
    color: 0xFFDAB9,
    action: "cuddle"
  },
  poke: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "Stop poking yourself!",
    description: (author, target) => `${author} pokes ${target}!`,
    color: 0x87CEEB,
    action: "poke"
  },
  wave: {
    aliases: ["hi"],
    requiresTarget: false,
    description: (author, target) => target ? `${author} waves at ${target}!` : `${author} waves!`,
    color: 0xFFD700,
    action: "wave"
  },
  bite: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "Ouch! Don't bite yourself!",
    description: (author, target) => `${author} bites ${target}!`,
    color: 0x8B0000,
    action: "bite"
  },
  cry: {
    requiresTarget: false,
    description: (author) => `${author} is crying!`,
    color: 0x4682B4,
    action: "cry"
  },
  dance: {
    requiresTarget: false,
    description: (author) => `${author} is dancing!`,
    color: 0xFF1493,
    action: "dance"
  },
  blush: {
    requiresTarget: false,
    description: (author) => `${author} is blushing!`,
    color: 0xFFB6C1,
    action: "blush"
  },
  smile: {
    requiresTarget: false,
    description: (author) => `${author} is smiling!`,
    color: 0xFFFF00,
    action: "smile"
  },
  highfive: {
    aliases: ["hi5"],
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "You can't high five yourself!",
    description: (author, target) => `${author} high fives ${target}!`,
    color: 0x00FF00,
    action: "highfive"
  },
  bonk: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "Don't bonk yourself!",
    description: (author, target) => `${author} bonks ${target}! Go to horny jail!`,
    color: 0xA0522D,
    action: "bonk"
  },
  yeet: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "You yeet yourself into the sky!",
    description: (author, target) => `${author} yeets ${target}!`,
    color: 0x9400D3,
    action: "yeet"
  },
  punch: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "Why punch yourself?",
    description: (author, target) => `${author} punches ${target}!`,
    color: 0xDC143C,
    action: "punch"
  },
  kill: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "Please don't!",
    description: (author, target) => `${author} attacks ${target}!`,
    color: 0x000000,
    action: "kill"
  },
  wink: {
    requiresTarget: false,
    description: (author, target) => target ? `${author} winks at ${target}!` : `${author} winks!`,
    color: 0xFF69B4,
    action: "wink"
  },
  pout: {
    requiresTarget: false,
    description: (author) => `${author} is pouting!`,
    color: 0xFFA07A,
    action: "pout"
  },
  laugh: {
    aliases: ["lol"],
    requiresTarget: false,
    description: (author) => `${author} is laughing!`,
    color: 0xFFD700,
    action: "laugh"
  },
  confused: {
    aliases: ["huh"],
    requiresTarget: false,
    description: (author) => `${author} is confused!`,
    color: BOT_COLOR,
    action: "confused"
  },
  sleep: {
    aliases: ["zzz"],
    requiresTarget: false,
    description: (author) => `${author} is sleeping!`,
    color: 0x191970,
    action: "sleep"
  },
  run: {
    requiresTarget: false,
    description: (author) => `${author} is running away!`,
    color: 0x32CD32,
    action: "run"
  },
  lick: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "You can't lick yourself!",
    description: (author, target) => `${author} licks ${target}!`,
    color: 0xFF1493,
    action: "lick"
  },
  stare: {
    requiresTarget: false,
    description: (author, target) => target ? `${author} stares at ${target}!` : `${author} is staring...`,
    color: 0x2F4F4F,
    action: "stare"
  },
  thumbsup: {
    aliases: ["thumbs"],
    requiresTarget: false,
    description: (author) => `${author} gives a thumbs up!`,
    color: 0x00FF00,
    action: "thumbsup"
  },
  facepalm: {
    aliases: ["fp"],
    requiresTarget: false,
    description: (author) => `${author} facepalms!`,
    color: 0x8B4513,
    action: "facepalm"
  },
  shrug: {
    requiresTarget: false,
    description: (author) => `${author} shrugs!`,
    color: 0xA9A9A9,
    action: "shrug"
  },
  boop: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "You booped your own nose!",
    description: (author, target) => `${author} boops ${target}'s nose!`,
    color: 0xFFB6C1,
    action: "boop"
  },
  nom: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "You can't nom yourself!",
    description: (author, target) => `${author} noms ${target}!`,
    color: 0xFFD700,
    action: "nom"
  },
  handhold: {
    aliases: ["holdhands"],
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "You hold your own hand...",
    description: (author, target) => `${author} holds ${target}'s hand!`,
    color: 0xFFB6C1,
    action: "handhold"
  },
  tickle: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "You tickle yourself and giggle!",
    description: (author, target) => `${author} tickles ${target}!`,
    color: 0xFFD700,
    action: "tickle"
  },
  feed: {
    requiresTarget: true,
    allowSelf: true,
    selfMessage: "You feed yourself!",
    description: (author, target) => `${author} feeds ${target}!`,
    color: 0xFFA500,
    action: "feed"
  }
};

// Build command lookup with aliases
const commandLookup = {};
Object.keys(funCommands).forEach(cmdName => {
  const cmdConfig = funCommands[cmdName];
  commandLookup[cmdName] = cmdConfig;
  
  // Add aliases
  if (cmdConfig.aliases) {
    cmdConfig.aliases.forEach(alias => {
      commandLookup[alias] = cmdConfig;
    });
  }
});

// ================= UNIFIED FUN COMMAND HANDLER =================
// This should be placed in your main message handler
function handleFunCommand(cmd, msg, PREFIX) {
  const guildId = msg.guildId;
  const cmdConfig = commandLookup[cmd];
  
  if (!cmdConfig) {
    return false; // Not a fun command
  }
  
  // Check if fun commands are enabled
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ 
      embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] 
    });
  }
  
  const target = msg.mentions.users.first();
  
  // Handle commands that require a target
  if (cmdConfig.requiresTarget && !target) {
    return msg.reply({ 
      embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}${cmd} @user\``)] 
    });
  }
  
  // Handle self-targeting
  if (target && target.id === msg.author.id) {
    if (cmdConfig.allowSelf === false) {
      return msg.reply({ 
        embeds: [createErrorEmbed("Self Action", cmdConfig.selfMessage)] 
      });
    } else if (cmdConfig.selfMessage) {
      return msg.reply({ content: cmdConfig.selfMessage });
    }
  }
  
  // Get the GIF and create embed
  const gifUrl = getRandomGif(cmdConfig.action);
  const ARROW = "<a:zzz_arrow_hash:1485872093437497434>";
  const EXCL  = "<a:zzz_Exclamation:1485872115662983288>";
  const embed = new EmbedBuilder()
    .setDescription(`${ARROW} ${cmdConfig.description(msg.author, target)} ${EXCL}`)
    .setImage(gifUrl)
    .setColor(BOT_COLOR)
    .setTimestamp();
  
  return msg.reply({ embeds: [embed] });
}

/* ================= COMMAND ENABLE/DISABLE FUNCTIONS ================= */

function isCommandDisabled(guildId, command) {
  const cmds = guildData(guildId).disabledCommands;
  if (Array.isArray(cmds)) return cmds.includes(command.toLowerCase());
  return false;
}

function disableCommand(guildId, command) {
  const g = guildData(guildId);
  if (!Array.isArray(g.disabledCommands)) g.disabledCommands = [];
  const cmd = command.toLowerCase();
  if (!g.disabledCommands.includes(cmd)) g.disabledCommands.push(cmd);
  saveDB();
}

function enableCommand(guildId, command) {
  const g = guildData(guildId);
  if (!Array.isArray(g.disabledCommands)) g.disabledCommands = [];
  g.disabledCommands = g.disabledCommands.filter(c => c !== command.toLowerCase());
  saveDB();
}

function getDisabledCommands(guildId) {
  const cmds = guildData(guildId).disabledCommands;
  return Array.isArray(cmds) ? cmds : [];
}

/* ================= SYSTEM ENABLE/DISABLE FUNCTIONS ================= */

function isSystemEnabled(guildId, system) {
  if (!db.guildSystems) db.guildSystems = {};
  if (!db.guildSystems[guildId]) db.guildSystems[guildId] = {};
  const gs = db.guildSystems[guildId];
  const key = system.toLowerCase();
  // Default: all systems disabled unless explicitly set to true
  return gs[key] === true;
}

function toggleSystem(system, enabled, guildId) {
  if (!guildId) return false;
  const key = system.toLowerCase();
  const validSystems = ALL_SYSTEMS.map(s => s.name);
  if (!validSystems.includes(key)) return false;
  if (!db.guildSystems) db.guildSystems = {};
  if (!db.guildSystems[guildId]) db.guildSystems[guildId] = {};
  db.guildSystems[guildId][key] = enabled;
  saveDB();
  return true;
}

function isSystemEnabledGlobal(system) {
  if (!db.globalSystems) db.globalSystems = {};
  return db.globalSystems[system.toLowerCase()] !== false;
}

function toggleSystemGlobal(system, enabled) {
  const key = system.toLowerCase();
  const validSystems = ALL_SYSTEMS.map(s => s.name);
  if (!validSystems.includes(key)) return false;
  if (!db.globalSystems) db.globalSystems = {};
  db.globalSystems[key] = enabled;
  saveDB();
  return true;
}

/* ================= EMBED BUILDER HELPER ================= */

function buildEmbedFromData(data) {
  const embed = new EmbedBuilder().setColor(data.color || BOT_COLOR);
  if (data.title) embed.setTitle(data.title);
  if (data.description) embed.setDescription(data.description);
  if (data.author?.name) embed.setAuthor({ name: data.author.name, iconURL: data.author.iconURL || undefined, url: data.author.url || undefined });
  if (data.footer?.text) embed.setFooter({ text: data.footer.text, iconURL: data.footer.iconURL || undefined });
  if (data.thumbnail) embed.setThumbnail(data.thumbnail);
  if (data.image) embed.setImage(data.image);
  if (data.timestamp) embed.setTimestamp();
  if (data.fields && data.fields.length > 0) embed.addFields(data.fields.slice(0, 25));
  return embed;
}

// Returns the max embed fields allowed for a user/guild
function getMaxEmbedFields(userId, guildId) {
  if (isPremiumUser(userId) || isPremiumGuild(guildId)) {
    const plan = db.premium?.users?.[userId]?.plan || db.premium?.guilds?.[guildId]?.plan;
    if (plan === "lifetime") return 25;
    if (plan === "pro")      return 15;
    if (plan === "basic")    return 10;
  }
  return 5;
}

const ARROW_EMOJI = "<a:zzz_arrow_hash:1485872093437497434>";
const EXCL_EMOJI  = "<a:zzz_Exclamation:1485872115662983288>";

function wrapDescriptionFields(text) {
  if (!text) return text;
  return text.split("\n").map(line => {
    if (line.includes(ARROW_EMOJI) || line.includes(EXCL_EMOJI)) return line;
    const trimmed = line.trim();
    if (!trimmed) return line;
    // Skip lines that are already arrow sub-bullets, giveaway emojis, blockquotes, code or list bullets
    if (
      trimmed.startsWith("<a:arrow_arrow") ||
      trimmed.startsWith("<a:giveaway") ||
      trimmed.startsWith(">") ||
      trimmed.startsWith("`") ||
      trimmed.startsWith("•") ||
      trimmed.startsWith("-") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("#") ||
      trimmed.startsWith("http")
    ) return line;
    // Wrap lines that start with **bold** (field labels like **User:** value or standalone **Title**)
    if (/^\*\*[^*]+\*\*/.test(trimmed)) {
      return `${ARROW_EMOJI} ${trimmed} ${EXCL_EMOJI}`;
    }
    return line;
  }).join("\n");
}

function createEmbed(options = {}) {
  const embed = new EmbedBuilder()
    .setColor(options.color || BOT_COLOR)
    .setTimestamp();
  
  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(wrapDescriptionFields(options.description));
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  
  // Fix footer handling
  if (options.footer) {
    if (typeof options.footer === 'string') {
      embed.setFooter({ text: options.footer, iconURL: options.footerIcon });
    } else {
      embed.setFooter(options.footer);
    }
  }
  
  if (options.author) embed.setAuthor({ name: options.author, iconURL: options.authorIcon });
  if (options.fields) embed.addFields(options.fields);
  
  return embed;
}

function createSuccessEmbed(title, description, fields = []) {
  return createEmbed({
    title: `${EMOJIS.success} ${bold(title)}`,
    description: description,
    color: BOT_COLOR,
    fields: fields
  });
}

function createErrorEmbed(title, description) {
  return createEmbed({
    title: `${EMOJIS.error} ${bold(title)}`,
    description: description,
    color: BOT_COLOR
  });
}

function createInfoEmbed(title, description, fields = []) {
  return createEmbed({
    title: `${EMOJIS.info} ${bold(title)}`,
    description: description,
    fields: fields
  });
}

function createWarningEmbed(title, description) {
  return createEmbed({
    title: `${EMOJIS.warning} ${bold(title)}`,
    description: description,
    color: BOT_COLOR
  });
}

/* ================= AUTO RESPONDER FUNCTIONS ================= */

function addAutoResponder(guildId, trigger, response, reactions = [], userId) {
  if (!guildData(guildId).autoresponder.enabled) return null;
  
  const key = trigger.toLowerCase();
  const data = {
    trigger: trigger,
    response: response || null,
    reactions: reactions || [],
    guildId: guildId,
    createdBy: userId,
    createdAt: Date.now(),
    usageCount: 0,
    enabled: true
  };

  guildData(guildId).globalAutoResponders[key] = data;
  guildData(guildId).globalAutoResponders[key] = data;
  
  if (!_gar.triggers) _gar.triggers = {};
  _gar.triggers[key] = data;
  
  saveDB();
  return data;
}

function removeAutoResponder(guildId, trigger) {
  const key = trigger.toLowerCase();
  if (globalAutoResponders.has(key)) {
    globalAutoResponders.delete(key);
    delete guildData(guildId).globalAutoResponders[key];
    
    if (_gar.triggers) {
    delete _gar.triggers[key];
    }
    
    saveDB();
    return true;
  }
  return false;
}

function clearAutoResponders(guildId) {
  let count = 0;
  
  for (const [key, data] of globalAutoResponders.entries()) {
    if (data.guildId === guildId) {
      globalAutoResponders.delete(key);
      delete guildData(guildId).globalAutoResponders[key];
      count++;
    }
  }
  
  if (_gar.triggers) {
    _gar.triggers = {};
  }
  
  saveDB();
  return count;
}

function listAutoResponders(guildId) {
  const responders = [];
  for (const [key, data] of globalAutoResponders.entries()) {
    if (data.guildId === guildId) {
      responders.push(data);
    }
  }
  return responders;
}

/* ================= AUTO REACT FUNCTIONS ================= */

function addAutoReact(guildId, trigger, emojis, userId) {
  const _gat = guildData(guildId).autoreact;
  if (!_gat.enabled) return null;
  
  const key = trigger.toLowerCase();
  if (!guildData(guildId).autoReact[guildId]) guildData(guildId).autoReact[guildId] = {};

  const data = {
    trigger: trigger,
    emojis: emojis,
    createdBy: userId,
    createdAt: Date.now(),
    enabled: true
  };

  guildData(guildId).autoReact[guildId][key] = data;
  
  if (!_gat.triggers) _gat.triggers = {};
  _gat.triggers[key] = data;
  
  saveDB();
  return data;
}

function removeAutoReact(guildId, trigger) {
  const key = trigger.toLowerCase();
  if (guildData(guildId).autoReact[guildId] && guildData(guildId).autoReact[guildId][key]) {
    delete guildData(guildId).autoReact[guildId][key];
    
    if (_gat.triggers) {
    delete _gat.triggers[key];
    }
    
    saveDB();
    return true;
  }
  return false;
}

function clearAutoReacts(guildId) {
  let count = 0;
  if (guildData(guildId).autoReact[guildId]) {
    count = Object.keys(guildData(guildId).autoReact[guildId]).length;
    guildData(guildId).autoReact[guildId] = {};
  }
  if (_gat.triggers) {
    _gat.triggers = {};
  }
  saveDB();
  return count;
}

function listAutoReacts(guildId) {
  return guildData(guildId).autoReact[guildId] ? Object.values(guildData(guildId).autoReact[guildId]) : [];
}

/* ================= MEDIA DELETE LOG FUNCTIONS ================= */

async function logDeletedMedia(msg, reason = "Manual Delete") {
  const guildId = msg.guildId;
  if (!guildData(guildId).mediaDeleteChannel && !guildData(guildId).media?.deleteLogsChannel) return;

  const logChannelId = guildData(guildId).media?.deleteLogsChannel || guildData(guildId).mediaDeleteChannel;
  const logChannel = msg.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;

  const attachments = msg.attachments;
  if (attachments.size === 0) return;

  for (const [id, attachment] of attachments) {
    const mediaType = getMediaType(attachment.url, attachment.contentType);

    const logId = Date.now().toString();
    const logData = {
      id: logId,
      guildId: msg.guild.id,
      channelId: msg.channel.id,
      oderId: msg.author.id,
      username: msg.author.tag,
      mediaUrl: attachment.url,
      proxyUrl: attachment.proxyURL,
      mediaType: mediaType,
      fileName: attachment.name,
      messageContent: msg.content,
      reason: reason,
      timestamp: Date.now()
    };

    if (!guildData(guildId).mediaDeleteLogs[msg.guild.id]) {
      guildData(guildId).mediaDeleteLogs[msg.guild.id] = [];
    }
    guildData(guildId).mediaDeleteLogs[msg.guild.id].push(logData);
    saveDB();

    const embed = createEmbed({
      title: `${EMOJIS.media} ${bold("Media Deleted")}`,
      color: 0xFF6B6B,
      thumbnail: mediaType !== "video" ? attachment.proxyURL : null,
      fields: [
        { name: `${EMOJIS.confession} ${bold("User")}`, value: `${msg.author} (${msg.author.tag})`, inline: true },
        { name: `${EMOJIS.messages} ${bold("Channel")}`, value: `${msg.channel}`, inline: true },
        { name: `${EMOJIS.file} ${bold("Type")}`, value: mediaType.toUpperCase(), inline: true },
        { name: `📄 ${bold("File Name")}`, value: attachment.name || "Unknown", inline: true },
        { name: `${EMOJIS.info} ${bold("Reason")}`, value: reason, inline: true }
      ],
      footer: `Log ID: ${logId}`
    });

    if (msg.content) {
      embed.addFields({ name: `💬 ${bold("Message Content")}`, value: msg.content.slice(0, 1024) });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("👁️ View Media")
        .setStyle(ButtonStyle.Link)
        .setURL(attachment.proxyURL),
      new ButtonBuilder()
        .setLabel("⬇️ Download")
        .setStyle(ButtonStyle.Link)
        .setURL(attachment.url)
    );

    await logChannel.send({ embeds: [embed], components: [row] }).catch(console.error);
  }
}

/* ================= STICKER STEAL FUNCTIONS ================= */

async function stealStickerEnhanced(guild, sticker, stolenBy) {
  try {
    let stickerUrl = sticker.url;
    
    if (sticker.format === 3) {
      throw new Error("Lottie stickers cannot be stolen (Discord limitation)");
    }
    
    const stickerBuffer = await downloadFile(stickerUrl);
    
    const newSticker = await guild.stickers.create({
      file: stickerBuffer,
      name: sticker.name.slice(0, 30),
      tags: sticker.tags || 'emoji',
      description: sticker.description?.slice(0, 100) || `Stolen from another server`,
      reason: `Sticker stolen by ${stolenBy.tag}`
    });
    
    return {
      success: true,
      sticker: newSticker,
      originalName: sticker.name
    };
  } catch (error) {
    console.error("Sticker steal error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function stealEmojiEnhanced(guild, emoji, newName, stolenBy) {
  try {
    let emojiUrl;
    let animated = false;
    
    if (typeof emoji === 'object') {
      emojiUrl = emoji.url || `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
      animated = emoji.animated || false;
    } else {
      const emojiMatch = emoji.match(/<(a)?:(\w+):(\d+)>/);
      if (!emojiMatch) {
        throw new Error("Invalid emoji format");
      }
      animated = emojiMatch[1] === 'a';
      const emojiId = emojiMatch[3];
      emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}?size=128&quality=lossless`;
    }
    
    const emojiBuffer = await downloadFile(emojiUrl);
    
    const newEmoji = await guild.emojis.create({
      attachment: emojiBuffer,
      name: newName.slice(0, 32).replace(/[^a-zA-Z0-9_]/g, '_'),
      reason: `Emoji stolen by ${stolenBy.tag}`
    });
    
    return {
      success: true,
      emoji: newEmoji,
      animated: animated
    };
  } catch (error) {
    console.error("Emoji steal error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function stealEmojiFromUrl(guild, url, name, stolenBy) {
  try {
    const emojiBuffer = await downloadFile(url);
    const animated = url.includes('.gif');
    
    const newEmoji = await guild.emojis.create({
      attachment: emojiBuffer,
      name: name.slice(0, 32).replace(/[^a-zA-Z0-9_]/g, '_'),
      reason: `Emoji added by ${stolenBy.tag}`
    });
    
    return {
      success: true,
      emoji: newEmoji,
      animated: animated
    };
  } catch (error) {
    console.error("Emoji from URL error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

function parseEmojisFromContent(content) {
  const emojiRegex = /<(a)?:(\w+):(\d+)>/g;
  const emojis = [];
  let match;
  
  while ((match = emojiRegex.exec(content)) !== null) {
    emojis.push({
      animated: match[1] === 'a',
      name: match[2],
      id: match[3],
      url: `https://cdn.discordapp.com/emojis/${match[3]}.${match[1] === 'a' ? 'gif' : 'png'}?size=128&quality=lossless`,
      full: match[0]
    });
  }
  
  return emojis;
}

function isValidImageUrl(url) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  const urlLower = url.toLowerCase();
  return imageExtensions.some(ext => urlLower.includes(ext));
}

/* ================= IMMUNITY FUNCTIONS ================= */

function isBadWordImmune(member, channel, guildId) {
  if (!member) return false;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  if (guildData(guildId).badWordImmuneRoles?.length) {
    if (member.roles.cache.some(role => guildData(guildId).badWordImmuneRoles.includes(role.id))) return true;
  }
  if (channel && guildData(guildId).badWordImmuneChannels?.includes(channel.id)) return true;
  return false;
}

function isNSFWImmune(member, channel, guildId) {
  if (!member) return false;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  if (guildData(guildId).nsfwImmuneRoles?.length) {
    if (member.roles.cache.some(role => guildData(guildId).nsfwImmuneRoles.includes(role.id))) return true;
  }
  if (channel && guildData(guildId).nsfwImmuneChannels?.includes(channel.id)) return true;
  return false;
}

function isAntilinkImmune(member, channel, guildId) {
  if (!member) return false;
  if (member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
  if (guildData(guildId).antilink.immuneRoles?.length) {
    if (member.roles.cache.some(role => guildData(guildId).antilink.immuneRoles.includes(role.id))) return true;
  }
  if (channel && guildData(guildId).antilink.immuneChannels?.includes(channel.id)) return true;
  return false;
}

function isAntiNukeWhitelisted(userId, guildId) {
  return guildData(guildId).antinuke.whitelist?.includes(userId) || false;
}

function isAntibotWhitelisted(botId, guildId) {
  return guildData(guildId).antibot.whitelist?.includes(botId) || false;
}

/* ================= MOD LOGS ================= */

async function sendModLog(guild, action, moderator, target, reason, additionalFields = [], guildId) {
  if (!guildId) guildId = guild.id;
  if (!guildData(guildId).modLogs && !guildData(guildId).logging?.channel) return;
  
  const logChannelId = guildData(guildId).modLogs || guildData(guildId).logging?.channel;
  const logChannel = guild.channels.cache.get(logChannelId);
  if (!logChannel) return;

  const actionEmojis = {
    mute: EMOJIS.mute,
    unmute: EMOJIS.unmute,
    kick: EMOJIS.kick,
    ban: EMOJIS.ban,
    unban: EMOJIS.sparkle,
    purge: EMOJIS.purge,
    mediaDelete: EMOJIS.media,
    invite: EMOJIS.invites,
    memberJoin: EMOJIS.welcome,
    memberLeave: "🚪",
    warn: EMOJIS.warn,
    unwarn: EMOJIS.success,
    slowmode: EMOJIS.slowmode,
    lock: EMOJIS.lock,
    unlock: EMOJIS.unlock,
    antinuke: EMOJIS.antinuke,
    antibot: EMOJIS.antibot,
    automod: EMOJIS.automod
  };

  const actionColors = {
    mute: 0xFFAA00,
    unmute: 0x00FF00,
    kick: 0xFF6B6B,
    ban: 0xFF0000,
    unban: 0x00FF00,
    purge: BOT_COLOR,
    warn: 0xFFAA00,
    unwarn: 0x00FF00,
    lock: 0xFF0000,
    unlock: 0x00FF00,
    antinuke: 0xFF0000,
    antibot: 0xFF6B6B
  };

  const embed = createEmbed({
    title: `${actionEmojis[action] || "📋"} ${bold(action.charAt(0).toUpperCase() + action.slice(1) + " Action")}`,
    color: actionColors[action] || BOT_COLOR,
    fields: [
      { name: `${EMOJIS.crown} ${bold("Moderator")}`, value: `${moderator.tag} (${moderator.id})`, inline: true },
      { name: `${EMOJIS.confession} ${bold("Target")}`, value: target, inline: true },
      { name: `${EMOJIS.file} ${bold("Reason")}`, value: reason || "No reason provided", inline: false },
      ...additionalFields
    ]
  });

  logChannel.send({ embeds: [embed] }).catch(err => console.error("Failed to send mod log:", err));
}

/* ================= LOGGING FUNCTIONS ================= */

async function sendLogEvent(guild, eventType, data = {}) {
  const guildId = guild.id;
  if (!guildData(guildId).logging?.enabled || !guildData(guildId).logging?.channel) return;
  if (!guildData(guildId).logging.events[eventType]) return;
  
  const logChannel = guild.channels.cache.get(guildData(guildId).logging.channel);
  if (!logChannel) return;
  
  const eventEmojis = {
    messageDelete: EMOJIS.purge,
    messageEdit: EMOJIS.edit,
    memberJoin: EMOJIS.welcome,
    memberLeave: "🚪",
    memberBan: EMOJIS.ban,
    memberUnban: EMOJIS.sparkle,
    roleCreate: EMOJIS.customroles,
    roleDelete: EMOJIS.customroles,
    channelCreate: EMOJIS.messages,
    channelDelete: EMOJIS.messages,
    voiceJoin: EMOJIS.voice,
    voiceLeave: EMOJIS.voice,
    voiceMove: EMOJIS.voice
  };
  
  const eventTitles = {
    messageDelete: "Message Deleted",
    messageEdit: "Message Edited",
    memberJoin: "Member Joined",
    memberLeave: "Member Left",
    memberBan: "Member Banned",
    memberUnban: "Member Unbanned",
    roleCreate: "Role Created",
    roleDelete: "Role Deleted",
    channelCreate: "Channel Created",
    channelDelete: "Channel Deleted",
    voiceJoin: "Voice Join",
    voiceLeave: "Voice Leave",
    voiceMove: "Voice Move"
  };
  
  const embed = createEmbed({
    title: `${eventEmojis[eventType] || EMOJIS.logging} ${bold(eventTitles[eventType] || eventType)}`,
    fields: data.fields || [],
    color: data.color || BOT_COLOR,
    thumbnail: data.thumbnail
  });
  
  if (data.description) embed.setDescription(data.description);
  
  await logChannel.send({ embeds: [embed] }).catch(console.error);
}

/* ================= ANTINUKE FUNCTIONS ================= */

async function handleAntiNukeAction(guild, userId, actionType) {
  const guildId = guild.id;
  if (!guildData(guildId).antinuke.enabled) return false;
  if (isAntiNukeWhitelisted(userId, guildId)) return false;
  
  const key = `${guild.id}-${userId}-${actionType}`;
  const now = Date.now();
  
  if (!antiNukeActions.has(key)) {
    (() => { if (!guildData(guildId).antiNukeActions) guildData(guildId).antiNukeActions = {}; guildData(guildId).antiNukeActions[key] = []; })();
  }
  
  const actions = (guildData(guildId).antiNukeActions || {})[key];
  actions.push(now);
  
  const timeWindow = guildData(guildId).antinuke.timeWindow || 10000;
  const recentActions = actions.filter(time => now - time < timeWindow);
  (() => { if (!guildData(guildId).antiNukeActions) guildData(guildId).antiNukeActions = {}; guildData(guildId).antiNukeActions[key] = recentActions; })();
  
  let maxActions;
  switch (actionType) {
    case "ban": maxActions = guildData(guildId).antinuke.maxBans || 3; break;
    case "kick": maxActions = guildData(guildId).antinuke.maxKicks || 3; break;
    case "channelDelete": maxActions = guildData(guildId).antinuke.maxChannelDelete || 3; break;
    case "roleDelete": maxActions = guildData(guildId).antinuke.maxRoleDelete || 3; break;
    default: maxActions = 3;
  }
  
  if (recentActions.length >= maxActions) {
    try {
      const member = await guild.members.fetch(userId);
      const punishment = guildData(guildId).antinuke.punishment || "ban";
      
      if (punishment === "ban") {
        await member.ban({ reason: `Anti-Nuke: Excessive ${actionType} actions` });
      } else if (punishment === "kick") {
        await member.kick(`Anti-Nuke: Excessive ${actionType} actions`);
      } else {
        await member.roles.set([], `Anti-Nuke: Excessive ${actionType} actions`);
      }
      
      if (guildData(guildId).antinuke.logs) {
        const logChannel = guild.channels.cache.get(guildData(guildId).antinuke.logs);
        if (logChannel) {
          const embed = createEmbed({
            title: `${EMOJIS.antinuke} ${bold("Anti-Nuke Triggered")}`,
            color: 0xFF0000,
            fields: [
              { name: `${EMOJIS.confession} ${bold("User")}`, value: `<@${userId}> (${userId})`, inline: true },
              { name: `${EMOJIS.info} ${bold("Action Type")}`, value: actionType, inline: true },
              { name: `${EMOJIS.ban} ${bold("Punishment")}`, value: punishment, inline: true },
              { name: `${EMOJIS.chart} ${bold("Actions in Window")}`, value: `${recentActions.length}/${maxActions}`, inline: true }
            ]
          });
          logChannel.send({ embeds: [embed] });
        }
      }
      
      return true;
    } catch (err) {
      console.error("Anti-nuke punishment failed:", err);
    }
  }
  
  return false;
}

/* ================= WARNING SYSTEM ================= */

function addWarning(guildId, userId, moderatorId, reason) {
  if (!guildData(guildId).warnings[guildId]) guildData(guildId).warnings[guildId] = {};
  if (!guildData(guildId).warnings[guildId][userId]) guildData(guildId).warnings[guildId][userId] = [];

  const warning = {
    id: Date.now().toString(),
    moderator: moderatorId,
    reason: reason,
    timestamp: Date.now()
  };

  guildData(guildId).warnings[guildId][userId].push(warning);
  saveDB();
  return warning;
}

function removeWarning(guildId, userId, warnId) {
  if (!guildData(guildId).warnings[guildId]?.[userId]) return false;

  const index = guildData(guildId).warnings[guildId][userId].findIndex(w => w.id === warnId);
  if (index === -1) return false;

  guildData(guildId).warnings[guildId][userId].splice(index, 1);
  saveDB();
  return true;
}

function getWarnings(guildId, userId) {
  return guildData(guildId).warnings[guildId]?.[userId] || [];
}

function clearWarnings(guildId, userId) {
  if (!guildData(guildId).warnings[guildId]?.[userId]) return 0;
  const count = guildData(guildId).warnings[guildId][userId].length;
  guildData(guildId).warnings[guildId][userId] = [];
  saveDB();
  return count;
}

/* ================= TICKET SYSTEM ================= */

async function generateTicketTranscript(channel, ticket) {
  try {
    const messages = await channel.messages.fetch({ limit: 100 });
    const sortedMessages = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    
    let transcript = `╔══════════════════════════════════════════════════════════════╗\n`;
    transcript += `║                    TICKET TRANSCRIPT                          ║\n`;
    transcript += `╠══════════════════════════════════════════════════════════════╣\n`;
    transcript += `║ Ticket ID: #${ticket.number}\n`;
    transcript += `║ Created by: ${ticket.userId}\n`;
    transcript += `║ Created at: ${new Date(ticket.createdAt).toLocaleString()}\n`;
    transcript += `║ Closed at: ${new Date().toLocaleString()}\n`;
    transcript += `║ Total Messages: ${sortedMessages.length}\n`;
    transcript += `╠══════════════════════════════════════════════════════════════╣\n\n`;
    
    for (const msg of sortedMessages) {
      const time = new Date(msg.createdTimestamp).toLocaleString();
      const author = msg.author.tag;
      const content = msg.content || '[No text content]';
      
      transcript += `┌─────────────────────────────────────────────────────────────┐\n`;
      transcript += `│ ${author} • ${time}\n`;
      transcript += `├─────────────────────────────────────────────────────────────┤\n`;
      transcript += `│ ${content.split('\n').join('\n│ ')}\n`;
      
      if (msg.attachments.size > 0) {
        transcript += `│\n│ 📎 Attachments:\n`;
        msg.attachments.forEach(att => {
          transcript += `│   - ${att.name}: ${att.url}\n`;
        });
      }
      
      if (msg.embeds.length > 0) {
        transcript += `│\n│ 📋 Embeds: ${msg.embeds.length} embed(s)\n`;
      }
      
      transcript += `└─────────────────────────────────────────────────────────────┘\n\n`;
    }
    
    transcript += `╔══════════════════════════════════════════════════════════════╗\n`;
    transcript += `║                    END OF TRANSCRIPT                         ║\n`;
    transcript += `╚══════════════════════════════════════════════════════════════╝\n`;
    
    return transcript;
  } catch (error) {
    console.error("Error generating transcript:", error);
    return null;
  }
}

async function saveTicketTranscript(guild, channel, ticket, closedBy) {
  const guildId = guild.id;
  const transcript = await generateTicketTranscript(channel, ticket);
  if (!transcript) return null;
  
  const fileName = `ticket-${ticket.number}-transcript.txt`;
  const attachment = new AttachmentBuilder(Buffer.from(transcript, 'utf-8'), { name: fileName });
  
  const transcriptChannel = guild.channels.cache.get(guildData(guildId).ticket.transcriptChannel || guildData(guildId).ticket.logs);
  if (transcriptChannel) {
    const embed = createEmbed({
      title: `${EMOJIS.ticket} ${bold(`Ticket #${ticket.number} Transcript`)}`,
      fields: [
        { name: `${EMOJIS.confession} ${bold("User")}`, value: `<@${ticket.userId}>`, inline: true },
        { name: `${EMOJIS.lock} ${bold("Closed By")}`, value: `<@${closedBy}>`, inline: true },
        { name: `${EMOJIS.clock} ${bold("Duration")}`, value: formatDuration(Date.now() - ticket.createdAt), inline: true },
        { name: `${EMOJIS.messages} ${bold("Messages")}`, value: `${ticket.messages?.length || 0}`, inline: true }
      ]
    });
    
    await transcriptChannel.send({ embeds: [embed], files: [attachment] });
  }
  
  try {
    const user = await client.users.fetch(ticket.userId);
    const dmEmbed = createEmbed({
      title: `${EMOJIS.ticket} ${bold("Your Ticket Has Been Closed")}`,
      description: `Your ticket #${ticket.number} in ${bold(guild.name)} has been closed.\n\nAttached is a transcript of your conversation.`
    });
    
    await user.send({ embeds: [dmEmbed], files: [attachment] }).catch(() => {});
  } catch (err) {
    // Can't DM user
  }
  
  return transcript;
}

/* ================= GIVEAWAY FUNCTIONS ================= */

async function createGiveaway(msg, duration, prize, winnerCount = 1, donor = null) {
  const guildId = msg.guildId;
  if (!guildData(guildId).giveawaySystem?.enabled) return null;
  
  const durationMs = parseDuration(duration);
  if (!durationMs) return null;

  const giveawayId = `gw_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const endTime = Date.now() + durationMs;

  const giveawayData = {
    id: giveawayId,
    guildId: msg.guild.id,
    channelId: msg.channel.id,
    messageId: null,
    hostId: msg.author.id,
    donorId: donor?.id || null,
    donorTag: donor?.tag || null,
    prize: prize,
    winners: parseInt(winnerCount),
    endTime: endTime,
    participants: [],
    ended: false,
    cancelled: false,
    createdAt: Date.now(),
    winnerIds: []
  };

  let description = `<a:zzz_arrow_hash:1485872093437497434> ${bold("Prize:")} ${prize}<a:zzz_Exclamation:1485872115662983288>\n`;
  description += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Winners:")} ${winnerCount}<a:zzz_Exclamation:1485872115662983288>\n`;
  description += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Ends:")} <t:${Math.floor(endTime / 1000)}:R><a:zzz_Exclamation:1485872115662983288>\n`;
  description += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Hosted by:")} ${msg.author} <a:zzz_Exclamation:1485872115662983288>\n`;

  if (donor) {
    description += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Donated by:")} ${donor} <a:zzz_Exclamation:1485872115662983288>\n`;
  }

  description += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Entries:")} 0 <a:zzz_Exclamation:1485872115662983288>\n`;
  description += `${bold("Click the <a:giveaway:1485877625464422551>  below to enter!")}`;

  const embed = createEmbed({
    title: `${EMOJIS.giveaway} ${bold("GIVEAWAY")} ${EMOJIS.giveaway}`,
    description: description,
    thumbnail: msg.guild.iconURL({ dynamic: true }),
    footer: `Giveaway ID: ${giveawayId}`
  });
  embed.setTimestamp(new Date(endTime));

  const enterButton = new ButtonBuilder()
    .setCustomId(`giveaway_enter_${giveawayId}`)
    .setEmoji({ id: "1485877625464422551", name: "giveaway", animated: true })
    .setLabel("Enter Giveaway")
    .setStyle(ButtonStyle.Success);

  const participantsButton = new ButtonBuilder()
    .setCustomId(`giveaway_participants_${giveawayId}`)
    .setLabel("👥 Participants (0)")
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(enterButton, participantsButton);
  const giveawayMsg = await msg.channel.send({ embeds: [embed], components: [row] });

  giveawayData.messageId = giveawayMsg.id;
  giveaways.set(giveawayId, giveawayData);
  guildData(guildId).giveaways[giveawayId] = giveawayData;
  saveDB();

  const timeout = setTimeout(async () => {
    await endGiveaway(giveawayId);
  }, durationMs);
  
  giveawayTimeouts.set(giveawayId, timeout);

  return giveawayId;
}

function selectWinners(participants, count) {
  const winners = [];
  const participantsCopy = [...participants];
  const winnerCount = Math.min(count, participantsCopy.length);
  
  for (let i = 0; i < winnerCount; i++) {
    const randomIndex = Math.floor(Math.random() * participantsCopy.length);
    const winnerId = participantsCopy.splice(randomIndex, 1)[0];
    winners.push(winnerId);
  }
  
  return winners;
}

async function dmWinners(winnerIds, giveawayData, guild) {
  for (const winnerId of winnerIds) {
    try {
      const winner = await client.users.fetch(winnerId);
      const dmEmbed = createEmbed({
        title: `${EMOJIS.giveaway} ${bold("You Won a Giveaway!")} ${EMOJIS.giveaway}`,
        description: 
          `${EMOJIS.party} ${bold("Congratulations!")} You won a giveaway in ${bold(guild.name)}!\n\n` +
          `<a:zzz_arrow_hash:1485872093437497434> **Prize** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${giveawayData.prize}\n` +
          `<a:zzz_arrow_hash:1485872093437497434> **Hosted by** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  <@${giveawayData.hostId}>\n` +
          (giveawayData.donorId ? `<a:zzz_arrow_hash:1485872093437497434> **Donated by** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  <@${giveawayData.donorId}>\n` : "") +
          `\nPlease contact the giveaway host or a staff member to claim your prize!`,
        thumbnail: guild.iconURL({ dynamic: true }),
        footer: guild.name
      });
      
      await winner.send({ embeds: [dmEmbed] }).catch(() => {});
    } catch (err) {
      // Can't DM user
    }
  }
}

async function updateGiveawayEmbed(message, giveawayData) {
  try {
    const guild = message.guild;
    const entriesCount = giveawayData.participants?.length || 0;
    
    let description = `<a:zzz_arrow_hash:1485872093437497434> ${bold("Prize:")} ${giveawayData.prize}<a:zzz_Exclamation:1485872115662983288>\n`;
    description += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Winners:")} ${giveawayData.winners}<a:zzz_Exclamation:1485872115662983288>\n`;
    description += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Ends:")} <t:${Math.floor(giveawayData.endTime / 1000)}:R><a:zzz_Exclamation:1485872115662983288>\n`;
    description += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Hosted by:")} <@${giveawayData.hostId}> <a:zzz_Exclamation:1485872115662983288>\n`;

    if (giveawayData.donorId) {
      description += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Donated by:")} <@${giveawayData.donorId}> <a:zzz_Exclamation:1485872115662983288>\n`;
    }

    description += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Entries:")} ${entriesCount} <a:zzz_Exclamation:1485872115662983288>\n`;
    description += `${bold("Click the <a:giveaway:1485877625464422551>  below to enter!")}`;

    const embed = createEmbed({
      title: `${EMOJIS.giveaway} ${bold("GIVEAWAY")} ${EMOJIS.giveaway}`,
      description: description,
      thumbnail: guild?.iconURL({ dynamic: true }) || null,
      footer: `Giveaway ID: ${giveawayData.id}`
    });
    embed.setTimestamp(new Date(giveawayData.endTime));

    const enterButton = new ButtonBuilder()
      .setCustomId(`giveaway_enter_${giveawayData.id}`)
      .setEmoji({ id: "1485877625464422551", name: "giveaway", animated: true })
      .setLabel("Enter Giveaway")
      .setStyle(ButtonStyle.Success);

    const participantsButton = new ButtonBuilder()
      .setCustomId(`giveaway_participants_${giveawayData.id}`)
      .setLabel(`👥 Participants (${entriesCount})`)
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(enterButton, participantsButton);
    
    await message.edit({ embeds: [embed], components: [row] });
  } catch (err) {
    console.error("Failed to update giveaway embed:", err.message);
  }
}

async function endGiveaway(giveawayId) {
  const giveawayData = giveaways.get(giveawayId) || (() => {
    for (const gId of Object.keys(db)) { const g = db[gId]?.giveaways?.[giveawayId]; if (g) return g; }
    return null;
  })();
  const guildId = giveawayData?.guildId;
  if (!giveawayData || giveawayData.ended) return { success: false, error: "Already ended" };

  const timeout = giveawayTimeouts.get(giveawayId);
  if (timeout) {
    clearTimeout(timeout);
    giveawayTimeouts.delete(giveawayId);
  }

  giveawayData.ended = true;
  giveawayData.endedAt = Date.now();

  const guild = client.guilds.cache.get(giveawayData.guildId);
  if (!guild) {
    guildData(guildId).giveaways[giveawayId] = giveawayData; db.giveaways[giveawayId] = giveawayData;
    saveDB();
    return { success: false, error: "Guild not found" };
  }

  const channel = guild.channels.cache.get(giveawayData.channelId);
  if (!channel) {
    guildData(guildId).giveaways[giveawayId] = giveawayData; db.giveaways[giveawayId] = giveawayData;
    saveDB();
    return { success: false, error: "Channel not found" };
  }

  const message = await channel.messages.fetch(giveawayData.messageId).catch(() => null);
  const entriesCount = giveawayData.participants.length;

  if (entriesCount === 0) {
    giveawayData.winnerIds = [];
    guildData(guildId).giveaways[giveawayId] = giveawayData; db.giveaways[giveawayId] = giveawayData;
    giveaways.set(giveawayId, giveawayData);
    saveDB();

    if (message) {
      const embed = createEmbed({
        title: `${EMOJIS.giveaway} ${bold("GIVEAWAY ENDED")} ${EMOJIS.giveaway}`,
        description: 
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Prize:")} ${giveawayData.prize}<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Winners:")} No valid entries!<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Hosted by:")} <@${giveawayData.hostId}> <a:zzz_Exclamation:1485872115662983288>\n` +
          (giveawayData.donorId ? `<a:zzz_arrow_hash:1485872093437497434> ${bold("Donated by:")} <@${giveawayData.donorId}> <a:zzz_Exclamation:1485872115662983288>\n` : "") +
          `\n<a:zzz_arrow_hash:1485872093437497434> ${bold("Total Entries:")} 0 <a:zzz_Exclamation:1485872115662983288>`,
        color: BOT_COLOR,
        footer: `Giveaway ID: ${giveawayId} | Ended`
      });

      const disabledButton = new ButtonBuilder()
        .setCustomId(`giveaway_ended_${giveawayId}`)
        .setLabel("🎉 Giveaway Ended")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const row = new ActionRowBuilder().addComponents(disabledButton);

      await message.edit({ embeds: [embed], components: [row] }).catch(() => {});
    }
    
    await channel.send({ 
      content: `${EMOJIS.error} ${bold("No one participated in the giveaway for")} ${bold(giveawayData.prize)}!` 
    }).catch(() => {});
    
    return { success: true, winners: [] };
  }

  const winners = selectWinners(giveawayData.participants, giveawayData.winners);
  giveawayData.winnerIds = winners;
  guildData(guildId).giveaways[giveawayId] = giveawayData; db.giveaways[giveawayId] = giveawayData;
  giveaways.set(giveawayId, giveawayData);
  saveDB();

  const winnerMentions = winners.map(id => `<@${id}>`).join(", ");

  if (message) {
    const embed = createEmbed({
      title: `${EMOJIS.giveaway} ${bold("GIVEAWAY ENDED")} ${EMOJIS.giveaway}`,
      description: 
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("Prize:")} ${giveawayData.prize}<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("Winner(s):")} ${winnerMentions}<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("Hosted by:")} <@${giveawayData.hostId}> <a:zzz_Exclamation:1485872115662983288>\n` +
        (giveawayData.donorId ? `<a:zzz_arrow_hash:1485872093437497434> ${bold("Donated by:")} <@${giveawayData.donorId}> <a:zzz_Exclamation:1485872115662983288>\n` : "") +
        `\n<a:zzz_arrow_hash:1485872093437497434> ${bold("Total Entries:")} ${entriesCount} <a:zzz_Exclamation:1485872115662983288>`,
      color: 0x00FF00,
      footer: `Giveaway ID: ${giveawayId} | Ended`
    });

    const disabledButton = new ButtonBuilder()
      .setCustomId(`giveaway_ended_${giveawayId}`)
      .setLabel("🎉 Giveaway Ended")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);

    const rerollButton = new ButtonBuilder()
      .setCustomId(`giveaway_reroll_${giveawayId}`)
      .setLabel("🔄 Reroll")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(disabledButton, rerollButton);

    await message.edit({ embeds: [embed], components: [row] }).catch(() => {});
  }

  let announcement = winners.length === 1 
    ? `<a:giveaway:1485877625464422551> Congratulations ${winnerMentions}! You won ${bold(giveawayData.prize)}!`
    : `<a:giveaway:1485877625464422551> Congratulations to our winners: ${winnerMentions}!\nYou all won ${bold(giveawayData.prize)}!`;

  if (giveawayData.donorId) {
    announcement += `\n\n<a:zzz_arrow_hash:1485872093437497434> ${bold("Thank you to")} <@${giveawayData.donorId}> ${bold("for donating this prize!")} <a:zzz_Exclamation:1485872115662983288>`;
  }

  await channel.send({ content: announcement }).catch(() => {});
  await dmWinners(winners, giveawayData, guild);

  return { success: true, winners };
}

async function rerollGiveaway(giveawayId, count = 1) {
  const giveawayData = giveaways.get(giveawayId) || (() => {
    for (const gId of Object.keys(db)) { const g = db[gId]?.giveaways?.[giveawayId]; if (g) return g; }
    return null;
  })();
  const guildId = giveawayData?.guildId;
  if (!giveawayData) return { success: false, error: "Giveaway not found!" };
  if (!giveawayData.ended) return { success: false, error: "Giveaway hasn't ended yet!" };
  if (giveawayData.cancelled) return { success: false, error: "Giveaway was cancelled!" };
  if (giveawayData.participants.length === 0) return { success: false, error: "No participants to reroll!" };

  const guild = client.guilds.cache.get(giveawayData.guildId);
  if (!guild) return { success: false, error: "Guild not found!" };

  const channel = guild.channels.cache.get(giveawayData.channelId);
  if (!channel) return { success: false, error: "Channel not found!" };

  const previousWinners = giveawayData.winnerIds || [];
  let eligibleParticipants = giveawayData.participants.filter(id => !previousWinners.includes(id));
  
  if (eligibleParticipants.length < count) {
    eligibleParticipants = [...giveawayData.participants];
  }

  const winners = selectWinners(eligibleParticipants, count);

  if (winners.length === 0) {
    return { success: false, error: "No eligible participants for reroll!" };
  }

  giveawayData.winnerIds = winners;
  giveawayData.rerolledAt = Date.now();
  guildData(guildId).giveaways[giveawayId] = giveawayData; db.giveaways[giveawayId] = giveawayData;
  giveaways.set(giveawayId, giveawayData);
  saveDB();

  try {
    const message = await channel.messages.fetch(giveawayData.messageId).catch(() => null);
    if (message) {
      const winnerMentions = winners.map(id => `<@${id}>`).join(", ");
      
      const embed = createEmbed({
        title: `${EMOJIS.giveaway} ${bold("GIVEAWAY ENDED")} ${EMOJIS.giveaway}`,
        description: 
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Prize:")} ${giveawayData.prize}<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Winner(s):")} ${winnerMentions} (Rerolled)<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Hosted by:")} <@${giveawayData.hostId}> <a:zzz_Exclamation:1485872115662983288>\n` +
          (giveawayData.donorId ? `<a:zzz_arrow_hash:1485872093437497434> ${bold("Donated by:")} <@${giveawayData.donorId}> <a:zzz_Exclamation:1485872115662983288>\n` : "") +
          `\n<a:zzz_arrow_hash:1485872093437497434> ${bold("Total Entries:")} ${giveawayData.participants.length} <a:zzz_Exclamation:1485872115662983288>`,
        color: 0x00FF00,
        footer: `Giveaway ID: ${giveawayId} | Rerolled`
      });

      const disabledButton = new ButtonBuilder()
        .setCustomId(`giveaway_ended_${giveawayId}`)
        .setLabel("🎉 Giveaway Ended")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const rerollButton = new ButtonBuilder()
        .setCustomId(`giveaway_reroll_${giveawayId}`)
        .setLabel("🔄 Reroll")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(disabledButton, rerollButton);

      await message.edit({ embeds: [embed], components: [row] });
    }
  } catch (err) {
    console.error("Failed to update rerolled giveaway:", err.message);
  }

  await dmWinners(winners, giveawayData, guild);

  return { success: true, winners };
}

async function cancelGiveaway(giveawayId) {
  const giveawayData = giveaways.get(giveawayId) || (() => {
    for (const gId of Object.keys(db)) { const g = db[gId]?.giveaways?.[giveawayId]; if (g) return g; }
    return null;
  })();
  const guildId = giveawayData?.guildId;
  if (!giveawayData) return { success: false, error: "Giveaway not found!" };
  if (giveawayData.ended) return { success: false, error: "Giveaway already ended!" };

  const timeout = giveawayTimeouts.get(giveawayId);
  if (timeout) {
    clearTimeout(timeout);
    giveawayTimeouts.delete(giveawayId);
  }

  const guild = client.guilds.cache.get(giveawayData.guildId);
  const channel = guild?.channels.cache.get(giveawayData.channelId);

  giveawayData.ended = true;
  giveawayData.cancelled = true;
  giveawayData.cancelledAt = Date.now();
  guildData(guildId).giveaways[giveawayId] = giveawayData; db.giveaways[giveawayId] = giveawayData;
  giveaways.set(giveawayId, giveawayData);
  saveDB();

  if (channel) {
    try {
      const message = await channel.messages.fetch(giveawayData.messageId).catch(() => null);
      if (message) {
        const embed = createEmbed({
          title: `${EMOJIS.giveaway} ${bold("GIVEAWAY CANCELLED")} ${EMOJIS.giveaway}`,
          description: 
            `<a:zzz_arrow_hash:1485872093437497434> ${bold("Prize:")} ${giveawayData.prize}<a:zzz_Exclamation:1485872115662983288>\n` +
            `<a:zzz_arrow_hash:1485872093437497434> ${bold("Status:")} CANCELLED<a:zzz_Exclamation:1485872115662983288>\n` +
            `<a:zzz_arrow_hash:1485872093437497434> ${bold("Hosted by:")} <@${giveawayData.hostId}> <a:zzz_Exclamation:1485872115662983288>\n` +
            (giveawayData.donorId ? `<a:zzz_arrow_hash:1485872093437497434> ${bold("Donated by:")} <@${giveawayData.donorId}> <a:zzz_Exclamation:1485872115662983288>\n` : "") +
            `\n${bold("This giveaway has been cancelled.")}`,
          color: 0xFF0000,
          footer: `Giveaway ID: ${giveawayId} | Cancelled`
        });

        const disabledButton = new ButtonBuilder()
          .setCustomId(`giveaway_cancelled_${giveawayId}`)
          .setLabel("❌ Cancelled")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true);

        const row = new ActionRowBuilder().addComponents(disabledButton);

        await message.edit({ embeds: [embed], components: [row] });
      }
    } catch (err) {
      console.error("Failed to update cancelled giveaway:", err.message);
    }
  }

  return { success: true };
}

function getGiveawayStats(guildId) {
  const guildGiveaways = Object.values(guildData(guildId).giveaways).filter(g => g.guildId === guildId);
  
  return {
    total: guildGiveaways.length,
    active: guildGiveaways.filter(g => !g.ended && !g.cancelled).length,
    ended: guildGiveaways.filter(g => g.ended && !g.cancelled).length,
    cancelled: guildGiveaways.filter(g => g.cancelled).length,
    totalParticipants: guildGiveaways.reduce((acc, g) => acc + (g.participants?.length || 0), 0)
  };
}

/* ================= STICKY MESSAGE FUNCTIONS ================= */

async function updateStickyMessage(channel) {
  const guildId = channel.guildId;
  if (!guildData(guildId).stickySystem?.enabled) return;
  
  const stickyData = guildData(guildId).stickyMessages[channel.id];
  if (!stickyData || !stickyData.enabled) return;

  if (stickyData.messageId) {
    try {
      const oldMsg = await channel.messages.fetch(stickyData.messageId);
      await oldMsg.delete();
    } catch (err) {
      // Message already deleted
    }
  }

  const embed = createEmbed({
    title: `${EMOJIS.sticky} ${bold("Sticky Message")}`,
    description: stickyData.content,
    footer: "📌 This message is pinned"
  });

  const newMsg = await channel.send({ embeds: [embed] });
  stickyData.messageId = newMsg.id;
  saveDB();
}

/* ================= ECONOMY FUNCTIONS ================= */

function getBalance(guildId, userId) {
  if (!guildData(guildId).economy.users[guildId]) guildData(guildId).economy.users[guildId] = {};
  if (!guildData(guildId).economy.users[guildId][userId]) {
    guildData(guildId).economy.users[guildId][userId] = { 
      balance: 0, 
      bank: 0, 
      lastDaily: 0, 
      lastWork: 0, 
      dailyStreak: 0, 
      lastRob: 0,
      totalEarned: 0
    };
  }
  return guildData(guildId).economy.users[guildId][userId];
}

function addMoney(guildId, userId, amount) {
  const user = getBalance(guildId, userId);
  user.balance += amount;
  user.totalEarned = (user.totalEarned || 0) + amount;
  saveDB();
  return user;
}

function removeMoney(guildId, userId, amount) {
  const user = getBalance(guildId, userId);
  if (user.balance < amount) return null;
  user.balance -= amount;
  saveDB();
  return user;
}

function transferMoney(guildId, fromUserId, toUserId, amount) {
  const from = getBalance(guildId, fromUserId);
  if (from.balance < amount) return null;
  
  from.balance -= amount;
  const to = getBalance(guildId, toUserId);
  to.balance += amount;
  saveDB();
  return { from, to };
}

function getEconomyLeaderboard(guildId, limit = 10) {
  if (!guildData(guildId).economy.users[guildId]) return [];
  
  return Object.entries(guildData(guildId).economy.users[guildId])
    .map(([userId, data]) => ({ userId, total: data.balance + data.bank, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/* ================= INVITE TRACKING ================= */

function getInviter(guildId, userId) {
  return guildData(guildId).invites[guildId]?.inviter?.[userId] || null;
}

function getInviteCount(guildId, userId) {
  return guildData(guildId).invites[guildId]?.counts?.[userId] || { regular: 0, left: 0, fake: 0 };
}

function getInviteLeaderboard(guildId, limit = 10) {
  if (!guildData(guildId).invites[guildId]?.counts) return [];
  
  return Object.entries(guildData(guildId).invites[guildId].counts)
    .map(([userId, counts]) => ({
      oderId,
      ...counts,
      total: counts.regular - counts.left - counts.fake
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

function resetInvites(guildId, userId = null) {
  if (userId) {
    if (guildData(guildId).invites[guildId]?.counts?.[userId]) {
      guildData(guildId).invites[guildId].counts[userId] = { regular: 0, left: 0, fake: 0 };
    }
  } else {
    if (guildData(guildId).invites[guildId]) {
      guildData(guildId).invites[guildId].counts = {};
    }
  }
  saveDB();
}

/* ================= CUSTOM ROLES ================= */

async function createCustomRole(guild, oderId, name, color) {
  const guildId = guild.id;
  if (!guildData(guildId).customRoles.enabled) return null;
  
  const userRoles = guildData(guildId).customRoles.users[userId] || [];
  if (userRoles.length >= guildData(guildId).customRoles.maxRoles) return null;
  
  try {
    const role = await guild.roles.create({
      name: name,
      color: color,
      reason: `Custom role created by ${userId}`
    });
    
    const member = await guild.members.fetch(userId);
    await member.roles.add(role);
    
    if (!guildData(guildId).customRoles.users[userId]) guildData(guildId).customRoles.users[userId] = [];
    guildData(guildId).customRoles.users[userId].push(role.id);
    saveDB();
    
    return role;
  } catch (err) {
    console.error("Custom role creation failed:", err);
    return null;
  }
}

async function deleteCustomRole(guild, userId) {
  const guildId = guild.id;
  const userRoles = guildData(guildId).customRoles.users[userId] || [];
  if (userRoles.length === 0) return false;
  
  for (const roleId of userRoles) {
    const role = guild.roles.cache.get(roleId);
    if (role) {
      await role.delete().catch(() => {});
    }
  }
  
  guildData(guildId).customRoles.users[userId] = [];
  saveDB();
  return true;
}

/* ================= RESTORE GIVEAWAYS ON STARTUP ================= */

async function restoreGiveaways() {
  console.log("[Giveaways] Restoring active giveaways...");
  
  let restored = 0;
  let ended = 0;
  
  for (const guildId of Object.keys(db)) {
    for (const [giveawayId, giveawayData] of Object.entries(guildData(guildId).giveaways || {})) {
      if (giveawayData.ended || giveawayData.cancelled) continue;
      
      giveaways.set(giveawayId, giveawayData);
      
      const timeLeft = giveawayData.endTime - Date.now();
      
      if (timeLeft <= 0) {
        console.log(`[Giveaways] Ending overdue giveaway: ${giveawayId}`);
        await endGiveaway(giveawayId);
        ended++;
      } else {
        const timeout = setTimeout(async () => {
          await endGiveaway(giveawayId);
        }, timeLeft);
        
        giveawayTimeouts.set(giveawayId, timeout);
        restored++;
        console.log(`[Giveaways] Restored giveaway ${giveawayId} - ends in ${formatDuration(timeLeft)}`);
      }
    }
  }
  
  console.log(`[Giveaways] Restoration complete: ${restored} active, ${ended} ended`);
}

/* ================= FUN COMMANDS HELPERS ================= */

function get8BallResponse() {
  const responses = [
    "It is certain.", "It is decidedly so.", "Without a doubt.",
    "Yes - definitely.", "You may rely on it.", "As I see it, yes.",
    "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.",
    "Reply hazy, try again.", "Ask again later.", "Better not tell you now.",
    "Cannot predict now.", "Concentrate and ask again.",
    "Don't count on it.", "My reply is no.", "My sources say no.",
    "Outlook not so good.", "Very doubtful."
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function flipCoin() {
  return Math.random() < 0.5 ? "Heads" : "Tails";
}

function rollDice(sides = 6) {
  return Math.floor(Math.random() * sides) + 1;
}

function getRandomChoice(choices) {
  return choices[Math.floor(Math.random() * choices.length)];
}

/* ================= TIMERS ================= */

// AFK Expiry Timer
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const guildId of Object.keys(db)) {
    const afkUsers = guildData(guildId).afk?.users;
    if (!afkUsers) continue;
    for (const [userId, afkData] of Object.entries(afkUsers)) {
      if (afkData.expiresAt && now >= afkData.expiresAt) {
        delete guildData(guildId).afk.users[userId];
        changed = true;
      }
    }
  }
  if (changed) saveDB();
}, 60000);

// Birthday Check Timer
async function checkBirthdays() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  if (now.getHours() !== 0) return;

  for (const guildId of client.guilds.cache.keys()) {
    const gData = guildData(guildId);
    if (!gData.birthday?.enabled) continue;
    if (!gData.birthday?.channel) continue;

    const birthdayUsers = gData.birthday?.users || {};
    for (const [userId, birthday] of Object.entries(birthdayUsers)) {
      if (gData.birthdayChecked?.[userId] === today) continue;

      try {
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;
        const channel = guild.channels.cache.get(gData.birthday.channel);
        if (!channel) continue;

        let sentWishes = false;
        const [year, month, day] = birthday.split("-");
        const todayMonth = String(now.getMonth() + 1).padStart(2, "0");
        const todayDay = String(now.getDate()).padStart(2, "0");

        if (month === todayMonth && day === todayDay) {
          const user = await guild.members.fetch(userId).catch(() => null);
          if (user) {
            const age = now.getFullYear() - parseInt(year);
            const customMessage = gData.birthday.message || `${EMOJIS.party} Happy {age}{suffix} Birthday {mention}!\n\nWishing you an amazing day filled with joy and happiness! 🎈`;
            const message = customMessage
              .replace(/{mention}/g, `${user}`)
              .replace(/{user}/g, user.user.username)
              .replace(/{age}/g, age.toString())
              .replace(/{suffix}/g, getOrdinalSuffix(age));

            const embed = createEmbed({
              title: `${EMOJIS.birthday} ${bold("Happy Birthday!")}`,
              description: message,
              thumbnail: user.user.displayAvatarURL({ dynamic: true }),
              color: 0xFF69B4
            });

            await channel.send({ embeds: [embed] });
            sentWishes = true;

            if (gData.birthday.role) {
              const role = guild.roles.cache.get(gData.birthday.role);
              if (role && !user.roles.cache.has(role.id)) {
                await user.roles.add(role);
                setTimeout(async () => {
                  try {
                    if (user.roles.cache.has(role.id)) {
                      await user.roles.remove(role);
                    }
                  } catch (err) {
                    console.error("Failed to remove birthday role:", err);
                  }
                }, 24 * 60 * 60 * 1000);
              }
            }
          }
        }

        if (sentWishes) {
          if (!gData.birthdayChecked) gData.birthdayChecked = {};
          gData.birthdayChecked[userId] = today;
          saveDB();
        }
      } catch (err) {
        console.error("Birthday check error:", err);
      }
    }
  }
}
setInterval(checkBirthdays, 3600000);

// Reminder Timer
setInterval(async () => {
  const now = Date.now();
  let changed = false;

  for (const guildId of Object.keys(db)) {
    const gData = guildData(guildId);
    if (!Array.isArray(gData.reminders) || gData.reminders.length === 0) continue;

    for (const reminder of gData.reminders) {
      if (now >= reminder.nextTime) {
        try {
          const guild = client.guilds.cache.get(reminder.guildId);
          if (!guild) continue;
          const channel = guild.channels.cache.get(reminder.channelId);
          if (!channel) continue;

          const embed = createEmbed({
            title: `${EMOJIS.reminders} ${bold("Reminder")}`,
            description: reminder.message,
            fields: [{ name: `${EMOJIS.crown} ${bold("Created By")}`, value: `<@${reminder.userId}>` }]
          });

          await channel.send({ content: `<@${reminder.userId}>`, embeds: [embed] });

          if (reminder.loop) {
            reminder.nextTime = now + reminder.interval;
          } else {
            reminder.done = true;
          }
          changed = true;
        } catch (err) {
          console.error(`Reminder error:`, err);
        }
      }
    }

    if (changed) {
      gData.reminders = gData.reminders.filter(r => !r.done);
    }
  }

  if (changed) saveDB();
}, 5000);

// Giveaway Check Timer
setInterval(async () => {
  const now = Date.now();
  for (const guildId of Object.keys(db)) {
    const giveaways = guildData(guildId).giveaways || {};
    for (const [id, giveaway] of Object.entries(giveaways)) {
      if (!giveaway.ended && giveaway.endTime <= now) {
        await endGiveaway(id);
      }
    }
  }
}, 30000);

// Snipe Cleanup Timer (5 minutes)
setInterval(() => {
  const now = Date.now();
  const expiry = 5 * 60 * 1000;
  
  for (const [channelId, data] of snipedMessages.entries()) {
    if (now - data.timestamp > expiry) {
      snipedMessages.delete(channelId);
    }
  }
  
  for (const [channelId, data] of editSnipedMessages.entries()) {
    if (now - data.timestamp > expiry) {
      editSnipedMessages.delete(channelId);
    }
  }
}, 60000);

// Anti-Nuke Action Cleanup Timer
setInterval(() => {
  const now = Date.now();

  for (const [key, actions] of antiNukeActions.entries()) {
    const [guildId] = key.split(":");
    const timeWindow = guildData(guildId)?.antinuke?.timeWindow || 10000;
    const recentActions = actions.filter(time => now - time < timeWindow);
    if (recentActions.length === 0) {
      antiNukeActions.delete(key);
    } else {
      antiNukeActions.set(key, recentActions);
    }
  }
}, 30000);

// Spam Tracker Cleanup Timer
setInterval(() => {
  const now = Date.now();

  for (const [key, messages] of spamTracker.entries()) {
    const [guildId] = key.split(":");
    const interval = guildData(guildId)?.automod?.antiSpam?.interval || 5000;
    const recentMessages = messages.filter(time => now - time < interval);
    if (recentMessages.length === 0) {
      spamTracker.delete(key);
    } else {
      spamTracker.set(key, recentMessages);
    }
  }
}, 10000);

/* ================= ALL COMMANDS LIST ================= */

const ALL_COMMANDS = {
  // Moderation Commands
  moderation: {
    emoji: EMOJIS.moderation,
    name: "Moderation",
    description: "Server moderation commands",
    commands: [
      { name: "ban", description: "Ban a user", usage: "ban <@user> [reason]", aliases: [] },
      { name: "unban", description: "Unban a user", usage: "unban <userID> [reason]", aliases: [] },
      { name: "kick", description: "Kick a user", usage: "kick <@user> [reason]", aliases: [] },
      { name: "mute", description: "Mute a user", usage: "mute <@user> <duration> [reason]", aliases: ["timeout"] },
      { name: "unmute", description: "Unmute a user", usage: "unmute <@user> [reason]", aliases: ["untimeout"] },
      { name: "warn", description: "Warn a user", usage: "warn <@user> [reason]", aliases: [] },
      { name: "warnings", description: "View warnings", usage: "warnings [@user]", aliases: ["warns"] },
      { name: "clearwarns", description: "Clear warnings", usage: "clearwarns <@user>", aliases: ["clearwarnings"] },
      { name: "purge", description: "Delete messages", usage: "purge <amount> [@user]", aliases: ["clear", "prune"] },
      { name: "purge images", description: "Delete only images", usage: "purge images <amount>", aliases: [] },
      { name: "purge bots", description: "Delete bot messages", usage: "purge bots <amount>", aliases: [] },
      { name: "purge embeds", description: "Delete embeds", usage: "purge embeds <amount>", aliases: [] },
      { name: "purge links", description: "Delete links", usage: "purge links <amount>", aliases: [] },
      { name: "cl", description: "Clear text only (no media)", usage: "cl <amount>", aliases: [] },
      { name: "lock", description: "Lock a channel", usage: "lock [#channel] [reason]", aliases: [] },
      { name: "unlock", description: "Unlock a channel", usage: "unlock [#channel] [reason]", aliases: [] },
      { name: "slowmode", description: "Set slowmode", usage: "slowmode <duration/off>", aliases: ["slow"] },
      { name: "nuke", description: "Nuke and recreate channel", usage: "nuke [reason]", aliases: [] }
    ]
  },

  // Antinuke Commands
  antinuke: {
    emoji: EMOJIS.antinuke,
    name: "Anti-Nuke",
    description: "Server protection commands",
    commands: [
      { name: "antinuke enable", description: "Enable anti-nuke", usage: "antinuke enable", aliases: [] },
      { name: "antinuke disable", description: "Disable anti-nuke", usage: "antinuke disable", aliases: [] },
      { name: "antinuke settings", description: "View settings", usage: "antinuke settings", aliases: ["antinuke status"] },
      { name: "antinuke whitelist", description: "Whitelist a user", usage: "antinuke whitelist <@user>", aliases: [] },
      { name: "antinuke unwhitelist", description: "Remove from whitelist", usage: "antinuke unwhitelist <@user>", aliases: [] },
      { name: "antinuke setlogs", description: "Set logs channel", usage: "antinuke setlogs <#channel>", aliases: [] },
      { name: "antinuke maxbans", description: "Set max bans", usage: "antinuke maxbans <number>", aliases: [] },
      { name: "antinuke maxkicks", description: "Set max kicks", usage: "antinuke maxkicks <number>", aliases: [] },
      { name: "antinuke punishment", description: "Set punishment", usage: "antinuke punishment <ban/kick/strip>", aliases: [] }
    ]
  },

  // Antibot Commands
  antibot: {
    emoji: EMOJIS.antibot,
    name: "Anti-Bot",
    description: "Bot protection commands",
    commands: [
      { name: "antibot enable", description: "Enable anti-bot", usage: "antibot enable", aliases: [] },
      { name: "antibot disable", description: "Disable anti-bot", usage: "antibot disable", aliases: [] },
      { name: "antibot settings", description: "View settings", usage: "antibot settings", aliases: ["antibot status"] },
      { name: "antibot whitelist", description: "Whitelist a bot", usage: "antibot whitelist <botID>", aliases: [] },
      { name: "antibot unwhitelist", description: "Remove from whitelist", usage: "antibot unwhitelist <botID>", aliases: [] },
      { name: "antibot setlogs", description: "Set logs channel", usage: "antibot setlogs <#channel>", aliases: [] },
      { name: "antibot action", description: "Set action (kick/ban)", usage: "antibot action <kick/ban>", aliases: [] }
    ]
  },

  // Automod Commands
  automod: {
    emoji: EMOJIS.automod,
    name: "Auto-Mod",
    description: "Automatic moderation commands",
    commands: [
      { name: "automod enable", description: "Enable automod", usage: "automod enable", aliases: [] },
      { name: "automod disable", description: "Disable automod", usage: "automod disable", aliases: [] },
      { name: "automod settings", description: "View settings", usage: "automod settings", aliases: ["automod status"] },
      { name: "automod antispam", description: "Toggle anti-spam", usage: "automod antispam <on/off>", aliases: [] },
      { name: "automod antimention", description: "Toggle anti-mention", usage: "automod antimention <on/off>", aliases: [] },
      { name: "automod anticaps", description: "Toggle anti-caps", usage: "automod anticaps <on/off>", aliases: [] },
      { name: "automod antiinvite", description: "Toggle anti-invite", usage: "automod antiinvite <on/off>", aliases: [] },
      { name: "antilink enable", description: "Enable anti-link", usage: "antilink enable", aliases: [] },
      { name: "antilink disable", description: "Disable anti-link", usage: "antilink disable", aliases: [] },
      { name: "antilink whitelist", description: "Whitelist a domain", usage: "antilink whitelist <domain>", aliases: [] },
      { name: "antilink immunerole", description: "Add immune role", usage: "antilink immunerole <@role>", aliases: [] }
    ]
  },

  // Welcome Commands
  welcome: {
    emoji: EMOJIS.welcome,
    name: "Welcome",
    description: "Welcome system commands",
    commands: [
      { name: "welcome enable", description: "Enable welcome", usage: "welcome enable", aliases: [] },
      { name: "welcome disable", description: "Disable welcome", usage: "welcome disable", aliases: [] },
      { name: "welcome setchannel", description: "Set welcome channel", usage: "welcome setchannel <#channel>", aliases: [] },
      { name: "welcome setmessage", description: "Set welcome message", usage: "welcome setmessage <message>", aliases: [] },
      { name: "welcome test", description: "Test welcome message", usage: "welcome test", aliases: [] },
      { name: "welcome settings", description: "View settings", usage: "welcome settings", aliases: ["welcome status"] }
    ]
  },

  // Goodbye Commands
  // ── Goodbye & Join DM (merged) ──
  goodbye: {
    emoji: EMOJIS.goodbye,
    name: "Goodbye & Join DM",
    description: "Goodbye messages and Join DM commands",
    commands: [
      // ─ Goodbye ─
      { name: "goodbye enable", description: "Enable goodbye", usage: "goodbye enable", aliases: [] },
      { name: "goodbye disable", description: "Disable goodbye", usage: "goodbye disable", aliases: [] },
      { name: "goodbye setchannel", description: "Set goodbye channel", usage: "goodbye setchannel <#channel>", aliases: [] },
      { name: "goodbye setmessage", description: "Set goodbye message", usage: "goodbye setmessage <message>", aliases: [] },
      { name: "goodbye test", description: "Test goodbye message", usage: "goodbye test", aliases: [] },
      { name: "goodbye settings", description: "View settings", usage: "goodbye settings", aliases: ["goodbye status"] },
      // ─ Join DM ─
      { name: "joindm enable", description: "Enable join DM", usage: "joindm enable", aliases: [] },
      { name: "joindm disable", description: "Disable join DM", usage: "joindm disable", aliases: [] },
      { name: "joindm setmessage", description: "Set DM message", usage: "joindm setmessage <message>", aliases: [] },
      { name: "joindm test", description: "Test join DM", usage: "joindm test", aliases: [] },
      { name: "joindm settings", description: "View settings", usage: "joindm settings", aliases: [] }
    ]
  },

  // Boost Commands
  boost: {
    emoji: EMOJIS.boost,
    name: "Boost",
    description: "Boost message commands",
    commands: [
      { name: "boost enable", description: "Enable boost messages", usage: "boost enable", aliases: [] },
      { name: "boost disable", description: "Disable boost messages", usage: "boost disable", aliases: [] },
      { name: "boost setchannel", description: "Set boost channel", usage: "boost setchannel <#channel>", aliases: [] },
      { name: "boost setmessage", description: "Set boost message", usage: "boost setmessage <message>", aliases: [] },
      { name: "boost test", description: "Test boost message", usage: "boost test", aliases: [] },
      { name: "boost settings", description: "View settings", usage: "boost settings", aliases: ["boost status"] }
    ]
  },

  // Ticket Commands
  ticket: {
    emoji: EMOJIS.ticket,
    name: "Tickets",
    description: "Ticket system commands",
    commands: [
      { name: "ticket enable", description: "Enable tickets", usage: "ticket enable", aliases: [] },
      { name: "ticket disable", description: "Disable tickets", usage: "ticket disable", aliases: [] },
      { name: "ticket setup", description: "Setup ticket system", usage: "ticket setup <#channel> <#category> <@role>", aliases: [] },
      { name: "ticket setchannel", description: "Set ticket panel channel", usage: "ticket setchannel <#channel>", aliases: [] },
      { name: "ticket setcategory", description: "Set ticket category", usage: "ticket setcategory <#category>", aliases: [] },
      { name: "ticket setrole", description: "Set support role", usage: "ticket setrole <@role>", aliases: [] },
      { name: "ticket setlogs", description: "Set logs channel", usage: "ticket setlogs <#channel>", aliases: [] },
      { name: "ticket send", description: "Send ticket panel", usage: "ticket send", aliases: [] },
      { name: "ticket close", description: "Close current ticket", usage: "ticket close", aliases: [] },
      { name: "ticket add", description: "Add user to ticket", usage: "ticket add <@user>", aliases: [] },
      { name: "ticket remove", description: "Remove user from ticket", usage: "ticket remove <@user>", aliases: [] },
      { name: "ticket transcript", description: "Generate transcript", usage: "ticket transcript", aliases: [] },
      { name: "ticket settings", description: "View settings", usage: "ticket settings", aliases: ["ticket status"] }
    ]
  },

  // Giveaway Commands
  giveaway: {
    emoji: EMOJIS.giveaway,
    name: "Giveaways",
    description: "Giveaway system commands",
    commands: [
      { name: "giveaway enable", description: "Enable giveaways", usage: "giveaway enable", aliases: ["gw enable"] },
      { name: "giveaway disable", description: "Disable giveaways", usage: "giveaway disable", aliases: ["gw disable"] },
      { name: "giveaway create", description: "Create a giveaway", usage: "giveaway create <duration> <winners> <prize>", aliases: ["gw create", "gcreate"] },
      { name: "giveaway end", description: "End a giveaway", usage: "giveaway end <messageID>", aliases: ["gw end", "gend"] },
      { name: "giveaway reroll", description: "Reroll a giveaway", usage: "giveaway reroll <messageID> [winners]", aliases: ["gw reroll", "greroll"] },
      { name: "giveaway cancel", description: "Cancel a giveaway", usage: "giveaway cancel <messageID>", aliases: ["gw cancel", "gcancel"] },
      { name: "giveaway list", description: "List active giveaways", usage: "giveaway list", aliases: ["gw list", "glist"] },
      { name: "giveaway settings", description: "View settings", usage: "giveaway settings", aliases: ["gw settings"] }
    ]
  },


// Fun Commands - COMPLETE LIST
fun: {
  emoji: EMOJIS.fun,
  name: "Fun",
  description: "Fun commands",
  commands: [
    { name: "fun enable", description: "Enable fun commands", usage: "fun enable", aliases: [] },
    { name: "fun disable", description: "Disable fun commands", usage: "fun disable", aliases: [] },
    { name: "8ball", description: "Ask the magic 8ball", usage: "8ball <question>", aliases: ["eightball"] },
    { name: "coinflip", description: "Flip a coin", usage: "coinflip", aliases: ["cf", "flip"] },
    { name: "dice", description: "Roll a dice", usage: "dice [sides]", aliases: ["roll"] },
    { name: "choose", description: "Choose between options", usage: "choose <option1> | <option2> | ...", aliases: ["pick"] },
    { name: "rps", description: "Rock Paper Scissors", usage: "rps <rock/paper/scissors>", aliases: [] },
    { name: "meme", description: "Get a random meme", usage: "meme", aliases: [] },
    { name: "joke", description: "Get a random joke", usage: "joke", aliases: [] },
    { name: "fact", description: "Get a random fact", usage: "fact", aliases: [] },
    { name: "quote", description: "Get a random quote", usage: "quote", aliases: [] },
    { name: "reverse", description: "Reverse text", usage: "reverse <text>", aliases: [] },
    { name: "mock", description: "Mock text", usage: "mock <text>", aliases: [] },
    { name: "ship", description: "Ship two users", usage: "ship <@user1> <@user2>", aliases: [] },
    { name: "rate", description: "Rate something", usage: "rate <thing>", aliases: [] },
    
    // Roleplay commands with targets
    { name: "hug", description: "Hug someone", usage: "hug <@user>", aliases: [] },
    { name: "kiss", description: "Kiss someone", usage: "kiss <@user>", aliases: [] },
    { name: "pat", description: "Pat someone", usage: "pat <@user>", aliases: ["headpat"] },
    { name: "slap", description: "Slap someone", usage: "slap <@user>", aliases: [] },
    { name: "cuddle", description: "Cuddle someone", usage: "cuddle <@user>", aliases: ["snuggle"] },
    { name: "poke", description: "Poke someone", usage: "poke <@user>", aliases: [] },
    { name: "wave", description: "Wave at someone or alone", usage: "wave [@user]", aliases: ["hi"] },
    { name: "bite", description: "Bite someone", usage: "bite <@user>", aliases: [] },
    { name: "highfive", description: "High five someone", usage: "highfive <@user>", aliases: ["hi5"] },
    { name: "bonk", description: "Bonk someone", usage: "bonk <@user>", aliases: [] },
    { name: "yeet", description: "Yeet someone", usage: "yeet <@user>", aliases: [] },
    { name: "punch", description: "Punch someone", usage: "punch <@user>", aliases: [] },
    { name: "kill", description: "Attack someone", usage: "kill <@user>", aliases: [] },
    { name: "wink", description: "Wink at someone or alone", usage: "wink [@user]", aliases: [] },
    { name: "lick", description: "Lick someone", usage: "lick <@user>", aliases: [] },
    { name: "stare", description: "Stare at someone or alone", usage: "stare [@user]", aliases: [] },
    { name: "boop", description: "Boop someone's nose", usage: "boop <@user>", aliases: [] },
    { name: "nom", description: "Nom someone", usage: "nom <@user>", aliases: [] },
    { name: "handhold", description: "Hold someone's hand", usage: "handhold <@user>", aliases: ["holdhands"] },
    { name: "tickle", description: "Tickle someone", usage: "tickle <@user>", aliases: [] },
    { name: "feed", description: "Feed someone", usage: "feed <@user>", aliases: [] },
    
    // Self-expression commands (no target needed)
    { name: "cry", description: "Express crying", usage: "cry", aliases: [] },
    { name: "dance", description: "Start dancing", usage: "dance", aliases: [] },
    { name: "blush", description: "Show blushing", usage: "blush", aliases: [] },
    { name: "smile", description: "Show a smile", usage: "smile", aliases: [] },
    { name: "pout", description: "Pout at something", usage: "pout", aliases: [] },
    { name: "laugh", description: "Start laughing", usage: "laugh", aliases: ["lol"] },
    { name: "confused", description: "Express confusion", usage: "confused", aliases: ["huh"] },
    { name: "sleep", description: "Go to sleep", usage: "sleep", aliases: ["zzz"] },
    { name: "run", description: "Run away", usage: "run", aliases: [] },
    { name: "thumbsup", description: "Give a thumbs up", usage: "thumbsup", aliases: ["thumbs"] },
    { name: "facepalm", description: "Facepalm at something", usage: "facepalm", aliases: ["fp"] },
    { name: "shrug", description: "Shrug at something", usage: "shrug", aliases: [] }
  ]
},


  // Emoji/Sticker Commands
  // ── Emoji, Sticker & Sticky Messages (merged) ──
  emojisticker: {
    emoji: EMOJIS.sticker,
    name: "Emoji & Sticky",
    description: "Emoji, sticker and sticky message commands",
    commands: [
      // ─ Emoji & Sticker ─
      { name: "steal", description: "Steal a sticker", usage: "steal (reply to message)", aliases: ["stealsticker", "ss"] },
      { name: "stealemoji", description: "Steal an emoji", usage: "stealemoji <emoji> [name]", aliases: ["se", "addemoji", "ae"] },
      { name: "deleteemoji", description: "Delete an emoji", usage: "deleteemoji <emoji>", aliases: ["delemoji", "removeemoji"] },
      { name: "emojis", description: "List server emojis", usage: "emojis", aliases: ["emojilist", "listemojis"] },
      { name: "stickers", description: "List server stickers", usage: "stickers", aliases: ["stickerlist", "liststickers"] },
      { name: "enlarge", description: "Enlarge an emoji", usage: "enlarge <emoji>", aliases: ["jumbo", "big"] },
      // ─ Sticky Messages ─
      { name: "sticky enable", description: "Enable sticky system", usage: "sticky enable", aliases: [] },
      { name: "sticky disable", description: "Disable sticky system", usage: "sticky disable", aliases: [] },
      { name: "sticky set", description: "Set sticky message", usage: "sticky set <message>", aliases: ["sticky add"] },
      { name: "sticky remove", description: "Remove sticky message", usage: "sticky remove", aliases: ["sticky delete"] },
      { name: "sticky list", description: "List sticky messages", usage: "sticky list", aliases: [] },
      { name: "sticky settings", description: "View settings", usage: "sticky settings", aliases: [] }
    ]
  },

  // Autoresponder Commands
  // ── Auto Respond & Auto React (merged) ──
  autoresponder: {
    emoji: EMOJIS.autorespond,
    name: "Auto Respond & React",
    description: "Auto responder and auto react commands",
    commands: [
      // ─ Auto Responder ─
      { name: "autoresponder enable", description: "Enable autoresponder", usage: "autoresponder enable", aliases: ["ar enable"] },
      { name: "autoresponder disable", description: "Disable autoresponder", usage: "autoresponder disable", aliases: ["ar disable"] },
      { name: "autoresponder add", description: "Add autoresponder", usage: "autoresponder add <trigger> | <response>", aliases: ["ar add"] },
      { name: "autoresponder remove", description: "Remove autoresponder", usage: "autoresponder remove <trigger>", aliases: ["ar remove", "ar delete"] },
      { name: "autoresponder list", description: "List autoresponders", usage: "autoresponder list", aliases: ["ar list"] },
      { name: "autoresponder clear", description: "Clear all autoresponders", usage: "autoresponder clear", aliases: ["ar clear"] },
      { name: "autoresponder settings", description: "View settings", usage: "autoresponder settings", aliases: ["ar settings"] },
      // ─ Auto React ─
      { name: "autoreact enable", description: "Enable autoreact", usage: "autoreact enable", aliases: [] },
      { name: "autoreact disable", description: "Disable autoreact", usage: "autoreact disable", aliases: [] },
      { name: "autoreact add", description: "Add autoreact", usage: "autoreact add <trigger> <emoji1> [emoji2] ...", aliases: [] },
      { name: "autoreact remove", description: "Remove autoreact", usage: "autoreact remove <trigger>", aliases: ["autoreact delete"] },
      { name: "autoreact list", description: "List autoreacts", usage: "autoreact list", aliases: [] },
      { name: "autoreact clear", description: "Clear all autoreacts", usage: "autoreact clear", aliases: [] },
      { name: "autoreact settings", description: "View settings", usage: "autoreact settings", aliases: [] }
    ]
  },

  // Autoreact Commands

  // Sticky Commands

  // Logging Commands
  logging: {
    emoji: EMOJIS.logging,
    name: "Logging",
    description: "Logging system commands",
    commands: [
      { name: "logging enable", description: "Enable logging", usage: "logging enable", aliases: ["logs enable"] },
      { name: "logging disable", description: "Disable logging", usage: "logging disable", aliases: ["logs disable"] },
      { name: "logging setchannel", description: "Set logs channel", usage: "logging setchannel <#channel>", aliases: ["logs setchannel"] },
      { name: "logging toggle", description: "Toggle event logging", usage: "logging toggle <event>", aliases: ["logs toggle"] },
      { name: "logging events", description: "List all events", usage: "logging events", aliases: ["logs events"] },
      { name: "logging settings", description: "View settings", usage: "logging settings", aliases: ["logs settings", "logs status"] }
    ]
  },

  // Invites Commands

  // JoinDM Commands

  // Voice Commands
  voice: {
    emoji: EMOJIS.voice,
    name: "Voice",
    description: "Voice channel commands",
    commands: [
      { name: "voice limit", description: "Set user limit", usage: "voice limit <number>", aliases: [] },
      { name: "voice name", description: "Rename channel", usage: "voice name <name>", aliases: ["voice rename"] },
      { name: "voice lock", description: "Lock channel", usage: "voice lock", aliases: [] },
      { name: "voice unlock", description: "Unlock channel", usage: "voice unlock", aliases: [] },
      { name: "voice permit", description: "Allow user", usage: "voice permit <@user>", aliases: ["voice allow"] },
      { name: "voice reject", description: "Remove user access", usage: "voice reject <@user>", aliases: ["voice deny"] },
      { name: "voice claim", description: "Claim ownership", usage: "voice claim", aliases: [] },
      { name: "voice transfer", description: "Transfer ownership", usage: "voice transfer <@user>", aliases: [] }
    ]
  },

  // Temp Voice Commands
  tempvoice: {
    emoji: EMOJIS.tempvoice,
    name: "Temp Voice",
    description: "Temporary voice channels",
    commands: [
      { name: "tempvoice enable", description: "Enable temp voice", usage: "tempvoice enable", aliases: ["tv enable"] },
      { name: "tempvoice disable", description: "Disable temp voice", usage: "tempvoice disable", aliases: ["tv disable"] },
      { name: "tempvoice setchannel", description: "Set create channel", usage: "tempvoice setchannel <#channel>", aliases: ["tv setchannel"] },
      { name: "tempvoice setcategory", description: "Set category", usage: "tempvoice setcategory <#category>", aliases: ["tv setcategory"] },
      { name: "tempvoice setname", description: "Set default name", usage: "tempvoice setname <name>", aliases: ["tv setname"] },
      { name: "tempvoice settings", description: "View settings", usage: "tempvoice settings", aliases: ["tv settings"] }
    ]
  },

  // Media Commands
  media: {
    emoji: EMOJIS.media,
    name: "Media Channels",
    description: "Media channel commands",
    commands: [
      { name: "media enable", description: "Enable media system", usage: "media enable", aliases: [] },
      { name: "media disable", description: "Disable media system", usage: "media disable", aliases: [] },
      { name: "media add", description: "Add media-only channel", usage: "media add <#channel>", aliases: [] },
      { name: "media remove", description: "Remove media-only channel", usage: "media remove <#channel>", aliases: [] },
      { name: "media list", description: "List media channels", usage: "media list", aliases: [] },
      { name: "media setlogs", description: "Set delete logs channel", usage: "media setlogs <#channel>", aliases: [] },
      { name: "media settings", description: "View settings", usage: "media settings", aliases: [] }
    ]
  },

  // AFK Commands
  afk: {
    emoji: EMOJIS.afk,
    name: "AFK",
    description: "AFK system commands",
    commands: [
      { name: "afk enable", description: "Enable AFK system", usage: "afk enable", aliases: [] },
      { name: "afk disable", description: "Disable AFK system", usage: "afk disable", aliases: [] },
      { name: "afk", description: "Set AFK status (server only)", usage: "afk [reason]", aliases: [] },
      { name: "afk global", description: "Set global AFK status (all servers)", usage: "afk global [reason]", aliases: ["gafk"] },
      { name: "afk server", description: "Set server-specific AFK status", usage: "afk server [reason]", aliases: ["safk"] },
      { name: "afk remove", description: "Remove AFK status", usage: "afk remove", aliases: ["afk off"] },
      { name: "afk list", description: "List all AFK users in this server", usage: "afk list", aliases: [] },
      { name: "afk mentions", description: "View who mentioned you while AFK", usage: "afk mentions", aliases: [] },
      { name: "afk clear", description: "Clear all your AFK mentions", usage: "afk clear", aliases: [] },
      { name: "afk setmessage", description: "Set AFK message template", usage: "afk setmessage <message>", aliases: [] },
      { name: "afk settings", description: "View AFK settings", usage: "afk settings", aliases: [] }
    ]
  },


  // Birthday Commands
  birthday: {
    emoji: EMOJIS.birthday,
    name: "Birthday",
    description: "Birthday system commands",
    commands: [
      { name: "birthday enable", description: "Enable birthdays", usage: "birthday enable", aliases: ["bday enable"] },
      { name: "birthday disable", description: "Disable birthdays", usage: "birthday disable", aliases: ["bday disable"] },
      { name: "birthday set", description: "Set your birthday", usage: "birthday set <YYYY-MM-DD>", aliases: ["bday set"] },
      { name: "birthday remove", description: "Remove your birthday", usage: "birthday remove", aliases: ["bday remove"] },
      { name: "birthday setchannel", description: "Set birthday channel", usage: "birthday setchannel <#channel>", aliases: ["bday setchannel"] },
      { name: "birthday setrole", description: "Set birthday role", usage: "birthday setrole <@role>", aliases: ["bday setrole"] },
      { name: "birthday setmessage", description: "Set birthday message", usage: "birthday setmessage <message>", aliases: ["bday setmessage"] },
      { name: "birthday list", description: "List upcoming birthdays", usage: "birthday list", aliases: ["bday list"] },
      { name: "birthday settings", description: "View settings", usage: "birthday settings", aliases: ["bday settings"] }
    ]
  },

  // wall Commands
wall: {
  emoji: EMOJIS.wall,
  name: "Wall System",
  description: "Role quarantine system — isolate dangerous users",
  commands: [
    { name: "wall enable", description: "Enable wall system & auto-create roles", usage: "wall enable", aliases: [] },
    { name: "wall disable", description: "Disable wall system", usage: "wall disable", aliases: [] },
    { name: "wall quarantine @user [reason]", description: "Quarantine a user (removes roles, blocks commands)", usage: "wall quarantine @user [reason]", aliases: ["wall q"] },
    { name: "wall release @user", description: "Release a user from quarantine (restores roles)", usage: "wall release @user", aliases: ["wall uq"] },
    { name: "wall immune @user", description: "Toggle immunity for a user", usage: "wall immune @user", aliases: [] },
    { name: "wall list", description: "List quarantined users", usage: "wall list", aliases: [] },
    { name: "wall setlogs #channel", description: "Set log channel", usage: "wall setlogs #channel", aliases: [] },
    { name: "wall settings", description: "View wall settings", usage: "wall settings", aliases: [] }
  ]
},


  // Suggestions Commands
  suggestions: {
    emoji: EMOJIS.suggestions,
    name: "Suggestions",
    description: "Suggestion system commands",
    commands: [
      { name: "suggestions enable", description: "Enable suggestions", usage: "suggestions enable", aliases: ["suggest enable"] },
      { name: "suggestions disable", description: "Disable suggestions", usage: "suggestions disable", aliases: ["suggest disable"] },
      { name: "suggestions setchannel", description: "Set suggestions channel", usage: "suggestions setchannel <#channel>", aliases: ["suggest setchannel"] },
      { name: "suggest", description: "Make a suggestion", usage: "suggest <suggestion>", aliases: [] },
      { name: "suggestions settings", description: "View settings", usage: "suggestions settings", aliases: ["suggest settings"] }
    ]
  },

  // ── Roles (merged: Button Roles + Dropdown Roles + Custom Roles + Auto Roles) ──
  roles: {
    emoji: EMOJIS.buttonroles,
    name: "Roles",
    description: "All role management — button, dropdown, custom & auto roles",
    commands: [
      // ─ Button Roles ─
      { name: "buttonrole create", description: "Create button role panel", usage: "buttonrole create <#channel> <title> | <description>", aliases: ["br create"] },
      { name: "buttonrole add", description: "Add role to button panel", usage: "buttonrole add <messageID> <@role> <label> [emoji]", aliases: ["br add"] },
      { name: "buttonrole remove", description: "Remove role from button panel", usage: "buttonrole remove <messageID> <@role>", aliases: ["br remove"] },
      { name: "buttonrole list", description: "List button role panels", usage: "buttonrole list", aliases: ["br list"] },
      // ─ Dropdown Roles ─
      { name: "dropdownrole create", description: "Create dropdown role panel", usage: "dropdownrole create <#channel> <title> | <description>", aliases: ["dr create"] },
      { name: "dropdownrole add", description: "Add role to dropdown panel", usage: "dropdownrole add <messageID> <@role> <label> [description]", aliases: ["dr add"] },
      { name: "dropdownrole remove", description: "Remove role from dropdown panel", usage: "dropdownrole remove <messageID> <@role>", aliases: ["dr remove"] },
      { name: "dropdownrole list", description: "List dropdown role panels", usage: "dropdownrole list", aliases: ["dr list"] },
      // ─ Custom Roles ─
      { name: "customrole enable", description: "Enable custom roles", usage: "customrole enable", aliases: ["cr enable"] },
      { name: "customrole disable", description: "Disable custom roles", usage: "customrole disable", aliases: ["cr disable"] },
      { name: "customrole create", description: "Create a custom role", usage: "customrole create <n> <color>", aliases: ["cr create"] },
      { name: "customrole delete", description: "Delete your custom role", usage: "customrole delete", aliases: ["cr delete"] },
      { name: "customrole edit", description: "Edit your custom role", usage: "customrole edit <name/color> <value>", aliases: ["cr edit"] },
      { name: "customrole settings", description: "View custom role settings", usage: "customrole settings", aliases: ["cr settings"] },
      // ─ Auto Roles ─
      { name: "autorole add", description: "Add an auto role on join", usage: "autorole add <@role>", aliases: [] },
      { name: "autorole remove", description: "Remove an auto role", usage: "autorole remove <@role>", aliases: [] },
      { name: "autorole list", description: "List all auto roles", usage: "autorole list", aliases: [] },
      { name: "autorole clear", description: "Clear all auto roles", usage: "autorole clear", aliases: [] }
    ]
  },

  // ── General (Economy + Confession + Counting + Invites) ──
  // ── General (Economy + Confession + Counting + Invites) ──
  general: {
    emoji: EMOJIS.economy,
    name: "General",
    description: "Economy, Confessions, Counting & Invites",
    commands: [
      // ─ Economy ─
      { name: "economy enable", description: "Enable economy", usage: "economy enable", aliases: [] },
      { name: "economy disable", description: "Disable economy", usage: "economy disable", aliases: [] },
      { name: "balance", description: "Check balance", usage: "balance [@user]", aliases: ["bal", "money"] },
      { name: "daily", description: "Claim daily reward", usage: "daily", aliases: [] },
      { name: "work", description: "Work for coins", usage: "work", aliases: [] },
      { name: "pay", description: "Pay another user", usage: "pay <@user> <amount>", aliases: ["give", "transfer"] },
      { name: "deposit", description: "Deposit to bank", usage: "deposit <amount/all>", aliases: ["dep"] },
      { name: "withdraw", description: "Withdraw from bank", usage: "withdraw <amount/all>", aliases: ["with"] },
      { name: "rob", description: "Rob another user", usage: "rob <@user>", aliases: ["steal"] },
      { name: "baltop", description: "Balance leaderboard", usage: "baltop [page]", aliases: ["richest"] },
      { name: "economy settings", description: "View economy settings", usage: "economy settings", aliases: ["economy status"] },
      // ─ Confessions ─
      { name: "confession enable", description: "Enable confessions", usage: "confession enable", aliases: ["confess enable"] },
      { name: "confession disable", description: "Disable confessions", usage: "confession disable", aliases: ["confess disable"] },
      { name: "confession setchannel", description: "Set confession channel", usage: "confession setchannel <#channel>", aliases: ["confess setchannel"] },
      { name: "confession setlogs", description: "Set confession logs channel", usage: "confession setlogs <#channel>", aliases: ["confess setlogs"] },
      { name: "confession ban", description: "Ban user from confessing", usage: "confession ban <@user>", aliases: ["confess ban"] },
      { name: "confession unban", description: "Unban user from confessing", usage: "confession unban <@user>", aliases: ["confess unban"] },
      { name: "confession settings", description: "View confession settings", usage: "confession settings", aliases: ["confess settings"] },
      // ─ Counting ─
      { name: "counting enable", description: "Enable counting system", usage: "counting enable", aliases: [] },
      { name: "counting disable", description: "Disable counting system", usage: "counting disable", aliases: [] },
      { name: "counting setchannel", description: "Set counting channel", usage: "counting setchannel <#channel>", aliases: [] },
      { name: "counting reset", description: "Reset the count to 0", usage: "counting reset", aliases: [] },
      { name: "counting stats", description: "View counting statistics", usage: "counting stats", aliases: [] },
      { name: "counting settings", description: "View counting settings", usage: "counting settings", aliases: ["counting status"] },
      // ─ Invites ─
      { name: "invites enable", description: "Enable invite tracking", usage: "invites enable", aliases: [] },
      { name: "invites disable", description: "Disable invite tracking", usage: "invites disable", aliases: [] },
      { name: "invites", description: "Check invites", usage: "invites [@user]", aliases: ["inv"] },
      { name: "invites leaderboard", description: "Invite leaderboard", usage: "invites leaderboard", aliases: ["invites lb", "invites top"] },
      { name: "invites reset", description: "Reset invites", usage: "invites reset [@user]", aliases: [] },
      { name: "invites settings", description: "View settings", usage: "invites settings", aliases: [] }
    ]
  },

  // ── Settings (Premium + Command Management + Bot Identity + Utility) ──
  settings: {
    emoji: "<:ssetting:1486660331207004220>",
    name: "Settings",
    description: "Premium, Command Management, Bot Identity & Utility",
    commands: [
      // ─ Premium ─
      { name: "premium status", description: "Check your premium status", usage: "premium status", aliases: ["premium check", "prem status"] },
      { name: "premium plans", description: "View all premium plans", usage: "premium plans", aliases: ["premium info", "prem plans"] },
      { name: "premium add", description: "Give premium to user/guild (owner only)", usage: "premium add <user/guild> <id> <plan> [days]", aliases: ["prem add"] },
      { name: "premium remove", description: "Revoke premium (owner only)", usage: "premium remove <user/guild> <id>", aliases: ["prem remove"] },
      { name: "premium list", description: "List all premium holders (owner only)", usage: "premium list", aliases: ["prem list"] },
      // ─ Command Management ─
      { name: "command enable", description: "Enable a command", usage: "command enable <command>", aliases: ["cmd enable"] },
      { name: "command disable", description: "Disable a command", usage: "command disable <command>", aliases: ["cmd disable"] },
      { name: "command list", description: "List disabled commands", usage: "command list", aliases: ["cmd list"] },
      { name: "system enable", description: "Enable a system", usage: "system enable <s>", aliases: [] },
      { name: "system disable", description: "Disable a system", usage: "system disable <s>", aliases: [] },
      { name: "system list", description: "List all systems and their status", usage: "system list", aliases: [] },
      // ─ Bot Identity ─
      { name: "botset name", description: "Change bot nickname in this server", usage: "botset name <new name>", aliases: ["setname"] },
      { name: "botset avatar", description: "Set server-specific bot avatar", usage: "botset avatar <url>", aliases: ["setavatar"] },
      { name: "botset banner", description: "Set server-specific bot banner", usage: "botset banner <url>", aliases: ["setbanner"] },
      { name: "botset reset", description: "Reset all bot identity settings", usage: "botset reset", aliases: [] },
      // ─ Utility ─
      { name: "help", description: "Show help menu", usage: "help [command]", aliases: ["h", "commands"] },
      { name: "ping", description: "Check bot latency", usage: "ping", aliases: ["latency"] },
      { name: "avatar", description: "Get user avatar", usage: "avatar [@user]", aliases: ["av", "pfp"] },
      { name: "banner", description: "Get user banner", usage: "banner [@user]", aliases: [] },
      { name: "userinfo", description: "Get user info", usage: "userinfo [@user]", aliases: ["ui", "whois"] },
      { name: "serverinfo", description: "Get server info", usage: "serverinfo", aliases: ["si", "server"] },
      { name: "roleinfo", description: "Get role info", usage: "roleinfo <@role>", aliases: ["ri"] },
      { name: "channelinfo", description: "Get channel info", usage: "channelinfo [#channel]", aliases: ["ci"] },
      { name: "membercount", description: "Get member count", usage: "membercount", aliases: ["mc", "members"] },
      { name: "botinfo", description: "Get bot info", usage: "botinfo", aliases: ["info", "stats", "about"] },
      { name: "prefix", description: "View or change prefix", usage: "prefix [new prefix]", aliases: ["setprefix"] },
      { name: "poll", description: "Create a poll", usage: "poll <question> | <option1> | <option2>", aliases: [] },
      { name: "remind", description: "Set a reminder", usage: "remind <time> <message>", aliases: ["reminder"] },
      { name: "snipe", description: "View deleted messages", usage: "snipe [number]", aliases: ["s"] },
      { name: "invite", description: "Get bot invite link", usage: "invite", aliases: ["inv"] },
      // ─ No Prefix ─
      { name: "noprefix add", description: "Add a no-prefix user", usage: "noprefix add <@user>", aliases: ["npx add"] },
      { name: "noprefix remove", description: "Remove a no-prefix user", usage: "noprefix remove <@user>", aliases: ["npx remove"] },
      { name: "noprefix list", description: "List no-prefix users", usage: "noprefix list", aliases: ["npx list"] },
      // ─ Bad Word Filter ─
      { name: "badword add", description: "Add a banned word", usage: "badword add <word>", aliases: ["bw add"] },
      { name: "badword remove", description: "Remove a banned word", usage: "badword remove <word>", aliases: ["bw remove"] },
      { name: "badword list", description: "List banned words", usage: "badword list", aliases: ["bw list"] },
      { name: "badword clear", description: "Clear all banned words", usage: "badword clear", aliases: ["bw clear"] },
      { name: "badwordimmune addrole", description: "Add immune role from bad word filter", usage: "badwordimmune addrole <@role>", aliases: [] },
      { name: "badwordimmune removerole", description: "Remove immune role", usage: "badwordimmune removerole <@role>", aliases: [] },
      { name: "badwordimmune list", description: "List immune roles", usage: "badwordimmune list", aliases: [] },
      // ─ NSFW Filter ─
      { name: "nsfwword add", description: "Add an NSFW word", usage: "nsfwword add <word>", aliases: [] },
      { name: "nsfwword remove", description: "Remove an NSFW word", usage: "nsfwword remove <word>", aliases: [] },
      { name: "nsfwword list", description: "List NSFW words", usage: "nsfwword list", aliases: [] },
      { name: "nsfwimmune enable", description: "Enable NSFW filter", usage: "nsfwimmune enable", aliases: [] },
      { name: "nsfwimmune disable", description: "Disable NSFW filter", usage: "nsfwimmune disable", aliases: [] },
      { name: "nsfwimmune addrole", description: "Add immune role from NSFW filter", usage: "nsfwimmune addrole <@role>", aliases: [] },
      // ─ Anti-Link Immune ─
      { name: "antilinkimmune addrole", description: "Add role immune to anti-link", usage: "antilinkimmune addrole <@role>", aliases: ["alimmune addrole"] },
      { name: "antilinkimmune removerole", description: "Remove immune role", usage: "antilinkimmune removerole <@role>", aliases: ["alimmune removerole"] },
      { name: "antilinkimmune list", description: "List immune roles", usage: "antilinkimmune list", aliases: ["alimmune list"] },
      // ─ Filter Immunity ─
      { name: "filterimmune", description: "View all filter immunity commands", usage: "filterimmune", aliases: ["immune"] }
    ]
  }
};

/* ================= HELP MENU BUILDER ================= */

// ============================================================
//  HELP SYSTEM — Zynrax-style with paginated ephemeral pages
// ============================================================

// In-memory page state:  sessionKey -> { category, page }
const helpSessions = new Map();

const HELP_PAGE_SIZE = 8;  // commands per page

function buildMainHelpContainer(guildId) {
  const PREFIX = guildId ? getPrefix(guildId) : DEFAULT_PREFIX;
  const totalCommands = Object.values(ALL_COMMANDS).reduce((acc, cat) => acc + cat.commands.length, 0);

  const entries = Object.entries(ALL_COMMANDS);
  const moduleLines = entries.map(([, cat]) => `> ${cat.emoji} **»** **${cat.name}**`).join("\n");

  const options = entries.slice(0, 25).map(([key, cat]) => ({
    label: cat.name,
    description: cat.description.slice(0, 100),
    value: key,
    emoji: cat.emoji.startsWith('<') ? { id: cat.emoji.match(/:(\d+)>/)?.[1], name: cat.emoji.match(/<a?:([^:]+):/)?.[1] || 'emoji' } : { name: cat.emoji }
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("help_category")
    .setPlaceholder("> Select Module From Here")
    .addOptions(options);

  const selectRow = new ActionRowBuilder().addComponents(selectMenu);

  const container = new ContainerBuilder()
    .addSectionComponents(section =>
      section
        .addTextDisplayComponents(text =>
          text.setContent(
            `## Hey , I'm ${client.user.username}™\n` +
            `A powerful multipurpose bot`
          )
        )
        .setThumbnailAccessory(thumb =>
          thumb.setURL(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
        )
    )
    .addTextDisplayComponents(text =>
      text.setContent(
        `**• My Prefix is \`${PREFIX}\`\n` +
        `• Total Commands: \`${totalCommands}\`\n` +
        `• Choose a Specific Module of your Desire**\n` +
        `${moduleLines}`
      )
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(
        `<:slink:1486670968871981166> **Links**\n` +
        `[**Invite Me**](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands) | [**Support Server**](https://discord.gg/rJxzFvmxtR) | [**Website**](https://your-website.com)`
      )
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addActionRowComponents(selectRow)
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(`-# Designed By be_my_mommy`)
    );

  return container;
}

function buildMainHelpEmbed(botAvatar, guildId) {
  return null; // replaced by buildMainHelpContainer
}

function buildHelpComponents(PREFIX) {
  const options = Object.entries(ALL_COMMANDS).slice(0, 25).map(([key, cat]) => ({
    label: cat.name,
    description: cat.description.slice(0, 100),
    value: key,
    emoji: cat.emoji.startsWith('<') ? { id: cat.emoji.match(/:(\d+)>/)?.[1], name: cat.emoji.match(/<a?:([^:]+):/)?.[1] || 'emoji' } : { name: cat.emoji }
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("help_category")
    .setPlaceholder("> Select Module From Here")
    .addOptions(options);

  return [new ActionRowBuilder().addComponents(selectMenu)];
}


// Same as buildHelpComponents but pre-selects a category (shows selected module in dropdown)
function buildHelpComponentsWithSelected(PREFIX, selectedKey) {
  const options = Object.entries(ALL_COMMANDS).slice(0, 25).map(([key, cat]) => ({
    label: cat.name,
    description: cat.description.slice(0, 100),
    value: key,
    default: key === selectedKey,
    emoji: cat.emoji.startsWith('<') ? { id: cat.emoji.match(/:(\d+)>/)?.[1], name: cat.emoji.match(/<a?:([^:]+):/)?.[1] || 'emoji' } : { name: cat.emoji }
  }));

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("help_category")
    .setPlaceholder("> Select Module From Here")
    .addOptions(options);

  return [new ActionRowBuilder().addComponents(selectMenu)];
}

// Build a paginated category container — Components V2 style matching Zynrax
function buildCategoryPage(catKey, page, requesterId, guildId) {
  const PREFIX = guildId ? getPrefix(guildId) : DEFAULT_PREFIX;
  const cat = ALL_COMMANDS[catKey];
  if (!cat) return null;

  const cmds = cat.commands;
  const totalPages = Math.max(1, Math.ceil(cmds.length / HELP_PAGE_SIZE));
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const slice = cmds.slice(safePage * HELP_PAGE_SIZE, (safePage + 1) * HELP_PAGE_SIZE);

  // Group sub-commands under their base command name
  const groups = new Map();
  for (const cmd of slice) {
    const base = cmd.name.split(" ")[0];
    if (!groups.has(base)) groups.set(base, []);
    groups.get(base).push(cmd);
  }

  let desc = `**${cat.emoji} ${cat.name}**\n\n`;
  for (const [base, groupCmds] of groups) {
    const hasSubcmds = groupCmds.some(c => c.name.includes(" "));
    const heading = base.charAt(0).toUpperCase() + base.slice(1);
    if (hasSubcmds) {
      desc += `**${heading}**\n`;
      desc += groupCmds.map(c => `\`${PREFIX}${c.usage}\``).join(" , ") + "\n\n";
    } else {
      const c = groupCmds[0];
      desc += `**${heading}**\n\`${PREFIX}${c.usage}\`\n\n`;
    }
  }

  // Build select menu (pre-selected on current category)
  const options = Object.entries(ALL_COMMANDS).slice(0, 25).map(([key, c]) => ({
    label: c.name,
    description: c.description.slice(0, 100),
    value: key,
    default: key === catKey,
    emoji: c.emoji.startsWith('<') ? { id: c.emoji.match(/:(\d+)>/)?.[1], name: c.emoji.match(/<a?:([^:]+):/)?.[1] || 'emoji' } : { name: c.emoji }
  }));
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("help_category")
    .setPlaceholder("> Select Module From Here")
    .addOptions(options);
  const selectRow = new ActionRowBuilder().addComponents(selectMenu);

  const container = new ContainerBuilder()
    .addSectionComponents(section =>
      section
        .addTextDisplayComponents(text => text.setContent(desc.trimEnd()))
        .setThumbnailAccessory(thumb =>
          thumb.setURL(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
        )
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addActionRowComponents(selectRow);

  return { container, page: safePage, totalPages };
}

function buildHelpPageButtons(sessionKey, page, totalPages, catKey) {
  const atFirst = page === 0;
  const atLast  = page >= totalPages - 1;

  // Get module index for prev/next module switching
  const allKeys = Object.keys(ALL_COMMANDS);
  const catIndex = allKeys.indexOf(catKey);
  const atFirstModule = catIndex <= 0;
  const atLastModule  = catIndex >= allKeys.length - 1;

  // Layout: ◀ prev module | ← prev page | 🏠 home | next page → | next module ▶
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`help_prevmod_${sessionKey}`)
      .setEmoji({ id: "1486643600887648377", name: "sbackword" })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(atFirstModule),
    new ButtonBuilder()
      .setCustomId(`help_prev_${sessionKey}`)
      .setEmoji({ id: "1486643699713704036", name: "sback" })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(atFirst),
    new ButtonBuilder()
      .setCustomId("help_main")
      .setEmoji({ id: "1486643502145077258", name: "shome" })
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`help_next_${sessionKey}`)
      .setEmoji({ id: "1486643721616363540", name: "snext" })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(atLast),
    new ButtonBuilder()
      .setCustomId(`help_nextmod_${sessionKey}`)
      .setEmoji({ id: "1486643552589975692", name: "sforward" })
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(atLastModule)
  );
}

/* ── CMD → CATEGORY MAP (used by showCmdHelp) ── */
const CMD_HELP_MAP = {
  // ─ Moderation ─
  moderation: "moderation",
  ban: "moderation", unban: "moderation", kick: "moderation",
  mute: "moderation", timeout: "moderation", unmute: "moderation", untimeout: "moderation",
  warn: "moderation", warnings: "moderation", warns: "moderation",
  clearwarns: "moderation", clearwarnings: "moderation", delwarns: "moderation",
  removewarn: "moderation", delwarn: "moderation", unwarn: "moderation",
  purge: "moderation", clear: "moderation", prune: "moderation", cl: "moderation",
  lock: "moderation", unlock: "moderation",
  slowmode: "moderation", slow: "moderation",
  nuke: "moderation",
  // ─ Anti-Nuke ─
  antinuke: "antinuke", an: "antinuke",
  // ─ Anti-Bot ─
  antibot: "antibot", ab: "antibot",
  // ─ Auto-Mod / Anti-Link ─
  automod: "automod", am: "automod",
  antilink: "automod", al: "automod",
  // ─ Logging ─
  logging: "logging", logs: "logging",
  // ─ Welcome ─
  welcome: "welcome",
  // ─ Goodbye ─
  goodbye: "goodbye", bye: "goodbye",
  // ─ Boost ─
  boost: "boost",
  // ─ Ticket ─
  ticket: "ticket",
  // ─ Giveaway ─
  giveaway: "giveaway", gw: "giveaway",
  gcreate: "giveaway", gstart: "giveaway",
  gend: "giveaway", greroll: "giveaway", gall: "giveaway",
  // ─ Emoji / Sticker / Sticky ─
  emojisticker: "emojisticker",
  sticky: "emojisticker",
  steal: "emojisticker", stealsticker: "emojisticker", ss: "emojisticker",
  stealemoji: "emojisticker", se: "emojisticker", addemoji: "emojisticker", ae: "emojisticker",
  deleteemoji: "emojisticker", delemoji: "emojisticker", removeemoji: "emojisticker",
  enlarge: "emojisticker", jumbo: "emojisticker", big: "emojisticker", bigemoji: "emojisticker",
  emojis: "emojisticker", emojilist: "emojisticker", listemojis: "emojisticker",
  stickers: "emojisticker", stickerlist: "emojisticker", liststickers: "emojisticker",
  // ─ Auto Responder ─
  autoresponder: "autoresponder",
  // ─ Voice ─
  voice: "voice", vc: "voice",
  // ─ Temp Voice ─
  tempvoice: "tempvoice", tv: "tempvoice",
  // ─ Media ─
  media: "media", mediaonly: "media",
  // ─ AFK ─
  afk: "afk",
  // ─ Birthday ─
  birthday: "birthday", bday: "birthday",
  // ─ Suggestions ─
  suggestions: "suggestions", suggest: "suggestions",
  // ─ Wall ─
  wall: "wall",
  quarantine: "wall", q8: "wall", jail: "wall",
  release: "wall", unquarantine: "wall", unjail: "wall",
  // ─ Fun ─
  fun: "fun",
  hug: "fun", kiss: "fun", pat: "fun", headpat: "fun",
  slap: "fun", cuddle: "fun", snuggle: "fun", poke: "fun",
  wave: "fun", hi: "fun", bite: "fun", cry: "fun",
  dance: "fun", blush: "fun", smile: "fun",
  highfive: "fun", hi5: "fun", bonk: "fun", yeet: "fun",
  punch: "fun", kill: "fun", wink: "fun", pout: "fun",
  laugh: "fun", lol: "fun", confused: "fun", huh: "fun",
  sleep: "fun", zzz: "fun", run: "fun", lick: "fun",
  stare: "fun", thumbsup: "fun", thumbs: "fun",
  facepalm: "fun", fp: "fun", shrug: "fun",
  boop: "fun", nom: "fun", handhold: "fun", holdhands: "fun",
  tickle: "fun", feed: "fun",
  meme: "fun", joke: "fun", fact: "fun", quote: "fun",
  "8ball": "fun", eightball: "fun", ask: "fun",
  coinflip: "fun", cf: "fun", flip: "fun", coin: "fun",
  dice: "fun", roll: "fun", die: "fun",
  choose: "fun", pick: "fun", decide: "fun",
  rps: "fun", reverse: "fun", mock: "fun",
  ship: "fun", love: "fun", match: "fun", rate: "fun",
  // ─ Roles ─
  roles: "roles",
  autorole: "roles", ar: "roles",
  buttonrole: "roles", br: "roles",
  dropdownrole: "roles", dr: "roles",
  customrole: "roles", cr: "roles",
  rr: "roles", reactionrole: "roles",
  // ─ General (economy, confession, counting, invites, joindm, autoreact) ─
  general: "general",
  economy: "general", eco: "general",
  balance: "general", bal: "general", money: "general", wallet: "general",
  daily: "general", work: "general",
  pay: "general", give: "general", transfer: "general",
  deposit: "general", dep: "general",
  withdraw: "general", with: "general",
  baltop: "general", richest: "general", rich: "general",
  rob: "general",
  confession: "general", confess: "general",
  counting: "general", count: "general",
  invites: "general", invs: "general",
  joindm: "general",
  autoreact: "general",
  // ─ Settings (premium, command, noprefix, botset, filters, utility) ─
  settings: "settings",
  premium: "settings", prem: "settings",
  command: "settings", cmd: "settings",
  system: "settings",
  noprefix: "settings", npx: "settings",
  botset: "settings", setname: "settings", setavatar: "settings", setbanner: "settings",
  badword: "settings", bw: "settings",
  badwordimmune: "settings", bwimmune: "settings",
  nsfwword: "settings", nsfwwords: "settings",
  nsfwimmune: "settings", nsfwfilter: "settings",
  antilinkimmune: "settings", alimmune: "settings",
  filterimmune: "settings", immune: "settings",
  disablechannel: "settings", disablechan: "settings",
  help: "settings", h: "settings", commands: "settings",
  ping: "settings", latency: "settings",
  prefix: "settings", setprefix: "settings",
  avatar: "settings", av: "settings", pfp: "settings",
  banner: "settings", userbanner: "settings",
  userinfo: "settings", ui: "settings", whois: "settings", user: "settings",
  serverinfo: "settings", si: "settings", server: "settings", guild: "settings",
  roleinfo: "settings", ri: "settings",
  membercount: "settings", mc: "settings", members: "settings",
  botinfo: "settings", info: "settings", stats: "settings", about: "settings", bot: "settings",
  poll: "settings", remind: "settings", reminder: "settings", remindme: "settings",
  snipe: "settings", editsnipe: "settings",
  invite: "settings", inv: "settings", botinvite: "settings",
  fakeban: "settings", fban: "settings",
  fakekick: "settings", fkick: "settings",
  fakemute: "settings", fmute: "settings",
  embed: "settings",
};

/**
 * Reply with a styled help embed for any command — matching Zynrax style.
 * Shows: category header, description, all usages, and aliases.
 */
function showCmdHelp(cmdName, msg, guildId) {
  const PREFIX = getPrefix(guildId);
  const catKey = CMD_HELP_MAP[cmdName?.toLowerCase()];
  const cat = catKey ? ALL_COMMANDS[catKey] : null;

  if (cat) {
    const lines = cat.commands.map(c => {
      const aliases = c.aliases.length ? ` *(${c.aliases.map(a => `\`${PREFIX}${a}\``).join(", ")})*` : "";
      return `\`${PREFIX}${c.usage}\` — ${c.description}${aliases}`;
    }).join("\n");

    const embed = new EmbedBuilder()
      .setColor(BOT_COLOR)
      .setAuthor({ name: `${cat.emoji || "📖"} ${cat.name}`, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setDescription(`> ${cat.description}\n\n**Command Usage**\n${lines}`)
      .setFooter({ text: `<> = Required  •  [] = Optional  |  Use ${PREFIX}help for all modules` });

    return msg.reply({ embeds: [embed] });
  }

  // Fallback: search individual command
  const embed = getCommandHelpEmbed(cmdName, guildId);
  return msg.reply({ embeds: [embed] });
}

function getCommandHelpEmbed(commandName, guildId) {
  const PREFIX = guildId ? getPrefix(guildId) : DEFAULT_PREFIX;

  // Also search by category name (e.g. "antinuke")
  if (ALL_COMMANDS[commandName.toLowerCase()]) {
    const cat = ALL_COMMANDS[commandName.toLowerCase()];
    const usages = cat.commands.map(c => `\`${PREFIX}${c.usage}\``).join(" , ");
    return new EmbedBuilder()
      .setColor(BOT_COLOR)
      .setAuthor({ name: cat.name, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
      .setDescription(`**${cat.name}**\n${usages}`)
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setFooter({ text: `Use !help for all modules` });
  }

  for (const [, cat] of Object.entries(ALL_COMMANDS)) {
    const cmd = cat.commands.find(c =>
      c.name.toLowerCase() === commandName.toLowerCase() ||
      c.aliases.includes(commandName.toLowerCase())
    );
    if (cmd) {
      return new EmbedBuilder()
        .setColor(BOT_COLOR)
        .setAuthor({ name: cat.name, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(
          `## ${cmd.name.charAt(0).toUpperCase() + cmd.name.slice(1)}\n` +
          `\`${PREFIX}${cmd.usage}\`\n\n` +
          `${cmd.description}` +
          (cmd.aliases.length ? `\n\n**Aliases:** ${cmd.aliases.map(a => `\`${a}\``).join(", ")}` : "")
        )
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setFooter({ text: `Category: ${cat.name} | <> = Required • [] = Optional` });
    }
  }

  return createErrorEmbed("Not Found", `No command or module named \`${commandName}\`.\nUse \`${PREFIX}help\` to see all modules.`);
}

/* ================= ALL SYSTEMS LIST ================= */

const ALL_SYSTEMS = [
  { name: "welcome",      displayName: "Welcome System"    },
  { name: "goodbye",      displayName: "Goodbye System"    },
  { name: "boost",        displayName: "Boost Messages"    },
  { name: "afk",          displayName: "AFK System"        },
  { name: "ticket",       displayName: "Ticket System"     },
  { name: "confession",   displayName: "Confessions"       },
  { name: "birthday",     displayName: "Birthday System"   },
  { name: "logging",      displayName: "Logging System"    },
  { name: "antibot",      displayName: "Anti-Bot"          },
  { name: "antinuke",     displayName: "Anti-Nuke"         },
  { name: "antilink",     displayName: "Anti-Link"         },
  { name: "automod",      displayName: "Auto-Mod"          },
  { name: "tempvoice",    displayName: "Temp Voice"        },
  { name: "joindm",       displayName: "Join DM"           },
  { name: "economy",      displayName: "Economy"           },
  { name: "counting",     displayName: "Counting"          },
  { name: "suggestions",  displayName: "Suggestions"       },
  { name: "fun",          displayName: "Fun Commands"      },
  { name: "giveaway",     displayName: "Giveaways"         },
  { name: "invites",      displayName: "Invite Tracking"   },
  { name: "sticky",       displayName: "Sticky Messages"   },
  { name: "wall",         displayName: "Wall System"       },
  { name: "autoresponder",displayName: "Auto Responder"    },
  { name: "autoreact",    displayName: "Auto React"        },
  { name: "customroles",  displayName: "Custom Roles"      }
];

function buildRRPreview(session) {
  const roleLines = session.roles.length > 0
    ? session.roles.map((r, i) => `\`${i + 1}.\` <@&${r.roleId}> — **${r.label}**`).join("\n")
    : "*No roles added yet — use **➕ Add Role** to begin.*";
  return createEmbed({
    title: session.title,
    description: `${session.description}\n\n${roleLines}`,
    footer: `Reaction Role Builder • ${session.roles.length}/20 roles`
  });
}

function buildRRButtons(sessionId, session) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`rr_settitle_${sessionId}`).setLabel("✏️ Set Title / Description").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`rr_addrole_${sessionId}`).setLabel("➕ Add Role").setStyle(ButtonStyle.Primary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`rr_removerole_${sessionId}`).setLabel("➖ Remove Role").setStyle(ButtonStyle.Danger).setDisabled(session.roles.length === 0),
    new ButtonBuilder().setCustomId(`rr_post_${sessionId}`).setLabel("✅ Post Panel").setStyle(ButtonStyle.Success).setDisabled(session.roles.length === 0),
    new ButtonBuilder().setCustomId(`rr_cancel_${sessionId}`).setLabel("🗑️ Cancel").setStyle(ButtonStyle.Danger)
  );
  return { row1, row2 };
}

function buildTogglePanel(guildId) {
  const lines = ALL_SYSTEMS.map(sys => {
    const on = isSystemEnabled(guildId, sys.name);
    return on
      ? `<:disable:1486743464455438500> <:senable:1485900930002980914> **${sys.displayName}**`
      : `<:sdisable:1485900938475475045> <:enable:1486743355277967460> **${sys.displayName}**`;
  }).join("\n");

  function makeOptions(chunk) {
    return chunk.map(sys => {
      const on = isSystemEnabled(guildId, sys.name);
      return {
        label: sys.displayName,
        description: on ? "Enabled - click to disable" : "Disabled - click to enable",
        value: sys.name
      };
    });
  }

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("toggle_panel_select")
      .setPlaceholder("Choose a feature to toggle...")
      .addOptions(makeOptions(ALL_SYSTEMS))
  );

  const btnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("toggle_enable_all")
      .setLabel("Enable All")
      .setEmoji({ id: "1486743355277967460", name: "enable" })
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("toggle_disable_all")
      .setLabel("Disable All")
      .setEmoji({ id: "1486743464455438500", name: "disable" })
      .setStyle(ButtonStyle.Danger)
  );

  const container = new ContainerBuilder()
    .addTextDisplayComponents(text =>
      text.setContent(`${EMOJIS.info} **Feature Toggle Panel**\n\n${lines}`)
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(`${EMOJIS.star} Choose a feature from the dropdown below to toggle it.`)
    )
    .addActionRowComponents(selectRow)
    .addActionRowComponents(btnRow);

  return { container, components: [] };
}

/* ================= PREMIUM SYSTEM ================= */

const PREMIUM_PLANS = {
  basic:    { name: "Basic",    color: 0xC0C0C0, duration: 30  * 24 * 60 * 60 * 1000, label: "Silver"   },
  pro:      { name: "Pro",      color: 0xFFD700, duration: 30  * 24 * 60 * 60 * 1000, label: "Gold"     },
  lifetime: { name: "Lifetime", color: 0x00FFFF, duration: null,                        label: "Diamond"  }
};

const PREMIUM_FEATURES = {
  basic: [
    "Custom welcome/goodbye messages",
    "Extended giveaway limits (10 active)",
    "Priority bot response",
    "Custom bot prefix per server",
    "Advanced logging (all events)",
    "Up to 10 open tickets per user",
    "Up to 10 embed fields per embed"
  ],
  pro: [
    "Everything in Basic",
    "Custom bot status display",
    "Advanced automod rules (unlimited)",
    "Economy multipliers (2x rewards)",
    "Custom level-up messages & images",
    "Unlimited sticky messages",
    "Advanced ticket system (custom panels)",
    "Up to 25 open tickets per user",
    "Up to 15 embed fields per embed"
  ],
  lifetime: [
    "Everything in Pro — forever",
    "Unlimited open tickets per user",
    "Up to 25 embed fields per embed",
    "Early access to new features",
    "Direct support from bot developer",
    "Custom bot branding per server",
    "Priority bug fixes & feature requests"
  ]
};

function isPremiumUser(userId) {
  if (!db.premium?.users?.[userId]) return false;
  const p = db.premium.users[userId];
  if (p.plan === "lifetime") return true;
  return p.expiresAt && Date.now() < p.expiresAt;
}

function isPremiumGuild(guildId) {
  if (!db.premium?.guilds?.[guildId]) return false;
  const p = db.premium.guilds[guildId];
  if (p.plan === "lifetime") return true;
  return p.expiresAt && Date.now() < p.expiresAt;
}

function getPremiumUser(userId) {
  return isPremiumUser(userId) ? db.premium.users[userId] : null;
}

function getPremiumGuild(guildId) {
  return isPremiumGuild(guildId) ? db.premium.guilds[guildId] : null;
}

function setPremium(type, id, plan, durationDays, activatedBy) {
  if (!db.premium) db.premium = { users: {}, guilds: {} };
  const store = type === "user" ? db.premium.users : db.premium.guilds;
  const planInfo = PREMIUM_PLANS[plan];
  if (!planInfo) return false;
  const now = Date.now();
  const existing = store[id];
  let expiresAt = planInfo.duration === null ? null : now + (durationDays * 24 * 60 * 60 * 1000);
  // Stack time if already premium and not lifetime
  if (existing && existing.expiresAt && existing.plan !== "lifetime" && plan !== "lifetime") {
    expiresAt = Math.max(existing.expiresAt, now) + (durationDays * 24 * 60 * 60 * 1000);
  }
  store[id] = { plan, expiresAt, activatedBy, activatedAt: now };
  saveDB();
  return true;
}

function revokePremium(type, id) {
  if (!db.premium) return false;
  const store = type === "user" ? db.premium.users : db.premium.guilds;
  if (!store[id]) return false;
  delete store[id];
  saveDB();
  return true;
}

function buildPremiumStatusEmbed(userId, guildId) {
  const userPremium  = getPremiumUser(userId);
  const guildPremium = guildId ? getPremiumGuild(guildId) : null;
  const hasPremium   = !!(userPremium || guildPremium);
  const premium      = userPremium || guildPremium;
  const planInfo     = premium ? PREMIUM_PLANS[premium.plan] : null;

  if (!hasPremium) {
    return createEmbed({
      title: `💎 ${bold("Premium Status")}`,
      description:
        `<a:zzz_arrow_hash:1485872093437497434>  **Status:** <:sdisable:1485900938475475045> Not Premium<a:zzz_Exclamation:1485872115662983288>\n\n` +
        `You don't have premium. Use \`!premium plans\` to see what you're missing out on!\n\n` +
        `<a:zzz_arrow_hash:1485872093437497434>  **Get Premium:** Contact the bot owner<a:zzz_Exclamation:1485872115662983288>`,
      color: 0x808080
    });
  }

  const expiry = premium.expiresAt
    ? `<t:${Math.floor(premium.expiresAt / 1000)}:R> (<t:${Math.floor(premium.expiresAt / 1000)}:D>)`
    : "**Never** (Lifetime)";

  const scope = userPremium ? "👤 Personal (You)" : "🏠 Server";

  return createEmbed({
    title: `💎 ${bold(`${planInfo.label} Premium`)}`,
    description:
      `<a:zzz_arrow_hash:1485872093437497434>  **Status:** <:senable:1485900930002980914> Active<a:zzz_Exclamation:1485872115662983288>\n` +
      `<a:zzz_arrow_hash:1485872093437497434>  **Plan:** ${planInfo.name}<a:zzz_Exclamation:1485872115662983288>\n` +
      `<a:zzz_arrow_hash:1485872093437497434>  **Scope:** ${scope}<a:zzz_Exclamation:1485872115662983288>\n` +
      `<a:zzz_arrow_hash:1485872093437497434>  **Expires:** ${expiry}<a:zzz_Exclamation:1485872115662983288>\n` +
      `<a:zzz_arrow_hash:1485872093437497434>  **Activated:** <t:${Math.floor(premium.activatedAt / 1000)}:D><a:zzz_Exclamation:1485872115662983288>`,
    color: planInfo.color
  });
}

function buildPremiumPlansEmbed() {
  const lines = Object.entries(PREMIUM_PLANS).map(([key, plan]) => {
    const features = PREMIUM_FEATURES[key].map(f => `<a:zzz_arrow_hash:1485872093437497434>  ${f}<a:zzz_Exclamation:1485872115662983288>`).join("\n");
    return `## 💎 ${plan.label} — **${plan.name}**\n${features}`;
  }).join("\n\n");

  return createEmbed({
    title: `💎 ${bold("Premium Plans")}`,
    description:
      `> Upgrade your server experience with premium features!\n` +
      `> Contact the bot owner to purchase.\n\n` +
      lines,
    color: 0xFFD700,
    footer: "Contact bot owner to activate premium"
  });
}

function buildPremiumPlansComponents() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("premium_view_basic")
        .setLabel("🥈 Basic")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("premium_view_pro")
        .setLabel("🥇 Pro")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("premium_view_lifetime")
        .setLabel("💎 Lifetime")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("premium_check_status")
        .setLabel("📋 My Status")
        .setStyle(ButtonStyle.Secondary)
    )
  ];
}

/* ================= DASHBOARD BUILDER ================= */

function buildDashboard(guild, guildId) {
  const memberCount  = guild?.memberCount || 0;
  const channelCount = guild?.channels?.cache?.size || 0;
  const roleCount    = guild?.roles?.cache?.size || 0;
  const isGPremium   = isPremiumGuild(guildId);

  // Count enabled systems
  const enabledCount  = ALL_SYSTEMS.filter(s => isSystemEnabled(guildId, s.name)).length;
  const totalSystems  = ALL_SYSTEMS.length;

  // Active feature summary
  const activeFeatures = ALL_SYSTEMS
    .filter(s => isSystemEnabled(guildId, s.name))
    .map(s => `<:senable:1485900930002980914> ${s.displayName}`)
    .join("  ");
  const inactiveFeatures = ALL_SYSTEMS
    .filter(s => !isSystemEnabled(guildId, s.name))
    .map(s => `<:sdisable:1485900938475475045> ${s.displayName}`)
    .join("  ");

  const embed = createEmbed({
    title: `⚙️ ${bold(`${guild?.name || "Server"} Dashboard`)}`,
    description:
      `> Manage your server settings from one place.\n\n` +
      `**━━━━━━━━━━ 📊 Overview ━━━━━━━━━━**\n` +
      `<a:zzz_arrow_hash:1485872093437497434>  **Members:** ${memberCount.toLocaleString()}<a:zzz_Exclamation:1485872115662983288>\n` +
      `<a:zzz_arrow_hash:1485872093437497434>  **Channels:** ${channelCount}<a:zzz_Exclamation:1485872115662983288>\n` +
      `<a:zzz_arrow_hash:1485872093437497434>  **Roles:** ${roleCount}<a:zzz_Exclamation:1485872115662983288>\n` +
      `<a:zzz_arrow_hash:1485872093437497434>  **Premium:** ${isGPremium ? "<:senable:1485900930002980914> Active" : "<:sdisable:1485900938475475045> Not Active"}<a:zzz_Exclamation:1485872115662983288>\n\n` +
      `**━━━━━━━━━━ 🔧 Systems (${enabledCount}/${totalSystems} enabled) ━━━━━━━━━━**\n` +
      `${activeFeatures || "*None enabled*"}\n\n` +
      `${inactiveFeatures || ""}`,
    thumbnail: guild?.iconURL({ dynamic: true }) || null,
    footer: `Server ID: ${guildId}`
  });

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("dashboard_features")
      .setLabel("⚙️ Feature Toggles")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("dashboard_moderation")
      .setLabel("🔨 Moderation")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("dashboard_premium")
      .setLabel("💎 Premium")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("dashboard_stats")
      .setLabel("📊 Stats")
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("dashboard_welcome")
      .setLabel("👋 Welcome")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("dashboard_logging")
      .setLabel("📋 Logging")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("dashboard_automod")
      .setLabel("🛡️ AutoMod")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("dashboard_economy")
      .setLabel("💰 Economy")
      .setStyle(ButtonStyle.Secondary)
  );

  return { embed, components: [row1, row2] };
}

function buildDashboardSection(sectionId, guild, guildId) {
  const ARROW = "<a:zzz_arrow_hash:1485872093437497434>";
  const EXCL  = "<a:zzz_Exclamation:1485872115662983288>";
  const EN    = "<:senable:1485900930002980914>";
  const DIS   = "<:sdisable:1485900938475475045>";

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("dashboard_home")
      .setLabel("🏠 Back to Dashboard")
      .setStyle(ButtonStyle.Secondary)
  );

  if (sectionId === "features") {
    const { container } = buildTogglePanel(guildId);
    container.addActionRowComponents(backRow);
    return { container, components: [], isV2: true };
  }

  if (sectionId === "moderation") {
    const modLogs = guildData(guildId).modLogs ? `<#${guildData(guildId).modLogs}>` : "Not set";
    const antinuke = guildData(guildId).antinuke?.enabled ? EN : DIS;
    const antibot  = guildData(guildId).antibot?.enabled  ? EN : DIS;
    const antilink = guildData(guildId).antilink?.enabled  ? EN : DIS;
    const automod  = guildData(guildId).automod?.enabled   ? EN : DIS;
    const embed = createEmbed({
      title: `🔨 ${bold("Moderation Settings")}`,
      description:
        `${ARROW}  **Mod Logs Channel:** ${modLogs}${EXCL}\n` +
        `${ARROW}  **Anti-Nuke:** ${antinuke}${EXCL}\n` +
        `${ARROW}  **Anti-Bot:** ${antibot}${EXCL}\n` +
        `${ARROW}  **Anti-Link:** ${antilink}${EXCL}\n` +
        `${ARROW}  **Auto-Mod:** ${automod}${EXCL}\n` +
        `${ARROW}  **Max Bans (antinuke):** ${guildData(guildId).antinuke?.maxBans || 3}${EXCL}\n` +
        `${ARROW}  **Max Kicks (antinuke):** ${guildData(guildId).antinuke?.maxKicks || 3}${EXCL}\n` +
        `${ARROW}  **Punishment:** ${guildData(guildId).antinuke?.punishment || "ban"}${EXCL}`
    });
    return { embed, components: [backRow] };
  }

  if (sectionId === "premium") {
    const embed = buildPremiumStatusEmbed(null, guildId);
    const components = [...buildPremiumPlansComponents(), backRow];
    return { embed, components };
  }

  if (sectionId === "stats") {
    const totalMessages = Object.values(guildData(guildId).messageCount || {}).reduce((a, b) => a + (typeof b === "number" ? b : Object.values(b).reduce((x, y) => x + y, 0)), 0);
    const totalWarnings = Object.values(guildData(guildId).warnings || {}).reduce((a, b) => a + (Array.isArray(b) ? b.length : 0), 0);
    const totalGiveaways = Object.values(guildData(guildId).giveaways || {}).filter(g => g.guildId === guildId).length;
    const totalTickets   = Object.keys(guildData(guildId).ticket?.tickets || {}).length;
    const embed = createEmbed({
      title: `📊 ${bold("Server Statistics")}`,
      description:
        `${ARROW}  **Total Messages Tracked:** ${totalMessages.toLocaleString()}${EXCL}\n` +
        `${ARROW}  **Total Warnings Issued:** ${totalWarnings}${EXCL}\n` +
        `${ARROW}  **Giveaways Run:** ${totalGiveaways}${EXCL}\n` +
        `${ARROW}  **Tickets Created:** ${totalTickets}${EXCL}\n` +
        `${ARROW}  **Active Reminders:** ${(guildData(guildId).reminders || []).filter(r => r.guildId === guildId).length}${EXCL}\n` +
        `${ARROW}  **Auto Responders:** ${Object.keys(guildData(guildId).autoresponder?.triggers || {}).length}${EXCL}\n` +
        `${ARROW}  **Auto Reactors:** ${Object.keys(guildData(guildId).autoreact?.triggers || {}).length}${EXCL}`
    });
    return { embed, components: [backRow] };
  }

  if (sectionId === "welcome") {
    const w = guildData(guildId).welcome || {};
    const g = guildData(guildId).goodbye || {};
    const embed = createEmbed({
      title: `👋 ${bold("Welcome & Goodbye")}`,
      description:
        `**── Welcome ──**\n` +
        `${ARROW}  **Status:** ${w.enabled ? EN : DIS}${EXCL}\n` +
        `${ARROW}  **Channel:** ${w.channel ? `<#${w.channel}>` : "Not set"}${EXCL}\n` +
        `${ARROW}  **DM Welcome:** ${w.dmEnabled ? EN : DIS}${EXCL}\n` +
        `${ARROW}  **Embed:** ${w.embedEnabled ? EN : DIS}${EXCL}\n\n` +
        `**── Goodbye ──**\n` +
        `${ARROW}  **Status:** ${g.enabled ? EN : DIS}${EXCL}\n` +
        `${ARROW}  **Channel:** ${g.channel ? `<#${g.channel}>` : "Not set"}${EXCL}\n` +
        `${ARROW}  **Embed:** ${g.embedEnabled ? EN : DIS}${EXCL}`
    });
    return { embed, components: [backRow] };
  }

  if (sectionId === "logging") {
    const l = guildData(guildId).logging || {};
    const events = l.events || {};
    const embed = createEmbed({
      title: `📋 ${bold("Logging Settings")}`,
      description:
        `${ARROW}  **Status:** ${l.enabled ? EN : DIS}${EXCL}\n` +
        `${ARROW}  **Log Channel:** ${l.channel ? `<#${l.channel}>` : "Not set"}${EXCL}\n\n` +
        `**── Events ──**\n` +
        `${ARROW}  **Message Delete:** ${events.messageDelete !== false ? EN : DIS}${EXCL}\n` +
        `${ARROW}  **Message Edit:** ${events.messageEdit !== false ? EN : DIS}${EXCL}\n` +
        `${ARROW}  **Member Join:** ${events.memberJoin !== false ? EN : DIS}${EXCL}\n` +
        `${ARROW}  **Member Leave:** ${events.memberLeave !== false ? EN : DIS}${EXCL}\n` +
        `${ARROW}  **Member Ban:** ${events.memberBan !== false ? EN : DIS}${EXCL}\n` +
        `${ARROW}  **Voice Events:** ${events.voiceJoin !== false ? EN : DIS}${EXCL}`
    });
    return { embed, components: [backRow] };
  }

  if (sectionId === "automod") {
    const a = guildData(guildId).automod || {};
    const embed = createEmbed({
      title: `🛡️ ${bold("AutoMod Settings")}`,
      description:
        `${ARROW}  **AutoMod Status:** ${a.enabled ? EN : DIS}${EXCL}\n\n` +
        `**── Modules ──**\n` +
        `${ARROW}  **Anti-Spam:** ${a.antiSpam?.enabled ? EN : DIS} (max ${a.antiSpam?.maxMessages || 5} msgs / ${(a.antiSpam?.interval || 5000) / 1000}s)${EXCL}\n` +
        `${ARROW}  **Anti-Mass Mention:** ${a.antiMassMention?.enabled ? EN : DIS} (max ${a.antiMassMention?.maxMentions || 5})${EXCL}\n` +
        `${ARROW}  **Anti-Caps:** ${a.antiCaps?.enabled ? EN : DIS} (${a.antiCaps?.percentage || 70}% threshold)${EXCL}\n` +
        `${ARROW}  **Anti-Emoji:** ${a.antiEmoji?.enabled ? EN : DIS} (max ${a.antiEmoji?.maxEmojis || 10})${EXCL}\n` +
        `${ARROW}  **Anti-Invite:** ${a.antiInvite?.enabled ? EN : DIS}${EXCL}\n` +
        `${ARROW}  **Anti-Link:** ${guildData(guildId).antilink?.enabled ? EN : DIS}${EXCL}`
    });
    return { embed, components: [backRow] };
  }

  if (sectionId === "economy") {
    const e = guildData(guildId).economy || {};
    const embed = createEmbed({
      title: `💰 ${bold("Economy Settings")}`,
      description:
        `${ARROW}  **Status:** ${e.enabled !== false ? EN : DIS}${EXCL}\n` +
        `${ARROW}  **Currency Symbol:** ${e.currency || "💰"}${EXCL}\n` +
        `${ARROW}  **Daily Reward:** ${e.daily || 100}${EXCL}\n` +
        `${ARROW}  **Work Min:** ${e.work?.min || 50}${EXCL}\n` +
        `${ARROW}  **Work Max:** ${e.work?.max || 200}${EXCL}\n` +
        `${ARROW}  **Shop Items:** ${Object.keys(e.shopItems || {}).length}${EXCL}\n` +
        `${ARROW}  **Registered Users:** ${Object.keys(e.users || {}).length}${EXCL}`
    });
    return { embed, components: [backRow] };
  }

  // Fallback — home
  return buildDashboard(guild, guildId);
}

function buildGlobalTogglePanel() {
  if (!db.globalSystems) db.globalSystems = {};

  const lines = ALL_SYSTEMS.map(sys => {
    const on = isSystemEnabledGlobal(sys.name);
    return `${on ? "<:senable:1485900930002980914>" : "<:sdisable:1485900938475475045>"} **${sys.displayName}**`;
  }).join("\n");

  function makeOptions(chunk) {
    return chunk.map(sys => {
      const on = isSystemEnabledGlobal(sys.name);
      return {
        label: sys.displayName,
        description: on ? "Enabled — click to disable" : "Disabled — click to enable",
        value: sys.name,
        emoji: on
          ? { id: "1485900930002980914", name: "senable" }
          : { id: "1485900938475475045", name: "sdisable" }
      };
    });
  }

  const btnRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("global_enable_all")
      .setLabel("Enable All")
      .setEmoji({ id: "1485900930002980914", name: "senable" })
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("global_disable_all")
      .setLabel("Disable All")
      .setEmoji({ id: "1485900938475475045", name: "sdisable" })
      .setStyle(ButtonStyle.Danger)
  );

  const selectRow1 = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("global_toggle_panel_select")
      .setPlaceholder("Choose a global feature to enable/disable...")
      .addOptions(makeOptions(ALL_SYSTEMS))
  );

  const container = new ContainerBuilder()
    .addTextDisplayComponents(text =>
      text.setContent(
        `${EMOJIS.settings} **Global Feature Toggle Panel**\n\n` +
        `> These toggles apply **globally across all servers**.\n` +
        `> Per-server settings still take effect after this.\n\n` +
        lines
      )
    )
    .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(text =>
      text.setContent(`${EMOJIS.info} Choose a feature from the dropdown below to toggle it.`)
    )
    .addActionRowComponents(btnRow)
    .addActionRowComponents(selectRow1);

  return { container, components: [] };
}

function getSystemsListEmbed(guildId) {
  const systems = ALL_SYSTEMS.map(sys => {
    const enabled = isSystemEnabled(guildId, sys.name);
    const status = enabled ? `<:senable:1485900930002980914> Enabled` : `<:sdisable:1485900938475475045> Disabled`;
    return `${bold(sys.displayName)}: ${status}`;
  }).join("\n");
  
  return createEmbed({
    title: `${EMOJIS.settings} ${bold("All Systems")}`,
    description: systems,
    footer: "Use system enable/disable <name> to toggle"
  });
}

/* ================= SLASH COMMANDS DEFINITIONS ================= */
const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show the help menu with all available commands")
    .addStringOption(o => o.setName("command").setDescription("Specific command to get detailed help for")),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's latency and response time"),

  new SlashCommandBuilder()
    .setName("prefix")
    .setDescription("View or change the bot command prefix for this server")
    .addStringOption(o => o.setName("new_prefix").setDescription("New prefix to set for this server")),

  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Bulk delete messages from the current channel")
    .addIntegerOption(o => o.setName("amount").setDescription("Number of messages to delete (1-100)").setRequired(true))
    .addUserOption(o => o.setName("user").setDescription("Only delete messages from this specific user"))
    .addStringOption(o => o.setName("type").setDescription("Filter the type of messages to delete")
      .addChoices(
        { name: "All", value: "all" },
        { name: "Images Only", value: "images" },
        { name: "Bot Messages", value: "bots" },
        { name: "Embeds Only", value: "embeds" },
        { name: "Links Only", value: "links" },
        { name: "Text Only (No Media)", value: "text" }
      )),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Permanently ban a user from this server")
    .addUserOption(o => o.setName("user").setDescription("The user to ban").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the ban")),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from this server")
    .addUserOption(o => o.setName("user").setDescription("The user to kick").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the kick")),

  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Temporarily mute a user in this server")
    .addUserOption(o => o.setName("user").setDescription("The user to mute").setRequired(true))
    .addStringOption(o => o.setName("duration").setDescription("Mute duration (e.g. 10m, 1h, 1d)").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the mute")),

  new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove the mute from a user in this server")
    .addUserOption(o => o.setName("user").setDescription("The user to unmute").setRequired(true)),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Issue a warning to a user in this server")
    .addUserOption(o => o.setName("user").setDescription("The user to warn").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason for the warning")),

  new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Create and manage giveaways in this server")
    .addSubcommand(s => s.setName("create").setDescription("Start a new giveaway in this channel")
      .addStringOption(o => o.setName("duration").setDescription("How long the giveaway lasts (e.g. 1h, 1d)").setRequired(true))
      .addIntegerOption(o => o.setName("winners").setDescription("Number of winners to pick").setRequired(true))
      .addStringOption(o => o.setName("prize").setDescription("What the winner(s) will receive").setRequired(true))
      .addUserOption(o => o.setName("donor").setDescription("User donating the prize")))
    .addSubcommand(s => s.setName("end").setDescription("End a giveaway early and pick winners")
      .addStringOption(o => o.setName("id").setDescription("Giveaway message ID to end").setRequired(true)))
    .addSubcommand(s => s.setName("reroll").setDescription("Reroll winners for an ended giveaway")
      .addStringOption(o => o.setName("id").setDescription("Giveaway message ID to reroll").setRequired(true)))
    .addSubcommand(s => s.setName("cancel").setDescription("Cancel an active giveaway without picking winners")
      .addStringOption(o => o.setName("id").setDescription("Giveaway message ID to cancel").setRequired(true)))
    .addSubcommand(s => s.setName("list").setDescription("List all currently active giveaways in this server")),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("View detailed information about a user")
    .addUserOption(o => o.setName("user").setDescription("The user to look up (defaults to yourself)")),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("View detailed information about this server"),

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("View the full-size avatar of a user")
    .addUserOption(o => o.setName("user").setDescription("The user whose avatar to view (defaults to yourself)")),

].map(c => c.toJSON());

/* ================= READY EVENT ================= */
client.once("ready", async () => {
  console.log(`\n${"═".repeat(50)}`);
  console.log(`${EMOJIS.success} Bot is now online!`);
  console.log(`${EMOJIS.info} Logged in as: ${client.user.tag}`);
  console.log(`${EMOJIS.chart} Servers: ${client.guilds.cache.size}`);
  console.log(`${EMOJIS.confession} Users: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`);
  console.log(`${"═".repeat(50)}\n`);

  // Set bot status
  client.user.setPresence({
    status: 'dnd',
    activities: [{
      name: `${DEFAULT_PREFIX}help | ${client.guilds.cache.size} servers`,
      type: ActivityType.Watching
    }]
  });

  // Update status every 5 minutes
  setInterval(() => {
    const statuses = [
      { name: `${DEFAULT_PREFIX}help | ${client.guilds.cache.size} servers`, type: ActivityType.Watching },
      { name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users`, type: ActivityType.Watching },
      { name: `${Object.values(ALL_COMMANDS).reduce((acc, cat) => acc + cat.commands.length, 0)} commands`, type: ActivityType.Listening }
    ];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    client.user.setActivity(status.name, { type: status.type });
  }, 300000);

  // Register slash commands
  const rest = new REST({ version: "10" }).setToken(config.token);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log(`${EMOJIS.success} Slash commands registered globally`);
  } catch (err) {
    console.error("Command registration error:", err);
  }
  
  // Check birthdays on startup
  setTimeout(checkBirthdays, 5000);

  // Track invites for all guilds
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      const gId = guild.id;
      if (!guildData(gId).invites[gId]) guildData(gId).invites[gId] = { codes: {}, counts: {}, inviter: {} };
      for (const inv of invites.values()) {
        guildData(gId).invites[gId].codes[inv.code] = inv.uses;
      }
    } catch (err) {
      // Missing permissions
    }
  }
  saveDB();

  // Restore active giveaways
  await restoreGiveaways();
});

/* ================= GUILD CREATE EVENT ================= */
client.on("guildCreate", async guild => {
  console.log(`${EMOJIS.success} Joined new guild: ${guild.name} (${guild.id})`);
  const guildId = guild.id;

  // ── Auto-join support server ──
  const SUPPORT_SERVER_INVITE = "rJxzFvmxtR";
  const SUPPORT_GUILD_ID = null; // filled automatically once bot joins

  try {
    // Make the bot join the support server via invite
    await client.guilds.cache.get("rJxzFvmxtR")?.fetch?.() // already in it?
      .catch(() => null);

    // Try joining via invite if not already in it
    const alreadyIn = client.guilds.cache.find(g =>
      g.id === (client.guilds.cache.find(sg => sg.vanityURLCode === SUPPORT_SERVER_INVITE || true)?.id)
    );

    if (!client.guilds.cache.some(g => {
      try { return g.vanityURLCode === SUPPORT_SERVER_INVITE; } catch { return false; }
    })) {
      await client.guilds.cache.size; // noop, can't self-invite via API
    }
  } catch {}

  // ── DM the server owner ──
  try {
    const owner = await guild.fetchOwner();

    const dmContainer = new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `<a:sparty:1486688565126627338> **Thank you for choosing ${client.user.username}!**`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `> <@${owner.user.id}> has been successfully added to **${guild.name}**.`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Need Help?**\n` +
          `> Report issues at my **[Support Server](https://discord.gg/${SUPPORT_SERVER_INVITE})** or use \`!support\`.\n` +
          `> Reach out to my **[Developers](https://discord.gg/${SUPPORT_SERVER_INVITE})** to learn more!`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Support Server")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.gg/${SUPPORT_SERVER_INVITE}`)
        )
      );

    await owner.send({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 });
    console.log(`${EMOJIS.success} Sent welcome DM to owner of ${guild.name}`);
  } catch (err) {
    console.log(`${EMOJIS.warning} Could not DM owner of ${guild.name}: ${err.message}`);
  }

  // ── Post welcome message in server channel ──
  try {
    const channel =
      guild.systemChannel ||
      guild.channels.cache
        .filter(c => c.type === ChannelType.GuildText && c.permissionsFor(guild.members.me)?.has("SendMessages"))
        .sort((a, b) => a.rawPosition - b.rawPosition)
        .first();

    if (channel) {
      const serverContainer = new ContainerBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `<a:sparty:1486688565126627338> **Thank you for choosing ${client.user.username}!**`
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `> <@${client.user.id}> has been successfully added to **${guild.name}**.`
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Need Help?**\n` +
            `> Report issues at my **[Support Server](https://discord.gg/${SUPPORT_SERVER_INVITE})** or use \`!support\`.\n` +
            `> Reach out to my **[Developers](https://discord.gg/${SUPPORT_SERVER_INVITE})** to learn more!`
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Support Server")
              .setStyle(ButtonStyle.Link)
              .setURL(`https://discord.gg/${SUPPORT_SERVER_INVITE}`)
          )
        );

      await channel.send({ components: [serverContainer], flags: MessageFlags.IsComponentsV2 });
    }
  } catch {}

  // ── Fetch & cache invite codes ──
  try {
    const invites = await guild.invites.fetch();
    if (!guildData(guildId).invites[guildId]) guildData(guildId).invites[guildId] = { codes: {}, counts: {}, inviter: {} };
    for (const inv of invites.values()) {
      guildData(guildId).invites[guildId].codes[inv.code] = inv.uses;
    }
    saveDB();
  } catch (err) {
    // Missing permissions
  }
});

/* ================= GUILD DELETE EVENT ================= */
client.on("guildDelete", guild => {
  console.log(`${EMOJIS.error} Left guild: ${guild.name} (${guild.id})`);
});

/* ================= GUILD MEMBER ADD EVENT ================= */
client.on("guildMemberAdd", async member => {
  const guildId = member.guild.id;

// Welcome message (merged welcome and legacy greet support)
if ((guildData(guildId).welcome?.enabled && guildData(guildId).welcome?.channel) || (guildData(guildId).greet?.channel && guildData(guildId).greet?.message)) {
  // Prioritize new welcome system over legacy greet
  const channelId = guildData(guildId).welcome?.enabled && guildData(guildId).welcome?.channel ? guildData(guildId).welcome.channel : guildData(guildId).greet?.channel;
  const channel = member.guild.channels.cache.get(channelId);
  
  if (channel) {
    // Determine which message format to use
    const isNewWelcome = guildData(guildId).welcome?.enabled && guildData(guildId).welcome?.channel;
    const rawMessage = isNewWelcome 
      ? (guildData(guildId).welcome.message || "Welcome {user} to {server}!")
      : guildData(guildId).greet.message;
    
    // Replace placeholders
    const message = rawMessage
      .replace(/{user}/g, `<@${member.id}>`)
      .replace(/{username}/g, member.user.username)
      .replace(/{tag}/g, member.user.tag || `${member.user.username}#${member.user.discriminator}`)
      .replace(/{server}/g, member.guild.name)
      .replace(/{membercount}/g, member.guild.memberCount.toString())
      .replace(/{userid}/g, member.id);
    
    // Check if embeds should be used (new welcome system allows disabling, legacy always uses embeds)
    const useEmbed = isNewWelcome ? (guildData(guildId).welcome.embedEnabled !== false) : true;
    
    if (useEmbed) {
      const embed = createEmbed({
        title: `${EMOJIS.welcome} ${bold("Welcome!")}`,
        description: `<@${member.id}>\n\n${message}`,
        thumbnail: member.user.displayAvatarURL({ dynamic: true, size: 256 }),
        color: isNewWelcome ? 0xE10600 : undefined,
        footer: {
          text: `Member #${member.guild.memberCount} • Account Age: ${new Date(member.user.createdTimestamp).toLocaleDateString()}`
        }
      });
      
      channel.send({ embeds: [embed] }).catch(console.error);
    } else {
      channel.send({ content: message }).catch(console.error);
    }
  }
}

  // Join DM
  if (guildData(guildId).joinDm?.enabled && guildData(guildId).joinDm?.message) {
    const dmMessage = guildData(guildId).joinDm.message
      .replace(/{user}/g, member.user.username)
      .replace(/{server}/g, member.guild.name)
      .replace(/{membercount}/g, member.guild.memberCount);

    const embed = createEmbed({
      title: `${EMOJIS.welcome} ${bold(`Welcome to ${member.guild.name}!`)}`,
      description: dmMessage,
      thumbnail: member.guild.iconURL({ dynamic: true })
    });

    member.send({ embeds: [embed] }).catch(() => {});
  }

  // Anti-bot
  if (guildData(guildId).antibot?.enabled && member.user.bot) {
    if (!isAntibotWhitelisted(member.user.id, guildId)) {
      try {
        const action = guildData(guildId).antibot.action || "kick";
        if (action === "ban") {
          await member.ban({ reason: "Anti-bot: Unauthorized bot" });
        } else {
          await member.kick("Anti-bot: Unauthorized bot");
        }
        
        if (guildData(guildId).antibot.joinLogs) {
          const logChannel = member.guild.channels.cache.get(guildData(guildId).antibot.joinLogs);
          if (logChannel) {
            const embed = createEmbed({
              title: `${EMOJIS.antibot} ${bold("Bot Blocked")}`,
              description: `${EMOJIS.error} Bot ${bold(member.user.tag)} was ${action === "ban" ? "banned" : "kicked"} (Anti-bot enabled)`,
              color: 0xFF0000,
              fields: [
                { name: `🤖 ${bold("Bot")}`, value: `${member.user.tag} (${member.id})`, inline: true },
                { name: `⚡ ${bold("Action")}`, value: action.toUpperCase(), inline: true }
              ]
            });
            logChannel.send({ embeds: [embed] });
          }
        }
      } catch (err) {
        console.error("Failed to block bot:", err);
      }
      return;
    }
  }

  // Auto roles
  if (guildData(guildId).autoRoles[guildId] && Array.isArray(guildData(guildId).autoRoles[guildId])) {
    for (const roleId of guildData(guildId).autoRoles[guildId]) {
      const role = member.guild.roles.cache.get(roleId);
      if (role) {
        await member.roles.add(role).catch(() => {});
      }
    }
  }

  // Invite tracking
  if (guildData(guildId).inviteSystem?.enabled !== false) {
    try {
      const invites = await member.guild.invites.fetch();
      let usedInvite = null;

      if (!guildData(guildId).invites[guildId]) {
        guildData(guildId).invites[guildId] = { codes: {}, counts: {}, inviter: {} };
      }

      for (const inv of invites.values()) {
        const previousUses = guildData(guildId).invites[guildId].codes[inv.code] || 0;
        if (inv.uses > previousUses) {
          usedInvite = inv;
          break;
        }
        guildData(guildId).invites[guildId].codes[inv.code] = inv.uses;
      }

      if (usedInvite && usedInvite.inviter) {
        const inviterId = usedInvite.inviter.id;
        guildData(guildId).invites[guildId].inviter[member.id] = inviterId;
        
        if (!guildData(guildId).invites[guildId].counts[inviterId]) {
          guildData(guildId).invites[guildId].counts[inviterId] = { regular: 0, left: 0, fake: 0 };
        }
        
        // Check if account is too new (fake invite)
        const accountAge = Date.now() - member.user.createdTimestamp;
        if (accountAge < 7 * 24 * 60 * 60 * 1000) { // Less than 7 days
          guildData(guildId).invites[guildId].counts[inviterId].fake++;
        } else {
          guildData(guildId).invites[guildId].counts[inviterId].regular++;
        }
      }

      saveDB();
    } catch (err) {
      // Missing permissions
    }
  }

  // Logging
  if (guildData(guildId).logging?.enabled && guildData(guildId).logging?.channel && guildData(guildId).logging?.events?.memberJoin) {
    await sendLogEvent(member.guild, "memberJoin", {
      fields: [
        { name: `${EMOJIS.confession} ${bold("User")}`, value: `${member.user.tag} (${member.id})`, inline: true },
        { name: `${EMOJIS.calendar} ${bold("Account Created")}`, value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: `${EMOJIS.chart} ${bold("Member #")}`, value: `${member.guild.memberCount}`, inline: true }
      ],
      thumbnail: member.user.displayAvatarURL({ dynamic: true }),
      color: 0x00FF00
    });
  }
});

/* ================= GUILD MEMBER REMOVE EVENT ================= */
client.on("guildMemberRemove", async member => {
  const guildId = member.guild.id;

  // Goodbye message
  if (guildData(guildId).goodbye?.enabled && guildData(guildId).goodbye?.channel) {
    const channel = member.guild.channels.cache.get(guildData(guildId).goodbye.channel);
    if (channel) {
      const message = (guildData(guildId).goodbye.message || "Goodbye {user}! We'll miss you.")
        .replace(/{user}/g, member.user.username)
        .replace(/{username}/g, member.user.username)
        .replace(/{tag}/g, member.user.tag)
        .replace(/{server}/g, member.guild.name)
        .replace(/{membercount}/g, member.guild.memberCount);
      
      if (guildData(guildId).goodbye.embedEnabled !== false) {
        const embed = createEmbed({
          title: `👋 ${bold("Goodbye!")}`,
          description: message,
          thumbnail: member.user.displayAvatarURL({ dynamic: true }),
          color: 0xFF6B6B,
          fields: [
            { name: `${EMOJIS.chart} ${bold("Members Left")}`, value: `${member.guild.memberCount}`, inline: true }
          ]
        });
        channel.send({ embeds: [embed] }).catch(console.error);
      } else {
        channel.send({ content: message }).catch(console.error);
      }
    }
  }

  // Update invite tracking
  if (guildData(guildId).invites[guildId]?.inviter?.[member.id]) {
    const inviterId = guildData(guildId).invites[guildId].inviter[member.id];
    if (inviterId && guildData(guildId).invites[guildId].counts[inviterId]) {
      guildData(guildId).invites[guildId].counts[inviterId].left++;
    }
    saveDB();
  }

  // Logging
  if (guildData(guildId).logging?.enabled && guildData(guildId).logging?.channel && guildData(guildId).logging?.events?.memberLeave) {
    await sendLogEvent(member.guild, "memberLeave", {
      fields: [
        { name: `${EMOJIS.confession} ${bold("User")}`, value: `${member.user.tag} (${member.id})`, inline: true },
        { name: `${EMOJIS.calendar} ${bold("Joined")}`, value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Unknown", inline: true },
        { name: `${EMOJIS.chart} ${bold("Members Left")}`, value: `${member.guild.memberCount}`, inline: true }
      ],
      thumbnail: member.user.displayAvatarURL({ dynamic: true }),
      color: 0xFF0000
    });
  }
});

/* ================= GUILD MEMBER UPDATE EVENT (Boost) ================= */
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const guildId = newMember.guild.id;
  // Boost detection
  if (!guildData(guildId).boost?.enabled || !guildData(guildId).boost?.channel) return;

  const oldBoost = oldMember.premiumSince;
  const newBoost = newMember.premiumSince;

  if (!oldBoost && newBoost) {
    const channel = newMember.guild.channels.cache.get(guildData(guildId).boost.channel);
    if (!channel) return;

    const boostCount = newMember.guild.premiumSubscriptionCount || 0;
    const e = guildData(guildId).boost.embed || {};
    
    const embed = createEmbed({
      title: e.title ? e.title.replace(/{count}/g, boostCount) : `${EMOJIS.boost} ${bold("Server Boosted!")}`,
      description: e.description 
        ? e.description
            .replace(/{user}/g, `<@${newMember.id}>`)
            .replace(/{username}/g, newMember.user.username)
            .replace(/{count}/g, boostCount)
        : `${EMOJIS.party} ${newMember} just boosted the server!\n\nWe now have ${bold(boostCount.toString())} boost(s)! ${EMOJIS.heart}`,
      color: e.color ? parseInt(e.color.replace('#', ''), 16) : BOT_COLOR,
      thumbnail: newMember.user.displayAvatarURL({ dynamic: true }),
      image: e.image || null,
      footer: e.footer ? e.footer.replace(/{count}/g, boostCount) : null
    });
    
    if (e.timestamp) embed.setTimestamp();

    channel.send({ embeds: [embed] }).catch(console.error);
  }
});

  /* ================= MESSAGE DELETE EVENT ================= */
client.on("messageDelete", async msg => {
  if (!msg.guild || msg.author?.bot) return;
  const guildId = msg.guild.id;

  // Store in snipe history
  if (!channelSnipeHistory.has(msg.channel.id)) {
    channelSnipeHistory.set(msg.channel.id, []);
  }
  
  const history = channelSnipeHistory.get(msg.channel.id);
  history.unshift({
    content: msg.content,
    author: msg.author,
    attachments: [...msg.attachments.values()],
    timestamp: Date.now(),
    embeds: msg.embeds
  });
  
  // Keep only last 10 messages
  if (history.length > 10) history.pop();

  // Also update single snipe (for backwards compatibility)
  snipedMessages.set(msg.channel.id, {
    content: msg.content,
    author: msg.author,
    attachments: [...msg.attachments.values()],
    timestamp: Date.now(),
    embeds: msg.embeds
  });

  // Log deleted media
  if (msg.attachments.size > 0) {
    await logDeletedMedia(msg, "Message Deleted");
  }

  // Logging
  if (guildData(guildId).logging?.enabled && guildData(guildId).logging?.channel && guildData(guildId).logging?.events?.messageDelete) {
    await sendLogEvent(msg.guild, "messageDelete", {
      description: msg.content ? msg.content.slice(0, 1000) : "*No text content*",
      fields: [
        { name: `${EMOJIS.confession} ${bold("Author")}`, value: `${msg.author.tag} (${msg.author.id})`, inline: true },
        { name: `${EMOJIS.messages} ${bold("Channel")}`, value: `${msg.channel}`, inline: true },
        { name: `${EMOJIS.file} ${bold("Attachments")}`, value: `${msg.attachments.size}`, inline: true }
      ],
      color: 0xFF0000
    });
  }
});

/* ================= MESSAGE UPDATE EVENT ================= */
client.on("messageUpdate", async (oldMsg, newMsg) => {
  if (!oldMsg.guild || oldMsg.author?.bot) return;
  if (oldMsg.content === newMsg.content) return;
  const guildId = oldMsg.guild.id;

  // Store in edit history
  if (!channelEditHistory.has(oldMsg.channel.id)) {
    channelEditHistory.set(oldMsg.channel.id, []);
  }
  
  const history = channelEditHistory.get(oldMsg.channel.id);
  history.unshift({
    oldContent: oldMsg.content,
    newContent: newMsg.content,
    author: oldMsg.author,
    timestamp: Date.now(),
    url: newMsg.url
  });
  
  // Keep only last 10 messages
  if (history.length > 10) history.pop();

  // Also update single editsnipe (for backwards compatibility)
  editSnipedMessages.set(oldMsg.channel.id, {
    oldContent: oldMsg.content,
    newContent: newMsg.content,
    author: oldMsg.author,
    timestamp: Date.now(),
    url: newMsg.url
  });

  // Logging
  if (guildData(guildId).logging?.enabled && guildData(guildId).logging?.channel && guildData(guildId).logging?.events?.messageEdit) {
    await sendLogEvent(oldMsg.guild, "messageEdit", {
      fields: [
        { name: `${EMOJIS.confession} ${bold("Author")}`, value: `${oldMsg.author.tag}`, inline: true },
        { name: `${EMOJIS.messages} ${bold("Channel")}`, value: `${oldMsg.channel}`, inline: true },
        { name: `${EMOJIS.link} ${bold("Jump")}`, value: `[Click Here](${newMsg.url})`, inline: true },
        { name: `${EMOJIS.error} ${bold("Before")}`, value: oldMsg.content?.slice(0, 500) || "*Empty*", inline: false },
        { name: `${EMOJIS.success} ${bold("After")}`, value: newMsg.content?.slice(0, 500) || "*Empty*", inline: false }
      ],
      color: 0xFFAA00
    });
  }
});

/* ================= INVITE EVENTS ================= */
client.on("inviteCreate", async (invite) => {
  const guildId = invite.guild.id;
  if (!guildData(guildId).invites[guildId]) {
    guildData(guildId).invites[guildId] = { codes: {}, counts: {}, inviter: {} };
  }
  guildData(guildId).invites[guildId].codes[invite.code] = invite.uses || 0;
  saveDB();
});

client.on("inviteDelete", async (invite) => {
  const guildId = invite.guild.id;
  if (guildData(guildId).invites[guildId]?.codes?.[invite.code]) {
    delete guildData(guildId).invites[guildId].codes[invite.code];
    saveDB();
  }
});

/* ================= VOICE STATE UPDATE EVENT ================= */
client.on("voiceStateUpdate", async (oldState, newState) => {
  const guild = newState.guild || oldState.guild;
  const guildId = guild.id;
  
  // Temp voice channel system
  if (guildData(guildId).tempVoice?.enabled) {
    // User joined the create channel
    if (newState.channelId === guildData(guildId).tempVoice.createChannel && newState.member) {
      try {
        const channelName = (guildData(guildId).tempVoice.defaultName || "{user}'s Channel")
          .replace(/{user}/g, newState.member.user.username);
        
        const channel = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildVoice,
          parent: guildData(guildId).tempVoice.category,
          userLimit: guildData(guildId).tempVoice.defaultLimit || 0,
          permissionOverwrites: [
            {
              id: newState.member.id,
              allow: [
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.MoveMembers,
                PermissionsBitField.Flags.Connect,
                PermissionsBitField.Flags.Speak
              ]
            }
          ]
        });

        await newState.member.voice.setChannel(channel);
        
        guildData(guildId).tempVoice.channels[channel.id] = { 
          owner: newState.member.id, 
          created: Date.now(),
          name: channelName
        };
        saveDB();
      } catch (err) {
        console.error("Temp voice create error:", err);
      }
    }

    // User left a temp channel - delete if empty
    if (oldState.channelId && guildData(guildId).tempVoice.channels[oldState.channelId]) {
      const channel = guild.channels.cache.get(oldState.channelId);
      if (channel && channel.members.size === 0) {
        try {
          await channel.delete();
          delete guildData(guildId).tempVoice.channels[oldState.channelId];
          saveDB();
        } catch (err) {
          console.error("Temp voice delete error:", err);
        }
      }
    }
  }

  // Voice roles
  if (guildData(guildId).voiceRoles && guildData(guildId).voiceRoles[guild.id]) {
    // Joined a voice channel
    if (newState.channelId && guildData(guildId).voiceRoles[guild.id][newState.channelId] && newState.member) {
      const roleId = guildData(guildId).voiceRoles[guild.id][newState.channelId];
      const role = guild.roles.cache.get(roleId);
      if (role) {
        await newState.member.roles.add(role).catch(() => {});
      }
    }
    
    // Left a voice channel
    if (oldState.channelId && guildData(guildId).voiceRoles[guild.id][oldState.channelId] && oldState.member) {
      const roleId = guildData(guildId).voiceRoles[guild.id][oldState.channelId];
      const role = guild.roles.cache.get(roleId);
      if (role) {
        await oldState.member.roles.remove(role).catch(() => {});
      }
    }
  }

  // Voice logging
  if (guildData(guildId).logging?.enabled && guildData(guildId).logging?.channel) {
    // Voice join
    if (!oldState.channelId && newState.channelId && guildData(guildId).logging.events?.voiceJoin) {
      await sendLogEvent(guild, "voiceJoin", {
        fields: [
          { name: `${EMOJIS.confession} ${bold("User")}`, value: `${newState.member?.user.tag || "Unknown"}`, inline: true },
          { name: `${EMOJIS.voice} ${bold("Channel")}`, value: `${newState.channel}`, inline: true }
        ],
        color: 0x00FF00
      });
    }
    
    // Voice leave
    if (oldState.channelId && !newState.channelId && guildData(guildId).logging.events?.voiceLeave) {
      await sendLogEvent(guild, "voiceLeave", {
        fields: [
          { name: `${EMOJIS.confession} ${bold("User")}`, value: `${oldState.member?.user.tag || "Unknown"}`, inline: true },
          { name: `${EMOJIS.voice} ${bold("Channel")}`, value: `${oldState.channel}`, inline: true }
        ],
        color: 0xFF0000
      });
    }
    
    // Voice move
    if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId && guildData(guildId).logging.events?.voiceMove) {
      await sendLogEvent(guild, "voiceMove", {
        fields: [
          { name: `${EMOJIS.confession} ${bold("User")}`, value: `${newState.member?.user.tag || "Unknown"}`, inline: true },
          { name: `${EMOJIS.error} ${bold("From")}`, value: `${oldState.channel}`, inline: true },
          { name: `${EMOJIS.success} ${bold("To")}`, value: `${newState.channel}`, inline: true }
        ],
        color: 0xFFAA00
      });
    }
  }
});

/* ================= ROLE EVENTS ================= */
client.on("roleCreate", async (role) => {
  const guildId = role.guild.id;
  if (guildData(guildId).logging?.enabled && guildData(guildId).logging?.channel && guildData(guildId).logging.events?.roleCreate) {
    await sendLogEvent(role.guild, "roleCreate", {
      fields: [
        { name: `${EMOJIS.customroles} ${bold("Role")}`, value: `${role} (${role.id})`, inline: true },
        { name: `🎨 ${bold("Color")}`, value: role.hexColor, inline: true },
        { name: `📍 ${bold("Position")}`, value: `${role.position}`, inline: true }
      ],
      color: 0x00FF00
    });
  }
});

client.on("roleDelete", async (role) => {
  const guildId = role.guild.id;
  // Antinuke check
  if (guildData(guildId).antinuke?.enabled) {
    try {
      const auditLogs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete, limit: 1 });
      const log = auditLogs.entries.first();
      if (log) {
        const executor = log.executor;
        if (executor.id !== client.user.id && executor.id !== role.guild.ownerId) {
          await handleAntiNukeAction(role.guild, executor.id, "roleDelete");
        }
      }
    } catch (err) {}
  }

  if (guildData(guildId).logging?.enabled && guildData(guildId).logging?.channel && guildData(guildId).logging.events?.roleDelete) {
    await sendLogEvent(role.guild, "roleDelete", {
      fields: [
        { name: `${EMOJIS.customroles} ${bold("Role")}`, value: `${role.name} (${role.id})`, inline: true },
        { name: `🎨 ${bold("Color")}`, value: role.hexColor, inline: true }
      ],
      color: 0xFF0000
    });
  }
});

/* ================= CHANNEL EVENTS ================= */
client.on("channelCreate", async (channel) => {
  if (!channel.guild) return;
  const guildId = channel.guild.id;
  
  if (guildData(guildId).logging?.enabled && guildData(guildId).logging?.channel && guildData(guildId).logging.events?.channelCreate) {
    await sendLogEvent(channel.guild, "channelCreate", {
      fields: [
        { name: `${EMOJIS.messages} ${bold("Channel")}`, value: `${channel} (${channel.id})`, inline: true },
        { name: `📁 ${bold("Type")}`, value: ChannelType[channel.type] || "Unknown", inline: true }
      ],
      color: 0x00FF00
    });
  }
});

client.on("channelDelete", async (channel) => {
  if (!channel.guild) return;
  const guildId = channel.guild.id;
  
  // Antinuke check
  if (guildData(guildId).antinuke?.enabled) {
    try {
      const auditLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete, limit: 1 });
      const log = auditLogs.entries.first();
      if (log) {
        const executor = log.executor;
        if (executor.id !== client.user.id && executor.id !== channel.guild.ownerId) {
          await handleAntiNukeAction(channel.guild, executor.id, "channelDelete");
        }
      }
    } catch (err) {}
  }

  if (guildData(guildId).logging?.enabled && guildData(guildId).logging?.channel && guildData(guildId).logging.events?.channelDelete) {
    await sendLogEvent(channel.guild, "channelDelete", {
      fields: [
        { name: `${EMOJIS.messages} ${bold("Channel")}`, value: `#${channel.name} (${channel.id})`, inline: true },
        { name: `📁 ${bold("Type")}`, value: ChannelType[channel.type] || "Unknown", inline: true }
      ],
      color: 0xFF0000
    });
  }
  
  // Clean up sticky messages
  if (guildData(guildId).stickyMessages[channel.id]) {
    delete guildData(guildId).stickyMessages[channel.id];
    saveDB();
  }
  
  // Clean up auto delete
  if (guildData(guildId).autoDeleteTextOnly[channel.id] !== undefined) {
    delete guildData(guildId).autoDeleteTextOnly[channel.id];
    delete guildData(guildId).autoDeleteTextOnly[channel.id];
    saveDB();
  }
});

/* ================= BAN EVENTS ================= */
client.on("guildBanAdd", async (ban) => {
  const guildId = ban.guild.id;
  // Antinuke check
  if (guildData(guildId).antinuke?.enabled) {
    try {
      const auditLogs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
      const log = auditLogs.entries.first();
      if (log) {
        const executor = log.executor;
        if (executor.id !== client.user.id && executor.id !== ban.guild.ownerId) {
          await handleAntiNukeAction(ban.guild, executor.id, "ban");
        }
      }
    } catch (err) {}
  }

  if (guildData(guildId).logging?.enabled && guildData(guildId).logging?.channel && guildData(guildId).logging.events?.memberBan) {
    await sendLogEvent(ban.guild, "memberBan", {
      fields: [
        { name: `${EMOJIS.confession} ${bold("User")}`, value: `${ban.user.tag} (${ban.user.id})`, inline: true },
        { name: `${EMOJIS.file} ${bold("Reason")}`, value: ban.reason || "No reason provided", inline: true }
      ],
      thumbnail: ban.user.displayAvatarURL({ dynamic: true }),
      color: 0xFF0000
    });
  }
});

client.on("guildBanRemove", async (ban) => {
  const guildId = ban.guild.id;
  if (guildData(guildId).logging?.enabled && guildData(guildId).logging?.channel && guildData(guildId).logging.events?.memberUnban) {
    await sendLogEvent(ban.guild, "memberUnban", {
      fields: [
        { name: `${EMOJIS.confession} ${bold("User")}`, value: `${ban.user.tag} (${ban.user.id})`, inline: true }
      ],
      thumbnail: ban.user.displayAvatarURL({ dynamic: true }),
      color: 0x00FF00
    });
  }
});

/* ================= INTERACTION HANDLER ================= */
client.on("interactionCreate", async interaction => {
  const guildId = interaction.guildId;
  // DEBUG: Log all interactions
  console.log(`Interaction received: ${interaction.type} - ${interaction.customId || 'no customId'}`);
  
  /* ================= BUTTON INTERACTIONS ================= */
  if (interaction.isButton()) {
    const customId = interaction.customId;

    // ========== BAD WORD LIST PAGINATION ==========
    if (customId.startsWith("bwlist_prev_") || customId.startsWith("bwlist_next_")) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      const parts = customId.split("_");
      // bwlist_prev_<currentPage> or bwlist_next_<currentPage>_<totalPages>
      const direction = parts[1]; // "prev" or "next"
      const currentPage = parseInt(parts[2]);
      const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;

      const fileWords = badWords.map(w => w.toLowerCase());
      const customWords = Array.isArray(db.customBadWords) ? db.customBadWords : [];
      const allWords = [...new Set([...fileWords, ...customWords])].sort();
      const pageSize = 30;
      const totalPages = Math.ceil(allWords.length / pageSize) || 1;
      const clampedPage = Math.max(1, Math.min(newPage, totalPages));
      const slice = allWords.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

      const wordList = slice.length > 0
        ? slice.map((w, i) => `\`${(clampedPage - 1) * pageSize + i + 1}.\` ${w}`).join("\n")
        : "No words in the list.";

      const embed = createEmbed({
        title: `${EMOJIS.filter} ${bold("Bad Word List")}`,
        description:
          `${bold("Commands:")}\n` +
          `\`${DEFAULT_PREFIX}badword add <word>\` — Add a word\n` +
          `\`${DEFAULT_PREFIX}badword remove <word>\` — Remove a custom word\n` +
          `\`${DEFAULT_PREFIX}badword list\` — View all words\n\n` +
          `${bold(`Words (Page ${clampedPage}/${totalPages} • ${allWords.length} total):`)}\n${wordList}`,
        footer: `File: ${fileWords.length} word(s)  |  Custom: ${customWords.length} word(s)  •  Today at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`bwlist_prev_${clampedPage}`)
          .setLabel("◀ Back")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(clampedPage <= 1),
        new ButtonBuilder()
          .setCustomId(`bwlist_page_${clampedPage}_${totalPages}`)
          .setLabel(`Page ${clampedPage} / ${totalPages}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`bwlist_next_${clampedPage}_${totalPages}`)
          .setLabel("Next ▶")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(clampedPage >= totalPages)
      );

      return interaction.update({ embeds: [embed], components: [row] });
    }

    // ========== NSFW WORD LIST PAGINATION ==========
    if (customId.startsWith("nsfwlist_prev_") || customId.startsWith("nsfwlist_next_")) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      const parts = customId.split("_");
      // nsfwlist_prev_<currentPage> or nsfwlist_next_<currentPage>_<totalPages>
      const direction = parts[1]; // "prev" or "next"
      const currentPage = parseInt(parts[2]);
      const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;

      const fileWords = Array.isArray(nsfwWords) ? nsfwWords.map(w => w.toLowerCase()) : [];
      const customWords = Array.isArray(db.customNsfwWords) ? db.customNsfwWords : [];
      const allWords = [...new Set([...fileWords, ...customWords])].sort();
      const pageSize = 30;
      const totalPages = Math.ceil(allWords.length / pageSize) || 1;
      const clampedPage = Math.max(1, Math.min(newPage, totalPages));
      const slice = allWords.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

      const wordList = slice.length > 0
        ? slice.map((w, i) => `\`${(clampedPage - 1) * pageSize + i + 1}.\` ${w}`).join("\n")
        : "No words in the list.";

      const embed = createEmbed({
        title: `${EMOJIS.filter} ${bold("NSFW Word List")}`,
        description:
          `${bold("Commands:")}\n` +
          `\`${DEFAULT_PREFIX}nsfwword add <word>\` — Add a word\n` +
          `\`${DEFAULT_PREFIX}nsfwword remove <word>\` — Remove a custom word\n` +
          `\`${DEFAULT_PREFIX}nsfwword list\` — View all words\n\n` +
          `${EMOJIS.warning} Detection triggers a **7-day mute**.\n\n` +
          `${bold(`Words (Page ${clampedPage}/${totalPages} • ${allWords.length} total):`)}\n${wordList}`,
        footer: `File: ${fileWords.length} word(s)  |  Custom: ${customWords.length} word(s)  •  Today at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`nsfwlist_prev_${clampedPage}`)
          .setLabel("◀ Back")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(clampedPage <= 1),
        new ButtonBuilder()
          .setCustomId(`nsfwlist_page_${clampedPage}_${totalPages}`)
          .setLabel(`Page ${clampedPage} / ${totalPages}`)
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId(`nsfwlist_next_${clampedPage}_${totalPages}`)
          .setLabel("Next ▶")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(clampedPage >= totalPages)
      );

      return interaction.update({ embeds: [embed], components: [row] });
    }

    // ========== ANTINUKE ENABLE ALL ==========
    if (customId === "antinuke_enable_all") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      ANTINUKE_EVENTS.forEach(e => { guildData(guildId).antinuke.events[e.id] = true; });
      saveDB();
      const payload = buildAntiNukeEventsMessage(interaction.guildId);
      return interaction.update({ content: payload.content, components: payload.components });
    }

    if (customId === "antinuke_disable_all") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      ANTINUKE_EVENTS.forEach(e => { guildData(guildId).antinuke.events[e.id] = false; });
      saveDB();
      const payload = buildAntiNukeEventsMessage(interaction.guildId);
      return interaction.update({ content: payload.content, components: payload.components });
    }

    // ========== TOGGLE PANEL: ENABLE ALL ==========
    if (customId === "toggle_enable_all") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      if (!db.guildSystems) db.guildSystems = {};
      if (!db.guildSystems[guildId]) db.guildSystems[guildId] = {};
      ALL_SYSTEMS.forEach(sys => { db.guildSystems[guildId][sys.name] = true; });
      saveDB();
      await interaction.deferUpdate().catch(() => {});
      const { container } = buildTogglePanel(interaction.guildId);
      return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    }

    // ========== TOGGLE PANEL: DISABLE ALL ==========
    if (customId === "toggle_disable_all") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      if (!db.guildSystems) db.guildSystems = {};
      if (!db.guildSystems[guildId]) db.guildSystems[guildId] = {};
      ALL_SYSTEMS.forEach(sys => { db.guildSystems[guildId][sys.name] = false; });
      saveDB();
      await interaction.deferUpdate().catch(() => {});
      const { container } = buildTogglePanel(interaction.guildId);
      return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    }

        // ========== GLOBAL TOGGLE: ENABLE ALL ==========
    if (customId === "global_enable_all") {
      if (!config.ownerIds?.includes(interaction.user.id)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Bot owner only!")], flags: 64 });
      }
      if (!db.globalSystems) db.globalSystems = {};
      ALL_SYSTEMS.forEach(sys => { db.globalSystems[sys.name] = true; });
      saveDB();
      const { container } = buildGlobalTogglePanel();
      return interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    // ========== GLOBAL TOGGLE: DISABLE ALL ==========
    if (customId === "global_disable_all") {
      if (!config.ownerIds?.includes(interaction.user.id)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Bot owner only!")], flags: 64 });
      }
      if (!db.globalSystems) db.globalSystems = {};
      ALL_SYSTEMS.forEach(sys => { db.globalSystems[sys.name] = false; });
      saveDB();
      const { container } = buildGlobalTogglePanel();
      return interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    // ========== DASHBOARD BUTTONS ==========
    if (customId.startsWith("dashboard_")) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      const section = customId.replace("dashboard_", "");
      if (section === "home") {
        const { embed, components } = buildDashboard(interaction.guild, interaction.guildId);
        return interaction.update({ embeds: [embed], components });
      }
      const result = buildDashboardSection(section, interaction.guild, interaction.guildId);
      if (result.isV2) {
        return interaction.update({ components: [result.container], flags: MessageFlags.IsComponentsV2 });
      }
      return interaction.update({ embeds: [result.embed], components: result.components });
    }

    // ========== PREMIUM PLAN VIEW BUTTONS ==========
    if (customId.startsWith("premium_view_")) {
      const plan = customId.replace("premium_view_", "");
      const planInfo = PREMIUM_PLANS[plan];
      if (!planInfo) return interaction.reply({ embeds: [createErrorEmbed("Unknown Plan", "That plan doesn't exist!")], flags: 64 });
      const features = PREMIUM_FEATURES[plan].map(f =>
        `<a:zzz_arrow_hash:1485872093437497434>  ${f}<a:zzz_Exclamation:1485872115662983288>`
      ).join("\n");
      const embed = createEmbed({
        title: `💎 ${bold(`${planInfo.label} — ${planInfo.name} Plan`)}`,
        description:
          `> Here's everything included in **${planInfo.name}**:\n\n` +
          features +
          `\n\n<a:zzz_arrow_hash:1485872093437497434>  **Duration:** ${planInfo.duration === null ? "Lifetime (never expires)" : "30 days"}<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434>  **To activate:** Contact the bot owner<a:zzz_Exclamation:1485872115662983288>`,
        color: planInfo.color,
        footer: "Use !premium status to check your current plan"
      });
      return interaction.update({ embeds: [embed], components: buildPremiumPlansComponents() });
    }

    // ========== PREMIUM CHECK STATUS BUTTON ==========
    if (customId === "premium_check_status") {
      const embed = buildPremiumStatusEmbed(interaction.user.id, interaction.guildId);
      return interaction.update({ embeds: [embed], components: buildPremiumPlansComponents() });
    }

    // ========== EMBED EDITOR BUTTONS ==========
    if (customId.startsWith("embedbtn_")) {
      const parts = customId.split("_");
      const action = parts[1];
      const sessionId = parts.slice(2).join("_");
      const embedData = embedEditorData.get(sessionId);

      if (!embedData) {
        return interaction.reply({ embeds: [createErrorEmbed("Session Expired", "This embed session expired. Run `!embed` again.")], flags: 64 });
      }

      if (action === "basic") {
        const modal = new ModalBuilder().setCustomId(`embedmod_basic_${sessionId}`).setTitle("Edit Basic Information");
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_title").setLabel("Title (leave blank to remove)").setStyle(TextInputStyle.Short).setValue(embedData.title || "").setRequired(false).setMaxLength(256)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_description").setLabel("Description (leave blank to remove)").setStyle(TextInputStyle.Paragraph).setValue(embedData.description || "").setRequired(false).setMaxLength(4000)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_color").setLabel("Color hex e.g. #FF0000 (blank = keep current)").setStyle(TextInputStyle.Short).setValue(embedData.color ? `#${embedData.color.toString(16).padStart(6,"0")}` : "").setRequired(false).setMaxLength(7))
        );
        return interaction.showModal(modal);
      }

      if (action === "author") {
        const modal = new ModalBuilder().setCustomId(`embedmod_author_${sessionId}`).setTitle("Edit Author");
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_author_name").setLabel("Author Name (blank = remove author)").setStyle(TextInputStyle.Short).setValue(embedData.author?.name || "").setRequired(false).setMaxLength(256)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_author_icon").setLabel("Author Icon URL (optional)").setStyle(TextInputStyle.Short).setValue(embedData.author?.iconURL || "").setRequired(false)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_author_url").setLabel("Author Clickable URL (optional)").setStyle(TextInputStyle.Short).setValue(embedData.author?.url || "").setRequired(false))
        );
        return interaction.showModal(modal);
      }

      if (action === "footer") {
        const modal = new ModalBuilder().setCustomId(`embedmod_footer_${sessionId}`).setTitle("Edit Footer");
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_footer_text").setLabel("Footer Text (blank = remove footer)").setStyle(TextInputStyle.Short).setValue(embedData.footer?.text || "").setRequired(false).setMaxLength(2048)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_footer_icon").setLabel("Footer Icon URL (optional)").setStyle(TextInputStyle.Short).setValue(embedData.footer?.iconURL || "").setRequired(false)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_timestamp").setLabel("Show Timestamp? Type yes or no").setStyle(TextInputStyle.Short).setValue(embedData.timestamp ? "yes" : "no").setRequired(false).setMaxLength(3))
        );
        return interaction.showModal(modal);
      }

      if (action === "images") {
        const modal = new ModalBuilder().setCustomId(`embedmod_images_${sessionId}`).setTitle("Edit Images");
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_thumbnail").setLabel("Thumbnail URL (small top-right image)").setStyle(TextInputStyle.Short).setValue(embedData.thumbnail || "").setRequired(false)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_image").setLabel("Main Image URL (large bottom image)").setStyle(TextInputStyle.Short).setValue(embedData.image || "").setRequired(false))
        );
        return interaction.showModal(modal);
      }

      if (action === "send") {
        const modal = new ModalBuilder().setCustomId(`embedmod_send_${sessionId}`).setTitle("Send Embed to Channel");
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_channel_id").setLabel("Channel ID (blank = current channel)").setStyle(TextInputStyle.Short).setRequired(false))
        );
        return interaction.showModal(modal);
      }

      if (action === "addfield") {
        const maxF = getMaxEmbedFields(interaction.user.id, interaction.guildId);
        if ((embedData.fields?.length || 0) >= maxF) {
          return interaction.reply({
            embeds: [createErrorEmbed("Field Limit", `You can only add up to ${maxF} fields.
💎 *Upgrade to premium for more fields!*`)],
            flags: 64
          });
        }
        const modal = new ModalBuilder().setCustomId(`embedmod_addfield_${sessionId}`).setTitle("Add Embed Field");
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_field_name").setLabel("Field Name").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(256)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_field_value").setLabel("Field Value").setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(1024)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_field_inline").setLabel("Inline? (yes / no)").setStyle(TextInputStyle.Short).setValue("no").setRequired(false).setMaxLength(3))
        );
        return interaction.showModal(modal);
      }

      if (action === "removefield") {
        if (!embedData.fields || embedData.fields.length === 0) {
          return interaction.reply({ embeds: [createErrorEmbed("No Fields", "There are no fields to remove!")], flags: 64 });
        }
        embedData.fields.pop();
        embedEditorData.set(sessionId, embedData);
        const maxF = getMaxEmbedFields(interaction.user.id, interaction.guildId);
        const curF = embedData.fields.length;
        const previewEmbed = buildEmbedFromData(embedData);
        const r1 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`embedbtn_basic_${sessionId}`).setLabel("✏️ Title / Description / Color").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`embedbtn_author_${sessionId}`).setLabel("👤 Author").setStyle(ButtonStyle.Secondary)
        );
        const r2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`embedbtn_footer_${sessionId}`).setLabel("📋 Footer & Timestamp").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`embedbtn_images_${sessionId}`).setLabel("🖼️ Images").setStyle(ButtonStyle.Secondary)
        );
        const r3 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`embedbtn_addfield_${sessionId}`).setLabel(`➕ Add Field (${curF}/${maxF})`).setStyle(ButtonStyle.Secondary).setDisabled(curF >= maxF),
          new ButtonBuilder().setCustomId(`embedbtn_removefield_${sessionId}`).setLabel("➖ Remove Last Field").setStyle(ButtonStyle.Danger).setDisabled(curF === 0)
        );
        const r4 = new ActionRowBuilder().addComponents(
          embedData.targetMessageId
            ? new ButtonBuilder().setCustomId(`embedbtn_save_${sessionId}`).setLabel("💾 Save to Original").setStyle(ButtonStyle.Primary)
            : new ButtonBuilder().setCustomId(`embedbtn_send_${sessionId}`).setLabel("✅ Send to Channel").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setLabel("📖 Support Server").setStyle(ButtonStyle.Link).setURL("https://discord.gg/yourinvite")
        );
        const comps = embedData.targetMessageId
          ? [r1, r2, r3, new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId(`embedbtn_save_${sessionId}`).setLabel("💾 Save to Original").setStyle(ButtonStyle.Primary),
              new ButtonBuilder().setCustomId(`embedbtn_send_${sessionId}`).setLabel("✅ Send Copy").setStyle(ButtonStyle.Success),
              new ButtonBuilder().setLabel("📖 Support Server").setStyle(ButtonStyle.Link).setURL("https://discord.gg/yourinvite")
            )]
          : [r1, r2, r3, r4];
        return interaction.update({ embeds: [previewEmbed], components: comps });
      }

      if (action === "save") {
        await interaction.deferReply({ flags: 64 });
        try {
          if (!embedData.targetMessageId) return interaction.editReply({ embeds: [createErrorEmbed("No Target", "No original message to save to!")] });
          const targetChannel = interaction.guild.channels.cache.get(embedData.targetChannelId);
          if (!targetChannel) return interaction.editReply({ embeds: [createErrorEmbed("Error", "Target channel not found!")] });
          const targetMsg = await targetChannel.messages.fetch(embedData.targetMessageId).catch(() => null);
          if (!targetMsg) return interaction.editReply({ embeds: [createErrorEmbed("Error", "Original message not found!")] });
          if (!targetMsg.editable) return interaction.editReply({ embeds: [createErrorEmbed("Error", "I cannot edit that message!")] });
          await targetMsg.edit({ embeds: [buildEmbedFromData(embedData)] });
          return interaction.editReply({ embeds: [createSuccessEmbed("Saved! ✅", "Changes saved to the original embed!")] });
        } catch (err) {
          console.error("Embed save error:", err);
          return interaction.editReply({ embeds: [createErrorEmbed("Error", err.message)] });
        }
      }
    }

    // ========== WELCOME CONFIG MODAL SUBMISSIONS ==========
    if (customId.startsWith("wlmod_")) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      await interaction.deferReply({ flags: 64 });
      const parts = customId.split("_");
      const action = parts[1];
      const sessionId = parts.slice(2).join("_");

      if (action === "channel") {
        const chId = interaction.fields.getTextInputValue("inp_wl_channel").trim();
        const ch = interaction.guild.channels.cache.get(chId);
        if (!ch) return interaction.editReply({ embeds: [createErrorEmbed("Invalid Channel", "Channel not found! Make sure you copy the correct Channel ID.")] });
        guildData(guildId).welcome.channel = chId;
        if (!guildData(guildId).greet) guildData(guildId).greet = {};
        guildData(guildId).greet.channel = chId;
        saveDB();
      } else if (action === "message") {
        const message = interaction.fields.getTextInputValue("inp_wl_message").trim();
        guildData(guildId).welcome.message = message;
        if (!guildData(guildId).greet) guildData(guildId).greet = {};
        guildData(guildId).greet.message = message;
        saveDB();
      } else if (action === "dmmsg") {
        const dmMsg = interaction.fields.getTextInputValue("inp_wl_dmmsg").trim();
        guildData(guildId).welcome.dmMessage = dmMsg;
        saveDB();
      }

      const newSessionId = `${interaction.user.id}_${Date.now()}`;
      const { container } = buildWelcomeConfigPanel(interaction.guild, interaction.guildId, newSessionId);
      await interaction.message?.edit({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
      return interaction.editReply({ embeds: [createSuccessEmbed("Updated!", "Welcome configuration has been saved.")] });
    }

    // ========== TICKET CREATE ==========
    if (customId === "create_ticket") {
      if (!guildData(guildId).ticket?.enabled) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("System Disabled", "Ticket system is currently disabled.")], 
          flags: 64 
        });
      }
      
      const isPrem = isPremiumUser(interaction.user.id) || isPremiumGuild(interaction.guildId);
      const premPlan = isPremiumUser(interaction.user.id)
        ? db.premium?.users?.[interaction.user.id]?.plan
        : isPremiumGuild(interaction.guildId)
          ? db.premium?.guilds?.[interaction.guildId]?.plan
          : null;

      // Premium ticket limits: basic=10, pro=25, lifetime=unlimited
      let maxAllowed = guildData(guildId).ticket.maxTickets ?? 1;
      if (isPrem) {
        if (premPlan === "lifetime") maxAllowed = 999;
        else if (premPlan === "pro")  maxAllowed = 25;
        else if (premPlan === "basic") maxAllowed = Math.max(maxAllowed, 10);
      }

      const userOpenTickets = Object.values(guildData(guildId).ticket.tickets || {}).filter(t => t.oderId === interaction.user.id && t.open);
      if (userOpenTickets.length >= maxAllowed) {
        const ticketList = userOpenTickets.slice(0, 5).map(t => `<#${t.channelId}>`).join(", ");
        return interaction.reply({
          embeds: [createErrorEmbed(
            "Ticket Limit Reached",
            `<a:zzz_arrow_hash:1485872093437497434> **Open Tickets:** ${userOpenTickets.length}/${maxAllowed}<a:zzz_Exclamation:1485872115662983288>\n` +
            `<a:zzz_arrow_hash:1485872093437497434> **Your Tickets:** ${ticketList}<a:zzz_Exclamation:1485872115662983288>\n\n` +
            `${isPrem ? "" : "💎 *Upgrade to premium to open more tickets at once!*"}`
          )],
          flags: 64
        });
      }
      
      const category = interaction.guild.channels.cache.get(guildData(guildId).ticket.category);
      if (!category) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("Configuration Error", "Ticket category not found!")], 
          flags: 64 
        });
      }

      try {
        const ticketNumber = Object.keys(guildData(guildId).ticket.tickets || {}).length + 1;
        const ticketChannel = await interaction.guild.channels.create({
          name: `ticket-${ticketNumber}-${interaction.user.username}`.slice(0, 100).replace(/[^a-zA-Z0-9-]/g, ''),
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] },
            { id: guildData(guildId).ticket.supportRole, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] }
          ]
        });

        if (!guildData(guildId).ticket.tickets) guildData(guildId).ticket.tickets = {};
        guildData(guildId).ticket.tickets[ticketChannel.id] = {
          number: ticketNumber,
          oderId: interaction.user.id,
          channelId: ticketChannel.id,
          open: true,
          createdAt: Date.now(),
          messages: [],
          claimedBy: null
        };
        saveDB();

        // Log ticket creation
        if (guildData(guildId).ticket.logs) {
          const logChannel = interaction.guild.channels.cache.get(guildData(guildId).ticket.logs);
          if (logChannel) {
            const logEmbed = createEmbed({
              title: `${EMOJIS.ticket} ${bold(`Ticket #${ticketNumber} Created`)}`,
              fields: [
                { name: `${EMOJIS.confession} ${bold("User")}`, value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: `${EMOJIS.messages} ${bold("Channel")}`, value: `${ticketChannel}`, inline: true }
              ],
              color: 0x00FF00
            });
            logChannel.send({ embeds: [logEmbed] });
          }
        }

        // Send welcome message in ticket
        const welcomeEmbed = createEmbed({
          title: `${EMOJIS.ticket} ${bold(`Ticket #${ticketNumber}`)}`,
          description: 
            `${EMOJIS.welcome} Welcome ${interaction.user}!\n\n` +
            `${EMOJIS.info} Please describe your issue and our support team will assist you shortly.\n\n` +
            `${EMOJIS.clock} Average response time: 5-10 minutes`,
          fields: [
            { name: `${EMOJIS.confession} ${bold("Opened By")}`, value: `${interaction.user.tag}`, inline: true },
            { name: `${EMOJIS.calendar} ${bold("Created")}`, value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
          ]
        });

        const closeButton = new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("Close Ticket")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger);

        const claimButton = new ButtonBuilder()
          .setCustomId("ticket_claim")
          .setLabel("Claim")
          .setEmoji("✋")
          .setStyle(ButtonStyle.Primary);

        const transcriptButton = new ButtonBuilder()
          .setCustomId("ticket_transcript")
          .setLabel("Transcript")
          .setEmoji("📝")
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(closeButton, claimButton, transcriptButton);

        await ticketChannel.send({
          content: `${interaction.user} <@&${guildData(guildId).ticket.supportRole}>`,
          embeds: [welcomeEmbed],
          components: [row]
        });

        return interaction.reply({ 
          embeds: [createSuccessEmbed("Ticket Created", `Your ticket has been created: ${ticketChannel}`)], 
          flags: 64 
        });
      } catch (error) {
        console.error("Ticket creation error:", error);
        return interaction.reply({ 
          embeds: [createErrorEmbed("Error", "Failed to create ticket. Please try again.")], 
          flags: 64 
        });
      }
    }

    // ========== TICKET CLOSE ==========
    if (customId === "ticket_close") {
      const ticket = guildData(guildId).ticket?.tickets?.[interaction.channel.id];
      if (!ticket) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("Error", "This is not a ticket channel!")], 
          flags: 64 
        });
      }

      await interaction.deferReply();

      // Generate and save transcript
      await saveTicketTranscript(interaction.guild, interaction.channel, ticket, interaction.user.id);

      ticket.open = false;
      ticket.closedAt = Date.now();
      ticket.closedBy = interaction.user.id;
      saveDB();

      const closeEmbed = createEmbed({
        title: `${EMOJIS.lock} ${bold("Ticket Closed")}`,
        description: 
          `${EMOJIS.success} This ticket has been closed by ${interaction.user}\n\n` +
          `${EMOJIS.clock} This channel will be deleted in ${bold("10 seconds")}`,
        color: 0xFF0000
      });
      
      await interaction.editReply({ embeds: [closeEmbed] });

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 10000);
    }

    // ========== TICKET CLAIM ==========
    if (customId === "ticket_claim") {
      const ticket = guildData(guildId).ticket?.tickets?.[interaction.channel.id];
      if (!ticket) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("Error", "This is not a ticket channel!")], 
          flags: 64 
        });
      }

      if (ticket.claimedBy) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("Already Claimed", `This ticket is already claimed by <@${ticket.claimedBy}>`)], 
          flags: 64 
        });
      }

      ticket.claimedBy = interaction.user.id;
      saveDB();

      const claimEmbed = createEmbed({
        title: `✋ ${bold("Ticket Claimed")}`,
        description: `${EMOJIS.success} This ticket has been claimed by ${interaction.user}`,
        color: 0x00FF00
      });

      return interaction.reply({ embeds: [claimEmbed] });
    }

    // ========== TICKET TRANSCRIPT ==========
    if (customId === "ticket_transcript") {
      const ticket = guildData(guildId).ticket?.tickets?.[interaction.channel.id];
      if (!ticket) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("Error", "This is not a ticket channel!")], 
          flags: 64 
        });
      }
      
      await interaction.deferReply({ flags: 64 });
      
      const transcript = await generateTicketTranscript(interaction.channel, ticket);
      if (!transcript) {
        return interaction.editReply({ 
          embeds: [createErrorEmbed("Error", "Failed to generate transcript!")] 
        });
      }
      
      const attachment = new AttachmentBuilder(
        Buffer.from(transcript, 'utf-8'), 
        { name: `ticket-${ticket.number}-transcript.txt` }
      );
      
      const embed = createEmbed({
        title: `${EMOJIS.file} ${bold("Ticket Transcript")}`,
        description: `${EMOJIS.success} Transcript for Ticket #${ticket.number}`
      });
      
      return interaction.editReply({ embeds: [embed], files: [attachment] });
    }

    // ========== GIVEAWAY ENTER ==========
    if (customId.startsWith("giveaway_enter_")) {
      const giveawayId = customId.replace("giveaway_enter_", "");

      // Always sync from disk first - ensures data survives bot restarts
      reloadDB();
      const giveawayData = giveaways.get(giveawayId) || guildData(guildId).giveaways?.[giveawayId];

      console.log(`[Giveaway Enter] ID: ${giveawayId} | found: ${!!giveawayData}`);

      if (!giveawayData) {
        console.warn(`[Giveaway Enter] Not found: ${giveawayId} | DB keys: ${Object.keys(guildData(guildId).giveaways || {}).join(", ") || "none"}`);
        return interaction.reply({ embeds: [createErrorEmbed("Error", "Giveaway not found!")], flags: 64 }).catch(() => {});
      }
      if (giveawayData.ended) {
        return interaction.reply({ embeds: [createErrorEmbed("Ended", "This giveaway has ended!")], flags: 64 }).catch(() => {});
      }

      const isEntered = giveawayData.participants.includes(interaction.user.id);

      if (isEntered) {
        giveawayData.participants = giveawayData.participants.filter(id => id !== interaction.user.id);
      } else {
        giveawayData.participants.push(interaction.user.id);
      }

      guildData(guildId).giveaways[giveawayId] = giveawayData;
      giveaways.set(giveawayId, giveawayData);
      saveDB();

      // Build updated giveaway embed inline (no separate message.edit call)
      const entriesCount = giveawayData.participants.length;
      let gwDesc = `<a:zzz_arrow_hash:1485872093437497434> ${bold("Prize:")} ${giveawayData.prize}<a:zzz_Exclamation:1485872115662983288>\n`;
      gwDesc += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Winners:")} ${giveawayData.winners}<a:zzz_Exclamation:1485872115662983288>\n`;
      gwDesc += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Ends:")} <t:${Math.floor(giveawayData.endTime / 1000)}:R><a:zzz_Exclamation:1485872115662983288>\n`;
      gwDesc += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Hosted by:")} <@${giveawayData.hostId}> <a:zzz_Exclamation:1485872115662983288>\n`;
      if (giveawayData.donorId) gwDesc += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Donated by:")} <@${giveawayData.donorId}> <a:zzz_Exclamation:1485872115662983288>\n`;
      gwDesc += `<a:zzz_arrow_hash:1485872093437497434> ${bold("Entries:")} ${entriesCount} <a:zzz_Exclamation:1485872115662983288>\n`;
      gwDesc += `${bold("Click the <a:giveaway:1485877625464422551>  below to enter!")}`;

      const updatedEmbed = createEmbed({
        title: `${EMOJIS.giveaway} ${bold("GIVEAWAY")} ${EMOJIS.giveaway}`,
        description: gwDesc,
        thumbnail: interaction.guild?.iconURL({ dynamic: true }) || null,
        footer: `Giveaway ID: ${giveawayData.id}`
      });
      updatedEmbed.setTimestamp(new Date(giveawayData.endTime));

      const updatedRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`giveaway_enter_${giveawayData.id}`)
          .setEmoji({ id: "1485877625464422551", name: "giveaway", animated: true })
          .setLabel("Enter Giveaway")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`giveaway_participants_${giveawayData.id}`)
          .setLabel(`👥 Participants (${entriesCount})`)
          .setStyle(ButtonStyle.Secondary)
      );

      // Build confirmation embed before acknowledging
      const replyEmbed = isEntered
        ? createEmbed({
            title: `${EMOJIS.error} ${bold("Left Giveaway")}`,
            description: `You have left the giveaway for ${bold(giveawayData.prize)}.\n\n${EMOJIS.info} You can re-enter anytime before it ends!`,
            color: 0xFF6B6B
          })
        : createEmbed({
            title: `<a:giveaway:1485877625464422551>  fic enter giveaway discription`,
            description:
              `<a:giveaway:1485877625464422551>  You have entered the giveaway!\n` +
              `<a:zzz_arrow_hash:1485872093437497434>  **Prize:** ${giveawayData.prize}<a:zzz_Exclamation:1485872115662983288> \n` +
              `<a:zzz_arrow_hash:1485872093437497434>  **Your Entry #:** ${entriesCount}<a:zzz_Exclamation:1485872115662983288> \n` +
              `<a:zzz_arrow_hash:1485872093437497434>  **Total Entries:** ${entriesCount}<a:zzz_Exclamation:1485872115662983288> \n` +
              `<a:zzz_arrow_hash:1485872093437497434>  **Ends:** <t:${Math.floor(giveawayData.endTime / 1000)}:R><a:zzz_Exclamation:1485872115662983288> \n` +
              `<a:zzz_arrow_hash:1485872093437497434>  ||**Good luck!**||<a:zzz_Exclamation:1485872115662983288> `,
            color: 0x00FF00,
            footer: "Click the button again to leave"
          });

      // Update the original giveaway message directly (fetch + edit), independent of interaction token
      try {
        const origChannel = interaction.guild.channels.cache.get(giveawayData.channelId);
        if (origChannel) {
          const origMsg = await origChannel.messages.fetch(giveawayData.messageId).catch(() => null);
          if (origMsg) await origMsg.edit({ embeds: [updatedEmbed], components: [updatedRow] }).catch(() => {});
        }
      } catch (editErr) {
        console.error("[Giveaway Enter] Failed to update giveaway message:", editErr.message);
      }

      // Acknowledge the interaction with an ephemeral confirmation
      try {
        await interaction.reply({ embeds: [replyEmbed], flags: 64 });
      } catch (replyErr) {
        if (replyErr.code === 40060 || replyErr.code === 10062) {
          console.warn(`[Giveaway Enter] Interaction already acknowledged (${replyErr.code}), skipping.`);
        } else {
          console.error("[Giveaway Enter] Reply error:", replyErr.message);
        }
      }
      return;
    }

    // ========== GIVEAWAY PARTICIPANTS ==========
    if (customId.startsWith("giveaway_participants_")) {
      const giveawayId = customId.replace("giveaway_participants_", "");

      // Always sync from disk first
      reloadDB();
      const giveawayData = giveaways.get(giveawayId) || guildData(guildId).giveaways?.[giveawayId];

      if (!giveawayData) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("Error", "Giveaway not found!")], 
          flags: 64 
        }).catch(() => {});
      }

      const entriesCount = giveawayData.participants?.length || 0;

      if (entriesCount === 0) {
        const embed = createEmbed({
          title: `👥 ${bold("Giveaway Participants")}`,
          description: `${EMOJIS.info} No one has entered yet!\n\nBe the first to enter! ${EMOJIS.party}`
        });
        return interaction.reply({ embeds: [embed], flags: 64 });
      }

      const maxShow = 20;
      const participantsList = giveawayData.participants
        .slice(0, maxShow)
        .map((id, index) => `<a:arrow_arrow:1485908026006442015>  ${index + 1}. <@${id}>`)
        .join("\n");

      const hasMore = entriesCount > maxShow;
      const userEntered = giveawayData.participants.includes(interaction.user.id);
      const userPosition = userEntered ? giveawayData.participants.indexOf(interaction.user.id) + 1 : null;
      const winChance = userEntered ? ((giveawayData.winners / entriesCount) * 100).toFixed(2) : null;

      const embed = createEmbed({
        title: `👥 ${bold(`Participants (${entriesCount})`)}`,
        description:
          `<a:zzz_arrow_hash:1485872093437497434> **participants** <a:zzz_Exclamation:1485872115662983288>\n` +
          participantsList +
          (hasMore ? `\n<a:arrow_arrow:1485908026006442015>  *...and ${entriesCount - maxShow} more*` : "") +
          `\n\n<a:zzz_arrow_hash:1485872093437497434> **Prize** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${giveawayData.prize}` +
          `\n<a:zzz_arrow_hash:1485872093437497434> **Your Status** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${userEntered ? `Entered (#${userPosition})` : "Not Entered"}` +
          (winChance ? `\n<a:zzz_arrow_hash:1485872093437497434> **Win Chance** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${winChance}%` : ""),
        footer: `Giveaway ID: ${giveawayId}`
      });

      return interaction.reply({ embeds: [embed], flags: 64 }).catch(() => {});
    }

    // ========== GIVEAWAY REROLL ==========
    if (customId.startsWith("giveaway_reroll_")) {
      const giveawayId = customId.replace("giveaway_reroll_", "");

      // Always sync from disk first
      reloadDB();
      const giveawayData = giveaways.get(giveawayId) || guildData(guildId).giveaways?.[giveawayId];

      if (!giveawayData) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("Error", "Giveaway not found!")], 
          flags: 64 
        });
      }

      const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
      const isHost = giveawayData.hostId === interaction.user.id;
      const isDonor = giveawayData.donorId === interaction.user.id;
      const isAdmin = member?.permissions.has(PermissionsBitField.Flags.ManageGuild);

      if (!isHost && !isAdmin && !isDonor) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("No Permission", "Only the host, donor, or admins can reroll!")], 
          flags: 64 
        });
      }

      const result = await rerollGiveaway(giveawayId, 1);
      
      if (!result.success) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("Error", result.error)], 
          flags: 64 
        });
      }

      const embed = createEmbed({
        title: `🔄 ${bold("Giveaway Rerolled!")}`,
        description: `${EMOJIS.party} New Winner: <@${result.winners[0]}>\n\nCongratulations! You won ${bold(giveawayData.prize)}!`,
        color: 0x00FF00
      });
      
      return interaction.reply({ embeds: [embed] });
    }

    // ========== GIVEAWAY ENDED/CANCELLED ==========
    if (customId.startsWith("giveaway_ended_") || customId.startsWith("giveaway_cancelled_")) {
      return interaction.reply({ 
        embeds: [createInfoEmbed("Giveaway Ended", "This giveaway has ended!")], 
        flags: 64 
      });
    }

    // ========== REACTION ROLE BUILDER BUTTONS ==========
    if (customId.startsWith("rr_")) {
      const parts = customId.split("_");
      const action = parts[1];
      const sessionId = parts.slice(2).join("_");
      const session = rrSessions.get(sessionId);

      if (action === "cancel") {
        if (session) rrSessions.delete(sessionId);
        return interaction.update({ embeds: [createEmbed({ title: "🗑️ Cancelled", description: "Reaction role builder cancelled." })], components: [] });
      }

      if (!session) {
        return interaction.reply({ embeds: [createErrorEmbed("Session Expired", "Run `!rr create` again.")], flags: 64 });
      }

      if (action === "settitle") {
        const modal = new ModalBuilder()
          .setCustomId(`rrmod_settitle_${sessionId}`)
          .setTitle("Set Panel Title & Description");
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("rr_title_inp").setLabel("Title").setStyle(TextInputStyle.Short).setValue(session.title).setRequired(true)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("rr_desc_inp").setLabel("Description").setStyle(TextInputStyle.Paragraph).setValue(session.description).setRequired(true))
        );
        return interaction.showModal(modal);
      }

      if (action === "addrole") {
        if (session.roles.length >= 20) return interaction.reply({ embeds: [createErrorEmbed("Limit", "Max 20 roles per panel!")], flags: 64 });
        const modal = new ModalBuilder()
          .setCustomId(`rrmod_addrole_${sessionId}`)
          .setTitle("Add Role to Panel");
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("rr_roleid_inp").setLabel("Role ID").setStyle(TextInputStyle.Short).setPlaceholder("e.g. 123456789012345678").setRequired(true)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("rr_label_inp").setLabel("Button Label").setStyle(TextInputStyle.Short).setPlaceholder("e.g. 🎮 Gamer").setRequired(true))
        );
        return interaction.showModal(modal);
      }

      if (action === "removerole") {
        if (session.roles.length === 0) return interaction.reply({ embeds: [createErrorEmbed("No Roles", "No roles added yet!")], flags: 64 });
        const row = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`rr_doremove_${sessionId}`)
            .setPlaceholder("Select role to remove...")
            .addOptions(session.roles.map(r => ({ label: r.label, value: r.roleId })))
        );
        return interaction.reply({ embeds: [createEmbed({ title: "➖ Remove Role", description: "Select a role to remove:" })], components: [row], flags: 64 });
      }

      if (action === "post") {
        if (session.roles.length === 0) return interaction.reply({ embeds: [createErrorEmbed("No Roles", "Add at least one role first!")], flags: 64 });
        const channel = interaction.guild.channels.cache.get(session.channel);
        if (!channel) return interaction.reply({ embeds: [createErrorEmbed("Error", "Channel not found!")], flags: 64 });

        const panelEmbed = createEmbed({
          title: session.title,
          description: session.description,
          footer: "Click a button to get or remove a role"
        });

        const rows = [];
        for (let i = 0; i < session.roles.length; i += 5) {
          rows.push(new ActionRowBuilder().addComponents(
            session.roles.slice(i, i + 5).map(r =>
              new ButtonBuilder().setCustomId(`buttonrole_${r.roleId}`).setLabel(r.label).setStyle(ButtonStyle.Secondary)
            )
          ));
        }

        const postedMsg = await channel.send({ embeds: [panelEmbed], components: rows });
        if (!guildData(guildId).reactionRoles) guildData(guildId).reactionRoles = {};
        guildData(guildId).reactionRoles[postedMsg.id] = { title: session.title, channelId: channel.id, roles: session.roles };
        saveDB();
        rrSessions.delete(sessionId);

        return interaction.update({
          embeds: [createSuccessEmbed("✅ Panel Posted!", `Reaction role panel posted in <#${channel.id}>!\nMessage ID: \`${postedMsg.id}\``)],
          components: []
        });
      }
    }

    // ========== BUTTON ROLES ==========
    if (customId.startsWith("buttonrole_")) {
      const roleId = customId.replace("buttonrole_", "");
      const role = interaction.guild.roles.cache.get(roleId);
      
      if (!role) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("Error", "Role not found!")], 
          flags: 64 
        });
      }
      
      const member = interaction.member;
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(role);
        return interaction.reply({ 
          embeds: [createSuccessEmbed("Role Removed", `${EMOJIS.error} Removed ${role} from you!`)], 
          flags: 64 
        });
      } else {
        await member.roles.add(role);
        return interaction.reply({ 
          embeds: [createSuccessEmbed("Role Added", `${EMOJIS.success} Added ${role} to you!`)], 
          flags: 64 
        });
      }
    }

    // ========== HELP MENU NAVIGATION ==========
    if (customId === "help_main") {
      const helpContainer = buildMainHelpContainer(interaction.guildId);
      return interaction.update({ components: [helpContainer], flags: MessageFlags.IsComponentsV2 });
    }

    if (customId.startsWith("help_cat_")) {
      const catKey = customId.replace("help_cat_", "");
      const sessionKey = `${interaction.user.id}_${catKey}_${Date.now()}`;
      helpSessions.set(sessionKey, { category: catKey, page: 0 });
      const result = buildCategoryPage(catKey, 0, interaction.user.tag, interaction.guildId);
      if (!result) return interaction.reply({ embeds: [createErrorEmbed("Error", "Category not found!")], flags: 64 });
      const btnRow = buildHelpPageButtons(sessionKey, result.page, result.totalPages, catKey);
      result.container.addActionRowComponents(btnRow);
      result.container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
      result.container.addTextDisplayComponents(text =>
        text.setContent(`-# Requested by ${interaction.user.tag} | Page ${result.page + 1} / ${result.totalPages}`)
      );
      return interaction.update({ components: [result.container], flags: MessageFlags.IsComponentsV2 });
    }

    // ========== HELP PAGE NAVIGATION BUTTONS ==========
    if (customId.startsWith("help_prevmod_") || customId.startsWith("help_nextmod_") ||
        customId.startsWith("help_prev_")    || customId.startsWith("help_next_")    ||
        customId.startsWith("help_first_")   || customId.startsWith("help_last_")    ||
        customId.startsWith("help_close_")   || customId.startsWith("help_home_")) {

      // customId format: help_ACTION_sessionKey  (action may be "prevmod"/"nextmod")
      const firstUnderscore = customId.indexOf("_");
      // action could be "prevmod" or "nextmod" (7 chars) or single word
      let action, sessionKey;
      if (customId.startsWith("help_prevmod_") || customId.startsWith("help_nextmod_")) {
        action = customId.startsWith("help_prevmod_") ? "prevmod" : "nextmod";
        sessionKey = customId.slice(customId.indexOf("_", "help_".length + action.length) + 1);
      } else {
        const secondUnderscore = customId.indexOf("_", firstUnderscore + 1);
        action = customId.substring(firstUnderscore + 1, secondUnderscore);
        sessionKey = customId.substring(secondUnderscore + 1);
      }
      let session = helpSessions.get(sessionKey);

      // Session not in memory (bot restarted) — recover from sessionKey: userId_catKey_timestamp
      if (!session) {
        // sessionKey = "userId_catKey_timestamp"
        // userId and timestamp have no underscores in them, catKey sits in the middle
        const parts = sessionKey.split("_");
        if (parts.length >= 3) {
          // try increasingly longer catKey (handles multi-word keys like "autoresponder")
          for (let i = 1; i < parts.length - 1; i++) {
            const candidate = parts.slice(1, i + 1).join("_");
            if (ALL_COMMANDS[candidate]) {
              session = { category: candidate, page: 0 };
              helpSessions.set(sessionKey, session);
              break;
            }
          }
        }
        if (!session) {
          return interaction.reply({ embeds: [createErrorEmbed("Session Expired", "Run `!help` again to restart.")], flags: 64 });
        }
      }

      // close button
      if (action === "close") {
        helpSessions.delete(sessionKey);
        const closeContainer = new ContainerBuilder()
          .addTextDisplayComponents(text => text.setContent("*Help closed.*"));
        return interaction.update({ components: [closeContainer], flags: MessageFlags.IsComponentsV2 });
      }

      const allModKeys = Object.keys(ALL_COMMANDS);
      let newCat = session.category;
      let newPage = session.page;

      if (action === "prevmod") {
        const idx = allModKeys.indexOf(session.category);
        if (idx > 0) { newCat = allModKeys[idx - 1]; newPage = 0; }
      } else if (action === "nextmod") {
        const idx = allModKeys.indexOf(session.category);
        if (idx < allModKeys.length - 1) { newCat = allModKeys[idx + 1]; newPage = 0; }
      } else {
        const cat = ALL_COMMANDS[session.category];
        if (!cat) return interaction.reply({ embeds: [createErrorEmbed("Error", "Category not found!")], flags: 64 });
        const totalPages = Math.max(1, Math.ceil(cat.commands.length / HELP_PAGE_SIZE));
        if (action === "prev")      newPage = Math.max(0, session.page - 1);
        else if (action === "next") newPage = Math.min(totalPages - 1, session.page + 1);
        else if (action === "home" || action === "first") newPage = 0;
        else if (action === "last") newPage = totalPages - 1;
      }

      session.category = newCat;
      session.page = newPage;
      helpSessions.set(sessionKey, session);

      const result = buildCategoryPage(newCat, newPage, interaction.user.tag, interaction.guildId);
      if (!result) return interaction.reply({ embeds: [createErrorEmbed("Error", "Failed to load page.")], flags: 64 });

      const btnRow2 = buildHelpPageButtons(sessionKey, result.page, result.totalPages, newCat);
      result.container.addActionRowComponents(btnRow2);
      result.container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
      result.container.addTextDisplayComponents(text =>
        text.setContent(`-# Requested by ${interaction.user.tag} | Page ${result.page + 1} / ${result.totalPages}`)
      );
      return interaction.update({ components: [result.container], flags: MessageFlags.IsComponentsV2 });
    }

    // ── AFK Type Selection: Global or Server (Screenshot 1 → 2) ────
    if (customId.startsWith("afkt_g_") || customId.startsWith("afkt_s_")) {
      const isGlobal = customId.startsWith("afkt_g_");
      const rest = customId.slice(isGlobal ? "afkt_g_".length : "afkt_s_".length);
      const underscoreIdx = rest.indexOf("_");
      const ownerId = rest.slice(0, underscoreIdx);
      const reason = decodeURIComponent(rest.slice(underscoreIdx + 1));
      const afkType = isGlobal ? "global" : "server";

      if (interaction.user.id !== ownerId) {
        return interaction.reply({ content: "This button isn't for you!", flags: 64 });
      }

      const safeReason = encodeURIComponent(reason).slice(0, 80);
      const dmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`afkdm_y_${ownerId}_${afkType}_${safeReason}`)
          .setLabel("Yes")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`afkdm_n_${ownerId}_${afkType}_${safeReason}`)
          .setLabel("No")
          .setStyle(ButtonStyle.Danger)
      );

      const dmContainer = new ContainerBuilder()
        .addSectionComponents(section =>
          section
            .addTextDisplayComponents(text =>
              text.setContent(
                `**<:senable:1485900930002980914> ${isGlobal ? "Global" : "Server"} AFK Selected**\n\n` +
                `<a:sglitch:1486688037369942147> Did you want to get messages in your DM while you're AFK?\n\n` +
                `**>  Choose your preference below**`
              )
            )
            .setThumbnailAccessory(thumb =>
              thumb.setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }))
            )
        )
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents(dmRow)
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(text =>
          text.setContent(`-# Requested by: ${interaction.user.tag}`)
        );

      return interaction.update({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 });
    }

    // ── AFK DM Preference: Yes or No (Screenshot 2 → 3) ────────────
    if (customId.startsWith("afkdm_y_") || customId.startsWith("afkdm_n_")) {
      const dmYes = customId.startsWith("afkdm_y_");
      const rest = customId.slice(dmYes ? "afkdm_y_".length : "afkdm_n_".length);
      const parts = rest.split("_");
      const ownerId = parts[0];
      const afkType = parts[1]; // "global" or "server"
      const reason = decodeURIComponent(parts.slice(2).join("_"));

      if (interaction.user.id !== ownerId) {
        return interaction.reply({ content: "This button isn't for you!", flags: 64 });
      }

      const gId = interaction.guild.id;
      if (!guildData(gId).afk) guildData(gId).afk = { enabled: true, message: "{user} is AFK: {reason}", users: {} };

      const afkEntry = {
        reason: reason,
        time: Date.now(),
        type: afkType,
        guildId: afkType === "server" ? gId : null,
        expiresAt: null,
        mentions: [],
        dmNotify: dmYes
      };

      if (afkType === "global") {
        // Store in top-level db so all servers can see it
        if (!db.globalAfk) db.globalAfk = {};
        db.globalAfk[ownerId] = afkEntry;
      } else {
        guildData(gId).afk.users[ownerId] = afkEntry;
      }
      saveDB();

      const activatedContainer = new ContainerBuilder()
        .addSectionComponents(section =>
          section
            .addTextDisplayComponents(text =>
              text.setContent(
                `**${EMOJIS.check} AFK Activated**\n\n` +
                `<@${ownerId}> **Your AFK status is now set to ${afkType === "global" ? "Global" : "Server"}**\n` +
                `<a:zzz_arrow_hash:1485872093437497434>  **__Reason:__** ${reason}<a:zzz_Exclamation:1485872115662983288>\n` +
                `<a:zzz_arrow_hash:1485872093437497434>  **__DM Notifications:__** ${dmYes ? "<:senable:1485900930002980914> Enabled" : "<:sdisable:1485900938475475045> Disabled"}<a:zzz_Exclamation:1485872115662983288>\n\n` +
                `> You are now away from keyboard.`
              )
            )
            .setThumbnailAccessory(thumb =>
              thumb.setURL(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }))
            )
        )
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(text =>
          text.setContent(`-# Requested by: ${interaction.user.tag}`)
        );

      return interaction.update({ components: [activatedContainer], flags: MessageFlags.IsComponentsV2 });
    }

  /* ================= TICKET CONFIG MODAL SUBMISSIONS ================= */
  if (interaction.isModalSubmit() && interaction.customId.startsWith("tkmod_")) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
    }
    await interaction.deferReply({ flags: 64 });
    const parts = interaction.customId.split("_");
    const action = parts[1];
    const sessionId = parts.slice(2).join("_");

    if (action === "staffrole") {
      const roleId = interaction.fields.getTextInputValue("inp_role_id").trim();
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) return interaction.editReply({ embeds: [createErrorEmbed("Invalid Role", "Role not found! Make sure you copy the correct Role ID.")] });
      guildData(guildId).ticket.supportRole = roleId;
      saveDB();
    } else if (action === "category") {
      const catId = interaction.fields.getTextInputValue("inp_category_id").trim();
      const cat = interaction.guild.channels.cache.get(catId);
      if (!cat || cat.type !== ChannelType.GuildCategory) return interaction.editReply({ embeds: [createErrorEmbed("Invalid Category", "Category not found! Make sure you copy the correct Category ID.")] });
      guildData(guildId).ticket.category = catId;
      saveDB();
    } else if (action === "transcript") {
      const chId = interaction.fields.getTextInputValue("inp_transcript_id").trim();
      const ch = interaction.guild.channels.cache.get(chId);
      if (!ch) return interaction.editReply({ embeds: [createErrorEmbed("Invalid Channel", "Channel not found!")] });
      guildData(guildId).ticket.transcriptChannel = chId;
      saveDB();
    } else if (action === "logchannel") {
      const chId = interaction.fields.getTextInputValue("inp_log_id").trim();
      const ch = interaction.guild.channels.cache.get(chId);
      if (!ch) return interaction.editReply({ embeds: [createErrorEmbed("Invalid Channel", "Channel not found!")] });
      guildData(guildId).ticket.logs = chId;
      saveDB();
    } else if (action === "panchannel") {
      const chId = interaction.fields.getTextInputValue("inp_panel_id").trim();
      const ch = interaction.guild.channels.cache.get(chId);
      if (!ch) return interaction.editReply({ embeds: [createErrorEmbed("Invalid Channel", "Channel not found!")] });
      guildData(guildId).ticket.channel = chId;
      saveDB();
    } else if (action === "advanced") {
      const maxRaw = parseInt(interaction.fields.getTextInputValue("inp_max_tickets").trim());
      const autoRaw = interaction.fields.getTextInputValue("inp_auto_close").trim().toLowerCase();
      const dmRaw   = interaction.fields.getTextInputValue("inp_dm_close").trim().toLowerCase();
      const isPremAdv = isPremiumUser(interaction.user.id) || isPremiumGuild(guildId);
      const hardMax = isPremAdv ? 25 : 5;
      if (isNaN(maxRaw) || maxRaw < 1 || maxRaw > hardMax) return interaction.editReply({ embeds: [createErrorEmbed("Invalid Value", `Max tickets must be between 1 and ${hardMax}${isPremAdv ? "" : " (upgrade to premium for up to 25)"}.`)] });
      guildData(guildId).ticket.maxTickets = maxRaw;
      guildData(guildId).ticket.autoClose  = autoRaw === "yes";
      guildData(guildId).ticket.dmOnClose  = dmRaw === "yes";
      saveDB();
    } else if (action === "custpanel") {
      if (!guildData(guildId).ticket.embed) guildData(guildId).ticket.embed = {};
      const title  = interaction.fields.getTextInputValue("inp_embed_title").trim();
      const desc   = interaction.fields.getTextInputValue("inp_embed_desc").trim();
      const color  = interaction.fields.getTextInputValue("inp_embed_color").trim();
      const footer = interaction.fields.getTextInputValue("inp_embed_footer").trim();
      if (title)  guildData(guildId).ticket.embed.title       = title;
      if (desc)   guildData(guildId).ticket.embed.description = desc;
      if (color)  guildData(guildId).ticket.embed.color       = color;
      if (footer) guildData(guildId).ticket.embed.footer      = footer;
      saveDB();
    }

    const newSessionId = `${interaction.user.id}_${Date.now()}`;
    const { container: tkContainer } = buildTicketConfigPanel(interaction.guild, guildId, newSessionId);
    await interaction.message?.edit({ components: [tkContainer], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    return interaction.editReply({ embeds: [createSuccessEmbed("Updated!", "Ticket configuration has been saved.")] });
  }

  /* ================= BOOST CONFIG MODAL SUBMISSIONS ================= */
  if (interaction.isModalSubmit() && interaction.customId.startsWith("bstmod_")) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
    }
    await interaction.deferReply({ flags: 64 });
    const parts = interaction.customId.split("_");
    const action = parts[1];

    if (action === "channel") {
      const chId = interaction.fields.getTextInputValue("inp_boost_ch").trim();
      const ch = interaction.guild.channels.cache.get(chId);
      if (!ch) return interaction.editReply({ embeds: [createErrorEmbed("Invalid Channel", "Channel not found! Make sure you copy the correct Channel ID.")] });
      guildData(guildId).boost.channel = chId;
      saveDB();
    } else if (action === "embed") {
      if (!guildData(guildId).boost.embed) guildData(guildId).boost.embed = {};
      const title  = interaction.fields.getTextInputValue("inp_boost_title").trim();
      const desc   = interaction.fields.getTextInputValue("inp_boost_desc").trim();
      const color  = interaction.fields.getTextInputValue("inp_boost_color").trim();
      const footer = interaction.fields.getTextInputValue("inp_boost_footer").trim();
      if (title)  guildData(guildId).boost.embed.title       = title;
      if (desc)   guildData(guildId).boost.embed.description = desc;
      if (color)  guildData(guildId).boost.embed.color       = color;
      if (footer) guildData(guildId).boost.embed.footer      = footer;
      saveDB();
    }

    const newSessionId = `${interaction.user.id}_${Date.now()}`;
    const { container } = buildBoostConfigPanel(interaction.guild, guildId, newSessionId);
    await interaction.message?.edit({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    return interaction.editReply({ embeds: [createSuccessEmbed("Updated!", "Boost configuration has been saved.")] });
  }

  /* ================= EMBED MODAL SUBMISSIONS ================= */
  // ========== REACTION ROLE MODAL SUBMISSIONS ==========
  if (interaction.isModalSubmit() && interaction.customId.startsWith("rrmod_")) {
    const parts = interaction.customId.split("_");
    const action = parts[1];
    const sessionId = parts.slice(2).join("_");
    const session = rrSessions.get(sessionId);

    if (!session) return interaction.reply({ embeds: [createErrorEmbed("Session Expired", "Run `!rr create` again.")], flags: 64 });

    if (action === "settitle") {
      session.title = interaction.fields.getTextInputValue("rr_title_inp").trim();
      session.description = interaction.fields.getTextInputValue("rr_desc_inp").trim();
      const previewEmbed = buildRRPreview(session);
      const { row1, row2 } = buildRRButtons(sessionId, session);
      return interaction.update({ embeds: [previewEmbed], components: [row1, row2] });
    }

    if (action === "addrole") {
      const roleInput = interaction.fields.getTextInputValue("rr_roleid_inp").trim().replace(/[<@&>]/g, "");
      const label = interaction.fields.getTextInputValue("rr_label_inp").trim();
      const role = interaction.guild.roles.cache.get(roleInput);
      if (!role) return interaction.reply({ embeds: [createErrorEmbed("Invalid Role", "Could not find that role! Make sure you paste the Role ID.")], flags: 64 });
      if (session.roles.find(r => r.roleId === role.id)) return interaction.reply({ embeds: [createErrorEmbed("Duplicate", "That role is already in the panel!")], flags: 64 });

      session.roles.push({ roleId: role.id, label });
      const previewEmbed = buildRRPreview(session);
      const { row1, row2 } = buildRRButtons(sessionId, session);
      return interaction.update({ embeds: [previewEmbed], components: [row1, row2] });
    }
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith("embedmod_")) {
    const parts = interaction.customId.split("_");
    const action = parts[1];
    const sessionId = parts.slice(2).join("_");
    const embedData = embedEditorData.get(sessionId);

    if (!embedData) {
      return interaction.reply({ embeds: [createErrorEmbed("Session Expired", "This session expired. Run `!embed` again.")], flags: 64 });
    }

    await interaction.deferReply({ flags: 64 });

    try {
      if (action === "basic") {
        const title = interaction.fields.getTextInputValue("inp_title").trim();
        const description = interaction.fields.getTextInputValue("inp_description").trim();
        const colorInput = interaction.fields.getTextInputValue("inp_color").trim();
        embedData.title = title || null;
        embedData.description = description || null;
        if (colorInput) {
          const hex = colorInput.startsWith("#") ? colorInput.slice(1) : colorInput;
          const colorNum = parseInt(hex, 16);
          if (!isNaN(colorNum) && hex.length === 6) {
            embedData.color = colorNum;
          } else {
            return interaction.editReply({ embeds: [createErrorEmbed("Invalid Color", "Use hex like #FF0000")] });
          }
        }
      }

      if (action === "author") {
        const name = interaction.fields.getTextInputValue("inp_author_name").trim();
        const icon = interaction.fields.getTextInputValue("inp_author_icon").trim();
        const url = interaction.fields.getTextInputValue("inp_author_url").trim();
        if (name) {
          embedData.author = { name };
          if (icon) embedData.author.iconURL = icon;
          if (url) embedData.author.url = url;
        } else {
          embedData.author = null;
        }
      }

      if (action === "footer") {
        const text = interaction.fields.getTextInputValue("inp_footer_text").trim();
        const icon = interaction.fields.getTextInputValue("inp_footer_icon").trim();
        const ts = interaction.fields.getTextInputValue("inp_timestamp").trim().toLowerCase();
        if (text) {
          embedData.footer = { text };
          if (icon) embedData.footer.iconURL = icon;
        } else {
          embedData.footer = null;
        }
        embedData.timestamp = (ts === "yes" || ts === "y");
      }

      if (action === "images") {
        embedData.thumbnail = interaction.fields.getTextInputValue("inp_thumbnail").trim() || null;
        embedData.image = interaction.fields.getTextInputValue("inp_image").trim() || null;
      }

      if (action === "addfield") {
        const fieldName  = interaction.fields.getTextInputValue("inp_field_name").trim();
        const fieldValue = interaction.fields.getTextInputValue("inp_field_value").trim();
        const inlineRaw  = interaction.fields.getTextInputValue("inp_field_inline").trim().toLowerCase();
        const isInline   = inlineRaw === "yes" || inlineRaw === "y";
        const maxF = getMaxEmbedFields(interaction.user.id, interaction.guildId);
        if (!embedData.fields) embedData.fields = [];
        if (embedData.fields.length >= maxF) {
          return interaction.editReply({ embeds: [createErrorEmbed("Field Limit", `Max ${maxF} fields allowed. 💎 Upgrade to premium for more!`)] });
        }
        embedData.fields.push({ name: fieldName, value: fieldValue, inline: isInline });
      }

      if (action === "send") {
        const channelId = interaction.fields.getTextInputValue("inp_channel_id").trim();
        const targetChannel = channelId ? interaction.guild.channels.cache.get(channelId) : interaction.channel;
        if (!targetChannel) return interaction.editReply({ embeds: [createErrorEmbed("Invalid Channel", "Channel not found!")] });
        const botPerms = targetChannel.permissionsFor(interaction.guild.members.me);
        if (!botPerms?.has(PermissionsBitField.Flags.SendMessages)) {
          return interaction.editReply({ embeds: [createErrorEmbed("No Permission", `I can't send messages in ${targetChannel}!`)] });
        }
        await targetChannel.send({ embeds: [buildEmbedFromData(embedData)] });
        return interaction.editReply({ embeds: [createSuccessEmbed("Sent! ✅", `Embed sent to ${targetChannel}!`)] });
      }

      // Update stored data and refresh preview
      embedEditorData.set(sessionId, embedData);
      const maxF2 = getMaxEmbedFields(interaction.user.id, interaction.guildId);
      const curF2 = embedData.fields?.length || 0;
      try {
        const r1 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`embedbtn_basic_${sessionId}`).setLabel("✏️ Title / Description / Color").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`embedbtn_author_${sessionId}`).setLabel("👤 Author").setStyle(ButtonStyle.Secondary)
        );
        const r2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`embedbtn_footer_${sessionId}`).setLabel("📋 Footer & Timestamp").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId(`embedbtn_images_${sessionId}`).setLabel("🖼️ Images").setStyle(ButtonStyle.Secondary)
        );
        const r3 = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`embedbtn_addfield_${sessionId}`).setLabel(`➕ Add Field (${curF2}/${maxF2})`).setStyle(ButtonStyle.Secondary).setDisabled(curF2 >= maxF2),
          new ButtonBuilder().setCustomId(`embedbtn_removefield_${sessionId}`).setLabel("➖ Remove Last Field").setStyle(ButtonStyle.Danger).setDisabled(curF2 === 0)
        );
        if (embedData.targetMessageId) {
          const r4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`embedbtn_save_${sessionId}`).setLabel("💾 Save to Original").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`embedbtn_send_${sessionId}`).setLabel("✅ Send Copy").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setLabel("📖 Support Server").setStyle(ButtonStyle.Link).setURL("https://discord.gg/yourinvite")
          );
          await interaction.message?.edit({ embeds: [buildEmbedFromData(embedData)], components: [r1, r2, r3, r4] });
        } else {
          const r4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`embedbtn_send_${sessionId}`).setLabel("✅ Send to Channel").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setLabel("📖 Support Server").setStyle(ButtonStyle.Link).setURL("https://discord.gg/yourinvite")
          );
          await interaction.message?.edit({ embeds: [buildEmbedFromData(embedData)], components: [r1, r2, r3, r4] });
        }
      } catch (e) {}

      const labels = { basic: "Basic Info", author: "Author", footer: "Footer", images: "Images", addfield: "Field Added" };
      return interaction.editReply({ embeds: [createSuccessEmbed("Updated! ✅", `${labels[action] || action} updated! Preview refreshed above.`)] });

    } catch (err) {
      console.error("Embed modal error:", err);
      try { await interaction.editReply({ embeds: [createErrorEmbed("Error", err.message || "Something went wrong!")] }); } catch (e) {}
    }
  }

  /* ================= SELECT MENU INTERACTIONS ================= */
  if (interaction.isStringSelectMenu()) {

    // ========== REACTION ROLE REMOVE ROLE ==========
    if (interaction.customId.startsWith("rr_doremove_")) {
      const sessionId = interaction.customId.replace("rr_doremove_", "");
      const session = rrSessions.get(sessionId);
      if (!session) return interaction.reply({ embeds: [createErrorEmbed("Session Expired", "Run `!rr create` again.")], flags: 64 });

      const roleId = interaction.values[0];
      session.roles = session.roles.filter(r => r.roleId !== roleId);

      const previewEmbed = buildRRPreview(session);
      const { row1, row2 } = buildRRButtons(sessionId, session);
      return interaction.update({ embeds: [previewEmbed], components: [row1, row2] });
    }

    // ========== FEATURE TOGGLE SELECT ==========
    if (interaction.customId === "toggle_panel_select") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }

      const selected = interaction.values[0];
      const currentlyEnabled = isSystemEnabled(interaction.guildId, selected);
      toggleSystem(selected, !currentlyEnabled, interaction.guildId);

      await interaction.deferUpdate().catch(() => {});
      const { container } = buildTogglePanel(interaction.guildId);
      return interaction.editReply({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
    }

    // ========== GLOBAL TOGGLE PANEL SELECT ==========
    if (interaction.customId === "global_toggle_panel_select") {
      if (!config.ownerIds?.includes(interaction.user.id)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Bot owner only!")], flags: 64 });
      }

      const selected = interaction.values[0];
      const currentlyEnabled = isSystemEnabledGlobal(selected);
      toggleSystemGlobal(selected, !currentlyEnabled);

      const { container } = buildGlobalTogglePanel();
      return interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }

    // ========== ANTINUKE EVENTS SELECT ==========
    if (interaction.customId === "antinuke_event_select") {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      // Toggle: if all selected events are currently enabled, disable them; otherwise enable them
      const selected = interaction.values;
      const allEnabled = selected.every(id => guildData(guildId).antinuke.events[id] !== false);
      selected.forEach(id => { guildData(guildId).antinuke.events[id] = !allEnabled; });
      saveDB();
      const payload = buildAntiNukeEventsMessage(interaction.guildId);
      return interaction.update({ content: payload.content, components: payload.components });
    }

    // ========== BOOST CONFIG SELECT ==========
    if (interaction.customId.startsWith("bstcfg_select_")) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      const selected = interaction.values[0];
      const parts = selected.split("_");
      const action = parts[1];
      const sessionId = parts.slice(2).join("_");

      if (action === "toggle") {
        guildData(guildId).boost.enabled = !guildData(guildId).boost.enabled;
        saveDB();
        const newSessionId = `${interaction.user.id}_${Date.now()}`;
        const { container } = buildBoostConfigPanel(interaction.guild, guildId, newSessionId);
        return interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      if (action === "channel") {
        const modal = new ModalBuilder().setCustomId(`bstmod_channel_${sessionId}`).setTitle("Set Boost Channel");
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("inp_boost_ch").setLabel("Channel ID for boost messages").setStyle(TextInputStyle.Short).setPlaceholder("e.g. 123456789012345678").setValue(guildData(guildId).boost.channel || "").setRequired(true).setMaxLength(20)
        ));
        return interaction.showModal(modal);
      }

      if (action === "embed") {
        const e = guildData(guildId).boost.embed || {};
        const modal = new ModalBuilder().setCustomId(`bstmod_embed_${sessionId}`).setTitle("Customize Boost Embed");
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_boost_title").setLabel("Embed Title (use {count} for boost count)").setStyle(TextInputStyle.Short).setValue(e.title || "").setRequired(false).setMaxLength(256)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_boost_desc").setLabel("Message ({user}, {username}, {count})").setStyle(TextInputStyle.Paragraph).setValue(e.description || "").setRequired(false).setMaxLength(2000)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_boost_color").setLabel("Embed Color (hex, e.g. #FF73FA)").setStyle(TextInputStyle.Short).setValue(e.color || "").setRequired(false).setMaxLength(7)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_boost_footer").setLabel("Footer Text").setStyle(TextInputStyle.Short).setValue(e.footer || "").setRequired(false).setMaxLength(256))
        );
        return interaction.showModal(modal);
      }

      if (action === "test") {
        await interaction.deferReply({ flags: 64 });
        if (!guildData(guildId).boost.channel) return interaction.editReply({ embeds: [createErrorEmbed("Not Configured", "Please set a boost channel first!")] });
        const ch = interaction.guild.channels.cache.get(guildData(guildId).boost.channel);
        if (!ch) return interaction.editReply({ embeds: [createErrorEmbed("Channel Not Found", "The configured boost channel could not be found!")] });
        const boostCount = interaction.guild.premiumSubscriptionCount || 0;
        const e = guildData(guildId).boost.embed || {};
        const testEmbed = createEmbed({
          title: e.title ? e.title.replace(/{count}/g, boostCount) : `${EMOJIS.boost} ${bold("Server Boosted!")}`,
          description: e.description
            ? e.description.replace(/{user}/g, interaction.user).replace(/{username}/g, interaction.user.username).replace(/{count}/g, boostCount)
            : `${EMOJIS.party} ${interaction.user} just boosted the server!\n\nWe now have ${bold(boostCount.toString())} boost(s)! ${EMOJIS.heart}`,
          color: e.color ? parseInt(e.color.replace('#', ''), 16) : 0xFF73FA,
          thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
          footer: e.footer || null
        });
        await ch.send({ embeds: [testEmbed] });
        return interaction.editReply({ embeds: [createSuccessEmbed("Test Sent!", `Test boost message sent to ${ch}`)] });
      }
    }

    // ========== TICKET CONFIG SELECT ==========
    if (interaction.customId.startsWith("tkcfg_select_")) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      const selected = interaction.values[0];
      const parts = selected.split("_");
      const action = parts[1];
      const sessionId = parts.slice(2).join("_");

      if (action === "staffrole") {
        const modal = new ModalBuilder().setCustomId(`tkmod_staffrole_${sessionId}`).setTitle("Set Staff Role");
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("inp_role_id").setLabel("Role ID (right-click role → Copy ID)").setStyle(TextInputStyle.Short).setPlaceholder("e.g. 123456789012345678").setRequired(true).setMaxLength(20)
        ));
        return interaction.showModal(modal);
      }

      if (action === "panchannel") {
        const modal = new ModalBuilder().setCustomId(`tkmod_panchannel_${sessionId}`).setTitle("Set Panel Channel");
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("inp_panel_id").setLabel("Channel ID where panel will be sent").setStyle(TextInputStyle.Short).setPlaceholder("e.g. 123456789012345678").setRequired(true).setMaxLength(20)
        ));
        return interaction.showModal(modal);
      }

      if (action === "category") {
        const modal = new ModalBuilder().setCustomId(`tkmod_category_${sessionId}`).setTitle("Set Ticket Category");
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("inp_category_id").setLabel("Category ID (right-click category → Copy ID)").setStyle(TextInputStyle.Short).setPlaceholder("e.g. 123456789012345678").setRequired(true).setMaxLength(20)
        ));
        return interaction.showModal(modal);
      }

      if (action === "transcript") {
        const modal = new ModalBuilder().setCustomId(`tkmod_transcript_${sessionId}`).setTitle("Set Transcript Channel");
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("inp_transcript_id").setLabel("Channel ID for transcripts").setStyle(TextInputStyle.Short).setPlaceholder("e.g. 123456789012345678").setRequired(true).setMaxLength(20)
        ));
        return interaction.showModal(modal);
      }

      if (action === "logchannel") {
        const modal = new ModalBuilder().setCustomId(`tkmod_logchannel_${sessionId}`).setTitle("Set Log Channel");
        modal.addComponents(new ActionRowBuilder().addComponents(
          new TextInputBuilder().setCustomId("inp_log_id").setLabel("Channel ID for ticket logs").setStyle(TextInputStyle.Short).setPlaceholder("e.g. 123456789012345678").setRequired(true).setMaxLength(20)
        ));
        return interaction.showModal(modal);
      }

      if (action === "custpanel") {
        const e = guildData(guildId).ticket.embed || {};
        const modal = new ModalBuilder().setCustomId(`tkmod_custpanel_${sessionId}`).setTitle("Customize Ticket Panel Embed");
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_embed_title").setLabel("Panel Title").setStyle(TextInputStyle.Short).setValue(e.title || "").setRequired(false).setMaxLength(256)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_embed_desc").setLabel("Panel Description").setStyle(TextInputStyle.Paragraph).setValue(e.description || "").setRequired(false).setMaxLength(2000)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_embed_color").setLabel("Embed Color (hex, e.g. #5865F2)").setStyle(TextInputStyle.Short).setValue(e.color || "").setRequired(false).setMaxLength(7)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_embed_footer").setLabel("Embed Footer Text").setStyle(TextInputStyle.Short).setValue(e.footer || "").setRequired(false).setMaxLength(256))
        );
        return interaction.showModal(modal);
      }

      if (action === "advanced") {
        const modal = new ModalBuilder().setCustomId(`tkmod_advanced_${sessionId}`).setTitle("Advanced Ticket Settings");
        modal.addComponents(
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_max_tickets").setLabel(`Max Tickets Per User (1–${isPremiumUser(interaction.user.id) || isPremiumGuild(guildId) ? 25 : 5})`).setStyle(TextInputStyle.Short).setValue(String(guildData(guildId).ticket.maxTickets ?? 1)).setRequired(true).setMaxLength(2)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_auto_close").setLabel("Auto-Close? (yes / no)").setStyle(TextInputStyle.Short).setValue(guildData(guildId).ticket.autoClose ? "yes" : "no").setRequired(true).setMaxLength(3)),
          new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inp_dm_close").setLabel("DM on Close? (yes / no)").setStyle(TextInputStyle.Short).setValue(guildData(guildId).ticket.dmOnClose !== false ? "yes" : "no").setRequired(true).setMaxLength(3))
        );
        return interaction.showModal(modal);
      }

      if (action === "deploy") {
        await interaction.deferReply({ flags: 64 });
        if (!guildData(guildId).ticket.channel) return interaction.editReply({ embeds: [createErrorEmbed("Not Configured", "Please set a Panel Channel first!")] });
        const ch = interaction.guild.channels.cache.get(guildData(guildId).ticket.channel);
        if (!ch) return interaction.editReply({ embeds: [createErrorEmbed("Channel Not Found", "The configured panel channel could not be found!")] });
        const e = guildData(guildId).ticket.embed || {};
        const panelEmbed = createEmbed({
          title: e.title || `${EMOJIS.ticket} ${bold("Support Tickets")}`,
          description: e.description || `${EMOJIS.info} Click the button below to open a support ticket.\n\nOur support team will assist you as soon as possible.`,
          color: e.color ? parseInt(e.color.replace('#', ''), 16) : BOT_COLOR,
          footer: e.footer || "Support Ticket System"
        });
        if (e.image) panelEmbed.setImage(e.image);
        const btn = new ButtonBuilder().setCustomId("create_ticket").setLabel("Create Ticket").setEmoji("🎫").setStyle(ButtonStyle.Primary);
        await ch.send({ embeds: [panelEmbed], components: [new ActionRowBuilder().addComponents(btn)] });
        const newSessionId = `${interaction.user.id}_${Date.now()}`;
        const { container: tkDeploy } = buildTicketConfigPanel(interaction.guild, guildId, newSessionId);
        await interaction.message?.edit({ components: [tkDeploy], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
        return interaction.editReply({ embeds: [createSuccessEmbed("Panel Deployed!", `Ticket panel has been sent to ${ch}`)] });
      }
    }

    // ========== WELCOME CONFIG SELECT ==========
    if (interaction.customId.startsWith("wlcfg_select_")) {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")], flags: 64 });
      }
      const selected = interaction.values[0];
      const parts = selected.split("_");
      const action = parts[1];
      const sessionId = parts.slice(2).join("_");

      // Toggle enable/disable
      if (action === "toggle") {
        guildData(guildId).welcome.enabled = !guildData(guildId).welcome.enabled;
        saveDB();
        const newSessionId = `${interaction.user.id}_${Date.now()}`;
        const { container } = buildWelcomeConfigPanel(interaction.guild, interaction.guildId, newSessionId);
        return interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      // Toggle embed style
      if (action === "embed") {
        guildData(guildId).welcome.embedEnabled = guildData(guildId).welcome.embedEnabled === false ? true : false;
        saveDB();
        const newSessionId = `${interaction.user.id}_${Date.now()}`;
        const { container } = buildWelcomeConfigPanel(interaction.guild, interaction.guildId, newSessionId);
        return interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      // Toggle DM on join
      if (action === "dm") {
        guildData(guildId).welcome.dmEnabled = !guildData(guildId).welcome.dmEnabled;
        saveDB();
        const newSessionId = `${interaction.user.id}_${Date.now()}`;
        const { container } = buildWelcomeConfigPanel(interaction.guild, interaction.guildId, newSessionId);
        return interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
      }

      // Set Channel via modal
      if (action === "channel") {
        const modal = new ModalBuilder().setCustomId(`wlmod_channel_${sessionId}`).setTitle("Set Welcome Channel");
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("inp_wl_channel").setLabel("Channel ID").setStyle(TextInputStyle.Short).setPlaceholder("e.g. 123456789012345678").setValue(guildData(guildId).welcome.channel || "").setRequired(true).setMaxLength(20)
          )
        );
        return interaction.showModal(modal);
      }

      // Set Message via modal
      if (action === "message") {
        const modal = new ModalBuilder().setCustomId(`wlmod_message_${sessionId}`).setTitle("Set Welcome Message");
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("inp_wl_message").setLabel("Welcome Message").setStyle(TextInputStyle.Paragraph).setPlaceholder("{user}, {username}, {server}, {membercount}").setValue(guildData(guildId).welcome.message || "").setRequired(true).setMaxLength(1000)
          )
        );
        return interaction.showModal(modal);
      }

      // Set DM Message via modal
      if (action === "dmmsg") {
        const modal = new ModalBuilder().setCustomId(`wlmod_dmmsg_${sessionId}`).setTitle("Set Welcome DM Message");
        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("inp_wl_dmmsg").setLabel("DM Message").setStyle(TextInputStyle.Paragraph).setPlaceholder("{user}, {username}, {server}, {membercount}").setValue(guildData(guildId).welcome.dmMessage || "").setRequired(false).setMaxLength(1000)
          )
        );
        return interaction.showModal(modal);
      }

      // Test welcome message
      if (action === "test") {
        await interaction.deferReply({ flags: 64 });
        if (!guildData(guildId).welcome.channel) return interaction.editReply({ embeds: [createErrorEmbed("Not Configured", "Please set a welcome channel first!")] });
        const ch = interaction.guild.channels.cache.get(guildData(guildId).welcome.channel);
        if (!ch) return interaction.editReply({ embeds: [createErrorEmbed("Channel Not Found", "The configured welcome channel could not be found!")] });
        const testMsg = (guildData(guildId).welcome.message || "Welcome {user} to {server}!")
          .replace(/{user}/g, interaction.user)
          .replace(/{username}/g, interaction.user.username)
          .replace(/{server}/g, interaction.guild.name)
          .replace(/{membercount}/g, interaction.guild.memberCount);
        const testEmbed = createEmbed({
          title: `${EMOJIS.welcome} ${bold("Welcome!")}`,
          description: testMsg,
          thumbnail: interaction.user.displayAvatarURL({ dynamic: true }),
          color: 0x00FF00
        });
        await ch.send({ embeds: [testEmbed] });
        return interaction.editReply({ embeds: [createSuccessEmbed("Test Sent!", `Test welcome message sent to ${ch}`)] });
      }
    }

    // ========== HELP CATEGORY SELECT ==========
    if (interaction.customId === "help_category") {
      try {
        const catKey = interaction.values[0];
        const sessionKey = `${interaction.user.id}_${catKey}_${Date.now()}`;
        helpSessions.set(sessionKey, { category: catKey, page: 0 });

        const result = buildCategoryPage(catKey, 0, interaction.user.tag, interaction.guildId);
        if (!result) return interaction.reply({ embeds: [createErrorEmbed("Error", "Category not found!")], flags: 64 });

        const btnRow = buildHelpPageButtons(sessionKey, result.page, result.totalPages, catKey);
        result.container.addActionRowComponents(btnRow);
        result.container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
        result.container.addTextDisplayComponents(text =>
          text.setContent(`-# Requested by ${interaction.user.tag} | Page ${result.page + 1} / ${result.totalPages}`)
        );
        return interaction.update({ components: [result.container], flags: MessageFlags.IsComponentsV2 });
      } catch (error) {
        console.error("Help category error:", error);
        return interaction.reply({ embeds: [createErrorEmbed("Error", "Failed to load category!")], flags: 64 });
      }
    }

    // ========== DROPDOWN ROLES ==========
    if (interaction.customId.startsWith("dropdownrole_")) {
      const roleId = interaction.values[0];
      const role = interaction.guild.roles.cache.get(roleId);
      
      if (!role) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("Error", "Role not found!")], 
          flags: 64 
        });
      }
      
      const member = interaction.member;
      if (member.roles.cache.has(roleId)) {
        await member.roles.remove(role);
        return interaction.reply({ 
          embeds: [createSuccessEmbed("Role Removed", `${EMOJIS.error} Removed ${role}`)], 
          flags: 64 
        });
      } else {
        await member.roles.add(role);
        return interaction.reply({ 
          embeds: [createSuccessEmbed("Role Added", `${EMOJIS.success} Added ${role}`)], 
          flags: 64 
        });
      }
    }
  }

  /* ================= SLASH COMMAND INTERACTIONS ================= */
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;
    const PREFIX = getPrefix(interaction.guildId);

    // Check if command is disabled
    if (isCommandDisabled(interaction.guildId, commandName)) {
      return interaction.reply({ 
        embeds: [createErrorEmbed("Command Disabled", "This command has been disabled by an administrator.")], 
        flags: 64 
      });
    }

    // ========== HELP ==========
    if (commandName === "help") {
      const query = interaction.options.getString("command")?.toLowerCase();
      if (query) {
        const catKey = ALL_COMMANDS[query] ? query : CMD_HELP_MAP[query] || null;
        if (catKey && ALL_COMMANDS[catKey]) {
          const sessionKey = `${interaction.user.id}_${catKey}_${Date.now()}`;
          helpSessions.set(sessionKey, { category: catKey, page: 0 });
          const result = buildCategoryPage(catKey, 0, interaction.user.tag, interaction.guildId);
          if (!result) return interaction.reply({ embeds: [createErrorEmbed("Not Found", `No module named \`${query}\`.`)], flags: 64 });
          const btnRow = buildHelpPageButtons(sessionKey, result.page, result.totalPages, catKey);
          result.container.addActionRowComponents(btnRow);
          result.container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
          result.container.addTextDisplayComponents(text =>
            text.setContent(`-# Requested by ${interaction.user.tag} | Page ${result.page + 1} / ${result.totalPages}`)
          );
          return interaction.reply({ components: [result.container], flags: MessageFlags.IsComponentsV2 });
        }
        const embed = getCommandHelpEmbed(query, interaction.guildId);
        return interaction.reply({ embeds: [embed], flags: 64 });
      }
      const helpContainer = buildMainHelpContainer(interaction.guildId);
      return interaction.reply({ components: [helpContainer], flags: MessageFlags.IsComponentsV2 });
    }

    // ========== PING ==========
    if (commandName === "ping") {
      const latency = Date.now() - interaction.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);
      
      const embed = createEmbed({
        title: `${EMOJIS.ping} ${bold("Pong!")}`,
        fields: [
          { name: `${EMOJIS.messages} ${bold("Message Latency")}`, value: `\`${latency}ms\``, inline: true },
          { name: `${EMOJIS.chart} ${bold("API Latency")}`, value: `\`${apiLatency}ms\``, inline: true }
        ]
      });
      
      return interaction.reply({ embeds: [embed] });
    }

    // ========== PREFIX ==========
    if (commandName === "prefix") {
      const newPrefix = interaction.options.getString("new_prefix");
      
      if (!newPrefix) {
        const embed = createEmbed({
          title: `${EMOJIS.settings} ${bold("Prefix Information")}`,
          description: 
            `${EMOJIS.success} ${bold("Current Prefix:")} \`${PREFIX}\`\n` +
            `${EMOJIS.info} ${bold("Default Prefix:")} \`${DEFAULT_PREFIX}\`\n` +
            `${EMOJIS.confession} ${bold("Confession Prefix:")} \`${CONFESSION_PREFIX}\`\n\n` +
            `You can also mention me as a prefix!\nExample: ${client.user} help`
        });
        return interaction.reply({ embeds: [embed] });
      }
      
      if (!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("No Permission", "Only administrators can change the prefix!")], 
          flags: 64 
        });
      }
      
      if (newPrefix.length > 10) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("Invalid Prefix", "Prefix cannot be longer than 10 characters!")], 
          flags: 64 
        });
      }
      
      const oldPrefix = PREFIX;
      setPrefix(interaction.guildId, newPrefix);
      
      const embed = createEmbed({
        title: `${EMOJIS.settings} ${bold("Prefix Changed")}`,
        fields: [
          { name: `${EMOJIS.error} ${bold("Old Prefix")}`, value: `\`${oldPrefix}\``, inline: true },
          { name: `${EMOJIS.success} ${bold("New Prefix")}`, value: `\`${newPrefix}\``, inline: true }
        ],
        description: `\nUse \`${newPrefix}help\` to see commands!`
      });
      
      return interaction.reply({ embeds: [embed] });
    }

    // ========== AVATAR ==========
    if (commandName === "avatar") {
      const user = interaction.options.getUser("user") || interaction.user;
      const avatarURL = user.displayAvatarURL({ dynamic: true, size: 4096 });

      const embed = createEmbed({
        title: `${EMOJIS.image} ${bold(`${user.username}'s Avatar`)}`,
        image: avatarURL,
        footer: `Requested by ${interaction.user.username}`
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Download Avatar")
          .setStyle(ButtonStyle.Link)
          .setURL(avatarURL)
      );

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    // ========== USERINFO ==========
    if (commandName === "userinfo") {
      const user = interaction.options.getUser("user") || interaction.user;
      const member = await interaction.guild.members.fetch(user.id).catch(() => null);
      
      const embed = createEmbed({
        title: `${EMOJIS.confession} ${bold(user.tag)}`,
        thumbnail: user.displayAvatarURL({ dynamic: true, size: 256 }),
        color: member?.displayColor || BOT_COLOR,
        fields: [
          { name: `🆔 ${bold("User ID")}`, value: user.id, inline: true },
          { name: `🤖 ${bold("Bot")}`, value: user.bot ? `${EMOJI_ENABLE} Yes` : `${EMOJI_DISABLE} No`, inline: true },
          { name: `${EMOJIS.calendar} ${bold("Created")}`, value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
        ]
      });
      
      if (member) {
        embed.addFields(
          { name: `📥 ${bold("Joined")}`, value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
          { name: `🎭 ${bold("Nickname")}`, value: member.nickname || "None", inline: true },
          { name: `🎨 ${bold("Roles")}`, value: member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => r).slice(0, 10).join(", ") || "None", inline: false }
        );
        if (member.premiumSince) {
          embed.addFields({ name: `${EMOJIS.boost} ${bold("Boosting")}`, value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`, inline: true });
        }
      }
      
      return interaction.reply({ embeds: [embed] });
    }

    // ========== SERVERINFO ==========
    if (commandName === "serverinfo") {
      const guild = interaction.guild;
      const owner = await guild.fetchOwner();
      
      const embed = createEmbed({
        title: `🏠 ${bold(guild.name)}`,
        thumbnail: guild.iconURL({ dynamic: true, size: 256 }),
        fields: [
          { name: `🆔 ${bold("Server ID")}`, value: guild.id, inline: true },
          { name: `${EMOJIS.crown} ${bold("Owner")}`, value: `${owner.user.tag}`, inline: true },
          { name: `${EMOJIS.calendar} ${bold("Created")}`, value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
          { name: `👥 ${bold("Members")}`, value: `${guild.memberCount}`, inline: true },
          { name: `💬 ${bold("Channels")}`, value: `${guild.channels.cache.size}`, inline: true },
          { name: `🎭 ${bold("Roles")}`, value: `${guild.roles.cache.size}`, inline: true },
          { name: `😀 ${bold("Emojis")}`, value: `${guild.emojis.cache.size}`, inline: true },
          { name: `${EMOJIS.boost} ${bold("Boost Level")}`, value: `Level ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true }
        ]
      });
      
      if (guild.bannerURL()) embed.setImage(guild.bannerURL({ size: 1024 }));
      
      return interaction.reply({ embeds: [embed] });
    }

    // ========== GIVEAWAY ==========
    if (commandName === "giveaway") {
      if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return interaction.reply({ 
          embeds: [createErrorEmbed("No Permission", "You need Manage Server permission!")], 
          flags: 64 
        });
      }
      
      const sub = interaction.options.getSubcommand();
      
      if (sub === "create") {
        const duration = interaction.options.getString("duration");
        const winners = interaction.options.getInteger("winners");
        const prize = interaction.options.getString("prize");
        const donor = interaction.options.getUser("donor");
        
        const giveawayId = await createGiveaway(
          { channel: interaction.channel, author: interaction.user, guild: interaction.guild }, 
          duration, prize, winners, donor
        );
        
        if (giveawayId) {
          const embed = createSuccessEmbed("Giveaway Created!", 
            `${EMOJIS.gift} ${bold("Prize:")} ${prize}\n` +
            `${EMOJIS.trophy} ${bold("Winners:")} ${winners}\n` +
            `${EMOJIS.clock} ${bold("Duration:")} ${duration}`,
            [{ name: `🆔 ${bold("Giveaway ID")}`, value: `\`${giveawayId}\``, inline: true }]
          );
          return interaction.reply({ embeds: [embed], flags: 64 });
        } else {
          return interaction.reply({ 
            embeds: [createErrorEmbed("Error", "Invalid duration format! Use: 1s, 1m, 1h, 1d")], 
            flags: 64 
          });
        }
      }
      
      if (sub === "end") {
        const id = interaction.options.getString("id");
        const giveaway = giveaways.get(id) || guildData(guildId).giveaways?.[id];
        if (!giveaway) {
          return interaction.reply({ embeds: [createErrorEmbed("Error", "Giveaway not found!")], flags: 64 });
        }
        if (giveaway.ended) {
          return interaction.reply({ embeds: [createErrorEmbed("Error", "Giveaway already ended!")], flags: 64 });
        }
        await endGiveaway(id);
        return interaction.reply({ embeds: [createSuccessEmbed("Success", "Giveaway ended!")], flags: 64 });
      }
      
      if (sub === "reroll") {
        const id = interaction.options.getString("id");
        const result = await rerollGiveaway(id, 1);
        if (!result.success) {
          return interaction.reply({ embeds: [createErrorEmbed("Error", result.error)], flags: 64 });
        }
        return interaction.reply({ 
          embeds: [createSuccessEmbed("Rerolled!", `New winner: <@${result.winners[0]}>`)], 
          flags: 64 
        });
      }
      
      if (sub === "cancel") {
        const id = interaction.options.getString("id");
        const result = await cancelGiveaway(id);
        if (!result.success) {
          return interaction.reply({ embeds: [createErrorEmbed("Error", result.error)], flags: 64 });
        }
        return interaction.reply({ embeds: [createSuccessEmbed("Cancelled", "Giveaway cancelled!")], flags: 64 });
      }
      
      if (sub === "list") {
        const activeGiveaways = Object.values(guildData(guildId).giveaways).filter(g => !g.ended && g.guildId === interaction.guildId);
        if (activeGiveaways.length === 0) {
          return interaction.reply({ 
            embeds: [createInfoEmbed("No Giveaways", "There are no active giveaways!")], 
            flags: 64 
          });
        }
        
        const embed = createEmbed({
          title: `${EMOJIS.giveaway} ${bold("Active Giveaways")}`,
          description: activeGiveaways.map(g => 
            `${EMOJIS.gift} \`${g.id}\`\n` +
            `↳ ${bold("Prize:")} ${g.prize}\n` +
            `↳ ${bold("Ends:")} <t:${Math.floor(g.endTime / 1000)}:R>\n` +
            `↳ ${bold("Entries:")} ${g.participants.length}`
          ).join("\n\n")
        });
        
        return interaction.reply({ embeds: [embed], flags: 64 });
      }
    }
  }
  } // closes if (interaction.isChatInputCommand())
});

/* ================= MESSAGE CREATE EVENT ================= */
client.on("messageCreate", async msg => {
  if (!msg.guild || msg.author.bot) return;

  const content = msg.content;
  const lower = content.toLowerCase();
  const guildId = msg.guild.id;
  
  const PREFIX = getPrefix(guildId);
  
  const botMention = `<@${client.user.id}>`;
  const botMentionNick = `<@!${client.user.id}>`;
  
  let cmd = null;
  let args = [];
  let usedPrefix = null;
  
  if (content.startsWith(PREFIX)) {
    usedPrefix = PREFIX;
    const parts = content.slice(PREFIX.length).trim().split(/\s+/);
    cmd = parts.shift()?.toLowerCase() || null;
    args = parts;
  } else if (content.startsWith(botMention)) {
    usedPrefix = botMention;
    const parts = content.slice(botMention.length).trim().split(/\s+/);
    cmd = parts.shift()?.toLowerCase() || null;
    args = parts;
  } else if (content.startsWith(botMentionNick)) {
    usedPrefix = botMentionNick;
    const parts = content.slice(botMentionNick.length).trim().split(/\s+/);
    cmd = parts.shift()?.toLowerCase() || null;
    args = parts;
  } else if (guildData(guildId).noPrefixUsers?.includes(msg.author.id)) {
    // No-prefix mode: only trigger on FULL command names, not short aliases
    // Short forms (ab, an, ar, al, am, ae, es, fp, etc.) are excluded to avoid
    // accidentally treating normal conversation as commands
    const NO_PREFIX_FULL_COMMANDS = new Set([
      "help","ping","latency","prefix","setprefix","invite","botinvite","botinfo","info","stats","about",
      "ban","kick","mute","unmute","warn","warnings","infractions","delwarns","purge","clear","lock","unlock",
      "slowmode","timeout","untimeout","nick","setnick","move","vcmute","vcunmute","deafen","undeafen",
      "welcome","goodbye","boost","joindm","antinuke","antibot","antilink","automod","antispam",
      "afk","remind","reminder","reminders","birthday","bday","confession","confess",
      "autoreact","autorespond","autoresponder","sticky","embed","ticket","tickets",
      "economy","balance","daily","deposit","withdraw","slots","coinflip",
      "giveaway","gstart","gend","greroll","gall","run",
      "logs","logging","dashboard","dash","panel","enable","disable","system","command","commands",
      "tempvoice","mediaonly","media","filterimmune","immune","alimmune",
      "buttonroles","reactionroles","dropdownroles","connectionroles","customroles",
      "snipe","editsnipe","modlog","audit","listinvites","invites","smile","fban","fkick","fmute",
      "noprefix","npx","premium","prem","owner","suggest","counting","count",
      "hug","kiss","slap","bite","punch","kick","pat","headpat","cuddle","bonk","boop","feed","lick",
      "poke","wink","blush","laugh","cry","dance","wave","yeet","holdhands","kill","die",
      "coinflip","coin","fact","joke","ask","decide","match","bigemoji","listemojis","liststickers",
      "8ball","rps","trivia","would","truth","dare","roast","compliment",
      "avatar","userinfo","serverinfo","guild","roleinfo","channelinfo",
      "poll","vote","botset","setname","setavatar","setbanner","botsetreset",
      "reactionrole","rr","reactrole"
    ]);
    const firstWord = content.trim().split(/\s+/)[0]?.toLowerCase();
    if (firstWord && NO_PREFIX_FULL_COMMANDS.has(firstWord)) {
      usedPrefix = "";
      const parts = content.trim().split(/\s+/);
      cmd = parts.shift()?.toLowerCase() || null;
      args = parts;
    }
  }
  
  // Bot mention with no command
  if ((content === botMention || content === botMentionNick) && !cmd) {
    const embed = createEmbed({
      title: `${EMOJIS.welcome} ${bold("Hello!")}`,
      description: 
        `${EMOJIS.success} ${bold("Prefix:")} \`${PREFIX}\`\n` +
        `${EMOJIS.info} ${bold("Mention:")} ${client.user}\n\n` +
        `Use \`${PREFIX}help\` to see all commands!`,
      thumbnail: client.user.displayAvatarURL({ dynamic: true })
    });
    return msg.reply({ embeds: [embed] });
  }

  /* ================= STICKY MESSAGES ================= */
  if (guildData(guildId).stickySystem?.enabled !== false && guildData(guildId).stickyMessages[msg.channel.id]?.enabled) {
    await updateStickyMessage(msg.channel);
  }

  /* ================= MESSAGE COUNT ================= */
  if (!guildData(guildId).messageCount[guildId]) guildData(guildId).messageCount[guildId] = {};
  if (!guildData(guildId).messageCount[guildId][msg.author.id]) guildData(guildId).messageCount[guildId][msg.author.id] = 0;
  guildData(guildId).messageCount[guildId][msg.author.id]++;

  /* ================= AUTO DELETE TEXT ONLY ================= */
  if (guildData(guildId).autoDeleteTextOnly[msg.channel.id] !== undefined) {
    const isCommand = content.startsWith(PREFIX);
    const hasAttachment = msg.attachments.size > 0;
    if (!isCommand && !hasAttachment) {
      const delay = guildData(guildId).autoDeleteTextOnly[msg.channel.id];
      if (typeof delay === "number" && delay > 0) {
        setTimeout(() => safeDelete(msg), delay);
      }
    }
  }

  /* ================= MEDIA ONLY CHANNELS ================= */
  if (guildData(guildId).media?.enabled && guildData(guildId).media?.onlyChannels?.includes(msg.channel.id) || guildData(guildId).mediaOnlyChannels?.includes(msg.channel.id)) {
    if (msg.attachments.size === 0 && !msg.content.match(/(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|mp4|webm|mov))/i)) {
      await msg.delete().catch(() => {});
      const warn = await msg.channel.send({ 
        embeds: [createWarningEmbed("Media Only", `${msg.author}, this channel is for media only!`)] 
      });
      setTimeout(() => warn.delete().catch(() => {}), 5000);
      return;
    }
  }

  /* ================= AUTOMOD - ANTI SPAM ================= */
  if (guildData(guildId).automod?.enabled && guildData(guildId).automod?.antiSpam?.enabled && !msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const key = `${guildId}-${msg.author.id}`;
    const now = Date.now();
    
    if (!spamTracker.has(key)) spamTracker.set(key, []);
    
    const messages = spamTracker.get(key);
    messages.push(now);
    
    const interval = guildData(guildId).automod.antiSpam.interval || 5000;
    const recentMessages = messages.filter(time => now - time < interval);
    spamTracker.set(key, recentMessages);
    
    if (recentMessages.length >= (guildData(guildId).automod.antiSpam.maxMessages || 5)) {
      const action = guildData(guildId).automod.antiSpam.action || "mute";
      const duration = guildData(guildId).automod.antiSpam.duration || 300000;
      
      if (action === "mute") {
        await msg.member.timeout(duration, "Automod: Spam detected").catch(() => {});
      } else if (action === "kick") {
        await msg.member.kick("Automod: Spam detected").catch(() => {});
      } else if (action === "ban") {
        await msg.member.ban({ reason: "Automod: Spam detected" }).catch(() => {});
      }
      
      await msg.delete().catch(() => {});
      const warn = await msg.channel.send({
        embeds: [createEmbed({
          title: `${EMOJIS.automod} ${bold("Spam Detected")}`,
          description: `${EMOJIS.error} ${msg.author} has been ${action === "mute" ? "muted" : action === "kick" ? "kicked" : "banned"} for spamming.`,
          color: 0xFF0000
        })]
      });
      setTimeout(() => warn.delete().catch(() => {}), 5000);
      spamTracker.delete(key);
      return;
    }
  }

  /* ================= AUTOMOD - ANTI MASS MENTION ================= */
  if (guildData(guildId).automod?.enabled && guildData(guildId).automod?.antiMassMention?.enabled && !msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const mentionCount = msg.mentions.users.size + msg.mentions.roles.size;
    if (mentionCount >= (guildData(guildId).automod.antiMassMention.maxMentions || 5)) {
      const action = guildData(guildId).automod.antiMassMention.action || "mute";
      const duration = guildData(guildId).automod.antiMassMention.duration || 300000;
      
      if (action === "mute") {
        await msg.member.timeout(duration, "Automod: Mass mention").catch(() => {});
      }
      
      await msg.delete().catch(() => {});
      const warn = await msg.channel.send({
        embeds: [createEmbed({
          title: `${EMOJIS.automod} ${bold("Mass Mention Detected")}`,
          description: `${EMOJIS.error} ${msg.author} has been muted for mass mentioning.`,
          color: 0xFF0000
        })]
      });
      setTimeout(() => warn.delete().catch(() => {}), 5000);
      return;
    }
  }

  /* ================= AUTOMOD - ANTI CAPS ================= */
  if (guildData(guildId).automod?.enabled && guildData(guildId).automod?.antiCaps?.enabled && !msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const minLength = guildData(guildId).automod.antiCaps.minLength || 10;
    const percentage = guildData(guildId).automod.antiCaps.percentage || 70;
    
    if (msg.content.length >= minLength) {
      const upperCount = (msg.content.match(/[A-Z]/g) || []).length;
      const letterCount = (msg.content.match(/[A-Za-z]/g) || []).length;
      
      if (letterCount > 0 && (upperCount / letterCount) * 100 >= percentage) {
        await msg.delete().catch(() => {});
        const warn = await msg.channel.send({ 
          embeds: [createWarningEmbed("Anti-Caps", `${msg.author}, please don't use excessive caps!`)] 
        });
        setTimeout(() => warn.delete().catch(() => {}), 5000);
        return;
      }
    }
  }

  /* ================= AUTOMOD - ANTI INVITE ================= */
  if (guildData(guildId).automod?.enabled && guildData(guildId).automod?.antiInvite?.enabled && !msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)\/[a-zA-Z0-9]+/gi;
    if (inviteRegex.test(msg.content)) {
      await msg.delete().catch(() => {});
      const warn = await msg.channel.send({ 
        embeds: [createWarningEmbed("Anti-Invite", `${msg.author}, Discord invites are not allowed!`)] 
      });
      setTimeout(() => warn.delete().catch(() => {}), 5000);
      return;
    }
  }

  /* ================= ANTILINK ================= */
  if (guildData(guildId).antilink?.enabled && !isAntilinkImmune(msg.member, msg.channel, guildId)) {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const discordInviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)/gi;

    if (urlRegex.test(content) || discordInviteRegex.test(content)) {
      const isWhitelisted = guildData(guildId).antilink.whitelist?.some(domain => content.toLowerCase().includes(domain.toLowerCase()));
      if (!isWhitelisted) {
        await msg.delete().catch(() => {});
        const warn = await msg.channel.send({
          embeds: [createEmbed({
            title: `${EMOJIS.antilink} ${bold("Link Detected")}`,
            description: `${EMOJIS.error} ${msg.author}, links are not allowed!`,
            color: 0xFF0000
          })]
        });
        setTimeout(() => warn.delete().catch(() => {}), 5000);
        return;
      }
    }
  }

  /* ================= AFK AUTO REMOVE ================= */
  // Check global AFK first
  const globalAfkData = db.globalAfk?.[msg.author.id];
  const guildAfkData = guildData(guildId).afk?.enabled !== false ? guildData(guildId).afk?.users?.[msg.author.id] : null;
  const afkDataToRemove = globalAfkData || (guildAfkData?.type === "server" ? guildAfkData : null);

  if (afkDataToRemove) {
    const afkData = afkDataToRemove;
    if (afkData.type === "global" || afkData.guildId === msg.guild.id) {
      const duration = formatDuration(Date.now() - afkData.time);
      const pingCount = afkData.mentions?.length || 0;
      const pingedBy = pingCount > 0
        ? afkData.mentions.slice(-5).map(m => `<@${m.byId}>`).join(", ")
        : "No Pings";

      // Remove from correct store
      if (afkData.type === "global") {
        delete db.globalAfk[msg.author.id];
      } else {
        delete guildData(guildId).afk.users[msg.author.id];
      }
      saveDB();

      const embed = createEmbed({
        title: `${EMOJIS.welcome} ${bold(`Welcome Back ${msg.author.username}`)}`,
        description:
          `<a:zzz_arrow_hash:1485872093437497434> **__AFK Duration:__** ${duration} <a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434> **__Times Pinged:__** ${pingCount} <a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434> **__Pinged By:__** ${pingedBy} <a:zzz_Exclamation:1485872115662983288>\n\n` +
          `> Your AFK status has been removed.`
      });

      msg.reply({ embeds: [embed] }).catch(() => {});
    }
  }

  /* ================= AFK MENTION CHECK ================= */
  if (guildData(guildId).afk?.enabled !== false) {
    for (const user of msg.mentions.users.values()) {
      // Check global AFK first, then server AFK
      const afk = db.globalAfk?.[user.id] || guildData(guildId).afk?.users?.[user.id];
      if (!afk) continue;

      if (afk.type === "global" || afk.guildId === msg.guild.id) {
        if (!Array.isArray(afk.mentions)) afk.mentions = [];
        afk.mentions.push({
          byId: msg.author.id,
          byName: msg.author.username,
          guildId: msg.guild.id,
          channelId: msg.channel.id,
          messageId: msg.id,
          time: Date.now()
        });
        saveDB();

        // Send DM notification if user opted in
        if (afk.dmNotify) {
          try {
            const dmTarget = await client.users.fetch(user.id).catch(() => null);
            if (dmTarget) {
              const dmEmbed = createEmbed({
                title: `${EMOJIS.afk} ${bold("You were mentioned while AFK!")}`,
                description:
                  `<a:zzz_arrow_hash:1485872093437497434>  **By:** ${msg.author.tag}<a:zzz_Exclamation:1485872115662983288>\n` +
                  `<a:zzz_arrow_hash:1485872093437497434>  **Server:** ${msg.guild.name}<a:zzz_Exclamation:1485872115662983288>\n` +
                  `<a:zzz_arrow_hash:1485872093437497434>  **Channel:** <#${msg.channel.id}><a:zzz_Exclamation:1485872115662983288>\n` +
                  `<a:zzz_arrow_hash:1485872093437497434>  **[Jump to Message](https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id})**<a:zzz_Exclamation:1485872115662983288>`
              });
              await dmTarget.send({ embeds: [dmEmbed] }).catch(() => {});
            }
          } catch {}
        }

        const embed = createEmbed({
          title: `${EMOJIS.afk} ${bold(`${user.username} is AFK`)}`,
          description:
            `<a:zzz_arrow_hash:1485872093437497434>  **Reason:** ${afk.reason}<a:zzz_Exclamation:1485872115662983288>\n` +
            `<a:zzz_arrow_hash:1485872093437497434>  **AFK for:** ${formatDuration(Date.now() - afk.time)}<a:zzz_Exclamation:1485872115662983288>`,
        });

        const reply = await msg.reply({ embeds: [embed] }).catch(() => null);
        if (reply) setTimeout(() => reply.delete().catch(() => {}), 10000);
      }
    }
  }

  /* ================= BAD WORD DETECTION ================= */
  if (badWordFilter.enabled && !isBadWordImmune(msg.member, msg.channel, guildId)) {
    const cleaned = msg.content.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    const currentBadWordSet = getBadWordSet();
    const foundWord = tokens.find(word => currentBadWordSet.has(word));

    if (foundWord) {
      if (msg.attachments.size > 0) {
        await logDeletedMedia(msg, `Bad Word: ${foundWord}`);
      }
      await msg.delete().catch(() => {});
      const durationMinutes = Math.round(badWordFilter.timeoutMs / 60000);
      await msg.member.timeout(badWordFilter.timeoutMs, `Bad word: ${foundWord}`).catch(() => {});

      const warn = await msg.channel.send({
        embeds: [createEmbed({
          title: `${EMOJIS.mute} ${bold("Auto Muted")}`,
          description: `${EMOJIS.error} ${bold("User:")} ${msg.member}\n${EMOJIS.messages} ${bold("Reason:")} Prohibited word\n${EMOJIS.clock} ${bold("Duration:")} ${durationMinutes} minute(s)`,
          color: 0xFF0000
        })]
      });
      setTimeout(() => warn.delete().catch(() => {}), 10000);
      return;
    }
  }

  /* ================= NSFW DETECTION ================= */
  if (guildData(guildId).nsfwProtection && Array.isArray(nsfwWords) && nsfwWords.length > 0) {
    if (!isNSFWImmune(msg.member, msg.channel, guildId)) {
      const contentLower = msg.content.toLowerCase();
      // Merge static + runtime NSFW words
      const allNsfwWords = [...nsfwWords, ...(Array.isArray(db.customNsfwWords) ? db.customNsfwWords : [])];
      const detectedNSFW = allNsfwWords.some(word => contentLower.includes(word.toLowerCase()));
      if (detectedNSFW) {
        if (msg.attachments.size > 0) await logDeletedMedia(msg, "NSFW Content");
        await msg.delete().catch(() => {});
        const muteDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
        await msg.member.timeout(muteDuration, "NSFW Content Detected").catch(() => {});
        const warn = await msg.channel.send({
          embeds: [createEmbed({
            title: `${EMOJIS.mute} ${bold("NSFW Detected — User Muted")}`,
            description: `${EMOJIS.error} ${bold("User:")} ${msg.member}\n${EMOJIS.messages} ${bold("Reason:")} NSFW content\n${EMOJIS.clock} ${bold("Duration:")} 7 days`,
            color: 0xFF0000
          })]
        });
        setTimeout(() => warn.delete().catch(() => {}), 10000);
        return;
      }
    }
  }

  /* ================= COUNTING SYSTEM ================= */
  if (guildData(guildId).countingSystem?.enabled !== false && guildData(guildId).counting[guildId]?.channel === msg.channel.id) {
    const countData = guildData(guildId).counting[guildId];
    const number = parseInt(msg.content);
    
    if (isNaN(number)) {
      await msg.delete().catch(() => {});
      return;
    }
    
    if (countData.lastUser === msg.author.id) {
      await msg.react("❌").catch(() => {});
      countData.count = 0;
      countData.lastUser = null;
      saveDB();
      await msg.channel.send({ 
        embeds: [createErrorEmbed("Count Reset", `${msg.author} counted twice in a row! Count reset to ${bold("0")}.`)] 
      });
      return;
    }
    
    if (number === countData.count + 1) {
      countData.count = number;
      countData.lastUser = msg.author.id;
      if (!countData.highScore || number > countData.highScore) countData.highScore = number;
      saveDB();
      await msg.react("✅").catch(() => {});
    } else {
      await msg.react("❌").catch(() => {});
      const correctNumber = countData.count + 1;
      countData.count = 0;
      countData.lastUser = null;
      saveDB();
      await msg.channel.send({ 
        embeds: [createErrorEmbed("Wrong Number", `${msg.author} broke the count! Next was ${bold(correctNumber.toString())}. Reset to ${bold("0")}.`)] 
      });
    }
    return;
  }

  /* ================= CONFESSION SYSTEM ================= */
  if (content.startsWith(CONFESSION_PREFIX) && !content.startsWith(PREFIX)) {
    if (!guildData(guildId).confession?.enabled) return;
    
    const confessionText = content.slice(CONFESSION_PREFIX.length).trim();

    if (guildData(guildId).confession.bannedUsers?.includes(msg.author.id) || guildData(guildId).confessionBannedUsers?.includes(msg.author.id)) {
      return autoDeleteReply(msg, formatError("You are banned from confessions!"));
    }

    if (!confessionText) {
      return autoDeleteReply(msg, formatError("Write a confession message!"));
    }

    const confessionChannelId = guildData(guildId).confession.channel || guildData(guildId).confessionChannel;
    if (!confessionChannelId) {
      return autoDeleteReply(msg, formatError("Confession channel not set!"));
    }

    try {
      const confessionId = (guildData(guildId).confession.lastId || guildData(guildId).confessionLastId || 0) + 1;
      if (guildData(guildId).confession.lastId !== undefined) guildData(guildId).confession.lastId = confessionId;
      else guildData(guildId).confessionLastId = confessionId;

      const confessionData = {
        id: confessionId,
        oderId: msg.author.id,
        guildId: msg.guild.id,
        content: confessionText,
        time: Date.now()
      };

      if (!guildData(guildId).confession.confessions) guildData(guildId).confession.confessions = [];
      guildData(guildId).confession.confessions.push(confessionData);
      if (!guildData(guildId).confessions) guildData(guildId).confessions = [];
      guildData(guildId).confessions.push(confessionData);
      saveDB();

      const embed = createEmbed({
        title: `${EMOJIS.confession} ${bold("Confession")}`,
        description: confessionText,
        footer: `Confession #${confessionId}`
      });

      const confessionChannel = msg.guild.channels.cache.get(confessionChannelId);
      await confessionChannel.send({ embeds: [embed] });

      const logsChannelId = guildData(guildId).confession.logs || guildData(guildId).confessionLogs;
      if (logsChannelId) {
        const logChannel = msg.guild.channels.cache.get(logsChannelId);
        if (logChannel) {
          const logEmbed = createEmbed({
            title: `${EMOJIS.logging} ${bold("Confession Log")}`,
            fields: [
              { name: `${EMOJIS.confession} ${bold("User")}`, value: `${msg.author.tag} (${msg.author.id})`, inline: true },
              { name: `🆔 ${bold("ID")}`, value: `#${confessionId}`, inline: true },
              { name: `${EMOJIS.messages} ${bold("Content")}`, value: confessionText.slice(0, 1000) }
            ]
          });
          logChannel.send({ embeds: [logEmbed] });
        }
      }

      await msg.delete();
    } catch (err) {
      console.error("Confession error:", err);
      autoDeleteReply(msg, formatError("Failed to send confession"));
    }
    return;
  }

  /* ================= TICKET MESSAGE LOGGING ================= */
  const ticket = guildData(guildId).ticket?.tickets?.[msg.channel.id];
  if (ticket && ticket.open) {
    if (!ticket.messages) ticket.messages = [];
    ticket.messages.push({
      author: msg.author.tag,
      oderId: msg.author.id,
      content: msg.content,
      timestamp: Date.now(),
      attachments: msg.attachments.map(a => a.url)
    });
    saveDB();
  }

  /* ================= AUTO REACT ================= */
  if (guildData(guildId).autoreact?.enabled !== false && guildData(guildId).autoReact?.[guildId]) {
    for (const [trigger, data] of Object.entries(guildData(guildId).autoReact[guildId])) {
      if (data.enabled !== false && lower.includes(trigger)) {
        for (const emoji of data.emojis) {
          await msg.react(emoji).catch(() => {});
        }
      }
    }
  }

  /* ================= AUTO RESPONDER ================= */
  if (guildData(guildId).autoresponder?.enabled !== false && !msg.content.startsWith(PREFIX)) {
    if (globalAutoResponders.has(lower)) {
      const data = guildData(guildId).globalAutoResponders[lower];
      if (data.enabled !== false) {
        data.usageCount = (data.usageCount || 0) + 1;
        guildData(guildId).globalAutoResponders[lower] = data;
        saveDB();

        if (data.reactions?.length > 0) {
          for (const emoji of data.reactions) {
            await msg.react(emoji).catch(() => {});
          }
        }

        if (data.response) {
          await msg.reply(data.response).catch(() => {});
        }
        return;
      }
    }

    for (const [trigger, data] of globalAutoResponders.entries()) {
      if (data.enabled !== false && lower.includes(trigger)) {
        data.usageCount = (data.usageCount || 0) + 1;
        guildData(guildId).globalAutoResponders[trigger] = data;
        saveDB();

        if (data.reactions?.length > 0) {
          for (const emoji of data.reactions) {
            await msg.react(emoji).catch(() => {});
          }
        }

        if (data.response) {
          await msg.reply(data.response).catch(() => {});
        }
        return;
      }
    }
  }

  /* ================= WALL SYSTEM (QUARANTINE ENFORCE) ================= */
  // If wall is enabled, quarantined users cannot run any commands
  if (guildData(guildId).wallSystem?.enabled && guildData(guildId).wallSystem?.quarantined?.[msg.guildId]?.[msg.author.id]) {
    return msg.reply({ embeds: [createErrorEmbed("🔒 Quarantined", "You are quarantined and cannot use bot commands.")] });
  }

  /* ================= SUGGESTIONS ================= */
  if (guildData(guildId).suggestions?.enabled && guildData(guildId).suggestions?.channel === msg.channel.id && !content.startsWith(PREFIX)) {
    guildData(guildId).suggestions.count = (guildData(guildId).suggestions.count || 0) + 1;
    
    const embed = createEmbed({
      title: `${EMOJIS.suggestions} ${bold(`Suggestion #${guildData(guildId).suggestions.count}`)}`,
      description: msg.content,
      fields: [
        { name: `${EMOJIS.confession} ${bold("Author")}`, value: `${msg.author.tag}`, inline: true }
      ],
      thumbnail: msg.author.displayAvatarURL({ dynamic: true }),
      footer: `Suggestion ID: ${guildData(guildId).suggestions.count}`
    });
    
    await msg.delete().catch(() => {});
    const suggestionMsg = await msg.channel.send({ embeds: [embed] });
    await suggestionMsg.react("👍").catch(() => {});
    await suggestionMsg.react("👎").catch(() => {});
    saveDB();
    return;
  }

  /* ================= DISABLED CHANNELS CHECK ================= */
  if ((guildData(msg.guildId)?.disabledChannels || []).includes(msg.channel.id) && !msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return;
  }

  if (!cmd) return;

  /* ================= COMMAND DISABLED CHECK ================= */
  if (isCommandDisabled(guildId, cmd)) {
    return msg.reply({ 
      embeds: [createErrorEmbed("Command Disabled", "This command has been disabled by an administrator.")] 
    });
  }

  /* ================= HELP COMMAND ================= */
  if (cmd === "help" || cmd === "h" || cmd === "commands") {
    if (args[0]) {
      const query = args[0].toLowerCase();

      // Resolve: direct category key OR via CMD_HELP_MAP (command/alias → category)
      const catKey = ALL_COMMANDS[query] ? query : CMD_HELP_MAP[query] || null;

      if (catKey && ALL_COMMANDS[catKey]) {
        const sessionKey = `${msg.author.id}_${catKey}_${Date.now()}`;
        helpSessions.set(sessionKey, { category: catKey, page: 0 });
        const result = buildCategoryPage(catKey, 0, msg.author.tag, guildId);
        if (!result) return msg.reply({ embeds: [createErrorEmbed("Not Found", `No module named \`${query}\`.`)] });
        const btnRow = buildHelpPageButtons(sessionKey, result.page, result.totalPages, catKey);
        result.container.addActionRowComponents(btnRow);
        result.container.addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small));
        result.container.addTextDisplayComponents(text =>
          text.setContent(`-# Requested by ${msg.author.tag} | Page ${result.page + 1} / ${result.totalPages}`)
        );
        return msg.reply({ components: [result.container], flags: MessageFlags.IsComponentsV2 });
      }

      // Fallback: individual command lookup
      const embed = getCommandHelpEmbed(query, guildId);
      return msg.reply({ embeds: [embed] });
    }

    const helpContainer = buildMainHelpContainer(guildId);
    return msg.reply({ components: [helpContainer], flags: MessageFlags.IsComponentsV2 });
  }

  /* ================= PING ================= */
  if (cmd === "ping" || cmd === "latency") {
    const latency = Date.now() - msg.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    
    const embed = createEmbed({
      title: `${EMOJIS.ping} ${bold("Pong!")}`,
      fields: [
        { name: `${EMOJIS.messages} ${bold("Message Latency")}`, value: `\`${latency}ms\``, inline: true },
        { name: `${EMOJIS.chart} ${bold("API Latency")}`, value: `\`${apiLatency}ms\``, inline: true }
      ]
    });
    return msg.reply({ embeds: [embed] });
  }

  /* ================= PREFIX COMMANDS ================= */
  if (cmd === "prefix" || cmd === "setprefix") {
    if (!args[0]) {
      const embed = createEmbed({
        title: `${EMOJIS.settings} ${bold("Prefix Settings")}`,
        description: 
          `${EMOJIS.success} ${bold("Current Prefix:")} \`${PREFIX}\`\n` +
          `${EMOJIS.info} ${bold("Default Prefix:")} \`${DEFAULT_PREFIX}\`\n\n` +
          `${bold("Usage:")}\n` +
          `\`${PREFIX}setprefix <new prefix>\` - Change prefix\n` +
          `\`${PREFIX}setprefix reset\` - Reset to default\n\n` +
          `${EMOJIS.info} You can also mention me as a prefix!`
      });
      return msg.reply({ embeds: [embed] });
    }

    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Only administrators can change the prefix!")] });
    }

    const newPrefix = args[0];
    
    if (newPrefix.toLowerCase() === "reset" || newPrefix.toLowerCase() === "default") {
      setPrefix(guildId, DEFAULT_PREFIX);
      return msg.reply({ embeds: [createSuccessEmbed("Prefix Reset", `Prefix reset to default: \`${DEFAULT_PREFIX}\``)] });
    }

    if (newPrefix.length > 10) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Prefix", "Prefix cannot exceed 10 characters!")] });
    }

    const oldPrefix = PREFIX;
    setPrefix(guildId, newPrefix);

    const embed = createEmbed({
      title: `${EMOJIS.settings} ${bold("Prefix Changed")}`,
      fields: [
        { name: `${EMOJIS.error} ${bold("Old Prefix")}`, value: `<a:zzz_arrow_hash:1485872093437497434> \`${oldPrefix}\` <a:zzz_Exclamation:1485872115662983288>`, inline: true },
        { name: `${EMOJIS.success} ${bold("New Prefix")}`, value: `<a:zzz_arrow_hash:1485872093437497434> \`${newPrefix}\` <a:zzz_Exclamation:1485872115662983288>`, inline: true }
      ],
      description: `\nUse \`${newPrefix}help\` to see commands.`
    });
    return msg.reply({ embeds: [embed] });
  }

  /* ================= SYSTEM ENABLE/DISABLE ================= */
  if (cmd === "system") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    const systemName = args[1]?.toLowerCase();

    if (subCmd === "list") {
      const embed = getSystemsListEmbed(guildId);
      return msg.reply({ embeds: [embed] });
    }

    if (subCmd === "enable" && systemName) {
      const success = toggleSystem(systemName, true, guildId);
      if (success) {
        return msg.reply({ embeds: [createSuccessEmbed("System Enabled", `${bold(systemName)} has been enabled!`)] });
      } else {
        return msg.reply({ embeds: [createErrorEmbed("Invalid System", `System "${systemName}" not found!`)] });
      }
    }

    if (subCmd === "disable" && systemName) {
      const success = toggleSystem(systemName, false, guildId);
      if (success) {
        return msg.reply({ embeds: [createSuccessEmbed("System Disabled", `${bold(systemName)} has been disabled!`)] });
      } else {
        return msg.reply({ embeds: [createErrorEmbed("Invalid System", `System "${systemName}" not found!`)] });
      }
    }

    const embed = createEmbed({
      title: `${EMOJIS.settings} ${bold("System Management")}`,
      description: 
        `${bold("Usage:")}\n` +
        `\`${PREFIX}system list\` - List all systems\n` +
        `\`${PREFIX}system enable <name>\` - Enable a system\n` +
        `\`${PREFIX}system disable <name>\` - Disable a system\n\n` +
        `${bold("Available Systems:")}\n` +
        ALL_SYSTEMS.map(s => `\`${s.name}\``).join(", ")
    });
    return msg.reply({ embeds: [embed] });
  }

  /* ================= COMMAND ENABLE/DISABLE ================= */
  if (cmd === "command" || cmd === "cmd") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    const commandName = args[1]?.toLowerCase();

    if (subCmd === "list") {
      const disabled = getDisabledCommands(guildId);
      const embed = createEmbed({
        title: `${EMOJIS.settings} ${bold("Disabled Commands")}`,
        description: disabled.length > 0 
          ? disabled.map(c => `\`${c}\``).join(", ")
          : `${EMOJIS.success} No commands are disabled!`
      });
      return msg.reply({ embeds: [embed] });
    }

    if (subCmd === "enable" && commandName) {
      enableCommand(guildId, commandName);
      return msg.reply({ embeds: [createSuccessEmbed("Command Enabled", `\`${commandName}\` has been enabled!`)] });
    }

    if (subCmd === "disable" && commandName) {
      if (["help", "system", "command", "prefix"].includes(commandName)) {
        return msg.reply({ embeds: [createErrorEmbed("Cannot Disable", "This command cannot be disabled!")] });
      }
      disableCommand(guildId, commandName);
      return msg.reply({ embeds: [createSuccessEmbed("Command Disabled", `\`${commandName}\` has been disabled!`)] });
    }

    const embed = createEmbed({
      title: `${EMOJIS.settings} ${bold("Command Management")}`,
      description: 
        `${bold("Usage:")}\n` +
        `\`${PREFIX}command list\` - List disabled commands\n` +
        `\`${PREFIX}command enable <name>\` - Enable a command\n` +
        `\`${PREFIX}command disable <name>\` - Disable a command`
    });
    return msg.reply({ embeds: [embed] });
  }

  /* ================= WELCOME COMMANDS ================= */
  if (cmd === "welcome") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }
    const sessionId = `${msg.author.id}_${Date.now()}`;
    const { container } = buildWelcomeConfigPanel(msg.guild, msg.guildId, sessionId);
    return msg.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }

  /* ================= GOODBYE COMMANDS ================= */
  if (cmd === "goodbye" || cmd === "bye") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable") {
      guildData(guildId).goodbye.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Goodbye Enabled", "Goodbye system has been enabled!")] });
    }

    if (subCmd === "disable") {
      guildData(guildId).goodbye.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Goodbye Disabled", "Goodbye system has been disabled!")] });
    }

    if (subCmd === "setchannel") {
      const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
      if (!channel) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}goodbye setchannel #channel\``)] });
      }
      guildData(guildId).goodbye.channel = channel.id;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Channel Set", `Goodbye channel set to ${channel}`)] });
    }

    if (subCmd === "setmessage") {
      const message = args.slice(1).join(" ");
      if (!message) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Message", `Usage: \`${PREFIX}goodbye setmessage <message>\``)] });
      }
      guildData(guildId).goodbye.message = message;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Message Set", `Goodbye message set!`)] });
    }

    if (subCmd === "test") {
      const testMsg = (guildData(guildId).goodbye.message || "Goodbye {user}!")
        .replace(/{user}/g, msg.author.username)
        .replace(/{server}/g, msg.guild.name)
        .replace(/{membercount}/g, msg.guild.memberCount);
      
      const embed = createEmbed({
        title: `👋 ${bold("Goodbye!")}`,
        description: testMsg,
        thumbnail: msg.author.displayAvatarURL({ dynamic: true }),
        color: 0xFF6B6B
      });
      return msg.reply({ embeds: [embed] });
    }


    const embed = createEmbed({
      title: `${EMOJIS.goodbye} ${bold("Goodbye Commands")}`,
      description: 
        `\`${PREFIX}goodbye enable\` - Enable goodbye\n` +
        `\`${PREFIX}goodbye disable\` - Disable goodbye\n` +
        `\`${PREFIX}goodbye setchannel #channel\` - Set channel\n` +
        `\`${PREFIX}goodbye setmessage <msg>\` - Set message\n` +
        `\`${PREFIX}goodbye test\` - Test message\n` +
        `\`${PREFIX}goodbye settings\` - View settings`
    });
    return msg.reply({ embeds: [embed] });
  }

  /* ================= BOOST COMMANDS ================= */
  if (cmd === "boost") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable") {
      guildData(guildId).boost.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Boost Enabled", "Boost messages have been enabled!")] });
    }

    if (subCmd === "disable") {
      guildData(guildId).boost.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Boost Disabled", "Boost messages have been disabled!")] });
    }

    if (subCmd === "setchannel") {
      const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
      if (!channel) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}boost setchannel #channel\``)] });
      }
      guildData(guildId).boost.channel = channel.id;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Channel Set", `Boost channel set to ${channel}`)] });
    }

    if (subCmd === "setmessage") {
      const message = args.slice(1).join(" ");
      if (!message) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Message", `Usage: \`${PREFIX}boost setmessage <message>\`\n\n${bold("Placeholders:")}\n\`{user}\` - Mention\n\`{username}\` - Username\n\`{count}\` - Boost count`)] });
      }
      if (!guildData(guildId).boost.embed) guildData(guildId).boost.embed = {};
      guildData(guildId).boost.embed.description = message;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Message Set", `Boost message set!`)] });
    }

    if (subCmd === "test") {
      if (!guildData(guildId).boost.channel) {
        return msg.reply({ embeds: [createErrorEmbed("Not Configured", "Boost channel not set!")] });
      }
      const boostCount = msg.guild.premiumSubscriptionCount || 0;
      const e = guildData(guildId).boost.embed || {};
      
      const embed = createEmbed({
        title: e.title ? e.title.replace(/{count}/g, boostCount) : `${EMOJIS.boost} ${bold("Server Boosted!")}`,
        description: e.description 
          ? e.description.replace(/{user}/g, msg.author).replace(/{username}/g, msg.author.username).replace(/{count}/g, boostCount)
          : `${EMOJIS.party} ${msg.author} just boosted!\n\nWe now have ${bold(boostCount.toString())} boosts!`,
        color: BOT_COLOR,
        thumbnail: msg.author.displayAvatarURL({ dynamic: true })
      });
      return msg.reply({ embeds: [embed] });
    }

    if (subCmd === "config") {
      const sessionId = `${msg.author.id}_${Date.now()}`;
      const { container } = buildBoostConfigPanel(msg.guild, msg.guildId, sessionId);
      return msg.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }


    const embed = createEmbed({
      title: `${EMOJIS.boost} ${bold("Boost Commands")}`,
      description: 
        `\`${PREFIX}boost config\` - 🎛️ **Interactive config panel** *(recommended)*\n` +
        `\`${PREFIX}boost enable\` - Enable boost messages\n` +
        `\`${PREFIX}boost disable\` - Disable boost messages\n` +
        `\`${PREFIX}boost setchannel #channel\` - Set channel\n` +
        `\`${PREFIX}boost setmessage <msg>\` - Set message\n` +
        `\`${PREFIX}boost test\` - Test message\n` +
        `\`${PREFIX}boost settings\` - View settings`
    });
    return msg.reply({ embeds: [embed] });
  }

  /* ================= ANTINUKE COMMANDS ================= */
  if (cmd === "antinuke" || cmd === "an") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable") {
      guildData(guildId).antinuke.enabled = true;
      saveDB();
      const enabledEmbed = createEmbed({
        title: `${EMOJIS.antinuke} ${bold("Anti-Nuke")} ${EMOJI_ENABLE}`,
        description: `${EMOJI_ENABLE} Anti-Nuke is now **Enabled**!\nManage which events are protected below:`
      });
      const payload = buildAntiNukeEventsMessage(msg.guildId);
      return msg.reply({ embeds: [enabledEmbed], content: payload.content, components: payload.components });
    }

    if (subCmd === "disable") {
      guildData(guildId).antinuke.enabled = false;
      saveDB();
      const disabledEmbed = createEmbed({
        title: `${EMOJIS.antinuke} ${bold("Anti-Nuke")} ${EMOJI_DISABLE}`,
        description: `${EMOJI_DISABLE} Anti-Nuke is now **Disabled**!\nYou can still manage events below or re-enable anytime.`
      });
      const payload = buildAntiNukeEventsMessage(msg.guildId);
      return msg.reply({ embeds: [disabledEmbed], content: payload.content, components: payload.components });
    }

    if (subCmd === "whitelist") {
      const user = msg.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);
      if (!user) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid User", `Usage: \`${PREFIX}antinuke whitelist @user\``)] });
      }
      if (!guildData(guildId).antinuke.whitelist.includes(user.id)) {
        guildData(guildId).antinuke.whitelist.push(user.id);
        saveDB();
        return msg.reply({ embeds: [createSuccessEmbed("User Whitelisted", `${user.tag} added to whitelist!`)] });
      }
      return msg.reply({ embeds: [createInfoEmbed("Already Whitelisted", `${user.tag} is already whitelisted!`)] });
    }

    if (subCmd === "unwhitelist") {
      const user = msg.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);
      if (!user) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid User", `Usage: \`${PREFIX}antinuke unwhitelist @user\``)] });
      }
      guildData(guildId).antinuke.whitelist = guildData(guildId).antinuke.whitelist.filter(id => id !== user.id);
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("User Removed", `${user.tag} removed from whitelist!`)] });
    }

    if (subCmd === "setlogs") {
      const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
      if (!channel) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}antinuke setlogs #channel\``)] });
      }
      guildData(guildId).antinuke.logs = channel.id;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Logs Set", `Anti-nuke logs set to ${channel}`)] });
    }

    if (subCmd === "maxbans") {
      const num = parseInt(args[1]);
      if (isNaN(num) || num < 1 || num > 20) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Number", "Must be between 1 and 20!")] });
      }
      guildData(guildId).antinuke.maxBans = num;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Max Bans Set", `Max bans set to ${num}`)] });
    }

    if (subCmd === "maxkicks") {
      const num = parseInt(args[1]);
      if (isNaN(num) || num < 1 || num > 20) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Number", "Must be between 1 and 20!")] });
      }
      guildData(guildId).antinuke.maxKicks = num;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Max Kicks Set", `Max kicks set to ${num}`)] });
    }

    if (subCmd === "punishment") {
      const punishment = args[1]?.toLowerCase();
      if (!["ban", "kick", "strip"].includes(punishment)) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Punishment", "Must be: ban, kick, or strip")] });
      }
      guildData(guildId).antinuke.punishment = punishment;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Punishment Set", `Punishment set to ${punishment}`)] });
    }

    if (subCmd === "events") {
      const payload = buildAntiNukeEventsMessage(msg.guildId);
      return msg.reply({ content: payload.content, components: payload.components });
    }


    const embed = createEmbed({
      title: `${EMOJIS.antinuke} ${bold("Anti-Nuke Commands")}`,
      description: 
        `\`${PREFIX}antinuke enable\` - Enable protection\n` +
        `\`${PREFIX}antinuke disable\` - Disable protection\n` +
        `\`${PREFIX}antinuke whitelist @user\` - Whitelist user\n` +
        `\`${PREFIX}antinuke unwhitelist @user\` - Remove whitelist\n` +
        `\`${PREFIX}antinuke setlogs #channel\` - Set logs\n` +
        `\`${PREFIX}antinuke maxbans <num>\` - Set max bans\n` +
        `\`${PREFIX}antinuke maxkicks <num>\` - Set max kicks\n` +
        `\`${PREFIX}antinuke punishment <type>\` - Set punishment\n` +
        `\`${PREFIX}antinuke settings\` - View settings`
    });
    return msg.reply({ embeds: [embed] });
  }

  /* ================= ANTIBOT COMMANDS ================= */
  if (cmd === "antibot" || cmd === "ab") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable") {
      guildData(guildId).antibot.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Anti-Bot Enabled", "Unauthorized bots will be blocked!")] });
    }

    if (subCmd === "disable") {
      guildData(guildId).antibot.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Anti-Bot Disabled", "Anti-bot protection disabled!")] });
    }

    if (subCmd === "whitelist") {
      const botId = args[1];
      if (!botId) {
        return msg.reply({ embeds: [createErrorEmbed("Missing ID", `Usage: \`${PREFIX}antibot whitelist <botID>\``)] });
      }
      if (!guildData(guildId).antibot.whitelist.includes(botId)) {
        guildData(guildId).antibot.whitelist.push(botId);
        saveDB();
        return msg.reply({ embeds: [createSuccessEmbed("Bot Whitelisted", `Bot ID ${botId} added to whitelist!`)] });
      }
      return msg.reply({ embeds: [createInfoEmbed("Already Whitelisted", "This bot is already whitelisted!")] });
    }

    if (subCmd === "unwhitelist") {
      const botId = args[1];
      if (!botId) {
        return msg.reply({ embeds: [createErrorEmbed("Missing ID", `Usage: \`${PREFIX}antibot unwhitelist <botID>\``)] });
      }
      guildData(guildId).antibot.whitelist = guildData(guildId).antibot.whitelist.filter(id => id !== botId);
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Bot Removed", `Bot ID ${botId} removed from whitelist!`)] });
    }

    if (subCmd === "setlogs") {
      const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
      if (!channel) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}antibot setlogs #channel\``)] });
      }
      guildData(guildId).antibot.joinLogs = channel.id;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Logs Set", `Anti-bot logs set to ${channel}`)] });
    }

    if (subCmd === "action") {
      const action = args[1]?.toLowerCase();
      if (!["kick", "ban"].includes(action)) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Action", "Must be: kick or ban")] });
      }
      guildData(guildId).antibot.action = action;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Action Set", `Action set to ${action}`)] });
    }


    const embed = createEmbed({
      title: `${EMOJIS.antibot} ${bold("Anti-Bot Commands")}`,
      description: 
        `\`${PREFIX}antibot enable\` - Enable anti-bot\n` +
        `\`${PREFIX}antibot disable\` - Disable anti-bot\n` +
        `\`${PREFIX}antibot whitelist <botID>\` - Whitelist bot\n` +
        `\`${PREFIX}antibot unwhitelist <botID>\` - Remove bot\n` +
        `\`${PREFIX}antibot setlogs #channel\` - Set logs\n` +
        `\`${PREFIX}antibot action <kick/ban>\` - Set action\n` +
        `\`${PREFIX}antibot settings\` - View settings`
    });
    return msg.reply({ embeds: [embed] });
  }

  /* ================= AUTOMOD COMMANDS ================= */
  if (cmd === "automod" || cmd === "am") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;
    const toggle = args[1]?.toLowerCase();

    if (subCmd === "enable") {
      guildData(guildId).automod.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Automod Enabled", "Automod system is now active!")] });
    }

    if (subCmd === "disable") {
      guildData(guildId).automod.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Automod Disabled", "Automod system has been disabled!")] });
    }

    if (subCmd === "antispam") {
      const enabled = toggle === "on" || toggle === "enable" || toggle === "true";
      guildData(guildId).automod.antiSpam.enabled = enabled;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Anti-Spam", `Anti-spam ${enabled ? "enabled" : "disabled"}!`)] });
    }

    if (subCmd === "antimention") {
      const enabled = toggle === "on" || toggle === "enable" || toggle === "true";
      guildData(guildId).automod.antiMassMention.enabled = enabled;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Anti-Mention", `Anti-mass mention ${enabled ? "enabled" : "disabled"}!`)] });
    }

    if (subCmd === "anticaps") {
      const enabled = toggle === "on" || toggle === "enable" || toggle === "true";
      guildData(guildId).automod.antiCaps.enabled = enabled;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Anti-Caps", `Anti-caps ${enabled ? "enabled" : "disabled"}!`)] });
    }

    if (subCmd === "antiinvite") {
      const enabled = toggle === "on" || toggle === "enable" || toggle === "true";
      guildData(guildId).automod.antiInvite.enabled = enabled;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Anti-Invite", `Anti-invite ${enabled ? "enabled" : "disabled"}!`)] });
    }


    const embed = createEmbed({
      title: `${EMOJIS.automod} ${bold("Automod Commands")}`,
      description: 
        `\`${PREFIX}automod enable\` - Enable automod\n` +
        `\`${PREFIX}automod disable\` - Disable automod\n` +
        `\`${PREFIX}automod antispam <on/off>\` - Toggle anti-spam\n` +
        `\`${PREFIX}automod antimention <on/off>\` - Toggle anti-mention\n` +
        `\`${PREFIX}automod anticaps <on/off>\` - Toggle anti-caps\n` +
        `\`${PREFIX}automod antiinvite <on/off>\` - Toggle anti-invite\n` +
        `\`${PREFIX}automod settings\` - View settings`
    });
    return msg.reply({ embeds: [embed] });
  }

  /* ================= ANTILINK COMMANDS ================= */
  if (cmd === "antilink" || cmd === "al") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable") {
      guildData(guildId).antilink.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Anti-Link Enabled", "Links will now be blocked!")] });
    }

    if (subCmd === "disable") {
      guildData(guildId).antilink.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Anti-Link Disabled", "Anti-link has been disabled!")] });
    }

    if (subCmd === "whitelist") {
      const domain = args[1];
      if (!domain) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Domain", `Usage: \`${PREFIX}antilink whitelist youtube.com\``)] });
      }
      if (!guildData(guildId).antilink.whitelist.includes(domain.toLowerCase())) {
        guildData(guildId).antilink.whitelist.push(domain.toLowerCase());
        saveDB();
        return msg.reply({ embeds: [createSuccessEmbed("Domain Whitelisted", `${domain} has been whitelisted!`)] });
      }
      return msg.reply({ embeds: [createInfoEmbed("Already Whitelisted", "This domain is already whitelisted!")] });
    }

    if (subCmd === "immunerole") {
      const role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);
      if (!role) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Role", `Usage: \`${PREFIX}antilink immunerole @role\``)] });
      }
      if (!guildData(guildId).antilink.immuneRoles) guildData(guildId).antilink.immuneRoles = [];
      if (!guildData(guildId).antilink.immuneRoles.includes(role.id)) {
        guildData(guildId).antilink.immuneRoles.push(role.id);
        saveDB();
        return msg.reply({ embeds: [createSuccessEmbed("Role Added", `${role} is now immune to anti-link!`)] });
      }
      return msg.reply({ embeds: [createInfoEmbed("Already Immune", "This role is already immune!")] });
    }


    const embed = createEmbed({
      title: `${EMOJIS.antilink} ${bold("Anti-Link Commands")}`,
      description: 
        `\`${PREFIX}antilink enable\` - Enable anti-link\n` +
        `\`${PREFIX}antilink disable\` - Disable anti-link\n` +
        `\`${PREFIX}antilink whitelist <domain>\` - Whitelist domain\n` +
        `\`${PREFIX}antilink immunerole @role\` - Add immune role\n` +
        `\`${PREFIX}antilink settings\` - View settings`
    });
    return msg.reply({ embeds: [embed] });
  }

  /* ================= LOGGING COMMANDS ================= */
  if (cmd === "logging" || cmd === "logs") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable") {
      guildData(guildId).logging.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Logging Enabled", "Event logging is now active!")] });
    }

    if (subCmd === "disable") {
      guildData(guildId).logging.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Logging Disabled", "Event logging has been disabled!")] });
    }

    if (subCmd === "setchannel") {
      const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
      if (!channel) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}logging setchannel #channel\``)] });
      }
      guildData(guildId).logging.channel = channel.id;
      guildData(guildId).modLogs = channel.id; // Legacy support
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Channel Set", `Logs channel set to ${channel}`)] });
    }

    if (subCmd === "toggle") {
      const event = args[1]?.toLowerCase();
      const validEvents = Object.keys(guildData(guildId).logging.events);
      if (!event || !validEvents.includes(event)) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Event", `Valid events: ${validEvents.join(", ")}`)] });
      }
      guildData(guildId).logging.events[event] = !guildData(guildId).logging.events[event];
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Event Toggled", `${event} logging is now ${guildData(guildId).logging.events[event] ? "enabled" : "disabled"}!`)] });
    }

    if (subCmd === "events") {
      const eventsList = Object.entries(guildData(guildId).logging.events)
        .map(([event, enabled]) => `${enabled ? EMOJIS.success : EMOJIS.error} ${event}`)
        .join("\n");
      const embed = createEmbed({
        title: `${EMOJIS.logging} ${bold("Logging Events")}`,
        description: eventsList
      });
      return msg.reply({ embeds: [embed] });
    }


    const embed = createEmbed({
      title: `${EMOJIS.logging} ${bold("Logging Commands")}`,
      description: 
        `\`${PREFIX}logging enable\` - Enable logging\n` +
        `\`${PREFIX}logging disable\` - Disable logging\n` +
        `\`${PREFIX}logging setchannel #channel\` - Set logs channel\n` +
        `\`${PREFIX}logging toggle <event>\` - Toggle event\n` +
        `\`${PREFIX}logging events\` - List all events\n` +
        `\`${PREFIX}logging settings\` - View settings`
    });
    return msg.reply({ embeds: [embed] });
  }

    /* ================= PURGE COMMANDS - ENHANCED ================= */
if (cmd === "purge" || cmd === "clear" || cmd === "prune") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Messages permission!")] });
  }

  const type = args[0]?.toLowerCase();
  let amount;
  let filter = null;
  let filterName = "all";

  // Handle different purge types
  if (["images", "image", "img", "attachments", "media"].includes(type)) {
    amount = parseInt(args[1]) || 50;
    filter = m => m.attachments.size > 0;
    filterName = "images";
  } else if (["bots", "bot"].includes(type)) {
    amount = parseInt(args[1]) || 50;
    filter = m => m.author.bot;
    filterName = "bot messages";
  } else if (["embeds", "embed"].includes(type)) {
    amount = parseInt(args[1]) || 50;
    filter = m => m.embeds.length > 0;
    filterName = "embeds";
  } else if (["links", "link", "urls", "url"].includes(type)) {
    amount = parseInt(args[1]) || 50;
    filter = m => /(https?:\/\/[^\s]+)/gi.test(m.content);
    filterName = "links";
  } else if (["text", "textonly", "noattach"].includes(type)) {
    amount = parseInt(args[1]) || 50;
    filter = m => m.attachments.size === 0 && m.embeds.length === 0;
    filterName = "text only";
  } else if (["mentions", "mention", "pings"].includes(type)) {
    amount = parseInt(args[1]) || 50;
    filter = m => m.mentions.users.size > 0 || m.mentions.roles.size > 0;
    filterName = "mentions";
  } else if (["humans", "human", "users"].includes(type)) {
    amount = parseInt(args[1]) || 50;
    filter = m => !m.author.bot;
    filterName = "human messages";
  } else if (["contains", "has", "with"].includes(type)) {
    const searchText = args.slice(2).join(" ").toLowerCase();
    amount = parseInt(args[1]) || 50;
    if (searchText) {
      filter = m => m.content.toLowerCase().includes(searchText);
      filterName = `containing "${searchText}"`;
    }
  } else if (["startswith", "starts"].includes(type)) {
    const searchText = args.slice(2).join(" ").toLowerCase();
    amount = parseInt(args[1]) || 50;
    if (searchText) {
      filter = m => m.content.toLowerCase().startsWith(searchText);
      filterName = `starting with "${searchText}"`;
    }
  } else {
    amount = parseInt(args[0]);
    const targetUser = msg.mentions.users.first();
    if (targetUser) {
      filter = m => m.author.id === targetUser.id;
      filterName = `from ${targetUser.username}`;
    }
  }

  if (!amount || amount < 1 || amount > 100) {
    const embed = createEmbed({
      title: `${EMOJIS.purge} ${bold("Purge Commands")}`,
      description: 
        `${bold("Basic Usage:")}\n` +
        `\`${PREFIX}purge <1-100>\` - Delete all messages\n` +
        `\`${PREFIX}purge <1-100> @user\` - Delete from user\n\n` +
        `${bold("Filter Types:")}\n` +
        `\`${PREFIX}purge images <1-100>\` - Delete only images/media\n` +
        `\`${PREFIX}purge bots <1-100>\` - Delete bot messages\n` +
        `\`${PREFIX}purge humans <1-100>\` - Delete human messages\n` +
        `\`${PREFIX}purge embeds <1-100>\` - Delete embeds\n` +
        `\`${PREFIX}purge links <1-100>\` - Delete links\n` +
        `\`${PREFIX}purge text <1-100>\` - Delete text only (no media)\n` +
        `\`${PREFIX}purge mentions <1-100>\` - Delete mentions\n` +
        `\`${PREFIX}purge contains <1-100> <text>\` - Delete containing text\n` +
        `\`${PREFIX}purge startswith <1-100> <text>\` - Delete starting with text`
    });
    return msg.reply({ embeds: [embed] });
  }

  try {
    await msg.delete().catch(() => {});
    let messages = await msg.channel.messages.fetch({ limit: 100 });
    
    if (filter) {
      messages = messages.filter(filter);
    }
    
    // Convert to array and limit to requested amount
    const messagesToDelete = Array.from(messages.values()).slice(0, amount);

    // Log media before deletion
    for (const message of messagesToDelete) {
      if (message.attachments.size > 0) {
        await logDeletedMedia(message, "Purge Command");
      }
    }

    const deletedMessages = await msg.channel.bulkDelete(messagesToDelete, true);
    const count = deletedMessages.size;

    await sendModLog(msg.guild, "purge", msg.author, filterName, `${count} messages deleted`, [
      { name: `${EMOJIS.messages} ${bold("Channel")}`, value: `${msg.channel}`, inline: true },
      { name: `${EMOJIS.chart} ${bold("Count")}`, value: `${count}`, inline: true },
      { name: `${EMOJIS.filter} ${bold("Filter")}`, value: filterName, inline: true }
    ]);

    const embed = createEmbed({
      title: `${EMOJIS.purge} ${bold("Messages Purged")}`,
      description: `${EMOJIS.success} Deleted ${bold(count.toString())} ${filterName} message${count !== 1 ? "s" : ""}!`,
      color: 0x00FF00
    });
    
    const reply = await msg.channel.send({ embeds: [embed] });
    setTimeout(() => reply.delete().catch(() => {}), 5000);
  } catch (error) {
    console.error("Purge error:", error);
    return msg.channel.send({ embeds: [createErrorEmbed("Purge Failed", "Failed to delete messages. Messages older than 14 days cannot be bulk deleted.")] });
  }
  return;
}

/* ================= CL COMMAND - TEXT ONLY DELETE ================= */
if (cmd === "cl") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Messages permission!")] });
  }

  const amount = parseInt(args[0]);
  if (!amount || amount < 1 || amount > 100) {
    return msg.reply({ embeds: [createErrorEmbed("Invalid Amount", `Usage: \`${PREFIX}cl <1-100>\` - Deletes text only messages (preserves media)`)] });
  }

  try {
    await msg.delete().catch(() => {});
    let messages = await msg.channel.messages.fetch({ limit: 100 });
    
    // Filter to only text messages (no attachments, no embeds)
    messages = messages.filter(m => m.attachments.size === 0 && m.embeds.length === 0);
    
    // Convert to array and limit to requested amount
    const messagesToDelete = Array.from(messages.values()).slice(0, amount);

    const deletedMessages = await msg.channel.bulkDelete(messagesToDelete, true);
    const count = deletedMessages.size;

    const embed = createEmbed({
      title: `${EMOJIS.purge} ${bold("Text Cleared")}`,
      description: `${EMOJIS.success} Deleted ${bold(count.toString())} text message${count !== 1 ? "s" : ""} (media preserved)!`,
      color: 0x00FF00
    });
    
    const reply = await msg.channel.send({ embeds: [embed] });
    setTimeout(() => reply.delete().catch(() => {}), 5000);
  } catch (error) {
    console.error("CL error:", error);
    return msg.channel.send({ embeds: [createErrorEmbed("Clear Failed", "Failed to delete messages.")] });
  }
  return;
}

  /* ================= NUKE COMMAND ================= */
  if (cmd === "nuke") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Channels permission!")] });
    }

    const reason = args.join(" ") || "Channel nuked";
    
    const confirmEmbed = createEmbed({
      title: `${EMOJIS.warning} ${bold("Confirm Nuke")}`,
      description: `Are you sure you want to nuke this channel?\n\nThis will:\n• Delete this channel\n• Create an identical copy\n• All messages will be lost\n\nType \`confirm\` within 30 seconds to proceed.`,
      color: 0xFF0000
    });
    
    await msg.reply({ embeds: [confirmEmbed] });
    
    try {
      const collected = await msg.channel.awaitMessages({
        filter: m => m.author.id === msg.author.id && m.content.toLowerCase() === "confirm",
        max: 1,
        time: 30000,
        errors: ["time"]
      });
      
      const channel = msg.channel;
      const position = channel.position;
      const newChannel = await channel.clone({ reason: `Nuked by ${msg.author.tag}: ${reason}` });
      await newChannel.setPosition(position);
      await channel.delete(`Nuked by ${msg.author.tag}`);
      
      const nukeEmbed = createEmbed({
        title: `💥 ${bold("Channel Nuked")}`,
        description: `${EMOJIS.success} Channel has been nuked by ${msg.author}!\n${bold("Reason:")} ${reason}`,
        color: 0xFF0000
      });
      await newChannel.send({ embeds: [nukeEmbed] });
      
      await sendModLog(msg.guild, "nuke", msg.author, `#${channel.name}`, reason);
    } catch (error) {
      if (error.message === "time") {
        return msg.reply({ embeds: [createInfoEmbed("Cancelled", "Nuke cancelled - timed out.")] });
      }
      console.error("Nuke error:", error);
    }
    return;
  }

  /* ================= MUTE COMMAND ================= */
  if (cmd === "mute" || cmd === "timeout") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Moderate Members permission!")] });
    }

    const target = msg.mentions.members.first();
    if (!target) {
      return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}mute @user <duration> [reason]\`\nExample: \`${PREFIX}mute @user 10m Spamming\``)] });
    }

    let duration = args[1] || "10m";
    let reason = args.slice(2).join(" ") || "No reason provided";

    if (target.id === msg.author.id) return msg.reply({ embeds: [createErrorEmbed("Error", "You can't mute yourself!")] });
    if (target.id === client.user.id) return msg.reply({ embeds: [createErrorEmbed("Error", "I can't mute myself!")] });
    if (target.roles.highest.position >= msg.member.roles.highest.position && msg.author.id !== msg.guild.ownerId) {
      return msg.reply({ embeds: [createErrorEmbed("Error", "Target has higher or equal role!")] });
    }
    if (!target.moderatable) return msg.reply({ embeds: [createErrorEmbed("Error", "I cannot moderate this user!")] });

    const ms = parseDuration(duration);
    if (!ms) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Duration", "Use format: 10s, 10m, 1h, 1d")] });
    }
    if (ms > 2419200000) return msg.reply({ embeds: [createErrorEmbed("Error", "Maximum timeout is 28 days!")] });

    try {
      await target.timeout(ms, reason);
      await sendModLog(msg.guild, "mute", msg.author, `${target.user.tag} (${target.id})`, reason);

      // Try to DM the user
      await target.send({
        embeds: [createEmbed({
          title: `${EMOJIS.mute} ${bold("You've Been Muted")}`,
          description:
            `<a:zzz_arrow_hash:1485872093437497434> **Server** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${msg.guild.name}\n` +
            `<a:zzz_arrow_hash:1485872093437497434> **Duration** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${formatDuration(ms)}\n` +
            `<a:zzz_arrow_hash:1485872093437497434> **Reason** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${reason}`,
          color: 0xFF0000
        })]
      }).catch(() => {});

      const embed = createEmbed({
        title: `${EMOJIS.mute} ${bold("User Muted")}`,
        description:
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("User")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${target.user.tag}\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Duration")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${formatDuration(ms)}\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Moderator")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${msg.author.tag}\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Reason")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${reason}`,
        color: 0xFFAA00
      });

      return msg.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Mute error:", error);
      return msg.reply({ embeds: [createErrorEmbed("Mute Failed", error.message)] });
    }
  }

  /* ================= UNMUTE COMMAND ================= */
  if (cmd === "unmute" || cmd === "untimeout") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Moderate Members permission!")] });
    }

    const target = msg.mentions.members.first();
    if (!target) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}unmute @user [reason]\``)] });
    if (!target.isCommunicationDisabled()) return msg.reply({ embeds: [createErrorEmbed("Not Muted", "This user is not muted!")] });

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await target.timeout(null, reason);
      await sendModLog(msg.guild, "unmute", msg.author, `${target.user.tag} (${target.id})`, reason);

      const embed = createEmbed({
        title: `${EMOJIS.unmute} ${bold("User Unmuted")}`,
        description:
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("User")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${target.user.tag}\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Moderator")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${msg.author.tag}\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Reason")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${reason}`,
        color: 0x00FF00
      });

      return msg.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Unmute error:", error);
      return msg.reply({ embeds: [createErrorEmbed("Unmute Failed", error.message)] });
    }
  }

  /* ================= KICK COMMAND ================= */
  if (cmd === "kick") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Kick Members permission!")] });
    }

    const target = msg.mentions.members.first();
    if (!target) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}kick @user [reason]\``)] });
    if (!target.kickable) return msg.reply({ embeds: [createErrorEmbed("Error", "Cannot kick this user!")] });
    if (target.roles.highest.position >= msg.member.roles.highest.position && msg.author.id !== msg.guild.ownerId) {
      return msg.reply({ embeds: [createErrorEmbed("Error", "Target has higher or equal role!")] });
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await target.send({
        embeds: [createEmbed({
          title: `${EMOJIS.kick} ${bold("You've Been Kicked")}`,
          description:
            `<a:zzz_arrow_hash:1485872093437497434> **Server** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${msg.guild.name}\n` +
            `<a:zzz_arrow_hash:1485872093437497434> **Reason** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${reason}`,
          color: 0xFF0000
        })]
      }).catch(() => {});
      
      await target.kick(reason);
      await sendModLog(msg.guild, "kick", msg.author, `${target.user.tag} (${target.id})`, reason);

      const embed = createEmbed({
        title: `${EMOJIS.kick} ${bold("User Kicked")}`,
        description:
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("User")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${target.user.tag}\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Moderator")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${msg.author.tag}\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Reason")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${reason}`,
        color: 0xFF6B6B
      });

      return msg.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Kick error:", error);
      return msg.reply({ embeds: [createErrorEmbed("Kick Failed", error.message)] });
    }
  }

  /* ================= BAN COMMAND ================= */
  if (cmd === "ban") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Ban Members permission!")] });
    }

    const target = msg.mentions.members.first();
    if (!target) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}ban @user [reason]\``)] });
    if (!target.bannable) return msg.reply({ embeds: [createErrorEmbed("Error", "Cannot ban this user!")] });
    if (target.roles.highest.position >= msg.member.roles.highest.position && msg.author.id !== msg.guild.ownerId) {
      return msg.reply({ embeds: [createErrorEmbed("Error", "Target has higher or equal role!")] });
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      await target.send({
        embeds: [createEmbed({
          title: `${EMOJIS.ban} ${bold("You've Been Banned")}`,
          description:
            `<a:zzz_arrow_hash:1485872093437497434> **Server** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${msg.guild.name}\n` +
            `<a:zzz_arrow_hash:1485872093437497434> **Reason** <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${reason}`,
          color: 0xFF0000
        })]
      }).catch(() => {});
      
      await target.ban({ reason, deleteMessageSeconds: 604800 });
      await sendModLog(msg.guild, "ban", msg.author, `${target.user.tag} (${target.id})`, reason);

      const embed = createEmbed({
        title: `${EMOJIS.ban} ${bold("User Banned")}`,
        description:
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("User")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${target.user.tag}\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Moderator")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${msg.author.tag}\n` +
          `<a:zzz_arrow_hash:1485872093437497434> ${bold("Reason")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${reason}`,
        color: 0xFF0000
      });

      return msg.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Ban error:", error);
      return msg.reply({ embeds: [createErrorEmbed("Ban Failed", error.message)] });
    }
  }

  /* ================= UNBAN COMMAND ================= */
  if (cmd === "unban") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Ban Members permission!")] });
    }

    const userId = args[0];
    if (!userId) return msg.reply({ embeds: [createErrorEmbed("Missing ID", `Usage: \`${PREFIX}unban <userID> [reason]\``)] });

    const reason = args.slice(1).join(" ") || "No reason provided";

    try {
      const bans = await msg.guild.bans.fetch();
      const bannedUser = bans.get(userId);
      if (!bannedUser) return msg.reply({ embeds: [createErrorEmbed("Not Banned", "This user is not banned!")] });

      await msg.guild.members.unban(userId, reason);
      await sendModLog(msg.guild, "unban", msg.author, `${bannedUser.user.tag} (${userId})`, reason);

      const embed = createEmbed({
        title: `${EMOJIS.sparkle} ${bold("User Unbanned")}`,
        description:
          `<a:zzz_arrow_hash:1485872093437497434>  **User:** ${bannedUser.user.tag}<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434>  **Moderator:** ${msg.author.tag}<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434>  **Reason:** ${reason}<a:zzz_Exclamation:1485872115662983288>`,
        color: 0x00FF00
      });

      return msg.reply({ embeds: [embed] });
    } catch (error) {
      console.error("Unban error:", error);
      return msg.reply({ embeds: [createErrorEmbed("Unban Failed", "Make sure the ID is correct.")] });
    }
  }

  /* ================= WARN COMMAND ================= */
  if (cmd === "warn") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Moderate Members permission!")] });
    }

    const target = msg.mentions.users.first();
    if (!target) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}warn @user [reason]\``)] });

    const reason = args.slice(1).join(" ") || "No reason provided";
    const warning = addWarning(guildId, target.id, msg.author.id, reason);
    const warnings = getWarnings(guildId, target.id);

    await sendModLog(msg.guild, "warn", msg.author, `${target.tag} (${target.id})`, reason);

    // DM the user
    await target.send({
      embeds: [createEmbed({
        title: `${EMOJIS.warn} ${bold("You've Been Warned")}`,
        description:
          `<a:zzz_arrow_hash:1485872093437497434>  **Server:** ${msg.guild.name}<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434>  **Reason:** ${reason}<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434>  **Total Warnings:** ${warnings.length}<a:zzz_Exclamation:1485872115662983288>`,
        color: 0xFFAA00
      })]
    }).catch(() => {});

    const embed = createEmbed({
      title: `${EMOJIS.warn} ${bold("User Warned")}`,
      description:
        `<a:zzz_arrow_hash:1485872093437497434>  **User:** ${target.tag}<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:zzz_arrow_hash:1485872093437497434>  **Moderator:** ${msg.author.tag}<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:zzz_arrow_hash:1485872093437497434>  **Total Warnings:** ${warnings.length}<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:zzz_arrow_hash:1485872093437497434>  **Reason:** ${reason}<a:zzz_Exclamation:1485872115662983288>`,
      color: 0xFFAA00
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= WARNINGS COMMAND ================= */
  if (cmd === "warnings" || cmd === "warns" || cmd === "infractions") {
    const target = msg.mentions.users.first() || msg.author;
    const warnings = getWarnings(guildId, target.id);

    if (warnings.length === 0) {
      return msg.reply({ embeds: [createSuccessEmbed("No Warnings", `${bold(target.tag)} has no warnings!`)] });
    }

    const embed = createEmbed({
      title: `${EMOJIS.warn} ${bold(`Warnings for ${target.tag}`)}`,
      description: warnings.map((w, idx) => 
        `<a:zzz_arrow_hash:1485872093437497434>  **#${idx + 1} — ${w.reason}**<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:arrow_arrow:1485908026006442015>  <t:${Math.floor(w.timestamp / 1000)}:R> by <@${w.moderator}> • ID: \`${w.id}\``
      ).join("\n\n"),
      footer: `Total: ${warnings.length} warning(s)`,
      color: 0xFFAA00
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= CLEAR WARNINGS COMMAND ================= */
  if (cmd === "clearwarns" || cmd === "clearwarnings" || cmd === "delwarns") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Moderate Members permission!")] });
    }

    const target = msg.mentions.users.first();
    if (!target) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}clearwarns @user\``)] });

    const count = clearWarnings(guildId, target.id);
    await sendModLog(msg.guild, "unwarn", msg.author, `${target.tag} (${target.id})`, `Cleared ${count} warning(s)`);

    return msg.reply({ embeds: [createSuccessEmbed("Warnings Cleared", `Cleared ${bold(count.toString())} warning(s) from ${bold(target.tag)}!`)] });
  }

  /* ================= REMOVE WARNING COMMAND ================= */
  if (cmd === "removewarn" || cmd === "delwarn" || cmd === "unwarn") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Moderate Members permission!")] });
    }

    const target = msg.mentions.users.first();
    const warnId = args[1];
    
    if (!target || !warnId) {
      return msg.reply({ embeds: [createErrorEmbed("Missing Info", `Usage: \`${PREFIX}removewarn @user <warnID>\``)] });
    }

    const success = removeWarning(guildId, target.id, warnId);
    if (success) {
      return msg.reply({ embeds: [createSuccessEmbed("Warning Removed", `Removed warning \`${warnId}\` from ${bold(target.tag)}!`)] });
    } else {
      return msg.reply({ embeds: [createErrorEmbed("Not Found", "Warning ID not found!")] });
    }
  }

  /* ================= SLOWMODE COMMAND ================= */
  if (cmd === "slowmode" || cmd === "slow") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Channels permission!")] });
    }

    const durationStr = args[0];
    if (!durationStr) {
      return msg.reply({ embeds: [createErrorEmbed("Missing Duration", `Usage: \`${PREFIX}slowmode <duration/off>\`\nExamples: \`5s\`, \`1m\`, \`off\``)] });
    }

    let seconds = 0;
    if (durationStr !== "0" && durationStr !== "off" && durationStr !== "disable") {
      const duration = parseDuration(durationStr);
      if (!duration) return msg.reply({ embeds: [createErrorEmbed("Invalid Duration", "Use format: 5s, 1m, 1h")] });
      seconds = Math.floor(duration / 1000);
      if (seconds > 21600) seconds = 21600;
    }

    await msg.channel.setRateLimitPerUser(seconds);
    await sendModLog(msg.guild, "slowmode", msg.author, `#${msg.channel.name}`, `Set to ${seconds}s`);

    const embed = createEmbed({
      title: `${EMOJIS.slowmode} ${bold("Slowmode Updated")}`,
      description:
        `<a:zzz_arrow_hash:1485872093437497434>  **Channel:** ${msg.channel}<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:zzz_arrow_hash:1485872093437497434>  **Status:** ${seconds === 0 ? "Disabled" : `Set to ${bold(formatDuration(seconds * 1000))}`}<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:zzz_arrow_hash:1485872093437497434>  **Moderator:** ${msg.author.tag}<a:zzz_Exclamation:1485872115662983288>`,
      color: 0x00FF00
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= LOCK COMMAND ================= */
  if (cmd === "lock") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Channels permission!")] });
    }

    const channel = msg.mentions.channels.first() || msg.channel;
    const reason = args.filter(a => !a.startsWith("<#")).join(" ") || "No reason provided";

    await channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: false });
    await sendModLog(msg.guild, "lock", msg.author, `#${channel.name}`, reason);

    const embed = createEmbed({
      title: `${EMOJIS.lock} ${bold("Channel Locked")}`,
      description:
        `<a:zzz_arrow_hash:1485872093437497434>  **Channel:** ${channel}<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:zzz_arrow_hash:1485872093437497434>  **Moderator:** ${msg.author.tag}<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:zzz_arrow_hash:1485872093437497434>  **Reason:** ${reason}<a:zzz_Exclamation:1485872115662983288>`,
      color: 0xFF0000
    });

    await channel.send({ embeds: [embed] });
    if (channel.id !== msg.channel.id) {
      return msg.reply({ embeds: [createSuccessEmbed("Channel Locked", `${channel} has been locked!`)] });
    }
  }

  /* ================= UNLOCK COMMAND ================= */
  if (cmd === "unlock") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Channels permission!")] });
    }

    const channel = msg.mentions.channels.first() || msg.channel;
    const reason = args.filter(a => !a.startsWith("<#")).join(" ") || "No reason provided";

    await channel.permissionOverwrites.edit(msg.guild.id, { SendMessages: null });
    await sendModLog(msg.guild, "unlock", msg.author, `#${channel.name}`, reason);

    const embed = createEmbed({
      title: `${EMOJIS.unlock} ${bold("Channel Unlocked")}`,
      description:
        `<a:zzz_arrow_hash:1485872093437497434>  **Channel:** ${channel}<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:zzz_arrow_hash:1485872093437497434>  **Moderator:** ${msg.author.tag}<a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:zzz_arrow_hash:1485872093437497434>  **Reason:** ${reason}<a:zzz_Exclamation:1485872115662983288>`,
      color: 0x00FF00
    });

    await channel.send({ embeds: [embed] });
    if (channel.id !== msg.channel.id) {
      return msg.reply({ embeds: [createSuccessEmbed("Channel Unlocked", `${channel} has been unlocked!`)] });
    }
  }

  /* ================= AFK COMMANDS ================= */
  if (cmd === "gafk") {
    // Shortcut: treat "gafk [reason]" exactly like "afk global [reason]"
    args.unshift("global");
    cmd = "afk";
  }

  if (cmd === "afk") {
    const subCmd = args[0]?.toLowerCase();

    // ── afk global <reason> ── set global AFK directly without the button prompt
    if (subCmd === "global") {
      if (guildData(guildId).afk?.enabled === false) {
        return msg.reply({ embeds: [createErrorEmbed("Disabled", "AFK system is currently disabled!")] });
      }
      const reason = args.slice(1).join(" ") || "AFK";
      const afkEntry = {
        reason,
        time: Date.now(),
        type: "global",
        guildId,
        expiresAt: null,
        mentions: [],
      };
      if (!db.globalAfk) db.globalAfk = {};
      db.globalAfk[msg.author.id] = afkEntry;
      saveDB();

      const afkContainer = new ContainerBuilder()
        .addSectionComponents(section =>
          section
            .addTextDisplayComponents(text =>
              text.setContent(
                `<a:sangry:1486688548722708653>**You are now Global AFK!**\n` +
                `Hey, ${msg.author}\n\n` +
                `<a:zzz_arrow_hash:1485872093437497434> **Status:** 🌐 Global AFK<a:zzz_Exclamation:1485872115662983288>\n` +
                `<a:zzz_arrow_hash:1485872093437497434> **Reason:** ${reason}<a:zzz_Exclamation:1485872115662983288>`
              )
            )
            .setThumbnailAccessory(thumb =>
              thumb.setURL(msg.author.displayAvatarURL({ dynamic: true, size: 256 }))
            )
        )
        .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(text =>
          text.setContent(`-# Requested by: ${msg.author.tag}`)
        );

      return msg.reply({ components: [afkContainer], flags: MessageFlags.IsComponentsV2 });
    }

    if (subCmd === "enable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      guildData(guildId).afk.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("AFK Enabled", "AFK system is now enabled!")] });
    }

    if (subCmd === "disable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      guildData(guildId).afk.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("AFK Disabled", "AFK system is now disabled!")] });
    }

    if (subCmd === "remove" || subCmd === "off") {
      const globalAfk = db.globalAfk?.[msg.author.id];
      const serverAfk = guildData(guildId).afk?.users?.[msg.author.id];
      const afkData = globalAfk || serverAfk;
      if (afkData) {
        const afkType = afkData.type || "global";
        if (afkType === "global") {
          delete db.globalAfk[msg.author.id];
        } else {
          delete guildData(guildId).afk.users[msg.author.id];
        }
        saveDB();
        return msg.reply({ embeds: [createEmbed({
          title: `${EMOJIS.afk} ${bold("AFK Removed")}`,
          description:
            `<a:zzz_arrow_hash:1485872093437497434>  **Status:** Your ${afkType} AFK has been removed<a:zzz_Exclamation:1485872115662983288>`,
          color: 0x00FF00
        })] });
      }
      return msg.reply({ embeds: [createInfoEmbed("Not AFK", "You're not currently AFK!")] });
    }

    if (subCmd === "list") {
      // Combine server AFK users + global AFK users visible in this server
      const serverAfkUsers = Object.entries(guildData(guildId).afk?.users || {}).filter(([, data]) =>
        data.type === "server" && data.guildId === msg.guild.id
      );
      const globalAfkUsers = Object.entries(db.globalAfk || {});
      const afkUsers = [...globalAfkUsers, ...serverAfkUsers];

      if (afkUsers.length === 0) {
        return msg.reply({ embeds: [createInfoEmbed("No AFK Users", "There are no AFK users in this server!")] });
      }

      const userList = afkUsers.map(([userId, data]) => {
        const typeEmoji = data.type === "global" ? "🌐" : "🏠";
        return `<a:zzz_arrow_hash:1485872093437497434>  ${typeEmoji} <@${userId}> — ${data.reason}<a:zzz_Exclamation:1485872115662983288>`;
      }).join("\n");

      const embed = createEmbed({
        title: `${EMOJIS.afk} ${bold("AFK Users")}`,
        description: userList + `\n\n🌐 = Global  |  🏠 = Server`
      });

      return msg.reply({ embeds: [embed] });
    }

    if (subCmd === "mentions") {
      const afkData = db.globalAfk?.[msg.author.id] || guildData(guildId).afk?.users?.[msg.author.id];
      if (!afkData || !afkData.mentions || afkData.mentions.length === 0) {
        return msg.reply({ embeds: [createInfoEmbed("No Mentions", "You have no mentions while AFK!")] });
      }

      const mentionsList = afkData.mentions.slice(0, 10).map((mention, i) => {
        const timeAgo = `<t:${Math.floor(mention.time / 1000)}:R>`;
        return `<a:zzz_arrow_hash:1485872093437497434>  **#${i + 1}** <@${mention.byId}> in <#${mention.channelId}> ${timeAgo}<a:zzz_Exclamation:1485872115662983288>`;
      }).join("\n");

      const embed = createEmbed({
        title: `${EMOJIS.afk} ${bold("AFK Mentions")}`,
        description: mentionsList,
        footer: { text: `Showing ${Math.min(afkData.mentions.length, 10)} of ${afkData.mentions.length} mentions` }
      });

      return msg.reply({ embeds: [embed] });
    }

    if (subCmd === "clear") {
      const globalAfk = db.globalAfk?.[msg.author.id];
      const serverAfk = guildData(guildId).afk?.users?.[msg.author.id];
      const afkData = globalAfk || serverAfk;
      if (afkData) {
        afkData.mentions = [];
        saveDB();
        return msg.reply({ embeds: [createSuccessEmbed("Mentions Cleared", "Your AFK mentions have been cleared!")] });
      }
      return msg.reply({ embeds: [createInfoEmbed("Not AFK", "You're not currently AFK!")] });
    }

    if (subCmd === "setmessage" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const message = args.slice(1).join(" ");
      if (!message) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Message", `Usage: \`${PREFIX}afk setmessage <message>\`\nPlaceholders: {user}, {reason}`)] });
      }
      guildData(guildId).afk.message = message;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("AFK Message Set", `AFK message template updated!`)] });
    }


    // ── MAIN ,afk COMMAND — Interactive button flow (Screenshot 1) ──
    if (guildData(guildId).afk?.enabled === false) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "AFK system is currently disabled!")] });
    }

    const reason = args.join(" ") || "AFK";
    const safeReason = encodeURIComponent(reason).slice(0, 80); // keep customId under 100 chars

    // ── AFK Container (Components V2) ──
    const typeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`afkt_g_${msg.author.id}_${safeReason}`)
        .setLabel("Global AFK")
        .setEmoji("🌐")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`afkt_s_${msg.author.id}_${safeReason}`)
        .setLabel("Server AFK")
        .setEmoji("🏠")
        .setStyle(ButtonStyle.Success)
    );

   const afkContainer = new ContainerBuilder()
      .addSectionComponents(section =>
        section
          .addTextDisplayComponents(text =>
            text.setContent(
              `<a:sangry:1486688548722708653>**AFK ? See you soon!**\n` +
              `Hey, ${msg.author}\n\n` +
              `**>  Choose your preferred AFK status type**`
            )
          )
          .setThumbnailAccessory(thumb =>
            thumb.setURL(msg.author.displayAvatarURL({ dynamic: true, size: 256 }))
          )
      )
      .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
      .addActionRowComponents(typeRow)
      .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(text =>
        text.setContent(`-# Requested by: ${msg.author.tag}`)
      );

    return msg.reply({ components: [afkContainer], flags: MessageFlags.IsComponentsV2 });
  }

  /* ================= AVATAR COMMAND ================= */
  if (cmd === "av" || cmd === "avatar" || cmd === "pfp") {
    const target = msg.mentions.users.first() || msg.author;
    const avatarURL = target.displayAvatarURL({ dynamic: true, size: 4096 });

    const embed = createEmbed({
      title: `${EMOJIS.image} ${bold(`${target.username}'s Avatar`)}`,
      image: avatarURL,
      footer: `Requested by ${msg.author.username}`
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Download").setStyle(ButtonStyle.Link).setURL(avatarURL)
    );

    return msg.reply({ embeds: [embed], components: [row] });
  }

  /* ================= BANNER COMMAND ================= */
  if (cmd === "banner" || cmd === "userbanner") {
    const target = msg.mentions.users.first() || msg.author;
    const user = await client.users.fetch(target.id, { force: true });
    const bannerURL = user.bannerURL({ dynamic: true, size: 4096 });

    if (!bannerURL) {
      return msg.reply({ embeds: [createErrorEmbed("No Banner", `${target.username} doesn't have a banner.`)] });
    }

    const embed = createEmbed({
      title: `${EMOJIS.image} ${bold(`${user.username}'s Banner`)}`,
      image: bannerURL,
      footer: `Requested by ${msg.author.username}`
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Download").setStyle(ButtonStyle.Link).setURL(bannerURL)
    );

    return msg.reply({ embeds: [embed], components: [row] });
  }

  /* ================= USERINFO COMMAND ================= */
  if (cmd === "userinfo" || cmd === "ui" || cmd === "whois" || cmd === "user") {
    const target = msg.mentions.users.first() || msg.author;
    const member = await msg.guild.members.fetch(target.id).catch(() => null);

    const embed = createEmbed({
      title: `${EMOJIS.confession} ${bold(target.tag)}`,
      thumbnail: target.displayAvatarURL({ dynamic: true, size: 256 }),
      color: member?.displayColor || BOT_COLOR,
      fields: [
        { name: `🆔 ${bold("User ID")}`, value: target.id, inline: true },
        { name: `🤖 ${bold("Bot")}`, value: target.bot ? `${EMOJIS.success} Yes` : `${EMOJIS.error} No`, inline: true },
        { name: `${EMOJIS.calendar} ${bold("Created")}`, value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true }
      ]
    });

    if (member) {
      embed.addFields(
        { name: `📥 ${bold("Joined")}`, value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: `🎭 ${bold("Nickname")}`, value: member.nickname || "None", inline: true },
        { name: `📊 ${bold("Position")}`, value: `#${[...msg.guild.members.cache.values()].sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).findIndex(m => m.id === member.id) + 1}`, inline: true },
        { name: `🎨 ${bold("Roles [${member.roles.cache.size - 1}]")}`, value: member.roles.cache.filter(r => r.id !== msg.guild.id).map(r => r).slice(0, 10).join(", ") || "None" }
      );
      if (member.premiumSince) {
        embed.addFields({ name: `${EMOJIS.boost} ${bold("Boosting")}`, value: `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`, inline: true });
      }
    }

    return msg.reply({ embeds: [embed] });
  }

  /* ================= SERVERINFO COMMAND ================= */
  if (cmd === "serverinfo" || cmd === "si" || cmd === "server" || cmd === "guild") {
    const guild = msg.guild;
    const owner = await guild.fetchOwner();
    const members = await guild.members.fetch();
    const humans = members.filter(m => !m.user.bot).size;
    const bots = members.filter(m => m.user.bot).size;
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;

    const embed = createEmbed({
      title: `🏠 ${bold(guild.name)}`,
      thumbnail: guild.iconURL({ dynamic: true, size: 256 }),
      fields: [
        { name: `🆔 ${bold("Server ID")}`, value: guild.id, inline: true },
        { name: `${EMOJIS.crown} ${bold("Owner")}`, value: `${owner.user.tag}`, inline: true },
        { name: `${EMOJIS.calendar} ${bold("Created")}`, value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: `👥 ${bold("Members")}`, value: `Total: ${guild.memberCount}\nHumans: ${humans}\nBots: ${bots}`, inline: true },
        { name: `💬 ${bold("Channels")}`, value: `Total: ${guild.channels.cache.size}\nText: ${textChannels}\nVoice: ${voiceChannels}`, inline: true },
        { name: `🎭 ${bold("Roles")}`, value: `${guild.roles.cache.size}`, inline: true },
        { name: `😀 ${bold("Emojis")}`, value: `${guild.emojis.cache.size}`, inline: true },
        { name: `${EMOJIS.sticker} ${bold("Stickers")}`, value: `${guild.stickers.cache.size}`, inline: true },
        { name: `${EMOJIS.boost} ${bold("Boosts")}`, value: `Level ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true }
      ]
    });

    if (guild.bannerURL()) embed.setImage(guild.bannerURL({ size: 1024 }));

    return msg.reply({ embeds: [embed] });
  }

  /* ================= ROLEINFO COMMAND ================= */
  if (cmd === "roleinfo" || cmd === "ri" || cmd === "role") {
    const role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[0]);
    if (!role) {
      return msg.reply({ embeds: [createErrorEmbed("Missing Role", `Usage: \`${PREFIX}roleinfo @role\``)] });
    }

    const embed = createEmbed({
      title: `🎭 ${bold(role.name)}`,
      color: role.color || BOT_COLOR,
      fields: [
        { name: `🆔 ${bold("Role ID")}`, value: role.id, inline: true },
        { name: `🎨 ${bold("Color")}`, value: role.hexColor, inline: true },
        { name: `👥 ${bold("Members")}`, value: `${role.members.size}`, inline: true },
        { name: `📍 ${bold("Position")}`, value: `${role.position}`, inline: true },
        { name: `🔔 ${bold("Mentionable")}`, value: role.mentionable ? `${EMOJI_ENABLE} Yes` : `${EMOJI_DISABLE} No`, inline: true },
        { name: `📌 ${bold("Hoisted")}`, value: role.hoist ? `${EMOJI_ENABLE} Yes` : `${EMOJI_DISABLE} No`, inline: true },
        { name: `${EMOJIS.calendar} ${bold("Created")}`, value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true }
      ]
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= MEMBERCOUNT COMMAND ================= */
  if (cmd === "membercount" || cmd === "mc" || cmd === "members") {
    const guild = msg.guild;
    const members = await guild.members.fetch();
    const humans = members.filter(m => !m.user.bot).size;
    const bots = members.filter(m => m.user.bot).size;
    const online = members.filter(m => m.presence?.status === "online").size;
    const idle = members.filter(m => m.presence?.status === "idle").size;
    const dnd = members.filter(m => m.presence?.status === "dnd").size;
    const offline = members.filter(m => !m.presence || m.presence.status === "offline").size;

    const embed = createEmbed({
      title: `👥 ${bold("Member Count")}`,
      fields: [
        { name: `${EMOJIS.chart} ${bold("Total")}`, value: `${guild.memberCount}`, inline: true },
        { name: `${EMOJIS.confession} ${bold("Humans")}`, value: `${humans}`, inline: true },
        { name: `🤖 ${bold("Bots")}`, value: `${bots}`, inline: true },
        { name: `🟢 ${bold("Online")}`, value: `${online}`, inline: true },
        { name: `🟡 ${bold("Idle")}`, value: `${idle}`, inline: true },
        { name: `🔴 ${bold("DND")}`, value: `${dnd}`, inline: true },
        { name: `⚫ ${bold("Offline")}`, value: `${offline}`, inline: true }
      ]
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= SNIPE COMMAND (Enhanced) ================= */
if (cmd === "snipe" || cmd === "s") {
  const sniped = snipedMessages.get(msg.channel.id);
  if (!sniped) {
    return msg.reply({ embeds: [createErrorEmbed("Nothing to Snipe", "No recently deleted messages in this channel.")] });
  }

  const embed = createEmbed({
    title: `🎯 ${bold("Sniped Message")}`,
    description: sniped.content || "*No text content*",
    footer: `Deleted ${formatDuration(Date.now() - sniped.timestamp)} ago`,
    color: 0xFF6B6B
  });
  embed.setAuthor({ name: sniped.author.tag, iconURL: sniped.author.displayAvatarURL({ dynamic: true }) });

  // Handle attachments with better image display
  if (sniped.attachments && sniped.attachments.length > 0) {
    const images = sniped.attachments.filter(a => a.contentType?.startsWith("image"));
    const videos = sniped.attachments.filter(a => a.contentType?.startsWith("video"));
    const others = sniped.attachments.filter(a => !a.contentType?.startsWith("image") && !a.contentType?.startsWith("video"));

    // Set first image as embed image
    if (images.length > 0) {
      embed.setImage(images[0].url);
    }

    // List all attachments
    const attachmentList = [];
    if (images.length > 0) {
      attachmentList.push(`**Images (${images.length}):**\n${images.map((a, i) => `${i + 1}. [${a.name}](${a.url})`).join("\n")}`);
    }
    if (videos.length > 0) {
      attachmentList.push(`**Videos (${videos.length}):**\n${videos.map((a, i) => `${i + 1}. [${a.name}](${a.url})`).join("\n")}`);
    }
    if (others.length > 0) {
      attachmentList.push(`**Files (${others.length}):**\n${others.map((a, i) => `${i + 1}. [${a.name}](${a.url})`).join("\n")}`);
    }

    if (attachmentList.length > 0) {
      embed.addFields({ 
        name: `${EMOJIS.file} ${bold("Attachments")}`, 
        value: attachmentList.join("\n\n").slice(0, 1024) 
      });
    }
  }

  // Handle embeds
  if (sniped.embeds && sniped.embeds.length > 0) {
    embed.addFields({ 
      name: `📋 ${bold("Embeds")}`, 
      value: `${sniped.embeds.length} embed(s) in original message` 
    });
  }

  return msg.reply({ embeds: [embed] });
}

/* ================= SNIPE ALL COMMAND (Channel History) ================= */
if (cmd === "snipeall" || cmd === "sall" || cmd === "snipes") {
  const history = channelSnipeHistory.get(msg.channel.id);
  
  if (!history || history.length === 0) {
    return msg.reply({ embeds: [createErrorEmbed("No History", "No recently deleted messages in this channel.")] });
  }

  const page = parseInt(args[0]) || 1;
  const perPage = 5;
  const totalPages = Math.ceil(history.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageData = history.slice(start, end);

  const description = pageData.map((sniped, idx) => {
    const position = start + idx + 1;
    const timeAgo = `<t:${Math.floor(sniped.timestamp / 1000)}:R>`;
    const contentPreview = sniped.content ? sniped.content.slice(0, 100) : "*No text*";
    const hasMedia = sniped.attachments.length > 0 ? ` 📎${sniped.attachments.length}` : "";
    
    return `**${position}.** ${sniped.author.tag} ${timeAgo}${hasMedia}\n↳ ${contentPreview}${sniped.content && sniped.content.length > 100 ? "..." : ""}`;
  }).join("\n\n");

  const embed = createEmbed({
    title: `🎯 ${bold("Deleted Messages History")}`,
    description: description || "No messages",
    footer: `Page ${page}/${totalPages} • ${history.length} total messages • Use ${PREFIX}snipe <number> to view details`,
    color: 0xFF6B6B
  });

  return msg.reply({ embeds: [embed] });
}

/* ================= SNIPE BY INDEX COMMAND ================= */
if (cmd === "snipe" && args[0] && !isNaN(args[0])) {
  const index = parseInt(args[0]) - 1;
  const history = channelSnipeHistory.get(msg.channel.id);
  
  if (!history || history.length === 0) {
    return msg.reply({ embeds: [createErrorEmbed("No History", "No recently deleted messages in this channel.")] });
  }

  if (index < 0 || index >= history.length) {
    return msg.reply({ embeds: [createErrorEmbed("Invalid Index", `Please use a number between 1 and ${history.length}`)] });
  }

  const sniped = history[index];

  const embed = createEmbed({
    title: `🎯 ${bold(`Sniped Message #${index + 1}`)}`,
    description: sniped.content || "*No text content*",
    footer: `Deleted ${formatDuration(Date.now() - sniped.timestamp)} ago`,
    color: 0xFF6B6B
  });
  embed.setAuthor({ name: sniped.author.tag, iconURL: sniped.author.displayAvatarURL({ dynamic: true }) });

  // Handle attachments with better image display
  if (sniped.attachments && sniped.attachments.length > 0) {
    const images = sniped.attachments.filter(a => a.contentType?.startsWith("image"));
    const videos = sniped.attachments.filter(a => a.contentType?.startsWith("video"));
    const others = sniped.attachments.filter(a => !a.contentType?.startsWith("image") && !a.contentType?.startsWith("video"));

    // Set first image as embed image
    if (images.length > 0) {
      embed.setImage(images[0].url);
    }

    // List all attachments
    const attachmentList = [];
    if (images.length > 0) {
      attachmentList.push(`**Images (${images.length}):**\n${images.map((a, i) => `${i + 1}. [${a.name}](${a.url})`).join("\n")}`);
    }
    if (videos.length > 0) {
      attachmentList.push(`**Videos (${videos.length}):**\n${videos.map((a, i) => `${i + 1}. [${a.name}](${a.url})`).join("\n")}`);
    }
    if (others.length > 0) {
      attachmentList.push(`**Files (${others.length}):**\n${others.map((a, i) => `${i + 1}. [${a.name}](${a.url})`).join("\n")}`);
    }

    if (attachmentList.length > 0) {
      embed.addFields({ 
        name: `${EMOJIS.file} ${bold("Attachments")}`, 
        value: attachmentList.join("\n\n").slice(0, 1024) 
      });
    }
  }

  return msg.reply({ embeds: [embed] });
}

/* ================= EDITSNIPE COMMAND (Enhanced) ================= */
if (cmd === "editsnipe" || cmd === "esnipe" || cmd === "es") {
  const sniped = editSnipedMessages.get(msg.channel.id);
  if (!sniped) {
    return msg.reply({ embeds: [createErrorEmbed("Nothing to Snipe", "No recently edited messages in this channel.")] });
  }

  const embed = createEmbed({
    title: `✏️ ${bold("Edited Message")}`,
    fields: [
      { name: `${EMOJIS.error} ${bold("Before")}`, value: sniped.oldContent?.slice(0, 1000) || "*Empty*" },
      { name: `${EMOJIS.success} ${bold("After")}`, value: sniped.newContent?.slice(0, 1000) || "*Empty*" }
    ],
    footer: `Edited ${formatDuration(Date.now() - sniped.timestamp)} ago`,
    color: 0xFFAA00
  });
  embed.setAuthor({ name: sniped.author.tag, iconURL: sniped.author.displayAvatarURL({ dynamic: true }) });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Jump to Message")
      .setStyle(ButtonStyle.Link)
      .setURL(sniped.url)
  );

  return msg.reply({ embeds: [embed], components: [row] });
}

/* ================= EDITSNIPE ALL COMMAND (Edit History) ================= */
if (cmd === "editsnipeall" || cmd === "esall" || cmd === "editsnipes") {
  const history = channelEditHistory.get(msg.channel.id);
  
  if (!history || history.length === 0) {
    return msg.reply({ embeds: [createErrorEmbed("No History", "No recently edited messages in this channel.")] });
  }

  const page = parseInt(args[0]) || 1;
  const perPage = 5;
  const totalPages = Math.ceil(history.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageData = history.slice(start, end);

  const description = pageData.map((sniped, idx) => {
    const position = start + idx + 1;
    const timeAgo = `<t:${Math.floor(sniped.timestamp / 1000)}:R>`;
    const beforePreview = sniped.oldContent ? sniped.oldContent.slice(0, 50) : "*No text*";
    const afterPreview = sniped.newContent ? sniped.newContent.slice(0, 50) : "*No text*";
    
    return `**${position}.** ${sniped.author.tag} ${timeAgo}\n❌ ${beforePreview}${sniped.oldContent && sniped.oldContent.length > 50 ? "..." : ""}\n✅ ${afterPreview}${sniped.newContent && sniped.newContent.length > 50 ? "..." : ""}`;
  }).join("\n\n");

  const embed = createEmbed({
    title: `✏️ ${bold("Edited Messages History")}`,
    description: description || "No messages",
    footer: `Page ${page}/${totalPages} • ${history.length} total messages • Use ${PREFIX}editsnipe <number> to view details`,
    color: 0xFFAA00
  });

  return msg.reply({ embeds: [embed] });
}

/* ================= EDITSNIPE BY INDEX COMMAND ================= */
if (cmd === "editsnipe" && args[0] && !isNaN(args[0])) {
  const index = parseInt(args[0]) - 1;
  const history = channelEditHistory.get(msg.channel.id);
  
  if (!history || history.length === 0) {
    return msg.reply({ embeds: [createErrorEmbed("No History", "No recently edited messages in this channel.")] });
  }

  if (index < 0 || index >= history.length) {
    return msg.reply({ embeds: [createErrorEmbed("Invalid Index", `Please use a number between 1 and ${history.length}`)] });
  }

  const sniped = history[index];

  const embed = createEmbed({
    title: `✏️ ${bold(`Edited Message #${index + 1}`)}`,
    fields: [
      { name: `${EMOJIS.error} ${bold("Before")}`, value: sniped.oldContent?.slice(0, 1000) || "*Empty*" },
      { name: `${EMOJIS.success} ${bold("After")}`, value: sniped.newContent?.slice(0, 1000) || "*Empty*" }
    ],
    footer: `Edited ${formatDuration(Date.now() - sniped.timestamp)} ago`,
    color: 0xFFAA00
  });
  embed.setAuthor({ name: sniped.author.tag, iconURL: sniped.author.displayAvatarURL({ dynamic: true }) });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Jump to Message")
      .setStyle(ButtonStyle.Link)
      .setURL(sniped.url)
  );

  return msg.reply({ embeds: [embed], components: [row] });
}

/* ================= CLEAR SNIPE COMMAND ================= */
if (cmd === "clearsnipe" || cmd === "snipeclear") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Messages permission!")] });
  }

  snipedMessages.delete(msg.channel.id);
  editSnipedMessages.delete(msg.channel.id);
  channelSnipeHistory.delete(msg.channel.id);
  channelEditHistory.delete(msg.channel.id);

  return msg.reply({ embeds: [createSuccessEmbed("Snipe Cleared", "All snipe history for this channel has been cleared!")] });
}

  /* ================= INVITE COMMAND ================= */
  if (cmd === "invite" || cmd === "inv" || cmd === "botinvite") {
    const embed = createEmbed({
      title: `${EMOJIS.invites} ${bold("Invite Links")}`,
      description: 
        `${EMOJIS.success} [${bold("Invite Me")}](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)\n\n` +
        `${EMOJIS.info} [${bold("Support Server")}](https://discord.gg/your-server)`,
      thumbnail: client.user.displayAvatarURL({ dynamic: true })
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= BOTINFO COMMAND ================= */
  if (cmd === "botinfo" || cmd === "info" || cmd === "stats" || cmd === "about" || cmd === "bot") {
    const uptime = formatDuration(client.uptime);
    const servers = client.guilds.cache.size;
    const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const channels = client.channels.cache.size;
    const commands = Object.values(ALL_COMMANDS).reduce((acc, cat) => acc + cat.commands.length, 0);

    const embed = createEmbed({
      title: `${EMOJIS.chart} ${bold(`${client.user.username} Stats`)}`,
      thumbnail: client.user.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: `🖥️ ${bold("Servers")}`, value: `${servers}`, inline: true },
        { name: `👥 ${bold("Users")}`, value: `${users.toLocaleString()}`, inline: true },
        { name: `💬 ${bold("Channels")}`, value: `${channels}`, inline: true },
        { name: `📜 ${bold("Commands")}`, value: `${commands}`, inline: true },
        { name: `${EMOJIS.clock} ${bold("Uptime")}`, value: uptime, inline: true },
        { name: `🏓 ${bold("Ping")}`, value: `${client.ws.ping}ms`, inline: true },
        { name: `📚 ${bold("Prefix")}`, value: `\`${PREFIX}\``, inline: true },
        { name: `📅 ${bold("Created")}`, value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true }
      ],
      footer: "Made with ❤️ using Discord.js"
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= POLL COMMAND ================= */
  if (cmd === "poll") {
    const pollContent = args.join(" ");
    if (!pollContent.includes("|")) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Format", `Usage: \`${PREFIX}poll Question | Option1 | Option2 | ...\``)] });
    }

    const parts = pollContent.split("|").map(p => p.trim()).filter(p => p);
    if (parts.length < 3) {
      return msg.reply({ embeds: [createErrorEmbed("Not Enough Options", "Provide at least 2 options!")] });
    }

    const question = parts[0];
    const options = parts.slice(1, 11);
    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

    const description = options.map((opt, idx) => `${emojis[idx]} ${opt}`).join("\n\n");

    const embed = createEmbed({
      title: `${EMOJIS.chart} ${bold(question)}`,
      description: description,
      footer: `Poll by ${msg.author.tag}`
    });

    await msg.delete().catch(() => {});
    const pollMsg = await msg.channel.send({ embeds: [embed] });
    
    for (let i = 0; i < options.length; i++) {
      await pollMsg.react(emojis[i]);
    }
  }

  /* ================= REMIND COMMAND ================= */
  if (cmd === "remind" || cmd === "reminder" || cmd === "remindme") {
    const time = args[0];
    const message = args.slice(1).join(" ");

    if (!time || !message) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Usage", `Usage: \`${PREFIX}remind <time> <message>\`\nExample: \`${PREFIX}remind 1h Take a break!\``)] });
    }

    const duration = parseDuration(time);
    if (!duration) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Time", "Use format: 10s, 5m, 1h, 1d")] });
    }

    const reminder = {
oderId: msg.author.id,
      guildId: msg.guild.id,
      channelId: msg.channel.id,
      message: message,
      nextTime: Date.now() + duration,
      interval: duration,
      loop: false,
      createdAt: Date.now()
    };

    guildData(guildId).reminders.push(reminder);
    saveDB();

    const embed = createEmbed({
      title: `${EMOJIS.reminders} ${bold("Reminder Set")}`,
      description: `${EMOJIS.success} I'll remind you in ${bold(formatDuration(duration))}!`,
      fields: [{ name: `${EMOJIS.messages} ${bold("Message")}`, value: message }]
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= 8BALL COMMAND ================= */
  if (cmd === "8ball" || cmd === "eightball" || cmd === "ask") {
    if (!guildData(guildId).fun?.enabled) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
    }

    const question = args.join(" ");
    if (!question) {
      return msg.reply({ embeds: [createErrorEmbed("No Question", `Usage: \`${PREFIX}8ball <question>\``)] });
    }

    const response = get8BallResponse();

    const embed = createEmbed({
      title: `🎱 ${bold("Magic 8-Ball")}`,
      fields: [
        { name: `❓ ${bold("Question")}`, value: question },
        { name: `🔮 ${bold("Answer")}`, value: response }
      ]
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= COINFLIP COMMAND ================= */
  if (cmd === "coinflip" || cmd === "cf" || cmd === "flip" || cmd === "coin") {
    if (!guildData(guildId).fun?.enabled) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
    }

    const result = flipCoin();
    const emoji = result === "Heads" ? "🪙" : "💿";

    const embed = createEmbed({
      title: `${emoji} ${bold("Coin Flip")}`,
      description: `The coin landed on ${bold(result)}!`
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= DICE COMMAND ================= */
  if (cmd === "dice" || cmd === "roll" || cmd === "die") {
    if (!guildData(guildId).fun?.enabled) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
    }

    const sides = parseInt(args[0]) || 6;
    if (sides < 2 || sides > 100) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Sides", "Dice must have 2-100 sides!")] });
    }

    const result = rollDice(sides);

    const embed = createEmbed({
      title: `${EMOJIS.dice} ${bold("Dice Roll")}`,
      description: `You rolled a ${bold(result.toString())} on a ${sides}-sided die!`
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= CHOOSE COMMAND ================= */
  if (cmd === "choose" || cmd === "pick" || cmd === "decide") {
    if (!guildData(guildId).fun?.enabled) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
    }

    const choices = args.join(" ").split("|").map(c => c.trim()).filter(c => c);
    if (choices.length < 2) {
      return msg.reply({ embeds: [createErrorEmbed("Not Enough", `Usage: \`${PREFIX}choose option1 | option2 | option3\``)] });
    }

    const choice = getRandomChoice(choices);

    const embed = createEmbed({
      title: `🤔 ${bold("I Choose...")}`,
      description: `${EMOJIS.success} ${bold(choice)}`
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= RPS COMMAND ================= */
  if (cmd === "rps") {
    if (!guildData(guildId).fun?.enabled) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
    }

    const choices = ["rock", "paper", "scissors"];
    const userChoice = args[0]?.toLowerCase();
    
    if (!userChoice || !choices.includes(userChoice)) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Choice", `Usage: \`${PREFIX}rps <rock/paper/scissors>\``)] });
    }

    const botChoice = getRandomChoice(choices);
    const emojis = { rock: "🪨", paper: "📄", scissors: "✂️" };

    let result;
    if (userChoice === botChoice) {
      result = "It's a tie!";
    } else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    ) {
      result = "You win! 🎉";
    } else {
      result = "I win! 😎";
    }

    const embed = createEmbed({
      title: `✊✋✌️ ${bold("Rock Paper Scissors")}`,
      description: 
        `${bold("You:")} ${emojis[userChoice]} ${userChoice}\n` +
        `${bold("Me:")} ${emojis[botChoice]} ${botChoice}\n\n` +
        `${bold(result)}`
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= REVERSE COMMAND ================= */
  if (cmd === "reverse") {
    if (!guildData(guildId).fun?.enabled) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
    }

    const text = args.join(" ");
    if (!text) {
      return msg.reply({ embeds: [createErrorEmbed("Missing Text", `Usage: \`${PREFIX}reverse <text>\``)] });
    }

    const reversed = text.split("").reverse().join("");

    const embed = createEmbed({
      title: `🔄 ${bold("Reversed Text")}`,
      description: reversed
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= MOCK COMMAND ================= */
  if (cmd === "mock") {
    if (!guildData(guildId).fun?.enabled) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
    }

    const text = args.join(" ");
    if (!text) {
      return msg.reply({ embeds: [createErrorEmbed("Missing Text", `Usage: \`${PREFIX}mock <text>\``)] });
    }

    const mocked = text.split("").map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join("");

    const embed = createEmbed({
      title: `🙃 ${bold("mOcKeD tExT")}`,
      description: mocked
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= SHIP COMMAND ================= */
  if (cmd === "ship" || cmd === "love" || cmd === "match") {
    if (!guildData(guildId).fun?.enabled) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
    }

    const user1 = msg.mentions.users.first();
    const user2 = msg.mentions.users.at(1) || msg.author;

    if (!user1) {
      return msg.reply({ embeds: [createErrorEmbed("Missing Users", `Usage: \`${PREFIX}ship @user1 @user2\``)] });
    }

    const percentage = Math.floor(Math.random() * 101);
    let bar = "";
    const filled = Math.floor(percentage / 10);
    bar = "❤️".repeat(filled) + "🖤".repeat(10 - filled);

    let description;
    if (percentage < 20) description = "Not a good match... 💔";
    else if (percentage < 40) description = "Could be friends! 🤝";
    else if (percentage < 60) description = "There's potential! 💕";
    else if (percentage < 80) description = "Great match! 💖";
    else description = "Perfect couple! 💘";

    const embed = createEmbed({
      title: `💕 ${bold("Love Calculator")}`,
      description: 
        `${user1} 💗 ${user2}\n\n` +
        `${bar}\n\n` +
        `${bold("Match:")} ${percentage}%\n` +
        description
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= RATE COMMAND ================= */
  if (cmd === "rate") {
    if (!guildData(guildId).fun?.enabled) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
    }

    const thing = args.join(" ");
    if (!thing) {
      return msg.reply({ embeds: [createErrorEmbed("Missing Input", `Usage: \`${PREFIX}rate <thing>\``)] });
    }

    const rating = Math.floor(Math.random() * 11);
    const stars = "⭐".repeat(rating) + "☆".repeat(10 - rating);

    const embed = createEmbed({
      title: `⭐ ${bold("Rating")}`,
      description: `I rate ${bold(thing)} a ${bold(`${rating}/10`)}!\n\n${stars}`
    });

    return msg.reply({ embeds: [embed] });
  }

/* ================= HUG COMMAND ================= */
if (cmd === "hug") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}hug @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Hug", "You can't hug yourself! 🥺")] });
  }

  const gifUrl = getRandomGif("hug");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} hugs ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFB6C1)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= KISS COMMAND ================= */
if (cmd === "kiss") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}kiss @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Kiss", "You can't kiss yourself! 😳")] });
  }

  const gifUrl = getRandomGif("kiss");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} kisses ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFF69B4)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= PAT COMMAND ================= */
if (cmd === "pat" || cmd === "headpat") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}pat @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Pat", "You can't pat yourself! 🥺")] });
  }

  const gifUrl = getRandomGif("pat");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} pats ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFC0CB)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= SLAP COMMAND ================= */
if (cmd === "slap") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}slap @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Slap", "Why would you slap yourself? 🤔")] });
  }

  const gifUrl = getRandomGif("slap");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} slaps ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFF4500)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= CUDDLE COMMAND ================= */
if (cmd === "cuddle" || cmd === "snuggle") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}cuddle @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Cuddle", "You can't cuddle yourself! 🥺")] });
  }

  const gifUrl = getRandomGif("cuddle");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} cuddles ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFDAB9)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= POKE COMMAND ================= */
if (cmd === "poke") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}poke @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Poke", "Stop poking yourself! 😅")] });
  }

  const gifUrl = getRandomGif("poke");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} pokes ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0x87CEEB)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= WAVE COMMAND ================= */
if (cmd === "wave" || cmd === "hi") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  const gifUrl = getRandomGif("wave");

  if (!target) {
    const embed = new EmbedBuilder()
      .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} waves! <a:zzz_Exclamation:1485872115662983288>`)
      .setImage(gifUrl)
      .setColor(0xFFD700)
      .setTimestamp();
    return msg.reply({ embeds: [embed] });
  }

  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} waves at ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFD700)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= BITE COMMAND ================= */
if (cmd === "bite") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}bite @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Bite", "Ouch! Don't bite yourself! 😖")] });
  }

  const gifUrl = getRandomGif("bite");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} bites ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0x8B0000)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= CRY COMMAND ================= */
if (cmd === "cry") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("cry");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} is crying! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0x4682B4)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= DANCE COMMAND ================= */
if (cmd === "dance") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("dance");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} is dancing! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFF1493)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= BLUSH COMMAND ================= */
if (cmd === "blush") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("blush");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} is blushing! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFB6C1)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= SMILE COMMAND ================= */
if (cmd === "smile") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("smile");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} is smiling! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFFF00)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= HIGHFIVE COMMAND ================= */
if (cmd === "highfive" || cmd === "hi5") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}highfive @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self High Five", "You can't high five yourself! 🤔")] });
  }

  const gifUrl = getRandomGif("highfive");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} high fives ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0x00FF00)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= BONK COMMAND ================= */
if (cmd === "bonk") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}bonk @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Bonk", "Don't bonk yourself! 🔨")] });
  }

  const gifUrl = getRandomGif("bonk");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} bonks ${target}! Go to horny jail! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xA0522D)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= YEET COMMAND ================= */
if (cmd === "yeet") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}yeet @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Yeet", "You yeet yourself into the sky! 🚀")] });
  }

  const gifUrl = getRandomGif("yeet");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} yeets ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0x9400D3)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= PUNCH COMMAND ================= */
if (cmd === "punch") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}punch @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Punch", "Why punch yourself? 🤕")] });
  }

  const gifUrl = getRandomGif("punch");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} punches ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xDC143C)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= KILL COMMAND ================= */
if (cmd === "kill") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}kill @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Harm", "Please don't! 💔")] });
  }

  const gifUrl = getRandomGif("kill");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} attacks ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0x000000)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= WINK COMMAND ================= */
if (cmd === "wink") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  const gifUrl = getRandomGif("wink");

  if (!target) {
    const embed = new EmbedBuilder()
      .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} winks! <a:zzz_Exclamation:1485872115662983288>`)
      .setImage(gifUrl)
      .setColor(0xFF69B4)
      .setTimestamp();
    return msg.reply({ embeds: [embed] });
  }

  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} winks at ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFF69B4)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= POUT COMMAND ================= */
if (cmd === "pout") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("pout");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} is pouting! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFA07A)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= LAUGH COMMAND ================= */
if (cmd === "laugh" || cmd === "lol") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("laugh");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} is laughing! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFD700)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= CONFUSED COMMAND ================= */
if (cmd === "confused" || cmd === "huh") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("confused");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} is confused! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(BOT_COLOR)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= SLEEP COMMAND ================= */
if (cmd === "sleep" || cmd === "zzz") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("sleep");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} is sleeping! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0x191970)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= RUN COMMAND ================= */
if (cmd === "run") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("run");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} is running away! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0x32CD32)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= LICK COMMAND ================= */
if (cmd === "lick") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}lick @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Lick", "You can't lick yourself! 👅")] });
  }

  const gifUrl = getRandomGif("lick");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} licks ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFF1493)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= STARE COMMAND ================= */
if (cmd === "stare") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  const gifUrl = getRandomGif("stare");

  if (!target) {
    const embed = new EmbedBuilder()
      .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} is staring... <a:zzz_Exclamation:1485872115662983288>`)
      .setImage(gifUrl)
      .setColor(0x2F4F4F)
      .setTimestamp();
    return msg.reply({ embeds: [embed] });
  }

  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} stares at ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0x2F4F4F)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= THUMBSUP COMMAND ================= */
if (cmd === "thumbsup" || cmd === "thumbs") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("thumbsup");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} gives a thumbs up! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0x00FF00)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= FACEPALM COMMAND ================= */
if (cmd === "facepalm" || cmd === "fp") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("facepalm");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} facepalms! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0x8B4513)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= SHRUG COMMAND ================= */
if (cmd === "shrug") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const gifUrl = getRandomGif("shrug");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} shrugs! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xA9A9A9)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= BOOP COMMAND ================= */
if (cmd === "boop") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}boop @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Boop", "You booped your own nose! 👃")] });
  }

  const gifUrl = getRandomGif("boop");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} boops ${target}'s nose! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFB6C1)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= NOM COMMAND ================= */
if (cmd === "nom") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}nom @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Nom", "You can't nom yourself! 😋")] });
  }

  const gifUrl = getRandomGif("nom");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} noms ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFD700)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= HANDHOLD COMMAND ================= */
if (cmd === "handhold" || cmd === "holdhands") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}handhold @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Handhold", "You hold your own hand... 🥺")] });
  }

  const gifUrl = getRandomGif("handhold");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} holds ${target}'s hand! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFB6C1)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= TICKLE COMMAND ================= */
if (cmd === "tickle") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}tickle @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Tickle", "You tickle yourself and giggle! 🤭")] });
  }

  const gifUrl = getRandomGif("tickle");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} tickles ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFD700)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

/* ================= FEED COMMAND ================= */
if (cmd === "feed") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const target = msg.mentions.users.first();
  if (!target) {
    return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}feed @user\``)] });
  }

  if (target.id === msg.author.id) {
    return msg.reply({ embeds: [createErrorEmbed("Self Feed", "You feed yourself! 🍽️")] });
  }

  const gifUrl = getRandomGif("feed");
  const embed = new EmbedBuilder()
    .setDescription(`<a:zzz_arrow_hash:1485872093437497434> ${msg.author} feeds ${target}! <a:zzz_Exclamation:1485872115662983288>`)
    .setImage(gifUrl)
    .setColor(0xFFA500)
    .setTimestamp();

  return msg.reply({ embeds: [embed] });
}

  /* ================= MEME COMMAND ================= */
if (cmd === "meme") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  // You'll need to integrate with a meme API like reddit or imgflip
  const embed = createEmbed({
    title: `😂 ${bold("Random Meme")}`,
    description: "Meme API integration needed",
    color: 0xFF6B6B
  });

  return msg.reply({ embeds: [embed] });
}

/* ================= JOKE COMMAND ================= */
if (cmd === "joke") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? He was outstanding in his field!",
    "Why don't eggs tell jokes? They'd crack each other up!",
    "What do you call a bear with no teeth? A gummy bear!",
    "Why couldn't the bicycle stand up by itself? It was two tired!",
    "What do you call fake spaghetti? An impasta!",
    "How does a penguin build its house? Igloos it together!",
    "Why did the math book look so sad? Because it had too many problems!",
    "What did the ocean say to the beach? Nothing, it just waved!",
    "Why do programmers prefer dark mode? Because light attracts bugs!"
  ];

  const joke = jokes[Math.floor(Math.random() * jokes.length)];

  const embed = createEmbed({
    title: `😂 ${bold("Random Joke")}`,
    description: joke,
    color: 0xFFAA00
  });

  return msg.reply({ embeds: [embed] });
}

/* ================= FACT COMMAND ================= */
if (cmd === "fact") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const facts = [
    "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!",
    "Octopuses have three hearts and blue blood!",
    "Bananas are berries, but strawberries aren't!",
    "A group of flamingos is called a 'flamboyance'!",
    "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion!",
    "Sharks have been around longer than trees!",
    "The shortest war in history lasted 38 minutes!",
    "A day on Venus is longer than a year on Venus!",
    "Dolphins have names for each other!",
    "The human brain uses 20% of the body's energy!"
  ];

  const fact = facts[Math.floor(Math.random() * facts.length)];

  const embed = createEmbed({
    title: `🧠 ${bold("Random Fact")}`,
    description: fact,
    color: BOT_COLOR
  });

  return msg.reply({ embeds: [embed] });
}

/* ================= QUOTE COMMAND ================= */
if (cmd === "quote") {
  if (!guildData(guildId).fun?.enabled) {
    return msg.reply({ embeds: [createErrorEmbed("Disabled", "Fun commands are disabled!")] });
  }

  const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
  ];

  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const embed = createEmbed({
    title: `💭 ${bold("Inspirational Quote")}`,
    description: `"${quote.text}"\n\n— ${bold(quote.author)}`,
    color: 0x00FF00
  });

  return msg.reply({ embeds: [embed] });
}

  /* ================= EMOJIS COMMAND ================= */
  if (cmd === "emojis" || cmd === "emojilist" || cmd === "listemojis") {
    const emojis = msg.guild.emojis.cache;
    const animated = emojis.filter(e => e.animated);
    const static_ = emojis.filter(e => !e.animated);

    const embed = createEmbed({
      title: `😀 ${bold("Server Emojis")}`,
      fields: [
        { name: `${EMOJIS.chart} ${bold("Total")}`, value: `${emojis.size}`, inline: true },
        { name: `🖼️ ${bold("Static")}`, value: `${static_.size}`, inline: true },
        { name: `🎬 ${bold("Animated")}`, value: `${animated.size}`, inline: true }
      ]
    });

    if (static_.size > 0) {
      const staticList = static_.map(e => e.toString()).slice(0, 40).join(" ");
      embed.addFields({ name: `🖼️ ${bold("Static Emojis")}`, value: staticList.slice(0, 1024) || "None" });
    }

    if (animated.size > 0) {
      const animatedList = animated.map(e => e.toString()).slice(0, 40).join(" ");
      embed.addFields({ name: `🎬 ${bold("Animated Emojis")}`, value: animatedList.slice(0, 1024) || "None" });
    }

    return msg.reply({ embeds: [embed] });
  }

  /* ================= STICKERS COMMAND ================= */
  if (cmd === "stickers" || cmd === "stickerlist" || cmd === "liststickers") {
    const stickers = msg.guild.stickers.cache;

    if (stickers.size === 0) {
      return msg.reply({ embeds: [createErrorEmbed("No Stickers", "This server has no stickers!")] });
    }

    const embed = createEmbed({
      title: `${EMOJIS.sticker} ${bold("Server Stickers")}`,
      description: stickers.map(s => `${EMOJIS.success} ${bold(s.name)}`).slice(0, 20).join("\n"),
      fields: [{ name: `${EMOJIS.chart} ${bold("Total")}`, value: `${stickers.size}`, inline: true }]
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= STEAL STICKER COMMAND ================= */
  if (cmd === "steal" || cmd === "stealsticker" || cmd === "ss") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Emojis & Stickers permission!")] });
    }

    let targetMessage = msg;
    
    if (msg.reference) {
      try {
        targetMessage = await msg.channel.messages.fetch(msg.reference.messageId);
      } catch (err) {
        return msg.reply({ embeds: [createErrorEmbed("Error", "Could not fetch the replied message!")] });
      }
    }

    if (targetMessage.stickers.size > 0) {
      const sticker = targetMessage.stickers.first();
      
      if (!sticker.guildId && sticker.type === 1) {
        return msg.reply({ embeds: [createErrorEmbed("Cannot Steal", "Cannot steal default Discord stickers!")] });
      }
      
      if (sticker.format === 3) {
        return msg.reply({ embeds: [createErrorEmbed("Cannot Steal", "Cannot steal Lottie stickers!")] });
      }

      const statusMsg = await msg.reply({ embeds: [createInfoEmbed("Stealing...", `${EMOJIS.loading} Stealing sticker ${bold(sticker.name)}...`)] });

      try {
        const result = await stealStickerEnhanced(msg.guild, sticker, msg.author);
        
        if (result.success) {
          const embed = createEmbed({
            title: `${EMOJIS.sticker} ${bold("Sticker Stolen!")}`,
            description: `${EMOJIS.success} Successfully added sticker to this server!`,
            fields: [
              { name: `📛 ${bold("Name")}`, value: result.sticker.name, inline: true },
              { name: `🆔 ${bold("ID")}`, value: result.sticker.id, inline: true }
            ],
            thumbnail: result.sticker.url
          });

          await statusMsg.edit({ embeds: [embed] });
        } else {
          await statusMsg.edit({ embeds: [createErrorEmbed("Failed", result.error)] });
        }
      } catch (error) {
        console.error("Sticker steal error:", error);
        await statusMsg.edit({ embeds: [createErrorEmbed("Failed", error.message)] });
      }
      return;
    }

    const embed = createEmbed({
      title: `${EMOJIS.sticker} ${bold("Steal Sticker")}`,
      description: 
        `${bold("How to use:")}\n\n` +
        `${EMOJIS.info} Reply to a message with a sticker and use:\n` +
        `\`${PREFIX}steal\``
    });
    
    return msg.reply({ embeds: [embed] });
  }

  /* ================= STEAL EMOJI COMMAND ================= */
  if (cmd === "stealemoji" || cmd === "se" || cmd === "addemoji" || cmd === "ae") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Emojis & Stickers permission!")] });
    }

    let targetMessage = msg;
    let customName = args[0];
    
    if (msg.reference) {
      try {
        targetMessage = await msg.channel.messages.fetch(msg.reference.messageId);
        customName = args[0];
      } catch (err) {
        return msg.reply({ embeds: [createErrorEmbed("Error", "Could not fetch the replied message!")] });
      }
    }

    const emojisInMessage = parseEmojisFromContent(targetMessage.content);
    const emojisInArgs = parseEmojisFromContent(args.join(" "));
    const allEmojis = [...emojisInMessage, ...emojisInArgs];
    const urlArg = args.find(arg => arg.startsWith('http') && isValidImageUrl(arg));
    
    if (allEmojis.length > 0) {
      const emoji = allEmojis[0];
      const name = customName && !customName.startsWith('<') ? customName : emoji.name;
      
      const statusMsg = await msg.reply({ embeds: [createInfoEmbed("Stealing...", `${EMOJIS.loading} Stealing emoji ${bold(emoji.name)}...`)] });
      
      try {
        const result = await stealEmojiEnhanced(msg.guild, emoji.full, name, msg.author);
        
        if (result.success) {
          const embed = createEmbed({
            title: `😀 ${bold("Emoji Stolen!")}`,
            description: `${EMOJIS.success} Successfully added emoji to this server!`,
            fields: [
              { name: `📛 ${bold("Name")}`, value: result.emoji.name, inline: true },
              { name: `🎬 ${bold("Animated")}`, value: result.animated ? `${EMOJI_ENABLE} Yes` : `${EMOJI_DISABLE} No`, inline: true }
            ],
            thumbnail: result.emoji.url
          });

          await statusMsg.edit({ embeds: [embed] });
        } else {
          await statusMsg.edit({ embeds: [createErrorEmbed("Failed", result.error)] });
        }
      } catch (error) {
        console.error("Emoji steal error:", error);
        await statusMsg.edit({ embeds: [createErrorEmbed("Failed", error.message)] });
      }
      return;
    } else if (urlArg) {
      const name = args.find(arg => !arg.startsWith('http')) || 'emoji';
      
      const statusMsg = await msg.reply({ embeds: [createInfoEmbed("Adding...", `${EMOJIS.loading} Adding emoji from URL...`)] });
      
      try {
        const result = await stealEmojiFromUrl(msg.guild, urlArg, name, msg.author);
        
        if (result.success) {
          const embed = createEmbed({
            title: `😀 ${bold("Emoji Added!")}`,
            description: `${EMOJIS.success} Successfully added emoji from URL!`,
            fields: [
              { name: `📛 ${bold("Name")}`, value: result.emoji.name, inline: true }
            ],
            thumbnail: result.emoji.url
          });

          await statusMsg.edit({ embeds: [embed] });
        } else {
          await statusMsg.edit({ embeds: [createErrorEmbed("Failed", result.error)] });
        }
      } catch (error) {
        await statusMsg.edit({ embeds: [createErrorEmbed("Failed", error.message)] });
      }
      return;
    } else if (msg.attachments.size > 0) {
      const attachment = msg.attachments.first();
      if (!isValidImageUrl(attachment.url)) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid File", "Attachment must be an image!")] });
      }
      
      const name = args[0] || attachment.name.split('.')[0] || 'emoji';
      const statusMsg = await msg.reply({ embeds: [createInfoEmbed("Adding...", `${EMOJIS.loading} Adding emoji from attachment...`)] });
      
      try {
        const result = await stealEmojiFromUrl(msg.guild, attachment.url, name, msg.author);
        
        if (result.success) {
          const embed = createEmbed({
            title: `😀 ${bold("Emoji Added!")}`,
            description: `${EMOJIS.success} Successfully added emoji!`,
            fields: [{ name: `📛 ${bold("Name")}`, value: result.emoji.name, inline: true }],
            thumbnail: result.emoji.url
          });
          await statusMsg.edit({ embeds: [embed] });
        } else {
          await statusMsg.edit({ embeds: [createErrorEmbed("Failed", result.error)] });
        }
      } catch (error) {
        await statusMsg.edit({ embeds: [createErrorEmbed("Failed", error.message)] });
      }
      return;
    }

    const embed = createEmbed({
      title: `😀 ${bold("Steal/Add Emoji")}`,
      description: 
        `${bold("Methods:")}\n\n` +
        `\`${PREFIX}stealemoji <emoji> [name]\` - Steal emoji\n` +
        `\`${PREFIX}stealemoji <url> <name>\` - Add from URL\n` +
        `\`${PREFIX}stealemoji <name>\` + attachment - Add from file\n` +
        `Reply to a message with emoji and use \`${PREFIX}stealemoji\``
    });
    
    return msg.reply({ embeds: [embed] });
  }
  /* ================= DELETE EMOJI COMMAND ================= */
  if (cmd === "deleteemoji" || cmd === "delemoji" || cmd === "removeemoji") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Emojis & Stickers permission!")] });
    }

    const emojiArg = args[0];
    if (!emojiArg) {
      return msg.reply({ embeds: [createErrorEmbed("Missing Emoji", `Usage: \`${PREFIX}deleteemoji <emoji>\``)] });
    }

    const emojis = parseEmojisFromContent(emojiArg);
    if (emojis.length === 0) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Emoji", "Please provide a valid custom emoji!")] });
    }

    const emoji = msg.guild.emojis.cache.get(emojis[0].id);
    if (!emoji) {
      return msg.reply({ embeds: [createErrorEmbed("Not Found", "Emoji not found in this server!")] });
    }

    try {
      const emojiName = emoji.name;
      await emoji.delete(`Deleted by ${msg.author.tag}`);
      return msg.reply({ embeds: [createSuccessEmbed("Emoji Deleted", `Deleted emoji ${bold(emojiName)}!`)] });
    } catch (error) {
      return msg.reply({ embeds: [createErrorEmbed("Failed", error.message)] });
    }
  }

  /* ================= ENLARGE EMOJI COMMAND ================= */
  if (cmd === "enlarge" || cmd === "jumbo" || cmd === "big" || cmd === "bigemoji") {
    const emojiArg = args[0];
    if (!emojiArg) {
      return msg.reply({ embeds: [createErrorEmbed("Missing Emoji", `Usage: \`${PREFIX}enlarge <emoji>\``)] });
    }

    const emojis = parseEmojisFromContent(emojiArg);
    if (emojis.length === 0) {
      // Check if it's a unicode emoji
      const unicodeEmoji = emojiArg;
      const twemojiUrl = `https://twemoji.maxcdn.com/v/latest/72x72/${[...unicodeEmoji].map(c => c.codePointAt(0).toString(16)).join('-')}.png`;
      
      const embed = createEmbed({
        title: `${EMOJIS.image} ${bold("Enlarged Emoji")}`,
        image: twemojiUrl
      });
      return msg.reply({ embeds: [embed] });
    }

    const emoji = emojis[0];
    const embed = createEmbed({
      title: `${EMOJIS.image} ${bold("Enlarged Emoji")}`,
      description: `${bold("Name:")} ${emoji.name}`,
      image: emoji.url.replace('?size=128', '?size=512')
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Download")
        .setStyle(ButtonStyle.Link)
        .setURL(emoji.url.replace('?size=128', '?size=512'))
    );

    return msg.reply({ embeds: [embed], components: [row] });
  }

  /* ================= GIVEAWAY COMMANDS ================= */
  if (cmd === "giveaway" || cmd === "gw") {
    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable" && msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      if (!guildData(guildId).giveawaySystem) guildData(guildId).giveawaySystem = {};
      guildData(guildId).giveawaySystem.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Giveaways Enabled", "Giveaway system is now enabled!")] });
    }

    if (subCmd === "disable" && msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      if (!guildData(guildId).giveawaySystem) guildData(guildId).giveawaySystem = {};
      guildData(guildId).giveawaySystem.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Giveaways Disabled", "Giveaway system is now disabled!")] });
    }

    if (subCmd === "create" || subCmd === "start") {
      if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Server permission!")] });
      }

      if (guildData(guildId).giveawaySystem?.enabled === false) {
        return msg.reply({ embeds: [createErrorEmbed("Disabled", "Giveaway system is disabled!")] });
      }

      const duration = args[1];
      const winners = parseInt(args[2]);
      const prize = args.slice(3).join(" ");

      if (!duration || !winners || !prize) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Usage", `Usage: \`${PREFIX}giveaway create <duration> <winners> <prize>\`\nExample: \`${PREFIX}giveaway create 1h 1 Discord Nitro\``)] });
      }

      const giveawayId = await createGiveaway(msg, duration, prize, winners, null);
      if (giveawayId) {
        const embed = createSuccessEmbed("Giveaway Created!", 
          `${EMOJIS.gift} ${bold("Prize:")} ${prize}\n` +
          `${EMOJIS.trophy} ${bold("Winners:")} ${winners}\n` +
          `${EMOJIS.clock} ${bold("Duration:")} ${duration}`,
          [{ name: `🆔 ${bold("Giveaway ID")}`, value: `\`${giveawayId}\``, inline: true }]
        );
        const replyMsg = await msg.reply({ embeds: [embed] });
        setTimeout(() => replyMsg.delete().catch(() => {}), 10000);
        return;
      } else {
        return msg.reply({ embeds: [createErrorEmbed("Error", "Invalid duration format!")] });
      }
    }

    if (subCmd === "end") {
      if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Server permission!")] });
      }

      const giveawayId = args[1];
      if (!giveawayId) {
        return msg.reply({ embeds: [createErrorEmbed("Missing ID", `Usage: \`${PREFIX}giveaway end <giveawayID>\``)] });
      }

      const giveaway = giveaways.get(giveawayId) || guildData(guildId).giveaways?.[giveawayId];
      if (!giveaway) {
        return msg.reply({ embeds: [createErrorEmbed("Not Found", "Giveaway not found!")] });
      }

      if (giveaway.ended) {
        return msg.reply({ embeds: [createErrorEmbed("Already Ended", "This giveaway has already ended!")] });
      }

      await endGiveaway(giveawayId);
      return msg.reply({ embeds: [createSuccessEmbed("Giveaway Ended", "The giveaway has been ended!")] });
    }

    if (subCmd === "reroll") {
      if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Server permission!")] });
      }

      const giveawayId = args[1];
      const count = parseInt(args[2]) || 1;

      if (!giveawayId) {
        return msg.reply({ embeds: [createErrorEmbed("Missing ID", `Usage: \`${PREFIX}giveaway reroll <giveawayID> [winners]\``)] });
      }

      const result = await rerollGiveaway(giveawayId, count);
      if (!result.success) {
        return msg.reply({ embeds: [createErrorEmbed("Error", result.error)] });
      }

      const winnerMentions = result.winners.map(id => `<@${id}>`).join(", ");
      return msg.reply({ embeds: [createSuccessEmbed("Giveaway Rerolled", `${EMOJIS.party} New winner(s): ${winnerMentions}`)] });
    }

    if (subCmd === "cancel") {
      if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Server permission!")] });
      }

      const giveawayId = args[1];
      if (!giveawayId) {
        return msg.reply({ embeds: [createErrorEmbed("Missing ID", `Usage: \`${PREFIX}giveaway cancel <giveawayID>\``)] });
      }

      const result = await cancelGiveaway(giveawayId);
      if (!result.success) {
        return msg.reply({ embeds: [createErrorEmbed("Error", result.error)] });
      }

      return msg.reply({ embeds: [createSuccessEmbed("Giveaway Cancelled", "The giveaway has been cancelled!")] });
    }

    if (subCmd === "list") {
      const activeGiveaways = Object.values(guildData(guildId).giveaways).filter(g => !g.ended && g.guildId === guildId);
      
      if (activeGiveaways.length === 0) {
        return msg.reply({ embeds: [createInfoEmbed("No Giveaways", "There are no active giveaways!")] });
      }

      const embed = createEmbed({
        title: `${EMOJIS.giveaway} ${bold("Active Giveaways")}`,
        description: activeGiveaways.map(g => 
          `${EMOJIS.gift} \`${g.id}\`\n` +
          `↳ ${bold("Prize:")} ${g.prize}\n` +
          `↳ ${bold("Ends:")} <t:${Math.floor(g.endTime / 1000)}:R>\n` +
          `↳ ${bold("Entries:")} ${g.participants.length}`
        ).join("\n\n")
      });

      return msg.reply({ embeds: [embed] });
    }

  }

  /* ================= GCREATE SHORTCUT ================= */
  if (cmd === "gcreate" || cmd === "gstart") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Server permission!")] });
    }

    const duration = args[0];
    const winners = parseInt(args[1]);
    const prize = args.slice(2).join(" ");

    if (!duration || !winners || !prize) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Usage", `Usage: \`${PREFIX}gcreate <duration> <winners> <prize>\``)] });
    }

    const giveawayId = await createGiveaway(msg, duration, prize, winners, null);
    if (giveawayId) {
      const replyMsg = await msg.reply({ embeds: [createSuccessEmbed("Giveaway Created!", `ID: \`${giveawayId}\``)] });
      setTimeout(() => replyMsg.delete().catch(() => {}), 10000);
      return;
    } else {
      return msg.reply({ embeds: [createErrorEmbed("Error", "Invalid duration format!")] });
    }
  }

  /* ================= GEND SHORTCUT ================= */
  if (cmd === "gend") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Server permission!")] });
    }

    const giveawayId = args[0];
    if (!giveawayId) {
      return msg.reply({ embeds: [createErrorEmbed("Missing ID", `Usage: \`${PREFIX}gend <giveawayID>\``)] });
    }

    await endGiveaway(giveawayId);
    return msg.reply({ embeds: [createSuccessEmbed("Giveaway Ended", "The giveaway has been ended!")] });
  }

  /* ================= GREROLL SHORTCUT ================= */
  if (cmd === "greroll") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Server permission!")] });
    }

    const giveawayId = args[0];
    if (!giveawayId) {
      return msg.reply({ embeds: [createErrorEmbed("Missing ID", `Usage: \`${PREFIX}greroll <giveawayID>\``)] });
    }

    const result = await rerollGiveaway(giveawayId, 1);
    if (!result.success) {
      return msg.reply({ embeds: [createErrorEmbed("Error", result.error)] });
    }

    return msg.reply({ embeds: [createSuccessEmbed("Rerolled", `New winner: <@${result.winners[0]}>`)] });
  }

  /* ================= GALL COMMAND ================= */
  if (cmd === "gall") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Server permission!")] });
    }

    const subFilter = args[0]?.toLowerCase(); // optional: "active", "ended", "cancelled"
    const allGiveaways = Object.values(guildData(guildId).giveaways).filter(g => g.guildId === guildId);

    if (allGiveaways.length === 0) {
      return msg.reply({ embeds: [createInfoEmbed("No Giveaways", `No giveaways found for this server!\nUse \`${PREFIX}gcreate <duration> <winners> <prize>\` to start one.`)] });
    }

    const active    = allGiveaways.filter(g => !g.ended && !g.cancelled);
    const ended     = allGiveaways.filter(g => g.ended && !g.cancelled);
    const cancelled = allGiveaways.filter(g => g.cancelled);

    let filtered = allGiveaways;
    let filterLabel = "All";
    if (subFilter === "active") { filtered = active; filterLabel = "Active"; }
    else if (subFilter === "ended") { filtered = ended; filterLabel = "Ended"; }
    else if (subFilter === "cancelled") { filtered = cancelled; filterLabel = "Cancelled"; }

    if (filtered.length === 0) {
      return msg.reply({ embeds: [createInfoEmbed(`No ${filterLabel} Giveaways`, `No ${filterLabel.toLowerCase()} giveaways found!`)] });
    }

    // Paginate — show up to 10 per embed
    const maxPerPage = 10;
    const page = Math.max(1, parseInt(args[1]) || parseInt(args[0]) || 1);
    const totalPages = Math.ceil(filtered.length / maxPerPage);
    const currentPage = Math.min(page, totalPages);
    const slice = filtered.slice((currentPage - 1) * maxPerPage, currentPage * maxPerPage);

    const lines = slice.map(g => {
      const statusIcon = g.cancelled ? `❌` : g.ended ? `✅` : `${EMOJIS.giveaway}`;
      const status = g.cancelled ? "Cancelled" : g.ended ? "Ended" : "Active";
      const endStr = g.ended || g.cancelled
        ? `<t:${Math.floor((g.endedAt || g.cancelledAt || g.endTime) / 1000)}:d>`
        : `<t:${Math.floor(g.endTime / 1000)}:R>`;
      const entries = g.participants?.length ?? 0;
      const winnerMentions = g.winnerIds?.length ? g.winnerIds.map(id => `<@${id}>`).join(", ") : null;

      return (
        `${statusIcon} **${g.prize}** — \`${g.id}\`\n` +
        `<a:arrow_arrow:1485908026006442015>  Status: **${status}** | ${g.ended && !g.cancelled ? "Ended" : g.cancelled ? "Cancelled" : "Ends"}: ${endStr}\n` +
        `<a:arrow_arrow:1485908026006442015>  Winners: **${g.winners}** | Entries: **${entries}** | Host: <@${g.hostId}>` +
        (winnerMentions ? `\n<a:arrow_arrow:1485908026006442015>  🏆 Winner(s): ${winnerMentions}` : "")
      );
    }).join("\n\n");

    const statsLine =
      `${EMOJIS.giveaway} Active: **${active.length}** | ` +
      `✅ Ended: **${ended.length}** | ` +
      `❌ Cancelled: **${cancelled.length}** | ` +
      `📋 Total: **${allGiveaways.length}**`;

    const embed = createEmbed({
      title: `${EMOJIS.giveaway} ${bold(`${filterLabel} Giveaways`)} ${EMOJIS.giveaway}`,
      description: statsLine + `\n\n` + lines,
      footer: `Page ${currentPage}/${totalPages} | Use ${PREFIX}gall [active/ended/cancelled] [page]`
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= ECONOMY COMMANDS ================= */
  if (cmd === "economy" || cmd === "eco") {
    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      guildData(guildId).economy.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Economy Enabled", "Economy system is now enabled!")] });
    }

    if (subCmd === "disable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      guildData(guildId).economy.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Economy Disabled", "Economy system is now disabled!")] });
    }

  }

  /* ================= BALANCE COMMAND ================= */
  if (cmd === "balance" || cmd === "bal" || cmd === "money" || cmd === "wallet") {
    if (guildData(guildId).economy?.enabled === false) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Economy system is disabled!")] });
    }

    const target = msg.mentions.users.first() || msg.author;
    const balance = getBalance(guildId, target.id);
    const currency = guildData(guildId).economy?.currency || "💰";

    const embed = createEmbed({
      title: `${currency} ${bold(`${target.username}'s Balance`)}`,
      thumbnail: target.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: `👛 ${bold("Wallet")}`, value: `$${balance.balance.toLocaleString()}`, inline: true },
        { name: `🏦 ${bold("Bank")}`, value: `$${balance.bank.toLocaleString()}`, inline: true },
        { name: `${EMOJIS.gem} ${bold("Total")}`, value: `$${(balance.balance + balance.bank).toLocaleString()}`, inline: true }
      ]
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= DAILY COMMAND ================= */
  if (cmd === "daily") {
    if (guildData(guildId).economy?.enabled === false) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Economy system is disabled!")] });
    }

    const balance = getBalance(guildId, msg.author.id);
    const now = Date.now();
    const cooldown = 24 * 60 * 60 * 1000;

    if (balance.lastDaily && now - balance.lastDaily < cooldown) {
      const timeLeft = formatDuration(cooldown - (now - balance.lastDaily));
      return msg.reply({ embeds: [createErrorEmbed("Already Claimed", `Come back in ${bold(timeLeft)}!`)] });
    }

    const amount = guildData(guildId).economy?.daily || 100;
    const streak = (balance.dailyStreak || 0) + 1;
    const bonus = Math.floor(amount * (Math.min(streak, 30) * 0.1));
    const total = amount + bonus;

    balance.balance += total;
    balance.lastDaily = now;
    balance.dailyStreak = streak;
    saveDB();

    const embed = createEmbed({
      title: `${EMOJIS.economy} ${bold("Daily Reward")}`,
      fields: [
        { name: `${EMOJIS.money} ${bold("Base")}`, value: `$${amount}`, inline: true },
        { name: `${EMOJIS.fire} ${bold("Streak Bonus")}`, value: `$${bonus}`, inline: true },
        { name: `${EMOJIS.gem} ${bold("Total")}`, value: `$${total}`, inline: true },
        { name: `${EMOJIS.star} ${bold("Streak")}`, value: `🔥 ${streak} day${streak !== 1 ? "s" : ""}`, inline: true }
      ],
      color: 0x00FF00
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= WORK COMMAND ================= */
  if (cmd === "work") {
    if (guildData(guildId).economy?.enabled === false) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Economy system is disabled!")] });
    }

    const balance = getBalance(guildId, msg.author.id);
    const now = Date.now();
    const cooldown = 60 * 60 * 1000;

    if (balance.lastWork && now - balance.lastWork < cooldown) {
      const timeLeft = formatDuration(cooldown - (now - balance.lastWork));
      return msg.reply({ embeds: [createErrorEmbed("Tired", `You're tired! Rest for ${bold(timeLeft)}`)] });
    }

    const jobs = [
      { name: "programmer", emoji: "💻" },
      { name: "chef", emoji: "👨‍🍳" },
      { name: "doctor", emoji: "👨‍⚕️" },
      { name: "teacher", emoji: "👨‍🏫" },
      { name: "artist", emoji: "🎨" },
      { name: "musician", emoji: "🎵" },
      { name: "driver", emoji: "🚗" },
      { name: "streamer", emoji: "📺" },
      { name: "gardener", emoji: "🌱" },
      { name: "writer", emoji: "✍️" }
    ];

    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const amount = randomInt(guildData(guildId).economy?.work?.min || 50, guildData(guildId).economy?.work?.max || 200);

    balance.balance += amount;
    balance.lastWork = now;
    saveDB();

    const embed = createEmbed({
      title: `💼 ${bold("Work Complete")}`,
      description: `${job.emoji} You worked as a ${bold(job.name)} and earned ${bold(`$${amount}`)}!`,
      color: 0x00FF00
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= PAY COMMAND ================= */
  if (cmd === "pay" || cmd === "give" || cmd === "transfer") {
    if (guildData(guildId).economy?.enabled === false) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Economy system is disabled!")] });
    }

    const target = msg.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!target || !amount) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Usage", `Usage: \`${PREFIX}pay @user <amount>\``)] });
    }

    if (target.id === msg.author.id) {
      return msg.reply({ embeds: [createErrorEmbed("Error", "You can't pay yourself!")] });
    }

    if (amount <= 0) {
      return msg.reply({ embeds: [createErrorEmbed("Error", "Amount must be positive!")] });
    }

    const result = transferMoney(guildId, msg.author.id, target.id, amount);
    if (!result) {
      return msg.reply({ embeds: [createErrorEmbed("Insufficient Funds", "You don't have enough money!")] });
    }

    const embed = createEmbed({
      title: `${EMOJIS.money} ${bold("Payment Sent")}`,
      description: `${EMOJIS.success} You sent ${bold(`$${amount}`)} to ${target}!`,
      fields: [
        { name: `👛 ${bold("Your Balance")}`, value: `$${result.from.balance}`, inline: true }
      ],
      color: 0x00FF00
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= DEPOSIT COMMAND ================= */
  if (cmd === "deposit" || cmd === "dep") {
    if (guildData(guildId).economy?.enabled === false) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Economy system is disabled!")] });
    }

    const balance = getBalance(guildId, msg.author.id);
    let amount;

    if (args[0]?.toLowerCase() === "all") {
      amount = balance.balance;
    } else {
      amount = parseInt(args[0]);
    }

    if (!amount || amount <= 0) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Amount", `Usage: \`${PREFIX}deposit <amount/all>\``)] });
    }

    if (amount > balance.balance) {
      return msg.reply({ embeds: [createErrorEmbed("Insufficient Funds", "You don't have that much!")] });
    }

    balance.balance -= amount;
    balance.bank += amount;
    saveDB();

    const embed = createEmbed({
      title: `🏦 ${bold("Deposit Successful")}`,
      description: `${EMOJIS.success} Deposited ${bold(`$${amount}`)} to your bank!`,
      fields: [
        { name: `👛 ${bold("Wallet")}`, value: `$${balance.balance}`, inline: true },
        { name: `🏦 ${bold("Bank")}`, value: `$${balance.bank}`, inline: true }
      ],
      color: 0x00FF00
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= WITHDRAW COMMAND ================= */
  if (cmd === "withdraw" || cmd === "with") {
    if (guildData(guildId).economy?.enabled === false) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Economy system is disabled!")] });
    }

    const balance = getBalance(guildId, msg.author.id);
    let amount;

    if (args[0]?.toLowerCase() === "all") {
      amount = balance.bank;
    } else {
      amount = parseInt(args[0]);
    }

    if (!amount || amount <= 0) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Amount", `Usage: \`${PREFIX}withdraw <amount/all>\``)] });
    }

    if (amount > balance.bank) {
      return msg.reply({ embeds: [createErrorEmbed("Insufficient Funds", "You don't have that much in the bank!")] });
    }

    balance.bank -= amount;
    balance.balance += amount;
    saveDB();

    const embed = createEmbed({
      title: `🏦 ${bold("Withdrawal Successful")}`,
      description: `${EMOJIS.success} Withdrew ${bold(`$${amount}`)} from your bank!`,
      fields: [
        { name: `👛 ${bold("Wallet")}`, value: `$${balance.balance}`, inline: true },
        { name: `🏦 ${bold("Bank")}`, value: `$${balance.bank}`, inline: true }
      ],
      color: 0x00FF00
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= BALTOP COMMAND ================= */
  if (cmd === "baltop" || cmd === "richest" || cmd === "rich") {
    if (guildData(guildId).economy?.enabled === false) {
      return msg.reply({ embeds: [createErrorEmbed("Disabled", "Economy system is disabled!")] });
    }

    const leaderboard = getEconomyLeaderboard(guildId, 10);
    if (leaderboard.length === 0) {
      return msg.reply({ embeds: [createErrorEmbed("No Data", "No economy data yet!")] });
    }

    const description = leaderboard.map((data, idx) => {
      const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `**${idx + 1}.**`;
      return `${medal} <@${data.userId}> - ${bold(`$${data.total.toLocaleString()}`)}`;
    }).join("\n");

    const embed = createEmbed({
      title: `${EMOJIS.trophy} ${bold("Richest Users")}`,
      description: description,
      footer: `${leaderboard.length} users`
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= INVITES COMMANDS ================= */
  if (cmd === "invites" || cmd === "invs") {
    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;
    
    if (subCmd === "enable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      if (!guildData(guildId).inviteSystem) guildData(guildId).inviteSystem = {};
      guildData(guildId).inviteSystem.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Invites Enabled", "Invite tracking is now enabled!")] });
    }

    if (subCmd === "disable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      if (!guildData(guildId).inviteSystem) guildData(guildId).inviteSystem = {};
      guildData(guildId).inviteSystem.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Invites Disabled", "Invite tracking is now disabled!")] });
    }

    if (subCmd === "leaderboard" || subCmd === "lb" || subCmd === "top") {
      const leaderboard = getInviteLeaderboard(guildId, 10);
      if (leaderboard.length === 0) {
        return msg.reply({ embeds: [createErrorEmbed("No Data", "No invite data yet!")] });
      }

      const description = leaderboard.map((data, idx) => {
        const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `**${idx + 1}.**`;
        return `${medal} <@${data.userId}> - ${bold(data.total.toString())} invites`;
      }).join("\n");

      const embed = createEmbed({
        title: `${EMOJIS.invites} ${bold("Invite Leaderboard")}`,
        description: description
      });

      return msg.reply({ embeds: [embed] });
    }

    if (subCmd === "reset" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const target = msg.mentions.users.first();
      if (target) {
        resetInvites(guildId, target.id);
        return msg.reply({ embeds: [createSuccessEmbed("Invites Reset", `Reset ${target.tag}'s invite count!`)] });
      } else {
        resetInvites(guildId);
        return msg.reply({ embeds: [createSuccessEmbed("Invites Reset", "Reset all invite data!")] });
      }
    }

    // Show user invites
    const target = msg.mentions.users.first() || msg.author;
    const counts = getInviteCount(guildId, target.id);
    const total = counts.regular - counts.left - counts.fake;

    const embed = createEmbed({
      title: `${EMOJIS.invites} ${bold(`${target.username}'s Invites`)}`,
      thumbnail: target.displayAvatarURL({ dynamic: true }),
      fields: [
        { name: `${EMOJIS.chart} ${bold("Total")}`, value: `${total}`, inline: true },
        { name: `${EMOJIS.success} ${bold("Regular")}`, value: `${counts.regular}`, inline: true },
        { name: `🚪 ${bold("Left")}`, value: `${counts.left}`, inline: true },
        { name: `${EMOJIS.warning} ${bold("Fake")}`, value: `${counts.fake}`, inline: true }
      ]
    });

    return msg.reply({ embeds: [embed] });
  }

  /* ================= AUTOROLE COMMANDS ================= */
  if (cmd === "autorole" || cmd === "ar") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "add") {
      const role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);
      if (!role) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Role", `Usage: \`${PREFIX}autorole add @role\``)] });
      }
      if (!guildData(guildId).autoRoles[guildId]) guildData(guildId).autoRoles[guildId] = [];
      if (guildData(guildId).autoRoles[guildId].includes(role.id)) {
        return msg.reply({ embeds: [createInfoEmbed("Already Added", `${role} is already an auto role!`)] });
      }
      guildData(guildId).autoRoles[guildId].push(role.id);
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Auto Role Added", `${role} will be given to new members!`)] });
    }

    if (subCmd === "remove") {
      const role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);
      if (!role) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Role", `Usage: \`${PREFIX}autorole remove @role\``)] });
      }
      if (!guildData(guildId).autoRoles[guildId] || !guildData(guildId).autoRoles[guildId].includes(role.id)) {
        return msg.reply({ embeds: [createErrorEmbed("Not Found", `${role} is not an auto role!`)] });
      }
      guildData(guildId).autoRoles[guildId] = guildData(guildId).autoRoles[guildId].filter(r => r !== role.id);
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Auto Role Removed", `${role} removed from auto roles!`)] });
    }

    if (subCmd === "clear") {
      guildData(guildId).autoRoles[guildId] = [];
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Auto Roles Cleared", "All auto roles have been removed!")] });
    }

    if (subCmd === "list") {
      const roles = guildData(guildId).autoRoles[guildId] || [];
      if (roles.length === 0) {
        return msg.reply({ embeds: [createInfoEmbed("No Auto Roles", "No auto roles configured!")] });
      }

      const roleList = roles.map(id => {
        const role = msg.guild.roles.cache.get(id);
        return role ? `${EMOJIS.success} ${role}` : `${EMOJIS.error} Unknown (${id})`;
      }).join("\n");

      const embed = createEmbed({
        title: `${EMOJIS.customroles} ${bold("Auto Roles")}`,
        description: roleList,
        footer: `${roles.length} auto role(s)`
      });

      return msg.reply({ embeds: [embed] });
    }
  }

  /* ================= JOINDM COMMANDS ================= */
  if (cmd === "joindm") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable") {
      guildData(guildId).joinDm.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Join DM Enabled", "New members will receive a DM!")] });
    }

    if (subCmd === "disable") {
      guildData(guildId).joinDm.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Join DM Disabled", "Join DM has been disabled!")] });
    }

    if (subCmd === "setmessage") {
      const message = args.slice(1).join(" ");
      if (!message) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Message", `Usage: \`${PREFIX}joindm setmessage <message>\`\nPlaceholders: {user}, {server}, {membercount}`)] });
      }
      guildData(guildId).joinDm.message = message;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Message Set", "Join DM message updated!")] });
    }

    if (subCmd === "test") {
      if (!guildData(guildId).joinDm.message) {
        return msg.reply({ embeds: [createErrorEmbed("Not Set", "No join DM message set!")] });
      }
      const testMsg = guildData(guildId).joinDm.message
        .replace(/{user}/g, msg.author.username)
        .replace(/{server}/g, msg.guild.name)
        .replace(/{membercount}/g, msg.guild.memberCount);

      const embed = createEmbed({
        title: `${EMOJIS.welcome} ${bold(`Welcome to ${msg.guild.name}!`)}`,
        description: testMsg,
        thumbnail: msg.guild.iconURL({ dynamic: true })
      });

      return msg.reply({ content: `${bold("Preview:")}`, embeds: [embed] });
    }

  }

  /* ================= STICKY COMMANDS ================= */
  if (cmd === "sticky") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Messages permission!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      if (!guildData(guildId).stickySystem) guildData(guildId).stickySystem = {};
      guildData(guildId).stickySystem.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Sticky Enabled", "Sticky message system is now enabled!")] });
    }

    if (subCmd === "disable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      if (!guildData(guildId).stickySystem) guildData(guildId).stickySystem = {};
      guildData(guildId).stickySystem.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Sticky Disabled", "Sticky message system is now disabled!")] });
    }

    if (subCmd === "set" || subCmd === "add") {
      const message = args.slice(1).join(" ");
      if (!message) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Message", `Usage: \`${PREFIX}sticky set <message>\``)] });
      }
      guildData(guildId).stickyMessages[msg.channel.id] = {
        enabled: true,
        content: message,
        messageId: null
      };
      saveDB();
      await updateStickyMessage(msg.channel);
      return msg.reply({ embeds: [createSuccessEmbed("Sticky Set", "Sticky message has been set!")] });
    }

    if (subCmd === "remove" || subCmd === "delete") {
      if (!guildData(guildId).stickyMessages[msg.channel.id]) {
        return msg.reply({ embeds: [createErrorEmbed("No Sticky", "No sticky message in this channel!")] });
      }
      if (guildData(guildId).stickyMessages[msg.channel.id].messageId) {
        try {
          const oldMsg = await msg.channel.messages.fetch(guildData(guildId).stickyMessages[msg.channel.id].messageId);
          await oldMsg.delete();
        } catch (err) {}
      }
      delete guildData(guildId).stickyMessages[msg.channel.id];
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Sticky Removed", "Sticky message has been removed!")] });
    }

    if (subCmd === "list") {
      const stickies = Object.entries(guildData(guildId).stickyMessages).filter(([id]) => msg.guild.channels.cache.has(id));
      if (stickies.length === 0) {
        return msg.reply({ embeds: [createInfoEmbed("No Stickies", "No sticky messages in this server!")] });
      }

      const list = stickies.map(([id, data]) => `${EMOJIS.sticky} <#${id}>: ${data.content.slice(0, 50)}...`).join("\n");

      const embed = createEmbed({
        title: `${EMOJIS.sticky} ${bold("Sticky Messages")}`,
        description: list,
        footer: `${stickies.length} sticky message(s)`
      });

      return msg.reply({ embeds: [embed] });
    }

    if (false) {
      const embed = createEmbed({
        title: `${EMOJIS.sticky} ${bold("Sticky Commands")}`,
        description: 
          `\`${PREFIX}sticky set <message>\` - Set sticky message\n` +
          `\`${PREFIX}sticky remove\` - Remove sticky message\n` +
          `\`${PREFIX}sticky list\` - List all sticky messages\n` +
          `\`${PREFIX}sticky enable\` - Enable sticky system\n` +
          `\`${PREFIX}sticky disable\` - Disable sticky system`
      });
      return msg.reply({ embeds: [embed] });
    }
  }

  /* ================= AUTORESPONDER COMMANDS ================= */
  if (cmd === "autoresponder" || cmd === "ar") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Messages permission!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      guildData(guildId).autoresponder.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Autoresponder Enabled", "Autoresponder is now enabled!")] });
    }

    if (subCmd === "disable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      guildData(guildId).autoresponder.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Autoresponder Disabled", "Autoresponder is now disabled!")] });
    }

    if (subCmd === "add") {
      const input = args.slice(1).join(" ");
      if (!input.includes("|")) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Format", `Usage: \`${PREFIX}autoresponder add trigger | response\``)] });
      }
      const [trigger, response] = input.split("|").map(s => s.trim());
      if (!trigger || !response) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Format", "Both trigger and response are required!")] });
      }
      addAutoResponder(guildId, trigger, response, [], msg.author.id);
      return msg.reply({ embeds: [createSuccessEmbed("Autoresponder Added", `Trigger: \`${trigger}\`\nResponse: ${response}`)] });
    }

    if (subCmd === "remove" || subCmd === "delete") {
      const trigger = args.slice(1).join(" ");
      if (!trigger) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Trigger", `Usage: \`${PREFIX}autoresponder remove <trigger>\``)] });
      }
      const removed = removeAutoResponder(guildId, trigger);
      if (removed) {
        return msg.reply({ embeds: [createSuccessEmbed("Autoresponder Removed", `Removed trigger: \`${trigger}\``)] });
      }
      return msg.reply({ embeds: [createErrorEmbed("Not Found", "Trigger not found!")] });
    }

    if (subCmd === "clear") {
      const count = clearAutoResponders(guildId);
      return msg.reply({ embeds: [createSuccessEmbed("Autoresponders Cleared", `Removed ${count} autoresponder(s)!`)] });
    }

    if (subCmd === "list") {
      const responders = listAutoResponders(guildId);
      if (responders.length === 0) {
        return msg.reply({ embeds: [createInfoEmbed("No Autoresponders", "No autoresponders configured!")] });
      }

      const list = responders.map(r => `\`${r.trigger}\` → ${r.response?.slice(0, 50) || "No response"}...`).join("\n");

      const embed = createEmbed({
        title: `${EMOJIS.autorespond} ${bold("Autoresponders")}`,
        description: list.slice(0, 4000),
        footer: `${responders.length} autoresponder(s)`
      });

      return msg.reply({ embeds: [embed] });
    }

  }

  /* ================= AUTOREACT COMMANDS ================= */
  if (cmd === "autoreact") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Messages permission!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      guildData(guildId).autoreact.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Autoreact Enabled", "Autoreact is now enabled!")] });
    }

    if (subCmd === "disable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      guildData(guildId).autoreact.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Autoreact Disabled", "Autoreact is now disabled!")] });
    }

    if (subCmd === "add") {
      const trigger = args[1];
      const emojis = args.slice(2);
      if (!trigger || emojis.length === 0) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Usage", `Usage: \`${PREFIX}autoreact add <trigger> <emoji1> [emoji2] ...\``)] });
      }
      addAutoReact(guildId, trigger, emojis, msg.author.id);
      return msg.reply({ embeds: [createSuccessEmbed("Autoreact Added", `Trigger: \`${trigger}\`\nEmojis: ${emojis.join(" ")}`)] });
    }

    if (subCmd === "remove" || subCmd === "delete") {
      const trigger = args[1];
      if (!trigger) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Trigger", `Usage: \`${PREFIX}autoreact remove <trigger>\``)] });
      }
      const removed = removeAutoReact(guildId, trigger);
      if (removed) {
        return msg.reply({ embeds: [createSuccessEmbed("Autoreact Removed", `Removed trigger: \`${trigger}\``)] });
      }
      return msg.reply({ embeds: [createErrorEmbed("Not Found", "Trigger not found!")] });
    }

    if (subCmd === "clear") {
      const count = clearAutoReacts(guildId);
      return msg.reply({ embeds: [createSuccessEmbed("Autoreacts Cleared", `Removed ${count} autoreact(s)!`)] });
    }

    if (subCmd === "list") {
      const reacts = listAutoReacts(guildId);
      if (reacts.length === 0) {
        return msg.reply({ embeds: [createInfoEmbed("No Autoreacts", "No autoreacts configured!")] });
      }

      const list = reacts.map(r => `\`${r.trigger}\` → ${r.emojis.join(" ")}`).join("\n");

      const embed = createEmbed({
        title: `${EMOJIS.autoreact} ${bold("Autoreacts")}`,
        description: list,
        footer: `${reacts.length} autoreact(s)`
      });

      return msg.reply({ embeds: [embed] });
    }

  }

  /* ================= TICKET COMMANDS ================= */
  if (cmd === "ticket" && args[0]?.toLowerCase() === "config") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }
    const sessionId = `${msg.author.id}_${Date.now()}`;
    const { container: tkContainer } = buildTicketConfigPanel(msg.guild, msg.guildId, sessionId);
    return msg.reply({ components: [tkContainer], flags: MessageFlags.IsComponentsV2 });
  }

  /* ================= TEMPVOICE COMMANDS ================= */
  if (cmd === "tempvoice" || cmd === "tv") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    if (subCmd === "enable") {
      guildData(guildId).tempVoice.enabled = true;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Temp Voice Enabled", "Temporary voice channels are now enabled!")] });
    }

    if (subCmd === "disable") {
      guildData(guildId).tempVoice.enabled = false;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Temp Voice Disabled", "Temporary voice channels are now disabled!")] });
    }

    if (subCmd === "setchannel") {
      const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
      if (!channel || channel.type !== ChannelType.GuildVoice) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", "Please mention a voice channel!")] });
      }
      guildData(guildId).tempVoice.createChannel = channel.id;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Channel Set", `Join ${channel} to create a temporary voice channel!`)] });
    }

    if (subCmd === "setcategory") {
      const category = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
      if (!category || category.type !== ChannelType.GuildCategory) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Category", "Please mention a category!")] });
      }
      guildData(guildId).tempVoice.category = category.id;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Category Set", `Temp channels will be created in ${category}`)] });
    }

    if (subCmd === "setname") {
      const name = args.slice(1).join(" ");
      if (!name) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Name", `Usage: \`${PREFIX}tempvoice setname <name>\`\nPlaceholder: {user}`)] });
      }
      guildData(guildId).tempVoice.defaultName = name;
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Name Set", `Default name: ${name}`)] });
    }

  }

  /* ================= VOICE COMMANDS ================= */
  if (cmd === "voice" || cmd === "vc") {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
      return msg.reply({ embeds: [createErrorEmbed("Not in Voice", "You must be in a voice channel!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    const tempChannel = guildData(guildId).tempVoice?.channels?.[voiceChannel.id];
    
    if (!tempChannel && subCmd && !["help", "settings"].includes(subCmd)) {
      return msg.reply({ embeds: [createErrorEmbed("Not Your Channel", "This is not a temporary voice channel or you don't own it!")] });
    }

    if (subCmd === "limit") {
      const limit = parseInt(args[1]);
      if (isNaN(limit) || limit < 0 || limit > 99) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Limit", "User limit must be between 0-99 (0 = unlimited)")] });
      }
      await voiceChannel.setUserLimit(limit);
      return msg.reply({ embeds: [createSuccessEmbed("Limit Set", `User limit set to ${limit === 0 ? "unlimited" : limit}!`)] });
    }

    if (subCmd === "name" || subCmd === "rename") {
      const name = args.slice(1).join(" ");
      if (!name || name.length > 100) {
        return msg.reply({ embeds: [createErrorEmbed("Invalid Name", "Name must be 1-100 characters!")] });
      }
      await voiceChannel.setName(name);
      return msg.reply({ embeds: [createSuccessEmbed("Name Changed", `Channel renamed to ${bold(name)}!`)] });
    }

    if (subCmd === "lock") {
      await voiceChannel.permissionOverwrites.edit(msg.guild.id, { Connect: false });
      return msg.reply({ embeds: [createSuccessEmbed("Channel Locked", "Voice channel locked!")] });
    }

    if (subCmd === "unlock") {
      await voiceChannel.permissionOverwrites.edit(msg.guild.id, { Connect: null });
      return msg.reply({ embeds: [createSuccessEmbed("Channel Unlocked", "Voice channel unlocked!")] });
    }

    if (subCmd === "permit" || subCmd === "allow") {
      const user = msg.mentions.users.first();
      if (!user) {
        return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}voice permit @user\``)] });
      }
      await voiceChannel.permissionOverwrites.edit(user.id, { Connect: true });
      return msg.reply({ embeds: [createSuccessEmbed("User Permitted", `${user} can now join!`)] });
    }

    if (subCmd === "reject" || subCmd === "deny") {
      const user = msg.mentions.users.first();
      if (!user) {
        return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}voice reject @user\``)] });
      }
      await voiceChannel.permissionOverwrites.edit(user.id, { Connect: false });
      const member = msg.guild.members.cache.get(user.id);
      if (member?.voice.channelId === voiceChannel.id) {
        await member.voice.disconnect();
      }
      return msg.reply({ embeds: [createSuccessEmbed("User Rejected", `${user} has been blocked!`)] });
    }

    if (subCmd === "claim") {
      if (!tempChannel) {
        return msg.reply({ embeds: [createErrorEmbed("Not Temp Channel", "This is not a temporary voice channel!")] });
      }
      const owner = await msg.guild.members.fetch(tempChannel.owner).catch(() => null);
      if (owner && owner.voice.channelId === voiceChannel.id) {
        return msg.reply({ embeds: [createErrorEmbed("Owner Present", "The owner is still in the channel!")] });
      }
      tempChannel.owner = msg.author.id;
      saveDB();
      await voiceChannel.permissionOverwrites.edit(msg.author.id, {
        ManageChannels: true,
        MoveMembers: true
      });
      return msg.reply({ embeds: [createSuccessEmbed("Ownership Claimed", "You are now the owner!")] });
    }

    if (subCmd === "transfer") {
      const user = msg.mentions.users.first();
      if (!user) {
        return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}voice transfer @user\``)] });
      }
      if (tempChannel.owner !== msg.author.id) {
        return msg.reply({ embeds: [createErrorEmbed("Not Owner", "Only the owner can transfer ownership!")] });
      }
      tempChannel.owner = user.id;
      saveDB();
      await voiceChannel.permissionOverwrites.edit(msg.author.id, {
        ManageChannels: null,
        MoveMembers: null
      });
      await voiceChannel.permissionOverwrites.edit(user.id, {
        ManageChannels: true,
        MoveMembers: true
      });
      return msg.reply({ embeds: [createSuccessEmbed("Ownership Transferred", `${user} is now the owner!`)] });
    }

    const embed = createEmbed({
      title: `${EMOJIS.voice} ${bold("Voice Commands")}`,
      description: 
        `\`${PREFIX}voice limit <0-99>\` - Set user limit\n` +
        `\`${PREFIX}voice name <name>\` - Rename channel\n` +
        `\`${PREFIX}voice lock\` - Lock channel\n` +
        `\`${PREFIX}voice unlock\` - Unlock channel\n` +
        `\`${PREFIX}voice permit @user\` - Allow user\n` +
        `\`${PREFIX}voice reject @user\` - Block user\n` +
        `\`${PREFIX}voice claim\` - Claim ownership\n` +
        `\`${PREFIX}voice transfer @user\` - Transfer ownership`
    });
    return msg.reply({ embeds: [embed] });
  }
  /* ================= COUNTING COMMANDS ================= */
if (cmd === "counting" || cmd === "count") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  const subCmd = args[0]?.toLowerCase();
  if (!subCmd) return;

  if (subCmd === "enable") {
    if (!guildData(guildId).countingSystem) guildData(guildId).countingSystem = {};
    guildData(guildId).countingSystem.enabled = true;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Counting Enabled", "Counting system is now enabled!")] });
  }

  if (subCmd === "disable") {
    if (!guildData(guildId).countingSystem) guildData(guildId).countingSystem = {};
    guildData(guildId).countingSystem.enabled = false;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Counting Disabled", "Counting system is now disabled!")] });
  }

  if (subCmd === "setchannel") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}counting setchannel #channel\``)] });
    }
    if (!guildData(guildId).counting[guildId]) {
      guildData(guildId).counting[guildId] = {
        channel: channel.id,
        count: 0,
        lastUser: null,
        highScore: 0
      };
    } else {
      guildData(guildId).counting[guildId].channel = channel.id;
    }
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channel Set", `Counting channel set to ${channel}!\n\nStart counting from ${bold("1")}!`)] });
  }

  if (subCmd === "reset") {
    if (!guildData(guildId).counting[guildId]) {
      return msg.reply({ embeds: [createErrorEmbed("Not Setup", "Counting system is not setup!")] });
    }
    const oldCount = guildData(guildId).counting[guildId].count;
    guildData(guildId).counting[guildId].count = 0;
    guildData(guildId).counting[guildId].lastUser = null;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Count Reset", `Count reset from ${bold(oldCount.toString())} to ${bold("0")}!`)] });
  }

  if (subCmd === "stats") {
    if (!guildData(guildId).counting[guildId]) {
      return msg.reply({ embeds: [createErrorEmbed("Not Setup", "Counting system is not setup!")] });
    }
    const countData = guildData(guildId).counting[guildId];
    const embed = createEmbed({
      title: `${EMOJIS.counting} ${bold("Counting Stats")}`,
      fields: [
        { name: `${EMOJIS.chart} ${bold("Current Count")}`, value: `${countData.count}`, inline: true },
        { name: `${EMOJIS.trophy} ${bold("High Score")}`, value: `${countData.highScore || 0}`, inline: true },
        { name: `${EMOJIS.confession} ${bold("Last Counter")}`, value: countData.lastUser ? `<@${countData.lastUser}>` : "None", inline: true },
        { name: `${EMOJIS.messages} ${bold("Channel")}`, value: countData.channel ? `<#${countData.channel}>` : "Not set", inline: true }
      ]
    });
    return msg.reply({ embeds: [embed] });
  }


  const embed = createEmbed({
    title: `${EMOJIS.counting} ${bold("Counting Commands")}`,
    description: 
      `\`${PREFIX}counting enable\` - Enable system\n` +
      `\`${PREFIX}counting disable\` - Disable system\n` +
      `\`${PREFIX}counting setchannel #channel\` - Set channel\n` +
      `\`${PREFIX}counting reset\` - Reset count\n` +
      `\`${PREFIX}counting stats\` - View statistics\n` +
      `\`${PREFIX}counting settings\` - View settings`
  });
  return msg.reply({ embeds: [embed] });
}

/* ================= WALL SYSTEM COMMANDS ================= */
if (cmd === "wall") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  const subCmd = args[0]?.toLowerCase();
  if (!subCmd) return;
  const ARROW = "<a:zzz_arrow_hash:1485872093437497434>";
  const EXCL  = "<a:zzz_Exclamation:1485872115662983288>";
  const SUB   = "<a:arrow_arrow:1485908026006442015>";

  // ── !wall enable ──────────────────────────────────────────────────────
  if (subCmd === "enable") {
    guildData(guildId).wallSystem.enabled = true;
    saveDB();

    // Auto-create Immune and Quarantine roles if not set
    let immuneRole  = guildData(guildId).wallSystem.immuneRoleId  ? msg.guild.roles.cache.get(guildData(guildId).wallSystem.immuneRoleId)  : null;
    let quarRole    = guildData(guildId).wallSystem.quarantineRoleId ? msg.guild.roles.cache.get(guildData(guildId).wallSystem.quarantineRoleId) : null;
    const created   = [];

    if (!immuneRole) {
      immuneRole = await msg.guild.roles.create({
        name: "Wall Immune",
        color: 0x00FF00,
        permissions: [],
        reason: "Auto-created by Wall System"
      }).catch(() => null);
      if (immuneRole) { guildData(guildId).wallSystem.immuneRoleId = immuneRole.id; created.push(`✅ Immune role: ${immuneRole}`); }
    }
    if (!quarRole) {
      quarRole = await msg.guild.roles.create({
        name: "Quarantine",
        color: 0xFF0000,
        permissions: [],
        reason: "Auto-created by Wall System"
      }).catch(() => null);
      if (quarRole) { guildData(guildId).wallSystem.quarantineRoleId = quarRole.id; created.push(`🔒 Quarantine role: ${quarRole}`); }
    }
    saveDB();

    return msg.reply({ embeds: [createEmbed({
      title: `${EMOJIS.wall} ${bold("Wall System Enabled")}`,
      description:
        `${ARROW} **Status:** ${EMOJI_ENABLE} Active${EXCL}\n` +
        `${ARROW} **Immune Role:** ${immuneRole ? immuneRole : "`Not set`"}${EXCL}\n` +
        `${ARROW} **Quarantine Role:** ${quarRole ? quarRole : "`Not set`"}${EXCL}\n\n` +
        (created.length ? `**Auto-created:**\n${created.join("\n")}` : ""),
      color: 0x00FF00
    })] });
  }

  // ── !wall disable ─────────────────────────────────────────────────────
  if (subCmd === "disable") {
    guildData(guildId).wallSystem.enabled = false;
    saveDB();
    return msg.reply({ embeds: [createEmbed({
      title: `${EMOJIS.wall} ${bold("Wall System Disabled")}`,
      description: `${ARROW} **Status:** ${EMOJI_DISABLE} Inactive${EXCL}\n${SUB}  Quarantined users keep their role until manually released.`,
      color: 0xFF0000
    })] });
  }

  // ── !wall quarantine @user [reason] ───────────────────────────────────
  if (subCmd === "quarantine" || subCmd === "q") {
    if (!guildData(guildId).wallSystem.enabled) return msg.reply({ embeds: [createErrorEmbed("Not Enabled", "Enable the wall system first with `!wall enable`.")] });

    const target = msg.mentions.members.first();
    if (!target) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}wall quarantine @user [reason]\``)] });
    if (target.id === msg.author.id) return msg.reply({ embeds: [createErrorEmbed("Error", "You cannot quarantine yourself!")] });
    if (target.roles.highest.position >= msg.member.roles.highest.position && msg.author.id !== msg.guild.ownerId) {
      return msg.reply({ embeds: [createErrorEmbed("Error", "Target has a higher or equal role!")] });
    }

    const reason = args.slice(2).join(" ") || "No reason provided";
    const qRoleId = guildData(guildId).wallSystem.quarantineRoleId;
    if (!qRoleId) return msg.reply({ embeds: [createErrorEmbed("Not Configured", "Quarantine role not set. Use `!wall enable` to auto-create it.")] });

    const qRole = msg.guild.roles.cache.get(qRoleId);
    if (!qRole) return msg.reply({ embeds: [createErrorEmbed("Role Missing", "Quarantine role not found in server!")] });

    // Check if user has immune role
    const immuneRoleId = guildData(guildId).wallSystem.immuneRoleId;
    if (immuneRoleId && target.roles.cache.has(immuneRoleId)) {
      return msg.reply({ embeds: [createErrorEmbed("Immune", `${target} has the **Wall Immune** role and cannot be quarantined!`)] });
    }

    // Save old roles (except @everyone) and apply quarantine role
    const savedRoles = target.roles.cache
      .filter(r => r.id !== msg.guild.id && r.id !== qRoleId)
      .map(r => r.id);

    if (!guildData(guildId).wallSystem.quarantined) guildData(guildId).wallSystem.quarantined = {};
    if (!guildData(guildId).wallSystem.quarantined[msg.guildId]) guildData(guildId).wallSystem.quarantined[msg.guildId] = {};

    guildData(guildId).wallSystem.quarantined[msg.guildId][target.id] = {
      savedRoles,
      reason,
      moderatorId: msg.author.id,
      timestamp: Date.now()
    };
    saveDB();

    try {
      // Remove all roles and give quarantine role
      await target.roles.set([qRoleId], `Quarantined by ${msg.author.tag}: ${reason}`);

      // DM the user
      await target.send({ embeds: [createEmbed({
        title: `🔒 ${bold("You've Been Quarantined")}`,
        description:
          `${ARROW} **Server:** ${msg.guild.name}${EXCL}\n` +
          `${ARROW} **Moderator:** ${msg.author.tag}${EXCL}\n` +
          `${ARROW} **Reason:** ${reason}${EXCL}`,
        color: 0xFF0000
      })] }).catch(() => {});

      // Log channel
      if (guildData(guildId).wallSystem.logChannel) {
        const logCh = msg.guild.channels.cache.get(guildData(guildId).wallSystem.logChannel);
        if (logCh) await logCh.send({ embeds: [createEmbed({
          title: `🔒 ${bold("User Quarantined")}`,
          description:
            `${ARROW} **User:** ${target.user.tag} (${target.id})${EXCL}\n` +
            `${ARROW} **Moderator:** ${msg.author.tag}${EXCL}\n` +
            `${ARROW} **Reason:** ${reason}${EXCL}\n` +
            `${ARROW} **Roles Saved:** ${savedRoles.length}${EXCL}`,
          color: 0xFF0000,
          footer: `Wall System • ${new Date().toLocaleString()}`
        })] }).catch(() => {});
      }

      return msg.reply({ embeds: [createEmbed({
        title: `🔒 ${bold("User Quarantined")}`,
        description:
          `${ARROW} **User:** ${target}${EXCL}\n` +
          `${ARROW} **Moderator:** ${msg.author.tag}${EXCL}\n` +
          `${ARROW} **Reason:** ${reason}${EXCL}\n` +
          `${ARROW} **Roles Saved:** ${savedRoles.length} (restored on release)${EXCL}`,
        color: 0xFF0000
      })] });
    } catch (err) {
      return msg.reply({ embeds: [createErrorEmbed("Failed", `Could not quarantine: ${err.message}`)] });
    }
  }

  // ── !wall release @user ───────────────────────────────────────────────
  if (subCmd === "release" || subCmd === "unquarantine" || subCmd === "uq") {
    const target = msg.mentions.members.first();
    if (!target) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}wall release @user\``)] });

    const qData = guildData(guildId).wallSystem.quarantined?.[msg.guildId]?.[target.id];
    if (!qData) return msg.reply({ embeds: [createErrorEmbed("Not Quarantined", `${target} is not currently quarantined!`)] });

    try {
      // Restore saved roles
      const rolesToRestore = qData.savedRoles.filter(id => msg.guild.roles.cache.has(id));
      await target.roles.set(rolesToRestore, `Released from quarantine by ${msg.author.tag}`);

      delete guildData(guildId).wallSystem.quarantined[msg.guildId][target.id];
      saveDB();

      // DM
      await target.send({ embeds: [createEmbed({
        title: `🔓 ${bold("Quarantine Released")}`,
        description:
          `${ARROW} **Server:** ${msg.guild.name}${EXCL}\n` +
          `${ARROW} **Released by:** ${msg.author.tag}${EXCL}\n` +
          `${ARROW} **Roles Restored:** ${rolesToRestore.length}${EXCL}`,
        color: 0x00FF00
      })] }).catch(() => {});

      if (guildData(guildId).wallSystem.logChannel) {
        const logCh = msg.guild.channels.cache.get(guildData(guildId).wallSystem.logChannel);
        if (logCh) await logCh.send({ embeds: [createEmbed({
          title: `🔓 ${bold("User Released from Quarantine")}`,
          description:
            `${ARROW} **User:** ${target.user.tag} (${target.id})${EXCL}\n` +
            `${ARROW} **Released by:** ${msg.author.tag}${EXCL}\n` +
            `${ARROW} **Duration:** ${formatDuration(Date.now() - qData.timestamp)}${EXCL}`,
          color: 0x00FF00,
          footer: `Wall System • ${new Date().toLocaleString()}`
        })] }).catch(() => {});
      }

      return msg.reply({ embeds: [createEmbed({
        title: `🔓 ${bold("User Released")}`,
        description:
          `${ARROW} **User:** ${target}${EXCL}\n` +
          `${ARROW} **Released by:** ${msg.author.tag}${EXCL}\n` +
          `${ARROW} **Roles Restored:** ${rolesToRestore.length}${EXCL}\n` +
          `${ARROW} **Was quarantined for:** ${formatDuration(Date.now() - qData.timestamp)}${EXCL}`,
        color: 0x00FF00
      })] });
    } catch (err) {
      return msg.reply({ embeds: [createErrorEmbed("Failed", `Could not release: ${err.message}`)] });
    }
  }

  // ── !wall immune @user ────────────────────────────────────────────────
  if (subCmd === "immune") {
    const target = msg.mentions.members.first();
    if (!target) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}wall immune @user\``)] });

    const immuneRoleId = guildData(guildId).wallSystem.immuneRoleId;
    if (!immuneRoleId) return msg.reply({ embeds: [createErrorEmbed("Not Configured", "Immune role not set. Use `!wall enable` to auto-create it.")] });

    const immuneRole = msg.guild.roles.cache.get(immuneRoleId);
    if (!immuneRole) return msg.reply({ embeds: [createErrorEmbed("Role Missing", "Immune role not found in server!")] });

    if (target.roles.cache.has(immuneRoleId)) {
      // Remove immunity
      await target.roles.remove(immuneRoleId).catch(() => {});
      return msg.reply({ embeds: [createEmbed({
        title: `${EMOJIS.immune} ${bold("Immunity Removed")}`,
        description:
          `${ARROW} **User:** ${target}${EXCL}\n` +
          `${ARROW} **Role Removed:** ${immuneRole}${EXCL}`,
        color: 0xFFAA00
      })] });
    } else {
      // Give immunity
      await target.roles.add(immuneRoleId).catch(() => {});
      return msg.reply({ embeds: [createEmbed({
        title: `${EMOJIS.immune} ${bold("Immunity Granted")}`,
        description:
          `${ARROW} **User:** ${target}${EXCL}\n` +
          `${ARROW} **Role Added:** ${immuneRole}${EXCL}`,
        color: 0x00FF00
      })] });
    }
  }

  // ── !wall setlogs #channel ────────────────────────────────────────────
  if (subCmd === "setlogs") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}wall setlogs #channel\``)] });
    guildData(guildId).wallSystem.logChannel = channel.id;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Log Channel Set", `Wall system logs will be sent to ${channel}`)] });
  }

  // ── !wall list ────────────────────────────────────────────────────────
  if (subCmd === "list") {
    const quarantined = guildData(guildId).wallSystem.quarantined?.[msg.guildId] || {};
    const entries = Object.entries(quarantined);
    if (entries.length === 0) return msg.reply({ embeds: [createInfoEmbed("No Quarantined Users", "No users are currently quarantined.")] });

    const lines = entries.map(([uid, data]) =>
      `${ARROW} <@${uid}> — by <@${data.moderatorId}>${EXCL}\n${SUB}  ${data.reason} • <t:${Math.floor(data.timestamp / 1000)}:R>`
    ).join("\n");

    return msg.reply({ embeds: [createEmbed({
      title: `🔒 ${bold("Quarantined Users")}`,
      description: lines,
      footer: `${entries.length} user(s) quarantined`
    })] });
  }

  // ── !wall settings ────────────────────────────────────────────────────
}

/* ================= QUARANTINE SHORTCUTS ================= */
if (cmd === "quarantine" || cmd === "q8" || cmd === "jail") {
  // Shortcut for !wall quarantine
  args.unshift("quarantine");
  // Re-route to wall handler by falling through with cmd = "wall"
  const fakeMsg = Object.create(msg);
  const wallArgs = args;
  const target = fakeMsg.mentions?.members?.first?.();
  if (!fakeMsg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }
  if (!guildData(guildId).wallSystem.enabled) return msg.reply({ embeds: [createErrorEmbed("Not Enabled", "Enable wall system first: `!wall enable`")] });
  const qTarget = msg.mentions.members.first();
  if (!qTarget) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}quarantine @user [reason]\``)] });
  const qReason = args.slice(1).join(" ") || "No reason provided";
  const qRoleId = guildData(guildId).wallSystem.quarantineRoleId;
  if (!qRoleId) return msg.reply({ embeds: [createErrorEmbed("Not Configured", "Run `!wall enable` first to set up quarantine roles.")] });
  const qRole = msg.guild.roles.cache.get(qRoleId);
  if (!qRole) return msg.reply({ embeds: [createErrorEmbed("Role Missing", "Quarantine role not found!")] });
  if (guildData(guildId).wallSystem.immuneRoleId && qTarget.roles.cache.has(guildData(guildId).wallSystem.immuneRoleId)) {
    return msg.reply({ embeds: [createErrorEmbed("Immune", `${qTarget} has the Wall Immune role!`)] });
  }
  const savedRoles = qTarget.roles.cache.filter(r => r.id !== msg.guild.id && r.id !== qRoleId).map(r => r.id);
  if (!guildData(guildId).wallSystem.quarantined) guildData(guildId).wallSystem.quarantined = {};
  if (!guildData(guildId).wallSystem.quarantined[msg.guildId]) guildData(guildId).wallSystem.quarantined[msg.guildId] = {};
  guildData(guildId).wallSystem.quarantined[msg.guildId][qTarget.id] = { savedRoles, reason: qReason, moderatorId: msg.author.id, timestamp: Date.now() };
  saveDB();
  try {
    await qTarget.roles.set([qRoleId], `Quarantined by ${msg.author.tag}: ${qReason}`);
    await qTarget.send({ embeds: [createEmbed({ title: `🔒 ${bold("You've Been Quarantined")}`, description: `<a:zzz_arrow_hash:1485872093437497434> **Server:** ${msg.guild.name}<a:zzz_Exclamation:1485872115662983288>
<a:zzz_arrow_hash:1485872093437497434> **Reason:** ${qReason}<a:zzz_Exclamation:1485872115662983288>`, color: 0xFF0000 })] }).catch(() => {});
    return msg.reply({ embeds: [createEmbed({ title: `🔒 ${bold("User Quarantined")}`, description: `<a:zzz_arrow_hash:1485872093437497434> **User:** ${qTarget}<a:zzz_Exclamation:1485872115662983288>
<a:zzz_arrow_hash:1485872093437497434> **Reason:** ${qReason}<a:zzz_Exclamation:1485872115662983288>`, color: 0xFF0000 })] });
  } catch (err) {
    return msg.reply({ embeds: [createErrorEmbed("Failed", err.message)] });
  }
}

if (cmd === "release" || cmd === "unquarantine" || cmd === "unjail") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }
  const rTarget = msg.mentions.members.first();
  if (!rTarget) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}release @user\``)] });
  const qData = guildData(guildId).wallSystem.quarantined?.[msg.guildId]?.[rTarget.id];
  if (!qData) return msg.reply({ embeds: [createErrorEmbed("Not Quarantined", `${rTarget} is not quarantined!`)] });
  try {
    const rolesToRestore = qData.savedRoles.filter(id => msg.guild.roles.cache.has(id));
    await rTarget.roles.set(rolesToRestore, `Released by ${msg.author.tag}`);
    delete guildData(guildId).wallSystem.quarantined[msg.guildId][rTarget.id];
    saveDB();
    return msg.reply({ embeds: [createEmbed({ title: `🔓 ${bold("User Released")}`, description: `<a:zzz_arrow_hash:1485872093437497434> **User:** ${rTarget}<a:zzz_Exclamation:1485872115662983288>
<a:zzz_arrow_hash:1485872093437497434> **Roles Restored:** ${rolesToRestore.length}<a:zzz_Exclamation:1485872115662983288>`, color: 0x00FF00 })] });
  } catch (err) {
    return msg.reply({ embeds: [createErrorEmbed("Failed", err.message)] });
  }
}

/* ================= CONFESSION COMMANDS ================= */
if (cmd === "confession" || cmd === "confess") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  const subCmd = args[0]?.toLowerCase();
  if (!subCmd) return;

  if (subCmd === "enable") {
    guildData(guildId).confession.enabled = true;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Confessions Enabled", "Confession system is now enabled!")] });
  }

  if (subCmd === "disable") {
    guildData(guildId).confession.enabled = false;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Confessions Disabled", "Confession system is now disabled!")] });
  }

  if (subCmd === "setchannel") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}confession setchannel #channel\``)] });
    }
    guildData(guildId).confession.channel = channel.id;
    guildData(guildId).confessionChannel = channel.id; // Legacy support
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channel Set", `Confession channel set to ${channel}\n\nUsers can confess using: \`${CONFESSION_PREFIX}your confession here\``)] });
  }

  if (subCmd === "setlogs") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}confession setlogs #channel\``)] });
    }
    guildData(guildId).confession.logs = channel.id;
    guildData(guildId).confessionLogs = channel.id; // Legacy support
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Logs Set", `Confession logs channel set to ${channel}`)] });
  }

  if (subCmd === "ban") {
    const user = msg.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);
    if (!user) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid User", `Usage: \`${PREFIX}confession ban @user\``)] });
    }
    if (!guildData(guildId).confession.bannedUsers) guildData(guildId).confession.bannedUsers = [];
    if (!guildData(guildId).confessionBannedUsers) guildData(guildId).confessionBannedUsers = [];
    
    if (guildData(guildId).confession.bannedUsers.includes(user.id)) {
      return msg.reply({ embeds: [createInfoEmbed("Already Banned", `${user.tag} is already banned from confessions!`)] });
    }
    
    guildData(guildId).confession.bannedUsers.push(user.id);
    guildData(guildId).confessionBannedUsers.push(user.id); // Legacy support
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("User Banned", `${user.tag} has been banned from confessions!`)] });
  }

  if (subCmd === "unban") {
    const user = msg.mentions.users.first() || await client.users.fetch(args[1]).catch(() => null);
    if (!user) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid User", `Usage: \`${PREFIX}confession unban @user\``)] });
    }
    
    guildData(guildId).confession.bannedUsers = (guildData(guildId).confession.bannedUsers || []).filter(id => id !== user.id);
    guildData(guildId).confessionBannedUsers = (guildData(guildId).confessionBannedUsers || []).filter(id => id !== user.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("User Unbanned", `${user.tag} can now confess again!`)] });
  }

  if (subCmd === "list") {
    const confessions = guildData(guildId).confession.confessions || guildData(guildId).confessions || [];
    if (confessions.length === 0) {
      return msg.reply({ embeds: [createErrorEmbed("No Confessions", "No confessions have been made yet!")] });
    }

    const recent = confessions.slice(-10).reverse();
    const list = recent.map(c => 
      `${bold(`#${c.id}`)} - <t:${Math.floor(c.time / 1000)}:R>\n↳ ${c.content.slice(0, 100)}${c.content.length > 100 ? '...' : ''}`
    ).join("\n\n");

    const embed = createEmbed({
      title: `${EMOJIS.confession} ${bold("Recent Confessions")}`,
      description: list,
      footer: `Total: ${confessions.length} confession(s) | Showing last 10`
    });

    return msg.reply({ embeds: [embed] });
  }

}

/* ================= MEDIA COMMANDS ================= */
if (cmd === "media" || cmd === "mediaonly") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  const subCmd = args[0]?.toLowerCase();
  if (!subCmd) return;

  if (subCmd === "enable") {
    guildData(guildId).media.enabled = true;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Media System Enabled", "Media-only channels are now active!")] });
  }

  if (subCmd === "disable") {
    guildData(guildId).media.enabled = false;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Media System Disabled", "Media system has been disabled!")] });
  }

  if (subCmd === "add") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}media add #channel\``)] });
    }
    
    if (!guildData(guildId).media.onlyChannels) guildData(guildId).media.onlyChannels = [];
    if (!guildData(guildId).mediaOnlyChannels) guildData(guildId).mediaOnlyChannels = [];
    
    if (guildData(guildId).media.onlyChannels.includes(channel.id)) {
      return msg.reply({ embeds: [createInfoEmbed("Already Added", `${channel} is already a media-only channel!`)] });
    }
    
    guildData(guildId).media.onlyChannels.push(channel.id);
    guildData(guildId).mediaOnlyChannels.push(channel.id); // Legacy support
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Media Channel Added", `${channel} is now media-only!\n\nOnly messages with attachments or media links will be allowed.`)] });
  }

  if (subCmd === "remove") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}media remove #channel\``)] });
    }
    
    guildData(guildId).media.onlyChannels = (guildData(guildId).media.onlyChannels || []).filter(id => id !== channel.id);
    guildData(guildId).mediaOnlyChannels = (guildData(guildId).mediaOnlyChannels || []).filter(id => id !== channel.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Media Channel Removed", `${channel} is no longer media-only!`)] });
  }

  if (subCmd === "setlogs") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}media setlogs #channel\``)] });
    }
    
    guildData(guildId).media.deleteLogsChannel = channel.id;
    guildData(guildId).mediaDeleteChannel = channel.id; // Legacy support
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Logs Set", `Media delete logs will be sent to ${channel}`)] });
  }

  if (subCmd === "list") {
    const channels = guildData(guildId).media.onlyChannels || guildData(guildId).mediaOnlyChannels || [];
    if (channels.length === 0) {
      return msg.reply({ embeds: [createInfoEmbed("No Media Channels", "No media-only channels configured!")] });
    }

    const channelList = channels.map(id => {
      const ch = msg.guild.channels.cache.get(id);
      return ch ? `${EMOJIS.success} ${ch}` : `${EMOJIS.error} Unknown (${id})`;
    }).join("\n");

    const embed = createEmbed({
      title: `${EMOJIS.media} ${bold("Media-Only Channels")}`,
      description: channelList,
      footer: `${channels.length} channel(s)`
    });

    return msg.reply({ embeds: [embed] });
  }

}

/* ================= AUTO DELETE COMMANDS ================= */
if (cmd === "autodelete" || cmd === "ad") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need Manage Messages permission!")] });
  }

  const subCmd = args[0]?.toLowerCase();
  if (!subCmd) return;

  if (subCmd === "add" || subCmd === "set") {
    const channel = msg.mentions.channels.first() || msg.channel;
    const duration = args[msg.mentions.channels.first() ? 2 : 1];
    
    if (!duration) {
      return msg.reply({ embeds: [createErrorEmbed("Missing Duration", `Usage: \`${PREFIX}autodelete add [#channel] <duration>\`\nExample: \`${PREFIX}autodelete add 30s\``)] });
    }

    const ms = parseDuration(duration);
    if (!ms) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Duration", "Use format: 10s, 5m, 1h, etc.")] });
    }

    guildData(guildId).autoDeleteTextOnly[channel.id] = ms;
    if (!guildData(guildId).autoDeleteTextOnly) guildData(guildId).autoDeleteTextOnly = {};
    guildData(guildId).autoDeleteTextOnly[channel.id] = ms;
    saveDB();

    return msg.reply({ embeds: [createSuccessEmbed("Auto Delete Set", `Text-only messages in ${channel} will be deleted after ${bold(formatDuration(ms))}!\n\n${EMOJIS.info} Messages with attachments will not be deleted.`)] });
  }

  if (subCmd === "remove") {
    const channel = msg.mentions.channels.first() || msg.channel;
    
    if (!guildData(guildId).autoDeleteTextOnly[channel.id] !== undefined) {
      return msg.reply({ embeds: [createErrorEmbed("Not Set", `${channel} doesn't have auto-delete enabled!`)] });
    }

    delete guildData(guildId).autoDeleteTextOnly[channel.id];
    if (guildData(guildId).autoDeleteTextOnly) delete guildData(guildId).autoDeleteTextOnly[channel.id];
    saveDB();

    return msg.reply({ embeds: [createSuccessEmbed("Auto Delete Removed", `Auto-delete disabled for ${channel}!`)] });
  }

  if (subCmd === "list") {
    if (autoDeleteTextOnly.size === 0) {
      return msg.reply({ embeds: [createInfoEmbed("No Auto-Delete", "No channels have auto-delete enabled!")] });
    }

    const list = Array.from(autoDeleteTextOnly.entries()).map(([id, duration]) => {
      const ch = msg.guild.channels.cache.get(id);
      return ch ? `${EMOJIS.success} ${ch} - ${bold(formatDuration(duration))}` : `${EMOJIS.error} Unknown (${id})`;
    }).join("\n");

    const embed = createEmbed({
      title: `${EMOJIS.purge} ${bold("Auto-Delete Channels")}`,
      description: list,
      footer: `${autoDeleteTextOnly.size} channel(s)`
    });

    return msg.reply({ embeds: [embed] });
  }

  if (false) {
    const embed = createEmbed({
      title: `${EMOJIS.purge} ${bold("Auto-Delete Commands")}`,
      description: 
        `\`${PREFIX}autodelete add [#channel] <duration>\` - Enable auto-delete\n` +
        `\`${PREFIX}autodelete remove [#channel]\` - Disable auto-delete\n` +
        `\`${PREFIX}autodelete list\` - List all channels\n\n` +
        `${bold("Examples:")}\n` +
        `\`${PREFIX}autodelete add 30s\` - Delete after 30 seconds\n` +
        `\`${PREFIX}autodelete add #chat 5m\` - Delete after 5 minutes\n\n` +
        `${EMOJIS.info} ${bold("Note:")} Only text-only messages are deleted. Messages with attachments are kept!`
    });

    return msg.reply({ embeds: [embed] });
  }
}

/* ================= BIRTHDAY COMMANDS ================= */
if (cmd === "birthday" || cmd === "bday") {
  const subCmd = args[0]?.toLowerCase();
  if (!subCmd) return;

  if (subCmd === "enable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    guildData(guildId).birthday.enabled = true;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Birthdays Enabled", "Birthday system is now enabled!")] });
  }

  if (subCmd === "disable" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    guildData(guildId).birthday.enabled = false;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Birthdays Disabled", "Birthday system is now disabled!")] });
  }

  if (subCmd === "setchannel" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}birthday setchannel #channel\``)] });
    }
    guildData(guildId).birthday.channel = channel.id;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channel Set", `Birthday wishes will be sent to ${channel}`)] });
  }

  if (subCmd === "setrole" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);
    if (!role) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Role", `Usage: \`${PREFIX}birthday setrole @role\``)] });
    }
    guildData(guildId).birthday.role = role.id;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Role Set", `${role} will be given on birthdays for 24 hours!`)] });
  }

  if (subCmd === "setmessage" && msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    const message = args.slice(1).join(" ");
    if (!message) {
      return msg.reply({ embeds: [createErrorEmbed("Missing Message", `Usage: \`${PREFIX}birthday setmessage <message>\`\nPlaceholders: {user}, {mention}, {age}, {suffix}`)] });
    }
    guildData(guildId).birthday.message = message;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Message Set", `Birthday message updated!\n\n${bold("Preview:")}\n${message.replace(/{mention}/g, msg.author).replace(/{user}/g, msg.author.username).replace(/{age}/g, "21").replace(/{suffix}/g, "st")}`)] });
  }

  if (subCmd === "set") {
    const date = args[1];
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Date", `Usage: \`${PREFIX}birthday set YYYY-MM-DD\`\nExample: \`${PREFIX}birthday set 2000-01-15\``)] });
    }

    const [year, month, day] = date.split("-").map(Number);
    const birthDate = new Date(year, month - 1, day);
    
    if (isNaN(birthDate.getTime()) || month < 1 || month > 12 || day < 1 || day > 31) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Date", "Please provide a valid date!")] });
    }

    if (!guildData(guildId).birthday.users) guildData(guildId).birthday.users = {};
    if (!guildData(guildId).birthday.users[guildId]) guildData(guildId).birthday.users[guildId] = {};
    
    guildData(guildId).birthday.users[guildId][msg.author.id] = date;
    saveDB();

    return msg.reply({ embeds: [createSuccessEmbed("Birthday Set", `Your birthday has been set to ${bold(date)}! 🎂`)] });
  }

  if (subCmd === "remove") {
    if (!guildData(guildId).birthday.users?.[guildId]?.[msg.author.id]) {
      return msg.reply({ embeds: [createErrorEmbed("Not Set", "You haven't set a birthday yet!")] });
    }

    delete guildData(guildId).birthday.users[guildId][msg.author.id];
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Birthday Removed", "Your birthday has been removed!")] });
  }

  if (subCmd === "list") {
    const birthdays = guildData(guildId).birthday.users?.[guildId] || {};
    if (Object.keys(birthdays).length === 0) {
      return msg.reply({ embeds: [createInfoEmbed("No Birthdays", "No birthdays have been set yet!")] });
    }

    const now = new Date();
    const upcoming = Object.entries(birthdays)
      .map(([userId, date]) => {
        const [year, month, day] = date.split("-").map(Number);
        const nextBirthday = new Date(now.getFullYear(), month - 1, day);
        if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1);
        return { userId, date, nextBirthday };
      })
      .sort((a, b) => a.nextBirthday - b.nextBirthday)
      .slice(0, 10);

    const list = upcoming.map((b, idx) => 
      `${bold(`${idx + 1}.`)} <@${b.userId}> - ${b.date.substring(5)} (<t:${Math.floor(b.nextBirthday.getTime() / 1000)}:R>)`
    ).join("\n");

    const embed = createEmbed({
      title: `${EMOJIS.birthday} ${bold("Upcoming Birthdays")}`,
      description: list,
      footer: `Total: ${Object.keys(birthdays).length} birthday(s) | Showing next 10`
    });

    return msg.reply({ embeds: [embed] });
  }

}

/* ================= DISABLED CHANNELS COMMANDS ================= */
if (cmd === "disablechannel" || cmd === "disablechan") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  const channel = msg.mentions.channels.first() || msg.channel;

  if (disabledChannels.has(channel.id)) {
    (() => { const _dc = guildData(guildId).disabledChannels; const _i = _dc.indexOf(channel.id); if (_i > -1) _dc.splice(_i, 1); })();
    guildData(guildId).disabledChannels = Array.from(disabledChannels);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channel Enabled", `Bot commands are now enabled in ${channel}!`)] });
  } else {
    (() => { const _dc = guildData(guildId).disabledChannels; if (!_dc.includes(channel.id)) _dc.push(channel.id); })();
    guildData(guildId).disabledChannels = Array.from(disabledChannels);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channel Disabled", `Bot commands are now disabled in ${channel}!\n\n${EMOJIS.info} Admins can still use commands.`)] });
  }
}

if (cmd === "disabledchannels") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  if (disabledChannels.size === 0) {
    return msg.reply({ embeds: [createInfoEmbed("No Disabled Channels", "All channels have bot commands enabled!")] });
  }

  const list = Array.from(disabledChannels).map(id => {
    const ch = msg.guild.channels.cache.get(id);
    return ch ? `${EMOJIS.error} ${ch}` : `${EMOJIS.error} Unknown (${id})`;
  }).join("\n");

  const embed = createEmbed({
    title: `${EMOJIS.settings} ${bold("Disabled Channels")}`,
    description: list,
    footer: `${disabledChannels.size} channel(s) | Use ${PREFIX}disablechannel to toggle`
  });

  return msg.reply({ embeds: [embed] });
}

/* ================= BAD WORD IMMUNE COMMANDS ================= */
/* ================= BADWORD MANAGEMENT COMMANDS ================= */
if (cmd === "badword" || cmd === "bw") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  const subCmd = args[0]?.toLowerCase();
  if (!db.customBadWords) db.customBadWords = [];

  // !badword add <word>
  if (subCmd === "add") {
    const word = args[1]?.toLowerCase();
    if (!word) {
      return msg.reply({ embeds: [createErrorEmbed("Usage", `\`${PREFIX}badword add <word>\``)] });
    }
    if (db.customBadWords.includes(word) || badWords.map(w => w.toLowerCase()).includes(word)) {
      return msg.reply({ embeds: [createInfoEmbed("Already Exists", `\`${word}\` is already in the bad word list.`)] });
    }
    db.customBadWords.push(word);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Word Added", `\`${word}\` has been added to the bad word filter.`)] });
  }

  // !badword remove <word>
  if (subCmd === "remove" || subCmd === "delete") {
    const word = args[1]?.toLowerCase();
    if (!word) {
      return msg.reply({ embeds: [createErrorEmbed("Usage", `\`${PREFIX}badword remove <word>\``)] });
    }
    const beforeLen = db.customBadWords.length;
    db.customBadWords = db.customBadWords.filter(w => w !== word);
    if (db.customBadWords.length === beforeLen) {
      return msg.reply({ embeds: [createInfoEmbed("Not Found", `\`${word}\` was not found in the custom bad word list.\n*Note: Words from \`badWords.js\` file cannot be removed here.*`)] });
    }
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Word Removed", `\`${word}\` has been removed from the bad word filter.`)] });
  }

  // !badword list
  if (subCmd === "list") {
    const fileWords = badWords.map(w => w.toLowerCase());
    const customWords = db.customBadWords || [];
    const allWords = [...new Set([...fileWords, ...customWords])].sort();

    const pageSize = 30;
    const page = 1;
    const totalPages = Math.ceil(allWords.length / pageSize) || 1;
    const slice = allWords.slice(0, pageSize);

    const wordList = slice.length > 0
      ? slice.map((w, i) => `\`${i + 1}.\` ${w}`).join("\n")
      : "No words in the list.";

    const embed = createEmbed({
      title: `${EMOJIS.filter} ${bold("Bad Word List")}`,
      description:
        `${bold("Commands:")}\n` +
        `\`${PREFIX}badword add <word>\` — Add a word\n` +
        `\`${PREFIX}badword remove <word>\` — Remove a custom word\n` +
        `\`${PREFIX}badword list\` — View all words\n\n` +
        `${bold(`Words (Page ${page}/${totalPages} • ${allWords.length} total):`)}\n${wordList}`,
      footer: `File: ${fileWords.length} word(s)  |  Custom: ${customWords.length} word(s)  •  Today at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`bwlist_prev_1`)
        .setLabel("◀ Back")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`bwlist_page_1_${totalPages}`)
        .setLabel(`Page 1 / ${totalPages}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`bwlist_next_1_${totalPages}`)
        .setLabel("Next ▶")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(totalPages <= 1)
    );

    return msg.reply({ embeds: [embed], components: [row] });
  }
}

if (cmd === "badwordimmune" || cmd === "bwimmune" || cmd === "filterimmune") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  const subCmd = args[0]?.toLowerCase();
  if (!subCmd) return;

  if (subCmd === "addrole") {
    const role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);
    if (!role) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Role", `Usage: \`${PREFIX}badwordimmune addrole @role\``)] });
    }

    if (!guildData(guildId).badWordImmuneRoles) guildData(guildId).badWordImmuneRoles = [];
    if (guildData(guildId).badWordImmuneRoles.includes(role.id)) {
      return msg.reply({ embeds: [createInfoEmbed("Already Added", `${role} is already immune to bad word filter!`)] });
    }

    guildData(guildId).badWordImmuneRoles.push(role.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Role Added", `${role} is now immune to bad word filter!`)] });
  }

  if (subCmd === "removerole") {
    const role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);
    if (!role) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Role", `Usage: \`${PREFIX}badwordimmune removerole @role\``)] });
    }

    if (!guildData(guildId).badWordImmuneRoles) guildData(guildId).badWordImmuneRoles = [];
    guildData(guildId).badWordImmuneRoles = guildData(guildId).badWordImmuneRoles.filter(id => id !== role.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Role Removed", `${role} is no longer immune to bad word filter!`)] });
  }

  if (subCmd === "addchannel") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}badwordimmune addchannel #channel\``)] });
    }

    if (!guildData(guildId).badWordImmuneChannels) guildData(guildId).badWordImmuneChannels = [];
    if (guildData(guildId).badWordImmuneChannels.includes(channel.id)) {
      return msg.reply({ embeds: [createInfoEmbed("Already Added", `${channel} is already immune to bad word filter!`)] });
    }

    guildData(guildId).badWordImmuneChannels.push(channel.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channel Added", `${channel} is now immune to bad word filter!`)] });
  }

  if (subCmd === "removechannel") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}badwordimmune removechannel #channel\``)] });
    }

    if (!guildData(guildId).badWordImmuneChannels) guildData(guildId).badWordImmuneChannels = [];
    guildData(guildId).badWordImmuneChannels = guildData(guildId).badWordImmuneChannels.filter(id => id !== channel.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channel Removed", `${channel} is no longer immune to bad word filter!`)] });
  }

  if (subCmd === "clearroles") {
    guildData(guildId).badWordImmuneRoles = [];
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Roles Cleared", "All immune roles have been removed!")] });
  }

  if (subCmd === "clearchannels") {
    guildData(guildId).badWordImmuneChannels = [];
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channels Cleared", "All immune channels have been removed!")] });
  }

  if (subCmd === "list") {
    const roles = guildData(guildId).badWordImmuneRoles || [];
    const channels = guildData(guildId).badWordImmuneChannels || [];

    const roleList = roles.length > 0 
      ? roles.map(id => {
          const role = msg.guild.roles.cache.get(id);
          return role ? `${EMOJIS.success} ${role}` : `${EMOJIS.error} Unknown (${id})`;
        }).join("\n")
      : "None";

    const channelList = channels.length > 0
      ? channels.map(id => {
          const ch = msg.guild.channels.cache.get(id);
          return ch ? `${EMOJIS.success} ${ch}` : `${EMOJIS.error} Unknown (${id})`;
        }).join("\n")
      : "None";

    const embed = createEmbed({
      title: `${EMOJIS.immune} ${bold("Bad Word Filter Immunity")}`,
      fields: [
        { name: `${EMOJIS.customroles} ${bold("Immune Roles")}`, value: roleList.slice(0, 1024), inline: false },
        { name: `${EMOJIS.messages} ${bold("Immune Channels")}`, value: channelList.slice(0, 1024), inline: false }
      ],
      description: 
        `\n${bold("Commands:")}\n` +
        `\`${PREFIX}badwordimmune addrole @role\`\n` +
        `\`${PREFIX}badwordimmune removerole @role\`\n` +
        `\`${PREFIX}badwordimmune addchannel #channel\`\n` +
        `\`${PREFIX}badwordimmune removechannel #channel\`\n` +
        `\`${PREFIX}badwordimmune clearroles\`\n` +
        `\`${PREFIX}badwordimmune clearchannels\`\n` +
        `\`${PREFIX}badwordimmune list\` - View all\n\n` +
        `${EMOJIS.info} Users with immune roles or in immune channels bypass the bad word filter.`,
      footer: `${roles.length} role(s) • ${channels.length} channel(s)`
    });

    return msg.reply({ embeds: [embed] });
  }
}

/* ================= NSFW WORD MANAGEMENT COMMANDS ================= */
if (cmd === "nsfwword" || cmd === "nsfwwords") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  const subCmd = args[0]?.toLowerCase();
  if (!db.customNsfwWords) db.customNsfwWords = [];

  // !nsfwword add <word>
  if (subCmd === "add") {
    const word = args[1]?.toLowerCase();
    if (!word) {
      return msg.reply({ embeds: [createErrorEmbed("Usage", `\`${PREFIX}nsfwword add <word>\``)] });
    }
    const existingNsfw = Array.isArray(nsfwWords) ? nsfwWords.map(w => w.toLowerCase()) : [];
    if (db.customNsfwWords.includes(word) || existingNsfw.includes(word)) {
      return msg.reply({ embeds: [createInfoEmbed("Already Exists", `\`${word}\` is already in the NSFW word list.`)] });
    }
    db.customNsfwWords.push(word);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Word Added", `\`${word}\` has been added to the NSFW filter.`)] });
  }

  // !nsfwword remove <word>
  if (subCmd === "remove" || subCmd === "delete") {
    const word = args[1]?.toLowerCase();
    if (!word) {
      return msg.reply({ embeds: [createErrorEmbed("Usage", `\`${PREFIX}nsfwword remove <word>\``)] });
    }
    const beforeLen = db.customNsfwWords.length;
    db.customNsfwWords = db.customNsfwWords.filter(w => w !== word);
    if (db.customNsfwWords.length === beforeLen) {
      return msg.reply({ embeds: [createInfoEmbed("Not Found", `\`${word}\` was not found in the custom NSFW word list.\n*Note: Words from \`nsfwWords.js\` file cannot be removed here.*`)] });
    }
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Word Removed", `\`${word}\` has been removed from the NSFW filter.`)] });
  }

  // !nsfwword list [page]
  if (subCmd === "list") {
    const fileWords = Array.isArray(nsfwWords) ? nsfwWords.map(w => w.toLowerCase()) : [];
    const customWords = db.customNsfwWords || [];
    const allWords = [...new Set([...fileWords, ...customWords])].sort();

    const pageSize = 30;
    const page = 1;
    const totalPages = Math.ceil(allWords.length / pageSize) || 1;
    const slice = allWords.slice(0, pageSize);

    const wordList = slice.length > 0
      ? slice.map((w, i) => `\`${i + 1}.\` ${w}`).join("\n")
      : "No words in the list.";

    const embed = createEmbed({
      title: `${EMOJIS.filter} ${bold("NSFW Word List")}`,
      description:
        `${bold("Commands:")}\n` +
        `\`${PREFIX}nsfwword add <word>\` — Add a word\n` +
        `\`${PREFIX}nsfwword remove <word>\` — Remove a custom word\n` +
        `\`${PREFIX}nsfwword list\` — View all words\n\n` +
        `${EMOJIS.warning} Detection triggers a **7-day mute**.\n\n` +
        `${bold(`Words (Page ${page}/${totalPages} • ${allWords.length} total):`)}\n${wordList}`,
      footer: `File: ${fileWords.length} word(s)  |  Custom: ${customWords.length} word(s)  •  Today at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`nsfwlist_prev_1`)
        .setLabel("◀ Back")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`nsfwlist_page_1_${totalPages}`)
        .setLabel(`Page 1 / ${totalPages}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`nsfwlist_next_1_${totalPages}`)
        .setLabel("Next ▶")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(totalPages <= 1)
    );

    return msg.reply({ embeds: [embed], components: [row] });
  }
}

/* ================= NSFW IMMUNE COMMANDS ================= */
if (cmd === "nsfwimmune" || cmd === "nsfwfilter") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  const subCmd = args[0]?.toLowerCase();
  if (!subCmd) return;

  if (subCmd === "enable") {
    guildData(guildId).nsfwProtection = true;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("NSFW Filter Enabled", "NSFW content will now be detected and removed!")] });
  }

  if (subCmd === "disable") {
    guildData(guildId).nsfwProtection = false;
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("NSFW Filter Disabled", "NSFW filter has been disabled!")] });
  }

  if (subCmd === "addrole") {
    const role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);
    if (!role) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Role", `Usage: \`${PREFIX}nsfwimmune addrole @role\``)] });
    }

    if (!guildData(guildId).nsfwImmuneRoles) guildData(guildId).nsfwImmuneRoles = [];
    if (guildData(guildId).nsfwImmuneRoles.includes(role.id)) {
      return msg.reply({ embeds: [createInfoEmbed("Already Added", `${role} is already immune to NSFW filter!`)] });
    }

    guildData(guildId).nsfwImmuneRoles.push(role.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Role Added", `${role} is now immune to NSFW filter!`)] });
  }

  if (subCmd === "removerole") {
    const role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);
    if (!role) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Role", `Usage: \`${PREFIX}nsfwimmune removerole @role\``)] });
    }

    if (!guildData(guildId).nsfwImmuneRoles) guildData(guildId).nsfwImmuneRoles = [];
    guildData(guildId).nsfwImmuneRoles = guildData(guildId).nsfwImmuneRoles.filter(id => id !== role.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Role Removed", `${role} is no longer immune to NSFW filter!`)] });
  }

  if (subCmd === "addchannel") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}nsfwimmune addchannel #channel\``)] });
    }

    if (!guildData(guildId).nsfwImmuneChannels) guildData(guildId).nsfwImmuneChannels = [];
    if (guildData(guildId).nsfwImmuneChannels.includes(channel.id)) {
      return msg.reply({ embeds: [createInfoEmbed("Already Added", `${channel} is already immune to NSFW filter!`)] });
    }

    guildData(guildId).nsfwImmuneChannels.push(channel.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channel Added", `${channel} is now immune to NSFW filter!`)] });
  }

  if (subCmd === "removechannel") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}nsfwimmune removechannel #channel\``)] });
    }

    if (!guildData(guildId).nsfwImmuneChannels) guildData(guildId).nsfwImmuneChannels = [];
    guildData(guildId).nsfwImmuneChannels = guildData(guildId).nsfwImmuneChannels.filter(id => id !== channel.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channel Removed", `${channel} is no longer immune to NSFW filter!`)] });
  }

  if (subCmd === "clearroles") {
    guildData(guildId).nsfwImmuneRoles = [];
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Roles Cleared", "All immune roles have been removed!")] });
  }

  if (subCmd === "clearchannels") {
    guildData(guildId).nsfwImmuneChannels = [];
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channels Cleared", "All immune channels have been removed!")] });
  }

  if (subCmd === "list") {
    const roles = guildData(guildId).nsfwImmuneRoles || [];
    const channels = guildData(guildId).nsfwImmuneChannels || [];

    const roleList = roles.length > 0 
      ? roles.map(id => {
          const role = msg.guild.roles.cache.get(id);
          return role ? `${EMOJIS.success} ${role}` : `${EMOJIS.error} Unknown (${id})`;
        }).join("\n")
      : "None";

    const channelList = channels.length > 0
      ? channels.map(id => {
          const ch = msg.guild.channels.cache.get(id);
          return ch ? `${EMOJIS.success} ${ch}` : `${EMOJIS.error} Unknown (${id})`;
        }).join("\n")
      : "None";

    const embed = createEmbed({
      title: `${EMOJIS.immune} ${bold("NSFW Filter Settings")}`,
      fields: [
        { name: `${EMOJIS.chart} ${bold("Status")}`, value: guildData(guildId).nsfwProtection !== false ? `${EMOJI_ENABLE} Enabled` : `${EMOJI_DISABLE} Disabled`, inline: true },
        { name: `${EMOJIS.customroles} ${bold("Immune Roles")}`, value: roleList.slice(0, 1024), inline: false },
        { name: `${EMOJIS.messages} ${bold("Immune Channels")}`, value: channelList.slice(0, 1024), inline: false }
      ],
      description: 
        `\n${bold("Commands:")}\n` +
        `\`${PREFIX}nsfwimmune enable\` - Enable filter\n` +
        `\`${PREFIX}nsfwimmune disable\` - Disable filter\n` +
        `\`${PREFIX}nsfwimmune addrole @role\`\n` +
        `\`${PREFIX}nsfwimmune removerole @role\`\n` +
        `\`${PREFIX}nsfwimmune addchannel #channel\`\n` +
        `\`${PREFIX}nsfwimmune removechannel #channel\`\n` +
        `\`${PREFIX}nsfwimmune clearroles\`\n` +
        `\`${PREFIX}nsfwimmune clearchannels\`\n\n` +
        `${EMOJIS.warning} NSFW filter bans users who post NSFW content.`,
      footer: `${roles.length} role(s) • ${channels.length} channel(s)`
    });

    return msg.reply({ embeds: [embed] });
  }
}

/* ================= ANTI-LINK IMMUNE COMMANDS (Additional) ================= */
if (cmd === "antilinkimmune" || cmd === "alimmune") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  const subCmd = args[0]?.toLowerCase();
  if (!subCmd) return;

  if (subCmd === "addrole") {
    const role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);
    if (!role) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Role", `Usage: \`${PREFIX}antilinkimmune addrole @role\``)] });
    }

    if (!guildData(guildId).antilink.immuneRoles) guildData(guildId).antilink.immuneRoles = [];
    if (guildData(guildId).antilink.immuneRoles.includes(role.id)) {
      return msg.reply({ embeds: [createInfoEmbed("Already Added", `${role} is already immune to anti-link!`)] });
    }

    guildData(guildId).antilink.immuneRoles.push(role.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Role Added", `${role} is now immune to anti-link!`)] });
  }

  if (subCmd === "removerole") {
    const role = msg.mentions.roles.first() || msg.guild.roles.cache.get(args[1]);
    if (!role) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Role", `Usage: \`${PREFIX}antilinkimmune removerole @role\``)] });
    }

    if (!guildData(guildId).antilink.immuneRoles) guildData(guildId).antilink.immuneRoles = [];
    guildData(guildId).antilink.immuneRoles = guildData(guildId).antilink.immuneRoles.filter(id => id !== role.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Role Removed", `${role} is no longer immune to anti-link!`)] });
  }

  if (subCmd === "addchannel") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}antilinkimmune addchannel #channel\``)] });
    }

    if (!guildData(guildId).antilink.immuneChannels) guildData(guildId).antilink.immuneChannels = [];
    if (guildData(guildId).antilink.immuneChannels.includes(channel.id)) {
      return msg.reply({ embeds: [createInfoEmbed("Already Added", `${channel} is already immune to anti-link!`)] });
    }

    guildData(guildId).antilink.immuneChannels.push(channel.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channel Added", `${channel} is now immune to anti-link!`)] });
  }

  if (subCmd === "removechannel") {
    const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[1]);
    if (!channel) {
      return msg.reply({ embeds: [createErrorEmbed("Invalid Channel", `Usage: \`${PREFIX}antilinkimmune removechannel #channel\``)] });
    }

    if (!guildData(guildId).antilink.immuneChannels) guildData(guildId).antilink.immuneChannels = [];
    guildData(guildId).antilink.immuneChannels = guildData(guildId).antilink.immuneChannels.filter(id => id !== channel.id);
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channel Removed", `${channel} is no longer immune to anti-link!`)] });
  }

  if (subCmd === "clearroles") {
    guildData(guildId).antilink.immuneRoles = [];
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Roles Cleared", "All immune roles have been removed!")] });
  }

  if (subCmd === "clearchannels") {
    guildData(guildId).antilink.immuneChannels = [];
    saveDB();
    return msg.reply({ embeds: [createSuccessEmbed("Channels Cleared", "All immune channels have been removed!")] });
  }

  if (subCmd === "list") {
    const roles = guildData(guildId).antilink.immuneRoles || [];
    const channels = guildData(guildId).antilink.immuneChannels || [];

    const roleList = roles.length > 0 
      ? roles.map(id => {
          const role = msg.guild.roles.cache.get(id);
          return role ? `${EMOJIS.success} ${role}` : `${EMOJIS.error} Unknown (${id})`;
        }).join("\n")
      : "None";

    const channelList = channels.length > 0
      ? channels.map(id => {
          const ch = msg.guild.channels.cache.get(id);
          return ch ? `${EMOJIS.success} ${ch}` : `${EMOJIS.error} Unknown (${id})`;
        }).join("\n")
      : "None";

    const embed = createEmbed({
      title: `${EMOJIS.immune} ${bold("Anti-Link Immunity")}`,
      fields: [
        { name: `${EMOJIS.customroles} ${bold("Immune Roles")}`, value: roleList.slice(0, 1024), inline: false },
        { name: `${EMOJIS.messages} ${bold("Immune Channels")}`, value: channelList.slice(0, 1024), inline: false }
      ],
      description: 
        `\n${bold("Commands:")}\n` +
        `\`${PREFIX}antilinkimmune addrole @role\`\n` +
        `\`${PREFIX}antilinkimmune removerole @role\`\n` +
        `\`${PREFIX}antilinkimmune addchannel #channel\`\n` +
        `\`${PREFIX}antilinkimmune removechannel #channel\`\n` +
        `\`${PREFIX}antilinkimmune clearroles\`\n` +
        `\`${PREFIX}antilinkimmune clearchannels\`\n` +
        `\`${PREFIX}antilinkimmune list\` - View all\n\n` +
        `${EMOJIS.info} Users with immune roles or in immune channels can post links.`,
      footer: `${roles.length} role(s) • ${channels.length} channel(s)`
    });

    return msg.reply({ embeds: [embed] });
  }
}

/* ================= FILTER IMMUNITY SHORTCUT ================= */
if (cmd === "filterimmune" || cmd === "immune") {
  if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
  }

  const embed = createEmbed({
    title: `${EMOJIS.immune} ${bold("Filter Immunity Commands")}`,
    description: 
      `${bold("Bad Word Filter:")}\n` +
      `\`${PREFIX}badwordimmune\` - Manage bad word immunity\n\n` +
      `${bold("NSFW Filter:")}\n` +
      `\`${PREFIX}nsfwimmune\` - Manage NSFW immunity\n\n` +
      `${bold("Anti-Link:")}\n` +
      `\`${PREFIX}antilinkimmune\` - Manage anti-link immunity\n` +
      `\`${PREFIX}antilink immunerole @role\` - Quick add role\n` +
      `\`${PREFIX}antilink immunechannel #channel\` - Quick add channel\n\n` +
      `${EMOJIS.info} Use each command to see detailed options for managing roles and channels.`,
    fields: [
      { 
        name: `${EMOJIS.shield} ${bold("Available Commands")}`, 
        value: 
          `• \`addrole @role\` - Add immune role\n` +
          `• \`removerole @role\` - Remove role\n` +
          `• \`addchannel #channel\` - Add immune channel\n` +
          `• \`removechannel #channel\` - Remove channel\n` +
          `• \`clearroles\` - Clear all roles\n` +
          `• \`clearchannels\` - Clear all channels\n` +
          `• \`list\` - View all immunities`
      }
    ]
  });

  return msg.reply({ embeds: [embed] });
}

  /* ================= NO PREFIX MANAGEMENT ================= */
  if (cmd === "noprefix"|| cmd === "npx") {
    // Allowed: bot owner, premium user, or guild owner
    const isNpxOwner = config.ownerIds?.includes(msg.author.id) || msg.author.id === "1043013895574536282";
    const isNpxPremium = isPremiumUser(msg.author.id) || isPremiumGuild(guildId);
    const isNpxGuildOwner = msg.guild.ownerId === msg.author.id;
    if (!isNpxOwner && !isNpxPremium && !isNpxGuildOwner) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Only the bot owner, premium users, or the server owner can manage no-prefix users!")] });
    }

    if (!guildData(guildId).noPrefixUsers) guildData(guildId).noPrefixUsers = [];

    const subCmd = args[0]?.toLowerCase();
    const target = msg.mentions.users.first() || (args[1] ? await client.users.fetch(args[1]).catch(() => null) : null);

    if (subCmd === "add") {
      if (!target) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}noprefix add @user\``)] });
      if (guildData(guildId).noPrefixUsers.includes(target.id)) {
        return msg.reply({ embeds: [createWarningEmbed("Already Added", `${bold(target.tag)} already has no-prefix access!`)] });
      }
      guildData(guildId).noPrefixUsers.push(target.id);
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("No-Prefix Added", `${EMOJIS.success} ${bold(target.tag)} can now use commands without a prefix!`)] });
    }

    if (subCmd === "remove") {
      if (!target) return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}noprefix remove @user\``)] });
      const idx = guildData(guildId).noPrefixUsers.indexOf(target.id);
      if (idx === -1) {
        return msg.reply({ embeds: [createWarningEmbed("Not Found", `${bold(target.tag)} does not have no-prefix access!`)] });
      }
      guildData(guildId).noPrefixUsers.splice(idx, 1);
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("No-Prefix Removed", `${EMOJIS.success} ${bold(target.tag)}'s no-prefix access has been removed!`)] });
    }

    if (subCmd === "list") {
      const list = guildData(guildId).noPrefixUsers.length > 0
        ? guildData(guildId).noPrefixUsers.map(id => `${EMOJIS.success} <@${id}> (\`${id}\`)`).join("\n")
        : `${EMOJIS.error} No users have no-prefix access.`;

      const embed = createEmbed({
        title: `${EMOJIS.settings} ${bold("No-Prefix Users")}`,
        description: list + `\n\n${bold("Commands:")}\n` +
          `\`${PREFIX}noprefix add @user\` - Grant no-prefix access\n` +
          `\`${PREFIX}noprefix remove @user\` - Remove no-prefix access\n` +
          `\`${PREFIX}noprefix list\` - View all users`,
        footer: `${guildData(guildId).noPrefixUsers.length} user(s) with no-prefix access`
      });
      return msg.reply({ embeds: [embed] });
    }

    return msg.reply({ embeds: [createInfoEmbed("No-Prefix Help",
      `\`${PREFIX}noprefix add @user\` - Grant no-prefix access\n` +
      `\`${PREFIX}noprefix remove @user\` - Revoke no-prefix access\n` +
      `\`${PREFIX}noprefix list\` - View all no-prefix users`
    )] });
  }

  /* ================= BOT IDENTITY COMMANDS ================= */
  // !botset name <new name>  — set bot username
  // !botset avatar <url | attachment>  — set bot profile picture
  // !botset banner <url | attachment>  — set bot banner
  // Access: premium user, premium guild, guild owner, or bot owner
  if (cmd === "botset" || cmd === "setname" || cmd === "setavatar" || cmd === "setbanner") {
    const isPremOrOwner =
      config.ownerIds?.includes(msg.author.id) ||
      msg.author.id === "1043013895574536282" ||
      isPremiumUser(msg.author.id) ||
      isPremiumGuild(guildId) ||
      msg.guild.ownerId === msg.author.id;

    if (!isPremOrOwner) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Only premium users, the server owner, or the bot owner can use this command!")] });
    }

    // Resolve sub-command
    let bsSub = null;
    let bsArgs = [...args];
    if (cmd === "botset")        { bsSub = bsArgs.shift()?.toLowerCase(); }
    else if (cmd === "setname")  { bsSub = "name"; }
    else if (cmd === "setavatar"){ bsSub = "avatar"; }
    else if (cmd === "setbanner"){ bsSub = "banner"; }

    // name — changes bot NICKNAME in this server only (not global username)
    if (bsSub === "name") {
      const newName = bsArgs.join(" ").trim();
      if (!newName) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Name", `Usage: \`${PREFIX}botset name <new name>\``)] });
      }
      try {
        const botMember = msg.guild.members.me;
        await botMember.setNickname(newName, `Bot nickname changed by ${msg.author.tag}`);
        if (!guildData(guildId).guildBotIdentity) guildData(guildId).guildBotIdentity = {};
        if (!guildData(guildId).guildBotIdentity[guildId]) guildData(guildId).guildBotIdentity[guildId] = {};
        guildData(guildId).guildBotIdentity[guildId].nickname = newName;
        saveDB();
        return msg.reply({ embeds: [createSuccessEmbed("Bot Nickname Updated", `${EMOJIS.success} Bot nickname in this server changed to **${newName}**!\n\n> ℹ️ This only affects the bot's display name in this server, not globally.`)] });
      } catch (err) {
        return msg.reply({ embeds: [createErrorEmbed("Failed", `Could not change bot nickname: ${err.message}`)] });
      }
    }

    // avatar / pfp — stores a per-guild avatar URL (used in embeds for this server)
    if (bsSub === "avatar" || bsSub === "pfp") {
      const avatarUrl = bsArgs[0] || msg.attachments.first()?.url;
      if (!avatarUrl) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Image", `Usage: \`${PREFIX}botset avatar <url>\` or attach an image`)] });
      }
      if (!guildData(guildId).guildBotIdentity) guildData(guildId).guildBotIdentity = {};
      if (!guildData(guildId).guildBotIdentity[guildId]) guildData(guildId).guildBotIdentity[guildId] = {};
      guildData(guildId).guildBotIdentity[guildId].avatar = avatarUrl;
      saveDB();
      const embed = createSuccessEmbed("Bot Avatar Updated (Server Only)", `${EMOJIS.success} Bot avatar has been set for **this server**!\n\n> ℹ️ This avatar will appear in bot embeds within this server. The bot's actual global avatar is unchanged.`);
      embed.setThumbnail(avatarUrl);
      return msg.reply({ embeds: [embed] });
    }

    // banner — stores a per-guild banner URL (used in embeds for this server)
    if (bsSub === "banner") {
      const bannerUrl = bsArgs[0] || msg.attachments.first()?.url;
      if (!bannerUrl) {
        return msg.reply({ embeds: [createErrorEmbed("Missing Image", `Usage: \`${PREFIX}botset banner <url>\` or attach an image`)] });
      }
      if (!guildData(guildId).guildBotIdentity) guildData(guildId).guildBotIdentity = {};
      if (!guildData(guildId).guildBotIdentity[guildId]) guildData(guildId).guildBotIdentity[guildId] = {};
      guildData(guildId).guildBotIdentity[guildId].banner = bannerUrl;
      saveDB();
      const embed = createSuccessEmbed("Bot Banner Updated (Server Only)", `${EMOJIS.success} Bot banner has been set for **this server**!\n\n> ℹ️ This banner will appear in bot embeds within this server. The bot's actual global banner is unchanged.`);
      embed.setImage(bannerUrl);
      return msg.reply({ embeds: [embed] });
    }

    // reset — clear all per-guild bot identity settings
    if (bsSub === "reset") {
      if (guildData(guildId).guildBotIdentity?.[guildId]) {
        const botMember = msg.guild.members.me;
        await botMember.setNickname(null, `Bot identity reset by ${msg.author.tag}`).catch(() => {});
        delete guildData(guildId).guildBotIdentity[guildId];
        saveDB();
      }
      return msg.reply({ embeds: [createSuccessEmbed("Bot Identity Reset", `${EMOJIS.success} Bot identity settings for this server have been reset to defaults!`)] });
    }

    // help
    return msg.reply({ embeds: [createEmbed({
      title: `${EMOJIS.settings} Bot Identity Settings`,
      description:
        `<a:zzz_arrow_hash:1485872093437497434> \`${PREFIX}botset name <new name>\` — Change bot nickname in this server <a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:arrow_arrow:1485908026006442015>  Nickname only — does **not** change the bot's global name\n\n` +
        `<a:zzz_arrow_hash:1485872093437497434> \`${PREFIX}botset avatar <url>\` — Set a server-specific bot avatar <a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:arrow_arrow:1485908026006442015>  Shown in embeds for this server only\n\n` +
        `<a:zzz_arrow_hash:1485872093437497434> \`${PREFIX}botset banner <url>\` — Set a server-specific bot banner <a:zzz_Exclamation:1485872115662983288>\n` +
        `<a:arrow_arrow:1485908026006442015>  Shown in embeds for this server only\n\n` +
        `<a:zzz_arrow_hash:1485872093437497434> \`${PREFIX}botset reset\` — Reset all identity settings for this server <a:zzz_Exclamation:1485872115662983288>\n\n` +
        `You can attach an image instead of a URL for avatar/banner.\n\n` +
        `**Shortcuts:** \`${PREFIX}setname\` · \`${PREFIX}setavatar\` · \`${PREFIX}setbanner\``,
      footer: "Premium users, server owners, and bot owner only • Does NOT change global bot identity"
    })] });
  }

    /* ================= FAKE BAN COMMAND ================= */
  if (cmd === "fakeban"|| cmd === "fban") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need **Ban Members** permission to use this!")] });
    }

    const target = msg.mentions.members.first();
    if (!target) {
      return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}fakeban @user [reason]\``)] });
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle(`${EMOJIS.ban} User Banned`)
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setDescription(
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("User")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${target.user.tag}\n` +
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("Moderator")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${msg.author.tag}\n` +
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("Reason")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${reason}`
      )
      .setFooter({ text: `Case #${Math.floor(Math.random() * 9000) + 1000} • ${msg.guild.name}` })
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }

  /* ================= FAKE KICK COMMAND ================= */
  if (cmd === "fakekick"|| cmd === "fkick") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need **Kick Members** permission to use this!")] });
    }

    const target = msg.mentions.members.first();
    if (!target) {
      return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}fakekick @user [reason]\``)] });
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    const embed = new EmbedBuilder()
      .setColor(0xFF6B6B)
      .setTitle(`${EMOJIS.kick} User Kicked`)
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setDescription(
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("User")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${target.user.tag}\n` +
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("Moderator")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${msg.author.tag}\n` +
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("Reason")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${reason}`
      )
      .setFooter({ text: `Case #${Math.floor(Math.random() * 9000) + 1000} • ${msg.guild.name}` })
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }

  /* ================= FAKE MUTE COMMAND ================= */
  if (cmd === "fakemute"|| cmd === "fmute") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need **Timeout Members** permission to use this!")] });
    }

    const target = msg.mentions.members.first();
    if (!target) {
      return msg.reply({ embeds: [createErrorEmbed("Missing User", `Usage: \`${PREFIX}fakemute @user [duration] [reason]\``)] });
    }

    const durationStr = args[1] || "10m";
    const reason = args.slice(2).join(" ") || "No reason provided";
    const duration = parseDuration(durationStr) || 600000;

    const embed = new EmbedBuilder()
      .setColor(0xFFAA00)
      .setTitle(`${EMOJIS.mute} User Muted`)
      .setThumbnail(target.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setDescription(
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("User")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${target.user.tag}\n` +
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("Duration")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${formatDuration(duration)}\n` +
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("Moderator")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${msg.author.tag}\n` +
        `<a:zzz_arrow_hash:1485872093437497434> ${bold("Reason")} <a:zzz_Exclamation:1485872115662983288>\n<a:arrow_arrow:1485908026006442015>  ${reason}`
      )
      .setFooter({ text: `Case #${Math.floor(Math.random() * 9000) + 1000} • ${msg.guild.name}` })
      .setTimestamp();

    return msg.reply({ embeds: [embed] });
  }

  /* ================= EMBED EDITOR COMMAND ================= */
  if (cmd === "embed" && args[0]?.toLowerCase() === "config") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need **Manage Messages** permission to use this!")] });
    }

    const embedData = {
      title: null,
      description: "✨ Your embed description here...",
      color: BOT_COLOR,
      author: null,
      footer: { text: "Soul's Realm" },
      thumbnail: null,
      image: null,
      timestamp: false
    };

    const sessionId = `${msg.author.id}_${Date.now()}`;
    embedEditorData.set(sessionId, embedData);

    const maxF = getMaxEmbedFields(msg.author.id, msg.guildId);
    const curF = embedData.fields?.length || 0;
    const ARROW = "<a:zzz_arrow_hash:1485872093437497434>";
    const EXCL  = "<a:zzz_Exclamation:1485872115662983288>";

    const embedDropdown = new StringSelectMenuBuilder()
      .setCustomId(`embcfg_select_${sessionId}`)
      .setPlaceholder("<:ssetting:1486660331207004220> Select a section to edit...")
      .addOptions([
        { label: "Title / Description / Color", description: "Set the main content of the embed",    value: `embedbtn_basic_${sessionId}`,        },
        { label: "Author",                      description: "Set author name, icon and URL",        value: `embedbtn_author_${sessionId}`,       },
        { label: "Footer & Timestamp",          description: "Set footer text, icon and timestamp",  value: `embedbtn_footer_${sessionId}`,       },
        { label: "Images",                      description: "Set thumbnail and image URLs",         value: `embedbtn_images_${sessionId}`,       },
        { label: `Add Field (${curF}/${maxF})`, description: "Add a new inline or block field",      value: `embedbtn_addfield_${sessionId}`,    },
        { label: "Remove Last Field",           description: "Remove the most recently added field", value: `embedbtn_removefield_${sessionId}`,  },
        { label: "Send to Channel",             description: "Post this embed to a channel",         value: `embedbtn_send_${sessionId}`,        },
      ]);

    const embedDropdownRow = new ActionRowBuilder().addComponents(embedDropdown);

    const embedContainer = new ContainerBuilder()
      .addSectionComponents(section =>
        section
          .addTextDisplayComponents(text =>
            text.setContent(`## 📝 Embed Builder`)
          )
          .setThumbnailAccessory(thumb =>
            thumb.setURL(msg.guild.iconURL({ dynamic: true }) || "https://cdn.discordapp.com/embed/avatars/0.png")
          )
      )
      .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(text =>
        text.setContent(
          `${ARROW} **Title:** ${embedData.title ? `\`${embedData.title}\`` : "`Not set`"}${EXCL}
` +
          `${ARROW} **Description:** \`${(embedData.description || "").slice(0, 40)}...\`${EXCL}
` +
          `${ARROW} **Author:** ${embedData.author?.name ? `\`${embedData.author.name}\`` : "`Not set`"}${EXCL}
` +
          `${ARROW} **Footer:** ${embedData.footer?.text ? `\`${embedData.footer.text}\`` : "`Not set`"}${EXCL}
` +
          `${ARROW} **Fields:** \`${curF}/${maxF}\`${EXCL}
` +
          `${ARROW} **Thumbnail:** ${embedData.thumbnail ? "✅ Set" : "❌ Not set"}${EXCL}
` +
          `${ARROW} **Image:** ${embedData.image ? "✅ Set" : "❌ Not set"}${EXCL}`
        )
      )
      .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
      .addActionRowComponents(embedDropdownRow)
      .addSeparatorComponents(sep => sep.setSpacing(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(text =>
        text.setContent(`-# Session: emb_${sessionId}`)
      );

    return msg.reply({ components: [embedContainer], flags: MessageFlags.IsComponentsV2 });
  }

  /* ================= REACTION ROLE COMMAND ================= */
  if (cmd === "rr" || cmd === "reactionrole") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "You need **Manage Roles** permission!")] });
    }

    const subCmd = args[0]?.toLowerCase();
    if (!subCmd) return;

    // !rr create — start a new reaction role panel
    if (subCmd === "create") {
      const sessionId = `${msg.author.id}_${Date.now()}`;
      rrSessions.set(sessionId, {
        title: "🎭 Role Selection",
        description: "Click a button below to get or remove a role!",
        channel: msg.channel.id,
        roles: []
      });

      const previewEmbed = createEmbed({
        title: "🎭 Role Selection",
        description: "Click a button below to get or remove a role!\n\n*No roles added yet — use **Add Role** to begin.*",
        footer: "Reaction Role Builder"
      });

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`rr_settitle_${sessionId}`)
          .setLabel("✏️ Set Title / Description")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`rr_addrole_${sessionId}`)
          .setLabel("➕ Add Role")
          .setStyle(ButtonStyle.Primary)
      );
      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`rr_removerole_${sessionId}`)
          .setLabel("➖ Remove Role")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId(`rr_post_${sessionId}`)
          .setLabel("✅ Post Panel")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`rr_cancel_${sessionId}`)
          .setLabel("🗑️ Cancel")
          .setStyle(ButtonStyle.Danger)
      );

      return msg.reply({ embeds: [previewEmbed], components: [row1, row2] });
    }

    // !rr list — list all reaction role panels
    if (subCmd === "list") {
      const panels = Object.entries(guildData(guildId).reactionRoles || {});
      if (panels.length === 0) {
        return msg.reply({ embeds: [createInfoEmbed("No Panels", "No reaction role panels exist yet!\nUse `!rr create` to make one.")] });
      }
      const lines = panels.map(([msgId, data]) => {
        const ch = msg.guild.channels.cache.get(data.channelId);
        return `• **${data.title}** — ${ch ? `<#${data.channelId}>` : "unknown channel"} (${data.roles?.length || 0} roles) | ID: \`${msgId}\``;
      }).join("\n");
      return msg.reply({ embeds: [createEmbed({ title: `${EMOJIS.buttonroles} Reaction Role Panels`, description: lines })] });
    }

    // !rr delete <messageId>
    if (subCmd === "delete") {
      const msgId = args[1];
      if (!msgId || !guildData(guildId).reactionRoles?.[msgId]) {
        return msg.reply({ embeds: [createErrorEmbed("Not Found", "No reaction role panel found with that message ID!")] });
      }
      const data = guildData(guildId).reactionRoles[msgId];
      try {
        const ch = msg.guild.channels.cache.get(data.channelId);
        if (ch) {
          const panelMsg = await ch.messages.fetch(msgId).catch(() => null);
          if (panelMsg) await panelMsg.delete().catch(() => {});
        }
      } catch {}
      delete guildData(guildId).reactionRoles[msgId];
      saveDB();
      return msg.reply({ embeds: [createSuccessEmbed("Deleted", "Reaction role panel deleted!")] });
    }

    // Help
    return msg.reply({ embeds: [createEmbed({
      title: `${EMOJIS.buttonroles} Reaction Role Commands`,
      description:
        `\`!rr create\` — Create a new reaction role panel\n` +
        `\`!rr list\` — List all panels\n` +
        `\`!rr delete <msgId>\` — Delete a panel`
    })] });
  }

  /* ================= END OF COMMAND HANDLERS ================= */

  /* ================= ENABLE / DISABLE PANEL ================= */
  if (cmd === "enable" || cmd === "disable") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }
    const { container } = buildTogglePanel(msg.guildId);
    return msg.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }

  /* ================= GLOBAL TOGGLE PANEL ================= */
  if (cmd === "gtoggle" || cmd === "globaltoggle" || cmd === "genable" || cmd === "gdisable") {
    if (!config.ownerIds?.includes(msg.author.id)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Bot owner only!")] });
    }
    const { container } = buildGlobalTogglePanel();
    return msg.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
  }

  /* ================= DASHBOARD COMMAND ================= */
  if (cmd === "dashboard" || cmd === "dash" || cmd === "panel") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return msg.reply({ embeds: [createErrorEmbed("No Permission", "Administrator only!")] });
    }
    const { embed, components } = buildDashboard(msg.guild, msg.guildId);
    return msg.reply({ embeds: [embed], components });
  }

  /* ================= PREMIUM COMMAND ================= */
  if (cmd === "premium" || cmd === "prem") {
    const sub = args[0]?.toLowerCase();

    // !premium status
    if (!sub || sub === "status" || sub === "check") {
      const embed = buildPremiumStatusEmbed(msg.author.id, msg.guildId);
      return msg.reply({ embeds: [embed], components: buildPremiumPlansComponents() });
    }

    // !premium plans
    if (sub === "plans" || sub === "info") {
      return msg.reply({ embeds: [buildPremiumPlansEmbed()], components: buildPremiumPlansComponents() });
    }

    // !premium add user/guild <id> <plan> [days]  — owner or premium manager
    if (sub === "add" || sub === "give") {
      const PREMIUM_MANAGERS = ["1043013895574536282"];
      if (!config.ownerIds?.includes(msg.author.id) && !PREMIUM_MANAGERS.includes(msg.author.id)) {
        return msg.reply({ embeds: [createErrorEmbed("No Permission", "Bot owner only!")] });
      }
      const type = args[1]?.toLowerCase(); // user or guild
      const targetId = args[2];
      const plan = args[3]?.toLowerCase();
      const days = parseInt(args[4]) || 30;

      if (!["user", "guild"].includes(type) || !targetId || !PREMIUM_PLANS[plan]) {
        return msg.reply({ embeds: [createErrorEmbed("Usage", `\`${PREFIX}premium add <user/guild> <id> <basic/pro/lifetime> [days]\``)] });
      }

      const success = setPremium(type, targetId, plan, days, msg.author.id);
      if (!success) return msg.reply({ embeds: [createErrorEmbed("Failed", "Could not activate premium.")] });

      const planInfo = PREMIUM_PLANS[plan];
      return msg.reply({ embeds: [createEmbed({
        title: `💎 ${bold("Premium Activated")}`,
        description:
          `<a:zzz_arrow_hash:1485872093437497434>  **Type:** ${type === "user" ? "👤 User" : "🏠 Guild"}<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434>  **Target ID:** \`${targetId}\`<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434>  **Plan:** ${planInfo.label} (${planInfo.name})<a:zzz_Exclamation:1485872115662983288>\n` +
          `<a:zzz_arrow_hash:1485872093437497434>  **Duration:** ${plan === "lifetime" ? "Lifetime" : `${days} days`}<a:zzz_Exclamation:1485872115662983288>`,
        color: planInfo.color
      })] });
    }

    // !premium remove user/guild <id>  — owner or premium manager
    if (sub === "remove" || sub === "revoke") {
      const PREMIUM_MANAGERS = ["1043013895574536282"];
      if (!config.ownerIds?.includes(msg.author.id) && !PREMIUM_MANAGERS.includes(msg.author.id)) {
        return msg.reply({ embeds: [createErrorEmbed("No Permission", "Bot owner only!")] });
      }
      const type = args[1]?.toLowerCase();
      const targetId = args[2];

      if (!["user", "guild"].includes(type) || !targetId) {
        return msg.reply({ embeds: [createErrorEmbed("Usage", `\`${PREFIX}premium remove <user/guild> <id>\``)] });
      }

      const success = revokePremium(type, targetId);
      if (!success) return msg.reply({ embeds: [createErrorEmbed("Not Found", "That user/guild doesn't have premium.")] });

      return msg.reply({ embeds: [createSuccessEmbed("Premium Revoked", `Removed premium from ${type} \`${targetId}\`.`)] });
    }

    // !premium list  — owner or premium manager
    if (sub === "list") {
      const PREMIUM_MANAGERS = ["1043013895574536282"];
      if (!config.ownerIds?.includes(msg.author.id) && !PREMIUM_MANAGERS.includes(msg.author.id)) {
        return msg.reply({ embeds: [createErrorEmbed("No Permission", "Bot owner only!")] });
      }
      const users  = Object.entries(db.premium?.users  || {});
      const guilds = Object.entries(db.premium?.guilds || {});

      const userLines  = users.map(([id, p]) => {
        const exp = p.plan === "lifetime" ? "Lifetime" : `<t:${Math.floor(p.expiresAt / 1000)}:R>`;
        const active = isPremiumUser(id) ? "<:senable:1485900930002980914>" : "<:sdisable:1485900938475475045>";
        return `${active} \`${id}\` — ${PREMIUM_PLANS[p.plan]?.label || p.plan} (${exp})`;
      }).join("\n") || "*None*";

      const guildLines = guilds.map(([id, p]) => {
        const exp = p.plan === "lifetime" ? "Lifetime" : `<t:${Math.floor(p.expiresAt / 1000)}:R>`;
        const active = isPremiumGuild(id) ? "<:senable:1485900930002980914>" : "<:sdisable:1485900938475475045>";
        return `${active} \`${id}\` — ${PREMIUM_PLANS[p.plan]?.label || p.plan} (${exp})`;
      }).join("\n") || "*None*";

      return msg.reply({ embeds: [createEmbed({
        title: `💎 ${bold("All Premium Holders")}`,
        description:
          `**👤 Users (${users.length})**\n${userLines}\n\n` +
          `**🏠 Guilds (${guilds.length})**\n${guildLines}`,
        color: 0xFFD700
      })] });
    }

    // Help fallback
    return msg.reply({ embeds: [createEmbed({
      title: `💎 ${bold("Premium Commands")}`,
      description:
        `\`${PREFIX}premium status\` — Check your premium status\n` +
        `\`${PREFIX}premium plans\` — View all premium plans\n\n` +
        `**Owner Only:**\n` +
        `\`${PREFIX}premium add <user/guild> <id> <plan> [days]\` — Give premium\n` +
        `\`${PREFIX}premium remove <user/guild> <id>\` — Revoke premium\n` +
        `\`${PREFIX}premium list\` — List all premium holders`,
      color: 0xFFD700
    })] });
  }
});

/* ================= ERROR HANDLING ================= */
process.on("unhandledRejection", error => {
  console.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", error => {
  console.error("Uncaught exception:", error);
});

/* ================= BOT LOGIN ================= */
client.login(config.token).catch(err => {
  console.error("Failed to login:", err);
  process.exit(1);
});