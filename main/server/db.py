import sqlite3

DATABASE = './kwu-lecture-recommendation-v5.db'


def db_connect():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn
