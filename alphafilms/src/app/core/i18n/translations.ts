export type Lang = 'sq' | 'en';

export interface Translations {
  /* ── Auth ── */
  auth_title: string;
  auth_subtitle: string;
  auth_sign_in: string;
  auth_google_btn: string;
  auth_signing_in: string;
  auth_feat_sessions: string;
  auth_feat_qr: string;
  auth_feat_live: string;
  auth_disclaimer: string;
  auth_terms: string;
  auth_privacy: string;

  /* ── Navbar ── */
  nav_sessions: string;
  nav_sign_out: string;

  /* ── Dashboard ── */
  dash_title: string;
  dash_session_count_one: string;
  dash_session_count_many: string;
  dash_new_session: string;
  dash_filter_all: string;
  dash_filter_active: string;
  dash_filter_expired: string;
  dash_empty_title: string;
  dash_empty_desc: string;
  dash_create_session: string;

  /* ── Delete modal ── */
  delete_title: string;
  delete_desc: string;
  delete_confirm: string;
  delete_deleting: string;
  cancel: string;

  /* ── Session card ── */
  card_open: string;
  card_expires: string;
  card_status_active: string;
  card_status_expired: string;
  card_status_deleted: string;
  card_photos_one: string;
  card_photos_many: string;

  /* ── Create session ── */
  create_title: string;
  create_subtitle: string;
  create_name_label: string;
  create_name_placeholder: string;
  create_type_label: string;
  create_expires_label: string;
  create_expires_hint: string;
  create_btn: string;
  create_creating: string;
  type_wedding: string;
  type_birthday: string;
  type_corporate: string;
  type_graduation: string;
  type_family: string;
  type_other: string;

  /* ── Session detail ── */
  detail_back: string;
  detail_copy: string;
  detail_copied: string;
  detail_qr_title: string;
  detail_qr_subtitle: string;
  detail_gallery_url: string;
  detail_download_qr: string;
  detail_photos_title: string;
  detail_photos_count: string;
  detail_upload: string;
  detail_no_photos: string;
  detail_no_photos_hint: string;

  /* ── Upload ── */
  upload_title: string;
  upload_subtitle: string;
  upload_drop: string;
  upload_browse: string;
  upload_or: string;
  upload_add_more: string;
  upload_btn: string;
  upload_uploading: string;
  upload_done: string;
  upload_pending: string;

  /* ── Public gallery ── */
  gallery_loading: string;
  gallery_not_found: string;
  gallery_not_found_desc: string;
  gallery_live: string;
  gallery_empty: string;
  gallery_empty_desc: string;
  gallery_powered: string;

  /* ── Instagram gate ── */
  gate_title: string;
  gate_desc: string;
  gate_follow_btn: string;
  gate_confirm_btn: string;
  gate_hint: string;
}

