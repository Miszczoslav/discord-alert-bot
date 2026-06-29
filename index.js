const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");

const path = require("path");
const config = require("./config.json");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

let connection;
let player;

async function connect() {
  const guild = await client.guilds.fetch(config.guildId);

  connection = joinVoiceChannel({
    channelId: config.channelId,
    guildId: config.guildId,
    adapterCreator: guild.voiceAdapterCreator
  });

  player = createAudioPlayer();
  connection.subscribe(player);

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30000);
    console.log("Połączono z voice");
  } catch (e) {
    console.log("Błąd voice:", e);
  }

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    console.log("Rozłączono, reconnect...");
    setTimeout(connect, 5000);
  });
}

function playSound() {
  const resource = createAudioResource(
    path.join(__dirname, "alert.mp3")
  );

  player.play(resource);
  console.log("Ding!");
}

client.once("ready", async () => {
  console.log(`Zalogowano jako ${client.user.tag}`);

  await connect();

  playSound();

  setInterval(() => {
    playSound();
  }, config.intervalMinutes * 60 * 1000);
});

client.login(config.token);