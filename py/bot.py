import lib

#This file is produced by dcbotting.com engine based on your project.
#You are free to edit and publish this file under you own license.

bot = lib.Bot("NzA0NDEyMjg5NzU5MDUxOTM2.XqcxEQ.HDDq5gDtqo2kdekj4Fm2fT5VhBI")

@bot.event
def message_create(data):
    print(data["author"]["username"] + ": " + data["content"])

bot.run()