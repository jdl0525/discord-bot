const { EmbedBuilder } = require('discord.js');

const sendEmbedMessage = (message, content) => {
    const embed = new EmbedBuilder().setColor('#FFFF00').setDescription(`**${content}**`);
    message.channel.send({ embeds: [embed] });
};

module.exports = { sendEmbedMessage };
