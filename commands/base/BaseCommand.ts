import { RESTPostAPIApplicationCommandsJSONBody } from "discord-api-types/v9";
import { CommandInteraction } from "discord.js";

export default abstract class BaseCommand {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
    
    abstract toJSON(): RESTPostAPIApplicationCommandsJSONBody;
    abstract execute(interaction: CommandInteraction): Promise<void>;
}