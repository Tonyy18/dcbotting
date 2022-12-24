import json
import mysql.connector
import sys

def getEnvConfiguration():
    f = open("../.env")
    content = f.read()
    lines = content.split("\n")
    results = {}
    for a in lines:
        a = a.strip()
        if("=" in a):
            values = a.split("=")
            key = values[0]
            val = values[1]
            results[key] = val
    return results

def getObjects():
    f = open("../data/" + fileName + ".json")
    content = f.read()
    js = json.loads(content)
    results = []
    for key in js:
        key = key.strip()
        data = json.dumps(js[key]).strip()
        results.append({
            "name": key,
            "data": data
        })

    return results

def getSqlInsertSyntax(o):
    o["data"] = o["data"].replace("'", "\\'")
    return "INSERT INTO " + fileName + " (name, data) VALUES ('" + o["name"] + "', '" + o["data"] + "')";

class OriginalObject:
    def __init__(self, _data):
        self.name = _data["name"].strip()
        self.data = _data["data"].replace("'", "\\'").strip()

    def getData(self):
        return self.data
    def getName(self):
        return self.name

class ObjectMerge:
    def __init__(self, _data, original):
        self.id = _data[0]
        self.name = _data[1].strip()
        self.data = _data[2].replace("'", "\\'").strip()
        self.original = OriginalObject(original)

    def getData(self):
        return self.data

    def dataHasChanged(self):
        data = self.getData()
        origData = self.original.getData()
        return data != origData

    def getSqlUpdateSyntax(self):
        sql = "UPDATE " + fileName + " SET data='" + self.original.getData() + "' WHERE name='" + self.original.getName() + "'"
        return sql

    def update(self):
        data = self.getData()
        origData = self.original.getData()
        if(getObjectFromDatabase({"name": self.original.getName(), "data": self.getData()}) != None):
            syntax = self.getSqlUpdateSyntax()
            cursor.execute(syntax)
            db.commit()
            if(cursor.rowcount == 1):
                return True
        return False

def getObjectFromDatabase(o):
    cursor.execute("SELECT * FROM " + fileName + " WHERE name='" + o["name"] + "'")
    res = cursor.fetchone()
    re = res
    if(re != None):
        return ObjectMerge(res, o)
    return res

def importToDatabase(o):
    sql = getSqlInsertSyntax(o)
    cursor.execute(sql)
    db.commit()
    if(cursor.rowcount == 1):
        return True
    return False


def importChanges(o):
    res = getObjectFromDatabase(o)
    if(res == None):
        if(importToDatabase(o)):
            print(o["name"] + " inserted")
            return True
        else:
            print(o["name"] + " was not inserted")
        return False
    if(res.dataHasChanged()):
        print(o["name"] + " has changed")
        up = res.update()
        if(up):
            print(o["name"] + " has been updated")
            return True
        else:
            print(o["name"] + " was not updated")
    return False

def run():
    objects = getObjects()
    for o in objects:
        imported = importChanges(o)
        if(type(imported) is mysql.connector.errors.ProgrammingError):
            print("Sql syntax error in the following query: ")
            print(getSqlSyntax(o))
            return

if(len(sys.argv) > 1):
    conf = getEnvConfiguration()
    db = mysql.connector.connect(
        host = conf["SQL_HOST"],
        user = conf["SQL_USER"],
        password = conf["SQL_PASSWORD"],
        database = conf["SQL_DATABASE"]
    )
    cursor = None
    fileName = sys.argv[1]
    if(db.is_connected):
        cursor = db.cursor()
        run()
else:
    print("File name was missing")

