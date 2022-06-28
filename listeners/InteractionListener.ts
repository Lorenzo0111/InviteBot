import { Client, Interaction,ButtonInteraction } from "discord.js";
import Invite from "../models/Invite";

export default class CommandListener {
    client: Client;
    
    constructor(client: Client) {
        this.client = client;

        this.client.on("interactionCreate", (interaction:Interaction) => this.onEvent(interaction));
    }

    async onEvent(interaction: Interaction) {
        if (!interaction.isButton()) return;
    
        await interaction.deferReply();

        switch (interaction.customId) {
            case "accept":
                this.acceptInvite(interaction);
                break;
            case "deny":
                this.denyInvite(interaction);
                break;
        }
    }

    private async acceptInvite(interaction: ButtonInteraction) {
        const invite = await Invite.findOne({_id: interaction.message.embeds[0].fields!![0].value}).exec();

        if (!invite) {
            interaction.editReply({
                content: "This invite is no longer valid!"
            });
            return;
        }

        const user = await this.client.users.fetch(invite.from!!);
        user.createDM().then(dm => {
            dm.send(`Your invitation to <@${invite.to!!}> has been accepted.`)
        }).catch();

        invite.remove();

        interaction.editReply({
            content: "Invite accepted!"
        });
    }

    private async denyInvite(interaction: ButtonInteraction) {
        const invite = await Invite.findOne({_id: interaction.message.embeds[0].fields!![0].value}).exec();

        if (!invite) {
            interaction.editReply({
                content: "This invite is no longer valid!"
            });
            return;
        }

        const user = await this.client.users.fetch(invite.from!!);
        user.createDM().then(dm => {
            dm.send(`Your invitation to <@${invite.to!!}> has been denied.`)
        }).catch();

        invite.remove();

        interaction.editReply({
            content: "Invite denied!"
        });
    }
}