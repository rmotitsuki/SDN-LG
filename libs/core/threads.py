"""
    Threading Classes and Methods
"""


import threading
import time

exitFlag = 0

class myThread(threading.Thread):
    def __init__(self, threadID, name, counter):
        threading.Thread.__init__(self)
        self.threadID = threadID
        self.name = name
        self.counter = counter

    def run(self):
        print "Starting " + self.name
        print_time(self.name, self.counter, 5)
        print "Exiting " + self.name

def print_time(threadName, delay, counter):
    while True:
        print "%s: %s" % (threadName, time.ctime())
        time.sleep(delay)

    threadName.exit()



thread1 = myThread(1, "Jab-1", 1)
thread2 = myThread(2, "Jab-2", 2)

thread1.start()
thread2.start()

print "Exiting Main thread"