export const sq: Translations = {
  /* ── Auth ── */
  auth_title: 'AlphaFilms',
  auth_subtitle: 'Menaxhimi i seancave fotografike\npër fotografë modernë',
  auth_sign_in: 'Hyr për të vazhduar',
  auth_google_btn: 'Vazhdo me Google',
  auth_signing_in: 'Duke hyrë...',
  auth_feat_sessions: 'Krijo dhe menaxho seancat fotografike',
  auth_feat_qr: 'Gjenero kode QR për ndarje të menjëhershme',
  auth_feat_live: 'Galeria live përditësohet në kohë reale',
  auth_disclaimer: 'Vetëm për fotografë. Duke hyrë pranoni',
  auth_terms: 'Kushtet',
  auth_privacy: 'Privatësinë',

  /* ── Navbar ── */
  nav_sessions: 'Seancat',
  nav_sign_out: 'Dil',

  /* ── Dashboard ── */
  dash_title: 'Seancat',
  dash_session_count_one: '1 seancë gjithsej',
  dash_session_count_many: '{n} seanca gjithsej',
  dash_new_session: 'Seancë e Re',
  dash_filter_all: 'Të gjitha',
  dash_filter_active: 'Aktive',
  dash_filter_expired: 'Të skaduara',
  dash_empty_title: 'Asnjë seancë akoma',
  dash_empty_desc: 'Krijo seancën tuaj të parë fotografike.',
  dash_create_session: 'Krijo Seancë',

  /* ── Delete modal ── */
  delete_title: 'Fshi Seancën?',
  delete_desc: 'Kjo do të fshijë përgjithmonë seancën dhe të gjitha fotot. Ky veprim nuk mund të kthehet.',
  delete_confirm: 'Fshi',
  delete_deleting: 'Duke fshirë...',
  cancel: 'Anulo',

  /* ── Session card ── */
  card_open: 'Hap',
  card_expires: 'Skadon',
  card_status_active: 'aktive',
  card_status_expired: 'e skaduar',
  card_status_deleted: 'e fshirë',
  card_photos_one: '1 foto',
  card_photos_many: '{n} foto',

  /* ── Create session ── */
  create_title: 'Seancë e Re',
  create_subtitle: 'Krijo seancë fotografike dhe gjenero kodin QR',
  create_name_label: 'Emri i Seancës *',
  create_name_placeholder: 'p.sh. Dasma Sara & Arben',
  create_type_label: 'Lloji i Seancës',
  create_expires_label: 'Skadim automatik (opsional)',
  create_expires_hint: 'Seancat fshihen automatikisht pas skadimit',
  create_btn: 'Krijo Seancën',
  create_creating: 'Duke krijuar...',
  type_wedding: 'Dasmë',
  type_birthday: 'Ditëlindje',
  type_corporate: 'Event Korporativ',
  type_graduation: 'Diplomim',
  type_family: 'Seancë Familjare',
  type_other: 'Tjetër',

  /* ── Session detail ── */
  detail_back: 'Të gjitha seancat',
  detail_copy: 'Kopjo Lidhjen',
  detail_copied: 'U kopjua!',
  detail_qr_title: 'Kodi QR',
  detail_qr_subtitle: 'Mysafirët skanojnë këtë për të parë galerinë',
  detail_gallery_url: 'URL e Galerisë',
  detail_download_qr: 'Shkarko QR',
  detail_photos_title: 'Fotot',
  detail_photos_count: 'të ngarkuara',
  detail_upload: 'Ngarko',
  detail_no_photos: 'Asnjë foto akoma',
  detail_no_photos_hint: 'Ngarkoni foto për t\'i ndarë me mysafirët',

  /* ── Upload ── */
  upload_title: 'Ngarko Foto',
  upload_subtitle: 'JPG, PNG, WebP — max 25MB secila',
  upload_drop: 'Hidhni fotot këtu',
  upload_browse: 'shfletoni skedarët',
  upload_or: 'ose',
  upload_add_more: 'Shto Më Shumë',
  upload_btn: 'Ngarko {n} Foto',
  upload_uploading: 'Duke ngarkuar...',
  upload_done: 'Përfunduar',
  upload_pending: 'Në pritje',

  /* ── Public gallery ── */
  gallery_loading: 'Duke ngarkuar galerinë...',
  gallery_not_found: 'Seanca nuk u gjet',
  gallery_not_found_desc: 'Ky link mund të ketë skaduar ose të jetë fshirë.',
  gallery_live: 'Live — duke u përditësuar në kohë reale',
  gallery_empty: 'Fotot vijnë së shpejti',
  gallery_empty_desc: 'Fotografi po përgatit gjithçka.',
  gallery_powered: 'Powered by',

  /* ── Instagram gate ── */
  gate_title: 'Një hap i shpejtë',
  gate_desc: 'Ndiq AlphaFilms në Instagram për të hapur këtë galeri. Zgjat 5 sekonda dhe ndihmon fotografin!',
  gate_follow_btn: 'Ndiq @{handle}',
  gate_confirm_btn: 'Ndoqa — hap galerinë',
  gate_hint: 'Pasi të ndiqni, do të shfaqet butoni i konfirmimit',
};

