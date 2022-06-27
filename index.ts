import {Client,Intents} from "discord.js";
import {config} from "dotenv";
import {connect} from "mongoose";
import {registerCommands} from "./utils/CommandManager";
import CommandListener from "./listeners/CommandListener";
import InteractionListener from "./listeners/InteractionListener";

config();

const bot = new Client({
    intents: [Intents.FLAGS.GUILDS]
});

bot.on("ready", () => {
    const commands = registerCommands(bot);
    
    new CommandListener(bot,commands);
    new InteractionListener(bot);

    console.log("Bot started successfully");
});

connect(process.env.MONGO as string).then(() => {
    bot.login(process.env.TOKEN);
});