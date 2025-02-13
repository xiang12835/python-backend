#encoding = utf-8
import os, sys

sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../')))
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../../')))
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../../../')))
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../../../../')))
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../../../../../')))

import time, datetime
from mongoengine import *
from mongoengine.document import Document, EmbeddedDocument
from mongoengine.queryset import  QuerySetManager
from ..models import MSortSetField
from ..queue import Client

class TestUser(Document):
	username = StringField(max_length=14, required=True)
	gender = StringField(default='M', max_length=1)

	follower = MSortSetField("User", name="follower")
	follower.descrpition = "my follower friends"

	followee = MSortSetField("User", name="followee")
	followee.description = "follow me firends"

	client = Client()
	client.description = "client event dispatcher"

	def follow(self, user):
		if not self.is_follower(user):
			User.followee.zadd(user, self, score=time.time())
			User.follower.zadd(self, user, score=time.time())
			#send to background
			User.client.dispatch("follow.friend", {"user": str(self.id), "follower": str(user.id)})

	def unfollow(self, user):
		if self.is_follower(user):
			User.follower.zrem(self, user)
			User.followee.zrem(user, self)

	def is_follower(self, user):
		return User.follower.zscore(self, user) != None

	def is_followee(self, user):
		return User.followee.zscore(user, self) != None

	def followers(self):
		return User.follower.zrevrange(self, 0, 100)

	def followees(self):
		return User.followee.zrevrange(self, 0, 100)


if __name__ == "__main__":
	connect('test')
	User.objects.delete()

	edison = User()
	edison.username = "edison"
	edison.save()

	jason = User()
	jason.username = "jason"
	jason.save()

	mike = User()
	mike.username = "23mike"
	mike.save()

	#print "edison follow jason"
	edison.follow(jason)
	time.sleep(1)

	edison.follow(mike)
	time.sleep(1)
	#print "jason follow edison"
	jason.follow(edison)

	print " * " * 30
	print "edison's followees"
	for f in edison.followees():
		print f.username, f.id

	print " * " * 30
	print "edison's followers"
	for f in edison.followers():
		print f.username, f.id

	assert True == edison.is_follower(mike)
	edison.unfollow(mike)
	assert False == edison.is_follower(mike)
    

    
