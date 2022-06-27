import { Client, Interaction } from "discord.js";
import BaseCommand from "../commands/base/BaseCommand";

export default class CommandListener {
    client: Client;
    commands: Map<string, BaseCommand>;
    
    constructor(client: Client, commands: Map<string,BaseCommand>) {
        this.client = client;
        this.commands = commands;

        this.client.on("interactionCreate", (interaction:Interaction) => this.onEvent(interaction));
    }

    async onEvent(interaction: Interaction) {
        if (!interaction.isCommand()) return;
    
        const command = interaction.commandName;
        if (!this.commands.has(command)) return;
    
        const cmd = this.commands.get(command);
        if (!cmd) return;

        try {
            cmd.execute(interaction);
        } catch (error) {
            console.error(error);
        }
    }
}