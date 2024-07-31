const { EmbedBuilder } = require('discord.js');

const helpCommand = async (context) => {
    const embed = new EmbedBuilder()
        .setColor('#FFFF00')
        .setDescription(`# Available Commands:

# For Members:
- ;ping - Responds with "Pong."
- ;version - Responds with the version its currently in
- ;help - Lists all available commands.
- ;info - Provides information about the bot.
- ;joke - Sends a random joke.
- ;say [message] - Makes the bot repeat the message.
- ;react [emoji] - Reacts to the user's message with a custom emoji.
- ;freerole - Gives the "LunarBot User" role to the user who executes the command.
- ;8ball [question] - Random yes, no, or maybe response.
- ;avatar [@user] - Shows the user's Discord profile and details. If no user is mentioned, shows the profile of the person who executes the command.
- ;calendar - Displays a calendar for the current month.
- ;listroles - Lists the roles of the server from top to bottom.

# Special Commands:
- ;deletewebhook [Webhook URL] - Deletes the webhook from the server.
- ;scrape [Website URL] - Does a webscrape on the website URL (Doesn't work on cloudfare websites)
- ;say [message] - Makes the bot repeat the message.
- ;portscan [IP] - Port scans common ports

# For Moderators:
- ;say [message] - Makes the bot repeat the message.
- ;kick @username - Kicks the mentioned user.
- ;ban @username [time] - Bans the mentioned user. Permanent if no time is specified.
- ;unban @username - Unbans the mentioned user.
- ;mute @username [time] - Mutes the mentioned user for a specified duration.
- ;unmute @username - Unmutes the mentioned user.
- ;purge [number] - Deletes the specified number of messages.
- ;lock - Locks the current channel so users can view but not send messages.
- ;unlock - Unlocks the current channel allowing users to send messages.
- ;addrole [@user] - Adds the specified role to the mentioned user. If no user is mentioned, the role will be added to the person who executes the command.
- ;removerole [@user] - Removes the specified role to the mentioned user. If no user is mentioned, the role will be removed to the person who executes the command.
`);

    if (context.channel) {
        context.channel.send({ embeds: [embed] });
    } else if (context.reply) {
        await context.reply({ embeds: [embed], ephemeral: true }); // Acknowledge the interaction
    }
};

module.exports = helpCommand;
