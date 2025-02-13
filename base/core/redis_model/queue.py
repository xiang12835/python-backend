#encoding = utf-8
import sys, os
import time
#import cjson
from .redis_client import RQueueClient
import json
import sys, traceback
import logging


class RedisQueue(object):
    """ Redis Message Queue """

    redis = RQueueClient.getInstance().redis

    def __init__(self, key):
        """ Need Message Queue """
        self.key = key


    def push(self, value):
        """push into message queue"""
        RedisQueue.redis.lpush(self.key, value)

    def pop(self):
        """ form redis pop key and get value """
        return RedisQueue.redis.rpop(self.key)

    def block_pop(self):
        """ form redis pop key and get value """
        return RedisQueue.redis.brpop(self.key, 60 * 5)


class Client(object):
    def __init__(self):
        self.mq = RedisQueue("")
        self.description = ""

    def dispatch(self, task_name, data):
        try:
            self.mq.key = task_name
            send_data = json.dumps(data)
            return self.mq.push(send_data)
        except Exception,e:
           logging.error(e)


class Worker(object):
    def __init__(self, task_name, time_sleep=2,support_brpop=True):
        self.run = False
        self.task = []
        self.support_brpop = support_brpop
        self.mq = RedisQueue(task_name)
        self.time_sleep = time_sleep

    def register(self, func):
        self.task.append(func)

    def start(self):
        if not self.task:
            raise "please set task"

        self.run = True
        while self.run:
            for task in self.task:
                try:
                    if self.support_brpop:
                        data = self.mq.block_pop()
                    else:
                        #print "sleep" ,self.time_sleep
                        time.sleep(self.time_sleep)
                        data = self.mq.pop()
                        #print "pop",data

                    if data != None:
                        if self.support_brpop:
                            data = json.loads(data[1])
                            task.__call__(data)
                        else:
                            data = json.loads(data)
                            task.__call__(data)

                except Exception, e:
                    print "exception", " * " * 10
                    print e
                    exc_type, exc_value, exc_traceback = sys.exc_info()
                    print traceback.format_tb(exc_traceback)
                    #time.sleep(self.time_sleep)

    def stop(self):
        self.run = False


if __name__ == "__main__":
    """ usage """
    r = RedisQueue("background.work")
    r.push("yes")
    assert r.pop() == "yes"
    assert r.pop() == None

    