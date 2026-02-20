package Bot;

import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.entities.Activity;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.interactions.commands.build.Commands;
import io.github.cdimascio.dotenv.Dotenv;
import javax.security.auth.login.LoginException;

public class Main {
    public static void main(String[] args) throws LoginException, InterruptedException {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        String token = dotenv.get("BOT_TOKEN", System.getenv("BOT_TOKEN"));
        if (token == null || token.isBlank()) {
            throw new IllegalStateException("BOT_TOKEN is not set");
        }

        JDA bot = JDABuilder.createDefault(token)
                .setActivity(Activity.playing("Web Dev Activities"))
                .build().awaitReady();
     }
    }
