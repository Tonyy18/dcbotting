import websocket #websocket_client
import threading
from time import sleep
import json
import requests

#This works as a base for the discord bot
#This file is produced by the developer and author of dcbotting.com
#Permissions for the editing and publishing are only granted for the author of dcbotting.com

class Bot:

    def __init__(self, token):
        self.token = token #Authentication token
        self.gateway = "wss://gateway.discord.gg/"
        self.ws = None #websocket holder
        self.data_listening = None #Runs the data listening thread
        self.heartbeat_threat = None #Runs the heartbeat thread
        self.codeList = {} #opcode listeners
        self.set_opcodes() #Set all opcode listeners
        self.last_sequence = None
        self.events = {} #List for user registered events
        self.origin = "https://discord.com/api"
        self.headers = {"Authorization": "Bot " + this.token} 

    def run(self):
        self.connect()

    def opcodes(self, func):
        #Decorator for setting opcode callbacks
        code = int(func.__name__.split("_")[1])
        self.codeList[code] = func

    def listen(self):
        #Listen for incoming data
        while True:
            if(self.ws == None):
                continue
            try:
                received = self.ws.recv()
            except:
                break
            received = json.loads(received)
            
            op = received["op"] #payload opcode
            data = received["d"] #event data
            sequence = received["s"] #sequency number 
            self.last_sequence = sequence
            name = received["t"] #event name
            if(op in self.codeList):
                #If opcode callback is registered
                self.codeList[op](data)
            
            if(int(op) == 0 and name.lower() in self.events):
                #Otherwise call it as a bot event
                self.events[name.lower()](data)

        self.ws.close()
        print("Websocket closed")

    def send(self, payload):
        #Sends the actual payload to the websocket
        self.ws.send(json.dumps(payload))

    def connect(self):
        self.ws = websocket.WebSocket()
        self.ws.connect(self.getGateway())

        #Data listening thread
        self.data_listening = threading.Thread(target=self.listen)
        self.data_listening.start()

    def getGateway(self):
        return self.gateway

    def send_heartbeat(self):
        payload = {
            "op": 1,
            "d": self.last_sequence
        }
        self.send(payload)

    def heartbeat(self, *args):
        #Runs the heartbeating
        interval = args[0]
        try:
            while True:
                self.send_heartbeat()
                sleep(interval / 1000)
        except KeyboardInterrupt:
            pass
    
    def identify(self):
        #Authentication
        self.send({
            "op": 2,
            "d": {
                "token": self.token,
                "properties": {
                    "$os": "dcbotting.com",
                    "$browser": "dcbotting.com",
                    "$device": "dcbotting.com"
                }
            }
        })

    def set_opcodes(self):
        #Declare all opcode functions here using opcodes decorator
        #opcode_{integer}

        @self.opcodes
        def opcode_10(data):
            interval = data["heartbeat_interval"]
            self.heartbeat_threat = threading.Thread(target=self.heartbeat, args=(interval,))
            self.heartbeat_threat.start()
            self.identify()

        @self.opcodes
        def opcode_1(data):
            self.send_heartbeat()

    def event(self, func):
        #Event decorator for the usage side
        self.events[func.__name__] = func

    def exec(method, url, data={}, headers={}):
        url = self.origin + url
        for 
        re = requests[method](url, data=data, headers=headers)
        try:
            data = json.loads(data)
        except:
            pass
        
        return {
            "status": re.status_code,
            "data": data
        }