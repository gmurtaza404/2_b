import requests 


data = {'script_name':'test.py', 
        'script_binary': open("test.py", "rb").read(), 
        'args':[]
        }


r = requests.post(url = "http://localhost:10001/job", data=data)  

print r
