const { exec } = require('child_process');
const { EmbedBuilder } = require('discord.js');
const portscanner = require('portscanner'); // Make sure to import the correct package

const specialCommands = {
    scrape: async (message) => {
        const args = message.content.split(' ').slice(1);
        if (args.length === 0) {
            return message.channel.send("Please provide a URL to scrape.");
        }

        const url = args[0];
        exec(`python3 commands/web_scraper.py ${url}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${stderr}`);
                return message.channel.send("An error occurred while scraping the URL.");
            }
            const embed = new EmbedBuilder()
                .setColor('#FFFF00')
                .setTitle('Web Scraping Result')
                .setDescription(`Title of the page: ${stdout}`);
            message.channel.send({ embeds: [embed] });
        });
    },
    deletewebhook: async (message) => {
        const args = message.content.split(' ').slice(1);
        if (args.length === 0) {
            return message.channel.send("Please provide a webhook URL to delete.");
        }

        const webhookUrl = args[0];
        try {
            await exec(`curl -X DELETE ${webhookUrl}`);
            message.channel.send("Webhook has been deleted!");
        } catch (error) {
            console.error(error);
            message.channel.send("Failed to delete the webhook.");
        }
    },
    say: async message => {
        const hasVerifiedRole = message.member.roles.cache.some(role => role.name === "LunarBot Verified");
        if (!hasVerifiedRole) return sendEmbedMessage(message, 'You need the **LunarBot Verified Role**. The role was accessible for a limited time and is no longer claimable.');

        const sayMessage = message.content.slice(message.content.indexOf(' ') + 1).trim();
        if (!sayMessage) return sendEmbedMessage(message, 'You need to provide a message to repeat.');

        const sentMessage = await message.channel.send(sayMessage);
        await message.delete();
    },
    portscan: async (message) => {
        const args = message.content.split(' ').slice(1);
        if (args.length === 0) {
            return message.channel.send("Please provide an IP address to scan.");
        }

        const ip = args[0];
        if (!ip.match(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/)) {
            return message.channel.send("Invalid IP address format.");
        }

        const portsToScan = [
            { name: 'ssh', port: 22 },
            { name: 'DNS', port: 53 },
            { name: 'http', port: 80 },
            { name: 'https', port: 443 },
            { name: 'MySQL', port: 3306 },
            { name: 'Minecraft', port: 25565 },
            { name: 'TS3', port: 9987 },
            { name: 'Source Engine', port: 27015 },
            { name: 'FiveM', port: 30120 }
        ];
        
        const scanResults = [];

        for (const service of portsToScan) {
            await new Promise(resolve => {
                portscanner.checkPortStatus(service.port, ip, (error, status) => {
                    if (error) {
                        console.error(error);
                        scanResults.push(`${service.name}\t${service.port}\tError`);
                    } else {
                        scanResults.push(`${service.name}\t${service.port}\t${status}`);
                    }
                    resolve();
                });
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Port Scan Results')
            .setDescription(`Scan results for IP ${ip}:\n${scanResults.join('\n')}`);

        message.channel.send({ embeds: [embed] });
    }
};

module.exports = specialCommands;
