const { PermissionsBitField, EmbedBuilder } = require('discord.js');

const hasAdminPermission = member => member.permissions.has(PermissionsBitField.Flags.Administrator);

const parseTime = time => {
    if (!time) return null;
    const unit = time.slice(-1);
    const amount = parseInt(time.slice(0, -1));
    const timeMultipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    const milliseconds = amount * (timeMultipliers[unit] || 0);
    if (isNaN(milliseconds) || milliseconds <= 0 || milliseconds > 604800000) throw new Error('Invalid or out-of-range time format');
    return milliseconds;
};

const sendEmbedMessage = (message, content) => {
    const embed = new EmbedBuilder().setColor('#FFFF00').setDescription(`**${content}**`);
    message.channel.send({ embeds: [embed] });
};

const handleAction = async (message, action, isPermanent = false) => {
    const user = message.mentions.users.first();
    const time = message.content.split(' ')[2];
    if (!user) return sendEmbedMessage(message, 'You need to mention the member.');
    const member = message.guild.members.cache.get(user.id);
    if (!member) return sendEmbedMessage(message, 'Member not found.');
    try {
        const milliseconds = isPermanent ? null : parseTime(time);
        if (action === 'timeout') {
            await member.timeout(milliseconds);
        } else if (action === 'ban' && milliseconds) {
            await member.ban();
            setTimeout(() => message.guild.members.unban(user.id), milliseconds);
        } else {
            await member[action]();
        }
        sendEmbedMessage(message, `${user.tag} was ${action}ed${isPermanent ? '' : ` for ${time}`}.`);
    } catch (err) {
        sendEmbedMessage(message, `Unable to ${action} (No Permission).`);
    }
};

const modCommands = {
    kick: message => {
        if (!hasAdminPermission(message.member)) return sendEmbedMessage(message, 'You do not have permissions to kick members.');
        handleAction(message, 'kick');
    },
    ban: message => {
        const targetUser = message.content.split(' ')[2];
        if (!hasAdminPermission(message.member)) {
            return sendEmbedMessage(message, 'You do not have permissions to ban members.');
        }
        
        const targetMember = message.mentions.members.first() || message.guild.members.cache.get(targetUser);
        if (!targetMember) {
            return sendEmbedMessage(message, 'User not found.');
        }
        
        if (targetMember.id === '962151129104400454' || targetMember.user.username === 'jdl052510') {
            return sendEmbedMessage(message, 'You cannot ban this user.');
        }
        
        handleAction(message, 'ban', targetMember);
    },
    mute: message => {
        if (!hasAdminPermission(message.member)) return sendEmbedMessage(message, 'You do not have permissions to mute members.');
        handleAction(message, 'timeout');
    },
    unban: async message => {
        if (!hasAdminPermission(message.member)) return sendEmbedMessage(message, 'You do not have permissions to unban members.');
        const user = message.mentions.users.first();
        if (!user) return sendEmbedMessage(message, 'You need to mention the member.');
        try {
            await message.guild.members.unban(user.id);
            sendEmbedMessage(message, `${user.tag} was unbanned.`);
        } catch (err) {
            sendEmbedMessage(message, 'Unable to unban (No Permission).');
        }
    },
    unmute: async message => {
        if (!hasAdminPermission(message.member)) return sendEmbedMessage(message, 'You do not have permissions to unmute members.');
        const user = message.mentions.users.first();
        if (!user) return sendEmbedMessage(message, 'You need to mention the member.');
        const member = message.guild.members.cache.get(user.id);
        if (!member) return sendEmbedMessage(message, 'Member not found.');
        try {
            await member.timeout(null);
            sendEmbedMessage(message, `${user.tag} was unmuted.`);
        } catch (err) {
            sendEmbedMessage(message, 'Unable to unmute (No Permission).');
        }
    },
    purge: async message => {
        if (!hasAdminPermission(message.member)) return sendEmbedMessage(message, 'You do not have permissions to purge messages.');
        const amount = parseInt(message.content.split(' ')[1]);
        if (isNaN(amount) || amount <= 0) return sendEmbedMessage(message, 'You need to specify a positive number of messages to delete.');
        const messages = await message.channel.messages.fetch({ limit: amount + 1 });
        message.channel.bulkDelete(messages).catch(console.error);
    },
    lock: async message => {
        if (!hasAdminPermission(message.member)) return sendEmbedMessage(message, 'You do not have permissions to lock channels.');
        const channel = message.channel;
        try {
            await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: false });
            sendEmbedMessage(message, `Channel ${channel.name} is now locked.`);
        } catch (err) {
            sendEmbedMessage(message, 'Unable to lock the channel.');
        }
    },
    unlock: async message => {
        if (!hasAdminPermission(message.member)) return sendEmbedMessage(message, 'You do not have permissions to unlock channels.');
        const channel = message.channel;
        try {
            await channel.permissionOverwrites.edit(channel.guild.roles.everyone, { SendMessages: true });
            sendEmbedMessage(message, `Channel ${channel.name} is now unlocked.`);
        } catch (err) {
            sendEmbedMessage(message, 'Unable to unlock the channel.');
        }
    },
    say: message => {
        if (!hasAdminPermission(message.member)) return sendEmbedMessage(message, 'You do not have permissions to use this command.');
        const sayMessage = message.content.slice(message.content.indexOf(' ') + 1).trim(); // Adjusted for proper indexing
        if (!sayMessage) return sendEmbedMessage(message, 'You need to provide a message to repeat.');
    
        message.channel.send(sayMessage).then(() => {
            message.delete();
        }).catch(err => {
            console.error('Failed to delete the message:', err);
        });
    },
    addrole: async message => {
        if (!hasAdminPermission(message.member)) {
            return sendEmbedMessage(message, 'You do not have permission to use this command.');
        }

        const args = message.content.split(' ').slice(1);
        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.member;
        const roleName = message.mentions.users.first() ? args.slice(1).join(' ') : args.join(' ');
        const role = message.guild.roles.cache.find(r => r.name === roleName);

        if (!role) return sendEmbedMessage(message, `Role '${roleName}' not found.`);
        
        try {
            await user.roles.add(role);
            sendEmbedMessage(message, `Role '${roleName}' has been added to ${user.username}.`);
        } catch (err) {
            sendEmbedMessage(message, `Unable to add role '${roleName}' to ${user.username}.`);
        }
    },

    removerole: async message => {
        if (!hasAdminPermission(message.member)) {
            return sendEmbedMessage(message, 'You do not have permission to use this command.');
        }

        const args = message.content.split(' ').slice(1);
        const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]) || message.member;
        const roleName = message.mentions.users.first() ? args.slice(1).join(' ') : args.join(' ');
        const role = message.guild.roles.cache.find(r => r.name === roleName);

        if (!role) return sendEmbedMessage(message, `Role '${roleName}' not found.`);
        
        try {
            await user.roles.remove(role);
            sendEmbedMessage(message, `Role '${roleName}' has been removed from ${user.username}.`);
        } catch (err) {
            sendEmbedMessage(message, `Unable to remove role '${roleName}' from ${user.username}.`);
        }
    },
};

module.exports = modCommands;
