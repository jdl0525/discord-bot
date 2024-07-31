const client = require('./index.js');

client.on('guildMemberAdd', member => {
    const channelId = '1261724286004232275'; // Replace with your channel ID
    const channel = member.guild.channels.cache.get(channelId);
    if (!channel) return;
    channel.send(`Welcome to the server, ${member}! Make sure to follow Lunarneedscheese on twitch!`);
});
