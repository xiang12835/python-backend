# coding=utf-8

from django.db import connections


def my_custom_stat_sql(sql):
    cursor = connections["statistic"].cursor()
    cursor.execute(sql)
    rows = cursor.fetchall()
    cursor.close()
    return rows


def my_custom_sql_all(sql, db="cms_slave"):
    cursor = connections[db].cursor()
    cursor.execute(sql)
    rows = cursor.fetchall()
    cursor.close()
    return rows


def my_custom_sql_one(sql, db="cms_slave"):
    cursor = connections[db].cursor()
    cursor.execute(sql)
    rows = cursor.fetchone()
    cursor.close()
    return rows


class SqlExecute(object):

    @classmethod
    def fetch_all(cls, sql, db="default"):
        cursor = connections[db].cursor()
        cursor.execute(sql)
        rows = cursor.fetchall()
        cursor.close()
        return rows

    @classmethod
    def fetch_one(cls, sql, db="default"):
        cursor = connections[db].cursor()
        cursor.execute(sql)
        row = cursor.fetchone()
        cursor.close()
        return row

    @classmethod
    def execute_many(cls, sql, params, db="default"):
        cursor = connections[db].cursor()
        cursor.executemany(sql, params)
        cursor.close()
