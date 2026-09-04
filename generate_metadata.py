import os
import json
import re
from datetime import datetime
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request

SERVICE_ACCOUNT_FILE = 'credentials.json'
YOUTUBE_API_KEY = 'AIzaSyA3I16KgzuWlwfFitKHjDr1lPDAGjApcH0'
DRIVE_ROOT_FOLDER_ID = '1dC4RXmRQmRWOjhpbmy0E6TPe7-s-tg5P'
SCOPES = ['https://www.googleapis.com/auth/youtube.readonly']

STAGES = [
    {"key": "1_tim_hieu", "label": "Tìm hiểu", "unlocked": True},
    {"key": "2_nguoi_yeu", "label": "Người yêu", "unlocked": True},
    {"key": "3_dinh_hon", "label": "Đính hôn", "unlocked": False},
    {"key": "4_ket_hon", "label": "Kết hôn", "unlocked": False}
]

STAGE_MAP = {
    "tim_hieu": "1_tim_hieu", "1_tim_hieu": "1_tim_hieu",
    "nguoi_yeu": "2_nguoi_yeu", "2_nguoi_yeu": "2_nguoi_yeu",
    "dinh_hon": "3_dinh_hon", "3_dinh_hon": "3_dinh_hon",
    "ket_hon": "4_ket_hon", "4_ket_hon": "4_ket_hon"
}

import os
import json
import re
from datetime import datetime
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials

SERVICE_ACCOUNT_FILE = 'credentials.json'
YOUTUBE_API_KEY = 'AIzaSyA3I16KgzuWlwfFitKHjDr1lPDAGjApcH0'
DRIVE_ROOT_FOLDER_ID = '1dC4RXmRQmRWOjhpbmy0E6TPe7-s-tg5P'
YOUTUBE_CHANNEL_ID = 'UCfepAjChNXWDE1KUl8yQPYw'

STAGES = [
    {"key": "1_tim_hieu", "label": "Tìm hiểu", "unlocked": True},
    {"key": "2_nguoi_yeu", "label": "Người yêu", "unlocked": True},
    {"key": "3_dinh_hon", "label": "Đính hôn", "unlocked": False},
    {"key": "4_ket_hon", "label": "Kết hôn", "unlocked": False}
]

STAGE_MAP = {
    "tim_hieu": "1_tim_hieu", "1_tim_hieu": "1_tim_hieu",
    "nguoi_yeu": "2_nguoi_yeu", "2_nguoi_yeu": "2_nguoi_yeu",
    "dinh_hon": "3_dinh_hon", "3_dinh_hon": "3_dinh_hon",
    "ket_hon": "4_ket_hon", "4_ket_hon": "4_ket_hon"
}

def format_date_str(date_str):
    clean_date = re.sub(r'[-_.\s]', '', str(date_str)).strip()
    if len(clean_date) == 8 and clean_date.isdigit():
        dt = datetime.strptime(clean_date, "%Y%m%d")
        return dt.strftime("%Y-%m-%d"), dt.strftime("%d/%m/%Y")
    return date_str, date_str

