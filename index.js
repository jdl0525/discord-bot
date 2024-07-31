const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const modCommands = require('./commands/mod');
const helpCommand = require('./commands/help');
const secretCommands = require('./commands/secret'); // Import secret.js commands
const specialCommands = require('./commands/special_commands'); // Import special_commands.js commands

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const { BOT_TOKEN } = config;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers // Add this to listen for member events
    ]
});

const prefix = ';';

client.once('ready', () => {
    console.log('Ready!');
    client.user.setPresence({
        activities: [
            {
                name: 'Made by jdl052510 (Joey)',
                type: 4
            }
        ],
        status: 'dnd'
    });
});

const sendEmbedMessage = (message, content) => {
    const embed = new EmbedBuilder().setColor('#FFFF00').setDescription(`**${content}**`);
    message.channel.send({ embeds: [embed] });
};

const commands = {
    ping: message => sendEmbedMessage(message, 'Pong.'),
    version: message => sendEmbedMessage(message, 'I am Lunar bot, and I am currently in version 1'),
    help: helpCommand, // Use the imported help command
    info: message => sendEmbedMessage(message, 'This is a helpful Discord bot!'),
    joke: async message => {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "Why don't skeletons fight each other? They don't have the guts.",
            "What do you call fake spaghetti? An impasta!",
            "Why did the math book look sad? Because it had too many problems.",
            "What do you call cheese that isn't yours? Nacho cheese!",
            "Why did the bicycle fall over? Because it was two-tired!",
            "Why don't programmers like nature? It has too many bugs.",
            "Why did the golfer bring extra pants? In case he got a hole in one.",
            "Why do cows have hooves instead of feet? Because they lactose."
        ];
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        sendEmbedMessage(message, randomJoke);
    },
    rules: message => sendEmbedMessage(message, 'Please follow the rules: Be respectful, no spamming, and follow the community guidelines.'),
    react: async message => {
        const emojiList = message.content.slice(prefix.length + 5).trim().split(/\s+/);
        if (emojiList.length === 0) {
            return sendEmbedMessage(message, 'You need to provide at least one emoji.');
        }
    
        const targetMessage = message.reference ? await message.channel.messages.fetch(message.reference.messageId) : message;
    
        for (const emoji of emojiList) {
            try {
                await targetMessage.react(emoji);
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay of 500ms
            } catch {
                sendEmbedMessage(message, `Couldn't react with ${emoji}. Make sure it's a valid emoji.`);
            }
        }
    },     
    freerole: async message => {
        const roleName = 'LunarBot User';
        const member = message.member;
        const role = message.guild.roles.cache.find(r => r.name === roleName);
        if (!role) return sendEmbedMessage(message, 'Role not found.');
        try {
            await member.roles.add(role);
            sendEmbedMessage(message, `Role ${roleName} was added to yourself.`);
        } catch (err) {
            sendEmbedMessage(message, 'Unable to add role.');
        }
    },
    '8ball': message => {
        const responses = ["Yes", "No", "Maybe"];
        const question = message.content.slice(prefix.length + 5).trim();
        if (!question) return sendEmbedMessage(message, 'You need to ask a question.');
        const response = responses[Math.floor(Math.random() * responses.length)];
        sendEmbedMessage(message, response);
    },
    avatar: message => {
        const user = message.mentions.users.first() || message.author;
        const embed = new EmbedBuilder()
            .setColor('#FFFF00')
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .addFields(
                { name: 'Username', value: user.username, inline: true },
                { name: 'ID', value: user.id, inline: true }
            );
        message.channel.send({ embeds: [embed] });
    },
    calendar: message => {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();

        const getMonthName = (month) => {
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            return monthNames[month];
        };

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        let calendar = `\`\`\`${getMonthName(month)} ${year}\nSu Mo Tu We Th Fr Sa\n`;

        for (let i = 0; i < firstDay; i++) {
            calendar += '   ';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            calendar += day.toString().padStart(2, ' ') + ' ';
            if ((day + firstDay) % 7 === 0) {
                calendar += '\n';
            }
        }

        calendar += '\n```';
        message.channel.send(calendar);
    },
    listroles: message => {
        const roles = message.guild.roles.cache
            .sort((a, b) => b.position - a.position) // Sort roles by position, highest first
            .map(role => `- ${role.name}`) // Format each role as a list item
            .join('\n'); // Join the list items with a newline

        sendEmbedMessage(message, `# Roles in this server (Top-Bottom):\n${roles}`);
    },
    poll: async message => {
        const args = message.content.slice(prefix.length + 5).trim().split('|'); // Split by '|'
    
        if (args.length < 1) {
            return sendEmbedMessage(message, 'You need to provide a question. Use | to separate options.');
        }
    
        const question = args[0].trim();
        const creatorName = message.author.username; // Get the author's display name
    
        const embed = new EmbedBuilder()
            .setTitle(`${creatorName} | ${question}`) // Format the title with the creator's name and question
            .setDescription('React with ✅ for Yes or ❌ for No.')
            .setColor('#00FF00');
    
        const pollMessage = await message.channel.send({ embeds: [embed] });
    
        // React with green check and red X
        await pollMessage.react('✅');
        await pollMessage.react('❌');
    }     
};

// Add welcome message functionality
client.on('guildMemberAdd', member => {
    const channelId = '1261724286004232275'; // Replace with your channel ID
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;
    channel.send(`Welcome to the server, ${member}! Make sure to follow Lunar on Twitch. @lunarneedscheese.`);
});

Object.assign(commands, modCommands);
Object.assign(commands, secretCommands); // Merge secret.js commands
Object.assign(commands, specialCommands); // Merge special_commands.js commands

client.on('messageCreate', message => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    const command = message.content.slice(prefix.length).trim().split(' ')[0].toLowerCase();

    // Check for command existence and execute
    if (commands[command]) {
        // Check for role requirement before executing commands from specialCommands
        if (['scrape', 'deletewebhook'].includes(command)) {
            specialCommands.checkRole(message); // Call to check role
        }
        commands[command](message);
    } else {
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setDescription("**Unknown Command | Please use ;help to view all the available commands.**");
        message.channel.send({ embeds: [embed] });
    }
});

// Handling interaction for slash commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'help') {
        helpCommand(interaction); // Use the imported help command
    }
});

client.login('MTI2Njk0NjYyODQyMjQ2NzcxNw.Gqubge.0Ii8O92eMQWS-IjA_9PIaN3bxqKQl4ME4CjxkE'); // Replace with your actual bot token
