import BaseCommand from "./base/BaseCommand";
import { SlashCommandBuilder, } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { CommandInteraction, User, MessageEmbed, MessageActionRow, MessageButton } from "discord.js";
import Invite from "../models/Invite";

export default class InviteCommand extends BaseCommand {
    lastSent: Map<string,Date> = new Map();
    
    constructor() {
        super("invite");
    }

    toJSON(): RESTPostAPIApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription("Manage invitations")
            .addSubcommand(send => 
                send.setName("send")
                    .addUserOption(option => 
                        option.setName("user")
                            .setRequired(true)
                            .setDescription("The user to send the invite to")
                    )
                    .setDescription("Sends an invitation to a user")
            )
            .addSubcommand(cancel => 
                cancel.setName("cancel")
                    .addUserOption(option => 
                        option.setName("user")
                            .setRequired(true)
                            .setDescription("The user who received the invite to cancel")
                    )
                    .setDescription("Cancel an invitation that has been sent to a user")
            )
            .toJSON();
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        const target = interaction.options.getUser("user",true);

        await interaction.deferReply();

        switch (interaction.options.getSubcommand(true)) {
            case "send":
                this.sendInvite(interaction,target);
                break;
            case "cancel":
                this.cancelInvite(interaction,target);
                break;
        }
    }

    private async sendInvite(interaction: CommandInteraction,target: User): Promise<void> {
        if (this.lastSent.has(target.id)) {
            const lastSent = this.lastSent.get(target.id);
            if (lastSent != null && lastSent.getTime() + (1000 * 60 * Number(process.env.DELAY!!)) > new Date().getTime()) {
                await interaction.editReply({ content: `You can only send an invite once every ${process.env.DELAY} minutes`});
                return;
            }
        }
        
        let invite = await Invite.findOne({from:interaction.user.id,to:target.id}).exec();
        
        if (invite) {
            interaction.editReply({
                content: `You already have a pending invite for <@${target.id}>!`
            });
            return;
        }

        invite = new Invite({
            from: interaction.user.id,
            to: target.id
        });

        await invite.save();

        interaction.editReply({
            content: `You have sent an invite to <@${target.id}>!`
        });

        target.createDM().then(async dm => {
            const embed = new MessageEmbed()
                .setTitle("Invitation")
                .setColor("GREEN")
                .setDescription(`You have received an invitation from <@${interaction.user.id}>.`)
                .addField("Invitation ID",invite!!._id.toString(),true)
                .setTimestamp();
            
            const buttons = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setStyle("SUCCESS")
                        .setCustomId("accept")
                        .setLabel("Accept"),
                    
                    new MessageButton()
                        .setStyle("DANGER")
                        .setCustomId("deny")
                        .setLabel("Deny"),    
                );
            
            const m = await dm.send({
                embeds: [embed],
                components: [buttons]
            });

            if (invite) {
                invite.message = m.id;
                invite.save();
            }
        }).catch(err => {
            interaction.editReply({
                content: `<@${target.id}> should enable DMs from this server in order to accept the invitation!`
            });
        });

        this.lastSent.set(target.id,new Date());
    }

    private async cancelInvite(interaction: CommandInteraction,target: User): Promise<void> {
        const invite = await Invite.findOne({from: interaction.user.id,to: target.id}).exec();
        
        if (!invite) {
            interaction.editReply({
                content: `You don't have a pending invite for <@${target.id}>!`
            });
            return;
        }

        if (invite.message) {
            target.createDM().then(dm => {
                dm.messages.fetch(invite.message!!).then(msg => msg.delete());
            });
        }

        invite.remove();

        interaction.editReply({
            content: `Invitation to <@${target.id}> cancelled!`
        });
    }

}