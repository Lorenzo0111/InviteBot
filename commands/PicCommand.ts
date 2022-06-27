import BaseCommand from "./base/BaseCommand";
import { SlashCommandBuilder, } from "@discordjs/builders";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { CommandInteraction, MessageEmbed, MessageAttachment } from "discord.js";
import axios from "axios";

export default class PicCommand extends BaseCommand {
    
    constructor() {
        super("pic");
    }

    toJSON(): RESTPostAPIApplicationCommandsJSONBody {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription("Get a picture")
            .addStringOption(option => 
                option.setName("type")
                    .setDescription("Type of the picture to get")
                    .setRequired(true)
                    .addChoices(
                    {
                        name: "cat",
                        value: "cat"
                    },
                    {
                        name: "dog",
                        value: "dog"
                    })
            )
            .toJSON();
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        const type = interaction.options.getString("type",true);

        await interaction.deferReply();

        if (type !== "cat" && type != "dog") {
            interaction.editReply({
                content: `Invalid type!`
            });
            return;
        }

        axios.get("https://some-random-api.ml/animal/" + type).then(res => {
            const embed = new MessageEmbed()
                .setImage(res.data.image)
                .setFooter({text: "Powered by some-random-api.ml"});

            interaction.editReply({
                embeds: [embed]
            });
        });
    }

}