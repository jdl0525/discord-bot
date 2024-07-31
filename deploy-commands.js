const { REST, Routes } = require('discord.js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const { BOT_TOKEN, ClientId, GuildId } = config;

const commands = [
    {
        name: 'help',
        description: 'Lists all available commands.'
    }
];

const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(ClientId, GuildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
