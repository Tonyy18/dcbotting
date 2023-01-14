class BotData:
    __username = None
    __id = None
    __avatar = None
    __guilds = {}
    def setUsername(self, username):
        self.__username = username

    def getUsername(self):
        return self.__username
    
    def setId(self, id):
        self.__id = id
    
    def getId(self):
        return self.__id

    def setAvatar(self, avatar):
        self.__avatar = avatar
    
    def getAvatar(self):
        return self.__avatar

    def addGuild(self, guild):
        self.__guilds[guild["name"]] = guild

    def getAllGuilds(self):
        return self.__guilds

    def getGuild(self, name):
        return self.__guilds[name]