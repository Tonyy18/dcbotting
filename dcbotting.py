
import json
from time import sleep
import threading
import websocket

def ready(ob, data):
    print(data)

class Bot:
    
    def __init__(self, token):
        self.gateway = "wss://gateway.discord.gg/"
        self.opMappings = {
            10: self.__startHeartbeat,
            1: self.__sendHeartbeat
        }
        self.heartbeatThread = None
        self.ws = None
        self.sequencyNum = None
        self.token = token
        self.__events = {}
        self.events = {}

    def __on(self, name, callback):
        if(len(self.__events) == 0):
            self.__events[name] = []
        self.__events[name].append(callback)

    def send(self, data):
        self.ws.send(json.dumps(data))

    def __identify(self):
        print("identify")
        self.send({
            "op": 2,
            "d": {
                "token": self.token,
                "properties": {
                "$os": "linux",
                "$browser": "my_library",
                "$device": "my_library"
              }
            }
        })

    def __sendHeartbeat(self):
        self.send({
            "op": 1,
            "d": self.sequencyNum
        })
        print("heartbeat")

    def __runHeartbeatThread(self, data):
        self.__sendHeartbeat()
        self.__identify()
        while True:
            sleep(int(data["heartbeat_interval"]) / 1000)
            self.__sendHeartbeat()

    def __startHeartbeat(self, data):
        self.heartbeatThread = threading.Thread(target=self.__runHeartbeatThread, args=(data,))
        self.heartbeatThread.start()

    async def __listener(self):
        async with websockets.connect(self.gateway) as websocket:
            self.websocket = websocket
            try:
                while True:
                    name = await websocket.recv()
                    js = json.loads(name)
                    eventName = js["t"]
                    sequencyNum = js["s"]
                    self.sequencyNum = sequencyNum
                    opCode = js["op"]
                    data = js["d"]
                    print(data)
                    if(opCode != 0 and opCode in self.opMappings):
                        self.opMappings[opCode](data)

            except KeyboardInterrupt:
                print("Exit")

    def connect(self):
        self.__initDefaultEvents()
        self.ws = websocket.WebSocket()
        self.ws.connect(self.gateway)
        try:
            while True:
                res = json.loads(self.ws.recv())
                eventName = res["t"]
                sequencyNum = res["s"]
                self.sequencyNum = sequencyNum
                opCode = res["op"]
                data = res["d"]
                if(opCode != 0 and opCode in self.opMappings):
                    self.opMappings[opCode](data)
                elif(eventName != None):
                    eventName = eventName.lower()
                    print(eventName)
                    if(eventName in self.__events):
                        for a in range(0, len(self.__events[eventName])):
                            self.__events[eventName][a](self, data)
                    if(eventName in self.events):
                        for a in range(0, len(self.events[eventName])):
                            self.__events[eventName][a](data)

        except KeyboardInterrupt:
            print("Exit")
            pass

    def __initDefaultEvents(self):
        self.__events = {}
        self.__on("ready", ready)