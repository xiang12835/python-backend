#encoding = utf-8
import os, sys

sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../')))
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../../')))
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../../../')))
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../../../../')))
sys.path.append(os.path.abspath(os.path.join(os.path.abspath(__file__), '../../../../../')))

from django.core.management import setup_environ
import settings

setup_environ(settings)

import time, datetime
from mongoengine import *
from mongoengine.document import Document, EmbeddedDocument
from ..models import MSortSetField
from mongo import User
from ..queue import Client
from ...wi_cache.func import func_cache, expire_func_cache
from ..pager import redis_pager

class LeaderBoard(Document):
	Cate_Slot = {"total": 1, "friend": 2, "around": 3}
	Time_Slot = {"day": 1, "week": 2, "month": 3, "total": 4}

	game = StringField()
	game.description = "game id"

	category = IntField(required=True)
	category.description = "rank category"

	slot = IntField(required=True)
	slot.description = "time slot"

	users = MSortSetField("User", name="user_rank", limit=20000)
	users.description = "user score rank"

	client = Client()
	client.description = "client event dispatcher"

	@classmethod
	def get_rank(klass, game, category, slot):
		#defautl slot is day
		slot = klass.Time_Slot.get(slot) or klass.Time_Slot["day"]
		category = klass.Cate_Slot.get(category) or klass.Cate_Slot["total"]
		return klass.objects.get_or_create(game=game, category=category, slot=slot)

	@classmethod
	def count(klass, rank):
		return klass.users.zcard(rank) or 0

	@classmethod
	def rank(klass, rank, user):
		return klass.users.zrevrank(rank, user.id) or klass.users.limit + 1

	@classmethod
	def set_score(klass, game, category, user, score, iexcept="day"):
		""" recursion by day,week ... background to run """
		for k in LeaderBoard.Time_Slot.iterkeys():
			if k != iexcept:
				klass.set(game, category, k, user, score)

	@classmethod
	def set(klass, game, category, slot, user, score):
		""" set rank and return rank """
		rank, created = klass.get_rank(game, category, slot)
		#add to rank list,save_high_score = true
		klass.users.zadd(rank, user, score=score, save_high_score=True)
		#send to background to deal
		klass.client.dispatch("leaderboard.update",
				{"user": str(user.id), "game": game, "category": category, "score": score})
		return rank

	@classmethod
	@func_cache("rank", 180)
	def lists(klass, game, category, slot, page=1, page_size=25):
		""" get rank list by panigate """
		page_context = {}
		page_context = {"page": page, "page_size": page_size}

		page = int(page)
		page_size = int(page_size)
		start = (page - 1) * page_size
		end = start + page_size - 1

		rank, created = klass.get_rank(game, category, slot)
		return redis_pager(rank,klass.users,start,end,withscores=True,only_ids=False)


	@classmethod
	def clear(klass, game, category, slot):
		""" clear rank by interval (day,week,...) """
		rank, created = klass.get_rank(game, category, slot)
		klass.users.delete(rank)
		rank.delete()
		expire_func_cache("rank", game, category, slot, page=1, page_size=25)


if __name__ == "__main__":
	connect('test')
	LeaderBoard.objects.delete()
	LeaderBoard.users.redis.flushdb()
	#ScoreBase.objects.delete()
	User.objects.delete()

	users = []
	game = "1"
	start_time = time.time()
	test_count = 1000
	for i in xrange(test_count):
		user = User()
		user.username = "edison_%s" % i
		user.save()
		users.append(user)
		rank = LeaderBoard.set(game, "total", "day", user, score=i)
		#rank = LeaderBoard.set_score(game, "total", user, score=i)
		r = LeaderBoard.rank(rank, user)
		#print "user %s rank %s " % (user.username, r )

		#reset to test only save_high_score
	#    for i in xrange(len(users)):
	#        user = users[i]
	#        rank = LeaderBoard.set(game, "total", "day", user, score=i)
	#        r = LeaderBoard.rank(rank, user)

	use = time.time() - start_time
	per = float(use) / test_count
	print "save %s rank use: %.3f per: %.4f process per/sec: %.3f" % (test_count, use, per, 1000.0 / (per * 1000))
	print " * " * 20

	start_time = time.time()
	data = LeaderBoard.lists(game, "total", "day", page=1, page_size=25)
	#for d in data:
	#    print d.username, d.rd_score
	print "get rank list from db use: %s " % (time.time() - start_time)

	start_time = time.time()
	data = LeaderBoard.lists(game, "total", "day", page=1, page_size=25)
	use = time.time() - start_time
	print "get rank list from cache use: %s " % (use)

	#clear data
	LeaderBoard.clear(game, "total", "day")
