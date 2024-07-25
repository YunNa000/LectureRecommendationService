


import sqlite3

conn = sqlite3.connect('kwu-lecture-database-v3.db')
cursor = conn.cursor()

cursor.execute('''
ALTER TABLE user
ADD COLUMN userName TEXT;
''')

conn.commit()
conn.close()