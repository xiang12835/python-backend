# coding=utf-8

import sys
import os
import django

PROJECT_ROOT = os.path.realpath(os.path.dirname(__file__))
sys.path.insert(0, os.path.join(PROJECT_ROOT, os.pardir))
sys.path.insert(0, os.path.join(PROJECT_ROOT, os.pardir, os.pardir))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'base.settings')
django.setup()


from base.common.django_db import SqlExecute


def run():
    sql = """
    select * from user_user;
    """

    users = SqlExecute.fetch_all(sql, db="default")

    print(users)

if __name__ == '__main__':
    run()


