const config = {
  name: "اوامر",
  _name: {
    "ar_SY": "الاوامر"
  },
  aliases: ["cmds", "commands"],
  version: "1.0.3",
  description: "Show all commands or command details",
  usage: "[command] (optional)",
  credits: "XaviaTeam"
};

const langData = {
  "ar_SY": {
    "help.list": "{list}\n❀━━━━〖 اوتشيها 〗━━━━❀\n➜ المجموع: {total} الاوامر\n➜ استخدم الاوامر + اسم الامر {syntax} ",
    "help.commandNotExists": "امر {command} غير موجود.",
    "help.commandDetails": ` \n ➜ اسم: {name} \n ➜ اسم مستعار: {aliases} \n ➜ وصف: {description} \n ➜ استعمال: {usage} \n ➜ الصلاحيات: {permissions} \n ➜ فئة: {category} \n ➜ وقت الانتظار: {cooldown} \n ➜ المطور : راكو سان `,
    "0": "عضو",
    "1": "إدارة المجموعة",
    "2": "ادارة البوت",
    "ADMIN": "المطور",
    "GENERAL": "عضو",
    "TOOLS": "ادوات",
    "ECONOMY": "اقتصاد",
    "MEDIA": "وسائط",
    "GROUP": "مجموعة",
    "AI": "ذكاء"
  }
};

function getCommandName(commandName) {
  if (global.plugins.commandsAliases.has(commandName)) return commandName;
  for (let [key, value] of global.plugins.commandsAliases) {
    if (value.includes(commandName)) return key;
  }
  return null;
}

async function onCall({ message, args, getLang, userPermissions, prefix }) {
  const { commandsConfig } = global.plugins;
  const commandName = args[0]?.toLowerCase();

  if (!commandName) {
    let commands = {};
    const language = data?.thread?.data?.language || global.config.LANGUAGE || 'ar_SY';

    for (const [key, value] of commandsConfig.entries()) {
      if (!!value.isHidden) continue;
      if (!!value.isAbsolute ? !global.config?.ABSOLUTES.some(e => e == message.senderID) : false) continue;
      if (!value.hasOwnProperty("permissions")) value.permissions = [0, 1, 2];
      if (!value.permissions.some(p => userPermissions.includes(p))) continue;

      let category = value.category;
      if (langData[language][category.toUpperCase()]) {
        category = langData[language][category.toUpperCase()];
      }

      if (!commands.hasOwnProperty(category)) commands[category] = [];
      commands[category].push(value._name && value._name[language] ? value._name[language] : key);
    }

    let list = Object.keys(commands)
      .map(category => ` ❀━━━━〖  ${category}  〗━━━━❀ \n \n${commands[category].join(" \n↫ ")}`)
      .join("\n\n");

    message.reply(getLang("help.list", { total: Object.values(commands).map(e => e.length).reduce((a, b) => a + b, 0), list, syntax: prefix }));
  } else {
    const command = commandsConfig.get(getCommandName(commandName));
    if (!command) return message.reply(getLang("help.commandNotExists", { command: commandName }));
    const isHidden = !!command.isHidden;
    const isUserValid = !!command.isAbsolute ? global.config?.ABSOLUTES.some(e => e == message.senderID) : true;
    const isPermissionValid = command.permissions.some(p => userPermissions.includes(p));
    if (isHidden || !isUserValid || !isPermissionValid) return message.reply(getLang("help.commandNotExists", { command: commandName }));

    let category = command.category;
    if (langData['ar_SY'][category.toUpperCase()]) {
      category = langData['ar_SY'][category.toUpperCase()];
    }

    message.reply(getLang("help.commandDetails", {
      name: command.name,
      aliases: command.aliases.join(", "),
      version: command.version || "1.0.0",
      description: command.description || '',
      usage: `${prefix}${commandName} ${command.usage || ''}`,
      permissions: command.permissions.map(p => getLang(String(p))).join(", "),
      category: category,
      cooldown: command.cooldown || 3,
      credits: command.credits || ""
    }).replace(/^ +/gm, ''));
  }
}

export default {
  config,
  langData,
  onCall
};
