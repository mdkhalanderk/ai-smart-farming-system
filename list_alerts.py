import sqlite3

conn = sqlite3.connect('backend/farmer_auth.db')
conn.row_factory = sqlite3.Row
for r in conn.execute('SELECT id, author_name, title, description, crop_name, disease_name, district, taluk FROM community_alerts').fetchall():
    print(dict(r))
