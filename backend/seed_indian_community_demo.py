"""
seed_indian_community_demo.py

Populates rich, realistic Indian farmer accounts, district biosecurity alerts,
and interactive farmer-to-farmer chat conversations for Krishi Drishti demo.
"""

import sqlite3
import hashlib
import uuid
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "farmer_auth.db"

def get_hash(password: str, salt: str) -> str:
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def seed_demo_community():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()

    print(f"Connecting to {DB_PATH}...")

    # Candidate target user IDs for current logged-in user
    target_user_ids = [
        "62bb0f5f75c9a99e0e9121d059a18db1",  # mohammed (Davangere)
        "dd718efd155b63227a92ea534eb8cb0c",  # md (Chitradurga)
        "96bf32539e596c588b0af30255b714d1",  # sachin (Belagavi)
        "f94c3844b0b23b2f6cdf5c2bb66de6b2",  # Review Farmer (Davangere)
        "ffe081ef782292fe3a1e1e5c29acb05b",  # Ramesh Patel (Kolar)
    ]

    # Verify which user profiles exist
    existing_profiles = {}
    for uid in target_user_ids:
        p = cursor.execute("SELECT * FROM profiles WHERE user_id = ?", (uid,)).fetchone()
        if p:
            existing_profiles[uid] = dict(p)

    print(f"Found {len(existing_profiles)} existing user profiles to link conversations with.")

    # 1. Define Indian Farmers
    FARMERS = [
        {
            "id": "farmer_suresh_belagavi",
            "name": "Suresh Patil",
            "email": "suresh.patil@kisan.in",
            "mobile": "9480112233",
            "district": "Belagavi",
            "taluk": "Athani",
            "village": "Kagwad",
            "main_crop": "Sugarcane",
            "lang": "English",
            "land": "4.5 Acres",
            "type": "Organic & Drip"
        },
        {
            "id": "farmer_basavaraj_mandya",
            "name": "Basavaraj Gowda",
            "email": "basavaraj.gowda@kisan.in",
            "mobile": "9480223344",
            "district": "Mandya",
            "taluk": "Maddur",
            "village": "Koppa",
            "main_crop": "Rice / Paddy",
            "lang": "Kannada",
            "land": "3.0 Acres",
            "type": "Canal Irrigated"
        },
        {
            "id": "farmer_anand_dharwad",
            "name": "Anand Kulkarni",
            "email": "anand.kulkarni@kisan.in",
            "mobile": "9480334455",
            "district": "Dharwad",
            "taluk": "Hubballi",
            "village": "Navalgund",
            "main_crop": "Cotton",
            "lang": "English",
            "land": "5.0 Acres",
            "type": "Black Soil Integrated"
        },
        {
            "id": "farmer_manjunath_shivamogga",
            "name": "Manjunath Naik",
            "email": "manjunath.naik@kisan.in",
            "mobile": "9480445566",
            "district": "Shivamogga",
            "taluk": "Thirthahalli",
            "village": "Agumbe Road",
            "main_crop": "Arecanut",
            "lang": "Kannada",
            "land": "6.0 Acres",
            "type": "High Rainfall Plantation"
        },
        {
            "id": "farmer_shivanand_vijayapura",
            "name": "Shivanand Biradar",
            "email": "shivanand.biradar@kisan.in",
            "mobile": "9480556677",
            "district": "Vijayapura",
            "taluk": "Indi",
            "village": "Chadchan",
            "main_crop": "Onion",
            "lang": "English",
            "land": "2.5 Acres",
            "type": "Borewell Drip"
        },
        {
            "id": "farmer_ravi_kolar",
            "name": "Ravi Kumar",
            "email": "ravi.kumar@kisan.in",
            "mobile": "9480667788",
            "district": "Kolar",
            "taluk": "Srinivaspur",
            "village": "Gownipalli",
            "main_crop": "Tomato",
            "lang": "English",
            "land": "2.0 Acres",
            "type": "Mulched Trellis"
        }
    ]

    # Insert Users & Profiles
    for f in FARMERS:
        salt = uuid.uuid4().hex[:16]
        pw_hash = get_hash("Kisan@1234", salt)
        created_at = (now - timedelta(days=12)).isoformat()

        cursor.execute("""
            INSERT OR REPLACE INTO users (id, email, password_hash, salt, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (f["id"], f["email"], pw_hash, salt, created_at))

        prof_id = f"prof_{f['id']}"
        cursor.execute("""
            INSERT OR REPLACE INTO profiles (
                id, user_id, full_name, phone, mobile_number, district, state,
                primary_crops, main_crop, preferred_language, taluk, village,
                land_size, farming_type, experience_years, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'Karnataka', ?, ?, ?, ?, ?, ?, ?, 8, ?)
        """, (
            prof_id, f["id"], f["name"], f["mobile"], f["mobile"], f["district"],
            f["main_crop"], f["main_crop"], f["lang"], f["taluk"], f["village"],
            f["land"], f["type"], now_iso
        ))

    print(f"Created {len(FARMERS)} Indian farmer profiles in database.")

    # 2. Insert Diverse Community Outbreak Alerts
    ALERTS = [
        {
            "id": "alert_suresh_sugarcane",
            "farmer_id": "farmer_suresh_belagavi",
            "author_name": "Suresh Patil",
            "title": "Red Rot fungal attack appearing on 8-month sugarcane stalks",
            "crop_name": "Sugarcane",
            "disease_name": "Red Rot",
            "district": "Belagavi",
            "taluk": "Athani",
            "village": "Kagwad",
            "danger_level": "Critical",
            "photo_url": None,
            "upvotes": 14,
            "days_ago": 1,
            "description": "Third and fourth leaves from top are showing premature yellowing and withering. When the cane stalk is split open, the internal pith exhibits deep red discoloration with distinctive white horizontal cross-bands. Growers using canal water are advised to isolate trenches so irrigation does not wash fungal spores to healthy plots."
        },
        {
            "id": "alert_basavaraj_paddy",
            "farmer_id": "farmer_basavaraj_mandya",
            "author_name": "Basavaraj Gowda",
            "title": "Bacterial Leaf Blight spreading rapidly after continuous rains",
            "crop_name": "Rice / Paddy",
            "disease_name": "Bacterial Leaf Blight",
            "district": "Mandya",
            "taluk": "Maddur",
            "village": "Koppa",
            "danger_level": "High",
            "photo_url": None,
            "upvotes": 19,
            "days_ago": 2,
            "description": "After 4 days of cloudy weather and monsoon drizzle, water-soaked yellow lesions appeared on leaf margins and tips. Leaves are rapidly drying up with straw-white bleached appearance. Immediately halt nitrogen/urea applications; apply potash and spray Copper Oxychloride (500g) + Streptocycline (6g per acre) during morning break."
        },
        {
            "id": "alert_anand_cotton",
            "farmer_id": "farmer_anand_dharwad",
            "author_name": "Anand Kulkarni",
            "title": "Spotted bollworm infestation noticed in early flowering squares",
            "crop_name": "Cotton",
            "disease_name": "Spotted Bollworm",
            "district": "Dharwad",
            "taluk": "Hubballi",
            "village": "Navalgund",
            "danger_level": "High",
            "photo_url": None,
            "upvotes": 11,
            "days_ago": 3,
            "description": "Early flowering cotton squares are showing flared bracts and falling prematurely to the ground. Larvae bore circular entry holes into young bolls with brown frass around openings. Install 5 pheromone traps per acre and apply 5% Neem seed kernel extract (NSKE) as bio-deterrent."
        },
        {
            "id": "alert_manjunath_arecanut",
            "farmer_id": "farmer_manjunath_shivamogga",
            "author_name": "Manjunath Naik",
            "title": "Mahali fruit rot causing massive nut shedding during cloudy drizzle",
            "crop_name": "Arecanut",
            "disease_name": "Koleroga / Mahali",
            "district": "Shivamogga",
            "taluk": "Thirthahalli",
            "village": "Agumbe Road",
            "danger_level": "Critical",
            "photo_url": None,
            "upvotes": 27,
            "days_ago": 1,
            "description": "Severe Koleroga fruit rot outbreak across Thirthahalli taluk following heavy mist and moisture. Dark green water-soaked spots develop on tender arecanuts, turning brown with white fungal mycelium, followed by heavy nut drop. Immediate prophylactic spraying of 1% Bordeaux mixture with rosin soap sticker is necessary before afternoon rains."
        },
        {
            "id": "alert_shivanand_onion",
            "farmer_id": "farmer_shivanand_vijayapura",
            "author_name": "Shivanand Biradar",
            "title": "Purple blotch drying leaf tips across rabi onion plots",
            "crop_name": "Onion",
            "disease_name": "Purple Blotch",
            "district": "Vijayapura",
            "taluk": "Indi",
            "village": "Chadchan",
            "danger_level": "Medium",
            "photo_url": None,
            "upvotes": 8,
            "days_ago": 4,
            "description": "Sunken purplish-brown elliptical spots with yellow halos appearing on leaves. Affected leaves are bending over and drying from tips. Farmers in Indi and Chadchan should spray Mancozeb 75% WP @ 2.5 grams per litre of water mixed with wetting agent during clear morning hours."
        },
        {
            "id": "alert_ravi_tomato",
            "farmer_id": "farmer_ravi_kolar",
            "author_name": "Ravi Kumar",
            "title": "Early blight target-spots on lower canopy tomato leaves",
            "crop_name": "Tomato",
            "disease_name": "Early Blight",
            "district": "Kolar",
            "taluk": "Srinivaspur",
            "village": "Gownipalli",
            "danger_level": "High",
            "photo_url": None,
            "upvotes": 16,
            "days_ago": 2,
            "description": "Concentric dark brown rings resembling target boards observed on bottom canopy foliage. Disease spreading upwards as canopy density increases. Prune lower diseased foliage touching plastic mulch and apply preventive copper hydroxide spray."
        }
    ]

    for a in ALERTS:
        created_dt = (now - timedelta(days=a["days_ago"], hours=3)).isoformat()
        cursor.execute("""
            INSERT OR REPLACE INTO community_alerts (
                id, farmer_id, author_name, title, description, crop_name,
                disease_name, district, taluk, village, danger_level, photo_url,
                upvotes, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        """, (
            a["id"], a["farmer_id"], a["author_name"], a["title"], a["description"],
            a["crop_name"], a["disease_name"], a["district"], a["taluk"], a["village"],
            a["danger_level"], a["photo_url"], a["upvotes"], created_dt, created_dt
        ))

    print(f"Inserted {len(ALERTS)} community alerts across Karnataka districts.")

    # 3. Create Simple, Understandable Farmer-to-Farmer Chat Conversations
    # We will link these chats to the primary user accounts so that whenever you open Messages, they appear!
    CHAT_SCENARIOS = [
        {
            "partner_id": "farmer_suresh_belagavi",
            "partner_name": "Suresh Patil",
            "partner_crop": "Sugarcane",
            "partner_district": "Belagavi",
            "alert_id": "alert_suresh_sugarcane",
            "alert_title": "Red Rot fungal attack appearing on 8-month sugarcane stalks",
            "minutes_ago": 15,
            "messages": [
                {
                    "sender": "partner",
                    "text": "Namaskara! I saw your post on crop advisory. I am facing a serious issue in my sugarcane plot here in Belagavi."
                },
                {
                    "sender": "user",
                    "text": "Namaskara Suresh. What symptoms are you seeing on your crop?"
                },
                {
                    "sender": "partner",
                    "text": "The top 3rd and 4th leaves are turning pale yellow and drooping. When I split open one cane, the inside pith is red with white patches."
                },
                {
                    "sender": "user",
                    "text": "That is Red Rot disease. You should immediately isolate those affected canes and avoid letting furrow water flow into healthy rows."
                },
                {
                    "sender": "partner",
                    "text": "Yes, exactly! Did you spray any Trichoderma or carbendazim? The local KVK officer told me to drench the root zone."
                },
                {
                    "sender": "user",
                    "text": "Drenching with Trichoderma harzianum works well for root zone. Also make sure to clear dead leaves so sunlight reaches the bottom."
                },
                {
                    "sender": "partner",
                    "text": "Thank you so much brother! I will do this tomorrow morning itself. Let us stay in touch on crop progress."
                }
            ]
        },
        {
            "partner_id": "farmer_basavaraj_mandya",
            "partner_name": "Basavaraj Gowda",
            "partner_crop": "Rice / Paddy",
            "partner_district": "Mandya",
            "alert_id": "alert_basavaraj_paddy",
            "alert_title": "Bacterial Leaf Blight spreading rapidly after monsoon showers",
            "minutes_ago": 45,
            "messages": [
                {
                    "sender": "partner",
                    "text": "Hello friend, I am Basavaraj from Maddur, Mandya. We had 3 days of non-stop drizzle and now paddy leaf tips are turning papery white."
                },
                {
                    "sender": "user",
                    "text": "Hello Basavaraj. Is it starting from leaf tip or margin as wavy stripes?"
                },
                {
                    "sender": "partner",
                    "text": "It starts from leaf margin as wavy yellow stripes, then dries up like bleached straw."
                },
                {
                    "sender": "user",
                    "text": "That is Bacterial Leaf Blight (BLB). Stop nitrogen/urea sprays immediately, as extra nitrogen makes it spread twice as fast."
                },
                {
                    "sender": "partner",
                    "text": "Oh good you warned me! I was about to apply second dose of urea tomorrow. I will hold off."
                },
                {
                    "sender": "user",
                    "text": "Yes, apply potash instead and spray Copper Oxychloride (500g) + Streptocycline (6g per acre) during a clear morning."
                },
                {
                    "sender": "partner",
                    "text": "Understood. Really helpful practical advice. Hope your crop recovers quickly too!"
                }
            ]
        },
        {
            "partner_id": "farmer_shivanand_vijayapura",
            "partner_name": "Shivanand Biradar",
            "partner_crop": "Onion",
            "partner_district": "Vijayapura",
            "alert_id": "alert_shivanand_onion",
            "alert_title": "Purple blotch drying leaf tips across rabi onion plots",
            "minutes_ago": 120,
            "messages": [
                {
                    "sender": "partner",
                    "text": "Ram Ram bhai! Saw your field updates. I have 2.5 acres of onion near Indi taluk. Leaves have small violet spots."
                },
                {
                    "sender": "user",
                    "text": "Ram Ram Shivanand. Small violet spots that turn brown in the middle?"
                },
                {
                    "sender": "partner",
                    "text": "Yes, exactly. The leaf bends over from the spot and snaps. Almost 20% of my plot is showing this after cloudy mornings."
                },
                {
                    "sender": "user",
                    "text": "That is Purple Blotch disease (Alternaria porri). Common when morning humidity stays above 85%."
                },
                {
                    "sender": "partner",
                    "text": "What preventive spray do you recommend? Should I use Mancozeb or Difenoconazole?"
                },
                {
                    "sender": "user",
                    "text": "Mancozeb 2.5g per litre of water mixed with sticker/spreader gives good coverage. Spray early morning before the sun gets too sharp."
                },
                {
                    "sender": "partner",
                    "text": "Great! I have Mancozeb in stock. Will spray right away tomorrow. Thank you!"
                }
            ]
        },
        {
            "partner_id": "farmer_anand_dharwad",
            "partner_name": "Anand Kulkarni",
            "partner_crop": "Cotton",
            "partner_district": "Dharwad",
            "alert_id": "alert_anand_cotton",
            "alert_title": "Spotted bollworm infestation noticed in early flowering squares",
            "minutes_ago": 240,
            "messages": [
                {
                    "sender": "partner",
                    "text": "Namaskara! In Hubballi we have cloudy skies and bollworms damaging cotton squares. How is the weather on your side?"
                },
                {
                    "sender": "user",
                    "text": "Cloudy dew here too. Did you inspect the squares and bolls?"
                },
                {
                    "sender": "partner",
                    "text": "Yes, larvae are boring into squares and flowers are flaring open and dropping on ground."
                },
                {
                    "sender": "user",
                    "text": "Install yellow and blue sticky traps, and put 5 pheromone traps per acre to catch the adult moths before they lay eggs."
                },
                {
                    "sender": "partner",
                    "text": "Installed 3 traps already, caught 12 moths last night! Will add Neem oil spray (1500 ppm) too."
                }
            ]
        }
    ]

    # Insert conversations for each candidate user account so user sees them regardless of which test login they use
    # Also include the guest farmer id farmer_1793803626
    all_target_uids = list(existing_profiles.keys())
    if not all_target_uids:
        all_target_uids = ["62bb0f5f75c9a99e0e9121d059a18db1"]
    all_target_uids.append("farmer_1793803626")

    total_convs_created = 0
    total_messages_created = 0

    for my_uid in all_target_uids:
        user_prof = existing_profiles.get(my_uid, {"full_name": "Mohammed (Farmer)"})
        my_name = user_prof.get("full_name") or "Farmer"

        for sc in CHAT_SCENARIOS:
            conv_id = f"conv_{sc['partner_id'][:12]}_{my_uid[:12]}"
            last_msg_text = sc["messages"][-1]["text"]
            last_msg_time = (now - timedelta(minutes=sc["minutes_ago"])).isoformat()

            cursor.execute("""
                INSERT OR REPLACE INTO conversations (
                    id, alert_id, creator_id, participant_id, creator_name,
                    participant_name, last_message, last_message_at, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                conv_id,
                sc["alert_id"],
                sc["partner_id"],
                my_uid,
                sc["partner_name"],
                my_name,
                last_msg_text,
                last_msg_time,
                (now - timedelta(days=2)).isoformat(),
                last_msg_time
            ))
            total_convs_created += 1

            # Insert messages
            base_time = now - timedelta(minutes=sc["minutes_ago"] + (len(sc["messages"]) * 8))
            for i, m in enumerate(sc["messages"]):
                msg_time = (base_time + timedelta(minutes=i * 6)).isoformat()
                sender_id = sc["partner_id"] if m["sender"] == "partner" else my_uid
                sender_name = sc["partner_name"] if m["sender"] == "partner" else my_name
                is_read = 1 if (i < len(sc["messages"]) - 1 or m["sender"] == "user") else 0
                msg_id = f"msg_{conv_id}_{i}"

                cursor.execute("""
                    INSERT OR REPLACE INTO messages (
                        id, conversation_id, sender_id, sender_name, message_text,
                        photo_url, is_read, created_at
                    ) VALUES (?, ?, ?, ?, ?, NULL, ?, ?)
                """, (
                    msg_id, conv_id, sender_id, sender_name, m["text"], is_read, msg_time
                ))
                total_messages_created += 1

            # Insert a notification for user
            notif_id = f"notif_chat_{conv_id}"
            cursor.execute("""
                INSERT OR REPLACE INTO notifications (
                    id, user_id, type, title, message, alert_id, conversation_id,
                    danger_level, is_read, created_at
                ) VALUES (?, ?, 'message', ?, ?, ?, ?, 'Medium', 0, ?)
            """, (
                notif_id,
                my_uid,
                f"New Message from {sc['partner_name']}",
                last_msg_text,
                sc["alert_id"],
                conv_id,
                last_msg_time
            ))

    conn.commit()
    conn.close()

    print(f"\n=======================================================")
    print(f"SUCCESS: Seeded Demo Indian Community Data!")
    print(f" - {len(FARMERS)} Indian Farmers Created (Belagavi, Mandya, Dharwad, Shivamogga, Vijayapura, Kolar)")
    print(f" - {len(ALERTS)} Regional Biosecurity Outbreak Alerts Created")
    print(f" - {total_convs_created} Farmer-to-Farmer Conversations Populated")
    print(f" - {total_messages_created} Understandable Chat Messages Inserted")
    print(f"=======================================================\n")

if __name__ == "__main__":
    seed_demo_community()
