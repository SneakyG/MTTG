from googleapiclient.discovery import build
YOUTUBE_API_KEY = 'AIzaSyA3I16KgzuWlwfFitKHjDr1lPDAGjApcH0'
YOUTUBE_CHANNEL_ID = 'UCfepAjChNXWDE1KUl8yQPYw'

youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
res = youtube.playlists().list(part="snippet,status", channelId=YOUTUBE_CHANNEL_ID, maxResults=10).execute()

print("--> Số playlist tìm thấy:", len(res.get('items', [])))
for item in res.get('items', []):
    print(f"- Title: {item['snippet']['title']} | Privacy: {item.get('status', {}).get('privacyStatus')}")