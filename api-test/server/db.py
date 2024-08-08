import sqlite3

DATABASE = './kwu-lecture-database-v8.db'


def db_connect():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


con = db_connect()

q = """
    DELETE FROM user 
    WHERE user_id = '104216379361715837223';
"""

con.execute(q)
con.commit()  # 변경사항을 저장합니다.
con.close()   # 연결을 닫습니다.