export const en: Translations = {
  /* ── Auth ── */
  auth_title: 'AlphaFilms',
  auth_subtitle: 'Photography session management\nfor modern photographers',
  auth_sign_in: 'Sign in to continue',
  auth_google_btn: 'Continue with Google',
  auth_signing_in: 'Signing in...',
  auth_feat_sessions: 'Create & manage photo sessions',
  auth_feat_qr: 'Generate QR codes for instant sharing',
  auth_feat_live: 'Live gallery updates in real time',
  auth_disclaimer: 'For photographers only. By signing in you agree to our',
  auth_terms: 'Terms',
  auth_privacy: 'Privacy Policy',

  /* ── Navbar ── */
  nav_sessions: 'Sessions',
  nav_sign_out: 'Sign out',

  /* ── Dashboard ── */
  dash_title: 'Sessions',
  dash_session_count_one: '1 session total',
  dash_session_count_many: '{n} sessions total',
  dash_new_session: 'New Session',
  dash_filter_all: 'All',
  dash_filter_active: 'Active',
  dash_filter_expired: 'Expired',
  dash_empty_title: 'No sessions yet',
  dash_empty_desc: 'Create your first photo session to get started.',
  dash_create_session: 'Create Session',

  /* ── Delete modal ── */
  delete_title: 'Delete Session?',
  delete_desc: 'This will permanently delete the session and all its photos. This action cannot be undone.',
  delete_confirm: 'Delete',
  delete_deleting: 'Deleting...',
  cancel: 'Cancel',

  /* ── Session card ── */
  card_open: 'Open',
  card_expires: 'Expires',
  card_status_active: 'active',
  card_status_expired: 'expired',
  card_status_deleted: 'deleted',
  card_photos_one: '1 photo',
  card_photos_many: '{n} photos',

  /* ── Create session ── */
  create_title: 'New Session',
  create_subtitle: 'Create a photography session and generate a QR code',
  create_name_label: 'Session Name *',
  create_name_placeholder: 'e.g. Wedding Sara & Arben',
  create_type_label: 'Session Type',
  create_expires_label: 'Auto-expire (optional)',
  create_expires_hint: 'Sessions are automatically cleaned up after expiry',
  create_btn: 'Create Session',
  create_creating: 'Creating...',
  type_wedding: 'Wedding',
  type_birthday: 'Birthday',
  type_corporate: 'Corporate Event',
  type_graduation: 'Graduation',
  type_family: 'Family Session',
  type_other: 'Other',

  /* ── Session detail ── */
  detail_back: 'All Sessions',
  detail_copy: 'Copy Link',
  detail_copied: 'Copied!',
  detail_qr_title: 'QR Code',
  detail_qr_subtitle: 'Guests scan this to view the gallery',
  detail_gallery_url: 'Gallery URL',
  detail_download_qr: 'Download QR',
  detail_photos_title: 'Photos',
  detail_photos_count: 'uploaded',
  detail_upload: 'Upload',
  detail_no_photos: 'No photos yet',
  detail_no_photos_hint: 'Upload photos to share with guests',

  /* ── Upload ── */
  upload_title: 'Upload Photos',
  upload_subtitle: 'JPG, PNG, WebP — max 25MB each',
  upload_drop: 'Drop photos here',
  upload_browse: 'browse files',
  upload_or: 'or',
  upload_add_more: 'Add More',
  upload_btn: 'Upload {n} Photo(s)',
  upload_uploading: 'Uploading...',
  upload_done: 'Done',
  upload_pending: 'Pending',

  /* ── Public gallery ── */
  gallery_loading: 'Loading gallery...',
  gallery_not_found: 'Session not found',
  gallery_not_found_desc: 'This gallery link may have expired or been removed.',
  gallery_live: 'Live — updating in real time',
  gallery_empty: 'Photos coming soon',
  gallery_empty_desc: 'The photographer is getting everything ready.',
  gallery_powered: 'Powered by',

  /* ── Instagram gate ── */
  gate_title: 'One quick step',
  gate_desc: 'Follow AlphaFilms on Instagram to unlock this photo gallery. It takes 5 seconds and helps support the photographer!',
  gate_follow_btn: 'Follow @{handle}',
  gate_confirm_btn: 'I followed — open the gallery',
  gate_hint: 'After following, a confirmation button will appear here',
};

export const TRANSLATIONS: Record<Lang, Translations> = { sq, en };
