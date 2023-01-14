import dcbotting

bot = dcbotting.Bot("")
@bot.on("ready")
def test(data):
    print(bot.getUsername())
bot.connect()