def fetch_drive_images():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"❌ Không tìm thấy file {SERVICE_ACCOUNT_FILE}")
        return []

    creds = Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, 
        scopes=['https://www.googleapis.com/auth/drive.readonly']
    )
    drive_service = build('drive', 'v3', credentials=creds)
    images_list = []

    try:
        # 1. Lấy các thư mục trong MTTG
        stage_folders = drive_service.files().list(
            q=f"'{DRIVE_ROOT_FOLDER_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
            fields="files(id, name)"
        ).execute().get('files', [])

        for s_folder in stage_folders:
            s_name = s_folder['name'].strip().lower()
            
            # Bỏ qua thư mục avatar hoặc các thư mục không thuộc stage
            if s_name == 'avatar':
                print(f"  ⏭️ Bỏ qua thư mục: {s_folder['name']}")
                continue

            stage_key = STAGE_MAP.get(s_name, s_folder['name'])
            
            # 2. Lấy các thư mục con bên trong (tìm folder 'images')
            sub_folders = drive_service.files().list(
                q=f"'{s_folder['id']}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
                fields="files(id, name)"
            ).execute().get('files', [])

            images_folder_id = None
            for sub in sub_folders:
                if sub['name'].strip().lower() == 'images':
                    images_folder_id = sub['id']
                    break

            # Nếu không có folder 'images', dùng trực tiếp folder stage
            target_parent_id = images_folder_id if images_folder_id else s_folder['id']

            # 3. Lấy các folder ngày yyyymmdd bên trong folder 'images'
            date_folders = drive_service.files().list(
                q=f"'{target_parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
                fields="files(id, name)"
            ).execute().get('files', [])

            for d_folder in date_folders:
                iso_date, display_date = format_date_str(d_folder['name'])

                # 4. Lấy tất cả tệp ảnh trong folder yyyymmdd
                files = drive_service.files().list(
                    q=f"'{d_folder['id']}' in parents and mimeType contains 'image/' and trashed = false",
                    fields="files(id, name, description)"
                ).execute().get('files', [])

                for f in files:
                    images_list.append({
                        "type": "image",
                        "stage": stage_key,
                        "date": iso_date,
                        "display_date": display_date,
                        "drive_id": f['id'],
                        "caption": f.get('description') or f['name'].rsplit('.', 1)[0]
                    })
    except Exception as e:
        print(f"❌ Lỗi Drive API: {e}")

    return images_list

def get_youtube_service():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('client_secret.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())
    return build('youtube', 'v3', credentials=creds)

def fetch_youtube_videos():
    try:
        # Thay vì dùng API Key, dùng service xác thực chính chủ
        youtube = get_youtube_service()
        youtube_list = []

        # Lấy TẤT CẢ playlist của chính bạn (mine=True) -> Lấy được cả Unlisted!
        playlists_request = youtube.playlists().list(
            part="snippet",
            mine=True,
            maxResults=50
        )
        playlists_response = playlists_request.execute()
        playlists = playlists_response.get('items', [])
        print(f"  🎬 Tìm thấy {len(playlists)} Playlist (kể cả Unlisted) trên YouTube Channel.")

        for pl in playlists:
            pl_title = pl['snippet']['title'].strip()
            playlist_id = pl['id']

            match = re.search(r'\b(20\d{2}[-_.\s]?\d{2}[-_.\s]?\d{2})\b', pl_title)
            
            if match:
                folder_date = match.group(1)
                iso_date, display_date = format_date_str(folder_date)

                items_request = youtube.playlistItems().list(
                    part="snippet",
                    playlistId=playlist_id,
                    maxResults=50
                )
                items_response = items_request.execute()

                for item in items_response.get('items', []):
                    snippet = item['snippet']
                    youtube_list.append({
                        "type": "youtube",
                        "stage": "2_nguoi_yeu",
                        "date": iso_date,
                        "display_date": display_date,
                        "playlist_id": playlist_id,
                        "youtube_id": snippet['resourceId']['videoId'],
                        "caption": snippet['title']
                    })
    except Exception as e:
        print(f"❌ Lỗi YouTube API: {e}")
        return []

    return youtube_list

def main():
    print("🔄 Đang quét dữ liệu từ Google Drive...")
    drive_media = fetch_drive_images()

    print("🔄 Đang quét dữ liệu từ YouTube...")
    youtube_media = fetch_youtube_videos()

    all_media = drive_media + youtube_media
    all_media.sort(key=lambda x: x.get("date", ""), reverse=True)

    output_data = {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "stages": STAGES,
        "media": all_media
    }

    output_path = os.path.join(os.path.dirname(__file__), "static", "metadata.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Đã tự động quét và tạo metadata.json thành công!")
    print(f"📊 Tổng cộng: {len(drive_media)} Ảnh từ Drive, {len(youtube_media)} Video từ YouTube.")

if __name__ == "__main__":
    main()