import sqlite3

conn = sqlite3.connect('kwu-lecture-database-v3.db')
cursor = conn.cursor()

cursor.execute('''
DROP TABLE user
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS user (
    user_id TEXT PRIMARY KEY,
    userHakbun INTEGER,
    userIsForeign boolen,
    userBunban TEXT,
    userYear TEXT,
    userMajor TEXT,
    userIsMultipleMajor boolen,
    userWhatMultipleMajor TEXT,
    userTakenLecture TEXT
)
''')

conn.commit()
conn.close()