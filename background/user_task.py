# coding=utf-8

import sys
import os
import django

PROJECT_ROOT = os.path.realpath(os.path.dirname(__file__))
sys.path.insert(0, os.path.join(PROJECT_ROOT, os.pardir))
sys.path.insert(0, os.path.join(PROJECT_ROOT, os.pardir, os.pardir))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'base.settings')
django.setup()


from user.models import User


def run():
    user = User.objects.get(name='shane')
    print(user.age)


if __name__ == '__main__':
    run()
