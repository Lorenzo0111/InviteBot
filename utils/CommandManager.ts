import {Client} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes, RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import BaseCommand from "../commands/base/BaseCommand";
import fs from "node:fs";
import path from "node:path";

export function registerCommands(client: Client): Map<string,BaseCommand> {
    const map = new Map<string,BaseCommand>();

    fs.readdirSync(path.join(__dirname, "../commands")).forEach(file => {
        if (!file.endsWith(".js")) return;

        const command = require(`../commands/${file}`);
        const cmd: BaseCommand = new command.default();
        
        map.set(cmd.name, cmd);

        console.log(`[+] Registered ${cmd.name}`);
    });

    const jsonCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    map.forEach((cmd, key) => {
        jsonCommands.push(cmd.toJSON());
    });

    console.log('[|] Started refreshing commands.');

    try {

        const rest = new REST({ version: '9' }).setToken(process.env.TOKEN as string);

        client.guilds.cache.forEach(guild => {

            rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT as string,guild.id),
                { body: jsonCommands }
                );
        });
    } catch (e) {
        console.error(e);
    }

    console.log('[|] Command refreshed successfully.');

    return map;
}